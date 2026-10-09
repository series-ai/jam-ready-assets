import * as THREE from 'three'
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { DEFAULT_AVATAR, type AnimationEntry, type AvatarConfig, type ModelEntry, type PackManifest } from '../types'
import { figureBands, INK, propColor, PROP_OUTLINE, THREAT, THREAT_CONTOUR, type FigureRole } from './palette'
import firearms from './firearms.json'

export interface LoadedModel { root: THREE.Group; clips: THREE.AnimationClip[]; entry: ModelEntry }
export class AssetLibrary {
  private readonly loader = new GLTFLoader()
  private readonly pending = new Map<string, Promise<GLTF>>()
  private readonly entries: Map<string, ModelEntry>
  constructor(readonly manifest: PackManifest, private readonly baseURL: string | URL = document.baseURI) { this.entries = new Map(manifest.models.map(entry => [entry.id, entry])) }
  entry(id: string): ModelEntry {
    const entry = this.entries.get(id)
    if (!entry) throw new Error(`Model is not in the catalog: ${id}`)
    return entry
  }
  async load(id: string): Promise<GLTF> {
    const entry = this.entry(id)
    let promise = this.pending.get(id)
    if (!promise) {
      promise = this.loader.loadAsync(new URL(entry.file, this.baseURL).href)
      this.pending.set(id, promise)
      promise.catch(() => this.pending.delete(id))
    }
    return promise
  }
  async create(id: string): Promise<LoadedModel> {
    const gltf = await this.load(id)
    const root = cloneSkeleton(gltf.scene) as THREE.Group
    root.traverse(object => {
      if (object instanceof THREE.Mesh) {
        object.material = Array.isArray(object.material) ? object.material.map(material => material.clone()) : object.material.clone()
        object.frustumCulled = !(object instanceof THREE.SkinnedMesh)
      }
    })
    return { root, clips: gltf.animations, entry: this.entry(id) }
  }
  dispose(): void {
    for (const promise of this.pending.values()) void promise.then(gltf => {
      gltf.scene.traverse(object => {
        if (!(object instanceof THREE.Mesh)) return
        object.geometry.dispose()
        for (const material of Array.isArray(object.material) ? object.material : [object.material]) material.dispose()
      })
    }).catch(() => {})
    this.pending.clear()
  }
}

export function disposeInstance(root: THREE.Object3D): void {
  const skeletons = new Set<THREE.Skeleton>()
  root.traverse(object => {
    if (!(object instanceof THREE.Mesh || object instanceof THREE.LineSegments)) return
    const materials = Array.isArray(object.material) ? object.material : [object.material]
    materials.forEach(material => material.dispose())
    if (object.userData.ownedGeometry) object.geometry.dispose()
    if (object instanceof THREE.SkinnedMesh && !object.userData.inkContour) skeletons.add(object.skeleton)
  })
  for (const skeleton of skeletons) skeleton.dispose()
  root.removeFromParent()
}

function ownMesh(geometry: THREE.BufferGeometry, color: THREE.ColorRepresentation): THREE.Mesh {
  const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color })); mesh.userData.ownedGeometry = true; return mesh
}
interface AvatarMeshData { positions: Float32Array; centers: Float32Array; heads: Uint8Array; headOrigin: THREE.Vector3; headCenter: THREE.Vector3; headRadius: number }
const avatarMeshData = new WeakMap<THREE.SkinnedMesh, AvatarMeshData>()
const glslVec = (v: THREE.Vector3) => `vec3(${v.x.toFixed(3)}, ${v.y.toFixed(3)}, ${v.z.toFixed(3)})`
/** Two-band cel shading with a grazing ink edge. Bands come from the palette role. */
export function figureMaterial(role: FigureRole, color: THREE.ColorRepresentation): THREE.MeshBasicMaterial {
  const material = new THREE.MeshBasicMaterial({ color: role === 'threat' ? THREAT : color })
  const bands = figureBands(role, color)
  const key = [bands.shadow, bands.mid, bands.lit, bands.ink].map(glslVec).join('')
  material.onBeforeCompile = shader => {
    shader.vertexShader = 'varying vec3 vFigureViewNormal;\nvarying vec3 vFigureViewPos;\n' + shader.vertexShader.replace('#include <project_vertex>', `
      #include <project_vertex>
      #ifdef USE_SKINNING
      vFigureViewNormal = normalize(transformedNormal);
      #else
      // Rigid pieces (a shattered figure) have no skinning normal pass.
      vFigureViewNormal = normalize(normalMatrix * normal);
      #endif
      vFigureViewPos = mvPosition.xyz;
    `)
    shader.fragmentShader = 'varying vec3 vFigureViewNormal;\nvarying vec3 vFigureViewPos;\n' + shader.fragmentShader.replace('#include <dithering_fragment>', `
      #include <dithering_fragment>
      vec3 n = normalize(vFigureViewNormal);
      // View-space key light from the upper right.
      float nDotL = dot(n, normalize(vec3(0.35, 0.75, 0.55)));
      vec3 col = mix(${glslVec(bands.shadow)}, ${glslVec(bands.mid)}, smoothstep(-0.05, 0.05, nDotL));
      col = mix(col, ${glslVec(bands.lit)}, smoothstep(${bands.litStart.toFixed(2)}, ${bands.litEnd.toFixed(2)}, nDotL) * ${bands.litWeight.toFixed(2)});
      // Grazing limb edges blend to ink so crossed limbs stay separate.
      float innerEdge = smoothstep(0.12, 0.38, abs(dot(normalize(-vFigureViewPos), n)));
      gl_FragColor = vec4(mix(${glslVec(bands.ink)}, col, innerEdge), 1.0);
    `)
  }
  material.customProgramCacheKey = () => `inkline-figure-${key}`
  return material
}

