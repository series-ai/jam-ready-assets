import type { Placement } from './district'
import type { Vec3 } from '../types'

export type DistrictLayoutId = 'district' | 'service-yard' | 'roof-works'

export interface EnvironmentLayout {
  id: Exclude<DistrictLayoutId, 'district'>
  label: string
  description: string
  placements: Placement[]
  actors: { at: Vec3; yaw: number; animation: string }[]
  effects: { id: string; at: Vec3; scale: number }[]
  inspectionRoute?: Vec3[]
}

const place = (id: string, at: Vec3, size?: Vec3, yaw = 0): Placement => ({
  id,
  at,
  ...(size ? { size } : {}),
  ...(yaw ? { yaw } : {}),
})

const floorGrid = (y: number): Placement[] => {
  const placements: Placement[] = []
  for (const x of [-10, -6, -2, 2, 6, 10]) {
    for (const z of [-8, -4, 0, 4, 8]) placements.push(place('floor-slab', [x, y, z], [4, .16, 4]))
  }
  return placements
}

const SERVICE_YARD_PLACEMENTS: Placement[] = [
  ...floorGrid(-.16),

  // The north-west bay is a readable repair point. The canopy, arch, pillars,
  // and track leave a clear worker position in front of the service door.
  place('service-bay-arch', [-8, 0, 7]),
  place('service-bay-canopy', [-8, 0, 4.5]),
  place('service-bay-pillar', [-10, 0, 7]),
  place('service-bay-pillar', [-6, 0, 7]),
  place('service-bay-door-track', [-8, 0, 6.2]),
  place('service-bay-workbench', [-4.4, 0, 7]),
  place('service-bay-tool-board', [-2, 0, 7]),

  // The east loading lane rises from the open yard to a one metre dock.
  place('loading-platform', [7.5, 0, -5]),
  // The ramp high end is at local -Z. A half-turn puts that end against the
  // dock face at z=-5, while the low end meets the yard at z=-9.
  place('loading-platform-ramp', [7.5, 0, -7], undefined, Math.PI),
  place('loading-dock-bumper', [7.5, 0, -3.8]),
  place('loading-dock-ladder', [9.2, 0, -5]),
  place('loading-gate', [11.4, 0, -1]),
  place('loading-wheel-stop', [7.5, 0, -2.3]),

  // A linked walkway makes a short route around the work area. Rails mark the
  // turns while the center stays open for figures and camera framing. The
  // straight, T, and L share exact authored end ranges. The bridge then runs
  // south to a scaled one-metre ramp and a low service platform.
  place('walkway-straight', [0, 0, 5.5]),
  place('walkway-t-junction', [0, 0, 1.95]),
  place('walkway-l-junction', [1.7, 0, 2.2]),
  place('walkway-bridge-narrow', [2.8, 0, -1.75]),
  place('walkway-service-steps', [2.8, 0, -4.45], [.9, .25, 1.13]),
  place('walkway-ramp', [2.8, 0, -5.35], [2, 2.15, 3.1]),
  place('walkway-rail-gate', [1.2, 0, 5.5]),
  place('walkway-rail-kickplate', [0, 0, 7.35]),

  // The utility row faces the yard and leaves service clearance behind it.
  place('pipe-manifold', [11, 0, 5.5]),
  place('pipe-vertical-elbow', [12.5, 0, 5.5]),
  place('utility-panel', [10, 0, 1]),
  place('utility-panel-double', [12, 0, 1]),
  place('utility-cabinet-low', [10, 0, 3]),
  place('utility-bench', [8.2, 0, 7.5]),
  place('utility-tool-rack', [6, 0, 7.4]),
  place('utility-drain-channel', [4.2, 0, -5.8]),
  place('utility-sewer-opening', [1.2, 0, -6.2]),
  place('utility-meter-pedestal', [4.2, 0, 7.5]),
  place('platform-low', [2.8, 0, -8]),

  // Existing industrial anchors give the new modules a useful working scale.
  place('warehouse', [-10, 0, -4], [5.6, 4.8, 5.2]),
  place('cargo-container', [10, 0, 8], [5.6, 2.6, 3.2]),
  place('generator', [4.8, 0, -6.5], [2.8, 2, 2]),
  place('conveyor', [5.2, 0, 2], [4.5, 1.1, 1.2]),
  place('crane', [10, 0, 3.5], [4.2, 6.5, 4.5]),
  place('cable-spool', [-4.5, 0, -7]),
  place('crate', [-2.8, .15, -7]),
  place('pallet', [-2.8, 0, -7], [1.2, .15, 1.2]),
  place('barrel', [-4.8, 0, -7.5]),
  place('barrel', [-5.5, 0, -6.8]),
  place('fence-panel', [-12, 0, -8], [4, 2, .1], Math.PI / 2),
  place('fence-panel', [-12, 0, 0], [4, 2, .1], Math.PI / 2),
  place('fence-panel', [-12, 0, 8], [4, 2, .1], Math.PI / 2),
  place('fence-panel', [12, 0, 8], [4, 2, .1], Math.PI / 2),
  place('fence-panel', [0, 0, -10], [4, 2, .1]),
  place('fence-panel', [8, 0, -10], [4, 2, .1]),
  place('floodlight', [12, 0, -6], [1, 6, 1]),
  place('bollard', [-2.8, 0, -2]),
  place('bollard', [2.8, 0, -2]),
]

