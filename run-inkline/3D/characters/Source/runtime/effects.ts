import * as THREE from 'three'

type ShapeKind = 'stroke' | 'spark' | 'ring' | 'arc' | 'dust' | 'chip' | 'star'
export type EffectColorRole = 'paper' | 'ink' | 'accent'
export interface EffectPreset {
  id: string; label: string; category: string; duration: number; description: string
  shape: ShapeKind; count: number; spread: number; speed: number; gravity: number; size: number
  accent: boolean; floor?: boolean; spiral?: number; orbitRadius?: number; angle?: number; colorRole?: EffectColorRole; layers?: EffectLayer[]
}
type EffectLayer = Partial<Pick<EffectPreset, 'shape' | 'count' | 'duration' | 'size' | 'speed' | 'spread' | 'gravity' | 'accent' | 'floor' | 'spiral' | 'orbitRadius' | 'angle'>> & {
  colorRole?: EffectColorRole
}
const LAYERS: Record<string, EffectLayer[]> = {
  'punch-impact': [
    { shape: 'star', count: 1, size: .14, speed: .04, duration: .2, spread: .12, colorRole: 'paper' },
    { shape: 'spark', count: 4, size: .11, speed: 2.4, duration: .24, spread: .32, gravity: 0, colorRole: 'accent' },
  ],
  'heavy-impact': [
    { shape: 'star', count: 1, size: .18, speed: .04, duration: .3, spread: .12, colorRole: 'paper' },
    { shape: 'spark', count: 5, size: .14, speed: 3.2, duration: .34, spread: .42, gravity: 0, colorRole: 'accent' },
  ],
  'sword-cross': [{ shape: 'stroke', count: 1, angle: -Math.PI / 4 }],
  'uppercut': [{ shape: 'spark', count: 3, size: .10, speed: 1.8, spread: .2 }],
  'parry-flash': [{ shape: 'star', count: 1, colorRole: 'paper' }, { shape: 'spark', count: 3, size: .08, speed: 2.2, spread: .32 }],
  'guard-break': [{ shape: 'arc', count: 2, size: .23, speed: .65, duration: .24, gravity: 0 }],
  'critical-hit': [
    { shape: 'star', count: 1, size: .15, speed: .04, duration: .28, spread: .14, colorRole: 'paper' },
    { shape: 'spark', count: 6, size: .12, speed: 3.4, duration: .34, spread: .42, gravity: 0, colorRole: 'ink' },
  ],
  'rifle-flash': [{ shape: 'star', count: 1, size: .12, speed: .1 }],
  'shotgun-flash': [{ shape: 'star', count: 1, colorRole: 'paper' }, { shape: 'spark', count: 4, size: .14, speed: 2.4, spread: .22 }],
  'landing-dust': [{ shape: 'ring', count: 1, size: .38, speed: .03, duration: .20, floor: true }],
  'crate-break': [{ shape: 'dust', count: 3, size: .22, speed: .6, duration: .48, gravity: -.2 }],
  'explosion': [{ shape: 'star', count: 1, colorRole: 'paper' }, { shape: 'ring', count: 1, size: .65, speed: .05, duration: .28, gravity: 0, colorRole: 'ink' }, { shape: 'spark', count: 6, size: .15, speed: 3.2, duration: .38, spread: 1, colorRole: 'accent' }, { shape: 'dust', count: 4, size: .25, speed: 1.1, duration: .6, spread: .8, gravity: -.35, colorRole: 'ink' }],
  'checkpoint': [{ shape: 'spark', count: 4, size: .1, speed: .65, duration: .62, spread: .34, gravity: -.35, colorRole: 'accent' }],
  'spawn-ring': [{ shape: 'stroke', count: 4, size: .16, speed: .45, duration: .4, floor: false }],
  'blade-contact': [
    { shape: 'star', count: 1, size: .12, speed: .03, duration: .2, spread: .08, colorRole: 'paper' },
    { shape: 'spark', count: 3, size: .07, speed: 1.9, duration: .2, spread: .25, gravity: 0, colorRole: 'accent' },
  ],
  'weapon-clash': [
    { shape: 'star', count: 1, size: .13, speed: .04, duration: .24, spread: .1, colorRole: 'paper' },
    { shape: 'spark', count: 4, size: .08, speed: 2.2, duration: .24, spread: .35, gravity: 0, colorRole: 'accent' },
  ],
  'shield-bash': [
    { shape: 'star', count: 1, size: .1, speed: .04, duration: .18, spread: .1, colorRole: 'paper' },
    { shape: 'spark', count: 3, size: .07, speed: 1.8, duration: .22, spread: .25, gravity: 0, colorRole: 'accent' },
  ],
  'guard-shock': [{ shape: 'spark', count: 4, size: .08, speed: 1.9, duration: .3, spread: .36, gravity: 0, colorRole: 'accent' }],
  'counter-flash': [{ shape: 'star', count: 1, size: .11, speed: .03, duration: .18, spread: .08, colorRole: 'paper' }],
  'muzzle-snap': [{ shape: 'spark', count: 2, size: .06, speed: 2.4, duration: .1, spread: .18, gravity: 0, colorRole: 'paper' }],
  'ricochet': [{ shape: 'star', count: 1, size: .08, speed: .03, duration: .18, spread: .1, colorRole: 'paper' }],
  'shell-burst': [{ shape: 'spark', count: 3, size: .06, speed: 1.6, duration: .28, spread: .3, gravity: 3, colorRole: 'accent' }],
  'plasma-hit': [
    { shape: 'star', count: 1, size: .14, speed: .04, duration: .26, spread: .1, colorRole: 'paper' },
    { shape: 'spark', count: 5, size: .08, speed: 2.2, duration: .3, spread: .42, gravity: 0, colorRole: 'accent' },
  ],
  'vault-dust': [{ shape: 'ring', count: 1, size: .36, speed: .04, duration: .3, spread: .1, floor: true, colorRole: 'paper' }],
  'wall-kick': [{ shape: 'arc', count: 1, size: .34, speed: .45, duration: .24, spread: .1, gravity: 0, colorRole: 'paper' }],
  'grind-sparks': [{ shape: 'chip', count: 3, size: .07, speed: 2.1, duration: .3, spread: .22, gravity: 1.5, colorRole: 'paper' }],
  'zipline-streak': [{ shape: 'spark', count: 3, size: .06, speed: 2.4, duration: .24, spread: .12, gravity: 0, colorRole: 'accent' }],
  'hard-stop': [{ shape: 'dust', count: 3, size: .1, speed: .8, duration: .3, spread: .3, gravity: -.2, floor: true, colorRole: 'paper' }],
  'welding-arc': [
    { shape: 'star', count: 1, size: .1, speed: .03, duration: .2, spread: .1, colorRole: 'paper' },
    { shape: 'spark', count: 6, size: .06, speed: 2.6, duration: .38, spread: .6, gravity: 2, colorRole: 'accent' },
  ],
  'steam-burst': [{ shape: 'ring', count: 1, size: .18, speed: .05, duration: .35, spread: .1, gravity: 0, colorRole: 'paper' }],
  'electric-arc': [{ shape: 'star', count: 1, size: .08, speed: .03, duration: .18, spread: .1, colorRole: 'paper' }],
  'pipe-leak': [{ shape: 'spark', count: 3, size: .05, speed: 1.1, duration: .32, spread: .25, gravity: .8, colorRole: 'accent' }],
  'hazard-flare': [{ shape: 'ring', count: 1, size: .22, speed: .2, duration: .26, spread: .1, gravity: 0, colorRole: 'paper' }],
  'oil-splash': [{ shape: 'chip', count: 3, size: .06, speed: 1.2, duration: .28, spread: .5, gravity: 1.2, colorRole: 'ink' }],
  'combo-rise': [{ shape: 'star', count: 1, size: .08, speed: .1, duration: .34, spread: .1, colorRole: 'paper' }],
  'damage-pips': [{ shape: 'spark', count: 3, size: .06, speed: 1.1, duration: .26, spread: .3, gravity: .4, colorRole: 'paper' }],
  'focus-pulse': [{ shape: 'star', count: 1, size: .09, speed: .03, duration: .22, spread: .1, colorRole: 'paper' }],
  'danger-pulse': [{ shape: 'spark', count: 4, size: .06, speed: 1.1, duration: .3, spread: .4, gravity: 0, colorRole: 'paper' }],
}
const preset = (id: string, category: string, description: string, shape: ShapeKind, count: number,
  duration: number, size: number, speed: number, spread = 1, gravity = 0, accent = false,
  extra: Partial<Pick<EffectPreset, 'floor' | 'spiral' | 'orbitRadius' | 'angle'>> = {}): EffectPreset => ({
  id, label: id.split('-').map(word => word[0].toUpperCase() + word.slice(1)).join(' '),
  category, description, shape, count, duration, size, speed, spread, gravity, accent, ...extra,
})
export const EFFECTS: EffectPreset[] = [
  preset('punch-impact', 'Combat', 'A compact ink star and four directional rays mark a direct hit.', 'star', 1, .25, .28, .05, .1),
  preset('heavy-impact', 'Combat', 'A crisp impact star anchors a short accent burst.', 'star', 1, .34, .38, .05, .16),
  preset('kick-impact', 'Combat', 'Long rays follow a strong kick.', 'stroke', 4, 0.26, 0.22, 2.8, 0.32, 0, false),
  preset('uppercut', 'Combat', 'A rising arc and a narrow upward burst.', 'arc', 1, 0.23, 0.38, 0.65, 0.1, -0.4, false),
  preset('sword-slash', 'Combat', 'One tapered crescent follows the blade.', 'arc', 1, 0.22, 0.6, 0.2, 0.07, 0, false),
  preset('sword-cross', 'Combat', 'Crossed short blade trails.', 'stroke', 1, 0.20, 0.46, 0.08, 0.035, 0, false, {angle: Math.PI / 4}),
  preset('staff-sweep', 'Combat', 'A wide curved stroke follows a staff.', 'arc', 1, 0.3, 0.78, 0.2, 0.08, 0, false),
  preset('parry-flash', 'Combat', 'A sharp accent burst marks a timed block.', 'star', 1, 0.18, 0.23, 0.06, 0.1, 0, true),
  preset('block-ring', 'Combat', 'A compact ring shows a blocked hit.', 'ring', 1, 0.22, 0.27, 0.05, 0.1, 0, false),
  preset('guard-break', 'Combat', 'Broken ink chips move away from the guard.', 'chip', 7, 0.38, 0.1, 1.9, 0.6, 3, false),
  preset('dodge-trail', 'Combat', 'Fine strokes show a fast side step.', 'stroke', 4, 0.24, 0.27, 1.7, 0.1, 0, false),
  preset('critical-hit', 'Combat', 'An accent star and fast rays mark a critical hit.', 'star', 1, 0.28, 0.32, 0.04, 0.1, 0, true),
  preset('blade-contact', 'Combat', 'A short crescent and paper core mark a clean blade contact.', 'arc', 1, 0.18, 0.24, 0.12, 0.1, 0, false),
  preset('weapon-clash', 'Combat', 'A compact clash star and four sparks mark crossed weapons.', 'star', 1, 0.22, 0.26, 0.04, 0.1, 0, false),
  preset('shield-bash', 'Combat', 'A tight ring and sparks mark a shield bash.', 'ring', 1, 0.22, 0.28, 0.12, 0.1, 0, false),
  preset('guard-shock', 'Combat', 'Short rays push away from a broken guard.', 'spark', 4, 0.24, 0.1, 1.9, 0.32, 0, true),
  preset('counter-flash', 'Combat', 'A small accent flash marks a timed counter.', 'star', 1, .24, .25, .04, .1, 0, true),
  preset('pistol-flash', 'Weapons', 'A small forward muzzle flash.', 'star', 1, 0.1, 0.17, 0.6, 0.1, 0, true),
  preset('rifle-flash', 'Weapons', 'A narrow muzzle burst for rapid fire.', 'spark', 3, 0.1, 0.18, 1.8, 0.1, 0, true),
  preset('shotgun-flash', 'Weapons', 'A wide short muzzle burst.', 'star', 1, 0.12, 0.25, 0.8, 0.14, 0, true),
  preset('bullet-tracer', 'Weapons', 'A long narrow stroke follows a shot.', 'stroke', 1, 0.12, 0.48, 8, 0.01, 0, false),
  preset('bullet-impact', 'Weapons', 'Short chips and rays mark a hard surface.', 'chip', 5, 0.3, 0.07, 1.9, 0.5, 4, false),
  preset('shell-eject', 'Weapons', 'One small falling cartridge mark.', 'chip', 1, 0.48, 0.06, 1.3, 0.3, 5, true),
  preset('arrow-trail', 'Weapons', 'A fine low-density arrow wake.', 'stroke', 2, 0.24, 0.34, 2.3, 0.035, 0, false),
  preset('plasma-pulse', 'Weapons', 'Graphic accent rings form an energy pulse.', 'ring', 2, 0.32, 0.26, 1.2, 0.08, 0, true),
  preset('muzzle-snap', 'Weapons', 'A short paper snap clarifies a compact muzzle hit.', 'star', 1, .12, .2, 1.7, .12, 0, true),
  preset('ricochet', 'Weapons', 'Warm chips turn away from a hard surface.', 'spark', 4, 0.25, 0.085, 2.4, 0.35, 0.8, true),
  preset('shell-burst', 'Weapons', 'Small brass marks arc away after a reload.', 'chip', 3, 0.38, 0.075, 1.5, 0.3, 4, true),
  preset('plasma-hit', 'Weapons', 'A tight energy ring opens at a plasma impact.', 'ring', 1, 0.28, 0.27, 0.25, 0.1, 0, true),
  preset('footstep-dust', 'Movement', 'Small outline puffs under a moving foot.', 'dust', 3, .34, .12, .5, .7, -.3, false, {floor: true}),
  preset('sprint-streak', 'Movement', 'Thin trailing strokes show speed.', 'stroke', 4, 0.23, 0.35, 2.2, 0.07, 0, false),
  preset('jump-puff', 'Movement', 'A low puff spreads from a jump.', 'dust', 3, 0.33, 0.18, 0.85, 0.8, -0.35, false, {floor: true}),
  preset('landing-dust', 'Movement', 'A wider floor burst marks a landing.', 'dust', 4, 0.38, 0.23, 1.2, 0.8, -0.2, false, {floor: true}),
  preset('double-jump-ring', 'Movement', 'A thin ring opens below the figure.', 'ring', 1, 0.32, 0.5, 0.06, 0.2, 0, false, {floor: true}),
  preset('slide-dust', 'Movement', 'A low trail follows a slide.', 'dust', 5, 0.44, 0.15, 0.9, 0.2, 0, false, {floor: true}),
  preset('wall-scrape', 'Movement', 'Small sparks mark contact with a wall.', 'spark', 5, 0.3, 0.095, 1.65, 0.25, 3, false),
  preset('dash-ring', 'Movement', 'Short curved lines mark a fast dash.', 'arc', 2, 0.23, 0.35, 1.3, 0.15, 0, false, {floor: true}),
  preset('vault-dust', 'Movement', 'A low paper puff marks a vault takeoff.', 'dust', 3, 0.36, 0.15, 0.8, 0.6, -0.3, false, {floor: true}),
  preset('wall-kick', 'Movement', 'A short wall mark follows a kick-off.', 'spark', 4, 0.23, 0.095, 1.9, 0.2, 1.2, false),
  preset('grind-sparks', 'Movement', 'Fine sparks follow a rail grind.', 'spark', 6, 0.3, 0.08, 2.2, 0.2, 1.8, true),
  preset('zipline-streak', 'Movement', 'Thin strokes follow a fast zipline pass.', 'stroke', 3, 0.24, 0.24, 2.8, 0.06, 0, false),
  preset('hard-stop', 'Movement', 'A tight arc and dust mark a sudden stop.', 'arc', 2, 0.22, 0.24, 0.7, 0.25, 0, false, {floor: true}),
  preset('crate-break', 'Destruction', 'Angular fragments fall from a broken crate.', 'chip', 10, 0.64, 0.13, 1.9, 0.8, 5, false),
  preset('metal-sparks', 'Destruction', 'Fine warm sparks fall from damaged metal.', 'spark', 12, 0.45, 0.1, 2.8, 0.8, 4, true),
  preset('concrete-chips', 'Destruction', 'Heavy gray fragments mark a hard impact.', 'chip', 8, 0.48, 0.14, 1.6, 0.8, 5, false),
  preset('steam-vent', 'Destruction', 'Outline steam puffs rise from a pipe.', 'dust', 6, 1.1, 0.27, 0.6, 0.16, -0.6, false),
  preset('smoke-puff', 'Destruction', 'Loose outline loops rise and spread.', 'dust', 5, 0.9, 0.3, 0.5, 0.55, -0.35, false),
  preset('explosion', 'Destruction', 'One clear flash, short rays, and four smoke strokes mark an explosion.', 'star', 1, 0.32, 0.55, 0.07, 0.1, 0, true),
  preset('welding-arc', 'Destruction', 'A tight hot arc and short sparks mark welding.', 'spark', 6, 0.3, 0.1, 2.1, 0.4, 2, true),
  preset('steam-burst', 'Destruction', 'A short paper puff vents from a hot joint.', 'dust', 5, 0.55, 0.19, 1, 0.5, -0.5, false),
  preset('electric-arc', 'Destruction', 'Jagged strokes mark a brief electrical fault.', 'stroke', 4, 0.2, 0.14, 1.1, 0.35, 0, true),
  preset('pipe-leak', 'Destruction', 'Small marks fall from a leaking pipe.', 'dust', 5, 0.55, 0.12, 0.8, 0.3, 0.6, false),
  preset('hazard-flare', 'Destruction', 'An orange star marks an active hazard point.', 'star', 1, 0.3, 0.18, 0.15, 0.1, 0, true),
  preset('oil-splash', 'Destruction', 'Dark chips spread from a short oil splash.', 'chip', 6, 0.38, 0.12, 1, 0.6, 1.6, false),
  preset('pickup-sparkle', 'Status', 'Small accent stars mark a collected object.', 'star', 4, 0.46, 0.1, 0.7, 0.7, -0.35, true),
  preset('health-pulse', 'Status', 'Gentle rings rise around the figure.', 'ring', 2, 0.65, 0.47, 0.12, 0.08, -0.2, true, {floor: true}),
  preset('shield', 'Status', 'A thin graphic ring protects the figure.', 'ring', 1, 0.85, 0.87, 0.02, 0.02, 0, true),
  preset('stun-stars', 'Status', 'Small stars orbit above the head.', 'star', 3, 0.9, 0.09, 0.08, 0.45, 0, true, {spiral: 4, orbitRadius: .22}),
  preset('checkpoint', 'Status', 'One compact floor ring and small rising marks show progress.', 'ring', 1, .58, .34, .04, .12, 0, true, {floor: true}),
  preset('spawn-ring', 'Status', 'Two compact floor rings mark an arrival.', 'ring', 2, 0.58, 0.65, 0.03, 0.1, 0, true, {floor: true}),
  preset('combo-rise', 'Status', 'Three rising tapered marks confirm a combo step.', 'spark', 3, 0.46, 0.16, 0.9, 0.10, -0.5, true, {spiral: 2, orbitRadius: .16, angle: Math.PI / 2}),
  preset('damage-pips', 'Status', 'Short pips show a small damage event.', 'chip', 4, 0.32, 0.08, 0.9, 0.3, 0.5, true),
  preset('focus-pulse', 'Status', 'A small ring marks a focused state.', 'ring', 1, 0.46, 0.31, 0.06, 0.1, 0, true),
  preset('danger-pulse', 'Status', 'A compact warning ring marks a danger state.', 'ring', 1, 0.48, 0.35, 0.08, 0.1, 0, true),
].map(effect => ({ ...effect, layers: LAYERS[effect.id] ?? [] }))
export const EFFECT_BY_ID = new Map(EFFECTS.map(effect => [effect.id, effect]))

