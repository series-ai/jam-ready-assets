"""
INKLINE stick figure and animation source.

Build 12 bodies with one spine, one arm junction, and one leg junction.
Keep 18 named bones and 85 named clips. The original 84 IDs remain.
Action phases, foot plants, and travel speeds form one motion contract.
Bake support targets into the GLB and the editable Blender actions.
Export at 120 Hz while authored frames and events use 30 FPS.
"""

import sys
import os
import math
import json
import struct
import time
from typing import Dict, List, Tuple, Any, Optional

import bpy
import bmesh
from mathutils import Vector, Matrix, Euler, Quaternion

# =============================================================================
# CONSTANTS & CONFIGURATION
# =============================================================================

BONE_NAMES = [
    'Root',
    'Hips',
    'Spine',
    'Chest',
    'Neck',
    'Head',
    'UpperArm_L',
    'Forearm_L',
    'Hand_L',
    'UpperArm_R',
    'Forearm_R',
    'Hand_R',
    'Thigh_L',
    'Shin_L',
    'Foot_L',
    'Thigh_R',
    'Shin_R',
    'Foot_R',
]

# Linear values for the intended near-black #151716 display color.
INK_COLOR = (0.0075, 0.0086, 0.0080, 1.0)
FPS = 30
GROUND_CLEARANCE = .008
PLANT_CLEARANCE = .011
EXPORT_SUBSTEPS = 4
TORSO_BEND_SHARE = .25
TORSO_BEND_LIMITS = {'Spine': 6.0, 'Chest': 4.0}

# =============================================================================
# 12 DISTINCT CHARACTER SPECIFICATIONS (TIGHT SHOULDER, SHORT ROUNDED FEET)
# =============================================================================

CHARACTER_SPECS = [
    {
        'id': 'stick-standard',
        'label': 'Stick Core',
        'category': 'standard',
        'height': 1.80,
        'head_radius': 0.145,
        # 1.45x concept-study ink weight. The tube remains a thin line.
        'stroke_radius': 0.0348,
        'stance_w': 0.16,
        'hand_radius': 0.034,
        'foot_len': 0.065,
        'description': 'Balanced core figure with open reach, a balanced stance, and a clean adaptable line of action.',
        'tags': ['core', 'balanced', 'neutral', 'thin-stroke'],
        'proportions': {'hip_z': 0.95, 'knee_z': 0.52, 'ankle_z': 0.08, 'spine_z': 1.15, 'chest_z': 1.35, 'shoulder_z': 1.40, 'neck_gap': 0.065, 'elbow_z': 1.14, 'wrist_z': 0.90, 'hand_z': 0.82, 'leg_splay': 1.02},
    },
    {
        'id': 'stick-runner',
        'label': 'Stick Runner',
        'category': 'athlete',
        'height': 1.82,
        'head_radius': 0.140,
        # Runner stays light at 1.40x so the longer limbs keep negative space.
        'stroke_radius': 0.028,
        'stance_w': 0.15,
        'hand_radius': 0.028,
        'foot_len': 0.068,
        'description': 'Swift runner with a short torso, long lower legs, and a forward-ready line of action.',
        'tags': ['runner', 'swift', 'long-shin', 'lightweight'],
        'proportions': {'hip_z': 1.04, 'knee_z': 0.58, 'ankle_z': 0.055, 'spine_z': 1.10, 'chest_z': 1.31, 'shoulder_z': 1.38, 'neck_gap': 0.06, 'elbow_z': 1.12, 'wrist_z': 0.86, 'hand_z': 0.76, 'leg_splay': 1.04},
    },
    {
        'id': 'stick-fighter',
        'label': 'Stick Duelist',
        'category': 'combat',
        'height': 1.78,
        'head_radius': 0.145,
        'stroke_radius': 0.040,
        'stance_w': 0.19,
        'hand_radius': 0.042,
        'foot_len': 0.070,
        'description': 'Reach duelist with a wide guard, long forearms, bent knees, and clear striking hands.',
        'tags': ['duelist', 'reach', 'wide-guard', 'melee'],
        'proportions': {'hip_z': 0.92, 'knee_z': 0.50, 'ankle_z': 0.07, 'spine_z': 1.10, 'chest_z': 1.31, 'shoulder_z': 1.39, 'neck_gap': 0.06, 'elbow_z': 1.12, 'wrist_z': 0.84, 'hand_z': 0.74, 'arm_out': 0.025, 'elbow_out': 0.015, 'leg_splay': 1.10},
    },
    {
        'id': 'stick-tall',
        'label': 'Stick Staff Adept',
        'category': 'tall',
        'height': 2.05,
        'head_radius': 0.160,
        'stroke_radius': 0.0319,
        'stance_w': 0.16,
        'hand_radius': 0.031,
        'foot_len': 0.072,
        'description': 'Reach specialist with visibly long arms, a tall frame, and a controlled staff-ready stance.',
        'tags': ['staff-adept', 'reach', 'long-arms', 'slender'],
        'proportions': {'hip_z': 0.96, 'knee_z': 0.53, 'ankle_z': 0.07, 'spine_z': 1.20, 'chest_z': 1.40, 'shoulder_z': 1.44, 'neck_gap': 0.07, 'elbow_z': 1.18, 'wrist_z': 0.92, 'hand_z': 0.80, 'leg_splay': 1.02},
    },
    {
        'id': 'stick-compact',
        'label': 'Stick Scrapper',
        'category': 'agile',
        'height': 1.54,
        'head_radius': 0.130,
        'stroke_radius': 0.032,
        'stance_w': 0.16,
        'hand_radius': 0.032,
        'foot_len': 0.055,
        'description': 'Low-center scrapper with a compact torso, grounded feet, and quick close-range movement.',
        'tags': ['scrapper', 'compact', 'low-center', 'agile'],
        'proportions': {'hip_z': 0.86, 'knee_z': 0.48, 'ankle_z': 0.06, 'spine_z': 1.10, 'chest_z': 1.32, 'shoulder_z': 1.40, 'neck_gap': 0.06, 'elbow_z': 1.08, 'wrist_z': 0.82, 'hand_z': 0.74, 'leg_splay': 1.14},
    },
    {
        'id': 'stick-heavy',
        'label': 'Stick Heavy',
        'category': 'heavy',
        'height': 1.86,
        'head_radius': 0.155,
        # Heavy uses a restrained 1.35x step to preserve a graceful outline.
        'stroke_radius': 0.046,
        'stance_w': 0.21,
        'hand_radius': 0.044,
        'foot_len': 0.075,
        'description': 'Power frame with broad strokes, a short neck, long forearms, and a wide grounded base.',
        'tags': ['heavy', 'power', 'broad-frame', 'long-forearms'],
        'proportions': {'hip_z': 0.94, 'knee_z': 0.51, 'ankle_z': 0.07, 'spine_z': 1.15, 'chest_z': 1.37, 'shoulder_z': 1.42, 'neck_gap': 0.055, 'elbow_z': 1.17, 'wrist_z': 0.84, 'hand_z': 0.72, 'leg_splay': 1.08},
    },
    {
        'id': 'stick-scout',
        'label': 'Stick Scout',
        'category': 'scout',
        'height': 1.76,
        'head_radius': 0.140,
        'stroke_radius': 0.0319,
        'stance_w': 0.15,
        'hand_radius': 0.031,
        'foot_len': 0.065,
        'description': 'Swift scout with thin lines, long lower legs, and quick feet.',
        'tags': ['scout', 'swift', 'long-shin', 'thin-lines'],
        'proportions': {'hip_z': 1.06, 'knee_z': 0.60, 'ankle_z': 0.055, 'spine_z': 1.13, 'chest_z': 1.34, 'shoulder_z': 1.43, 'neck_gap': 0.06, 'elbow_z': 1.13, 'wrist_z': 0.88, 'hand_z': 0.79, 'leg_splay': 1.05},
    },
    {
        'id': 'stick-acrobat',
        'label': 'Stick Acrobat',
        'category': 'agile',
        'height': 1.70,
        'head_radius': 0.135,
        'stroke_radius': 0.028,
        'stance_w': 0.15,
        'hand_radius': 0.028,
        'foot_len': 0.065,
        'description': 'Acrobat with a compact torso, long mobile limbs, and a ready open line through the hips.',
        'tags': ['acrobat', 'mobile', 'long-limbs', 'parkour'],
        'proportions': {'hip_z': 0.88, 'knee_z': 0.51, 'ankle_z': 0.065, 'spine_z': 1.08, 'chest_z': 1.29, 'shoulder_z': 1.43, 'neck_gap': 0.06, 'elbow_z': 1.14, 'wrist_z': 0.86, 'hand_z': 0.76, 'leg_splay': 1.08},
    },
    {
        'id': 'stick-worker',
        'label': 'Stick Worker',
        'category': 'utility',
        'height': 1.80,
        'head_radius': 0.145,
        'stroke_radius': 0.040,
        'stance_w': 0.19,
        'hand_radius': 0.039,
        'foot_len': 0.070,
        'description': 'Utility worker with a stable base and short arms.',
        'tags': ['worker', 'utility', 'sturdy', 'short-arms'],
        'proportions': {'hip_z': 0.95, 'knee_z': 0.51, 'ankle_z': 0.07, 'spine_z': 1.15, 'chest_z': 1.36, 'shoulder_z': 1.42, 'neck_gap': 0.06, 'elbow_z': 1.13, 'wrist_z': 0.87, 'hand_z': 0.79, 'leg_splay': 1.06},
    },
    {
        'id': 'stick-agent',
        'label': 'Stick Agent',
        'category': 'tactical',
        'height': 1.83,
        'head_radius': 0.140,
        'stroke_radius': 0.0319,
        'stance_w': 0.15,
        'hand_radius': 0.031,
        'foot_len': 0.065,
        'description': 'Upright agent with thin lines and small controlled movements.',
        'tags': ['agent', 'precise', 'upright', 'controlled'],
        'proportions': {'hip_z': 0.96, 'knee_z': 0.52, 'ankle_z': 0.07, 'spine_z': 1.16, 'chest_z': 1.37, 'shoulder_z': 1.44, 'neck_gap': 0.06, 'elbow_z': 1.14, 'wrist_z': 0.89, 'hand_z': 0.81, 'leg_splay': 1.02},
    },
    {
        'id': 'stick-striker',
        'label': 'Stick Striker',
        'category': 'combat',
        'height': 1.84,
        'head_radius': 0.140,
        'stroke_radius': 0.0375,
        'stance_w': 0.16,
        'hand_radius': 0.036,
        'foot_len': 0.068,
        'description': 'Striker with a short spine and long lower legs.',
        'tags': ['striker', 'long-shin', 'kickboxer', 'short-spine'],
        'proportions': {'hip_z': 0.91, 'knee_z': 0.57, 'ankle_z': 0.06, 'spine_z': 1.09, 'chest_z': 1.31, 'shoulder_z': 1.43, 'neck_gap': 0.06, 'elbow_z': 1.12, 'wrist_z': 0.86, 'hand_z': 0.76, 'leg_splay': 1.05},
    },
    {
        'id': 'stick-sentinel',
        'label': 'Stick Sentinel',
        'category': 'guardian',
        'height': 1.90,
        'head_radius': 0.150,
        'stroke_radius': 0.043,
        'stance_w': 0.22,
        'hand_radius': 0.042,
        'foot_len': 0.072,
        'description': 'Defense sentinel with thick lines, a low guard, and a stable base.',
        'tags': ['sentinel', 'guard', 'broad-defense', 'stable-base'],
        'proportions': {'hip_z': 0.95, 'knee_z': 0.50, 'ankle_z': 0.07, 'spine_z': 1.14, 'chest_z': 1.36, 'shoulder_z': 1.45, 'neck_gap': 0.06, 'elbow_z': 1.13, 'wrist_z': 0.86, 'hand_z': 0.78, 'leg_splay': 1.12},
    },
]

def character_landmarks(cfg: Dict[str, Any]) -> Dict[str, Any]:
    """Return one shared set of body landmarks for bones and mesh waypoints."""
    scale = cfg['height'] / 1.80
    p = cfg.get('proportions', {})
    r_head = cfg['head_radius']

    def z(name: str, default: float) -> float:
        return p.get(name, default) * scale

    z_ankle = z('ankle_z', 0.08)
    z_knee = z('knee_z', 0.52)
    z_hip = z('hip_z', 0.95)
    z_spine = z('spine_z', 1.15)
    z_chest = z('chest_z', 1.35)
    sh_z = z('shoulder_z', 1.40)
    z_head_base = cfg['height'] - r_head * 1.95
    z_neck = z_head_base - p.get('neck_gap', 0.065)
    z_head_top = z_head_base + r_head * 2.0
    z_el = z('elbow_z', 1.14)
    z_wr = z('wrist_z', 0.90)
    z_hd = z('hand_z', 0.82)
    arm_out = p.get('arm_out', 0.015) * scale
    elbow_out = p.get('elbow_out', 0.008) * scale
    wrist_y = p.get('wrist_y', -0.015) * scale
    hand_y = p.get('hand_y', -0.025) * scale
    leg_splay = p.get('leg_splay', 1.0)
    stance_width = cfg['stance_w']
    landmarks: Dict[str, Any] = {
        'scale': scale,
        'r_head': r_head,
        'z_ankle': z_ankle,
        'z_knee': z_knee,
        'z_hip': z_hip,
        'z_spine': z_spine,
        'z_chest': z_chest,
        'z_neck': z_neck,
        'z_head_base': z_head_base,
        'z_head_top': z_head_top,
        'sh_z': sh_z,
        'z_el': z_el,
        'z_wr': z_wr,
        'z_hd': z_hd,
        'head_center': Vector((0, 0, z_head_base + r_head * 0.95)),
        'leg_splay': leg_splay,
    }
    for side, sgn in [('L', 1.0), ('R', -1.0)]:
        arm_x = (0.035 * scale + arm_out) * sgn
        elbow_x = (0.025 * scale + elbow_out) * sgn
        stance_x = stance_width * 0.5 * leg_splay * sgn
        landmarks[f'shoulder_{side}'] = Vector((0, 0, sh_z))
        landmarks[f'elbow_{side}'] = Vector((elbow_x, 0.008 * scale, z_el))
        landmarks[f'wrist_{side}'] = Vector((arm_x, wrist_y, z_wr))
        landmarks[f'hand_{side}'] = Vector((arm_x, hand_y, z_hd))
        landmarks[f'hip_{side}'] = Vector((0, 0, z_hip))
        landmarks[f'knee_{side}'] = Vector((stance_x * 0.55, 0, z_knee))
        landmarks[f'ankle_{side}'] = Vector((stance_x, 0, z_ankle))
        landmarks[f'foot_{side}'] = Vector((stance_x, -cfg['foot_len'], max(0.02 * scale, cfg['stroke_radius'] * 0.95)))
    return landmarks

# =============================================================================
# SCENE UTILITIES & MATERIAL BUILDER
# =============================================================================

def clean_database():
    """Wipe all existing objects, meshes, armatures, actions, materials."""
    for col in [bpy.data.objects, bpy.data.armatures, bpy.data.meshes, bpy.data.materials, bpy.data.actions]:
        for item in list(col):
            col.remove(item)

def create_ink_material() -> bpy.types.Material:
    """Create black unlit material Ink exporting as KHR_materials_unlit."""
    mat = bpy.data.materials.new('Ink')
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    nodes.clear()
    out_node = nodes.new('ShaderNodeOutputMaterial')
    bg_node = nodes.new('ShaderNodeBackground')
    bg_node.inputs['Color'].default_value = INK_COLOR
    mat.node_tree.links.new(bg_node.outputs['Background'], out_node.inputs['Surface'])
    return mat

# =============================================================================
# ARMATURE BUILDER (NATURAL ARMS-AT-SIDES REST POSE)
# =============================================================================

def build_character_armature(char_id: str, cfg: Dict[str, Any]) -> bpy.types.Object:
    """
    Creates humanoid armature with exact 18 named bones, Z-up, front -Y.
    Rest pose has arms falling naturally at the sides with a mild elbow flex.
    Both arms share one node. Both legs share one node.
    Feet are short simple rounded strokes.
    """
    lm = character_landmarks(cfg)
    scale = lm['scale']
    z_hip = lm['z_hip']
    z_spine = lm['z_spine']
    z_chest = lm['z_chest']
    z_neck = lm['z_neck']
    z_head_base = lm['z_head_base']
    z_head_top = lm['z_head_top']

    arm_data = bpy.data.armatures.new(f'{char_id}_Rig')
    arm_obj = bpy.data.objects.new(f'{char_id}_Armature', arm_data)
    bpy.context.scene.collection.objects.link(arm_obj)
    bpy.context.view_layer.objects.active = arm_obj
    arm_obj.animation_data_create()

    bpy.ops.object.mode_set(mode='EDIT')
    eb = arm_data.edit_bones

    # Root (at floor origin)
    b_root = eb.new('Root')
    b_root.head = (0, 0, 0)
    b_root.tail = (0, 0, 0.10 * scale)

    # Spine chain
    b_hips = eb.new('Hips')
    b_hips.head = (0, 0, z_hip)
    b_hips.tail = (0, 0, z_spine)
    b_hips.parent = b_root

    b_spine = eb.new('Spine')
    b_spine.head = (0, 0, z_spine)
    b_spine.tail = (0, 0, z_chest)
    b_spine.parent = b_hips

    b_chest = eb.new('Chest')
    b_chest.head = (0, 0, z_chest)
    b_chest.tail = (0, 0, z_neck)
    b_chest.parent = b_spine

    b_neck = eb.new('Neck')
    b_neck.head = (0, 0, z_neck)
    b_neck.tail = (0, 0, z_head_base)
    b_neck.parent = b_chest

    b_head = eb.new('Head')
    b_head.head = (0, 0, z_head_base)
    b_head.tail = (0, 0, z_head_top)
    b_head.parent = b_neck

    # Limbs (L: +X, R: -X)
    for side, sgn in [('L', 1.0), ('R', -1.0)]:
        # Arms: fall naturally at sides with mild elbow flex
        uarm = eb.new(f'UpperArm_{side}')
        uarm.head = lm[f'shoulder_{side}']
        uarm.tail = lm[f'elbow_{side}']
        uarm.parent = b_chest

        farm = eb.new(f'Forearm_{side}')
        farm.head = uarm.tail
        farm.tail = lm[f'wrist_{side}']
        farm.parent = uarm

        hand = eb.new(f'Hand_{side}')
        hand.head = farm.tail
        hand.tail = lm[f'hand_{side}']
        hand.parent = farm

        # Legs (hip to knee to ankle to foot)
        thigh = eb.new(f'Thigh_{side}')
        thigh.head = lm[f'hip_{side}']
        thigh.tail = lm[f'knee_{side}']
        thigh.parent = b_hips

        shin = eb.new(f'Shin_{side}')
        shin.head = thigh.tail
        shin.tail = lm[f'ankle_{side}']
        shin.parent = thigh

        foot = eb.new(f'Foot_{side}')
        foot.head = shin.tail
        foot.tail = Vector((lm[f'foot_{side}'].x, lm[f'foot_{side}'].y, 0.0)) # floor at zero
        foot.parent = shin

    bpy.ops.object.mode_set(mode='OBJECT')
    return arm_obj

# =============================================================================
# CONTINUOUS SKINNED MESH BUILDER (REFINED STICK SILHOUETTE)
# =============================================================================

def add_smooth_tube(bm: bmesh.types.BMesh, waypoints: List[Tuple[Vector, float, Dict[str, float]]],
                    segments: int = 8, cap_start: bool = False, cap_end: bool = True,
                    d_layer=None, vgroups_map: Dict[str, int] = None):
    """
    Builds a continuous smooth polygonal tube lofted along waypoints.
    Each waypoint has (position, radius, bone_weights_dict).
    End cap uses a smooth multi-ring hemispherical dome instead of a sharp cone point.
    """
    if len(waypoints) < 2:
        return []

    rings_verts = []
    ring_frames = []
    num_wp = len(waypoints)
    previous_x_axis = None

    for i, (pos, rad, weights) in enumerate(waypoints):
        if i == 0:
            dir_vec = (waypoints[1][0] - pos).normalized()
        elif i == num_wp - 1:
            dir_vec = (pos - waypoints[i - 1][0]).normalized()
        else:
            d1 = (pos - waypoints[i - 1][0]).normalized()
            d2 = (waypoints[i + 1][0] - pos).normalized()
            dir_vec = (d1 + d2).normalized()

        # Parallel transport the previous ring basis. Recomputing a basis from
        # a global up vector can flip it at a near-vertical ankle or wrist.
        # Projecting the previous x axis keeps the ring vertex order continuous.
        transported = previous_x_axis is not None
        if transported:
            x_axis = previous_x_axis - dir_vec * previous_x_axis.dot(dir_vec)
            if x_axis.length <= 1e-6:
                transported = False
                previous_x_axis = None
        if previous_x_axis is None:
            reference_axes = (Vector((0, 0, 1)), Vector((0, 1, 0)), Vector((1, 0, 0)))
            reference = min(reference_axes, key=lambda axis: abs(dir_vec.dot(axis)))
            x_axis = dir_vec.cross(reference)
            if x_axis.length <= 1e-6:
                reference = reference_axes[0]
                x_axis = dir_vec.cross(reference)
            x_axis.normalize()
        else:
            x_axis.normalize()
        y_axis = x_axis.cross(dir_vec).normalized()
        if transported and ring_frames:
            # A transported frame must preserve ring winding. A negative dot
            # means the loft basis flipped and would form a bow-tie seam.
            assert ring_frames[-1][0].dot(x_axis) >= -1e-5, 'Tube frame flipped between adjacent rings'
        previous_x_axis = x_axis.copy()
        ring_frames.append((x_axis.copy(), y_axis.copy()))

        current_ring = []
        for s in range(segments):
            theta = 2.0 * math.pi * s / segments
            offset = (x_axis * math.cos(theta) + y_axis * math.sin(theta)) * rad
            v = bm.verts.new(pos + offset)
            if d_layer and vgroups_map:
                for bname, w in weights.items():
                    if bname in vgroups_map and w > 0:
                        v[d_layer][vgroups_map[bname]] = w
            current_ring.append(v)
        rings_verts.append(current_ring)

    for r in range(len(rings_verts) - 1):
        for s in range(segments):
            s_next = (s + 1) % segments
            bm.faces.new([rings_verts[r][s], rings_verts[r][s_next], rings_verts[r + 1][s_next], rings_verts[r + 1][s]])

    # Smooth rounded hemispherical dome for start
    if cap_start:
        pos_start, rad_start, weights_start = waypoints[0]
        dir_start = (waypoints[0][0] - waypoints[1][0]).normalized()
        x_axis, y_axis = ring_frames[0]
        prev_ring = rings_verts[0]
        for step in [1, 2]:
            phi = math.pi * 0.5 * step / 3.0
            r_step = rad_start * math.cos(phi)
            d_step = rad_start * math.sin(phi)
            step_ring = []
            for s in range(segments):
                theta = 2.0 * math.pi * s / segments
                offset = (x_axis * math.cos(theta) + y_axis * math.sin(theta)) * r_step + dir_start * d_step
                v = bm.verts.new(pos_start + offset)
                if d_layer and vgroups_map:
                    for bname, w in weights_start.items():
                        if bname in vgroups_map and w > 0:
                            v[d_layer][vgroups_map[bname]] = w
                step_ring.append(v)
            for s in range(segments):
                s_next = (s + 1) % segments
                bm.faces.new([prev_ring[s], step_ring[s], step_ring[s_next], prev_ring[s_next]])
            prev_ring = step_ring
        v_pole_start = bm.verts.new(pos_start + dir_start * rad_start)
        if d_layer and vgroups_map:
            for bname, w in weights_start.items():
                if bname in vgroups_map and w > 0:
                    v_pole_start[d_layer][vgroups_map[bname]] = w
        for s in range(segments):
            s_next = (s + 1) % segments
            bm.faces.new([prev_ring[s], v_pole_start, prev_ring[s_next]])

    # Smooth rounded hemispherical dome for end (replaces sharp cone point)
    if cap_end:
        pos_end, rad_end, weights_end = waypoints[-1]
        dir_end = (pos_end - waypoints[-2][0]).normalized()
        x_axis, y_axis = ring_frames[-1]
        prev_ring = rings_verts[-1]
        for step in [1, 2]:
            phi = math.pi * 0.5 * step / 3.0
            r_step = rad_end * math.cos(phi)
            d_step = rad_end * math.sin(phi)
            step_ring = []
            for s in range(segments):
                theta = 2.0 * math.pi * s / segments
                offset = (x_axis * math.cos(theta) + y_axis * math.sin(theta)) * r_step + dir_end * d_step
                v = bm.verts.new(pos_end + offset)
                if d_layer and vgroups_map:
                    for bname, w in weights_end.items():
                        if bname in vgroups_map and w > 0:
                            v[d_layer][vgroups_map[bname]] = w
                step_ring.append(v)
            for s in range(segments):
                s_next = (s + 1) % segments
                bm.faces.new([prev_ring[s], prev_ring[s_next], step_ring[s_next], step_ring[s]])
            prev_ring = step_ring
        v_pole = bm.verts.new(pos_end + dir_end * rad_end)
        if d_layer and vgroups_map:
            for bname, w in weights_end.items():
                if bname in vgroups_map and w > 0:
                    v_pole[d_layer][vgroups_map[bname]] = w
        for s in range(segments):
            s_next = (s + 1) % segments
            bm.faces.new([prev_ring[s], prev_ring[s_next], v_pole])

    return rings_verts

def add_smooth_sphere(bm: bmesh.types.BMesh, center: Vector, radius: float,
                      bone_name: str, u_segments: int = 16, v_segments: int = 10,
                      d_layer=None, vgroups_map: Dict[str, int] = None):
    """Generates a solid black sphere for the head or accents."""
    v_north = bm.verts.new(center + Vector((0, 0, radius)))
    if d_layer and vgroups_map and bone_name in vgroups_map:
        v_north[d_layer][vgroups_map[bone_name]] = 1.0

    ring_verts = []
    for ring in range(1, v_segments):
        phi = math.pi * ring / v_segments
        z = radius * math.cos(phi)
        ring_r = radius * math.sin(phi)
        c_ring = []
        for s in range(u_segments):
            theta = 2.0 * math.pi * s / u_segments
            x = ring_r * math.cos(theta)
            y = ring_r * math.sin(theta)
            v = bm.verts.new(center + Vector((x, y, z)))
            if d_layer and vgroups_map and bone_name in vgroups_map:
                v[d_layer][vgroups_map[bone_name]] = 1.0
            c_ring.append(v)
        ring_verts.append(c_ring)

    v_south = bm.verts.new(center - Vector((0, 0, radius)))
    if d_layer and vgroups_map and bone_name in vgroups_map:
        v_south[d_layer][vgroups_map[bone_name]] = 1.0

    for s in range(u_segments):
        s_next = (s + 1) % u_segments
        bm.faces.new([v_north, ring_verts[0][s], ring_verts[0][s_next]])

    for r in range(len(ring_verts) - 1):
        for s in range(u_segments):
            s_next = (s + 1) % u_segments
            bm.faces.new([ring_verts[r][s], ring_verts[r + 1][s], ring_verts[r + 1][s_next], ring_verts[r][s_next]])

    for s in range(u_segments):
        s_next = (s + 1) % u_segments
        bm.faces.new([v_south, ring_verts[-1][s_next], ring_verts[-1][s]])


def build_character_mesh(char_id: str, arm_obj: bpy.types.Object, cfg: Dict[str, Any], mat: bpy.types.Material) -> bpy.types.Object:
    """
    Builds continuous smooth stick figure geometry:
    - One spine with a common arm node and a common leg node.
    - Equal-width rounded limb sections that keep their width at bends.
    - Short rounded stroke ends for hands and feet.
    - Normalized skin weights.
    """
    mesh_data = bpy.data.meshes.new(f'{char_id}_Mesh')
    mesh_obj = bpy.data.objects.new(char_id, mesh_data)
    bpy.context.scene.collection.objects.link(mesh_obj)
    mesh_obj.parent = arm_obj

    vgroups_map = {}
    for bname in BONE_NAMES:
        vg = mesh_obj.vertex_groups.new(name=bname)
        vgroups_map[bname] = vg.index

    lm = character_landmarks(cfg)
    scale = lm['scale']
    r_limb = cfg['stroke_radius']
    r_head = cfg['head_radius']
    r_hand = cfg['hand_radius']
    foot_len = cfg['foot_len']
    # Lift the short rounded foot center with the ink gauge so the dome stays
    # on the floor after the stroke radius pass.
    foot_z = lm['foot_L'].z
    z_ankle = lm['z_ankle']
    z_knee = lm['z_knee']
    z_hip = lm['z_hip']
    z_spine = lm['z_spine']
    z_chest = lm['z_chest']
    z_neck = lm['z_neck']
    z_head_base = lm['z_head_base']
    head_center = lm['head_center']
    sh_z = lm['sh_z']
    z_el = lm['z_el']
    z_wr = lm['z_wr']
    z_hd = lm['z_hd']

    bm = bmesh.new()
    d_layer = bm.verts.layers.deform.verify()

    # 1. HEAD (rounded sphere near the study's 1/6 body ratio)
    add_smooth_sphere(bm, head_center, r_head, 'Head', u_segments=32, v_segments=16, d_layer=d_layer, vgroups_map=vgroups_map)

    # 2. TORSO & NECK (continuous tube from hips through spine, chest to neck)
    torso_wp = [
        (Vector((0, 0, z_hip)), r_limb * 1.05, {'Hips': 1.0}),
        (Vector((0, 0, z_hip + (z_spine - z_hip) * 0.5)), r_limb * 1.02, {'Hips': 0.7, 'Spine': 0.3}),
        (Vector((0, 0, z_spine)), r_limb * 1.0, {'Spine': 1.0}),
        (Vector((0, 0, z_spine + (z_chest - z_spine) * 0.5)), r_limb * 1.01, {'Spine': 0.3, 'Chest': 0.7}),
        (Vector((0, 0, z_chest)), r_limb * 1.02, {'Chest': 1.0}),
        (Vector((0, 0, z_chest + (z_neck - z_chest) * 0.5)), r_limb * 0.96, {'Chest': 0.7, 'Neck': 0.3}),
        (Vector((0, 0, z_neck)), r_limb * 0.92, {'Neck': 1.0}),
        (Vector((0, 0, z_head_base)), r_limb * 0.88, {'Neck': 0.7, 'Head': 0.3}),
    ]
    add_smooth_tube(bm, torso_wp, segments=8, cap_start=False, cap_end=False, d_layer=d_layer, vgroups_map=vgroups_map)

    # 3. ARMS (gently branching from upper chest into limbs, resting naturally at sides)
    for side, sgn in [('L', 1.0), ('R', -1.0)]:
        uarm_bone = f'UpperArm_{side}'
        farm_bone = f'Forearm_{side}'
        hand_bone = f'Hand_{side}'

        # Each side of the joint has the same round end and stroke width.
        # A shared 50/50 skin ring loses width when the bones bend.
        upper_wp = [
            (lm[f'shoulder_{side}'], r_limb, {uarm_bone: 1.0}),
            (lm[f'elbow_{side}'], r_limb, {uarm_bone: 1.0}),
        ]
        add_smooth_tube(bm, upper_wp, segments=12, cap_start=True, cap_end=True, d_layer=d_layer, vgroups_map=vgroups_map)
        arm_wp = [
            (lm[f'elbow_{side}'], r_limb, {farm_bone: 1.0}),
            ((lm[f'elbow_{side}'] + lm[f'wrist_{side}']) * 0.5, r_limb, {farm_bone: 1.0}),
            (lm[f'wrist_{side}'], r_limb * 0.92, {farm_bone: 0.5, hand_bone: 0.5}),
            (lm[f'hand_{side}'], r_hand, {hand_bone: 1.0}),
        ]
        add_smooth_tube(bm, arm_wp, segments=12, cap_start=True, cap_end=True, d_layer=d_layer, vgroups_map=vgroups_map)

    # 4. LEGS (gently branching from pelvis into limbs, short rounded stroke feet)
    for side, sgn in [('L', 1.0), ('R', -1.0)]:
        thigh_bone = f'Thigh_{side}'
        shin_bone = f'Shin_{side}'
        foot_bone = f'Foot_{side}'

        upper_wp = [
            (lm[f'hip_{side}'], r_limb, {thigh_bone: 1.0}),
            (lm[f'knee_{side}'], r_limb, {thigh_bone: 1.0}),
        ]
        add_smooth_tube(bm, upper_wp, segments=12, cap_start=True, cap_end=True, d_layer=d_layer, vgroups_map=vgroups_map)
        leg_wp = [
            (lm[f'knee_{side}'], r_limb, {shin_bone: 1.0}),
            ((lm[f'knee_{side}'] + lm[f'ankle_{side}']) * 0.5, r_limb, {shin_bone: 1.0}),
            (lm[f'ankle_{side}'], r_limb * 0.95, {shin_bone: 0.5, foot_bone: 0.5}),
            (lm[f'foot_{side}'], r_limb * 0.98, {foot_bone: 1.0}),
        ]
        add_smooth_tube(bm, leg_wp, segments=12, cap_start=True, cap_end=True, d_layer=d_layer, vgroups_map=vgroups_map)

    # Role identity comes from proportions and pose. The body has no clothing.

    # Normalize all vertex deform weights so every vertex strictly sums to 1.0
    for v in bm.verts:
        weight_sum = sum(v[d_layer].values())
        if weight_sum > 1e-6:
            for group_idx, w in list(v[d_layer].items()):
                v[d_layer][group_idx] = w / weight_sum
        else:
            v[d_layer][vgroups_map['Hips']] = 1.0

    # Recalculate all tube and cap normals after lofting. This keeps the
    # exported ink surface consistently outward-facing.
    bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
    bm.to_mesh(mesh_data)
    bm.free()

    for poly in mesh_data.polygons:
        poly.use_smooth = True
    mesh_data.materials.append(mat)

    mod = mesh_obj.modifiers.new(name='Armature', type='ARMATURE')
    mod.object = arm_obj

    return mesh_obj

# =============================================================================
# COMPLETE POSE RESOLUTION & CATEGORY BASE POSES
# =============================================================================

CATEGORY_BASE_POSES = {
    'movement': {
        'Root': (0, 0, 0),
        'Hips': (0, 0, 0),
        'Spine': (2, 0, 0),
        'Chest': (0, 0, 0),
        'Neck': (0, 0, 0),
        'Head': (0, 0, 0),
        'UpperArm_L': (0, 0, 0),
        'Forearm_L': (-12, 0, 0),
        'Hand_L': (0, 0, 0),
        'UpperArm_R': (0, 0, 0),
        'Forearm_R': (-12, 0, 0),
        'Hand_R': (0, 0, 0),
        'Thigh_L': (0, 0, 0),
        'Shin_L': (4, 0, 0),
        'Foot_L': (-4, 0, 0),
        'Thigh_R': (0, 0, 0),
        'Shin_R': (4, 0, 0),
        'Foot_R': (-4, 0, 0),
    },
    'melee': {
        'Root': (0, 0, 0),
        'Hips': (0, 0, 0),
        'Spine': (8, 0, 0),
        'Chest': (4, 0, 0),
        'Neck': (0, 0, 0),
        'Head': (-6, 0, 0),
        'UpperArm_L': (-45, 0, 15),
        'Forearm_L': (-75, 0, 0),
        'Hand_L': (-10, 0, 0),
        'UpperArm_R': (-40, 0, -15),
        'Forearm_R': (-80, 0, 0),
        'Hand_R': (-10, 0, 0),
        'Thigh_L': (-10, 0, -5),
        'Shin_L': (18, 0, 0),
        'Foot_L': (-8, 0, 0),
        'Thigh_R': (8, 0, 5),
        'Shin_R': (14, 0, 0),
        'Foot_R': (-6, 0, 0),
    },
    'ranged_pistol': {
        'Root': (0, 0, 0),
        'Hips': (0, 0, 0),
        'Spine': (6, 0, 0),
        'Chest': (2, 0, 0),
        'Neck': (0, 0, 0),
        'Head': (-6, 0, 0),
        'UpperArm_R': (-70, 0, -6),
        'Forearm_R': (-20, 0, 0),
        'Hand_R': (0, 0, 0),
        'UpperArm_L': (-68, 0, 10),
        'Forearm_L': (-25, 0, 0),
        'Hand_L': (10, 0, 0),
        'Thigh_L': (-8, 0, -6),
        'Shin_L': (16, 0, 0),
        'Foot_L': (-8, 0, 0),
        'Thigh_R': (-8, 0, 6),
        'Shin_R': (16, 0, 0),
        'Foot_R': (-8, 0, 0),
    },
    'ranged_rifle': {
        'Root': (0, 0, 0),
        'Hips': (0, 10, 0),
        'Spine': (8, 12, 0),
        'Chest': (2, 6, 0),
        'Neck': (0, 0, 0),
        'Head': (-6, -10, 0),
        'UpperArm_R': (-40, 0, 8),
        'Forearm_R': (-108, 0, 0),
        'Hand_R': (0, 0, 0),
        'UpperArm_L': (-65, 0, -10),
        'Forearm_L': (-40, 0, 0),
        'Hand_L': (0, 0, 0),
        'Thigh_L': (-8, 0, -6),
        'Shin_L': (16, 0, 0),
        'Foot_L': (-8, 0, 0),
        'Thigh_R': (-8, 0, 6),
        'Shin_R': (16, 0, 0),
        'Foot_R': (-8, 0, 0),
    },
    'ranged_bow': {
        'Root': (0, 0, 0),
        'Hips': (0, -40, 0),
        'Spine': (0, -45, 0),
        'Chest': (0, 0, 0),
        'Neck': (0, 0, 0),
        'Head': (0, 45, 0),
        'UpperArm_L': (-85, 0, -45),
        'Forearm_L': (-5, 0, 0),
        'Hand_L': (0, 0, 0),
        'UpperArm_R': (-60, 0, 20),
        'Forearm_R': (-90, 0, 0),
        'Hand_R': (0, 0, 0),
        'Thigh_L': (-8, 0, -6),
        'Shin_L': (16, 0, 0),
        'Foot_L': (-8, 0, 0),
        'Thigh_R': (-8, 0, 6),
        'Shin_R': (16, 0, 0),
        'Foot_R': (-8, 0, 0),
    },
    'reactions': {
        'Root': (0, 0, 0),
        'Hips': (0, 0, 0),
        'Spine': (0, 0, 0),
        'Chest': (0, 0, 0),
        'Neck': (0, 0, 0),
        'Head': (0, 0, 0),
        'UpperArm_L': (-10, 0, -5),
        'Forearm_L': (-20, 0, 0),
        'Hand_L': (0, 0, 0),
        'UpperArm_R': (-10, 0, 5),
        'Forearm_R': (-20, 0, 0),
        'Hand_R': (0, 0, 0),
        'Thigh_L': (-4, 0, 0),
        'Shin_L': (8, 0, 0),
        'Foot_L': (-4, 0, 0),
        'Thigh_R': (-4, 0, 0),
        'Shin_R': (8, 0, 0),
        'Foot_R': (-4, 0, 0),
    },
    'interaction': {
        'Root': (0, 0, 0),
        'Hips': (0, 0, 0),
        'Spine': (0, 0, 0),
        'Chest': (0, 0, 0),
        'Neck': (0, 0, 0),
        'Head': (0, 0, 0),
        'UpperArm_L': (0, 0, 0),
        'Forearm_L': (-12, 0, 0),
        'Hand_L': (0, 0, 0),
        'UpperArm_R': (0, 0, 0),
        'Forearm_R': (-12, 0, 0),
        'Hand_R': (0, 0, 0),
        'Thigh_L': (0, 0, 0),
        'Shin_L': (4, 0, 0),
        'Foot_L': (-4, 0, 0),
        'Thigh_R': (0, 0, 0),
        'Shin_R': (4, 0, 0),
        'Foot_R': (-4, 0, 0),
    },
    'sport': {
        'Root': (0, 0, 0),
        'Hips': (0, 0, 0),
        'Spine': (8, 0, 0),
        'Chest': (2, 0, 0),
        'Neck': (0, 0, 0),
        'Head': (-4, 0, 0),
        'UpperArm_L': (-20, 0, -8),
        'Forearm_L': (-35, 0, 0),
        'Hand_L': (0, 0, 0),
        'UpperArm_R': (-20, 0, 8),
        'Forearm_R': (-35, 0, 0),
        'Hand_R': (0, 0, 0),
        'Thigh_L': (-8, 0, -4),
        'Shin_L': (16, 0, 0),
        'Foot_L': (-6, 0, 0),
        'Thigh_R': (-8, 0, 4),
        'Shin_R': (16, 0, 0),
        'Foot_R': (-6, 0, 0),
    }
}

# Authored rest-style offsets keep the default silhouettes distinct while all
# characters retain the same 18-bone contract. The offsets apply to idle and
# apply at a reduced strength to block. Other clips keep their combat timing.
ROLE_IDLE_OFFSETS = {
    'stick-runner': {
        'Spine': (4, -5, 0), 'Chest': (-1, -3, 0),
        'UpperArm_L': (5, 0, -12), 'Forearm_L': (-12, 0, -6),
        'UpperArm_R': (-8, 0, 12), 'Forearm_R': (-24, 0, 6),
        'Thigh_L': (-2, 0, -5), 'Thigh_R': (-2, 0, 5),
    },
    'stick-fighter': {
        'Spine': (7, 0, 0), 'Chest': (4, 0, 0),
        'UpperArm_L': (-34, 0, -15), 'Forearm_L': (-50, 0, -5),
        'UpperArm_R': (-38, 0, 15), 'Forearm_R': (-58, 0, 5),
        'Thigh_L': (-7, 0, -8), 'Thigh_R': (-7, 0, 8),
    },
    'stick-tall': {
        'Spine': (2, -3, 0), 'Chest': (1, -2, 0),
        'UpperArm_L': (-22, 0, -14), 'Forearm_L': (-30, 0, -6),
        'UpperArm_R': (-14, 0, 16), 'Forearm_R': (-55, 0, 4),
    },
    'stick-compact': {
        'Hips': (-4, 0, 0), 'Spine': (10, 0, 0), 'Chest': (5, 0, 0),
        'UpperArm_L': (-28, 0, -18), 'Forearm_L': (-42, 0, -6),
        'UpperArm_R': (-18, 0, 18), 'Forearm_R': (-28, 0, 6),
        'Thigh_L': (-10, 0, -10), 'Thigh_R': (-10, 0, 10),
    },
    'stick-heavy': {
        'Hips': (-4, 0, 0), 'Spine': (5, 0, 0), 'Chest': (3, 0, 0),
        'UpperArm_L': (-8, 0, -24), 'Forearm_L': (-24, 0, -6),
        'UpperArm_R': (-8, 0, 24), 'Forearm_R': (-24, 0, 6),
        'Thigh_L': (-6, 0, -10), 'Thigh_R': (-6, 0, 10),
    },
    'stick-scout': {
        'Spine': (-2, -4, 0), 'Chest': (2, -2, 0),
        'UpperArm_L': (-10, 0, -20), 'Forearm_L': (-24, 0, -8),
        'UpperArm_R': (8, 0, 12), 'Forearm_R': (-16, 0, 6),
        'Thigh_L': (-4, 0, -8), 'Thigh_R': (-4, 0, 8),
    },
    'stick-acrobat': {
        'Hips': (-8, 0, 0), 'Spine': (9, 0, 0), 'Chest': (-2, 0, 0),
        'UpperArm_L': (-18, 0, -22), 'Forearm_L': (-38, 0, -6),
        'UpperArm_R': (-34, 0, 20), 'Forearm_R': (-58, 0, 4),
        'Thigh_L': (-12, 0, -14), 'Thigh_R': (-12, 0, 14),
    },
    'stick-worker': {
        'Spine': (3, 0, 0), 'Chest': (1, 0, 0),
        'UpperArm_L': (-8, 0, -22), 'Forearm_L': (-20, 0, -8),
        'UpperArm_R': (-26, 0, 10), 'Forearm_R': (-18, 0, 4),
    },
    'stick-agent': {
        'Spine': (1, -2, 0),
        'UpperArm_L': (-12, 0, -10), 'Forearm_L': (-24, 0, -4),
        'UpperArm_R': (-24, 0, 12), 'Forearm_R': (-36, 0, 4),
    },
    'stick-striker': {
        'Spine': (7, 0, 0), 'Chest': (3, 0, 0),
        'UpperArm_L': (-30, 0, -16), 'Forearm_L': (-48, 0, -4),
        'UpperArm_R': (-42, 0, 18), 'Forearm_R': (-60, 0, 4),
        'Thigh_L': (-8, 0, -10), 'Thigh_R': (-8, 0, 10),
    },
    'stick-sentinel': {
        'Hips': (-6, 0, 0), 'Spine': (6, 0, 0), 'Chest': (3, 0, 0),
        'UpperArm_L': (-20, 0, -28), 'Forearm_L': (-30, 0, -7),
        'UpperArm_R': (-20, 0, 28), 'Forearm_R': (-30, 0, 7),
        'Thigh_L': (-10, 0, -14), 'Thigh_R': (-10, 0, 14),
    },
}

# Kinetic polish keeps action shape in the authored clip data. These offsets
# add small body-family differences to travel only. They do not touch attack
# clips or mounted weapon hand axes.
KINETIC_LOCOMOTION_CLIPS = {
    'walk', 'run', 'sprint', 'jump-start', 'jump-loop', 'jump-land',
    'double-jump', 'vault', 'wall-run', 'walk-left', 'walk-right',
    'crouch-walk', 'turn-left', 'turn-right', 'ledge-climb',
}

# These clips keep at least one foot planted in a rooted combat or locomotion
# stance. Their
# baked Hips offset may move in either direction so the lowest mesh point stays
# at the floor. Airborne, travel, and dodge clips keep the lift-only bake.
GROUNDED_CLIPS = {
    'idle',
    'walk', 'walk-left', 'walk-right', 'crouch-walk', 'turn-left', 'turn-right',
    'punch-left', 'punch-right', 'punch-heavy',
    'kick-front', 'kick-roundhouse', 'elbow-strike', 'backfist',
    'sword-slash', 'sword-overhead', 'sword-thrust',
}

ROLE_LOCOMOTION_OFFSETS = {
    'stick-runner': {
        'Spine': (4, -3, 0), 'Chest': (-2, -2, 0), 'Head': (-2, -1, 0),
        'Thigh_L': (-2, 0, -2), 'Thigh_R': (-2, 0, 2),
    },
    'stick-scout': {
        'Spine': (3, -3, 0), 'Chest': (2, -2, 0), 'Head': (1, -2, 0),
        'Thigh_L': (-3, 0, -2), 'Thigh_R': (-3, 0, 2),
    },
    'stick-compact': {
        'Spine': (6, 0, 0), 'Chest': (2, 0, 0), 'Head': (-2, 0, 0),
        'Thigh_L': (-4, 0, -3), 'Thigh_R': (-4, 0, 3),
    },
    'stick-acrobat': {
        'Spine': (7, 2, 0), 'Chest': (-2, 3, 0), 'Head': (-3, 1, 0),
        'Thigh_L': (-5, 0, -3), 'Thigh_R': (-5, 0, 3),
    },
    'stick-tall': {
        'Spine': (1, -2, 0), 'Chest': (1, -2, 0), 'Head': (-1, -1, 0),
        'Thigh_L': (-1, 0, -1), 'Thigh_R': (-1, 0, 1),
    },
    'stick-fighter': {
        'Spine': (3, -1, 0), 'Chest': (2, -2, 0), 'Head': (-1, -2, 0),
        'Thigh_L': (-3, 0, -3), 'Thigh_R': (-3, 0, 3),
    },
    'stick-heavy': {
        'Spine': (2, 0, 0), 'Chest': (2, 0, 0), 'Head': (-1, 0, 0),
        'Thigh_L': (-3, 0, -2), 'Thigh_R': (-3, 0, 2),
    },
    'stick-striker': {
        'Spine': (4, 0, 0), 'Chest': (3, 0, 0), 'Head': (-2, 0, 0),
        'Thigh_L': (-2, 0, -3), 'Thigh_R': (-2, 0, 3),
    },
    'stick-sentinel': {
        'Spine': (2, 0, 0), 'Chest': (3, 0, 0), 'Head': (-1, 0, 0),
        'Thigh_L': (-3, 0, -4), 'Thigh_R': (-3, 0, 4),
    },
}


def apply_role_pose_offsets(action: bpy.types.Action, char_id: str, clip_id: str):
    """Apply idle/block offsets and small role differences to locomotion."""
    if clip_id in ('idle', 'block'):
        offsets = ROLE_IDLE_OFFSETS.get(char_id)
        strength = 1.0 if clip_id == 'idle' else 0.45
    elif clip_id in KINETIC_LOCOMOTION_CLIPS:
        offsets = ROLE_LOCOMOTION_OFFSETS.get(char_id)
        strength = 0.65
    else:
        return
    if not offsets:
        return
    try:
        curves = action.layers[0].strips[0].channelbags[0].fcurves
    except (AttributeError, IndexError):
        curves = getattr(action, 'fcurves', [])
    for bone_name, delta in offsets.items():
        if bone_name in TORSO_BEND_LIMITS:
            delta = tuple(angle * TORSO_BEND_SHARE for angle in delta)
        path = f'pose.bones["{bone_name}"].rotation_quaternion'
        bone_curves = {curve.array_index: curve for curve in curves if curve.data_path == path}
        if len(bone_curves) < 4:
            continue
        frames = sorted({point.co.x for point in bone_curves[0].keyframe_points})
        for frame in frames:
            quat = Quaternion(tuple(bone_curves[index].evaluate(frame) for index in range(4)))
            euler = quat.to_euler('XYZ')
            euler.x += math.radians(delta[0] * strength)
            euler.y += math.radians(delta[1] * strength)
            euler.z += math.radians(delta[2] * strength)
            updated = euler.to_quaternion()
            for index, value in enumerate(updated):
                curve = bone_curves[index]
                for point in curve.keyframe_points:
                    if abs(point.co.x - frame) < 1e-4:
                        point.co.y = value
                        break
                curve.update()

def get_base_pose_for_clip(clip_id: str, category: str) -> Dict[str, Tuple[float, float, float]]:
    """Selects the appropriate sensible default base pose for a clip."""
    if category == 'ranged':
        if clip_id.startswith('pistol'):
            return dict(CATEGORY_BASE_POSES['ranged_pistol'])
        elif clip_id.startswith('rifle') or clip_id.startswith('shotgun'):
            return dict(CATEGORY_BASE_POSES['ranged_rifle'])
        elif clip_id.startswith('bow'):
            return dict(CATEGORY_BASE_POSES['ranged_bow'])
        else:
            return dict(CATEGORY_BASE_POSES['sport'])
    if category in CATEGORY_BASE_POSES:
        return dict(CATEGORY_BASE_POSES[category])
    return dict(CATEGORY_BASE_POSES['movement'])

def resolve_clip_poses(clip_def: Dict[str, Any]) -> List[Tuple[int, Dict[str, Tuple[float, float, float]], Tuple[float, float, float]]]:
    """
    Resolves each authored frame into a 100% COMPLETE pose across all 18 bones.
    1. Base pose provides sensible relaxed/ready defaults per category.
    2. Frame 1 merges base pose with authored overrides.
    3. Intermediate frames carry forward previous values for omitted bones.
    4. Looping clips guarantee the last frame matches the first resolved pose exactly.
    """
    base_pose = get_base_pose_for_clip(clip_def['id'], clip_def['category'])
    resolved = []
    current_pose = dict(base_pose)
    current_hips = (0.0, 0.0, 0.0)

    for i, item in enumerate(clip_def['frames']):
        frame_idx = item[0]
        overrides = item[1]
        hips_offset = item[2] if len(item) > 2 and item[2] is not None else current_hips
        current_hips = hips_offset

        new_pose = dict(current_pose)
        for bname, angles in overrides.items():
            new_pose[bname] = tuple(angles)
        current_pose = new_pose
        resolved.append((frame_idx, dict(current_pose), current_hips))

    if clip_def.get('loop', False) and len(resolved) > 1:
        last_frame_idx = resolved[-1][0]
        first_pose = dict(resolved[0][1])
        first_hips = resolved[0][2]
        resolved[-1] = (last_frame_idx, first_pose, first_hips)

    return resolved

# =============================================================================
# EXPANDED TRAVERSAL AND WEAPON CLIPS (24 NEW ACTIONS)
# =============================================================================

def build_animation_expansion_catalog() -> List[Dict[str, Any]]:
    """Return 24 authored traversal and close-combat clips.

    These clips use the same 18-bone rig and the same in-place convention as
    the original catalog. Attack clips use a preparation, contact, hold,
    recoil, and recovery sequence. Loop clips repeat their first resolved pose.
    """

    def clip(
        clip_id: str,
        label: str,
        category: str,
        loop: bool,
        frames: List[Tuple[int, Dict[str, Tuple[float, float, float]], Tuple[float, float, float]]],
        contact_frame: Optional[int] = None,
    ) -> Dict[str, Any]:
        definition = {
            'id': clip_id,
            'label': label,
            'category': category,
            'loop': loop,
            'fps': FPS,
            'frames': frames,
        }
        if contact_frame is not None:
            definition['contact_frame'] = contact_frame
        return definition

    clips = [
        # ---------------------------------------------------------------------
        # Traversal: directional travel, crouch, turns, and a ledge climb.
        # ---------------------------------------------------------------------
        clip('walk-left', 'Walk Left', 'movement', True, [
            (1, {'Hips': (0, 0, -8), 'Spine': (3, 0, -4), 'Chest': (0, 0, -3),
                 'Thigh_L': (-8, 0, -18), 'Shin_L': (18, 0, 0), 'Foot_L': (-8, 0, 0),
                 'Thigh_R': (8, 0, -3), 'Shin_R': (8, 0, 0),
                 'UpperArm_L': (18, 0, -8), 'Forearm_L': (-35, 0, 0),
                 'UpperArm_R': (-18, 0, 8), 'Forearm_R': (-35, 0, 0)}, (-0.04, 0, 0)),
            (8, {'Hips': (0, 0, 4), 'Spine': (2, 0, 4), 'Chest': (0, 0, 3),
                 'Thigh_L': (2, 0, -3), 'Shin_L': (8, 0, 0),
                 'Thigh_R': (-10, 0, -18), 'Shin_R': (18, 0, 0), 'Foot_R': (-8, 0, 0),
                 'UpperArm_L': (-18, 0, -8), 'Forearm_L': (-35, 0, 0),
                 'UpperArm_R': (18, 0, 8), 'Forearm_R': (-35, 0, 0)}, (0.03, 0, 0.02)),
            (16, {'Hips': (0, 0, -8), 'Spine': (3, 0, -4), 'Chest': (0, 0, -3),
                  'Thigh_L': (-8, 0, -18), 'Shin_L': (18, 0, 0), 'Foot_L': (-8, 0, 0),
                  'Thigh_R': (8, 0, -3), 'Shin_R': (8, 0, 0),
                  'UpperArm_L': (18, 0, -8), 'Forearm_L': (-35, 0, 0),
                  'UpperArm_R': (-18, 0, 8), 'Forearm_R': (-35, 0, 0)}, (-0.04, 0, 0)),
            (24, {'Hips': (0, 0, -8), 'Spine': (3, 0, -4), 'Chest': (0, 0, -3),
                  'Thigh_L': (-8, 0, -18), 'Shin_L': (18, 0, 0), 'Foot_L': (-8, 0, 0),
                  'Thigh_R': (8, 0, -3), 'Shin_R': (8, 0, 0),
                  'UpperArm_L': (18, 0, -8), 'Forearm_L': (-35, 0, 0),
                  'UpperArm_R': (-18, 0, 8), 'Forearm_R': (-35, 0, 0)}, (-0.04, 0, 0)),
        ]),
        clip('walk-right', 'Walk Right', 'movement', True, [
            (1, {'Hips': (0, 0, 8), 'Spine': (3, 0, 4), 'Chest': (0, 0, 3),
                 'Thigh_R': (-8, 0, 18), 'Shin_R': (18, 0, 0), 'Foot_R': (-8, 0, 0),
                 'Thigh_L': (8, 0, 3), 'Shin_L': (8, 0, 0),
                 'UpperArm_R': (18, 0, 8), 'Forearm_R': (-35, 0, 0),
                 'UpperArm_L': (-18, 0, -8), 'Forearm_L': (-35, 0, 0)}, (0.04, 0, 0)),
            (8, {'Hips': (0, 0, -4), 'Spine': (2, 0, -4), 'Chest': (0, 0, -3),
                 'Thigh_R': (2, 0, 3), 'Shin_R': (8, 0, 0),
                 'Thigh_L': (-10, 0, 18), 'Shin_L': (18, 0, 0), 'Foot_L': (-8, 0, 0),
                 'UpperArm_R': (-18, 0, 8), 'Forearm_R': (-35, 0, 0),
                 'UpperArm_L': (18, 0, -8), 'Forearm_L': (-35, 0, 0)}, (-0.03, 0, 0.02)),
            (16, {'Hips': (0, 0, 8), 'Spine': (3, 0, 4), 'Chest': (0, 0, 3),
                  'Thigh_R': (-8, 0, 18), 'Shin_R': (18, 0, 0), 'Foot_R': (-8, 0, 0),
                  'Thigh_L': (8, 0, 3), 'Shin_L': (8, 0, 0),
                  'UpperArm_R': (18, 0, 8), 'Forearm_R': (-35, 0, 0),
                  'UpperArm_L': (-18, 0, -8), 'Forearm_L': (-35, 0, 0)}, (0.04, 0, 0)),
            (24, {'Hips': (0, 0, 8), 'Spine': (3, 0, 4), 'Chest': (0, 0, 3),
                  'Thigh_R': (-8, 0, 18), 'Shin_R': (18, 0, 0), 'Foot_R': (-8, 0, 0),
                  'Thigh_L': (8, 0, 3), 'Shin_L': (8, 0, 0),
                  'UpperArm_R': (18, 0, 8), 'Forearm_R': (-35, 0, 0),
                  'UpperArm_L': (-18, 0, -8), 'Forearm_L': (-35, 0, 0)}, (0.04, 0, 0)),
        ]),
        clip('run-backward', 'Run Backward', 'movement', True, [
            (1, {'Hips': (0, 6, 0), 'Spine': (-14, 8, 0), 'Chest': (4, 6, 0), 'Head': (3, 0, 0),
                 'Thigh_L': (52, 0, -6), 'Shin_L': (24, 0, 0), 'Foot_L': (14, 0, 0),
                 'Thigh_R': (-58, 0, 8), 'Shin_R': (82, 0, 0), 'Foot_R': (26, 0, 0),
                 'UpperArm_L': (-46, 0, -8), 'Forearm_L': (-86, 0, 0),
                 'UpperArm_R': (34, 0, 8), 'Forearm_R': (-94, 0, 0)}, (0, 0.03, 0)),
            (6, {'Hips': (0, 0, 0), 'Spine': (-10, -2, 0), 'Chest': (3, -2, 0),
                 'Thigh_L': (-34, 0, -6), 'Shin_L': (14, 0, 0),
                 'Thigh_R': (28, 0, 8), 'Shin_R': (78, 0, 0),
                 'UpperArm_L': (-18, 0, -8), 'Forearm_L': (-78, 0, 0),
                 'UpperArm_R': (12, 0, 8), 'Forearm_R': (-84, 0, 0)}, (0, 0, 0.05)),
            (12, {'Hips': (0, -6, 0), 'Spine': (-14, -8, 0), 'Chest': (4, -6, 0), 'Head': (3, 0, 0),
                  'Thigh_R': (52, 0, 6), 'Shin_R': (24, 0, 0), 'Foot_R': (14, 0, 0),
                  'Thigh_L': (-58, 0, -8), 'Shin_L': (82, 0, 0), 'Foot_L': (26, 0, 0),
                  'UpperArm_R': (-46, 0, 8), 'Forearm_R': (-86, 0, 0),
                  'UpperArm_L': (34, 0, -8), 'Forearm_L': (-94, 0, 0)}, (0, -0.03, 0)),
            (18, {'Hips': (0, 0, 0), 'Spine': (-10, 2, 0), 'Chest': (3, 2, 0),
                  'Thigh_R': (-34, 0, 6), 'Shin_R': (14, 0, 0),
                  'Thigh_L': (28, 0, -8), 'Shin_L': (78, 0, 0),
                  'UpperArm_R': (-18, 0, 8), 'Forearm_R': (-78, 0, 0),
                  'UpperArm_L': (12, 0, -8), 'Forearm_L': (-84, 0, 0)}, (0, 0, 0.05)),
            (24, {'Hips': (0, 6, 0), 'Spine': (-14, 8, 0), 'Chest': (4, 6, 0), 'Head': (3, 0, 0),
                  'Thigh_L': (52, 0, -6), 'Shin_L': (24, 0, 0), 'Foot_L': (14, 0, 0),
                  'Thigh_R': (-58, 0, 8), 'Shin_R': (82, 0, 0), 'Foot_R': (26, 0, 0),
                  'UpperArm_L': (-46, 0, -8), 'Forearm_L': (-86, 0, 0),
                  'UpperArm_R': (34, 0, 8), 'Forearm_R': (-94, 0, 0)}, (0, 0.03, 0)),
        ]),
        clip('crouch-idle', 'Crouch Idle', 'movement', True, [
            (1, {'Hips': (0, -4, 0), 'Spine': (22, -4, 0), 'Chest': (6, -3, 0), 'Head': (-3, 0, 0),
                 'Thigh_L': (-58, 0, -12), 'Shin_L': (84, 0, 0), 'Foot_L': (-24, 0, 0),
                 'Thigh_R': (-54, 0, 12), 'Shin_R': (82, 0, 0), 'Foot_R': (-18, 0, 0),
                 'UpperArm_L': (-18, 0, -18), 'Forearm_L': (-46, 0, 0),
                 'UpperArm_R': (-24, 0, 18), 'Forearm_R': (-50, 0, 0)}, (0, 0, -0.12)),
            (12, {'Hips': (0, -2, 0), 'Spine': (26, -2, 0), 'Chest': (8, -2, 0), 'Head': (-2, 0, 0),
                  'Thigh_L': (-62, 0, -12), 'Shin_L': (88, 0, 0), 'Foot_L': (-26, 0, 0),
                  'Thigh_R': (-58, 0, 12), 'Shin_R': (86, 0, 0), 'Foot_R': (-20, 0, 0),
                  'UpperArm_L': (-20, 0, -18), 'Forearm_L': (-44, 0, 0),
                  'UpperArm_R': (-22, 0, 18), 'Forearm_R': (-48, 0, 0)}, (0, 0, -0.14)),
            (24, {'Hips': (0, -4, 0), 'Spine': (22, -4, 0), 'Chest': (6, -3, 0), 'Head': (-3, 0, 0),
                  'Thigh_L': (-58, 0, -12), 'Shin_L': (84, 0, 0), 'Foot_L': (-24, 0, 0),
                  'Thigh_R': (-54, 0, 12), 'Shin_R': (82, 0, 0), 'Foot_R': (-18, 0, 0),
                  'UpperArm_L': (-18, 0, -18), 'Forearm_L': (-46, 0, 0),
                  'UpperArm_R': (-24, 0, 18), 'Forearm_R': (-50, 0, 0)}, (0, 0, -0.12)),
        ]),
        clip('crouch-walk', 'Crouch Walk', 'movement', True, [
            (1, {'Hips': (0, 0, -8), 'Spine': (20, -6, -4), 'Chest': (6, -4, -3),
                 'Thigh_L': (-48, 0, -18), 'Shin_L': (54, 0, 0), 'Foot_L': (-14, 0, 0),
                 'Thigh_R': (-34, 0, 10), 'Shin_R': (44, 0, 0),
                 'UpperArm_L': (-6, 0, -18), 'Forearm_L': (-42, 0, 0),
                 'UpperArm_R': (-18, 0, 18), 'Forearm_R': (-50, 0, 0)}, (-0.03, -0.01, -0.10)),
            (8, {'Hips': (0, 0, 4), 'Spine': (18, 0, 4), 'Chest': (4, 0, 3),
                 'Thigh_L': (-24, 0, -8), 'Shin_L': (38, 0, 0),
                 'Thigh_R': (-52, 0, 16), 'Shin_R': (62, 0, 0), 'Foot_R': (-16, 0, 0),
                 'UpperArm_L': (-18, 0, -16), 'Forearm_L': (-46, 0, 0),
                 'UpperArm_R': (-4, 0, 16), 'Forearm_R': (-44, 0, 0)}, (0.03, 0, -0.08)),
            (16, {'Hips': (0, 0, 8), 'Spine': (20, 6, 4), 'Chest': (6, 4, 3),
                  'Thigh_R': (-48, 0, 18), 'Shin_R': (54, 0, 0), 'Foot_R': (-14, 0, 0),
                  'Thigh_L': (-34, 0, -10), 'Shin_L': (44, 0, 0),
                  'UpperArm_R': (-6, 0, 18), 'Forearm_R': (-42, 0, 0),
                  'UpperArm_L': (-18, 0, -18), 'Forearm_L': (-50, 0, 0)}, (0.03, 0.01, -0.10)),
            (24, {'Hips': (0, 0, -8), 'Spine': (20, -6, -4), 'Chest': (6, -4, -3),
                  'Thigh_L': (-48, 0, -18), 'Shin_L': (54, 0, 0), 'Foot_L': (-14, 0, 0),
                  'Thigh_R': (-34, 0, 10), 'Shin_R': (44, 0, 0),
                  'UpperArm_L': (-6, 0, -18), 'Forearm_L': (-42, 0, 0),
                  'UpperArm_R': (-18, 0, 18), 'Forearm_R': (-50, 0, 0)}, (-0.03, -0.01, -0.10)),
        ]),
        clip('turn-left', 'Turn Left', 'movement', False, [
            (1, {'Hips': (0, 0, 0), 'Spine': (6, -2, 0), 'Chest': (2, -2, 0),
                 'UpperArm_L': (-24, 0, -16), 'Forearm_L': (-48, 0, 0),
                 'UpperArm_R': (-32, 0, 16), 'Forearm_R': (-58, 0, 0),
                 'Thigh_L': (-12, 0, -8), 'Shin_L': (20, 0, 0), 'Thigh_R': (-4, 0, 8), 'Shin_R': (12, 0, 0)}, (0, 0, 0)),
            (6, {'Hips': (0, -45, 0), 'Spine': (10, -14, 0), 'Chest': (4, -10, 0),
                  'UpperArm_L': (-18, 0, -24), 'Forearm_L': (-60, 0, 0),
                  'UpperArm_R': (-42, 0, 20), 'Forearm_R': (-44, 0, 0),
                  'Thigh_L': (-18, 0, -14), 'Shin_L': (28, 0, 0), 'Thigh_R': (4, 0, 12), 'Shin_R': (18, 0, 0)}, (0, 0, 0)),
            (10, {'Hips': (0, -95, 0), 'Spine': (6, -22, 0), 'Chest': (3, -14, 0),
                   'UpperArm_L': (-52, 0, -10), 'Forearm_L': (-34, 0, 0),
                   'UpperArm_R': (-18, 0, 28), 'Forearm_R': (-68, 0, 0),
                   'Thigh_L': (-8, 0, -18), 'Shin_L': (26, 0, 0), 'Thigh_R': (-12, 0, 18), 'Shin_R': (24, 0, 0)}, (0, 0, 0)),
            (14, {'Hips': (0, -140, 0), 'Spine': (4, -12, 0), 'Chest': (2, -8, 0),
                   'UpperArm_L': (-38, 0, -14), 'Forearm_L': (-66, 0, 0),
                   'UpperArm_R': (-30, 0, 16), 'Forearm_R': (-64, 0, 0),
                   'Thigh_L': (-8, 0, -12), 'Shin_L': (18, 0, 0), 'Thigh_R': (-8, 0, 12), 'Shin_R': (18, 0, 0)}, (0, 0, 0)),
            (18, {'Hips': (0, -180, 0), 'Spine': (6, 0, 0), 'Chest': (2, 0, 0),
                   'UpperArm_L': (-30, 0, -16), 'Forearm_L': (-62, 0, 0),
                   'UpperArm_R': (-30, 0, 16), 'Forearm_R': (-62, 0, 0),
                   'Thigh_L': (-10, 0, -8), 'Shin_L': (18, 0, 0), 'Thigh_R': (-10, 0, 8), 'Shin_R': (18, 0, 0)}, (0, 0, 0)),
        ]),
        clip('turn-right', 'Turn Right', 'movement', False, [
            (1, {'Hips': (0, 0, 0), 'Spine': (6, 2, 0), 'Chest': (2, 2, 0),
                 'UpperArm_R': (-24, 0, 16), 'Forearm_R': (-48, 0, 0),
                 'UpperArm_L': (-32, 0, -16), 'Forearm_L': (-58, 0, 0),
                 'Thigh_R': (-12, 0, 8), 'Shin_R': (20, 0, 0), 'Thigh_L': (-4, 0, -8), 'Shin_L': (12, 0, 0)}, (0, 0, 0)),
            (6, {'Hips': (0, 45, 0), 'Spine': (10, 14, 0), 'Chest': (4, 10, 0),
                  'UpperArm_R': (-18, 0, 24), 'Forearm_R': (-60, 0, 0),
                  'UpperArm_L': (-42, 0, -20), 'Forearm_L': (-44, 0, 0),
                  'Thigh_R': (-18, 0, 14), 'Shin_R': (28, 0, 0), 'Thigh_L': (4, 0, -12), 'Shin_L': (18, 0, 0)}, (0, 0, 0)),
            (10, {'Hips': (0, 95, 0), 'Spine': (6, 22, 0), 'Chest': (3, 14, 0),
                   'UpperArm_R': (-52, 0, 10), 'Forearm_R': (-34, 0, 0),
                   'UpperArm_L': (-18, 0, -28), 'Forearm_L': (-68, 0, 0),
                   'Thigh_R': (-8, 0, 18), 'Shin_R': (26, 0, 0), 'Thigh_L': (-12, 0, -18), 'Shin_L': (24, 0, 0)}, (0, 0, 0)),
            (14, {'Hips': (0, 140, 0), 'Spine': (4, 12, 0), 'Chest': (2, 8, 0),
                   'UpperArm_R': (-38, 0, 14), 'Forearm_R': (-66, 0, 0),
                   'UpperArm_L': (-30, 0, -16), 'Forearm_L': (-64, 0, 0),
                   'Thigh_R': (-8, 0, 12), 'Shin_R': (18, 0, 0), 'Thigh_L': (-8, 0, -12), 'Shin_L': (18, 0, 0)}, (0, 0, 0)),
            (18, {'Hips': (0, 180, 0), 'Spine': (6, 0, 0), 'Chest': (2, 0, 0),
                   'UpperArm_R': (-30, 0, 16), 'Forearm_R': (-62, 0, 0),
                   'UpperArm_L': (-30, 0, -16), 'Forearm_L': (-62, 0, 0),
                   'Thigh_R': (-10, 0, 8), 'Shin_R': (18, 0, 0), 'Thigh_L': (-10, 0, -8), 'Shin_L': (18, 0, 0)}, (0, 0, 0)),
        ]),
        clip('ledge-climb', 'Ledge Climb', 'movement', False, [
            (1, {'Spine': (20, 0, 0), 'Chest': (5, 0, 0), 'Head': (-8, 0, 0),
                 'UpperArm_L': (-125, 0, -18), 'Forearm_L': (-30, 0, 0),
                 'UpperArm_R': (-125, 0, 18), 'Forearm_R': (-30, 0, 0),
                 'Thigh_L': (-48, 0, -12), 'Shin_L': (78, 0, 0), 'Thigh_R': (-48, 0, 12), 'Shin_R': (78, 0, 0)}, (0, 0, 0.20)),
            (5, {'Hips': (0, -12, 0), 'Spine': (-18, -8, 0), 'Chest': (-6, -6, 0), 'Head': (4, 0, 0),
                 'UpperArm_L': (-110, 0, -12), 'Forearm_L': (-12, 0, 0),
                 'UpperArm_R': (-110, 0, 12), 'Forearm_R': (-12, 0, 0),
                 'Thigh_L': (-70, 0, -14), 'Shin_L': (92, 0, 0), 'Thigh_R': (-70, 0, 14), 'Shin_R': (92, 0, 0)}, (0, 0, 0.25)),
            (10, {'Hips': (0, -16, 0), 'Spine': (-34, -8, 0), 'Chest': (-12, -6, 0), 'Head': (6, 0, 0),
                  'UpperArm_L': (-78, 0, -20), 'Forearm_L': (-5, 0, 0),
                  'UpperArm_R': (-78, 0, 20), 'Forearm_R': (-5, 0, 0),
                  'Thigh_L': (-78, 0, -16), 'Shin_L': (98, 0, 0), 'Thigh_R': (-78, 0, 16), 'Shin_R': (98, 0, 0)}, (0, 0, 0.18)),
            (15, {'Hips': (0, 8, 0), 'Spine': (24, 4, 0), 'Chest': (8, 2, 0), 'Head': (-2, 0, 0),
                  'UpperArm_L': (-56, 0, -16), 'Forearm_L': (-26, 0, 0),
                  'UpperArm_R': (-56, 0, 16), 'Forearm_R': (-26, 0, 0),
                  'Thigh_L': (-36, 0, -10), 'Shin_L': (58, 0, 0), 'Thigh_R': (-36, 0, 10), 'Shin_R': (58, 0, 0)}, (0, 0, 0.08)),
            (22, {'Hips': (0, 0, 0), 'Spine': (4, 0, 0), 'Chest': (2, 0, 0), 'Head': (0, 0, 0),
                  'UpperArm_L': (-18, 0, -12), 'Forearm_L': (-40, 0, 0),
                  'UpperArm_R': (-18, 0, 12), 'Forearm_R': (-40, 0, 0),
                  'Thigh_L': (-8, 0, -6), 'Shin_L': (14, 0, 0), 'Thigh_R': (-8, 0, 6), 'Shin_R': (14, 0, 0)}, (0, 0, 0)),
        ]),

        # ---------------------------------------------------------------------
        # Unarmed combat. The contact frame is after the load and before the
        # recoil so game events fire during the visible impact hold.
        # ---------------------------------------------------------------------
        clip('elbow-strike', 'Elbow Strike', 'melee', False, [
            (1, {'Hips': (0, -8, 0), 'Spine': (10, -6, 0), 'Chest': (4, -3, 0),
                 'UpperArm_L': (-54, 0, 18), 'Forearm_L': (-76, 0, 0),
                 'UpperArm_R': (-56, 0, -24), 'Forearm_R': (-52, 0, 0),
                 'Thigh_L': (-18, 0, -10), 'Shin_L': (24, 0, 0), 'Thigh_R': (12, 0, 10), 'Shin_R': (14, 0, 0)}, (0, 0, 0)),
            (4, {'Hips': (0, 22, 0), 'Spine': (-12, 20, 0), 'Chest': (-6, 12, 0),
                  'UpperArm_R': (38, 0, -48), 'Forearm_R': (-102, 0, 0),
                  'UpperArm_L': (-58, 0, 22), 'Forearm_L': (-84, 0, 0),
                  'Thigh_L': (-22, 0, -12), 'Shin_L': (30, 0, 0), 'Thigh_R': (16, 0, 12), 'Shin_R': (16, 0, 0)}, (0, 0.02, -0.02)),
            (7, {'Hips': (0, -12, 0), 'Spine': (12, -14, 0), 'Chest': (5, -8, 0),
                  'UpperArm_R': (-28, 0, -64), 'Forearm_R': (-36, 0, 0),
                  'UpperArm_L': (-52, 0, 18), 'Forearm_L': (-82, 0, 0)}, (0, -0.02, 0)),
            (9, {'Hips': (0, -10, 0), 'Spine': (18, -8, 0), 'Chest': (8, -4, 0),
                  'UpperArm_R': (-12, 0, -72), 'Forearm_R': (-18, 0, 0), 'Hand_R': (-3, 0, 0),
                  'UpperArm_L': (-50, 0, 20), 'Forearm_L': (-82, 0, 0),
                  'Thigh_L': (-20, 0, -12), 'Shin_L': (28, 0, 0), 'Thigh_R': (14, 0, 12), 'Shin_R': (16, 0, 0)}, (0, -0.01, 0)),
            (10, {'Hips': (0, -10, 0), 'Spine': (17, -8, 0), 'Chest': (8, -4, 0),
                   'UpperArm_R': (-12, 0, -71), 'Forearm_R': (-19, 0, 0), 'Hand_R': (-3, 0, 0)}, (0, -0.01, 0)),
            (14, {'Hips': (0, 2, 0), 'Spine': (2, 4, 0), 'Chest': (2, 2, 0),
                   'UpperArm_R': (-52, 0, -32), 'Forearm_R': (-52, 0, 0),
                   'UpperArm_L': (-42, 0, 16), 'Forearm_L': (-74, 0, 0)}, (0, 0, 0)),
            (20, {'Hips': (0, 0, 0), 'Spine': (8, 0, 0), 'Chest': (4, 0, 0),
                   'UpperArm_L': (-45, 0, 15), 'Forearm_L': (-75, 0, 0),
                   'UpperArm_R': (-40, 0, -15), 'Forearm_R': (-80, 0, 0)}, (0, 0, 0)),
        ], contact_frame=9),
        clip('backfist', 'Backfist', 'melee', False, [
            (1, {'Hips': (0, 8, 0), 'Spine': (8, 4, 0), 'Chest': (4, 2, 0),
                 'UpperArm_L': (-46, 0, 18), 'Forearm_L': (-78, 0, 0),
                 'UpperArm_R': (-42, 0, -16), 'Forearm_R': (-82, 0, 0),
                 'Thigh_L': (12, 0, -10), 'Shin_L': (16, 0, 0), 'Thigh_R': (-16, 0, 10), 'Shin_R': (22, 0, 0)}, (0, 0, 0)),
            (4, {'Hips': (0, 28, 0), 'Spine': (-16, 24, 0), 'Chest': (-6, 14, 0),
                  'UpperArm_R': (24, 0, 42), 'Forearm_R': (-104, 0, 0),
                  'UpperArm_L': (-52, 0, 22), 'Forearm_L': (-86, 0, 0),
                  'Thigh_L': (-18, 0, -12), 'Shin_L': (26, 0, 0), 'Thigh_R': (16, 0, 12), 'Shin_R': (18, 0, 0)}, (0, 0.03, -0.02)),
            (7, {'Hips': (0, -8, 0), 'Spine': (6, -10, 0), 'Chest': (2, -6, 0),
                  'UpperArm_R': (-56, 0, -46), 'Forearm_R': (-24, 0, 0),
                  'UpperArm_L': (-46, 0, 18), 'Forearm_L': (-84, 0, 0)}, (0, -0.02, 0)),
            (9, {'Hips': (0, -6, 0), 'Spine': (16, -10, 0), 'Chest': (6, -6, 0),
                  'UpperArm_R': (-86, 0, -28), 'Forearm_R': (-4, 0, 0), 'Hand_R': (-4, 0, 0),
                  'UpperArm_L': (-44, 0, 18), 'Forearm_L': (-82, 0, 0)}, (0, -0.01, 0)),
            (10, {'Hips': (0, -6, 0), 'Spine': (15, -10, 0), 'Chest': (6, -6, 0),
                   'UpperArm_R': (-85, 0, -28), 'Forearm_R': (-5, 0, 0), 'Hand_R': (-4, 0, 0)}, (0, -0.01, 0)),
            (14, {'Hips': (0, 4, 0), 'Spine': (5, 8, 0), 'Chest': (3, 4, 0),
                   'UpperArm_R': (-52, 0, -18), 'Forearm_R': (-36, 0, 0),
                   'UpperArm_L': (-40, 0, 14), 'Forearm_L': (-74, 0, 0)}, (0, 0, 0)),
            (20, {'Hips': (0, 0, 0), 'Spine': (8, 0, 0), 'Chest': (4, 0, 0),
                   'UpperArm_L': (-45, 0, 15), 'Forearm_L': (-75, 0, 0),
                   'UpperArm_R': (-40, 0, -15), 'Forearm_R': (-80, 0, 0)}, (0, 0, 0)),
        ], contact_frame=9),
        clip('knee-strike', 'Knee Strike', 'melee', False, [
            (1, {'Hips': (0, -8, 0), 'Spine': (10, -4, 0), 'Chest': (4, -2, 0),
                 'UpperArm_L': (-48, 0, 18), 'Forearm_L': (-78, 0, 0),
                 'UpperArm_R': (-44, 0, -18), 'Forearm_R': (-82, 0, 0),
                 'Thigh_L': (-18, 0, -10), 'Shin_L': (24, 0, 0), 'Thigh_R': (14, 0, 10), 'Shin_R': (14, 0, 0)}, (0, 0, 0)),
            (4, {'Hips': (0, 12, 0), 'Spine': (-10, 12, 0), 'Chest': (-3, 8, 0),
                  'UpperArm_L': (-60, 0, 22), 'Forearm_L': (-74, 0, 0),
                  'UpperArm_R': (-28, 0, -26), 'Forearm_R': (-104, 0, 0),
                  'Thigh_R': (-92, 0, 0), 'Shin_R': (116, 0, 0), 'Thigh_L': (-22, 0, -14), 'Shin_L': (30, 0, 0)}, (0, 0, 0.02)),
            (8, {'Hips': (0, -10, 0), 'Spine': (12, -8, 0), 'Chest': (4, -4, 0),
                  'UpperArm_L': (-54, 0, 20), 'Forearm_L': (-74, 0, 0),
                  'UpperArm_R': (-26, 0, -30), 'Forearm_R': (-100, 0, 0),
                  'Thigh_R': (-108, 0, 0), 'Shin_R': (130, 0, 0), 'Foot_R': (10, 0, 0),
                  'Thigh_L': (-24, 0, -14), 'Shin_L': (30, 0, 0)}, (0, 0, 0.06)),
            (10, {'Hips': (0, -12, 0), 'Spine': (-4, -12, 0), 'Chest': (4, -6, 0),
                   'UpperArm_L': (-56, 0, 22), 'Forearm_L': (-72, 0, 0),
                   'UpperArm_R': (-22, 0, -30), 'Forearm_R': (-104, 0, 0),
                   'Thigh_R': (-104, 0, 0), 'Shin_R': (130, 0, 0), 'Foot_R': (18, 0, 0),
                   'Thigh_L': (-26, 0, -14), 'Shin_L': (32, 0, 0)}, (0, -0.01, 0.04)),
            (11, {'Hips': (0, -12, 0), 'Spine': (-3, -12, 0), 'Chest': (4, -6, 0),
                   'Thigh_R': (-103, 0, 0), 'Shin_R': (130, 0, 0), 'Foot_R': (18, 0, 0)}, (0, -0.01, 0.04)),
            (15, {'Hips': (0, 4, 0), 'Spine': (2, 6, 0), 'Chest': (2, 3, 0),
                   'Thigh_R': (-44, 0, 0), 'Shin_R': (68, 0, 0), 'Foot_R': (-12, 0, 0),
                   'UpperArm_R': (-36, 0, -16), 'Forearm_R': (-82, 0, 0)}, (0, 0, 0)),
            (22, {'Hips': (0, 0, 0), 'Spine': (8, 0, 0), 'Chest': (4, 0, 0),
                   'UpperArm_L': (-45, 0, 15), 'Forearm_L': (-75, 0, 0),
                   'UpperArm_R': (-40, 0, -15), 'Forearm_R': (-80, 0, 0),
                   'Thigh_R': (8, 0, 5), 'Shin_R': (14, 0, 0)}, (0, 0, 0)),
        ], contact_frame=10),
        clip('shoulder-check', 'Shoulder Check', 'melee', False, [
            (1, {'Hips': (0, -8, 0), 'Spine': (8, -4, 0), 'Chest': (4, -2, 0),
                 'UpperArm_L': (-48, 0, 18), 'Forearm_L': (-78, 0, 0),
                 'UpperArm_R': (-40, 0, -16), 'Forearm_R': (-84, 0, 0),
                 'Thigh_L': (-20, 0, -10), 'Shin_L': (24, 0, 0), 'Thigh_R': (14, 0, 10), 'Shin_R': (14, 0, 0)}, (0, 0, 0)),
            (5, {'Hips': (0, 26, 0), 'Spine': (-18, 24, 0), 'Chest': (-10, 14, 0),
                 'UpperArm_R': (-16, 0, -28), 'Forearm_R': (-98, 0, 0),
                 'UpperArm_L': (-54, 0, 24), 'Forearm_L': (-84, 0, 0),
                 'Thigh_L': (-30, 0, -16), 'Shin_L': (34, 0, 0), 'Thigh_R': (22, 0, 16), 'Shin_R': (18, 0, 0)}, (0, 0.04, -0.04)),
            (8, {'Hips': (0, -18, 0), 'Spine': (16, -18, 0), 'Chest': (10, -12, 0),
                  'UpperArm_R': (-12, 0, -20), 'Forearm_R': (-104, 0, 0),
                  'UpperArm_L': (-50, 0, 22), 'Forearm_L': (-86, 0, 0),
                  'Thigh_L': (-34, 0, -14), 'Shin_L': (38, 0, 0), 'Thigh_R': (20, 0, 14), 'Shin_R': (20, 0, 0)}, (0, -0.04, 0)),
            (10, {'Hips': (0, -30, 0), 'Spine': (28, -24, 0), 'Chest': (14, -16, 0),
                  'UpperArm_R': (-8, 0, -14), 'Forearm_R': (-108, 0, 0),
                  'UpperArm_L': (-46, 0, 20), 'Forearm_L': (-84, 0, 0),
                  'Thigh_L': (-40, 0, -16), 'Shin_L': (44, 0, 0), 'Thigh_R': (24, 0, 16), 'Shin_R': (20, 0, 0)}, (0, -0.05, 0)),
            (11, {'Hips': (0, -29, 0), 'Spine': (27, -23, 0), 'Chest': (14, -16, 0),
                   'UpperArm_R': (-9, 0, -14), 'Forearm_R': (-107, 0, 0), 'UpperArm_L': (-46, 0, 20)}, (0, -0.05, 0)),
            (16, {'Hips': (0, -10, 0), 'Spine': (10, -6, 0), 'Chest': (5, -4, 0),
                   'UpperArm_R': (-34, 0, -18), 'Forearm_R': (-84, 0, 0),
                   'UpperArm_L': (-44, 0, 16), 'Forearm_L': (-74, 0, 0)}, (0, -0.01, 0)),
            (24, {'Hips': (0, 0, 0), 'Spine': (8, 0, 0), 'Chest': (4, 0, 0),
                   'UpperArm_L': (-45, 0, 15), 'Forearm_L': (-75, 0, 0),
                   'UpperArm_R': (-40, 0, -15), 'Forearm_R': (-80, 0, 0)}, (0, 0, 0)),
        ], contact_frame=10),

        # ---------------------------------------------------------------------
        # Staff actions. Both hands stay in the staff line so the broad arcs
        # read clearly with the minimal stick geometry.
        # ---------------------------------------------------------------------
        clip('staff-thrust', 'Staff Thrust', 'melee', False, [
            (1, {'Hips': (0, 8, 0), 'Spine': (8, 4, 0), 'Chest': (4, 2, 0),
                 'UpperArm_L': (-52, 0, -18), 'Forearm_L': (-82, 0, 0),
                 'UpperArm_R': (-44, 0, 18), 'Forearm_R': (-92, 0, 0),
                 'Thigh_L': (-16, 0, -10), 'Shin_L': (24, 0, 0), 'Thigh_R': (12, 0, 10), 'Shin_R': (14, 0, 0)}, (0, 0, 0)),
            (4, {'Hips': (0, -26, 0), 'Spine': (-12, -26, 0), 'Chest': (-6, -14, 0),
                 'UpperArm_L': (-18, 0, -22), 'Forearm_L': (-72, 0, 0),
                 'UpperArm_R': (28, 0, 20), 'Forearm_R': (-104, 0, 0),
                 'Thigh_L': (-24, 0, -12), 'Shin_L': (30, 0, 0), 'Thigh_R': (16, 0, 12), 'Shin_R': (18, 0, 0)}, (0, -0.02, -0.02)),
            (8, {'Hips': (0, 14, 0), 'Spine': (4, 12, 0), 'Chest': (2, 8, 0),
                  'UpperArm_L': (-48, 0, 18), 'Forearm_L': (-72, 0, 0),
                  'UpperArm_R': (-58, 0, -12), 'Forearm_R': (-48, 0, 0)}, (0, 0.01, 0)),
            (10, {'Hips': (0, 12, 0), 'Spine': (12, 6, 0), 'Chest': (4, 3, 0),
                   'UpperArm_L': (-52, 0, 20), 'Forearm_L': (-72, 0, 0), 'Hand_L': (-8, 0, 0),
                   'UpperArm_R': (-92, 0, -5), 'Forearm_R': (-4, 0, 0), 'Hand_R': (82.85, 6.16, -20.372),
                   'Thigh_L': (-30, 0, -18), 'Shin_L': (42, 0, 0), 'Foot_L': (8, 0, 0),
                   'Thigh_R': (20, 0, 18), 'Shin_R': (26, 0, 0), 'Foot_R': (4, 0, 0)}, (0, 0.02, -0.02)),
            (11, {'Hips': (0, 11, 0), 'Spine': (11, 6, 0), 'Chest': (4, 3, 0),
                   'UpperArm_L': (-52, 0, 20), 'Forearm_L': (-73, 0, 0), 'Hand_L': (-8, 0, 0),
                   'UpperArm_R': (-88, 0, -5), 'Forearm_R': (-6, 0, 0), 'Hand_R': (82.025, 5.788, -21.422)}, (0, 0.02, -0.02)),
            (16, {'Hips': (0, 8, 0), 'Spine': (8, 6, 0), 'Chest': (3, 3, 0),
                  'UpperArm_L': (-50, 0, -14), 'Forearm_L': (-66, 0, 0),
                  'UpperArm_R': (-38, 0, 16), 'Forearm_R': (-76, 0, 0)}, (0, 0, 0)),
            (22, {'Hips': (0, 0, 0), 'Spine': (8, 0, 0), 'Chest': (4, 0, 0),
                   'UpperArm_L': (-48, 0, -16), 'Forearm_L': (-78, 0, 0),
                   'UpperArm_R': (-40, 0, 16), 'Forearm_R': (-84, 0, 0)}, (0, 0, 0)),
        ], contact_frame=10),
        clip('staff-sweep', 'Staff Sweep', 'melee', False, [
            (1, {'Hips': (0, -4, 0), 'Spine': (8, -4, 0), 'Chest': (4, -2, 0),
                 'UpperArm_L': (-48, 0, -18), 'Forearm_L': (-74, 0, 0),
                 'UpperArm_R': (-44, 0, 18), 'Forearm_R': (-86, 0, 0),
                 'Thigh_L': (-14, 0, -8), 'Shin_L': (22, 0, 0), 'Thigh_R': (12, 0, 8), 'Shin_R': (14, 0, 0)}, (0, 0, 0)),
            (4, {'Hips': (0, 32, 0), 'Spine': (-10, 30, 0), 'Chest': (-4, 16, 0),
                  'UpperArm_L': (-68, 0, -30), 'Forearm_L': (-54, 0, 0),
                  'UpperArm_R': (-62, 0, 28), 'Forearm_R': (-68, 0, 0),
                  'Thigh_L': (-22, 0, -12), 'Shin_L': (28, 0, 0), 'Thigh_R': (16, 0, 12), 'Shin_R': (18, 0, 0)}, (0, 0.03, -0.02)),
            (8, {'Hips': (0, -40, 0), 'Spine': (10, -30, 0), 'Chest': (6, -16, 0),
                  'UpperArm_L': (-46, 0, 24), 'Forearm_L': (-54, 0, 0),
                  'UpperArm_R': (-56, 0, -28), 'Forearm_R': (-46, 0, 0)}, (0, -0.04, 0)),
            (11, {'Hips': (0, -38, 0), 'Spine': (12, -18, 0), 'Chest': (5, -8, 0),
                   'UpperArm_L': (-58, 0, 28), 'Forearm_L': (-46, 0, 0), 'Hand_L': (-8, 0, 0),
                   'UpperArm_R': (-64, 0, -30), 'Forearm_R': (-26, 0, 0), 'Hand_R': (-12.723, -156.345, -55.053),
                   'Thigh_L': (-30, 0, -18), 'Shin_L': (42, 0, 0), 'Foot_L': (8, 0, 0),
                   'Thigh_R': (24, 0, 18), 'Shin_R': (30, 0, 0), 'Foot_R': (4, 0, 0)}, (0, -0.04, 0)),
            (12, {'Hips': (0, -36, 0), 'Spine': (11, -17, 0), 'Chest': (5, -8, 0),
                   'UpperArm_L': (-58, 0, 28), 'Forearm_L': (-47, 0, 0), 'Hand_L': (-8, 0, 0),
                   'UpperArm_R': (-62, 0, -30), 'Forearm_R': (-28, 0, 0), 'Hand_R': (-11.957, -156.504, -52.287)}, (0, -0.04, 0)),
            (17, {'Hips': (0, -12, 0), 'Spine': (10, -8, 0), 'Chest': (4, -4, 0),
                   'UpperArm_L': (-46, 0, -12), 'Forearm_L': (-64, 0, 0),
                   'UpperArm_R': (-40, 0, 12), 'Forearm_R': (-72, 0, 0)}, (0, -0.01, 0)),
            (24, {'Hips': (0, 0, 0), 'Spine': (8, 0, 0), 'Chest': (4, 0, 0),
                   'UpperArm_L': (-48, 0, -16), 'Forearm_L': (-78, 0, 0),
                   'UpperArm_R': (-40, 0, 16), 'Forearm_R': (-84, 0, 0)}, (0, 0, 0)),
        ], contact_frame=11),
        clip('staff-overhead', 'Staff Overhead', 'melee', False, [
            (1, {'Hips': (0, -6, 0), 'Spine': (8, -4, 0), 'Chest': (4, -2, 0),
                 'UpperArm_L': (-48, 0, -18), 'Forearm_L': (-76, 0, 0),
                 'UpperArm_R': (-42, 0, 18), 'Forearm_R': (-86, 0, 0),
                 'Thigh_L': (-18, 0, -10), 'Shin_L': (24, 0, 0), 'Thigh_R': (14, 0, 10), 'Shin_R': (14, 0, 0)}, (0, 0, 0)),
            (6, {'Hips': (0, 20, 0), 'Spine': (-24, 16, 0), 'Chest': (-8, 8, 0),
                  'UpperArm_L': (-150, 0, -16), 'Forearm_L': (-74, 0, 0),
                  'UpperArm_R': (-150, 0, 16), 'Forearm_R': (-74, 0, 0),
                  'Thigh_L': (-28, 0, -14), 'Shin_L': (38, 0, 0), 'Thigh_R': (20, 0, 14), 'Shin_R': (18, 0, 0)}, (0, 0.03, 0.04)),
            (10, {'Hips': (0, -12, 0), 'Spine': (10, -8, 0), 'Chest': (4, -4, 0),
                  'UpperArm_L': (-72, 0, -12), 'Forearm_L': (-28, 0, 0),
                  'UpperArm_R': (-82, 0, 8), 'Forearm_R': (-12, 0, 0)}, (0, -0.02, -0.05)),
            (13, {'Hips': (0, -12, 0), 'Spine': (24, -4, 0), 'Chest': (7, -2, 0),
                   'UpperArm_L': (-72, 0, -12), 'Forearm_L': (-28, 0, 0), 'Hand_L': (-8, 0, 0),
                   'UpperArm_R': (-82, 0, 8), 'Forearm_R': (-12, 0, 0), 'Hand_R': (80.741, 35.071, -55.323),
                   'Thigh_L': (-40, 0, -18), 'Shin_L': (54, 0, 0), 'Foot_L': (10, 0, 0),
                   'Thigh_R': (24, 0, 18), 'Shin_R': (40, 0, 0), 'Foot_R': (6, 0, 0)}, (0, -0.02, -0.08)),
            (14, {'Hips': (0, -11, 0), 'Spine': (23, -4, 0), 'Chest': (7, -2, 0),
                   'UpperArm_L': (-72, 0, -12), 'Forearm_L': (-29, 0, 0), 'Hand_L': (-8, 0, 0),
                   'UpperArm_R': (-82, 0, 8), 'Forearm_R': (-13, 0, 0), 'Hand_R': (81.787, 37.035, -53.884)}, (0, -0.02, -0.08)),
            (19, {'Hips': (0, -8, 0), 'Spine': (16, 2, 0), 'Chest': (5, 2, 0),
                   'UpperArm_L': (-38, 0, -12), 'Forearm_L': (-36, 0, 0),
                   'UpperArm_R': (-36, 0, 12), 'Forearm_R': (-34, 0, 0)}, (0, 0, -0.02)),
            (25, {'Hips': (0, 0, 0), 'Spine': (8, 0, 0), 'Chest': (4, 0, 0),
                   'UpperArm_L': (-48, 0, -16), 'Forearm_L': (-78, 0, 0),
                   'UpperArm_R': (-40, 0, 16), 'Forearm_R': (-84, 0, 0)}, (0, 0, 0)),
        ], contact_frame=13),
        clip('staff-parry', 'Staff Parry', 'melee', False, [
            (1, {'Hips': (0, -4, 0), 'Spine': (8, -4, 0), 'Chest': (4, -2, 0),
                 'UpperArm_L': (-48, 0, -18), 'Forearm_L': (-74, 0, 0),
                 'UpperArm_R': (-44, 0, 18), 'Forearm_R': (-84, 0, 0)}, (0, 0, 0)),
            (3, {'Hips': (0, 18, 0), 'Spine': (-8, 16, 0), 'Chest': (-4, 8, 0),
                 'UpperArm_L': (-72, 0, -38), 'Forearm_L': (-42, 0, 0),
                 'UpperArm_R': (-38, 0, 24), 'Forearm_R': (-96, 0, 0)}, (0, 0.01, 0)),
            (7, {'Hips': (0, -8, 0), 'Spine': (12, -12, 0), 'Chest': (5, -6, 0),
                 'UpperArm_L': (-104, 0, -22), 'Forearm_L': (-16, 0, 0), 'Hand_L': (-8, 0, 0),
                   'UpperArm_R': (-58, 0, 24), 'Forearm_R': (-38, 0, 0), 'Hand_R': (91.068, -28.991, -90.996)}, (0, -0.01, 0)),
            (8, {'Hips': (0, -8, 0), 'Spine': (12, -12, 0), 'Chest': (5, -6, 0),
                 'UpperArm_L': (-104, 0, -22), 'Forearm_L': (-17, 0, 0), 'Hand_L': (-8, 0, 0),
                 'UpperArm_R': (-56, 0, 24), 'Forearm_R': (-40, 0, 0), 'Hand_R': (91.063, -28.991, -91.0)}, (0, -0.01, 0)),
            (13, {'Hips': (0, 8, 0), 'Spine': (4, 6, 0), 'Chest': (2, 3, 0),
                  'UpperArm_L': (-54, 0, -18), 'Forearm_L': (-62, 0, 0),
                  'UpperArm_R': (-42, 0, 16), 'Forearm_R': (-76, 0, 0)}, (0, 0, 0)),
            (20, {'Hips': (0, 0, 0), 'Spine': (8, 0, 0), 'Chest': (4, 0, 0),
                  'UpperArm_L': (-48, 0, -16), 'Forearm_L': (-78, 0, 0),
                  'UpperArm_R': (-40, 0, 16), 'Forearm_R': (-84, 0, 0)}, (0, 0, 0)),
        ], contact_frame=7),

        # ---------------------------------------------------------------------
        # Sword actions: each has a distinct blade path and foot pattern.
        # ---------------------------------------------------------------------
        clip('sword-diagonal', 'Sword Diagonal', 'melee', False, [
            (1, {'Hips': (0, -6, 0), 'Spine': (8, -4, 0), 'Chest': (4, -2, 0),
                 'UpperArm_R': (-34, 0, -20), 'Forearm_R': (-88, 0, 0),
                 'UpperArm_L': (-40, 0, 16), 'Forearm_L': (-74, 0, 0),
                 'Thigh_L': (-16, 0, -10), 'Shin_L': (24, 0, 0), 'Thigh_R': (14, 0, 10), 'Shin_R': (14, 0, 0)}, (0, 0, 0)),
            (4, {'Hips': (0, 26, 0), 'Spine': (-18, 26, 0), 'Chest': (-6, 14, 0),
                  'UpperArm_R': (30, 0, 44), 'Forearm_R': (-108, 0, 0),
                  'UpperArm_L': (-58, 0, -22), 'Forearm_L': (-88, 0, 0),
                  'Thigh_L': (-24, 0, -14), 'Shin_L': (32, 0, 0), 'Thigh_R': (18, 0, 14), 'Shin_R': (18, 0, 0)}, (0, 0.03, -0.02)),
            (8, {'Hips': (0, -4, 0), 'Spine': (4, -14, 0), 'Chest': (2, -8, 0),
                  'UpperArm_R': (-64, 0, 28), 'Forearm_R': (-42, 0, 0),
                  'UpperArm_L': (-46, 0, -18), 'Forearm_L': (-80, 0, 0)}, (0, -0.02, 0)),
            (11, {'Hips': (0, 8, 0), 'Spine': (12, 5, 0), 'Chest': (4, 3, 0),
                   'UpperArm_R': (-92, 0, -5), 'Forearm_R': (-4, 0, 0), 'Hand_R': (-26.394, -36.997, -31.573),
                   'UpperArm_L': (-50, 0, 22), 'Forearm_L': (-72, 0, 0), 'Hand_L': (-8, 0, 0),
                   'Thigh_L': (-30, 0, -20), 'Shin_L': (46, 0, 0), 'Foot_L': (8, 0, 0),
                   'Thigh_R': (24, 0, 20), 'Shin_R': (30, 0, 0), 'Foot_R': (5, 0, 0)}, (0, -0.02, -0.02)),
            (12, {'Hips': (0, 8, 0), 'Spine': (11, 5, 0), 'Chest': (4, 3, 0),
                   'UpperArm_R': (-90, 0, -5), 'Forearm_R': (-6, 0, 0), 'Hand_R': (-25.428, -36.375, -32.084),
                   'UpperArm_L': (-50, 0, 22), 'Forearm_L': (-74, 0, 0), 'Hand_L': (-8, 0, 0)}, (0, -0.02, -0.02)),
            (17, {'Hips': (0, -8, 0), 'Spine': (10, -4, 0), 'Chest': (4, -2, 0),
                   'UpperArm_R': (-48, 0, -10), 'Forearm_R': (-38, 0, 0),
                   'UpperArm_L': (-36, 0, -12), 'Forearm_L': (-58, 0, 0)}, (0, 0, 0)),
            (23, {'Hips': (0, 0, 0), 'Spine': (8, 0, 0), 'Chest': (4, 0, 0),
                   'UpperArm_R': (-38, 0, 16), 'Forearm_R': (-82, 0, 0),
                   'UpperArm_L': (-34, 0, -14), 'Forearm_L': (-68, 0, 0)}, (0, 0, 0)),
        ], contact_frame=11),
        clip('dagger-stab', 'Dagger Stab', 'melee', False, [
            (1, {'Hips': (0, 4, 0), 'Spine': (8, 4, 0), 'Chest': (4, 2, 0),
                 'UpperArm_L': (-36, 0, 18), 'Forearm_L': (-84, 0, 0),
                 'UpperArm_R': (-44, 0, -16), 'Forearm_R': (-76, 0, 0),
                 'Thigh_L': (-14, 0, -10), 'Shin_L': (22, 0, 0), 'Thigh_R': (12, 0, 10), 'Shin_R': (14, 0, 0)}, (0, 0, 0)),
            (4, {'Hips': (0, -24, 0), 'Spine': (-12, -26, 0), 'Chest': (-5, -14, 0),
                  'UpperArm_L': (28, 0, -40), 'Forearm_L': (-104, 0, 0),
                  'UpperArm_R': (-52, 0, 24), 'Forearm_R': (-86, 0, 0),
                  'Thigh_L': (-24, 0, -14), 'Shin_L': (32, 0, 0), 'Thigh_R': (18, 0, 14), 'Shin_R': (18, 0, 0)}, (0, -0.03, -0.02)),
            (7, {'Hips': (0, 10, 0), 'Spine': (4, 14, 0), 'Chest': (2, 8, 0),
                  'UpperArm_L': (-66, 0, -28), 'Forearm_L': (-42, 0, 0),
                  'UpperArm_R': (-42, 0, 20), 'Forearm_R': (-72, 0, 0)}, (0, 0.01, 0)),
            (10, {'Hips': (0, 8, 0), 'Spine': (12, 5, 0), 'Chest': (4, 3, 0),
                   'UpperArm_L': (-52, 0, 20), 'Forearm_L': (-72, 0, 0), 'Hand_L': (-8, 0, 0),
                   'UpperArm_R': (-92, 0, -4), 'Forearm_R': (-4, 0, 0), 'Hand_R': (10.776, -8.044, -13.729),
                   'Thigh_L': (-34, 0, -20), 'Shin_L': (50, 0, 0), 'Foot_L': (8, 0, 0),
                   'Thigh_R': (22, 0, 20), 'Shin_R': (30, 0, 0), 'Foot_R': (4, 0, 0)}, (0, 0.02, -0.02)),
            (11, {'Hips': (0, 8, 0), 'Spine': (11, 5, 0), 'Chest': (4, 3, 0),
                   'UpperArm_L': (-52, 0, 20), 'Forearm_L': (-74, 0, 0), 'Hand_L': (-8, 0, 0),
                   'UpperArm_R': (-90, 0, -4), 'Forearm_R': (-6, 0, 0), 'Hand_R': (11.726, -7.713, -13.77)}, (0, 0.02, -0.02)),
            (16, {'Hips': (0, 8, 0), 'Spine': (10, 8, 0), 'Chest': (4, 4, 0),
                   'UpperArm_L': (-52, 0, 12), 'Forearm_L': (-40, 0, 0),
                   'UpperArm_R': (-36, 0, 14), 'Forearm_R': (-60, 0, 0)}, (0, 0, 0)),
            (22, {'Hips': (0, 0, 0), 'Spine': (8, 0, 0), 'Chest': (4, 0, 0),
                   'UpperArm_L': (-36, 0, -14), 'Forearm_L': (-74, 0, 0),
                   'UpperArm_R': (-40, 0, 16), 'Forearm_R': (-80, 0, 0)}, (0, 0, 0)),
        ], contact_frame=10),
        clip('sword-lunge', 'Sword Lunge', 'melee', False, [
            (1, {'Hips': (0, -6, 0), 'Spine': (8, -4, 0), 'Chest': (4, -2, 0),
                 'UpperArm_R': (-36, 0, 16), 'Forearm_R': (-92, 0, 0),
                 'UpperArm_L': (-32, 0, -16), 'Forearm_L': (-70, 0, 0),
                 'Thigh_L': (-18, 0, -10), 'Shin_L': (24, 0, 0), 'Thigh_R': (14, 0, 10), 'Shin_R': (14, 0, 0)}, (0, 0, 0)),
            (4, {'Hips': (0, -30, 0), 'Spine': (-16, -28, 0), 'Chest': (-6, -14, 0),
                  'UpperArm_R': (18, 0, 22), 'Forearm_R': (-110, 0, 0),
                  'UpperArm_L': (-60, 0, -18), 'Forearm_L': (-84, 0, 0),
                  'Thigh_L': (-34, 0, -14), 'Shin_L': (42, 0, 0), 'Thigh_R': (20, 0, 14), 'Shin_R': (18, 0, 0)}, (0, -0.03, -0.04)),
            (8, {'Hips': (0, 12, 0), 'Spine': (4, 12, 0), 'Chest': (2, 7, 0),
                  'UpperArm_R': (-38, 0, 8), 'Forearm_R': (-50, 0, 0),
                  'UpperArm_L': (-46, 0, -12), 'Forearm_L': (-72, 0, 0),
                  'Thigh_L': (-54, 0, -8), 'Shin_L': (72, 0, 0), 'Thigh_R': (28, 0, 10), 'Shin_R': (12, 0, 0)}, (0, 0.01, -0.02)),
            (10, {'Hips': (0, 8, 0), 'Spine': (12, 5, 0), 'Chest': (4, 3, 0),
                   'UpperArm_R': (-92, 0, -4), 'Forearm_R': (-4, 0, 0), 'Hand_R': (-22.006, 0.983, -11.749),
                   'UpperArm_L': (-50, 0, 18), 'Forearm_L': (-72, 0, 0), 'Hand_L': (-8, 0, 0),
                   'Thigh_L': (-58, 0, -32), 'Shin_L': (80, 0, 0), 'Foot_L': (10, 0, -10),
                   'Thigh_R': (26, 0, 32), 'Shin_R': (20, 0, 0), 'Foot_R': (6, 0, 10)}, (0, 0.02, -0.08)),
            (11, {'Hips': (0, 8, 0), 'Spine': (11, 5, 0), 'Chest': (4, 3, 0),
                   'UpperArm_R': (-90, 0, -4), 'Forearm_R': (-6, 0, 0), 'Hand_R': (-21.064, 1.305, -11.681),
                   'UpperArm_L': (-50, 0, 18), 'Forearm_L': (-74, 0, 0), 'Hand_L': (-8, 0, 0)}, (0, 0.02, -0.08)),
            (16, {'Hips': (0, 8, 0), 'Spine': (8, 6, 0), 'Chest': (3, 3, 0),
                   'UpperArm_R': (-54, 0, 12), 'Forearm_R': (-32, 0, 0),
                   'UpperArm_L': (-40, 0, -10), 'Forearm_L': (-70, 0, 0)}, (0, 0, -0.02)),
            (22, {'Hips': (0, 0, 0), 'Spine': (8, 0, 0), 'Chest': (4, 0, 0),
                   'UpperArm_R': (-35, 0, 15), 'Forearm_R': (-85, 0, 0),
                   'UpperArm_L': (-30, 0, -14), 'Forearm_L': (-66, 0, 0)}, (0, 0, 0)),
        ], contact_frame=10),
        clip('hammer-overhead', 'Hammer Overhead', 'melee', False, [
            (1, {'Hips': (0, -4, 0), 'Spine': (8, -2, 0), 'Chest': (4, -1, 0),
                 'UpperArm_R': (-38, 0, 16), 'Forearm_R': (-88, 0, 0),
                 'UpperArm_L': (-34, 0, -16), 'Forearm_L': (-72, 0, 0)}, (0, 0, 0)),
            (5, {'Hips': (0, 22, 0), 'Spine': (-20, 18, 0), 'Chest': (-8, 10, 0),
                  'UpperArm_R': (-150, 0, 14), 'Forearm_R': (-74, 0, 0),
                  'UpperArm_L': (-150, 0, -14), 'Forearm_L': (-74, 0, 0)}, (0, 0.03, 0.04)),
            (9, {'Hips': (0, -10, 0), 'Spine': (10, -8, 0), 'Chest': (4, -4, 0),
                  'UpperArm_R': (-70, 0, 12), 'Forearm_R': (-34, 0, 0),
                  'UpperArm_L': (-78, 0, -10), 'Forearm_L': (-30, 0, 0)}, (0, -0.02, -0.04)),
            (14, {'Hips': (0, -14, 0), 'Spine': (22, -6, 0), 'Chest': (8, -3, 0),
                   'UpperArm_R': (-82, 0, 8), 'Forearm_R': (-12, 0, 0), 'Hand_R': (20.738, 13.695, -50.478),
                   'UpperArm_L': (-58, 0, -20), 'Forearm_L': (-50, 0, 0), 'Hand_L': (-8, 0, 0),
                   'Thigh_L': (-42, 0, -18), 'Shin_L': (54, 0, 0), 'Foot_L': (10, 0, 0),
                   'Thigh_R': (28, 0, 18), 'Shin_R': (42, 0, 0), 'Foot_R': (6, 0, 0)}, (0, -0.02, -0.10)),
            (15, {'Hips': (0, -13, 0), 'Spine': (21, -6, 0), 'Chest': (8, -3, 0),
                   'UpperArm_R': (-80, 0, 8), 'Forearm_R': (-14, 0, 0), 'Hand_R': (21.161, 14.785, -49.6),
                   'UpperArm_L': (-58, 0, -20), 'Forearm_L': (-52, 0, 0), 'Hand_L': (-8, 0, 0)}, (0, -0.02, -0.10)),
            (20, {'Hips': (0, 6, 0), 'Spine': (8, 4, 0), 'Chest': (3, 2, 0),
                   'UpperArm_R': (-52, 0, 12), 'Forearm_R': (-36, 0, 0),
                   'UpperArm_L': (-40, 0, -10), 'Forearm_L': (-70, 0, 0)}, (0, 0, -0.01)),
            (26, {'Hips': (0, 0, 0), 'Spine': (8, 0, 0), 'Chest': (4, 0, 0),
                   'UpperArm_R': (-38, 0, 16), 'Forearm_R': (-88, 0, 0),
                   'UpperArm_L': (-34, 0, -16), 'Forearm_L': (-72, 0, 0)}, (0, 0, 0)),
        ], contact_frame=14),

        # ---------------------------------------------------------------------
        # Shield actions: the left arm is the shield line, with the right arm
        # counterbalancing each impact.
        # ---------------------------------------------------------------------
        clip('shield-bash', 'Shield Bash', 'melee', False, [
            (1, {'Hips': (0, -8, 0), 'Spine': (8, -4, 0), 'Chest': (4, -2, 0),
                 'UpperArm_L': (-52, 0, -22), 'Forearm_L': (-86, 0, 0),
                 'UpperArm_R': (-42, 0, 18), 'Forearm_R': (-80, 0, 0),
                 'Thigh_L': (-18, 0, -10), 'Shin_L': (24, 0, 0), 'Thigh_R': (12, 0, 10), 'Shin_R': (14, 0, 0)}, (0, 0, 0)),
            (4, {'Hips': (0, 24, 0), 'Spine': (-14, 22, 0), 'Chest': (-6, 12, 0),
                  'UpperArm_L': (22, 0, -36), 'Forearm_L': (-104, 0, 0),
                  'UpperArm_R': (-52, 0, 20), 'Forearm_R': (-88, 0, 0),
                  'Thigh_L': (-26, 0, -14), 'Shin_L': (34, 0, 0), 'Thigh_R': (18, 0, 14), 'Shin_R': (18, 0, 0)}, (0, 0.03, -0.03)),
            (8, {'Hips': (0, -12, 0), 'Spine': (14, -12, 0), 'Chest': (6, -7, 0),
                  'UpperArm_L': (-42, 0, -18), 'Forearm_L': (-44, 0, 0),
                  'UpperArm_R': (-36, 0, 24), 'Forearm_R': (-96, 0, 0)}, (0, -0.02, 0)),
            (10, {'Hips': (0, 8, 0), 'Spine': (18, 8, 0), 'Chest': (6, 5, 0),
                   'UpperArm_L': (-92, 0, -6), 'Forearm_L': (-6, 0, 0), 'Hand_L': (-102.016, 20.267, 25.338),
                   'UpperArm_R': (-52, 0, 20), 'Forearm_R': (-72, 0, 0), 'Hand_R': (-8, 0, 0),
                   'Thigh_L': (-34, 0, -20), 'Shin_L': (50, 0, 0), 'Foot_L': (8, 0, 0),
                   'Thigh_R': (22, 0, 20), 'Shin_R': (30, 0, 0), 'Foot_R': (4, 0, 0)}, (0, -0.03, -0.02)),
            (11, {'Hips': (0, 8, 0), 'Spine': (17, 7, 0), 'Chest': (6, 5, 0),
                   'UpperArm_L': (-90, 0, -6), 'Forearm_L': (-8, 0, 0), 'Hand_L': (-101.027, 19.664, 24.792),
                   'UpperArm_R': (-52, 0, 20), 'Forearm_R': (-74, 0, 0), 'Hand_R': (-8, 0, 0)}, (0, -0.03, -0.02)),
            (16, {'Hips': (0, -6, 0), 'Spine': (8, -3, 0), 'Chest': (4, -2, 0),
                   'UpperArm_L': (-56, 0, -16), 'Forearm_L': (-64, 0, 0),
                   'UpperArm_R': (-38, 0, 18), 'Forearm_R': (-78, 0, 0)}, (0, 0, 0)),
            (22, {'Hips': (0, 0, 0), 'Spine': (8, 0, 0), 'Chest': (4, 0, 0),
                   'UpperArm_L': (-48, 0, -18), 'Forearm_L': (-82, 0, 0),
                   'UpperArm_R': (-40, 0, 16), 'Forearm_R': (-80, 0, 0)}, (0, 0, 0)),
        ], contact_frame=10),
        clip('shield-block', 'Shield Block', 'melee', False, [
            (1, {'Hips': (0, -4, 0), 'Spine': (8, -2, 0), 'Chest': (4, -1, 0),
                 'UpperArm_L': (-44, 0, -22), 'Forearm_L': (-82, 0, 0),
                 'UpperArm_R': (-48, 0, 20), 'Forearm_R': (-82, 0, 0),
                 'Thigh_L': (-14, 0, -10), 'Shin_L': (22, 0, 0), 'Thigh_R': (12, 0, 10), 'Shin_R': (14, 0, 0)}, (0, 0, 0)),
            (4, {'Hips': (0, 14, 0), 'Spine': (-6, 14, 0), 'Chest': (-3, 8, 0),
                  'UpperArm_L': (-104, 0, -24), 'Forearm_L': (-34, 0, 0),
                  'UpperArm_R': (-58, 0, 28), 'Forearm_R': (-100, 0, 0),
                  'Thigh_L': (-20, 0, -12), 'Shin_L': (28, 0, 0), 'Thigh_R': (16, 0, 12), 'Shin_R': (16, 0, 0)}, (0, 0.01, -0.02)),
            (8, {'Hips': (0, -4, 0), 'Spine': (10, -4, 0), 'Chest': (4, -2, 0),
                  'UpperArm_L': (-100, 0, -18), 'Forearm_L': (-22, 0, 0), 'Hand_L': (-65.155, 5.715, -2.411),
                  'UpperArm_R': (-56, 0, 26), 'Forearm_R': (-92, 0, 0), 'Hand_R': (-8, 0, 0),
                  'Thigh_L': (-20, 0, -16), 'Shin_L': (30, 0, 0), 'Foot_L': (6, 0, 0),
                  'Thigh_R': (18, 0, 16), 'Shin_R': (24, 0, 0), 'Foot_R': (4, 0, 0)}, (0, -0.01, 0)),
            (9, {'Hips': (0, -4, 0), 'Spine': (9, -4, 0), 'Chest': (4, -2, 0),
                  'UpperArm_L': (-98, 0, -18), 'Forearm_L': (-24, 0, 0), 'Hand_L': (-64.2, 5.464, -2.132),
                  'UpperArm_R': (-56, 0, 26), 'Forearm_R': (-94, 0, 0), 'Hand_R': (-8, 0, 0)}, (0, -0.01, 0)),
            (14, {'Hips': (0, 2, 0), 'Spine': (5, 2, 0), 'Chest': (2, 1, 0),
                  'UpperArm_L': (-62, 0, -18), 'Forearm_L': (-62, 0, 0),
                  'UpperArm_R': (-44, 0, 18), 'Forearm_R': (-78, 0, 0)}, (0, 0, 0)),
            (20, {'Hips': (0, 0, 0), 'Spine': (8, 0, 0), 'Chest': (4, 0, 0),
                  'UpperArm_L': (-44, 0, -18), 'Forearm_L': (-78, 0, 0),
                  'UpperArm_R': (-40, 0, 16), 'Forearm_R': (-80, 0, 0)}, (0, 0, 0)),
        ], contact_frame=8),
        clip('shield-slam', 'Shield Slam', 'melee', False, [
            (1, {'Hips': (0, -6, 0), 'Spine': (8, -3, 0), 'Chest': (4, -2, 0),
                 'UpperArm_L': (-42, 0, -22), 'Forearm_L': (-82, 0, 0),
                 'UpperArm_R': (-46, 0, 20), 'Forearm_R': (-84, 0, 0),
                 'Thigh_L': (-16, 0, -10), 'Shin_L': (24, 0, 0), 'Thigh_R': (14, 0, 10), 'Shin_R': (14, 0, 0)}, (0, 0, 0)),
            (6, {'Hips': (0, 20, 0), 'Spine': (-24, 14, 0), 'Chest': (-8, 8, 0),
                  'UpperArm_L': (-150, 0, -14), 'Forearm_L': (-72, 0, 0),
                  'UpperArm_R': (-38, 0, 20), 'Forearm_R': (-90, 0, 0),
                  'Thigh_L': (-28, 0, -14), 'Shin_L': (38, 0, 0), 'Thigh_R': (20, 0, 14), 'Shin_R': (18, 0, 0)}, (0, 0.03, 0.03)),
            (10, {'Hips': (0, -10, 0), 'Spine': (12, -8, 0), 'Chest': (4, -4, 0),
                  'UpperArm_L': (-76, 0, -8), 'Forearm_L': (-28, 0, 0),
                  'UpperArm_R': (-46, 0, 18), 'Forearm_R': (-94, 0, 0)}, (0, -0.02, -0.04)),
            (12, {'Hips': (0, -14, 0), 'Spine': (24, -8, 0), 'Chest': (8, -4, 0),
                   'UpperArm_L': (-88, 0, -8), 'Forearm_L': (-24, 0, 0), 'Hand_L': (-118.02, 20.091, -30.447),
                   'UpperArm_R': (-52, 0, 20), 'Forearm_R': (-72, 0, 0), 'Hand_R': (-8, 0, 0),
                   'Thigh_L': (-40, 0, -20), 'Shin_L': (56, 0, 0), 'Foot_L': (10, 0, 0),
                   'Thigh_R': (26, 0, 20), 'Shin_R': (42, 0, 0), 'Foot_R': (6, 0, 0)}, (0, -0.02, -0.09)),
            (13, {'Hips': (0, -14, 0), 'Spine': (23, -8, 0), 'Chest': (8, -4, 0),
                   'UpperArm_L': (-86, 0, -8), 'Forearm_L': (-26, 0, 0), 'Hand_L': (-117.014, 20.414, -30.027),
                   'UpperArm_R': (-52, 0, 20), 'Forearm_R': (-74, 0, 0), 'Hand_R': (-8, 0, 0)}, (0, -0.02, -0.09)),
            (18, {'Hips': (0, -6, 0), 'Spine': (12, -2, 0), 'Chest': (5, 0, 0),
                   'UpperArm_L': (-58, 0, -14), 'Forearm_L': (-54, 0, 0),
                   'UpperArm_R': (-40, 0, 16), 'Forearm_R': (-80, 0, 0)}, (0, 0, -0.01)),
            (25, {'Hips': (0, 0, 0), 'Spine': (8, 0, 0), 'Chest': (4, 0, 0),
                   'UpperArm_L': (-44, 0, -18), 'Forearm_L': (-80, 0, 0),
                   'UpperArm_R': (-40, 0, 16), 'Forearm_R': (-80, 0, 0)}, (0, 0, 0)),
        ], contact_frame=12),
        clip('shield-push', 'Shield Push', 'melee', False, [
            (1, {'Hips': (0, -6, 0), 'Spine': (8, -3, 0), 'Chest': (4, -2, 0),
                 'UpperArm_L': (-48, 0, -18), 'Forearm_L': (-84, 0, 0),
                 'UpperArm_R': (-44, 0, 18), 'Forearm_R': (-80, 0, 0),
                 'Thigh_L': (-18, 0, -10), 'Shin_L': (24, 0, 0), 'Thigh_R': (14, 0, 10), 'Shin_R': (14, 0, 0)}, (0, 0, 0)),
            (5, {'Hips': (0, 24, 0), 'Spine': (-14, 20, 0), 'Chest': (-6, 12, 0),
                 'UpperArm_L': (18, 0, -24), 'Forearm_L': (-104, 0, 0),
                 'UpperArm_R': (8, 0, 24), 'Forearm_R': (-102, 0, 0),
                 'Thigh_L': (-26, 0, -14), 'Shin_L': (34, 0, 0), 'Thigh_R': (18, 0, 14), 'Shin_R': (18, 0, 0)}, (0, 0.03, -0.03)),
            (9, {'Hips': (0, -14, 0), 'Spine': (16, -14, 0), 'Chest': (6, -8, 0),
                  'UpperArm_L': (-56, 0, -10), 'Forearm_L': (-36, 0, 0),
                  'UpperArm_R': (-40, 0, 16), 'Forearm_R': (-54, 0, 0)}, (0, -0.02, -0.01)),
            (11, {'Hips': (0, 8, 0), 'Spine': (18, 8, 0), 'Chest': (6, 5, 0),
                   'UpperArm_L': (-92, 0, -6), 'Forearm_L': (-6, 0, 0), 'Hand_L': (-102.016, 20.267, 25.338),
                   'UpperArm_R': (-52, 0, 20), 'Forearm_R': (-72, 0, 0), 'Hand_R': (-8, 0, 0),
                   'Thigh_L': (-34, 0, -20), 'Shin_L': (50, 0, 0), 'Foot_L': (8, 0, 0),
                   'Thigh_R': (22, 0, 20), 'Shin_R': (30, 0, 0), 'Foot_R': (4, 0, 0)}, (0, -0.03, -0.03)),
            (12, {'Hips': (0, 8, 0), 'Spine': (17, 7, 0), 'Chest': (6, 5, 0),
                   'UpperArm_L': (-90, 0, -6), 'Forearm_L': (-8, 0, 0), 'Hand_L': (-101.027, 19.664, 24.792),
                   'UpperArm_R': (-52, 0, 20), 'Forearm_R': (-74, 0, 0), 'Hand_R': (-8, 0, 0)}, (0, -0.03, -0.03)),
            (17, {'Hips': (0, -8, 0), 'Spine': (10, -4, 0), 'Chest': (4, -2, 0),
                   'UpperArm_L': (-58, 0, -14), 'Forearm_L': (-60, 0, 0),
                   'UpperArm_R': (-38, 0, 16), 'Forearm_R': (-76, 0, 0)}, (0, -0.01, 0)),
            (24, {'Hips': (0, 0, 0), 'Spine': (8, 0, 0), 'Chest': (4, 0, 0),
                   'UpperArm_L': (-48, 0, -16), 'Forearm_L': (-78, 0, 0),
                   'UpperArm_R': (-40, 0, 16), 'Forearm_R': (-80, 0, 0)}, (0, 0, 0)),
        ], contact_frame=11),
    ]

    expected_ids = {
        'walk-left', 'walk-right', 'run-backward', 'crouch-idle',
        'crouch-walk', 'turn-left', 'turn-right', 'ledge-climb',
        'elbow-strike', 'backfist', 'knee-strike', 'shoulder-check',
        'staff-thrust', 'staff-sweep', 'staff-overhead', 'staff-parry',
        'sword-diagonal', 'dagger-stab', 'sword-lunge', 'hammer-overhead',
        'shield-bash', 'shield-block', 'shield-slam', 'shield-push',
    }
    assert len(clips) == 24, f'Animation expansion must contain 24 clips, got {len(clips)}'
    assert {item['id'] for item in clips} == expected_ids, 'Animation expansion IDs do not match the authored set'
    for item in clips:
        assert item['frames'][0][0] == 1, f"{item['id']} must start at frame 1"
        assert item['frames'][-1][0] > item['frames'][0][0], f"{item['id']} has no duration"
        if item['category'] == 'melee':
            assert item.get('contact_frame', 0) > 1, f"{item['id']} needs a non-zero contact frame"
            assert item['contact_frame'] <= item['frames'][-1][0], f"{item['id']} contact is outside the clip"
    return clips


# =============================================================================
# KINETIC POLISH OVERRIDES
# =============================================================================

KINETIC_POLISH_CLIPS = {
    'sword-slash', 'sword-overhead', 'sword-thrust', 'staff-spin',
    'jump-start', 'jump-loop', 'jump-land', 'double-jump', 'vault',
    'wall-run', 'kick-air', 'walk', 'run', 'sprint', 'walk-left',
    'walk-right', 'crouch-walk', 'turn-left', 'turn-right', 'ledge-climb',
    'elbow-strike', 'backfist', 'bow-release',
}


def _patch_authored_frame(
    definition: Dict[str, Any],
    frame_idx: int,
    updates: Dict[str, Tuple[float, float, float]],
    hips_position: Optional[Tuple[float, float, float]] = None,
) -> None:
    """Merge a small authored pose change without changing frame timing."""
    frames = definition['frames']
    for index, item in enumerate(frames):
        if item[0] != frame_idx:
            continue
        merged = dict(item[1])
        merged.update(updates)
        hips_offset = hips_position if hips_position is not None else item[2] if len(item) > 2 else (0, 0, 0)
        frames[index] = (frame_idx, merged, hips_offset)
        return

    # A new key uses the previous hips offset. This is used for the explicit
    # bow release key at frame 5.
    previous = next((item for item in reversed(frames) if item[0] < frame_idx), None)
    hips_offset = hips_position if hips_position is not None else previous[2] if previous is not None and len(previous) > 2 else (0, 0, 0)
    frames.append((frame_idx, dict(updates), hips_offset))
    frames.sort(key=lambda item: item[0])


def apply_kinetic_pose_overrides(catalog: List[Dict[str, Any]]) -> None:
    """Add authored preparation, contact, and recovery shapes for T2 clips."""
    by_id = {item['id']: item for item in catalog}
    missing = KINETIC_POLISH_CLIPS.difference(by_id)
    assert not missing, f'Kinetic polish clips are missing: {sorted(missing)}'

    def patch(clip_id: str, frame_idx: int, *, hips_position=None, **updates: Tuple[float, float, float]) -> None:
        _patch_authored_frame(by_id[clip_id], frame_idx, updates, hips_position)

    # Ground travel. The torso and head lead the step, with opposite arms and
    # legs to preserve a readable line of action at small display size.
    patch('walk', 1, Hips=(-2, 8, 0), hips_position=(0, 0, -0.018), Spine=(4, -8, 0), Chest=(-1, -5, 0),
          Head=(-3, -4, 0), UpperArm_L=(24, 0, -6), UpperArm_R=(-30, 0, 6))
    patch('walk', 8, Hips=(0, 0, 0), hips_position=(0, 0, 0.025), Spine=(2, 0, 1), Chest=(1, 0, 0),
          Head=(-1, 0, 0), Thigh_L=(-6, 0, -4), Thigh_R=(-18, 0, 4),
          Shin_L=(10, 0, 0), Shin_R=(62, 0, 0))
    patch('walk', 16, Hips=(-2, -8, 0), hips_position=(0, 0, -0.018), Spine=(4, 8, 0), Chest=(-1, 5, 0),
          Head=(-3, 4, 0), UpperArm_L=(-30, 0, -6), UpperArm_R=(24, 0, 6))
    patch('walk', 23, Hips=(0, 0, 0), hips_position=(0, 0, 0.025), Spine=(2, 0, -1), Chest=(1, 0, 0),
          Head=(-1, 0, 0), Thigh_L=(0, 0, -2), Thigh_R=(-15, 0, 4),
          Shin_R=(58, 0, 0))

    patch('run', 1, Hips=(-2, -8, 0), hips_position=(0, 0, -0.06), Spine=(20, -15, 0), Head=(-8, -8, 0))
    patch('run', 6, Hips=(1, 0, 0), hips_position=(0, 0, 0.08), Spine=(14, 2, 0), Head=(-2, 4, 0),
          Thigh_L=(34, 0, -8), Thigh_R=(-62, 0, 8))
    patch('run', 12, Hips=(2, 10, 0), hips_position=(0, 0, -0.06), Spine=(20, 15, 0), Head=(-8, 8, 0))
    patch('run', 17, Hips=(-1, 0, 0), hips_position=(0, 0, 0.08), Spine=(14, -2, 0), Head=(-2, -4, 0),
          Thigh_L=(-62, 0, -6), Thigh_R=(34, 0, 8))

    patch('sprint', 1, Hips=(-2, -14, 0), hips_position=(0, 0, -0.08), Spine=(31, -20, 0), Head=(-10, -8, 0))
    patch('sprint', 4, Hips=(2, 0, 0), hips_position=(0, 0, 0.10), Spine=(25, 2, 0), Head=(-3, 4, 0),
          Thigh_L=(46, 0, -8), Thigh_R=(-84, 0, 8))
    patch('sprint', 9, Hips=(2, 14, 0), hips_position=(0, 0, -0.08), Spine=(31, 20, 0), Head=(-10, 8, 0))
    patch('sprint', 12, Hips=(-2, 0, 0), hips_position=(0, 0, 0.10), Spine=(25, -2, 0), Head=(-3, -4, 0),
          Thigh_L=(-84, 0, -8), Thigh_R=(46, 0, 8))

    patch('walk-left', 1, Spine=(6, 0, -5), Chest=(0, 0, -5), Head=(-3, 0, -2),
          Thigh_L=(-12, 0, -22), Thigh_R=(10, 0, -1), UpperArm_L=(24, 0, -12),
          UpperArm_R=(-22, 0, 12))
    patch('walk-left', 8, Hips=(0, 0, 0), hips_position=(0, 0, 0.04), Spine=(4, 0, 6), Chest=(0, 0, 5),
          Head=(2, 0, 4), Thigh_L=(8, 0, -2), Thigh_R=(-18, 0, -22),
          Shin_R=(24, 0, 0), UpperArm_L=(-24, 0, -10), UpperArm_R=(24, 0, 10))
    patch('walk-left', 16, Spine=(6, 0, -5), Chest=(0, 0, -5), Head=(-3, 0, -2),
          Thigh_L=(-12, 0, -22), Thigh_R=(10, 0, -1), UpperArm_L=(24, 0, -12),
          UpperArm_R=(-22, 0, 12))
    patch('walk-right', 1, Spine=(6, 0, 5), Chest=(0, 0, 5), Head=(-3, 0, 2),
          Thigh_R=(-12, 0, 22), Thigh_L=(10, 0, 1), UpperArm_R=(24, 0, 12),
          UpperArm_L=(-22, 0, -12))
    patch('walk-right', 8, Hips=(0, 0, 0), hips_position=(0, 0, 0.04), Spine=(4, 0, -6), Chest=(0, 0, -5),
          Head=(2, 0, -4), Thigh_R=(8, 0, 2), Thigh_L=(-18, 0, 22),
          Shin_L=(24, 0, 0), UpperArm_R=(-24, 0, 10), UpperArm_L=(24, 0, -10))
    patch('walk-right', 16, Spine=(6, 0, 5), Chest=(0, 0, 5), Head=(-3, 0, 2),
          Thigh_R=(-12, 0, 22), Thigh_L=(10, 0, 1), UpperArm_R=(24, 0, 12),
          UpperArm_L=(-22, 0, -12))

    patch('crouch-walk', 1, Hips=(0, 0, 0), hips_position=(0, 0, -0.13), Spine=(22, -8, -6), Chest=(8, -5, -4),
          Head=(-6, -2, 0), UpperArm_L=(-12, 0, -22), UpperArm_R=(-12, 0, 22))
    patch('crouch-walk', 8, Hips=(0, 0, 0), hips_position=(0, 0, -0.06), Spine=(20, 2, 6), Chest=(8, 2, 4),
          Head=(-2, 4, 0), Thigh_L=(-18, 0, -12), Thigh_R=(-58, 0, 18),
          Shin_R=(68, 0, 0), UpperArm_L=(-24, 0, -16), UpperArm_R=(-4, 0, 16))
    patch('crouch-walk', 16, Hips=(0, 0, 0), hips_position=(0, 0, -0.13), Spine=(22, 8, 6), Chest=(8, 5, 4),
          Head=(-6, 2, 0))

    # Airborne actions use clear one-sided leg and arm shapes. The hips remain
    # in-place and the contact bake supplies only the small floor lift needed
    # for the authored silhouette.
    patch('jump-start', 1, Head=(-10, 0, 0), UpperArm_L=(32, 0, -16),
          UpperArm_R=(8, 0, 22), Thigh_L=(-42, 0, -12), Thigh_R=(-15, 0, 16))
    patch('jump-start', 4, Hips=(-1, -2, 0), hips_position=(0, 0, -0.10), Spine=(34, 0, 0), Chest=(-7, 0, 0),
          UpperArm_L=(52, 0, -14), UpperArm_R=(28, 0, 20), Thigh_L=(-60, 0, -10),
          Thigh_R=(-30, 0, 14))
    patch('jump-start', 7, Hips=(0, 4, 0), hips_position=(0, 0, -0.26), Spine=(38, 4, 0), Chest=(-4, 4, 0),
          Head=(-5, 0, 0), UpperArm_L=(64, 0, -14), UpperArm_R=(28, 0, 22),
          Thigh_L=(-70, 0, -12), Thigh_R=(-48, 0, 18))
    patch('jump-start', 12, Hips=(1, 0, 0), hips_position=(0, 0, 0.18), Spine=(-12, 0, 0), Chest=(8, 0, 0),
          Head=(6, 0, 0), Thigh_L=(18, 0, -12), Shin_L=(28, 0, 0),
          Thigh_R=(-24, 0, 14), Shin_R=(34, 0, 0))

    patch('jump-loop', 1, Hips=(0, 0, 0), hips_position=(0, 0, 0.18), Spine=(-12, -8, 0), Chest=(5, -4, 0),
          Head=(8, 4, 0), Thigh_L=(-42, 0, -18), Shin_L=(68, 0, 0), Foot_L=(-14, 0, 0),
          Thigh_R=(-12, 0, 12), Shin_R=(24, 0, 0), Foot_R=(10, 0, 0),
          UpperArm_L=(-64, 0, -30), Forearm_L=(-24, 0, 0), UpperArm_R=(-36, 0, 24),
          Forearm_R=(-10, 0, 0))
    patch('jump-loop', 9, Hips=(0, 0, 0), hips_position=(0, 0, 0.22), Spine=(-2, 6, 0), Chest=(8, 4, 0),
          Head=(4, -4, 0), Thigh_L=(-20, 0, -14), Shin_L=(54, 0, 0),
          Thigh_R=(-42, 0, 16), Shin_R=(68, 0, 0), UpperArm_L=(-58, 0, -24),
          Forearm_L=(-34, 0, 0), UpperArm_R=(-48, 0, 28), Forearm_R=(-22, 0, 0))
    patch('jump-loop', 18, Hips=(0, 0, 0), hips_position=(0, 0, 0.18), Spine=(-12, -8, 0), Chest=(5, -4, 0),
          Head=(8, 4, 0), Thigh_L=(-42, 0, -18), Shin_L=(68, 0, 0), Foot_L=(-14, 0, 0),
          Thigh_R=(-12, 0, 12), Shin_R=(24, 0, 0), Foot_R=(10, 0, 0),
          UpperArm_L=(-64, 0, -30), Forearm_L=(-24, 0, 0), UpperArm_R=(-36, 0, 24),
          Forearm_R=(-10, 0, 0))

    patch('jump-land', 1, Head=(-6, 0, 0), UpperArm_L=(-18, 0, -24), UpperArm_R=(4, 0, 18))
    patch('jump-land', 5, Hips=(-3, -4, 0), hips_position=(0, 0, -0.20), Spine=(27, -10, 0), Chest=(-6, -7, 0),
          Head=(-8, 0, 0), Thigh_L=(-64, 0, -18), Thigh_R=(-34, 0, 18),
          UpperArm_L=(-38, 0, -30), UpperArm_R=(-10, 0, 28))
    patch('jump-land', 8, Hips=(-2, -2, 0), hips_position=(0, 0, -0.27), Spine=(34, -4, 0), Chest=(-6, -3, 0),
          Head=(-10, 0, 0), Thigh_L=(-76, 0, -18), Thigh_R=(-48, 0, 20),
          UpperArm_L=(-42, 0, -32), UpperArm_R=(-14, 0, 30))
    patch('jump-land', 15, Head=(-1, 0, 0), UpperArm_L=(8, 0, -12), UpperArm_R=(4, 0, 14))

    patch('double-jump', 1, Head=(-4, 0, 0), Thigh_L=(-30, 0, -12), Thigh_R=(-12, 0, 14),
          Shin_L=(42, 0, 0), Shin_R=(22, 0, 0))
    patch('double-jump', 6, Spine=(38, 0, 0), Chest=(-4, 0, 0), Head=(-10, 0, 0),
          Thigh_L=(-84, 0, -18), Shin_L=(105, 0, 0), Thigh_R=(-58, 0, 20),
          Shin_R=(70, 0, 0), UpperArm_L=(40, 0, -18), Forearm_L=(-62, 0, 0),
          UpperArm_R=(10, 0, 28), Forearm_R=(-90, 0, 0))
    patch('double-jump', 14, Spine=(-22, 0, 0), Chest=(6, 0, 0), Head=(8, 0, 0),
          Thigh_L=(-24, 0, -20), Shin_L=(72, 0, 0), Thigh_R=(4, 0, 18), Shin_R=(20, 0, 0),
          UpperArm_L=(-105, 0, -26), Forearm_L=(-8, 0, 0), UpperArm_R=(-70, 0, 30),
          Forearm_R=(-22, 0, 0))
    patch('double-jump', 20, Thigh_L=(-14, 0, -6), Thigh_R=(-6, 0, 12), Head=(0, 0, 0))

    patch('vault', 1, Head=(-6, 0, 0), UpperArm_L=(-55, 0, -18), Forearm_L=(-8, 0, 0),
          UpperArm_R=(-72, 0, 24), Forearm_R=(-18, 0, 0))
    patch('vault', 6, Hips=(0, 0, 0), hips_position=(0, 0, 0.23), Spine=(39, 0, 0), Chest=(-7, 0, 0), Head=(-10, 0, 0),
          UpperArm_L=(-96, 0, -10), Forearm_L=(-6, 0, 0), UpperArm_R=(-64, 0, 22),
          Forearm_R=(-28, 0, 0), Thigh_L=(-78, 0, -22), Shin_L=(96, 0, 0),
          Thigh_R=(-44, 0, 26), Shin_R=(70, 0, 0))
    patch('vault', 14, Spine=(-12, 0, 0), Head=(5, 0, 0), Thigh_L=(-18, 0, -16),
          Shin_L=(52, 0, 0), Thigh_R=(-32, 0, 20), Shin_R=(34, 0, 0),
          UpperArm_L=(-40, 0, -16), UpperArm_R=(-28, 0, 28))

    patch('wall-run', 1, Hips=(0, 0, 24), Spine=(18, 0, -14), Head=(-5, 0, 22),
          Thigh_L=(-60, 0, 18), Shin_L=(30, 0, 0), Thigh_R=(28, 0, -8), Shin_R=(82, 0, 0),
          UpperArm_L=(-48, 0, 18), Forearm_L=(-72, 0, 0), UpperArm_R=(24, 0, 12),
          Forearm_R=(-52, 0, 0))
    patch('wall-run', 10, Head=(-5, 0, -22), Thigh_R=(-60, 0, -18), Shin_R=(30, 0, 0),
          Thigh_L=(28, 0, 8), Shin_L=(82, 0, 0), UpperArm_R=(-48, 0, -18),
          Forearm_R=(-72, 0, 0), UpperArm_L=(24, 0, -12), Forearm_L=(-52, 0, 0))
    patch('wall-run', 20, Hips=(0, 0, 24), Spine=(18, 0, -14), Head=(-5, 0, 22),
          Thigh_L=(-60, 0, 18), Shin_L=(30, 0, 0), Thigh_R=(28, 0, -8), Shin_R=(82, 0, 0),
          UpperArm_L=(-48, 0, 18), Forearm_L=(-72, 0, 0), UpperArm_R=(24, 0, 12),
          Forearm_R=(-52, 0, 0))

    patch('kick-air', 1, Spine=(10, -8, 0), Head=(-4, 0, -8), UpperArm_L=(-38, 0, -18),
          UpperArm_R=(-12, 0, 30), Thigh_L=(-48, 0, -14), Thigh_R=(-28, 0, 14))
    patch('kick-air', 6, Spine=(18, -4, 0), Chest=(4, -2, 0), Head=(-8, 0, -12),
          UpperArm_L=(-58, 0, -28), Forearm_L=(-20, 0, 0), UpperArm_R=(-24, 0, 38),
          Forearm_R=(-92, 0, 0), Thigh_L=(-58, 0, -16), Thigh_R=(-60, 0, 16))
    patch('kick-air', 12, Hips=(0, 0, 0), hips_position=(0, 0, 0.22), Spine=(-24, 0, 0), Chest=(5, 0, 0),
          Head=(-8, 0, 0), Thigh_R=(-96, 0, 0), Shin_R=(-4, 0, 0), Foot_R=(20, 0, 0),
          Thigh_L=(-30, 0, -18), Shin_L=(60, 0, 0), UpperArm_L=(-70, 0, -25),
          Forearm_L=(-20, 0, 0), UpperArm_R=(-30, 0, 35), Forearm_R=(-100, 0, 0))
    patch('kick-air', 17, Spine=(-12, 0, 0), Head=(2, 0, 0), Thigh_R=(-45, 0, 0),
          Shin_R=(55, 0, 0), UpperArm_L=(-30, 0, -15), UpperArm_R=(-18, 0, 22))
    by_id['kick-air']['contact_frame'] = 12

    # Turns keep the shoulders and feet behind the hips during the snap.
    patch('turn-left', 6, Head=(0, -28, 0), Foot_L=(0, 0, -16), Foot_R=(0, 0, 8))
    patch('turn-left', 10, Head=(0, -42, 0), Foot_L=(0, 0, -24), Foot_R=(0, 0, 12))
    patch('turn-left', 14, Head=(0, -30, 0), Foot_L=(0, 0, -18), Foot_R=(0, 0, 8))
    patch('turn-left', 18, Head=(0, 0, 0), Foot_L=(0, 0, 0), Foot_R=(0, 0, 0))
    patch('turn-right', 6, Head=(0, 28, 0), Foot_R=(0, 0, 16), Foot_L=(0, 0, -8))
    patch('turn-right', 10, Head=(0, 42, 0), Foot_R=(0, 0, 24), Foot_L=(0, 0, -12))
    patch('turn-right', 14, Head=(0, 30, 0), Foot_R=(0, 0, 18), Foot_L=(0, 0, -8))
    patch('turn-right', 18, Head=(0, 0, 0), Foot_R=(0, 0, 0), Foot_L=(0, 0, 0))

    patch('ledge-climb', 1, Head=(-12, 0, -5), UpperArm_L=(-138, 0, -30), Forearm_L=(-12, 0, -4),
          UpperArm_R=(-112, 0, 18), Forearm_R=(-48, 0, 0), Thigh_L=(-52, 0, -18),
          Shin_L=(88, 0, 0), Thigh_R=(-35, 0, 14), Shin_R=(58, 0, 0))
    patch('ledge-climb', 5, Hips=(0, -14, 0), hips_position=(0, 0, 0.25), Spine=(-24, -10, 0), Chest=(-8, -8, 0),
          Head=(6, 0, 0), UpperArm_L=(-96, 0, -20), Forearm_L=(-8, 0, -4),
          UpperArm_R=(-125, 0, 12), Forearm_R=(-8, 0, 0), Thigh_L=(-84, 0, -18),
          Shin_L=(100, 0, 0), Thigh_R=(-50, 0, 16), Shin_R=(72, 0, 0))
    patch('ledge-climb', 10, Hips=(0, -18, 0), hips_position=(0, 0, 0.20), Spine=(-38, -10, 0), Chest=(-14, -8, 0),
          Head=(8, 0, 0), UpperArm_L=(-68, 0, -26), Forearm_L=(-12, 0, -4),
          UpperArm_R=(-100, 0, 24), Forearm_R=(-32, 0, 0), Thigh_L=(-86, 0, -20),
          Shin_L=(104, 0, 0), Thigh_R=(-46, 0, 18), Shin_R=(70, 0, 0))
    patch('ledge-climb', 15, Hips=(0, 10, 0), hips_position=(0, 0, 0.10), Spine=(30, 6, 0), Chest=(12, 4, 0),
          Head=(-5, 0, 0), UpperArm_L=(-42, 0, -20), Forearm_L=(-32, 0, 0),
          UpperArm_R=(-68, 0, 16), Forearm_R=(-22, 0, 0), Thigh_L=(-24, 0, -12),
          Shin_L=(46, 0, 0), Thigh_R=(-12, 0, 14), Shin_R=(34, 0, 0))

    # Unarmed strikes. The neck and head counter-rotate so the shoulder and
    # contact hand create a compact, asymmetric silhouette.
    # The light punch loads the pelvis, then carries the shoulder over the
    # planted leg. The root stays fixed while the hips and legs show transfer.
    patch('punch-right', 4, Hips=(-8, -20, -4), Spine=(19, -28, 0), Chest=(-5, -14, 0),
          Thigh_L=(8, 0, -12), Shin_L=(22, 0, 0), Thigh_R=(-22, 0, 12), Shin_R=(28, 0, 0))
    patch('punch-right', 9, Hips=(-10, 12, -8), Spine=(28, 10, 0), Chest=(10, 7, 0),
          Thigh_L=(-8, 0, -14), Shin_L=(30, 0, 0), Thigh_R=(-24, 0, 14), Shin_R=(28, 0, 0))
    patch('punch-right', 13, Hips=(-4, 6, -4), Spine=(12, 6, 0), Chest=(5, 4, 0),
          Thigh_L=(-4, 0, -10), Shin_L=(24, 0, 0), Thigh_R=(-12, 0, 12), Shin_R=(20, 0, 0))

    # Mirror the same load and follow-through for the left cross. The left
    # strike keeps its authored hand reach while the pelvis and feet transfer
    # weight in the opposite direction.
    patch('punch-left', 3, Hips=(-8, 20, 4), Spine=(19, 28, 0), Chest=(-5, 14, 0),
          Thigh_L=(-22, 0, -12), Shin_L=(28, 0, 0), Thigh_R=(-8, 0, 14), Shin_R=(30, 0, 0))
    patch('punch-left', 8, Hips=(-10, -12, 8), Spine=(28, -10, 0), Chest=(10, -7, 0),
          Thigh_L=(-24, 0, -14), Shin_L=(28, 0, 0), Thigh_R=(-8, 0, 14), Shin_R=(30, 0, 0))
    patch('punch-left', 12, Hips=(-4, -6, 4), Spine=(12, -8, 0), Chest=(5, -4, 0),
          Thigh_L=(-12, 0, -10), Shin_L=(22, 0, 0), Thigh_R=(-4, 0, 12), Shin_R=(20, 0, 0))

    # Counter the contact lean in the punch arms. The striking hand stays at
    # chest height while the other hand keeps a bent guard near the jaw.
    patch('punch-left', 8, UpperArm_L=(-108, 0, 5), Forearm_L=(-24, 0, 0), Hand_L=(-6, 0, 0),
          UpperArm_R=(-70, 0, -18), Forearm_R=(-105, 0, 0))
    patch('punch-left', 9, UpperArm_L=(-106, 0, 5), Forearm_L=(-24, 0, 0), Hand_L=(-6, 0, 0),
          UpperArm_R=(-70, 0, -18), Forearm_R=(-105, 0, 0))
    patch('punch-right', 9, UpperArm_R=(-108, 0, -5), Forearm_R=(-24, 0, 0), Hand_R=(-6, 0, 0),
          UpperArm_L=(-70, 0, 20), Forearm_L=(-105, 0, 0))
    patch('punch-right', 10, UpperArm_R=(-106, 0, -5), Forearm_R=(-24, 0, 0), Hand_R=(-6, 0, 0),
          UpperArm_L=(-70, 0, 20), Forearm_L=(-105, 0, 0))

    # The heavy punch uses a deeper hip turn and a longer rear-leg line.
    patch('punch-heavy', 5, Hips=(-10, 28, -6), Spine=(-22, 42, 0), Chest=(-10, 24, 0),
          Thigh_L=(-32, 0, -20), Shin_L=(40, 0, 0), Thigh_R=(24, 0, 18), Shin_R=(24, 0, 0))
    patch('punch-heavy', 12, Hips=(-12, -30, -10), Spine=(44, 42, 0), Chest=(12, 16, 0),
          Thigh_L=(-38, 0, -20), Shin_L=(44, 0, 0), Thigh_R=(30, 0, 20), Shin_R=(26, 0, 0))
    patch('punch-heavy', 13, Hips=(-10, -28, -8), Spine=(40, 38, 0), Chest=(10, 14, 0),
          Thigh_L=(-36, 0, -18), Shin_L=(42, 0, 0), Thigh_R=(28, 0, 18), Shin_R=(24, 0, 0))
    patch('punch-heavy', 12, UpperArm_R=(-120, 0, -8), Forearm_R=(-40, 0, 0), Hand_R=(-7, 0, 0),
          UpperArm_L=(-70, 0, 22), Forearm_L=(-120, 0, 0))
    patch('punch-heavy', 13, UpperArm_R=(-118, 0, -8), Forearm_R=(-40, 0, 0), Hand_R=(-7, 0, 0),
          UpperArm_L=(-70, 0, 22), Forearm_L=(-120, 0, 0))

    # The front kick chambers over a bent support leg and drives the chest
    # back from the planted hip. The kick foot keeps its authored target.
    patch('kick-front', 4, Hips=(-8, -16, -4), Spine=(20, -22, 0), Chest=(-6, -14, 0),
          Thigh_L=(-30, 0, -18), Shin_L=(36, 0, 0), Foot_L=(-10, 0, 0))
    patch('kick-front', 9, Hips=(-12, -14, -8), Spine=(-28, -18, 0), Chest=(8, -12, 0),
          Thigh_L=(-34, 0, -18), Shin_L=(38, 0, 0), Foot_L=(-10, 0, 0))
    patch('kick-front', 14, Hips=(-4, -5, -4), Spine=(-12, -6, 0), Chest=(5, -3, 0),
          Thigh_L=(-18, 0, -12), Shin_L=(26, 0, 0), Foot_L=(-8, 0, 0))

    # The roundhouse rotates from the pelvis before the leg opens. The support
    # leg stays wide through contact and returns during the recovery.
    patch('kick-roundhouse', 5, Hips=(-8, -30, -6), Spine=(-10, -24, 0), Chest=(4, -12, 0),
          Thigh_L=(8, -62, -12), Shin_L=(26, 0, 0), Thigh_R=(-64, 0, 0), Shin_R=(92, 0, 0))
    patch('kick-roundhouse', 12, Hips=(-12, 32, -10), Spine=(-38, -24, 0), Chest=(8, -14, 0),
          Thigh_L=(10, -34, -16), Shin_L=(30, 0, 0), Foot_L=(-10, 0, 0))
    patch('kick-roundhouse', 17, Hips=(-6, 38, -6), Spine=(-12, -20, 0), Chest=(4, -10, 0),
          Thigh_L=(2, -46, -8), Shin_L=(24, 0, 0), Thigh_R=(-54, 0, 0), Shin_R=(64, 0, 0))

    patch('elbow-strike', 7, UpperArm_R=(-6, 0, -76), UpperArm_L=(-52, 0, 18),
          Head=(-5, 0, -10), Hips=(-8, -14, -4), Spine=(22, -16, 0), Chest=(9, -9, 0),
          Thigh_L=(-26, 0, -16), Shin_L=(32, 0, 0), Thigh_R=(18, 0, 16), Shin_R=(18, 0, 0))
    patch('elbow-strike', 9, Neck=(8, 0, -12), Head=(-8, 0, -16), UpperArm_R=(-6, 0, -80),
          Forearm_R=(-6, 0, 0), Hand_R=(-8, 0, 0), Hips=(-10, -12, -8), Spine=(28, -12, 0), Chest=(12, -8, 0),
          Thigh_L=(-28, 0, -16), Shin_L=(34, 0, 0), Thigh_R=(20, 0, 16), Shin_R=(20, 0, 0))
    patch('elbow-strike', 14, Hips=(-4, 2, -4), Spine=(8, 4, 0), Chest=(4, 2, 0),
          Thigh_L=(-16, 0, -12), Shin_L=(24, 0, 0), Thigh_R=(12, 0, 12), Shin_R=(16, 0, 0))
    patch('backfist', 7, UpperArm_R=(-64, 0, -42), UpperArm_L=(-46, 0, 20), Head=(-4, 0, -10))
    patch('backfist', 9, Neck=(6, 0, -14), Head=(-6, 0, -18), UpperArm_R=(-74, 0, -18),
          Forearm_R=(-10, 0, 0), Hand_R=(-8, 0, 0), UpperArm_L=(-40, 0, 20), Forearm_L=(-88, 0, 0))

    # The weapon hand rotations are authored against the mounted local axes.
    # These values preserve the tested forward staff and sword directions.
    patch('sword-slash', 5, Hand_R=(58, 18, -35))
    patch('sword-slash', 9, Hand_R=(12, -18, -35))
    patch('sword-slash', 12, Hand_R=(-26.394, -36.997, -31.573), Hand_L=(-50, 0, -30))
    patch('sword-slash', 13, Hand_R=(-26.394, -36.997, -31.573), Hand_L=(-50, 0, -30))
    patch('sword-slash', 17, Hand_R=(-4, -8, -20))
    patch('sword-overhead', 7, Hand_R=(65, 0, -12))
    patch('sword-overhead', 11, Hand_R=(38, 0, -28))
    # The exported sword mount uses the Blender ZYX hand order.  This pose
    # sends the blade forward and slightly down at contact.
    patch('sword-overhead', 14, Hand_R=(-92.081, 1.386, 166.612))
    patch('sword-overhead', 15, Hand_R=(-92.081, 1.386, 166.612))
    patch('sword-overhead', 19, Hand_R=(2, 0, -8))
    patch('sword-thrust', 5, Hand_R=(18, 0, 24))
    patch('sword-thrust', 8, Hand_R=(-18, 0, 6))
    patch('sword-thrust', 11, Hand_R=(-22.006, 0.983, -11.749), Hand_L=(-48, 0, -12))
    patch('sword-thrust', 12, Hand_R=(-22.006, 0.983, -11.749))
    patch('sword-thrust', 16, Hand_R=(-12, 0, 0))
    patch('staff-spin', 1, Hand_R=(82.85, 6.16, -20.372))
    patch('staff-spin', 6, Hand_R=(-12.723, -156.345, -55.053))
    patch('staff-spin', 12, Hand_R=(80.741, 35.071, -55.323))
    patch('staff-spin', 18, Hand_R=(91.068, -28.991, -90.996))
    patch('staff-spin', 24, Hand_R=(82.85, 6.16, -20.372))

    # The release is a discrete frame between the drawn string and recovery.
    # The explicit key keeps the contact event visible in exported samplers.
    _patch_authored_frame(by_id['bow-release'], 5, {
        'Spine': (0, -48, 0), 'Chest': (2, -2, 0),
        'UpperArm_L': (-88, 0, -42), 'Forearm_L': (-8, 0, 0),
        'UpperArm_R': (-20, 0, 52), 'Forearm_R': (-18, 0, 0), 'Hand_R': (0, 0, 0),
    })
    by_id['bow-release']['contact_frame'] = 5

    assert by_id['kick-air']['contact_frame'] == 12
    assert any(frame[0] == 5 for frame in by_id['bow-release']['frames'])


def apply_stick_motion_contract(catalog: List[Dict[str, Any]]) -> None:
    """Define clear poses, action phases, and foot plants in one place."""
    by_id = {item['id']: item for item in catalog}

    def replace(clip_id, frames, plants=(), phases=()):
        definition = by_id[clip_id]
        definition['frames'] = frames
        definition['motion'] = {
            'coordinateSystem': 'Blender Z-up, forward -Y',
            'plants': [dict(side=side, startFrame=start, endFrame=end, velocity=[0, 0, 0])
                       for side, start, end in plants],
            'phases': [dict(name=name, frame=frame) for name, frame in phases],
        }

    idle = {
        'Hips': (0, -8, -2), 'Spine': (6, 4, 4), 'Chest': (-4, -2, -2),
        'Neck': (0, 0, 0), 'Head': (-2, 0, 0),
        'UpperArm_L': (12, 0, -20), 'Forearm_L': (-24, 0, -4),
        'UpperArm_R': (-24, 0, 20), 'Forearm_R': (-46, 0, 4),
        'Thigh_L': (10, 0, -9), 'Shin_L': (12, 0, 0), 'Foot_L': (0, 0, 0),
        'Thigh_R': (-14, 0, 8), 'Shin_R': (22, 0, 0), 'Foot_R': (0, 0, 0),
    }
    replace('idle', [
        (1, idle, (0, 0, -.045)),
        (30, {**idle, 'Spine': (8, 4, 4), 'Chest': (-5, -2, -2), 'Head': (-3, 0, 0),
              'UpperArm_R': (-26, 0, 21)}, (0, -.008, -.055)),
        (60, idle, (0, 0, -.045)),
    ], [('L', 1, 60), ('R', 1, 60)])

    guard = {
        **idle, 'Hips': (4, -8, 0), 'Spine': (16, 4, -4), 'Chest': (-8, 0, 3), 'Head': (-10, 0, 0),
        'UpperArm_L': (-66, 0, -24), 'Forearm_L': (-82, 0, -6),
        'UpperArm_R': (-42, 0, 28), 'Forearm_R': (-116, 0, 4),
        'Thigh_L': (20, 0, -14), 'Shin_L': (24, 0, 0),
        'Thigh_R': (-30, 0, 14), 'Shin_R': (38, 0, 0),
    }
    block_guard = {
        **guard, 'Hips': (2, -8, 0), 'Spine': (10, 4, -4), 'Chest': (-4, 0, 3), 'Head': (-6, 0, 0),
        'Thigh_L': (4, 0, -10), 'Shin_L': (16, 0, 0),
        'Thigh_R': (-24, 0, 10), 'Shin_R': (26, 0, 0),
    }
    replace('block', [
        (1, block_guard, (0, 0, -.06)),
        (15, {**block_guard, 'Spine': (11, 4, -4), 'Head': (-7, 0, 0)}, (0, -.004, -.068)),
        (30, block_guard, (0, 0, -.06)),
    ], [('L', 1, 30), ('R', 1, 30)])

    for clip_id, side, contact, end, heavy in [
        ('punch-left', 'L', 8, 16, False), ('punch-right', 'R', 9, 18, False),
        ('punch-heavy', 'R', 12, 24, True),
    ]:
        other = 'R' if side == 'L' else 'L'
        sign = -1 if side == 'L' else 1
        ready = {**guard, 'Hips': (4, -8 * sign, 0)}
        load = {
            **ready, 'Hips': (-2, 14 * sign, 0), 'Spine': (-6, 12 * sign, -4 * sign),
            'Chest': (3, 8 * sign, 4 * sign), 'Head': (4, -4 * sign, 0),
            f'UpperArm_{side}': (28, 0, 22 * sign), f'Forearm_{side}': (-108, 0, 0),
            f'UpperArm_{other}': (-55, 0, -24 * sign), f'Forearm_{other}': (-92, 0, 0),
        }
        hit = {
            **ready, 'Hips': (4 if heavy else 3, -12 * sign, 0),
            'Spine': (18 if heavy else 12, -8 * sign, -5 * sign),
            'Chest': (-6 if heavy else -5, 4 * sign, 3 * sign),
            'Head': (-8, 6 * sign, 0),
            f'UpperArm_{side}': (-104 if heavy else -98, 0, -4 * sign),
            f'Forearm_{side}': (-3, 0, 0), f'Hand_{side}': (0, 0, 0),
            f'UpperArm_{other}': (-45, 0, -28 * sign), f'Forearm_{other}': (-116, 0, 0),
        }
        through = {**hit, 'Hips': (2, -12 * sign, 0), 'Spine': (8, 12 * sign, -3 * sign), 'Head': (-4, 0, 0),
                   f'UpperArm_{side}': (-86, 0, -12 * sign), f'Forearm_{side}': (-18, 0, 0)}
        load_frame = contact - 3
        low = -.19 if heavy else -.14
        shift = -.16 if heavy else -.10
        replace(clip_id, [
            (1, ready, (0, 0, -.11)),
            (load_frame, load, (0, .065, low)),
            (contact, hit, (0, shift, -.12)),
            (contact + 2, hit, (0, shift, -.12)),
            (contact + 4, through, (0, shift * .75, -.14)),
            (end, ready, (0, 0, -.11)),
        ], [('L', 1, end), ('R', 1, end)] if heavy else [(other, 1, end)], [('ready', 1), ('load', load_frame), ('contact', contact),
                               ('hold', contact + 2), ('follow', contact + 4), ('settle', end)])

    for clip_id, contact, end in [('kick-front', 9, 20), ('kick-roundhouse', 12, 24)]:
        roundhouse = clip_id == 'kick-roundhouse'
        ready = {**guard, 'Hips': (0, -8, 0), 'Thigh_L': (-4, 0, -10), 'Shin_L': (12, 0, 0)}
        load = {**ready, 'Hips': (-6, -22 if roundhouse else -8, 0), 'Spine': (20, -10, 0),
                'Chest': (-8, 0, 0), 'Head': (-8, 0, 0),
                'Thigh_R': (-70, 0, 10), 'Shin_R': (112, 0, 0),
                'UpperArm_L': (-48, 0, -32), 'Forearm_L': (-92, 0, 0),
                'UpperArm_R': (16, 0, 30), 'Forearm_R': (-46, 0, 0)}
        hit = {**ready, 'Hips': (-4, 22 if roundhouse else -4, 0),
               'Spine': (-14, -14 if roundhouse else 0, 0), 'Chest': (6, 0, 0), 'Head': (5, 0, -6),
               'Thigh_R': (-99, -8 if roundhouse else 0, 3), 'Shin_R': (3, 0, 0), 'Foot_R': (12, 0, 0),
               'UpperArm_L': (-55, 0, -28), 'Forearm_L': (-102, 0, 0),
               'UpperArm_R': (32, 0, 35), 'Forearm_R': (-35, 0, 0)}
        retract = {**load, 'Hips': (-2, -8, 0), 'Spine': (-6, 0, 0), 'Chest': (3, 0, 0), 'Thigh_R': (-64, 0, 12), 'Shin_R': (90, 0, 0)}
        replace(clip_id, [(1, ready, (0, 0, -.10)), (contact - 3, load, (0, .025, -.17)),
                         (contact, hit, (0, -.055, -.13)), (contact + 2, hit, (0, -.055, -.13)),
                         (contact + 5, retract, (0, -.02, -.15)), (end, ready, (0, 0, -.10))],
                [('L', 1, end)], [('ready', 1), ('load', contact - 3), ('contact', contact),
                                 ('hold', contact + 2), ('follow', contact + 5), ('settle', end)])

    upper_load = {**guard, 'Hips': (4, 18, 0), 'Spine': (16, 12, 0), 'Chest': (-8, 0, 0),
                  'UpperArm_R': (18, 0, 24), 'Forearm_R': (-90, 0, 0), 'Head': (-10, 0, 0)}
    upper_hit = {**guard, 'Hips': (0, -12, 0), 'Spine': (-18, -12, 0), 'Chest': (10, 0, 0),
                 'UpperArm_R': (-116, 0, 12), 'Forearm_R': (-38, 0, 0), 'Head': (4, 0, 0),
                 'UpperArm_L': (-44, 0, -30), 'Forearm_L': (-112, 0, 0)}
    replace('uppercut', [(1, guard, (0, 0, -.11)), (8, upper_load, (0, .03, -.25)),
                        (11, upper_hit, (0, -.07, -.07)), (13, upper_hit, (0, -.07, -.07)),
                        (16, {**guard, 'UpperArm_R': (-98, 0, 20)}, (0, -.04, -.10)),
                        (20, guard, (0, 0, -.11))], [('L', 1, 20), ('R', 1, 20)],
            [('load', 8), ('contact', 11), ('hold', 13), ('settle', 20)])
    sweep_load = {**guard, 'Hips': (0, -24, 0), 'Spine': (38, -16, 0), 'Chest': (-18, 0, 0),
                  'Thigh_L': (-84, 0, -18), 'Shin_L': (132, 0, 0),
                  'Thigh_R': (-38, 0, 26), 'Shin_R': (76, 0, 0),
                  'UpperArm_L': (24, 0, -36), 'Forearm_L': (-22, 0, 0)}
    sweep_hit = {**sweep_load, 'Hips': (0, 14, 0), 'Spine': (32, -12, 0), 'Head': (-10, 0, 0),
                 'Thigh_R': (-77, 0, 12), 'Shin_R': (5, 0, 0), 'Foot_R': (5, 0, 0),
                 'UpperArm_R': (-40, 0, 36), 'Forearm_R': (-96, 0, 0)}
    replace('sweep', [(1, guard, (0, 0, -.11)), (9, sweep_load, (0, 0, -.48)),
                     (13, sweep_hit, (0, -.04, -.51)), (15, sweep_hit, (0, -.04, -.51)),
                     (19, sweep_load, (0, 0, -.40)), (24, guard, (0, 0, -.11))], [('L', 1, 24)],
            [('load', 9), ('contact', 13), ('hold', 15), ('settle', 24)])
    by_id['sweep']['contact_frame'] = 13

    for clip_id, contact, end in [('sword-slash', 12, 22), ('sword-overhead', 14, 24), ('sword-thrust', 11, 20)]:
        overhead = clip_id == 'sword-overhead'
        thrust = clip_id == 'sword-thrust'
        ready = {**guard, 'Hand_R': (0, 0, 0), 'Hand_L': (0, 0, 0)}
        load = {**ready, 'Hips': (-6, 18, 0), 'Spine': (-18, 12, 0), 'Chest': (8, 0, 0), 'Head': (10, -6, 0),
                'UpperArm_R': (-154, 0, 18), 'Forearm_R': (-34, 0, 0),
                'UpperArm_L': (-138 if overhead else -42, 0, -24), 'Forearm_L': (-48 if overhead else -104, 0, 0)}
        if thrust:
            load.update(UpperArm_R=(20, 0, 22), Forearm_R=(-102, 0, 0))
        hit = {**ready, 'Hips': (8, -10, 0), 'Spine': (30 if overhead else 26, -10, 0),
               'Chest': (-12 if overhead else -8, 4, 0), 'Head': (-12, 4, 0),
               'UpperArm_R': (-92 if overhead else -111, 0, 4), 'Forearm_R': (-6, 0, 0),
               'Hand_R': (24 if overhead else 35 if thrust else 12, 0, 0),
               'UpperArm_L': (-92 if overhead else -34, 0, -22),
               'Forearm_L': (-16 if overhead else -108, 0, 0)}
        follow = {**hit, 'Spine': (24, -14, 0), 'UpperArm_R': (-72, 0, -18), 'Forearm_R': (-24, 0, 0), 'Hand_R': (10, 0, 0)}
        replace(clip_id, [(1, ready, (0, 0, -.12)), (contact - 3, load, (0, .055, -.17)),
                         (contact, hit, (0, -.12, -.15)), (contact + 2, hit, (0, -.12, -.15)),
                         (contact + 5, follow, (0, -.08, -.15)), (end, ready, (0, 0, -.12))],
                [('L', 1, end), ('R', 1, end)] if overhead else [('L', 1, end)], [('ready', 1), ('load', contact - 3), ('contact', contact),
                                 ('hold', contact + 2), ('follow', contact + 5), ('settle', end)])

    bow_ready = {**guard, 'Hips': (0, -8, 0), 'Spine': (4, -8, 0), 'Chest': (-2, 0, 0), 'Head': (-2, 8, 0),
                 'UpperArm_L': (-94, 0, -8), 'Forearm_L': (-4, 0, 0), 'Hand_L': (0, 0, 0),
                 'UpperArm_R': (-64, 0, 48), 'Forearm_R': (-94, 0, 0), 'Hand_R': (0, 0, 0)}
    bow_drawn = {**bow_ready, 'UpperArm_R': (125, 0, 25), 'Forearm_R': (-205, 0, 0)}
    replace('bow-draw', [(1, bow_ready, (0, 0, -.08)),
                         (7, {**bow_ready, 'UpperArm_R': (24, 0, 38), 'Forearm_R': (-140, 0, 0)}, (0, .01, -.09)),
                         (12, bow_drawn, (0, .015, -.09)),
                         (24, bow_drawn, (0, .015, -.09))], [('L', 1, 24), ('R', 1, 24)])
    replace('bow-release', [(1, bow_drawn, (0, .015, -.09)), (4, bow_drawn, (0, .015, -.09)),
                            (5, {**bow_drawn, 'UpperArm_R': (135, 0, 30), 'Forearm_R': (-185, 0, 0)}, (0, .02, -.09)),
                            (8, {**bow_drawn, 'UpperArm_R': (125, 0, 34), 'Forearm_R': (-165, 0, 0)}, (0, .015, -.09)),
                            (15, bow_ready, (0, 0, -.08))], [('L', 1, 15), ('R', 1, 15)],
            [('draw', 4), ('contact', 5), ('settle', 15)])

    stunned = {**guard, 'Hips': (8, 0, -6), 'Spine': (30, 0, 14), 'Chest': (-12, 0, -5),
               'Head': (18, 8, 10), 'UpperArm_L': (-12, 0, -34), 'Forearm_L': (-24, 0, 0),
               'UpperArm_R': (-118, 0, 26), 'Forearm_R': (-58, 0, 0)}
    replace('stun', [(1, stunned, (-.035, 0, -.14)),
                     (12, {**stunned, 'Hips': (2, 0, 8), 'Spine': (18, 0, -20),
                           'Chest': (6, 0, 8), 'Head': (30, -10, -14)}, (.05, -.025, -.18)),
                     (24, {**stunned, 'Hips': (12, 0, -10), 'Spine': (36, 0, 18),
                           'Head': (8, 12, 18), 'UpperArm_L': (10, 0, -42)}, (-.065, .015, -.16)),
                     (36, stunned, (-.035, 0, -.14))], [('L', 1, 36), ('R', 1, 36)],
            [('dazed', 1), ('sway', 12), ('sway-back', 24), ('loop', 36)])

    pickup_low = {**guard, 'Hips': (55, 0, 0), 'Spine': (40, 0, -5), 'Chest': (-5, 0, 3), 'Head': (-20, 0, 0),
                  'Thigh_L': (-88, 0, -20), 'Shin_L': (130, 0, 0),
                  'Thigh_R': (-70, 0, 22), 'Shin_R': (122, 0, 0),
                  'UpperArm_R': (-88, 0, 6), 'Forearm_R': (-4, 0, 0), 'Hand_R': (0, 0, 0),
                  'UpperArm_L': (24, 0, -30), 'Forearm_L': (-42, 0, 0)}
    pickup_lift = {**guard, 'Hips': (12, 0, 0), 'Spine': (28, 0, 0), 'Chest': (-10, 0, 0),
                   'UpperArm_R': (-44, 0, 8), 'Forearm_R': (-70, 0, 0),
                   'UpperArm_L': (10, 0, -26), 'Forearm_L': (-35, 0, 0)}
    replace('pickup', [(1, idle, (0, 0, -.045)), (10, {**pickup_low, 'Spine': (34, 0, -5)}, (0, -.025, -.42)),
                       (16, pickup_low, (0, -.08, -.62)), (19, pickup_low, (0, -.08, -.62)),
                       (28, pickup_lift, (0, -.035, -.22)), (36, idle, (0, 0, -.045))],
            [('L', 1, 36), ('R', 1, 36)], [('ready', 1), ('lower', 10), ('grasp', 16), ('hold', 19), ('lift', 28), ('settle', 36)])

    bat_ready = {**guard, 'Hips': (4, -18, 0), 'Spine': (12, -12, 0), 'Chest': (-6, 0, 0),
                 'UpperArm_R': (-75, 0, 22), 'Forearm_R': (-75, 0, 0), 'Hand_R': (0, 0, 0),
                 'UpperArm_L': (-65, 0, -16), 'Forearm_L': (-80, 0, 0)}
    bat_load = {**bat_ready, 'Hips': (-6, -32, 0), 'Spine': (-18, -28, -5), 'Chest': (10, -12, 3), 'Head': (8, 20, 0),
                'UpperArm_R': (-132, 0, 32), 'Forearm_R': (-54, 0, 0),
                'UpperArm_L': (-112, 0, -22), 'Forearm_L': (-70, 0, 0)}
    bat_hit = {**bat_ready, 'Hips': (8, 26, 0), 'Spine': (24, 32, 4), 'Chest': (-8, 12, -3), 'Head': (-12, -24, 0),
               'UpperArm_R': (-110, 0, -22), 'Forearm_R': (-6, 0, 0), 'Hand_R': (12, 0, 0),
               'UpperArm_L': (-102, 0, -34), 'Forearm_L': (-16, 0, 0)}
    bat_follow = {**bat_hit, 'Hips': (6, 42, 0), 'Spine': (18, 30, 0), 'Chest': (-4, 8, 0),
                  'UpperArm_R': (-92, 0, -60), 'Forearm_R': (-50, 0, 0), 'UpperArm_L': (-92, 0, -45)}
    replace('bat-swing', [(1, bat_ready, (0, 0, -.12)), (9, bat_load, (0, .055, -.20)),
                          (12, bat_hit, (0, -.11, -.15)), (14, bat_hit, (0, -.11, -.15)),
                          (18, bat_follow, (0, -.08, -.13)), (24, bat_ready, (0, 0, -.12))],
            [('L', 1, 24), ('R', 1, 24)], [('ready', 1), ('load', 9), ('contact', 12), ('hold', 14), ('follow', 18), ('settle', 24)])

    throw_load = {**guard, 'Hips': (-10, -24, 0), 'Spine': (-24, -18, -6), 'Chest': (12, -8, 4), 'Head': (10, 12, 0),
                  'UpperArm_R': (-148, 0, 28), 'Forearm_R': (-88, 0, 0),
                  'UpperArm_L': (-88, 0, -24), 'Forearm_L': (-18, 0, 0)}
    throw_release = {**guard, 'Hips': (10, 16, 0), 'Spine': (32, 18, 4), 'Chest': (-10, 8, -3), 'Head': (-18, -12, 0),
                     'UpperArm_R': (-138, 0, -8), 'Forearm_R': (-3, 0, 0), 'Hand_R': (0, 0, 0),
                     'UpperArm_L': (26, 0, -32), 'Forearm_L': (-72, 0, 0)}
    throw_follow = {**throw_release, 'Spine': (42, 24, 0), 'Chest': (-12, 6, 0),
                    'UpperArm_R': (-74, 0, -24), 'Forearm_R': (-20, 0, 0)}
    replace('throw', [(1, guard, (0, 0, -.10)), (9, throw_load, (0, .06, -.18)),
                      (12, throw_release, (0, -.13, -.12)), (14, throw_release, (0, -.13, -.12)),
                      (18, throw_follow, (0, -.10, -.16)), (24, guard, (0, 0, -.10))],
            [('L', 1, 24), ('R', 1, 24)], [('ready', 1), ('load', 9), ('contact', 12), ('hold', 14), ('follow', 18), ('settle', 24)])

    for clip_id in ['sword-slash', 'sword-overhead', 'sword-thrust', 'staff-thrust', 'staff-sweep',
                    'staff-overhead', 'staff-parry', 'dagger-stab', 'shield-bash', 'shield-block',
                    'shield-slam', 'shield-push', 'rifle-idle', 'rifle-fire', 'pistol-idle', 'pistol-fire']:
        definition = by_id[clip_id]
        end = definition['frames'][-1][0]
        contact = definition.get('contact_frame')
        definition.setdefault('motion', {'coordinateSystem': 'Blender Z-up, forward -Y',
                                'plants': [dict(side='L', startFrame=1, endFrame=end, velocity=[0, 0, 0])],
                                'phases': ([dict(name='contact', frame=contact)] if contact else [])})

    strides = [
        ('walk', 1.25, .60, .14, (0, 1)), ('run', 3.0, .42, .30, (0, 1)),
        ('sprint', 4.5, .34, .40, (0, 1)), ('walk-backward', 1.1, .60, .13, (0, -1)),
        ('run-backward', 2.6, .44, .26, (0, -1)), ('crouch-walk', .65, .65, .08, (0, 1)),
        ('walk-left', .65, .60, .10, (1, 0)), ('walk-right', .65, .60, .10, (-1, 0)),
        ('strafe-left', 1.1, .50, .15, (1, 0)), ('strafe-right', 1.1, .50, .15, (-1, 0)),
    ]
    for clip_id, speed, stance, lift, direction in strides:
        definition = by_id[clip_id]
        end = definition['frames'][-1][0]
        cycle = end - 1
        velocity = [speed * direction[0], speed * direction[1], 0]
        plants = [dict(side='L', startFrame=1, endFrame=1 + cycle * stance, velocity=velocity),
                  dict(side='R', startFrame=1 + cycle * .5, endFrame=1 + cycle * (.5 + stance), velocity=velocity)]
        if stance > .5:
            plants[1]['endFrame'] = end
            plants.append(dict(side='R', startFrame=1, endFrame=1 + cycle * (stance - .5), velocity=velocity))
        plants.append(dict(side='L', startFrame=end, endFrame=end, velocity=velocity))
        definition['motion'] = {
            'coordinateSystem': 'Blender Z-up, forward -Y', 'plants': plants,
            'phases': [dict(name='contact', frame=1), dict(name='pass', frame=1 + cycle * .25),
                       dict(name='opposite', frame=1 + cycle * .5), dict(name='pass', frame=1 + cycle * .75)],
            'locomotion': dict(speed=speed, cycleFrames=cycle, stanceFraction=stance, footLift=lift, direction=list(direction)),
        }

    for clip_id, direction in [('hit-front', -1), ('hit-back', 1)]:
        recoil = {**guard, 'Hips': (8 * direction, 0, 0), 'Spine': (30 * direction, 0, -5),
                  'Chest': (12 * direction, 0, 3), 'Head': (-10 * direction, 0, 0),
                  'UpperArm_L': (-20, 0, -38), 'Forearm_L': (-48, 0, 0),
                  'UpperArm_R': (26, 0, 30), 'Forearm_R': (-70, 0, 0)}
        recoil_lag = {**recoil, 'Head': (24 * direction, 0, 0)}
        replace(clip_id, [(1, guard, (0, 0, -.10)), (3, recoil, (0, -.065 * direction, -.14)),
                         (5, recoil_lag, (0, -.09 * direction, -.16)),
                         (7, recoil_lag, (0, -.09 * direction, -.16)),
                         (11, {**guard, 'Spine': (-12 * direction, 0, 0)}, (0, .025 * direction, -.12)),
                         (16, guard, (0, 0, -.10))], [('L', 1, 16)],
                [('contact', 3), ('hold', 7), ('settle', 16)])

    back_floor = {
        'Hips': (-88, 0, -4), 'Spine': (-2, 0, 0), 'Chest': (0, 0, 0), 'Neck': (0, 0, 0), 'Head': (3, 0, 0),
        'UpperArm_L': (14, 0, -38), 'Forearm_L': (-12, 0, 0), 'Hand_L': (0, 0, 0),
        'UpperArm_R': (-12, 0, 28), 'Forearm_R': (-36, 0, 0), 'Hand_R': (0, 0, 0),
        'Thigh_L': (-4, 0, -12), 'Shin_L': (6, 0, 0), 'Foot_L': (0, 0, 0),
        'Thigh_R': (-14, 0, 18), 'Shin_R': (24, 0, 0), 'Foot_R': (0, 0, 0),
    }
    front_floor = {**back_floor, 'Hips': (88, 0, 4), 'Spine': (2, 0, 0), 'Head': (-3, 0, 0),
                   'UpperArm_L': (6, 0, -50), 'Forearm_L': (0, 0, 0),
                   'UpperArm_R': (-2, 0, 42), 'Forearm_R': (0, 0, 0),
                   'Thigh_L': (0, 0, -12), 'Shin_L': (3, 0, 0),
                   'Thigh_R': (6, 0, 18), 'Shin_R': (8, 0, 0)}
    replace('knockdown', [(1, guard, (0, 0, -.10)),
                         (5, {**guard, 'Hips': (-22, 0, -4), 'Spine': (-24, 0, 0), 'Head': (8, 0, 0)}, (0, .06, -.16)),
                         (10, {**back_floor, 'Hips': (-58, 0, -4), 'Spine': (-14, 0, 0),
                               'Thigh_L': (-36, 0, -12), 'Shin_L': (48, 0, 0)}, (0, .24, -.42)),
                         (16, back_floor, (0, .42, -.80)), (20, back_floor, (0, .42, -.80)),
                         (30, back_floor, (0, .42, -.80))], phases=[('contact', 16), ('hold', 30)])
    replace('death', [(1, guard, (0, 0, -.10)),
                     (7, {**guard, 'Spine': (32, 0, 0), 'Head': (-8, 0, 0)}, (0, -.04, -.22)),
                     (14, {**front_floor, 'Hips': (48, 0, 4), 'Spine': (28, 0, 0),
                           'Thigh_L': (-46, 0, -12), 'Shin_L': (72, 0, 0)}, (0, -.18, -.48)),
                     (23, front_floor, (0, -.38, -.80)), (27, front_floor, (0, -.38, -.80)),
                     (40, front_floor, (0, -.38, -.80))], phases=[('contact', 23), ('hold', 40)])
    forward_recovery = dict(id='get-up-forward', label='Get Up Forward', category='reactions', loop=False, fps=FPS,
                            frames=[(1, {}, (0, 0, 0)), (40, {}, (0, 0, 0))])
    catalog.append(forward_recovery)
    by_id['get-up-forward'] = forward_recovery
    replace('get-up-forward', [(1, front_floor, (0, -.38, -.80)),
                              (8, {**front_floor, 'Hips': (70, 0, 4), 'Spine': (-25, 0, 0), 'Chest': (-10, 0, 0),
                                   'Head': (-12, 0, 0), 'UpperArm_L': (-42, 0, -22), 'Forearm_L': (4, 0, 0),
                                   'UpperArm_R': (-20, 0, 28), 'Forearm_R': (8, 0, 0),
                                   'Thigh_L': (-44, 0, -16), 'Shin_L': (78, 0, 0),
                                   'Thigh_R': (-22, 0, 18), 'Shin_R': (48, 0, 0)}, (0, -.30, -.74)),
                              (16, {**guard, 'Hips': (24, 0, 0), 'Spine': (28, 0, 0), 'Chest': (-12, 0, 0),
                                    'UpperArm_L': (-65, 0, -28), 'Forearm_L': (-8, 0, 0),
                                    'UpperArm_R': (-5, 0, 45), 'Forearm_R': (-80, 0, 0),
                                    'Thigh_L': (-92, 0, -16), 'Shin_L': (132, 0, 0),
                                    'Thigh_R': (0, 0, 18), 'Shin_R': (66, 0, 0), 'Foot_R': (-50, 0, 0)}, (0, -.18, -.55)),
                              (27, {**guard, 'Spine': (28, 0, 0), 'Head': (-14, 0, 0)}, (0, -.045, -.18)),
                              (40, guard, (0, 0, -.12))],
            phases=[('floor', 1), ('hands', 8), ('kneel', 16), ('rise', 27), ('guard', 40)])
    by_id['get-up-forward']['motion']['continuesFrom'] = 'death'

    replace('get-up', [(1, back_floor, (0, .42, -.80)),
                      (8, {**back_floor, 'Hips': (-48, 0, -4), 'Spine': (38, 0, 0),
                           'Thigh_L': (-58, 0, -14), 'Shin_L': (96, 0, 0)}, (0, .24, -.62)),
                      (18, {**guard, 'Hips': (8, 0, 0), 'Spine': (36, 0, 0),
                            'Thigh_L': (-70, 0, -14), 'Shin_L': (112, 0, 0),
                            'Thigh_R': (-42, 0, 16), 'Shin_R': (84, 0, 0)}, (0, .08, -.38)),
                      (28, guard, (0, 0, -.10)), (36, idle, (0, 0, -.045))])

    by_id['get-up']['motion']['continuesFrom'] = 'knockdown'

    for definition in catalog:
        clip_id = definition['id']
        end = definition['frames'][-1][0]
        if clip_id in ('walk', 'run', 'sprint'):
            lean = {'walk': (2, 9, -4), 'run': (8, 28, -8), 'sprint': (12, 38, -12)}[clip_id]
            for index, (frame, pose, position) in enumerate(definition['frames']):
                pose = dict(pose)
                for bone, angle in zip(('Hips', 'Spine', 'Chest'), lean):
                    old = pose.get(bone, (0, 0, 0))
                    pose[bone] = (angle, old[1], old[2])
                pose['Head'] = (-lean[1] * .35, 0, 0)
                definition['frames'][index] = (frame, pose, position)
        if clip_id in ('walk-left', 'walk-right', 'strafe-left', 'strafe-right'):
            sign = -1 if clip_id.endswith('left') else 1
            for index, item in enumerate(definition['frames']):
                frame, pose = item[:2]
                pose = {**pose, 'Hips': (0, 0, 6 * sign), 'Spine': (8, 0, -10 * sign),
                        'Chest': (-3, 0, 3 * sign), 'Head': (-3, 0, 4 * sign),
                        'UpperArm_L': (-45, 0, -28), 'Forearm_L': (-85, 0, 0),
                        'UpperArm_R': (-28, 0, 32), 'Forearm_R': (-105, 0, 0)}
                position = item[2] if len(item) > 2 else (0, 0, 0)
                definition['frames'][index] = (frame, pose, (position[0], position[1], min(position[2], -.07)))
        if definition['category'] == 'ranged' or clip_id in ('wave', 'point', 'interact', 'stun', 'staff-spin'):
            for index, item in enumerate(definition['frames']):
                frame, pose = item[:2]
                pose = {**pose, 'Thigh_L': (10, 0, -10), 'Shin_L': (18, 0, 0),
                        'Thigh_R': (-24, 0, 10), 'Shin_R': (34, 0, 0)}
                position = item[2] if len(item) > 2 else (0, 0, 0)
                definition['frames'][index] = (frame, pose, (position[0], position[1], min(position[2], -.065)))
            definition.setdefault('motion', {'coordinateSystem': 'Blender Z-up, forward -Y', 'phases': []})['plants'] = [
                dict(side=side, startFrame=1, endFrame=end, velocity=[0, 0, 0]) for side in ('L', 'R')]
        contact = definition.get('contact_frame')
        if definition['category'] == 'melee' and contact and clip_id not in ('kick-air',) and not any(
                phase['name'] == 'load' for phase in definition.get('motion', {}).get('phases', [])):
            resolved = resolve_clip_poses(definition)
            contact_pose = next((item for item in resolved if item[0] == contact), None)
            if contact_pose and contact + 2 < end:
                before = max((item for item in resolved if item[0] < contact), key=lambda item: item[0])
                load_frame = max(1, contact - 2)
                frames = [item for item in definition['frames'] if not (load_frame <= item[0] < contact or contact < item[0] <= contact + 2)]
                frames.extend([(load_frame, before[1], before[2]), (contact + 2, contact_pose[1], contact_pose[2])])
                definition['frames'] = sorted(frames, key=lambda item: item[0])
                motion = definition.setdefault('motion', {'coordinateSystem': 'Blender Z-up, forward -Y'})
                motion['phases'] = [dict(name='load', frame=load_frame), dict(name='contact', frame=contact),
                                    dict(name='hold', frame=contact + 2), dict(name='settle', frame=end)]
                motion.setdefault('plants', [dict(side='L', startFrame=1, endFrame=end, velocity=[0, 0, 0])])
                if clip_id == 'hammer-overhead':
                    motion['plants'] = [dict(side=side, startFrame=1, endFrame=end, velocity=[0, 0, 0]) for side in ('L', 'R')]

    grip_targets = {
        'sword-thrust': dict(side='R', reference='punch-heavy', axis=[0, -1, 0]),
        'sword-lunge': dict(side='R', reference='punch-heavy', axis=[0, -1, 0]),
        'sword-overhead': dict(side='R', reference='punch-heavy', axis=[0, -.97, -.25]),
        'sword-diagonal': dict(side='R', reference='punch-heavy', axis=[-.65, -.67, -.35]),
        'shield-slam': dict(side='L', reference='block', orientation=[0, 0, 0]),
    }
    for clip_id, target in grip_targets.items():
        by_id[clip_id]['motion']['grip'] = target

    for definition in catalog:
        motion = definition.get('motion')
        if not motion:
            continue
        end = definition['frames'][-1][0]
        for plant in motion['plants']:
            assert plant['side'] in ('L', 'R') and 1 <= plant['startFrame'] <= plant['endFrame'] <= end
        for phase in motion['phases']:
            assert 1 <= phase['frame'] <= end


def _retime_authored_clip(
    definition: Dict[str, Any],
    end_frame: int,
    contact_frame: Optional[int] = None,
) -> None:
    """Remap a clip timeline and its event metadata as one operation."""
    resolved = resolve_clip_poses(definition)
    old_end = resolved[-1][0]
    old_contact = definition.get('contact_frame')

    def remap(frame: float) -> int:
        if old_contact is not None and contact_frame is not None and old_contact > 1 and old_end > old_contact:
            if frame <= old_contact:
                ratio = (frame - 1) / (old_contact - 1)
                return int(round(1 + ratio * (contact_frame - 1)))
            ratio = (frame - old_contact) / (old_end - old_contact)
            return int(round(contact_frame + ratio * (end_frame - contact_frame)))
        if old_end <= 1:
            return 1
        return int(round(1 + (frame - 1) * (end_frame - 1) / (old_end - 1)))

    remapped: List[Tuple[int, Dict[str, Tuple[float, float, float]], Tuple[float, float, float]]] = []
    for frame, pose, hips in resolved:
        mapped_frame = remap(frame)
        if remapped and mapped_frame == remapped[-1][0]:
            remapped[-1] = (mapped_frame, dict(pose), hips)
        else:
            remapped.append((mapped_frame, dict(pose), hips))
    remapped[0] = (1, remapped[0][1], remapped[0][2])
    remapped[-1] = (end_frame, remapped[-1][1], remapped[-1][2])
    definition['frames'] = remapped
    if contact_frame is not None:
        definition['contact_frame'] = contact_frame

    motion = definition.get('motion')
    if not motion:
        return
    for plant in motion.get('plants', []):
        plant['startFrame'] = remap(plant['startFrame'])
        plant['endFrame'] = remap(plant['endFrame'])
        plant['startFrame'] = max(1, min(end_frame, plant['startFrame']))
        plant['endFrame'] = max(plant['startFrame'], min(end_frame, plant['endFrame']))
    for phase in motion.get('phases', []):
        phase['frame'] = contact_frame if phase['name'] == 'contact' and contact_frame is not None else remap(phase['frame'])


def _replace_authored_specs(
    definition: Dict[str, Any],
    specs: List[Tuple[int, int, Dict[str, Tuple[float, float, float]], Optional[Tuple[float, float, float]]]],
) -> None:
    """Write complete keys from old poses with small explicit pose edits."""
    resolved = resolve_clip_poses(definition)

    def source(frame: int) -> Tuple[Dict[str, Tuple[float, float, float]], Tuple[float, float, float]]:
        item = min(resolved, key=lambda value: abs(value[0] - frame))
        return dict(item[1]), item[2]

    frames = []
    for frame, source_frame, updates, hips_position in specs:
        pose, old_hips = source(source_frame)
        pose.update(updates)
        frames.append((frame, pose, hips_position if hips_position is not None else old_hips))
    definition['frames'] = frames


def _set_authored_motion(
    definition: Dict[str, Any],
    phases: List[Tuple[str, int]],
    plants: Optional[List[Tuple[str, int, int]]] = None,
) -> None:
    """Set named phases and optionally replace support plants."""
    motion = definition.setdefault('motion', {
        'coordinateSystem': 'Blender Z-up, forward -Y',
        'plants': [],
    })
    motion['phases'] = [dict(name=name, frame=frame) for name, frame in phases]
    if plants is not None:
        motion['plants'] = [dict(side=side, startFrame=start, endFrame=end, velocity=[0, 0, 0])
                            for side, start, end in plants]


def apply_authored_motion_polish(catalog: List[Dict[str, Any]]) -> None:
    """Apply bounded pose and timing corrections to the ranked motion clips."""
    by_id = {item['id']: item for item in catalog}

    # Parry and dodges need a visible line of action and a short displacement.
    parry = by_id['parry']
    _replace_authored_specs(parry, [
        (1, 1, {'Hips': (4, -8, 0), 'Spine': (12, -6, 0), 'Chest': (-5, -4, 0), 'Head': (-4, -8, 0),
                'UpperArm_L': (-54, 0, -28), 'Forearm_L': (-96, 0, -18), 'UpperArm_R': (-38, 0, 24), 'Forearm_R': (-90, 0, 0)}, (0, 0, -.12)),
        (3, 6, {'Hips': (-8, -18, -5), 'Spine': (18, -16, 0), 'Chest': (-8, -10, 3), 'Head': (-8, -14, 0),
                'UpperArm_L': (-96, 0, -38), 'Forearm_L': (-76, 0, -22), 'UpperArm_R': (-50, 0, 28), 'Forearm_R': (-104, 0, 0)}, (0, -.02, -.13)),
        (5, 12, {'Hips': (-12, -24, -7), 'Spine': (24, -22, -2), 'Chest': (-10, -13, 5), 'Head': (-12, -18, 0),
                 'UpperArm_L': (-122, 0, -42), 'Forearm_L': (-68, 0, -28), 'Hand_L': (-22, 0, 0),
                 'UpperArm_R': (-44, 0, 30), 'Forearm_R': (-108, 0, 0)}, (0, -.03, -.13)),
        (7, 12, {'Hips': (-8, -14, -4), 'Spine': (18, -12, 0), 'Chest': (-7, -8, 3), 'Head': (-8, -12, 0),
                 'UpperArm_L': (-104, 0, -36), 'Forearm_L': (-78, 0, -20), 'UpperArm_R': (-42, 0, 28), 'Forearm_R': (-102, 0, 0)}, (0, -.02, -.12)),
        (12, 18, {'Hips': (4, -8, 0), 'Spine': (14, -4, 0), 'Chest': (-5, -2, 0), 'Head': (-4, -6, 0),
                  'UpperArm_L': (-66, 0, -24), 'Forearm_L': (-82, 0, -8), 'UpperArm_R': (-42, 0, 24), 'Forearm_R': (-112, 0, 0)}, (0, 0, -.12)),
    ])
    parry['contact_frame'] = 5
    _set_authored_motion(parry, [('ready', 1), ('load', 3), ('contact', 5), ('hold', 7), ('settle', 12)], [('L', 1, 12), ('R', 1, 12)])

    for clip_id, sign in [('dodge-left', -1), ('dodge-right', 1)]:
        dodge = by_id[clip_id]
        _replace_authored_specs(dodge, [
            (1, 1, {'Hips': (0, 0, 6 * sign), 'Spine': (6, 0, 4 * sign), 'Chest': (-3, 0, 3 * sign), 'Head': (-4, 0, 3 * sign),
                    'UpperArm_L': (-38, 0, -18), 'Forearm_L': (-86, 0, -4), 'UpperArm_R': (-28, 0, 22), 'Forearm_R': (-96, 0, 4)}, (0, 0, -.10)),
            (3, 7, {'Hips': (6, 0, 10 * sign), 'Spine': (10, 0, 8 * sign), 'Chest': (-5, 0, 6 * sign), 'Head': (-8, 0, 8 * sign),
                    'Thigh_L': (-22, 0, -16 * sign), 'Shin_L': (36, 0, 0), 'Thigh_R': (-34, 0, 14 * sign), 'Shin_R': (48, 0, 0),
                    'UpperArm_L': (-58, 0, -28), 'Forearm_L': (-104, 0, -8), 'UpperArm_R': (-18, 0, 30), 'Forearm_R': (-82, 0, 4)},
                   (0.10 * sign, 0, -.06)),
            (5, 7, {'Hips': (10, 0, 14 * sign), 'Spine': (14, 0, 10 * sign), 'Chest': (-7, 0, 8 * sign), 'Head': (-10, 0, 10 * sign),
                    'Thigh_L': (-30, 0, -22 * sign), 'Shin_L': (48, 0, 0), 'Thigh_R': (-50, 0, 18 * sign), 'Shin_R': (68, 0, 0),
                    'UpperArm_L': (-74, 0, -34), 'Forearm_L': (-112, 0, -10), 'UpperArm_R': (-8, 0, 34), 'Forearm_R': (-74, 0, 6)},
                   (0.20 * sign, 0, -.08)),
            (8, 13, {'Hips': (6, 0, 10 * sign), 'Spine': (9, 0, 7 * sign), 'Chest': (-4, 0, 5 * sign), 'Head': (-6, 0, 7 * sign),
                    'Thigh_L': (-18, 0, -12 * sign), 'Shin_L': (30, 0, 0), 'Thigh_R': (-38, 0, 12 * sign), 'Shin_R': (54, 0, 0)},
                   (0.10 * sign, 0, -.06)),
            (12, 18, {'Hips': (0, 0, 4 * sign), 'Spine': (5, 0, 3 * sign), 'Chest': (-2, 0, 2 * sign), 'Head': (-3, 0, 2 * sign),
                      'Thigh_L': (-12, 0, -8 * sign), 'Thigh_R': (-18, 0, 8 * sign)}, (0, 0, -.10)),
        ])
        _set_authored_motion(dodge, [('ready', 1), ('push', 3), ('peak', 5), ('catch', 8), ('settle', 12)], [])

    # Elbow contact keeps the forearm folded so the elbow leads the action.
    elbow = by_id['elbow-strike']
    _replace_authored_specs(elbow, [
        (1, 1, {}, (0, 0, -.11)),
        (3, 4, {'Hips': (-8, -24, -6), 'Spine': (18, -20, 0), 'Chest': (8, -12, 2), 'Head': (6, 10, 0),
                'UpperArm_R': (-24, 0, -78), 'Forearm_R': (-96, 0, 0), 'Hand_R': (-18, 0, 0),
                'UpperArm_L': (-58, 0, 20), 'Forearm_L': (-92, 0, 0)}, (0, .04, -.16)),
        (6, 9, {'Hips': (-10, -12, -8), 'Spine': (28, -12, 0), 'Chest': (12, -8, 0), 'Head': (-8, 0, -14),
                'UpperArm_R': (-18, 0, -82), 'Forearm_R': (-102, 0, 0), 'Hand_R': (-28, 0, 0),
                'UpperArm_L': (-52, 0, 20), 'Forearm_L': (-104, 0, 0)}, (0, -.02, -.12)),
        (7, 9, {'Hips': (-9, -10, -7), 'Spine': (26, -10, 0), 'Chest': (10, -7, 0), 'Head': (-7, 0, -12),
                'UpperArm_R': (-20, 0, -80), 'Forearm_R': (-98, 0, 0), 'Hand_R': (-24, 0, 0)}, (0, -.02, -.12)),
        (10, 14, {'Hips': (-4, 2, -4), 'Spine': (8, 4, 0), 'Chest': (4, 2, 0), 'UpperArm_R': (-48, 0, -38),
                  'Forearm_R': (-54, 0, 0), 'Hand_R': (-8, 0, 0)}, (0, 0, -.10)),
        (14, 20, {}, (0, 0, -.11)),
    ])
    elbow['contact_frame'] = 6
    _set_authored_motion(elbow, [('ready', 1), ('load', 3), ('contact', 6), ('hold', 7), ('follow', 10), ('settle', 14)], [('L', 1, 14)])

    # Keep the hammer and shield overhead until the fast downward contact.
    hammer = by_id['hammer-overhead']
    _replace_authored_specs(hammer, [
        (1, 1, {}, (0, 0, -.10)),
        (8, 5, {'Hips': (-8, 18, -4), 'Spine': (-18, 12, 0), 'Chest': (-8, 6, 0), 'Head': (10, 2, 0),
                'UpperArm_R': (-150, 0, 14), 'Forearm_R': (-80, 0, 0), 'Hand_R': (10, 0, -35),
                'UpperArm_L': (-150, 0, -14), 'Forearm_L': (-80, 0, 0), 'Hand_L': (-8, 0, 0)}, (0, .04, -.08)),
        (10, 5, {'Hips': (-6, 14, -3), 'Spine': (-14, 10, 0), 'Chest': (-6, 5, 0), 'UpperArm_R': (-148, 0, 14),
                 'Forearm_R': (-76, 0, 0), 'Hand_R': (12, 0, -38), 'UpperArm_L': (-146, 0, -14), 'Forearm_L': (-76, 0, 0)}, (0, .02, -.08)),
        (12, 14, {'Hips': (-8, -18, -10), 'Spine': (34, -12, 0), 'Chest': (10, -8, 0), 'Head': (-12, 0, 0),
                  'UpperArm_R': (-72, 0, 8), 'Forearm_R': (-12, 0, 0), 'Hand_R': (20.738, 13.695, -50.478),
                  'UpperArm_L': (-78, 0, -8), 'Forearm_L': (-22, 0, 0), 'Hand_L': (-8, 0, 0),
                  'Thigh_L': (-46, 0, -20), 'Shin_L': (58, 0, 0), 'Thigh_R': (30, 0, 20), 'Shin_R': (44, 0, 0)}, (0, -.12, -.15)),
        (14, 15, {'Hips': (-8, -16, -9), 'Spine': (32, -10, 0), 'Chest': (9, -7, 0), 'UpperArm_R': (-74, 0, 8),
                  'Forearm_R': (-14, 0, 0), 'Hand_R': (20.738, 13.695, -50.478), 'UpperArm_L': (-76, 0, -8), 'Forearm_L': (-24, 0, 0)}, (0, -.12, -.15)),
        (18, 20, {'Hips': (-2, 4, -3), 'Spine': (12, 4, 0), 'Chest': (4, 2, 0), 'UpperArm_R': (-52, 0, 12), 'Forearm_R': (-36, 0, 0),
                  'UpperArm_L': (-44, 0, -10), 'Forearm_L': (-70, 0, 0)}, (0, 0, -.10)),
        (24, 26, {}, (0, 0, -.10)),
    ])
    hammer['contact_frame'] = 12
    _set_authored_motion(hammer, [('ready', 1), ('load', 8), ('contact', 12), ('hold', 14), ('follow', 18), ('settle', 24)], [('L', 1, 24), ('R', 1, 24)])

    shield_slam = by_id['shield-slam']
    _replace_authored_specs(shield_slam, [
        (1, 1, {}, (0, 0, -.11)),
        (8, 6, {'Hips': (-5, 18, -3), 'Spine': (-18, 12, 0), 'Chest': (-8, 6, 0), 'Head': (8, 2, 0),
                'UpperArm_L': (-150, 0, -18), 'Forearm_L': (-78, 0, 0), 'UpperArm_R': (-42, 0, 22), 'Forearm_R': (-96, 0, 0)}, (0, .04, -.08)),
        (10, 6, {'Hips': (-4, 14, -3), 'Spine': (-14, 10, 0), 'Chest': (-6, 5, 0), 'UpperArm_L': (-146, 0, -18),
                 'Forearm_L': (-74, 0, 0), 'UpperArm_R': (-40, 0, 22), 'Forearm_R': (-94, 0, 0)}, (0, .02, -.08)),
        (11, 12, {'Hips': (-12, -18, -10), 'Spine': (36, -12, 0), 'Chest': (10, -8, 0), 'Head': (-12, 0, 0),
                  'UpperArm_L': (-76, 0, -8), 'Forearm_L': (-24, 0, 0), 'UpperArm_R': (-52, 0, 20), 'Forearm_R': (-72, 0, 0),
                  'Thigh_L': (-48, 0, -22), 'Shin_L': (62, 0, 0), 'Thigh_R': (28, 0, 20), 'Shin_R': (44, 0, 0)}, (0, -.12, -.16)),
        (13, 13, {'Hips': (-10, -16, -9), 'Spine': (34, -10, 0), 'Chest': (9, -7, 0), 'UpperArm_L': (-78, 0, -8),
                  'Forearm_L': (-26, 0, 0), 'UpperArm_R': (-50, 0, 20), 'Forearm_R': (-74, 0, 0)}, (0, -.12, -.16)),
        (16, 18, {'Hips': (-2, -4, -3), 'Spine': (12, 0, 0), 'Chest': (5, 0, 0), 'UpperArm_L': (-58, 0, -14),
                  'Forearm_L': (-54, 0, 0), 'UpperArm_R': (-40, 0, 16), 'Forearm_R': (-80, 0, 0)}, (0, 0, -.11)),
        (21, 25, {}, (0, 0, -.11)),
    ])
    shield_slam['contact_frame'] = 11
    _set_authored_motion(shield_slam, [('ready', 1), ('load', 8), ('contact', 11), ('hold', 13), ('follow', 16), ('settle', 21)], [('L', 1, 21)])
    shield_slam['motion']['grip'] = dict(side='L', reference='block', orientation=[0, 0, 0])

    # The ball leaves from a high overarm release. The release is explicit.
    ball_throw = by_id['ball-throw']
    _replace_authored_specs(ball_throw, [
        (1, 1, {}, (0, 0, 0)),
        (5, 8, {'Hips': (-10, -24, 0), 'Spine': (-24, -18, -6), 'Chest': (12, -8, 4), 'Head': (10, 12, 0),
                'UpperArm_R': (-148, 0, 28), 'Forearm_R': (-88, 0, 0), 'Hand_R': (0, 0, 0),
                'UpperArm_L': (-88, 0, -24), 'Forearm_L': (-18, 0, 0), 'Thigh_L': (-70, 0, -12), 'Shin_L': (82, 0, 0)}, (0, .05, -.08)),
        (9, 14, {'Hips': (10, 16, 0), 'Spine': (32, 18, 4), 'Chest': (-10, 8, -3), 'Head': (-18, -12, 0),
                 'UpperArm_R': (-138, 0, -8), 'Forearm_R': (-3, 0, 0), 'Hand_R': (0, 0, 0),
                 'UpperArm_L': (26, 0, -32), 'Forearm_L': (-72, 0, 0)}, (0, -.13, -.12)),
        (12, 14, {'Hips': (10, 18, 0), 'Spine': (42, 24, 0), 'Chest': (-12, 6, 0), 'Head': (-16, -12, 0),
                  'UpperArm_R': (-74, 0, -24), 'Forearm_R': (-20, 0, 0), 'UpperArm_L': (26, 0, -32), 'Forearm_L': (-72, 0, 0)}, (0, -.10, -.16)),
        (16, 24, {'Hips': (4, 8, 0), 'Spine': (18, 8, 0), 'Chest': (-4, 3, 0), 'Head': (-6, -4, 0), 'UpperArm_R': (-42, 0, -18), 'Forearm_R': (-42, 0, 0)}, (0, -.03, -.08)),
        (21, 24, {}, (0, 0, 0)),
    ])
    _set_authored_motion(ball_throw, [('ready', 1), ('load', 5), ('release', 9), ('follow', 12), ('settle', 21)], [])

    # Both hands and the bat travel across the body through contact.
    bat = by_id['bat-swing']
    _replace_authored_specs(bat, [
        (1, 1, {}, (0, 0, -.12)),
        (6, 9, {'Hips': (-6, -32, 0), 'Spine': (-18, -28, -5), 'Chest': (10, -12, 3), 'Head': (8, 20, 0),
                'UpperArm_R': (-132, 0, 32), 'Forearm_R': (-54, 0, 0), 'UpperArm_L': (-112, 0, -22), 'Forearm_L': (-70, 0, 0)}, (0, .055, -.20)),
        (8, 12, {'Hips': (8, 26, 0), 'Spine': (24, 32, 4), 'Chest': (-8, 12, -3), 'Head': (-12, -24, 0),
                 'UpperArm_R': (-86, 0, -58), 'Forearm_R': (-40, 0, 0), 'Hand_R': (-18, -42, -78),
                 'UpperArm_L': (-118, 0, -48), 'Forearm_L': (-28, 0, 0), 'Hand_L': (-12, -34, -62)}, (0, -.11, -.15)),
        (10, 12, {'Hips': (8, 24, 0), 'Spine': (22, 30, 4), 'Chest': (-8, 11, -3), 'Head': (-11, -22, 0),
                  'UpperArm_R': (-88, 0, -62), 'Forearm_R': (-44, 0, 0), 'Hand_R': (-16, -42, -78),
                  'UpperArm_L': (-116, 0, -52), 'Forearm_L': (-30, 0, 0), 'Hand_L': (-10, -34, -62)}, (0, -.11, -.15)),
        (14, 18, {'Hips': (6, 42, 0), 'Spine': (18, 30, 0), 'Chest': (-4, 8, 0), 'Head': (-8, -18, 0),
                  'UpperArm_R': (-74, 0, -82), 'Forearm_R': (-54, 0, 0), 'Hand_R': (-8, -30, -68),
                  'UpperArm_L': (-96, 0, -66), 'Forearm_L': (-42, 0, 0), 'Hand_L': (-6, -24, -58)}, (0, -.08, -.13)),
        (21, 24, {}, (0, 0, -.12)),
    ])
    _set_authored_motion(bat, [('ready', 1), ('load', 6), ('contact', 8), ('hold', 10), ('follow', 14), ('settle', 21)], [('L', 1, 21), ('R', 1, 21)])

    # Traversal shapes show the support hand, tuck, and landing order.
    vault = by_id['vault']
    _replace_authored_specs(vault, [
        (1, 1, {'Hips': (0, -8, 0), 'Spine': (20, -8, 0), 'Head': (-8, -6, 0), 'UpperArm_L': (-60, 0, -18), 'Forearm_L': (-12, 0, 0), 'UpperArm_R': (-70, 0, 24), 'Forearm_R': (-20, 0, 0)}, (0, 0, -.08)),
        (4, 6, {'Hips': (0, -4, 0), 'Spine': (34, -2, 0), 'Chest': (-8, 0, 0), 'Head': (-12, -4, 0),
                'UpperArm_L': (-112, 0, -18), 'Forearm_L': (-8, 0, 0), 'UpperArm_R': (-74, 0, 24), 'Forearm_R': (-24, 0, 0),
                'Thigh_L': (-64, 0, -24), 'Shin_L': (92, 0, 0), 'Thigh_R': (-46, 0, 28), 'Shin_R': (76, 0, 0)}, (0, .02, -.12)),
        (7, 6, {'Hips': (0, 0, 0), 'Spine': (42, 0, 0), 'Chest': (-10, 0, 0), 'Head': (-12, 0, 0),
                'UpperArm_L': (-106, 0, -16), 'Forearm_L': (-6, 0, 0), 'UpperArm_R': (-64, 0, 22), 'Forearm_R': (-30, 0, 0),
                'Thigh_L': (-88, 0, -24), 'Shin_L': (112, 0, 0), 'Thigh_R': (-64, 0, 26), 'Shin_R': (102, 0, 0)}, (0, .06, -.10)),
        (11, 14, {'Hips': (-4, 0, 0), 'Spine': (-8, 0, 0), 'Head': (6, 0, 0), 'UpperArm_L': (-70, 0, -12), 'Forearm_L': (-18, 0, 0),
                  'UpperArm_R': (-48, 0, 24), 'Forearm_R': (-48, 0, 0), 'Thigh_L': (-30, 0, -18), 'Shin_L': (62, 0, 0), 'Thigh_R': (-42, 0, 24), 'Shin_R': (74, 0, 0)}, (0, .04, -.04)),
        (16, 14, {'Hips': (0, 4, 0), 'Spine': (-6, 2, 0), 'Head': (4, 0, 0), 'UpperArm_L': (-42, 0, -18), 'Forearm_L': (-20, 0, 0), 'UpperArm_R': (-34, 0, 28), 'Forearm_R': (-38, 0, 0), 'Thigh_L': (-20, 0, -14), 'Shin_L': (42, 0, 0), 'Thigh_R': (-24, 0, 20), 'Shin_R': (48, 0, 0)}, (0, .02, -.10)),
        (22, 24, {}, (0, 0, -.10)),
    ])
    _set_authored_motion(vault, [('approach', 1), ('plant', 4), ('tuck', 7), ('clear', 11), ('land', 16), ('settle', 22)], [])

    ledge = by_id['ledge-climb']
    _replace_authored_specs(ledge, [
        (1, 1, {'Hips': (0, -8, 0), 'Spine': (8, -4, 0), 'Head': (-12, 0, -5), 'UpperArm_L': (-142, 0, -30), 'Forearm_L': (-10, 0, -4), 'UpperArm_R': (-118, 0, 20), 'Forearm_R': (-46, 0, 0), 'Thigh_L': (-58, 0, -20), 'Shin_L': (92, 0, 0), 'Thigh_R': (-38, 0, 16), 'Shin_R': (62, 0, 0)}, (0, 0, .18)),
        (5, 5, {'Hips': (0, -16, 0), 'Spine': (-26, -12, 0), 'Chest': (-9, -8, 0), 'Head': (6, 0, 0), 'UpperArm_L': (-102, 0, -24), 'Forearm_L': (-8, 0, -4), 'UpperArm_R': (-128, 0, 14), 'Forearm_R': (-8, 0, 0), 'Thigh_L': (-86, 0, -20), 'Shin_L': (104, 0, 0), 'Thigh_R': (-54, 0, 18), 'Shin_R': (76, 0, 0)}, (0, 0, .26)),
        (9, 10, {'Hips': (0, -18, 0), 'Spine': (-40, -10, 0), 'Chest': (-14, -8, 0), 'Head': (8, 0, 0), 'UpperArm_L': (-72, 0, -28), 'Forearm_L': (-12, 0, -4), 'UpperArm_R': (-104, 0, 26), 'Forearm_R': (-28, 0, 0), 'Thigh_L': (-92, 0, -22), 'Shin_L': (110, 0, 0), 'Thigh_R': (-50, 0, 20), 'Shin_R': (74, 0, 0)}, (0, 0, .24)),
        (14, 15, {'Hips': (0, 8, 0), 'Spine': (28, 6, 0), 'Chest': (12, 4, 0), 'Head': (-5, 0, 0), 'UpperArm_L': (-44, 0, -22), 'Forearm_L': (-30, 0, 0), 'UpperArm_R': (-72, 0, 18), 'Forearm_R': (-24, 0, 0), 'Thigh_L': (-28, 0, -14), 'Shin_L': (50, 0, 0), 'Thigh_R': (-16, 0, 16), 'Shin_R': (38, 0, 0)}, (0, 0, .12)),
        (20, 22, {'Hips': (0, 2, 0), 'Spine': (12, 2, 0), 'Chest': (4, 1, 0), 'Head': (0, 0, 0), 'UpperArm_L': (-28, 0, -14), 'Forearm_L': (-44, 0, 0), 'UpperArm_R': (-30, 0, 14), 'Forearm_R': (-44, 0, 0)}, (0, 0, -.08)),
        (24, 22, {}, (0, 0, -.10)),
    ])
    _set_authored_motion(ledge, [('hang', 1), ('pull', 5), ('brace', 9), ('knee', 14), ('stand', 20), ('settle', 24)], [])

    # Crouch travel keeps the pelvis low at the existing gait cycle frames.
    _patch_authored_frame(by_id['crouch-walk'], 8, {
        'Hips': (0, 2, 0), 'Spine': (24, 2, 6), 'Chest': (10, 2, 4), 'Head': (-4, 4, 0),
        'Thigh_L': (-28, 0, -12), 'Shin_L': (38, 0, 0), 'Thigh_R': (-66, 0, 18), 'Shin_R': (76, 0, 0),
        'UpperArm_L': (-28, 0, -16), 'UpperArm_R': (-8, 0, 16),
    }, (0, 0, -.12))

    # The roll stays compact through the middle rotation, then opens at exit.
    roll = by_id['roll']
    _patch_authored_frame(roll, 1, {
        'Spine': (25, 0, 0), 'UpperArm_L': (-48, 0, -28), 'Forearm_L': (-68, 0, 0),
        'UpperArm_R': (-42, 0, 24), 'Forearm_R': (-62, 0, 0), 'Thigh_L': (-55, 0, -12),
        'Shin_L': (82, 0, 0), 'Thigh_R': (-60, 0, 12), 'Shin_R': (88, 0, 0),
    }, (0, 0, -.12))
    _patch_authored_frame(roll, 6, {
        'Hips': (90, 0, 0), 'Spine': (42, 0, 0), 'Chest': (8, 0, 0), 'Head': (-6, 0, 0),
        'UpperArm_L': (-76, 0, -28), 'Forearm_L': (-78, 0, 0), 'UpperArm_R': (-72, 0, 26), 'Forearm_R': (-76, 0, 0),
        'Thigh_L': (-86, 0, -14), 'Shin_L': (108, 0, 0), 'Thigh_R': (-86, 0, 14), 'Shin_R': (108, 0, 0),
    }, (0, 0, -.45))
    _patch_authored_frame(roll, 12, {
        'Hips': (180, 0, 0), 'Spine': (44, 0, 0), 'Chest': (8, 0, 0), 'Head': (-8, 0, 0),
        'UpperArm_L': (-84, 0, -26), 'Forearm_L': (-82, 0, 0), 'UpperArm_R': (-78, 0, 24), 'Forearm_R': (-80, 0, 0),
        'Thigh_L': (-90, 0, -14), 'Shin_L': (112, 0, 0), 'Thigh_R': (-90, 0, 14), 'Shin_R': (112, 0, 0),
    }, (0, 0, -.45))
    _patch_authored_frame(roll, 18, {
        'Hips': (270, 0, 0), 'Spine': (34, 0, 0), 'Chest': (6, 0, 0), 'Head': (-4, 0, 0),
        'UpperArm_L': (-70, 0, -24), 'Forearm_L': (-70, 0, 0), 'UpperArm_R': (-66, 0, 22), 'Forearm_R': (-68, 0, 0),
        'Thigh_L': (-72, 0, -12), 'Shin_L': (94, 0, 0), 'Thigh_R': (-72, 0, 12), 'Shin_R': (94, 0, 0),
    }, (0, 0, -.30))
    _set_authored_motion(roll, [('entry', 1), ('tuck', 6), ('invert', 12), ('open', 18), ('settle', 24)], [])

    # Short contacts use the same remap for keys, plants, and phases.
    for clip_id, end_frame, contact_frame in [
        ('punch-left', 12, 5), ('punch-right', 14, 6), ('dagger-stab', 12, 5),
        ('sword-thrust', 15, 6), ('sword-slash', 18, 7), ('kick-roundhouse', 21, 8),
        ('uppercut', 15, 7), ('shield-push', 21, 8), ('staff-sweep', 20, 8),
        ('sword-diagonal', 20, 8), ('backfist', 15, 6), ('staff-thrust', 18, 7),
    ]:
        _retime_authored_clip(by_id[clip_id], end_frame, contact_frame)

    # The roundhouse reaches full extension at the contact event.
    kick = by_id['kick-roundhouse']
    held = next(frame for frame in resolve_clip_poses(kick) if frame[0] == 10)
    _patch_authored_frame(kick, 8, held[1], held[2])
    _patch_authored_frame(by_id['uppercut'], 7, {
        'Hips': (0, -12, 0), 'Spine': (-24, -12, 0), 'Chest': (12, 0, 0), 'Head': (6, 0, 0),
        'UpperArm_R': (-96, 0, 14), 'Forearm_R': (-46, 0, 0), 'Hand_R': (0, 0, 0),
        'UpperArm_L': (-50, 0, -30), 'Forearm_L': (-112, 0, 0),
    }, (0, -.07, -.08))
    _patch_authored_frame(by_id['shield-push'], 8, {
        'Hips': (0, 12, 0), 'Spine': (26, 10, 0), 'Chest': (9, 6, 0), 'Head': (-10, 0, 0),
        'UpperArm_L': (-94, 0, -8), 'Forearm_L': (-8, 0, 0), 'UpperArm_R': (-44, 0, 22), 'Forearm_R': (-76, 0, 0),
    }, (0, -.10, -.13))
    by_id['shield-push']['motion']['grip'] = dict(side='L', reference='block', orientation=[0, 0, 0])
    _patch_authored_frame(by_id['staff-sweep'], 8, {
        'Hips': (0, -38, 0), 'Spine': (14, -28, 0), 'Chest': (6, -14, 0), 'Head': (-10, 0, 0),
        'UpperArm_L': (-58, 0, 28), 'Forearm_L': (-48, 0, 0), 'UpperArm_R': (-64, 0, -30), 'Forearm_R': (-30, 0, 0),
    }, (0, -.04, -.13))
    _patch_authored_frame(by_id['backfist'], 6, {
        'Hips': (-8, -12, -6), 'Spine': (20, -14, 0), 'Chest': (8, -8, 0), 'Head': (-6, 0, -12),
        'UpperArm_R': (-78, 0, -42), 'Forearm_R': (-62, 0, 0), 'Hand_R': (-12, 0, 0),
        'UpperArm_L': (-48, 0, 20), 'Forearm_L': (-96, 0, 0),
    }, (0, -.03, -.11))

    # Jump-start has named phases for consumers that schedule the launch.
    jump = by_id['jump-start']
    _retime_authored_clip(jump, 8)
    _patch_authored_frame(jump, 3, {'Hips': (-2, -14, 0), 'Spine': (28, -12, 0), 'Chest': (-6, -8, 0), 'Head': (-8, 0, 0),
                                    'Thigh_L': (-54, 0, -10), 'Shin_L': (82, 0, 0), 'Thigh_R': (-42, 0, 14), 'Shin_R': (68, 0, 0)}, (0, 0, -.15))
    _patch_authored_frame(jump, 5, {'Hips': (0, 2, 0), 'Spine': (38, 2, 0), 'Chest': (-4, 2, 0), 'Head': (-6, 0, 0),
                                    'Thigh_L': (-70, 0, -12), 'Shin_L': (92, 0, 0), 'Thigh_R': (-52, 0, 16), 'Shin_R': (82, 0, 0),
                                    'UpperArm_L': (58, 0, -14), 'Forearm_L': (-82, 0, 0), 'UpperArm_R': (46, 0, 22), 'Forearm_R': (-90, 0, 0)}, (0, 0, -.24))
    _patch_authored_frame(jump, 8, {'Hips': (1, 0, 0), 'Spine': (-12, 0, 0), 'Chest': (8, 0, 0), 'Head': (6, 0, 0),
                                    'Thigh_L': (18, 0, -12), 'Shin_L': (28, 0, 0), 'Thigh_R': (-24, 0, 14), 'Shin_R': (34, 0, 0)}, (0, 0, .18))
    _patch_authored_frame(jump, 6, {'Hips': (0, 0, 0), 'Spine': (10, 0, 0), 'Chest': (2, 0, 0), 'Head': (0, 0, 0), 'Thigh_L': (-32, 0, -12), 'Shin_L': (48, 0, 0), 'Thigh_R': (-24, 0, 14), 'Shin_R': (42, 0, 0), 'UpperArm_L': (-110, 0, -12), 'Forearm_L': (-20, 0, 0), 'UpperArm_R': (-100, 0, 18), 'Forearm_R': (-24, 0, 0)}, (0, 0, -.08))
    _set_authored_motion(jump, [('ready', 1), ('load', 5), ('takeoff', 6), ('clear', 8)], [])

    # Whole-body travel and the torso lean must move the head in the same direction.
    for clip_id in ('dodge-left', 'dodge-right'):
        dodge = by_id[clip_id]
        dodge['frames'] = [(frame, {name: (angles[0], angles[1], -angles[2])
                           if name in ('Hips', 'Spine', 'Chest', 'Head') else angles
                           for name, angles in rotations.items()}, position)
                           for frame, rotations, position in dodge['frames']]
    for frame in (6, 7):
        _patch_authored_frame(elbow, frame, {'UpperArm_R': (-95, 0, 12), 'Forearm_R': (-165, 0, 0)})
    for frame in (11, 13):
        _patch_authored_frame(shield_slam, frame, {'UpperArm_L': (-24, 0, -10), 'Forearm_L': (-8, 0, 0)}, (0, -.12, -.30))
    shield_slam['motion']['plants'] = [dict(side=side, startFrame=1, endFrame=21, velocity=[0, 0, 0]) for side in ('L', 'R')]
    slam_contact = next(frame for frame in resolve_clip_poses(shield_slam) if frame[0] == 11)
    _patch_authored_frame(shield_slam, 13, slam_contact[1], slam_contact[2])
    shield_slam['motion']['grip'] = dict(side='L', reference='block', orientation=[90, 0, 0],
        phaseOrientations={'load': [-20, 0, 0], 'contact': [90, 0, 0], 'hold': [90, 0, 0],
                           'follow': [45, 0, 0], 'settle': [0, 0, 0]})
    bat['motion']['grip'] = dict(side='R', reference='punch-heavy', axis=[-.95, -.3, 0],
        phaseAxes={'load': [.55, .2, .8], 'contact': [-.95, -.3, 0], 'hold': [-1, -.1, 0],
                   'follow': [-.65, .7, .1], 'settle': [.1, .15, .98]})
    for clip_id in ('crouch-idle', 'crouch-walk'):
        crouch = by_id[clip_id]
        crouch['frames'] = [(frame, {**rotations, **{f'Thigh_{side}': (-62, 0, -12 if side == 'L' else 12) for side in ('L', 'R')},
                                       'Shin_L': (110, 0, 0), 'Shin_R': (110, 0, 0)},
                            (position[0], position[1], -.24)) for frame, rotations, position in resolve_clip_poses(crouch)]

    _set_authored_motion(by_id['crouch-idle'], [('ready', 1), ('breathe', 12), ('loop', 24)], [('L', 1, 24), ('R', 1, 24)])

    # Reload reaches to the magazine and returns to the receiver.
    reload_clip = by_id['rifle-reload']
    _replace_authored_specs(reload_clip, [
        (1, 1, {}, (0, 0, -.065)),
        (10, 10, {'Hips': (-4, 0, 0), 'Spine': (14, 8, 0), 'Chest': (4, 4, 0), 'UpperArm_L': (-20, 0, -20), 'Forearm_L': (-96, 0, 0), 'Hand_L': (-18, -8, 0)}, (0, 0, -.08)),
        (18, 20, {'Hips': (-8, -6, 0), 'Spine': (18, 10, 0), 'Chest': (6, 5, 0), 'UpperArm_L': (-58, 0, -20), 'Forearm_L': (-118, 0, 0), 'Hand_L': (-26, -12, 0)}, (0, -.015, -.10)),
        (26, 28, {'Hips': (-4, 0, 0), 'Spine': (12, 8, 0), 'Chest': (4, 4, 0), 'UpperArm_L': (-46, 0, -10), 'Forearm_L': (-82, 0, 0), 'Hand_L': (-16, -8, 0)}, (0, 0, -.08)),
        (32, 28, {'UpperArm_L': (-64, 0, -4), 'Forearm_L': (-92, 0, 0), 'Hand_L': (-8, 0, 0)}, (0, 0, -.07)),
        (40, 40, {}, (0, 0, -.065)),
    ])
    _set_authored_motion(reload_clip, [('ready', 1), ('reach', 10), ('magazine', 18), ('insert', 26), ('return', 32), ('settle', 40)])
    _set_authored_motion(by_id['rifle-idle'], [('ready', 1), ('breathe', 30), ('loop', 60)])
    _set_authored_motion(by_id['rifle-fire'], [('ready', 1), ('contact', 3), ('recoil', 4), ('settle', 16)])
    _set_authored_motion(by_id['shotgun-fire'], [('ready', 1), ('contact', 3), ('recoil', 5), ('pump-back', 15), ('pump-return', 19), ('settle', 24)])


# =============================================================================
# 85 AUTHORED ANIMATION CLIPS (DISTINCT POSES & TIMING)
# =============================================================================

def build_animation_catalog() -> List[Dict[str, Any]]:
    """Return definitions for all 85 named animation clips."""
    catalog = []

    # -------------------------------------------------------------------------
    # MOVEMENT (16 clips)
    # -------------------------------------------------------------------------
    catalog.append({
        'id': 'idle', 'label': 'Idle', 'category': 'movement', 'loop': True, 'fps': FPS,
        'frames': [
            # The rest pose uses a quiet contrapposto. The root stays fixed, the
            # elbows and knees create a readable side silhouette, and the small
            # Y offsets separate the two limbs in a front view. Frame 60 is an
            # exact copy of frame 1 so the loop closes without a root step.
            (1, {'Hips': (0, -24, 0), 'Spine': (4, -5, 0), 'Chest': (-2, -7, 0), 'Head': (0, -4, 0),
                 'UpperArm_L': (10, -16, -16), 'Forearm_L': (-28, -42, -8), 'Hand_L': (0, -12, 0),
                 'UpperArm_R': (-6, 14, 14), 'Forearm_R': (-22, 34, 8), 'Hand_R': (0, 12, 0),
                 'Thigh_L': (-6, -34, -10), 'Shin_L': (16, -18, 0), 'Foot_L': (-8, 0, 0),
                 'Thigh_R': (2, 30, 8), 'Shin_R': (9, 16, 0), 'Foot_R': (5, 0, 0)}, (0, 0, 0)),
            (15, {'Hips': (0, -18, 0), 'Spine': (2, -2, 0), 'Chest': (1, -4, 0), 'Head': (-1, -2, 0),
                  'UpperArm_L': (6, -11, -12), 'Forearm_L': (-22, -34, -6), 'Hand_L': (0, -10, 0),
                  'UpperArm_R': (-4, 10, 10), 'Forearm_R': (-20, 28, 6), 'Hand_R': (0, 10, 0),
                  'Thigh_L': (-3, -29, -8), 'Shin_L': (12, -14, 0), 'Foot_L': (-5, 0, 0),
                  'Thigh_R': (1, 26, 6), 'Shin_R': (8, 12, 0), 'Foot_R': (3, 0, 0)}, (0, 0, 0)),
            (30, {'Hips': (0, -28, 0), 'Spine': (5, -6, 0), 'Chest': (-3, -9, 0), 'Head': (1, -5, 0),
                  'UpperArm_L': (14, -18, -18), 'Forearm_L': (-32, -46, -9), 'Hand_L': (0, -16, 0),
                  'UpperArm_R': (-8, 16, 16), 'Forearm_R': (-26, 40, 9), 'Hand_R': (0, 16, 0),
                  'Thigh_L': (-8, -42, -12), 'Shin_L': (19, -22, 0), 'Foot_L': (-10, 0, 0),
                  'Thigh_R': (4, 36, 10), 'Shin_R': (11, 20, 0), 'Foot_R': (6, 0, 0)}, (0, 0, 0)),
            (45, {'Hips': (0, -21, 0), 'Spine': (2, -3, 0), 'Chest': (0, -5, 0), 'Head': (-1, -3, 0),
                  'UpperArm_L': (8, -13, -14), 'Forearm_L': (-24, -38, -7), 'Hand_L': (0, -12, 0),
                  'UpperArm_R': (-5, 12, 12), 'Forearm_R': (-21, 32, 7), 'Hand_R': (0, 12, 0),
                  'Thigh_L': (-4, -32, -9), 'Shin_L': (14, -16, 0), 'Foot_L': (-6, 0, 0),
                  'Thigh_R': (2, 28, 7), 'Shin_R': (9, 14, 0), 'Foot_R': (4, 0, 0)}, (0, 0, 0)),
            (60, {'Hips': (0, -24, 0), 'Spine': (4, -5, 0), 'Chest': (-2, -7, 0), 'Head': (0, -4, 0),
                  'UpperArm_L': (10, -16, -16), 'Forearm_L': (-28, -42, -8), 'Hand_L': (0, -12, 0),
                  'UpperArm_R': (-6, 14, 14), 'Forearm_R': (-22, 34, 8), 'Hand_R': (0, 12, 0),
                  'Thigh_L': (-6, -34, -10), 'Shin_L': (16, -18, 0), 'Foot_L': (-8, 0, 0),
                  'Thigh_R': (2, 30, 8), 'Shin_R': (9, 16, 0), 'Foot_R': (5, 0, 0)}, (0, 0, 0)),
        ]
    })

    catalog.append({
        'id': 'walk', 'label': 'Walk', 'category': 'movement', 'loop': True, 'fps': FPS,
        'frames': [
            (1, {'Hips': (-2, 8, 0), 'Spine': (2, -6, 0), 'Chest': (0, -4, 0),
                 'Thigh_L': (-26, 0, 0), 'Shin_L': (6, 0, 0), 'Foot_L': (-15, 0, 0),
                 'Thigh_R': (22, 0, 0), 'Shin_R': (28, 0, 0), 'Foot_R': (20, 0, 0),
                 'UpperArm_L': (20, 0, -4), 'Forearm_L': (-25, 0, 0), 'UpperArm_R': (-25, 0, 4), 'Forearm_R': (-35, 0, 0)}, (0, 0, 0)),
            (8, {'Hips': (0, 0, 0), 'Spine': (1, 0, 0),
                 'Thigh_L': (0, 0, 0), 'Shin_L': (4, 0, 0),
                 'Thigh_R': (-15, 0, 0), 'Shin_R': (55, 0, 0), 'Foot_R': (5, 0, 0),
                 'UpperArm_L': (0, 0, -4), 'UpperArm_R': (0, 0, 4)}, (0, 0, 0.02)),
            (16, {'Hips': (-2, -8, 0), 'Spine': (2, 6, 0), 'Chest': (0, 4, 0),
                  'Thigh_R': (-26, 0, 0), 'Shin_R': (6, 0, 0), 'Foot_R': (-15, 0, 0),
                  'Thigh_L': (22, 0, 0), 'Shin_L': (28, 0, 0), 'Foot_L': (20, 0, 0),
                  'UpperArm_R': (20, 0, 4), 'Forearm_R': (-25, 0, 0), 'UpperArm_L': (-25, 0, -4), 'Forearm_L': (-35, 0, 0)}, (0, 0, 0)),
            (23, {'Hips': (0, 0, 0), 'Spine': (1, 0, 0),
                  'Thigh_R': (0, 0, 0), 'Shin_R': (4, 0, 0),
                  'Thigh_L': (-15, 0, 0), 'Shin_L': (55, 0, 0), 'Foot_L': (5, 0, 0),
                  'UpperArm_R': (0, 0, 4), 'UpperArm_L': (0, 0, -4)}, (0, 0, 0.02)),
            (30, {'Hips': (-2, 8, 0), 'Spine': (2, -6, 0), 'Chest': (0, -4, 0),
                  'Thigh_L': (-26, 0, 0), 'Shin_L': (6, 0, 0), 'Foot_L': (-15, 0, 0),
                  'Thigh_R': (22, 0, 0), 'Shin_R': (28, 0, 0), 'Foot_R': (20, 0, 0),
                  'UpperArm_L': (20, 0, -4), 'Forearm_L': (-25, 0, 0), 'UpperArm_R': (-25, 0, 4), 'Forearm_R': (-35, 0, 0)}, (0, 0, 0)),
        ]
    })

    catalog.append({
        'id': 'run', 'label': 'Run', 'category': 'movement', 'loop': True, 'fps': FPS,
        'frames': [
            # Forward lean starts in the chest. The footfall is visibly offset from the reach.
            (1, {'Hips': (-2, -8, 0), 'Spine': (17, -12, 0), 'Chest': (-6, -10, 0), 'Head': (-4, -5, 0),
                 'Thigh_L': (-48, 0, -4), 'Shin_L': (22, 0, 0), 'Foot_L': (-12, 0, 0),
                 'Thigh_R': (38, 0, 8), 'Shin_R': (72, 0, 0), 'Foot_R': (28, 0, 0),
                 'UpperArm_L': (42, 0, -8), 'Forearm_L': (-82, 0, 0),
                 'UpperArm_R': (-54, 0, 8), 'Forearm_R': (-92, 0, 0)}, (0, 0, -0.04)),
            (6, {'Hips': (1, 0, 0), 'Spine': (12, 2, 0), 'Chest': (-2, 0, 0),
                 'Thigh_L': (30, 0, -6), 'Shin_L': (10, 0, 0), 'Thigh_R': (-58, 0, 6), 'Shin_R': (78, 0, 0),
                 'UpperArm_L': (14, 0, -8), 'Forearm_L': (-70, 0, 0), 'UpperArm_R': (-20, 0, 8), 'Forearm_R': (-82, 0, 0)}, (0, 0, 0.05)),
            (12, {'Hips': (2, 10, 0), 'Spine': (17, 12, 0), 'Chest': (-6, 10, 0), 'Head': (-4, 5, 0),
                  'Thigh_R': (-48, 0, 4), 'Shin_R': (22, 0, 0), 'Foot_R': (-12, 0, 0),
                  'Thigh_L': (38, 0, -8), 'Shin_L': (72, 0, 0), 'Foot_L': (28, 0, 0),
                  'UpperArm_R': (42, 0, 8), 'Forearm_R': (-82, 0, 0),
                  'UpperArm_L': (-54, 0, -8), 'Forearm_L': (-92, 0, 0)}, (0, 0, -0.04)),
            (17, {'Hips': (-1, 0, 0), 'Spine': (12, -2, 0), 'Chest': (-2, 0, 0),
                  'Thigh_R': (30, 0, 6), 'Shin_R': (10, 0, 0), 'Thigh_L': (-58, 0, -6), 'Shin_L': (78, 0, 0),
                  'UpperArm_R': (14, 0, 8), 'Forearm_R': (-70, 0, 0), 'UpperArm_L': (-20, 0, -8), 'Forearm_L': (-82, 0, 0)}, (0, 0, 0.05)),
            (22, {'Hips': (-2, -8, 0), 'Spine': (17, -12, 0), 'Chest': (-6, -10, 0), 'Head': (-4, -5, 0),
                  'Thigh_L': (-48, 0, -4), 'Shin_L': (22, 0, 0), 'Foot_L': (-12, 0, 0),
                  'Thigh_R': (38, 0, 8), 'Shin_R': (72, 0, 0), 'Foot_R': (28, 0, 0),
                  'UpperArm_L': (42, 0, -8), 'Forearm_L': (-82, 0, 0),
                  'UpperArm_R': (-54, 0, 8), 'Forearm_R': (-92, 0, 0)}, (0, 0, -0.04)),
        ]
    })

    catalog.append({
        'id': 'sprint', 'label': 'Sprint', 'category': 'movement', 'loop': True, 'fps': FPS,
        'frames': [
            (1, {'Hips': (-2, -14, 0), 'Spine': (28, -18, 0), 'Chest': (-8, -14, 0), 'Head': (-8, -7, 0),
                 'Thigh_L': (-72, 0, -8), 'Shin_L': (30, 0, 0), 'Foot_L': (-16, 0, 0),
                 'Thigh_R': (50, 0, 10), 'Shin_R': (96, 0, 0), 'Foot_R': (34, 0, 0),
                 'UpperArm_L': (56, 0, -10), 'Forearm_L': (-102, 0, 0),
                 'UpperArm_R': (-72, 0, 10), 'Forearm_R': (-112, 0, 0)}, (0, 0, -0.06)),
            (4, {'Hips': (2, 0, 0), 'Spine': (22, 2, 0), 'Chest': (-3, 0, 0),
                 'Thigh_L': (40, 0, -8), 'Shin_L': (16, 0, 0), 'Thigh_R': (-78, 0, 8), 'Shin_R': (88, 0, 0),
                 'UpperArm_L': (18, 0, -10), 'Forearm_L': (-80, 0, 0), 'UpperArm_R': (-22, 0, 10), 'Forearm_R': (-94, 0, 0)}, (0, 0, 0.07)),
            (9, {'Hips': (2, 14, 0), 'Spine': (28, 18, 0), 'Chest': (-8, 14, 0), 'Head': (-8, 7, 0),
                 'Thigh_R': (-72, 0, 8), 'Shin_R': (30, 0, 0), 'Foot_R': (-16, 0, 0),
                 'Thigh_L': (50, 0, -10), 'Shin_L': (96, 0, 0), 'Foot_L': (34, 0, 0),
                 'UpperArm_R': (56, 0, 10), 'Forearm_R': (-102, 0, 0),
                 'UpperArm_L': (-72, 0, -10), 'Forearm_L': (-112, 0, 0)}, (0, 0, -0.06)),
            (12, {'Hips': (-2, 0, 0), 'Spine': (22, -2, 0), 'Chest': (-3, 0, 0),
                  'Thigh_R': (40, 0, 8), 'Shin_R': (16, 0, 0), 'Thigh_L': (-78, 0, -8), 'Shin_L': (88, 0, 0),
                  'UpperArm_R': (18, 0, 10), 'Forearm_R': (-80, 0, 0), 'UpperArm_L': (-22, 0, -10), 'Forearm_L': (-94, 0, 0)}, (0, 0, 0.07)),
            (16, {'Hips': (-2, -14, 0), 'Spine': (28, -18, 0), 'Chest': (-8, -14, 0), 'Head': (-8, -7, 0),
                  'Thigh_L': (-72, 0, -8), 'Shin_L': (30, 0, 0), 'Foot_L': (-16, 0, 0),
                  'Thigh_R': (50, 0, 10), 'Shin_R': (96, 0, 0), 'Foot_R': (34, 0, 0),
                  'UpperArm_L': (56, 0, -10), 'Forearm_L': (-102, 0, 0),
                  'UpperArm_R': (-72, 0, 10), 'Forearm_R': (-112, 0, 0)}, (0, 0, -0.06)),
        ]
    })

    catalog.append({
        'id': 'strafe-left', 'label': 'Strafe Left', 'category': 'movement', 'loop': True, 'fps': FPS,
        'frames': [
            (1, {'Hips': (0, 0, 6), 'Spine': (0, 0, -4), 'Thigh_L': (0, 0, -22), 'Shin_L': (12, 0, 0),
                 'Thigh_R': (0, 0, -6), 'UpperArm_L': (-15, 0, -10), 'Forearm_L': (-45, 0, 0), 'UpperArm_R': (-15, 0, 10), 'Forearm_R': (-45, 0, 0)}, (-0.05, 0, 0)),
            (12, {'Hips': (0, 0, -6), 'Spine': (0, 0, 4), 'Thigh_L': (0, 0, 4), 'Thigh_R': (0, 0, -22), 'Shin_R': (14, 0, 0)}, (0.04, 0, 0)),
            (24, {'Hips': (0, 0, 6), 'Spine': (0, 0, -4), 'Thigh_L': (0, 0, -22), 'Shin_L': (12, 0, 0),
                  'Thigh_R': (0, 0, -6), 'UpperArm_L': (-15, 0, -10), 'Forearm_L': (-45, 0, 0), 'UpperArm_R': (-15, 0, 10), 'Forearm_R': (-45, 0, 0)}, (-0.05, 0, 0)),
        ]
    })

    catalog.append({
        'id': 'strafe-right', 'label': 'Strafe Right', 'category': 'movement', 'loop': True, 'fps': FPS,
        'frames': [
            (1, {'Hips': (0, 0, -6), 'Spine': (0, 0, 4), 'Thigh_R': (0, 0, 22), 'Shin_R': (12, 0, 0),
                 'Thigh_L': (0, 0, 6), 'UpperArm_R': (-15, 0, 10), 'Forearm_R': (-45, 0, 0), 'UpperArm_L': (-15, 0, -10), 'Forearm_L': (-45, 0, 0)}, (0.05, 0, 0)),
            (12, {'Hips': (0, 0, 6), 'Spine': (0, 0, -4), 'Thigh_R': (0, 0, -4), 'Thigh_L': (0, 0, 22), 'Shin_L': (14, 0, 0)}, (-0.04, 0, 0)),
            (24, {'Hips': (0, 0, -6), 'Spine': (0, 0, 4), 'Thigh_R': (0, 0, 22), 'Shin_R': (12, 0, 0),
                  'Thigh_L': (0, 0, 6), 'UpperArm_R': (-15, 0, 10), 'Forearm_R': (-45, 0, 0), 'UpperArm_L': (-15, 0, -10), 'Forearm_L': (-45, 0, 0)}, (0.05, 0, 0)),
        ]
    })

    catalog.append({
        'id': 'walk-backward', 'label': 'Walk Backward', 'category': 'movement', 'loop': True, 'fps': FPS,
        'frames': [
            (1, {'Spine': (4, -5, 0), 'Thigh_L': (24, 0, 0), 'Shin_L': (22, 0, 0), 'Thigh_R': (-18, 0, 0), 'Shin_R': (5, 0, 0),
                 'UpperArm_L': (-22, 0, -6), 'UpperArm_R': (18, 0, 6)}, (0, 0, 0)),
            (15, {'Spine': (4, 5, 0), 'Thigh_R': (24, 0, 0), 'Shin_R': (22, 0, 0), 'Thigh_L': (-18, 0, 0), 'Shin_L': (5, 0, 0),
                  'UpperArm_R': (-22, 0, 6), 'UpperArm_L': (18, 0, -6)}, (0, 0, 0)),
            (30, {'Spine': (4, -5, 0), 'Thigh_L': (24, 0, 0), 'Shin_L': (22, 0, 0), 'Thigh_R': (-18, 0, 0), 'Shin_R': (5, 0, 0),
                  'UpperArm_L': (-22, 0, -6), 'UpperArm_R': (18, 0, 6)}, (0, 0, 0)),
        ]
    })

    catalog.append({
        'id': 'jump-start', 'label': 'Jump Start', 'category': 'movement', 'loop': False, 'fps': FPS,
        'frames': [
            # A low, asymmetric anticipation gives the launch a clear source.
            (1, {'Hips': (-2, -8, 0), 'Spine': (18, -10, 0), 'Chest': (-6, -8, 0),
                 'Thigh_L': (-38, 0, -8), 'Shin_L': (72, 0, 0), 'Foot_L': (-12, 0, 0),
                 'Thigh_R': (-20, 0, 12), 'Shin_R': (46, 0, 0), 'Foot_R': (-4, 0, 0),
                 'UpperArm_L': (28, 0, -10), 'Forearm_L': (-48, 0, 0),
                 'UpperArm_R': (18, 0, 12), 'Forearm_R': (-58, 0, 0)}, (0, 0, 0)),
            (4, {'Hips': (-1, -2, 0), 'Spine': (28, 0, 0), 'Chest': (-4, 0, 0),
                 'Thigh_L': (-56, 0, -8), 'Shin_L': (84, 0, 0), 'Thigh_R': (-44, 0, 10), 'Shin_R': (70, 0, 0),
                 'UpperArm_L': (44, 0, -10), 'Forearm_L': (-62, 0, 0), 'UpperArm_R': (34, 0, 12), 'Forearm_R': (-72, 0, 0)}, (0, 0, -0.08)),
            (7, {'Hips': (0, 4, 0), 'Spine': (34, 4, 0), 'Chest': (-2, 3, 0),
                 'Thigh_L': (-66, 0, -8), 'Shin_L': (90, 0, 0), 'Thigh_R': (-56, 0, 10), 'Shin_R': (82, 0, 0),
                 'UpperArm_L': (52, 0, -10), 'Forearm_L': (-76, 0, 0), 'UpperArm_R': (44, 0, 12), 'Forearm_R': (-84, 0, 0)}, (0, 0, -0.22)),
            (12, {'Hips': (1, 0, 0), 'Spine': (-10, 0, 0), 'Chest': (4, 0, 0),
                  'Thigh_L': (8, 0, -8), 'Shin_L': (8, 0, 0), 'Thigh_R': (16, 0, 10), 'Shin_R': (4, 0, 0),
                  'UpperArm_L': (-82, 0, -16), 'Forearm_L': (-28, 0, 0),
                  'UpperArm_R': (-72, 0, 16), 'Forearm_R': (-34, 0, 0)}, (0, 0, 0.12)),
        ]
    })

    catalog.append({
        'id': 'jump-loop', 'label': 'Jump Loop', 'category': 'movement', 'loop': True, 'fps': FPS,
        'frames': [
            # Keep the knees and arms offset so the airborne silhouette reads as action.
            (1, {'Spine': (-8, -4, 0), 'Chest': (2, -3, 0), 'Head': (4, 2, 0),
                 'Thigh_L': (-30, 0, -12), 'Shin_L': (46, 0, 0), 'Foot_L': (-8, 0, 0),
                 'Thigh_R': (-20, 0, 10), 'Shin_R': (34, 0, 0), 'Foot_R': (8, 0, 0),
                 'UpperArm_L': (-52, 0, -24), 'Forearm_L': (-30, 0, 0),
                 'UpperArm_R': (-42, 0, 18), 'Forearm_R': (-22, 0, 0)}, (0, 0, 0.14)),
            (9, {'Spine': (-4, 4, 0), 'Chest': (4, 2, 0), 'Head': (2, -2, 0),
                 'Thigh_L': (-34, 0, -10), 'Shin_L': (54, 0, 0), 'Foot_L': (-10, 0, 0),
                 'Thigh_R': (-24, 0, 12), 'Shin_R': (42, 0, 0), 'Foot_R': (10, 0, 0),
                 'UpperArm_L': (-56, 0, -26), 'Forearm_L': (-34, 0, 0),
                 'UpperArm_R': (-46, 0, 20), 'Forearm_R': (-26, 0, 0)}, (0, 0, 0.16)),
            (18, {'Spine': (-8, -4, 0), 'Chest': (2, -3, 0), 'Head': (4, 2, 0),
                  'Thigh_L': (-30, 0, -12), 'Shin_L': (46, 0, 0), 'Foot_L': (-8, 0, 0),
                  'Thigh_R': (-20, 0, 10), 'Shin_R': (34, 0, 0), 'Foot_R': (8, 0, 0),
                  'UpperArm_L': (-52, 0, -24), 'Forearm_L': (-30, 0, 0),
                  'UpperArm_R': (-42, 0, 18), 'Forearm_R': (-22, 0, 0)}, (0, 0, 0.14)),
        ]
    })

    catalog.append({
        'id': 'jump-land', 'label': 'Jump Land', 'category': 'movement', 'loop': False, 'fps': FPS,
        'frames': [
            # Land over a wide base. The first frame keeps the incoming line of action.
            (1, {'Hips': (-2, 0, 0), 'Spine': (8, -6, 0), 'Chest': (2, -4, 0), 'Head': (-2, 0, 0),
                 'Thigh_L': (-18, 0, -8), 'Shin_L': (24, 0, 0), 'Foot_L': (-8, 0, 0),
                 'Thigh_R': (-8, 0, 10), 'Shin_R': (16, 0, 0), 'Foot_R': (-4, 0, 0),
                 'UpperArm_L': (-12, 0, -18), 'Forearm_L': (-36, 0, 0),
                 'UpperArm_R': (-8, 0, 16), 'Forearm_R': (-32, 0, 0)}, (0, 0, 0.05)),
            (5, {'Hips': (-3, -4, 0), 'Spine': (24, -8, 0), 'Chest': (-4, -6, 0),
                 'Thigh_L': (-56, 0, -12), 'Shin_L': (78, 0, 0), 'Foot_L': (-18, 0, 0),
                 'Thigh_R': (-44, 0, 14), 'Shin_R': (70, 0, 0), 'Foot_R': (-10, 0, 0),
                 'UpperArm_L': (-28, 0, -24), 'Forearm_L': (-52, 0, 0),
                 'UpperArm_R': (-18, 0, 22), 'Forearm_R': (-48, 0, 0)}, (0, 0, -0.18)),
            (8, {'Hips': (-2, -2, 0), 'Spine': (31, -4, 0), 'Chest': (-5, -3, 0),
                 'Thigh_L': (-68, 0, -12), 'Shin_L': (88, 0, 0), 'Foot_L': (-20, 0, 0),
                 'Thigh_R': (-56, 0, 14), 'Shin_R': (80, 0, 0), 'Foot_R': (-14, 0, 0),
                 'UpperArm_L': (-34, 0, -26), 'Forearm_L': (-58, 0, 0),
                 'UpperArm_R': (-24, 0, 24), 'Forearm_R': (-54, 0, 0)}, (0, 0, -0.24)),
            (15, {'Hips': (0, 0, 0), 'Spine': (3, 0, 0), 'Chest': (2, 0, 0), 'Head': (-1, 0, 0),
                  'Thigh_L': (-6, 0, -8), 'Shin_L': (12, 0, 0), 'Foot_L': (-4, 0, 0),
                  'Thigh_R': (2, 0, 8), 'Shin_R': (8, 0, 0), 'Foot_R': (-4, 0, 0),
                  'UpperArm_L': (4, 0, -8), 'Forearm_L': (-18, 0, 0),
                  'UpperArm_R': (2, 0, 8), 'Forearm_R': (-18, 0, 0)}, (0, 0, 0)),
        ]
    })

    catalog.append({
        'id': 'double-jump', 'label': 'Double Jump', 'category': 'movement', 'loop': False, 'fps': FPS,
        'frames': [
            (1, {'Spine': (0, 0, 0), 'Thigh_L': (-20, 0, 0), 'Shin_L': (30, 0, 0), 'Thigh_R': (-20, 0, 0), 'Shin_R': (30, 0, 0)}, (0, 0, 0)),
            (6, {'Spine': (35, 0, 0), 'Thigh_L': (-75, 0, 0), 'Shin_L': (95, 0, 0), 'Thigh_R': (-75, 0, 0), 'Shin_R': (95, 0, 0),
                 'UpperArm_L': (25, 0, -10), 'Forearm_L': (-75, 0, 0), 'UpperArm_R': (25, 0, 10), 'Forearm_R': (-75, 0, 0)}, (0, 0, -0.05)),
            (14, {'Spine': (-15, 0, 0), 'Thigh_L': (10, 0, 0), 'Shin_L': (5, 0, 0), 'Thigh_R': (10, 0, 0), 'Shin_R': (5, 0, 0),
                  'UpperArm_L': (-90, 0, -15), 'Forearm_L': (-10, 0, 0), 'UpperArm_R': (-90, 0, 15), 'Forearm_R': (-10, 0, 0)}, (0, 0, 0.22)),
            (20, {'Spine': (0, 0, 0), 'Thigh_L': (-10, 0, 0), 'Shin_L': (15, 0, 0), 'Thigh_R': (-10, 0, 0), 'Shin_R': (15, 0, 0)}, (0, 0, 0.10)),
        ]
    })

    catalog.append({
        'id': 'slide', 'label': 'Slide', 'category': 'movement', 'loop': False, 'fps': FPS,
        'frames': [
            (1, {'Spine': (15, 0, 0), 'Thigh_L': (-35, 0, 0), 'Shin_L': (45, 0, 0), 'Thigh_R': (-35, 0, 0), 'Shin_R': (45, 0, 0)}, (0, 0, -0.10)),
            (8, {'Hips': (-15, 0, 0), 'Spine': (-25, 0, -15), 'Thigh_L': (-75, 0, -10), 'Shin_L': (10, 0, 0), 'Foot_L': (-25, 0, 0),
                 'Thigh_R': (25, 0, 20), 'Shin_R': (90, 0, 0), 'UpperArm_R': (15, 0, 25), 'Forearm_R': (-35, 0, 0),
                 'UpperArm_L': (-45, 0, -20), 'Forearm_L': (-45, 0, 0)}, (0, 0, -0.48)),
            (18, {'Hips': (-10, 0, 0), 'Spine': (-15, 0, -10), 'Thigh_L': (-65, 0, 0), 'Shin_L': (25, 0, 0)}, (0, 0, -0.42)),
            (24, {'Spine': (5, 0, 0), 'Thigh_L': (-10, 0, 0), 'Shin_L': (15, 0, 0), 'Thigh_R': (-10, 0, 0), 'Shin_R': (15, 0, 0)}, (0, 0, 0)),
        ]
    })

    catalog.append({
        'id': 'vault', 'label': 'Vault', 'category': 'movement', 'loop': False, 'fps': FPS,
        'frames': [
            (1, {'Spine': (15, 0, 0), 'UpperArm_L': (-45, 0, -8), 'UpperArm_R': (-45, 0, 8)}, (0, 0, 0)),
            (6, {'Spine': (35, 0, 0), 'UpperArm_L': (-75, 0, -5), 'Forearm_L': (-15, 0, 0), 'UpperArm_R': (-75, 0, 5), 'Forearm_R': (-15, 0, 0),
                 'Thigh_L': (-65, 0, 25), 'Shin_L': (85, 0, 0), 'Thigh_R': (-65, 0, 25), 'Shin_R': (85, 0, 0)}, (0, 0, 0.18)),
            (14, {'Spine': (-10, 0, 0), 'Thigh_L': (-25, 0, 0), 'Shin_L': (35, 0, 0), 'Thigh_R': (-25, 0, 0), 'Shin_R': (35, 0, 0)}, (0, 0, 0.10)),
            (24, {'Spine': (2, 0, 0), 'Thigh_L': (0, 0, 0), 'Shin_L': (4, 0, 0), 'Thigh_R': (0, 0, 0), 'Shin_R': (4, 0, 0)}, (0, 0, 0)),
        ]
    })

    catalog.append({
        'id': 'climb', 'label': 'Climb', 'category': 'movement', 'loop': True, 'fps': FPS,
        'frames': [
            (1, {'Spine': (5, 0, 0), 'UpperArm_L': (-120, 0, -8), 'Forearm_L': (-35, 0, 0), 'UpperArm_R': (-60, 0, 8), 'Forearm_R': (-75, 0, 0),
                 'Thigh_L': (-55, 0, 0), 'Shin_L': (65, 0, 0), 'Thigh_R': (10, 0, 0), 'Shin_R': (15, 0, 0)}, (0, 0, 0)),
            (15, {'Spine': (5, 0, 0), 'UpperArm_R': (-120, 0, 8), 'Forearm_R': (-35, 0, 0), 'UpperArm_L': (-60, 0, -8), 'Forearm_L': (-75, 0, 0),
                  'Thigh_R': (-55, 0, 0), 'Shin_R': (65, 0, 0), 'Thigh_L': (10, 0, 0), 'Shin_L': (15, 0, 0)}, (0, 0, 0.08)),
            (30, {'Spine': (5, 0, 0), 'UpperArm_L': (-120, 0, -8), 'Forearm_L': (-35, 0, 0), 'UpperArm_R': (-60, 0, 8), 'Forearm_R': (-75, 0, 0),
                  'Thigh_L': (-55, 0, 0), 'Shin_L': (65, 0, 0), 'Thigh_R': (10, 0, 0), 'Shin_R': (15, 0, 0)}, (0, 0, 0)),
        ]
    })

    catalog.append({
        'id': 'wall-run', 'label': 'Wall Run', 'category': 'movement', 'loop': True, 'fps': FPS,
        'frames': [
            (1, {'Hips': (0, 0, 18), 'Spine': (15, 0, -10),
                 'Thigh_L': (-50, 0, 15), 'Shin_L': (25, 0, 0), 'Thigh_R': (35, 0, 0), 'Shin_R': (75, 0, 0),
                 'UpperArm_L': (-35, 0, 10), 'Forearm_L': (-60, 0, 0), 'UpperArm_R': (30, 0, 15), 'Forearm_R': (-70, 0, 0)}, (0, 0, 0.12)),
            (10, {'Hips': (0, 0, 18), 'Spine': (15, 0, -10),
                  'Thigh_R': (-50, 0, 15), 'Shin_R': (25, 0, 0), 'Thigh_L': (35, 0, 0), 'Shin_L': (75, 0, 0),
                  'UpperArm_R': (-35, 0, 15), 'Forearm_R': (-60, 0, 0), 'UpperArm_L': (30, 0, 10), 'Forearm_L': (-70, 0, 0)}, (0, 0, 0.16)),
            (20, {'Hips': (0, 0, 18), 'Spine': (15, 0, -10),
                  'Thigh_L': (-50, 0, 15), 'Shin_L': (25, 0, 0), 'Thigh_R': (35, 0, 0), 'Shin_R': (75, 0, 0),
                  'UpperArm_L': (-35, 0, 10), 'Forearm_L': (-60, 0, 0), 'UpperArm_R': (30, 0, 15), 'Forearm_R': (-70, 0, 0)}, (0, 0, 0.12)),
        ]
    })

    catalog.append({
        'id': 'roll', 'label': 'Roll', 'category': 'movement', 'loop': False, 'fps': FPS,
        'frames': [
            (1, {'Spine': (25, 0, 0), 'Thigh_L': (-35, 0, 0), 'Shin_L': (55, 0, 0)}, (0, 0, 0)),
            (6, {'Hips': (90, 0, 0), 'Spine': (45, 0, 0), 'Thigh_L': (-75, 0, 0), 'Shin_L': (95, 0, 0), 'Thigh_R': (-75, 0, 0), 'Shin_R': (95, 0, 0)}, (0, 0, -0.45)),
            (12, {'Hips': (180, 0, 0), 'Spine': (45, 0, 0), 'Thigh_L': (-75, 0, 0), 'Shin_L': (95, 0, 0)}, (0, 0, -0.45)),
            (18, {'Hips': (270, 0, 0), 'Spine': (35, 0, 0), 'Thigh_L': (-65, 0, 0), 'Shin_L': (85, 0, 0)}, (0, 0, -0.30)),
            (24, {'Hips': (360, 0, 0), 'Spine': (5, 0, 0), 'Thigh_L': (-2, 0, 0), 'Shin_L': (4, 0, 0)}, (0, 0, 0)),
        ]
    })

    # -------------------------------------------------------------------------
    # MELEE COMBAT (16 clips)
    # -------------------------------------------------------------------------
    catalog.append({
        'id': 'punch-left', 'label': 'Punch Left', 'category': 'melee', 'loop': False, 'fps': FPS,
        'contact_frame': 8,
        'frames': [
            # Wide guard. The left foot carries the line of action.
            (1, {'Hips': (0, -8, 0), 'Spine': (8, 0, 0), 'Chest': (3, 0, 0),
                 'UpperArm_L': (-45, 0, 15), 'Forearm_L': (-75, 0, 0),
                 'UpperArm_R': (-40, 0, -15), 'Forearm_R': (-80, 0, 0),
                 'Thigh_L': (-16, 0, -8), 'Shin_L': (22, 0, 0),
                 'Thigh_R': (12, 0, 10), 'Shin_R': (12, 0, 0)}, (0, 0, 0)),
            # Load away from the strike, with the elbow visibly behind the fist.
            (3, {'Hips': (0, 14, 0), 'Spine': (15, 22, 0), 'Chest': (-4, 12, 0),
                 'UpperArm_L': (24, 0, 28), 'Forearm_L': (-105, 0, 0),
                 'UpperArm_R': (-44, 0, -20), 'Forearm_R': (-82, 0, 0)}, (0, 0, 0)),
            (6, {'Hips': (0, -12, 0), 'Spine': (7, -10, 0), 'Chest': (1, -6, 0),
                 'UpperArm_L': (-58, 0, 10), 'Forearm_L': (-50, 0, 0),
                 'UpperArm_R': (-46, 0, -18), 'Forearm_R': (-88, 0, 0)}, (0, 0, 0)),
            # Contact at frame 8. The one-frame hold makes the hit readable.
            (8, {'Hips': (0, -8, 0), 'Spine': (18, -6, 0), 'Chest': (3, -4, 0),
                 'UpperArm_L': (-92, 0, 5), 'Forearm_L': (-4, 0, 0), 'Hand_L': (-6, 0, 0),
                 'UpperArm_R': (-45, 0, -18), 'Forearm_R': (-88, 0, 0),
                 'Thigh_L': (-18, 0, -10), 'Shin_L': (24, 0, 0),
                 'Thigh_R': (16, 0, 12), 'Shin_R': (14, 0, 0)}, (0, 0, 0)),
            (9, {'Hips': (0, -8, 0), 'Spine': (17, -6, 0), 'Chest': (3, -4, 0),
                 'UpperArm_L': (-90, 0, 5), 'Forearm_L': (-5, 0, 0), 'Hand_L': (-6, 0, 0)}, (0, 0, 0)),
            # Follow-through drops the fist and lets the shoulder lead.
            (12, {'Hips': (0, -8, 0), 'Spine': (5, -8, 0), 'Chest': (3, -3, 0),
                  'UpperArm_L': (-62, 0, 8), 'Forearm_L': (-36, 0, 0),
                  'UpperArm_R': (-34, 0, -15), 'Forearm_R': (-72, 0, 0)}, (0, 0, 0)),
            (16, {'Hips': (0, 0, 0), 'Spine': (8, 0, 0), 'Chest': (4, 0, 0),
                  'UpperArm_L': (-45, 0, 15), 'Forearm_L': (-75, 0, 0),
                  'UpperArm_R': (-40, 0, -15), 'Forearm_R': (-80, 0, 0)}, (0, 0, 0)),
        ]
    })

    catalog.append({
        'id': 'punch-right', 'label': 'Punch Right', 'category': 'melee', 'loop': False, 'fps': FPS,
        'contact_frame': 9,
        'frames': [
            (1, {'Hips': (0, 8, 0), 'Spine': (8, 0, 0), 'Chest': (3, 0, 0),
                 'UpperArm_L': (-45, 0, 18), 'Forearm_L': (-80, 0, 0),
                 'UpperArm_R': (-40, 0, -15), 'Forearm_R': (-80, 0, 0),
                 'Thigh_L': (12, 0, -10), 'Shin_L': (14, 0, 0),
                 'Thigh_R': (-16, 0, 8), 'Shin_R': (22, 0, 0)}, (0, 0, 0)),
            # Load to the right and keep the guard hand high.
            (4, {'Hips': (0, -16, 0), 'Spine': (15, -24, 0), 'Chest': (-4, -12, 0),
                 'UpperArm_R': (22, 0, -30), 'Forearm_R': (-108, 0, 0),
                 'UpperArm_L': (-52, 0, 20), 'Forearm_L': (-72, 0, 0)}, (0, 0, 0)),
            (7, {'Hips': (0, 10, 0), 'Spine': (6, 12, 0), 'Chest': (1, 7, 0),
                 'UpperArm_R': (-56, 0, -8), 'Forearm_R': (-48, 0, 0),
                 'UpperArm_L': (-48, 0, 18), 'Forearm_L': (-86, 0, 0)}, (0, 0, 0)),
            # Contact at frame 9. The right cross holds for one frame.
            (9, {'Hips': (0, 8, 0), 'Spine': (18, 6, 0), 'Chest': (3, 4, 0),
                 'UpperArm_R': (-92, 0, -5), 'Forearm_R': (-4, 0, 0), 'Hand_R': (-6, 0, 0),
                 'UpperArm_L': (-48, 0, 20), 'Forearm_L': (-82, 0, 0),
                 'Thigh_L': (16, 0, -12), 'Shin_L': (14, 0, 0),
                 'Thigh_R': (-18, 0, 10), 'Shin_R': (24, 0, 0)}, (0, 0, 0)),
            (10, {'Hips': (0, 8, 0), 'Spine': (17, 6, 0), 'Chest': (3, 4, 0),
                  'UpperArm_R': (-90, 0, -5), 'Forearm_R': (-5, 0, 0), 'Hand_R': (-6, 0, 0)}, (0, 0, 0)),
            (13, {'Hips': (0, 8, 0), 'Spine': (5, 8, 0), 'Chest': (3, 4, 0),
                  'UpperArm_R': (-62, 0, -8), 'Forearm_R': (-34, 0, 0),
                  'UpperArm_L': (-40, 0, 16), 'Forearm_L': (-72, 0, 0)}, (0, 0, 0)),
            (18, {'Hips': (0, 0, 0), 'Spine': (8, 0, 0), 'Chest': (4, 0, 0),
                  'UpperArm_L': (-45, 0, 15), 'Forearm_L': (-75, 0, 0),
                  'UpperArm_R': (-40, 0, -15), 'Forearm_R': (-80, 0, 0)}, (0, 0, 0)),
        ]
    })

    catalog.append({
        'id': 'punch-heavy', 'label': 'Punch Heavy', 'category': 'melee', 'loop': False, 'fps': FPS,
        'contact_frame': 12,
        'frames': [
            (1, {'Hips': (0, -8, 0), 'Spine': (10, 0, 0), 'Chest': (4, 0, 0),
                 'UpperArm_L': (-50, 0, 16), 'Forearm_L': (-78, 0, 0),
                 'UpperArm_R': (-42, 0, -16), 'Forearm_R': (-84, 0, 0),
                 'Thigh_L': (-24, 0, -14), 'Shin_L': (28, 0, 0),
                 'Thigh_R': (18, 0, 14), 'Shin_R': (18, 0, 0)}, (0, 0, 0)),
            # Deep coil. The rear elbow and shoulder carry the force.
            (5, {'Hips': (0, 26, 0), 'Spine': (-16, 38, 0), 'Chest': (-7, 20, 0),
                 'UpperArm_R': (34, 0, 48), 'Forearm_R': (-110, 0, 0),
                 'UpperArm_L': (-52, 0, 22), 'Forearm_L': (-84, 0, 0),
                 'Thigh_L': (-28, 0, -18), 'Shin_L': (34, 0, 0),
                 'Thigh_R': (20, 0, 16), 'Shin_R': (20, 0, 0)}, (0, 0, -0.04)),
            (9, {'Hips': (0, -18, 0), 'Spine': (5, -18, 0), 'Chest': (2, -8, 0),
                  'UpperArm_R': (-48, 0, -26), 'Forearm_R': (-45, 0, 0),
                  'UpperArm_L': (-46, 0, 20), 'Forearm_L': (-86, 0, 0)}, (0, 0, -0.02)),
            # Contact at frame 12. The torso and rear leg make a clear diagonal.
            (12, {'Hips': (0, -28, 0), 'Spine': (34, 34, 0), 'Chest': (8, 10, 0),
                  'UpperArm_R': (-108, 0, -8), 'Forearm_R': (-7, 0, 0), 'Hand_R': (-7, 0, 0),
                  'UpperArm_L': (-50, 0, 22), 'Forearm_L': (-84, 0, 0),
                  'Thigh_L': (-30, 0, -18), 'Shin_L': (36, 0, 0),
                  'Thigh_R': (22, 0, 16), 'Shin_R': (22, 0, 0)}, (0, 0, -0.02)),
            (13, {'Hips': (0, -27, 0), 'Spine': (33, 33, 0), 'Chest': (8, 10, 0),
                  'UpperArm_R': (-106, 0, -8), 'Forearm_R': (-8, 0, 0), 'Hand_R': (-7, 0, 0)}, (0, 0, -0.02)),
            (17, {'Hips': (0, -12, 0), 'Spine': (12, 16, 0), 'Chest': (5, 8, 0),
                  'UpperArm_R': (-60, 0, -15), 'Forearm_R': (-38, 0, 0),
                  'UpperArm_L': (-42, 0, 18), 'Forearm_L': (-78, 0, 0)}, (0, 0, 0)),
            (24, {'Hips': (0, 0, 0), 'Spine': (8, 0, 0), 'Chest': (4, 0, 0),
                  'UpperArm_L': (-45, 0, 15), 'Forearm_L': (-75, 0, 0),
                  'UpperArm_R': (-40, 0, -15), 'Forearm_R': (-80, 0, 0)}, (0, 0, 0)),
        ]
    })

    catalog.append({
        'id': 'uppercut', 'label': 'Uppercut', 'category': 'melee', 'loop': False, 'fps': FPS,
        'contact_frame': 11,
        'frames': [
            (1, {'Hips': (0, -6, 0), 'Spine': (8, 0, 0), 'Chest': (4, 0, 0),
                 'UpperArm_L': (-45, 0, 18), 'Forearm_L': (-78, 0, 0),
                 'UpperArm_R': (-40, 0, -15), 'Forearm_R': (-84, 0, 0),
                 'Thigh_L': (-18, 0, -10), 'Shin_L': (26, 0, 0),
                 'Thigh_R': (16, 0, 8), 'Shin_R': (14, 0, 0)}, (0, 0, 0)),
            # Crouch before the upward drive.
            (4, {'Hips': (0, -12, 0), 'Spine': (20, -20, 0), 'Chest': (-5, -10, 0),
                 'UpperArm_R': (24, 0, -18), 'Forearm_R': (-108, 0, 0),
                 'UpperArm_L': (-50, 0, 20), 'Forearm_L': (-84, 0, 0),
                 'Thigh_R': (-26, 0, 10), 'Shin_R': (48, 0, 0)}, (0, 0, -0.08)),
            (8, {'Hips': (0, 8, 0), 'Spine': (-4, 12, 0), 'Chest': (2, 7, 0),
                 'UpperArm_R': (-4, 0, -10), 'Forearm_R': (-78, 0, 0),
                 'UpperArm_L': (-48, 0, 20), 'Forearm_L': (-84, 0, 0),
                 'Thigh_R': (-12, 0, 8), 'Shin_R': (25, 0, 0)}, (0, 0, 0.02)),
            # Contact at frame 11. The fist travels up through the center line.
            (11, {'Hips': (0, 16, 0), 'Spine': (-20, 20, 0), 'Chest': (5, 12, 0),
                  'UpperArm_R': (-108, 0, 8), 'Forearm_R': (-12, 0, 0), 'Hand_R': (-5, 0, 0),
                  'UpperArm_L': (-48, 0, 20), 'Forearm_L': (-84, 0, 0),
                  'Thigh_L': (-24, 0, -10), 'Shin_L': (30, 0, 0),
                  'Thigh_R': (2, 0, 8), 'Shin_R': (8, 0, 0)}, (0, 0, 0.04)),
            (12, {'Hips': (0, 16, 0), 'Spine': (-19, 19, 0), 'Chest': (5, 12, 0),
                  'UpperArm_R': (-106, 0, 8), 'Forearm_R': (-13, 0, 0), 'Hand_R': (-5, 0, 0)}, (0, 0, 0.04)),
            (16, {'Hips': (0, 8, 0), 'Spine': (-8, 10, 0), 'Chest': (3, 6, 0),
                  'UpperArm_R': (-82, 0, 4), 'Forearm_R': (-34, 0, 0),
                  'UpperArm_L': (-42, 0, 18), 'Forearm_L': (-78, 0, 0)}, (0, 0, 0.01)),
            (20, {'Hips': (0, 0, 0), 'Spine': (8, 0, 0), 'Chest': (4, 0, 0),
                  'UpperArm_L': (-45, 0, 15), 'Forearm_L': (-75, 0, 0),
                  'UpperArm_R': (-40, 0, -15), 'Forearm_R': (-80, 0, 0)}, (0, 0, 0)),
        ]
    })

    catalog.append({
        'id': 'kick-front', 'label': 'Kick Front', 'category': 'melee', 'loop': False, 'fps': FPS,
        'contact_frame': 9,
        'frames': [
            (1, {'Hips': (0, -8, 0), 'Spine': (10, 0, 0), 'Chest': (4, 0, 0),
                 'UpperArm_L': (-48, 0, 18), 'Forearm_L': (-78, 0, 0),
                 'UpperArm_R': (-42, 0, -16), 'Forearm_R': (-84, 0, 0),
                 'Thigh_L': (-20, 0, -10), 'Shin_L': (24, 0, 0),
                 'Thigh_R': (14, 0, 10), 'Shin_R': (14, 0, 0)}, (0, 0, 0)),
            # Chamber the knee and counterbalance with the shoulders.
            (4, {'Hips': (0, -14, 0), 'Spine': (14, -18, 0), 'Chest': (-3, -10, 0),
                 'UpperArm_L': (-58, 0, 22), 'Forearm_L': (-72, 0, 0),
                 'UpperArm_R': (-26, 0, -28), 'Forearm_R': (-108, 0, 0),
                 'Thigh_R': (-102, 0, 0), 'Shin_R': (118, 0, 0),
                 'Thigh_L': (-24, 0, -14), 'Shin_L': (30, 0, 0)}, (0, 0, 0)),
            (7, {'Hips': (0, -8, 0), 'Spine': (-4, -8, 0), 'Chest': (2, -4, 0),
                 'UpperArm_L': (-52, 0, 20), 'Forearm_L': (-76, 0, 0),
                 'UpperArm_R': (-34, 0, -22), 'Forearm_R': (-94, 0, 0),
                 'Thigh_R': (-92, 0, 0), 'Shin_R': (24, 0, 0), 'Foot_R': (12, 0, 0)}, (0, 0, 0.01)),
            # Contact at frame 9. The foot stays extended for one frame.
            (9, {'Hips': (0, -12, 0), 'Spine': (-20, -14, 0), 'Chest': (5, -8, 0),
                 'UpperArm_L': (-56, 0, 22), 'Forearm_L': (-72, 0, 0),
                 'UpperArm_R': (-24, 0, -30), 'Forearm_R': (-108, 0, 0),
                 'Thigh_R': (-92, 0, 0), 'Shin_R': (8, 0, 0), 'Foot_R': (24, 0, 0),
                 'Thigh_L': (-26, 0, -14), 'Shin_L': (32, 0, 0)}, (0, 0, 0.02)),
            (10, {'Hips': (0, -11, 0), 'Spine': (-19, -13, 0), 'Chest': (5, -7, 0),
                  'Thigh_R': (-91, 0, 0), 'Shin_R': (8, 0, 0), 'Foot_R': (24, 0, 0)}, (0, 0, 0.02)),
            (14, {'Hips': (0, -4, 0), 'Spine': (-8, -4, 0), 'Chest': (3, -2, 0),
                  'Thigh_R': (-64, 0, 0), 'Shin_R': (76, 0, 0), 'Foot_R': (-12, 0, 0),
                  'UpperArm_R': (-38, 0, -18), 'Forearm_R': (-82, 0, 0)}, (0, 0, 0)),
            (20, {'Hips': (0, 0, 0), 'Spine': (8, 0, 0), 'Chest': (4, 0, 0),
                  'Thigh_R': (8, 0, 5), 'Shin_R': (14, 0, 0), 'Foot_R': (-6, 0, 0),
                  'UpperArm_L': (-45, 0, 15), 'Forearm_L': (-75, 0, 0),
                  'UpperArm_R': (-40, 0, -15), 'Forearm_R': (-80, 0, 0)}, (0, 0, 0)),
        ]
    })

    catalog.append({
        'id': 'kick-roundhouse', 'label': 'Kick Roundhouse', 'category': 'melee', 'loop': False, 'fps': FPS,
        'contact_frame': 12,
        'frames': [
            (1, {'Hips': (0, 0, 0), 'Spine': (8, 0, 0), 'Chest': (4, 0, 0),
                 'UpperArm_L': (-48, 0, 18), 'Forearm_L': (-78, 0, 0),
                 'UpperArm_R': (-42, 0, -16), 'Forearm_R': (-84, 0, 0),
                 'Thigh_L': (-12, 0, -8), 'Shin_L': (22, 0, 0),
                 'Thigh_R': (14, 0, 8), 'Shin_R': (14, 0, 0)}, (0, 0, 0)),
            # Turn the hip before the knee opens. The planted leg stays wide.
            (5, {'Hips': (0, -28, 0), 'Spine': (-4, -18, 0), 'Chest': (2, -8, 0),
                 'Thigh_L': (4, -55, -8), 'Shin_L': (22, 0, 0),
                 'Thigh_R': (-58, 0, 0), 'Shin_R': (92, 0, 0),
                 'UpperArm_L': (-52, 0, 20), 'Forearm_L': (-78, 0, 0),
                 'UpperArm_R': (-30, 0, -24), 'Forearm_R': (-98, 0, 0)}, (0, 0, 0.01)),
            (8, {'Hips': (0, -12, 0), 'Spine': (-12, -38, 0), 'Chest': (2, -18, 0),
                 'Thigh_L': (2, -78, -10), 'Shin_L': (20, 0, 0),
                 'Thigh_R': (-82, 0, 0), 'Shin_R': (56, 0, 0),
                 'UpperArm_L': (-48, 0, 18), 'Forearm_L': (-76, 0, 0),
                 'UpperArm_R': (-40, 0, -20), 'Forearm_R': (-88, 0, 0)}, (0, 0, 0.02)),
            # Contact at frame 12. The kick foot is level with the waist.
            (12, {'Hips': (0, 28, 0), 'Spine': (-28, -18, 0), 'Chest': (4, -10, 0),
                  'Thigh_L': (6, -28, -12), 'Shin_L': (24, 0, 0),
                  'Thigh_R': (-92, 0, 0), 'Shin_R': (4, 0, 0), 'Foot_R': (12, 0, 0),
                  'UpperArm_L': (-54, 0, 22), 'Forearm_L': (-72, 0, 0),
                  'UpperArm_R': (-28, 0, -30), 'Forearm_R': (-102, 0, 0)}, (0, 0, 0.02)),
            (13, {'Hips': (0, 30, 0), 'Spine': (-27, -20, 0), 'Chest': (4, -10, 0),
                  'Thigh_L': (6, -30, -12), 'Shin_L': (24, 0, 0),
                  'Thigh_R': (-90, 0, 0), 'Shin_R': (4, 0, 0), 'Foot_R': (12, 0, 0)}, (0, 0, 0.02)),
            (17, {'Hips': (0, 44, 0), 'Spine': (-8, -20, 0), 'Chest': (2, -8, 0),
                  'Thigh_L': (0, -42, -6), 'Shin_L': (20, 0, 0),
                  'Thigh_R': (-50, 0, 0), 'Shin_R': (62, 0, 0),
                  'UpperArm_R': (-36, 0, -18), 'Forearm_R': (-84, 0, 0)}, (0, 0, 0)),
            (24, {'Hips': (0, 0, 0), 'Spine': (8, 0, 0), 'Chest': (4, 0, 0),
                  'Thigh_L': (-10, 0, -5), 'Shin_L': (18, 0, 0),
                  'Thigh_R': (8, 0, 5), 'Shin_R': (14, 0, 0),
                  'UpperArm_L': (-45, 0, 15), 'Forearm_L': (-75, 0, 0),
                  'UpperArm_R': (-40, 0, -15), 'Forearm_R': (-80, 0, 0)}, (0, 0, 0)),
        ]
    })

    catalog.append({
        'id': 'kick-air', 'label': 'Kick Air', 'category': 'melee', 'loop': False, 'fps': FPS,
        'frames': [
            (1, {'Spine': (8, 0, 0)}, (0, 0, 0)),
            (6, {'Spine': (25, 0, 0), 'Thigh_L': (-65, 0, 0), 'Shin_L': (85, 0, 0), 'Thigh_R': (-65, 0, 0), 'Shin_R': (85, 0, 0)}, (0, 0, 0.08)),
            (12, {'Spine': (-25, 0, 0), 'Thigh_R': (-90, 0, 0), 'Shin_R': (5, 0, 0), 'Thigh_L': (-35, 0, 0), 'Shin_L': (75, 0, 0),
                  'UpperArm_L': (-45, 0, -25), 'UpperArm_R': (-45, 0, 25)}, (0, 0, 0.18)),
            (17, {'Spine': (-10, 0, 0), 'Thigh_R': (-45, 0, 0), 'Shin_R': (55, 0, 0)}, (0, 0, 0.05)),
            (22, {'Spine': (8, 0, 0), 'Thigh_R': (8, 0, 5), 'Shin_R': (14, 0, 0)}, (0, 0, 0)),
        ]
    })

    catalog.append({
        'id': 'sweep', 'label': 'Sweep', 'category': 'melee', 'loop': False, 'fps': FPS,
        'frames': [
            (1, {'Spine': (8, 0, 0)}, (0, 0, 0)),
            (6, {'Spine': (45, -35, 0), 'Thigh_L': (-85, 0, 0), 'Shin_L': (95, 0, 0), 'Thigh_R': (-45, 0, 35), 'Shin_R': (15, 0, 0)}, (0, 0, -0.45)),
            (13, {'Hips': (0, 180, 0), 'Spine': (45, 0, 0), 'Thigh_R': (-85, 0, 50), 'Shin_R': (10, 0, 0)}, (0, 0, -0.45)),
            (18, {'Hips': (0, 270, 0), 'Spine': (25, 0, 0), 'Thigh_R': (-65, 0, 25)}, (0, 0, -0.30)),
            (24, {'Hips': (0, 360, 0), 'Spine': (8, 0, 0), 'Thigh_R': (8, 0, 5), 'Shin_R': (14, 0, 0)}, (0, 0, 0)),
        ]
    })

    catalog.append({
        'id': 'block', 'label': 'Block', 'category': 'melee', 'loop': True, 'fps': FPS,
        'frames': [
            # Stagger the guard hands. The high lead hand and low elbow keep a
            # readable gap between the two ink strokes.
            (1, {'Hips': (0, -6, 0), 'Spine': (12, 0, 0), 'Chest': (5, 0, 0),
                 'UpperArm_L': (-92, 0, -8), 'Forearm_L': (-60, 0, 0), 'Hand_L': (-18, 0, 0),
                 'UpperArm_R': (-58, 0, 24), 'Forearm_R': (-104, 0, 0), 'Hand_R': (-4, 0, 0),
                 'Thigh_L': (-16, 0, -10), 'Shin_L': (24, 0, 0), 'Thigh_R': (-8, 0, 12), 'Shin_R': (14, 0, 0)}, (0, 0, -0.05)),
            (15, {'Hips': (0, -8, 0), 'Spine': (15, 0, 0), 'Chest': (5, 0, 0),
                  'UpperArm_L': (-96, 0, -4), 'Forearm_L': (-56, 0, 0), 'Hand_L': (-16, 0, 0),
                  'UpperArm_R': (-62, 0, 28), 'Forearm_R': (-98, 0, 0), 'Hand_R': (-2, 0, 0)}, (0, 0, -0.06)),
            (30, {'Hips': (0, -6, 0), 'Spine': (12, 0, 0), 'Chest': (5, 0, 0),
                  'UpperArm_L': (-92, 0, -8), 'Forearm_L': (-60, 0, 0), 'Hand_L': (-18, 0, 0),
                  'UpperArm_R': (-58, 0, 24), 'Forearm_R': (-104, 0, 0), 'Hand_R': (-4, 0, 0),
                  'Thigh_L': (-16, 0, -10), 'Shin_L': (24, 0, 0), 'Thigh_R': (-8, 0, 12), 'Shin_R': (14, 0, 0)}, (0, 0, -0.05)),
        ]
    })

    catalog.append({
        'id': 'parry', 'label': 'Parry', 'category': 'melee', 'loop': False, 'fps': FPS,
        'frames': [
            (1, {'Spine': (8, 0, 0), 'UpperArm_L': (-45, 0, 15), 'Forearm_L': (-75, 0, 0)}, (0, 0, 0)),
            (6, {'Spine': (4, -12, 0), 'UpperArm_L': (-60, 0, -25), 'Forearm_L': (-55, 0, 0)}, (0, 0, 0)),
            (12, {'Spine': (8, 0, 0), 'UpperArm_L': (-45, 0, 15), 'Forearm_L': (-75, 0, 0)}, (0, 0, 0)),
            (18, {'Spine': (8, 0, 0), 'UpperArm_L': (-45, 0, 15), 'Forearm_L': (-75, 0, 0)}, (0, 0, 0)),
        ]
    })

    catalog.append({
        'id': 'dodge-left', 'label': 'Dodge Left', 'category': 'melee', 'loop': False, 'fps': FPS,
        'frames': [
            (1, {'Spine': (8, 0, 0)}, (0, 0, 0)),
            (7, {'Spine': (15, 0, -18), 'Head': (-5, 0, 12), 'Thigh_L': (-15, 0, -12), 'Shin_L': (25, 0, 0)}, (-0.08, 0, -0.08)),
            (13, {'Spine': (10, 0, -8)}, (-0.04, 0, -0.04)),
            (18, {'Spine': (8, 0, 0), 'Thigh_L': (-10, 0, -5), 'Shin_L': (18, 0, 0)}, (0, 0, 0)),
        ]
    })

    catalog.append({
        'id': 'dodge-right', 'label': 'Dodge Right', 'category': 'melee', 'loop': False, 'fps': FPS,
        'frames': [
            (1, {'Spine': (8, 0, 0)}, (0, 0, 0)),
            (7, {'Spine': (15, 0, 18), 'Head': (-5, 0, -12), 'Thigh_R': (-15, 0, 12), 'Shin_R': (25, 0, 0)}, (0.08, 0, -0.08)),
            (13, {'Spine': (10, 0, 8)}, (0.04, 0, -0.04)),
            (18, {'Spine': (8, 0, 0), 'Thigh_R': (8, 0, 5), 'Shin_R': (14, 0, 0)}, (0, 0, 0)),
        ]
    })

    catalog.append({
        'id': 'sword-slash', 'label': 'Sword Slash', 'category': 'melee', 'loop': False, 'fps': FPS,
        'contact_frame': 12,
        'frames': [
            (1, {'Hips': (0, -6, 0), 'Spine': (8, 0, 0), 'Chest': (4, 0, 0),
                 'UpperArm_R': (-42, 0, 18), 'Forearm_R': (-72, 0, 0),
                 'UpperArm_L': (-34, 0, -14), 'Forearm_L': (-68, 0, 0),
                 'Thigh_L': (-18, 0, -10), 'Shin_L': (24, 0, 0),
                 'Thigh_R': (14, 0, 10), 'Shin_R': (14, 0, 0)}, (0, 0, 0)),
            # Wind up over the rear shoulder and keep the support hand in frame.
            (5, {'Hips': (0, 24, 0), 'Spine': (-14, 34, 0), 'Chest': (-4, 18, 0),
                 'UpperArm_R': (-112, 0, 38), 'Forearm_R': (-92, 0, 0),
                 'UpperArm_L': (-68, 0, -26), 'Forearm_L': (-92, 0, 0),
                 'Thigh_L': (-24, 0, -14), 'Shin_L': (30, 0, 0),
                 'Thigh_R': (18, 0, 14), 'Shin_R': (18, 0, 0)}, (0, 0, -0.02)),
            (9, {'Hips': (0, -10, 0), 'Spine': (4, -20, 0), 'Chest': (1, -10, 0),
                 'UpperArm_R': (-72, 0, 24), 'Forearm_R': (-55, 0, 0),
                 'UpperArm_L': (-52, 0, -18), 'Forearm_L': (-82, 0, 0)}, (0, 0, 0)),
            # Contact at frame 12, with a short two-hand hold.
            (12, {'Hips': (0, -24, 0), 'Spine': (24, 40, 0), 'Chest': (8, 22, 0),
                  'UpperArm_R': (-48, 0, -40), 'Forearm_R': (-8, 0, 0), 'Hand_R': (-5, 0, 0),
                  'UpperArm_L': (-50, 0, -30), 'Forearm_L': (-24, 0, 0), 'Hand_L': (-4, 0, 0),
                  'Thigh_L': (-28, 0, -16), 'Shin_L': (36, 0, 0),
                  'Thigh_R': (20, 0, 16), 'Shin_R': (20, 0, 0)}, (0, 0, -0.02)),
            (13, {'Hips': (0, -23, 0), 'Spine': (23, 38, 0), 'Chest': (8, 21, 0),
                  'UpperArm_R': (-49, 0, -39), 'Forearm_R': (-9, 0, 0), 'Hand_R': (-5, 0, 0),
                  'UpperArm_L': (-51, 0, -29), 'Forearm_L': (-25, 0, 0), 'Hand_L': (-4, 0, 0)}, (0, 0, -0.02)),
            (17, {'Hips': (0, -8, 0), 'Spine': (12, 18, 0), 'Chest': (4, 9, 0),
                  'UpperArm_R': (-28, 0, -22), 'Forearm_R': (-22, 0, 0),
                  'UpperArm_L': (-38, 0, -18), 'Forearm_L': (-48, 0, 0)}, (0, 0, 0)),
            (22, {'Hips': (0, 0, 0), 'Spine': (8, 0, 0), 'Chest': (4, 0, 0),
                  'UpperArm_R': (-40, 0, 15), 'Forearm_R': (-70, 0, 0),
                  'UpperArm_L': (-34, 0, -14), 'Forearm_L': (-68, 0, 0)}, (0, 0, 0)),
        ]
    })

    catalog.append({
        'id': 'sword-overhead', 'label': 'Sword Overhead', 'category': 'melee', 'loop': False, 'fps': FPS,
        'contact_frame': 14,
        'frames': [
            (1, {'Hips': (0, -8, 0), 'Spine': (8, 0, 0), 'Chest': (4, 0, 0),
                 'UpperArm_L': (-45, 0, 16), 'Forearm_L': (-75, 0, 0),
                 'UpperArm_R': (-40, 0, -16), 'Forearm_R': (-82, 0, 0),
                 'Thigh_L': (-22, 0, -12), 'Shin_L': (28, 0, 0),
                 'Thigh_R': (18, 0, 12), 'Shin_R': (16, 0, 0)}, (0, 0, 0)),
            # Pull the blade behind the head before the downward hit.
            (7, {'Hips': (0, 20, 0), 'Spine': (-24, 18, 0), 'Chest': (-7, 10, 0),
                 'UpperArm_L': (-148, 0, 12), 'Forearm_L': (-72, 0, 0),
                 'UpperArm_R': (-148, 0, -12), 'Forearm_R': (-72, 0, 0),
                 'Thigh_L': (-28, 0, -14), 'Shin_L': (38, 0, 0),
                 'Thigh_R': (20, 0, 14), 'Shin_R': (18, 0, 0)}, (0, 0, 0.04)),
            (11, {'Hips': (0, -10, 0), 'Spine': (12, -8, 0), 'Chest': (4, -3, 0),
                  'UpperArm_L': (-74, 0, 8), 'Forearm_L': (-30, 0, 0),
                  'UpperArm_R': (-74, 0, -8), 'Forearm_R': (-30, 0, 0)}, (0, 0, -0.08)),
            # Contact at frame 14. The blade path stops for one frame at the floor line.
            (14, {'Hips': (0, -18, 0), 'Spine': (34, -4, 0), 'Chest': (8, 0, 0),
                  'UpperArm_L': (-42, 0, 7), 'Forearm_L': (-8, 0, 0), 'Hand_L': (-4, 0, 0),
                  'UpperArm_R': (-42, 0, -7), 'Forearm_R': (-8, 0, 0), 'Hand_R': (-4, 0, 0),
                  'Thigh_L': (-34, 0, -10), 'Shin_L': (46, 0, 0),
                  'Thigh_R': (-18, 0, 12), 'Shin_R': (44, 0, 0)}, (0, 0, -0.10)),
            (15, {'Hips': (0, -17, 0), 'Spine': (33, -4, 0), 'Chest': (8, 0, 0),
                  'UpperArm_L': (-43, 0, 7), 'Forearm_L': (-9, 0, 0), 'Hand_L': (-4, 0, 0),
                  'UpperArm_R': (-43, 0, -7), 'Forearm_R': (-9, 0, 0), 'Hand_R': (-4, 0, 0)}, (0, 0, -0.10)),
            (19, {'Hips': (0, -7, 0), 'Spine': (16, 4, 0), 'Chest': (5, 3, 0),
                  'UpperArm_L': (-38, 0, 10), 'Forearm_L': (-28, 0, 0),
                  'UpperArm_R': (-36, 0, -10), 'Forearm_R': (-28, 0, 0)}, (0, 0, -0.02)),
            (24, {'Hips': (0, 0, 0), 'Spine': (8, 0, 0), 'Chest': (4, 0, 0),
                  'UpperArm_L': (-45, 0, 15), 'Forearm_L': (-75, 0, 0),
                  'UpperArm_R': (-40, 0, -15), 'Forearm_R': (-80, 0, 0)}, (0, 0, 0)),
        ]
    })

    catalog.append({
        'id': 'sword-thrust', 'label': 'Sword Thrust', 'category': 'melee', 'loop': False, 'fps': FPS,
        'contact_frame': 11,
        'frames': [
            (1, {'Hips': (0, -6, 0), 'Spine': (8, 0, 0), 'Chest': (4, 0, 0),
                 'UpperArm_R': (-38, 0, 16), 'Forearm_R': (-88, 0, 0),
                 'UpperArm_L': (-30, 0, -14), 'Forearm_L': (-66, 0, 0),
                 'Thigh_L': (-20, 0, -10), 'Shin_L': (24, 0, 0),
                 'Thigh_R': (16, 0, 10), 'Shin_R': (14, 0, 0)}, (0, 0, 0)),
            # Pull the point back with the hips turned away from target.
            (5, {'Hips': (0, -28, 0), 'Spine': (-12, -30, 0), 'Chest': (-5, -16, 0),
                 'UpperArm_R': (18, 0, 24), 'Forearm_R': (-108, 0, 0),
                 'UpperArm_L': (-58, 0, -18), 'Forearm_L': (-82, 0, 0),
                 'Thigh_L': (-26, 0, -14), 'Shin_L': (32, 0, 0),
                 'Thigh_R': (18, 0, 14), 'Shin_R': (18, 0, 0)}, (0, 0, -0.04)),
            (8, {'Hips': (0, 12, 0), 'Spine': (4, 10, 0), 'Chest': (2, 6, 0),
                 'UpperArm_R': (-36, 0, 8), 'Forearm_R': (-48, 0, 0),
                 'UpperArm_L': (-44, 0, -12), 'Forearm_L': (-72, 0, 0)}, (0, 0, -0.04)),
            # Contact at frame 11. The rear heel and shoulder line point through the blade.
            (11, {'Hips': (0, 18, 0), 'Spine': (18, 16, 0), 'Chest': (6, 9, 0),
                  'UpperArm_R': (-92, 0, 2), 'Forearm_R': (-4, 0, 0), 'Hand_R': (-5, 0, 0),
                  'UpperArm_L': (-48, 0, -12), 'Forearm_L': (-56, 0, 0), 'Hand_L': (-4, 0, 0),
                  'Thigh_L': (-48, 0, -8), 'Shin_L': (62, 0, 0),
                  'Thigh_R': (28, 0, 10), 'Shin_R': (14, 0, 0)}, (0, 0, -0.10)),
            (12, {'Hips': (0, 17, 0), 'Spine': (17, 15, 0), 'Chest': (6, 8, 0),
                  'UpperArm_R': (-91, 0, 2), 'Forearm_R': (-5, 0, 0), 'Hand_R': (-5, 0, 0)}, (0, 0, -0.10)),
            (16, {'Hips': (0, 8, 0), 'Spine': (8, 6, 0), 'Chest': (3, 3, 0),
                  'UpperArm_R': (-54, 0, 12), 'Forearm_R': (-32, 0, 0),
                  'UpperArm_L': (-40, 0, -10), 'Forearm_L': (-70, 0, 0)}, (0, 0, -0.02)),
            (20, {'Hips': (0, 0, 0), 'Spine': (8, 0, 0), 'Chest': (4, 0, 0),
                  'UpperArm_R': (-35, 0, 15), 'Forearm_R': (-85, 0, 0),
                  'UpperArm_L': (-30, 0, -14), 'Forearm_L': (-66, 0, 0)}, (0, 0, 0)),
        ]
    })

    catalog.append({
        'id': 'staff-spin', 'label': 'Staff Spin', 'category': 'melee', 'loop': True, 'fps': FPS,
        'frames': [
            (1, {'Spine': (6, 0, 0), 'UpperArm_R': (-65, 0, 20), 'Forearm_R': (-45, 0, 0), 'UpperArm_L': (-65, 0, -20), 'Forearm_L': (-45, 0, 0),
                 'Thigh_L': (-8, 0, -4), 'Shin_L': (12, 0, 0), 'Thigh_R': (-8, 0, 4), 'Shin_R': (12, 0, 0)}, (0, 0, 0)),
            (6, {'Spine': (6, 25, 0), 'UpperArm_R': (-85, 0, -10), 'UpperArm_L': (-45, 0, -25)}, (0, 0, 0)),
            (12, {'Spine': (6, 0, 0), 'UpperArm_R': (-45, 0, -25), 'UpperArm_L': (-85, 0, 10)}, (0, 0, 0)),
            (18, {'Spine': (6, -25, 0), 'UpperArm_R': (-65, 0, -20), 'UpperArm_L': (-65, 0, 20)}, (0, 0, 0)),
            (24, {'Spine': (6, 0, 0), 'UpperArm_R': (-65, 0, 20), 'Forearm_R': (-45, 0, 0), 'UpperArm_L': (-65, 0, -20), 'Forearm_L': (-45, 0, 0),
                  'Thigh_L': (-8, 0, -4), 'Shin_L': (12, 0, 0), 'Thigh_R': (-8, 0, 4), 'Shin_R': (12, 0, 0)}, (0, 0, 0)),
        ]
    })

    # -------------------------------------------------------------------------
    # RANGED WEAPONS (10 clips)
    # -------------------------------------------------------------------------
    catalog.append({
        'id': 'pistol-idle', 'label': 'Pistol Idle', 'category': 'ranged', 'loop': True, 'fps': FPS,
        'frames': [
            (1, {'Spine': (6, 0, 0), 'UpperArm_R': (-70, 0, -6), 'Forearm_R': (-20, 0, 0), 'UpperArm_L': (-68, 0, 10), 'Forearm_L': (-25, 0, 0)}, (0, 0, 0)),
            (30, {'Spine': (4, 0, 0), 'UpperArm_R': (-68, 0, -6), 'Forearm_R': (-18, 0, 0), 'UpperArm_L': (-66, 0, 10), 'Forearm_L': (-23, 0, 0)}, (0, 0, 0.005)),
            (60, {'Spine': (6, 0, 0), 'UpperArm_R': (-70, 0, -6), 'Forearm_R': (-20, 0, 0), 'UpperArm_L': (-68, 0, 10), 'Forearm_L': (-25, 0, 0)}, (0, 0, 0)),
        ]
    })

    catalog.append({
        'id': 'pistol-fire', 'label': 'Pistol Fire', 'category': 'ranged', 'loop': False, 'fps': FPS,
        'contact_frame': 3,
        'frames': [
            (1, {'Spine': (6, 0, 0), 'UpperArm_R': (-70, 0, -6), 'Forearm_R': (-20, 0, 0), 'UpperArm_L': (-68, 0, 10), 'Forearm_L': (-25, 0, 0)}, (0, 0, 0)),
            (3, {'Spine': (3, 0, 0), 'UpperArm_R': (-78, 0, -6), 'Forearm_R': (-15, 0, 0), 'UpperArm_L': (-76, 0, 10), 'Forearm_L': (-20, 0, 0)}, (0, 0, 0.006)),
            (7, {'Spine': (7, 0, 0), 'UpperArm_R': (-69, 0, -6), 'Forearm_R': (-21, 0, 0), 'UpperArm_L': (-67, 0, 10), 'Forearm_L': (-26, 0, 0)}, (0, 0, 0)),
            (15, {'Spine': (6, 0, 0), 'UpperArm_R': (-70, 0, -6), 'Forearm_R': (-20, 0, 0), 'UpperArm_L': (-68, 0, 10), 'Forearm_L': (-25, 0, 0)}, (0, 0, 0)),
        ]
    })

    catalog.append({
        'id': 'pistol-reload', 'label': 'Pistol Reload', 'category': 'ranged', 'loop': False, 'fps': FPS,
        'frames': [
            (1, {'UpperArm_R': (-70, 0, -6), 'Forearm_R': (-20, 0, 0), 'UpperArm_L': (-68, 0, 10), 'Forearm_L': (-25, 0, 0)}, (0, 0, 0)),
            (8, {'UpperArm_L': (-20, 0, -10), 'Forearm_L': (-45, 0, 0), 'UpperArm_R': (-60, 0, -5), 'Forearm_R': (-40, 0, 0)}, (0, 0, 0)),
            (16, {'UpperArm_L': (10, 0, -8), 'Forearm_L': (-20, 0, 0)}, (0, 0, 0)),
            (24, {'UpperArm_L': (-55, 0, 5), 'Forearm_L': (-65, 0, 0)}, (0, 0, 0)),
            (30, {'UpperArm_L': (-70, 0, 0), 'Forearm_L': (-50, 0, 0)}, (0, 0, 0)),
            (36, {'UpperArm_R': (-70, 0, -6), 'Forearm_R': (-20, 0, 0), 'UpperArm_L': (-68, 0, 10), 'Forearm_L': (-25, 0, 0)}, (0, 0, 0)),
        ]
    })

    catalog.append({
        'id': 'rifle-idle', 'label': 'Rifle Idle', 'category': 'ranged', 'loop': True, 'fps': FPS,
        'frames': [
            (1, {'Spine': (8, 12, 0), 'UpperArm_R': (-40, 0, 8), 'Forearm_R': (-108, 0, 0), 'UpperArm_L': (-65, 0, -10), 'Forearm_L': (-40, 0, 0)}, (0, 0, 0)),
            (30, {'Spine': (6, 12, 0), 'UpperArm_R': (-38, 0, 8), 'Forearm_R': (-106, 0, 0), 'UpperArm_L': (-63, 0, -10), 'Forearm_L': (-38, 0, 0)}, (0, 0, 0.005)),
            (60, {'Spine': (8, 12, 0), 'UpperArm_R': (-40, 0, 8), 'Forearm_R': (-108, 0, 0), 'UpperArm_L': (-65, 0, -10), 'Forearm_L': (-40, 0, 0)}, (0, 0, 0)),
        ]
    })

    catalog.append({
        'id': 'rifle-fire', 'label': 'Rifle Fire', 'category': 'ranged', 'loop': False, 'fps': FPS,
        'contact_frame': 3,
        'frames': [
            (1, {'Spine': (8, 12, 0), 'UpperArm_R': (-40, 0, 8), 'Forearm_R': (-108, 0, 0), 'UpperArm_L': (-65, 0, -10), 'Forearm_L': (-40, 0, 0)}, (0, 0, 0)),
            (3, {'Spine': (4, 16, 0), 'UpperArm_R': (-46, 0, 10), 'Forearm_R': (-112, 0, 0), 'UpperArm_L': (-70, 0, -10), 'Forearm_L': (-38, 0, 0)}, (0, 0, 0.008)),
            (7, {'Spine': (8, 12, 0), 'UpperArm_R': (-40, 0, 8), 'Forearm_R': (-108, 0, 0), 'UpperArm_L': (-65, 0, -10), 'Forearm_L': (-40, 0, 0)}, (0, 0, 0)),
            (16, {'Spine': (8, 12, 0), 'UpperArm_R': (-40, 0, 8), 'Forearm_R': (-108, 0, 0), 'UpperArm_L': (-65, 0, -10), 'Forearm_L': (-40, 0, 0)}, (0, 0, 0)),
        ]
    })

    catalog.append({
        'id': 'rifle-reload', 'label': 'Rifle Reload', 'category': 'ranged', 'loop': False, 'fps': FPS,
        'frames': [
            (1, {'UpperArm_R': (-40, 0, 8), 'Forearm_R': (-108, 0, 0), 'UpperArm_L': (-65, 0, -10), 'Forearm_L': (-40, 0, 0)}, (0, 0, 0)),
            (10, {'UpperArm_L': (10, 0, -10), 'Forearm_L': (-35, 0, 0)}, (0, 0, 0)),
            (20, {'UpperArm_L': (-45, 0, -5), 'Forearm_L': (-75, 0, 0)}, (0, 0, 0)),
            (28, {'UpperArm_L': (-65, 0, 0), 'Forearm_L': (-85, 0, 0)}, (0, 0, 0)),
            (40, {'UpperArm_R': (-40, 0, 8), 'Forearm_R': (-108, 0, 0), 'UpperArm_L': (-65, 0, -10), 'Forearm_L': (-40, 0, 0)}, (0, 0, 0)),
        ]
    })

    catalog.append({
        'id': 'shotgun-fire', 'label': 'Shotgun Fire', 'category': 'ranged', 'loop': False, 'fps': FPS,
        'contact_frame': 3,
        'frames': [
            (1, {'Spine': (8, 12, 0), 'UpperArm_R': (-40, 0, 8), 'Forearm_R': (-108, 0, 0), 'UpperArm_L': (-65, 0, -10), 'Forearm_L': (-40, 0, 0)}, (0, 0, 0)),
            (3, {'Spine': (-4, 20, 0), 'UpperArm_R': (-70, 0, 20), 'UpperArm_L': (-80, 0, 0)}, (0, 0, 0.02)),
            (10, {'Spine': (8, 12, 0), 'UpperArm_R': (-40, 0, 8)}, (0, 0, 0)),
            (15, {'UpperArm_L': (-50, 0, -10), 'Forearm_L': (-65, 0, 0)}, (0, 0, 0)),
            (19, {'UpperArm_L': (-65, 0, -10), 'Forearm_L': (-40, 0, 0)}, (0, 0, 0)),
            (24, {'Spine': (8, 12, 0), 'UpperArm_R': (-40, 0, 8), 'Forearm_R': (-108, 0, 0), 'UpperArm_L': (-65, 0, -10), 'Forearm_L': (-40, 0, 0)}, (0, 0, 0)),
        ]
    })

    catalog.append({
        'id': 'bow-draw', 'label': 'Bow Draw', 'category': 'ranged', 'loop': False, 'fps': FPS,
        'frames': [
            (1, {'Spine': (0, -45, 0), 'UpperArm_L': (-45, 0, -25), 'UpperArm_R': (-35, 0, 15)}, (0, 0, 0)),
            (12, {'UpperArm_L': (-85, 0, -45), 'Forearm_L': (-5, 0, 0), 'UpperArm_R': (-65, 0, 25), 'Forearm_R': (-85, 0, 0)}, (0, 0, 0)),
            (24, {'UpperArm_L': (-90, 0, -45), 'Forearm_L': (0, 0, 0), 'UpperArm_R': (-70, 0, 30), 'Forearm_R': (-110, 0, 0)}, (0, 0, 0)),
        ]
    })

    catalog.append({
        'id': 'bow-release', 'label': 'Bow Release', 'category': 'ranged', 'loop': False, 'fps': FPS,
        'contact_frame': 5,
        'frames': [
            (1, {'UpperArm_L': (-90, 0, -45), 'UpperArm_R': (-70, 0, 30), 'Forearm_R': (-110, 0, 0)}, (0, 0, 0)),
            (4, {'UpperArm_R': (-50, 0, 45), 'Forearm_R': (-45, 0, 0)}, (0, 0, 0)),
            (15, {'Spine': (0, 0, 0), 'UpperArm_L': (0, 0, -2), 'UpperArm_R': (0, 0, 2)}, (0, 0, 0)),
        ]
    })

    catalog.append({
        'id': 'throw', 'label': 'Throw', 'category': 'ranged', 'loop': False, 'fps': FPS,
        'frames': [
            (1, {'Spine': (0, 0, 0), 'UpperArm_R': (-35, 0, 15), 'Forearm_R': (-75, 0, 0)}, (0, 0, 0)),
            (8, {'Spine': (-18, -45, 0), 'UpperArm_R': (35, 0, 45), 'Forearm_R': (-105, 0, 0), 'UpperArm_L': (-65, 0, -20)}, (0, 0, 0)),
            (14, {'Spine': (28, 45, 0), 'UpperArm_R': (-85, 0, -20), 'Forearm_R': (-10, 0, 0), 'UpperArm_L': (25, 0, 15)}, (0, 0, 0)),
            (24, {'Spine': (4, 0, 0), 'UpperArm_R': (0, 0, 2), 'UpperArm_L': (0, 0, -2)}, (0, 0, 0)),
        ]
    })

    # -------------------------------------------------------------------------
    # REACTIONS (8 clips)
    # -------------------------------------------------------------------------
    catalog.append({
        'id': 'hit-front', 'label': 'Hit Front', 'category': 'reactions', 'loop': False, 'fps': FPS,
        'frames': [
            (1, {'Hips': (0, 0, 0), 'Spine': (4, 0, 0), 'Chest': (2, 0, 0),
                 'Thigh_L': (-8, 0, -8), 'Shin_L': (16, 0, 0), 'Thigh_R': (-2, 0, 10), 'Shin_R': (10, 0, 0)}, (0, 0, 0)),
            (3, {'Hips': (0, -4, 0), 'Spine': (-16, 0, 0), 'Chest': (-8, 0, 0), 'Head': (-22, 0, 0),
                 'UpperArm_L': (-34, 0, -24), 'Forearm_L': (-44, 0, 0), 'UpperArm_R': (-20, 0, 30), 'Forearm_R': (-38, 0, 0)}, (0, -0.03, 0)),
            # Hold the recoil line for two frames before the recovery snap.
            (5, {'Hips': (0, -8, 0), 'Spine': (-32, 0, 0), 'Chest': (-12, 0, 0), 'Head': (-42, 0, 0),
                 'UpperArm_L': (-42, 0, -28), 'Forearm_L': (-56, 0, 0), 'UpperArm_R': (-28, 0, 34), 'Forearm_R': (-48, 0, 0)}, (0, -0.06, 0)),
            (7, {'Spine': (-30, 0, 0), 'Head': (-40, 0, 0)}, (0, -0.05, 0)),
            (11, {'Spine': (18, 0, 0), 'Chest': (8, 0, 0), 'Head': (14, 0, 0),
                   'UpperArm_L': (-12, 0, -12), 'UpperArm_R': (-8, 0, 14)}, (0, 0.03, 0)),
            (16, {'Spine': (2, 0, 0), 'Chest': (2, 0, 0), 'Head': (-2, 0, 0)}, (0, 0, 0)),
        ]
    })

    catalog.append({
        'id': 'hit-back', 'label': 'Hit Back', 'category': 'reactions', 'loop': False, 'fps': FPS,
        'frames': [
            (1, {'Hips': (0, 0, 0), 'Spine': (4, 0, 0), 'Chest': (2, 0, 0),
                 'Thigh_L': (-6, 0, -10), 'Shin_L': (14, 0, 0), 'Thigh_R': (-4, 0, 8), 'Shin_R': (12, 0, 0)}, (0, 0, 0)),
            (3, {'Hips': (0, 4, 0), 'Spine': (24, 0, 0), 'Chest': (10, 0, 0), 'Head': (20, 0, 0),
                 'UpperArm_L': (26, 0, -18), 'Forearm_L': (-42, 0, 0), 'UpperArm_R': (42, 0, 26), 'Forearm_R': (-34, 0, 0)}, (0, 0.03, 0)),
            (5, {'Hips': (0, 8, 0), 'Spine': (42, 0, 0), 'Chest': (14, 0, 0), 'Head': (32, 0, 0),
                 'UpperArm_L': (36, 0, -20), 'Forearm_L': (-52, 0, 0), 'UpperArm_R': (50, 0, 28), 'Forearm_R': (-44, 0, 0)}, (0, 0.07, 0)),
            (7, {'Spine': (38, 0, 0), 'Head': (28, 0, 0)}, (0, 0.06, 0)),
            (11, {'Spine': (-14, 0, 0), 'Chest': (-7, 0, 0), 'Head': (-8, 0, 0),
                   'UpperArm_L': (-14, 0, -8), 'UpperArm_R': (-10, 0, 12)}, (0, -0.03, 0)),
            (16, {'Spine': (2, 0, 0), 'Chest': (2, 0, 0), 'Head': (-2, 0, 0)}, (0, 0, 0)),
        ]
    })

    catalog.append({
        'id': 'hit-left', 'label': 'Hit Left', 'category': 'reactions', 'loop': False, 'fps': FPS,
        'frames': [
            (1, {'Hips': (0, 0, 0), 'Spine': (0, 0, 4), 'Chest': (0, 0, 2),
                 'Thigh_L': (-6, 0, -12), 'Shin_L': (14, 0, 0), 'Thigh_R': (-4, 0, 8), 'Shin_R': (12, 0, 0)}, (0, 0, 0)),
            (3, {'Hips': (0, 16, -8), 'Spine': (0, 24, -18), 'Chest': (0, 12, -10), 'Head': (0, 0, 26),
                 'UpperArm_L': (-22, 0, -36), 'Forearm_L': (-38, 0, 0), 'UpperArm_R': (-6, 0, 24), 'Forearm_R': (-28, 0, 0)}, (0.06, 0, 0)),
            (5, {'Hips': (0, 22, -12), 'Spine': (0, 34, -28), 'Chest': (0, 16, -14), 'Head': (0, 0, 38),
                 'UpperArm_L': (-30, 0, -44), 'Forearm_L': (-52, 0, 0), 'UpperArm_R': (-8, 0, 34), 'Forearm_R': (-40, 0, 0)}, (0.09, 0, 0)),
            (8, {'Spine': (0, 28, -20), 'Head': (0, 0, 28)}, (0.07, 0, 0)),
            (12, {'Spine': (0, -8, 12), 'Chest': (0, -4, 8), 'Head': (0, 0, -14)}, (-0.03, 0, 0)),
            (16, {'Spine': (0, 0, 0), 'Chest': (0, 0, 0), 'Head': (0, 0, 0)}, (0, 0, 0)),
        ]
    })

    catalog.append({
        'id': 'hit-right', 'label': 'Hit Right', 'category': 'reactions', 'loop': False, 'fps': FPS,
        'frames': [
            (1, {'Hips': (0, 0, 0), 'Spine': (0, 0, -4), 'Chest': (0, 0, -2),
                 'Thigh_L': (-4, 0, -8), 'Shin_L': (12, 0, 0), 'Thigh_R': (-6, 0, 12), 'Shin_R': (14, 0, 0)}, (0, 0, 0)),
            (3, {'Hips': (0, -16, 8), 'Spine': (0, -24, 18), 'Chest': (0, -12, 10), 'Head': (0, 0, -26),
                 'UpperArm_L': (-6, 0, -24), 'Forearm_L': (-28, 0, 0), 'UpperArm_R': (-22, 0, 36), 'Forearm_R': (-38, 0, 0)}, (-0.06, 0, 0)),
            (5, {'Hips': (0, -22, 12), 'Spine': (0, -34, 28), 'Chest': (0, -16, 14), 'Head': (0, 0, -38),
                 'UpperArm_L': (-8, 0, -34), 'Forearm_L': (-40, 0, 0), 'UpperArm_R': (-30, 0, 44), 'Forearm_R': (-52, 0, 0)}, (-0.09, 0, 0)),
            (8, {'Spine': (0, -28, 20), 'Head': (0, 0, -28)}, (-0.07, 0, 0)),
            (12, {'Spine': (0, 8, -12), 'Chest': (0, 4, -8), 'Head': (0, 0, 14)}, (0.03, 0, 0)),
            (16, {'Spine': (0, 0, 0), 'Chest': (0, 0, 0), 'Head': (0, 0, 0)}, (0, 0, 0)),
        ]
    })

    catalog.append({
        'id': 'knockdown', 'label': 'Knockdown', 'category': 'reactions', 'loop': False, 'fps': FPS,
        'frames': [
            (1, {'Spine': (0, 0, 0)}, (0, 0, 0)),
            (8, {'Hips': (-35, 0, 0), 'Spine': (-25, 0, 0), 'Thigh_L': (-45, 0, 0), 'Shin_L': (15, 0, 0), 'Thigh_R': (-45, 0, 0), 'Shin_R': (15, 0, 0)}, (0, 0.10, -0.25)),
            (16, {'Hips': (-85, 0, 0), 'Spine': (-15, 0, 0), 'Thigh_L': (-10, 0, 0), 'Shin_L': (25, 0, 0), 'Thigh_R': (-10, 0, 0), 'Shin_R': (25, 0, 0)}, (0, 0.20, -0.90)),
            (30, {'Hips': (-85, 0, 0), 'Spine': (-10, 0, 0), 'Thigh_L': (0, 0, 0), 'Shin_L': (5, 0, 0), 'Thigh_R': (0, 0, 0), 'Shin_R': (5, 0, 0)}, (0, 0.20, -0.90)),
        ]
    })

    catalog.append({
        'id': 'get-up', 'label': 'Get Up', 'category': 'reactions', 'loop': False, 'fps': FPS,
        'frames': [
            (1, {'Hips': (-85, 0, 0), 'Spine': (-10, 0, 0)}, (0, 0.20, -0.90)),
            (10, {'Hips': (-45, 0, 0), 'Spine': (35, 0, 0), 'UpperArm_L': (-45, 0, -20), 'UpperArm_R': (-45, 0, 20)}, (0, 0.10, -0.65)),
            (20, {'Hips': (0, 0, 0), 'Spine': (45, 0, 0), 'Thigh_L': (-65, 0, 0), 'Shin_L': (85, 0, 0), 'Thigh_R': (-65, 0, 0), 'Shin_R': (85, 0, 0)}, (0, 0, -0.35)),
            (36, {'Spine': (2, 0, 0), 'Thigh_L': (0, 0, 0), 'Shin_L': (4, 0, 0), 'Thigh_R': (0, 0, 0), 'Shin_R': (4, 0, 0)}, (0, 0, 0)),
        ]
    })

    catalog.append({
        'id': 'death', 'label': 'Death', 'category': 'reactions', 'loop': False, 'fps': FPS,
        'frames': [
            (1, {'Spine': (0, 0, 0)}, (0, 0, 0)),
            (10, {'Spine': (15, 0, 0), 'Head': (35, 0, 0), 'Thigh_L': (-25, 0, 0), 'Shin_L': (45, 0, 0), 'Thigh_R': (-25, 0, 0), 'Shin_R': (45, 0, 0)}, (0, 0, -0.15)),
            (22, {'Hips': (35, 0, 0), 'Spine': (45, 0, 0), 'Thigh_L': (-65, 0, 0), 'Shin_L': (85, 0, 0), 'Thigh_R': (-65, 0, 0), 'Shin_R': (85, 0, 0)}, (0, -0.10, -0.55)),
            (40, {'Hips': (85, 0, 0), 'Spine': (10, 0, 0), 'Thigh_L': (5, 0, 0), 'Shin_L': (5, 0, 0), 'Thigh_R': (5, 0, 0), 'Shin_R': (5, 0, 0)}, (0, -0.20, -0.90)),
        ]
    })

    catalog.append({
        'id': 'stun', 'label': 'Stun', 'category': 'reactions', 'loop': True, 'fps': FPS,
        'frames': [
            (1, {'Spine': (6, 0, 0), 'Head': (15, 10, -10), 'Thigh_L': (-5, 0, -3), 'Shin_L': (10, 0, 0), 'Thigh_R': (-5, 0, 3), 'Shin_R': (10, 0, 0)}, (0, 0, -0.02)),
            (12, {'Spine': (2, 0, 0), 'Head': (5, -15, 12)}, (0, 0, 0.01)),
            (24, {'Spine': (8, 0, 0), 'Head': (12, 12, 8)}, (0, 0, -0.03)),
            (36, {'Spine': (6, 0, 0), 'Head': (15, 10, -10), 'Thigh_L': (-5, 0, -3), 'Shin_L': (10, 0, 0), 'Thigh_R': (-5, 0, 3), 'Shin_R': (10, 0, 0)}, (0, 0, -0.02)),
        ]
    })

    # -------------------------------------------------------------------------
    # INTERACTION (6 clips)
    # -------------------------------------------------------------------------
    catalog.append({
        'id': 'wave', 'label': 'Wave', 'category': 'interaction', 'loop': True, 'fps': FPS,
        'frames': [
            (1, {'UpperArm_R': (-135, 0, 20), 'Forearm_R': (-45, 0, 0)}, (0, 0, 0)),
            (9, {'UpperArm_R': (-135, 0, 30), 'Forearm_R': (-15, 0, 0)}, (0, 0, 0)),
            (18, {'UpperArm_R': (-135, 0, 10), 'Forearm_R': (-65, 0, 0)}, (0, 0, 0)),
            (27, {'UpperArm_R': (-135, 0, 30), 'Forearm_R': (-15, 0, 0)}, (0, 0, 0)),
            (36, {'UpperArm_R': (-135, 0, 20), 'Forearm_R': (-45, 0, 0)}, (0, 0, 0)),
        ]
    })

    catalog.append({
        'id': 'cheer', 'label': 'Cheer', 'category': 'interaction', 'loop': True, 'fps': FPS,
        'frames': [
            (1, {'UpperArm_L': (-145, 0, -25), 'Forearm_L': (-25, 0, 0), 'UpperArm_R': (-145, 0, 25), 'Forearm_R': (-25, 0, 0),
                 'Thigh_L': (-8, 0, 0), 'Shin_L': (12, 0, 0), 'Thigh_R': (-8, 0, 0), 'Shin_R': (12, 0, 0)}, (0, 0, 0.05)),
            (18, {'UpperArm_L': (-135, 0, -20), 'Forearm_L': (-40, 0, 0), 'UpperArm_R': (-135, 0, 20), 'Forearm_R': (-40, 0, 0),
                  'Thigh_L': (-15, 0, 0), 'Shin_L': (25, 0, 0), 'Thigh_R': (-15, 0, 0), 'Shin_R': (25, 0, 0)}, (0, 0, -0.06)),
            (36, {'UpperArm_L': (-145, 0, -25), 'Forearm_L': (-25, 0, 0), 'UpperArm_R': (-145, 0, 25), 'Forearm_R': (-25, 0, 0),
                  'Thigh_L': (-8, 0, 0), 'Shin_L': (12, 0, 0), 'Thigh_R': (-8, 0, 0), 'Shin_R': (12, 0, 0)}, (0, 0, 0.05)),
        ]
    })

    catalog.append({
        'id': 'point', 'label': 'Point', 'category': 'interaction', 'loop': False, 'fps': FPS,
        'frames': [
            (1, {'UpperArm_R': (0, 0, 0), 'Forearm_R': (-12, 0, 0)}, (0, 0, 0)),
            (10, {'Spine': (4, 10, 0), 'UpperArm_R': (-85, 0, 5), 'Forearm_R': (-5, 0, 0)}, (0, 0, 0)),
            (22, {'Spine': (4, 10, 0), 'UpperArm_R': (-85, 0, 5), 'Forearm_R': (-5, 0, 0)}, (0, 0, 0)),
            (30, {'Spine': (0, 0, 0), 'UpperArm_R': (0, 0, 0), 'Forearm_R': (-12, 0, 0)}, (0, 0, 0)),
        ]
    })

    catalog.append({
        'id': 'interact', 'label': 'Interact', 'category': 'interaction', 'loop': False, 'fps': FPS,
        'frames': [
            (1, {'UpperArm_R': (0, 0, 0)}, (0, 0, 0)),
            (8, {'Spine': (8, 0, 0), 'UpperArm_R': (-55, 0, 0), 'Forearm_R': (-65, 0, 0)}, (0, 0, 0)),
            (16, {'UpperArm_R': (-58, 0, 0), 'Forearm_R': (-60, 0, 0)}, (0, 0, 0)),
            (24, {'UpperArm_R': (-55, 0, 0), 'Forearm_R': (-65, 0, 0)}, (0, 0, 0)),
            (30, {'Spine': (0, 0, 0), 'UpperArm_R': (0, 0, 0)}, (0, 0, 0)),
        ]
    })

    catalog.append({
        'id': 'pickup', 'label': 'Pickup', 'category': 'interaction', 'loop': False, 'fps': FPS,
        'frames': [
            (1, {'Spine': (0, 0, 0)}, (0, 0, 0)),
            (14, {'Spine': (45, 0, 0), 'Thigh_L': (-65, 0, 0), 'Shin_L': (85, 0, 0), 'Thigh_R': (-65, 0, 0), 'Shin_R': (85, 0, 0),
                  'UpperArm_L': (-35, 0, -10), 'Forearm_L': (-25, 0, 0), 'UpperArm_R': (-35, 0, 10), 'Forearm_R': (-25, 0, 0)}, (0, 0, -0.45)),
            (22, {'Spine': (20, 0, 0), 'UpperArm_L': (-55, 0, -10), 'Forearm_L': (-65, 0, 0), 'UpperArm_R': (-55, 0, 10), 'Forearm_R': (-65, 0, 0),
                  'Thigh_L': (-15, 0, 0), 'Shin_L': (25, 0, 0), 'Thigh_R': (-15, 0, 0), 'Shin_R': (25, 0, 0)}, (0, 0, -0.10)),
            (36, {'Spine': (0, 0, 0), 'UpperArm_L': (0, 0, 0), 'UpperArm_R': (0, 0, 0)}, (0, 0, 0)),
        ]
    })

    catalog.append({
        'id': 'carry', 'label': 'Carry', 'category': 'interaction', 'loop': True, 'fps': FPS,
        'frames': [
            (1, {'Spine': (-6, 0, 0), 'UpperArm_L': (-45, 0, -10), 'Forearm_L': (-75, 0, 0), 'UpperArm_R': (-45, 0, 10), 'Forearm_R': (-75, 0, 0),
                 'Thigh_L': (-22, 0, 0), 'Shin_L': (8, 0, 0), 'Thigh_R': (18, 0, 0), 'Shin_R': (22, 0, 0)}, (0, 0, 0)),
            (15, {'Spine': (-6, -5, 0), 'Thigh_R': (-22, 0, 0), 'Shin_R': (8, 0, 0), 'Thigh_L': (18, 0, 0), 'Shin_L': (22, 0, 0)}, (0, 0, 0)),
            (30, {'Spine': (-6, 0, 0), 'UpperArm_L': (-45, 0, -10), 'Forearm_L': (-75, 0, 0), 'UpperArm_R': (-45, 0, 10), 'Forearm_R': (-75, 0, 0),
                  'Thigh_L': (-22, 0, 0), 'Shin_L': (8, 0, 0), 'Thigh_R': (18, 0, 0), 'Shin_R': (22, 0, 0)}, (0, 0, 0)),
        ]
    })

    # -------------------------------------------------------------------------
    # SPORT (4 clips)
    # -------------------------------------------------------------------------
    catalog.append({
        'id': 'ball-kick', 'label': 'Ball Kick', 'category': 'sport', 'loop': False, 'fps': FPS,
        'frames': [
            (1, {'Spine': (8, 0, 0)}, (0, 0, 0)),
            (8, {'Spine': (-8, -15, 0), 'Thigh_R': (45, 0, 0), 'Shin_R': (75, 0, 0), 'Thigh_L': (-15, 0, 0), 'Shin_L': (25, 0, 0)}, (0, 0, 0)),
            (13, {'Spine': (15, 20, 0), 'Thigh_R': (-85, 0, 0), 'Shin_R': (8, 0, 0), 'Foot_R': (25, 0, 0)}, (0, 0, 0.05)),
            (19, {'Spine': (5, 8, 0), 'Thigh_R': (-45, 0, 0), 'Shin_R': (35, 0, 0)}, (0, 0, 0)),
            (24, {'Spine': (8, 0, 0), 'Thigh_R': (-2, 0, 0), 'Shin_R': (4, 0, 0)}, (0, 0, 0)),
        ]
    })

    catalog.append({
        'id': 'ball-throw', 'label': 'Ball Throw', 'category': 'sport', 'loop': False, 'fps': FPS,
        'frames': [
            (1, {'Spine': (8, 0, 0)}, (0, 0, 0)),
            (8, {'Spine': (-12, -45, 0), 'Thigh_L': (-75, 0, 0), 'Shin_L': (85, 0, 0), 'UpperArm_R': (35, 0, 35), 'Forearm_R': (-105, 0, 0)}, (0, 0, 0.05)),
            (14, {'Spine': (28, 35, 0), 'Thigh_L': (-25, 0, 0), 'Shin_L': (35, 0, 0), 'UpperArm_R': (-85, 0, -15), 'Forearm_R': (-10, 0, 0)}, (0, 0, -0.05)),
            (24, {'Spine': (8, 0, 0), 'UpperArm_R': (-20, 0, 8)}, (0, 0, 0)),
        ]
    })

    catalog.append({
        'id': 'bat-swing', 'label': 'Bat Swing', 'category': 'sport', 'loop': False, 'fps': FPS,
        'frames': [
            (1, {'Spine': (8, -25, 0), 'UpperArm_R': (-55, 0, 25), 'Forearm_R': (-75, 0, 0), 'UpperArm_L': (-45, 0, 10), 'Forearm_L': (-85, 0, 0)}, (0, 0, 0)),
            (7, {'Spine': (-5, -45, 0), 'UpperArm_R': (-70, 0, 35), 'Forearm_R': (-85, 0, 0)}, (0, 0, 0)),
            (12, {'Spine': (15, 45, 0), 'UpperArm_R': (-55, 0, -35), 'Forearm_R': (-15, 0, 0), 'UpperArm_L': (-55, 0, -25), 'Forearm_L': (-35, 0, 0)}, (0, 0, 0)),
            (18, {'Spine': (10, 30, 0), 'UpperArm_R': (-45, 0, -20)}, (0, 0, 0)),
            (24, {'Spine': (8, -25, 0), 'UpperArm_R': (-55, 0, 25), 'Forearm_R': (-75, 0, 0), 'UpperArm_L': (-45, 0, 10), 'Forearm_L': (-85, 0, 0)}, (0, 0, 0)),
        ]
    })

    catalog.append({
        'id': 'celebrate', 'label': 'Celebrate', 'category': 'sport', 'loop': True, 'fps': FPS,
        'frames': [
            (1, {'Spine': (-6, 0, 0), 'UpperArm_R': (-105, 0, 20), 'Forearm_R': (-95, 0, 0), 'UpperArm_L': (10, 0, -10),
                 'Thigh_L': (-12, 0, -4), 'Shin_L': (20, 0, 0), 'Thigh_R': (-2, 0, 4), 'Shin_R': (4, 0, 0)}, (0, 0, 0.04)),
            (10, {'Spine': (4, 0, 0), 'UpperArm_R': (-75, 0, 15), 'Forearm_R': (-65, 0, 0)}, (0, 0, -0.04)),
            (20, {'Spine': (-6, 0, 0), 'UpperArm_R': (-105, 0, 20), 'Forearm_R': (-95, 0, 0)}, (0, 0, 0.04)),
            (30, {'Spine': (4, 0, 0), 'UpperArm_R': (-75, 0, 15), 'Forearm_R': (-65, 0, 0)}, (0, 0, -0.04)),
            (40, {'Spine': (-6, 0, 0), 'UpperArm_R': (-105, 0, 20), 'Forearm_R': (-95, 0, 0), 'UpperArm_L': (10, 0, -10),
                  'Thigh_L': (-12, 0, -4), 'Shin_L': (20, 0, 0), 'Thigh_R': (-2, 0, 4), 'Shin_R': (4, 0, 0)}, (0, 0, 0.04)),
        ]
    })

    # Keep the original 60 IDs and timings, then append the authored expansion.
    expansion = build_animation_expansion_catalog()
    existing_ids = {item['id'] for item in catalog}
    assert not existing_ids.intersection({item['id'] for item in expansion}), 'Animation ID collision'
    catalog.extend(expansion)
    apply_kinetic_pose_overrides(catalog)
    apply_stick_motion_contract(catalog)
    apply_authored_motion_polish(catalog)
    apply_stationary_foot_contacts(catalog)
    assert len(catalog) == 85, f'Expected 85 animation clips, got {len(catalog)}'
    assert len({item['id'] for item in catalog}) == len(catalog), 'Animation IDs must be unique'
    return catalog


def apply_stationary_foot_contacts(catalog):
    """Hold both feet during standing actions. Keep free legs for kicks."""
    stationary = {
        'punch-left', 'punch-right', 'punch-heavy', 'uppercut',
        'elbow-strike', 'backfist', 'shoulder-check',
        'sword-slash', 'sword-overhead', 'sword-thrust', 'sword-diagonal',
        'sword-lunge', 'dagger-stab', 'staff-spin', 'staff-thrust',
        'staff-sweep', 'staff-overhead', 'staff-parry', 'hammer-overhead',
        'shield-bash', 'shield-block', 'shield-slam', 'shield-push',
        'hit-front', 'hit-back', 'hit-left', 'hit-right', 'cheer', 'celebrate',
    }
    for definition in catalog:
        if definition['id'] == 'punch-left':
            # A compact rear-foot position keeps the jab above a deep crouch.
            for frame in (1, definition['frames'][-1][0]):
                _patch_authored_frame(definition, frame, {'Thigh_L': (4, 0, -12), 'Shin_L': (16, 0, 0)})
        sides = ('L', 'R') if definition['id'] in stationary else ('L',) if definition['id'] == 'ball-kick' else ()
        if not sides:
            continue
        motion = definition.setdefault('motion', {'phases': []})
        motion['plants'] = [dict(side=side, startFrame=1, endFrame=definition['frames'][-1][0],
                                 velocity=[0, 0, 0]) for side in sides]


KINETIC_LINEAR_CLIPS = {
    'sword-slash', 'sword-overhead', 'sword-thrust', 'staff-spin',
    'kick-air', 'elbow-strike', 'backfist', 'bow-release',
}


def apply_kinetic_interpolation(action: bpy.types.Action, clip_id: str) -> None:
    """Use sharp authored timing for strikes and clamped arcs for travel."""
    try:
        curves = action.layers[0].strips[0].channelbags[0].fcurves
    except (AttributeError, IndexError):
        curves = getattr(action, 'fcurves', [])
    is_linear = clip_id in KINETIC_LINEAR_CLIPS
    for curve in curves:
        for point in curve.keyframe_points:
            if is_linear:
                point.interpolation = 'LINEAR'
            else:
                point.interpolation = 'BEZIER'
                point.handle_left_type = 'AUTO_CLAMPED'
                point.handle_right_type = 'AUTO_CLAMPED'
        curve.update()


# =============================================================================
# ACTION AUTHORING & BAKING PIPELINE
# =============================================================================

def stick_pose_rotations(arm_obj, pose):
    """Keep the torso nearly straight without removing the action's body lean."""
    bones = arm_obj.data.bones
    rotations = {
        name: Euler(tuple(math.radians(angle) for angle in pose.get(name, (0, 0, 0)))).to_quaternion()
        for name in BONE_NAMES
    }

    def world_matrices():
        result = {}
        for name in BONE_NAMES:
            bone = bones[name]
            parent = bone.parent
            base = (result[parent.name] @ parent.matrix_local.inverted() @ bone.matrix_local
                    if parent else bone.matrix_local)
            result[name] = base @ rotations[name].to_matrix().to_4x4()
        return result

    original = world_matrices()
    identity = Quaternion((1, 0, 0, 0))
    for name, limit in TORSO_BEND_LIMITS.items():
        rotation = rotations[name]
        rotation.make_compatible(identity)
        share = min(TORSO_BEND_SHARE, math.radians(limit) / max(rotation.angle, 1e-8))
        rotations[name] = identity.slerp(rotation, share)

    def set_world_rotation(name, wanted):
        current = world_matrices()
        bone = bones[name]
        parent = bone.parent
        base = (current[parent.name] @ parent.matrix_local.inverted() @ bone.matrix_local
                if parent else bone.matrix_local)
        rotations[name] = base.to_quaternion().inverted() @ wanted

    # Preserve the direction from the leg junction to the neck. Transfer the
    # removed curve into whole-body lean, then restore limb and head directions.
    reduced = world_matrices()
    old_axis = original['Neck'].translation - original['Hips'].translation
    new_axis = reduced['Neck'].translation - reduced['Hips'].translation
    set_world_rotation('Hips', new_axis.rotation_difference(old_axis) @ original['Hips'].to_quaternion())
    for name in ('Thigh_L', 'Thigh_R', 'UpperArm_L', 'UpperArm_R', 'Neck'):
        set_world_rotation(name, original[name].to_quaternion())
    return rotations


def create_and_author_actions(arm_obj: bpy.types.Object, anim_catalog: List[Dict[str, Any]]):
    """
    Creates Action datablocks on arm_obj and keyframes resolved bone rotations and hips offsets.
    Every frame is resolved to a 100% complete pose across all 18 bones.
    Looping clips are guaranteed to close seamlessly.
    """
    bpy.context.view_layer.objects.active = arm_obj
    bpy.ops.object.mode_set(mode='POSE')

    for pb in arm_obj.pose.bones:
        pb.rotation_mode = 'QUATERNION'

    for anim_def in anim_catalog:
        name = anim_def['id']
        act = bpy.data.actions.new(name)
        act.use_fake_user = True
        act['loop'] = anim_def['loop']
        act['category'] = anim_def['category']

        arm_obj.animation_data.action = act

        resolved_frames = resolve_clip_poses(anim_def)
        previous_rotations = {}
        for frame, pose, hips_loc in resolved_frames:
            rotations = stick_pose_rotations(arm_obj, pose)
            pb_hips = arm_obj.pose.bones.get('Hips')
            if pb_hips:
                pb_hips.location = pb_hips.bone.matrix_local.to_3x3().inverted() @ Vector(hips_loc)
                pb_hips.keyframe_insert(data_path='location', frame=frame)

            for bname in BONE_NAMES:
                pb = arm_obj.pose.bones.get(bname)
                if not pb:
                    continue
                quaternion = rotations[bname]
                if bname in previous_rotations:
                    quaternion.make_compatible(previous_rotations[bname])
                previous_rotations[bname] = quaternion.copy()
                pb.rotation_quaternion = quaternion
                pb.keyframe_insert(data_path='rotation_quaternion', frame=frame)
        apply_kinetic_interpolation(act, name)
        if 'motion' in anim_def:
            phases = {phase['name']: phase['frame'] for phase in anim_def['motion']['phases']}
            curves = act.layers[0].strips[0].channelbags[0].fcurves
            for curve in curves:
                for key in curve.keyframe_points:
                    frame = key.co.x
                    key.interpolation = 'BEZIER'
                    key.handle_left_type = key.handle_right_type = 'AUTO_CLAMPED'
                    if frame == phases.get('load'):
                        key.interpolation = 'LINEAR'
                    if frame == phases.get('contact') and 'hold' in phases:
                        key.interpolation = 'CONSTANT'
                curve.update()


    bpy.ops.object.mode_set(mode='OBJECT')

def bake_support_plants(arm_obj, definition, cfg):
    """Bake foot targets into the exported bones. No runtime solver is required."""
    plants = definition.get('motion', {}).get('plants', [])
    if not plants:
        return []
    scene = bpy.context.scene
    bones = arm_obj.pose.bones
    hips = bones['Hips']
    up_local = hips.bone.matrix_local.to_3x3().inverted() @ Vector((0, 0, 1))
    end = definition['frames'][-1][0]
    frames = [1 + index / EXPORT_SUBSTEPS for index in range((end - 1) * EXPORT_SUBSTEPS + 1)]
    samples = []
    for frame in frames:
        scene.frame_set(math.floor(frame), subframe=frame % 1)
        samples.append((hips.location.copy(), {name: bones[name].rotation_quaternion.copy() for name in BONE_NAMES}))
    targets = []
    lm = character_landmarks(cfg)
    locomotion = definition.get('motion', {}).get('locomotion')

    def stride_target(side, frame):
        phase = ((frame - 1) / locomotion['cycleFrames'] + (0 if side == 'L' else .5)) % 1
        stance = locomotion['stanceFraction']
        reach = locomotion['speed'] * locomotion['cycleFrames'] / FPS * stance
        if phase < stance:
            y = -reach * .5 + reach * phase / stance
            height = 0
        else:
            swing = (phase - stance) / (1 - stance)
            ease = swing * swing * (3 - 2 * swing)
            y = reach * .5 - reach * ease
            height = locomotion['footLift'] * math.sin(math.pi * swing)
        direction = locomotion['direction']
        lane = .28 if direction[0] else .115
        base_x = (lane if side == 'L' else -lane) * lm['scale']
        base_y = (.06 if side == 'L' else -.06) if direction[0] else 0
        return Vector((base_x + y * direction[0], base_y + y * direction[1], lm['z_ankle'] + PLANT_CLEARANCE + height))

    for plant in plants:
        frame = plant['startFrame']
        scene.frame_set(math.floor(frame), subframe=frame % 1)
        side = plant['side']
        foot = bones[f'Foot_{side}']
        target = foot.head.copy()
        target.z = lm['z_ankle'] + PLANT_CLEARANCE
        if locomotion:
            target = stride_target(side, frame)
        targets.append((plant, target, foot.bone.matrix_local.to_quaternion()))

    curves = arm_obj.animation_data.action.layers[0].strips[0].channelbags[0].fcurves
    affected = {f'{part}_{side}' for side in ('L', 'R') for part in ('Thigh', 'Shin', 'Foot')}
    for curve in list(curves):
        if curve.data_path == 'pose.bones["Hips"].location' or any(
                curve.data_path == f'pose.bones["{name}"].rotation_quaternion' for name in affected):
            curves.remove(curve)

    def point_bone(bone, target):
        direction = bone.tail - bone.head
        wanted = target - bone.head
        if direction.length < 1e-7 or wanted.length < 1e-7:
            return
        rotation = direction.rotation_difference(wanted)
        bone.matrix = Matrix.LocRotScale(bone.head, rotation @ bone.matrix.to_quaternion(), Vector((1, 1, 1)))
        bpy.context.view_layer.update()

    previous = {}
    maximum_error = 0.0
    worst_solve = None
    for frame, (location, rotations) in zip(frames, samples):
        scene.frame_set(math.floor(frame), subframe=frame % 1)
        hips.location = location
        for name, rotation in rotations.items():
            bones[name].rotation_quaternion = rotation
        bpy.context.view_layer.update()
        active = [(plant, target, rotation) for plant, target, rotation in targets
                  if plant['startFrame'] <= frame <= plant['endFrame']]
        if locomotion:
            active = [(dict(side=side, startFrame=frame, velocity=[0, 0, 0]), stride_target(side, frame),
                       bones[f'Foot_{side}'].bone.matrix_local.to_quaternion()) for side in ('L', 'R')]
        # Check the free foot after each body correction as well.
        for _ in range(2):
            for side in ('L', 'R'):
                if any(plant['side'] == side for plant, _, _ in active):
                    continue
                foot = bones[f'Foot_{side}']
                if foot.head.z < lm['z_ankle'] + .025 or min(foot.head.z, foot.tail.z) - cfg['stroke_radius'] < GROUND_CLEARANCE + .005:
                    target = foot.head.copy()
                    target.z = lm['z_ankle'] + PLANT_CLEARANCE
                    active.append((dict(side=side, startFrame=frame, velocity=[0, 0, 0]), target,
                                   foot.bone.matrix_local.to_quaternion()))
            for plant, target, rotation in active:
                side = plant['side']
                thigh, shin = bones[f'Thigh_{side}'], bones[f'Shin_{side}']
                reach = (thigh.length + shin.length) * .994
                horizontal = math.hypot(thigh.head.x - target.x, thigh.head.y - target.y)
                allowed = target.z + math.sqrt(max(.001, reach * reach - horizontal * horizontal))
                if thigh.head.z > allowed:
                    hips.location -= up_local * (thigh.head.z - allowed)
                    bpy.context.view_layer.update()
        for plant, fixed_target, foot_rotation in active:
            side = plant['side']
            thigh, shin, foot = bones[f'Thigh_{side}'], bones[f'Shin_{side}'], bones[f'Foot_{side}']
            target = fixed_target + Vector(plant['velocity']) * ((frame - plant['startFrame']) / FPS)
            origin = thigh.head.copy()
            axis = target - origin
            distance = axis.length
            axis.normalize()
            length_a, length_b = thigh.length, shin.length
            cosine = max(-1, min(1, (length_a ** 2 + distance ** 2 - length_b ** 2) / (2 * length_a * max(.001, distance))))
            pole = Vector((.18 if side == 'L' else -.18, -1, 0))
            pole -= axis * pole.dot(axis)
            pole.normalize()
            knee = origin + axis * (length_a * cosine) + pole * (length_a * math.sqrt(max(0, 1 - cosine ** 2)))
            point_bone(thigh, knee)
            point_bone(shin, target)
            foot.matrix = Matrix.LocRotScale(foot.head, foot_rotation, Vector((1, 1, 1)))
            bpy.context.view_layer.update()
            error = (foot.head - target).length
            if error > maximum_error:
                maximum_error = error
                worst_solve = (frame, side, distance, length_a + length_b, list(origin), list(target))
        hips.keyframe_insert(data_path='location', frame=frame)
        for name in affected:
            bone = bones[name]
            quaternion = bone.rotation_quaternion.copy()
            if name in previous:
                quaternion.make_compatible(previous[name])
            bone.rotation_quaternion = quaternion
            previous[name] = quaternion.copy()
            bone.keyframe_insert(data_path='rotation_quaternion', frame=frame)
    for curve in curves:
        if curve.data_path == 'pose.bones["Hips"].location' or any(
                curve.data_path == f'pose.bones["{name}"].rotation_quaternion' for name in affected):
            for key in curve.keyframe_points:
                key.interpolation = 'LINEAR'
    if maximum_error > .003:
        raise RuntimeError(f"Support solve failed: {arm_obj.name}/{definition['id']}: {maximum_error}; {worst_solve}")
    return [dict(**plant, target=list(target), maximumError=maximum_error) for plant, target, _ in targets]


def bake_grip_contact(arm_obj, definition, source_actions, cfg):
    """Solve the wrist against the same reference pose used by equipment mounts."""
    motion = definition.get('motion', {})
    target = motion.get('grip')
    if not target:
        return
    scene = bpy.context.scene
    action = arm_obj.animation_data.action
    reference = source_actions[target['reference']].copy()
    apply_role_pose_offsets(reference, cfg['id'], target['reference'])
    arm_obj.animation_data.action = reference
    arm_obj.animation_data.action_slot = reference.slots[0]
    scene.frame_set(1)
    hand = arm_obj.pose.bones[f"Hand_{target['side']}"]
    reference_rotation = hand.matrix.to_quaternion()
    arm_obj.animation_data.action = action
    arm_obj.animation_data.action_slot = action.slots[0]
    bpy.data.actions.remove(reference)
    for phase in motion['phases']:
        name = phase['name']
        if name not in ('contact', 'hold') and name not in target.get('phaseAxes', {}) and name not in target.get('phaseOrientations', {}):
            continue
        frame = phase['frame']
        scene.frame_set(frame)
        rotation = hand.matrix.to_quaternion()
        if 'axis' in target:
            current_axis = (rotation @ reference_rotation.inverted()) @ Vector((0, 0, 1))
            rotation = current_axis.rotation_difference(Vector(target.get('phaseAxes', {}).get(name, target['axis'])).normalized()) @ rotation
        else:
            rotation = Euler(tuple(math.radians(angle) for angle in target.get('phaseOrientations', {}).get(name, target['orientation']))).to_quaternion() @ reference_rotation
        hand.matrix = Matrix.LocRotScale(hand.head, rotation, Vector((1, 1, 1)))
        bpy.context.view_layer.update()
        hand.keyframe_insert(data_path='rotation_quaternion', frame=frame)
    curves = action.layers[0].strips[0].channelbags[0].fcurves
    hand_curves = {curve.array_index: curve for curve in curves
                   if curve.data_path == f'pose.bones["{hand.name}"].rotation_quaternion'}
    previous = None
    for frame in sorted({key.co.x for key in hand_curves[0].keyframe_points}):
        quaternion = Quaternion(tuple(hand_curves[index].evaluate(frame) for index in range(4))).normalized()
        if previous:
            quaternion.make_compatible(previous)
        previous = quaternion.copy()
        for index, value in enumerate(quaternion):
            for key in hand_curves[index].keyframe_points:
                if abs(key.co.x - frame) < 1e-4:
                    key.co.y = value
    for curve in hand_curves.values():
        curve.update()


def bake_long_gun_arms(arm_obj, definition, source_actions, cfg):
    """Hold the stock at the lower chest and bake both arm contacts."""
    clip_id = definition['id']
    if clip_id not in ('rifle-idle', 'rifle-fire', 'rifle-reload', 'shotgun-fire'):
        return
    config_path = os.path.join(os.path.dirname(__file__), '../../src/runtime/firearms.json')
    if not os.path.exists(config_path):
        config_path = os.path.join(os.path.dirname(__file__), 'runtime/firearms.json')
    with open(config_path, encoding='utf-8') as source:
        fit = json.load(source)
    weapon = fit['weapons']['shotgun' if clip_id == 'shotgun-fire' else 'rifle']
    scene, bones = bpy.context.scene, arm_obj.pose.bones
    action = arm_obj.animation_data.action
    reference = source_actions['rifle-idle'].copy()
    apply_role_pose_offsets(reference, cfg['id'], 'rifle-idle')
    arm_obj.animation_data.action = reference
    arm_obj.animation_data.action_slot = reference.slots[0]
    scene.frame_set(1)
    reference_rotation = bones['Hand_R'].matrix.to_quaternion()
    arm_obj.animation_data.action = action
    arm_obj.animation_data.action_slot = action.slots[0]
    bpy.data.actions.remove(reference)
    ratio = (bones['UpperArm_R'].length + bones['Forearm_R'].length) / fit['referenceArmLength']
    scale = weapon['scale'] * ratio
    # Shared points use glTF Y-up. Blender uses Z-up and forward -Y.
    def point(value):
        return Vector((value[0], -value[2], value[1]))
    stock, support = point(weapon['stock']), point(weapon['support'])
    end = definition['frames'][-1][0]
    frames = [1 + index / EXPORT_SUBSTEPS for index in range((end - 1) * EXPORT_SUBSTEPS + 1)]
    names = [f'{part}_{side}' for side in ('L', 'R') for part in ('UpperArm', 'Forearm', 'Hand')]
    samples = []
    for frame in frames:
        scene.frame_set(math.floor(frame), subframe=frame % 1)
        samples.append({name: bones[name].rotation_quaternion.copy() for name in names})
    curves = action.layers[0].strips[0].channelbags[0].fcurves
    for curve in list(curves):
        if any(curve.data_path == f'pose.bones["{name}"].rotation_quaternion' for name in names):
            curves.remove(curve)

    def envelope(frame, keys):
        for (start, a), (finish, b) in zip(keys, keys[1:]):
            if frame <= finish:
                t = max(0, min(1, (frame - start) / (finish - start)))
                return a + (b - a) * t * t * (3 - 2 * t)
        return keys[-1][1]

    def solve(side, target, rotation):
        upper, lower, hand = (bones[f'{part}_{side}'] for part in ('UpperArm', 'Forearm', 'Hand'))
        origin = upper.head.copy()
        axis = target - origin
        if axis.length > upper.length + lower.length + .001:
            raise RuntimeError(f"Gun grip is out of reach: {cfg['id']}/{clip_id}/{side}")
        distance = min(axis.length, upper.length + lower.length - .00001)
        axis.normalize()
        cosine = max(-1, min(1, (upper.length ** 2 + distance ** 2 - lower.length ** 2) / (2 * upper.length * distance)))
        pole = Vector((.15 if side == 'L' else -.15, 0, -1))
        pole -= axis * pole.dot(axis)
        pole.normalize()
        elbow = origin + axis * (upper.length * cosine) + pole * (upper.length * math.sqrt(1 - cosine ** 2))
        for bone, wanted in ((upper, elbow), (lower, target)):
            delta = (bone.tail - bone.head).rotation_difference(wanted - bone.head)
            bone.matrix = Matrix.LocRotScale(bone.head, delta @ bone.matrix.to_quaternion(), Vector((1, 1, 1)))
            bpy.context.view_layer.update()
        hand.matrix = Matrix.LocRotScale(hand.head, rotation, Vector((1, 1, 1)))
        bpy.context.view_layer.update()

    previous = {}
    for frame, original in zip(frames, samples):
        scene.frame_set(math.floor(frame), subframe=frame % 1)
        for name, rotation in original.items():
            bones[name].rotation_quaternion = rotation
        bpy.context.view_layer.update()
        recoil = 0
        if clip_id == 'rifle-fire':
            recoil = envelope(frame, [(1, 0), (3, 0), (4, 3), (7, 0), (end, 0)])
        elif clip_id == 'shotgun-fire':
            recoil = envelope(frame, [(1, 0), (3, 0), (5, 8), (10, 0), (end, 0)])
        rotation = Euler((math.radians(-recoil), 0, 0)).to_quaternion()
        hand_rotation = rotation @ reference_rotation
        anchor = bones['Hips'].head.lerp(bones['UpperArm_R'].head, fit['stockTorsoFraction'])
        origin = anchor + Vector((fit['stockLateralOffset'] * ratio, 0, 0)) - rotation @ (stock * scale)
        solve('R', origin - hand_rotation @ Vector((0, fit['palmOffset'], 0)), hand_rotation)
        pump_fit = fit['pump']
        pump = envelope(frame, [(1, 0), (pump_fit['startFrame'], 0), (pump_fit['rearFrame'], -pump_fit['travel']),
                                (pump_fit['returnFrame'], 0), (end, 0)]) if clip_id == 'shotgun-fire' else 0
        support_point = support + Vector((0, pump, 0))
        if clip_id == 'rifle-reload':
            reload_fit = fit['reload']
            contact = envelope(frame, [(1, 0), (reload_fit['reachFrame'], 1), (reload_fit['insertFrame'], 1), (end, 0)])
            withdrawal = envelope(frame, [(1, 0), (reload_fit['reachFrame'], 0), (reload_fit['withdrawFrame'], 1),
                                          (reload_fit['insertFrame'], 0), (end, 0)])
            support_point = support.lerp(point(reload_fit['magazine']), contact) + point(reload_fit['withdrawal']) * withdrawal
        axis = rotation @ Vector((0, -1, 0))
        support_rotation = Vector((0, 1, 0)).rotation_difference(axis)
        solve('L', origin + rotation @ (support_point * scale) - axis * fit['palmOffset'], support_rotation)
        for name in names:
            bone = bones[name]
            quaternion = bone.rotation_quaternion.copy()
            if name in previous:
                quaternion.make_compatible(previous[name])
            previous[name] = quaternion.copy()
            bone.rotation_quaternion = quaternion
            bone.keyframe_insert(data_path='rotation_quaternion', frame=frame)
    for curve in curves:
        if any(curve.data_path == f'pose.bones["{name}"].rotation_quaternion' for name in names):
            for key in curve.keyframe_points:
                key.interpolation = 'LINEAR'


def bake_character_contact(arm_obj, mesh_obj, anim_catalog, source_actions, cfg=None):
    """Bake mesh contact into each rig's hips curve, then expose named NLA clips."""
    scene = bpy.context.scene
    hips = arm_obj.pose.bones['Hips']
    up_local = hips.bone.matrix_local.to_3x3().inverted() @ Vector((0, 0, 1))
    reports = []
    baked_actions = {}

    def floor_height(frame):
        scene.frame_set(math.floor(frame), subframe=frame % 1)
        evaluated = mesh_obj.evaluated_get(bpy.context.evaluated_depsgraph_get())
        mesh = evaluated.to_mesh()
        result = min(vertex.co.z for vertex in mesh.vertices)
        evaluated.to_mesh_clear()
        return result

    for definition in anim_catalog:
        clip_id = definition['id']
        action = source_actions[clip_id].copy()
        action.name = f"{arm_obj.name}::{clip_id}"
        action.use_fake_user = True
        if cfg:
            apply_role_pose_offsets(action, cfg['id'], clip_id)
        arm_obj.animation_data.action = action
        arm_obj.animation_data.action_slot = action.slots[0]
        if cfg:
            bake_grip_contact(arm_obj, definition, source_actions, cfg)
            bake_long_gun_arms(arm_obj, definition, source_actions, cfg)
        end = definition['frames'][-1][0]
        motion = definition.get('motion', {})
        grounded = (clip_id in GROUNDED_CLIPS
                    or motion.get('locomotion', {}).get('stanceFraction', 0) >= .5
                    or any(plant['startFrame'] <= 1 and plant['endFrame'] >= end and not any(plant['velocity'])
                           for plant in motion.get('plants', [])))
        base = []
        lifts = []
        for frame in range(1, end + 1):
            minimum = floor_height(frame)
            base.append(hips.location.copy())
            # Grounded clips use a signed correction so a bent role does not
            # float above the floor. Air and travel clips keep lift-only bake,
            # so their authored airtime and root motion stay unchanged.
            lifts.append(GROUND_CLEARANCE - minimum if grounded else max(0, GROUND_CLEARANCE - minimum))
        curves = action.layers[0].strips[0].channelbags[0].fcurves
        for curve in list(curves):
            if curve.data_path == 'pose.bones["Hips"].location':
                curves.remove(curve)

        def write_contact():
            if definition['loop']:
                lifts[0] = lifts[-1] = max(lifts[0], lifts[-1])
            for index, location in enumerate(base):
                hips.location = location + up_local * lifts[index]
                hips.keyframe_insert(data_path='location', frame=index + 1)
            for curve in curves:
                if curve.data_path == 'pose.bones["Hips"].location':
                    for key in curve.keyframe_points:
                        key.interpolation = 'LINEAR'

        if grounded:
            # Add dense grounded Hips keys at the export sample rate. The wrapper
            # retimes the NLA strip so the glTF sampler keeps these keys.
            write_contact()
            for sample_index in range(1, (end - 1) * EXPORT_SUBSTEPS):
                sample_frame = 1 + sample_index / EXPORT_SUBSTEPS
                if sample_frame.is_integer():
                    continue
                correction = GROUND_CLEARANCE - floor_height(sample_frame)
                if abs(correction) > 0.0001:
                    scene.frame_set(math.floor(sample_frame), subframe=sample_frame % 1)
                    hips.location = hips.location.copy() + up_local * correction
                    hips.keyframe_insert(data_path='location', frame=sample_frame)
            for curve in curves:
                if curve.data_path == 'pose.bones["Hips"].location':
                    for key in curve.keyframe_points:
                        key.interpolation = 'LINEAR'
        else:
            # Air and travel clips only rise when an interpolated pose crosses
            # the floor. This retains their authored airtime and root motion.
            for iteration in range(3):
                write_contact()
                changed = False
                for frame in range(1, end):
                    deficit = max(0, max(GROUND_CLEARANCE - floor_height(frame + part) for part in (0.25, 0.5, 0.75)))
                    if deficit > 0.0001:
                        lifts[frame - 1] += deficit
                        lifts[frame] += deficit
                        changed = True
                if not changed:
                    break
            write_contact()
        plant_report = bake_support_plants(arm_obj, definition, cfg) if cfg else []
        previous_clip = motion.get('continuesFrom')
        if previous_clip:
            previous_action, previous_end = baked_actions[previous_clip]
            arm_obj.animation_data.action = previous_action
            arm_obj.animation_data.action_slot = previous_action.slots[0]
            scene.frame_set(previous_end)
            previous_location = hips.location.copy()
            arm_obj.animation_data.action = action
            arm_obj.animation_data.action_slot = action.slots[0]
            scene.frame_set(1)
            hips.location = previous_location
            hips.keyframe_insert(data_path='location', frame=1)
        baked_actions[clip_id] = (action, end)
        sampled_floor = [floor_height(1 + index / EXPORT_SUBSTEPS) for index in range((end - 1) * EXPORT_SUBSTEPS + 1)]
        minimum = min(sampled_floor)
        maximum = max(sampled_floor)
        if minimum < -0.001:
            raise RuntimeError(f"Contact bake failed: {arm_obj.name}/{clip_id}: {minimum} at frame {1 + sampled_floor.index(minimum) / EXPORT_SUBSTEPS}")
        if grounded and maximum > 0.015:
            raise RuntimeError(f"Grounded contact drift failed: {arm_obj.name}/{clip_id}: {maximum}")
        reports.append({
            'clip': clip_id,
            'grounded': grounded,
            'minimumZ': round(minimum, 6),
            'maximumZ': round(maximum, 6),
            'minimumLift': round(min(lifts), 6),
            'maximumLift': round(max(lifts), 6),
            'plants': plant_report,
        })
        arm_obj.animation_data.action = None
        track = arm_obj.animation_data.nla_tracks.new()
        track.name = clip_id
        strip = track.strips.new(clip_id, 1, action)
        strip.action_slot = action.slots[0]
        strip.extrapolation = 'NOTHING'
        track.mute = True
    scene.frame_set(1)
    for bone in arm_obj.pose.bones:
        bone.location = (0, 0, 0)
        bone.rotation_quaternion = (1, 0, 0, 0)
    return reports

# =============================================================================
# FORWARD KINEMATICS (FK) DIAGNOSTIC POSE EVALUATION
# =============================================================================

def sample_fk_pose_metrics(arm_obj: bpy.types.Object, anim_catalog: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Evaluates forward kinematics world positions of key joints across critical frames:
    - Idle: confirms arms hang at sides and feet contact floor cleanly.
    - Punch Right: confirms striking hand reaches forward ahead of chest and guard hand guards face.
    - Rifle Fire: confirms both hands are ahead of chest during firing and intermediate recoil frames.
    - Kick Roundhouse: confirms kicking foot height and horizontal reach at apex.
    """
    bpy.context.view_layer.objects.active = arm_obj
    bpy.ops.object.mode_set(mode='POSE')

    metrics = {}

    def get_world_tail(bname: str) -> Vector:
        pb = arm_obj.pose.bones[bname]
        return arm_obj.matrix_world @ pb.tail

    def get_world_head(bname: str) -> Vector:
        pb = arm_obj.pose.bones[bname]
        return arm_obj.matrix_world @ pb.head

    def apply_pose(pose: Dict[str, Tuple[float, float, float]], hips_loc: Tuple[float, float, float]):
        pb_hips = arm_obj.pose.bones.get('Hips')
        if pb_hips:
            pb_hips.location = pb_hips.bone.matrix_local.to_3x3().inverted() @ Vector(hips_loc)
        rotations = stick_pose_rotations(arm_obj, pose)
        for bname in BONE_NAMES:
            pb = arm_obj.pose.bones.get(bname)
            if not pb:
                continue
            pb.rotation_quaternion = rotations[bname]
        bpy.context.view_layer.update()

    def authored_frame(definition: Dict[str, Any], phase_name: str = 'contact', offset: int = 0):
        """Select a diagnostic key from the authored phase contract."""
        motion = definition.get('motion', {})
        phase = next((item for item in motion.get('phases', []) if item['name'] == phase_name), None)
        base = phase['frame'] if phase is not None else definition.get('contact_frame')
        if base is None:
            raise RuntimeError(f"{definition['id']} has no {phase_name} or contact frame")
        resolved = resolve_clip_poses(definition)
        return min(resolved, key=lambda item: abs(item[0] - (base + offset)))

    # 1. Idle frame 1
    idle_def = next(a for a in anim_catalog if a['id'] == 'idle')
    idle_frames = resolve_clip_poses(idle_def)
    apply_pose(idle_frames[0][1], idle_frames[0][2])
    h_l = get_world_tail('Hand_L')
    h_r = get_world_tail('Hand_R')
    f_l = get_world_tail('Foot_L')
    f_r = get_world_tail('Foot_R')
    metrics['idle'] = {
        'hand_l_pos': [round(h_l.x, 3), round(h_l.y, 3), round(h_l.z, 3)],
        'hand_r_pos': [round(h_r.x, 3), round(h_r.y, 3), round(h_r.z, 3)],
        'foot_l_z': round(f_l.z, 3),
        'foot_r_z': round(f_r.z, 3),
        'arm_span_x': round(abs(h_l.x - h_r.x), 3),
        'description': 'Resting idle stance with arms naturally at sides and feet on floor'
    }

    # 2. Punch Right contact from the authored phase contract.
    punch_def = next(a for a in anim_catalog if a['id'] == 'punch-right')
    p_apex = authored_frame(punch_def)
    apply_pose(p_apex[1], p_apex[2])
    chest_head = get_world_head('Chest')
    chin_head = get_world_head('Head')
    hand_r_strike = get_world_tail('Hand_R')
    hand_l_guard = get_world_tail('Hand_L')
    # In Blender coordinate space: front is -Y. Ahead of chest means Chest.y - Hand.y > 0.
    forward_reach = chest_head.y - hand_r_strike.y
    guard_dist_chin = (hand_l_guard - chin_head).length
    metrics['punch_right_apex'] = {
        'striking_hand_forward_reach_m': round(forward_reach, 3),
        'guard_hand_dist_to_chin_m': round(guard_dist_chin, 3),
        'guard_hand_height_m': round(hand_l_guard.z, 3),
        'description': 'Apex right cross with full striking extension and left guard fist near jaw'
    }

    # 3. Rifle Fire contact and the next authored recoil key.
    rifle_def = next(a for a in anim_catalog if a['id'] == 'rifle-fire')
    r_fire = authored_frame(rifle_def)
    apply_pose(r_fire[1], r_fire[2])
    ch_fire = get_world_head('Chest')
    hl_fire = get_world_tail('Hand_L')
    hr_fire = get_world_tail('Hand_R')

    r_recoil = authored_frame(rifle_def, offset=4)
    apply_pose(r_recoil[1], r_recoil[2])
    ch_recoil = get_world_head('Chest')
    hl_recoil = get_world_tail('Hand_L')
    hr_recoil = get_world_tail('Hand_R')

    metrics['rifle_fire'] = {
        f'firing_frame_{r_fire[0]}': {
            'support_hand_ahead_of_chest_m': round(ch_fire.y - hl_fire.y, 3),
            'trigger_hand_ahead_of_chest_m': round(ch_fire.y - hr_fire.y, 3),
        },
        f'recoil_frame_{r_recoil[0]}': {
            'support_hand_ahead_of_chest_m': round(ch_recoil.y - hl_recoil.y, 3),
            'trigger_hand_ahead_of_chest_m': round(ch_recoil.y - hr_recoil.y, 3),
        },
        'firing_frame': r_fire[0],
        'recoil_frame': r_recoil[0],
        'description': 'Two-handed long gun hold with both hands remaining ahead of chest throughout firing and recovery'
    }

    # 4. Kick Roundhouse contact from the authored phase contract.
    kick_def = next(a for a in anim_catalog if a['id'] == 'kick-roundhouse')
    k_apex = authored_frame(kick_def)
    apply_pose(k_apex[1], k_apex[2])
    ft_r = get_world_tail('Foot_R')
    metrics['kick_roundhouse_apex'] = {
        'kicking_foot_height_m': round(ft_r.z, 3),
        'kicking_foot_reach_m': round(math.hypot(ft_r.x, ft_r.y), 3),
        'description': 'Horizontal roundhouse kick apex at chest/waist level'
    }

    bpy.ops.object.mode_set(mode='OBJECT')
    return metrics

# =============================================================================
# EXPORT & PACKAGING PIPELINE
# =============================================================================

def retime_nla_for_glb_export(arm_obj: bpy.types.Object):
    """Sample NLA tracks at 120 Hz while keeping authored timing at 30 FPS."""
    scene = bpy.context.scene
    original_fps = scene.render.fps
    original_fps_base = scene.render.fps_base
    original_frame_range = (scene.frame_start, scene.frame_end)
    original_frame = (scene.frame_current, scene.frame_subframe)
    strip_state = []
    animation_data = arm_obj.animation_data
    if animation_data:
        for track in animation_data.nla_tracks:
            for strip in track.strips:
                strip_state.append((strip, strip.scale, strip.frame_start, strip.frame_end))
                end = strip.frame_end
                strip.scale *= EXPORT_SUBSTEPS
                strip.frame_start *= EXPORT_SUBSTEPS
                strip.frame_end = end * EXPORT_SUBSTEPS
    scene.render.fps = FPS * EXPORT_SUBSTEPS
    scene.render.fps_base = 1.0
    scene.frame_start *= EXPORT_SUBSTEPS
    scene.frame_end *= EXPORT_SUBSTEPS

    def restore():
        for strip, scale, frame_start, frame_end in strip_state:
            strip.scale = scale
            strip.frame_start = frame_start
            strip.frame_end = frame_end
        scene.render.fps = original_fps
        scene.render.fps_base = original_fps_base
        scene.frame_start, scene.frame_end = original_frame_range
        scene.frame_set(original_frame[0], subframe=original_frame[1])

    return restore

def export_character_glb(char_id: str, arm_obj: bpy.types.Object, mesh_obj: bpy.types.Object, out_dir: str) -> str:
    """Export a single character GLB with its skin and all 85 NLA clips."""
    os.makedirs(out_dir, exist_ok=True)
    glb_path = os.path.join(out_dir, f'{char_id}.glb')

    bpy.ops.object.select_all(action='DESELECT')
    arm_obj.select_set(True)
    mesh_obj.select_set(True)
    bpy.context.view_layer.objects.active = arm_obj

    restore_timing = retime_nla_for_glb_export(arm_obj)
    try:
        bpy.ops.export_scene.gltf(
            filepath=glb_path,
            export_format='GLB',
            use_selection=True,
            export_animations=True,
            export_animation_mode='NLA_TRACKS',
            export_skins=True,
            export_apply=True,
            export_extras=True,
            export_optimize_animation_size=True,
            export_materials='EXPORT',
        )
    finally:
        restore_timing()
    return glb_path

# =============================================================================
# INDEPENDENT GLB VERIFICATION
# =============================================================================

def verify_exported_glb(glb_path: str, expected_clip_count: int = 85) -> Dict[str, Any]:
    """
    Independently parses the binary GLB header and JSON chunk to verify:
    - Valid glTF 2.0 structure
    - Exact 85 animation clips with non-empty samplers
    - Skinned humanoid joint hierarchy (all 18 named bones)
    - Mesh attributes (POSITION, NORMAL, JOINTS_0, WEIGHTS_0)
    - Bounding dimensions in Y-up XYZ
    - No NaN values
    """
    assert os.path.exists(glb_path), f'GLB does not exist: {glb_path}'
    file_size = os.path.getsize(glb_path)

    with open(glb_path, 'rb') as f:
        header = f.read(12)
        magic, version, length = struct.unpack('<4sII', header)
        assert magic == b'glTF', f'Invalid GLB magic in {glb_path}'
        assert version == 2, f'Unsupported glTF version {version}'

        chunk_header = f.read(8)
        chunk_len, chunk_type = struct.unpack('<II', chunk_header)
        assert chunk_type == 0x4E4F534A, f'First chunk is not JSON in {glb_path}'
        json_bytes = f.read(chunk_len)
        data = json.loads(json_bytes.decode('utf-8'))

    anims = data.get('animations', [])
    anim_names = [a.get('name') for a in anims]
    assert len(anims) == expected_clip_count, f'Expected {expected_clip_count} animations, got {len(anims)}'

    for a in anims:
        assert len(a.get('channels', [])) > 0, f'Animation {a.get("name")} has 0 channels'
        assert len(a.get('samplers', [])) > 0, f'Animation {a.get("name")} has 0 samplers'

    skins = data.get('skins', [])
    assert len(skins) >= 1, f'No skin found in {glb_path}'
    nodes = data.get('nodes', [])
    joint_indices = skins[0].get('joints', [])
    joint_names = [nodes[j].get('name') for j in joint_indices if j < len(nodes)]
    for expected_bone in BONE_NAMES:
        assert expected_bone in joint_names, f'Missing required bone {expected_bone} in {glb_path}'

    meshes = data.get('meshes', [])
    assert len(meshes) >= 1, f'No mesh found in {glb_path}'
    prim = meshes[0]['primitives'][0]
    attrs = prim.get('attributes', {})
    for req_attr in ['POSITION', 'NORMAL', 'JOINTS_0', 'WEIGHTS_0']:
        assert req_attr in attrs, f'Missing required mesh attribute {req_attr} in {glb_path}'

    accessors = data.get('accessors', [])
    pos_accessor_idx = attrs['POSITION']
    pos_accessor = accessors[pos_accessor_idx]
    min_vals = pos_accessor.get('min', [0, 0, 0])
    max_vals = pos_accessor.get('max', [0, 0, 0])

    for val in min_vals + max_vals:
        assert not math.isnan(val), f'NaN detected in POSITION accessor in {glb_path}'

    dim_x = max_vals[0] - min_vals[0]
    dim_y = max_vals[1] - min_vals[1]
    dim_z = max_vals[2] - min_vals[2]

    return {
        'file_size': file_size,
        'animation_count': len(anims),
        'animation_names': anim_names,
        'joint_count': len(joint_names),
        'joint_names': joint_names,
        'attributes': list(attrs.keys()),
        'bounds_min': min_vals,
        'bounds_max': max_vals,
        'dimensions': [round(dim_x, 3), round(dim_y, 3), round(dim_z, 3)],
    }

# =============================================================================
# MAIN ORCHESTRATION FUNCTION
# =============================================================================

def main():
    argv = sys.argv
    out_dir = 'games/inkline-showcase/public/assets'
    only_character = None
    if '--' in argv:
        args = argv[argv.index('--') + 1:]
        for i in range(len(args)):
            if args[i] == '--out' and i + 1 < len(args):
                out_dir = args[i + 1]
            elif args[i] == '--character' and i + 1 < len(args):
                only_character = args[i + 1]

    selected_specs = [cfg for cfg in CHARACTER_SPECS if only_character is None or cfg['id'] == only_character]
    if not selected_specs:
        raise ValueError(f'Unknown character: {only_character}')

    print(f'[INKLINE] Output assets directory: {out_dir}')
    characters_out_dir = os.path.join(out_dir, 'characters')
    source_out_dir = os.path.join(out_dir, 'source')
    os.makedirs(characters_out_dir, exist_ok=True)
    os.makedirs(source_out_dir, exist_ok=True)

    # 1. Clean environment
    clean_database()
    bpy.context.scene.render.fps = FPS

    # 2. Material
    mat = create_ink_material()

    # 3. Base Armature for Authoring all 85 Actions
    base_cfg = CHARACTER_SPECS[0]
    base_arm_obj = build_character_armature('StickRig_Base', base_cfg)

    # 4. Author all 85 Animations on the Base Armature
    anim_catalog = build_animation_catalog()
    print(f'[INKLINE] Authoring {len(anim_catalog)} animation clips...')
    t0_anims = time.time()
    create_and_author_actions(base_arm_obj, anim_catalog)
    source_actions = {definition['id']: bpy.data.actions[definition['id']] for definition in anim_catalog}
    print(f'[INKLINE] Authored {len(anim_catalog)} clips in {time.time() - t0_anims:.2f}s')

    # 5. Measure FK Diagnostic Pose Metrics
    pose_metrics = sample_fk_pose_metrics(base_arm_obj, anim_catalog)
    print('[INKLINE] FK Diagnostic Sample Pose Metrics:')
    print(json.dumps(pose_metrics, indent=2))

    # Save pose metrics beside the character catalog
    metrics_path = os.path.join(out_dir, 'sample-pose-metrics.json')
    with open(metrics_path, 'w', encoding='utf-8') as f:
        json.dump(pose_metrics, f, indent=2)

    # Prepare model entries list
    model_entries = []
    created_characters = []

    # 6. Build 12 Distinct Character Models
    print(f'[INKLINE] Generating {len(selected_specs)} distinct stick figures...')
    for cfg in selected_specs:
        char_id = cfg['id']
        arm_obj = build_character_armature(char_id, cfg)
        mesh_obj = build_character_mesh(char_id, arm_obj, cfg, mat)

        tri_count = sum(len(p.vertices) - 2 for p in mesh_obj.data.polygons)
        vert_count = len(mesh_obj.data.vertices)

        # Compute bounding dimensions in final Y-up coordinates (glTF X=width, Y=height, Z=depth)
        # In Blender: X=width, Z=height, -Y=depth
        xs = [v.co.x for v in mesh_obj.data.vertices]
        ys = [v.co.y for v in mesh_obj.data.vertices]
        zs = [v.co.z for v in mesh_obj.data.vertices]
        dim_w = round(max(xs) - min(xs), 3)
        dim_h = round(max(zs) - min(zs), 3)
        dim_d = round(max(ys) - min(ys), 3)

        model_entry = {
            'id': char_id,
            'label': cfg['label'],
            'kind': 'character',
            'category': cfg['category'],
            'file': f'assets/characters/{char_id}.glb',
            'thumbnail': f'assets/previews/{char_id}.png',
            'dimensions': [dim_w, dim_h, dim_d],
            'triangles': tri_count,
            'vertices': vert_count,
            'materials': 1,
            'description': cfg['description'],
            'tags': cfg['tags'],
        }
        model_entries.append(model_entry)
        created_characters.append((char_id, arm_obj, mesh_obj, cfg))

    # 7. Export GLB for each character
    print(f'[INKLINE] Exporting GLB files for {len(selected_specs)} characters...')
    verified_reports = {}
    for char_id, arm_obj, mesh_obj, cfg in created_characters:
        t0_export = time.time()
        pose_metrics.setdefault('groundContact', {})[char_id] = bake_character_contact(arm_obj, mesh_obj, anim_catalog, source_actions, cfg)
        glb_path = export_character_glb(char_id, arm_obj, mesh_obj, characters_out_dir)
        t_export = time.time() - t0_export

        report = verify_exported_glb(glb_path, len(anim_catalog))
        verified_reports[char_id] = report
        # Verify that accessor dimensions match our metadata
        assert abs(report['dimensions'][1] - cfg['height']) < 0.05, f"Height mismatch for {char_id}"
        print(f'  ✓ {char_id}.glb ({report["file_size"]/1024:.1f} KB, dim: {report["dimensions"]}, {t_export:.2f}s)')

    with open(metrics_path, 'w', encoding='utf-8') as metrics_file:
        json.dump(pose_metrics, metrics_file, indent=2)

    # 8. Save Editable characters.blend
    blend_path = os.path.join(source_out_dir, 'characters.blend')
    bpy.ops.wm.save_as_mainfile(filepath=blend_path)
    print(f'[INKLINE] Saved source file: {blend_path}')

    # 9. Write characters.json (using exact types in src/types.ts)
    animation_entries = []
    for anim in anim_catalog:
        last_frame = anim['frames'][-1][0]
        duration = round(last_frame / FPS, 3)
        entry = {
            'id': anim['id'],
            'label': anim['label'],
            'category': anim['category'],
            'duration': duration,
            'loop': anim['loop'],
        }
        # Combat consumers use the authored frame event. Blender frame 1 exports at 1/FPS.
        contact_frame = anim.get('contact_frame')
        if contact_frame is not None:
            entry['contactFrame'] = contact_frame
            entry['contactTime'] = round(contact_frame / FPS, 3)
        if 'motion' in anim:
            entry['motion'] = anim['motion']
            if 'locomotion' in anim['motion']:
                entry['travelSpeed'] = anim['motion']['locomotion']['speed']
        animation_entries.append(entry)

    characters_json_data = {
        'models': model_entries,
        'animations': animation_entries,
    }

    json_path = os.path.join(out_dir, 'characters.json')
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(characters_json_data, f, indent=2)
    print(f'[INKLINE] Written metadata: {json_path}')

    print(f'[INKLINE] Successfully generated and verified {len(selected_specs)} characters and 85 animations!')

if __name__ == '__main__':
    main()
