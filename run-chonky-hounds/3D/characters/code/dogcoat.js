// Coat colorways, markings, face colors and cloth tints for the chunky-toy dogs (three.js).
//
// A colorway is a palette, not a texture. Each breed ships its original texture (in the
// rigged GLB) plus 1-3 small mask textures (rigged/coats/<breed>-<n>.png, or .ktx2 in the
// mobile build); coats.json lists each breed's mask channels, layers and colorway palettes.
// The shader mixes the palette through the masks and takes the shading and fur detail from
// the original texture, so any color you like is free at runtime:
//
//   const coats = await loadCoats('coats.json', 'rigged/coats/');
//   const coat = await coats.apply(dogScene, 'border-collie');            // { lite: true } on mobile
//   coat.set(coats.palette('border-collie', 'blue-merle'));   // a listed colorway
//   coat.set({ ...pal, src: ['#c47f3f', '#eeedea'] });       // or your own colors
//   coat.set({ ...pal, marks: { sock_fl: ['#eeedea', 0.2] } });  // markings (genes)
//   coat.setFace({ eyes: '#3f78c4', nose: '#58301f' });      // eyes, nose, mouth, tongue
//   coat.set(null);                                          // the original texture
//
// The math matches recolor() / mark_value() in colorways.py exactly (which bakes the same
// thing to plain textures for engines without custom shaders).
//
// lite: cheap materials for phones: Lambert (diffuse only) for the coat and Phong for the
// face parts (so the eyes keep a glint) instead of physically based shading.
import * as THREE from 'three';

const black = new THREE.DataTexture(new Uint8Array([0, 0, 0, 0]), 1, 1);
black.needsUpdate = true;

// coats: the URL of coats.json, or the coat index itself (COATS from dogdata.js)
export async function loadCoats(coats, maskBase, { ktx2Loader } = {}) {
  const index = typeof coats === 'string' ? await (await fetch(coats)).json() : coats;
  const pngLoader = new THREE.TextureLoader();
  const cache = {};
  const load = f => (ktx2Loader && f.ktx2 ? ktx2Loader.loadAsync(maskBase + f.ktx2) : pngLoader.loadAsync(maskBase + f.file))
    .then(t => { t.flipY = false; t.colorSpace = THREE.NoColorSpace; return t; });
  const ready = {};
  const masks = breed => (cache[breed] ||= Promise.all((index[breed]?.masks || []).map(load)).then(t => (ready[breed] = t)));
  return {
    index,
    palette: (breed, slug) => index[breed]?.colorways.find(c => c.slug === slug) || null,
    async apply(root, breed, opts = {}) {
      if (opts.lite) makeLite(root);
      return coatController(root, await masks(breed), index[breed] || {}, breed);
    },
    // preload(breeds) once, then applyNow(): no await, so the coat is on from the very
    // first frame (recorded cutscenes, spawning mid-game)
    preload: breeds => Promise.all(breeds.map(masks)),
    applyNow(root, breed, opts = {}) {
      if (!ready[breed]) throw new Error(`coats.preload(['${breed}']) first`);
      if (opts.lite) makeLite(root);
      return coatController(root, ready[breed], index[breed] || {}, breed);
    },
    marks: MARKS,
  };
}

const lin = hex => new THREE.Color(hex);   // three converts sRGB hex to linear working space

const MARKS = ['sock_fl', 'sock_fr', 'sock_hl', 'sock_hr', 'muzzle', 'blaze', 'bib', 'eye_l', 'eye_r', 'mask',
  'tail_tip', 'brows'];
const CHANNELS = ['coat', 'nose', 'src1', 'src2', 'src3', ...Array.from({ length: 10 }, (_, i) => 'layer' + i)];
const FACE_PARTS = ['eye_l', 'nose', 'mouth', 'tongue', 'eye_r'];   // _PART 1..5 on the face material

function boneGroup(name) {   // GLTFLoader strips the dots: 'upperarm.L' arrives as 'upperarmL'
  const leg = name.match(/^(upperarm|forearm|hand|thigh|shin|foot)[._]?([LR])$/);
  if (leg) return (['upperarm', 'forearm', 'hand'].includes(leg[1]) ? 1 : 3) + (leg[2] === 'R' ? 1 : 0);
  if (/^(head|jaw|mouth|neck)$/.test(name)) return 5;
  if (/^tail/.test(name)) return 6;
  return 0;
}

