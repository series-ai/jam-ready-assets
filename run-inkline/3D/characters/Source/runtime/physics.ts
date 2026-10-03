export interface Position { x: number; y: number; z: number }
export interface Surface {
  minX: number; maxX: number; minZ: number; maxZ: number; y: number
  slopeX?: number; slopeZ?: number
}
export interface Obstacle { minX: number; maxX: number; minY: number; maxY: number; minZ: number; maxZ: number }
export interface Body { position: Position; velocityY: number; grounded: boolean; facing: number }
export interface Movement { x: number; z: number; jump: boolean; dash: boolean }
export interface WorldCollision { surfaces: Surface[]; obstacles: Obstacle[]; limit: number }
export function surfaceHeight(surface: Surface, x: number, z: number): number {
  return surface.y + (surface.slopeX ?? 0) * (x - surface.minX) + (surface.slopeZ ?? 0) * (z - surface.minZ)
}
export function supportAt(world: WorldCollision, x: number, z: number, maxHeight = Infinity): number {
  let height = 0
  for (const surface of world.surfaces) {
    if (x < surface.minX || x > surface.maxX || z < surface.minZ || z > surface.maxZ) continue
    const candidate = surfaceHeight(surface, x, z)
    if (candidate <= maxHeight && candidate > height) height = candidate
  }
  for (const box of world.obstacles) {
    if (x >= box.minX && x <= box.maxX && z >= box.minZ && z <= box.maxZ && box.maxY <= maxHeight && box.maxY > height) height = box.maxY
  }
  return height
}
function blocked(world: WorldCollision, x: number, y: number, z: number, radius = .22): boolean {
  return world.obstacles.some(box => y < box.maxY - .08 && y + 1.55 > box.minY &&
    x + radius > box.minX && x - radius < box.maxX && z + radius > box.minZ && z - radius < box.maxZ)
}
/** Use fixed substeps in the caller so collision does not depend on display speed. */
export function moveBody(body: Body, input: Movement, world: WorldCollision, delta: number): { landed: boolean; jumped: boolean } {
  const dt = Math.max(0, Math.min(delta, 1 / 30))
  const previousGrounded = body.grounded
  let jumped = false
  if (input.jump && body.grounded) { body.velocityY = 6.5; body.grounded = false; jumped = true }
  const length = Math.hypot(input.x, input.z)
  const speed = input.dash ? 7.6 : 4.1
  const dx = length > 0 ? input.x / Math.max(1, length) * speed * dt : 0
  const dz = length > 0 ? input.z / Math.max(1, length) * speed * dt : 0
  if (length > .01) body.facing = Math.atan2(input.x, input.z)
  const x = Math.max(-world.limit, Math.min(world.limit, body.position.x + dx))
  const z = Math.max(-world.limit, Math.min(world.limit, body.position.z + dz))
  if (!blocked(world, x, body.position.y + .12, body.position.z)) body.position.x = x
  if (!blocked(world, body.position.x, body.position.y + .12, z)) body.position.z = z
  const oldY = body.position.y
  body.velocityY -= 18 * dt
  body.position.y += body.velocityY * dt
  const support = supportAt(world, body.position.x, body.position.z, oldY + (previousGrounded ? .35 : .03))
  const snapDown = previousGrounded && !jumped && body.velocityY <= 0 && oldY - support <= .35
  if ((body.position.y <= support || snapDown) && body.velocityY <= 0) {
    body.position.y = support; body.velocityY = 0; body.grounded = true
  } else body.grounded = false
  return { landed: !previousGrounded && body.grounded, jumped }
}

export function validateAvatar(value: unknown): import('../types').AvatarConfig {
  if (!value || typeof value !== 'object') throw new Error('Avatar must be an object.')
  const data = value as Record<string, unknown>
  const validColor = (color: unknown): color is string => typeof color === 'string' && /^#[0-9a-f]{6}$/i.test(color)
  const range = (key: string, low: number, high: number): number => {
    const number = data[key]
    if (typeof number !== 'number' || !Number.isFinite(number) || number < low || number > high) throw new Error(`Avatar ${key} must be between ${low} and ${high}.`)
    return number
  }
  if (typeof data.preset !== 'string' || !/^stick-[a-z-]+$/.test(data.preset)) throw new Error('Avatar preset is invalid.')
  if (!validColor(data.color) || !validColor(data.accent)) throw new Error('Avatar colors must use six-digit hex values.')
  const hats = ['none', 'cap', 'headband', 'beanie', 'visor', 'helmet'] as const
  if (!hats.some(hat => hat === data.headwear)) throw new Error('Avatar headwear is invalid.')
  if (data.equipment !== null && (typeof data.equipment !== 'string' || !/^[a-z0-9-]+$/.test(data.equipment))) throw new Error('Avatar equipment is invalid.')
  return { preset: data.preset, color: data.color, accent: data.accent, height: range('height', .85, 1.15),
    thickness: range('thickness', .7, 1.3), headScale: range('headScale', .8, 1.2),
    headwear: data.headwear as import('../types').AvatarConfig['headwear'], equipment: data.equipment as string | null }
}