const ROOF_WORKS_PLACEMENTS: Placement[] = [
  // Ground context and six open bay frames carry the roof deck. Each frame is
  // 3.99 metres high so its orange cap sits 10 mm below the upper slab.
  ...floorGrid(-.16),
  place('warehouse-bay', [-8, 0, -4], [8, 3.99, 8]),
  place('warehouse-bay', [0, 0, -4], [8, 3.99, 8]),
  place('warehouse-bay', [8, 0, -4], [8, 3.99, 8]),
  place('warehouse-bay', [-8, 0, 4], [8, 3.99, 8]),
  place('warehouse-bay', [0, 0, 4], [8, 3.99, 8]),
  place('warehouse-bay', [8, 0, 4], [8, 3.99, 8]),
  place('warehouse-office', [-10, 0, -8], [4, 2.8, 4]),
  place('cargo-container', [10, 0, -8], [5.6, 2.6, 3.2]),
  place('generator', [6, 0, -8], [2.8, 2, 2]),
  ...floorGrid(3.84),

  // The roof perimeter uses low curbs and fall protection. The high equipment
  // stays at the edges so the center remains a clear inspection court.
  place('roof-curb-straight', [-8, 4, 7]),
  place('roof-curb-corner', [-4.5, 4, 7]),
  place('roof-access-hatch', [-6, 4, 4]),
  place('roof-service-vent-stack', [-2, 4, 7]),
  place('roof-equipment-plinth', [3, 4, 7]),
  place('roof-safety-post', [7, 4, 7]),
  place('roof-drain-scupper', [10, 4, 6]),
  place('roof-antenna-mast', [10, 4, -6]),
  place('roof-cable-bridge', [-8, 4, -4]),
  place('roof-fall-arrest-anchor', [-5, 4, -6]),
  place('roof-ladder-landing', [-1, 3.82, -6]),
  place('roof-duct-curb', [4, 4, -4]),

  // A continuous roof service route. The low deck tops are at y=4. The
  // bridge ends at the stair low end. The stair high end meets the landing at
  // y=4.6, so the raised landing has a real approach from the roof.
  place('walkway-straight', [-8, 3.845, 0], undefined, Math.PI / 2),
  place('walkway-grated-turn', [-5, 3.845, 0]),
  place('walkway-cross-junction', [-2.8, 3.88, 0]),
  place('walkway-bridge-narrow', [.4, 3.8, 0], undefined, -Math.PI / 2),
  place('walkway-stair-short', [4.4, 3.8, 0], undefined, -Math.PI / 2),
  place('walkway-landing', [6, 3.57, 0]),

  // A second stair makes the south roof ladder landing reachable from the
  // deck. Its high end meets the authored landing grate at y=4.6.
  place('walkway-stair-short', [-1, 3.815, -6.2]),

  // Small pipe inspection points complete the utility loop at the south edge.
  place('pipe-flange-pair', [-8, 3.84, -7]),
  place('pipe-inspection-port', [-6, 4, -7]),

  // Existing anchors make the roof read as an extension of the district.
  place('catwalk', [0, 3.9, -7], [3, 1.15, 6], Math.PI / 2),
  place('rail-straight', [0, 4, -10], [3, 1, .15], Math.PI / 2),
  place('vent-fan', [-10, 4, 7], [1.6, 1, 1.6]),
  place('pipe-straight', [8, 4, 4], [.4, .4, 4]),
  place('pipe-elbow', [8, 4, 2]),
  place('ladder', [10, 0, 3], [.7, 5.5, .25], Math.PI / 2),
  place('fence-panel', [-12, 4, -8], [4, 2, .1], Math.PI / 2),
  place('fence-panel', [-12, 4, 0], [4, 2, .1], Math.PI / 2),
  place('fence-panel', [-12, 4, 8], [4, 2, .1], Math.PI / 2),
  place('fence-panel', [12, 4, 8], [4, 2, .1], Math.PI / 2),
  place('fence-panel', [0, 4, -10], [4, 2, .1]),
  place('fence-panel', [8, 4, -10], [4, 2, .1]),
  place('floodlight', [12, 4, -6], [1, 6, 1]),
]

