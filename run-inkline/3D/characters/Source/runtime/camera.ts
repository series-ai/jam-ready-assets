import * as THREE from 'three'

const BVH_LEAF_SIZE = 8

interface Occluder {
  mesh: THREE.Mesh
  bounds: THREE.Box3
  centroid: THREE.Vector3
}

interface BvhNode {
  bounds: THREE.Box3
  left: BvhNode | null
  right: BvhNode | null
  start: number
  end: number
}

/** Static triangle probes use shared asset geometry and separate broad-phase boxes. */
export class CameraClearance {
  private readonly occluders: Occluder[] = []
  private root: BvhNode | null = null
  private readonly queryStack: BvhNode[] = []
  private readonly material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide })
  private readonly ray = new THREE.Raycaster()
  private readonly direction = new THREE.Vector3()
  private readonly sample = new THREE.Vector3()
  private readonly hits: THREE.Intersection[] = []

  constructor(objects: readonly THREE.Object3D[]) {
    for (const root of objects) {
      root.updateMatrixWorld(true)
      root.traverse(object => {
        if (!(object instanceof THREE.Mesh) || object instanceof THREE.SkinnedMesh) return
        const mesh = new THREE.Mesh(object.geometry, this.material)
        mesh.matrixAutoUpdate = false
        mesh.matrix.copy(object.matrixWorld)
        mesh.matrixWorld.copy(object.matrixWorld)
        if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox()
        const bounds = mesh.geometry.boundingBox!.clone().applyMatrix4(mesh.matrixWorld)
        this.occluders.push({ mesh, bounds, centroid: bounds.getCenter(new THREE.Vector3()) })
      })
    }
    if (this.occluders.length > 0) this.root = this.buildTree(0, this.occluders.length)
  }

  private buildTree(start: number, end: number): BvhNode {
    const bounds = new THREE.Box3()
    const centroidBounds = new THREE.Box3()
    for (let index = start; index < end; index++) {
      const occluder = this.occluders[index]
      bounds.union(occluder.bounds)
      centroidBounds.expandByPoint(occluder.centroid)
    }
    const node: BvhNode = { bounds, left: null, right: null, start, end }
    if (end - start <= BVH_LEAF_SIZE) return node

    const size = centroidBounds.getSize(new THREE.Vector3())
    let axis: 'x' | 'y' | 'z' = 'x'
    if (size.y > size.x && size.y >= size.z) axis = 'y'
    else if (size.z > size.x && size.z > size.y) axis = 'z'
    const ordered = this.occluders.slice(start, end).sort((a, b) => a.centroid[axis] - b.centroid[axis])
    for (let index = 0; index < ordered.length; index++) this.occluders[start + index] = ordered[index]
    const middle = start + ((end - start) >> 1)
    node.left = this.buildTree(start, middle)
    node.right = this.buildTree(middle, end)
    return node
  }

  /** Find a rendered surface between two points. Ignore the supporting surface at the start. */
  obstruction(from: THREE.Vector3, to: THREE.Vector3, startClearance = .18): number | null {
    this.direction.copy(to).sub(from)
    const distance = this.direction.length()
    if (distance <= startClearance) return null
    this.ray.set(from, this.direction.multiplyScalar(1 / distance))
    this.ray.near = startClearance
    this.ray.far = distance
    let nearest = distance
    let blocked = false
    this.queryStack.length = 0
    if (this.root) this.queryStack.push(this.root)
    while (this.queryStack.length > 0) {
      const node = this.queryStack.pop()!
      if (!this.ray.ray.intersectsBox(node.bounds)) continue
      if (node.left) {
        this.queryStack.push(node.left)
        this.queryStack.push(node.right!)
        continue
      }
      for (let index = node.start; index < node.end; index++) {
        const { mesh, bounds } = this.occluders[index]
        if (!this.ray.ray.intersectsBox(bounds)) continue
        this.hits.length = 0
        mesh.raycast(this.ray, this.hits)
        for (const hit of this.hits) {
          if (hit.distance < nearest) { nearest = hit.distance; blocked = true }
        }
      }
    }
    return blocked ? nearest : null
  }

  inView(point: THREE.Vector3, camera: THREE.Camera): boolean {
    if (!(camera instanceof THREE.OrthographicCamera)) return this.obstruction(point, camera.position, .08) === null
    const direction = camera.getWorldDirection(new THREE.Vector3()).negate()
    const distance = camera.position.clone().sub(point).dot(direction)
    return this.obstruction(point, point.clone().addScaledVector(direction, distance), .08) === null
  }

  private fraction(focus: THREE.Vector3, desired: THREE.Vector3, bodyHeight: number, parallel: boolean, aim: THREE.Vector3): number {
    let fraction = 1
    const delta = desired.clone().sub(aim)
    const right = new THREE.Vector3(delta.z, 0, -delta.x).normalize()
    const end = new THREE.Vector3()
    for (const y of [-.47, -.24, 0, .24, .47]) {
      for (const x of [-.3, 0, .3]) {
        this.sample.set(focus.x + right.x * x, focus.y + y * bodyHeight, focus.z + right.z * x)
        if (parallel) end.copy(this.sample).add(delta)
        else end.copy(desired)
        const hit = this.obstruction(this.sample, end, .08)
        if (hit !== null) fraction = Math.min(fraction, Math.max(.03, (hit - .3) / this.sample.distanceTo(end)))
      }
    }
    return fraction
  }

  /** Report foreground geometry for a fixed body envelope, independent of the current clip. */
  isOccluded(focus: THREE.Vector3, position: THREE.Vector3, bodyHeight = 1.8, parallel = false, aim = focus): boolean {
    return this.fraction(focus, position, bodyHeight, parallel, aim) < 1
  }

  /** Keep the requested view direction. Close walls can remain in front of the figure. */
  resolve(focus: THREE.Vector3, desired: THREE.Vector3, result = new THREE.Vector3(), bodyHeight = 1.8, parallel = false, aim = focus, minimumDistance = bodyHeight * 1.85): THREE.Vector3 {
    const distance = aim.distanceTo(desired)
    if (distance < .001 || distance <= minimumDistance) return result.copy(desired)
    const fraction = this.fraction(focus, desired, bodyHeight, parallel, aim)
    const boomDistance = Math.max(Math.min(distance, minimumDistance), distance * fraction)
    return result.copy(desired).sub(aim).multiplyScalar(boomDistance / distance).add(aim)
  }

  dispose(): void {
    this.root = null
    this.queryStack.length = 0
    this.occluders.length = 0
    this.material.dispose()
  }
}

