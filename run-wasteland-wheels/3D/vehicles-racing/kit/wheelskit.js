// wheelskit.js: assemble, recolour and animate Wasteland Wheels vehicles in three.js.
//
//   import { WheelsKit } from './wheelskit.js';
//   const kit = await WheelsKit.load('assets/wasteland-wheels/kit/');   // the folder holding bodies/ wheels/ parts/
//   const v = await kit.build({ body: 'icecream', front: 'treads', rear: 'treads', roof: 'cone',
//                               paint: 'sky', trim: 'bone', accent: 'red',
//                               trailers: [{ type: 'tanker', wheels: 'steel', paint: 'red' }] });
//   scene.add(v.group);
//   v.play('accelerate');   // idle | move | accelerate | brake ; v.drop() bounces it
//   v.update(dt);           // every frame
//
// KIT (below) lists every body, wheel kind, bolt-on, trailer and paint. See the Readme.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';

export const KIT = {
 "riser": 10,
 "partPaint": {
  "roof-rack-spare": {
   "trim": "orange",
   "accent": "steel"
  },
  "roof-rack-cargo": {
   "paint": "red",
   "trim": "khaki",
   "accent": "steel"
  },
  "roof-jerry-frame": {
   "paint": "red",
   "accent": "iron"
  },
  "roof-cone": {
   "accent": "steel"
  },
  "roof-light-bar": {
   "accent": "iron"
  },
  "hood-blower": {
   "accent": "steel"
  },
  "hood-blower-giant": {
   "accent": "steel"
  },
  "stacks-stack": {
   "accent": "steel"
  },
  "bumper-cow-catcher": {
   "paint": "red",
   "accent": "steel"
  },
  "bumper-longhorns": {
   "accent": "steel"
  },
  "bumper-roo-bar": {
   "accent": "iron"
  },
  "bumper-dozer-blade": {
   "paint": "gold",
   "accent": "steel"
  },
  "bumper-spike-ram": {
   "paint": "rust",
   "accent": "steel"
  },
  "bumper-winch-bumper": {
   "trim": "red",
   "accent": "steel"
  },
  "roof-harpoon": {
   "paint": "khaki",
   "accent": "steel"
  },
  "roof-searchlights": {
   "paint": "red",
   "accent": "iron"
  },
  "roof-tyre-stack": {
   "trim": "orange",
   "accent": "steel"
  },
  "roof-dish": {
   "paint": "bone",
   "accent": "steel"
  },
  "roof-surfboard": {
   "paint": "teal",
   "trim": "bone",
   "accent": "steel"
  },
  "hood-scoop": {
   "paint": "red",
   "accent": "iron"
  },
  "hood-velocity-stacks": {
   "accent": "steel"
  },
  "hood-turbo": {
   "trim": "orange",
   "accent": "steel"
  },
  "stacks-zoomies": {
   "accent": "steel"
  },
  "stacks-flame-stack": {
   "accent": "steel"
  },
  "bumper-tusks": {
   "accent": "steel"
  },
  "bumper-tyre-bumper": {
   "accent": "steel"
  },
  "bumper-log-ram": {
   "accent": "steel"
  }
 },
 "ramps": {
  "gray": [
   "#19191a",
   "#363739",
   "#525458",
   "#6f7278",
   "#8d9095",
   "#acaeb2",
   "#cbccce",
   "#eaeaeb"
  ],
  "stone": [
   "#212326",
   "#383b41",
   "#4e535d",
   "#636c79",
   "#7b8592",
   "#979fa8",
   "#b3b8be",
   "#ced1d5"
  ],
  "wood": [
   "#33251a",
   "#453529",
   "#594638",
   "#6c5748",
   "#816959",
   "#9c8572",
   "#b8a38b",
   "#d4c1a6"
  ],
  "darkwood": [
   "#1e160f",
   "#281d15",
   "#33251a",
   "#3e2d20",
   "#4a3526",
   "#5f4634",
   "#745843",
   "#8a6b52"
  ],
  "skin": [
   "#7a3f33",
   "#955847",
   "#b1725d",
   "#ce8d73",
   "#eba98a",
   "#f2bba0",
   "#f9ceb6",
   "#ffe0cc"
  ],
  "skindark": [
   "#3d2218",
   "#563324",
   "#704430",
   "#8c563d",
   "#a8694a",
   "#bb7e5d",
   "#cd9371",
   "#e0a985"
  ],
  "red": [
   "#5a1510",
   "#701c14",
   "#882318",
   "#9f2a1b",
   "#b8321f",
   "#cb523c",
   "#de6e56",
   "#f08a70"
  ],
  "blood": [
   "#270c13",
   "#3c101a",
   "#53131f",
   "#6b1522",
   "#801925",
   "#91212a",
   "#a12b30",
   "#af3737"
  ],
  "orange": [
   "#4a1c08",
   "#662c0f",
   "#843c16",
   "#a44d1e",
   "#c45f26",
   "#d57b44",
   "#e5965f",
   "#f5b27a"
  ],
  "gold": [
   "#7a5412",
   "#95691f",
   "#b07f2b",
   "#cc9638",
   "#e9ad45",
   "#efbf68",
   "#f4d186",
   "#f9e3a3"
  ],
  "lime": [
   "#24503f",
   "#396c57",
   "#50896f",
   "#67a789",
   "#7fc6a4",
   "#9fd6ba",
   "#bee5d0",
   "#dcf5e6"
  ],
  "leaf": [
   "#163116",
   "#234e21",
   "#306d2a",
   "#3e8c31",
   "#50aa3b",
   "#6abc50",
   "#88c370",
   "#a3cc8f"
  ],
  "forest": [
   "#0e1b14",
   "#172d20",
   "#1e402c",
   "#255436",
   "#2e6740",
   "#38774a",
   "#448754",
   "#50955e"
  ],
  "teal": [
   "#15463a",
   "#1b5a49",
   "#226f59",
   "#288469",
   "#2f9a7a",
   "#58b694",
   "#7cd3b0",
   "#9ff0cc"
  ],
  "cyan": [
   "#18434e",
   "#1f6473",
   "#24879a",
   "#26adc3",
   "#3cc6d9",
   "#65cfdb",
   "#8cd9e0",
   "#b1e3e7"
  ],
  "sky": [
   "#2c3f52",
   "#41586c",
   "#577288",
   "#6e8da5",
   "#86a9c2",
   "#a4c0d3",
   "#c1d7e4",
   "#e0eef5"
  ],
  "blue": [
   "#121935",
   "#1a2856",
   "#203779",
   "#24479e",
   "#2c5abf",
   "#4674ce",
   "#6a91d2",
   "#8dabd8"
  ],
  "navy": [
   "#0f1520",
   "#141c2a",
   "#1a2334",
   "#202a3f",
   "#26324a",
   "#414f6a",
   "#5e6e8c",
   "#7d8fb0"
  ],
  "purple": [
   "#3a2c55",
   "#534572",
   "#6d5f90",
   "#897aaf",
   "#a596cf",
   "#bcb0de",
   "#d4cbed",
   "#ece6fb"
  ],
  "magenta": [
   "#3a1832",
   "#59224f",
   "#7a2a6e",
   "#9c3091",
   "#bb39b3",
   "#c658c3",
   "#cc7acd",
   "#d29ad5"
  ],
  "pink": [
   "#5e2a3a",
   "#7b4152",
   "#99596b",
   "#b97185",
   "#d98ba0",
   "#e5a7b7",
   "#f1c3ce",
   "#fbe0e6"
  ],
  "sand": [
   "#6b5335",
   "#806542",
   "#957850",
   "#ab8c5e",
   "#c2a06c",
   "#d1b585",
   "#e1ca9e",
   "#f0dfb8"
  ],
  "rust": [
   "#3d1d0c",
   "#4f280f",
   "#623412",
   "#754015",
   "#894d17",
   "#a4652d",
   "#c07d41",
   "#dc9656"
  ],
  "khaki": [
   "#34431a",
   "#425422",
   "#51652a",
   "#607733",
   "#6f8a3c",
   "#8aa357",
   "#a7bc71",
   "#c4d68c"
  ],
  "steel": [
   "#2b2e31",
   "#3a3e42",
   "#494f53",
   "#596065",
   "#6a7278",
   "#868d93",
   "#a2aaae",
   "#c0c7cb"
  ],
  "iron": [
   "#141414",
   "#1d1d1d",
   "#252526",
   "#2f2f30",
   "#38383a",
   "#525254",
   "#6d6d6f",
   "#8a8a8c"
  ],
  "bone": [
   "#5f523c",
   "#7c6e55",
   "#9a8c6f",
   "#b9ab8a",
   "#d9cba6",
   "#e4d9ba",
   "#f0e6ce",
   "#fbf4e2"
  ],
  "moss": [
   "#1f2710",
   "#262f15",
   "#2e381b",
   "#364120",
   "#3e4a26",
   "#586439",
   "#73804d",
   "#8f9d62"
  ],
  "toxic": [
   "#2f5a06",
   "#41730b",
   "#538c10",
   "#66a716",
   "#7ac21c",
   "#97d34c",
   "#b3e46f",
   "#d0f58e"
  ],
  "plasma": [
   "#16649c",
   "#1384c6",
   "#0ea8f1",
   "#2bc2fb",
   "#51d5fc",
   "#7ce2f8",
   "#a4ebf6",
   "#c9f4f7"
  ],
  "arcane": [
   "#4f4840",
   "#645c52",
   "#7a7165",
   "#918678",
   "#a89c8c",
   "#bcb1a2",
   "#d1c7b8",
   "#e6ddcf"
  ],
  "ember": [
   "#3a2116",
   "#4d2d1d",
   "#613a25",
   "#75472d",
   "#8a5435",
   "#a26b47",
   "#ba8259",
   "#d39a6c"
  ]
 },
 "trailers": {
  "tanker": {
   "sockets": [
    "socket-axle-t",
    "socket-coupler",
    "socket-hitch"
   ],
   "paint": "gold",
   "trim": "iron",
   "accent": "red"
  },
  "cattle": {
   "sockets": [
    "socket-axle-t",
    "socket-coupler",
    "socket-hitch"
   ],
   "paint": "red",
   "trim": "steel",
   "accent": "gold"
  },
  "flatbed": {
   "sockets": [
    "socket-axle-t",
    "socket-coupler",
    "socket-hitch"
   ],
   "paint": "khaki",
   "trim": "steel",
   "accent": "red"
  },
  "camper": {
   "sockets": [
    "socket-axle-t",
    "socket-coupler",
    "socket-hitch"
   ],
   "paint": "bone",
   "trim": "sky",
   "accent": "orange"
  },
  "box": {
   "sockets": [
    "socket-axle-t",
    "socket-coupler",
    "socket-hitch"
   ],
   "paint": "bone",
   "trim": "red",
   "accent": "steel"
  }
 },
 "wheelbase": {
  "S": 36,
  "M": 44,
  "L": 64,
  "B": 38
 },
 "maxPitch": 10,
 "bodies": {
  "bus-hood": {
   "class": "L",
   "sockets": [
    "socket-axle-f",
    "socket-axle-r",
    "socket-belly",
    "socket-hitch",
    "socket-roof",
    "socket-hood",
    "socket-front",
    "socket-stack-l",
    "socket-stack-r"
   ],
   "defaults": {
    "front": "monster",
    "rear": "monster",
    "roof": "rack-spare",
    "hood": "blower"
   },
   "paint": "sky",
   "trim": "bone",
   "accent": "steel",
   "partScale": 1
  },
  "bus-flat": {
   "class": "L",
   "sockets": [
    "socket-axle-f",
    "socket-axle-r",
    "socket-belly",
    "socket-hitch",
    "socket-roof",
    "socket-front",
    "socket-stack-l",
    "socket-stack-r"
   ],
   "defaults": {
    "front": "monster",
    "rear": "monster",
    "roof": "rack-cargo"
   },
   "paint": "gold",
   "trim": "iron",
   "accent": "steel",
   "partScale": 1
  },
  "icecream": {
   "class": "M",
   "sockets": [
    "socket-axle-f",
    "socket-axle-r",
    "socket-belly",
    "socket-hitch",
    "socket-roof",
    "socket-front",
    "socket-stack-l",
    "socket-stack-r"
   ],
   "defaults": {
    "front": "treads",
    "rear": "treads",
    "roof": "cone"
   },
   "paint": "bone",
   "trim": "pink",
   "accent": "teal",
   "partScale": 1
  },
  "muscle": {
   "class": "M",
   "sockets": [
    "socket-axle-f",
    "socket-axle-r",
    "socket-belly",
    "socket-hitch",
    "socket-roof",
    "socket-hood",
    "socket-front",
    "socket-exhaust-l",
    "socket-exhaust-r"
   ],
   "defaults": {
    "front": "wire",
    "rear": "tractor",
    "hood": "blower-giant",
    "bumper": "longhorns"
   },
   "paint": "orange",
   "trim": "teal",
   "accent": "steel",
   "partScale": 1
  },
  "hatch": {
   "class": "S",
   "sockets": [
    "socket-axle-f",
    "socket-axle-r",
    "socket-belly",
    "socket-hitch",
    "socket-roof",
    "socket-hood",
    "socket-front"
   ],
   "defaults": {
    "front": "steel",
    "rear": "steel",
    "roof": "jerry-frame",
    "bumper": "roo-bar"
   },
   "paint": "lime",
   "trim": "orange",
   "accent": "steel",
   "partScale": 1
  },
  "pickup": {
   "class": "M",
   "sockets": [
    "socket-axle-f",
    "socket-axle-r",
    "socket-belly",
    "socket-hitch",
    "socket-front",
    "socket-roof",
    "socket-hood",
    "socket-stack-l",
    "socket-stack-r"
   ],
   "defaults": {
    "front": "monster",
    "rear": "monster",
    "roof": "light-bar",
    "bumper": "roo-bar",
    "stacks": "stack"
   },
   "paint": "red",
   "trim": "bone",
   "accent": "steel",
   "partScale": 1
  },
  "wedge": {
   "class": "M",
   "sockets": [
    "socket-axle-f",
    "socket-axle-r",
    "socket-belly",
    "socket-hitch",
    "socket-front",
    "socket-roof",
    "socket-hood",
    "socket-stack-l",
    "socket-stack-r"
   ],
   "defaults": {
    "front": "slick",
    "rear": "slick",
    "hood": "velocity-stacks"
   },
   "paint": "iron",
   "trim": "toxic",
   "accent": "steel",
   "partScale": 1
  },
  "rally": {
   "class": "S",
   "sockets": [
    "socket-axle-f",
    "socket-axle-r",
    "socket-belly",
    "socket-hitch",
    "socket-front",
    "socket-roof",
    "socket-hood"
   ],
   "defaults": {
    "front": "balloon",
    "rear": "balloon",
    "roof": "rack-spare"
   },
   "paint": "purple",
   "trim": "gold",
   "accent": "steel",
   "partScale": 1
  },
  "roadster": {
   "class": "M",
   "sockets": [
    "socket-axle-f",
    "socket-axle-r",
    "socket-belly",
    "socket-hitch",
    "socket-front",
    "socket-hood",
    "socket-roof",
    "socket-stack-l",
    "socket-stack-r"
   ],
   "defaults": {
    "front": "spiked",
    "rear": "spiked",
    "hood": "blower",
    "bumper": "spike-ram"
   },
   "paint": "khaki",
   "trim": "red",
   "accent": "steel",
   "partScale": 1
  },
  "buggy": {
   "class": "S",
   "sockets": [
    "socket-axle-f",
    "socket-axle-r",
    "socket-belly",
    "socket-hitch",
    "socket-front",
    "socket-roof",
    "socket-hood",
    "socket-stack-l",
    "socket-stack-r"
   ],
   "defaults": {
    "front": "wire",
    "rear": "tractor",
    "roof": "harpoon",
    "stacks": "zoomies"
   },
   "paint": "khaki",
   "trim": "orange",
   "accent": "steel",
   "partScale": 1
  },
  "chopper": {
   "class": "B",
   "sockets": [
    "socket-axle-f",
    "socket-axle-r",
    "socket-belly",
    "socket-hitch",
    "socket-front",
    "socket-hood",
    "socket-roof",
    "socket-stack-l",
    "socket-stack-r"
   ],
   "defaults": {
    "front": "mono-slick",
    "rear": "mono-slick",
    "stacks": "zoomies"
   },
   "paint": "sky",
   "trim": "orange",
   "accent": "steel",
   "partScale": 0.5
  },
  "dirt": {
   "class": "B",
   "sockets": [
    "socket-axle-f",
    "socket-axle-r",
    "socket-belly",
    "socket-hitch",
    "socket-front",
    "socket-hood",
    "socket-roof",
    "socket-stack-l",
    "socket-stack-r"
   ],
   "defaults": {
    "front": "mono-chained",
    "rear": "mono-chained"
   },
   "paint": "orange",
   "trim": "bone",
   "accent": "steel",
   "partScale": 0.5
  },
  "chairbike": {
   "class": "B",
   "sockets": [
    "socket-axle-f",
    "socket-axle-r",
    "socket-belly",
    "socket-hitch",
    "socket-front",
    "socket-hood",
    "socket-roof",
    "socket-stack-l",
    "socket-stack-r",
    "socket-seat"
   ],
   "defaults": {
    "front": "mono-balloon",
    "rear": "mono-slick"
   },
   "paint": "red",
   "trim": "lime",
   "accent": "orange",
   "partScale": 0.5
  },
  "scooter": {
   "class": "B",
   "sockets": [
    "socket-axle-f",
    "socket-axle-r",
    "socket-belly",
    "socket-hitch",
    "socket-front",
    "socket-hood",
    "socket-roof",
    "socket-stack-l",
    "socket-stack-r"
   ],
   "defaults": {
    "front": "mono-balloon",
    "rear": "mono-balloon",
    "roof": "jerry-frame"
   },
   "paint": "lime",
   "trim": "bone",
   "accent": "steel",
   "partScale": 0.5
  },
  "armchair": {
   "class": "S",
   "sockets": [
    "socket-axle-f",
    "socket-axle-r",
    "socket-belly",
    "socket-hitch",
    "socket-front",
    "socket-roof",
    "socket-stack-l",
    "socket-stack-r",
    "socket-seat"
   ],
   "defaults": {
    "front": "treads",
    "rear": "treads"
   },
   "paint": "lime",
   "trim": "bone",
   "accent": "orange",
   "partScale": 1
  },
  "bug": {
   "class": "S",
   "sockets": [
    "socket-axle-f",
    "socket-axle-r",
    "socket-belly",
    "socket-hitch",
    "socket-front",
    "socket-roof",
    "socket-hood"
   ],
   "defaults": {
    "front": "balloon",
    "rear": "balloon",
    "roof": "surfboard"
   },
   "paint": "sky",
   "trim": "bone",
   "accent": "steel",
   "partScale": 1
  },
  "cruiser": {
   "class": "M",
   "sockets": [
    "socket-axle-f",
    "socket-axle-r",
    "socket-belly",
    "socket-hitch",
    "socket-front",
    "socket-roof",
    "socket-hood",
    "socket-stack-l",
    "socket-stack-r"
   ],
   "defaults": {
    "front": "slick",
    "rear": "slick",
    "hood": "blower"
   },
   "paint": "red",
   "trim": "bone",
   "accent": "steel",
   "partScale": 1
  },
  "camino": {
   "class": "M",
   "sockets": [
    "socket-axle-f",
    "socket-axle-r",
    "socket-belly",
    "socket-hitch",
    "socket-front",
    "socket-roof",
    "socket-hood",
    "socket-stack-l",
    "socket-stack-r"
   ],
   "defaults": {
    "front": "wire",
    "rear": "tractor",
    "hood": "scoop"
   },
   "paint": "orange",
   "trim": "iron",
   "accent": "steel",
   "partScale": 1
  },
  "hearse": {
   "class": "L",
   "sockets": [
    "socket-axle-f",
    "socket-axle-r",
    "socket-belly",
    "socket-hitch",
    "socket-front",
    "socket-roof",
    "socket-hood",
    "socket-stack-l",
    "socket-stack-r"
   ],
   "defaults": {
    "front": "spiked",
    "rear": "spiked",
    "bumper": "cow-catcher"
   },
   "paint": "iron",
   "trim": "bone",
   "accent": "steel",
   "partScale": 1
  },
  "franken": {
   "class": "M",
   "sockets": [
    "socket-axle-f",
    "socket-axle-r",
    "socket-belly",
    "socket-hitch",
    "socket-front",
    "socket-roof",
    "socket-hood",
    "socket-stack-l",
    "socket-stack-r"
   ],
   "defaults": {
    "front": "spiked",
    "rear": "slick",
    "roof": "rack-cargo"
   },
   "paint": "lime",
   "trim": "red",
   "accent": "steel",
   "partScale": 1
  },
  "semi": {
   "class": "L",
   "sockets": [
    "socket-axle-f",
    "socket-axle-r",
    "socket-belly",
    "socket-hitch",
    "socket-front",
    "socket-roof",
    "socket-hood",
    "socket-stack-l",
    "socket-stack-r"
   ],
   "defaults": {
    "front": "monster",
    "rear": "chained",
    "stacks": "stack",
    "bumper": "roo-bar"
   },
   "paint": "red",
   "trim": "steel",
   "accent": "gold",
   "partScale": 1
  },
  "tow": {
   "class": "M",
   "sockets": [
    "socket-axle-f",
    "socket-axle-r",
    "socket-belly",
    "socket-hitch",
    "socket-front",
    "socket-roof",
    "socket-hood",
    "socket-stack-l",
    "socket-stack-r"
   ],
   "defaults": {
    "front": "monster",
    "rear": "monster",
    "bumper": "winch-bumper"
   },
   "paint": "gold",
   "trim": "iron",
   "accent": "orange",
   "partScale": 1
  },
  "rv": {
   "class": "L",
   "sockets": [
    "socket-axle-f",
    "socket-axle-r",
    "socket-belly",
    "socket-hitch",
    "socket-front",
    "socket-roof",
    "socket-hood",
    "socket-stack-l",
    "socket-stack-r"
   ],
   "defaults": {
    "front": "monster",
    "rear": "monster",
    "roof": "rack-spare"
   },
   "paint": "bone",
   "trim": "orange",
   "accent": "wood",
   "partScale": 1
  }
 },
 "wheels": {
  "monster": {
   "drop": 54,
   "radius": 22,
   "spring": 28,
   "single": false
  },
  "tractor": {
   "drop": 22,
   "radius": 21,
   "spring": 4,
   "single": false
  },
  "wire": {
   "drop": 16,
   "radius": 9,
   "spring": 4,
   "single": false
  },
  "steel": {
   "drop": 20,
   "radius": 13,
   "spring": 4,
   "single": false
  },
  "spiked": {
   "drop": 24,
   "radius": 14,
   "spring": 6,
   "single": false
  },
  "slick": {
   "drop": 26,
   "radius": 17,
   "spring": 5,
   "single": false
  },
  "balloon": {
   "drop": 32,
   "radius": 21,
   "spring": 7,
   "single": false
  },
  "chained": {
   "drop": 48,
   "radius": 20,
   "spring": 24,
   "single": false
  },
  "mono-monster": {
   "drop": 29,
   "radius": 13,
   "spring": 10,
   "single": true
  },
  "mono-tractor": {
   "drop": 29,
   "radius": 13,
   "spring": 10,
   "single": true
  },
  "mono-wire": {
   "drop": 15,
   "radius": 6,
   "spring": 4,
   "single": true
  },
  "mono-steel": {
   "drop": 19,
   "radius": 8,
   "spring": 5,
   "single": true
  },
  "mono-spiked": {
   "drop": 19,
   "radius": 8,
   "spring": 5,
   "single": true
  },
  "mono-slick": {
   "drop": 23,
   "radius": 10,
   "spring": 7,
   "single": true
  },
  "mono-balloon": {
   "drop": 29,
   "radius": 13,
   "spring": 10,
   "single": true
  },
  "mono-chained": {
   "drop": 27,
   "radius": 12,
   "spring": 9,
   "single": true
  }
 },
 "treads": {
  "S": {
   "drop": 40
  },
  "M": {
   "drop": 40
  },
  "L": {
   "drop": 40
  },
  "B": {
   "drop": 40
  }
 },
 "paints": {
  "gold": [
   "#7a5412",
   "#95691f",
   "#b07f2b",
   "#cc9638",
   "#e9ad45",
   "#efbf68",
   "#f4d186",
   "#f9e3a3"
  ],
  "orange": [
   "#4a1c08",
   "#662c0f",
   "#843c16",
   "#a44d1e",
   "#c45f26",
   "#d57b44",
   "#e5965f",
   "#f5b27a"
  ],
  "red": [
   "#5a1510",
   "#701c14",
   "#882318",
   "#9f2a1b",
   "#b8321f",
   "#cb523c",
   "#de6e56",
   "#f08a70"
  ],
  "pink": [
   "#5e2a3a",
   "#7b4152",
   "#99596b",
   "#b97185",
   "#d98ba0",
   "#e5a7b7",
   "#f1c3ce",
   "#fbe0e6"
  ],
  "purple": [
   "#3a2c55",
   "#534572",
   "#6d5f90",
   "#897aaf",
   "#a596cf",
   "#bcb0de",
   "#d4cbed",
   "#ece6fb"
  ],
  "sky": [
   "#2c3f52",
   "#41586c",
   "#577288",
   "#6e8da5",
   "#86a9c2",
   "#a4c0d3",
   "#c1d7e4",
   "#e0eef5"
  ],
  "teal": [
   "#15463a",
   "#1b5a49",
   "#226f59",
   "#288469",
   "#2f9a7a",
   "#58b694",
   "#7cd3b0",
   "#9ff0cc"
  ],
  "lime": [
   "#24503f",
   "#396c57",
   "#50896f",
   "#67a789",
   "#7fc6a4",
   "#9fd6ba",
   "#bee5d0",
   "#dcf5e6"
  ],
  "khaki": [
   "#34431a",
   "#425422",
   "#51652a",
   "#607733",
   "#6f8a3c",
   "#8aa357",
   "#a7bc71",
   "#c4d68c"
  ],
  "bone": [
   "#5f523c",
   "#7c6e55",
   "#9a8c6f",
   "#b9ab8a",
   "#d9cba6",
   "#e4d9ba",
   "#f0e6ce",
   "#fbf4e2"
  ],
  "steel": [
   "#2b2e31",
   "#3a3e42",
   "#494f53",
   "#596065",
   "#6a7278",
   "#868d93",
   "#a2aaae",
   "#c0c7cb"
  ],
  "iron": [
   "#141414",
   "#1d1d1d",
   "#252526",
   "#2f2f30",
   "#38383a",
   "#525254",
   "#6d6d6f",
   "#8a8a8c"
  ]
 },
 "parts": {
  "roof": [
   "rack-spare",
   "rack-cargo",
   "jerry-frame",
   "cone",
   "light-bar",
   "harpoon",
   "searchlights",
   "tyre-stack",
   "dish",
   "surfboard"
  ],
  "hood": [
   "blower",
   "blower-giant",
   "scoop",
   "velocity-stacks",
   "turbo"
  ],
  "stacks": [
   "stack",
   "zoomies",
   "flame-stack"
  ],
  "bumper": [
   "cow-catcher",
   "longhorns",
   "roo-bar",
   "dozer-blade",
   "spike-ram",
   "winch-bumper",
   "tusks",
   "tyre-bumper",
   "log-ram"
  ]
 }
};

