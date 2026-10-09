import * as THREE from 'three'
import { ACCENT, INK, PAPER } from './palette'

const TRAIL_COUNT = 4
const SAMPLE_COUNT = 16
const VERTICES_PER_SEGMENT = 8
const SEGMENTS = TRAIL_COUNT * (SAMPLE_COUNT - 1)
interface Point { readonly x: number; readonly y: number; readonly z: number }
interface TrailSlot {
  inner: Float32Array
  outer: Float32Array
  times: Float64Array
  color: THREE.Color
  head: number
  count: number
  lifetime: number
}

/** Short swept ribbons use one mesh and fixed storage. */
export class InkTrails {
  readonly group = new THREE.Group()
  private readonly positions = new Float32Array(SEGMENTS * VERTICES_PER_SEGMENT * 3)
  private readonly colors = new Float32Array(SEGMENTS * VERTICES_PER_SEGMENT * 4)
  private readonly geometry = new THREE.BufferGeometry()
  private readonly material = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false, side: THREE.DoubleSide, toneMapped: false })
  private readonly lineInner = new THREE.Vector3()
  private readonly lineOuter = new THREE.Vector3()
  private readonly mesh: THREE.Mesh
  private readonly paper = new THREE.Color(PAPER)
  private readonly slots: TrailSlot[] = Array.from({ length: TRAIL_COUNT }, () => ({
    inner: new Float32Array(SAMPLE_COUNT * 3), outer: new Float32Array(SAMPLE_COUNT * 3),
    times: new Float64Array(SAMPLE_COUNT), color: new THREE.Color(INK), head: 0, count: 0, lifetime: .14,
  }))
  private live = 0
  private disposed = false

  constructor() {
    this.material.forceSinglePass = true
    const indices = new Uint16Array(SEGMENTS * 12)
    for (let segment = 0; segment < SEGMENTS; segment++) {
      const vertex = segment * VERTICES_PER_SEGMENT
      for (let band = 0; band < 2; band++) {
        const start = segment * 12 + band * 6, offset = vertex + band * 4
        indices.set([offset, offset + 1, offset + 2, offset + 2, offset + 1, offset + 3], start)
      }
    }
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3).setUsage(THREE.DynamicDrawUsage))
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 4).setUsage(THREE.DynamicDrawUsage))
    this.geometry.setIndex(new THREE.BufferAttribute(indices, 1))
    this.geometry.setDrawRange(0, 0)
    this.mesh = new THREE.Mesh(this.geometry, this.material)
    this.mesh.frustumCulled = false
    this.mesh.renderOrder = 2
    this.mesh.visible = false
    this.group.name = 'ink-motion-trails'
    this.group.add(this.mesh)
  }

  get activeCount(): number { return this.live }
  get triangleCount(): number { return this.geometry.drawRange.count / 3 }

  sample(index: number, inner: Point, outer: Point, time: number, color = INK, lifetime = .14): void {
    this.append(index, inner, outer, time, color, lifetime, true)
  }

  /** An explicit straight span can exceed the sweep teleport threshold. */
  line(index: number, from: Point, to: Point, halfWidth: Point, time: number, color = ACCENT, lifetime = .075): void {
    if (![halfWidth.x, halfWidth.y, halfWidth.z].every(Number.isFinite) || Math.hypot(halfWidth.x, halfWidth.y, halfWidth.z) <= 0) throw new Error('A line needs a finite nonzero half-width vector.')
    this.clear(index)
    this.lineInner.set(from.x - halfWidth.x, from.y - halfWidth.y, from.z - halfWidth.z)
    this.lineOuter.set(from.x + halfWidth.x, from.y + halfWidth.y, from.z + halfWidth.z)
    this.append(index, this.lineInner, this.lineOuter, time, color, lifetime, false)
    this.lineInner.set(to.x - halfWidth.x, to.y - halfWidth.y, to.z - halfWidth.z)
    this.lineOuter.set(to.x + halfWidth.x, to.y + halfWidth.y, to.z + halfWidth.z)
    this.append(index, this.lineInner, this.lineOuter, time, color, lifetime, false)
  }

  private append(index: number, inner: Point, outer: Point, time: number, color: string, lifetime: number, guardTeleport: boolean): void {
    if (this.disposed) throw new Error('The trail pool is disposed.')
    if (!Number.isInteger(index) || index < 0 || index >= TRAIL_COUNT) throw new Error('Trail index must be from 0 to 3.')
    if (![inner.x, inner.y, inner.z, outer.x, outer.y, outer.z, time, lifetime].every(Number.isFinite) || lifetime <= 0 || lifetime > .18) throw new Error('Trail input must be finite and its lifetime must be from 0 to 0.18 seconds.')
    const slot = this.slots[index]
    if (slot.count) {
      const previous = (slot.head + SAMPLE_COUNT - 1) % SAMPLE_COUNT, offset = previous * 3
      const distance = (slot.outer[offset] - outer.x) ** 2 + (slot.outer[offset + 1] - outer.y) ** 2 + (slot.outer[offset + 2] - outer.z) ** 2
      if (time < slot.times[previous] || time - slot.times[previous] > lifetime || (guardTeleport && distance > 16)) slot.count = 0
      else if (distance < .000025 && Math.abs(slot.inner[offset] - inner.x) + Math.abs(slot.inner[offset + 1] - inner.y) + Math.abs(slot.inner[offset + 2] - inner.z) < .005) return
    }
    const offset = slot.head * 3
    slot.inner[offset] = inner.x; slot.inner[offset + 1] = inner.y; slot.inner[offset + 2] = inner.z
    slot.outer[offset] = outer.x; slot.outer[offset + 1] = outer.y; slot.outer[offset + 2] = outer.z
    slot.times[slot.head] = time
    slot.head = (slot.head + 1) % SAMPLE_COUNT
    slot.count = Math.min(SAMPLE_COUNT, slot.count + 1)
    slot.lifetime = lifetime; slot.color.set(color)
  }

  update(time: number): void {
    if (!Number.isFinite(time)) throw new Error('Trail time must be finite.')
    let segments = 0
    this.live = 0
    for (const slot of this.slots) {
      let used = false
      for (let index = 1; index < slot.count; index++) {
        const first = (slot.head - slot.count + index - 1 + SAMPLE_COUNT) % SAMPLE_COUNT
        const second = (first + 1) % SAMPLE_COUNT
        if (time < slot.times[first] || time - slot.times[second] >= slot.lifetime) continue
        const vertex = segments * VERTICES_PER_SEGMENT
        for (let band = 0; band < 2; band++) {
          this.writePair(slot, first, time, vertex + band * 4, band === 1)
          this.writePair(slot, second, time, vertex + band * 4 + 2, band === 1)
        }
        segments++; used = true
      }
      if (used) this.live++
    }
    this.geometry.setDrawRange(0, segments * 12)
    this.mesh.visible = segments > 0
    if (segments === 0) return
    this.geometry.attributes.position.needsUpdate = true
    this.geometry.attributes.color.needsUpdate = true
  }

  private writePair(slot: TrailSlot, sample: number, time: number, vertex: number, core: boolean): void {
    const freshness = THREE.MathUtils.clamp(1 - (time - slot.times[sample]) / slot.lifetime, 0, 1)
    const width = freshness * (core ? .56 : 1)
    const color = core ? this.paper : slot.color
    const alpha = freshness * freshness * (core ? .7 : .6)
    for (let side = 0; side < 2; side++) {
      const mix = .5 + (side ? .5 : -.5) * width
      for (let axis = 0; axis < 3; axis++) {
        const offset = sample * 3 + axis
        this.positions[(vertex + side) * 3 + axis] = slot.inner[offset] + (slot.outer[offset] - slot.inner[offset]) * mix
      }
      const offset = (vertex + side) * 4
      this.colors[offset] = color.r; this.colors[offset + 1] = color.g; this.colors[offset + 2] = color.b; this.colors[offset + 3] = alpha
    }
  }

  clear(index?: number): void {
    if (index !== undefined && (!Number.isInteger(index) || index < 0 || index >= TRAIL_COUNT)) throw new Error('Trail index must be from 0 to 3.')
    for (let i = 0; i < this.slots.length; i++) if (index === undefined || index === i) { this.slots[i].head = 0; this.slots[i].count = 0 }
    if (index === undefined) { this.live = 0; this.geometry.setDrawRange(0, 0); this.mesh.visible = false }
  }

  dispose(): void {
    if (this.disposed) return
    this.clear(); this.geometry.dispose(); this.material.dispose(); this.group.removeFromParent(); this.disposed = true
  }
}