// Cheap materials (phones): diffuse coat, a little shine on the face parts, flat cloth.
export function makeLite(root) {
  root.traverse(o => {
    if (!o.isMesh || o.userData.lite) return;
    const m = o.material;
    const base = { name: m.name, map: m.map, color: m.color, vertexColors: m.vertexColors, side: m.side,
      transparent: m.transparent, opacity: m.opacity };
    o.material = m.name === 'face' || m.name === 'tag'
      ? new THREE.MeshPhongMaterial({ ...base, shininess: 60, specular: new THREE.Color(0x404040) })
      : new THREE.MeshLambertMaterial(base);
    o.userData.lite = true;
  });
}

function coatController(root, masks, info, breed) {
  const geo = info.geo;
  const v3 = a => new THREE.Vector3(...(a || [0, 0, 0]));
  const ref = info.ref_l || [50];
  const u = {
    coatMark: { value: MARKS.map(() => new THREE.Vector4(1, 1, 1, 0)) },
    coatGroup: { value: new Array(32).fill(0) },
    coatEye: { value: v3(geo?.eye) }, coatEyeR: { value: geo?.eye_r || 0.03 }, coatNoseP: { value: v3(geo?.nose) },
    coatHead: { value: v3(geo?.head) }, coatChest: { value: v3(geo?.chest) }, coatSpineY: { value: geo?.spine_y || 0.4 },
    coatTail: { value: v3(geo?.tail_tip) },
    coatOn: { value: 0 },
    coatMask: { value: [0, 1, 2, 3].map(i => masks[i] || black) },
    coatSrc: { value: [0, 1, 2, 3].map(() => new THREE.Color()) },
    coatRefL: { value: [0, 1, 2, 3].map(i => ref[i] ?? ref[0]) },
    coatLayer: { value: Array.from({ length: 10 }, () => new THREE.Vector4(0, 0, 0, 0)) },
    coatNose: { value: lin('#1a1919') },   // the nose bead's default (rig.py)
    faceSet: { value: [0, 1, 2, 3, 4, 5].map(() => new THREE.Vector4(0, 0, 0, 0)) },   // per part: rgb + on (w 0 = default)
    // where each channel lives in this breed's masks: texture*8 + component*2 + (1 if a distance
    // field), -1 if the breed doesn't have it. One shader program serves every breed.
    coatCh: { value: CHANNELS.map(n => { const c = (info.channels || {})[n]; return c ? c[0] * 8 + c[1] * 2 + (c[2] === 'sdf' ? 1 : 0) : -1; }) },
    coatTexCount: { value: masks.length },
    coatAnyMark: { value: 0 },
  };
    root.traverse(o => {
    if (!o.isMesh || o.userData.wear) return;   // collars and bandanas keep their own materials
    if (o.material.map) {
      if (o.isSkinnedMesh) o.skeleton.bones.forEach((b, i) => { if (i < 32) u.coatGroup.value[i] = boneGroup(b.name); });
      o.material = o.material.clone();
      o.material.precision = 'highp';   // marks use positions and hashed noise: keep full precision on phones
      // rest positions in the dog's own space: a quantized mesh stores them scaled and offset
      // (folded into its bind matrices), so map its bounding box back onto the real one
      const m4 = new THREE.Matrix4();
      if (geo?.bbox) {
        o.geometry.computeBoundingBox();
        const q = o.geometry.boundingBox, [lo, hi] = geo.bbox;
        const s = [0, 1, 2].map(k => (hi[k] - lo[k]) / Math.max(q.max.getComponent(k) - q.min.getComponent(k), 1e-9));
        m4.set(s[0], 0, 0, lo[0] - q.min.x * s[0], 0, s[1], 0, lo[1] - q.min.y * s[1], 0, 0, s[2], lo[2] - q.min.z * s[2], 0, 0, 0, 1);
      }
      u.coatRestMat = { value: m4 };
      o.material.onBeforeCompile = sh => { Object.assign(sh.uniforms, u); patchCoat(sh); };
      o.material.customProgramCacheKey = () => 'dogcoat' + (o.userData.lite ? ':lite' : '');   // one program for all breeds
    } else if (o.material.name === 'face') {
      o.material = o.material.clone();
      o.material.onBeforeCompile = sh => { Object.assign(sh.uniforms, u); patchFace(sh); };
      o.material.customProgramCacheKey = () => 'dogface' + (o.userData.lite ? ':lite' : '');
    }
  });
  const ctl = {
    uniforms: u,
    set(pal) {
      u.coatOn.value = pal ? 1 : 0;
      if (!pal) { ctl.setFace({ nose: null }); return; }
      u.coatSrc.value.forEach((c, i) => c.copy(lin(pal.src[i] ?? pal.src[0])));
      u.coatLayer.value.forEach((v, i) => {
        const [hex, a] = pal.layers?.[i] || ['#000000', 0];
        const c = lin(hex);
        v.set(c.r, c.g, c.b, a);
      });
      u.coatMark.value.forEach((v, i) => {
        const m = pal.marks?.[MARKS[i]];
        const c = lin(m ? m[0] : '#ffffff');
        v.set(c.r, c.g, c.b, m ? m[1] : 0);
      });
      u.coatAnyMark.value = u.coatMark.value.some(v => v.w > 0) ? 1 : 0;   // plain dogs skip the marks entirely
      ctl.setFace({ nose: pal.nose, ...(pal.face || {}) });
    },
    // Face part colors: { eyes, eye_l, eye_r, nose, mouth, tongue } (hex; eyes sets both,
    // eye_l / eye_r are the dog's own left / right); null restores a part's default.
    setFace(parts) {
      if ('eyes' in parts) parts = { eye_l: parts.eyes, eye_r: parts.eyes, ...parts };
      FACE_PARTS.forEach((p, i) => {
        if (!(p in parts)) return;
        const v = u.faceSet.value[i + 1];
        if (p === 'nose') u.coatNose.value.copy(lin(parts[p] ?? '#1a1919'));   // the footprint follows the bead
        if (parts[p] == null) { v.w = 0; return; }
        const c = lin(parts[p]);
        v.set(c.r, c.g, c.b, 1);
      });
    },
  };
  return ctl;
}

