import type { AnimationEntry, ModelEntry } from '../types'

const PREVIEW_TOOLS: Readonly<Record<string, string>> = {
  staff: 'staff', sword: 'sword', dagger: 'dagger', hammer: 'hammer-war', shield: 'shield-riot',
  rifle: 'rifle', shotgun: 'shotgun', pistol: 'pistol', bow: 'bow', bat: 'bat', throw: 'grenade-frag',
}
/** Give a review clip its matching tool. The user can replace it after selection. */
export function animationPreviewEquipment(clip: string): string | null {
  if (clip === 'ball-throw') return 'basketball'
  return PREVIEW_TOOLS[clip.split('-')[0]] ?? null
}

export type AttackKind = 'unarmed' | 'blade' | 'ranged'
export interface AttackBeat {
  clip: string
  kind: AttackKind
  contact: number
  duration: number
  facing: number
  elapsed: number
  contacted: boolean
}

export interface CameraPoint {
  x: number
  y: number
  z: number
}

export interface CameraObstacle {
  minX: number
  maxX: number
  minY: number
  maxY: number
  minZ: number
  maxZ: number
}

export interface CameraOcclusionResult extends CameraPoint {
  adjusted: boolean
  obstacleIndex: number | null
}

const CAMERA_BODY_SAMPLES = [.12, 1.05, 1.9]
const CAMERA_WALL_PADDING = .16
const CAMERA_WALL_CLEARANCE = .12

function segmentEntry(start: CameraPoint, end: CameraPoint, obstacle: CameraObstacle, padding: number): number | null {
  const bounds: [number, number][] = [
    [obstacle.minX - padding, obstacle.maxX + padding],
    [obstacle.minY, obstacle.maxY + padding],
    [obstacle.minZ - padding, obstacle.maxZ + padding],
  ]
  const origin = [start.x, start.y, start.z]
  const delta = [end.x - start.x, end.y - start.y, end.z - start.z]
  let near = 0
  let far = 1
  for (let index = 0; index < 3; index++) {
    const [minimum, maximum] = bounds[index]
    const value = origin[index]
    const change = delta[index]
    if (Math.abs(change) < 1e-8) {
      if (value < minimum || value > maximum) return null
      continue
    }
    const first = (minimum - value) / change
    const last = (maximum - value) / change
    near = Math.max(near, Math.min(first, last))
    far = Math.min(far, Math.max(first, last))
    if (near > far) return null
  }
  if (far < 1e-5 || near > 1) return null
  return Math.max(0, near)
}

/**
 * Keep a game camera on the actor side of the first district wall.
 * The three vertical samples approximate feet, chest, and head visibility.
 * This uses the authored collision boxes, so it avoids triangle raycasts.
 */
export function cameraOnActorSide(
  actor: CameraPoint,
  desired: CameraPoint,
  obstacles: readonly CameraObstacle[],
  samples = CAMERA_BODY_SAMPLES,
): CameraOcclusionResult {
  const dx = desired.x - actor.x
  const dy = desired.y - actor.y
  const dz = desired.z - actor.z
  const distance = Math.hypot(dx, dy, dz)
  if (distance < 1e-6) return { ...desired, adjusted: false, obstacleIndex: null }
  let nearest = 1
  let obstacleIndex: number | null = null
  for (const [index, obstacle] of obstacles.entries()) {
    for (const offset of samples) {
      const sample = { x: actor.x, y: actor.y + offset, z: actor.z }
      // A sample on a platform top is already above that box. Do not treat
      // the floor below the actor as a wall.
      if (sample.y >= obstacle.maxY - CAMERA_WALL_CLEARANCE) continue
      const entry = segmentEntry(sample, desired, obstacle, CAMERA_WALL_PADDING)
      if (entry === null || entry >= nearest) continue
      nearest = Math.max(0, entry - CAMERA_WALL_CLEARANCE / distance)
      obstacleIndex = index
    }
  }
  if (obstacleIndex === null) return { ...desired, adjusted: false, obstacleIndex: null }
  return {
    x: actor.x + dx * nearest,
    y: actor.y + dy * nearest,
    z: actor.z + dz * nearest,
    adjusted: true,
    obstacleIndex,
  }
}

