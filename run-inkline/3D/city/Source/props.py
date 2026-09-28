"""
Inkline Props and Industrial District Kit Generator
Generates original low-poly Flash-style 3D stick-game props and industrial kit.
Compatible with Blender 5.1 and Three.js 0.170.
"""

import sys
import os
import math
import json
import struct
import argparse
import bpy
import bmesh
from mathutils import Vector, Matrix

# Material indices:
# 0: InkMat_OffWhite (#eeeae1) - light paper faces and walkable tops
# 1: InkMat_Charcoal (#181a1b) - figures, weapons, and small accents
# 2: InkMat_SafetyOrange (#d45538) - deliberate high-visibility safety accents
# 3: InkMat_StructuralGray (#7b8279) - environment frames, rails, and trim
MAT_CHARCOAL = 1
MAT_STRUCTURAL_GRAY = 3
ENVIRONMENT_CATEGORIES = frozenset({"city", "parkour", "industrial", "sci-fi"})

class TrackFaces:
    def __init__(self, bm, mat_idx):
        self.bm = bm
        self.mat_idx = mat_idx
    def __enter__(self):
        self.before = set(self.bm.faces)
        return self
    def __exit__(self, exc_type, exc_val, exc_tb):
        for f in self.bm.faces:
            if f not in self.before:
                f.material_index = self.mat_idx

def add_box(bm, center=(0, 0, 0), size=(1, 1, 1), rot=(0, 0, 0), mat_idx=0):
    c = Vector(center)
    s = Vector(size)
    rot_mat = Matrix.Rotation(rot[0], 4, 'X') @ Matrix.Rotation(rot[1], 4, 'Y') @ Matrix.Rotation(rot[2], 4, 'Z')
    mat = Matrix.Translation(c) @ rot_mat @ Matrix.Diagonal((s[0], s[1], s[2], 1.0))
    with TrackFaces(bm, mat_idx):
        bmesh.ops.create_cube(bm, size=1.0, matrix=mat)

def add_cylinder(bm, p1, p2, radius=0.05, segments=10, mat_idx=0):
    v1 = Vector(p1)
    v2 = Vector(p2)
    diff = v2 - v1
    length = diff.length
    if length < 1e-5:
        return
    center = (v1 + v2) * 0.5
    up = Vector((0, 0, 1))
    direction = diff.normalized()
    rot = up.rotation_difference(direction).to_matrix().to_4x4()
    mat = Matrix.Translation(center) @ rot
    with TrackFaces(bm, mat_idx):
        bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=segments, radius1=radius, radius2=radius, depth=length, matrix=mat)

def add_cone(bm, p1, p2, r1=0.2, r2=0.0, segments=10, mat_idx=0):
    v1 = Vector(p1)
    v2 = Vector(p2)
    diff = v2 - v1
    length = diff.length
    if length < 1e-5:
        return
    center = (v1 + v2) * 0.5
    up = Vector((0, 0, 1))
    direction = diff.normalized()
    rot = up.rotation_difference(direction).to_matrix().to_4x4()
    mat = Matrix.Translation(center) @ rot
    with TrackFaces(bm, mat_idx):
        bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=segments, radius1=r1, radius2=r2, depth=length, matrix=mat)

def add_sphere(bm, center=(0, 0, 0), radius=0.5, segments=10, ring_count=6, mat_idx=0):
    mat = Matrix.Translation(Vector(center))
    with TrackFaces(bm, mat_idx):
        bmesh.ops.create_uvsphere(bm, u_segments=segments, v_segments=ring_count, radius=radius, matrix=mat)

def add_torus(bm, center=(0, 0, 0), major_r=0.5, minor_r=0.1, major_seg=12, minor_seg=6, axis='Z', mat_idx=0):
    c = Vector(center)
    verts = []
    for i in range(major_seg):
        u = 2 * math.pi * i / major_seg
        cos_u = math.cos(u)
        sin_u = math.sin(u)
        ring_center = Vector((major_r * cos_u, major_r * sin_u, 0))
        radial_dir = Vector((cos_u, sin_u, 0))
        z_dir = Vector((0, 0, 1))
        ring_verts = []
        for j in range(minor_seg):
            v = 2 * math.pi * j / minor_seg
            p = ring_center + radial_dir * (minor_r * math.cos(v)) + z_dir * (minor_r * math.sin(v))
            if axis == 'X':
                p = Vector((p.z, p.y, -p.x))
            elif axis == 'Y':
                p = Vector((p.x, p.z, -p.y))
            ring_verts.append(bm.verts.new(c + p))
        verts.append(ring_verts)
    with TrackFaces(bm, mat_idx):
        for i in range(major_seg):
            i_next = (i + 1) % major_seg
            for j in range(minor_seg):
                j_next = (j + 1) % minor_seg
                bm.faces.new((verts[i][j], verts[i_next][j], verts[i_next][j_next], verts[i][j_next]))

def add_wedge(bm, min_pt, max_pt, slope_dir='+X', mat_idx=0):
    x0, y0, z0 = min_pt
    x1, y1, z1 = max_pt
    # A falling slope has a level base and a high face at its start.
    if z1 < z0:
        z0, z1 = z1, z0
        slope_dir = '-X' if slope_dir == '+X' else '-Y'
    if slope_dir in ('-X', '-Y'):
        high_x = slope_dir == '-X'
        verts = [bm.verts.new(p) for p in [
            (x0, y0, z0), (x1, y0, z0), (x1, y1, z0), (x0, y1, z0),
            (x0, y0, z1), (x0, y1, z1) if high_x else (x1, y0, z1),
        ]]
        faces = [(0, 3, 2, 1), (0, 4, 5, 3), (0, 1, 4), (3, 5, 2), (4, 1, 2, 5)] if high_x else [(0, 3, 2, 1), (0, 1, 5, 4), (0, 4, 3), (1, 2, 5), (4, 5, 2, 3)]
        with TrackFaces(bm, mat_idx):
            for face in faces:
                bm.faces.new(tuple(verts[i] for i in face))
    elif slope_dir == '+X':
        v0 = bm.verts.new((x0, y0, z0))
        v1 = bm.verts.new((x1, y0, z0))
        v2 = bm.verts.new((x1, y1, z0))
        v3 = bm.verts.new((x0, y1, z0))
        v4 = bm.verts.new((x1, y0, z1))
        v5 = bm.verts.new((x1, y1, z1))
        with TrackFaces(bm, mat_idx):
            bm.faces.new((v0, v3, v2, v1))
            bm.faces.new((v1, v2, v5, v4))
            bm.faces.new((v0, v1, v4))
            bm.faces.new((v3, v5, v2))
            bm.faces.new((v0, v4, v5, v3))
    elif slope_dir == '+Y':
        v0 = bm.verts.new((x0, y0, z0))
        v1 = bm.verts.new((x1, y0, z0))
        v2 = bm.verts.new((x1, y1, z0))
        v3 = bm.verts.new((x0, y1, z0))
        v4 = bm.verts.new((x0, y1, z1))
        v5 = bm.verts.new((x1, y1, z1))
        with TrackFaces(bm, mat_idx):
            bm.faces.new((v0, v3, v2, v1))
            bm.faces.new((v3, v2, v5, v4))
            bm.faces.new((v0, v4, v3))
            bm.faces.new((v1, v2, v5))
            bm.faces.new((v0, v1, v5, v4))

def add_i_beam(bm, p1, p2, width=0.2, depth=0.2, flange_t=0.02, web_t=0.02, mat_idx=MAT_STRUCTURAL_GRAY):
    v1 = Vector(p1)
    v2 = Vector(p2)
    diff = v2 - v1
    length = diff.length
    if length < 1e-5:
        return
    center = (v1 + v2) * 0.5
    up = Vector((0, 0, 1))
    rot = up.rotation_difference(diff.normalized()).to_matrix().to_4x4()
    # Flange 1
    f1_mat = Matrix.Translation(center + rot @ Vector((-width/2 + flange_t/2, 0, 0))) @ rot @ Matrix.Diagonal((flange_t, depth, length, 1.0))
    # Flange 2
    f2_mat = Matrix.Translation(center + rot @ Vector((width/2 - flange_t/2, 0, 0))) @ rot @ Matrix.Diagonal((flange_t, depth, length, 1.0))
    # Web
    web_mat = Matrix.Translation(center) @ rot @ Matrix.Diagonal((width - 2*flange_t, web_t, length, 1.0))
    with TrackFaces(bm, mat_idx):
        bmesh.ops.create_cube(bm, size=1.0, matrix=f1_mat)
        bmesh.ops.create_cube(bm, size=1.0, matrix=f2_mat)
        bmesh.ops.create_cube(bm, size=1.0, matrix=web_mat)

def add_grate(bm, center=(0,0,0), size_x=2.0, size_y=2.0, thickness=0.04, bars=6, mat_idx=MAT_STRUCTURAL_GRAY):
    cx, cy, cz = center
    # Perimeter frame
    fw = 0.06
    add_box(bm, (cx, cy - size_y/2 + fw/2, cz), (size_x, fw, thickness), mat_idx=mat_idx)
    add_box(bm, (cx, cy + size_y/2 - fw/2, cz), (size_x, fw, thickness), mat_idx=mat_idx)
    add_box(bm, (cx - size_x/2 + fw/2, cy, cz), (fw, size_y - 2*fw, thickness), mat_idx=mat_idx)
    add_box(bm, (cx + size_x/2 - fw/2, cy, cz), (fw, size_y - 2*fw, thickness), mat_idx=mat_idx)
    # Internal bars
    step = (size_x - 2*fw) / (bars + 1)
    for i in range(1, bars + 1):
        bx = cx - size_x/2 + fw + i * step
        add_box(bm, (bx, cy, cz), (0.02, size_y - 2*fw, thickness*0.8), mat_idx=mat_idx)

def add_railing(bm, p1, p2, height=1.0, mat_idx=MAT_STRUCTURAL_GRAY, posts=3):
    v1 = Vector(p1)
    v2 = Vector(p2)
    add_cylinder(bm, (v1.x, v1.y, v1.z + height), (v2.x, v2.y, v2.z + height), radius=0.025, segments=8, mat_idx=mat_idx)
    add_cylinder(bm, (v1.x, v1.y, v1.z + height*0.5), (v2.x, v2.y, v2.z + height*0.5), radius=0.02, segments=8, mat_idx=mat_idx)
    # Posts
    for i in range(posts):
        t = i / max(1, posts - 1)
        pt = v1.lerp(v2, t)
        add_cylinder(bm, (pt.x, pt.y, pt.z + 0.01), (pt.x, pt.y, pt.z + height), radius=0.025, segments=8, mat_idx=mat_idx)
        add_box(bm, (pt.x, pt.y, pt.z + 0.012), (0.1, 0.1, 0.02), mat_idx=mat_idx)

def parse_glb_header(glb_path):
    with open(glb_path, 'rb') as f:
        magic, version, length = struct.unpack('<4sII', f.read(12))
        assert magic == b'glTF'
        chunk_len, chunk_type = struct.unpack('<II', f.read(8))
        assert chunk_type == 0x4E4F534A
        gltf = json.loads(f.read(chunk_len).decode('utf-8'))
    accessors = gltf.get('accessors', [])
    meshes = gltf.get('meshes', [])
    total_tris = 0
    total_verts = 0
    materials_used = set()
    min_bound = [float('inf')]*3
    max_bound = [float('-inf')]*3
    for mesh in meshes:
        for prim in mesh.get('primitives', []):
            if 'material' in prim:
                materials_used.add(prim['material'])
            if 'indices' in prim:
                idx_acc = accessors[prim['indices']]
                total_tris += idx_acc['count'] // 3
            if 'POSITION' in prim['attributes']:
                pos_acc = accessors[prim['attributes']['POSITION']]
                total_verts += pos_acc['count']
                for i in range(3):
                    min_bound[i] = min(min_bound[i], pos_acc['min'][i])
                    max_bound[i] = max(max_bound[i], pos_acc['max'][i])
    dims = [round(max_bound[i] - min_bound[i], 3) for i in range(3)]
    return {
        "dimensions": dims,
        "triangles": total_tris,
        "vertices": total_verts,
        "materials": max(1, len(materials_used)),
        "min": [round(v, 3) for v in min_bound],
        "max": [round(v, 3) for v in max_bound],
        "size_bytes": os.path.getsize(glb_path)
    }

# ==============================================================================
# WEAPONS BUILDERS (26 items)
# ==============================================================================

def build_sword(bm):
    # Grip at (0,0,0)
    add_cylinder(bm, (0, 0, -0.12), (0, 0, 0.12), radius=0.018, segments=8, mat_idx=1)
    add_sphere(bm, (0, 0, -0.135), radius=0.035, segments=8, ring_count=5, mat_idx=1)
    add_box(bm, (0, 0, 0.13), (0.24, 0.04, 0.025), mat_idx=1)
    add_box(bm, (0, 0, 0.55), (0.05, 0.012, 0.8), mat_idx=0)
    add_cone(bm, (0, 0, 0.95), (0, 0, 1.1), r1=0.035, r2=0.0, segments=4, mat_idx=0)
    add_box(bm, (0, 0, 0.22), (0.015, 0.014, 0.12), mat_idx=2)

def build_katana(bm):
    # Curved katana, grip at (0,0,0)
    add_cylinder(bm, (0, -0.01, -0.15), (0, 0.0, 0.15), radius=0.017, segments=8, mat_idx=1)
    add_cylinder(bm, (0, 0.0, 0.155), (0, 0.0, 0.165), radius=0.05, segments=10, mat_idx=1)
    # Curved blade
    pts = [(0, 0.01, 0.17), (0, 0.03, 0.45), (0, 0.06, 0.75), (0, 0.1, 1.05)]
    for i in range(len(pts) - 1):
        add_box(bm, (pts[i][0], (pts[i][1]+pts[i+1][1])/2, (pts[i][2]+pts[i+1][2])/2), (0.012, 0.035, pts[i+1][2]-pts[i][2]), mat_idx=0)
    add_cone(bm, (0, 0.1, 1.05), (0, 0.12, 1.15), r1=0.025, r2=0.002, segments=4, mat_idx=0)
    add_box(bm, (0, 0.0, 0.0), (0.02, 0.022, 0.04), mat_idx=2)

def build_staff(bm):
    # Length 1.8m, center at (0,0,0)
    add_cylinder(bm, (0, 0, -0.82), (0, 0, 0.82), radius=0.018, segments=8, mat_idx=0)
    add_cylinder(bm, (0, 0, -0.15), (0, 0, 0.15), radius=0.022, segments=8, mat_idx=1)
    add_cylinder(bm, (0, 0, -0.9), (0, 0, -0.82), radius=0.024, segments=8, mat_idx=1)
    add_cylinder(bm, (0, 0, 0.82), (0, 0, 0.9), radius=0.024, segments=8, mat_idx=1)
    # Keep each orange collar outside the 18 mm shaft radius.
    add_torus(bm, (0, 0, -0.8), major_r=0.024, minor_r=0.005, mat_idx=2)
    add_torus(bm, (0, 0, 0.8), major_r=0.024, minor_r=0.005, mat_idx=2)

def build_pistol(bm):
    # Grip at (0,0,0), barrel forward -Y
    add_box(bm, (0, 0.02, -0.05), (0.03, 0.05, 0.12), rot=(0.25, 0, 0), mat_idx=1)
    add_box(bm, (0, -0.06, 0.04), (0.032, 0.18, 0.05), mat_idx=0)
    add_cylinder(bm, (0, -0.14, 0.04), (0, -0.17, 0.04), radius=0.01, segments=8, mat_idx=1)
    add_box(bm, (0, -0.03, -0.01), (0.015, 0.05, 0.04), mat_idx=1)
    # Lift the sight clear of the receiver top by 1 mm.
    add_box(bm, (0, -0.15, 0.071), (0.008, 0.015, 0.01), mat_idx=2)

def build_rifle(bm):
    # Assault rifle, grip at (0,0,0), barrel -Y
    add_box(bm, (0, 0.02, -0.06), (0.032, 0.05, 0.14), rot=(0.25, 0, 0), mat_idx=1)
    add_box(bm, (0, -0.08, 0.04), (0.04, 0.32, 0.07), mat_idx=0)
    add_box(bm, (0, 0.18, 0.02), (0.035, 0.22, 0.09), mat_idx=1)
    add_cylinder(bm, (0, -0.24, 0.04), (0, -0.48, 0.04), radius=0.012, segments=8, mat_idx=1)
    add_cylinder(bm, (0, -0.48, 0.04), (0, -0.52, 0.04), radius=0.016, segments=8, mat_idx=1)
    add_box(bm, (0, -0.05, 0.09), (0.02, 0.12, 0.03), mat_idx=1)
    add_box(bm, (0, -0.02, 0.04), (0.043, 0.03, 0.02), mat_idx=2)

def build_rifle_magazine(bm):
    add_box(bm, (0, -0.12, -0.1), (0.028, 0.06, 0.16), rot=(-0.2, 0, 0), mat_idx=1)

def build_shotgun(bm):
    # Pump shotgun, grip at (0,0,0), barrel -Y
    add_box(bm, (0, 0.04, -0.05), (0.035, 0.06, 0.13), rot=(0.3, 0, 0), mat_idx=1)
    add_box(bm, (0, 0.18, 0.0), (0.036, 0.22, 0.08), mat_idx=1)
    add_box(bm, (0, -0.06, 0.03), (0.04, 0.24, 0.06), mat_idx=0)
    add_cylinder(bm, (0, -0.18, 0.04), (0, -0.58, 0.04), radius=0.014, segments=8, mat_idx=1)
    add_cylinder(bm, (0, -0.18, 0.015), (0, -0.52, 0.015), radius=0.012, segments=8, mat_idx=1)
    add_box(bm, (0.021, -0.05, 0.03), (0.005, 0.04, 0.02), mat_idx=2)

def build_shotgun_pump(bm):
    add_cylinder(bm, (0, -0.28, 0.015), (0, -0.40, 0.015), radius=0.022, segments=8, mat_idx=MAT_CHARCOAL)

def build_bow(bm):
    # Recurve bow, grip at (0,0,0)
    add_box(bm, (0, 0.02, 0.0), (0.03, 0.04, 0.14), mat_idx=1)
    # Upper limb
    add_cylinder(bm, (0, 0.02, 0.07), (0, -0.05, 0.35), radius=0.018, segments=8, mat_idx=0)
    add_cylinder(bm, (0, -0.05, 0.35), (0, 0.04, 0.65), radius=0.012, segments=8, mat_idx=0)
    # Lower limb
    add_cylinder(bm, (0, 0.02, -0.07), (0, -0.05, -0.35), radius=0.018, segments=8, mat_idx=0)
    add_cylinder(bm, (0, -0.05, -0.35), (0, 0.04, -0.65), radius=0.012, segments=8, mat_idx=0)
    add_box(bm, (0.016, 0.02, 0.02), (0.01, 0.02, 0.01), mat_idx=2)

def build_bow_string(bm):
    # Split the string at the grip center for a named runtime child mesh.
    add_cylinder(bm, (0, 0.04, -0.65), (0, 0.04, 0.0), radius=0.003, segments=6, mat_idx=1)
    add_cylinder(bm, (0, 0.04, 0.0), (0, 0.04, 0.65), radius=0.003, segments=6, mat_idx=1)

def build_bat(bm):
    # Baseball bat, grip at (0,0,0), extends +Z
    add_sphere(bm, (0, 0, -0.08), radius=0.025, segments=8, ring_count=5, mat_idx=1)
    add_cylinder(bm, (0, 0, -0.07), (0, 0, 0.18), radius=0.016, segments=8, mat_idx=1)
    add_cone(bm, (0, 0, 0.18), (0, 0, 0.45), r1=0.016, r2=0.035, segments=8, mat_idx=0)
    add_cylinder(bm, (0, 0, 0.45), (0, 0, 0.8), radius=0.035, segments=8, mat_idx=0)
    add_sphere(bm, (0, 0, 0.8), radius=0.035, segments=8, ring_count=5, mat_idx=0)
    # Keep the accent ring 1 mm clear of the 35 mm barrel skin.
    add_torus(bm, (0, 0, 0.55), major_r=0.040, minor_r=0.004, mat_idx=2)

def build_dagger(bm):
    add_cylinder(bm, (0, 0, -0.08), (0, 0, 0.05), radius=0.014, segments=8, mat_idx=1)
    add_box(bm, (0, 0, 0.055), (0.08, 0.03, 0.015), mat_idx=1)
    add_box(bm, (0, 0, 0.18), (0.032, 0.008, 0.22), mat_idx=0)
    add_cone(bm, (0, 0, 0.29), (0, 0, 0.35), r1=0.018, r2=0.0, segments=4, mat_idx=0)
    add_sphere(bm, (0, 0, -0.09), radius=0.02, segments=6, ring_count=4, mat_idx=2)

def build_axe_battle(bm):
    add_cylinder(bm, (0, 0, -0.35), (0, 0, 0.45), radius=0.018, segments=8, mat_idx=1)
    add_box(bm, (0, 0, 0.32), (0.05, 0.05, 0.1), mat_idx=1)
    add_wedge(bm, (0.02, -0.006, 0.2), (0.22, 0.006, 0.44), slope_dir='+X', mat_idx=0)
    add_wedge(bm, (-0.22, -0.006, 0.2), (-0.02, 0.006, 0.44), slope_dir='+X', mat_idx=0)
    add_cone(bm, (0, 0, 0.45), (0, 0, 0.58), r1=0.025, r2=0.0, segments=6, mat_idx=0)
    add_torus(bm, (0, 0, 0.26), major_r=0.025, minor_r=0.006, mat_idx=2)

def build_axe_hatchet(bm):
    add_cylinder(bm, (0, 0, -0.15), (0, 0, 0.2), radius=0.016, segments=8, mat_idx=1)
    add_box(bm, (0, 0, 0.16), (0.045, 0.045, 0.08), mat_idx=1)
    add_wedge(bm, (0.02, -0.005, 0.1), (0.16, 0.005, 0.24), slope_dir='+X', mat_idx=0)
    add_box(bm, (-0.04, 0, 0.16), (0.04, 0.03, 0.04), mat_idx=1)
    add_sphere(bm, (0, 0, -0.16), radius=0.02, segments=6, ring_count=4, mat_idx=2)

def build_mace(bm):
    add_cylinder(bm, (0, 0, -0.3), (0, 0, 0.35), radius=0.017, segments=8, mat_idx=1)
    add_sphere(bm, (0, 0, 0.35), radius=0.06, segments=8, ring_count=6, mat_idx=0)
    for a in range(6):
        ang = a * math.pi / 3
        c = math.cos(ang)
        s = math.sin(ang)
        add_box(bm, (c * 0.08, s * 0.08, 0.35), (0.04, 0.01, 0.12), rot=(0, 0, ang), mat_idx=0)
    add_cone(bm, (0, 0, 0.41), (0, 0, 0.5), r1=0.02, r2=0.0, segments=6, mat_idx=2)

def build_spear(bm):
    add_cylinder(bm, (0, 0, -1.0), (0, 0, 0.8), radius=0.016, segments=8, mat_idx=1)
    add_box(bm, (0, 0, 0.95), (0.045, 0.01, 0.3), mat_idx=0)
    add_cone(bm, (0, 0, 1.1), (0, 0, 1.25), r1=0.025, r2=0.0, segments=4, mat_idx=0)
    add_cylinder(bm, (0, 0, 0.78), (0, 0, 0.82), radius=0.025, segments=8, mat_idx=2)

def build_halberd(bm):
    add_cylinder(bm, (0, 0, -1.0), (0, 0, 0.8), radius=0.016, segments=8, mat_idx=1)
    add_cone(bm, (0, 0, 0.8), (0, 0, 1.25), r1=0.025, r2=0.0, segments=4, mat_idx=0)
    add_wedge(bm, (0.02, -0.005, 0.7), (0.2, 0.005, 0.9), slope_dir='+X', mat_idx=0)
    add_wedge(bm, (-0.14, -0.005, 0.72), (-0.02, 0.005, 0.82), slope_dir='+X', mat_idx=1)
    add_torus(bm, (0, 0, 0.75), major_r=0.024, minor_r=0.006, mat_idx=2)

def build_scythe(bm):
    add_cylinder(bm, (0, 0, -0.6), (0, 0, 0.75), radius=0.018, segments=8, mat_idx=1)
    add_cylinder(bm, (0, 0, -0.1), (0.12, 0, -0.1), radius=0.012, segments=6, mat_idx=1)
    add_cylinder(bm, (0, 0, 0.25), (0.12, 0, 0.25), radius=0.012, segments=6, mat_idx=1)
    # Curved blade extending sideways +X
    pts = [(0, 0, 0.75), (0.35, 0, 0.8), (0.75, 0, 0.65), (0.95, 0, 0.45)]
    for i in range(len(pts) - 1):
        add_box(bm, ((pts[i][0]+pts[i+1][0])/2, 0, (pts[i][2]+pts[i+1][2])/2), (pts[i+1][0]-pts[i][0], 0.01, 0.06), mat_idx=0)
    add_box(bm, (0.05, 0, 0.75), (0.06, 0.025, 0.04), mat_idx=2)

def build_hammer_war(bm):
    add_cylinder(bm, (0, 0, -0.35), (0, 0, 0.4), radius=0.016, segments=8, mat_idx=1)
    add_box(bm, (0, 0, 0.35), (0.06, 0.06, 0.06), mat_idx=1)
    add_box(bm, (0.08, 0, 0.35), (0.08, 0.05, 0.05), mat_idx=0) # hammer face
    add_cone(bm, (-0.03, 0, 0.35), (-0.16, 0, 0.32), r1=0.025, r2=0.003, segments=6, mat_idx=0) # spike
    # Start the orange pommel 5 mm above the charcoal head cap.
    add_cone(bm, (0, 0, 0.385), (0, 0, 0.505), r1=0.02, r2=0.0, segments=4, mat_idx=2)

def build_club_spiked(bm):
    add_cylinder(bm, (0, 0, -0.2), (0, 0, 0.4), radius=0.025, segments=8, mat_idx=0)
    add_cylinder(bm, (0, 0, -0.19), (0, 0, 0.0), radius=0.028, segments=8, mat_idx=1) # grip
    for ring in range(3):
        rz = 0.15 + ring * 0.1
        for a in range(4):
            ang = a * math.pi / 2
            add_cone(bm, (math.cos(ang)*0.025, math.sin(ang)*0.025, rz), (math.cos(ang)*0.06, math.sin(ang)*0.06, rz), r1=0.012, r2=0.0, segments=4, mat_idx=1)
    add_sphere(bm, (0, 0, 0.41), radius=0.03, segments=6, ring_count=4, mat_idx=2)

def build_nunchaku(bm):
    # Two sticks connected by chain, grip at (0,0,0)
    add_cylinder(bm, (0, 0, -0.15), (0, 0, 0.15), radius=0.016, segments=8, mat_idx=1)
    add_cylinder(bm, (0.15, 0, -0.15), (0.15, 0, 0.15), radius=0.016, segments=8, mat_idx=1)
    # Chain bridge
    add_torus(bm, (0.075, 0, 0.18), major_r=0.075, minor_r=0.005, axis='Y', mat_idx=0)
    add_torus(bm, (0, 0, 0.14), major_r=0.018, minor_r=0.004, mat_idx=2)
    add_torus(bm, (0.15, 0, 0.14), major_r=0.018, minor_r=0.004, mat_idx=2)

def build_sai(bm):
    add_cylinder(bm, (0, 0, -0.12), (0, 0, 0.04), radius=0.014, segments=8, mat_idx=1)
    add_sphere(bm, (0, 0, -0.13), radius=0.02, segments=6, ring_count=4, mat_idx=1)
    add_torus(bm, (0, 0, 0.04), major_r=0.05, minor_r=0.008, axis='Y', mat_idx=0)
    add_cone(bm, (0, 0, 0.04), (0, 0, 0.45), r1=0.012, r2=0.002, segments=6, mat_idx=0)
    add_cylinder(bm, (0, 0, -0.02), (0, 0, 0.0), radius=0.016, segments=8, mat_idx=2)

def build_shuriken(bm):
    # Flat 4-pointed star
    add_box(bm, (0, 0, 0), (0.12, 0.02, 0.006), mat_idx=0)
    add_box(bm, (0, 0, 0), (0.02, 0.12, 0.006), mat_idx=0)
    add_cylinder(bm, (0, 0, -0.004), (0, 0, 0.004), radius=0.016, segments=8, mat_idx=1)
    add_cylinder(bm, (0, 0, -0.005), (0, 0, 0.005), radius=0.006, segments=6, mat_idx=2)

def build_kunai(bm):
    add_torus(bm, (0, 0, -0.12), major_r=0.025, minor_r=0.006, mat_idx=1)
    add_cylinder(bm, (0, 0, -0.09), (0, 0, 0.02), radius=0.01, segments=8, mat_idx=1)
    add_wedge(bm, (-0.04, -0.005, 0.02), (0.04, 0.005, 0.16), slope_dir='+X', mat_idx=0)
    add_cone(bm, (0, 0, 0.16), (0, 0, 0.26), r1=0.03, r2=0.0, segments=4, mat_idx=0)
    add_box(bm, (0, 0, 0.014), (0.025, 0.015, 0.01), mat_idx=2)

def build_grenade_frag(bm):
    add_cylinder(bm, (0, 0, -0.04), (0, 0, 0.04), radius=0.035, segments=8, mat_idx=0)
    add_box(bm, (0, 0, 0.055), (0.025, 0.025, 0.025), mat_idx=1)
    add_box(bm, (0.015, 0, 0.02), (0.01, 0.012, 0.08), mat_idx=1) # lever
    add_torus(bm, (-0.02, 0, 0.06), major_r=0.015, minor_r=0.003, axis='X', mat_idx=2) # pin

def build_sniper_rifle(bm):
    add_box(bm, (0, 0.04, -0.07), (0.032, 0.06, 0.14), rot=(0.25, 0, 0), mat_idx=1)
    add_box(bm, (0, -0.1, 0.04), (0.04, 0.42, 0.07), mat_idx=0)
    add_box(bm, (0, 0.22, 0.02), (0.035, 0.26, 0.1), mat_idx=1)
    add_cylinder(bm, (0, -0.3, 0.04), (0, -0.85, 0.04), radius=0.012, segments=8, mat_idx=1)
    add_cylinder(bm, (0, -0.85, 0.04), (0, -0.92, 0.04), radius=0.018, segments=8, mat_idx=1)
    # Scope
    add_cylinder(bm, (0, 0.02, 0.11), (0, -0.22, 0.11), radius=0.018, segments=8, mat_idx=1)
    add_torus(bm, (0, -0.22, 0.11), major_r=0.02, minor_r=0.004, axis='Y', mat_idx=2)
    # Bipod
    add_cylinder(bm, (0, -0.6, 0.03), (-0.08, -0.6, -0.12), radius=0.006, segments=6, mat_idx=1)
    add_cylinder(bm, (0, -0.6, 0.03), (0.08, -0.6, -0.12), radius=0.006, segments=6, mat_idx=1)

def build_submachine_gun(bm):
    add_box(bm, (0, 0.02, -0.06), (0.03, 0.05, 0.12), rot=(0.25, 0, 0), mat_idx=1)
    add_box(bm, (0, -0.06, 0.03), (0.038, 0.24, 0.07), mat_idx=0)
    add_box(bm, (0, -0.04, -0.12), (0.025, 0.04, 0.18), mat_idx=1) # long mag
    add_cylinder(bm, (0, -0.18, 0.03), (0, -0.32, 0.03), radius=0.016, segments=8, mat_idx=1) # suppressor
    add_box(bm, (0, -0.14, -0.03), (0.02, 0.03, 0.07), mat_idx=1) # foregrip
    add_box(bm, (0.02, -0.02, 0.04), (0.005, 0.015, 0.01), mat_idx=2)

def build_revolver(bm):
    add_box(bm, (0, 0.04, -0.05), (0.03, 0.06, 0.12), rot=(0.35, 0, 0), mat_idx=1)
    add_cylinder(bm, (0, -0.02, 0.03), (0, -0.09, 0.03), radius=0.032, segments=8, mat_idx=1) # cylinder
    add_box(bm, (0, -0.05, 0.02), (0.035, 0.14, 0.05), mat_idx=0)
    add_cylinder(bm, (0, -0.12, 0.04), (0, -0.28, 0.04), radius=0.012, segments=8, mat_idx=0) # barrel
    add_box(bm, (0, -0.26, 0.06), (0.008, 0.015, 0.01), mat_idx=2)

def build_shield_riot(bm):
    # Grip at (0,0,0) on back
    add_box(bm, (0, -0.02, 0.0), (0.6, 0.02, 1.1), mat_idx=0)
    add_box(bm, (0, -0.02, 0.25), (0.28, 0.025, 0.1), mat_idx=1) # view port
    add_cylinder(bm, (-0.1, 0.04, -0.05), (-0.1, 0.04, 0.05), radius=0.015, segments=8, mat_idx=1) # handle
    add_box(bm, (0.1, 0.03, 0.0), (0.06, 0.02, 0.15), mat_idx=1) # arm strap
    add_box(bm, (0, -0.035, -0.15), (0.5, 0.005, 0.08), mat_idx=2) # police stripe

# ==============================================================================
# CITY BUILDERS (26 items)
# ==============================================================================

def build_street_lamp(bm):
    # Tall 5m street lamp, base Z=0
    add_cylinder(bm, (0, 0, 0), (0, 0, 0.25), radius=0.22, segments=8, mat_idx=1)
    add_cone(bm, (0, 0, 0.25), (0, 0, 0.6), r1=0.2, r2=0.1, segments=8, mat_idx=1)
    add_cylinder(bm, (0, 0, 0.6), (0, 0, 4.2), radius=0.08, segments=8, mat_idx=1)
    # Curved arm
    pts = [(0, 0, 4.2), (0, -0.3, 4.7), (0, -0.9, 4.9), (0, -1.3, 4.6)]
    for i in range(len(pts) - 1):
        add_cylinder(bm, pts[i], pts[i+1], radius=0.04, segments=6, mat_idx=1)
    # Lantern housing
    add_cone(bm, (0, -1.3, 4.6), (0, -1.3, 4.4), r1=0.2, r2=0.28, segments=6, mat_idx=0)
    # Leave a 5 mm axial gap below the orange lantern cap.
    add_cylinder(bm, (0, -1.3, 4.375), (0, -1.3, 4.395), radius=0.26, segments=6, mat_idx=2)

def build_street_lamp_double(bm):
    add_cylinder(bm, (0, 0, 0), (0, 0, 0.3), radius=0.25, segments=8, mat_idx=1)
    add_cylinder(bm, (0, 0, 0.3), (0, 0, 4.5), radius=0.09, segments=8, mat_idx=1)
    # Left & right arms
    for s in [-1, 1]:
        pts = [(s * 0, 0, 4.5), (s * 0.4, 0, 5.0), (s * 1.1, 0, 5.1), (s * 1.4, 0, 4.8)]
        for i in range(len(pts) - 1):
            add_cylinder(bm, pts[i], pts[i+1], radius=0.04, segments=6, mat_idx=1)
        add_cone(bm, (s * 1.4, 0, 4.8), (s * 1.4, 0, 4.6), r1=0.18, r2=0.26, segments=6, mat_idx=0)
        add_sphere(bm, (s * 1.4, 0, 4.58), radius=0.08, segments=6, ring_count=4, mat_idx=2)

def build_bench_park(bm):
    # Width 1.8m, depth 0.65m, height 0.85m
    for x in [-0.75, 0.75]:
        add_box(bm, (x, -0.2, 0.22), (0.05, 0.05, 0.44), mat_idx=1)
        add_box(bm, (x, 0.18, 0.38), (0.05, 0.05, 0.76), mat_idx=1)
        add_box(bm, (x, -0.01, 0.42), (0.05, 0.45, 0.04), mat_idx=1)
    # Slats
    for y in [-0.2, -0.08, 0.04, 0.15]:
        add_box(bm, (0, y, 0.45), (1.8, 0.08, 0.025), mat_idx=0)
    for z in [0.58, 0.7, 0.82]:
        add_box(bm, (0, 0.22, z), (1.8, 0.025, 0.09), mat_idx=0)
    add_box(bm, (0, -0.2, 0.46), (0.1, 0.096, 0.028), mat_idx=2)

def build_trash_can(bm):
    add_cylinder(bm, (0, 0, 0), (0, 0, 0.08), radius=0.28, segments=10, mat_idx=1)
    add_cylinder(bm, (0, 0, 0.08), (0, 0, 0.85), radius=0.25, segments=10, mat_idx=0)
    add_torus(bm, (0, 0, 0.85), major_r=0.25, minor_r=0.02, mat_idx=1)
    add_cone(bm, (0, 0, 0.85), (0, 0, 1.05), r1=0.25, r2=0.15, segments=10, mat_idx=1)
    add_box(bm, (0, -0.255, 0.5), (0.1, 0.01, 0.1), mat_idx=2)

def build_dumpster(bm):
    # Length 2.0m, width 1.2m, height 1.3m
    add_box(bm, (0, 0, 0.65), (2.0, 1.2, 1.1), mat_idx=0)
    add_box(bm, (0, 0, 1.22), (2.06, 1.26, 0.06), mat_idx=1) # rim
    # Lids
    add_box(bm, (-0.5, 0, 1.27), (0.95, 1.22, 0.05), rot=(0, -0.05, 0), mat_idx=1)
    add_box(bm, (0.5, 0, 1.27), (0.95, 1.22, 0.05), rot=(0, 0.05, 0), mat_idx=1)
    # Forklift pockets
    add_box(bm, (0, -0.62, 0.3), (1.8, 0.08, 0.15), mat_idx=1)
    add_box(bm, (0, 0.62, 0.3), (1.8, 0.08, 0.15), mat_idx=1)
    # Reflectors
    for sx in [-0.98, 0.98]:
        add_box(bm, (sx, -0.61, 0.9), (0.04, 0.01, 0.12), mat_idx=2)
        add_box(bm, (sx, 0.61, 0.9), (0.04, 0.01, 0.12), mat_idx=2)