function patchCoat(sh) {
  sh.vertexShader = sh.vertexShader
    .replace('#include <common>', `#include <common>
uniform float coatGroup[32];
uniform mat4 coatRestMat;
varying vec3 vRest;
varying vec4 vLeg;
varying vec2 vHT;`)
    .replace('#include <begin_vertex>', `#include <begin_vertex>
vRest = (coatRestMat * vec4(position, 1.0)).xyz;   // undo mesh quantization (KHR_mesh_quantization node scale)
vLeg = vec4(0.0); vHT = vec2(0.0);
#ifdef USE_SKINNING
for (int i = 0; i < 4; i++) {
  float g = coatGroup[int(skinIndex[i])], w = skinWeight[i];
  if (g == 1.0) vLeg.x += w; else if (g == 2.0) vLeg.y += w; else if (g == 3.0) vLeg.z += w;
  else if (g == 4.0) vLeg.w += w; else if (g == 5.0) vHT.x += w; else if (g == 6.0) vHT.y += w;
}
#endif`);
  sh.fragmentShader = sh.fragmentShader
    .replace('#include <map_pars_fragment>', `#include <map_pars_fragment>
uniform float coatOn;
uniform sampler2D coatMask[4];
uniform vec3 coatSrc[4];
uniform float coatRefL[4];
uniform vec4 coatLayer[10];
uniform vec3 coatNose;
uniform vec4 coatMark[12];
uniform vec3 coatEye, coatNoseP, coatHead, coatChest, coatTail;
uniform float coatEyeR, coatSpineY;
uniform float coatCh[15];
uniform int coatTexCount;
uniform float coatAnyMark;
varying vec3 vRest;
varying vec4 vLeg;
varying vec2 vHT;
float coatSdf(float v) { float e = max(fwidth(v) * 0.75, 1e-3); return smoothstep(0.5 - e, 0.5 + e, v); }
float coatChan(int k, vec4 m0, vec4 m1, vec4 m2, vec4 m3) {   // channel k from this breed's masks
  float code = coatCh[k];
  if (code < 0.0) return 0.0;
  int t = int(code / 8.0), c = int(mod(code, 8.0) / 2.0);
  vec4 m = t == 0 ? m0 : t == 1 ? m1 : t == 2 ? m2 : m3;
  float v = c == 0 ? m.r : c == 1 ? m.g : c == 2 ? m.b : m.a;
  return mod(code, 2.0) > 0.5 ? coatSdf(v) : v;
}
float coatL(vec3 c) { return 116.0 * pow(max(dot(c, vec3(0.2126, 0.7152, 0.0722)), 1e-5), 1.0 / 3.0) - 16.0; }
float coatHash(vec3 p) { p = fract(p * 0.3183099 + 0.1) * 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float coatNoise(vec3 x) {   // value noise, as vnoise() in colorways.py
  vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(coatHash(i), coatHash(i + vec3(1, 0, 0)), f.x), mix(coatHash(i + vec3(0, 1, 0)), coatHash(i + vec3(1, 1, 0)), f.x), f.y),
             mix(mix(coatHash(i + vec3(0, 0, 1)), coatHash(i + vec3(1, 0, 1)), f.x), mix(coatHash(i + vec3(0, 1, 1)), coatHash(i + vec3(1, 1, 1)), f.x), f.y), f.z);
}
float markValue(int k, float a, float n) {   // mirrors mark_value() in colorways.py; n: edge noise
  vec3 P = vRest;
  float er = coatEyeR;
  float hw = smoothstep(0.4, 0.6, vHT.x);
  float fwd = (P.z - coatHead.z) / max(coatNoseP.z - coatHead.z, 1e-3);
  if (k < 4) {
    float cut = a * coatSpineY;
    return smoothstep(0.35, 0.65, vLeg[k]) * (1.0 - smoothstep(cut - 0.004, cut + 0.004, P.y + 0.012 * n));
  }
  if (k == 4) {
    float r = a * 0.16, dd = length(P - (coatNoseP - vec3(0.0, 0.5 * er, 0.3 * er))) + 0.012 * n;
    return hw * (1.0 - smoothstep(r - 0.004, r + 0.004, dd)) * (1.0 - smoothstep(coatEye.y - 0.8 * er, coatEye.y - 0.3 * er, P.y));
  }
  if (k == 5) {
    float w = a * 0.08;
    return hw * smoothstep(0.05, 0.15, fwd) * (1.0 - smoothstep(w - 0.004, w + 0.004, abs(P.x) - 0.02 * n)) * smoothstep(coatNoseP.y - er, coatNoseP.y, P.y);
  }
  if (k == 6) {
    float body = clamp(1.0 - (vLeg.x + vLeg.y + vLeg.z + vLeg.w) - vHT.y - vHT.x, 0.0, 1.0) + vHT.x * (1.0 - smoothstep(0.3, 0.7, fwd));
    float cy = coatSpineY - 0.06;
    float dd = sqrt(pow(P.x / (a * 0.12 + 1e-4), 2.0) + pow((P.y - cy) / (a * 0.2 + 1e-4), 2.0)) + 0.15 * n;
    return smoothstep(0.4, 0.6, clamp(body, 0.0, 1.0)) * smoothstep(coatChest.z - 0.06, coatChest.z, P.z) * (1.0 - smoothstep(0.95, 1.05, dd));
  }
  if (k == 7 || k == 8) {
    vec3 e = coatEye * (k == 7 ? vec3(1.0) : vec3(-1.0, 1.0, 1.0));
    float r = a * 3.0 * er, dd = length(P - e) + 0.012 * n;
    return hw * (1.0 - smoothstep(r - 0.003, r + 0.003, dd));
  }
  if (k == 9) { float t = 1.0 - 0.75 * a; return hw * smoothstep(t - 0.03, t + 0.03, fwd); }
  if (k == 10) {
    float r = a * 0.12;
    return smoothstep(0.5, 0.8, vHT.y) * (1.0 - smoothstep(r - 0.005, r + 0.005, length(P - coatTail)));
  }
  vec3 c = coatEye + vec3(0.0, 1.6 * er, -0.5 * er);
  float dd = min(length(P - c), length(P - c * vec3(-1.0, 1.0, 1.0))), r = a * 1.05 * er;
  return hw * (1.0 - smoothstep(r - 0.003, r + 0.003, dd));
}`)
    .replace('#include <map_fragment>', `
#ifdef USE_MAP
  vec4 sampledDiffuseColor = texture2D(map, vMapUv);
  vec3 coatC = sampledDiffuseColor.rgb;
  if (coatOn > 0.5) {
    vec4 cm0 = texture2D(coatMask[0], vMapUv), cm1 = vec4(0.0), cm2 = vec4(0.0), cm3 = vec4(0.0);
    if (coatTexCount > 1) cm1 = texture2D(coatMask[1], vMapUv);
    if (coatTexCount > 2) cm2 = texture2D(coatMask[2], vMapUv);
    if (coatTexCount > 3) cm3 = texture2D(coatMask[3], vMapUv);
    float chCoat = coatChan(0, cm0, cm1, cm2, cm3);
    float chSrc1 = coatChan(2, cm0, cm1, cm2, cm3), chSrc2 = coatChan(3, cm0, cm1, cm2, cm3), chSrc3 = coatChan(4, cm0, cm1, cm2, cm3);
    vec3 c = coatSrc[0] + chSrc1 * (coatSrc[1] - coatSrc[0]) + chSrc2 * (coatSrc[2] - coatSrc[0]) + chSrc3 * (coatSrc[3] - coatSrc[0]);
    for (int i = 0; i < 10; i++) if (coatLayer[i].a > 0.0) c = mix(c, coatLayer[i].rgb, coatChan(5 + i, cm0, cm1, cm2, cm3) * coatLayer[i].a);
    if (coatAnyMark > 0.5) {
      float coatN = coatNoise(vRest * 14.0) - 0.5;   // once per pixel, shared by every mark
      for (int k = 0; k < 12; k++) if (coatMark[k].w > 0.0) c = mix(c, coatMark[k].rgb, markValue(k, coatMark[k].w, coatN));
    }

    // shading and fur detail: the original's lightness against its source color's
    float lref = coatRefL[0] + chSrc1 * (coatRefL[1] - coatRefL[0]) + chSrc2 * (coatRefL[2] - coatRefL[0]) + chSrc3 * (coatRefL[3] - coatRefL[0]);
    float shade = clamp(coatL(sampledDiffuseColor.rgb) - lref, -25.0, 25.0);
    float Y = max(dot(c, vec3(0.2126, 0.7152, 0.0722)), 1e-5);
    float L = 116.0 * pow(Y, 1.0 / 3.0) - 16.0;
    float k = 0.85 - 0.45 * smoothstep(25.0, 45.0, abs(L - 50.0));
    float L2 = clamp(L + shade * k, 0.0, 100.0);
    c *= pow((L2 + 16.0) / 116.0, 3.0) / Y;
    coatC = mix(sampledDiffuseColor.rgb, c, chCoat);
  }
  if (coatCh[1] >= 0.0) { // nose footprint under the nose bead, always in the bead's color
    vec4 n0 = texture2D(coatMask[0], vMapUv), n1 = coatTexCount > 1 ? texture2D(coatMask[1], vMapUv) : vec4(0.0);
    vec4 n2 = coatTexCount > 2 ? texture2D(coatMask[2], vMapUv) : vec4(0.0);
    coatC = mix(coatC, coatNose, coatChan(1, n0, n1, n2, vec4(0.0)));
  }
  diffuseColor *= vec4(coatC, sampledDiffuseColor.a);
#endif`);
}