/** Replace every figure skin material with the cel material for its role. */
export function applyFigureShading(root: THREE.Object3D, role: FigureRole, color: THREE.ColorRepresentation = DEFAULT_AVATAR.color): void {
  const meshes: THREE.SkinnedMesh[] = []
  root.traverse(object => { if (object instanceof THREE.SkinnedMesh && !object.userData.inkContour) meshes.push(object) })
  for (const mesh of meshes) {
    const previous = mesh.material
    mesh.material = figureMaterial(role, color)
    for (const material of Array.isArray(previous) ? previous : [previous]) material.dispose()
    updatePaleInkContour(mesh, role)
  }
}

/** Flat key-light shading for props. Normals are in world space for baked and placed props. */
export function architecturalMaterial(color: THREE.Color, side: THREE.Side = THREE.FrontSide): THREE.MeshBasicMaterial {
  const material = new THREE.MeshBasicMaterial({ color, side })
  material.onBeforeCompile = shader => {
    shader.vertexShader = 'varying vec3 vArchNormal;\n' + shader.vertexShader.replace('#include <begin_vertex>', `
      #include <begin_vertex>
      vArchNormal = normalize(mat3(modelMatrix) * normal);
    `)
    // Shade before fog so distant faces fade to paper, not to a darkened paper.
    shader.fragmentShader = 'varying vec3 vArchNormal;\n' + shader.fragmentShader.replace('#include <fog_fragment>', `
      vec3 n = normalize(vArchNormal);
      float nDotL = dot(n, normalize(vec3(0.35, 0.9, 0.25)));
      float wallShade = mix(0.70, 0.88, clamp(nDotL * 0.5 + 0.5, 0.0, 1.0));
      float archFactor = mix(wallShade, 1.08, pow(clamp(n.y, 0.0, 1.0), 1.8));
      archFactor = mix(archFactor, 0.48, clamp(-n.y, 0.0, 1.0));
      gl_FragColor.rgb *= archFactor;
      #include <fog_fragment>
    `)
  }
  material.customProgramCacheKey = () => 'inkline-arch-v2'
  return material
}

/** Remap a placed prop or held item to the palette and give it architectural shading. */
export function applyPropShading(root: THREE.Object3D): void {
  root.traverse(object => {
    if (!(object instanceof THREE.Mesh) || object instanceof THREE.SkinnedMesh || object.userData.inkContour) return
    const list = Array.isArray(object.material) ? object.material : [object.material]
    const next = list.map(material => {
      if (!(material instanceof THREE.MeshStandardMaterial || material instanceof THREE.MeshBasicMaterial)) throw new Error(`Prop material type is not supported: ${material.type}`)
      if (material.transparent || material.map) throw new Error('Prop shading supports opaque untextured materials only.')
      const shaded = architecturalMaterial(propColor(material.name, material.color), material.side)
      shaded.name = material.name
      material.dispose()
      return shaded
    })
    object.material = Array.isArray(object.material) ? next : next[0]
  })
}