def build_fire_hydrant(bm):
    add_cylinder(bm, (0, 0, 0), (0, 0, 0.1), radius=0.22, segments=8, mat_idx=1)
    add_cylinder(bm, (0, 0, 0.1), (0, 0, 0.65), radius=0.15, segments=8, mat_idx=0)
    add_cylinder(bm, (-0.18, 0, 0.42), (0.18, 0, 0.42), radius=0.06, segments=8, mat_idx=1)
    add_cylinder(bm, (0, 0, 0.42), (0, -0.2, 0.42), radius=0.07, segments=8, mat_idx=1)
    add_cone(bm, (0, 0, 0.65), (0, 0, 0.78), r1=0.15, r2=0.08, segments=8, mat_idx=0)
    add_box(bm, (0, 0, 0.8), (0.06, 0.06, 0.05), mat_idx=2)

def build_mailbox(bm):
    add_box(bm, (0, 0, 0.05), (0.55, 0.55, 0.1), mat_idx=1)
    add_box(bm, (0, 0, 0.6), (0.5, 0.5, 1.0), mat_idx=0)
    # Curved rounded hood
    add_cylinder(bm, (-0.25, 0, 1.1), (0.25, 0, 1.1), radius=0.25, segments=10, mat_idx=0)
    add_box(bm, (0, -0.27, 0.95), (0.35, 0.04, 0.12), rot=(0.4, 0, 0), mat_idx=2)

def build_bus_stop_shelter(bm):
    # Width 3.2m, depth 1.6m, height 2.5m
    for x in [-1.5, 1.5]:
        add_cylinder(bm, (x, -0.7, 0), (x, -0.7, 2.4), radius=0.04, segments=8, mat_idx=1)
        add_cylinder(bm, (x, 0.7, 0), (x, 0.7, 2.4), radius=0.04, segments=8, mat_idx=1)
        add_box(bm, (x, 0, 1.2), (0.02, 1.4, 2.2), mat_idx=0) # side glass panel
    # Rear wall
    add_box(bm, (0, 0.7, 1.2), (2.96, 0.02, 2.2), mat_idx=0)
    # Roof canopy
    add_box(bm, (0, 0, 2.45), (3.4, 1.8, 0.1), mat_idx=1)
    # Bench
    add_box(bm, (0, 0.4, 0.5), (2.2, 0.35, 0.04), mat_idx=0)
    add_box(bm, (0, -0.85, 2.45), (2.4, 0.05, 0.12), mat_idx=2)

def build_traffic_light(bm):
    add_cylinder(bm, (0, 0, 0), (0, 0, 4.5), radius=0.08, segments=8, mat_idx=1)
    add_box(bm, (0, -0.4, 3.8), (0.32, 0.25, 0.9), mat_idx=1) # signal box
    # Visors & lights
    for i, z in enumerate([4.1, 3.8, 3.5]):
        light_z = z - 0.05 if i == 0 else z
        # Lower the orange light 5 cm below the visor underside.
        add_cylinder(bm, (0, -0.52, light_z), (0, -0.55, light_z), radius=0.09, segments=8, mat_idx=2 if i == 0 else 0)
        add_wedge(bm, (-0.14, -0.65, z + 0.05), (0.14, -0.52, z + 0.14), slope_dir='+Y', mat_idx=1)

def build_street_sign_pole(bm):
    add_cylinder(bm, (0, 0, 0), (0, 0, 3.0), radius=0.035, segments=8, mat_idx=1)
    add_box(bm, (0, 0, 2.85), (0.8, 0.02, 0.18), mat_idx=0) # sign 1
    add_box(bm, (0, 0, 2.65), (0.02, 0.8, 0.18), mat_idx=0) # sign 2
    add_box(bm, (0.34, 0, 2.85), (0.08, 0.026, 0.16), mat_idx=2)

def build_parking_meter(bm):
    add_cylinder(bm, (0, 0, 0), (0, 0, 1.0), radius=0.035, segments=8, mat_idx=1)
    add_box(bm, (0, 0, 1.25), (0.18, 0.16, 0.5), mat_idx=0)
    add_box(bm, (0, -0.09, 1.35), (0.12, 0.02, 0.1), mat_idx=1) # screen
    add_box(bm, (0, -0.09, 1.15), (0.08, 0.01, 0.04), mat_idx=2) # coin return / key

def build_news_stand(bm):
    add_box(bm, (0, 0, 0.5), (0.55, 0.45, 1.0), mat_idx=0)
    add_box(bm, (0, 0, 1.02), (0.58, 0.48, 0.05), mat_idx=1)
    add_box(bm, (0, -0.23, 0.65), (0.42, 0.02, 0.35), mat_idx=1) # window
    add_box(bm, (0, -0.24, 0.4), (0.3, 0.04, 0.06), mat_idx=2) # handle

def build_bicycle_rack(bm):
    # Inverted U loops
    for x in [-0.5, 0.5]:
        add_cylinder(bm, (x, -0.3, 0.01), (x, -0.3, 0.8), radius=0.03, segments=8, mat_idx=1)
        add_cylinder(bm, (x, 0.3, 0.01), (x, 0.3, 0.8), radius=0.03, segments=8, mat_idx=1)
        add_cylinder(bm, (x, -0.3, 0.8), (x, 0.3, 0.8), radius=0.03, segments=8, mat_idx=1)
        add_box(bm, (x, -0.3, 0.01), (0.12, 0.12, 0.02), mat_idx=0)
        add_box(bm, (x, 0.3, 0.01), (0.12, 0.12, 0.02), mat_idx=0)
    # Keep the orange cap outside the 30 mm rack tube.
    add_torus(bm, (-0.5, 0, 0.8), major_r=0.036, minor_r=0.005, axis='Y', mat_idx=2)

def build_telephone_booth(bm):
    # 1.0m x 1.0m x 2.2m
    add_box(bm, (0, 0, 0.05), (1.0, 1.0, 0.1), mat_idx=1)
    add_box(bm, (0, 0, 2.15), (1.05, 1.05, 0.1), mat_idx=1)
    for sx, sy in [(-0.45, -0.45), (-0.45, 0.45), (0.45, 0.45)]:
        add_cylinder(bm, (sx, sy, 0.1), (sx, sy, 2.1), radius=0.03, segments=8, mat_idx=1)
    add_box(bm, (0, 0.45, 1.1), (0.85, 0.02, 1.8), mat_idx=0)
    add_box(bm, (-0.45, 0, 1.1), (0.02, 0.85, 1.8), mat_idx=0)
    # Phone unit
    add_box(bm, (0, 0.38, 1.2), (0.25, 0.12, 0.4), mat_idx=1)
    add_box(bm, (0, 0.3, 1.15), (0.08, 0.06, 0.25), mat_idx=2) # handset

def build_planter_concrete(bm):
    add_box(bm, (0, 0, 0.46), (1.2, 1.2, 0.88), mat_idx=0)
    add_box(bm, (0, 0, 0.04), (1.26, 1.26, 0.08), mat_idx=1) # base rim
    add_box(bm, (0, 0, 0.88), (1.26, 1.26, 0.08), mat_idx=1) # top rim
    add_box(bm, (0, 0, 0.75), (0.9, 0.9, 0.2), mat_idx=1) # soil
    add_sphere(bm, (0, 0, 1.05), radius=0.38, segments=8, ring_count=6, mat_idx=0) # shrub
    add_box(bm, (0, -0.635, 0.45), (0.3, 0.01, 0.05), mat_idx=2)

def build_manhole_cover(bm):
    add_cylinder(bm, (0, 0, 0), (0, 0, 0.06), radius=0.48, segments=12, mat_idx=1)
    add_cylinder(bm, (0, 0, 0.05), (0, 0, 0.08), radius=0.42, segments=12, mat_idx=0)
    add_torus(bm, (0, 0, 0.08), major_r=0.3, minor_r=0.015, mat_idx=1)
    add_cylinder(bm, (0.15, 0, 0.075), (0.15, 0, 0.085), radius=0.02, segments=6, mat_idx=2)

def build_billboard_small(bm):
    # A-frame sidewalk sign
    add_box(bm, (0, -0.15, 0.5), (0.65, 0.04, 1.0), rot=(-0.15, 0, 0), mat_idx=0)
    add_box(bm, (0, 0.15, 0.5), (0.65, 0.04, 1.0), rot=(0.15, 0, 0), mat_idx=0)
    # Hinges
    add_cylinder(bm, (-0.35, 0, 0.98), (0.35, 0, 0.98), radius=0.015, segments=8, mat_idx=1)
    add_box(bm, (0, -0.18, 0.55), (0.5, 0.01, 0.7), rot=(-0.15, 0, 0), mat_idx=1)
    add_box(bm, (0, -0.19, 0.88), (0.4, 0.01, 0.06), rot=(-0.15, 0, 0), mat_idx=2)

def build_billboard_highway(bm):
    # Elevated billboard: height 7m, width 6m
    for x in [-1.8, 1.8]:
        add_cylinder(bm, (x, 0, 0), (x, 0, 4.5), radius=0.18, segments=8, mat_idx=1)
    add_box(bm, (0, 0, 4.2), (4.5, 0.3, 0.3), mat_idx=1)
    add_box(bm, (0, 0, 5.8), (6.0, 0.2, 2.8), mat_idx=0) # board
    add_box(bm, (0, 0, 5.8), (6.1, 0.24, 2.9), mat_idx=1) # border frame
    add_box(bm, (0, -0.45, 4.3), (5.5, 0.6, 0.05), mat_idx=1) # catwalk
    add_box(bm, (0, -0.11, 7.25), (4.0, 0.05, 0.08), mat_idx=2)

def build_fire_escape(bm):
    # Modular fire escape platform: 2.2m x 1.2m, height 1.2m
    add_box(bm, (0, 0, 0.04), (2.2, 1.2, 0.08), mat_idx=0)
    add_grate(bm, (0, 0, 0.095), 2.0, 1.0, thickness=0.03, bars=6, mat_idx=0)
    add_railing(bm, (-1.1, -0.6, 0.1), (1.1, -0.6, 0.1), height=1.0, mat_idx=MAT_STRUCTURAL_GRAY, posts=3)
    add_railing(bm, (-1.1, -0.6, 0.1), (-1.1, 0.6, 0.1), height=1.0, mat_idx=MAT_STRUCTURAL_GRAY, posts=2)
    add_railing(bm, (1.1, -0.6, 0.1), (1.1, 0.6, 0.1), height=1.0, mat_idx=MAT_STRUCTURAL_GRAY, posts=2)
    add_box(bm, (0, -0.6, 0.05), (2.16, 0.05, 0.04), mat_idx=2)

def build_subway_entrance(bm):
    # Width 3m, depth 2.5m, steps down
    add_box(bm, (-1.4, 0, 0.5), (0.2, 2.5, 1.0), mat_idx=0)
    add_box(bm, (1.4, 0, 0.5), (0.2, 2.5, 1.0), mat_idx=0)
    add_box(bm, (0, 1.2, 0.5), (2.8, 0.2, 1.0), mat_idx=0)
    # Railing arch header
    add_cylinder(bm, (-1.4, -1.2, 1.0), (-1.4, -1.2, 2.5), radius=0.04, segments=8, mat_idx=1)
    add_cylinder(bm, (1.4, -1.2, 1.0), (1.4, -1.2, 2.5), radius=0.04, segments=8, mat_idx=1)
    add_cylinder(bm, (-1.4, -1.2, 2.5), (1.4, -1.2, 2.5), radius=0.04, segments=8, mat_idx=1)
    add_sphere(bm, (-1.4, -1.2, 2.6), radius=0.12, segments=6, ring_count=4, mat_idx=2)
    add_sphere(bm, (1.4, -1.2, 2.6), radius=0.12, segments=6, ring_count=4, mat_idx=2)

def build_curb_straight(bm):
    # Length 2m, width 0.35m, height 0.2m
    add_box(bm, (0, 0.025, 0.1), (2.0, 0.3, 0.2), mat_idx=0)
    add_box(bm, (0, -0.15, 0.1), (2.0, 0.05, 0.2), mat_idx=MAT_STRUCTURAL_GRAY)

def build_curb_corner(bm):
    # 90-degree curved curb
    add_box(bm, (0.4, 0.4, 0.1), (0.8, 0.8, 0.2), mat_idx=0)
    add_cylinder(bm, (0.8, 0.8, 0), (0.8, 0.8, 0.2), radius=0.8, segments=8, mat_idx=0)
    add_torus(bm, (0.8, 0.8, 0.19), major_r=0.78, minor_r=0.02, mat_idx=1)

def build_sidewalk_slab(bm):
    # 2m x 2m x 0.15m slab with groove
    add_box(bm, (0, 0, 0.075), (2.0, 2.0, 0.15), mat_idx=0)
    add_box(bm, (0, 0, 0.145), (1.96, 0.03, 0.02), mat_idx=MAT_STRUCTURAL_GRAY)
    add_box(bm, (0, 0, 0.145), (0.03, 1.96, 0.02), mat_idx=MAT_STRUCTURAL_GRAY)

def build_crosswalk_tile(bm):
    # 4m x 2m road tile with zebra stripes
    add_box(bm, (0, 0, 0.05), (4.0, 2.0, 0.1), mat_idx=0)
    for x in [-1.5, -0.5, 0.5, 1.5]:
        add_box(bm, (x, 0, 0.105), (0.5, 1.8, 0.015), mat_idx=MAT_STRUCTURAL_GRAY)
    add_box(bm, (-1.5, -0.9, 0.106), (0.51, 0.1, 0.016), mat_idx=2)

def build_fountain_plaza(bm):
    # Circular 3m diameter plaza fountain
    add_cylinder(bm, (0, 0, 0), (0, 0, 0.4), radius=1.5, segments=12, mat_idx=0)
    add_cylinder(bm, (0, 0, 0.35), (0, 0, 0.42), radius=1.35, segments=12, mat_idx=1) # water
    add_cylinder(bm, (0, 0, 0.4), (0, 0, 1.1), radius=0.35, segments=8, mat_idx=0) # pedestal
    add_cone(bm, (0, 0, 1.1), (0, 0, 1.4), r1=0.7, r2=0.5, segments=8, mat_idx=0) # upper bowl
    add_sphere(bm, (0, 0, 1.55), radius=0.15, segments=6, ring_count=5, mat_idx=2)

def build_security_camera_pole(bm):
    add_cylinder(bm, (0, 0, 0), (0, 0, 4.0), radius=0.06, segments=8, mat_idx=1)
    add_cylinder(bm, (0, 0, 3.8), (0, -0.6, 3.8), radius=0.035, segments=6, mat_idx=1)
    add_sphere(bm, (0, -0.6, 3.75), radius=0.16, segments=8, ring_count=5, mat_idx=0)
    add_cone(bm, (0, -0.6, 3.75), (0, -0.85, 3.65), r1=0.1, r2=0.06, segments=6, mat_idx=1)
    add_cylinder(bm, (0, -0.85, 3.65), (0, -0.88, 3.65), radius=0.03, segments=6, mat_idx=2)

# ==============================================================================
# PARKOUR BUILDERS (22 items)
# ==============================================================================

def build_vault_box(bm):
    # Vault box: length 1.5m, width 0.8m, height 1.0m
    add_box(bm, (0, 0, 0.45), (1.4, 0.75, 0.9), mat_idx=MAT_STRUCTURAL_GRAY)
    add_box(bm, (0, 0, 0.95), (1.5, 0.85, 0.1), mat_idx=0) # padded top
    add_box(bm, (0, 0, 0.96), (1.52, 0.1, 0.11), mat_idx=2) # safety stripe

def build_vault_rail(bm):
    # Length 2.0m, height 0.9m
    for x in [-0.85, 0.85]:
        add_cylinder(bm, (x, 0, 0.01), (x, 0, 0.88), radius=0.03, segments=8, mat_idx=MAT_STRUCTURAL_GRAY)
        add_box(bm, (x, 0, 0.01), (0.2, 0.2, 0.02), mat_idx=MAT_STRUCTURAL_GRAY)
    add_cylinder(bm, (-1.0, 0, 0.9), (1.0, 0, 0.9), radius=0.03, segments=8, mat_idx=0)
    # Keep the orange cap outside the 30 mm rail tube.
    add_torus(bm, (0, 0, 0.9), major_r=0.036, minor_r=0.005, axis='X', mat_idx=2)

def build_balance_beam(bm):
    # Length 3.2m, height 0.45m
    for x in [-1.2, 1.2]:
        add_box(bm, (x, 0, 0.02), (0.1, 0.5, 0.04), mat_idx=MAT_STRUCTURAL_GRAY)
        add_cylinder(bm, (x, 0, 0.04), (x, 0, 0.38), radius=0.03, segments=8, mat_idx=MAT_STRUCTURAL_GRAY)
    add_box(bm, (0, 0, 0.42), (3.2, 0.12, 0.08), mat_idx=0)
    add_box(bm, (0, 0, 0.466), (0.2, 0.125, 0.01), mat_idx=2)

def build_precision_trainer(bm):
    add_box(bm, (0, 0, 0.1), (0.8, 0.4, 0.2), mat_idx=0)
    add_box(bm, (0, 0, 0.208), (0.76, 0.36, 0.014), mat_idx=0) # light top safely raised
    add_box(bm, (0, 0, 0.218), (0.1, 0.365, 0.008), mat_idx=2)

def build_warped_wall(bm):
    # 3.2m tall, 2.0m wide curved wall
    pts = [(0, 0.8, 0.1), (0, 0.5, 0.6), (0, 0.25, 1.4), (0, 0.08, 2.4), (0, 0, 3.2)]
    for i in range(len(pts) - 1):
        z_mid = (pts[i][2] + pts[i+1][2]) / 2
        y_mid = (pts[i][1] + pts[i+1][1]) / 2
        add_box(bm, (0, y_mid, z_mid), (2.0, 0.15, pts[i+1][2]-pts[i][2]), mat_idx=0)
    # Grab ledge at top
    add_box(bm, (0, -0.1, 3.2), (2.04, 0.3, 0.08), mat_idx=MAT_STRUCTURAL_GRAY)
    add_box(bm, (0, -0.255, 3.21), (2.06, 0.04, 0.09), mat_idx=2)

def build_climbing_wall_modular(bm):
    # 2m wide x 3m high vertical panel
    add_box(bm, (0, 0, 1.5), (2.0, 0.1, 3.0), mat_idx=0)
    add_box(bm, (0, 0.05, 1.5), (2.05, 0.02, 3.05), mat_idx=MAT_STRUCTURAL_GRAY) # frame
    # Holds
    import random
    rng = random.Random(42)
    for _ in range(16):
        hx = rng.uniform(-0.8, 0.8)
        hz = rng.uniform(0.3, 2.8)
        mat = 2 if rng.random() > 0.6 else 1
        add_box(bm, (hx, -0.08, hz), (0.1, 0.06, 0.08), rot=(rng.uniform(-0.2, 0.2), rng.uniform(-0.2, 0.2), rng.uniform(0, 3)), mat_idx=mat)

def build_monkey_bars(bm):
    # 4m long x 1m wide x 2.4m high
    for x in [-1.8, 1.8]:
        for y in [-0.45, 0.45]:
            add_cylinder(bm, (x, y, 0), (x, y, 2.4), radius=0.04, segments=8, mat_idx=MAT_STRUCTURAL_GRAY)
    # Top beams
    for y in [-0.45, 0.45]:
        add_cylinder(bm, (-1.8, y, 2.4), (1.8, y, 2.4), radius=0.035, segments=8, mat_idx=MAT_STRUCTURAL_GRAY)
    # Rungs
    for r in range(9):
        rx = -1.6 + r * 0.4
        add_cylinder(bm, (rx, -0.45, 2.4), (rx, 0.45, 2.4), radius=0.022, segments=8, mat_idx=0)
    # Keep the orange collar outside the 22 mm rung tube.
    add_torus(bm, (0, 0, 2.4), major_r=0.028, minor_r=0.005, axis='Y', mat_idx=2)

def build_scaffolding_tower(bm):
    # 2m x 2m x 3.5m tower
    for x in [-0.9, 0.9]:
        for y in [-0.9, 0.9]:
            add_cylinder(bm, (x, y, 0), (x, y, 3.5), radius=0.035, segments=8, mat_idx=MAT_STRUCTURAL_GRAY)
    # Horizontal rails at 1.5m and 3.0m
    for z in [1.5, 3.0]:
        add_cylinder(bm, (-0.9, -0.9, z), (0.9, -0.9, z), radius=0.025, segments=6, mat_idx=MAT_STRUCTURAL_GRAY)
        add_cylinder(bm, (-0.9, 0.9, z), (0.9, 0.9, z), radius=0.025, segments=6, mat_idx=MAT_STRUCTURAL_GRAY)
        add_cylinder(bm, (-0.9, -0.9, z), (-0.9, 0.9, z), radius=0.025, segments=6, mat_idx=MAT_STRUCTURAL_GRAY)
        add_cylinder(bm, (0.9, -0.9, z), (0.9, 0.9, z), radius=0.025, segments=6, mat_idx=MAT_STRUCTURAL_GRAY)
    # Wood deck at 3.0m
    add_box(bm, (0, 0, 3.04), (1.76, 1.76, 0.05), mat_idx=0)
    add_box(bm, (0, -0.95, 3.04), (1.76, 0.05, 0.15), mat_idx=2) # toe board

def build_landing_mat(bm):
    # 2m x 1.4m x 0.3m
    add_box(bm, (0, 0, 0.15), (2.0, 1.4, 0.3), mat_idx=0)
    add_box(bm, (0, 0, 0.15), (2.02, 1.42, 0.05), mat_idx=MAT_STRUCTURAL_GRAY) # mid seam
    add_box(bm, (0, -0.71, 0.15), (0.4, 0.04, 0.06), mat_idx=2) # handle

def build_springboard(bm):
    add_box(bm, (0, 0, 0.02), (1.2, 0.6, 0.04), mat_idx=MAT_STRUCTURAL_GRAY)
    # Sloped board
    add_box(bm, (0, 0.05, 0.16), (1.2, 0.6, 0.03), rot=(-0.18, 0, 0), mat_idx=0)
    # Springs
    add_cylinder(bm, (-0.35, 0.18, 0.04), (-0.35, 0.18, 0.22), radius=0.04, segments=6, mat_idx=MAT_STRUCTURAL_GRAY)
    add_cylinder(bm, (0.35, 0.18, 0.04), (0.35, 0.18, 0.22), radius=0.04, segments=6, mat_idx=MAT_STRUCTURAL_GRAY)
    add_box(bm, (0, 0.3, 0.25), (1.1, 0.1, 0.04), rot=(-0.18, 0, 0), mat_idx=2)

def build_climbing_rope(bm):
    # Rope hanging from ceiling bracket (4m)
    add_box(bm, (0, 0, 3.95), (0.3, 0.3, 0.1), mat_idx=1)
    add_cylinder(bm, (0, 0, 0.4), (0, 0, 3.9), radius=0.02, segments=6, mat_idx=0)
    add_sphere(bm, (0, 0, 0.4), radius=0.06, segments=8, ring_count=5, mat_idx=1) # knot
    # Keep the orange collar outside the 20 mm rope.
    add_torus(bm, (0, 0, 1.8), major_r=0.027, minor_r=0.005, mat_idx=2)

def build_swinging_ring(bm):
    add_box(bm, (0, 0, 3.95), (0.6, 0.2, 0.1), mat_idx=1)
    for x in [-0.25, 0.25]:
        add_cylinder(bm, (x, 0, 2.0), (x, 0, 3.9), radius=0.008, segments=6, mat_idx=1) # strap
        add_torus(bm, (x, 0, 1.85), major_r=0.12, minor_r=0.015, axis='Y', mat_idx=0)
    add_torus(bm, (-0.25, 0, 1.85), major_r=0.12, minor_r=0.005, axis='Y', mat_idx=2)

def build_trapeze_bar(bm):
    add_cylinder(bm, (-0.4, 0, 1.8), (-0.4, 0, 3.8), radius=0.006, segments=6, mat_idx=1)
    add_cylinder(bm, (0.4, 0, 1.8), (0.4, 0, 3.8), radius=0.006, segments=6, mat_idx=1)
    add_cylinder(bm, (-0.45, 0, 1.8), (0.45, 0, 1.8), radius=0.02, segments=8, mat_idx=0)
    add_cylinder(bm, (-0.1, 0, 1.8), (0.1, 0, 1.8), radius=0.024, segments=8, mat_idx=2)

def build_slackline_rig(bm):
    for x in [-1.8, 1.8]:
        add_box(bm, (x, 0, 0.05), (0.4, 0.6, 0.1), mat_idx=1)
        add_cylinder(bm, (x, 0, 0.1), (x, 0, 0.5), radius=0.035, segments=8, mat_idx=1)
    add_box(bm, (0, 0, 0.48), (3.6, 0.05, 0.005), mat_idx=0) # line
    add_box(bm, (1.6, 0, 0.48), (0.12, 0.08, 0.08), mat_idx=2) # ratchet

def build_tire_obstacle(bm):
    add_torus(bm, (0, 0, 0.25), major_r=0.55, minor_r=0.22, mat_idx=1)
    add_cylinder(bm, (0, 0, 0.05), (0, 0, 0.45), radius=0.35, segments=10, mat_idx=0) # rim
    # Keep the orange rim outside the 350 mm inner rim cylinder.
    add_torus(bm, (0, 0, 0.46), major_r=0.367, minor_r=0.015, mat_idx=2)

def build_tire_stack(bm):
    for i in range(3):
        add_torus(bm, (0, 0, 0.2 + i * 0.35), major_r=0.52, minor_r=0.18, mat_idx=1)
    add_box(bm, (0, 0, 0.6), (0.04, 1.1, 0.8), mat_idx=2) # strapping tape

def build_plyo_box_low(bm):
    # Height 0.3m
    add_box(bm, (0, 0, 0.15), (0.6, 0.5, 0.3), mat_idx=0)
    add_box(bm, (0, 0, 0.295), (0.56, 0.46, 0.02), mat_idx=1)
    # Raise the marker above both the box and its light top pad.
    add_box(bm, (0, 0, 0.311), (0.12, 0.12, 0.01), mat_idx=2)

def build_plyo_box_med(bm):
    # Height 0.6m
    add_box(bm, (0, 0, 0.3), (0.7, 0.6, 0.6), mat_idx=0)
    add_box(bm, (0, 0, 0.595), (0.65, 0.55, 0.02), mat_idx=0)
    add_box(bm, (0, -0.305, 0.45), (0.2, 0.02, 0.06), mat_idx=2) # handle

def build_plyo_box_high(bm):
    # Height 0.9m
    add_box(bm, (0, 0, 0.45), (0.8, 0.7, 0.9), mat_idx=0)
    add_box(bm, (0, 0, 0.895), (0.75, 0.65, 0.02), mat_idx=0)
    add_box(bm, (0, -0.355, 0.7), (0.22, 0.02, 0.06), mat_idx=2)

def build_hurdle_adjustable(bm):
    add_box(bm, (-0.5, 0, 0.02), (0.1, 0.6, 0.04), mat_idx=MAT_STRUCTURAL_GRAY)
    add_box(bm, (0.5, 0, 0.02), (0.1, 0.6, 0.04), mat_idx=MAT_STRUCTURAL_GRAY)
    add_cylinder(bm, (-0.5, 0, 0.04), (-0.5, 0, 0.9), radius=0.02, segments=8, mat_idx=MAT_STRUCTURAL_GRAY)
    add_cylinder(bm, (0.5, 0, 0.04), (0.5, 0, 0.9), radius=0.02, segments=8, mat_idx=MAT_STRUCTURAL_GRAY)
    add_box(bm, (0, 0, 0.88), (1.1, 0.03, 0.08), mat_idx=0)
    add_box(bm, (0, 0, 0.88), (0.3, 0.035, 0.085), mat_idx=2)

def build_rooftop_gap_plank(bm):
    # 3.2m long x 0.4m wide timber bridge
    add_box(bm, (0, 0, 0.04), (3.2, 0.4, 0.08), mat_idx=0)
    add_box(bm, (-1.56, 0, 0.04), (0.12, 0.42, 0.09), mat_idx=1) # steel endcap
    add_box(bm, (1.56, 0, 0.04), (0.12, 0.42, 0.09), mat_idx=1)
    # Keep the marker 1 mm above the plank top face.
    add_box(bm, (0, 0, 0.086), (0.4, 0.41, 0.01), mat_idx=2)

def build_wall_run_wedge(bm):
    # Angled ramp wedge
    add_wedge(bm, (-0.8, -0.6, 0), (0.8, 0.6, 0.75), slope_dir='+Y', mat_idx=0)
    add_box(bm, (0, 0.62, 0.41), (1.62, 0.05, 0.8), mat_idx=MAT_STRUCTURAL_GRAY)
    add_box(bm, (0, 0.64, 0.7), (1.64, 0.02, 0.1), mat_idx=2)

# ==============================================================================
# SPORTS BUILDERS (16 items)
# ==============================================================================

def build_basketball(bm):
    # Radius 0.12m, center (0,0,0.12)
    add_sphere(bm, (0, 0, 0.12), radius=0.12, segments=12, ring_count=8, mat_idx=2)
    add_torus(bm, (0, 0, 0.12), major_r=0.12, minor_r=0.005, axis='Z', mat_idx=1)
    add_torus(bm, (0, 0, 0.12), major_r=0.12, minor_r=0.005, axis='X', mat_idx=1)

def build_football(bm):
    # American football, length 0.28m, diameter 0.16m
    add_cone(bm, (0, -0.14, 0.08), (0, 0, 0.08), r1=0.02, r2=0.08, segments=8, mat_idx=1)
    add_cone(bm, (0, 0.14, 0.08), (0, 0, 0.08), r1=0.02, r2=0.08, segments=8, mat_idx=1)
    add_box(bm, (0, 0, 0.165), (0.012, 0.08, 0.01), mat_idx=0) # laces
    add_torus(bm, (0, -0.06, 0.08), major_r=0.07, minor_r=0.004, axis='Y', mat_idx=2)

def build_soccer_ball(bm):
    add_sphere(bm, (0, 0, 0.11), radius=0.11, segments=12, ring_count=8, mat_idx=0)
    add_cylinder(bm, (0, 0, 0.215), (0, 0, 0.22), radius=0.04, segments=5, mat_idx=1)
    add_cylinder(bm, (0.08, 0, 0.11), (0.11, 0, 0.11), radius=0.035, segments=5, mat_idx=1)
    # Keep the orange seam outside the 110 mm ball skin.
    add_torus(bm, (0, 0, 0.11), major_r=0.116, minor_r=0.004, mat_idx=2)

def build_volleyball(bm):
    add_sphere(bm, (0, 0, 0.105), radius=0.105, segments=12, ring_count=8, mat_idx=0)
    add_torus(bm, (0, 0, 0.105), major_r=0.106, minor_r=0.004, axis='Z', mat_idx=1)
    # Keep the orange seam outside the 105 mm ball skin.
    add_torus(bm, (0, 0, 0.105), major_r=0.111, minor_r=0.004, axis='Y', mat_idx=2)

def build_tennis_racket(bm):
    # Grip at (0,0,0)
    add_cylinder(bm, (0, 0, -0.15), (0, 0, 0.15), radius=0.016, segments=8, mat_idx=1)
    add_cylinder(bm, (0, 0, 0.15), (0, 0, 0.3), radius=0.012, segments=6, mat_idx=0) # shaft
    add_torus(bm, (0, 0, 0.48), major_r=0.16, minor_r=0.012, axis='Y', mat_idx=0) # rim
    add_box(bm, (0, 0, 0.48), (0.28, 0.004, 0.32), mat_idx=1) # strings
    add_torus(bm, (0, 0, 0.15), major_r=0.018, minor_r=0.004, mat_idx=2)

def build_tennis_ball(bm):
    add_sphere(bm, (0, 0, 0.035), radius=0.035, segments=10, ring_count=6, mat_idx=0)
    # Keep the orange seam outside the 35 mm ball skin.
    add_torus(bm, (0, 0, 0.035), major_r=0.039, minor_r=0.002, axis='X', mat_idx=2)

def build_hockey_stick(bm):
    add_cylinder(bm, (0, 0, -0.4), (0, 0, 0.7), radius=0.014, segments=6, mat_idx=0)
    add_cylinder(bm, (0, 0, 0.7), (0, 0, 0.9), radius=0.016, segments=6, mat_idx=1) # taped grip
    add_box(bm, (0.12, 0, -0.42), (0.28, 0.01, 0.06), mat_idx=1) # blade
    add_box(bm, (0.2, 0, -0.42), (0.05, 0.012, 0.062), mat_idx=2)

def build_hockey_puck(bm):
    add_cylinder(bm, (0, 0, 0), (0, 0, 0.025), radius=0.038, segments=12, mat_idx=1)
    add_cylinder(bm, (0, 0, 0.024), (0, 0, 0.026), radius=0.02, segments=8, mat_idx=2)

def build_golf_club(bm):
    add_cylinder(bm, (0, 0, -0.45), (0, 0, 0.35), radius=0.007, segments=6, mat_idx=0)
    add_cylinder(bm, (0, 0, 0.35), (0, 0, 0.55), radius=0.012, segments=6, mat_idx=1) # grip
    add_box(bm, (0.04, 0, -0.48), (0.08, 0.04, 0.05), rot=(0, 0.2, 0), mat_idx=1) # head
    add_box(bm, (0.04, -0.021, -0.48), (0.06, 0.005, 0.03), rot=(0, 0.2, 0), mat_idx=2)

def build_bowling_pin(bm):
    add_cylinder(bm, (0, 0, 0), (0, 0, 0.04), radius=0.055, segments=10, mat_idx=0)
    add_cone(bm, (0, 0, 0.04), (0, 0, 0.16), r1=0.055, r2=0.065, segments=10, mat_idx=0)
    add_cone(bm, (0, 0, 0.16), (0, 0, 0.28), r1=0.065, r2=0.03, segments=10, mat_idx=0)
    add_cylinder(bm, (0, 0, 0.28), (0, 0, 0.34), radius=0.03, segments=10, mat_idx=0)
    add_sphere(bm, (0, 0, 0.35), radius=0.036, segments=8, ring_count=5, mat_idx=0)
    # Red neck rings
    add_torus(bm, (0, 0, 0.29), major_r=0.035, minor_r=0.003, mat_idx=2)
    add_torus(bm, (0, 0, 0.32), major_r=0.035, minor_r=0.003, mat_idx=2)

def build_bowling_ball(bm):
    add_sphere(bm, (0, 0, 0.11), radius=0.11, segments=12, ring_count=8, mat_idx=1)
    # Finger holes
    for hx, hy in [(-0.02, 0.03), (0.02, 0.03), (0, -0.03)]:
        add_cylinder(bm, (hx, hy, 0.2), (hx, hy, 0.22), radius=0.012, segments=6, mat_idx=0)
    # Keep the orange seam outside the 110 mm ball skin.
    add_torus(bm, (0, 0, 0.11), major_r=0.116, minor_r=0.004, mat_idx=2)

def build_boxing_glove(bm):
    add_cylinder(bm, (0, 0, -0.08), (0, 0, 0.02), radius=0.06, segments=8, mat_idx=1) # wrist
    add_box(bm, (0, 0, 0.08), (0.13, 0.11, 0.16), mat_idx=0) # main fist
    add_box(bm, (0.08, -0.02, 0.06), (0.05, 0.05, 0.09), rot=(0, 0, 0.3), mat_idx=0) # thumb
    add_box(bm, (0, 0, -0.02), (0.14, 0.12, 0.03), mat_idx=2) # strap

def build_punching_bag(bm):
    # Hanging heavy bag: diameter 0.4m, height 1.2m
    add_cylinder(bm, (0, 0, 0.4), (0, 0, 1.6), radius=0.2, segments=10, mat_idx=1)
    add_sphere(bm, (0, 0, 0.4), radius=0.2, segments=10, ring_count=6, mat_idx=1)
    add_sphere(bm, (0, 0, 1.6), radius=0.2, segments=10, ring_count=6, mat_idx=1)
    # Chains
    for a in range(3):
        ang = a * 2 * math.pi / 3
        add_cylinder(bm, (math.cos(ang)*0.16, math.sin(ang)*0.16, 1.7), (0, 0, 2.2), radius=0.008, segments=6, mat_idx=0)
    # Keep the orange band outside the 200 mm bag skin.
    add_torus(bm, (0, 0, 1.1), major_r=0.212, minor_r=0.01, mat_idx=2)

def build_basketball_hoop(bm):
    # Official height rim at 3.05m
    add_cylinder(bm, (0, 0.8, 0), (0, 0.8, 3.4), radius=0.08, segments=8, mat_idx=1)
    add_cylinder(bm, (0, 0.8, 3.2), (0, 0.1, 3.2), radius=0.06, segments=6, mat_idx=1) # arm
    add_box(bm, (0, 0.05, 3.3), (1.8, 0.05, 1.05), mat_idx=0) # backboard
    add_box(bm, (0, 0.02, 3.2), (0.6, 0.02, 0.45), mat_idx=1) # inner square
    # Orange rim
    add_torus(bm, (0, -0.3, 3.05), major_r=0.23, minor_r=0.015, axis='Z', mat_idx=2)
    # Net
    add_cone(bm, (0, -0.3, 3.05), (0, -0.3, 2.65), r1=0.23, r2=0.12, segments=8, mat_idx=0)

def build_soccer_goal(bm):
    # 3m wide x 2m high x 1m deep
    add_cylinder(bm, (-1.5, 0, 0), (-1.5, 0, 2.0), radius=0.04, segments=8, mat_idx=0)
    add_cylinder(bm, (1.5, 0, 0), (1.5, 0, 2.0), radius=0.04, segments=8, mat_idx=0)
    add_cylinder(bm, (-1.5, 0, 2.0), (1.5, 0, 2.0), radius=0.04, segments=8, mat_idx=0)
    # Back frame
    add_cylinder(bm, (-1.5, 1.0, 0), (1.5, 1.0, 0), radius=0.03, segments=6, mat_idx=1)
    add_cylinder(bm, (-1.5, 0, 2.0), (-1.5, 1.0, 0), radius=0.025, segments=6, mat_idx=1)
    add_cylinder(bm, (1.5, 0, 2.0), (1.5, 1.0, 0), radius=0.025, segments=6, mat_idx=1)
    add_box(bm, (-1.5, 0, 2.0), (0.1, 0.1, 0.1), mat_idx=2)
    add_box(bm, (1.5, 0, 2.0), (0.1, 0.1, 0.1), mat_idx=2)

