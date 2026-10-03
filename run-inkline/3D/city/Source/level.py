"""
Inkline Industrial District Level Scene & Static GLB Generator
Builds a complete editable Blender scene and static GLB for the Inkline industrial district.
Compatible with Blender 5.1 and Three.js 0.170.
"""

import sys
import os
import math
import json
import struct
import argparse
import bpy
import mathutils

def parse_cli_args():
    parser = argparse.ArgumentParser(description="Generate Inkline Industrial District level scene and GLB")
    parser.add_argument("--out", default="public/assets", help="Asset root directory")
    parser.add_argument("--district", default=None, help="Path to industrial-district.json")
    parser.add_argument("--source", default=None, help="Path to source industrial.blend")
    parser.add_argument("--manifest", default=None, help="Path to manifest.json or props.json")
    parser.add_argument("--target-blend", default=None, help="Output .blend filepath")
    parser.add_argument("--target-glb", default=None, help="Output .glb filepath")

    cli_args = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    args = parser.parse_args(cli_args)

    out_dir = os.path.abspath(args.out)
    if not os.path.isabs(args.out) and not os.path.exists(out_dir):
        candidate = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", args.out))
        if os.path.exists(candidate) or "inkline-showcase" in candidate:
            out_dir = candidate

    district_path = os.path.abspath(args.district) if args.district else os.path.join(out_dir, "industrial-district.json")
    source_blend = os.path.abspath(args.source) if args.source else os.path.join(out_dir, "source", "industrial.blend")
    manifest_path = os.path.abspath(args.manifest) if args.manifest else os.path.join(out_dir, "manifest.json")
    target_blend = os.path.abspath(args.target_blend) if args.target_blend else os.path.join(out_dir, "source", "industrial-district.blend")
    target_glb = os.path.abspath(args.target_glb) if args.target_glb else os.path.join(out_dir, "scenes", "industrial-district.glb")

    return {
        "out_dir": out_dir,
        "district_path": district_path,
        "source_blend": source_blend,
        "manifest_path": manifest_path,
        "target_blend": target_blend,
        "target_glb": target_glb,
    }

def srgb_hex_to_linear(hex_str):
    hex_str = hex_str.lstrip('#')
    rgb = [int(hex_str[i:i+2], 16) / 255.0 for i in (0, 2, 4)]
    return tuple((c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4) for c in rgb) + (1.0,)

def create_unlit_materials():
    materials = {}
    palette = [
        ("InkMat_OffWhite", "#dedcd4"),
        ("InkMat_Charcoal", "#181a1b"),
        ("InkMat_SafetyOrange", "#d45538"),
    ]
    for idx, (name, hex_val) in enumerate(palette):
        existing = bpy.data.materials.get(name)
        if existing:
            materials[idx] = existing
            continue
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