/** Include the longest layer, life variation, and delayed start in an atlas. */
export const effectMaxDuration = (effect: EffectPreset): number =>
  Math.max(effect.duration, ...(effect.layers ?? []).map(layer => layer.duration ?? effect.duration)) * 1.25

/** Reserve the last of eight atlas intervals for a clear frame. */
export const effectAtlasDuration = (effect: EffectPreset): number => effectMaxDuration(effect) * 8 / 7

export interface EffectPreviewBounds {
  /** Local anchor for the effect. The renderer can add this to its world point. */
  center: THREE.Vector3
  /** World-space radius of the sampled particle and geometry bounds. */
  radius: number
  /** Camera framing radius used by the existing preview callers. */
  frameRadius: number
}

interface PreviewPoint { x: number; y: number; z: number; extent: number }

const PREVIEW_TIME_SAMPLES = 36
const PREVIEW_FRAME_SCALE = 2.9
const PREVIEW_MIN_FRAME_RADIUS = 1.15
const PREVIEW_SEED = 1234567
const PREVIEW_SHAPE_RADIUS: Record<ShapeKind, number> = {
  stroke: 1, spark: 1, ring: 1, arc: 1.17, dust: 1.2, chip: .8, star: 1,
}

function validatePreviewInput(scale: number, lifetime: number): void {
  if (![scale, lifetime].every(Number.isFinite) || scale <= 0 || lifetime <= 0) {
    throw new Error('Effect preview scale and lifetime must be finite and positive.')
  }
}