const V_MOVE = 70; // voxels/s, as in clips.py

// Accelerate and brake: a spring-damper chasing the drive force's targets,
// the same springs as drop() (kit/clips.py has the identical sim).
const K_H = 90, C_H = 5, K_P = 140, C_P = 7, K_S = 200, C_S = 9, SUB = 8, FPS = 30;
function accelForce(t) {
  if (t < 0.1) return [-1.6 * Math.min(1, t / 0.06), -1 * Math.min(1, t / 0.06), 0.97, 0];
  const a = t < 0.34 ? 1 : Math.exp(-(t - 0.34) / 0.05);
  const v = V_MOVE * (1 - Math.exp(-(t - 0.1) / 0.16));
  return [-0.8 * a, 11 * a, 1 + 0.16 * a, v * (1 + 0.6 * a)];
}
function brakeForce(t) {
  const stop = 0.18, a = t < stop ? 1 : 0;
  return [-2.2 * a, -11 * a, 1 - 0.18 * a, V_MOVE * Math.max(0, 1 - t / stop) ** 1.2];
}
function simulate(force, T) {
  let h = 0, hv = 0, p = 0, pv = 0, s = 1, sv = 0;
  const dt = 1 / (FPS * SUB), out = [];
  for (let f = 0; f <= Math.round(T * FPS); f++) {
    const v = force(f / FPS)[3];
    out.push([h, p, (1 / Math.sqrt(s)) * (1 - 0.004 * hv), s, v]);
    for (let k = 0; k < SUB; k++) {
      const [th, tp, ts] = force((f * SUB + k) * dt);
      hv += (K_H * (th - h) - C_H * hv) * dt; h += hv * dt;
      pv += (K_P * (tp - p) - C_P * pv) * dt; p += pv * dt;
      sv += (K_S * (ts - s) - C_S * sv) * dt; s += sv * dt;
    }
  }
  return out;
}
const sampled = (frames) => (t) => {
  const x = Math.min(Math.max(t * FPS, 0), frames.length - 1), i = Math.min(Math.floor(x), frames.length - 2), u = x - i;
  return frames[i].map((a, k) => a + (frames[i + 1][k] - a) * u);
};