def build_weight_dumbbell(bm):
    add_cylinder(bm, (0, -0.12, 0.08), (0, 0.12, 0.08), radius=0.015, segments=8, mat_idx=0) # bar
    add_cylinder(bm, (0, -0.16, 0.08), (0, -0.22, 0.08), radius=0.075, segments=6, mat_idx=1) # hex weight 1
    add_cylinder(bm, (0, 0.16, 0.08), (0, 0.22, 0.08), radius=0.075, segments=6, mat_idx=1) # hex weight 2
    add_torus(bm, (0, -0.12, 0.08), major_r=0.02, minor_r=0.005, axis='Y', mat_idx=2)
    add_torus(bm, (0, 0.12, 0.08), major_r=0.02, minor_r=0.005, axis='Y', mat_idx=2)

# ==============================================================================
# SCI-FI BUILDERS (16 items)
# ==============================================================================

def build_sci_fi_rifle(bm):
    # Futuristic energy rifle, grip at (0,0,0), barrel -Y
    add_box(bm, (0, 0.04, -0.06), (0.035, 0.06, 0.14), rot=(0.28, 0, 0), mat_idx=1)
    add_box(bm, (0, -0.1, 0.04), (0.045, 0.38, 0.09), mat_idx=0)
    add_box(bm, (0, 0.18, 0.02), (0.04, 0.22, 0.11), mat_idx=1)
    # Energy heat sinks
    for i in range(4):
        # Keep each orange sink 1 mm above the receiver top face.
        add_box(bm, (0, -0.02 - i*0.06, 0.101), (0.055, 0.025, 0.03), mat_idx=2)
    # Twin emitter prongs
    add_cylinder(bm, (-0.02, -0.3, 0.04), (-0.02, -0.58, 0.04), radius=0.01, segments=6, mat_idx=1)
    add_cylinder(bm, (0.02, -0.3, 0.04), (0.02, -0.58, 0.04), radius=0.01, segments=6, mat_idx=1)
    # Start the orange emitter 5 mm beyond the prong ends.
    add_cylinder(bm, (0, -0.585, 0.04), (0, -0.625, 0.04), radius=0.016, segments=8, mat_idx=2)

def build_plasma_pistol(bm):
    add_box(bm, (0, 0.03, -0.05), (0.03, 0.05, 0.12), rot=(0.3, 0, 0), mat_idx=1)
    add_box(bm, (0, -0.07, 0.03), (0.04, 0.2, 0.07), mat_idx=0)
    # Flared emitter rings
    for y in [-0.1, -0.15, -0.2]:
        add_torus(bm, (0, y, 0.03), major_r=0.028, minor_r=0.005, axis='Y', mat_idx=2)
    add_cylinder(bm, (0, -0.2, 0.03), (0, -0.25, 0.03), radius=0.018, segments=8, mat_idx=1)

def build_laser_cannon(bm):
    # Heavy shoulder cannon
    add_cylinder(bm, (0, 0.2, 0.0), (0, -0.6, 0.0), radius=0.08, segments=10, mat_idx=0)
    add_cylinder(bm, (0, -0.6, 0.0), (0, -0.75, 0.0), radius=0.1, segments=8, mat_idx=1) # muzzle
    add_box(bm, (0, 0.1, 0.14), (0.12, 0.35, 0.12), mat_idx=1) # power pack
    add_torus(bm, (0, -0.1, 0.0), major_r=0.09, minor_r=0.012, axis='Y', mat_idx=2)
    add_torus(bm, (0, -0.3, 0.0), major_r=0.09, minor_r=0.012, axis='Y', mat_idx=2)
    add_cylinder(bm, (0, -0.05, -0.14), (0, -0.05, -0.02), radius=0.018, segments=6, mat_idx=1) # handle

def build_energy_sword(bm):
    # Grip at (0,0,0)
    add_cylinder(bm, (0, 0, -0.12), (0, 0, 0.12), radius=0.018, segments=8, mat_idx=1)
    add_cylinder(bm, (0, 0, 0.12), (0, 0, 0.16), radius=0.035, segments=8, mat_idx=0) # emitter guard
    # Twin plasma blades
    add_box(bm, (-0.02, 0, 0.55), (0.015, 0.006, 0.75), mat_idx=2)
    add_box(bm, (0.02, 0, 0.55), (0.015, 0.006, 0.75), mat_idx=2)
    add_cone(bm, (0, 0, 0.92), (0, 0, 1.05), r1=0.035, r2=0.002, segments=4, mat_idx=0)

def build_cryo_capsule(bm):
    # Stasis pod: 1.2m x 1.2m x 2.4m
    add_cylinder(bm, (0, 0, 0), (0, 0, 0.15), radius=0.6, segments=10, mat_idx=1)
    add_cylinder(bm, (0, 0, 0.15), (0, 0, 2.2), radius=0.55, segments=10, mat_idx=0)
    add_cylinder(bm, (0, -0.11, 0.5), (0, -0.11, 1.8), radius=0.45, segments=10, mat_idx=1) # glass window
    add_cone(bm, (0, 0, 2.2), (0, 0, 2.4), r1=0.55, r2=0.3, segments=10, mat_idx=1)
    add_box(bm, (0, -0.56, 1.2), (0.2, 0.04, 0.3), mat_idx=2) # control pad

def build_hologram_projector(bm):
    add_cylinder(bm, (0, 0, 0), (0, 0, 0.12), radius=0.7, segments=12, mat_idx=1)
    add_cylinder(bm, (0, 0, 0.12), (0, 0, 0.22), radius=0.55, segments=12, mat_idx=0)
    # Lift the orange lens ring 2 mm above the projector cap.
    add_torus(bm, (0, 0, 0.222), major_r=0.4, minor_r=0.02, mat_idx=2)
    for a in range(3):
        ang = a * 2 * math.pi / 3
        add_box(bm, (math.cos(ang)*0.55, math.sin(ang)*0.55, 0.25), (0.1, 0.1, 0.15), rot=(0, 0, ang), mat_idx=1)

def build_teleporter_pad(bm):
    # Octagonal 2m floor platform
    add_cylinder(bm, (0, 0, 0), (0, 0, 0.15), radius=1.0, segments=8, mat_idx=0)
    add_torus(bm, (0, 0, 0.15), major_r=0.88, minor_r=0.03, mat_idx=1)
    add_cylinder(bm, (0, 0, 0.15), (0, 0, 0.18), radius=0.75, segments=8, mat_idx=1)
    # Lift the orange ring 2 mm above the pad cap.
    add_torus(bm, (0, 0, 0.182), major_r=0.55, minor_r=0.02, mat_idx=2)

def build_power_core(bm):
    # 2.2m tall cylindrical fusion vessel
    add_cylinder(bm, (0, 0, 0), (0, 0, 0.25), radius=0.6, segments=10, mat_idx=1)
    add_cylinder(bm, (0, 0, 1.95), (0, 0, 2.2), radius=0.6, segments=10, mat_idx=1)
    add_cylinder(bm, (0, 0, 0.24), (0, 0, 1.96), radius=0.48, segments=10, mat_idx=0)
    # Energy containment rings
    for z in [0.65, 1.1, 1.55]:
        # Keep each orange ring outside the 480 mm core skin.
        add_torus(bm, (0, 0, z), major_r=0.53, minor_r=0.04, mat_idx=2)
    # 3 vertical conduits
    for a in range(3):
        ang = a * 2 * math.pi / 3
        add_cylinder(bm, (math.cos(ang)*0.54, math.sin(ang)*0.54, 0.22), (math.cos(ang)*0.54, math.sin(ang)*0.54, 1.98), radius=0.035, segments=6, mat_idx=1)

def build_server_rack_futuristic(bm):
    # Tall 2.2m sci-fi compute cabinet
    add_box(bm, (0, 0, 1.1), (0.9, 0.8, 2.2), mat_idx=1)
    add_box(bm, (0, -0.38, 1.1), (0.76, 0.05, 2.0), mat_idx=0)
    for b in range(6):
        bz = 0.3 + b * 0.3
        add_box(bm, (0, -0.41, bz), (0.7, 0.02, 0.04), mat_idx=1)
        add_box(bm, (0.28, -0.42, bz), (0.05, 0.01, 0.02), mat_idx=2)

def build_drone_scout(bm):
    # Centered at (0,0,0.4)
    add_sphere(bm, (0, 0, 0.4), radius=0.2, segments=10, ring_count=6, mat_idx=0)
    add_sphere(bm, (0, -0.18, 0.4), radius=0.07, segments=8, ring_count=5, mat_idx=2) # eye
    # 4 arms
    for a in [0.785, 2.356, 3.927, 5.498]:
        ax = math.cos(a) * 0.4
        ay = math.sin(a) * 0.4
        add_cylinder(bm, (0, 0, 0.4), (ax, ay, 0.4), radius=0.02, segments=6, mat_idx=1)
        add_torus(bm, (ax, ay, 0.4), major_r=0.12, minor_r=0.015, mat_idx=1)
        add_cylinder(bm, (ax, ay, 0.4), (ax, ay, 0.44), radius=0.025, segments=6, mat_idx=0)

def build_shield_generator(bm):
    # Tripod base with emitter sphere
    for a in range(3):
        ang = a * 2 * math.pi / 3
        add_cylinder(bm, (0, 0, 0.6), (math.cos(ang)*0.6, math.sin(ang)*0.6, 0), radius=0.035, segments=6, mat_idx=1)
    add_cylinder(bm, (0, 0, 0.6), (0, 0, 1.1), radius=0.1, segments=8, mat_idx=1)
    add_sphere(bm, (0, 0, 1.25), radius=0.25, segments=10, ring_count=6, mat_idx=0)
    add_torus(bm, (0, 0, 1.25), major_r=0.32, minor_r=0.02, axis='X', mat_idx=2)

def build_terminal_console(bm):
    # Angled workstation: 1.1m wide, 0.8m deep, 1.2m high
    add_box(bm, (0, 0, 0.45), (1.0, 0.7, 0.9), mat_idx=1)
    add_box(bm, (0, -0.05, 0.95), (0.9, 0.55, 0.12), rot=(0.3, 0, 0), mat_idx=0) # keyboard desk
    add_box(bm, (0, 0.2, 1.2), (0.85, 0.06, 0.45), rot=(-0.15, 0, 0), mat_idx=1) # screen frame
    add_box(bm, (0, 0.17, 1.2), (0.75, 0.01, 0.35), rot=(-0.15, 0, 0), mat_idx=0) # screen
    add_box(bm, (0, 0.165, 1.05), (0.25, 0.01, 0.03), rot=(-0.15, 0, 0), mat_idx=2)

def build_energy_cell(bm):
    # Hexagonal battery canister: 0.3m x 0.3m x 0.6m
    add_cylinder(bm, (0, 0, 0), (0, 0, 0.08), radius=0.16, segments=6, mat_idx=1)
    add_cylinder(bm, (0, 0, 0.52), (0, 0, 0.6), radius=0.16, segments=6, mat_idx=1)
    add_cylinder(bm, (0, 0, 0.08), (0, 0, 0.52), radius=0.14, segments=6, mat_idx=0)
    for a in range(3):
        ang = a * 2 * math.pi / 3
        add_box(bm, (math.cos(ang)*0.145, math.sin(ang)*0.145, 0.3), (0.02, 0.04, 0.32), rot=(0, 0, ang), mat_idx=2)
    add_torus(bm, (0, 0, 0.64), major_r=0.06, minor_r=0.012, axis='X', mat_idx=1) # handle

def build_gravity_lift(bm):
    # Circular 1.6m floor lift pad
    add_cylinder(bm, (0, 0, 0), (0, 0, 0.14), radius=0.8, segments=12, mat_idx=1)
    add_cylinder(bm, (0, 0, 0.14), (0, 0, 0.18), radius=0.68, segments=12, mat_idx=0)
    # Lift the orange ring 2 mm above the lift plate cap.
    add_torus(bm, (0, 0, 0.182), major_r=0.5, minor_r=0.025, mat_idx=2)
    for a in range(4):
        ang = a * math.pi / 2
        add_box(bm, (math.cos(ang)*0.72, math.sin(ang)*0.72, 0.25), (0.08, 0.08, 0.25), mat_idx=1)

def build_turret_automated(bm):
    # Automated base & dual cannon
    add_cylinder(bm, (0, 0, 0), (0, 0, 0.25), radius=0.5, segments=10, mat_idx=1)
    add_cylinder(bm, (0, 0, 0.25), (0, 0, 0.45), radius=0.38, segments=8, mat_idx=0)
    add_box(bm, (0, 0, 0.65), (0.45, 0.4, 0.3), mat_idx=0) # turret head
    # Twin cannons forward -Y
    add_cylinder(bm, (-0.12, 0, 0.65), (-0.12, -0.6, 0.65), radius=0.025, segments=6, mat_idx=1)
    add_cylinder(bm, (0.12, 0, 0.65), (0.12, -0.6, 0.65), radius=0.025, segments=6, mat_idx=1)
    add_sphere(bm, (0, -0.21, 0.65), radius=0.06, segments=6, ring_count=4, mat_idx=2) # sensor

def build_warp_beacon(bm):
    # Tall 4m navigation beacon
    add_cylinder(bm, (0, 0, 0), (0, 0, 0.3), radius=0.45, segments=8, mat_idx=1)
    add_cylinder(bm, (0, 0, 0.3), (0, 0, 3.5), radius=0.1, segments=8, mat_idx=0)
    # 3 fins
    for a in range(3):
        ang = a * 2 * math.pi / 3
        add_box(bm, (math.cos(ang)*0.25, math.sin(ang)*0.25, 1.2), (0.04, 0.35, 1.8), rot=(0, 0, ang), mat_idx=1)
    # Apex energy emitter
    add_sphere(bm, (0, 0, 3.65), radius=0.2, segments=8, ring_count=6, mat_idx=2)
    add_torus(bm, (0, 0, 3.65), major_r=0.28, minor_r=0.02, mat_idx=1)

# ==============================================================================
# INDUSTRIAL BUILDERS - PART 1: ARCHITECTURE, SLABS & NAVIGATION
# ==============================================================================

def build_floor_slab(bm):
    # Standard 4x4m modular floor slab, height 0.2m.
    add_box(bm, (0, 0, 0.1025), (4.0, 4.0, 0.205), mat_idx=0)

def build_wrench(bm):
    # Compact 0.42m maintenance wrench with an open jaw.
    add_cylinder(bm, (0, 0, -0.18), (0, 0, 0.13), radius=0.028, segments=8, mat_idx=MAT_CHARCOAL)
    add_box(bm, (0, 0, 0.14), (0.08, 0.06, 0.06), mat_idx=MAT_CHARCOAL)
    add_box(bm, (-0.03, 0, 0.19), (0.035, 0.06, 0.09), rot=(0, -0.30, 0), mat_idx=MAT_CHARCOAL)
    add_box(bm, (0.03, 0, 0.19), (0.035, 0.06, 0.09), rot=(0, 0.30, 0), mat_idx=MAT_CHARCOAL)

def build_floor_slab_grate(bm):
    add_box(bm, (0, 0, 0.1), (4.0, 4.0, 0.2), mat_idx=0)
    # Lift the grate clear of the slab top. Keep its exported top at 0.228m.
    add_grate(bm, (0, 0, 0.22), size_x=2.8, size_y=2.8, thickness=0.016, bars=8, mat_idx=MAT_STRUCTURAL_GRAY)

def build_floor_slab_hazard(bm):
    add_box(bm, (0, 0, 0.1), (4.0, 4.0, 0.2), mat_idx=0)
    # Hazard perimeter stripes safely raised above slab top
    add_box(bm, (0, -1.9, 0.207), (3.9, 0.18, 0.012), mat_idx=2)
    add_box(bm, (0, 1.9, 0.207), (3.9, 0.18, 0.012), mat_idx=2)
    add_box(bm, (-1.9, 0, 0.207), (0.18, 3.5, 0.012), mat_idx=MAT_STRUCTURAL_GRAY)
    add_box(bm, (1.9, 0, 0.207), (0.18, 3.5, 0.012), mat_idx=MAT_STRUCTURAL_GRAY)

def build_floor_slab_2x2(bm):
    # Modular 2x2m floor slab, height 0.2m.
    add_box(bm, (0, 0, 0.1025), (2.0, 2.0, 0.205), mat_idx=0)

def build_grate_floor_square(bm):
    add_box(bm, (0, 0, 0.02), (2.0, 2.0, 0.04), mat_idx=0)
    add_grate(bm, (0, 0, 0.06), 1.86, 1.86, thickness=0.04, bars=7, mat_idx=MAT_STRUCTURAL_GRAY)

def build_grate_trench(bm):
    add_box(bm, (0, 0, 0.05), (4.0, 0.5, 0.1), mat_idx=MAT_STRUCTURAL_GRAY)
    for i in range(16):
        tx = -1.8 + i * 0.24
        add_box(bm, (tx, 0, 0.06), (0.04, 0.42, 0.02), mat_idx=0)

def build_grate_drain(bm):
    add_cylinder(bm, (0, 0, 0), (0, 0, 0.08), radius=0.5, segments=12, mat_idx=MAT_STRUCTURAL_GRAY)
    add_torus(bm, (0, 0, 0.08), major_r=0.35, minor_r=0.02, mat_idx=0)
    add_cylinder(bm, (0, 0, 0.075), (0, 0, 0.085), radius=0.1, segments=8, mat_idx=2)

def build_road_tile_straight(bm):
    add_box(bm, (0, 0, 0.05), (4.0, 4.0, 0.1), mat_idx=0)
    for y in [-1.0, 1.0]:
        add_box(bm, (0, y, 0.107), (0.2, 1.0, 0.012), mat_idx=MAT_STRUCTURAL_GRAY)

def build_road_tile_junction(bm):
    add_box(bm, (0, 0, 0.05), (4.0, 4.0, 0.1), mat_idx=0)
    add_box(bm, (0, 0, 0.107), (0.25, 3.8, 0.012), mat_idx=MAT_STRUCTURAL_GRAY)
    add_box(bm, (0, 0, 0.107), (3.8, 0.25, 0.012), mat_idx=MAT_STRUCTURAL_GRAY)

def build_loading_dock_edge(bm):
    # Concrete dock edge: 4m x 1m x 1.2m
    add_box(bm, (0, 0, 0.6), (4.0, 1.0, 1.2), mat_idx=0)
    add_box(bm, (0, -0.45, 1.207), (3.96, 0.1, 0.012), mat_idx=2) # curb stripe safely raised
    for x in [-1.2, 1.2]:
        add_box(bm, (x, -0.55, 0.7), (0.25, 0.15, 0.6), mat_idx=1) # rubber truck bumpers

def build_hazard_floor_stripes(bm):
    add_box(bm, (0, 0, 0.01), (4.0, 0.5, 0.02), mat_idx=1)
    for i in range(8):
        sx = -1.75 + i * 0.5
        add_box(bm, (sx, 0, 0.022), (0.22, 0.46, 0.005), rot=(0, 0, 0.5), mat_idx=2)

def build_warning_decal_plate(bm):
    add_box(bm, (0, 0, 0.01), (0.8, 0.6, 0.02), mat_idx=0)
    add_cone(bm, (0, 0, 0.0205), (0, 0, 0.0255), r1=0.22, r2=0.0, segments=3, mat_idx=2)

def build_wall_panel(bm):
    # Standard 4x4m modular warehouse wall
    add_box(bm, (0, 0, 2.0), (4.0, 0.2, 4.0), mat_idx=0)
    # Pilaster ribs (height 3.96 so wall top at 4.0m and bottom at 0.0m remain clean and flat)
    for x in [-1.8, 0.0, 1.8]:
        add_box(bm, (x, -0.12, 1.99), (0.25, 0.08, 3.96), mat_idx=1)
    add_box(bm, (0, -0.11, 0.082), (3.96, 0.06, 0.16), mat_idx=1)

def build_wall_panel_window(bm):
    add_box(bm, (0, 0, 2.0), (4.0, 0.2, 4.0), mat_idx=0)
    # Window cutout & frame
    add_box(bm, (0, 0, 2.2), (2.1, 0.26, 2.1), mat_idx=1)
    add_box(bm, (0, 0, 2.2), (1.9, 0.04, 1.9), mat_idx=0) # glass
    add_box(bm, (0, 0, 2.2), (0.04, 0.28, 1.88), mat_idx=1)
    add_box(bm, (0, 0, 2.2), (1.88, 0.28, 0.04), mat_idx=1)

def build_wall_panel_door(bm):
    add_box(bm, (0, 0, 2.0), (4.0, 0.2, 4.0), mat_idx=0)
    add_box(bm, (0, 0, 1.255), (1.4, 0.26, 2.49), mat_idx=1) # door frame
    add_box(bm, (0, 0, 1.21), (1.2, 0.08, 2.38), mat_idx=0) # door leaf
    add_box(bm, (0.5, -0.065, 1.1), (0.05, 0.09, 0.04), mat_idx=2) # handle

def build_wall_panel_corrugated(bm):
    add_box(bm, (0, 0, 2.0), (4.0, 0.15, 4.0), mat_idx=1)
    for i in range(12):
        cx = -1.8 + i * 0.32
        add_cylinder(bm, (cx, -0.1, 0.04), (cx, -0.1, 3.96), radius=0.08, segments=6, mat_idx=0)

def build_wall_panel_reinforced(bm):
    add_box(bm, (0, 0, 2.0), (4.0, 0.2, 4.0), mat_idx=0)
    # Steel X-bracing on front
    add_i_beam(bm, (-1.8, -0.15, 0.2), (1.8, -0.15, 3.8), width=0.15, depth=0.15, mat_idx=1)
    add_i_beam(bm, (-1.8, -0.15, 3.8), (1.8, -0.15, 0.2), width=0.15, depth=0.15, mat_idx=1)
    add_box(bm, (0, -0.16, 2.0), (0.35, 0.05, 0.35), mat_idx=2) # gusset plate

def build_wall_corner_inner(bm):
    # Inside 90-deg corner
    add_box(bm, (-1.0, 0.9, 2.0), (2.0, 0.2, 4.0), mat_idx=0)
    add_box(bm, (0.9, -1.0, 2.0), (0.2, 2.0, 4.0), mat_idx=0)
    add_i_beam(bm, (0, 0, 0), (0, 0, 4.0), width=0.25, depth=0.25, mat_idx=1)

def build_wall_corner_outer(bm):
    add_box(bm, (-1.0, -0.9, 2.0), (2.0, 0.2, 4.0), mat_idx=0)
    add_box(bm, (-0.9, -1.0, 2.0), (0.2, 2.0, 4.0), mat_idx=0)
    add_cylinder(bm, (0, 0, 0), (0, 0, 4.0), radius=0.15, segments=8, mat_idx=1)
    add_box(bm, (0, 0, 2.0), (0.08, 0.08, 3.96), mat_idx=2)

def build_wall_pillar(bm):
    # Structural I-beam column: 4m tall
    add_box(bm, (0, 0, 0.02), (0.6, 0.6, 0.04), mat_idx=1) # baseplate
    add_i_beam(bm, (0, 0, 0.04), (0, 0, 3.96), width=0.35, depth=0.35, flange_t=0.03, web_t=0.03, mat_idx=1)
    add_box(bm, (0, 0, 3.98), (0.6, 0.6, 0.04), mat_idx=1) # top plate
    add_box(bm, (0, 0, 2.0), (0.38, 0.02, 0.1), mat_idx=2)

def build_window_industrial_frame(bm):
    add_box(bm, (0, 0, 1.0), (2.0, 0.1, 2.0), mat_idx=1)
    add_box(bm, (0, 0, 1.0), (1.8, 0.02, 1.8), mat_idx=0)
    for x in [-0.45, 0.45]:
        add_box(bm, (x, 0, 1.0), (0.04, 0.12, 1.82), mat_idx=1)
    for z in [0.55, 1.45]:
        add_box(bm, (0, 0, z), (1.82, 0.12, 0.04), mat_idx=1)

def build_window_security_bars(bm):
    add_box(bm, (0, 0, 0.75), (2.0, 0.1, 1.5), mat_idx=1)
    for x in range(7):
        bx = -0.75 + x * 0.25
        add_cylinder(bm, (bx, 0, 0.1), (bx, 0, 1.4), radius=0.018, segments=6, mat_idx=0)
    add_cylinder(bm, (-0.85, 0, 0.75), (0.85, 0, 0.75), radius=0.02, segments=6, mat_idx=2)

def build_door_frame_steel(bm):
    add_box(bm, (-0.6, 0, 1.2), (0.1, 0.18, 2.4), mat_idx=1)
    add_box(bm, (0.6, 0, 1.2), (0.1, 0.18, 2.4), mat_idx=1)
    add_box(bm, (0, 0, 2.35), (1.3, 0.18, 0.1), mat_idx=1)

def build_door_frame_roll(bm):
    add_box(bm, (-1.9, 0, 1.75), (0.15, 0.2, 3.5), mat_idx=1)
    add_box(bm, (1.9, 0, 1.75), (0.15, 0.2, 3.5), mat_idx=1)
    add_cylinder(bm, (-2.0, 0, 3.65), (2.0, 0, 3.65), radius=0.35, segments=10, mat_idx=0)
    # Keep the orange collar outside the 350 mm roller cylinder.
    add_torus(bm, (0, 0, 3.65), major_r=0.372, minor_r=0.02, axis='X', mat_idx=2)

def build_door_steel(bm):
    add_box(bm, (0, 0, 1.1), (1.0, 0.06, 2.2), mat_idx=0)
    add_box(bm, (0, 0, 1.1), (1.04, 0.08, 0.08), mat_idx=1)
    add_cylinder(bm, (-0.45, 0.05, 1.05), (-0.35, 0.05, 1.05), radius=0.015, segments=6, mat_idx=2)

def build_door_roll_up(bm):
    add_box(bm, (0, 0, 1.6), (3.8, 0.06, 3.2), mat_idx=0)
    for z in [0.8, 1.6, 2.4]:
        add_box(bm, (0, 0, z), (3.82, 0.08, 0.04), mat_idx=1)
    add_box(bm, (0, 0.04, 0.2), (0.4, 0.04, 0.06), mat_idx=2) # handle

def build_door_security(bm):
    add_box(bm, (0, 0, 1.1), (1.4, 0.12, 2.2), mat_idx=0)
    add_box(bm, (0, 0, 1.1), (1.44, 0.14, 2.24), mat_idx=1)
    add_torus(bm, (0, 0.08, 1.1), major_r=0.22, minor_r=0.02, axis='Y', mat_idx=2) # wheel lock
    for a in range(4):
        ang = a * math.pi / 2
        add_cylinder(bm, (0, 0.08, 1.1), (math.cos(ang)*0.22, 0.08, 1.1 + math.sin(ang)*0.22), radius=0.015, segments=6, mat_idx=1)

def build_warehouse(bm):
    # Full 8x8x6m building shell
    add_box(bm, (0, 0, 2.5), (8.0, 8.0, 5.0), mat_idx=0)
    add_wedge(bm, (-4.0, -4.0, 5.0), (0.0, 4.0, 6.2), slope_dir='+X', mat_idx=MAT_STRUCTURAL_GRAY)
    add_wedge(bm, (0.0, -4.0, 6.2), (4.0, 4.0, 5.0), slope_dir='+X', mat_idx=MAT_STRUCTURAL_GRAY)
    # Bay door opening
    add_box(bm, (0, -4.01, 1.81), (3.6, 0.1, 3.6), mat_idx=MAT_STRUCTURAL_GRAY)
    add_box(bm, (0, -4.05, 3.7), (3.8, 0.05, 0.15), mat_idx=2)

def build_warehouse_roof(bm):
    # Pitched roof module: 8x8m
    add_wedge(bm, (-4.0, -4.0, 0.0), (0.0, 4.0, 1.4), slope_dir='+X', mat_idx=0)
    add_wedge(bm, (0.0, -4.0, 1.4), (4.0, 4.0, 0.0), slope_dir='+X', mat_idx=0)
    add_box(bm, (0, 0, 1.42), (0.25, 8.04, 0.1), mat_idx=MAT_STRUCTURAL_GRAY) # ridge cap
    add_box(bm, (0, -4.03, 1.42), (0.3, 0.1, 0.15), mat_idx=2)

def build_roof_flat_parapet(bm):
    add_box(bm, (0, 0, 0.1), (4.0, 4.0, 0.2), mat_idx=0)
    # Perimeter parapet: 0.6m high sitting on top of slab (z=0.20 to 0.80)
    add_box(bm, (0, -1.9, 0.5), (4.0, 0.2, 0.6), mat_idx=MAT_STRUCTURAL_GRAY)
    add_box(bm, (0, 1.9, 0.5), (4.0, 0.2, 0.6), mat_idx=MAT_STRUCTURAL_GRAY)
    add_box(bm, (-1.9, 0, 0.5), (0.2, 3.6, 0.6), mat_idx=MAT_STRUCTURAL_GRAY)
    add_box(bm, (1.9, 0, 0.5), (0.2, 3.6, 0.6), mat_idx=MAT_STRUCTURAL_GRAY)
    add_box(bm, (0, -1.9, 0.825), (4.05, 0.22, 0.04), mat_idx=2)

def build_roof_skylight(bm):
    add_box(bm, (0, 0, 0.1), (4.0, 4.0, 0.2), mat_idx=0)
    add_box(bm, (0, 0, 0.4), (2.2, 2.2, 0.4), mat_idx=MAT_STRUCTURAL_GRAY)
    add_wedge(bm, (-1.0, -1.0, 0.6), (0.0, 1.0, 1.1), slope_dir='+X', mat_idx=0)
    add_wedge(bm, (0.0, -1.0, 1.1), (1.0, 1.0, 0.6), slope_dir='+X', mat_idx=0)
    add_box(bm, (0, 0, 1.12), (0.1, 2.05, 0.05), mat_idx=2)

def build_roof_truss(bm):
    # Steel Pratt truss: 8m span, 1.8m high
    p_bot_l = (-4.0, 0, 0.1)
    p_bot_r = (4.0, 0, 0.1)
    p_top = (0.0, 0, 1.8)
    add_i_beam(bm, p_bot_l, p_bot_r, width=0.15, depth=0.15, mat_idx=MAT_STRUCTURAL_GRAY)
    add_i_beam(bm, p_bot_l, p_top, width=0.15, depth=0.15, mat_idx=MAT_STRUCTURAL_GRAY)
    add_i_beam(bm, p_top, p_bot_r, width=0.15, depth=0.15, mat_idx=MAT_STRUCTURAL_GRAY)
    add_i_beam(bm, (0, 0, 0.1), p_top, width=0.12, depth=0.12, web_t=0.016, mat_idx=0)
    add_box(bm, (0, 0, 1.8), (0.35, 0.2, 0.35), mat_idx=2)

def build_warehouse_bay(bm):
    # Open loading bay frame: 8x8m
    for x in [-3.8, 3.8]:
        for y in [-3.8, 3.8]:
            add_i_beam(bm, (x, y, 0), (x, y, 5.0), width=0.3, depth=0.3, mat_idx=MAT_STRUCTURAL_GRAY)
    add_i_beam(bm, (-3.8, 0, 5.0), (3.8, 0, 5.0), width=0.3, depth=0.3, mat_idx=MAT_STRUCTURAL_GRAY)
    add_box(bm, (0, 0, 5.0), (0.6, 0.6, 0.4), mat_idx=2)

def build_warehouse_office(bm):
    # Prefab office booth: 4x4x2.8m
    add_box(bm, (0, 0, 1.4), (4.0, 4.0, 2.8), mat_idx=0)
    add_box(bm, (0, 0, 2.85), (4.1, 4.1, 0.1), mat_idx=MAT_STRUCTURAL_GRAY)
    add_box(bm, (0, -2.01, 1.11), (1.1, 0.05, 2.2), mat_idx=MAT_STRUCTURAL_GRAY) # door
    add_box(bm, (1.2, -2.01, 1.4), (1.2, 0.05, 1.0), mat_idx=0) # window
    add_box(bm, (0, -2.02, 2.25), (1.2, 0.06, 0.1), mat_idx=2)

def build_ramp_low(bm):
    # Rising 1.0m over 4.0m
    add_wedge(bm, (-1.0, -2.0, 0), (1.0, 2.0, 1.0), slope_dir='+Y', mat_idx=0)
    # Side safety curbs
    add_box(bm, (-1.05, 0, 0.55), (0.1, 4.0, 0.2), rot=(-0.245, 0, 0), mat_idx=MAT_STRUCTURAL_GRAY)
    add_box(bm, (1.05, 0, 0.55), (0.1, 4.0, 0.2), rot=(-0.245, 0, 0), mat_idx=MAT_STRUCTURAL_GRAY)
    add_box(bm, (0, 2.0, 1.0), (2.24, 0.1, 0.05), mat_idx=2)

def build_ramp_high(bm):
    # Rising 2.0m over 4.0m
    add_wedge(bm, (-1.0, -2.0, 0), (1.0, 2.0, 2.0), slope_dir='+Y', mat_idx=0)
    add_railing(bm, (-1.0, -2.0, 0), (-1.0, 2.0, 2.0), height=1.0, mat_idx=MAT_STRUCTURAL_GRAY, posts=4)
    add_railing(bm, (1.0, -2.0, 0), (1.0, 2.0, 2.0), height=1.0, mat_idx=MAT_STRUCTURAL_GRAY, posts=4)
    add_box(bm, (0, 2.01, 2.0), (2.2, 0.1, 0.06), mat_idx=2)

def build_ramp_curved(bm):
    # 90-degree turning ramp
    add_wedge(bm, (-1.5, -1.5, 0), (1.5, 1.5, 1.0), slope_dir='+Y', mat_idx=0)
    add_box(bm, (0, 0, 0.5), (3.1, 3.1, 0.1), rot=(0, 0, 0.785), mat_idx=MAT_STRUCTURAL_GRAY)
    add_box(bm, (0, 1.5, 1.0), (3.04, 0.1, 0.06), mat_idx=2)

def build_stair_flight(bm):
    # 2.4m run, 1.2m wide, rising to 2.0m
    steps = 8
    for s in range(steps):
        sy = -1.2 + s * (2.4 / steps)
        sz = s * (2.0 / steps)
        add_box(bm, (0, sy + 0.15, sz + 0.12), (1.2, 2.4/steps, 0.06), mat_idx=0)
    # Side stringers
    add_box(bm, (-0.62, 0, 1.0), (0.05, 2.8, 0.2), rot=(-0.695, 0, 0), mat_idx=MAT_STRUCTURAL_GRAY)
    add_box(bm, (0.62, 0, 1.0), (0.05, 2.8, 0.2), rot=(-0.695, 0, 0), mat_idx=MAT_STRUCTURAL_GRAY)
    # Railings
    add_railing(bm, (-0.6, -1.2, 0.1), (-0.6, 1.2, 2.1), height=0.9, mat_idx=MAT_STRUCTURAL_GRAY, posts=3)
    add_railing(bm, (0.6, -1.2, 0.1), (0.6, 1.2, 2.1), height=0.9, mat_idx=MAT_STRUCTURAL_GRAY, posts=3)
    add_box(bm, (0, 1.2, 2.0), (1.3, 0.1, 0.06), mat_idx=2)

def build_stair_flight_spiral(bm):
    # Compact spiral stair: 2.0m dia, rising 3.0m
    add_cylinder(bm, (0, 0, 0), (0, 0, 3.2), radius=0.1, segments=8, mat_idx=MAT_STRUCTURAL_GRAY)
    steps = 10
    for s in range(steps):
        ang = s * (2 * math.pi * 0.75 / steps)
        sz = s * (3.0 / steps)
        add_box(bm, (math.cos(ang)*0.55, math.sin(ang)*0.55, sz + 0.04), (0.9, 0.28, 0.05), rot=(0, 0, ang), mat_idx=0)
    add_torus(bm, (0, 0, 3.0), major_r=1.0, minor_r=0.03, mat_idx=2)

def build_stair_steps_short(bm):
    # 4 short steps: 1.2m wide, rising 0.8m
    for s in range(4):
        sy = -0.45 + s * 0.3
        sz = s * 0.2
        add_box(bm, (0, sy + 0.15, sz + 0.1), (1.2, 0.3, 0.2), mat_idx=0)
    add_box(bm, (0, 0.45, 0.8), (1.24, 0.05, 0.05), mat_idx=2)

def build_platform_low(bm):
    # 4m x 4m elevated 1m
    for x in [-1.8, 1.8]:
        for y in [-1.8, 1.8]:
            add_cylinder(bm, (x, y, 0), (x, y, 0.95), radius=0.08, segments=8, mat_idx=MAT_STRUCTURAL_GRAY)
    add_box(bm, (0, 0, 0.95), (4.0, 4.0, 0.1), mat_idx=0)
    # Narrow perimeter charcoal trim safely raised above face
    add_box(bm, (-1.95, 0, 1.015), (0.06, 3.92, 0.02), mat_idx=MAT_STRUCTURAL_GRAY)
    add_box(bm, (1.95, 0, 1.015), (0.06, 3.92, 0.02), mat_idx=MAT_STRUCTURAL_GRAY)
    add_box(bm, (0, -1.95, 1.015), (3.80, 0.06, 0.02), mat_idx=MAT_STRUCTURAL_GRAY)
    add_box(bm, (0, 1.95, 1.015), (3.80, 0.06, 0.02), mat_idx=MAT_STRUCTURAL_GRAY)
    # Move the orange toe marker 1 mm beyond the deck end face.
    add_box(bm, (0, -2.021, 0.95), (3.8, 0.04, 0.08), mat_idx=2)

def build_platform_high(bm):
    # 4m x 4m elevated 2m
    for x in [-1.8, 1.8]:
        for y in [-1.8, 1.8]:
            add_i_beam(bm, (x, y, 0), (x, y, 1.95), width=0.2, depth=0.2, mat_idx=MAT_STRUCTURAL_GRAY)
    add_box(bm, (0, 0, 1.95), (4.0, 4.0, 0.1), mat_idx=0)
    # Narrow perimeter charcoal trim safely raised above face
    add_box(bm, (-1.95, 0, 2.015), (0.06, 3.92, 0.02), mat_idx=MAT_STRUCTURAL_GRAY)
    add_box(bm, (1.95, 0, 2.015), (0.06, 3.92, 0.02), mat_idx=MAT_STRUCTURAL_GRAY)
    add_box(bm, (0, -1.95, 2.015), (3.80, 0.06, 0.02), mat_idx=MAT_STRUCTURAL_GRAY)
    add_box(bm, (0, 1.95, 2.015), (3.80, 0.06, 0.02), mat_idx=MAT_STRUCTURAL_GRAY)
    # Move the orange toe marker 1 mm beyond the deck end face.
    add_box(bm, (0, -2.021, 1.95), (3.8, 0.04, 0.08), mat_idx=2)