/** Clip metadata is the shared contact clock for art and play. */
export function startAttack(clip: AnimationEntry, kind: AttackKind, facing: number): AttackBeat {
  if (clip.contactTime === undefined) throw new Error(`Attack ${clip.id} has no authored contact time.`)
  return { clip: clip.id, kind, facing, contact: clip.contactTime, duration: clip.duration, elapsed: 0, contacted: false }
}

/** A large update can cross contact, but it cannot apply contact twice. */
export function advanceAttack(beat: AttackBeat, delta: number): { beat: AttackBeat; contact: boolean; finished: boolean } {
  const elapsed = Math.min(beat.duration, beat.elapsed + Math.max(0, delta))
  const contact = !beat.contacted && elapsed >= beat.contact
  return { beat: { ...beat, elapsed, contacted: beat.contacted || contact }, contact, finished: elapsed >= beat.duration }
}

/** Short, damped movement returns to zero without moving the camera target. */
export function cameraImpulse(age: number, strength: number): [number, number] {
  if (age < 0 || age >= .2) return [0, 0]
  const decay = (1 - age / .2) ** 3
  return [Math.sin(age * 100) * strength * decay, Math.cos(age * 83) * strength * .45 * decay]
}

/** Select moves that match the held tool and the figure's reach. */
export function combatMove(gear: Pick<ModelEntry, 'id' | 'tags'> | null, role: string, index: number): { clip: string; kind: AttackKind } {
  if (gear?.id === 'bow') return { clip: 'bow-release', kind: 'ranged' }
  if (gear?.tags.includes('ranged') || gear?.tags.includes('cannon')) return { clip: /pistol|revolver/.test(gear.id) ? 'pistol-fire' : gear.id === 'shotgun' ? 'shotgun-fire' : 'rifle-fire', kind: 'ranged' }
  const shield = gear?.tags.includes('shield') ?? false
  const melee = gear?.tags.includes('melee') ?? false
  const sequence = shield ? ['shield-bash', 'shield-push', 'shield-slam']
    : gear?.tags.includes('staff') ? ['staff-thrust', 'staff-sweep', 'staff-overhead']
    : gear?.tags.includes('dagger') ? ['dagger-stab', 'backfist', 'dagger-stab', 'elbow-strike']
    : gear?.tags.includes('hammer') || gear?.tags.includes('axe') ? ['hammer-overhead', 'shoulder-check', 'hammer-overhead']
    : melee ? ['sword-slash', 'sword-diagonal', 'sword-lunge', 'sword-overhead']
    : role === 'stick-compact' ? ['elbow-strike', 'knee-strike', 'backfist', 'shoulder-check']
    : role === 'stick-heavy' ? ['punch-heavy', 'shoulder-check', 'elbow-strike', 'punch-heavy']
    : role === 'stick-striker' ? ['kick-front', 'knee-strike', 'kick-roundhouse', 'backfist']
    : ['punch-right', 'punch-left', 'kick-roundhouse', 'punch-heavy', 'elbow-strike', 'backfist']
  const clip = sequence[Math.abs(Math.floor(index)) % sequence.length]
  return { clip, kind: /^(sword|dagger|staff|hammer)/.test(clip) ? 'blade' : 'unarmed' }
}

/** The contact bone is shared by impact placement and the motion ribbon. */
export function attackContactBone(clip: string): 'Foot_R' | 'Shin_R' | 'Forearm_R' | 'UpperArm_R' | 'Hand_L' | 'Hand_R' {
  if (clip.startsWith('kick') || clip === 'sweep') return 'Foot_R'
  if (clip === 'knee-strike') return 'Shin_R'
  if (clip === 'elbow-strike') return 'Forearm_R'
  if (clip === 'shoulder-check') return 'UpperArm_R'
  if (clip === 'punch-left' || clip.startsWith('shield')) return 'Hand_L'
  return 'Hand_R'
}