/** A screen-width back-face contour follows the same skin as the figure. */
function updatePaleInkContour(mesh: THREE.SkinnedMesh, role: FigureRole): void {
  const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
  const pale = role === 'threat' || materials.some(material => material instanceof THREE.MeshBasicMaterial &&
    material.color.r * .2126 + material.color.g * .7152 + material.color.b * .0722 >= .45)
  let outline = mesh.children.find(child => child.userData.inkContour) as THREE.SkinnedMesh | undefined
  if (!pale) { if (outline) { outline.visible = false; outline.userData.pale = false }; return }
  const contourColor = role === 'threat' ? THREAT_CONTOUR : INK
  if (!outline) {
    const viewport = new THREE.Vector2(1, 1)
    const width = { value: 1.35 }
    const material = new THREE.MeshBasicMaterial({ color: contourColor, side: THREE.BackSide })
    material.onBeforeCompile = shader => {
      shader.uniforms.inkViewport = { value: viewport }
      shader.uniforms.inkWidth = width
      shader.vertexShader = 'uniform vec2 inkViewport; uniform float inkWidth;\n' + shader.vertexShader
      shader.vertexShader = shader.vertexShader.replace('#include <project_vertex>', `
        #include <project_vertex>
        // BackSide flips transformedNormal. Undo that flip for outward expansion.
        vec2 inkNormal = -transformedNormal.xy;
        float inkLength = length(inkNormal);
        if (inkLength > 0.0001) gl_Position.xy += inkNormal / inkLength *
          (2.0 * inkWidth / inkViewport) * gl_Position.w;
      `)
    }
    material.customProgramCacheKey = () => 'inkline-screen-contour-v1'
    outline = new THREE.SkinnedMesh(mesh.geometry, material)
    outline.name = 'avatar-ink-contour'; outline.userData.inkContour = true
    outline.frustumCulled = false
    outline.bind(mesh.skeleton, mesh.bindMatrix)
    outline.onBeforeRender = renderer => {
      renderer.getDrawingBufferSize(viewport)
      width.value = 1.35 * renderer.getPixelRatio()
    }
    mesh.add(outline)
  } else if (outline.material instanceof THREE.MeshBasicMaterial) {
    outline.material.color.set(contourColor)
  }
  outline.geometry = mesh.geometry
  outline.userData.pale = true; outline.visible = true
}
function deformAvatar(mesh: THREE.SkinnedMesh, thickness: number, headScale: number): void {
  let data = avatarMeshData.get(mesh)
  if (!data) {
    mesh.geometry = mesh.geometry.clone(); mesh.userData.ownedGeometry = true
    const position = mesh.geometry.getAttribute('position'), skin = mesh.geometry.getAttribute('skinIndex')
    const weights = mesh.geometry.getAttribute('skinWeight')
    const positions = new Float32Array(position.array), centers = new Float32Array(position.count * 3), heads = new Uint8Array(position.count)
    const inverseBind = mesh.bindMatrix.clone().invert()
    const bindTransforms = mesh.skeleton.boneInverses.map(matrix => new THREE.Matrix4().multiplyMatrices(inverseBind, matrix.clone().invert()))
    const origins = bindTransforms.map(matrix => new THREE.Vector3().setFromMatrixPosition(matrix))

    // Smooth the shoulder cap vertices in bind pose:
    // Blend weights with Chest bone to create seamless organic connection without bulging hinge caps.
    // Use origins of UpperArm_L and UpperArm_R so the shoulder threshold is dynamic for every character body type.
    const bones = mesh.skeleton.bones.map(b => b.name)
    const chestIdx = bones.indexOf('Chest')
    const uLIdx = bones.indexOf('UpperArm_L')
    const uRIdx = bones.indexOf('UpperArm_R')
    if (chestIdx >= 0 && uLIdx >= 0 && uRIdx >= 0) {
      const shY_L = origins[uLIdx]?.y ?? 1.4
      const shY_R = origins[uRIdx]?.y ?? 1.4
      for (let i = 0; i < position.count; i++) {
        const b0 = skin.getX(i)
        const y = position.getY(i)
        const shY = b0 === uLIdx ? shY_L : b0 === uRIdx ? shY_R : null
        if (shY !== null && y > shY - 0.026) {
          const t = Math.min(1.0, Math.max(0.0, (y - (shY - 0.026)) / 0.040))
          const chestW = t * 0.45
          const armW = 1.0 - chestW
          skin.setXYZW(i, b0, chestIdx, 0, 0)
          weights.setXYZW(i, armW, chestW, 0, 0)
        }
      }
      skin.needsUpdate = true
      weights.needsUpdate = true
    }

    const segments = mesh.skeleton.bones.map((bone, index) => {
      const child = bone.children.find(item => item instanceof THREE.Bone) as THREE.Bone | undefined
      const childIndex = child ? mesh.skeleton.bones.indexOf(child) : -1
      if (childIndex >= 0) return new THREE.Line3(origins[index], origins[childIndex])
      // Leaf strokes follow the bind bone axis. A world-up fallback changes foot length.
      const axis = new THREE.Vector3(0, 1, 0).transformDirection(bindTransforms[index])
      let extent = .001
      const point = new THREE.Vector3()
      for (let vertex = 0; vertex < position.count; vertex++) {
        const influence = [skin.getX(vertex), skin.getY(vertex), skin.getZ(vertex), skin.getW(vertex)].indexOf(index)
        if (influence < 0 || [weights.getX(vertex), weights.getY(vertex), weights.getZ(vertex), weights.getW(vertex)][influence] < .5) continue
        extent = Math.max(extent, point.fromBufferAttribute(position, vertex).sub(origins[index]).dot(axis))
      }
      return new THREE.Line3(origins[index], origins[index].clone().addScaledVector(axis, extent))
    })
    const headIndex = mesh.skeleton.bones.findIndex(bone => bone.name === 'Head')
    if (headIndex < 0) throw new Error('The character mesh has no Head bone.')
    const headOrigin = origins[headIndex].clone(), point = new THREE.Vector3(), center = new THREE.Vector3()
    for (let i = 0; i < position.count; i++) {
      const influences = [weights.getX(i), weights.getY(i), weights.getZ(i), weights.getW(i)]
      const joints = [skin.getX(i), skin.getY(i), skin.getZ(i), skin.getW(i)]
      const dominant = joints[influences.indexOf(Math.max(...influences))]
      point.fromBufferAttribute(position, i)
      if (dominant === headIndex) heads[i] = 1
      segments[dominant].closestPointToPoint(point, true, center)
      center.toArray(centers, i * 3)
    }
    const headFrame = bindTransforms[headIndex].clone().invert(), headCenter = new THREE.Vector3()
    let headCount = 0, headRadius = 0
    for (let i = 0; i < position.count; i++) if (heads[i]) { headCenter.add(point.fromBufferAttribute(position, i).applyMatrix4(headFrame)); headCount++ }
    headCenter.divideScalar(headCount)
    for (let i = 0; i < position.count; i++) if (heads[i]) headRadius = Math.max(headRadius, point.fromBufferAttribute(position, i).applyMatrix4(headFrame).distanceTo(headCenter))
    data = { positions, centers, heads, headOrigin, headCenter, headRadius }; avatarMeshData.set(mesh, data)
  }
  const position = mesh.geometry.getAttribute('position')
  for (let i = 0; i < position.count; i++) {
    const factor = data.heads[i] ? headScale : thickness
    const cx = data.heads[i] ? data.headOrigin.x : data.centers[i * 3]
    const cy = data.heads[i] ? data.headOrigin.y : data.centers[i * 3 + 1]
    const cz = data.heads[i] ? data.headOrigin.z : data.centers[i * 3 + 2]
    position.setXYZ(i, cx + (data.positions[i * 3] - cx) * factor, cy + (data.positions[i * 3 + 1] - cy) * factor, cz + (data.positions[i * 3 + 2] - cz) * factor)
  }
  position.needsUpdate = true
  // Avatar scaling changes the tube cross-sections in bind space. Rebuild
  // smooth normals before the contour shader receives the skinned pose.
  mesh.geometry.computeVertexNormals()
  mesh.geometry.computeBoundingSphere()
}
export function applyAvatar(root: THREE.Group, config: AvatarConfig, role: FigureRole = 'player'): void {
  root.scale.setScalar(config.height)
  const meshes: THREE.SkinnedMesh[] = []
  root.traverse(object => { if (object instanceof THREE.SkinnedMesh && !object.userData.inkContour) meshes.push(object) })
  for (const object of meshes) deformAvatar(object, config.thickness, config.headScale)
  applyFigureShading(root, role, config.color)
  const previous = root.getObjectByName('avatar-headwear')
  if (previous) disposeInstance(previous)
  if (config.headwear === 'none') return
  const head = root.getObjectByName('Head')
  if (!head) throw new Error('The character has no head attachment bone.')
  const shape = avatarMeshData.get(meshes[0])!
  const radius = shape.headRadius, unit = radius / .145
  const accessory = new THREE.Group(); accessory.name = 'avatar-headwear'
  accessory.position.copy(shape.headCenter).multiplyScalar(config.headScale)
  const add = (geometry: THREE.BufferGeometry, at: [number, number, number], color: string) => {
    const mesh = ownMesh(geometry, color); mesh.position.set(...at); accessory.add(mesh); return mesh
  }
  if (config.headwear === 'headband' || config.headwear === 'visor') {
    const ring = add(new THREE.TorusGeometry(radius + .002 * unit, .019 * unit, 4, 20), [0, 0, 0], config.accent); ring.rotation.x = Math.PI / 2
    if (config.headwear === 'headband') {
      const tail = add(new THREE.BoxGeometry(.026 * unit, .23 * unit, .007 * unit), [.13 * unit, -.08 * unit, -.05 * unit], config.accent); tail.rotation.z = -.45
    } else add(new THREE.BoxGeometry(.21 * unit, .045 * unit, .06 * unit), [0, 0, .12 * unit], config.accent)
  } else {
    add(new THREE.SphereGeometry(radius + .012 * unit, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), [0, 0, 0], config.accent)
    if (config.headwear === 'cap' || config.headwear === 'helmet') {
      const brim = add(new THREE.CylinderGeometry(.18 * unit, .18 * unit, .018 * unit, 24), [0, -.007 * unit, config.headwear === 'cap' ? .065 * unit : 0], config.accent)
      brim.scale.z = config.headwear === 'cap' ? 1.2 : 1
    }
    if (config.headwear === 'beanie') add(new THREE.SphereGeometry(.038 * unit, 12, 8), [0, .16 * unit, 0], config.accent)
  }
  accessory.scale.setScalar(config.headScale); head.add(accessory)
}

