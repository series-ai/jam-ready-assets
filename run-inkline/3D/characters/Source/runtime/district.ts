import * as THREE from 'three'
import { AssetLibrary, addOutlines, bakeStatic, disposeInstance } from './assets'
import type { WorldCollision, Surface } from './physics'
import type { Vec3 } from '../types'
import { CameraClearance } from './camera'
import { EXTRA_LAYOUTS, type DistrictLayoutId } from './layouts'

export interface Placement { id: string; at: Vec3; size?: Vec3; yaw?: number }
export const DISTRICT_PLACEMENTS: Placement[] = []
const put = (id: string, at: Vec3, size?: Vec3, yaw = 0) => DISTRICT_PLACEMENTS.push({ id, at, size, yaw })
for (let x = -14; x <= 14; x += 4) for (let z = -12; z <= 12; z += 4) put('floor-slab', [x, -.16, z], [4, .16, 4])
for (const z of [-8, 2]) {
  put('warehouse', [-11, 0, z], [7, 5.5, 7])
  put('vent-fan', [-11, 5.35, z], [1.6, 1, 1.6])
  put('electrical-cabinet', [-6.95, 0, z + 1], [1, 1.7, .7])
  put('pipe-straight', [-7.35, 3.8, z], [.4, .4, 6.5])
  put('pipe-support', [-7.35, 2.9, z - 2], [.75, .9, .5])
  put('pipe-support', [-7.35, 2.9, z + 2], [.75, .9, .5])
  put('pipe-valve', [-7.2, 1.1, z + 3.3], [.6, 1.2, .6])
  put('ladder', [-6.9, 0, z - 2], [.7, 5.5, .25], Math.PI / 2)
}
put('catwalk', [-11, 4, -3], [3, 1.15, 7], Math.PI / 2)
put('rail-straight', [-14.3, 4.25, -3], [3, 1, .15], Math.PI / 2)
for (const x of [8.5, 12]) {
  put('tank-vertical', [x, 0, -9], [2.4, 5.3, 2.4])
  put('pipe-straight', [x, .5, -6.5], [.4, .4, 2.8])
  put('pipe-elbow', [x, .5, -5], [.6, .6, .6])
}
put('smokestack', [14, 0, -12], [1.2, 9, 1.2])
put('generator', [9, 0, -3.5], [3, 2, 2])
put('tank-horizontal', [13, 0, -4], [2.2, 2.3, 4.5])
put('conveyor', [10.5, 0, 1], [5, 1.1, 1.2])
put('crane', [13, 0, 5.5], [4.5, 7, 5])
put('cargo-container', [-11, 0, 10], [7, 2.6, 3.2])
put('cargo-container', [-11, 2.6, 10], [7, 2.6, 3.2])
put('cargo-container', [10, 0, 10], [6, 2.6, 3.2])
for (const [x, z] of [[-5, 8], [-5, 9.5], [11, 4], [12, 4.5], [-6, -10]]) {
  put('barrel', [x, 0, z], [.65, .95, .65])
  put('pallet', [x + .6, 0, z + .8], [1.2, .15, 1])
}
for (const [x, z] of [[-4, 10], [-5, -6], [12, 7]]) {
  put('crate', [x, .15, z], [1, 1, 1]); put('pallet', [x, 0, z], [1.2, .15, 1.2])
}
put('cable-spool', [-4.7, 0, -8], [1.4, 1.3, 1.4])
for (let z = -12; z <= 12; z += 4) {
  put('fence-panel', [16, 0, z], [4, 2, .1], Math.PI / 2)
  if (z !== 0) put('fence-panel', [-16, 0, z], [4, 2, .1], Math.PI / 2)
}
for (let x = -14; x <= 14; x += 4) {
  put('fence-panel', [x, 0, -14], [4, 2, .1])
  if (Math.abs(x) > 3) put('fence-panel', [x, 0, 14], [4, 2, .1])
}
put('fence-gate', [0, 0, 14], [5, 2.5, .2])
for (const [x, z] of [[-4, -11], [4, -11], [-4, 11], [4, 11]]) put('street-lamp', [x, 0, z], [.8, 5, .8])
for (const z of [-6, 0, 6]) put('bollard', [-3.5, 0, z], [.25, .8, .25])
put('floodlight', [13.5, 0, 0], [1, 6, 1])
put('barrier', [0, 0, -12], [4, .9, .6])

// A connected route climbs from the yard to the east catwalk.
put('ramp-low', [4, 0, 7], [2.2, 1.164, 3])
put('platform-low', [4, 0, 4.5], [2.2, 1.025, 2])
put('ramp-high', [4, 1.025, 2], [2.2, 3.022, 3])
put('platform-high', [4, 0, -.5], [2.2, 3.025, 2])
put('catwalk', [4, 3.025, -3.5], [2.2, 1.125, 4])
put('stair-flight', [1.5, 0, -6.5], [2.2, 4.526, 4], Math.PI / 2)