def build_platform_grated(bm):
    # 2m x 4m grated platform
    for x in [-0.9, 0.9]:
        for y in [-1.8, 1.8]:
            add_cylinder(bm, (x, y, 0), (x, y, 0.95), radius=0.06, segments=6, mat_idx=MAT_STRUCTURAL_GRAY)
    # Keep the light deck under the raised grate so the walkable top reads cleanly.
    add_box(bm, (0, 0, 0.945), (2.0, 4.0, 0.09), mat_idx=0)
    add_grate(bm, (0, 0, 1.01), size_x=1.8, size_y=3.8, thickness=0.03, bars=8, mat_idx=MAT_STRUCTURAL_GRAY)
    # Raise the orange toe marker 5 mm above the deck top face.
    add_box(bm, (0, -2.01, 0.955), (1.9, 0.04, 0.08), mat_idx=2)

def build_platform_staging(bm):
    add_box(bm, (0, 0, 0.25), (2.0, 2.0, 0.5), mat_idx=0)
    add_box(bm, (0, 0, 0.49), (2.04, 2.04, 0.04), mat_idx=MAT_STRUCTURAL_GRAY)
    # Move the orange toe marker 1 mm beyond the body end face.
    add_box(bm, (0, -1.021, 0.45), (1.8, 0.04, 0.08), mat_idx=2)

def build_catwalk(bm):
    # 4m long x 1.2m wide, deck at 0.1m, rails 1.1m high
    add_box(bm, (0, 0, 0.04), (1.2, 4.0, 0.08), mat_idx=0)
    add_grate(bm, (0, 0, 0.095), size_x=1.06, size_y=3.9, thickness=0.03, bars=8, mat_idx=0)
    add_railing(bm, (-0.58, -2.0, 0.1), (-0.58, 2.0, 0.1), height=1.0, mat_idx=MAT_STRUCTURAL_GRAY, posts=4)
    add_railing(bm, (0.58, -2.0, 0.1), (0.58, 2.0, 0.1), height=1.0, mat_idx=MAT_STRUCTURAL_GRAY, posts=4)
    add_box(bm, (0, -2.01, 0.05), (1.22, 0.04, 0.08), mat_idx=2)

def build_catwalk_grate_long(bm):
    add_box(bm, (0, 0, 0.04), (1.2, 6.0, 0.08), mat_idx=0)
    add_grate(bm, (0, 0, 0.095), size_x=1.06, size_y=5.9, thickness=0.03, bars=12, mat_idx=0)
    add_railing(bm, (-0.58, -3.0, 0.1), (-0.58, 3.0, 0.1), height=1.0, mat_idx=MAT_STRUCTURAL_GRAY, posts=5)
    add_railing(bm, (0.58, -3.0, 0.1), (0.58, 3.0, 0.1), height=1.0, mat_idx=MAT_STRUCTURAL_GRAY, posts=5)
    add_box(bm, (0, -3.01, 0.05), (1.22, 0.04, 0.08), mat_idx=2)

def build_catwalk_bridge(bm):
    # 8m spanning bridge
    add_box(bm, (0, 0, 0.09), (1.5, 8.0, 0.18), mat_idx=0)
    add_grate(bm, (0, 0, 0.21), size_x=1.35, size_y=7.8, thickness=0.04, bars=16, mat_idx=0)
    add_railing(bm, (-0.72, -4.0, 0.2), (-0.72, 4.0, 0.2), height=1.2, mat_idx=MAT_STRUCTURAL_GRAY, posts=6)
    add_railing(bm, (0.72, -4.0, 0.2), (0.72, 4.0, 0.2), height=1.2, mat_idx=MAT_STRUCTURAL_GRAY, posts=6)
    add_box(bm, (0, -4.01, 0.1), (1.52, 0.04, 0.12), mat_idx=2)

def build_catwalk_intersection(bm):
    # 2x2m 4-way catwalk junction
    add_box(bm, (0, 0, 0.04), (2.0, 2.0, 0.08), mat_idx=0)
    add_grate(bm, (0, 0, 0.095), size_x=1.85, size_y=1.85, thickness=0.03, bars=6, mat_idx=0)
    for sx, sy in [(-0.95, -0.95), (-0.95, 0.95), (0.95, -0.95), (0.95, 0.95)]:
        add_cylinder(bm, (sx, sy, 0.1), (sx, sy, 1.1), radius=0.025, segments=6, mat_idx=MAT_STRUCTURAL_GRAY)
    add_box(bm, (0, 0, 0.085), (0.2, 0.2, 0.04), mat_idx=2)

def build_rail_straight(bm):
    # 2m straight safety handrail, height 1.0m
    add_railing(bm, (-1.0, 0, 0), (1.0, 0, 0), height=1.0, mat_idx=1, posts=3)
    add_box(bm, (0, 0, 1.005), (0.2, 0.065, 0.03), mat_idx=2)

def build_rail_corner(bm):
    # 1x1m 90-degree corner rail
    add_railing(bm, (0, 1.0, 0), (0, 0, 0), height=1.0, mat_idx=1, posts=2)
    add_railing(bm, (0, 0, 0), (1.0, 0, 0), height=1.0, mat_idx=1, posts=2)
    add_sphere(bm, (0, 0, 1.0), radius=0.04, segments=6, ring_count=4, mat_idx=2)

def build_rail_endcap(bm):
    add_railing(bm, (-0.8, 0, 0), (0.8, 0, 0), height=1.0, mat_idx=1, posts=2)
    add_cylinder(bm, (0.8, 0, 1.0), (0.95, 0, 0.8), radius=0.025, segments=6, mat_idx=1)
    add_cylinder(bm, (0.95, 0, 0.8), (0.8, 0, 0.5), radius=0.025, segments=6, mat_idx=1)
    add_torus(bm, (0.8, 0, 1.0), major_r=0.026, minor_r=0.005, mat_idx=2)

def build_rail_industrial_guard(bm):
    # Heavy double-tube safety-yellow/orange impact barrier
    for x in [-0.85, 0.85]:
        add_cylinder(bm, (x, 0, 0), (x, 0, 0.75), radius=0.05, segments=8, mat_idx=1)
        add_box(bm, (x, 0, 0.02), (0.22, 0.22, 0.04), mat_idx=1)
    add_cylinder(bm, (-1.0, 0, 0.7), (1.0, 0, 0.7), radius=0.045, segments=8, mat_idx=2)
    add_cylinder(bm, (-1.0, 0, 0.35), (1.0, 0, 0.35), radius=0.045, segments=8, mat_idx=2)

def build_ladder(bm):
    # 4m vertical wall ladder
    add_cylinder(bm, (-0.25, 0, 0), (-0.25, 0, 4.0), radius=0.025, segments=8, mat_idx=1)
    add_cylinder(bm, (0.25, 0, 0), (0.25, 0, 4.0), radius=0.025, segments=8, mat_idx=1)
    for r in range(12):
        rz = 0.3 + r * 0.32
        add_cylinder(bm, (-0.25, 0, rz), (0.25, 0, rz), radius=0.016, segments=6, mat_idx=0)
    add_box(bm, (0, 0, 3.9), (0.55, 0.03, 0.06), mat_idx=2)

def build_ladder_caged(bm):
    # 6m vertical ladder with safety cage hoops
    add_cylinder(bm, (-0.25, 0, 0), (-0.25, 0, 6.0), radius=0.025, segments=8, mat_idx=1)
    add_cylinder(bm, (0.25, 0, 0), (0.25, 0, 6.0), radius=0.025, segments=8, mat_idx=1)
    for r in range(18):
        rz = 0.3 + r * 0.3
        add_cylinder(bm, (-0.25, 0, rz), (0.25, 0, rz), radius=0.016, segments=6, mat_idx=0)
    # Hoops starting at 2.2m
    for h in range(8):
        hz = 2.2 + h * 0.5
        add_torus(bm, (0, -0.25, hz), major_r=0.45, minor_r=0.015, mat_idx=1)
    add_torus(bm, (0, -0.25, 5.7), major_r=0.45, minor_r=0.018, mat_idx=2)

def build_ladder_fire_escape(bm):
    add_cylinder(bm, (-0.22, 0, 0.5), (-0.22, 0, 3.8), radius=0.02, segments=6, mat_idx=1)
    add_cylinder(bm, (0.22, 0, 0.5), (0.22, 0, 3.8), radius=0.02, segments=6, mat_idx=1)
    for r in range(10):
        rz = 0.6 + r * 0.32
        add_cylinder(bm, (-0.22, 0, rz), (0.22, 0, rz), radius=0.014, segments=6, mat_idx=0)
    add_box(bm, (0.35, 0, 2.5), (0.15, 0.15, 0.35), mat_idx=2) # counterweight

# ==============================================================================
# INDUSTRIAL BUILDERS - PART 2: PIPES, TANKS, DUCTS & MACHINERY
# ==============================================================================

def build_pipe_straight(bm):
    # 4m straight fluid pipe along Y, dia 0.3m, flanges at ends
    add_cylinder(bm, (0, -1.95, 0.4), (0, 1.95, 0.4), radius=0.15, segments=10, mat_idx=0)
    add_cylinder(bm, (0, -2.0, 0.4), (0, -1.95, 0.4), radius=0.22, segments=10, mat_idx=1) # flange 1
    add_cylinder(bm, (0, 1.95, 0.4), (0, 2.0, 0.4), radius=0.22, segments=10, mat_idx=1) # flange 2
    # Keep the orange collar outside the 150 mm pipe skin.
    add_torus(bm, (0, 0, 0.4), major_r=0.162, minor_r=0.01, axis='Y', mat_idx=2)

def build_pipe_short(bm):
    add_cylinder(bm, (0, -0.45, 0.4), (0, 0.45, 0.4), radius=0.15, segments=10, mat_idx=0)
    add_cylinder(bm, (0, -0.5, 0.4), (0, -0.45, 0.4), radius=0.22, segments=10, mat_idx=1)
    add_cylinder(bm, (0, 0.45, 0.4), (0, 0.5, 0.4), radius=0.22, segments=10, mat_idx=1)
    # Keep the orange collar outside the 150 mm pipe skin.
    add_torus(bm, (0, 0, 0.4), major_r=0.162, minor_r=0.01, axis='Y', mat_idx=2)

def build_pipe_long(bm):
    # 8m main distribution pipe
    add_cylinder(bm, (0, -3.95, 0.4), (0, 3.95, 0.4), radius=0.15, segments=10, mat_idx=0)
    add_cylinder(bm, (0, -4.0, 0.4), (0, -3.95, 0.4), radius=0.22, segments=10, mat_idx=1)
    add_cylinder(bm, (0, 3.95, 0.4), (0, 4.0, 0.4), radius=0.22, segments=10, mat_idx=1)
    for y in [-1.5, 1.5]:
        add_cylinder(bm, (0, y - 0.03, 0.4), (0, y + 0.03, 0.4), radius=0.19, segments=8, mat_idx=1)
    # Keep the orange collar outside the 150 mm pipe skin.
    add_torus(bm, (0, 0, 0.4), major_r=0.164, minor_r=0.012, axis='Y', mat_idx=2)

def build_pipe_elbow(bm):
    # 90-deg flanged elbow: 1x1m
    add_cylinder(bm, (0, -0.95, 0.4), (0, 0, 0.4), radius=0.15, segments=10, mat_idx=0)
    add_cylinder(bm, (0, 0, 0.4), (0.95, 0, 0.4), radius=0.15, segments=10, mat_idx=0)
    add_sphere(bm, (0, 0, 0.4), radius=0.16, segments=8, ring_count=6, mat_idx=0)
    add_cylinder(bm, (0, -1.0, 0.4), (0, -0.95, 0.4), radius=0.22, segments=10, mat_idx=1)
    add_cylinder(bm, (0.95, 0, 0.4), (1.0, 0, 0.4), radius=0.22, segments=10, mat_idx=1)
    # Keep the orange collar outside the 160 mm elbow hub.
    add_torus(bm, (0, 0, 0.4), major_r=0.172, minor_r=0.01, axis='Z', mat_idx=2)

def build_pipe_tee(bm):
    # 3-way flanged tee
    add_cylinder(bm, (0, -0.95, 0.4), (0, 0.95, 0.4), radius=0.15, segments=10, mat_idx=0)
    add_cylinder(bm, (0, 0, 0.4), (0.95, 0, 0.4), radius=0.15, segments=10, mat_idx=0)
    add_sphere(bm, (0, 0, 0.4), radius=0.16, segments=8, ring_count=6, mat_idx=0)
    add_cylinder(bm, (0, -1.0, 0.4), (0, -0.95, 0.4), radius=0.22, segments=10, mat_idx=1)
    add_cylinder(bm, (0, 0.95, 0.4), (0, 1.0, 0.4), radius=0.22, segments=10, mat_idx=1)
    add_cylinder(bm, (0.95, 0, 0.4), (1.0, 0, 0.4), radius=0.22, segments=10, mat_idx=1)
    # Keep the orange collar outside the 150 mm branch pipe skin.
    add_torus(bm, (0.5, 0, 0.4), major_r=0.162, minor_r=0.01, axis='X', mat_idx=2)

def build_pipe_cross(bm):
    # 4-way flanged cross
    add_cylinder(bm, (0, -0.95, 0.4), (0, 0.95, 0.4), radius=0.15, segments=10, mat_idx=0)
    add_cylinder(bm, (-0.95, 0, 0.4), (0.95, 0, 0.4), radius=0.15, segments=10, mat_idx=0)
    add_sphere(bm, (0, 0, 0.4), radius=0.165, segments=8, ring_count=6, mat_idx=0)
    for p in [(0, -1.0, 0.4), (0, 1.0, 0.4), (-1.0, 0, 0.4), (1.0, 0, 0.4)]:
        add_cylinder(bm, (p[0]*0.95, p[1]*0.95, p[2]), p, radius=0.22, segments=10, mat_idx=1)
    # Keep the orange collar outside the 165 mm cross hub.
    add_torus(bm, (0, 0, 0.4), major_r=0.179, minor_r=0.012, axis='Z', mat_idx=2)

def build_pipe_flange(bm):
    add_cylinder(bm, (0, 0, 0), (0, 0, 0.08), radius=0.25, segments=12, mat_idx=1)
    add_cylinder(bm, (0, 0, 0.07), (0, 0, 0.1), radius=0.16, segments=10, mat_idx=0)
    for a in range(6):
        ang = a * math.pi / 3
        add_cylinder(bm, (math.cos(ang)*0.2, math.sin(ang)*0.2, 0.06), (math.cos(ang)*0.2, math.sin(ang)*0.2, 0.11), radius=0.015, segments=6, mat_idx=2)

def build_pipe_valve(bm):
    # Pipe with manual red/orange handwheel
    add_cylinder(bm, (0, -0.95, 0.4), (0, 0.95, 0.4), radius=0.15, segments=10, mat_idx=0)
    add_cylinder(bm, (0, -1.0, 0.4), (0, -0.95, 0.4), radius=0.22, segments=10, mat_idx=1)
    add_cylinder(bm, (0, 0.95, 0.4), (0, 1.0, 0.4), radius=0.22, segments=10, mat_idx=1)
    add_box(bm, (0, 0, 0.4), (0.35, 0.35, 0.35), mat_idx=1) # valve body
    add_cylinder(bm, (0, 0, 0.55), (0, 0, 0.8), radius=0.035, segments=6, mat_idx=1) # stem
    add_torus(bm, (0, 0, 0.8), major_r=0.22, minor_r=0.02, axis='Z', mat_idx=2) # handwheel
    for a in range(4):
        ang = a * math.pi / 2
        add_cylinder(bm, (0, 0, 0.8), (math.cos(ang)*0.22, math.sin(ang)*0.22, 0.8), radius=0.012, segments=6, mat_idx=1)

def build_pipe_support(bm):
    # Floor stanchion for pipe
    add_box(bm, (0, 0, 0.02), (0.45, 0.45, 0.04), mat_idx=1)
    add_cylinder(bm, (0, 0, 0.04), (0, 0, 0.38), radius=0.06, segments=8, mat_idx=1)
    add_torus(bm, (0, 0, 0.4), major_r=0.18, minor_r=0.025, axis='Y', mat_idx=0) # cradle saddle
    add_box(bm, (0, 0, 0.22), (0.14, 0.05, 0.03), mat_idx=2)

def build_pipe_riser(bm):
    # 4m vertical pipe riser
    add_cylinder(bm, (0, 0, 0.06), (0, 0, 3.94), radius=0.15, segments=10, mat_idx=0)
    add_cylinder(bm, (0, 0, 0), (0, 0, 0.06), radius=0.22, segments=10, mat_idx=1)
    add_cylinder(bm, (0, 0, 3.94), (0, 0, 4.0), radius=0.22, segments=10, mat_idx=1)
    for z in [1.2, 2.6]:
        add_box(bm, (0, 0.2, z), (0.35, 0.15, 0.06), mat_idx=1) # wall bracket
        add_torus(bm, (0, 0, z), major_r=0.162, minor_r=0.01, axis='Z', mat_idx=2)

def build_pipe_junction_box(bm):
    # 0.8x0.8x0.8m terminal manifold box
    add_box(bm, (0, 0, 0.4), (0.8, 0.8, 0.8), mat_idx=1)
    for p in [(0.4, 0, 0.4), (-0.4, 0, 0.4), (0, 0.4, 0.4), (0, -0.4, 0.4)]:
        add_cylinder(bm, (p[0]*0.9, p[1]*0.9, p[2]), (p[0]*1.1, p[1]*1.1, p[2]), radius=0.15, segments=8, mat_idx=0)
    # Raise the orange cap 1 mm above the junction box.
    add_box(bm, (0, 0, 0.811), (0.3, 0.3, 0.04), mat_idx=2)

def build_tank_vertical(bm):
    # 2.5m dia x 4.5m tall silo on 4 legs
    for a in range(4):
        ang = a * math.pi / 2
        lx = math.cos(ang) * 1.1
        ly = math.sin(ang) * 1.1
        add_cylinder(bm, (lx, ly, 0), (lx, ly, 1.2), radius=0.09, segments=8, mat_idx=1)
    add_cylinder(bm, (0, 0, 1.0), (0, 0, 4.0), radius=1.25, segments=12, mat_idx=0)
    add_cone(bm, (0, 0, 4.0), (0, 0, 4.5), r1=1.25, r2=0.4, segments=12, mat_idx=0) # top dome
    add_cylinder(bm, (0, 0, 4.5), (0, 0, 4.7), radius=0.3, segments=8, mat_idx=1) # manway
    # Keep the orange stripe outside the 1.25 m tank skin.
    add_torus(bm, (0, 0, 2.5), major_r=1.285, minor_r=0.03, mat_idx=2) # hazard stripe

def build_tank_horizontal(bm):
    # Horizontal vessel: dia 2m x length 4m
    for y in [-1.2, 1.2]:
        add_box(bm, (0, y, 0.25), (1.8, 0.35, 0.5), mat_idx=1) # saddles
    add_cylinder(bm, (0, -2.0, 1.25), (0, 2.0, 1.25), radius=1.0, segments=12, mat_idx=0)
    add_sphere(bm, (0, -2.0, 1.25), radius=1.0, segments=10, ring_count=6, mat_idx=0)
    add_sphere(bm, (0, 2.0, 1.25), radius=1.0, segments=10, ring_count=6, mat_idx=0)
    # Keep the orange stripe outside the 1 m vessel skin.
    add_torus(bm, (0, 0, 1.25), major_r=1.03, minor_r=0.025, axis='Y', mat_idx=2)

def build_tank_silo(bm):
    # Tall grain/chemical silo: 6m tall
    for a in range(4):
        ang = a * math.pi / 2
        add_cylinder(bm, (math.cos(ang)*1.1, math.sin(ang)*1.1, 0), (math.cos(ang)*1.1, math.sin(ang)*1.1, 1.95), radius=0.08, segments=8, mat_idx=1)
    add_cone(bm, (0, 0, 2.0), (0, 0, 0.8), r1=1.2, r2=0.25, segments=12, mat_idx=0) # hopper
    add_cylinder(bm, (0, 0, 2.0), (0, 0, 5.5), radius=1.2, segments=12, mat_idx=0)
    add_cone(bm, (0, 0, 5.5), (0, 0, 6.2), r1=1.2, r2=0.2, segments=12, mat_idx=1) # roof
    # Keep the orange stripe outside the 1.2 m silo skin.
    add_torus(bm, (0, 0, 3.8), major_r=1.23, minor_r=0.025, mat_idx=2)

def build_tank_spherical(bm):
    # Spherical LPG pressure sphere: 3m dia
    for a in range(4):
        ang = a * math.pi / 2
        add_cylinder(bm, (math.cos(ang)*1.2, math.sin(ang)*1.2, 0), (math.cos(ang)*1.2, math.sin(ang)*1.2, 1.8), radius=0.08, segments=8, mat_idx=1)
    add_sphere(bm, (0, 0, 2.0), radius=1.5, segments=12, ring_count=8, mat_idx=0)
    # Keep the orange stripe outside the 1.5 m sphere skin.
    add_torus(bm, (0, 0, 2.0), major_r=1.54, minor_r=0.03, mat_idx=2)

def build_smokestack(bm):
    # 10m tapered exhaust stack
    add_cylinder(bm, (0, 0, 0), (0, 0, 0.6), radius=0.9, segments=10, mat_idx=1)
    add_cone(bm, (0, 0, 0.6), (0, 0, 10.0), r1=0.8, r2=0.45, segments=10, mat_idx=0)
    add_torus(bm, (0, 0, 10.0), major_r=0.46, minor_r=0.04, mat_idx=1) # rim
    add_torus(bm, (0, 0, 7.5), major_r=0.55, minor_r=0.03, mat_idx=2)

def build_smokestack_tall(bm):
    # 16m massive chimney stack
    add_cylinder(bm, (0, 0, 0), (0, 0, 1.0), radius=1.4, segments=12, mat_idx=1)
    add_cone(bm, (0, 0, 1.0), (0, 0, 16.0), r1=1.3, r2=0.6, segments=12, mat_idx=0)
    for z in [6.0, 11.0]:
        add_torus(bm, (0, 0, z), major_r=1.0 - z*0.025, minor_r=0.03, mat_idx=2)

def build_smokestack_twin(bm):
    # Dual flues with lattice bracing: 8m tall
    for x in [-0.7, 0.7]:
        add_cylinder(bm, (x, 0, 0), (x, 0, 8.0), radius=0.35, segments=10, mat_idx=0)
        add_torus(bm, (x, 0, 8.0), major_r=0.36, minor_r=0.03, mat_idx=1)
    for z in [2.5, 5.0, 7.0]:
        add_box(bm, (0, 0, z), (1.4, 0.25, 0.2), mat_idx=1)
    add_box(bm, (0, 0, 7.0), (1.42, 0.05, 0.1), mat_idx=2)

def build_duct_straight(bm):
    # Rectangular HVAC air duct: 4x0.8x0.8m along Y
    add_box(bm, (0, 0, 0.5), (0.8, 4.0, 0.8), mat_idx=0)
    add_box(bm, (0, -2.0, 0.5), (0.9, 0.06, 0.9), mat_idx=1) # flange 1
    add_box(bm, (0, 2.0, 0.5), (0.9, 0.06, 0.9), mat_idx=1) # flange 2
    add_box(bm, (0, 0, 0.5), (0.82, 0.08, 0.82), mat_idx=2)

def build_duct_elbow(bm):
    # 90-deg rectangular elbow
    add_box(bm, (0, -0.6, 0.5), (0.8, 1.2, 0.8), mat_idx=0)
    add_box(bm, (0.6, 0, 0.5), (1.2, 0.8, 0.8), mat_idx=0)
    add_box(bm, (0, -1.2, 0.5), (0.9, 0.06, 0.9), mat_idx=1)
    add_box(bm, (1.2, 0, 0.5), (0.06, 0.9, 0.9), mat_idx=1)
    add_box(bm, (0, 0, 0.5), (0.82, 0.82, 0.82), mat_idx=2)

def build_duct_tee(bm):
    add_box(bm, (0, 0, 0.5), (0.8, 2.4, 0.8), mat_idx=0)
    add_box(bm, (0.6, 0, 0.5), (1.2, 0.8, 0.8), mat_idx=0)
    add_box(bm, (0, -1.2, 0.5), (0.9, 0.06, 0.9), mat_idx=1)
    add_box(bm, (0, 1.2, 0.5), (0.9, 0.06, 0.9), mat_idx=1)
    add_box(bm, (1.2, 0, 0.5), (0.06, 0.9, 0.9), mat_idx=1)
    add_box(bm, (0.5, 0, 0.5), (0.08, 0.82, 0.82), mat_idx=2)

def build_duct_vent(bm):
    add_box(bm, (0, 0, 0.4), (1.0, 0.15, 0.6), mat_idx=1)
    for z in [0.25, 0.35, 0.45, 0.55]:
        add_box(bm, (0, -0.06, z), (0.85, 0.03, 0.06), rot=(0.4, 0, 0), mat_idx=0)
    add_box(bm, (0, -0.08, 0.4), (0.95, 0.02, 0.04), mat_idx=2)

def build_vent_fan(bm):
    # Circular 1.2m fan housing
    add_box(bm, (0, 0, 0.75), (1.5, 0.3, 1.5), mat_idx=1)
    add_cylinder(bm, (0, -0.16, 0.75), (0, 0.16, 0.75), radius=0.6, segments=12, mat_idx=0)
    add_cylinder(bm, (0, 0.1, 0.75), (0, 0.25, 0.75), radius=0.18, segments=8, mat_idx=1) # motor
    for a in range(6):
        ang = a * math.pi / 3
        add_box(bm, (math.cos(ang)*0.32, 0, 0.75 + math.sin(ang)*0.32), (0.4, 0.02, 0.15), rot=(0.3, 0, ang), mat_idx=2)

def build_duct_exhaust_hood(bm):
    add_box(bm, (0, 0, 0.275), (2.0, 1.5, 0.25), mat_idx=1)
    add_wedge(bm, (-1.0, -0.75, 0.4), (1.0, 0.75, 1.2), slope_dir='+Y', mat_idx=0)
    add_cylinder(bm, (0, 0, 1.2), (0, 0, 1.6), radius=0.35, segments=10, mat_idx=1)
    # Keep the orange collar outside the 350 mm exhaust skin.
    add_torus(bm, (0, 0, 1.6), major_r=0.372, minor_r=0.02, mat_idx=2)

def build_wall_vent_louvers(bm):
    add_box(bm, (0, 0, 1.0), (1.5, 0.15, 1.5), mat_idx=1)
    for i in range(6):
        lz = 0.4 + i * 0.22
        add_box(bm, (0, -0.06, lz), (1.3, 0.04, 0.14), rot=(0.35, 0, 0), mat_idx=0)
    add_box(bm, (0, -0.09, 1.7), (1.4, 0.02, 0.06), mat_idx=2)

def build_roof_turbine_vent(bm):
    add_cylinder(bm, (0, 0, 0), (0, 0, 0.35), radius=0.45, segments=10, mat_idx=1)
    add_sphere(bm, (0, 0, 0.75), radius=0.5, segments=10, ring_count=8, mat_idx=0) # finned spinner
    # Keep the orange collar outside the 500 mm spinner skin.
    add_torus(bm, (0, 0, 0.75), major_r=0.522, minor_r=0.02, mat_idx=2)

def build_generator(bm):
    # Industrial backup generator: 3.0x1.4x1.8m
    add_box(bm, (0, 0, 0.1), (3.0, 1.4, 0.2), mat_idx=1) # skid base
    add_box(bm, (0, 0, 0.95), (2.8, 1.3, 1.5), mat_idx=0) # acoustic canopy
    add_box(bm, (-1.36, 0, 0.95), (0.1, 1.1, 1.2), mat_idx=1) # radiator grill
    add_cylinder(bm, (0.8, 0, 1.7), (0.8, 0, 2.2), radius=0.1, segments=8, mat_idx=1) # exhaust
    add_box(bm, (0.8, -0.66, 1.1), (0.2, 0.05, 0.2), mat_idx=2) # emergency stop / panel

def build_generator_diesel_large(bm):
    # Heavy 5m skid generator
    add_box(bm, (0, 0, 0.15), (5.0, 1.8, 0.3), mat_idx=1)
    add_box(bm, (0, 0, 1.25), (4.6, 1.6, 1.9), mat_idx=0)
    add_cylinder(bm, (-1.2, 0, 2.2), (-1.2, 0, 2.8), radius=0.14, segments=8, mat_idx=1)
    add_cylinder(bm, (1.2, 0, 2.2), (1.2, 0, 2.8), radius=0.14, segments=8, mat_idx=1)
    add_box(bm, (0, -0.82, 1.2), (0.6, 0.06, 0.4), mat_idx=2)

def build_turbine_housing(bm):
    # Steam turbine cylindrical casing
    add_box(bm, (0, 0, 0.3), (3.5, 2.2, 0.6), mat_idx=1)
    add_cylinder(bm, (-1.5, 0, 1.2), (1.5, 0, 1.2), radius=0.85, segments=12, mat_idx=0)
    add_cylinder(bm, (0, 0, 2.05), (0, 0, 2.6), radius=0.35, segments=8, mat_idx=1) # steam inlet
    # Keep the orange collar outside the 850 mm turbine casing.
    add_torus(bm, (0, 0, 1.2), major_r=0.882, minor_r=0.03, axis='X', mat_idx=2)

def build_machine_lathe(bm):
    # 2.5m metalworking lathe
    add_box(bm, (0, 0, 0.35), (2.5, 0.8, 0.7), mat_idx=1) # bed
    add_box(bm, (-0.85, 0, 0.95), (0.7, 0.75, 0.5), mat_idx=0) # headstock
    add_cylinder(bm, (-0.5, 0, 0.95), (-0.35, 0, 0.95), radius=0.22, segments=8, mat_idx=1) # chuck
    add_box(bm, (0.85, 0, 0.85), (0.5, 0.5, 0.3), mat_idx=0) # tailstock
    add_box(bm, (-0.85, -0.39, 1.1), (0.2, 0.05, 0.15), mat_idx=2)

def build_machine_hydraulic_press(bm):
    # 3.5m tall hydraulic press
    add_box(bm, (0, 0, 0.3), (1.6, 1.4, 0.6), mat_idx=1) # bed
    add_box(bm, (0, 0, 3.2), (1.6, 1.4, 0.6), mat_idx=1) # crown
    for x in [-0.65, 0.65]:
        for y in [-0.55, 0.55]:
            add_cylinder(bm, (x, y, 0.6), (x, y, 3.2), radius=0.08, segments=8, mat_idx=0) # columns
    add_cylinder(bm, (0, 0, 2.2), (0, 0, 2.9), radius=0.25, segments=10, mat_idx=0) # ram
    # Lower the orange platen 5 mm below the ram cap.
    add_box(bm, (0, 0, 2.095), (0.8, 0.8, 0.2), mat_idx=2) # platen

def build_machine_transformer(bm):
    # Substation transformer with cooling fins
    add_box(bm, (0, 0, 1.0), (1.8, 1.4, 1.8), mat_idx=0)
    for x in [-0.85, 0.85]:
        for f in range(5):
            fy = -0.5 + f * 0.25
            add_box(bm, (x, fy, 1.0), (0.15, 0.04, 1.4), mat_idx=1)
    for bx in [-0.4, 0, 0.4]:
        add_cone(bm, (bx, 0, 1.9), (bx, 0, 2.5), r1=0.08, r2=0.03, segments=6, mat_idx=1) # bushings
    add_box(bm, (0, -0.72, 1.1), (0.35, 0.05, 0.35), mat_idx=2)

def build_machine_pump(bm):
    # Centrifugal water pump on base
    add_box(bm, (0, 0, 0.1), (1.5, 0.7, 0.2), mat_idx=1)
    add_cylinder(bm, (-0.35, 0, 0.45), (-0.35, 0, 0.45), radius=0.25, segments=10, mat_idx=0) # volute
    add_cylinder(bm, (0.35, 0, 0.45), (0.35, 0, 0.45), radius=0.22, segments=8, mat_idx=1) # motor
    add_cylinder(bm, (-0.35, 0, 0.45), (-0.35, 0, 0.85), radius=0.1, segments=8, mat_idx=0) # discharge
    add_torus(bm, (-0.35, 0, 0.85), major_r=0.12, minor_r=0.015, axis='Z', mat_idx=2)

def build_air_compressor(bm):
    add_box(bm, (0, 0, 0.65), (1.2, 0.8, 1.3), mat_idx=0)
    add_cylinder(bm, (0, 0, 0.2), (0, 0, 0.6), radius=0.3, segments=8, mat_idx=1) # tank
    add_box(bm, (0, -0.41, 1.0), (0.4, 0.04, 0.3), mat_idx=1) # gauge panel
    add_sphere(bm, (0, -0.43, 1.05), radius=0.06, segments=6, ring_count=4, mat_idx=2)

def build_air_tank_mobile(bm):
    # Mobile compressor with wheels
    add_cylinder(bm, (0, -0.5, 0.4), (0, 0.5, 0.4), radius=0.22, segments=10, mat_idx=0)
    for x in [-0.25, 0.25]:
        add_cylinder(bm, (x, -0.4, 0.12), (x, -0.4, 0.16), radius=0.12, segments=8, mat_idx=1) # wheels
    add_cylinder(bm, (0, 0.5, 0.4), (0, 0.75, 0.85), radius=0.02, segments=6, mat_idx=1) # handle
    add_cylinder(bm, (0, 0, 0.65), (0, 0, 0.8), radius=0.04, segments=6, mat_idx=2) # regulator

def build_conveyor(bm):
    # 4m straight motorized conveyor
    for y in [-1.5, 1.5]:
        add_cylinder(bm, (-0.45, y, 0), (-0.45, y, 0.8), radius=0.035, segments=6, mat_idx=1)
        add_cylinder(bm, (0.45, y, 0), (0.45, y, 0.8), radius=0.035, segments=6, mat_idx=1)
    add_box(bm, (0, 0, 0.85), (1.0, 4.0, 0.12), mat_idx=1) # frame
    add_box(bm, (0, 0, 0.915), (0.85, 3.96, 0.03), mat_idx=0) # belt safely raised above frame
    add_box(bm, (0.55, -1.8, 0.75), (0.2, 0.3, 0.25), mat_idx=2) # drive motor

def build_conveyor_roller_straight(bm):
    # 3m gravity skate-wheel conveyor
    add_box(bm, (-0.42, 0, 0.75), (0.06, 3.0, 0.1), mat_idx=1)
    add_box(bm, (0.42, 0, 0.75), (0.06, 3.0, 0.1), mat_idx=1)
    for r in range(10):
        ry = -1.35 + r * 0.3
        add_cylinder(bm, (-0.4, ry, 0.78), (0.4, ry, 0.78), radius=0.035, segments=8, mat_idx=0)
    add_box(bm, (0, -1.51, 0.77), (0.92, 0.04, 0.16), mat_idx=2)

def build_conveyor_incline(bm):
    # Inclined conveyor rising 1.5m
    add_wedge(bm, (-0.45, -2.0, 0), (0.45, 2.0, 1.5), slope_dir='+Y', mat_idx=0)
    add_box(bm, (-0.48, 0, 0.8), (0.06, 4.2, 0.15), rot=(-0.36, 0, 0), mat_idx=1)
    add_box(bm, (0.48, 0, 0.8), (0.06, 4.2, 0.15), rot=(-0.36, 0, 0), mat_idx=1)
    add_box(bm, (0, 2.01, 1.5), (0.95, 0.05, 0.1), mat_idx=2)

def build_crane(bm):
    # Overhead hoist trolley with cargo hook
    add_box(bm, (0, 0, 2.5), (1.4, 1.2, 0.4), mat_idx=1) # trolley
    add_cylinder(bm, (0, 0, 2.3), (0, 0, 1.2), radius=0.015, segments=6, mat_idx=0) # cable
    # Hook
    add_torus(bm, (0, 0, 1.0), major_r=0.14, minor_r=0.035, axis='Y', mat_idx=2)
    add_box(bm, (0, 0, 1.25), (0.2, 0.15, 0.2), mat_idx=1)

def build_gantry_crane(bm):
    # 6m wide x 5m high mobile A-frame gantry
    for x in [-2.8, 2.8]:
        add_cylinder(bm, (x, -1.2, 0.15), (x, 0, 4.8), radius=0.08, segments=8, mat_idx=1)
        add_cylinder(bm, (x, 1.2, 0.15), (x, 0, 4.8), radius=0.08, segments=8, mat_idx=1)
        add_box(bm, (x, 0, 0.1), (0.25, 2.6, 0.2), mat_idx=1) # wheel base
    add_i_beam(bm, (-2.8, 0, 4.8), (2.8, 0, 4.8), width=0.35, depth=0.35, mat_idx=0) # bridge
    add_box(bm, (0, 0, 4.5), (0.6, 0.5, 0.3), mat_idx=2) # hoist

def build_hoist_monorail(bm):
    add_i_beam(bm, (0, -1.5, 3.0), (0, 1.5, 3.0), width=0.25, depth=0.25, mat_idx=1)
    add_box(bm, (0, 0, 2.7), (0.4, 0.5, 0.35), mat_idx=0)
    add_cylinder(bm, (0, 0, 2.5), (0, 0, 1.6), radius=0.012, segments=6, mat_idx=1)
    add_torus(bm, (0, 0, 1.45), major_r=0.1, minor_r=0.025, axis='Y', mat_idx=2)

def build_crane_jib(bm):
    # 4m slewing jib crane
    add_cylinder(bm, (-1.5, 0, 0), (-1.5, 0, 4.2), radius=0.16, segments=10, mat_idx=1) # pillar
    add_i_beam(bm, (-1.5, 0, 4.0), (2.0, 0, 4.0), width=0.2, depth=0.2, mat_idx=0) # boom
    add_cylinder(bm, (1.2, 0, 3.9), (1.2, 0, 2.2), radius=0.012, segments=6, mat_idx=1)
    add_torus(bm, (1.2, 0, 2.05), major_r=0.1, minor_r=0.025, axis='Y', mat_idx=2)

# ==============================================================================
# INDUSTRIAL BUILDERS - PART 3: LOGISTICS, UTILITIES, SAFETY & DEBRIS
# ==============================================================================