// Face parts: one material; _PART picks the part, faceSet overrides its color.
function patchFace(sh) {
  sh.vertexShader = sh.vertexShader
    .replace('#include <common>', `#include <common>
attribute float _part;
varying float vPart;`)
    .replace('#include <begin_vertex>', `#include <begin_vertex>
vPart = _part;`);
  sh.fragmentShader = sh.fragmentShader
    .replace('#include <common>', `#include <common>
uniform vec4 faceSet[6];
varying float vPart;`)
    .replace('#include <color_fragment>', `#include <color_fragment>
  int fp = int(vPart + 0.5);
  if (fp > 0 && fp < 6 && faceSet[fp].w > 0.5) diffuseColor.rgb = faceSet[fp].rgb;`)
    .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
  roughnessFactor = fp == 1 || fp == 5 ? 0.2 : fp == 2 ? 0.38 : 0.7;   // glossy eyes, satin nose, matte mouth`);
}

// ---------------------------------------------------------------- breeding
// A puppy's coat from two parents' palettes (same breed: they share the masks). Each coat
// colour is a blend somewhere between the parents' (leaning to one), each marking layer and
// each mark (socks, blaze...) comes from one parent or the other, the nose from one, and now
// and then the eyes come out odd. rnd: a () => 0..1 random, so a litter can be seeded.
//   const pup = breed(coats.palette('border-collie', 'blue-merle'), coats.palette('border-collie', 'caramel'));
export function breed(a, b, rnd = Math.random, { oddEyes = 0.15 } = {}) {
  const mix = (h1, h2, t) => '#' + new THREE.Color(h1).lerp(new THREE.Color(h2), t).getHexString();
  const pick = (x, y) => (rnd() < 0.5 ? x : y);
  const n = Math.max(a.src.length, b.src.length);
  const src = Array.from({ length: n }, (_, i) => {
    const t = rnd() < 0.5 ? 0.15 + 0.25 * rnd() : 0.6 + 0.25 * rnd();   // leans to one parent
    return mix(a.src[i] ?? a.src[0], b.src[i] ?? b.src[0], t);
  });
  const layers = Array.from({ length: Math.max(a.layers?.length || 0, b.layers?.length || 0) },
    (_, i) => [...pick(a.layers?.[i] || ['#000000', 0], b.layers?.[i] || ['#000000', 0])]);
  const marks = {};
  for (const k of new Set([...Object.keys(a.marks || {}), ...Object.keys(b.marks || {})])) {
    const m = pick(a.marks?.[k], b.marks?.[k]);
    if (m) marks[k] = [m[0], m[1] * (0.8 + 0.4 * rnd())];
  }
  const face = rnd() < oddEyes ? { eye_l: '#3f78c4', eye_r: '#6b3a1e' } : {};
  return { slug: 'puppy', name: 'Puppy', src, layers, marks, nose: pick(a.nose, b.nose), face };
}