/** Sample the same travel, gravity, floor, and spiral rules used by update(). */
export function effectPreviewBounds(effect: EffectPreset, scale = 1, lifetime = 1): EffectPreviewBounds {
  validatePreviewInput(scale, lifetime)
  const points: PreviewPoint[] = []
  const parts = [effect, ...(effect.layers ?? []).map(layer => ({ ...effect, ...layer }))]
  let seed = PREVIEW_SEED
  const random = (): number => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
    return seed / 4294967296
  }
  const addPoint = (x: number, y: number, z: number, extent: number): void => {
    points.push({ x, y, z, extent })
  }

  interface PreviewParticle {
    position: { x: number; y: number; z: number }
    velocity: { x: number; y: number; z: number }
    size: number; rotation: number; gravity: number; spiral: number; orbitRadius: number; life: number
  }
  let sharedStar: PreviewParticle | undefined
  for (const part of parts) {
    for (let index = 0; index < part.count; index++) {
      const colorRole = part.colorRole ?? (part.accent ? 'accent' : 'ink')
      const isPaperCore = part.shape === 'star' && colorRole === 'paper' && sharedStar !== undefined
      const isStarOuter = part.shape === 'star' && colorRole !== 'paper'
      let particle: PreviewParticle
      if (isPaperCore) {
        const anchor = sharedStar!
        particle = { ...anchor, position: { ...anchor.position }, velocity: { ...anchor.velocity }, size: anchor.size * PAPER_CORE_SCALE }
      } else {
        const angle = (part.angle ?? 0) + (random() - .5) * Math.PI * 2 * part.spread
        const speed = part.speed * (.45 + random() * .7)
        const floor = part.floor ?? false
        random()
        const life = part.duration * (.8 + random() * .35) * lifetime
        const position = { x: (random() - .5) * .08 * scale, y: 0, z: (random() - .5) * .08 * scale }
        const velocity = {
          x: Math.cos(angle) * speed * scale,
          y: (floor ? .1 + random() * .15 : Math.sin(angle) * speed + .3) * scale,
          z: (floor ? Math.sin(angle) * speed : (random() - .5) * speed * .4) * scale,
        }
        particle = { position, velocity, size: part.size * (.65 + random() * .6) * scale,
          rotation: angle - (part.shape === 'arc' ? 0 : Math.PI / 2), gravity: part.gravity * scale, spiral: part.spiral ?? 0, orbitRadius: (part.orbitRadius ?? .5) * scale, life }
        if (isStarOuter && sharedStar === undefined) sharedStar = particle
      }
      const extent = Math.abs(particle.size) * PREVIEW_SHAPE_RADIUS[part.shape]
      const times = [0, particle.life]
      for (let step = 1; step < PREVIEW_TIME_SAMPLES; step++) times.push(particle.life * step / PREVIEW_TIME_SAMPLES)
      if (particle.gravity > 0) {
        const turningTime = particle.velocity.y / particle.gravity
        if (turningTime > 0 && turningTime < particle.life) times.push(turningTime)
      }
      for (const time of times) {
        const spiralAngle = particle.rotation + time * particle.spiral
        addPoint(
          particle.position.x + particle.velocity.x * time + (particle.spiral ? Math.cos(spiralAngle) * particle.orbitRadius : 0),
          particle.position.y + particle.velocity.y * time - .5 * particle.gravity * time * time,
          particle.position.z + particle.velocity.z * time + (particle.spiral ? Math.sin(spiralAngle) * particle.orbitRadius : 0),
          extent,
        )
      }
    }
  }

  if (!points.length) return { center: new THREE.Vector3(), radius: .01, frameRadius: PREVIEW_MIN_FRAME_RADIUS }
  const min = new THREE.Vector3(Infinity, Infinity, Infinity)
  const max = new THREE.Vector3(-Infinity, -Infinity, -Infinity)
  for (const point of points) {
    min.x = Math.min(min.x, point.x); min.y = Math.min(min.y, point.y); min.z = Math.min(min.z, point.z)
    max.x = Math.max(max.x, point.x); max.y = Math.max(max.y, point.y); max.z = Math.max(max.z, point.z)
  }
  const center = min.clone().add(max).multiplyScalar(.5)
  let radius = 0
  for (const point of points) {
    radius = Math.max(radius, Math.hypot(point.x - center.x, point.y - center.y, point.z - center.z) + point.extent)
  }
  radius = Math.max(.01, radius * 1.02)
  let anchorRadius = 0
  for (const point of points) anchorRadius = Math.max(anchorRadius, Math.hypot(point.x, point.y, point.z) + point.extent)
  const frameRadius = Math.max(PREVIEW_MIN_FRAME_RADIUS, Math.max(radius, anchorRadius) * PREVIEW_FRAME_SCALE)
  return { center, radius, frameRadius }
}

