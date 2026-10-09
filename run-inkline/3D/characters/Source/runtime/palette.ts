import * as THREE from 'three'

/**
 * INKLINE graphic-novel palette. Cool white architecture, gunmetal figures with
 * pitch-black ink edges, and vermillion threats. Every runtime surface reads its
 * colors from this module.
 */
export const PAPER = '#f3f4f6'
export const FLOOR = '#dde0e4'
export const GRID_MAJOR = '#bfc5cd'
export const GRID_MINOR = '#d4d8de'
export const INK = '#151716'
export const DUST = '#2f343b'
export const ACCENT = '#d45538'
export const THREAT = '#ff2212'
export const THREAT_ACCENT = '#ffea00'
export const STRIKE_TRAIL = '#ff1a0a'
export const CONTACT_SHADOW = '#b4b9c1'
export const PROP_OUTLINE = '#464b53'
export const DISTRICT_OUTLINE = '#52575f'
export const ROUTE_MARK = '#c4c8ce'
export const THREAT_CONTOUR = '#450207'

/** Pack materials and their colors in the graphic-novel palette. `null` keeps the source color. */
const PROP_COLORS: Record<string, string | null> = {
  InkMat_OffWhite: '#f2f4f7',
  InkMat_SafetyOrange: '#383c42',
  InkMat_StructuralGray: '#888e96',
  InkMat_Charcoal: null,
  InkMat_Steel: '#94a3b8',
}
export function propColor(materialName: string, source: THREE.Color): THREE.Color {
  if (!materialName) return source.clone()
  if (!(materialName in PROP_COLORS)) throw new Error(`Prop material has no palette entry: ${materialName}`)
  const mapped = PROP_COLORS[materialName]
  return mapped ? new THREE.Color(mapped) : source.clone()
}

export type FigureRole = 'player' | 'threat'
/** Display-referred (sRGB) shading bands. The figure shader writes these values directly. */
export interface FigureBands {
  shadow: THREE.Vector3
  mid: THREE.Vector3
  lit: THREE.Vector3
  ink: THREE.Vector3
  litStart: number
  litEnd: number
  litWeight: number
}

/** A dark body color is lifted to gunmetal so the shadow and ink bands stay visible on white. */
const DARK_LUMINANCE = .25
const GUNMETAL_LIFT = new THREE.Vector3(.078, .09, .124)
const STEEL_LIFT = new THREE.Vector3(.12, .14, .17)
const PITCH_INK = new THREE.Vector3(.012, .012, .015)
const WHITE = new THREE.Vector3(1, 1, 1)
const THREAT_BANDS: FigureBands = {
  shadow: new THREE.Vector3(.55, .05, .08),
  mid: new THREE.Vector3(.96, .12, .06),
  lit: new THREE.Vector3(1, .28, .12),
  ink: new THREE.Vector3(.24, .01, .04),
  litStart: .60, litEnd: .68, litWeight: .45,
}

export function figureBands(role: FigureRole, color: THREE.ColorRepresentation): FigureBands {
  switch (role) {
    case 'threat': return { ...THREAT_BANDS, shadow: THREAT_BANDS.shadow.clone(), mid: THREAT_BANDS.mid.clone(), lit: THREAT_BANDS.lit.clone(), ink: THREAT_BANDS.ink.clone() }
    case 'player': {
      const rgb = new THREE.Color(color).getRGB({ r: 0, g: 0, b: 0 }, THREE.SRGBColorSpace)
      const base = new THREE.Vector3(rgb.r, rgb.g, rgb.b)
      const luminance = base.x * .2126 + base.y * .7152 + base.z * .0722
      if (luminance < DARK_LUMINANCE) {
        const mid = base.clone().add(GUNMETAL_LIFT).clampScalar(0, 1)
        return { shadow: base.clone().multiplyScalar(.6), mid, lit: mid.clone().add(STEEL_LIFT).clampScalar(0, 1), ink: PITCH_INK.clone(), litStart: .48, litEnd: .60, litWeight: .5 }
      }
      return { shadow: base.clone().multiplyScalar(.35), mid: base, lit: base.clone().lerp(WHITE, .35), ink: base.clone().multiplyScalar(.15), litStart: .48, litEnd: .60, litWeight: .5 }
    }
    default: throw new Error(`Unknown figure role: ${role satisfies never}`)
  }
}