def build_electrical_cabinet(bm):
    # 1.2m wide x 0.6m deep x 2.0m tall
    add_box(bm, (0, 0, 1.0), (1.2, 0.6, 2.0), mat_idx=0)
    add_box(bm, (0, 0, 1.0), (1.24, 0.64, 0.05), mat_idx=1) # trim
    add_cone(bm, (0, -0.31, 1.4), (0, -0.32, 1.4), r1=0.12, r2=0.0, segments=3, mat_idx=2) # warning triangle
    add_cylinder(bm, (0.45, -0.32, 1.0), (0.5, -0.32, 1.0), radius=0.02, segments=6, mat_idx=1) # handle

def build_electrical_panel_wall(bm):
    add_box(bm, (0, 0, 1.0), (0.8, 0.25, 1.2), mat_idx=0)
    add_box(bm, (0, -0.13, 1.0), (0.7, 0.02, 1.1), mat_idx=1)
    # Move the orange latch 1 mm clear of the panel face.
    add_box(bm, (0.28, -0.141, 1.0), (0.04, 0.03, 0.1), mat_idx=2)

def build_breaker_box(bm):
    add_box(bm, (0, 0, 0.5), (0.45, 0.25, 0.6), mat_idx=1)
    add_cylinder(bm, (0.25, 0, 0.5), (0.35, -0.12, 0.65), radius=0.015, segments=6, mat_idx=2) # throw handle

def build_cable_spool(bm):
    # Wooden wire spool: dia 1.2m, width 0.8m
    for y in [-0.38, 0.38]:
        add_cylinder(bm, (0, y, 0.6), (0, y + 0.04, 0.6), radius=0.6, segments=12, mat_idx=0)
    add_cylinder(bm, (0, -0.36, 0.6), (0, 0.36, 0.6), radius=0.45, segments=10, mat_idx=1) # cable windings
    # Keep the orange collar outside the 450 mm cable winding.
    add_torus(bm, (0, 0, 0.6), major_r=0.472, minor_r=0.02, axis='Y', mat_idx=2)

def build_cable_spool_metal(bm):
    for y in [-0.3, 0.3]:
        add_torus(bm, (0, y, 0.5), major_r=0.5, minor_r=0.03, axis='Y', mat_idx=1)
    add_cylinder(bm, (0, -0.28, 0.5), (0, 0.28, 0.5), radius=0.35, segments=8, mat_idx=0)
    # Keep the orange collar outside the 350 mm spool hub.
    add_torus(bm, (0, 0, 0.5), major_r=0.367, minor_r=0.015, axis='Y', mat_idx=2)

def build_cable_tray_straight(bm):
    # 3m perforated cable tray
    add_box(bm, (0, 0, 0.05), (0.5, 3.0, 0.08), mat_idx=1)
    add_cylinder(bm, (0, -1.48, 0.06), (0, 1.48, 0.06), radius=0.06, segments=6, mat_idx=0) # cable bundle
    add_box(bm, (0, 0, 0.075), (0.52, 0.04, 0.04), mat_idx=2)

def build_pallet(bm):
    # Standard stringer pallet: 1.2x1.0x0.15m
    for y in [-0.45, 0.0, 0.45]:
        add_box(bm, (0, y, 0.075), (1.2, 0.08, 0.1), mat_idx=1)
    for x in range(5):
        bx = -0.5 + x * 0.25
        add_box(bm, (bx, 0, 0.14), (0.12, 1.0, 0.025), mat_idx=0)
    # Raise the orange cap 1 mm above the top slat.
    add_box(bm, (0.5, 0.45, 0.076), (0.05, 0.085, 0.105), mat_idx=2)

def build_pallet_euro(bm):
    # 1.2x0.8m Euro block pallet
    for x in [-0.5, 0, 0.5]:
        for y in [-0.35, 0, 0.35]:
            add_box(bm, (x, y, 0.06), (0.12, 0.12, 0.1), mat_idx=1)
    for x in range(5):
        bx = -0.48 + x * 0.24
        add_box(bm, (bx, 0, 0.13), (0.12, 0.8, 0.025), mat_idx=0)
    add_box(bm, (0.5, -0.35, 0.06), (0.125, 0.125, 0.05), mat_idx=2)

def build_pallet_metal(bm):
    add_box(bm, (0, 0, 0.08), (1.2, 1.0, 0.14), mat_idx=1)
    add_box(bm, (0, 0, 0.151), (1.16, 0.96, 0.004), mat_idx=0)
    add_box(bm, (0, 0, 0.155), (0.2, 0.2, 0.005), mat_idx=2)

def build_stacked_pallets(bm):
    for i in range(5):
        z = i * 0.15
        add_box(bm, (0, 0, z + 0.075), (1.2, 1.0, 0.14), mat_idx=0 if i % 2 == 0 else 1)
    add_box(bm, (0.5, 0, 0.74), (0.1, 0.8, 0.02), mat_idx=2)

def build_stacked_pallets_tall(bm):
    for i in range(10):
        z = i * 0.15
        add_box(bm, (0, 0, z + 0.075), (1.2, 1.0, 0.14), mat_idx=0 if i % 2 == 0 else 1)
    add_box(bm, (0.5, 0, 1.49), (0.1, 0.8, 0.02), mat_idx=2)

def build_cargo_container(bm):
    # 20ft container: 6.0x2.4x2.6m
    # Recess body inside outer frame to eliminate coplanar face collisions
    add_box(bm, (0, 0, 1.29), (5.92, 2.32, 2.54), mat_idx=0)
    # 4 corner vertical posts
    for cx in [-2.93, 2.93]:
        for cy in [-1.13, 1.13]:
            add_box(bm, (cx, cy, 1.3), (0.14, 0.14, 2.6), mat_idx=1)
    # Top edge rails
    add_box(bm, (0, -1.14, 2.58), (5.96, 0.12, 0.04), mat_idx=1)
    add_box(bm, (0, 1.14, 2.58), (5.96, 0.12, 0.04), mat_idx=1)
    add_box(bm, (-2.94, 0, 2.58), (0.12, 2.36, 0.04), mat_idx=1)
    add_box(bm, (2.94, 0, 2.58), (0.12, 2.36, 0.04), mat_idx=1)
    # Bottom edge rails
    add_box(bm, (0, -1.14, 0.02), (5.96, 0.12, 0.04), mat_idx=1)
    add_box(bm, (0, 1.14, 0.02), (5.96, 0.12, 0.04), mat_idx=1)
    # Corrugation
    for r in range(10):
        rx = -2.5 + r * 0.55
        add_box(bm, (rx, 0, 1.29), (0.08, 2.36, 2.50), mat_idx=0)
    add_box(bm, (2.97, 0, 1.3), (0.05, 0.08, 2.0), mat_idx=2) # lock rod

def build_cargo_container_open(bm):
    add_box(bm, (-0.2, 0, 1.3), (5.6, 2.4, 2.6), mat_idx=0)
    # Open doors swung wide
    add_box(bm, (2.7, -1.4, 1.3), (0.06, 1.1, 2.4), rot=(0, 0, 0.5), mat_idx=1)
    add_box(bm, (2.7, 1.4, 1.3), (0.06, 1.1, 2.4), rot=(0, 0, -0.5), mat_idx=1)
    add_box(bm, (2.6, 0, 1.3), (0.1, 0.1, 2.42), mat_idx=2)

def build_cargo_container_short(bm):
    # 10ft container: 3.0x2.4x2.6m
    add_box(bm, (0, 0, 1.29), (2.92, 2.32, 2.54), mat_idx=0)
    for cx in [-1.43, 1.43]:
        for cy in [-1.13, 1.13]:
            add_box(bm, (cx, cy, 1.3), (0.14, 0.14, 2.6), mat_idx=1)
    add_box(bm, (0, -1.14, 2.58), (2.96, 0.12, 0.04), mat_idx=1)
    add_box(bm, (0, 1.14, 2.58), (2.96, 0.12, 0.04), mat_idx=1)
    add_box(bm, (-1.44, 0, 2.58), (0.12, 2.36, 0.04), mat_idx=1)
    add_box(bm, (1.44, 0, 2.58), (0.12, 2.36, 0.04), mat_idx=1)
    add_box(bm, (0, -1.14, 0.02), (2.96, 0.12, 0.04), mat_idx=1)
    add_box(bm, (0, 1.14, 0.02), (2.96, 0.12, 0.04), mat_idx=1)
    for r in range(4):
        rx = -0.8 + r * 0.55
        add_box(bm, (rx, 0, 1.29), (0.08, 2.36, 2.50), mat_idx=0)
    add_box(bm, (1.47, 0, 1.3), (0.05, 0.08, 2.0), mat_idx=2)

def build_barrel(bm):
    # Standard 55-gal drum: dia 0.6m, height 0.9m
    add_cylinder(bm, (0, 0, 0), (0, 0, 0.9), radius=0.3, segments=12, mat_idx=0)
    add_torus(bm, (0, 0, 0.3), major_r=0.305, minor_r=0.015, mat_idx=1)
    add_torus(bm, (0, 0, 0.6), major_r=0.305, minor_r=0.015, mat_idx=1)
    add_cylinder(bm, (0.12, 0, 0.89), (0.12, 0, 0.92), radius=0.03, segments=6, mat_idx=2) # bung cap

def build_barrel_toxic(bm):
    add_cylinder(bm, (0, 0, 0), (0, 0, 0.9), radius=0.3, segments=12, mat_idx=1)
    # Keep the orange band 10 mm beyond the 300 mm barrel skin.
    add_cylinder(bm, (0, 0, 0.35), (0, 0, 0.55), radius=0.31, segments=12, mat_idx=2) # orange band
    add_torus(bm, (0, 0, 0.3), major_r=0.308, minor_r=0.015, mat_idx=0)
    add_torus(bm, (0, 0, 0.6), major_r=0.308, minor_r=0.015, mat_idx=0)

def build_barrel_stack(bm):
    # 3-barrel pyramid
    add_cylinder(bm, (-0.32, 0, 0), (-0.32, 0, 0.9), radius=0.3, segments=10, mat_idx=0)
    add_cylinder(bm, (0.32, 0, 0), (0.32, 0, 0.9), radius=0.3, segments=10, mat_idx=1)
    add_cylinder(bm, (0, 0, 0.85), (0, 0, 1.75), radius=0.3, segments=10, mat_idx=0)
    # Keep the orange collar outside the 300 mm barrel skin.
    add_torus(bm, (0, 0, 1.3), major_r=0.317, minor_r=0.015, mat_idx=2)

def build_crate(bm):
    # 1.0x1.0x1.0m wooden crate with frame
    add_box(bm, (0, 0, 0.5), (1.0, 1.0, 1.0), mat_idx=0)
    add_box(bm, (0, 0, 0.5), (1.04, 1.04, 1.04), mat_idx=1) # framing battens
    # Move the orange label 1 mm beyond the crate frame face.
    add_box(bm, (0, -0.531, 0.5), (0.2, 0.02, 0.2), mat_idx=2) # label

def build_crate_heavy_wooden(bm):
    add_box(bm, (0, 0, 0.55), (1.6, 1.2, 0.9), mat_idx=0)
    for y in [-0.4, 0.4]:
        add_box(bm, (0, y, 0.05), (1.6, 0.1, 0.1), mat_idx=1) # forklift skids
    add_box(bm, (0, 0, 0.55), (1.64, 1.24, 0.94), mat_idx=1)
    # Move the orange label 1 mm beyond the crate frame face.
    add_box(bm, (0.6, -0.631, 0.6), (0.25, 0.02, 0.25), mat_idx=2)

def build_crate_military(bm):
    # Low-profile ammo crate: 0.9x0.5x0.35m
    add_box(bm, (0, 0, 0.175), (0.9, 0.5, 0.35), mat_idx=1)
    add_box(bm, (0, 0, 0.355), (0.94, 0.54, 0.04), mat_idx=0)
    add_box(bm, (0, -0.26, 0.2), (0.15, 0.03, 0.05), mat_idx=2) # toggle latch

def build_crate_stack(bm):
    add_box(bm, (-0.2, 0, 0.4), (1.0, 1.0, 0.8), mat_idx=0)
    add_box(bm, (0.62, 0.1, 0.3), (0.6, 0.7, 0.6), mat_idx=1)
    add_box(bm, (-0.1, 0, 1.05), (0.8, 0.8, 0.5), mat_idx=0)
    add_box(bm, (-0.1, -0.42, 1.05), (0.15, 0.02, 0.15), mat_idx=2)

def build_fence_panel(bm):
    # 3m wide x 2m high fence
    for x in [-1.45, 1.45]:
        add_cylinder(bm, (x, 0, 0), (x, 0, 2.0), radius=0.04, segments=8, mat_idx=1)
    for z in [0.15, 1.95]:
        add_cylinder(bm, (-1.45, 0, z), (1.45, 0, z), radius=0.03, segments=6, mat_idx=1)
    add_box(bm, (0, 0, 1.05), (2.85, 0.01, 1.75), mat_idx=0) # mesh plane
    add_box(bm, (0, 0, 1.05), (0.3, 0.02, 0.2), mat_idx=2) # warning sign

def build_fence_gate(bm):
    # 1.5m wide swinging gate
    add_cylinder(bm, (-0.75, 0, 0), (-0.75, 0, 2.0), radius=0.04, segments=8, mat_idx=1)
    add_cylinder(bm, (0.75, 0, 0), (0.75, 0, 2.0), radius=0.04, segments=8, mat_idx=1)
    add_box(bm, (0, 0, 1.05), (1.4, 0.04, 1.8), mat_idx=0)
    add_box(bm, (0.65, 0, 1.0), (0.08, 0.08, 0.08), mat_idx=2) # latch

def build_fence_wire_mesh(bm):
    add_box(bm, (0, 0, 1.0), (2.0, 0.06, 2.0), mat_idx=1)
    add_box(bm, (0, 0, 1.0), (1.88, 0.01, 1.88), mat_idx=0)
    add_box(bm, (0, 0, 1.95), (0.4, 0.08, 0.05), mat_idx=2)

def build_fence_barbed(bm):
    # Fence with 3 top barbed wire strands
    add_box(bm, (0, 0, 1.0), (3.0, 0.06, 2.0), mat_idx=1)
    add_box(bm, (0, 0, 1.0), (2.88, 0.01, 1.88), mat_idx=0)
    for z in [2.1, 2.25, 2.4]:
        add_cylinder(bm, (-1.5, 0, z), (1.5, 0, z), radius=0.008, segments=6, mat_idx=1)
    add_box(bm, (0, 0, 2.25), (0.2, 0.02, 0.15), mat_idx=2)

def build_bollard(bm):
    # Dia 0.2m x height 1.0m
    add_cylinder(bm, (0, 0, 0), (0, 0, 0.95), radius=0.1, segments=10, mat_idx=1)
    add_sphere(bm, (0, 0, 0.95), radius=0.1, segments=8, ring_count=5, mat_idx=1)
    # Keep the reflective stripe 5 mm beyond the 100 mm post skin.
    add_cylinder(bm, (0, 0, 0.75), (0, 0, 0.85), radius=0.105, segments=10, mat_idx=2) # reflective stripe

def build_bollard_retractable(bm):
    add_cylinder(bm, (0, 0, 0), (0, 0, 0.05), radius=0.22, segments=12, mat_idx=1) # ground flange
    add_cylinder(bm, (0, 0, 0.05), (0, 0, 0.85), radius=0.12, segments=10, mat_idx=0)
    # Keep the reflective stripe 5 mm beyond the 120 mm post skin.
    add_cylinder(bm, (0, 0, 0.65), (0, 0, 0.75), radius=0.125, segments=10, mat_idx=2)

def build_bollard_heavy(bm):
    add_cylinder(bm, (0, 0, 0), (0, 0, 1.1), radius=0.18, segments=10, mat_idx=0)
    add_torus(bm, (0, 0, 1.08), major_r=0.182, minor_r=0.015, mat_idx=1)
    # Keep the orange ring outside the 180 mm bollard skin.
    add_torus(bm, (0, 0, 0.9), major_r=0.202, minor_r=0.02, mat_idx=2)

def build_barrier(bm):
    # Steel crowd barricade: 2.5x1.1m
    for x in [-1.0, 1.0]:
        add_box(bm, (x, 0, 0.02), (0.06, 0.5, 0.04), mat_idx=1)
    add_cylinder(bm, (-1.2, 0, 0.04), (-1.2, 0, 1.05), radius=0.025, segments=8, mat_idx=1)
    add_cylinder(bm, (1.2, 0, 0.04), (1.2, 0, 1.05), radius=0.025, segments=8, mat_idx=1)
    add_cylinder(bm, (-1.2, 0, 1.05), (1.2, 0, 1.05), radius=0.025, segments=8, mat_idx=1)
    for p in range(7):
        px = -0.9 + p * 0.3
        add_cylinder(bm, (px, 0, 0.1), (px, 0, 1.0), radius=0.012, segments=6, mat_idx=0)
    add_box(bm, (0, 0, 1.05), (0.35, 0.03, 0.06), mat_idx=2)

def build_barrier_jersey_concrete(bm):
    # Concrete K-rail: length 2.5m, height 0.85m
    add_box(bm, (0, 0, 0.15), (2.5, 0.6, 0.3), mat_idx=0)
    add_wedge(bm, (-1.25, -0.3, 0.3), (1.25, 0.3, 0.85), slope_dir='+Y', mat_idx=0)
    add_box(bm, (0, 0, 0.85), (2.48, 0.2, 0.05), mat_idx=1)
    add_box(bm, (0, -0.31, 0.5), (0.2, 0.02, 0.12), mat_idx=2) # reflector

def build_barrier_traffic_cone(bm):
    # Height 0.75m
    add_box(bm, (0, 0, 0.02), (0.42, 0.42, 0.04), mat_idx=1)
    # Start the orange cone 5 mm above the base cap.
    add_cone(bm, (0, 0, 0.045), (0, 0, 0.755), r1=0.16, r2=0.03, segments=10, mat_idx=2)
    add_cone(bm, (0, 0, 0.4), (0, 0, 0.55), r1=0.11, r2=0.08, segments=10, mat_idx=0) # white collar

def build_barrier_water_fillable(bm):
    # Plastic barrier: 2.0x0.5x0.8m
    add_box(bm, (0, 0, 0.4), (2.0, 0.5, 0.8), mat_idx=2)
    # Lift the fill plug 5 mm clear of the orange barrier top.
    add_cylinder(bm, (0, 0, 0.805), (0, 0, 0.855), radius=0.06, segments=8, mat_idx=1) # fill plug
    add_box(bm, (0, 0, 0.1), (2.02, 0.52, 0.15), mat_idx=1) # base feet

def build_floodlight(bm):
    # Heavy twin LED floodlight on floor yoke
    add_box(bm, (0, 0, 0.04), (0.7, 0.5, 0.08), mat_idx=1)
    add_cylinder(bm, (0, 0, 0.08), (0, 0, 0.8), radius=0.04, segments=8, mat_idx=1)
    for x in [-0.25, 0.25]:
        add_box(bm, (x, -0.15, 0.85), (0.28, 0.15, 0.22), rot=(0.3, 0, 0), mat_idx=0)
        add_box(bm, (x, -0.23, 0.85), (0.24, 0.02, 0.18), rot=(0.3, 0, 0), mat_idx=2)

def build_floodlight_tower(bm):
    # 6m lighting tower with 4 lamps
    add_box(bm, (0, 0, 0.4), (1.8, 1.2, 0.8), mat_idx=0) # trailer base
    for y in [-0.65, 0.65]:
        add_cylinder(bm, (0, y, 0.25), (0, y, 0.35), radius=0.25, segments=8, mat_idx=1) # wheels
    add_cylinder(bm, (0, 0, 0.8), (0, 0, 5.8), radius=0.08, segments=8, mat_idx=1) # mast
    for a in range(4):
        ang = a * math.pi / 2
        add_box(bm, (math.cos(ang)*0.4, math.sin(ang)*0.4, 5.9), (0.25, 0.2, 0.2), mat_idx=1)
        add_sphere(bm, (math.cos(ang)*0.4, math.sin(ang)*0.4, 5.85), radius=0.08, segments=6, ring_count=4, mat_idx=2)

def build_work_light_stand(bm):
    for a in range(3):
        ang = a * 2 * math.pi / 3
        add_cylinder(bm, (0, 0, 0.5), (math.cos(ang)*0.45, math.sin(ang)*0.45, 0), radius=0.02, segments=6, mat_idx=1)
    add_cylinder(bm, (0, 0, 0.5), (0, 0, 1.8), radius=0.025, segments=6, mat_idx=1)
    add_box(bm, (0, -0.05, 1.85), (0.4, 0.1, 0.15), mat_idx=0)
    # Move the orange light face 1 mm beyond the housing face.
    add_box(bm, (0, -0.111, 1.85), (0.35, 0.02, 0.12), mat_idx=2)

def build_debris_scrap_pile(bm):
    add_box(bm, (0, 0, 0.15), (1.6, 1.4, 0.3), mat_idx=1)
    add_box(bm, (0.2, -0.1, 0.35), (0.8, 0.9, 0.25), rot=(0.2, 0.3, 0.5), mat_idx=0)
    add_cylinder(bm, (-0.4, -0.3, 0.1), (0.5, 0.4, 0.4), radius=0.05, segments=6, mat_idx=1)
    add_box(bm, (0, 0, 0.42), (0.3, 0.2, 0.08), rot=(-0.3, 0.2, 0), mat_idx=2)

def build_scrap_i_beam(bm):
    # Twisted/bent I-beam
    add_i_beam(bm, (-1.2, 0, 0.1), (0, 0.1, 0.3), width=0.2, depth=0.2, mat_idx=1)
    add_i_beam(bm, (0, 0.1, 0.3), (1.2, -0.2, 0.1), width=0.2, depth=0.2, mat_idx=1)
    add_box(bm, (0, 0.1, 0.32), (0.1, 0.1, 0.05), mat_idx=2)

def build_scrap_sheet_metal(bm):
    add_box(bm, (0, 0, 0.02), (1.4, 1.0, 0.03), rot=(0, 0, 0.1), mat_idx=0)
    add_box(bm, (0.05, -0.05, 0.05), (1.3, 0.9, 0.03), rot=(0, 0, -0.15), mat_idx=1)
    add_box(bm, (-0.05, 0.05, 0.08), (1.2, 0.8, 0.03), rot=(0, 0, 0.25), mat_idx=0)
    # Raise the orange marker 5 mm above the sheet stack.
    add_box(bm, (0.4, 0.3, 0.105), (0.2, 0.15, 0.01), mat_idx=2)

def build_pallet_broken(bm):
    add_box(bm, (0, -0.45, 0.075), (1.2, 0.08, 0.1), mat_idx=1)
    add_box(bm, (0, 0.45, 0.075), (1.2, 0.08, 0.1), mat_idx=1)
    add_box(bm, (0.1, 0.0, 0.075), (0.8, 0.08, 0.1), rot=(0, 0, 0.2), mat_idx=1) # displaced
    add_box(bm, (-0.3, 0, 0.14), (0.12, 1.0, 0.025), mat_idx=0)
    add_box(bm, (0.3, 0, 0.14), (0.12, 1.0, 0.025), mat_idx=0)
    add_box(bm, (0.1, -0.1, 0.15), (0.12, 0.6, 0.025), rot=(0, 0, -0.3), mat_idx=2) # broken plank

# ==============================================================================
# ENVIRONMENT EXPANSION - ROOFS, WALKWAYS, SERVICE BAYS & UTILITIES (48 items)
# ==============================================================================

def _add_rect_frame(bm, size_x, size_y, z, height, bar=0.08, mat_idx=MAT_STRUCTURAL_GRAY):
    """Add a square frame with a floor origin."""
    add_box(bm, (-size_x / 2 + bar / 2, 0, z + height / 2), (bar, size_y, height), mat_idx=mat_idx)
    add_box(bm, (size_x / 2 - bar / 2, 0, z + height / 2), (bar, size_y, height), mat_idx=mat_idx)
    add_box(bm, (0, -size_y / 2 + bar / 2, z + height / 2), (size_x - 2 * bar, bar, height), mat_idx=mat_idx)
    add_box(bm, (0, size_y / 2 - bar / 2, z + height / 2), (size_x - 2 * bar, bar, height), mat_idx=mat_idx)

def _add_walkway_rails(bm, half_width, half_length, deck_z, rail_height=1.0, mat_idx=MAT_STRUCTURAL_GRAY):
    add_railing(bm, (-half_width, -half_length, deck_z), (-half_width, half_length, deck_z), height=rail_height, mat_idx=mat_idx, posts=3)
    add_railing(bm, (half_width, -half_length, deck_z), (half_width, half_length, deck_z), height=rail_height, mat_idx=mat_idx, posts=3)

def build_roof_curb_straight(bm):
    # 4m service curb with a raised gasket rail and one safety marker.
    add_box(bm, (0, 0, 0.12), (4.0, 0.32, 0.24), mat_idx=0)
    add_box(bm, (0, 0, 0.255), (3.8, 0.08, 0.05), mat_idx=MAT_STRUCTURAL_GRAY)
    add_box(bm, (-1.65, -0.18, 0.28), (0.16, 0.03, 0.08), mat_idx=2)

def build_roof_curb_corner(bm):
    # 2m x 2m L-shaped curb for a roof edge or equipment corner.
    add_box(bm, (0, 0.85, 0.14), (2.2, 0.3, 0.28), mat_idx=0)
    add_box(bm, (-0.95, -0.15, 0.14), (0.3, 1.7, 0.28), mat_idx=0)
    add_box(bm, (0, 0.69, 0.3), (2.05, 0.06, 0.05), mat_idx=MAT_STRUCTURAL_GRAY)
    add_box(bm, (-0.79, -0.1, 0.3), (0.06, 1.45, 0.05), mat_idx=MAT_STRUCTURAL_GRAY)
    add_box(bm, (-0.95, 0.85, 0.31), (0.15, 0.15, 0.05), mat_idx=2)

def build_roof_access_hatch(bm):
    # Raised 1.2m roof hatch with a hinged charcoal lid and pull handle.
    add_box(bm, (0, 0, 0.18), (1.35, 1.35, 0.36), mat_idx=0)
    _add_rect_frame(bm, 1.22, 1.22, 0.36, 0.12, bar=0.08, mat_idx=MAT_STRUCTURAL_GRAY)
    add_box(bm, (0.05, 0, 0.58), (1.12, 1.05, 0.08), rot=(0, 0, -0.08), mat_idx=MAT_STRUCTURAL_GRAY)
    add_cylinder(bm, (-0.5, -0.58, 0.64), (-0.1, -0.58, 0.64), radius=0.025, segments=8, mat_idx=2)

def build_roof_service_vent_stack(bm):
    # Short roof exhaust stack with a visible hood and orange service collar.
    add_box(bm, (0, 0, 0.08), (0.9, 0.9, 0.16), mat_idx=MAT_STRUCTURAL_GRAY)
    add_cylinder(bm, (0, 0, 0.16), (0, 0, 1.5), radius=0.27, segments=10, mat_idx=0)
    # Keep the orange collar outside the 270 mm stack skin.
    add_torus(bm, (0, 0, 0.72), major_r=0.297, minor_r=0.025, mat_idx=2)
    add_cone(bm, (0, 0, 1.5), (0, 0, 1.78), r1=0.38, r2=0.2, segments=10, mat_idx=MAT_STRUCTURAL_GRAY)

def build_roof_equipment_plinth(bm):
    # 2m equipment plinth with four anchor posts and a raised light top.
    add_box(bm, (0, 0, 0.15), (2.2, 2.2, 0.3), mat_idx=0)
    for x in (-0.82, 0.82):
        for y in (-0.82, 0.82):
            add_cylinder(bm, (x, y, 0.3), (x, y, 0.82), radius=0.08, segments=8, mat_idx=MAT_STRUCTURAL_GRAY)
            add_box(bm, (x, y, 0.31), (0.22, 0.22, 0.04), mat_idx=2)
    add_box(bm, (0, 0, 0.82), (1.9, 1.9, 0.1), mat_idx=0)

def build_roof_safety_post(bm):
    # Two anchor posts joined by a low fall-protection cable.
    for x in (-0.9, 0.9):
        add_box(bm, (x, 0, 0.03), (0.28, 0.28, 0.06), mat_idx=MAT_STRUCTURAL_GRAY)
        add_cylinder(bm, (x, 0, 0.05), (x, 0, 1.25), radius=0.045, segments=8, mat_idx=MAT_STRUCTURAL_GRAY)
        add_torus(bm, (x, 0, 1.2), major_r=0.07, minor_r=0.018, mat_idx=2)
    add_cylinder(bm, (-0.9, 0, 1.17), (0.9, 0, 1.17), radius=0.018, segments=6, mat_idx=0)

def build_roof_drain_scupper(bm):
    # Parapet scupper box with a downspout and open dark outlet.
    add_box(bm, (0, 0, 0.16), (1.0, 0.8, 0.32), mat_idx=0)
    add_box(bm, (0, -0.42, 0.34), (0.7, 0.08, 0.38), mat_idx=MAT_STRUCTURAL_GRAY)
    add_cylinder(bm, (0, 0.18, 0.28), (0, 0.18, 1.35), radius=0.13, segments=8, mat_idx=0)
    # Keep the orange collar outside the 130 mm downspout skin.
    add_torus(bm, (0, 0.18, 0.85), major_r=0.152, minor_r=0.02, mat_idx=2)

def build_roof_antenna_mast(bm):
    # Three-sided antenna mast with cross arms and a small orange beacon.
    for x, y in ((-0.35, -0.35), (0.35, -0.35), (0, 0.35)):
        add_cylinder(bm, (x, y, 0), (x * 0.45, y * 0.45, 3.0), radius=0.035, segments=6, mat_idx=MAT_STRUCTURAL_GRAY)
    for z in (0.9, 1.8, 2.7):
        add_cylinder(bm, (-0.22, 0, z), (0.22, 0, z), radius=0.018, segments=6, mat_idx=0)
    add_cylinder(bm, (0, 0, 2.75), (0, 0, 3.25), radius=0.025, segments=6, mat_idx=0)
    add_sphere(bm, (0, 0, 3.3), radius=0.08, segments=6, ring_count=4, mat_idx=2)

def build_roof_cable_bridge(bm):
    # Raised cable tray bridge that crosses a roof seam.
    for x in (-0.65, 0.65):
        # Keep the support ends inside the deck end faces.
        add_box(bm, (x, 0, 0.35), (0.12, 2.18, 0.7), mat_idx=MAT_STRUCTURAL_GRAY)
    add_box(bm, (0, 0, 0.72), (1.6, 2.2, 0.08), mat_idx=0)
    add_box(bm, (0, -1.08, 0.8), (1.7, 0.08, 0.16), mat_idx=MAT_STRUCTURAL_GRAY)
    add_box(bm, (0, 1.08, 0.8), (1.7, 0.08, 0.16), mat_idx=MAT_STRUCTURAL_GRAY)
    add_box(bm, (0, -1.12, 0.8), (0.22, 0.03, 0.08), mat_idx=2)

def build_roof_fall_arrest_anchor(bm):
    # Triangular roof anchor with a central eye and three floor plates.
    for x, y in ((-0.5, -0.4), (0.5, -0.4), (0, 0.5)):
        add_box(bm, (x, y, 0.03), (0.28, 0.28, 0.06), mat_idx=MAT_STRUCTURAL_GRAY)
        add_cylinder(bm, (x, y, 0.05), (0, 0, 1.1), radius=0.035, segments=6, mat_idx=MAT_STRUCTURAL_GRAY)
    add_torus(bm, (0, 0, 1.1), major_r=0.13, minor_r=0.025, axis='Y', mat_idx=2)

def build_roof_ladder_landing(bm):
    # Compact grated landing with one climb side and three guard sides.
    add_box(bm, (0, 0, 0.72), (1.8, 1.4, 0.1), mat_idx=0)
    add_grate(bm, (0, 0, 0.78), size_x=1.55, size_y=1.15, thickness=0.03, bars=5, mat_idx=MAT_STRUCTURAL_GRAY)
    add_railing(bm, (-0.82, -0.6, 0.8), (-0.82, 0.6, 0.8), height=0.95, mat_idx=MAT_STRUCTURAL_GRAY, posts=2)
    add_railing(bm, (-0.82, 0.6, 0.8), (0.82, 0.6, 0.8), height=0.95, mat_idx=MAT_STRUCTURAL_GRAY, posts=2)
    add_railing(bm, (0.82, 0.6, 0.8), (0.82, -0.6, 0.8), height=0.95, mat_idx=MAT_STRUCTURAL_GRAY, posts=2)
    for z in (0.2, 0.45, 0.7):
        add_cylinder(bm, (-0.55, -0.72, z), (0.55, -0.72, z), radius=0.025, segments=6, mat_idx=0)

def build_roof_duct_curb(bm):
    # Square HVAC curb with a raised duct collar and orange service corner.
    add_box(bm, (0, 0, 0.15), (2.0, 2.0, 0.3), mat_idx=0)
    _add_rect_frame(bm, 1.55, 1.55, 0.3, 0.55, bar=0.12, mat_idx=MAT_STRUCTURAL_GRAY)
    add_box(bm, (0, 0, 0.88), (1.6, 1.6, 0.08), mat_idx=0)
    add_box(bm, (-0.75, -0.75, 0.93), (0.16, 0.16, 0.06), mat_idx=2)

def build_walkway_straight(bm):
    # Wide 2m x 4m modular walkway with twin guard rails.
    add_box(bm, (0, 0, 0.06), (2.0, 4.0, 0.12), mat_idx=0)
    add_grate(bm, (0, 0, 0.14), size_x=1.78, size_y=3.8, thickness=0.03, bars=9, mat_idx=MAT_STRUCTURAL_GRAY)
    _add_walkway_rails(bm, 0.92, 2.0, 0.14)
    add_box(bm, (0, -1.98, 0.18), (1.8, 0.04, 0.08), mat_idx=2)

def build_walkway_t_junction(bm):
    # T-shaped walkway junction with a light deck and corner posts.
    add_box(bm, (0, 0.65, 0.06), (3.0, 1.2, 0.12), mat_idx=0)
    add_box(bm, (0, -0.75, 0.06), (1.2, 1.5, 0.12), mat_idx=0)
    for x, y in ((-1.35, 0.65), (1.35, 0.65), (-0.55, -1.35), (0.55, -1.35)):
        add_cylinder(bm, (x, y, 0.12), (x, y, 1.1), radius=0.03, segments=6, mat_idx=MAT_STRUCTURAL_GRAY)
    add_box(bm, (0, 0.65, 0.15), (2.7, 0.04, 0.08), mat_idx=2)

def build_walkway_l_junction(bm):
    # 90-degree L walkway for wrapping a tank or building corner.
    add_box(bm, (-0.9, 0, 0.06), (1.2, 3.0, 0.12), mat_idx=0)
    add_box(bm, (0.1, 0.9, 0.06), (2.0, 1.2, 0.12), mat_idx=0)
    for x, y in ((-1.45, -1.35), (1.05, 0.35), (-1.45, 1.35), (1.05, 1.45)):
        add_cylinder(bm, (x, y, 0.12), (x, y, 1.05), radius=0.03, segments=6, mat_idx=MAT_STRUCTURAL_GRAY)
    add_box(bm, (-1.45, 0.0, 0.16), (0.04, 2.7, 0.06), mat_idx=2)

def build_walkway_ramp(bm):
    # 2m wide access ramp rising 0.8m over a 3m run.
    add_wedge(bm, (-1.0, -1.5, 0), (1.0, 1.5, 0.8), slope_dir='+Y', mat_idx=0)
    add_railing(bm, (-0.88, -1.5, 0), (-0.88, 1.5, 0.8), height=0.9, mat_idx=MAT_STRUCTURAL_GRAY, posts=3)
    add_railing(bm, (0.88, -1.5, 0), (0.88, 1.5, 0.8), height=0.9, mat_idx=MAT_STRUCTURAL_GRAY, posts=3)
    # Keep the toe marker outside the ramp end and above the rail foot caps.
    add_box(bm, (0, -1.531, 0.051), (1.8, 0.06, 0.08), mat_idx=2)

def build_walkway_stair_short(bm):
    # Four open steel steps with handrails for a 0.8m rise.
    for i in range(4):
        add_box(bm, (0, -0.75 + i * 0.42, 0.1 + i * 0.2), (1.2, 0.45, 0.2), mat_idx=0)
    add_railing(bm, (-0.58, -0.9, 0.0), (-0.58, 0.9, 0.8), height=0.85, mat_idx=MAT_STRUCTURAL_GRAY, posts=3)
    add_railing(bm, (0.58, -0.9, 0.0), (0.58, 0.9, 0.8), height=0.85, mat_idx=MAT_STRUCTURAL_GRAY, posts=3)
    add_box(bm, (0, -0.98, 0.06), (1.0, 0.04, 0.08), mat_idx=2)

def build_walkway_landing(bm):
    # 2m square elevated landing with a clear entry side.
    for x, y in ((-0.82, -0.82), (-0.82, 0.82), (0.82, -0.82), (0.82, 0.82)):
        add_cylinder(bm, (x, y, 0), (x, y, 0.95), radius=0.05, segments=8, mat_idx=MAT_STRUCTURAL_GRAY)
    add_box(bm, (0, 0, 0.98), (2.0, 2.0, 0.1), mat_idx=0)
    add_grate(bm, (0, 0, 1.04), size_x=1.78, size_y=1.78, thickness=0.03, bars=5, mat_idx=MAT_STRUCTURAL_GRAY)
    add_railing(bm, (-0.9, 0.9, 1.05), (0.9, 0.9, 1.05), height=0.95, mat_idx=MAT_STRUCTURAL_GRAY, posts=3)
    # Move the toe marker 1 mm beyond the landing end face.
    add_box(bm, (0, -0.981, 1.0), (1.7, 0.04, 0.08), mat_idx=2)

def build_walkway_rail_gate(bm):
    # Swinging safety gate sized to close a 1m catwalk opening.
    add_cylinder(bm, (-0.55, 0, 0), (-0.55, 0, 1.15), radius=0.04, segments=8, mat_idx=MAT_STRUCTURAL_GRAY)
    add_cylinder(bm, (0.55, 0, 0), (0.55, 0, 1.15), radius=0.04, segments=8, mat_idx=MAT_STRUCTURAL_GRAY)
    add_cylinder(bm, (-0.5, 0, 1.02), (0.48, 0, 1.02), radius=0.03, segments=8, mat_idx=MAT_STRUCTURAL_GRAY)
    add_cylinder(bm, (-0.5, 0, 0.58), (0.48, 0, 0.58), radius=0.025, segments=8, mat_idx=MAT_STRUCTURAL_GRAY)
    add_cylinder(bm, (0.48, 0, 0.65), (0.48, 0, 0.9), radius=0.02, segments=6, mat_idx=2)