// ---------------------------------------------------------------- cloth
// Cloth: one shared pattern texture (rigged/wear/cloth.png: R dots, G gingham, B stripes)
// mixed between two colors. tintCloth(bandanaMesh.material, clothTex, '#24345e', '#f4efe6', 'dots')
const PATTERN = { dots: [1, 0, 0, 0], gingham: [0, 1, 0, 0], stripes: [0, 0, 1, 0], plain: [0, 0, 0, 0] };
// url: cloth.png, or cloth.ktx2 with { ktx2Loader } (as loadCoats)
export function loadClothPatterns(url, { ktx2Loader } = {}) {
  const loader = ktx2Loader && url.endsWith('.ktx2') ? ktx2Loader : new THREE.TextureLoader();
  return loader.loadAsync(url).then(t => {
    t.flipY = false; t.colorSpace = THREE.NoColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  });
}
export function tintCloth(material, patterns, colorA, colorB, pattern = 'dots') {
  const u = material.userData.cloth ||= {
    clothA: { value: new THREE.Color() }, clothB: { value: new THREE.Color() },
    clothSel: { value: new THREE.Vector4() }, clothTex: { value: patterns },
  };
  u.clothA.value.set(colorA); u.clothB.value.set(colorB);
  u.clothSel.value.fromArray(PATTERN[pattern] || PATTERN.plain);
  if (!material.userData.clothPatched) {
    material.userData.clothPatched = true;
    material.onBeforeCompile = sh => {
      Object.assign(sh.uniforms, u);
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <map_pars_fragment>', `#include <map_pars_fragment>
uniform vec3 clothA, clothB; uniform vec4 clothSel; uniform sampler2D clothTex;`)
        .replace('#include <map_fragment>', `
#ifdef USE_MAP
  float clothP = dot(texture2D(clothTex, vMapUv), clothSel);
  diffuseColor.rgb *= mix(clothA, clothB, clothP);
#endif`);
    };
    material.customProgramCacheKey = () => 'dogcloth';
    material.needsUpdate = true;
  }
}