export function addOutlines(root: THREE.Object3D, color = PROP_OUTLINE): THREE.Group {
  const lines = new THREE.Group(); lines.name = 'ink-outlines'
  root.updateMatrixWorld(true)
  const inverse = root.matrixWorld.clone().invert()
  const geometries: THREE.BufferGeometry[] = []
  root.traverse(object => {
    if (!(object instanceof THREE.Mesh) || object instanceof THREE.SkinnedMesh || object.name === 'bow-string') return
    const geometry = new THREE.EdgesGeometry(object.geometry, 24)
    geometry.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inverse, object.matrixWorld))
    geometries.push(geometry)
  })
  if (geometries.length) {
    const merged = mergeGeometries(geometries)
    if (merged) {
      const strokes = new THREE.LineSegments(merged, new THREE.LineBasicMaterial({ color, transparent: true, opacity: .65 }))
      strokes.userData.ownedGeometry = true; lines.add(strokes)
    }
    geometries.forEach(geometry => geometry.dispose())
  }
  root.add(lines)
  return lines
}

/** Bake static objects into one draw per flat material. Keep source models unchanged. */
export function bakeStatic(objects: THREE.Object3D[]): THREE.Group {
  const materials = new Map<string, { material: THREE.Material; geometries: THREE.BufferGeometry[] }>()
  for (const root of objects) {
    root.updateMatrixWorld(true)
    root.traverse(object => {
      if (!(object instanceof THREE.Mesh)) return
      const source = object.geometry
      const list = Array.isArray(object.material) ? object.material : [object.material]
      const groups = source.groups.length ? source.groups : [{ start: 0, count: source.index?.count ?? source.getAttribute('position').count, materialIndex: 0 }]
      for (const group of groups) {
        const material = list[group.materialIndex ?? 0] ?? list[0]
        if (!('color' in material) || !(material.color instanceof THREE.Color)) throw new Error('Static assets need a flat color material.')
        if (material.transparent || ('map' in material && material.map)) throw new Error('Static batching supports opaque untextured assets only.')
        const color = propColor(material.name, material.color)
        const key = `${color.getHexString()}:${material.side}`
        if (!materials.has(key)) { const arch = architecturalMaterial(color, material.side); materials.set(key, { material: arch, geometries: [] }) }
        const expanded = source.index ? source.toNonIndexed() : source.clone()
        const input = expanded.getAttribute('position')
        const count = Math.min(group.count, input.count - group.start)
        const positions = new Float32Array(count * 3)
        for (let i = 0; i < count; i++) { positions[i * 3] = input.getX(group.start + i); positions[i * 3 + 1] = input.getY(group.start + i); positions[i * 3 + 2] = input.getZ(group.start + i) }
        const geometry = new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(positions, 3))
        geometry.applyMatrix4(object.matrixWorld)
        if (object.matrixWorld.determinant() < 0) {
          const position = geometry.getAttribute('position')
          for (let i = 0; i < position.count; i += 3) {
            const x = position.getX(i + 1), y = position.getY(i + 1), z = position.getZ(i + 1)
            position.setXYZ(i + 1, position.getX(i + 2), position.getY(i + 2), position.getZ(i + 2)); position.setXYZ(i + 2, x, y, z)
          }
        }
        materials.get(key)!.geometries.push(geometry)
        expanded.dispose()
      }
    })
  }
  const result = new THREE.Group()
  for (const value of materials.values()) {
    const merged = mergeGeometries(value.geometries)
    value.geometries.forEach(geometry => geometry.dispose())
    if (!merged) continue
    merged.computeVertexNormals(); merged.computeBoundingSphere()
    const mesh = new THREE.Mesh(merged, value.material); mesh.userData.ownedGeometry = true; result.add(mesh)
  }
  return result
}