def build_walkway_rail_kickplate(bm):
    # Guard rail with a solid toe board to stop tools from leaving the deck.
    add_railing(bm, (-1.0, 0, 0), (1.0, 0, 0), height=1.0, mat_idx=MAT_STRUCTURAL_GRAY, posts=3)
    # Keep the toe board faces inside the rail foot tangent planes.
    add_box(bm, (0, -0.02, 0.12), (2.0, 0.04, 0.24), mat_idx=0)
    add_box(bm, (0.8, 0, 1.02), (0.16, 0.12, 0.08), mat_idx=2)

def build_walkway_bridge_narrow(bm):
    # One-meter wide six-meter bridge with two low support beams.
    add_box(bm, (0, 0, 0.1), (1.0, 6.0, 0.2), mat_idx=0)
    # Stop support end caps inside the deck end faces.
    add_i_beam(bm, (-0.35, -2.99, 0.0), (-0.35, 2.99, 0.0), width=0.14, depth=0.14, mat_idx=MAT_STRUCTURAL_GRAY)
    add_i_beam(bm, (0.35, -2.99, 0.0), (0.35, 2.99, 0.0), width=0.14, depth=0.14, mat_idx=MAT_STRUCTURAL_GRAY)
    _add_walkway_rails(bm, 0.46, 3.0, 0.2, rail_height=0.85)
    # Move the end marker 1 mm beyond the bridge end face.
    add_box(bm, (0, -2.981, 0.23), (0.8, 0.04, 0.08), mat_idx=2)

def build_walkway_grated_turn(bm):
    # L-shaped grated turn with an outer guard rail and orange inside marker.
    add_box(bm, (-0.65, 0, 0.06), (0.9, 2.8, 0.12), mat_idx=0)
    add_box(bm, (0.25, 0.95, 0.06), (1.7, 0.9, 0.12), mat_idx=0)
    add_grate(bm, (-0.65, 0, 0.14), size_x=0.72, size_y=2.55, thickness=0.03, bars=6, mat_idx=MAT_STRUCTURAL_GRAY)
    add_grate(bm, (0.25, 0.95, 0.14), size_x=1.5, size_y=0.7, thickness=0.03, bars=4, mat_idx=MAT_STRUCTURAL_GRAY)
    add_railing(bm, (-1.08, -1.4, 0.15), (-1.08, 1.4, 0.15), height=0.95, mat_idx=MAT_STRUCTURAL_GRAY, posts=3)
    add_railing(bm, (-1.08, 1.4, 0.15), (1.08, 1.4, 0.15), height=0.95, mat_idx=MAT_STRUCTURAL_GRAY, posts=3)
    add_box(bm, (0.25, 0.5, 0.18), (0.08, 0.08, 0.08), mat_idx=2)

def build_walkway_service_steps(bm):
    # Three compact service steps under a tank or machine access point.
    for i in range(3):
        add_box(bm, (0, -0.5 + i * 0.35, 0.1 + i * 0.16), (0.9, 0.38, 0.2), mat_idx=0)
    add_cylinder(bm, (-0.42, -0.65, 0.0), (-0.42, 0.35, 0.65), radius=0.025, segments=6, mat_idx=MAT_STRUCTURAL_GRAY)
    add_cylinder(bm, (0.42, -0.65, 0.0), (0.42, 0.35, 0.65), radius=0.025, segments=6, mat_idx=MAT_STRUCTURAL_GRAY)
    add_box(bm, (0, -0.72, 0.08), (0.75, 0.04, 0.08), mat_idx=2)

def build_walkway_cross_junction(bm):
    # Four-way 2m cross junction for a modular walkway network.
    add_box(bm, (0, 0, 0.06), (2.0, 2.0, 0.12), mat_idx=0)
    add_box(bm, (0, -1.45, 0.06), (1.0, 1.4, 0.12), mat_idx=0)
    add_box(bm, (0, 1.45, 0.06), (1.0, 1.4, 0.12), mat_idx=0)
    add_box(bm, (-1.45, 0, 0.06), (1.4, 1.0, 0.12), mat_idx=0)
    add_box(bm, (1.45, 0, 0.06), (1.4, 1.0, 0.12), mat_idx=0)
    for x, y in ((-0.92, -0.92), (-0.92, 0.92), (0.92, -0.92), (0.92, 0.92)):
        add_cylinder(bm, (x, y, 0.1), (x, y, 1.0), radius=0.03, segments=6, mat_idx=MAT_STRUCTURAL_GRAY)
    add_box(bm, (0, 0, 0.14), (0.18, 0.18, 0.06), mat_idx=2)

def build_service_bay_arch(bm):
    # Four-meter service bay opening with twin legs, header, and diagonal braces.
    for x in (-1.8, 1.8):
        add_i_beam(bm, (x, 0, 0), (x, 0, 3.6), width=0.22, depth=0.22, mat_idx=MAT_STRUCTURAL_GRAY)
        # Sink the foot one millimetre into the floor support plane.
        add_box(bm, (x, 0, 0.0605), (0.45, 0.45, 0.119), mat_idx=0)
    # Use a slightly narrower web so the header and leg front faces do not share a plane.
    add_i_beam(bm, (-1.8, 0, 3.6), (1.8, 0, 3.6), width=0.28, depth=0.28, web_t=0.018, mat_idx=0)
    add_cylinder(bm, (-1.6, 0, 3.2), (-1.0, 0, 3.6), radius=0.035, segments=6, mat_idx=MAT_STRUCTURAL_GRAY)
    add_cylinder(bm, (1.6, 0, 3.2), (1.0, 0, 3.6), radius=0.035, segments=6, mat_idx=MAT_STRUCTURAL_GRAY)
    add_box(bm, (0, -0.16, 3.62), (0.5, 0.04, 0.1), mat_idx=2)

def build_service_bay_canopy(bm):
    # Open 4m x 3m service canopy with a shallow sloped roof.
    for x in (-1.7, 1.7):
        for y in (-1.2, 1.2):
            add_cylinder(bm, (x, y, 0), (x, y, 2.8), radius=0.07, segments=8, mat_idx=MAT_STRUCTURAL_GRAY)
    add_wedge(bm, (-1.95, -1.45, 2.8), (1.95, 1.45, 3.2), slope_dir='+Y', mat_idx=0)
    add_i_beam(bm, (-1.8, -1.3, 2.8), (1.8, -1.3, 2.8), width=0.14, depth=0.14, mat_idx=MAT_STRUCTURAL_GRAY)
    add_i_beam(bm, (-1.8, 1.3, 3.2), (1.8, 1.3, 3.2), width=0.14, depth=0.14, mat_idx=MAT_STRUCTURAL_GRAY)
    add_box(bm, (-1.55, -1.25, 0.18), (0.16, 0.16, 0.08), mat_idx=2)

def build_service_bay_pillar(bm):
    # Reinforced 4m bay pillar with base plate, collar, and head plate.
    add_box(bm, (0, 0, 0.08), (0.72, 0.72, 0.16), mat_idx=0)
    add_i_beam(bm, (0, 0, 0.12), (0, 0, 3.8), width=0.35, depth=0.35, mat_idx=MAT_STRUCTURAL_GRAY)
    add_torus(bm, (0, 0, 2.2), major_r=0.23, minor_r=0.04, mat_idx=2)
    add_box(bm, (0, 0, 3.84), (0.9, 0.9, 0.16), mat_idx=0)

def build_service_bay_door_track(bm):
    # Overhead sliding-bay door track with two hangers and wheel housings.
    add_i_beam(bm, (-2.0, 0, 2.8), (2.0, 0, 2.8), width=0.18, depth=0.18, mat_idx=MAT_STRUCTURAL_GRAY)
    for x in (-1.0, 1.0):
        add_box(bm, (x, 0, 2.55), (0.35, 0.35, 0.22), mat_idx=0)
        add_cylinder(bm, (x, -0.22, 2.4), (x, 0.22, 2.4), radius=0.08, segments=8, mat_idx=MAT_STRUCTURAL_GRAY)
    add_box(bm, (0, -0.15, 2.85), (0.2, 0.05, 0.08), mat_idx=2)

def build_service_bay_workbench(bm):
    # Maintenance bench with shelf, back stop, and small vise.
    add_box(bm, (0, 0, 0.95), (2.2, 0.75, 0.14), mat_idx=0)
    for x in (-0.9, 0.9):
        add_cylinder(bm, (x, -0.25, 0), (x, -0.25, 0.92), radius=0.05, segments=8, mat_idx=MAT_STRUCTURAL_GRAY)
        add_cylinder(bm, (x, 0.25, 0), (x, 0.25, 0.92), radius=0.05, segments=8, mat_idx=MAT_STRUCTURAL_GRAY)
    # Keep the back stop one millimetre inside each worktop side face.
    add_box(bm, (0, 0.32, 1.32), (2.198, 0.08, 0.65), mat_idx=MAT_STRUCTURAL_GRAY)
    add_box(bm, (-0.55, -0.44, 1.08), (0.42, 0.26, 0.18), mat_idx=MAT_CHARCOAL)
    add_box(bm, (0.7, -0.4, 1.05), (0.16, 0.08, 0.12), mat_idx=2)

def build_service_bay_tool_board(bm):
    # Wall-mounted tool board with three readable tool silhouettes.
    add_box(bm, (0, 0, 1.35), (2.4, 0.12, 1.8), mat_idx=0)
    for x in (-0.85, 0, 0.85):
        add_cylinder(bm, (x, -0.09, 0.65), (x, -0.09, 1.05), radius=0.025, segments=6, mat_idx=MAT_STRUCTURAL_GRAY)
        add_box(bm, (x, -0.09, 1.18), (0.32, 0.03, 0.06), mat_idx=2 if x == 0 else MAT_STRUCTURAL_GRAY)
    add_box(bm, (0, -0.11, 2.05), (2.1, 0.04, 0.08), mat_idx=MAT_STRUCTURAL_GRAY)

def build_loading_platform(bm):
    # Four-meter dock platform at one-meter height with a guarded rear edge.
    for x in (-1.7, 1.7):
        for y in (-0.85, 0.85):
            add_i_beam(bm, (x, y, 0), (x, y, 0.95), width=0.18, depth=0.18, mat_idx=MAT_STRUCTURAL_GRAY)
    add_box(bm, (0, 0, 0.98), (4.0, 2.0, 0.12), mat_idx=0)
    add_railing(bm, (-1.9, 0.85, 1.05), (1.9, 0.85, 1.05), height=1.0, mat_idx=MAT_STRUCTURAL_GRAY, posts=4)
    add_box(bm, (0, -1.01, 1.03), (3.7, 0.05, 0.12), mat_idx=2)

def build_loading_platform_ramp(bm):
    # 2m wide vehicle ramp to a 1m loading deck.
    add_wedge(bm, (-1.0, -2.0, 0), (1.0, 2.0, 1.0), slope_dir='+Y', mat_idx=0)
    # Keep the loading box end cap inside the ramp end face.
    add_box(bm, (0, 1.75, 1.03), (2.0, 0.48, 0.08), mat_idx=MAT_STRUCTURAL_GRAY)
    # Stop the rail posts inside the ramp end face.
    add_railing(bm, (-0.88, -1.97, 0.0025), (-0.88, 1.97, 0.9975), height=0.95, mat_idx=MAT_STRUCTURAL_GRAY, posts=3)
    add_railing(bm, (0.88, -1.97, 0.0025), (0.88, 1.97, 0.9975), height=0.95, mat_idx=MAT_STRUCTURAL_GRAY, posts=3)
    # Keep the toe marker above the ramp end face and adjacent rail caps.
    add_box(bm, (0, -2.021, 0.046), (1.8, 0.06, 0.08), mat_idx=2)

def build_loading_dock_bumper(bm):
    # Three replaceable dock bumpers on a heavy mounting beam.
    add_box(bm, (0, 0, 0.65), (3.2, 0.28, 0.32), mat_idx=MAT_STRUCTURAL_GRAY)
    for x in (-1.2, 0, 1.2):
        add_box(bm, (x, -0.2, 0.75), (0.45, 0.22, 0.8), mat_idx=0)
        add_box(bm, (x, -0.33, 0.75), (0.26, 0.05, 0.18), mat_idx=2)
    add_box(bm, (0, 0, 0.08), (3.4, 0.42, 0.16), mat_idx=MAT_STRUCTURAL_GRAY)

def build_loading_dock_ladder(bm):
    # Short dock ladder with four rungs and a wide top landing hook.
    add_cylinder(bm, (-0.28, 0, 0), (-0.28, 0, 1.4), radius=0.03, segments=6, mat_idx=MAT_STRUCTURAL_GRAY)
    add_cylinder(bm, (0.28, 0, 0), (0.28, 0, 1.4), radius=0.03, segments=6, mat_idx=MAT_STRUCTURAL_GRAY)
    for z in (0.25, 0.55, 0.85, 1.15):
        add_cylinder(bm, (-0.28, 0, z), (0.28, 0, z), radius=0.02, segments=6, mat_idx=0)
    add_box(bm, (0, 0.12, 1.43), (0.8, 0.35, 0.1), mat_idx=0)
    add_box(bm, (0, -0.03, 1.5), (0.12, 0.04, 0.08), mat_idx=2)

def build_loading_gate(bm):
    # Swinging truck gate with a pivot post and striped horizontal arm.
    # Keep the post bottom one millimetre inside the base plate.
    add_box(bm, (-1.45, 0, 0.6505), (0.25, 0.25, 1.299), mat_idx=MAT_STRUCTURAL_GRAY)
    add_box(bm, (-1.45, 0, 0.06), (0.55, 0.55, 0.12), mat_idx=0)
    add_cylinder(bm, (-1.3, 0, 1.0), (1.65, 0, 1.0), radius=0.08, segments=8, mat_idx=2)
    for x in (-0.65, 0.05, 0.75):
        add_box(bm, (x, 0, 1.0), (0.26, 0.12, 0.12), mat_idx=0)
    add_box(bm, (1.62, 0, 0.05), (0.22, 0.22, 0.1), mat_idx=MAT_STRUCTURAL_GRAY)

def build_loading_wheel_stop(bm):
    # Low concrete wheel stop with two anchor plates and reflector tabs.
    add_wedge(bm, (-1.2, -0.25, 0), (1.2, 0.25, 0.35), slope_dir='+Y', mat_idx=0)
    for x in (-0.8, 0.8):
        add_box(bm, (x, 0, 0.38), (0.18, 0.32, 0.08), mat_idx=MAT_STRUCTURAL_GRAY)
        add_box(bm, (x, -0.27, 0.22), (0.12, 0.04, 0.12), mat_idx=2)

def build_pipe_manifold(bm):
    # Vertical four-port distribution manifold with branch valves.
    add_cylinder(bm, (0, 0, 0.12), (0, 0, 2.2), radius=0.18, segments=10, mat_idx=0)
    for z, x in ((0.5, -0.8), (1.05, 0.8), (1.6, -0.8)):
        add_cylinder(bm, (0, 0, z), (x, 0, z), radius=0.12, segments=8, mat_idx=0)
        add_cylinder(bm, (x, 0, z), (x * 1.15, 0, z), radius=0.18, segments=8, mat_idx=MAT_STRUCTURAL_GRAY)
        # Keep each orange collar outside the 120 mm branch skin.
        add_torus(bm, (x * 1.02, 0, z), major_r=0.14, minor_r=0.018, axis='X', mat_idx=2)
    add_box(bm, (0, 0, 0.05), (0.7, 0.7, 0.1), mat_idx=MAT_STRUCTURAL_GRAY)

def build_pipe_vertical_elbow(bm):
    # Riser that turns 90 degrees at the top into a horizontal socket.
    add_cylinder(bm, (0, 0, 0.12), (0, 0, 1.65), radius=0.15, segments=10, mat_idx=0)
    add_sphere(bm, (0, 0, 1.65), radius=0.16, segments=8, ring_count=6, mat_idx=0)
    add_cylinder(bm, (0, 0, 1.65), (0.9, 0, 1.65), radius=0.15, segments=10, mat_idx=0)
    add_cylinder(bm, (0, 0, 0.05), (0, 0, 0.12), radius=0.22, segments=10, mat_idx=MAT_STRUCTURAL_GRAY)
    add_cylinder(bm, (0.9, 0, 1.65), (1.0, 0, 1.65), radius=0.22, segments=10, mat_idx=MAT_STRUCTURAL_GRAY)
    # Keep the orange collar outside the 150 mm riser skin.
    add_torus(bm, (0, 0, 0.75), major_r=0.17, minor_r=0.018, mat_idx=2)

def build_pipe_flange_pair(bm):
    # Two independent flange plates linked by a short pipe spool.
    add_cylinder(bm, (0, -0.6, 0.4), (0, 0.6, 0.4), radius=0.13, segments=10, mat_idx=0)
    for y in (-0.68, 0.68):
        add_cylinder(bm, (0, y - 0.04, 0.4), (0, y + 0.04, 0.4), radius=0.24, segments=10, mat_idx=MAT_STRUCTURAL_GRAY)
        for a in range(4):
            angle = a * math.pi / 2
            add_cylinder(bm, (math.cos(angle) * 0.18, y, 0.4 + math.sin(angle) * 0.18), (math.cos(angle) * 0.18, y, 0.4 + math.sin(angle) * 0.18), radius=0.01, segments=6, mat_idx=2)
    # Keep the orange collar outside the 130 mm spool skin.
    add_torus(bm, (0, 0, 0.4), major_r=0.15, minor_r=0.018, axis='Y', mat_idx=2)

def build_pipe_inspection_port(bm):
    # Short capped inspection riser with a bolted collar and orange handle.
    add_cylinder(bm, (0, 0, 0), (0, 0, 0.75), radius=0.28, segments=10, mat_idx=0)
    add_cylinder(bm, (0, 0, 0.74), (0, 0, 0.84), radius=0.35, segments=10, mat_idx=MAT_STRUCTURAL_GRAY)
    add_cylinder(bm, (0, 0, 0.84), (0, 0, 0.98), radius=0.24, segments=10, mat_idx=0)
    # Lift the orange ring 2 mm above the collar cap.
    add_torus(bm, (0, 0, 0.862), major_r=0.31, minor_r=0.02, mat_idx=2)
    add_cylinder(bm, (-0.2, 0, 1.03), (0.2, 0, 1.03), radius=0.025, segments=6, mat_idx=2)

def build_utility_panel(bm):
    # Freestanding utility panel with face recesses and a disconnect handle.
    add_box(bm, (0, 0, 1.0), (1.1, 0.45, 2.0), mat_idx=0)
    add_box(bm, (0, -0.24, 1.0), (0.9, 0.04, 1.7), mat_idx=MAT_STRUCTURAL_GRAY)
    add_box(bm, (-0.25, -0.28, 1.35), (0.22, 0.04, 0.32), mat_idx=MAT_STRUCTURAL_GRAY)
    add_box(bm, (0.25, -0.28, 1.35), (0.22, 0.04, 0.32), mat_idx=MAT_STRUCTURAL_GRAY)
    add_cylinder(bm, (0.4, -0.28, 0.7), (0.55, -0.28, 0.85), radius=0.025, segments=6, mat_idx=2)

def build_utility_panel_double(bm):
    # Paired wall panels with a top conduit and distinct status markers.
    for x in (-0.65, 0.65):
        add_box(bm, (x, 0, 0.9), (1.0, 0.38, 1.8), mat_idx=0)
        add_box(bm, (x, -0.21, 0.9), (0.78, 0.04, 1.5), mat_idx=MAT_STRUCTURAL_GRAY)
        # Move each orange status marker 1 mm beyond the panel face.
        add_box(bm, (x, -0.251, 1.45), (0.12, 0.04, 0.16), mat_idx=2)
    add_cylinder(bm, (-0.6, 0.15, 1.85), (0.6, 0.15, 1.85), radius=0.06, segments=8, mat_idx=MAT_STRUCTURAL_GRAY)
    add_box(bm, (0, 0, 1.85), (0.22, 0.5, 0.12), mat_idx=MAT_STRUCTURAL_GRAY)

def build_utility_cabinet_low(bm):
    # Waist-high service cabinet with two doors and raised feet.
    add_box(bm, (0, 0, 0.55), (1.5, 0.7, 1.1), mat_idx=0)
    add_box(bm, (0, -0.37, 0.55), (1.35, 0.04, 0.92), mat_idx=MAT_STRUCTURAL_GRAY)
    add_box(bm, (-0.35, -0.4, 0.55), (0.04, 0.05, 0.06), mat_idx=2)
    add_box(bm, (0.35, -0.4, 0.55), (0.04, 0.05, 0.06), mat_idx=2)
    for x in (-0.58, 0.58):
        # Keep each foot bottom one millimetre above the cabinet floor plane.
        add_box(bm, (x, 0, 0.0805), (0.16, 0.2, 0.159), mat_idx=MAT_STRUCTURAL_GRAY)

def build_utility_bench(bm):
    # Compact utility bench with a lower shelf and a replaceable orange end cap.
    add_box(bm, (0, 0, 0.95), (1.8, 0.7, 0.12), mat_idx=0)
    add_box(bm, (0, 0, 0.35), (1.5, 0.55, 0.1), mat_idx=MAT_STRUCTURAL_GRAY)
    for x in (-0.7, 0.7):
        add_cylinder(bm, (x, -0.25, 0), (x, -0.25, 0.9), radius=0.04, segments=8, mat_idx=MAT_STRUCTURAL_GRAY)
        add_cylinder(bm, (x, 0.25, 0), (x, 0.25, 0.9), radius=0.04, segments=8, mat_idx=MAT_STRUCTURAL_GRAY)
    add_box(bm, (0.72, -0.38, 1.0), (0.16, 0.05, 0.1), mat_idx=2)

def build_utility_tool_rack(bm):
    # Vertical tool rack with a header bar and three large hanging hooks.
    add_box(bm, (0, 0, 1.25), (1.8, 0.14, 2.5), mat_idx=0)
    add_box(bm, (0, -0.1, 2.28), (1.6, 0.08, 0.12), mat_idx=MAT_STRUCTURAL_GRAY)
    for x in (-0.6, 0, 0.6):
        add_cylinder(bm, (x, -0.12, 1.9), (x, -0.12, 1.45), radius=0.025, segments=6, mat_idx=MAT_STRUCTURAL_GRAY)
        add_cylinder(bm, (x, -0.12, 1.45), (x + 0.12, -0.12, 1.35), radius=0.025, segments=6, mat_idx=MAT_STRUCTURAL_GRAY)
    add_box(bm, (-0.68, -0.14, 2.35), (0.18, 0.04, 0.18), mat_idx=2)

def build_utility_drain_channel(bm):
    # Two-meter trench channel with removable bars and a sump at one end.
    add_box(bm, (0, 0, 0.1), (2.4, 0.7, 0.2), mat_idx=MAT_STRUCTURAL_GRAY)
    add_box(bm, (0, 0, 0.22), (2.1, 0.48, 0.08), mat_idx=0)
    for x in (-0.75, -0.25, 0.25, 0.75):
        add_box(bm, (x, 0, 0.29), (0.08, 0.56, 0.04), mat_idx=MAT_STRUCTURAL_GRAY)
    add_cylinder(bm, (1.0, 0, 0.25), (1.0, 0, 0.42), radius=0.16, segments=8, mat_idx=MAT_STRUCTURAL_GRAY)
    add_box(bm, (-1.05, -0.3, 0.32), (0.18, 0.05, 0.08), mat_idx=2)

def build_utility_sewer_opening(bm):
    # Open square sewer ring with a visible dark shaft and lifting tabs.
    add_box(bm, (0, 0, 0.08), (1.5, 1.5, 0.16), mat_idx=MAT_STRUCTURAL_GRAY)
    add_box(bm, (0, 0, 0.18), (1.22, 1.22, 0.06), mat_idx=1)
    _add_rect_frame(bm, 1.38, 1.38, 0.18, 0.18, bar=0.16, mat_idx=0)
    add_cylinder(bm, (-0.5, -0.5, 0.27), (-0.5, -0.5, 0.34), radius=0.04, segments=6, mat_idx=2)
    add_cylinder(bm, (0.5, -0.5, 0.27), (0.5, -0.5, 0.34), radius=0.04, segments=6, mat_idx=2)

def build_utility_meter_pedestal(bm):
    # Freestanding meter pedestal with a readable face, conduit, and anchor foot.
    add_box(bm, (0, 0, 0.65), (0.7, 0.55, 1.3), mat_idx=0)
    add_box(bm, (0, -0.3, 1.0), (0.48, 0.04, 0.55), mat_idx=MAT_STRUCTURAL_GRAY)
    add_cylinder(bm, (0, -0.34, 1.0), (0, -0.37, 1.0), radius=0.14, segments=10, mat_idx=0)
    # Keep the orange meter ring outside the 140 mm gauge skin.
    add_torus(bm, (0, -0.38, 1.0), major_r=0.162, minor_r=0.02, axis='Y', mat_idx=2)
    add_cylinder(bm, (0, 0, 0.03), (0, 0, 0.3), radius=0.08, segments=8, mat_idx=MAT_STRUCTURAL_GRAY)
    add_box(bm, (0, 0, 0.04), (0.95, 0.8, 0.08), mat_idx=0)

# ==============================================================================
# MODEL REGISTRY (291 items)
# ==============================================================================