// t -> [heave, pitch°, sy, sz, ground speed]
export const MOTIONS = {
  idle: { T: 1, loop: true, f(t) {
    const fr = Math.round(t * 30);
    const shake = [0, 0.35, 0.12][fr % 3], lope = Math.floor(fr / 5) % 2 === 0 ? 0.25 : 0;
    return [shake + lope, 0.25 * (shake - 0.15), 1, 1, 0];
  } },
  move: { T: 1, loop: true, f(t) {
    let bump = 0, pitch = 0;
    for (const at of [0.1, 0.6]) { const u = t - at; if (u >= 0 && u < 0.3) bump += 1.4 * Math.sin((Math.PI * u) / 0.3) * Math.exp(-4 * u); }
    for (const [at, s] of [[0.18, 1], [0.68, -1]]) { const u = t - at; if (u >= 0 && u < 0.3) pitch += s * 1.2 * Math.sin((Math.PI * u) / 0.3); }
    return [bump, pitch, 1 - 0.02 * bump, 1, V_MOVE];
  } },
  accelerate: { T: 1.8, loop: false, next: 'move', f: sampled(simulate(accelForce, 1.8)) },
  brake: { T: 1.8, loop: false, next: 'idle', f: sampled(simulate(brakeForce, 1.8)) },
};

