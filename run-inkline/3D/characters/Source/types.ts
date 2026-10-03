import type { DistrictLayoutId } from './runtime/layouts'
export type Vec3 = [number, number, number]
export type ModelKind = 'character' | 'prop'
export interface ModelEntry {
  id: string
  label: string
  kind: ModelKind
  category: string
  file: string
  thumbnail: string
  dimensions: Vec3
  triangles: number
  vertices: number
  materials: number
  description: string
  tags: string[]
}
export interface AnimationEntry {
  id: string
  label: string
  category: string
  duration: number
  loop: boolean
  contactTime?: number
  contactFrame?: number
  /** Authored pose phases use the pack frame rate of 30 Hz. */
  motion?: { phases: { name: string; frame: number }[] }
  /** Metres per second represented by one normal-speed locomotion cycle. */
  travelSpeed?: number
}
export interface PackManifest {
  version: string
  models: ModelEntry[]
  animations: AnimationEntry[]
}
export interface AvatarConfig {
  preset: string
  color: string
  accent: string
  height: number
  thickness: number
  headScale: number
  headwear: 'none' | 'cap' | 'headband' | 'beanie' | 'visor' | 'helmet'
  equipment: string | null
}
export type ViewMode = 'overview' | 'assets' | 'avatars' | 'animations' | 'effects' | 'district' | 'combat' | 'parkour' | 'performance'
export type CameraMode = 'perspective' | 'side' | 'top' | 'third-person'
export interface StageSettings {
  mode: ViewMode
  districtLayout: DistrictLayoutId
  ambientEffects: boolean
  modelId: string
  animationId: string
  effectId: string
  effectColor: string
  effectScale: number
  effectLifetime: number
  avatar: AvatarConfig
  camera: CameraMode
  playing: boolean
  speed: number
  seek: number | null
  wireframe: boolean
  outlines: boolean
  figureCount: number
  effectCount: number
  quality: 'mobile' | 'high'
  motion: 'full' | 'reduced'
  trigger: number
  reset: number
}
export interface StageStats {
  fps: number
  frameMs: number
  calls: number
  triangles: number
  geometries: number
  textures: number
  elapsed: number
  figures: number
  effects: number
  score: number
  message: string
  loading: boolean
  error: string | null
}
export const DEFAULT_AVATAR: AvatarConfig = {
  preset: 'stick-standard', color: '#151716', accent: '#d45538',
  height: 1, thickness: 1, headScale: 1, headwear: 'none', equipment: null,
}
export const DEFAULT_SETTINGS: StageSettings = {
  mode: 'overview', districtLayout: 'district', ambientEffects: true, modelId: 'stick-standard', animationId: 'idle', effectId: 'punch-impact',
  avatar: DEFAULT_AVATAR, camera: 'perspective', playing: true, speed: 1, seek: null,
  effectColor: '#d45538', effectScale: 1, effectLifetime: 1,
  wireframe: false, outlines: true, figureCount: 20, effectCount: 10, quality: 'mobile', motion: 'full', trigger: 0, reset: 0,
}