export interface CameraPose {
  position: THREE.Vector3
  target: THREE.Vector3
}

export interface CameraMotionInput extends CameraPose {
  focus: THREE.Vector3
  bodyHeight: number
  parallel: boolean
  delta: number
  minimumDistance?: number
}

/** One owner for the rendered target and boom. Collision cannot change the view direction. */
export class CameraMotion {
  readonly pose: CameraPose = { position: new THREE.Vector3(), target: new THREE.Vector3() }
  private readonly direction = new THREE.Vector3()
  private readonly desired = new THREE.Vector3()
  private readonly safe = new THREE.Vector3()
  private readonly targetStep = new THREE.Vector3()
  private boomDistance = 0
  private heldDistance = 0
  private clearTime = 0
  private initialized = false
  occluded = false

  /** Reset only for a new scene, an explicit camera selection, or a game reset. */
  reset(position: THREE.Vector3, target: THREE.Vector3): CameraPose {
    this.pose.position.copy(position); this.pose.target.copy(target)
    this.boomDistance = position.distanceTo(target)
    this.heldDistance = this.boomDistance
    this.clearTime = 0
    this.occluded = false
    this.initialized = true
    return this.pose
  }

  update(input: CameraMotionInput, clearance: CameraClearance | null): CameraPose {
    if (!this.initialized) this.reset(input.position, input.target)
    const delta = Math.max(0, Math.min(input.delta, .05))
    if (delta === 0) return this.pose
    this.targetStep.copy(input.target).sub(this.pose.target).multiplyScalar(1 - Math.exp(-10 * delta))
    this.targetStep.clampLength(0, 12 * delta)
    this.pose.target.add(this.targetStep)
    this.direction.copy(input.position).sub(input.target)
    const requestedDistance = this.direction.length()
    if (requestedDistance < .001) return this.pose
    this.direction.multiplyScalar(1 / requestedDistance)
    this.desired.copy(this.pose.target).addScaledVector(this.direction, requestedDistance)
    if (clearance) clearance.resolve(input.focus, this.desired, this.safe, input.bodyHeight, input.parallel, this.pose.target, input.minimumDistance)
    else this.safe.copy(this.desired)
    const availableDistance = this.safe.distanceTo(this.pose.target)
    if (availableDistance <= this.heldDistance + .03) {
      this.heldDistance = Math.min(this.heldDistance, availableDistance)
      this.clearTime = 0
    } else {
      this.clearTime += delta
      if (this.clearTime >= .2) this.heldDistance = availableDistance
    }
    const change = (this.heldDistance - this.boomDistance) * (1 - Math.exp(-8 * delta))
    this.boomDistance += THREE.MathUtils.clamp(change, -10 * delta, 10 * delta)
    this.pose.position.copy(this.pose.target).addScaledVector(this.direction, this.boomDistance)
    this.occluded = clearance?.isOccluded(input.focus, this.pose.position, input.bodyHeight, input.parallel, this.pose.target) ?? false
    return this.pose
  }
}