export class WheelsKit {
  // manifest: the kit catalogue (the packaged wheelskit.js has it built in;
  // the editor reads the build's kit.json)
  static async load(base, manifest = KIT) {
    manifest ??= await (await fetch(base + 'kit.json', { cache: 'no-store' })).json();
    return new WheelsKit(base, manifest);
  }

  constructor(base, manifest) {
    this.base = base;
    this.m = manifest;
    this.loader = new GLTFLoader();
    this.cache = new Map();
  }

  _scene(path) {
    // ?v=<build stamp> (editor builds): a rebuilt kit never comes out of the browser cache
    if (!this.cache.has(path)) this.cache.set(path, this.loader.loadAsync(`${this.base}${path}${this.m.version ? `?v=${this.m.version}` : ''}`));
    return this.cache.get(path).then((g) => g.scene.clone(true));
  }

  async build(loadout) {
    const info = this.m.bodies[loadout.body];
    const cls = info.class, wb = this.m.wheelbase[cls];
    const treads = loadout.front === 'treads' || loadout.rear === 'treads';
    const [bodyScene, ...mods] = await Promise.all([
      this._scene(`bodies/body-${loadout.body}.glb`),
      ...(treads ? [this._scene(`wheels/treads-${cls}.glb`)]
        : [this._scene(`wheels/wheels-${loadout.front}-f.glb`), this._scene(`wheels/wheels-${loadout.rear}-r.glb`)]),
    ]);
    const group = new THREE.Group();
    const bodyRoot = bodyScene.children[0];
    const bodyMesh = bodyRoot.getObjectByName('body');
    const swaps = [[info.paint, loadout.paint], [info.trim, loadout.trim], [info.accent, loadout.accent]];
    bodyMesh.traverse((o) => { if (o.isMesh) this._repaint(o, swaps); });  // bikes: body is a node over scaled meshes
    group.add(bodyRoot);
    const sock = (n) => bodyRoot.getObjectByName(n);
    const local = (n) => { const s = sock(n); return s.position.clone().applyQuaternion(s.parent.quaternion).add(s.parent.position); };

    // modules hang from the body root (not the squashing mesh), counter-rotated upright
    const dropF = treads ? this.m.treads[cls].drop : this.m.wheels[loadout.front].drop;
    const dropR = treads ? dropF : this.m.wheels[loadout.rear].drop;
    // tip toward the smaller wheels (capped); the lower axle hangs on longer struts
    const lim = Math.sin(THREE.MathUtils.degToRad(this.m.maxPitch));
    const s = Math.max(-lim, Math.min(lim, (dropF - dropR) / wb));
    const pitch = Math.asin(s);
    const h = Math.max(dropF - (wb / 2) * s, dropR + (wb / 2) * s);
    const ext = { f: h + (wb / 2) * s - dropF, r: h - (wb / 2) * s - dropR };
    const modules = [];
    const attach = (scene, socket, z, spring, extra = 0) => {
      const root = scene.children[0];
      root.position.copy(local(socket));
      root.rotation.x = -pitch;
      bodyRoot.add(root);
      const ground = root.children.filter((c) => /^(axle|track)-/.test(c.name));
      const springs = root.children.filter((c) => c.name.startsWith('spring-'));
      const wheels = [];
      root.traverse((o) => {
        if (!o.name.startsWith('wheel-')) return;
        const box = new THREE.Box3().setFromObject(o, true);
        o.updateMatrixWorld(true);
        wheels.push({ node: o, r: Math.max(1, (box.max.y - box.min.y) / 2), rest: o.quaternion.clone() });
      });
      modules.push({ root, z, spring, extra, ground: ground.map((g) => ({ node: g, y: g.position.y })), springs, wheels });
    };
    if (treads) attach(mods[0], 'socket-belly', 0, 0);
    else {
      attach(mods[0], 'socket-axle-f', -wb / 2, this.m.wheels[loadout.front].spring, ext.f);
      attach(mods[1], 'socket-axle-r', wb / 2, this.m.wheels[loadout.rear].spring, ext.r);
    }
    bodyRoot.position.set(0, h, 0);
    bodyRoot.rotation.x = pitch;

    // bolt-ons ride the body mesh, so they squash with it
    const parts = [];
    const SLOTS = { roof: 'socket-roof', hood: 'socket-hood', bumper: 'socket-front' };
    for (const [slot, socket] of Object.entries(SLOTS)) {
      if (loadout[slot] && sock(socket)) parts.push([`parts/${slot}-${loadout[slot]}.glb`, socket]);
    }
    if (loadout.stacks) for (const s of ['l', 'r']) if (sock(`socket-stack-${s}`)) parts.push([`parts/stacks-${loadout.stacks}.glb`, `socket-stack-${s}`]);
    const scenes = await Promise.all(parts.map(([p]) => this._scene(p)));
    scenes.forEach((s, i) => {
      const part = s.children[0];
      const roles = this.m.partPaint[parts[i][0].slice(6, -4)] || {};  // parts/<slot>-<name>.glb
      const swaps = Object.entries(roles).map(([role, ramp]) => [ramp, loadout[role]]);
      part.traverse((o) => { if (o.isMesh) this._repaint(o, swaps); });
      if (parts[i][1].startsWith('socket-stack-')) part.traverse((o) => { o.name = parts[i][1].slice(-1) + '-' + o.name; });  // unique names for export
      part.scale.setScalar(info.partScale || 1);  // bolt-ons on a bike shrink with it
      sock(parts[i][1]).add(part);
    });

    const v = new Vehicle(group, bodyRoot, bodyMesh, modules, h, pitch);
    // a single wheel on both axles: a motorcycle (it leans into turns rather than rolling out)
    v.isBike = !treads && !!this.m.wheels[loadout.front].single && !!this.m.wheels[loadout.rear].single;
    await this._hitchTrailers(v, loadout, sock('socket-hitch'));
    return v;
  }
}

