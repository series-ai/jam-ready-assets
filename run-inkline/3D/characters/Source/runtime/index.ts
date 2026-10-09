export { AssetLibrary, applyAvatar, applyFigureShading, applyPropShading, architecturalMaterial, figureMaterial, animationBounds, addOutlines, disposeInstance, equipmentContactPoint, equipmentPose, mountEquipment, supportEquipment } from './assets'
export * from './palette'
export { InkEffects, EFFECTS, EFFECT_BY_ID, effectPreviewRadius, effectPreviewBounds, effectMaxDuration, effectAtlasDuration } from './effects'
export { createDistrict, DISTRICT_PLACEMENTS, DISTRICT_COLLISION, CHECKPOINTS } from './district'
export { moveBody, supportAt, surfaceHeight, validateAvatar } from './physics'
export type { AvatarConfig, ModelEntry, AnimationEntry, PackManifest } from '../types'
export type { EffectPreset } from './effects'
export type { Body, WorldCollision, Movement, Surface, Obstacle } from './physics'

export { startAttack, advanceAttack, attackContactBone, cameraImpulse, combatMove, animationPreviewEquipment } from './presentation'
export type { AttackBeat, AttackKind } from './presentation'
export { CHARACTER_ROLES, ROLE_BY_ID, roleAvatar } from './roles'
export type { CharacterRole } from './roles'

export { EXTRA_LAYOUTS } from './layouts'
export type { DistrictLayoutId, EnvironmentLayout } from './layouts'

export { CameraClearance, CameraMotion, fitPerspectiveBox } from './camera'

export { InkTrails } from './trails'
export { ACTION_BUFFER_SECONDS, getImpactProfile, sampleRecoil, sampleKnockdown, selectReaction, stepActionBuffer } from './kinetics'
export type { ImpactProfile, RecoilSample, ActionBufferStep } from './kinetics'

export { ForegroundCutaway } from './cutaway'