/** Fit a fixed body envelope and the horizontal lag of the damped target. */
export function minimumBodyDistance(height: number, aimHeight: number, offset: THREE.Vector3, fov: number, aspect: number, trackingAllowance = 1): number {
  const direction = offset.clone().normalize()
  const right = new THREE.Vector3(direction.z, 0, -direction.x).normalize()
  if (right.lengthSq() < .001) right.set(1, 0, 0)
  const up = new THREE.Vector3().crossVectors(direction, right).normalize()
  const vertical = Math.tan(THREE.MathUtils.degToRad(fov * .5)), horizontal = vertical * aspect
  // Sprint speed is 7.6 m/s. Target damping is 10/s. Lead adds at most 0.25 m.
  const width = height * .3 + trackingAllowance
  const point = new THREE.Vector3()
  let distance = height * 1.85
  for (const x of [-width, width]) for (const y of [-aimHeight - .05, height - aimHeight + .05]) for (const z of [-width, width]) {
    point.set(x, y, z)
    distance = Math.max(distance, point.dot(direction) + Math.max(Math.abs(point.dot(right)) / horizontal, Math.abs(point.dot(up)) / vertical) * 1.05)
  }
  return distance
}

/** Fit the full box within both camera axes, with a fixed target and view direction. */
export function fitPerspectiveBox(camera: THREE.PerspectiveCamera, bounds: THREE.Box3, target: THREE.Vector3, margin = 1.1): void {
  const direction = camera.position.clone().sub(target).normalize()
  const right = new THREE.Vector3(direction.z, 0, -direction.x).normalize()
  if (right.lengthSq() < .001) right.set(1, 0, 0)
  const up = new THREE.Vector3().crossVectors(direction, right).normalize()
  const vertical = Math.tan(THREE.MathUtils.degToRad(camera.fov * .5))
  const horizontal = vertical * camera.aspect
  const point = new THREE.Vector3()
  let distance = camera.near * 2
  for (const x of [bounds.min.x, bounds.max.x]) for (const y of [bounds.min.y, bounds.max.y]) for (const z of [bounds.min.z, bounds.max.z]) {
    point.set(x, y, z).sub(target)
    distance = Math.max(distance, point.dot(direction) + Math.max(Math.abs(point.dot(right)) / horizontal, Math.abs(point.dot(up)) / vertical) * margin)
  }
  camera.position.copy(target).addScaledVector(direction, distance)
  camera.lookAt(target)
}