// Trailers hitched in a line: each pivots on its own axle so its coupler
// meets the hitch in front; a riser post on the drawbar makes up the height
// difference at rest, so every trailer sits level whatever pulls it.
WheelsKit.prototype._hitchTrailers = async function (v, loadout, hitch) {
  const list = loadout.trailers || [];
  const loaded = await Promise.all(list.map((t) => Promise.all([this._scene(`bodies/trailer-${t.type}.glb`), this._scene(`wheels/wheels-${t.wheels || 'steel'}-t.glb`)])));
  v.pose(0, 0, 1, 1, 0);
  let prev = hitch;
  loaded.forEach(([ts, ms], i) => {
    const t = list[i], info = this.m.trailers[t.type];
    const root = ts.children[0];
    const body = root.getObjectByName('body');
    // a trailer's own colours, else the truck's
    this._repaint(body, [[info.paint, t.paint || loadout.paint], [info.trim, t.trim || loadout.trim], [info.accent, t.accent || loadout.accent]]);
    const at = (n) => { const s = root.getObjectByName(n); return s.position.clone().applyQuaternion(s.parent.quaternion).add(s.parent.position); };
    const mod = ms.children[0];
    mod.position.copy(at('socket-axle-t'));
    root.add(mod);
    const coupler = at('socket-coupler'), riser = root.getObjectByName('riser');
    const wheels = [];
    mod.traverse((o) => {
      if (!o.name.startsWith('wheel-')) return;
      const box = new THREE.Box3().setFromObject(o, true);
      wheels.push({ node: o, r: Math.max(1, (box.max.y - box.min.y) / 2), rest: o.quaternion.clone() });
    });
    const tag = `t${i + 1}-`;
    root.traverse((o) => { o.name = tag + o.name; });  // unique names for export
    v.group.add(root);
    const drop = this.m.wheels[t.wheels || 'steel'].drop;
    // rest: level, coupler on the hitch -> riser length and trailer position
    v.group.updateMatrixWorld(true);
    const H = v.group.worldToLocal(prev.getWorldPosition(new THREE.Vector3()));
    const s = (H.y - drop - coupler.y) / this.m.riser;
    riser.scale.y = Math.abs(s) < 0.05 ? 0.05 : s;
    const tr = { root, mod, wheels, drop, prev, c: new THREE.Vector3(0, coupler.y + this.m.riser * s, coupler.z), hitch: root.getObjectByName(tag + 'socket-hitch') };
    v.trailers.push(tr);
    v.placeTrailer(tr);
    prev = tr.hitch;
  });
};

