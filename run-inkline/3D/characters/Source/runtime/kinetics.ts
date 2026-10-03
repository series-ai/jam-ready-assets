/**
 * Pure timing and impact data for the action pass.
 *
 * Units:
 * - reach, recoilDistance, and recoilLift use metres.
 * - facingDot is the minimum horizontal direction dot product.
 * - hitHold, recoilDuration, trailDuration, trailBefore, and trailAfter use seconds.
 * - recoilTilt uses radians.
 * - cameraKick, cameraZoom, and trailWidth use renderer-local scalar units.
 */

export const ACTION_BUFFER_SECONDS = .16

export interface ImpactProfile {
  readonly reach: number
  readonly facingDot: number
  readonly hitHold: number
  readonly recoilDistance: number
  readonly recoilLift: number
  readonly recoilDuration: number
  readonly recoilTilt: number
  readonly cameraKick: number
  readonly cameraZoom: number
  readonly trailDuration: number
  readonly trailWidth: number
  readonly trailBefore: number
  readonly trailAfter: number
}

export interface RecoilSample {
  /** Absolute horizontal travel in metres from the reaction origin. */
  readonly travel: number
  /** Absolute vertical lift in metres from the reaction origin. */
  readonly lift: number
  /** Absolute body tilt in radians. */
  readonly tilt: number
  /** True after the reaction duration has elapsed. */
  readonly done: boolean
}

export interface ActionBufferStep {
  /** Remaining input-buffer time in seconds. */
  readonly remaining: number
  /** True for the single update that consumed the queued edge. */
  readonly consume: boolean
}

type ProfileName = 'light' | 'heavy' | 'kick' | 'melee' | 'ranged'

const LIGHT: ImpactProfile = Object.freeze({
  reach: .96, facingDot: .15, hitHold: .045,
  recoilDistance: .30, recoilLift: .045, recoilDuration: .18, recoilTilt: .10,
  cameraKick: .018, cameraZoom: .006,
  trailDuration: .16, trailWidth: .10, trailBefore: .10, trailAfter: .05,
})

const HEAVY: ImpactProfile = Object.freeze({
  reach: 1.18, facingDot: .10, hitHold: .075,
  recoilDistance: .85, recoilLift: .18, recoilDuration: .34, recoilTilt: .22,
  cameraKick: .065, cameraZoom: .018,
  trailDuration: .18, trailWidth: .15, trailBefore: .11, trailAfter: .06,
})

const KICK: ImpactProfile = Object.freeze({
  reach: 1.20, facingDot: .06, hitHold: .065,
  recoilDistance: .62, recoilLift: .12, recoilDuration: .27, recoilTilt: .24,
  cameraKick: .050, cameraZoom: .014,
  trailDuration: .18, trailWidth: .13, trailBefore: .12, trailAfter: .06,
})

const MELEE: ImpactProfile = Object.freeze({
  reach: 1.08, facingDot: .10, hitHold: .050,
  recoilDistance: .45, recoilLift: .08, recoilDuration: .22, recoilTilt: .16,
  cameraKick: .035, cameraZoom: .010,
  trailDuration: .18, trailWidth: .12, trailBefore: .11, trailAfter: .06,
})

const RANGED: ImpactProfile = Object.freeze({
  reach: 16, facingDot: .92, hitHold: .025,
  recoilDistance: .16, recoilLift: .02, recoilDuration: .13, recoilTilt: .06,
  cameraKick: .026, cameraZoom: .009,
  trailDuration: .13, trailWidth: .07, trailBefore: .04, trailAfter: .05,
})

const RANGED_SHOTGUN: ImpactProfile = Object.freeze({ ...RANGED, recoilDistance: .24, recoilLift: .035, cameraKick: .040, cameraZoom: .012, trailWidth: .09 })
const RANGED_RIFLE: ImpactProfile = Object.freeze({ ...RANGED, reach: 18, cameraKick: .032, trailDuration: .15, trailWidth: .075 })
const RANGED_BOW: ImpactProfile = Object.freeze({ ...RANGED, reach: 14, recoilDistance: .10, cameraKick: .020, cameraZoom: .007, trailDuration: .17, trailWidth: .065, trailBefore: .03, trailAfter: .08 })
const MELEE_HEAVY: ImpactProfile = Object.freeze({ ...HEAVY, reach: 1.28, trailWidth: .17 })
const MELEE_SHORT: ImpactProfile = Object.freeze({ ...MELEE, reach: .86, recoilDistance: .36, recoilDuration: .19, trailWidth: .09 })
const MELEE_STAFF: ImpactProfile = Object.freeze({ ...MELEE, reach: 1.34, trailWidth: .14 })
const HEAVY_SHIELD: ImpactProfile = Object.freeze({ ...HEAVY, reach: 1.04, recoilLift: .12, recoilTilt: .16, trailWidth: .12 })

const PROFILES: Record<ProfileName, ImpactProfile> = { light: LIGHT, heavy: HEAVY, kick: KICK, melee: MELEE, ranged: RANGED }

const HEAVY_CLIPS = new Set([
  'punch-heavy', 'shoulder-check', 'hammer-overhead', 'hammer-slam',
  'sword-overhead', 'sword-lunge', 'staff-overhead', 'shield-slam',
])
const KICK_CLIPS = new Set(['kick-front', 'kick-roundhouse', 'kick-air', 'knee-strike', 'sweep'])
const RANGED_CLIPS = new Set(['pistol-fire', 'rifle-fire', 'shotgun-fire', 'bow-release', 'throw'])