/** Frame the full sampled motion with a compact margin for the current cameras. */
export function effectPreviewRadius(effect: EffectPreset, scale = 1, lifetime = 1): number {
  return effectPreviewBounds(effect, scale, lifetime).frameRadius
}


const PAPER_COLOR = '#eeece5'
const INK_COLOR = '#151716'
const DUST_COLOR = '#30342f'
const ACCENT_COLOR = '#d45538'
const PAPER_CORE_SCALE = .5

/** Resolve a recipe layer without flattening its paper, ink, and accent roles. */
export const resolveEffectColor = (role: EffectColorRole, requestedColor?: string, dust = false): string => {
  if (role === 'paper') return PAPER_COLOR
  if (role === 'accent') return requestedColor ?? ACCENT_COLOR
  return dust ? DUST_COLOR : INK_COLOR
}

/** A fast attack, held graphic, and clean fade with no ring cutoff. */
export const effectEnvelope = (progress: number): number => {
  const t = Math.min(1, Math.max(0, progress))
  const smooth = (value: number): number => value * value * (3 - 2 * value)
  const attack = smooth(Math.min(1, t / .08))
  const release = 1 - smooth(Math.max(0, (t - .54) / .46))
  return attack * release
}

interface Particle {
  shape: ShapeKind; time: number; life: number; position: THREE.Vector3; velocity: THREE.Vector3
  size: number; rotation: number; gravity: number; color: THREE.Color; floor: boolean; spiral: number; orbitRadius: number
  pairId: number; pairRole: 'none' | 'outer' | 'core'
}
interface StarAnchor {
  pairId: number; time: number; life: number; position: THREE.Vector3; velocity: THREE.Vector3
  size: number; rotation: number; gravity: number; floor: boolean; spiral: number; orbitRadius: number
}
function shapeGeometry(kind: ShapeKind): THREE.BufferGeometry {
  if (kind === 'ring') return new THREE.RingGeometry(.94, 1, 40)
  if (kind === 'dust') {
    const segments = 24, positions: number[] = [], indices: number[] = []
    for (let i = 0; i <= segments; i++) {
      const progress = i / segments, angle = .12 + progress * 5.64
      const radius = .9 + Math.sin(angle * 3) * .055 + Math.cos(angle * 7) * .035
      const width = .20 * (.25 + .75 * Math.sin(progress * Math.PI))
      for (const r of [radius, radius - width]) positions.push(Math.cos(angle) * r, Math.sin(angle) * r, 0)
      if (i < segments) { const a = i * 2; indices.push(a, a + 1, a + 2, a + 2, a + 1, a + 3) }
    }
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3)); geometry.setIndex(indices)
    return geometry
  }
  const shape = new THREE.Shape()
  if (kind === 'arc') {
    const segments = 24
    for (let i = 0; i <= segments; i++) {
      const progress = i / segments
      const t = -.86 + progress * 2.36
      const width = .008 + .065 * Math.sin(progress * Math.PI) ** .7
      const radius = 1 + width
      const x = Math.cos(t) * radius, y = Math.sin(t) * radius
      i ? shape.lineTo(x, y) : shape.moveTo(x, y)
    }
    for (let i = segments; i >= 0; i--) {
      const progress = i / segments
      const t = -.86 + progress * 2.36
      const width = .008 + .065 * Math.sin(progress * Math.PI) ** .7
      const radius = 1 - width
      shape.lineTo(Math.cos(t) * radius, Math.sin(t) * radius)
    }
  } else if (kind === 'star') {
    for (let i = 0; i < 16; i++) {
      const a = i / 16 * Math.PI * 2
      const r = i % 2 ? .22 : i % 4 ? .68 : 1
      i ? shape.lineTo(Math.cos(a) * r, Math.sin(a) * r) : shape.moveTo(r, 0)
    }
  } else if (kind === 'chip') {
    shape.moveTo(-.5, -.2); shape.lineTo(.2, -.45); shape.lineTo(.6, .2); shape.lineTo(-.3, .5)
  } else {
    shape.moveTo(0, -1); shape.lineTo(kind === 'stroke' ? .055 : .17, .1); shape.lineTo(0, 1); shape.lineTo(kind === 'stroke' ? -.035 : -.12, .25)
  }
  shape.closePath()
  return new THREE.ShapeGeometry(shape)
}