// Recolour a body's pixel atlas: every texel of a source paint ramp shade
// becomes the same shade of the target ramp (colours are exact palette
// entries; a small tolerance absorbs PNG rounding).
WheelsKit.prototype._repaint = function (mesh, swaps) {
  swaps = swaps.filter(([from, to]) => to && to !== from && this.m.ramps[from] && this.m.paints[to]);
  if (!swaps.length) return;
  const mat = mesh.material.clone();
  const img = mat.map.image;
  const c = document.createElement('canvas');
  c.width = img.width; c.height = img.height;
  const ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, c.width, c.height);
  const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const map = [];
  for (const [from, to] of swaps) this.m.ramps[from].forEach((h, k) => map.push([rgb(h), rgb(this.m.paints[to][k])]));
  const d = data.data;
  for (let i = 0; i < d.length; i += 4) {
    for (const [a, b] of map) {
      if (Math.abs(d[i] - a[0]) + Math.abs(d[i + 1] - a[1]) + Math.abs(d[i + 2] - a[2]) <= 3) { d[i] = b[0]; d[i + 1] = b[1]; d[i + 2] = b[2]; break; }
    }
  }
  ctx.putImageData(data, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  for (const k of ['flipY', 'magFilter', 'minFilter', 'wrapS', 'wrapT', 'colorSpace', 'generateMipmaps']) tex[k] = mat.map[k];
  mat.map = tex;
  mesh.material = mat;
};