const route: Surface[] = [
  { minX: 2.9, maxX: 5.1, minZ: 5.5, maxZ: 8.5, y: 1, slopeZ: -1 / 3 },
  { minX: 2.9, maxX: 5.1, minZ: 3.5, maxZ: 5.5, y: 1.025 },
  { minX: 2.9, maxX: 5.1, minZ: .5, maxZ: 3.5, y: 3.025, slopeZ: -2 / 3 },
  { minX: 2.9, maxX: 5.1, minZ: -1.5, maxZ: .5, y: 3.025 },
  { minX: 2.9, maxX: 5.1, minZ: -5.5, maxZ: -1.5, y: 3.125 },
]
export const DISTRICT_COLLISION: WorldCollision = {
  limit: 15,
  surfaces: route,
  obstacles: [
    { minX: -14.5, maxX: -7.5, minY: 0, maxY: 5.5, minZ: -11.5, maxZ: -4.5 },
    { minX: -14.5, maxX: -7.5, minY: 0, maxY: 5.5, minZ: -1.5, maxZ: 5.5 },
    { minX: -14.5, maxX: -7.5, minY: 0, maxY: 5.2, minZ: 8.4, maxZ: 11.6 },
    { minX: 7, maxX: 13, minY: 0, maxY: 2.6, minZ: 8.4, maxZ: 11.6 },
    { minX: 7.5, maxX: 10.5, minY: 0, maxY: 2, minZ: -4.5, maxZ: -2.5 },
    { minX: 7.3, maxX: 13.2, minY: 0, maxY: 5.3, minZ: -10.2, maxZ: -7.8 },
    { minX: 2.9, maxX: 5.1, minY: 0, maxY: 1.025, minZ: 3.5, maxZ: 5.5 },
    { minX: 2.9, maxX: 5.1, minY: 0, maxY: 3.025, minZ: -1.5, maxZ: .5 },
  ],
}
export const CHECKPOINTS: Vec3[] = [[0, .8, 9], [4, 1.825, 4.5], [4, 3.825, -.5], [4, 3.925, -4.5], [0, .8, -7], [-3, .8, -3], [-3, .8, 4]]

const OVERVIEW_PLACEMENTS: Placement[] = [
  { id: 'warehouse', at: [-4.8, 0, -5], size: [4, 3.5, 3.5] },
  { id: 'tank-vertical', at: [4.8, 0, -5], size: [1.8, 4.2, 1.8] },
  { id: 'pipe-straight', at: [3.2, .4, -3], size: [.2, .2, 4], yaw: Math.PI / 2 },
  { id: 'pipe-elbow', at: [1.1, .4, -3], size: [.35, .35, .35] },
  { id: 'ramp-low', at: [2.8, 0, -.9], size: [1.8, .8, 2.5] },
  { id: 'platform-low', at: [2.8, 0, -3], size: [1.8, .8, 1.6] },
  { id: 'crate', at: [-3, 0, -1.8], size: [.9, .9, .9] },
  { id: 'barrel', at: [-4, 0, -1.4], size: [.65, 1, .65] },
  { id: 'pallet', at: [-2.8, 0, -3], size: [1.5, .18, 1.1] },
  { id: 'rail-straight', at: [2.8, .8, -3.75], size: [1.8, .8, .1] },
  { id: 'street-lamp', at: [-2.5, 0, -4.5], size: [.5, 3.8, .5] },
]
export async function createDistrict(library: AssetLibrary, overview = false, layout: DistrictLayoutId = 'district'): Promise<{ root: THREE.Group; outlines: THREE.Group; clearance: CameraClearance }> {
  const placements = overview ? OVERVIEW_PLACEMENTS : layout === 'district' ? DISTRICT_PLACEMENTS : EXTRA_LAYOUTS.find(item => item.id === layout)!.placements
  const ids = [...new Set(placements.map(placement => placement.id))]
  await Promise.all(ids.map(id => library.load(id)))
  const objects = await Promise.all(placements.map(async placement => {
    const { root, entry } = await library.create(placement.id)
    if (placement.size) root.scale.set(...placement.size.map((size, i) => size / Math.max(.001, entry.dimensions[i])) as Vec3)
    root.position.set(...placement.at); root.rotation.y = placement.yaw ?? 0
    return root
  }))
  const clearance = new CameraClearance(objects)
  const root = bakeStatic(objects)
  for (const object of objects) disposeInstance(object)
  const outlines = addOutlines(root, '#91978f')
  // Sparse painted route marks remain legible without a texture map.
  const marks = new THREE.Group()
  if (overview || layout === 'district') for (let z = overview ? -5 : -10; z <= (overview ? 2 : 10); z += 2) {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(.06, .65), new THREE.MeshBasicMaterial({ color: '#b8b9ae' }))
    mesh.rotation.x = -Math.PI / 2; mesh.position.set(0, .005, z); mesh.userData.ownedGeometry = true; marks.add(mesh)
  }
  root.add(marks)
  return { root, outlines, clearance }
}