export const EXTRA_LAYOUTS: EnvironmentLayout[] = [
  {
    id: 'service-yard',
    label: 'Service Yard',
    description: 'A ground level repair and loading yard with a linked walkway, utility row, and open inspection center.',
    placements: SERVICE_YARD_PLACEMENTS,
    actors: [
      { at: [0, 0, 0], yaw: Math.PI / 2, animation: 'idle' },
      { at: [7.5, 1.04, -5], yaw: Math.PI, animation: 'idle' },
      { at: [-3.5, 0, 2.5], yaw: 0, animation: 'idle' },
    ],
    effects: [
      { id: 'welding-arc', at: [-4.4, 1.8, 7], scale: .6 },
      { id: 'pipe-leak', at: [11, 1.7, 5.5], scale: .5 },
      { id: 'hazard-flare', at: [11.4, .45, -1], scale: .65 },
      { id: 'steam-burst', at: [4.8, 1.6, -6.5], scale: .5 },
    ],
    inspectionRoute: [
      [0, .155, 7.4], [0, .155, 3.45], [0, .155, 1.3],
      [2.8, .155, 1.3], [2.8, .2, -4.8], [2.8, .24, -4.45],
      [2.8, 0, -3.8], [2.8, 1, -6.9], [2.8, 1, -7.8],
    ],
  },
  {
    id: 'roof-works',
    label: 'Roof Works',
    description: 'An elevated maintenance roof with perimeter safety hardware, service decks, and a clear inspection court.',
    placements: ROOF_WORKS_PLACEMENTS,
    actors: [
      { at: [0, 4, 0], yaw: -Math.PI / 2, animation: 'idle' },
      { at: [-6, 4, -4], yaw: 0, animation: 'idle' },
      { at: [6, 4.6, 0], yaw: Math.PI, animation: 'idle' },
    ],
    effects: [
      { id: 'electric-arc', at: [3, 5.2, 7], scale: .5 },
      { id: 'steam-burst', at: [10, 5.6, -6], scale: .55 },
      { id: 'welding-arc', at: [-3.5, 5.1, 0], scale: .5 },
      { id: 'hazard-flare', at: [10, 4.5, 6], scale: .45 },
    ],
    inspectionRoute: [
      [-10, 4, 0], [-6, 4, 0], [-4, 4, -.95], [-2.8, 4, 0],
      [0, 4, 0], [3.45, 4, 0], [3.875, 4, 0], [3.9, 4.2, 0],
      [4.295, 4.2, 0], [4.32, 4.4, 0], [4.715, 4.4, 0],
      [4.74, 4.6, 0], [5.0, 4.6, 0], [6, 4.6, 0],
    ],
  },
]