/** Select the resting preview for a held tool. */
export function equipmentPose(entry: ModelEntry): string {
  if (entry.id === 'staff') return 'staff-parry'
  if (entry.id === 'wrench') return 'idle'
  if (entry.id === 'bow') return 'bow-draw'
  if (entry.tags.includes('ranged') || entry.tags.includes('cannon')) return /pistol|revolver/.test(entry.id) ? 'pistol-idle' : 'rifle-idle'
  if (entry.tags.includes('ball') || entry.tags.includes('weight')) return 'carry'
  if (entry.tags.includes('shield')) return 'block'
  return 'idle'
}

/** Keep the authored grip origin at the palm. Derive local rotation from a known pose. */
export function mountEquipment(character: THREE.Group, model: LoadedModel, clips: THREE.AnimationClip[], animations: readonly AnimationEntry[]): void {
  if (!model.entry.tags.includes('held')) throw new Error(`${model.entry.label} is a scene object, not held equipment.`)
  const bounds = new THREE.Box3().setFromObject(model.root)
  const tip = (model.entry.tags.includes('ranged') || model.entry.tags.includes('cannon')) ? [0, model.entry.id === 'bow' ? 0 : .04, bounds.max.z] : [0, bounds.max.y, 0]
  model.root.userData.contactTip = tip
  model.root.userData.contactBase = [0, model.entry.id === 'staff' ? bounds.min.y : 0, 0]
  model.root.userData.contactKind = model.entry.tags.includes('shield') ? 'shield' : model.entry.tags.includes('ranged') || model.entry.tags.includes('cannon') ? 'ranged' : 'melee'
  if (model.entry.id === 'bow') {
    const releaseTime = animations.find(clip => clip.id === 'bow-release')?.contactTime
    if (releaseTime === undefined) throw new Error('The bow release contact time is missing.')
    model.root.userData.bowReleaseTime = releaseTime
  }
  const restPose = equipmentPose(model.entry)
  const referenceId = model.entry.id === 'staff' ? 'staff-thrust' : restPose === 'block' && !model.entry.tags.includes('shield') ? 'punch-heavy' : restPose
  const reference = clips.find(clip => clip.name === referenceId)
  if (!reference) throw new Error('The equipment reference pose is missing.')
  const referenceTime = model.entry.id === 'staff' ? animations.find(clip => clip.id === referenceId)?.contactTime : 0
  if (referenceTime === undefined || !Number.isFinite(referenceTime) || referenceTime < 0 || referenceTime > reference.duration) throw new Error('The equipment reference time is missing or invalid.')
  const handName = model.entry.id === 'bow' || model.entry.tags.includes('shield') ? 'Hand_L' : 'Hand_R'
  const hand = character.getObjectByName(handName)
  if (!hand) throw new Error(`The character has no ${handName} attachment.`)
  const pose = cloneSkeleton(character)
  pose.position.set(0, 0, 0); pose.quaternion.identity(); pose.scale.setScalar(1)
  const mixer = new THREE.AnimationMixer(pose)
  mixer.clipAction(reference).play(); mixer.update(referenceTime); pose.updateMatrixWorld(true)
  const referenceHand = pose.getObjectByName(handName)!
  model.root.quaternion.copy(referenceHand.getWorldQuaternion(new THREE.Quaternion()).invert())
  if (model.entry.id === 'staff') model.root.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2))
  model.root.position.set(0, .04, 0)
  model.root.scale.setScalar(Math.min(1, 1.8 / Math.max(...model.entry.dimensions)))
  if (/rifle|shotgun|cannon|submachine-gun/.test(model.entry.id)) model.root.userData.supportGrip = [0, -.015, .19]
  if (model.entry.id === 'rifle' || model.entry.id === 'shotgun') {
    const firearm = firearms.weapons[model.entry.id]
    const upper = pose.getObjectByName('UpperArm_R')!, forearm = pose.getObjectByName('Forearm_R')!
    const a = upper.getWorldPosition(new THREE.Vector3()), b = forearm.getWorldPosition(new THREE.Vector3())
    const armRatio = (a.distanceTo(b) + b.distanceTo(referenceHand.getWorldPosition(new THREE.Vector3()))) / firearms.referenceArmLength
    model.root.position.y = firearms.palmOffset
    model.root.scale.setScalar(firearm.scale * armRatio)
    model.root.userData.firearmId = model.entry.id
    model.root.userData.supportGrip = [...firearm.support]
    const reloadDuration = animations.find(clip => clip.id === 'rifle-reload')?.duration
    if (!reloadDuration || !Number.isFinite(reloadDuration)) throw new Error('The rifle reload duration is missing or invalid.')
    model.root.userData.reloadDuration = reloadDuration
    if (model.entry.id === 'shotgun') {
      const pump = model.root.getObjectByName('shotgun-pump')
      if (!pump) throw new Error('The shotgun pump mesh is missing.')
      pump.userData.firearmPumpRest ??= pump.position.toArray()
    } else {
      const magazine = model.root.getObjectByName('rifle-magazine')
      if (!magazine) throw new Error('The rifle magazine mesh is missing.')
      magazine.userData.firearmMagazineRest ??= magazine.position.toArray()
    }
  }
  hand.add(model.root)
  mixer.stopAllAction(); mixer.uncacheRoot(pose)
  pose.traverse(object => { if (object instanceof THREE.SkinnedMesh) object.skeleton.dispose() })
}