function profileName(clipId: string, kind: string): ProfileName {
  if (RANGED_CLIPS.has(clipId) || kind === 'ranged') return 'ranged'
  if (KICK_CLIPS.has(clipId) || kind === 'kick') return 'kick'
  if (HEAVY_CLIPS.has(clipId) || kind === 'heavy') return 'heavy'
  if (kind === 'melee' || kind === 'blade') return 'melee'
  return 'light'
}

function withEquipmentProfile(name: ProfileName, equipmentId: string | null | undefined): ImpactProfile {
  if (!equipmentId) return PROFILES[name]
  const id = equipmentId.toLowerCase()
  if (name === 'ranged' && id.includes('shotgun')) {
    return RANGED_SHOTGUN
  }
  if (name === 'ranged' && (id.includes('sniper') || id.includes('rifle'))) {
    return RANGED_RIFLE
  }
  if (name === 'ranged' && id === 'bow') {
    return RANGED_BOW
  }
  if (name === 'melee' && (id.includes('hammer') || id.includes('axe') || id.includes('halberd'))) {
    return MELEE_HEAVY
  }
  if (name === 'melee' && (id.includes('dagger') || id.includes('kunai'))) {
    return MELEE_SHORT
  }
  if (name === 'melee' && id.includes('staff')) {
    return MELEE_STAFF
  }
  if (name === 'heavy' && id.includes('shield')) {
    return HEAVY_SHIELD
  }
  return PROFILES[name]
}

/** Return a bounded profile for one authored action and held tool. */
export function getImpactProfile(clipId: string, kind: string, equipmentId?: string | null): ImpactProfile {
  if (typeof clipId !== 'string' || typeof kind !== 'string') throw new TypeError('Impact profile IDs must be strings.')
  return withEquipmentProfile(profileName(clipId, kind), equipmentId)
}

function smoothstep(value: number): number {
  const t = Math.max(0, Math.min(1, value))
  return t * t * (3 - 2 * t)
}

/**
 * Sample a short asymmetric reaction pulse.
 * The peak occurs at one quarter of the duration, then returns to zero.
 */
export function sampleRecoil(profile: ImpactProfile, age: number): RecoilSample {
  if (!Number.isFinite(age)) throw new RangeError('Recoil age must be finite.')
  if (!Number.isFinite(profile.recoilDuration) || profile.recoilDuration <= 0) throw new RangeError('Recoil duration must be positive and finite.')
  const clampedAge = Math.max(0, age)
  if (clampedAge >= profile.recoilDuration) return { travel: 0, lift: 0, tilt: 0, done: true }
  const normalized = clampedAge / profile.recoilDuration
  const rise = smoothstep(normalized / .25)
  const settle = smoothstep((1 - normalized) / .75)
  const envelope = rise * settle
  return {
    travel: profile.recoilDistance * envelope,
    lift: profile.recoilLift * envelope,
    tilt: profile.recoilTilt * envelope,
    done: false,
  }
}

/**
 * Age one queued action edge, or consume it once when the action is ready.
 * A ready action consumes before expiry on the current update.
 */
export function stepActionBuffer(remaining: number, delta: number, ready: boolean): ActionBufferStep {
  if (![remaining, delta].every(Number.isFinite)) throw new RangeError('Action buffer values must be finite.')
  if (remaining <= 0) return { remaining: 0, consume: false }
  if (ready) return { remaining: 0, consume: true }
  return { remaining: Math.max(0, remaining - Math.max(0, delta)), consume: false }
}

export type ReactionClip = 'hit-front' | 'hit-back' | 'hit-left' | 'hit-right' | 'knockdown' | 'death'
export interface ReactionChoice { readonly clip: ReactionClip; readonly facing: number }

/** Impact points away from the source. The target's local +Z is forward. */
export function selectReaction(impact: { x: number; z: number }, facing: number, lethal: boolean): ReactionChoice {
  if (![impact.x, impact.z, facing].every(Number.isFinite)) throw new RangeError('Reaction direction must be finite.')
  const length = Math.hypot(impact.x, impact.z)
  const x = length > .0001 ? impact.x / length : -Math.sin(facing)
  const z = length > .0001 ? impact.z / length : -Math.cos(facing)
  const forward = x * Math.sin(facing) + z * Math.cos(facing)
  const right = x * Math.cos(facing) - z * Math.sin(facing)
  if (!lethal) return { clip: Math.abs(forward) >= Math.abs(right) ? forward >= 0 ? 'hit-back' : 'hit-front' : right > 0 ? 'hit-left' : 'hit-right', facing }
  const clip = forward >= 0 ? 'death' : 'knockdown'
  const desired = Math.atan2(x, z) + (clip === 'knockdown' ? Math.PI : 0)
  const turn = Math.atan2(Math.sin(desired - facing), Math.cos(desired - facing))
  return { clip, facing: facing + turn }
}

/** A fall keeps its landing displacement. Recovery owns the next state. */
export function sampleKnockdown(profile: ImpactProfile, age: number): RecoilSample {
  if (!Number.isFinite(age)) throw new RangeError('Knockdown age must be finite.')
  const t = Math.max(0, age)
  const slide = smoothstep(t / .28)
  const air = Math.min(1, t / .38)
  return { travel: Math.max(.45, profile.recoilDistance) * slide,
    lift: air < 1 ? Math.sin(Math.PI * air) * Math.min(.12, profile.recoilLift) : 0,
    tilt: 0, done: t >= .38 }
}