class Vehicle {
  constructor(group, bodyRoot, bodyMesh, modules, h, pitch) {
    Object.assign(this, { group, bodyRoot, bodyMesh, modules, h, pitch });
    this.trailers = [];
    this.clip = 'idle';
    this.t = 0;
    this.rolled = 0;
    this.bounce = { y: 0, v: 0, p: 0, w: 0 };
  }

  play(name) { this.clip = name; this.t = 0; }

  drop(height = 14) { this.bounce.y = height; this.bounce.v = 0; this.bounce.w = -40; }

  update(dt) {
    const mo = MOTIONS[this.clip];
    this.t += dt;
    if (this.t >= mo.T) {
      if (mo.loop) this.t %= mo.T;
      else { this.clip = mo.next; this.t = 0; }
    }
    let [o, p, sy, sz, v] = MOTIONS[this.clip].f(this.t);
    // live drop: a spring-damper on heave and pitch, gravity-stiff and lightly damped
    const b = this.bounce;
    b.v += (-90 * b.y - 5 * b.v) * dt; b.y += b.v * dt;
    b.w += (-140 * b.p - 7 * b.w) * dt; b.p += b.w * dt;
    o += b.y; p += b.p;
    sy *= 1 + Math.max(-0.12, Math.min(0.08, b.v * 0.004)); // stretch rising, squash landing
    this.rolled += v * dt;
    this.pose(o, p, sy, sz, this.rolled);
  }

