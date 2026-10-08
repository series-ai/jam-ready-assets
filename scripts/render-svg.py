"""Render dimensionless SVG with measured geometry and embedded raster resources only."""
import base64
import io
import math
import sys
from pathlib import Path
from urllib.parse import unquote_to_bytes
from PIL import Image
class Unsupported(ValueError):
    pass


def embedded_raster_fetcher(url, resource_type):
    """CairoSVG fetch hook: embedded raster images only, with no I/O fallback."""
    if not isinstance(url, str) or not url.startswith('data:'):
        raise ValueError('SVG remote and file resources are disabled')
    header, separator, payload = url[5:].partition(',')
    if not separator:
        raise ValueError('Malformed SVG embedded image URI')
    parts = header.lower().split(';')
    expected = {'image/png': 'PNG', 'image/jpeg': 'JPEG', 'image/gif': 'GIF', 'image/webp': 'WEBP'}.get(parts[0])
    if expected is None or any(p != 'base64' for p in parts[1:]):
        raise ValueError('SVG embedded resource must be a supported raster image')
    if len(payload) > 32 * 1024 * 1024:
        raise ValueError('SVG embedded image exceeds 32 MiB URI limit')
    raw = unquote_to_bytes(payload)
    if 'base64' in parts[1:]:
        raw = base64.b64decode(b''.join(raw.split()), validate=True)
    with Image.open(io.BytesIO(raw)) as im:
        if im.format != expected:
            raise ValueError('SVG embedded image MIME/content mismatch')
        im.verify()
    return raw


def svg_with_inferred_viewport(data):
    """Supply missing root bounds, preserving existing SVG dimensions byte-for-byte.

    svgelements computes transformed geometry; a conservative stroke/miter
    envelope is rendered by CairoSVG, then alpha bounds set the final viewport.
    The 1px final border preserves antialiasing. Complex dimensionless SVGs are
    refused rather than assigned an arbitrary viewport.
    """
    from defusedxml import ElementTree as SafeET
    from xml.etree import ElementTree as ET
    root = SafeET.fromstring(data)
    if root.get('viewBox') or (root.get('width') and root.get('height')):
        return data
    if root.get('width') or root.get('height'):
        raise Unsupported('Partially specified SVG viewport requires explicit resolution')
    allowed = {'svg', 'g', 'path', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon',
               'defs', 'linearGradient', 'radialGradient', 'stop', 'title', 'desc'}
    for element in root.iter():
        tag = element.tag.split('}')[-1]
        if tag not in allowed:
            raise Unsupported(f'Dimensionless SVG has unsupported bounds element: {tag}')
        for key, value in element.attrib.items():
            short = key.split('}')[-1]
            if short.startswith('on') or short in ('style', 'filter', 'mask', 'clip-path', 'marker-start', 'marker-mid', 'marker-end'):
                raise Unsupported(f'Dimensionless SVG has unsupported bounds attribute: {short}')
            if '%' in value and tag not in ('linearGradient', 'radialGradient', 'stop'):
                raise Unsupported('Dimensionless SVG uses viewport-relative geometry')
            if short == 'href' and not value.startswith('#'):
                raise Unsupported('Dimensionless SVG has an external reference')
    from svgelements import SVG, Shape
    document = SVG.parse(io.BytesIO(data), reify=False)
    boxes = []
    for element in document.elements():
        if not isinstance(element, Shape):
            continue
        box = element.bbox(transformed=True, with_stroke=False)
        if box is None:
            continue
        x0, y0, x1, y1 = box
        if element.stroke is not None and element.stroke.value is not None:
            # A miter never extends further than half-width times miter limit.
            # Matrix row norms conservatively cover nonuniform scale and skew.
            miter = max(2.0, float(element.values.get('stroke-miterlimit', 4)))
            radius = abs(float(element.stroke_width)) * miter / 2
            transform = element.transform
            dx = radius * (abs(transform.a) + abs(transform.c))
            dy = radius * (abs(transform.b) + abs(transform.d))
            x0 -= dx; x1 += dx; y0 -= dy; y1 += dy
        boxes.append((x0, y0, x1, y1))
    if not boxes:
        raise Unsupported('Dimensionless SVG has no measurable drawing')
    left = math.floor(min(b[0] for b in boxes)) - 2
    top = math.floor(min(b[1] for b in boxes)) - 2
    right = math.ceil(max(b[2] for b in boxes)) + 2
    bottom = math.ceil(max(b[3] for b in boxes)) + 2
    width, height = right - left, bottom - top
    if width <= 0 or height <= 0 or width * height > 100_000_000:
        raise Unsupported('Inferred SVG viewport exceeds rendering bounds')

    def set_viewport(x, y, w, h):
        root.set('viewBox', f'{x} {y} {w} {h}')
        root.set('width', str(w))
        root.set('height', str(h))
        return ET.tostring(root, encoding='utf-8')

    from cairosvg.parser import Tree
    from cairosvg.surface import PNGSurface
    probe = set_viewport(left, top, width, height)
    tree = Tree(bytestring=probe, url_fetcher=embedded_raster_fetcher)
    png = io.BytesIO()
    surface = PNGSurface(tree, png, 96)
    surface.finish()
    with Image.open(io.BytesIO(png.getvalue())) as image:
        bbox = image.convert('RGBA').getchannel('A').getbbox()
    if bbox is None:
        return probe
    x0, y0, x1, y1 = bbox
    if x0 == 0 or y0 == 0 or x1 == width or y1 == height:
        raise ValueError('SVG alpha touches inferred viewport edge; refusing possible clipping')
    return set_viewport(left + x0 - 1, top + y0 - 1, x1 - x0 + 2, y1 - y0 + 2)


if __name__ == '__main__':
    from cairosvg.parser import Tree
    from cairosvg.surface import PNGSurface
    data = Path(sys.argv[1]).read_bytes()
    data = svg_with_inferred_viewport(data)
    tree = Tree(bytestring=data, url_fetcher=embedded_raster_fetcher)
    with open(sys.argv[2], 'wb') as output:
        surface = PNGSurface(tree, output, 96)
        surface.finish()