interface ArmSolver {
  upper: THREE.Object3D; forearm: THREE.Object3D; hand: THREE.Object3D
  a: THREE.Vector3; b: THREE.Vector3; c: THREE.Vector3; target: THREE.Vector3; axis: THREE.Vector3
  pole: THREE.Vector3; elbow: THREE.Vector3; from: THREE.Vector3; to: THREE.Vector3
  delta: THREE.Quaternion; world: THREE.Quaternion; parent: THREE.Quaternion
  upperPose: THREE.Quaternion; forearmPose: THREE.Quaternion; handPose: THREE.Quaternion
  scale: THREE.Vector3
}
const supportSolvers = new WeakMap<THREE.Group, ArmSolver>()
interface MagazineSolver { mesh: THREE.Object3D; hand: THREE.Object3D; palm: THREE.Vector3 }
const magazineSolvers = new WeakMap<THREE.Object3D, MagazineSolver>()
function moveRifleMagazine(character: THREE.Group, equipment: THREE.Object3D, clip: string, time: number): void {
  let solver = magazineSolvers.get(equipment)
  if (!solver) {
    solver = { mesh: equipment.getObjectByName('rifle-magazine')!, hand: character.getObjectByName('Hand_L')!, palm: new THREE.Vector3() }
    magazineSolvers.set(equipment, solver)
  }
  solver.mesh.position.fromArray(solver.mesh.userData.firearmMagazineRest as number[])
  const frame = time * 30, reload = firearms.reload
  if (clip === 'rifle-reload' && frame >= reload.reachFrame && frame <= reload.insertFrame) {
    character.updateMatrixWorld(true)
    solver.palm.set(0, firearms.palmOffset, 0).applyMatrix4(solver.hand.matrixWorld)
    equipment.worldToLocal(solver.palm)
    solver.mesh.position.x += solver.palm.x - reload.magazine[0]
    solver.mesh.position.y += solver.palm.y - reload.magazine[1]
    solver.mesh.position.z += solver.palm.z - reload.magazine[2]
  }
  solver.mesh.updateMatrixWorld(true)
}
interface BowStringSolver { mesh: THREE.Mesh; rest: Float32Array; weights: Float32Array; center: THREE.Vector3; target: THREE.Vector3 }
const bowStrings = new WeakMap<THREE.Object3D, BowStringSolver>()
const bowStringRest = new WeakMap<THREE.BufferGeometry, Float32Array>()
function supportBowString(character: THREE.Group, equipment: THREE.Object3D, clip: string, time: number): void {
  let solver = bowStrings.get(equipment)
  if (!solver) {
    const mesh = equipment.getObjectByName('bow-string')
    if (!(mesh instanceof THREE.Mesh)) throw new Error('The bow string mesh is missing.')
    const rest = bowStringRest.get(mesh.geometry) ?? new Float32Array(mesh.geometry.getAttribute('position').array)
    mesh.geometry = mesh.geometry.clone(); mesh.userData.ownedGeometry = true
    bowStringRest.set(mesh.geometry, rest)
    const bounds = new THREE.Box3().setFromBufferAttribute(new THREE.BufferAttribute(rest, 3)), center = bounds.getCenter(new THREE.Vector3())
    const halfLength = (bounds.max.y - bounds.min.y) * .5
    if (halfLength <= 0) throw new Error('The bow string has no length.')
    const weights = new Float32Array(rest.length / 3)
    for (let index = 0; index < weights.length; index++) weights[index] = Math.max(0, 1 - Math.abs(rest[index * 3 + 1] - center.y) / halfLength)
    solver = { mesh, rest, weights, center, target: new THREE.Vector3() }
    bowStrings.set(equipment, solver)
  }
  const drawn = clip === 'bow-draw' || clip === 'bow-release' && time < equipment.userData.bowReleaseTime
  solver.target.set(0, 0, 0)
  if (drawn) {
    const hand = character.getObjectByName('Hand_R')
    if (!hand) throw new Error('The bow draw hand is missing.')
    character.updateMatrixWorld(true)
    solver.target.set(0, .04, 0).applyMatrix4(hand.matrixWorld)
    solver.mesh.worldToLocal(solver.target).sub(solver.center).clampLength(0, .85)
  }
  const positions = solver.mesh.geometry.getAttribute('position')
  for (let index = 0; index < positions.count; index++) {
    const weight = solver.weights[index], offset = index * 3
    positions.setXYZ(index, solver.rest[offset] + solver.target.x * weight,
      solver.rest[offset + 1] + solver.target.y * weight, solver.rest[offset + 2] + solver.target.z * weight)
  }
  positions.needsUpdate = true
  solver.mesh.geometry.computeBoundingSphere(); solver.mesh.geometry.computeBoundingBox()
}
/** Keep the support palm on the foregrip after an animated rifle pose is evaluated. */
export function supportEquipment(character: THREE.Group, equipment: THREE.Object3D, clip: string, time = 0): void {
  if (equipment.userData.bowReleaseTime !== undefined) { supportBowString(character, equipment, clip, time); return }
  const firearm = equipment.userData.firearmId
  if (firearm === 'rifle') moveRifleMagazine(character, equipment, clip, time)
  let pumpOffset = 0
  if (firearm === 'shotgun') {
    const pump = equipment.getObjectByName('shotgun-pump')!
    const timing = firearms.pump, frame = time * timing.fps
    if (clip === 'shotgun-fire') pumpOffset = timing.travel * (frame <= timing.rearFrame
      ? THREE.MathUtils.smoothstep(frame, timing.startFrame, timing.rearFrame)
      : 1 - THREE.MathUtils.smoothstep(frame, timing.rearFrame, timing.returnFrame))
    pump.position.fromArray(pump.userData.firearmPumpRest as number[])
    pump.position.z += pumpOffset
    pump.updateMatrixWorld(true)
  }
  let weight = 1
  if (clip === 'rifle-reload' && firearm) {
    const progress = time / equipment.userData.reloadDuration
    weight = Math.max(1 - THREE.MathUtils.smoothstep(progress, 0, firearms.reload.releaseEnd),
      THREE.MathUtils.smoothstep(progress, firearms.reload.returnStart, 1))
  } else if (!/^(rifle-(idle|fire)|shotgun-fire)$/.test(clip)) return
  if (!equipment.userData.supportGrip || weight === 0) return
  let solver = supportSolvers.get(character)
  if (!solver) {
    const upper = character.getObjectByName('UpperArm_L'), forearm = character.getObjectByName('Forearm_L'), hand = character.getObjectByName('Hand_L')
    if (!upper || !forearm || !hand) throw new Error('The support arm is incomplete.')
    solver = { upper, forearm, hand, a: new THREE.Vector3(), b: new THREE.Vector3(), c: new THREE.Vector3(), target: new THREE.Vector3(), axis: new THREE.Vector3(), pole: new THREE.Vector3(), elbow: new THREE.Vector3(), from: new THREE.Vector3(), to: new THREE.Vector3(), delta: new THREE.Quaternion(), world: new THREE.Quaternion(), parent: new THREE.Quaternion(), upperPose: new THREE.Quaternion(), forearmPose: new THREE.Quaternion(), handPose: new THREE.Quaternion(), scale: new THREE.Vector3() }
    supportSolvers.set(character, solver)
  }
  const s = solver
  s.upperPose.copy(s.upper.quaternion); s.forearmPose.copy(s.forearm.quaternion); s.handPose.copy(s.hand.quaternion)
  character.updateMatrixWorld(true)
  s.target.fromArray(equipment.userData.supportGrip as number[])
  s.target.z += pumpOffset
  s.target.applyMatrix4(equipment.matrixWorld)
  s.axis.set(0, 0, 1).transformDirection(equipment.matrixWorld)
  s.hand.getWorldScale(s.scale)
  s.target.addScaledVector(s.axis, -firearms.palmOffset * (firearm ? s.scale.y : character.scale.x))
  s.upper.getWorldPosition(s.a); s.forearm.getWorldPosition(s.b); s.hand.getWorldPosition(s.c)
  const upperLength = s.a.distanceTo(s.b), lowerLength = s.b.distanceTo(s.c)
  const distance = Math.max(.001, Math.min(s.a.distanceTo(s.target), upperLength + lowerLength - .0001))
  s.to.copy(s.target).sub(s.a).normalize()
  const cosine = THREE.MathUtils.clamp((upperLength * upperLength + distance * distance - lowerLength * lowerLength) / (2 * upperLength * distance), -1, 1)
  if (firearm) {
    s.pole.set(.15, -1, 0).transformDirection(character.matrixWorld)
    s.pole.addScaledVector(s.to, -s.pole.dot(s.to)).normalize()
  } else s.pole.set(0, -1, 0).addScaledVector(s.to, s.to.y).normalize()
  if (s.pole.lengthSq() < .01) s.pole.set(1, 0, 0)
  s.elbow.copy(s.a).addScaledVector(s.to, upperLength * cosine).addScaledVector(s.pole, upperLength * Math.sqrt(1 - cosine * cosine))
  const rotateTo = (bone: THREE.Object3D, start: THREE.Vector3, end: THREE.Vector3, target: THREE.Vector3) => {
    s.from.copy(end).sub(start).normalize(); s.to.copy(target).sub(start).normalize()
    s.delta.setFromUnitVectors(s.from, s.to)
    bone.getWorldQuaternion(s.world).premultiply(s.delta)
    bone.parent!.getWorldQuaternion(s.parent).invert()
    bone.quaternion.copy(s.parent.multiply(s.world)); bone.updateMatrixWorld(true)
  }
  rotateTo(s.upper, s.a, s.b, s.elbow)
  s.forearm.getWorldPosition(s.b); s.hand.getWorldPosition(s.c)
  rotateTo(s.forearm, s.b, s.c, s.target)
  s.world.setFromUnitVectors(s.from.set(0, 1, 0), s.axis)
  s.hand.parent!.getWorldQuaternion(s.parent).invert()
  s.hand.quaternion.copy(s.parent.multiply(s.world)); s.hand.updateMatrixWorld(true)
  if (weight < 1) {
    s.upper.quaternion.slerpQuaternions(s.upperPose, s.upper.quaternion, weight)
    s.forearm.quaternion.slerpQuaternions(s.forearmPose, s.forearm.quaternion, weight)
    s.hand.quaternion.slerpQuaternions(s.handPose, s.hand.quaternion, weight)
    s.upper.updateMatrixWorld(true)
  }
}