  // Put every part where the motion says: body heave/pitch/squash, upright
  // modules, axles on the ground, springs stretched, wheels rolled.
  // roll: lean in degrees (+ lifts the vehicle's left side, +x).
  pose(o, p, sy, sz, rolled, roll = 0) {
    const sx = 1 / Math.sqrt(sy * sz);
    const pr = this.pitch + THREE.MathUtils.degToRad(p), rr = THREE.MathUtils.degToRad(roll);
    this.bodyRoot.position.y = this.h + o;
    this.bodyRoot.rotation.set(pr, 0, rr);
    this.bodyMesh.scale.set(sx, sy, sz);
    const upright = this.bodyRoot.quaternion.clone().invert();
    for (const m of this.modules) {
      m.root.quaternion.copy(upright);
      const rise = o - m.z * (Math.sin(pr) - Math.sin(this.pitch)) + m.extra;
      for (const g of m.ground) g.node.position.y = g.y - rise;
      if (m.spring) for (const s of m.springs) s.scale.y = Math.max(0.2, (m.spring + rise + s.position.x * Math.sin(rr)) / m.spring);
      for (const w of m.wheels) w.node.quaternion.copy(w.rest).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -rolled / w.r));
    }
    for (const t of this.trailers) {
      this.placeTrailer(t);
      for (const w of t.wheels) w.node.quaternion.copy(w.rest).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -rolled / w.r));
    }
  }

  // Pitch a trailer about its axle so its coupler sits on the hitch in front.
  placeTrailer(t) {
    this.group.updateMatrixWorld(true);
    const H = this.group.worldToLocal(t.prev.getWorldPosition(new THREE.Vector3()));
    const a = t.c.y, b = -t.c.z, k = H.y - t.drop;  // a cos(th) + b sin(th) = k
    const R = Math.hypot(a, b), phi = Math.atan2(b, a);
    const d = Math.acos(Math.max(-1, Math.min(1, k / R)));
    const th = Math.abs(phi - d) < Math.abs(phi + d) ? phi - d : phi + d;
    // straight behind the hitch, then swung about it by the trailer's yaw (racing)
    const off = new THREE.Vector3(0, t.drop - H.y, -(t.c.y * Math.sin(th) + t.c.z * Math.cos(th))).applyAxisAngle(new THREE.Vector3(0, 1, 0), t.yaw || 0);
    t.root.rotation.set(th, t.yaw || 0, 0, 'YXZ');
    t.root.position.copy(H).add(off);
    t.mod.rotation.x = -th;
  }

  // Racing: no clip; the drive force from the track (speed, forward and
  // sideways acceleration in voxels/s and voxels/s²) drives spring-dampers on
  // pitch, roll and length squash, over the road-bump heave of `move`.
  drive(dt, speed, aLong, aLat) {
    const d = this.driveState || (this.driveState = { p: 0, pv: 0, r: 0, rv: 0, s: 1, sv: 0, t: 0 });
    const clamp = (x, a) => Math.max(-a, Math.min(a, x));
    const tp = clamp(aLong * 0.03, 11), tr = this.isBike ? 0 : clamp(-aLat * 0.02, 8), ts = 1 + clamp(aLong * 0.0005, 0.14);
    for (let k = 0; k < 4; k++) {
      const h = dt / 4;
      d.pv += (K_P * (tp - d.p) - C_P * d.pv) * h; d.p += d.pv * h;
      d.rv += (K_P * (tr - d.r) - C_P * d.rv) * h; d.r += d.rv * h;
      d.sv += (K_S * (ts - d.s) - C_S * d.sv) * h; d.s += d.sv * h;
    }
    d.t = (d.t + dt * Math.min(1.6, speed / V_MOVE)) % 1;
    const [bump, bp] = MOTIONS.move.f(d.t);
    const b = this.bounce;
    b.v += (-90 * b.y - 5 * b.v) * dt; b.y += b.v * dt;
    this.rolled += speed * dt;
    this.pose(bump * Math.min(1, speed / V_MOVE) + b.y, d.p + bp, 1 / Math.sqrt(d.s), d.s, this.rolled, d.r);
  }

  // Sample every clip at `fps` into three.js AnimationClips (TRS tracks on
  // the moving nodes), then put the vehicle back at rest.
  bake(fps = 30) {
    const nodes = [this.bodyRoot, this.bodyMesh];
    for (const m of this.modules) nodes.push(m.root, ...m.ground.map((g) => g.node), ...m.springs, ...m.wheels.map((w) => w.node));
    for (const t of this.trailers) nodes.push(t.root, t.mod, ...t.wheels.map((w) => w.node));
    const clips = [];
    for (const [name, mo] of Object.entries(MOTIONS)) {
      const n = Math.round(mo.T * fps);
      const times = [], rec = nodes.map(() => ({ p: [], q: [], s: [] }));
      let rolled = 0, prev = mo.f(0)[4];
      for (let f = 0; f <= n; f++) {
        const t = f / fps;
        const [o, p, sy, sz, v] = mo.f(t);
        if (f) rolled += ((prev + v) / 2) / fps;
        prev = v;
        if (name === 'move') rolled = (V_MOVE * t);  // whole turns per loop are not exact per wheel; keep it continuous
        this.pose(o, p, sy, sz, rolled);
        times.push(t);
        nodes.forEach((nd, i) => { rec[i].p.push(...nd.position.toArray()); rec[i].q.push(...nd.quaternion.toArray()); rec[i].s.push(...nd.scale.toArray()); });
      }
      const tracks = [];
      nodes.forEach((nd, i) => {
        for (let k = 4; k < rec[i].q.length; k += 4) {  // keep quaternions sign-continuous
          const dot = rec[i].q[k] * rec[i].q[k - 4] + rec[i].q[k + 1] * rec[i].q[k - 3] + rec[i].q[k + 2] * rec[i].q[k - 2] + rec[i].q[k + 3] * rec[i].q[k - 1];
          if (dot < 0) for (let c = 0; c < 4; c++) rec[i].q[k + c] *= -1;
        }
        tracks.push(new THREE.VectorKeyframeTrack(`${nd.name}.position`, times, rec[i].p));
        tracks.push(new THREE.QuaternionKeyframeTrack(`${nd.name}.quaternion`, times, rec[i].q));
        tracks.push(new THREE.VectorKeyframeTrack(`${nd.name}.scale`, times, rec[i].s));
      });
      clips.push(new THREE.AnimationClip(name, mo.T, tracks));
    }
    this.pose(0, 0, 1, 1, 0);
    this.rolled = 0;
    return clips;
  }

  async exportGLB() {
    const clip = this.clip, t = this.t;
    const animations = this.bake();
    const glb = await new GLTFExporter().parseAsync(this.group, { binary: true, animations });
    this.clip = clip; this.t = t;
    return glb;
  }
}