MODELS_CATALOG = [
    # WEAPONS (26)
    {"id": "sword", "label": "Arming Sword", "category": "weapons", "builder": build_sword, "description": "Classic double-edged steel sword with cruciform hilt and counterweighted pommel.", "tags": ["held", "melee", "blade", "sword", "grip:center"]},
    {"id": "katana", "label": "Curved Katana", "category": "weapons", "builder": build_katana, "description": "Traditional single-edge curved katana with wrapped tsuka and disc tsuba.", "tags": ["held", "melee", "blade", "katana", "grip:center"]},
    {"id": "staff", "label": "Bo Staff", "category": "weapons", "builder": build_staff, "description": "Reinforced 1.8m martial arts quarterstaff with steel ferrule collars.", "tags": ["held", "melee", "blunt", "staff", "grip:center"]},
    {"id": "pistol", "label": "Tactical Pistol", "category": "weapons", "builder": build_pistol, "description": "Semi-automatic polymer sidearm with tactical slide and high-visibility front sight.", "tags": ["held", "ranged", "firearm", "pistol", "grip:handle"]},
    {"id": "rifle", "label": "Assault Rifle", "category": "weapons", "builder": build_rifle, "description": "Modular combat assault rifle with curved magazine, muzzle brake, and rear stock.", "tags": ["held", "ranged", "firearm", "rifle", "grip:handle"]},
    {"id": "shotgun", "label": "Pump Shotgun", "category": "weapons", "builder": build_shotgun, "description": "Tactical 12-gauge pump-action shotgun with ribbed slide and twin tube magazine.", "tags": ["held", "ranged", "firearm", "shotgun", "grip:handle"]},
    {"id": "bow", "label": "Recurve Bow", "category": "weapons", "builder": build_bow, "description": "Laminated recurve composite hunting bow with contoured riser grip.", "tags": ["held", "ranged", "archery", "bow", "grip:center"]},
    {"id": "bat", "label": "Baseball Bat", "category": "weapons", "builder": build_bat, "description": "Tapered wooden baseball bat with friction grip tape and safety accent ring.", "tags": ["held", "melee", "blunt", "sports", "bat", "grip:handle"]},
    {"id": "dagger", "label": "Combat Dagger", "category": "weapons", "builder": build_dagger, "description": "Double-edged tactical combat dagger with grooved rubber grip.", "tags": ["held", "melee", "blade", "dagger", "grip:handle"]},
    {"id": "axe-battle", "label": "Battle Axe", "category": "weapons", "builder": build_axe_battle, "description": "Double-bitted medieval combat battleaxe with reinforced top thrusting spike.", "tags": ["held", "melee", "axe", "heavy", "grip:center"]},
    {"id": "axe-hatchet", "label": "Survival Hatchet", "category": "weapons", "builder": build_axe_hatchet, "description": "Compact single-handed tactical hatchet with hammer poll.", "tags": ["held", "melee", "axe", "tool", "grip:handle"]},
    {"id": "mace", "label": "Flanged Mace", "category": "weapons", "builder": build_mace, "description": "Six-flanged steel mace with crown spike for heavy armor penetration.", "tags": ["held", "melee", "blunt", "mace", "grip:handle"]},
    {"id": "spear", "label": "War Spear", "category": "weapons", "builder": build_spear, "description": "Long 2.2m ash-wood spear with leaf-shaped broadhead blade.", "tags": ["held", "melee", "polearm", "spear", "grip:center"]},
    {"id": "halberd", "label": "Polearm Halberd", "category": "weapons", "builder": build_halberd, "description": "Combined axe blade, rear armor hook, and top thrusting spearhead on 2.2m pole.", "tags": ["held", "melee", "polearm", "halberd", "grip:center"]},
    {"id": "scythe", "label": "War Scythe", "category": "weapons", "builder": build_scythe, "description": "Sweeping curved combat war scythe with bilateral steering handles.", "tags": ["held", "melee", "blade", "scythe", "grip:center"]},
    {"id": "hammer-war", "label": "Warhammer", "category": "weapons", "builder": build_hammer_war, "description": "Knightly warhammer with flat rectangular face and rear armor-piercing raven beak.", "tags": ["held", "melee", "blunt", "hammer", "grip:handle"]},
    {"id": "club-spiked", "label": "Spiked Club", "category": "weapons", "builder": build_club_spiked, "description": "Heavy hardwood trench club reinforced with iron pyramid studs.", "tags": ["held", "melee", "blunt", "club", "grip:handle"]},
    {"id": "nunchaku", "label": "Nunchaku", "category": "weapons", "builder": build_nunchaku, "description": "Dual linked martial arts hardwood sticks connected by steel chain links.", "tags": ["held", "melee", "martial-arts", "nunchaku", "grip:stick"]},
    {"id": "sai", "label": "Martial Sai", "category": "weapons", "builder": build_sai, "description": "Traditional pointed martial arts truncheon with twin curved prong guards.", "tags": ["held", "melee", "martial-arts", "sai", "grip:handle"]},
    {"id": "shuriken", "label": "Ninja Shuriken", "category": "weapons", "builder": build_shuriken, "description": "Precision four-pointed throwing star with beveled aerodynamic edges.", "tags": ["held", "thrown", "ninja", "shuriken", "grip:center"]},
    {"id": "kunai", "label": "Throwing Kunai", "category": "weapons", "builder": build_kunai, "description": "Diamond-bladed ninja throwing dagger with circular ring pommel.", "tags": ["held", "thrown", "ninja", "kunai", "grip:handle"]},
    {"id": "grenade-frag", "label": "Frag Grenade", "category": "weapons", "builder": build_grenade_frag, "description": "Segmented fragmentation grenade with spring-loaded spoon lever and pull ring.", "tags": ["held", "explosive", "thrown", "grenade", "grip:body"]},
    {"id": "sniper-rifle", "label": "Sniper Rifle", "category": "weapons", "builder": build_sniper_rifle, "description": "Heavy anti-materiel bolt-action rifle with high-power telescopic optic and bipod.", "tags": ["held", "ranged", "firearm", "sniper", "grip:handle"]},
    {"id": "submachine-gun", "label": "Compact SMG", "category": "weapons", "builder": build_submachine_gun, "description": "High-rate tactical submachine gun with integral silencer and vertical foregrip.", "tags": ["held", "ranged", "firearm", "smg", "grip:handle"]},
    {"id": "revolver", "label": "Heavy Revolver", "category": "weapons", "builder": build_revolver, "description": "Solid-frame six-shot heavy magnum revolver with fluted cylinder.", "tags": ["held", "ranged", "firearm", "revolver", "grip:handle"]},
    {"id": "shield-riot", "label": "Riot Shield", "category": "weapons", "builder": build_shield_riot, "description": "Tactical curved ballistic riot shield with horizontal vision viewport slit.", "tags": ["held", "defense", "shield", "riot", "grip:strap"]},

    # CITY (26)
    {"id": "street-lamp", "label": "Street Lamp", "category": "city", "builder": build_street_lamp, "description": "Standard 5m municipal street lamp with curved outreach arm and trapezoid lantern.", "tags": ["lighting", "city", "furniture", "street", "base:floor"]},
    {"id": "street-lamp-double", "label": "Double Street Lamp", "category": "city", "builder": build_street_lamp_double, "description": "Grand boulevard twin-arm street light with dual symmetric lantern fixtures.", "tags": ["lighting", "city", "boulevard", "base:floor"]},
    {"id": "bench-park", "label": "Park Bench", "category": "city", "builder": build_bench_park, "description": "Slatted timber and cast-iron public park bench with armrests.", "tags": ["furniture", "city", "park", "seating", "base:floor"]},
    {"id": "trash-can", "label": "Public Trash Can", "category": "city", "builder": build_trash_can, "description": "Cylindrical ribbed steel municipal waste receptacle with domed lid.", "tags": ["sanitation", "city", "furniture", "base:floor"]},
    {"id": "dumpster", "label": "City Dumpster", "category": "city", "builder": build_dumpster, "description": "Heavy-duty 2m commercial dumpster with dual hinged plastic lids and fork sleeves.", "tags": ["sanitation", "city", "industrial", "waste", "base:floor"]},
    {"id": "fire-hydrant", "label": "Fire Hydrant", "category": "city", "builder": build_fire_hydrant, "description": "Cast-iron three-way municipal fire hydrant with safety pentagon operating nut.", "tags": ["utility", "city", "emergency", "fire", "base:floor"]},
    {"id": "mailbox", "label": "Postal Mailbox", "category": "city", "builder": build_mailbox, "description": "Freestanding curved postal collection box with front drop-hopper door.", "tags": ["utility", "city", "postal", "base:floor"]},
    {"id": "bus-stop-shelter", "label": "Bus Stop Shelter", "category": "city", "builder": build_bus_stop_shelter, "description": "Steel and glass municipal transit passenger waiting shelter with integrated bench.", "tags": ["transit", "city", "architecture", "shelter", "base:floor"]},
    {"id": "traffic-light", "label": "Traffic Light", "category": "city", "builder": build_traffic_light, "description": "Three-lens vertical traffic signal head with hooded visors on tall pole.", "tags": ["traffic", "city", "signal", "road", "base:floor"]},
    {"id": "street-sign-pole", "label": "Street Sign Pole", "category": "city", "builder": build_street_sign_pole, "description": "Intersection street name marker post with crossing directional blade signs.", "tags": ["signage", "city", "road", "base:floor"]},
    {"id": "parking-meter", "label": "Parking Meter", "category": "city", "builder": build_parking_meter, "description": "Electronic curbside parking meter with solar cap and payment display screen.", "tags": ["utility", "city", "parking", "base:floor"]},
    {"id": "news-stand", "label": "News Box", "category": "city", "builder": build_news_stand, "description": "Sidewalk coin-operated newspaper vending kiosk with transparent headline glass.", "tags": ["furniture", "city", "kiosk", "base:floor"]},
    {"id": "bicycle-rack", "label": "Bicycle Rack", "category": "city", "builder": build_bicycle_rack, "description": "Tubular inverted-U steel bicycle parking stand on floor anchor plates.", "tags": ["transit", "city", "furniture", "bike", "base:floor"]},
    {"id": "telephone-booth", "label": "Phone Booth", "category": "city", "builder": build_telephone_booth, "description": "Urban public telephone cubicle with side acoustic baffles and payphone unit.", "tags": ["communication", "city", "kiosk", "base:floor"]},
    {"id": "planter-concrete", "label": "Concrete Planter", "category": "city", "builder": build_planter_concrete, "description": "Square 1.2m urban architectural concrete planter with trimmed evergreen shrub.", "tags": ["greenery", "city", "landscaping", "planter", "base:floor"]},
    {"id": "manhole-cover", "label": "Manhole Cover", "category": "city", "builder": build_manhole_cover, "description": "Heavy cast-iron utility sewer manhole with textured non-slip diamond ring tread.", "tags": ["utility", "city", "ground", "sewer", "base:floor"]},
    {"id": "billboard-small", "label": "Sidewalk Sign", "category": "city", "builder": build_billboard_small, "description": "Folding wooden A-frame sidewalk sandwich board chalkboard display.", "tags": ["signage", "city", "commercial", "base:floor"]},
    {"id": "billboard-highway", "label": "Highway Billboard", "category": "city", "builder": build_billboard_highway, "description": "Elevated 6m wide commercial advertising billboard on dual I-beam structural pylons.", "tags": ["signage", "city", "highway", "large", "base:floor"]},
    {"id": "fire-escape", "label": "Fire Escape Landing", "category": "city", "builder": build_fire_escape, "description": "Exterior steel fire escape platform with grated deck and safety railing.", "tags": ["architecture", "city", "safety", "landing", "base:floor"]},
    {"id": "subway-entrance", "label": "Subway Portal", "category": "city", "builder": build_subway_entrance, "description": "Downtown metro subway stair entrance with decorative balustrade and globe lanterns.", "tags": ["transit", "city", "metro", "subway", "base:floor"]},
    {"id": "curb-straight", "label": "Street Curb Straight", "category": "city", "builder": build_curb_straight, "description": "Modular 2m granite sidewalk curb block with beveled transition lip.", "tags": ["modular", "city", "road", "curb", "base:floor"]},
    {"id": "curb-corner", "label": "Street Curb Corner", "category": "city", "builder": build_curb_corner, "description": "Quarter-circle 90-degree curved street curb intersection block.", "tags": ["modular", "city", "road", "curb", "base:floor"]},
    {"id": "sidewalk-slab", "label": "Sidewalk Slab", "category": "city", "builder": build_sidewalk_slab, "description": "2x2m modular concrete sidewalk pavement tile with expansion seams.", "tags": ["modular", "city", "pavement", "walkway", "base:floor"]},
    {"id": "crosswalk-tile", "label": "Crosswalk Tile", "category": "city", "builder": build_crosswalk_tile, "description": "4x2m road section with high-contrast white zebra pedestrian crossing stripes.", "tags": ["modular", "city", "road", "crosswalk", "base:floor"]},
    {"id": "fountain-plaza", "label": "Plaza Fountain", "category": "city", "builder": build_fountain_plaza, "description": "Tiered civic stone fountain with wide circular basin and center pedestal bowl.", "tags": ["architecture", "city", "civic", "fountain", "base:floor"]},
    {"id": "security-camera-pole", "label": "CCTV Camera Pole", "category": "city", "builder": build_security_camera_pole, "description": "4m surveillance camera mast with pan-tilt dome camera and status LED.", "tags": ["security", "city", "camera", "mast", "base:floor"]},

    # PARKOUR (22)
    {"id": "vault-box", "label": "Vault Box", "category": "parkour", "builder": build_vault_box, "description": "Angled wooden parkour vaulting box with padded vinyl top landing deck.", "tags": ["parkour", "obstacle", "vault", "trainer", "base:floor"]},
    {"id": "vault-rail", "label": "Vault Rail", "category": "parkour", "builder": build_vault_rail, "description": "Low 2m horizontal tubular steel vaulting pipe bar on dual flange posts.", "tags": ["parkour", "obstacle", "rail", "vault", "base:floor"]},
    {"id": "balance-beam", "label": "Balance Beam", "category": "parkour", "builder": build_balance_beam, "description": "Narrow 3.2m balance trainer beam elevated 0.45m on heavy H-supports.", "tags": ["parkour", "obstacle", "balance", "trainer", "base:floor"]},
    {"id": "precision-trainer", "label": "Precision Trainer", "category": "parkour", "builder": build_precision_trainer, "description": "Low timber landing block with non-slip charcoal rubber foot strike pad.", "tags": ["parkour", "obstacle", "precision", "trainer", "base:floor"]},
    {"id": "warped-wall", "label": "Warped Wall", "category": "parkour", "builder": build_warped_wall, "description": "Curved ninja warrior style running wall with top grab ledge lip.", "tags": ["parkour", "obstacle", "climbing", "warped-wall", "base:floor"]},
    {"id": "climbing-wall-modular", "label": "Modular Climbing Wall", "category": "parkour", "builder": build_climbing_wall_modular, "description": "Vertical plywood bouldering panel set with 16 geometric climbing holds.", "tags": ["parkour", "obstacle", "climbing", "bouldering", "base:floor"]},
    {"id": "monkey-bars", "label": "Monkey Bars", "category": "parkour", "builder": build_monkey_bars, "description": "Overhead 4m monkey bar obstacle with 9 horizontal steel rungs.", "tags": ["parkour", "obstacle", "overhead", "bars", "base:floor"]},
    {"id": "scaffolding-tower", "label": "Scaffolding Tower", "category": "parkour", "builder": build_scaffolding_tower, "description": "Modular 2x2m steel tube construction scaffolding with plank work platform.", "tags": ["parkour", "obstacle", "climbing", "scaffolding", "base:floor"]},
    {"id": "landing-mat", "label": "Crash Mat", "category": "parkour", "builder": build_landing_mat, "description": "Thick foam safety impact crash mat with reinforced perimeter handles.", "tags": ["parkour", "safety", "mat", "cushion", "base:floor"]},
    {"id": "springboard", "label": "Gymnastics Springboard", "category": "parkour", "builder": build_springboard, "description": "Curved wooden gymnastics springboard with dual steel compression coil springs.", "tags": ["parkour", "sports", "jump", "springboard", "base:floor"]},
    {"id": "climbing-rope", "label": "Climbing Rope", "category": "parkour", "builder": build_climbing_rope, "description": "Braided overhead hemp climbing rope ending in heavy weighted stopper knot.", "tags": ["parkour", "climbing", "rope", "overhead", "base:floor"]},
    {"id": "swinging-ring", "label": "Gymnastics Rings", "category": "parkour", "builder": build_swinging_ring, "description": "Dual suspended gymnastics rings on high-tensile nylon ceiling straps.", "tags": ["parkour", "gymnastics", "rings", "overhead", "base:floor"]},
    {"id": "trapeze-bar", "label": "Trapeze Bar", "category": "parkour", "builder": build_trapeze_bar, "description": "Suspended steel trapeze flight bar with padded center grip sleeve.", "tags": ["parkour", "overhead", "bar", "trapeze", "base:floor"]},
    {"id": "slackline-rig", "label": "Slackline Rig", "category": "parkour", "builder": build_slackline_rig, "description": "Tensioned 3.6m flat nylon webbing trainer line with ratchet anchor posts.", "tags": ["parkour", "balance", "slackline", "trainer", "base:floor"]},
    {"id": "tire-obstacle", "label": "Obstacle Tire", "category": "parkour", "builder": build_tire_obstacle, "description": "Heavy commercial tractor tire set flat on floor for jumping and vaulting.", "tags": ["parkour", "obstacle", "tire", "heavy", "base:floor"]},
    {"id": "tire-stack", "label": "Tire Stack", "category": "parkour", "builder": build_tire_stack, "description": "Pyramidal stack of three heavy off-road tires bound with safety strapping.", "tags": ["parkour", "obstacle", "tire", "climbing", "base:floor"]},
    {"id": "plyo-box-low", "label": "Low Plyo Box", "category": "parkour", "builder": build_plyo_box_low, "description": "Low 30cm wooden plyometric jump training box with non-slip top.", "tags": ["parkour", "training", "jump", "plyo", "base:floor"]},
    {"id": "plyo-box-med", "label": "Medium Plyo Box", "category": "parkour", "builder": build_plyo_box_med, "description": "Medium 60cm wooden plyometric jump training box with side grab ports.", "tags": ["parkour", "training", "jump", "plyo", "base:floor"]},
    {"id": "plyo-box-high", "label": "High Plyo Box", "category": "parkour", "builder": build_plyo_box_high, "description": "High 90cm competition plyometric jump box with chamfered edges.", "tags": ["parkour", "training", "jump", "plyo", "base:floor"]},
    {"id": "hurdle-adjustable", "label": "Adjustable Hurdle", "category": "parkour", "builder": build_hurdle_adjustable, "description": "Athletic track training hurdle with counterbalanced floor legs.", "tags": ["parkour", "sports", "hurdle", "jump", "base:floor"]},
    {"id": "rooftop-gap-plank", "label": "Rooftop Plank", "category": "parkour", "builder": build_rooftop_gap_plank, "description": "Heavy 3.2m reinforced timber scaffolding plank for spanning alley gaps.", "tags": ["parkour", "rooftop", "bridge", "wood", "base:floor"]},
    {"id": "wall-run-wedge", "label": "Wall Run Wedge", "category": "parkour", "builder": build_wall_run_wedge, "description": "Angled 45-degree wooden kicker ramp wedge for wall spin training.", "tags": ["parkour", "ramp", "kicker", "trainer", "base:floor"]},

    # SPORTS (16)
    {"id": "basketball", "label": "Basketball", "category": "sports", "builder": build_basketball, "description": "Regulation size-7 basketball with recessed black grip seam channels.", "tags": ["held", "sports", "ball", "basketball", "equipment"]},
    {"id": "football", "label": "American Football", "category": "sports", "builder": build_football, "description": "Prolate spheroid leather football with white cross-laces and nose tips.", "tags": ["held", "sports", "ball", "football", "equipment"]},
    {"id": "soccer-ball", "label": "Soccer Ball", "category": "sports", "builder": build_soccer_ball, "description": "Classic geometric panel soccer ball with interlocking black and white patches.", "tags": ["held", "sports", "ball", "soccer", "equipment"]},
    {"id": "volleyball", "label": "Volleyball", "category": "sports", "builder": build_volleyball, "description": "Tri-panel striped official leather volleyball sphere.", "tags": ["held", "sports", "ball", "volleyball", "equipment"]},
    {"id": "tennis-racket", "label": "Tennis Racket", "category": "sports", "builder": build_tennis_racket, "description": "Graphite composite tennis racket with woven string bed and cushion grip.", "tags": ["held", "sports", "racket", "tennis", "grip:handle"]},
    {"id": "tennis-ball", "label": "Tennis Ball", "category": "sports", "builder": build_tennis_ball, "description": "Felt covered tennis ball with curved perimeter seam groove.", "tags": ["held", "sports", "ball", "tennis", "equipment"]},
    {"id": "hockey-stick", "label": "Hockey Stick", "category": "sports", "builder": build_hockey_stick, "description": "Composite ice and street hockey stick with taped shaft and curved blade.", "tags": ["held", "sports", "hockey", "stick", "grip:shaft"]},
    {"id": "hockey-puck", "label": "Hockey Puck", "category": "sports", "builder": build_hockey_puck, "description": "Solid vulcanized black rubber hockey puck with knurled grip edge.", "tags": ["held", "sports", "hockey", "puck", "equipment"]},
    {"id": "golf-club", "label": "Golf Driver", "category": "sports", "builder": build_golf_club, "description": "Steel-shafted golf driver club with aerodynamic weighted head.", "tags": ["held", "sports", "golf", "club", "grip:handle"]},
    {"id": "bowling-pin", "label": "Bowling Pin", "category": "sports", "builder": build_bowling_pin, "description": "Bottle-necked competition bowling pin with dual red neck ring stripes.", "tags": ["sports", "bowling", "pin", "target", "base:floor"]},
    {"id": "bowling-ball", "label": "Bowling Ball", "category": "sports", "builder": build_bowling_ball, "description": "Weighted bowling sphere with three drilled finger grip sockets.", "tags": ["held", "sports", "bowling", "ball", "equipment"]},
    {"id": "boxing-glove", "label": "Boxing Glove", "category": "sports", "builder": build_boxing_glove, "description": "Padded leather combat boxing glove with thumb guard and velcro wrist strap.", "tags": ["held", "sports", "boxing", "combat", "glove"]},
    {"id": "punching-bag", "label": "Heavy Punching Bag", "category": "sports", "builder": build_punching_bag, "description": "Suspended cylindrical leather heavy bag hanging by 3 steel chain links.", "tags": ["sports", "training", "boxing", "bag", "base:floor"]},
    {"id": "basketball-hoop", "label": "Basketball Hoop", "category": "sports", "builder": build_basketball_hoop, "description": "Regulation backboard with safety-orange breakaway steel hoop and net.", "tags": ["sports", "basketball", "hoop", "court", "base:floor"]},
    {"id": "soccer-goal", "label": "Soccer Goal", "category": "sports", "builder": build_soccer_goal, "description": "Tubular steel 3x2m soccer goal frame with rear netting depth.", "tags": ["sports", "soccer", "goal", "court", "base:floor"]},
    {"id": "weight-dumbbell", "label": "Hex Dumbbell", "category": "sports", "builder": build_weight_dumbbell, "description": "Solid hexagonal cast-iron dumbbell with knurled steel center bar.", "tags": ["held", "sports", "fitness", "weight", "grip:center"]},

    # SCI-FI (16)
    {"id": "sci-fi-rifle", "label": "Sci-Fi Energy Rifle", "category": "sci-fi", "builder": build_sci_fi_rifle, "description": "Bullpup directed energy blaster rifle with orange cooling fins and twin emitters.", "tags": ["held", "sci-fi", "ranged", "blaster", "grip:handle"]},
    {"id": "plasma-pistol", "label": "Plasma Pistol", "category": "sci-fi", "builder": build_plasma_pistol, "description": "Compact sci-fi plasma sidearm with concentric heat discharge coils.", "tags": ["held", "sci-fi", "ranged", "pistol", "grip:handle"]},
    {"id": "laser-cannon", "label": "Laser Cannon", "category": "sci-fi", "builder": build_laser_cannon, "description": "Heavy shoulder-supported directed beam cannon with cylindrical capacitor.", "tags": ["held", "sci-fi", "heavy", "cannon", "grip:handle"]},
    {"id": "energy-sword", "label": "Energy Sword", "category": "sci-fi", "builder": build_energy_sword, "description": "High-frequency plasma blade projector with dual glowing energy prongs.", "tags": ["held", "sci-fi", "melee", "energy", "grip:center"]},
    {"id": "cryo-capsule", "label": "Cryo Stasis Capsule", "category": "sci-fi", "builder": build_cryo_capsule, "description": "Vertical 2.4m cryogenic hibernation chamber with oval observation viewport.", "tags": ["sci-fi", "stasis", "capsule", "medical", "base:floor"]},
    {"id": "hologram-projector", "label": "Hologram Projector", "category": "sci-fi", "builder": build_hologram_projector, "description": "Floor-mounted circular holographic projection lens with tri-focus emitter heads.", "tags": ["sci-fi", "hologram", "projector", "display", "base:floor"]},
    {"id": "teleporter-pad", "label": "Teleporter Pad", "category": "sci-fi", "builder": build_teleporter_pad, "description": "Octagonal 2m teleportation platform with perimeter magnetic confinement ring.", "tags": ["sci-fi", "teleport", "platform", "transport", "base:floor"]},
    {"id": "power-core", "label": "Fusion Power Core", "category": "sci-fi", "builder": build_power_core, "description": "Cylindrical 2.2m fusion reaction containment core with magnetic ring coils.", "tags": ["sci-fi", "energy", "generator", "core", "base:floor"]},
    {"id": "server-rack-futuristic", "label": "Quantum Server Rack", "category": "sci-fi", "builder": build_server_rack_futuristic, "description": "Tall 2.2m sci-fi supercomputing bay with stacked blade trays and fiber channels.", "tags": ["sci-fi", "computer", "server", "data", "base:floor"]},
    {"id": "drone-scout", "label": "Scout Drone", "category": "sci-fi", "builder": build_drone_scout, "description": "Autonomous quad-ducted surveillance drone with central orange optical sensor.", "tags": ["sci-fi", "drone", "robotics", "scout", "base:floor"]},
    {"id": "shield-generator", "label": "Shield Generator", "category": "sci-fi", "builder": build_shield_generator, "description": "Tripod-mounted deflector shield projector with spherical field emitter.", "tags": ["sci-fi", "defense", "shield", "generator", "base:floor"]},
    {"id": "terminal-console", "label": "Control Terminal", "category": "sci-fi", "builder": build_terminal_console, "description": "Ergonomic standing operator command console with angled tactile display.", "tags": ["sci-fi", "console", "terminal", "workstation", "base:floor"]},
    {"id": "energy-cell", "label": "Energy Power Cell", "category": "sci-fi", "builder": build_energy_cell, "description": "Portable hexagonal power canister with top grab bar and charge level bars.", "tags": ["held", "sci-fi", "battery", "energy", "grip:handle"]},
    {"id": "gravity-lift", "label": "Gravity Lift Pad", "category": "sci-fi", "builder": build_gravity_lift, "description": "Circular 1.6m floor gravity elevator plate with concentric lift emitters.", "tags": ["sci-fi", "gravity", "lift", "elevator", "base:floor"]},
    {"id": "turret-automated", "label": "Automated Defense Turret", "category": "sci-fi", "builder": build_turret_automated, "description": "Swivel-mount twin autocannon sentry turret with armored sensor module.", "tags": ["sci-fi", "turret", "defense", "weapon", "base:floor"]},
    {"id": "warp-beacon", "label": "Warp Navigation Beacon", "category": "sci-fi", "builder": build_warp_beacon, "description": "Tall 4m triangular pylon navigation transmitter with radiating apex node.", "tags": ["sci-fi", "beacon", "navigation", "pylon", "base:floor"]},

    # INDUSTRIAL (88)
    {"id": "floor-slab", "label": "Floor Slab", "category": "industrial", "builder": build_floor_slab, "description": "Standard 4x4m modular concrete floor slab with border trim reveal.", "tags": ["modular", "industrial", "floor", "slab", "4x4", "base:floor"]},
    {"id": "floor-slab-grate", "label": "Grated Floor Slab", "category": "industrial", "builder": build_floor_slab_grate, "description": "4x4m concrete floor slab with heavy open steel mesh grating center.", "tags": ["modular", "industrial", "floor", "grate", "4x4", "base:floor"]},
    {"id": "floor-slab-hazard", "label": "Hazard Floor Slab", "category": "industrial", "builder": build_floor_slab_hazard, "description": "4x4m concrete foundation slab with high-visibility hazard caution borders.", "tags": ["modular", "industrial", "floor", "hazard", "4x4", "base:floor"]},
    {"id": "floor-slab-2x2", "label": "Floor Slab 2x2", "category": "industrial", "builder": build_floor_slab_2x2, "description": "Compact 2x2m modular concrete equipment foundation slab.", "tags": ["modular", "industrial", "floor", "slab", "2x2", "base:floor"]},
    {"id": "grate-floor-square", "label": "Square Floor Grate", "category": "industrial", "builder": build_grate_floor_square, "description": "2x2m removable drainage and ventilation trench grate panel.", "tags": ["modular", "industrial", "grate", "drainage", "base:floor"]},
    {"id": "grate-trench", "label": "Trench Grate", "category": "industrial", "builder": build_grate_trench, "description": "4m long x 0.5m wide linear steel trench grating channel.", "tags": ["modular", "industrial", "grate", "trench", "base:floor"]},
    {"id": "grate-drain", "label": "Sump Drain Grate", "category": "industrial", "builder": build_grate_drain, "description": "Circular cast-iron floor sump drain with concentric slotted cover.", "tags": ["utility", "industrial", "drain", "grate", "base:floor"]},
    {"id": "road-tile-straight", "label": "Industrial Road Straight", "category": "industrial", "builder": build_road_tile_straight, "description": "4x4m asphalt industrial access road tile with centerline lane markings.", "tags": ["modular", "industrial", "road", "vehicle", "4x4", "base:floor"]},
    {"id": "road-tile-junction", "label": "Industrial Road Junction", "category": "industrial", "builder": build_road_tile_junction, "description": "4x4m asphalt industrial road 4-way intersection tile.", "tags": ["modular", "industrial", "road", "junction", "4x4", "base:floor"]},
    {"id": "loading-dock-edge", "label": "Loading Dock Edge", "category": "industrial", "builder": build_loading_dock_edge, "description": "4m concrete loading dock approach curb with heavy rubber truck bumpers.", "tags": ["modular", "industrial", "dock", "loading", "base:floor"]},
    {"id": "hazard-floor-stripes", "label": "Hazard Stripes Strip", "category": "industrial", "builder": build_hazard_floor_stripes, "description": "4m x 0.5m surface caution strip with diagonal yellow and black chevrons.", "tags": ["safety", "industrial", "hazard", "marking", "base:floor"]},
    {"id": "warning-decal-plate", "label": "Warning Caution Plate", "category": "industrial", "builder": build_warning_decal_plate, "description": "Embossed industrial caution sign plate with central warning triangle.", "tags": ["safety", "industrial", "sign", "warning", "base:floor"]},
    {"id": "wall-panel", "label": "Wall Panel", "category": "industrial", "builder": build_wall_panel, "description": "Standard 4x4m warehouse wall panel with exterior vertical pilaster ribs.", "tags": ["modular", "industrial", "wall", "structure", "4x4", "base:floor"]},
    {"id": "wall-panel-window", "label": "Window Wall Panel", "category": "industrial", "builder": build_wall_panel_window, "description": "4x4m warehouse wall panel featuring central 2x2m framed window aperture.", "tags": ["modular", "industrial", "wall", "window", "4x4", "base:floor"]},
    {"id": "wall-panel-door", "label": "Door Wall Panel", "category": "industrial", "builder": build_wall_panel_door, "description": "4x4m warehouse wall panel with integrated pedestrian service door.", "tags": ["modular", "industrial", "wall", "door", "4x4", "base:floor"]},
    {"id": "wall-panel-corrugated", "label": "Corrugated Wall Panel", "category": "industrial", "builder": build_wall_panel_corrugated, "description": "4x4m exterior corrugated sheet metal industrial siding panel.", "tags": ["modular", "industrial", "wall", "corrugated", "4x4", "base:floor"]},
    {"id": "wall-panel-reinforced", "label": "Reinforced Blast Wall", "category": "industrial", "builder": build_wall_panel_reinforced, "description": "Heavy 4x4m blast wall panel with external structural steel X-bracing.", "tags": ["modular", "industrial", "wall", "reinforced", "4x4", "base:floor"]},
    {"id": "wall-corner-inner", "label": "Inner Wall Corner", "category": "industrial", "builder": build_wall_corner_inner, "description": "4m high inside 90-degree corner wall junction with column.", "tags": ["modular", "industrial", "wall", "corner", "base:floor"]},
    {"id": "wall-corner-outer", "label": "Outer Wall Corner", "category": "industrial", "builder": build_wall_corner_outer, "description": "4m high outside 90-degree corner wall column with protective bumpers.", "tags": ["modular", "industrial", "wall", "corner", "base:floor"]},
    {"id": "wall-pillar", "label": "Structural I-Beam Pillar", "category": "industrial", "builder": build_wall_pillar, "description": "4m tall heavy wide-flange I-beam column with anchor baseplate.", "tags": ["modular", "industrial", "pillar", "column", "steel", "base:floor"]},
    {"id": "window-industrial-frame", "label": "Industrial Window Frame", "category": "industrial", "builder": build_window_industrial_frame, "description": "2x2m multi-pane factory sash window with cross mullions.", "tags": ["modular", "industrial", "window", "frame", "base:floor"]},
    {"id": "window-security-bars", "label": "Security Window Bars", "category": "industrial", "builder": build_window_security_bars, "description": "2x1.5m window opening reinforced with 7 heavy vertical steel security bars.", "tags": ["modular", "industrial", "window", "security", "base:floor"]},
    {"id": "door-frame-steel", "label": "Steel Door Frame", "category": "industrial", "builder": build_door_frame_steel, "description": "2.4x1.2m heavy structural channel steel doorway opening surround.", "tags": ["modular", "industrial", "door", "frame", "base:floor"]},
    {"id": "door-frame-roll", "label": "Roll-Up Door Frame", "category": "industrial", "builder": build_door_frame_roll, "description": "4x3.5m industrial overhead roll-up door guide rails and barrel drum.", "tags": ["modular", "industrial", "door", "roll-up", "frame", "base:floor"]},
    {"id": "door-steel", "label": "Steel Personnel Door", "category": "industrial", "builder": build_door_steel, "description": "Heavy hollow metal industrial security door with horizontal crash bar.", "tags": ["modular", "industrial", "door", "security", "base:floor"]},
    {"id": "door-roll-up", "label": "Roll-Up Bay Door", "category": "industrial", "builder": build_door_roll_up, "description": "3.8x3.2m segmented horizontal slat roll-up garage door with bottom seal.", "tags": ["modular", "industrial", "door", "roll-up", "bay", "base:floor"]},
    {"id": "door-security", "label": "Vault Security Door", "category": "industrial", "builder": build_door_security, "description": "Heavy blast-rated security door with central 4-spoke rotating wheel lock.", "tags": ["modular", "industrial", "door", "vault", "security", "base:floor"]},
    {"id": "warehouse", "label": "Warehouse Building", "category": "industrial", "builder": build_warehouse, "description": "Complete 8x8x6m modular warehouse building shell with bay portal.", "tags": ["modular", "industrial", "warehouse", "building", "large", "base:floor"]},
    {"id": "warehouse-roof", "label": "Warehouse Pitched Roof", "category": "industrial", "builder": build_warehouse_roof, "description": "8x8m pitched corrugated industrial roof module with ridge cap.", "tags": ["modular", "industrial", "roof", "warehouse", "8x8", "base:floor"]},
    {"id": "roof-flat-parapet", "label": "Flat Roof Parapet", "category": "industrial", "builder": build_roof_flat_parapet, "description": "4x4m flat industrial roof tile with 0.6m perimeter safety parapet wall.", "tags": ["modular", "industrial", "roof", "parapet", "4x4", "base:floor"]},
    {"id": "roof-skylight", "label": "Roof Skylight Module", "category": "industrial", "builder": build_roof_skylight, "description": "4x4m roof section with raised pitched industrial glass monitor skylight.", "tags": ["modular", "industrial", "roof", "skylight", "4x4", "base:floor"]},
    {"id": "roof-truss", "label": "Steel Roof Truss", "category": "industrial", "builder": build_roof_truss, "description": "8m span steel Pratt roof truss with upper chord and diagonal web ties.", "tags": ["modular", "industrial", "truss", "steel", "8m", "base:floor"]},
    {"id": "warehouse-bay", "label": "Warehouse Bay Bent", "category": "industrial", "builder": build_warehouse_bay, "description": "8x8m open loading bay structural frame with overhead monorail runway.", "tags": ["modular", "industrial", "warehouse", "frame", "bay", "base:floor"]},
    {"id": "warehouse-office", "label": "Site Office Booth", "category": "industrial", "builder": build_warehouse_office, "description": "4x4m prefabricated modular site foreman office with window and door.", "tags": ["modular", "industrial", "office", "booth", "4x4", "base:floor"]},
    {"id": "ramp-low", "label": "Low Industrial Ramp", "category": "industrial", "builder": build_ramp_low, "description": "4m gentle slope vehicle/pedestrian ramp rising from 0 to 1.0m height.", "tags": ["modular", "industrial", "ramp", "navigation", "rise:1m", "base:floor"]},
    {"id": "ramp-high", "label": "High Industrial Ramp", "category": "industrial", "builder": build_ramp_high, "description": "4m steep industrial ramp rising from 0 to 2.0m height with bilateral rails.", "tags": ["modular", "industrial", "ramp", "navigation", "rise:2m", "base:floor"]},
    {"id": "ramp-curved", "label": "Curved Ramp Turn", "category": "industrial", "builder": build_ramp_curved, "description": "90-degree turning ramp ascending 1.0m on modular footprint.", "tags": ["modular", "industrial", "ramp", "curved", "rise:1m", "base:floor"]},
    {"id": "stair-flight", "label": "Industrial Stair Flight", "category": "industrial", "builder": build_stair_flight, "description": "Modular 2.4m industrial staircase rising to 2.0m height with handrails.", "tags": ["modular", "industrial", "stairs", "navigation", "rise:2m", "base:floor"]},
    {"id": "stair-flight-spiral", "label": "Spiral Staircase", "category": "industrial", "builder": build_stair_flight_spiral, "description": "Compact 2m diameter spiral steel staircase rising 3.0m with center pipe.", "tags": ["modular", "industrial", "stairs", "spiral", "rise:3m", "base:floor"]},
    {"id": "stair-steps-short", "label": "Short Dock Steps", "category": "industrial", "builder": build_stair_steps_short, "description": "Short 4-step concrete approach stair rising 0.8m for loading docks.", "tags": ["modular", "industrial", "stairs", "dock", "rise:0.8m", "base:floor"]},
    {"id": "platform-low", "label": "Low Platform", "category": "industrial", "builder": build_platform_low, "description": "4x4m elevated equipment staging platform at 1.0m height on tubular legs.", "tags": ["modular", "industrial", "platform", "deck", "4x4", "height:1m", "base:floor"]},
    {"id": "platform-high", "label": "High Platform", "category": "industrial", "builder": build_platform_high, "description": "4x4m industrial mezzanine platform elevated 2.0m on wide-flange columns.", "tags": ["modular", "industrial", "platform", "mezzanine", "4x4", "height:2m", "base:floor"]},
    {"id": "platform-grated", "label": "Grated Equipment Platform", "category": "industrial", "builder": build_platform_grated, "description": "2x4m elevated steel mesh open-grating platform at 1.0m height.", "tags": ["modular", "industrial", "platform", "grate", "2x4", "height:1m", "base:floor"]},
    {"id": "platform-staging", "label": "Maintenance Staging Platform", "category": "industrial", "builder": build_platform_staging, "description": "Compact 2x2m maintenance platform elevated 0.5m above ground.", "tags": ["modular", "industrial", "platform", "staging", "2x2", "height:0.5m", "base:floor"]},
    {"id": "catwalk", "label": "Industrial Catwalk", "category": "industrial", "builder": build_catwalk, "description": "4x1.2m elevated catwalk section with diamond deck and handrails on both sides.", "tags": ["modular", "industrial", "catwalk", "walkway", "4m", "base:floor"]},
    {"id": "catwalk-grate-long", "label": "Long Catwalk Grate", "category": "industrial", "builder": build_catwalk_grate_long, "description": "6x1.2m long elevated catwalk walkway with open steel grating floor.", "tags": ["modular", "industrial", "catwalk", "walkway", "6m", "base:floor"]},
    {"id": "catwalk-bridge", "label": "Spanning Catwalk Bridge", "category": "industrial", "builder": build_catwalk_bridge, "description": "8x1.5m pedestrian bridge walkway with under-truss reinforcement.", "tags": ["modular", "industrial", "catwalk", "bridge", "8m", "base:floor"]},
    {"id": "catwalk-intersection", "label": "Catwalk 4-Way Intersection", "category": "industrial", "builder": build_catwalk_intersection, "description": "2x2m 4-way catwalk junction platform with corner rail posts.", "tags": ["modular", "industrial", "catwalk", "junction", "2x2", "base:floor"]},
    {"id": "rail-straight", "label": "Safety Handrail Straight", "category": "industrial", "builder": build_rail_straight, "description": "2m straight industrial safety handrail (1.0m high) with 3 stanchions.", "tags": ["modular", "industrial", "rail", "safety", "2m", "base:floor"]},
    {"id": "rail-corner", "label": "Safety Handrail Corner", "category": "industrial", "builder": build_rail_corner, "description": "1x1m 90-degree corner safety handrail with corner post.", "tags": ["modular", "industrial", "rail", "safety", "corner", "base:floor"]},
    {"id": "rail-endcap", "label": "Handrail End Cap", "category": "industrial", "builder": build_rail_endcap, "description": "Straight handrail terminating in a smooth rounded return loop.", "tags": ["modular", "industrial", "rail", "endcap", "base:floor"]},
    {"id": "rail-industrial-guard", "label": "Heavy Guardrail Barrier", "category": "industrial", "builder": build_rail_industrial_guard, "description": "High-visibility double-tube impact guardrail for forklift protection.", "tags": ["modular", "industrial", "rail", "guardrail", "impact", "base:floor"]},
    {"id": "ladder", "label": "Vertical Steel Ladder", "category": "industrial", "builder": build_ladder, "description": "4m vertical steel wall ladder with 12 rungs and stand-off brackets.", "tags": ["modular", "industrial", "ladder", "navigation", "climb:4m", "base:floor"]},
    {"id": "ladder-caged", "label": "Caged Safety Ladder", "category": "industrial", "builder": build_ladder_caged, "description": "6m tall vertical ladder enclosed within steel safety hoop cage.", "tags": ["modular", "industrial", "ladder", "caged", "climb:6m", "base:floor"]},
    {"id": "ladder-fire-escape", "label": "Counterbalanced Drop Ladder", "category": "industrial", "builder": build_ladder_fire_escape, "description": "Counterweighted drop ladder with guide channels for emergency escape.", "tags": ["modular", "industrial", "ladder", "emergency", "base:floor"]},
    {"id": "pipe-straight", "label": "Straight Pipe", "category": "industrial", "builder": build_pipe_straight, "description": "4m straight industrial fluid pipe (dia 0.3m) with bolted end flanges.", "tags": ["pipe", "industrial", "socket:in:-Y:0.3", "socket:out:+Y:0.3", "flanged", "4m", "base:floor"]},
    {"id": "pipe-short", "label": "Short Pipe Spool", "category": "industrial", "builder": build_pipe_short, "description": "1m straight flanged pipe connection spool.", "tags": ["pipe", "industrial", "socket:in:-Y:0.3", "socket:out:+Y:0.3", "flanged", "1m", "base:floor"]},
    {"id": "pipe-long", "label": "Long Pipe Main", "category": "industrial", "builder": build_pipe_long, "description": "8m main distribution pipe spool with center support collars.", "tags": ["pipe", "industrial", "socket:in:-Y:0.3", "socket:out:+Y:0.3", "flanged", "8m", "base:floor"]},
    {"id": "pipe-elbow", "label": "Pipe 90-Deg Elbow", "category": "industrial", "builder": build_pipe_elbow, "description": "90-degree flanged pipe elbow turning from -Y to +X.", "tags": ["pipe", "industrial", "socket:in:-Y:0.3", "socket:out:+X:0.3", "elbow", "90deg", "base:floor"]},
    {"id": "pipe-tee", "label": "Pipe 3-Way Tee", "category": "industrial", "builder": build_pipe_tee, "description": "3-way flanged branching pipe tee junction.", "tags": ["pipe", "industrial", "socket:in:-Y:0.3", "socket:out:+Y:0.3", "socket:branch:+X:0.3", "tee", "base:floor"]},
    {"id": "pipe-cross", "label": "Pipe 4-Way Cross", "category": "industrial", "builder": build_pipe_cross, "description": "4-way flanged pipe distribution cross manifold.", "tags": ["pipe", "industrial", "socket:north:+Y:0.3", "socket:south:-Y:0.3", "socket:east:+X:0.3", "socket:west:-X:0.3", "cross", "base:floor"]},
    {"id": "pipe-flange", "label": "Blind Pipe Flange", "category": "industrial", "builder": build_pipe_flange, "description": "Heavy bolted end-cap blind flange with 6 perimeter bolts.", "tags": ["pipe", "industrial", "flange", "fitting", "base:floor"]},
    {"id": "pipe-valve", "label": "Manual Pipe Valve", "category": "industrial", "builder": build_pipe_valve, "description": "Inline 2m pipe spool with central valve body and red/orange handwheel.", "tags": ["pipe", "industrial", "socket:in:-Y:0.3", "socket:out:+Y:0.3", "valve", "wheel", "base:floor"]},
    {"id": "pipe-support", "label": "Floor Pipe Support", "category": "industrial", "builder": build_pipe_support, "description": "Floor-mounted structural stanchion with curved pipe saddle clamp.", "tags": ["pipe", "industrial", "support", "stanchion", "base:floor"]},
    {"id": "pipe-riser", "label": "Vertical Pipe Riser", "category": "industrial", "builder": build_pipe_riser, "description": "4m vertical pipe riser column with wall mounting brackets.", "tags": ["pipe", "industrial", "socket:bottom:-Z:0.3", "socket:top:+Z:0.3", "riser", "4m", "base:floor"]},
    {"id": "pipe-junction-box", "label": "Pipe Junction Manifold", "category": "industrial", "builder": build_pipe_junction_box, "description": "Square terminal pipe junction box with 4 flanged connection ports.", "tags": ["pipe", "industrial", "manifold", "junction", "base:floor"]},
    {"id": "tank-vertical", "label": "Vertical Storage Tank", "category": "industrial", "builder": build_tank_vertical, "description": "2.5m diameter x 4.5m tall vertical storage silo on 4 tubular legs.", "tags": ["industrial", "tank", "storage", "silo", "large", "base:floor"]},
    {"id": "tank-horizontal", "label": "Horizontal Pressure Tank", "category": "industrial", "builder": build_tank_horizontal, "description": "2m diameter x 4m long horizontal cylindrical vessel on twin saddle cradles.", "tags": ["industrial", "tank", "vessel", "storage", "base:floor"]},
    {"id": "tank-silo", "label": "Hopper Grain Silo", "category": "industrial", "builder": build_tank_silo, "description": "Tall 6m grain silo with conical hopper discharge chute.", "tags": ["industrial", "silo", "storage", "hopper", "large", "base:floor"]},
    {"id": "tank-spherical", "label": "Spherical LPG Tank", "category": "industrial", "builder": build_tank_spherical, "description": "3m diameter spherical pressurized chemical LPG storage sphere on braced legs.", "tags": ["industrial", "tank", "pressure", "sphere", "base:floor"]},
    {"id": "smokestack", "label": "Industrial Smokestack", "category": "industrial", "builder": build_smokestack, "description": "10m tall tapered industrial steel exhaust stack with rain cap rim.", "tags": ["industrial", "smokestack", "chimney", "exhaust", "tall", "base:floor"]},
    {"id": "smokestack-tall", "label": "Massive Chimney Stack", "category": "industrial", "builder": build_smokestack_tall, "description": "16m massive reinforced industrial chimney flue with warning collars.", "tags": ["industrial", "smokestack", "chimney", "massive", "tall", "base:floor"]},
    {"id": "smokestack-twin", "label": "Twin Exhaust Flues", "category": "industrial", "builder": build_smokestack_twin, "description": "Dual paired 8m exhaust flues connected by structural lattice bracing.", "tags": ["industrial", "smokestack", "twin", "exhaust", "base:floor"]},
    {"id": "duct-straight", "label": "HVAC Air Duct Straight", "category": "industrial", "builder": build_duct_straight, "description": "4m rectangular sheet metal HVAC duct (0.8x0.8m) with connection flanges.", "tags": ["duct", "hvac", "socket:in:-Y:0.8x0.8", "socket:out:+Y:0.8x0.8", "4m", "base:floor"]},
    {"id": "duct-elbow", "label": "HVAC Duct 90-Deg Elbow", "category": "industrial", "builder": build_duct_elbow, "description": "90-degree rectangular turning duct section.", "tags": ["duct", "hvac", "socket:in:-Y:0.8x0.8", "socket:out:+X:0.8x0.8", "elbow", "base:floor"]},
    {"id": "duct-tee", "label": "HVAC Duct 3-Way Tee", "category": "industrial", "builder": build_duct_tee, "description": "3-way branching rectangular air ventilation duct fitting.", "tags": ["duct", "hvac", "socket:in:-Y:0.8x0.8", "socket:out:+Y:0.8x0.8", "socket:branch:+X:0.8x0.8", "tee", "base:floor"]},
    {"id": "duct-vent", "label": "Wall Air Register Vent", "category": "industrial", "builder": build_duct_vent, "description": "Wall register grille with angled directional airflow louvers.", "tags": ["duct", "hvac", "vent", "grille", "base:floor"]},
    {"id": "vent-fan", "label": "Industrial Exhaust Fan", "category": "industrial", "builder": build_vent_fan, "description": "1.2m diameter circular industrial exhaust wall fan with 6 rotor blades.", "tags": ["hvac", "industrial", "fan", "ventilation", "motor", "base:floor"]},
    {"id": "duct-exhaust-hood", "label": "Factory Exhaust Hood", "category": "industrial", "builder": build_duct_exhaust_hood, "description": "Tapered 2x1.5m industrial fume capture exhaust hood with top collar.", "tags": ["hvac", "industrial", "hood", "exhaust", "base:floor"]},
    {"id": "wall-vent-louvers", "label": "Architectural Storm Louvers", "category": "industrial", "builder": build_wall_vent_louvers, "description": "1.5x1.5m exterior architectural storm louvers in recessed frame.", "tags": ["hvac", "industrial", "louvers", "wall", "base:floor"]},
    {"id": "roof-turbine-vent", "label": "Rooftop Turbine Vent", "category": "industrial", "builder": build_roof_turbine_vent, "description": "Spherical rotating rooftop wind turbine ventilator with finned spinner cap.", "tags": ["hvac", "industrial", "roof", "turbine", "base:floor"]},
    {"id": "generator", "label": "Diesel Generator", "category": "industrial", "builder": build_generator, "description": "Industrial backup generator in sound-attenuated enclosure with radiator louvers.", "tags": ["machinery", "industrial", "generator", "power", "backup", "base:floor"]},
    {"id": "generator-diesel-large", "label": "Heavy Power Station Generator", "category": "industrial", "builder": build_generator_diesel_large, "description": "Heavy 5m skid-mounted power generation station with dual exhaust stacks.", "tags": ["machinery", "industrial", "generator", "power", "heavy", "base:floor"]},
    {"id": "turbine-housing", "label": "Steam Turbine Housing", "category": "industrial", "builder": build_turbine_housing, "description": "Massive steam turbine casing with split-flange joint and top steam inlet.", "tags": ["machinery", "industrial", "turbine", "power", "heavy", "base:floor"]},
    {"id": "machine-lathe", "label": "Metalworking Lathe", "category": "industrial", "builder": build_machine_lathe, "description": "Heavy 2.5m engine lathe with cast bed, 3-jaw chuck, and tailstock.", "tags": ["machinery", "industrial", "lathe", "metalworking", "tool", "base:floor"]},
    {"id": "machine-hydraulic-press", "label": "Hydraulic Stamping Press", "category": "industrial", "builder": build_machine_hydraulic_press, "description": "3.5m tall 4-column vertical hydraulic press with stamping platen.", "tags": ["machinery", "industrial", "press", "hydraulic", "heavy", "base:floor"]},
    {"id": "machine-transformer", "label": "Substation Transformer", "category": "industrial", "builder": build_machine_transformer, "description": "High-voltage electrical transformer with radiator fins and ceramic bushings.", "tags": ["machinery", "industrial", "electrical", "transformer", "base:floor"]},
    {"id": "machine-pump", "label": "Centrifugal Water Pump", "category": "industrial", "builder": build_machine_pump, "description": "Centrifugal water pump with volute casing and coupled electric motor.", "tags": ["machinery", "industrial", "pump", "water", "motor", "base:floor"]},
    {"id": "air-compressor", "label": "Air Compressor Cabinet", "category": "industrial", "builder": build_air_compressor, "description": "Rotary screw air compressor cabinet with front gauge instrument panel.", "tags": ["machinery", "industrial", "compressor", "pneumatic", "base:floor"]},
    {"id": "air-tank-mobile", "label": "Mobile Workshop Compressor", "category": "industrial", "builder": build_air_tank_mobile, "description": "Portable horizontal air compressor on rubber wheels with pull handle.", "tags": ["machinery", "industrial", "compressor", "mobile", "base:floor"]},
    {"id": "conveyor", "label": "Motorized Belt Conveyor", "category": "industrial", "builder": build_conveyor, "description": "4m straight motorized belt conveyor table on adjustable H-legs.", "tags": ["machinery", "industrial", "conveyor", "logistics", "4m", "base:floor"]},
    {"id": "conveyor-roller-straight", "label": "Roller Conveyor Track", "category": "industrial", "builder": build_conveyor_roller_straight, "description": "3m gravity skate-wheel roller conveyor track with steel rollers.", "tags": ["machinery", "industrial", "conveyor", "roller", "3m", "base:floor"]},
    {"id": "conveyor-incline", "label": "Incline Belt Conveyor", "category": "industrial", "builder": build_conveyor_incline, "description": "4m inclined belt conveyor rising 1.5m with containment side skirts.", "tags": ["machinery", "industrial", "conveyor", "incline", "rise:1.5m", "base:floor"]},
    {"id": "crane", "label": "Overhead Hoist Crane", "category": "industrial", "builder": build_crane, "description": "Industrial bridge crane hoist trolley with cable drum and forged cargo hook.", "tags": ["machinery", "industrial", "crane", "hoist", "hook", "base:floor"]},
    {"id": "gantry-crane", "label": "Mobile Gantry Crane", "category": "industrial", "builder": build_gantry_crane, "description": "6x5m mobile A-frame gantry crane with top I-beam runway and caster wheels.", "tags": ["machinery", "industrial", "crane", "gantry", "large", "base:floor"]},
    {"id": "hoist-monorail", "label": "Monorail Beam Hoist", "category": "industrial", "builder": build_hoist_monorail, "description": "Electric chain hoist clamped to lower flange of an overhead I-beam.", "tags": ["machinery", "industrial", "hoist", "monorail", "crane", "base:floor"]},
    {"id": "crane-jib", "label": "Pillar Slewing Jib Crane", "category": "industrial", "builder": build_crane_jib, "description": "Pillar-mounted slewing jib crane with 3.5m boom arm and hook.", "tags": ["machinery", "industrial", "crane", "jib", "base:floor"]},
    {"id": "electrical-cabinet", "label": "Electrical Control Cabinet", "category": "industrial", "builder": build_electrical_cabinet, "description": "Freestanding 2m electrical control cabinet with dual doors and hazard triangle.", "tags": ["utility", "industrial", "electrical", "cabinet", "base:floor"]},
    {"id": "electrical-panel-wall", "label": "Wall Electrical Panel", "category": "industrial", "builder": build_electrical_panel_wall, "description": "Wall-mounted circuit breaker panel with hinged cover door.", "tags": ["utility", "industrial", "electrical", "panel", "base:floor"]},
    {"id": "breaker-box", "label": "Safety Disconnect Switch", "category": "industrial", "builder": build_breaker_box, "description": "Compact electrical disconnect switch box with prominent throw lever handle.", "tags": ["utility", "industrial", "electrical", "switch", "base:floor"]},
    {"id": "cable-spool", "label": "Wooden Cable Spool", "category": "industrial", "builder": build_cable_spool, "description": "Large 1.2m wooden cable reel wrapped with heavy industrial power wire.", "tags": ["logistics", "industrial", "cable", "spool", "base:floor"]},
    {"id": "cable-spool-metal", "label": "Metal Winch Reel", "category": "industrial", "builder": build_cable_spool_metal, "description": "All-steel industrial cable winch reel with tubular frame.", "tags": ["logistics", "industrial", "cable", "reel", "steel", "base:floor"]},
    {"id": "cable-tray-straight", "label": "Overhead Cable Tray", "category": "industrial", "builder": build_cable_tray_straight, "description": "3m straight perforated ladder cable tray with conduit wire bundle.", "tags": ["utility", "industrial", "cable", "tray", "3m", "base:floor"]},
    {"id": "pallet", "label": "Wooden Pallet", "category": "industrial", "builder": build_pallet, "description": "Standard 1.2x1.0m wooden stringer shipping pallet.", "tags": ["logistics", "industrial", "pallet", "wood", "shipping", "base:floor"]},
    {"id": "pallet-euro", "label": "Euro Block Pallet", "category": "industrial", "builder": build_pallet_euro, "description": "1.2x0.8m heavy-duty Euro block pallet with 9 corner and center blocks.", "tags": ["logistics", "industrial", "pallet", "euro", "base:floor"]},
    {"id": "pallet-metal", "label": "Galvanized Steel Pallet", "category": "industrial", "builder": build_pallet_metal, "description": "All-steel welded logistics pallet with tubular bottom skids.", "tags": ["logistics", "industrial", "pallet", "metal", "base:floor"]},
    {"id": "stacked-pallets", "label": "Stacked Pallets (5x)", "category": "industrial", "builder": build_stacked_pallets, "description": "Tidy vertical stack of 5 wooden pallets (height 0.75m).", "tags": ["logistics", "industrial", "pallet", "stack", "base:floor"]},
    {"id": "stacked-pallets-tall", "label": "Stacked Pallets Tall (10x)", "category": "industrial", "builder": build_stacked_pallets_tall, "description": "High tower stack of 10 wooden pallets (height 1.5m).", "tags": ["logistics", "industrial", "pallet", "stack", "tall", "base:floor"]},
    {"id": "cargo-container", "label": "Cargo Container 20ft", "category": "industrial", "builder": build_cargo_container, "description": "Standard 20ft (6x2.4x2.6m) corrugated steel intermodal shipping container.", "tags": ["logistics", "industrial", "container", "shipping", "cargo", "20ft", "base:floor"]},
    {"id": "cargo-container-open", "label": "Cargo Container Open", "category": "industrial", "builder": build_cargo_container_open, "description": "20ft shipping container with rear double doors swung wide open.", "tags": ["logistics", "industrial", "container", "open", "cargo", "base:floor"]},
    {"id": "cargo-container-short", "label": "Cargo Container 10ft", "category": "industrial", "builder": build_cargo_container_short, "description": "Compact 10ft (3x2.4x2.6m) half-length storage container.", "tags": ["logistics", "industrial", "container", "shipping", "10ft", "base:floor"]},
    {"id": "barrel", "label": "Steel Oil Drum", "category": "industrial", "builder": build_barrel, "description": "Standard 55-gallon steel oil drum with rolled expansion hoop ribs.", "tags": ["logistics", "industrial", "barrel", "drum", "liquid", "base:floor"]},
    {"id": "barrel-toxic", "label": "Toxic Hazmat Drum", "category": "industrial", "builder": build_barrel_toxic, "description": "Steel drum painted in charcoal with prominent safety-orange hazmat bands.", "tags": ["logistics", "industrial", "barrel", "toxic", "hazmat", "base:floor"]},
    {"id": "barrel-stack", "label": "Barrel Pyramid Stack", "category": "industrial", "builder": build_barrel_stack, "description": "Stable pyramid stack of three steel barrels (2 on ground, 1 on top).", "tags": ["logistics", "industrial", "barrel", "stack", "base:floor"]},
    {"id": "crate", "label": "Wooden Shipping Crate", "category": "industrial", "builder": build_crate, "description": "1x1x1m heavy industrial wooden crate with framing battens and label.", "tags": ["logistics", "industrial", "crate", "wood", "shipping", "base:floor"]},
    {"id": "crate-heavy-wooden", "label": "Heavy Machinery Crate", "category": "industrial", "builder": build_crate_heavy_wooden, "description": "Large 1.6x1.2m machinery shipping crate with forklift skid runners.", "tags": ["logistics", "industrial", "crate", "machinery", "heavy", "base:floor"]},
    {"id": "crate-military", "label": "Military Ammo Crate", "category": "industrial", "builder": build_crate_military, "description": "Low-profile tactical equipment crate with recessed toggle latches.", "tags": ["logistics", "industrial", "crate", "military", "base:floor"]},
    {"id": "crate-stack", "label": "Assorted Crate Stack", "category": "industrial", "builder": build_crate_stack, "description": "Realistic warehouse cluster stack of 3 assorted wooden crates.", "tags": ["logistics", "industrial", "crate", "stack", "base:floor"]},
    {"id": "fence-panel", "label": "Security Fence Panel", "category": "industrial", "builder": build_fence_panel, "description": "3m wide x 2m high chain-link security fence panel with tubular pipe frame.", "tags": ["perimeter", "industrial", "fence", "security", "3m", "base:floor"]},
    {"id": "fence-gate", "label": "Security Fence Gate", "category": "industrial", "builder": build_fence_gate, "description": "1.5m wide swinging chain-link personnel gate with latch handle.", "tags": ["perimeter", "industrial", "fence", "gate", "base:floor"]},
    {"id": "fence-wire-mesh", "label": "Welded Wire Partition", "category": "industrial", "builder": build_fence_wire_mesh, "description": "2x2m welded steel wire mesh security partition panel with square grid.", "tags": ["perimeter", "industrial", "fence", "mesh", "base:floor"]},
    {"id": "fence-barbed", "label": "Barbed Wire Fence", "category": "industrial", "builder": build_fence_barbed, "description": "3m security fence panel topped with three angled strands of barbed wire.", "tags": ["perimeter", "industrial", "fence", "barbed", "security", "base:floor"]},
    {"id": "bollard", "label": "Safety Bollard", "category": "industrial", "builder": build_bollard, "description": "Steel cylindrical traffic bollard (1.0m high) with reflective safety stripe.", "tags": ["safety", "industrial", "bollard", "barrier", "base:floor"]},
    {"id": "bollard-retractable", "label": "Retractable Bollard", "category": "industrial", "builder": build_bollard_retractable, "description": "Pneumatic rising security bollard recessed in circular ground collar.", "tags": ["safety", "industrial", "bollard", "retractable", "base:floor"]},
    {"id": "bollard-heavy", "label": "Heavy Crash Bollard", "category": "industrial", "builder": build_bollard_heavy, "description": "Heavy 0.35m diameter crash-rated impact bollard with welded rim cap.", "tags": ["safety", "industrial", "bollard", "heavy", "crash", "base:floor"]},
    {"id": "barrier", "label": "Steel Crowd Barricade", "category": "industrial", "builder": build_barrier, "description": "Portable 2.5m tubular steel crowd control barrier with vertical pickets.", "tags": ["safety", "industrial", "barrier", "crowd", "base:floor"]},
    {"id": "barrier-jersey-concrete", "label": "Jersey Concrete Barrier", "category": "industrial", "builder": build_barrier_jersey_concrete, "description": "Standard 2.5m highway Jersey K-rail concrete barrier with forklift slots.", "tags": ["safety", "industrial", "barrier", "concrete", "jersey", "base:floor"]},
    {"id": "barrier-traffic-cone", "label": "Traffic Safety Cone", "category": "industrial", "builder": build_barrier_traffic_cone, "description": "High-visibility 0.75m traffic safety cone with square base and white collar.", "tags": ["safety", "industrial", "cone", "traffic", "base:floor"]},
    {"id": "barrier-water-fillable", "label": "Plastic Water Barrier", "category": "industrial", "builder": build_barrier_water_fillable, "description": "2m interlocking high-visibility safety barrier with top water fill cap.", "tags": ["safety", "industrial", "barrier", "plastic", "base:floor"]},
    {"id": "floodlight", "label": "Industrial Floodlight", "category": "industrial", "builder": build_floodlight, "description": "Heavy twin LED floodlight fixture on adjustable yoke and floor stand.", "tags": ["lighting", "industrial", "floodlight", "work", "base:floor"]},
    {"id": "floodlight-tower", "label": "Mobile Light Tower", "category": "industrial", "builder": build_floodlight_tower, "description": "6m diesel lighting tower with telescoping mast and 4 high-output lamps.", "tags": ["lighting", "industrial", "tower", "mobile", "base:floor"]},
    {"id": "work-light-stand", "label": "Tripod Work Light", "category": "industrial", "builder": build_work_light_stand, "description": "Portable tripod work light with telescoping center pole and twin halogens.", "tags": ["lighting", "industrial", "worklight", "tripod", "base:floor"]},
    {"id": "debris-scrap-pile", "label": "Scrap Metal Pile", "category": "industrial", "builder": build_debris_scrap_pile, "description": "Clustered debris pile of scrap metal plates, pipes, and broken rubble.", "tags": ["debris", "industrial", "scrap", "rubble", "base:floor"]},
    {"id": "scrap-i-beam", "label": "Bent Scrap I-Beam", "category": "industrial", "builder": build_scrap_i_beam, "description": "Twisted and bent 2.4m structural steel I-beam scrap remnant.", "tags": ["debris", "industrial", "scrap", "beam", "steel", "base:floor"]},
    {"id": "scrap-sheet-metal", "label": "Scrap Metal Sheets", "category": "industrial", "builder": build_scrap_sheet_metal, "description": "Stack of 3 bent and distressed corrugated sheet metal panels.", "tags": ["debris", "industrial", "scrap", "metal", "sheet", "base:floor"]},
    {"id": "pallet-broken", "label": "Broken Wooden Pallet", "category": "industrial", "builder": build_pallet_broken, "description": "Damaged wooden shipping pallet with cracked deck boards and displaced stringer.", "tags": ["debris", "industrial", "pallet", "broken", "wood", "base:floor"]},

    # ENVIRONMENT EXPANSION (48)
    {"id": "roof-curb-straight", "label": "Straight Roof Service Curb", "category": "industrial", "builder": build_roof_curb_straight, "description": "Four-meter roof service curb with a raised gasket rail and safety marker.", "tags": ["modular", "industrial", "roof", "curb", "service", "4m", "base:floor"]},
    {"id": "roof-curb-corner", "label": "Roof Curb Corner", "category": "industrial", "builder": build_roof_curb_corner, "description": "L-shaped roof curb for wrapping a building or equipment corner.", "tags": ["modular", "industrial", "roof", "curb", "corner", "base:floor"]},
    {"id": "roof-access-hatch", "label": "Roof Access Hatch", "category": "industrial", "builder": build_roof_access_hatch, "description": "Raised roof access hatch with hinged lid and pull handle.", "tags": ["industrial", "roof", "access", "hatch", "base:floor"]},
    {"id": "roof-service-vent-stack", "label": "Roof Service Vent Stack", "category": "industrial", "builder": build_roof_service_vent_stack, "description": "Short roof exhaust stack with a hood and visible service collar.", "tags": ["industrial", "roof", "vent", "stack", "hvac", "base:floor"]},
    {"id": "roof-equipment-plinth", "label": "Roof Equipment Plinth", "category": "industrial", "builder": build_roof_equipment_plinth, "description": "Raised roof equipment plinth with four anchor posts and a light top.", "tags": ["modular", "industrial", "roof", "plinth", "equipment", "2x2", "base:floor"]},
    {"id": "roof-safety-post", "label": "Roof Safety Cable Posts", "category": "industrial", "builder": build_roof_safety_post, "description": "Pair of roof safety posts joined by a low fall-protection cable.", "tags": ["industrial", "roof", "safety", "anchor", "base:floor"]},
    {"id": "roof-drain-scupper", "label": "Roof Drain Scupper", "category": "industrial", "builder": build_roof_drain_scupper, "description": "Parapet drain scupper with a visible downspout and service collar.", "tags": ["industrial", "roof", "drain", "scupper", "base:floor"]},
    {"id": "roof-antenna-mast", "label": "Roof Antenna Mast", "category": "industrial", "builder": build_roof_antenna_mast, "description": "Triangular roof antenna mast with cross arms and a small beacon.", "tags": ["industrial", "roof", "antenna", "mast", "utility", "base:floor"]},
    {"id": "roof-cable-bridge", "label": "Roof Cable Bridge", "category": "industrial", "builder": build_roof_cable_bridge, "description": "Raised cable tray bridge for crossing a roof seam or service gap.", "tags": ["modular", "industrial", "roof", "cable", "bridge", "base:floor"]},
    {"id": "roof-fall-arrest-anchor", "label": "Roof Fall Arrest Anchor", "category": "industrial", "builder": build_roof_fall_arrest_anchor, "description": "Triangular roof anchor with three plates and a central eye.", "tags": ["industrial", "roof", "safety", "fall-arrest", "anchor", "base:floor"]},
    {"id": "roof-ladder-landing", "label": "Roof Ladder Landing", "category": "industrial", "builder": build_roof_ladder_landing, "description": "Compact grated roof landing with guard rails and a climb side.", "tags": ["modular", "industrial", "roof", "landing", "ladder", "base:floor"]},
    {"id": "roof-duct-curb", "label": "Roof HVAC Duct Curb", "category": "industrial", "builder": build_roof_duct_curb, "description": "Square roof HVAC curb with a raised duct collar and service corner.", "tags": ["modular", "industrial", "roof", "duct", "hvac", "base:floor"]},

    {"id": "walkway-straight", "label": "Wide Service Walkway", "category": "industrial", "builder": build_walkway_straight, "description": "Wide four-meter service walkway with grated deck and twin guard rails.", "tags": ["modular", "industrial", "walkway", "catwalk", "4m", "base:floor"]},
    {"id": "walkway-t-junction", "label": "Walkway T Junction", "category": "industrial", "builder": build_walkway_t_junction, "description": "T-shaped walkway junction with three clear approach arms.", "tags": ["modular", "industrial", "walkway", "junction", "t", "base:floor"]},
    {"id": "walkway-l-junction", "label": "Walkway L Junction", "category": "industrial", "builder": build_walkway_l_junction, "description": "Right-angle walkway junction for wrapping a tank or building corner.", "tags": ["modular", "industrial", "walkway", "junction", "corner", "base:floor"]},
    {"id": "walkway-ramp", "label": "Walkway Access Ramp", "category": "industrial", "builder": build_walkway_ramp, "description": "Two-meter access ramp rising 0.8m with bilateral handrails.", "tags": ["modular", "industrial", "walkway", "ramp", "access", "base:floor"]},
    {"id": "walkway-stair-short", "label": "Short Walkway Stairs", "category": "industrial", "builder": build_walkway_stair_short, "description": "Four open steel walkway steps rising 0.8m with handrails.", "tags": ["modular", "industrial", "walkway", "stairs", "short", "base:floor"]},
    {"id": "walkway-landing", "label": "Elevated Walkway Landing", "category": "industrial", "builder": build_walkway_landing, "description": "Two-meter elevated grated landing with an open entry side.", "tags": ["modular", "industrial", "walkway", "landing", "platform", "base:floor"]},
    {"id": "walkway-rail-gate", "label": "Walkway Safety Gate", "category": "industrial", "builder": build_walkway_rail_gate, "description": "Swinging walkway safety gate sized for a one-meter opening.", "tags": ["industrial", "walkway", "rail", "gate", "safety", "base:floor"]},
    {"id": "walkway-rail-kickplate", "label": "Walkway Rail Toe Board", "category": "industrial", "builder": build_walkway_rail_kickplate, "description": "Guard rail with a solid toe board for service tool protection.", "tags": ["industrial", "walkway", "rail", "guard", "kickplate", "base:floor"]},
    {"id": "walkway-bridge-narrow", "label": "Narrow Walkway Bridge", "category": "industrial", "builder": build_walkway_bridge_narrow, "description": "One-meter wide six-meter bridge with twin support beams and rails.", "tags": ["modular", "industrial", "walkway", "bridge", "6m", "base:floor"]},
    {"id": "walkway-grated-turn", "label": "Grated Walkway Turn", "category": "industrial", "builder": build_walkway_grated_turn, "description": "L-shaped grated walkway turn with an outer guard rail.", "tags": ["modular", "industrial", "walkway", "grate", "turn", "base:floor"]},
    {"id": "walkway-service-steps", "label": "Walkway Service Steps", "category": "industrial", "builder": build_walkway_service_steps, "description": "Compact three-step service stair for machine access.", "tags": ["industrial", "walkway", "stairs", "service", "access", "base:floor"]},
    {"id": "walkway-cross-junction", "label": "Walkway Cross Junction", "category": "industrial", "builder": build_walkway_cross_junction, "description": "Four-way walkway junction for modular catwalk networks.", "tags": ["modular", "industrial", "walkway", "junction", "cross", "base:floor"]},

    {"id": "service-bay-arch", "label": "Service Bay Arch", "category": "industrial", "builder": build_service_bay_arch, "description": "Four-meter service bay opening with twin legs, header, and braces.", "tags": ["modular", "industrial", "service-bay", "arch", "frame", "base:floor"]},
    {"id": "service-bay-canopy", "label": "Service Bay Canopy", "category": "industrial", "builder": build_service_bay_canopy, "description": "Open service canopy with four posts and a shallow sloped roof.", "tags": ["modular", "industrial", "service-bay", "canopy", "roof", "base:floor"]},
    {"id": "service-bay-pillar", "label": "Service Bay Pillar", "category": "industrial", "builder": build_service_bay_pillar, "description": "Reinforced four-meter bay pillar with base, collar, and head plate.", "tags": ["modular", "industrial", "service-bay", "pillar", "structure", "base:floor"]},
    {"id": "service-bay-door-track", "label": "Service Bay Door Track", "category": "industrial", "builder": build_service_bay_door_track, "description": "Overhead sliding bay door track with two visible hangers.", "tags": ["industrial", "service-bay", "door", "track", "loading", "base:floor"]},
    {"id": "service-bay-workbench", "label": "Service Bay Workbench", "category": "industrial", "builder": build_service_bay_workbench, "description": "Maintenance workbench with lower shelf, back stop, and vise.", "tags": ["industrial", "service-bay", "workbench", "maintenance", "base:floor"]},
    {"id": "service-bay-tool-board", "label": "Service Bay Tool Board", "category": "industrial", "builder": build_service_bay_tool_board, "description": "Wall-mounted service tool board with three readable tool silhouettes.", "tags": ["industrial", "service-bay", "tool", "board", "maintenance", "base:floor"]},
    {"id": "loading-platform", "label": "Loading Platform", "category": "industrial", "builder": build_loading_platform, "description": "Four-meter loading platform at one-meter height with a guarded edge.", "tags": ["modular", "industrial", "loading", "platform", "dock", "base:floor"]},
    {"id": "loading-platform-ramp", "label": "Loading Platform Ramp", "category": "industrial", "builder": build_loading_platform_ramp, "description": "Two-meter vehicle ramp rising to a one-meter loading deck.", "tags": ["modular", "industrial", "loading", "ramp", "dock", "base:floor"]},
    {"id": "loading-dock-bumper", "label": "Loading Dock Bumper Set", "category": "industrial", "builder": build_loading_dock_bumper, "description": "Three replaceable dock bumpers on a heavy mounting beam.", "tags": ["industrial", "loading", "dock", "bumper", "safety", "base:floor"]},
    {"id": "loading-dock-ladder", "label": "Loading Dock Ladder", "category": "industrial", "builder": build_loading_dock_ladder, "description": "Short dock ladder with four rungs and a wide top hook.", "tags": ["industrial", "loading", "dock", "ladder", "access", "base:floor"]},
    {"id": "loading-gate", "label": "Loading Gate Arm", "category": "industrial", "builder": build_loading_gate, "description": "Swinging truck gate with a pivot post and marked horizontal arm.", "tags": ["industrial", "loading", "gate", "barrier", "vehicle", "base:floor"]},
    {"id": "loading-wheel-stop", "label": "Loading Wheel Stop", "category": "industrial", "builder": build_loading_wheel_stop, "description": "Low concrete wheel stop with anchor plates and reflector tabs.", "tags": ["industrial", "loading", "dock", "wheel-stop", "safety", "base:floor"]},

    {"id": "pipe-manifold", "label": "Pipe Distribution Manifold", "category": "industrial", "builder": build_pipe_manifold, "description": "Vertical four-port distribution manifold with branch valves.", "tags": ["pipe", "industrial", "manifold", "socket:bottom:-Z:0.3", "socket:branch:+X:0.3", "base:floor"]},
    {"id": "pipe-vertical-elbow", "label": "Vertical Pipe Elbow Riser", "category": "industrial", "builder": build_pipe_vertical_elbow, "description": "Pipe riser that turns at the top into a horizontal socket.", "tags": ["pipe", "industrial", "riser", "elbow", "socket:bottom:-Z:0.3", "socket:out:+X:0.3", "base:floor"]},
    {"id": "pipe-flange-pair", "label": "Pipe Flange Pair", "category": "industrial", "builder": build_pipe_flange_pair, "description": "Short pipe spool with two independent flange plates.", "tags": ["pipe", "industrial", "flange", "spool", "socket:in:-Y:0.3", "socket:out:+Y:0.3", "base:floor"]},
    {"id": "pipe-inspection-port", "label": "Pipe Inspection Port", "category": "industrial", "builder": build_pipe_inspection_port, "description": "Capped inspection riser with a bolted collar and service handle.", "tags": ["pipe", "industrial", "inspection", "port", "socket:bottom:-Z:0.5", "base:floor"]},
    {"id": "utility-panel", "label": "Utility Control Panel", "category": "industrial", "builder": build_utility_panel, "description": "Freestanding utility panel with face recesses and disconnect handle.", "tags": ["utility", "industrial", "panel", "electrical", "base:floor"]},
    {"id": "utility-panel-double", "label": "Double Utility Panel", "category": "industrial", "builder": build_utility_panel_double, "description": "Paired utility panels joined by a top conduit and status markers.", "tags": ["utility", "industrial", "panel", "electrical", "double", "base:floor"]},
    {"id": "utility-cabinet-low", "label": "Low Utility Cabinet", "category": "industrial", "builder": build_utility_cabinet_low, "description": "Waist-high service cabinet with two doors and raised feet.", "tags": ["utility", "industrial", "cabinet", "storage", "low", "base:floor"]},
    {"id": "utility-bench", "label": "Utility Maintenance Bench", "category": "industrial", "builder": build_utility_bench, "description": "Compact utility bench with a lower shelf and orange end cap.", "tags": ["utility", "industrial", "bench", "maintenance", "base:floor"]},
    {"id": "utility-tool-rack", "label": "Utility Tool Rack", "category": "industrial", "builder": build_utility_tool_rack, "description": "Vertical service tool rack with three large hanging hooks.", "tags": ["utility", "industrial", "tool", "rack", "maintenance", "base:floor"]},
    {"id": "utility-drain-channel", "label": "Utility Drain Channel", "category": "industrial", "builder": build_utility_drain_channel, "description": "Two-meter trench channel with removable bars and a sump end.", "tags": ["utility", "industrial", "drain", "channel", "trench", "base:floor"]},
    {"id": "utility-sewer-opening", "label": "Utility Sewer Opening", "category": "industrial", "builder": build_utility_sewer_opening, "description": "Open square sewer ring with a visible dark shaft and lifting tabs.", "tags": ["utility", "industrial", "sewer", "opening", "ground", "base:floor"]},
    {"id": "utility-meter-pedestal", "label": "Utility Meter Pedestal", "category": "industrial", "builder": build_utility_meter_pedestal, "description": "Freestanding utility meter pedestal with face, conduit, and foot.", "tags": ["utility", "industrial", "meter", "pedestal", "electrical", "base:floor"]},

    {"id": "wrench", "label": "Industrial Wrench", "category": "industrial", "builder": build_wrench, "description": "Compact black maintenance wrench with a rounded shaft and open jaw.", "tags": ["held", "tool", "industrial", "wrench", "grip:handle"]},
]