def load_prop_dimensions(manifest_path, out_dir):
    dimensions_map = {}
    # Try manifest.json first
    if os.path.exists(manifest_path):
        with open(manifest_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            models = data.get("models", [])
            for m in models:
                if "id" in m and "dimensions" in m:
                    dimensions_map[m["id"]] = m["dimensions"]
    # Fall back to props.json
    props_json = os.path.join(out_dir, "props.json")
    if os.path.exists(props_json):
        with open(props_json, "r", encoding="utf-8") as f:
            data = json.load(f)
            for m in data.get("models", []):
                if m["id"] not in dimensions_map and "dimensions" in m:
                    dimensions_map[m["id"]] = m["dimensions"]
    return dimensions_map

def parse_glb_stats(glb_path):
    with open(glb_path, "rb") as f:
        magic, version, length = struct.unpack("<4sII", f.read(12))
        assert magic == b"glTF", "File is not a valid glTF 2.0 binary"
        chunk_len, chunk_type = struct.unpack("<II", f.read(8))
        assert chunk_type == 0x4E4F534A, "First chunk is not JSON"
        gltf = json.loads(f.read(chunk_len).decode("utf-8"))

        bin_chunk_len, bin_chunk_type = struct.unpack("<II", f.read(8))
        assert bin_chunk_type == 0x004E4942, "Second chunk is not BIN"
        bin_data = f.read(bin_chunk_len)

    accessors = gltf.get("accessors", [])
    buffer_views = gltf.get("bufferViews", [])
    meshes = gltf.get("meshes", [])
    nodes = gltf.get("nodes", [])
    materials = gltf.get("materials", [])
    extensions = gltf.get("extensionsUsed", [])

    # Unique geometry stats from mesh primitives
    unique_tris = 0
    unique_verts = 0
    mesh_vertex_arrays = {}

    for m_idx, mesh in enumerate(meshes):
        verts_all_prims = []
        for prim in mesh.get("primitives", []):
            if "indices" in prim:
                idx_acc = accessors[prim["indices"]]
                unique_tris += idx_acc["count"] // 3
            if "POSITION" in prim["attributes"]:
                pos_acc = accessors[prim["attributes"]["POSITION"]]
                count = pos_acc["count"]
                unique_verts += count
                # Read position buffer
                bv = buffer_views[pos_acc["bufferView"]]
                offset = bv.get("byteOffset", 0) + pos_acc.get("byteOffset", 0)
                # Parse floats
                raw_floats = struct.unpack(f"<{count * 3}f", bin_data[offset:offset + count * 12])
                verts = [raw_floats[i:i+3] for i in range(0, len(raw_floats), 3)]
                verts_all_prims.extend(verts)
        mesh_vertex_arrays[m_idx] = verts_all_prims

    # Instanced stats evaluated across all nodes
    scene_tris = 0
    scene_verts = 0
    min_world = [float("inf")] * 3
    max_world = [float("-inf")] * 3

    def quat_rotate(q, v):
        # q is (x, y, z, w)
        qx, qy, qz, qw = q
        vx, vy, vz = v
        # t = 2 * cross(q.xyz, v)
        tx = 2.0 * (qy * vz - qz * vy)
        ty = 2.0 * (qz * vx - qx * vz)
        tz = 2.0 * (qx * vy - qy * vx)
        # v' = v + w * t + cross(q.xyz, t)
        rx = vx + qw * tx + (qy * tz - qz * ty)
        ry = vy + qw * ty + (qz * tx - qx * tz)
        rz = vz + qw * tz + (qx * ty - qy * tx)
        return (rx, ry, rz)

    for node in nodes:
        m_idx = node.get("mesh")
        if m_idx is None:
            continue
        mesh = meshes[m_idx]
        for prim in mesh.get("primitives", []):
            if "indices" in prim:
                scene_tris += accessors[prim["indices"]]["count"] // 3
            if "POSITION" in prim["attributes"]:
                scene_verts += accessors[prim["attributes"]["POSITION"]]["count"]

        scale = node.get("scale", [1.0, 1.0, 1.0])
        rotation = node.get("rotation")  # [x, y, z, w]
        translation = node.get("translation", [0.0, 0.0, 0.0])

        for v in mesh_vertex_arrays[m_idx]:
            # Apply scale
            vx, vy, vz = v[0] * scale[0], v[1] * scale[1], v[2] * scale[2]
            # Apply rotation
            if rotation:
                vx, vy, vz = quat_rotate(rotation, (vx, vy, vz))
            # Apply translation
            wx = vx + translation[0]
            wy = vy + translation[1]
            wz = vz + translation[2]

            min_world[0] = min(min_world[0], wx)
            min_world[1] = min(min_world[1], wy)
            min_world[2] = min(min_world[2], wz)
            max_world[0] = max(max_world[0], wx)
            max_world[1] = max(max_world[1], wy)
            max_world[2] = max(max_world[2], wz)

    dimensions = [round(max_world[i] - min_world[i], 3) for i in range(3)]
    min_world = [round(v, 3) for v in min_world]
    max_world = [round(v, 3) for v in max_world]

    return {
        "file_size_bytes": os.path.getsize(glb_path),
        "node_count": len(nodes),
        "mesh_count": len(meshes),
        "material_count": len(materials),
        "materials": [m.get("name") for m in materials],
        "extensions_used": extensions,
        "unique_triangles": unique_tris,
        "unique_vertices": unique_verts,
        "scene_triangles": scene_tris,
        "scene_vertices": scene_verts,
        "bounds_min": min_world,
        "bounds_max": max_world,
        "dimensions": dimensions,
        "nodes": [n.get("name") for n in nodes],
    }

def main():
    paths = parse_cli_args()
    out_dir = paths["out_dir"]
    district_path = paths["district_path"]
    source_blend = paths["source_blend"]
    manifest_path = paths["manifest_path"]
    target_blend = paths["target_blend"]
    target_glb = paths["target_glb"]

    print("=" * 60)
    print("INKLINE INDUSTRIAL DISTRICT LEVEL GENERATOR")
    print("=" * 60)
    print(f"Asset directory:    {out_dir}")
    print(f"District JSON:      {district_path}")
    print(f"Source blend:       {source_blend}")
    print(f"Target blend scene: {target_blend}")
    print(f"Target GLB export:  {target_glb}")
    print("=" * 60)

    # 1. Load district placements
    if not os.path.exists(district_path):
        raise FileNotFoundError(f"District specification not found: {district_path}")

    with open(district_path, "r", encoding="utf-8") as f:
        district_data = json.load(f)

    placements = district_data.get("placements", [])
    if not placements:
        raise ValueError(f"No placements found in {district_path}")

    unique_prop_ids = sorted(list(set(p["id"] for p in placements)))
    print(f"Loaded {len(placements)} placements across {len(unique_prop_ids)} unique prop types.")

    # 2. Load prop dimensions from manifest
    dimensions_map = load_prop_dimensions(manifest_path, out_dir)
    print(f"Loaded dimensions for {len(dimensions_map)} catalog models.")

    # 3. Setup Blender scene and load shared mesh datablocks
    if os.path.exists(source_blend):
        print(f"Loading shared meshes from source showroom: {source_blend}")
        bpy.ops.wm.open_mainfile(filepath=source_blend)

        # Clear existing showroom objects and collections
        for obj in list(bpy.data.objects):
            bpy.data.objects.remove(obj, do_unlink=True)
        for col in list(bpy.data.collections):
            bpy.data.collections.remove(col)

        # Purge meshes that are not part of the district kit to keep the blend clean
        needed_mesh_names = set(f"mesh_{pid}" for pid in unique_prop_ids)
        for m in list(bpy.data.meshes):
            if m.name not in needed_mesh_names:
                bpy.data.meshes.remove(m, do_unlink=True)

        # Verify all needed meshes exist
        for pid in unique_prop_ids:
            mesh_name = f"mesh_{pid}"
            if mesh_name not in bpy.data.meshes:
                raise ValueError(f"Required mesh '{mesh_name}' not found in {source_blend}")
    else:
        print(f"Source blend not found at {source_blend}; falling back to individual GLBs in props/")
        for obj in list(bpy.data.objects):
            bpy.data.objects.remove(obj, do_unlink=True)
        for col in list(bpy.data.collections):
            bpy.data.collections.remove(col)
        for mesh in list(bpy.data.meshes):
            bpy.data.meshes.remove(mesh, do_unlink=True)

        materials = create_unlit_materials()
        props_dir = os.path.join(out_dir, "props")

        for pid in unique_prop_ids:
            glb_file = os.path.join(props_dir, f"{pid}.glb")
            if not os.path.exists(glb_file):
                raise FileNotFoundError(f"Prop GLB not found: {glb_file}")
            bpy.ops.import_scene.gltf(filepath=glb_file)
            imported_objs = [o for o in bpy.context.selected_objects if o.type == "MESH"]
            if not imported_objs:
                raise RuntimeError(f"Failed to import mesh from {glb_file}")
            src_obj = imported_objs[0]
            mesh = src_obj.data
            mesh.name = f"mesh_{pid}"
            bpy.data.objects.remove(src_obj, do_unlink=True)

    # 4. Create District collection
    district_col = bpy.data.collections.new("District")
    bpy.context.scene.collection.children.link(district_col)

    # 5. Instantiate placements with exact coordinates, yaw, scale, and naming ID-###
    id_counters = {}
    created_objects = []

    for placement in placements:
        pid = placement["id"]
        id_counters[pid] = id_counters.get(pid, 0) + 1
        instance_idx = id_counters[pid]
        obj_name = f"{pid}-{instance_idx:03d}"

        mesh = bpy.data.meshes.get(f"mesh_{pid}")
        if not mesh:
            raise KeyError(f"Mesh datablock mesh_{pid} is missing")

        obj = bpy.data.objects.new(obj_name, mesh)

        # Three.js (glTF) Y-up to Blender Z-up coordinate conversion:
        # Three.js: (x, y, z) -> Blender: (x, -z, y)
        at = placement["at"]
        obj.location = (at[0], -at[2], at[1])

        # Yaw in Three.js (about vertical +Y) maps to yaw in Blender (about vertical +Z)
        yaw = placement.get("yaw", 0.0) or 0.0
        obj.rotation_euler = (0.0, 0.0, yaw)

        # Scale conversion: desired_size / manifest_dimensions in X, Z, Y order
        # Blender X corresponds to Three.js X
        # Blender Y corresponds to Three.js Z (depth)
        # Blender Z corresponds to Three.js Y (height)
        if "size" in placement and placement["size"]:
            desired_size = placement["size"]
            manifest_dim = dimensions_map.get(pid)
            if not manifest_dim:
                # Fall back to mesh dimensions
                manifest_dim = [
                    max(0.001, mesh.dimensions.x if hasattr(mesh, 'dimensions') else 1.0),
                    max(0.001, mesh.dimensions.z if hasattr(mesh, 'dimensions') else 1.0),
                    max(0.001, mesh.dimensions.y if hasattr(mesh, 'dimensions') else 1.0),
                ]
            sx = desired_size[0] / max(0.001, manifest_dim[0])
            sy = desired_size[2] / max(0.001, manifest_dim[2])
            sz = desired_size[1] / max(0.001, manifest_dim[1])
            obj.scale = (sx, sy, sz)
        else:
            obj.scale = (1.0, 1.0, 1.0)

        district_col.objects.link(obj)
        created_objects.append(obj)

    print(f"Created {len(created_objects)} named placement objects in collection 'District'.")

    # 6. Add useful Blender camera (orthographic isometric overview), not exported in GLB
    cam_data = bpy.data.cameras.new("DistrictCamera")
    cam_data.type = "ORTHO"
    cam_data.ortho_scale = 48.0
    cam_obj = bpy.data.objects.new("DistrictCamera", cam_data)
    cam_obj.location = mathutils.Vector((28.0, -28.0, 22.0))
    target_focus = mathutils.Vector((0.0, 0.0, 2.0))
    cam_dir = target_focus - cam_obj.location
    cam_obj.rotation_euler = cam_dir.to_track_quat("-Z", "Y").to_euler()

    bpy.context.scene.collection.objects.link(cam_obj)
    bpy.context.scene.camera = cam_obj
    print(f"Configured active orthographic scene camera at {cam_obj.location}.")

    # 7. Save inspectable full-scene .blend
    os.makedirs(os.path.dirname(target_blend), exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=target_blend)
    print(f"Saved editable district scene: {target_blend}")

    # 8. Export static GLB with proper Y-up and named objects
    os.makedirs(os.path.dirname(target_glb), exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=target_glb,
        export_format="GLB",
        export_yup=True,
        export_apply=False,  # Preserves instanced node transforms and shared mesh datablocks
        export_materials="EXPORT",
        export_cameras=False,  # Strictly no cameras in exported GLB
        export_lights=False,   # Strictly no lights in exported GLB
        export_animations=False,
    )
    print(f"Exported static district GLB: {target_glb}")

    # 9. Verify exported GLB header and structure
    stats = parse_glb_stats(target_glb)
    print("\n" + "=" * 60)
    print("VERIFICATION & SCENE METRICS REPORT")
    print("=" * 60)
    print(f"  Exported GLB:        {target_glb}")
    print(f"  GLB File Size:       {stats['file_size_bytes']:,} bytes ({stats['file_size_bytes'] / 1024:.1f} KB)")
    print(f"  Source Blend:        {target_blend}")
    print(f"  Blend File Size:     {os.path.getsize(target_blend):,} bytes ({os.path.getsize(target_blend) / 1024:.1f} KB)")
    print(f"  Placements (Nodes):  {stats['node_count']} (expected {len(placements)})")
    print(f"  Unique Meshes:       {stats['mesh_count']} (expected {len(unique_prop_ids)})")
    print(f"  Materials:           {stats['material_count']} {stats['materials']}")
    print(f"  glTF Extensions:     {stats['extensions_used']}")
    print(f"  Unique Triangles:    {stats['unique_triangles']:,}")
    print(f"  Unique Vertices:     {stats['unique_vertices']:,}")
    print(f"  Scene Triangles:     {stats['scene_triangles']:,} (instanced total)")
    print(f"  Scene Vertices:      {stats['scene_vertices']:,} (instanced total)")
    print(f"  World Bounds Min:    {stats['bounds_min']} (X, Y, Z)")
    print(f"  World Bounds Max:    {stats['bounds_max']} (X, Y, Z)")
    print(f"  World Dimensions:    {stats['dimensions']} (Width, Height, Depth)")
    print("=" * 60)

    # Sanity checks
    assert stats["node_count"] == len(placements), f"Mismatch in node count: {stats['node_count']} vs {len(placements)}"
    assert stats["mesh_count"] == len(unique_prop_ids), f"Mismatch in mesh count: {stats['mesh_count']} vs {len(unique_prop_ids)}"
    assert "KHR_materials_unlit" in stats["extensions_used"], "Missing KHR_materials_unlit extension"
    assert len(stats["nodes"]) == len(set(stats["nodes"])), "Duplicate node names detected in GLB"

    print("ALL CHECKS PASSED: Industrial District scene and GLB successfully generated and verified.")

if __name__ == "__main__":
    main()