/** A fixed-capacity instance pool. No texture files or scene lights are needed. */
export class InkEffects {
  private readonly particles: Particle[] = []
  private readonly bursts: number[] = []
  private readonly meshes = new Map<ShapeKind, THREE.InstancedMesh>()
  private readonly dummy = new THREE.Object3D()
  private readonly billboard = new THREE.Quaternion()
  private readonly localTurn = new THREE.Quaternion()
  private readonly axis = new THREE.Vector3(0, 0, 1)
  private readonly floorTurn = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0))
  private seed = PREVIEW_SEED
  private nextPairId = 1
  readonly group = new THREE.Group()
  constructor(private readonly capacity = 2048) {
    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 8192) throw new Error('Particle capacity must be between 1 and 8192.')
    for (const kind of ['stroke', 'spark', 'ring', 'arc', 'dust', 'chip', 'star'] as ShapeKind[]) {
      const mesh = new THREE.InstancedMesh(shapeGeometry(kind), new THREE.MeshBasicMaterial({
        color: 0xffffff, side: THREE.DoubleSide, depthWrite: false, transparent: false,
      }), capacity)
      if (kind === 'dust') {
        mesh.geometry.setAttribute('instanceOpacity', new THREE.InstancedBufferAttribute(new Float32Array(capacity), 1).setUsage(THREE.DynamicDrawUsage))
        const material = mesh.material as THREE.MeshBasicMaterial
        material.transparent = true; material.forceSinglePass = true
        material.customProgramCacheKey = () => 'inkline-dust-fade-v1'
        material.onBeforeCompile = shader => {
          shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\nattribute float instanceOpacity;\nvarying float vInkOpacity;')
            .replace('#include <begin_vertex>', '#include <begin_vertex>\nvInkOpacity = instanceOpacity;')
          shader.fragmentShader = shader.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vInkOpacity;')
            .replace('#include <color_fragment>', '#include <color_fragment>\ndiffuseColor.a *= vInkOpacity;')
        }
      }
      mesh.count = 0; mesh.visible = false; mesh.frustumCulled = false; mesh.renderOrder = 2
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
      this.meshes.set(kind, mesh); this.group.add(mesh)
    }
  }
  get activeCount(): number { return this.particles.length }
  get activeBursts(): number { return this.bursts.length }
  private random(): number { this.seed = (Math.imul(this.seed, 1664525) + 1013904223) >>> 0; return this.seed / 4294967296 }
  /**
   * Trigger an effect at a world position. Scale changes all distances.
   * Direction is a radians angle.
   * Floor layers read it as a world XZ heading. Billboard layers read it in
   * their camera-facing plane, so callers can project a world direction onto
   * camera right/up before passing it. A centered hit uses direction 0.
   */
  trigger(id: string, at: THREE.Vector3, color: string | undefined = undefined, scale = 1, direction = 0, lifetime = 1): number {
    const recipe = EFFECT_BY_ID.get(id)
    if (!recipe) throw new Error(`Unknown effect: ${id}`)
    if (![at.x, at.y, at.z, direction, scale, lifetime].every(Number.isFinite) || scale <= 0 || lifetime <= 0) throw new Error('Effect position, scale, and lifetime must be finite. Scale and lifetime must be positive.')
    let duration = 0
    const parts = [recipe, ...(recipe.layers ?? []).map(layer => ({ ...recipe, ...layer }))]
    let sharedStar: StarAnchor | undefined
    for (const effect of parts) for (let i = 0; i < effect.count && this.particles.length < this.capacity; i++) {
      const colorRole = effect.colorRole ?? (effect.accent ? 'accent' : 'ink')
      const isPaperCore = effect.shape === 'star' && colorRole === 'paper' && sharedStar !== undefined
      const isStarOuter = effect.shape === 'star' && colorRole !== 'paper'
      let pairId = 0
      let pairRole: Particle['pairRole'] = 'none'
      let position: THREE.Vector3
      let velocity: THREE.Vector3
      let size: number
      let rotation: number
      let gravity: number
      let floor: boolean
      let spiral: number
      let orbitRadius: number
      let time: number
      let life: number
      if (isPaperCore) {
        const anchor = sharedStar!
        pairId = anchor.pairId; pairRole = 'core'
        position = anchor.position.clone(); velocity = anchor.velocity.clone()
        size = anchor.size * PAPER_CORE_SCALE; rotation = anchor.rotation; gravity = anchor.gravity
        floor = anchor.floor; spiral = anchor.spiral; orbitRadius = anchor.orbitRadius; time = anchor.time; life = anchor.life
      } else {
        const angle = direction + (effect.angle ?? 0) + (this.random() - .5) * Math.PI * 2 * effect.spread
        const speed = effect.speed * (.45 + this.random() * .7)
        floor = effect.floor ?? false
        time = -this.random() * effect.duration * .1 * lifetime
        life = effect.duration * (.8 + this.random() * .35) * lifetime
        position = at.clone().add(new THREE.Vector3((this.random() - .5) * .08 * scale, 0, (this.random() - .5) * .08 * scale))
        velocity = new THREE.Vector3(Math.cos(angle) * speed, floor ? .1 + this.random() * .15 : Math.sin(angle) * speed + .3,
          floor ? Math.sin(angle) * speed : (this.random() - .5) * speed * .4).multiplyScalar(scale)
        size = effect.size * (.65 + this.random() * .6) * scale
        rotation = angle - (effect.shape === 'arc' ? 0 : Math.PI / 2); gravity = effect.gravity * scale; spiral = effect.spiral ?? 0
        orbitRadius = (effect.orbitRadius ?? .5) * scale
        if (isStarOuter && sharedStar === undefined) {
          pairId = this.nextPairId++; pairRole = 'outer'
          sharedStar = { pairId, time, life, position: position.clone(), velocity: velocity.clone(), size, rotation, gravity, floor, spiral, orbitRadius }
        }
      }
      duration = Math.max(duration, life - time)
      this.particles.push({ shape: effect.shape, time, life, position, velocity, size, rotation, gravity,
        color: new THREE.Color(resolveEffectColor(colorRole, color, effect.shape === 'dust')),
        floor: floor && effect.shape !== 'dust', spiral, orbitRadius, pairId, pairRole,
      })
    }
    if (duration) this.bursts.push(duration)
    return duration
  }
  clear(): void {
    this.particles.length = 0
    this.bursts.length = 0
    this.seed = PREVIEW_SEED
    this.nextPairId = 1
    for (const mesh of this.meshes.values()) { mesh.count = 0; mesh.visible = false }
  }
  update(delta: number, camera: THREE.Camera): void {
    if (!Number.isFinite(delta) || delta < 0) throw new Error('Effect delta must be finite and nonnegative.')
    for (let i = this.bursts.length - 1; i >= 0; i--) { this.bursts[i] -= delta; if (this.bursts[i] <= 0) this.bursts.splice(i, 1) }
    camera.getWorldQuaternion(this.billboard)
    for (const mesh of this.meshes.values()) mesh.count = 0
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]
      p.time += delta
      if (p.time >= p.life) { this.particles[i] = this.particles[this.particles.length - 1]; this.particles.pop(); continue }
      if (p.time < 0) continue
    }
    const upload = (p: Particle): void => {
      if (p.time < 0) return
      const t = p.time / p.life
      const envelope = effectEnvelope(t)
      this.dummy.position.copy(p.position).addScaledVector(p.velocity, p.time)
      this.dummy.position.y -= .5 * p.gravity * p.time * p.time
      if (p.spiral) { this.dummy.position.x += Math.cos(p.time * p.spiral + p.rotation) * p.orbitRadius; this.dummy.position.z += Math.sin(p.time * p.spiral + p.rotation) * p.orbitRadius }
      this.localTurn.setFromAxisAngle(this.axis, p.rotation + (p.shape === 'chip' ? p.time * 3 : 0))
      this.dummy.quaternion.copy(p.floor ? this.floorTurn : this.billboard).multiply(this.localTurn)
      const size = p.size * (p.shape === 'dust' ? .4 + .7 * Math.min(1, t / .6) : Math.max(.001, envelope))
      this.dummy.scale.set(size, size * (p.shape === 'dust' ? .72 : 1), size)
      this.dummy.updateMatrix()
      const mesh = this.meshes.get(p.shape)!
      mesh.setMatrixAt(mesh.count, this.dummy.matrix); mesh.setColorAt(mesh.count, p.color)
      const opacity = mesh.geometry.getAttribute('instanceOpacity')
      if (opacity) opacity.setX(mesh.count, Math.min(1, t / .08) * (1 - t) ** 1.5)
      mesh.count++
    }
    // Keep paired star cores after their outer stars in the shared star pool.
    // The second pass is bounded by the same particle capacity and allocates nothing.
    for (const p of this.particles) if (p.pairRole !== 'core') upload(p)
    for (const p of this.particles) if (p.pairRole === 'core') upload(p)
    for (const mesh of this.meshes.values()) {
      mesh.visible = mesh.count > 0
      if (!mesh.visible) continue
      const opacity = mesh.geometry.getAttribute('instanceOpacity')
      if (opacity) opacity.needsUpdate = true
      mesh.instanceMatrix.needsUpdate = true
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    }
  }
  dispose(): void {
    this.clear()
    for (const mesh of this.meshes.values()) { mesh.geometry.dispose(); (mesh.material as THREE.Material).dispose(); mesh.dispose() }
    this.group.removeFromParent()
  }
}