# ==============================================================================
# PIPELINE EXECUTION & BLENDER SCENE SETUP
# ==============================================================================

def srgb_hex_to_linear(hex_str):
    hex_str = hex_str.lstrip('#')
    rgb = [int(hex_str[i:i+2], 16) / 255.0 for i in (0, 2, 4)]
    return tuple((c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4) for c in rgb) + (1.0,)

def create_materials():
    materials = {}
    palette = [
        ("InkMat_OffWhite", "#eeeae1"),
        ("InkMat_Charcoal", "#181a1b"),
        ("InkMat_SafetyOrange", "#d45538"),
        ("InkMat_StructuralGray", "#7b8279"),
    ]
    for idx, (name, hex_val) in enumerate(palette):
        mat = bpy.data.materials.new(name)
        mat.use_nodes = True
        nodes = mat.node_tree.nodes
        nodes.clear()
        out_node = nodes.new("ShaderNodeOutputMaterial")
        bg_node = nodes.new("ShaderNodeBackground")
        bg_node.inputs["Color"].default_value = srgb_hex_to_linear(hex_val)
        mat.node_tree.links.new(bg_node.outputs["Background"], out_node.inputs["Surface"])
        materials[idx] = mat

    return materials

def main():
    parser = argparse.ArgumentParser(description="Generate Inkline stick-game props and industrial kit")
    parser.add_argument("--out", default="public/assets", help="Output directory for assets")
    
    # Parse args after '--'
    cli_args = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    args = parser.parse_args(cli_args)
    
    out_dir = os.path.abspath(args.out)
    if not os.path.isabs(args.out) and not os.path.exists(out_dir):
        candidate = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", args.out))
        if os.path.exists(candidate) or "inkline-showcase" in candidate:
            out_dir = candidate

    props_dir = os.path.join(out_dir, "props")
    source_dir = os.path.join(out_dir, "source")
    os.makedirs(props_dir, exist_ok=True)
    os.makedirs(source_dir, exist_ok=True)

    print(f"==================================================")
    print(f"INKLINE PROP & INDUSTRIAL DISTRICT GENERATOR")
    print(f"Output directory: {out_dir}")
    print(f"GLB export dir:   {props_dir}")
    print(f"Blend source dir: {source_dir}")
    print(f"Total catalog models: {len(MODELS_CATALOG)}")
    print(f"==================================================")

    # Clean existing Blender scene
    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    for mesh in list(bpy.data.meshes):
        bpy.data.meshes.remove(mesh, do_unlink=True)
    for mat in list(bpy.data.materials):
        bpy.data.materials.remove(mat, do_unlink=True)
    for col in list(bpy.data.collections):
        bpy.data.collections.remove(col)

    materials = create_materials()

    # Create category collections
    categories = ["weapons", "city", "parkour", "sports", "sci-fi", "industrial"]
    col_map = {
        "weapons": "Weapons",
        "city": "City",
        "parkour": "Parkour",
        "sports": "Sports",
        "sci-fi": "SciFi",
        "industrial": "Industrial"
    }
    blender_collections = {}
    for cat in categories:
        col = bpy.data.collections.new(col_map[cat])
        bpy.context.scene.collection.children.link(col)
        blender_collections[cat] = col

    category_counts = {cat: 0 for cat in categories}
    model_entries = []
    category_tri_max = {cat: 0 for cat in categories}

    for item in MODELS_CATALOG:
        model_id = item["id"]
        cat = item["category"]
        label = item["label"]
        builder_func = item["builder"]

        # Build mesh with bmesh
        me = bpy.data.meshes.new(f"mesh_{model_id}")
        bm = bmesh.new()
        builder_func(bm)
        # Held weapons use the near-black ink for a clear silhouette.
        # Preserve authored safety-orange accents and leave sports equipment unchanged.
        if cat == "weapons" or (cat == "sci-fi" and "held" in item["tags"]):
            for face in bm.faces:
                if face.material_index == 0:
                    face.material_index = MAT_CHARCOAL
        # Keep the near-black ink for figures, weapons, and small authored
        # accents. Environment structure uses the quieter middle gray.
        if cat in ENVIRONMENT_CATEGORIES and "held" not in item["tags"]:
            for face in bm.faces:
                if face.material_index == MAT_CHARCOAL:
                    face.material_index = MAT_STRUCTURAL_GRAY
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
        bm.to_mesh(me)
        bm.free()

        # Create object
        obj = bpy.data.objects.new(model_id, me)
        obj.data.materials.append(materials[0])
        obj.data.materials.append(materials[1])
        obj.data.materials.append(materials[2])
        obj.data.materials.append(materials[3])

        # Link to active collection for export
        bpy.context.scene.collection.objects.link(obj)
        bpy.context.view_layer.objects.active = obj
        obj.select_set(True)

        # Keep moving parts separate from the fixed weapon mesh.
        string_obj = None
        moving_parts = {"bow": ("bow-string", build_bow_string), "shotgun": ("shotgun-pump", build_shotgun_pump),
                        "rifle": ("rifle-magazine", build_rifle_magazine)}
        if model_id in moving_parts:
            part_name, part_builder = moving_parts[model_id]
            string_me = bpy.data.meshes.new(part_name)
            string_bm = bmesh.new()
            part_builder(string_bm)
            bmesh.ops.recalc_face_normals(string_bm, faces=string_bm.faces)
            string_bm.to_mesh(string_me)
            string_bm.free()
            string_obj = bpy.data.objects.new(part_name, string_me)
            for material in materials.values():
                string_obj.data.materials.append(material)
            bpy.context.scene.collection.objects.link(string_obj)
            string_obj.parent = obj
            string_obj.select_set(True)

        # Export GLB at origin (0,0,0)
        glb_filename = f"{model_id}.glb"
        glb_path = os.path.join(props_dir, glb_filename)
        bpy.ops.export_scene.gltf(
            filepath=glb_path,
            export_format='GLB',
            use_selection=True,
            export_yup=True,
            export_apply=True,
            export_materials='EXPORT',
            export_cameras=False,
            export_lights=False,
            export_animations=False
        )

        # Verify and extract exact dimensions & stats from exported GLB
        meta = parse_glb_header(glb_path)
        category_tri_max[cat] = max(category_tri_max[cat], meta["triangles"])

        entry = {
            "id": model_id,
            "label": label,
            "kind": "prop",
            "category": cat,
            "file": f"assets/props/{glb_filename}",
            "thumbnail": f"assets/previews/{model_id}.png",
            "dimensions": meta["dimensions"],
            "triangles": meta["triangles"],
            "vertices": meta["vertices"],
            "materials": meta["materials"],
            "description": item["description"],
            "tags": item["tags"]
        }
        model_entries.append(entry)

        # Move object to showroom grid in Blender scene
        cat_row = categories.index(cat)
        col_idx = category_counts[cat]
        spacing_x = 4.5
        spacing_y = 6.0
        obj.location = (col_idx * spacing_x, cat_row * spacing_y, 0.0)

        # Relink to category collection
        bpy.context.scene.collection.objects.unlink(obj)
        blender_collections[cat].objects.link(obj)
        if string_obj is not None:
            bpy.context.scene.collection.objects.unlink(string_obj)
            blender_collections[cat].objects.link(string_obj)
        obj.select_set(False)
        if string_obj is not None:
            string_obj.select_set(False)

        category_counts[cat] += 1

    # Save industrial.blend
    blend_path = os.path.join(source_dir, "industrial.blend")
    bpy.ops.wm.save_as_mainfile(filepath=blend_path)
    print(f"Saved editable source showroom: {blend_path}")

    # Write props.json
    props_json_path = os.path.join(out_dir, "props.json")
    with open(props_json_path, 'w', encoding='utf-8') as f:
        json.dump({"models": model_entries}, f, indent=2)
    print(f"Wrote catalog metadata: {props_json_path}")

    # Summary Report
    total_size = sum(os.path.getsize(os.path.join(props_dir, f"{m['id']}.glb")) for m in model_entries)
    print("\n--------------------------------------------------")
    print("GENERATION REPORT:")
    print("--------------------------------------------------")
    for cat in categories:
        print(f"  Category {cat:12s}: {category_counts[cat]:3d} models | max {category_tri_max[cat]:4d} triangles")
    print(f"  TOTAL MODELS     : {len(model_entries)}")
    print(f"  TOTAL SIZE (MB)  : {total_size / (1024 * 1024):.2f} MB")
    print(f"  PROPS.JSON COUNT : {len(model_entries)}")
    print("--------------------------------------------------")
    print("SUCCESS: All models generated and verified.")

if __name__ == "__main__":
    main()