/** Locate the muzzle or the part of a held weapon nearest the contact target. */
export function equipmentContactPoint(equipment: THREE.Object3D, target?: THREE.Vector3): THREE.Vector3 {
  equipment.updateWorldMatrix(true, false)
  if (equipment.userData.contactKind === 'shield') return equipment.localToWorld(new THREE.Vector3(0, 0, .04))
  const tip = equipment.localToWorld(new THREE.Vector3(...equipment.userData.contactTip as [number, number, number]))
  if (!target || equipment.userData.contactKind === 'ranged') return tip
  const grip = equipment.localToWorld(new THREE.Vector3(...equipment.userData.contactBase as [number, number, number]))
  return new THREE.Line3(grip, tip).closestPointToPoint(target, true, new THREE.Vector3())
}

/** Measure a full preview clip without changing the live figure or shared geometry. */
export function animationBounds(character: THREE.Group, clip: THREE.AnimationClip, contactTime?: number): THREE.Box3 {
  const pose = cloneSkeleton(character) as THREE.Group
  const sharedGeometry = new Set<THREE.BufferGeometry>()
  pose.traverse(object => { if (object instanceof THREE.Mesh) sharedGeometry.add(object.geometry) })
  const mixer = new THREE.AnimationMixer(pose)
  const action = mixer.clipAction(clip).setLoop(THREE.LoopOnce, 1)
  action.clampWhenFinished = true; action.play()
  let held: THREE.Object3D | undefined
  const meshes: THREE.SkinnedMesh[] = []
  pose.traverse(object => {
    if (object instanceof THREE.SkinnedMesh) meshes.push(object)
    if (object.userData.contactKind) held = object
  })
  const result = new THREE.Box3(), sample = new THREE.Box3()
  const times = new Set([0, clip.duration])
  for (let frame = 1; frame < Math.ceil(clip.duration * 30); frame++) times.add(frame / 30)
  if (contactTime !== undefined && contactTime >= 0 && contactTime <= clip.duration) times.add(contactTime)
  try {
    for (const time of [...times].sort((a, b) => a - b)) {
      action.paused = false; action.time = time; mixer.update(0)
      if (held) supportEquipment(pose, held, clip.name, time)
      pose.updateMatrixWorld(true)
      for (const mesh of meshes) mesh.computeBoundingBox()
      result.union(sample.setFromObject(pose))
    }
  } finally {
    mixer.stopAllAction(); mixer.uncacheRoot(pose)
    for (const skeleton of new Set(meshes.map(mesh => mesh.skeleton))) skeleton.dispose()
    pose.traverse(object => { if (object instanceof THREE.Mesh && !sharedGeometry.has(object.geometry)) object.geometry.dispose() })
  }
  return result
}
