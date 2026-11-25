// trainkit.js: lay track and run trains from the Trainspotter kit in three.js.
//
//   import { TrainKit } from './trainkit.js';
//   const kit = await TrainKit.load('assets/trainspotter/');            // the pack folder (holding railway-track/, steam-locomotives/, ...)
//   const layout = await kit.layout(['track-curve-90-r192', 'track-curve-90-r192', 'track-straight-128', ...]);
//   scene.add(layout.group);
//   const train = await kit.consist([{ id: 'steam-express-green' }, { id: 'tender-express' }, { id: 'coach-classic' }]);
//   scene.add(train.group);
//   train.setTrack(layout, layout.edge(0));                             // front coupler at the start of step 0
//   train.speed = 75;                                                   // voxels per second
//   train.update(dt);                                                   // every frame
//   const fx = new TrainFx(scene); fx.attach(train);                    // steam, exhaust, sparks (trainfx.js)
//   fx.update(dt);                                                      // every frame, after train.update
//   train.go(120); train.brake();                                       // smooth speed changes
//
// Path maths live in trackpath.js (no dependencies), so a game on another
// engine can lay track and place cars with the same numbers.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { Layout, Runner, headingOf, placeConsist, rodPose, rotate } from './trackpath.js';

export * from './trackpath.js';

// The catalogue: every model's file, couplers, guides, wheels, colour roles, and every
// track piece's connectors and routes (voxels; headings in degrees, 0 = -Z).
export const KIT = {
 "contract": {
  "unit": 64,
  "lattice": 32,
  "railX": 15,
  "railTop": 8,
  "couplerY": 10,
  "floorY": 16,
  "platformTop": 24,
  "platformEdge": 25,
  "gaugeHalf": 24,
  "gaugeTop": 72,
  "moveSeconds": 3,
  "moveSpeed": 75.39822368615503
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
   "#37231b",
   "#533626",
   "#704930",
   "#8f5f39",
   "#ab7644",
   "#ba8f5d",
   "#c2a57b",
   "#ccb999"
  ],
  "darkwood": [
   "#1b100e",
   "#2d1b17",
   "#40271e",
   "#543325",
   "#67402e",
   "#774f38",
   "#875e44",
   "#956e50"
  ],
  "skin": [
   "#6c6e70",
   "#86888a",
   "#a1a3a4",
   "#bdbfc0",
   "#d9dbdc",
   "#e6e7e8",
   "#f2f3f3",
   "#ffffff"
  ],
  "skindark": [
   "#301c18",
   "#452920",
   "#5c3627",
   "#73442e",
   "#895336",
   "#9b6542",
   "#ac774f",
   "#b38a66"
  ],
  "red": [
   "#47151c",
   "#671a21",
   "#8a1e22",
   "#ae211f",
   "#ce2f25",
   "#d65243",
   "#d87867",
   "#dc9a89"
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
   "#5c2314",
   "#7e3116",
   "#a34216",
   "#ca5714",
   "#e8721a",
   "#e59141",
   "#e4ab67",
   "#e5c18a"
  ],
  "gold": [
   "#5c3d14",
   "#835a17",
   "#ad7b18",
   "#d9a116",
   "#eabd2f",
   "#e9cd5b",
   "#e9da85",
   "#ede6ab"
  ],
  "lime": [
   "#354c1a",
   "#4c6d21",
   "#679026",
   "#84b529",
   "#a0d136",
   "#b2d35b",
   "#c3d87e",
   "#d2dea0"
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
   "#132a29",
   "#1d4542",
   "#25615c",
   "#2c7e75",
   "#36998b",
   "#43b09d",
   "#5dbba8",
   "#7ac2b1"
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
   "#244e75",
   "#29669a",
   "#2d7fc1",
   "#3e97da",
   "#62ade0",
   "#89c0e4",
   "#aed3e9",
   "#d0e5f0"
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
   "#0a0b14",
   "#111325",
   "#171b36",
   "#1c2348",
   "#232d59",
   "#2c3867",
   "#364375",
   "#404f82"
  ],
  "purple": [
   "#271830",
   "#3c234d",
   "#502e6b",
   "#63378b",
   "#7342a8",
   "#845bb9",
   "#977ac2",
   "#ac99cc"
  ],
  "magenta": [
   "#2a0d14",
   "#3d131c",
   "#511924",
   "#661e2d",
   "#7c2436",
   "#9b4655",
   "#ba6876",
   "#d98a98"
  ],
  "pink": [
   "#9c3052",
   "#bc3362",
   "#d33f76",
   "#de578d",
   "#e474a4",
   "#e694ba",
   "#ebb3ce",
   "#f0d0e1"
  ],
  "sand": [
   "#634e36",
   "#826642",
   "#a17e4c",
   "#b8965f",
   "#c5ac7d",
   "#d0bf9c",
   "#dcd2ba",
   "#eae5d7"
  ],
  "rust": [
   "#341714",
   "#4a2019",
   "#612b1d",
   "#7a3621",
   "#904526",
   "#a15731",
   "#b1693c",
   "#bc7d4e"
  ],
  "khaki": [
   "#3a3f44",
   "#545a5f",
   "#6f757c",
   "#8b9399",
   "#a9b1b8",
   "#c0c7cc",
   "#d8dde1",
   "#f1f4f6"
  ],
  "steel": [
   "#282d34",
   "#3c4551",
   "#505e6f",
   "#63788d",
   "#7e92a4",
   "#9cabb7",
   "#bac4cb",
   "#d6dce0"
  ],
  "iron": [
   "#0e0f10",
   "#191b1e",
   "#24272c",
   "#2f333a",
   "#3b3f47",
   "#464b54",
   "#525861",
   "#5e646e"
  ],
  "bone": [
   "#8d7a59",
   "#a39067",
   "#b3a37b",
   "#c2b591",
   "#cfc6a8",
   "#dbd6c1",
   "#e8e5d8",
   "#f5f4ef"
  ],
  "moss": [
   "#1d2717",
   "#2d3c21",
   "#3d512b",
   "#4e6833",
   "#617d3e",
   "#738f4b",
   "#86a059",
   "#96aa6e"
  ],
  "toxic": [
   "#216d12",
   "#2e9412",
   "#3dbd10",
   "#4fe90a",
   "#6ff525",
   "#91f150",
   "#aeee79",
   "#c7ef9f"
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
   "#141518",
   "#1d1f23",
   "#27292e",
   "#313339",
   "#3b3e45",
   "#595d65",
   "#797e87",
   "#9aa0aa"
  ],
  "ember": [
   "#9c3616",
   "#c64b13",
   "#f1660e",
   "#fb8b2b",
   "#fcad51",
   "#f8c87c",
   "#f6dda4",
   "#f7edc9"
  ]
 },
 "swatches": [
  "red",
  "blood",
  "magenta",
  "orange",
  "gold",
  "bone",
  "lime",
  "leaf",
  "forest",
  "teal",
  "sky",
  "blue",
  "purple",
  "pink",
  "arcane",
  "khaki",
  "skin"
 ],
 "track": {
  "track-straight-64": {
   "file": "railway-track/track-straight-64.glb",
   "scaleClass": "tile",
   "kind": "track",
   "railTop": 8,
   "connectors": {
    "a": {
     "p": [
      0,
      0,
      0
     ],
     "yaw": 180
    },
    "b": {
     "p": [
      0,
      0,
      -64
     ],
     "yaw": 0
    }
   },
   "routes": [
    {
     "id": "main",
     "from": "a",
     "to": "b",
     "length": 64,
     "segs": [
      {
       "t": "line",
       "p0": [
        0,
        0,
        0
       ],
       "p1": [
        0,
        0,
        -64
       ]
      }
     ]
    }
   ]
  },
  "track-straight-128": {
   "file": "railway-track/track-straight-128.glb",
   "scaleClass": "tile",
   "kind": "track",
   "railTop": 8,
   "connectors": {
    "a": {
     "p": [
      0,
      0,
      0
     ],
     "yaw": 180
    },
    "b": {
     "p": [
      0,
      0,
      -128
     ],
     "yaw": 0
    }
   },
   "routes": [
    {
     "id": "main",
     "from": "a",
     "to": "b",
     "length": 128,
     "segs": [
      {
       "t": "line",
       "p0": [
        0,
        0,
        0
       ],
       "p1": [
        0,
        0,
        -128
       ]
      }
     ]
    }
   ]
  },
  "track-curve-90-r192": {
   "file": "railway-track/track-curve-90-r192.glb",
   "scaleClass": "tile",
   "kind": "track",
   "railTop": 8,
   "connectors": {
    "a": {
     "p": [
      0,
      0,
      0
     ],
     "yaw": 180
    },
    "b": {
     "p": [
      192,
      0,
      -192
     ],
     "yaw": 270
    }
   },
   "routes": [
    {
     "id": "main",
     "from": "a",
     "to": "b",
     "length": 301.592895,
     "segs": [
      {
       "t": "arc",
       "c": [
        192,
        0
       ],
       "r": 192,
       "a0": 180,
       "a1": 270,
       "y": 0
      }
     ]
    }
   ]
  },
  "track-switch-right": {
   "file": "railway-track/track-switch-right.glb",
   "scaleClass": "tile",
   "kind": "switch",
   "railTop": 8,
   "connectors": {
    "a": {
     "p": [
      0,
      0,
      0
     ],
     "yaw": 180
    },
    "b": {
     "p": [
      0,
      0,
      -256
     ],
     "yaw": 0
    },
    "c": {
     "p": [
      64,
      0,
      -256
     ],
     "yaw": 0
    }
   },
   "routes": [
    {
     "id": "through",
     "from": "a",
     "to": "b",
     "length": 256,
     "segs": [
      {
       "t": "line",
       "p0": [
        0,
        0,
        0
       ],
       "p1": [
        0,
        0,
        -256
       ]
      }
     ],
     "state": "close"
    },
    {
     "id": "diverge",
     "from": "a",
     "to": "c",
     "length": 266.536785,
     "segs": [
      {
       "t": "arc",
       "c": [
        272,
        0
       ],
       "r": 272,
       "a0": 180,
       "a1": 208.07248693585296,
       "y": 0
      },
      {
       "t": "arc",
       "c": [
        -208,
        -256
       ],
       "r": 272,
       "a0": 28.072486935852957,
       "a1": 0,
       "y": 0
      }
     ],
     "state": "open"
    }
   ],
   "hand": "right",
   "blades": "switch-blades",
   "lever": "switch-lever"
  },
  "track-switch-left": {
   "file": "railway-track/track-switch-left.glb",
   "scaleClass": "tile",
   "kind": "switch",
   "railTop": 8,
   "connectors": {
    "a": {
     "p": [
      0,
      0,
      0
     ],
     "yaw": 180
    },
    "b": {
     "p": [
      0,
      0,
      -256
     ],
     "yaw": 0
    },
    "c": {
     "p": [
      -64,
      0,
      -256
     ],
     "yaw": 0
    }
   },
   "routes": [
    {
     "id": "through",
     "from": "a",
     "to": "b",
     "length": 256,
     "segs": [
      {
       "t": "line",
       "p0": [
        0,
        0,
        0
       ],
       "p1": [
        0,
        0,
        -256
       ]
      }
     ],
     "state": "close"
    },
    {
     "id": "diverge",
     "from": "a",
     "to": "c",
     "length": 266.536785,
     "segs": [
      {
       "t": "arc",
       "c": [
        -272,
        0
       ],
       "r": 272,
       "a0": 0,
       "a1": -28.072486935852965,
       "y": 0
      },
      {
       "t": "arc",
       "c": [
        208,
        -256
       ],
       "r": 272,
       "a0": 151.92751306414704,
       "a1": 180,
       "y": 0
      }
     ],
     "state": "open"
    }
   ],
   "hand": "left",
   "blades": "switch-blades",
   "lever": "switch-lever"
  },
  "track-buffer-stop": {
   "file": "railway-track/track-buffer-stop.glb",
   "scaleClass": "tile",
   "kind": "track",
   "railTop": 8,
   "connectors": {
    "a": {
     "p": [
      0,
      0,
      0
     ],
     "yaw": 180
    }
   },
   "routes": [
    {
     "id": "main",
     "from": "a",
     "to": null,
     "length": 32,
     "segs": [
      {
       "t": "line",
       "p0": [
        0,
        0,
        0
       ],
       "p1": [
        0,
        0,
        -32
       ]
      }
     ]
    }
   ],
   "stopAt": 22
  },
  "track-straight-32": {
   "file": "railway-track/track-straight-32.glb",
   "scaleClass": "tile",
   "kind": "track",
   "railTop": 8,
   "connectors": {
    "a": {
     "p": [
      0,
      0,
      0
     ],
     "yaw": 180
    },
    "b": {
     "p": [
      0,
      0,
      -32
     ],
     "yaw": 0
    }
   },
   "routes": [
    {
     "id": "main",
     "from": "a",
     "to": "b",
     "length": 32,
     "segs": [
      {
       "t": "line",
       "p0": [
        0,
        0,
        0
       ],
       "p1": [
        0,
        0,
        -32
       ]
      }
     ]
    }
   ]
  },
  "track-straight-256": {
   "file": "railway-track/track-straight-256.glb",
   "scaleClass": "tile",
   "kind": "track",
   "railTop": 8,
   "connectors": {
    "a": {
     "p": [
      0,
      0,
      0
     ],
     "yaw": 180
    },
    "b": {
     "p": [
      0,
      0,
      -256
     ],
     "yaw": 0
    }
   },
   "routes": [
    {
     "id": "main",
     "from": "a",
     "to": "b",
     "length": 256,
     "segs": [
      {
       "t": "line",
       "p0": [
        0,
        0,
        0
       ],
       "p1": [
        0,
        0,
        -256
       ]
      }
     ]
    }
   ]
  },
  "track-curve-90-r128": {
   "file": "railway-track/track-curve-90-r128.glb",
   "scaleClass": "tile",
   "kind": "track",
   "railTop": 8,
   "connectors": {
    "a": {
     "p": [
      0,
      0,
      0
     ],
     "yaw": 180
    },
    "b": {
     "p": [
      128,
      0,
      -128
     ],
     "yaw": 270
    }
   },
   "routes": [
    {
     "id": "main",
     "from": "a",
     "to": "b",
     "length": 201.06193,
     "segs": [
      {
       "t": "arc",
       "c": [
        128,
        0
       ],
       "r": 128,
       "a0": 180,
       "a1": 270,
       "y": 0
      }
     ]
    }
   ]
  },
  "track-curve-90-r256": {
   "file": "railway-track/track-curve-90-r256.glb",
   "scaleClass": "tile",
   "kind": "track",
   "railTop": 8,
   "connectors": {
    "a": {
     "p": [
      0,
      0,
      0
     ],
     "yaw": 180
    },
    "b": {
     "p": [
      256,
      0,
      -256
     ],
     "yaw": 270
    }
   },
   "routes": [
    {
     "id": "main",
     "from": "a",
     "to": "b",
     "length": 402.12386,
     "segs": [
      {
       "t": "arc",
       "c": [
        256,
        0
       ],
       "r": 256,
       "a0": 180,
       "a1": 270,
       "y": 0
      }
     ]
    }
   ]
  },
  "track-shift-right": {
   "file": "railway-track/track-shift-right.glb",
   "scaleClass": "tile",
   "kind": "track",
   "railTop": 8,
   "connectors": {
    "a": {
     "p": [
      0,
      0,
      0
     ],
     "yaw": 180
    },
    "b": {
     "p": [
      64,
      0,
      -256
     ],
     "yaw": 0
    }
   },
   "routes": [
    {
     "id": "main",
     "from": "a",
     "to": "b",
     "length": 266.536785,
     "segs": [
      {
       "t": "arc",
       "c": [
        272,
        0
       ],
       "r": 272,
       "a0": 180,
       "a1": 208.07248693585296,
       "y": 0
      },
      {
       "t": "arc",
       "c": [
        -208,
        -256
       ],
       "r": 272,
       "a0": 28.072486935852957,
       "a1": 0,
       "y": 0
      }
     ]
    }
   ]
  },
  "track-shift-left": {
   "file": "railway-track/track-shift-left.glb",
   "scaleClass": "tile",
   "kind": "track",
   "railTop": 8,
   "connectors": {
    "a": {
     "p": [
      0,
      0,
      0
     ],
     "yaw": 180
    },
    "b": {
     "p": [
      -64,
      0,
      -256
     ],
     "yaw": 0
    }
   },
   "routes": [
    {
     "id": "main",
     "from": "a",
     "to": "b",
     "length": 266.536785,
     "segs": [
      {
       "t": "arc",
       "c": [
        -272,
        0
       ],
       "r": 272,
       "a0": 0,
       "a1": -28.072486935852965,
       "y": 0
      },
      {
       "t": "arc",
       "c": [
        208,
        -256
       ],
       "r": 272,
       "a0": 151.92751306414704,
       "a1": 180,
       "y": 0
      }
     ]
    }
   ]
  },
  "track-curve-45-right": {
   "file": "railway-track/track-curve-45-right.glb",
   "scaleClass": "tile",
   "kind": "track",
   "railTop": 8,
   "connectors": {
    "a": {
     "p": [
      0,
      0,
      0
     ],
     "yaw": 180
    },
    "b": {
     "p": [
      64,
      0,
      -192
     ],
     "yaw": 315
    }
   },
   "routes": [
    {
     "id": "main",
     "from": "a",
     "to": "b",
     "length": 209.107424,
     "segs": [
      {
       "t": "line",
       "p0": [
        0,
        0,
        0
       ],
       "p1": [
        0,
        0,
        -37.49033200812187
       ]
      },
      {
       "t": "arc",
       "c": [
        218.50966799187813,
        -37.49033200812187
       ],
       "r": 218.50966799187813,
       "a0": 180,
       "a1": 225,
       "y": 0
      }
     ]
    }
   ]
  },
  "track-curve-45-left": {
   "file": "railway-track/track-curve-45-left.glb",
   "scaleClass": "tile",
   "kind": "track",
   "railTop": 8,
   "connectors": {
    "a": {
     "p": [
      0,
      0,
      0
     ],
     "yaw": 180
    },
    "b": {
     "p": [
      -64,
      0,
      -192
     ],
     "yaw": 45
    }
   },
   "routes": [
    {
     "id": "main",
     "from": "a",
     "to": "b",
     "length": 209.107424,
     "segs": [
      {
       "t": "line",
       "p0": [
        0,
        0,
        0
       ],
       "p1": [
        0,
        0,
        -37.49033200812187
       ]
      },
      {
       "t": "arc",
       "c": [
        -218.50966799187813,
        -37.49033200812187
       ],
       "r": 218.50966799187813,
       "a0": 0,
       "a1": -45,
       "y": 0
      }
     ]
    }
   ]
  },
  "track-straight-diagonal": {
   "file": "railway-track/track-straight-diagonal.glb",
   "scaleClass": "tile",
   "kind": "track",
   "railTop": 8,
   "connectors": {
    "a": {
     "p": [
      0,
      0,
      0
     ],
     "yaw": 180
    },
    "b": {
     "p": [
      0,
      0,
      -90.509668
     ],
     "yaw": 0
    }
   },
   "routes": [
    {
     "id": "main",
     "from": "a",
     "to": "b",
     "length": 90.509668,
     "segs": [
      {
       "t": "line",
       "p0": [
        0,
        0,
        0
       ],
       "p1": [
        0,
        0,
        -90.50966799187809
       ]
      }
     ]
    }
   ],
   "diagonal": true
  },
  "track-crossing-90": {
   "file": "railway-track/track-crossing-90.glb",
   "scaleClass": "tile",
   "kind": "crossing",
   "railTop": 8,
   "connectors": {
    "a": {
     "p": [
      0,
      0,
      0
     ],
     "yaw": 180
    },
    "b": {
     "p": [
      0,
      0,
      -128
     ],
     "yaw": 0
    },
    "c": {
     "p": [
      -64,
      0,
      -64
     ],
     "yaw": 90
    },
    "d": {
     "p": [
      64,
      0,
      -64
     ],
     "yaw": 270
    }
   },
   "routes": [
    {
     "id": "main",
     "from": "a",
     "to": "b",
     "length": 128,
     "segs": [
      {
       "t": "line",
       "p0": [
        0,
        0,
        0
       ],
       "p1": [
        0,
        0,
        -128
       ]
      }
     ]
    },
    {
     "id": "cross",
     "from": "c",
     "to": "d",
     "length": 128,
     "segs": [
      {
       "t": "line",
       "p0": [
        -64,
        0,
        -64
       ],
       "p1": [
        64,
        0,
        -64
       ]
      }
     ]
    }
   ]
  },
  "track-level-crossing": {
   "file": "railway-track/track-level-crossing.glb",
   "scaleClass": "tile",
   "kind": "level-crossing",
   "railTop": 8,
   "connectors": {
    "a": {
     "p": [
      0,
      0,
      0
     ],
     "yaw": 180
    },
    "b": {
     "p": [
      0,
      0,
      -64
     ],
     "yaw": 0
    }
   },
   "routes": [
    {
     "id": "main",
     "from": "a",
     "to": "b",
     "length": 64,
     "segs": [
      {
       "t": "line",
       "p0": [
        0,
        0,
        0
       ],
       "p1": [
        0,
        0,
        -64
       ]
      }
     ]
    }
   ],
   "road": {
    "z": [
     -8,
     -56
    ],
    "halfWidth": 48,
    "top": 8
   }
  },
  "track-ramp-32": {
   "file": "railway-track/track-ramp-32.glb",
   "scaleClass": "tile",
   "kind": "ramp",
   "railTop": 8,
   "connectors": {
    "a": {
     "p": [
      0,
      0,
      0
     ],
     "yaw": 180
    },
    "b": {
     "p": [
      0,
      32,
      -256
     ],
     "yaw": 0
    }
   },
   "routes": [
    {
     "id": "main",
     "from": "a",
     "to": "b",
     "length": 258.376465,
     "segs": [
      {
       "t": "poly",
       "pts": [
        [
         0,
         0,
         0
        ],
        [
         0,
         0.359375,
         -16
        ],
        [
         0,
         1.375,
         -32
        ],
        [
         0,
         2.953125,
         -48
        ],
        [
         0,
         5,
         -64
        ],
        [
         0,
         7.421875,
         -80
        ],
        [
         0,
         10.125,
         -96
        ],
        [
         0,
         13.015625,
         -112
        ],
        [
         0,
         16,
         -128
        ],
        [
         0,
         18.984375,
         -144
        ],
        [
         0,
         21.875,
         -160
        ],
        [
         0,
         24.578125,
         -176
        ],
        [
         0,
         27,
         -192
        ],
        [
         0,
         29.046875,
         -208
        ],
        [
         0,
         30.625,
         -224
        ],
        [
         0,
         31.640625,
         -240
        ],
        [
         0,
         32,
         -256
        ]
       ]
      }
     ]
    }
   ],
   "rise": 32
  },
  "track-turntable": {
   "file": "railway-track/track-turntable.glb",
   "scaleClass": "tile",
   "kind": "turntable",
   "railTop": 8,
   "connectors": {
    "a": {
     "p": [
      0,
      0,
      0
     ],
     "yaw": 180
    },
    "b": {
     "p": [
      0,
      0,
      -192
     ],
     "yaw": 0
    },
    "c": {
     "p": [
      96,
      0,
      -96
     ],
     "yaw": 270
    },
    "d": {
     "p": [
      -96,
      0,
      -96
     ],
     "yaw": 90
    }
   },
   "routes": [
    {
     "id": "ab",
     "from": "a",
     "to": "b",
     "length": 192,
     "segs": [
      {
       "t": "line",
       "p0": [
        0,
        0,
        0
       ],
       "p1": [
        0,
        0,
        -192
       ]
      }
     ],
     "state": "close"
    },
    {
     "id": "cd",
     "from": "c",
     "to": "d",
     "length": 192,
     "segs": [
      {
       "t": "line",
       "p0": [
        96,
        0,
        -96
       ],
       "p1": [
        -96,
        0,
        -96
       ]
      }
     ],
     "state": "open"
    }
   ],
   "turntable": {
    "centre": [
     0,
     0,
     -96
    ],
    "bridge": "turntable-bridge",
    "radius": 96,
    "turn": {
     "close": 0,
     "open": 90
    }
   }
  }
 },
 "civil": {
  "bridge-girder": {
   "file": "bridges-tunnels/bridge-girder.glb",
   "scaleClass": "terrain",
   "kind": "bridge",
   "railTop": 8,
   "connectors": {
    "a": {
     "p": [
      0,
      0,
      0
     ],
     "yaw": 180
    },
    "b": {
     "p": [
      0,
      0,
      -128
     ],
     "yaw": 0
    }
   },
   "routes": [
    {
     "id": "main",
     "from": "a",
     "to": "b",
     "length": 128,
     "segs": [
      {
       "t": "line",
       "p0": [
        0,
        0,
        0
       ],
       "p1": [
        0,
        0,
        -128
       ]
      }
     ]
    }
   ],
   "span": 128,
   "depth": 48
  },
  "bridge-truss": {
   "file": "bridges-tunnels/bridge-truss.glb",
   "scaleClass": "terrain",
   "kind": "bridge",
   "railTop": 8,
   "connectors": {
    "a": {
     "p": [
      0,
      0,
      0
     ],
     "yaw": 180
    },
    "b": {
     "p": [
      0,
      0,
      -192
     ],
     "yaw": 0
    }
   },
   "routes": [
    {
     "id": "main",
     "from": "a",
     "to": "b",
     "length": 192,
     "segs": [
      {
       "t": "line",
       "p0": [
        0,
        0,
        0
       ],
       "p1": [
        0,
        0,
        -192
       ]
      }
     ]
    }
   ],
   "span": 192,
   "depth": 48,
   "clearance": 100
  },
  "bridge-viaduct-arch": {
   "file": "bridges-tunnels/bridge-viaduct-arch.glb",
   "scaleClass": "terrain",
   "kind": "bridge",
   "railTop": 8,
   "connectors": {
    "a": {
     "p": [
      0,
      0,
      0
     ],
     "yaw": 180
    },
    "b": {
     "p": [
      0,
      0,
      -128
     ],
     "yaw": 0
    }
   },
   "routes": [
    {
     "id": "main",
     "from": "a",
     "to": "b",
     "length": 128,
     "segs": [
      {
       "t": "line",
       "p0": [
        0,
        0,
        0
       ],
       "p1": [
        0,
        0,
        -128
       ]
      }
     ]
    }
   ],
   "span": 128,
   "depth": 96,
   "repeat": true
  },
  "bridge-pier": {
   "file": "bridges-tunnels/bridge-pier.glb",
   "scaleClass": "terrain",
   "kind": "pier",
   "frame": "track joint",
   "top": -12,
   "depth": 110
  },
  "tunnel-portal": {
   "file": "bridges-tunnels/tunnel-portal.glb",
   "scaleClass": "terrain",
   "kind": "portal",
   "frame": "track",
   "opening": {
    "halfWidth": 32,
    "height": 100
   },
   "bore": 64,
   "clearsGauge": [
    24,
    80
   ]
  },
  "tunnel-portal-double": {
   "file": "bridges-tunnels/tunnel-portal-double.glb",
   "scaleClass": "terrain",
   "kind": "portal",
   "frame": "track",
   "opening": {
    "halfWidth": 64,
    "height": 116
   },
   "bore": 64,
   "clearsGauge": [
    24,
    80
   ],
   "tracks": 2,
   "trackOffsets": [
    -32,
    32
   ]
  }
 },
 "stock": {
  "steam-express-green": {
   "file": "steam-locomotives/steam-express-green.glb",
   "scaleClass": "vehicle-large",
   "kind": "locomotive",
   "L": 160,
   "couplers": {
    "f": -85,
    "r": 75
   },
   "guides": [
    -57,
    57
   ],
   "bogies": [
    "bogie-f"
   ],
   "wheels": {
    "wheel-f1": 6,
    "wheel-f2": 6,
    "wheel-d1": 12,
    "wheel-d2": 12,
    "wheel-d3": 12,
    "wheel-t1": 6
   },
   "powered": true,
   "paint": "forest",
   "trim": "arcane",
   "accent": "red",
   "clips": [
    "move",
    "idle"
   ],
   "traction": "steam",
   "wheelArrangement": "4-6-2",
   "tender": "tender-express",
   "rods": [
    {
     "drivers": [
      "wheel-d1",
      "wheel-d2",
      "wheel-d3"
     ],
     "main": "wheel-d2",
     "crank": 5,
     "slideY": 20,
     "mainLen": 42,
     "tag": ""
    }
   ]
  },
  "tender-express": {
   "file": "steam-locomotives/tender-express.glb",
   "scaleClass": "vehicle-large",
   "kind": "tender",
   "L": 96,
   "couplers": {
    "f": -48,
    "r": 48
   },
   "guides": [
    -26,
    26
   ],
   "bogies": [],
   "wheels": {
    "wheel-a1": 6,
    "wheel-a2": 6,
    "wheel-a3": 6
   },
   "powered": false,
   "paint": "forest",
   "trim": "arcane",
   "accent": "red",
   "clips": [
    "move"
   ],
   "carries": "coal and water"
  },
  "steam-pioneer-0-2-2": {
   "file": "steam-locomotives/steam-pioneer-0-2-2.glb",
   "scaleClass": "vehicle-large",
   "kind": "locomotive",
   "L": 96,
   "couplers": {
    "f": -51,
    "r": 45
   },
   "guides": [
    -21,
    21
   ],
   "bogies": [],
   "wheels": {
    "wheel-d1": 18,
    "wheel-t1": 9
   },
   "powered": true,
   "paint": "gold",
   "trim": "arcane",
   "accent": "skin",
   "clips": [
    "move",
    "idle"
   ],
   "traction": "steam",
   "wheelArrangement": "0-2-2",
   "tender": "tender-pioneer"
  },
  "tender-pioneer": {
   "file": "steam-locomotives/tender-pioneer.glb",
   "scaleClass": "vehicle-large",
   "kind": "tender",
   "L": 64,
   "couplers": {
    "f": -32,
    "r": 32
   },
   "guides": [
    -14,
    14
   ],
   "bogies": [],
   "wheels": {
    "wheel-a1": 9,
    "wheel-a2": 9
   },
   "powered": false,
   "paint": "gold",
   "trim": "arcane",
   "accent": "skin",
   "clips": [
    "move"
   ],
   "carries": "coal and water"
  },
  "steam-western-4-4-0": {
   "file": "steam-locomotives/steam-western-4-4-0.glb",
   "scaleClass": "vehicle-large",
   "kind": "locomotive",
   "L": 128,
   "couplers": {
    "f": -64,
    "r": 64
   },
   "guides": [
    -34,
    34
   ],
   "bogies": [
    "bogie-f"
   ],
   "wheels": {
    "wheel-f1": 6,
    "wheel-f2": 6,
    "wheel-d1": 12,
    "wheel-d2": 12
   },
   "powered": true,
   "paint": "red",
   "trim": "forest",
   "accent": "gold",
   "clips": [
    "move",
    "idle"
   ],
   "traction": "steam",
   "wheelArrangement": "4-4-0",
   "tender": "tender-western",
   "rods": [
    {
     "drivers": [
      "wheel-d1",
      "wheel-d2"
     ],
     "main": "wheel-d1",
     "crank": 5,
     "slideY": 18,
     "mainLen": 24,
     "tag": ""
    }
   ]
  },
  "tender-western": {
   "file": "steam-locomotives/tender-western.glb",
   "scaleClass": "vehicle-large",
   "kind": "tender",
   "L": 96,
   "couplers": {
    "f": -48,
    "r": 48
   },
   "guides": [
    -24,
    24
   ],
   "bogies": [
    "bogie-f",
    "bogie-r"
   ],
   "wheels": {
    "wheel-f1": 6,
    "wheel-f2": 6,
    "wheel-r1": 6,
    "wheel-r2": 6
   },
   "powered": false,
   "paint": "red",
   "trim": "forest",
   "accent": "gold",
   "clips": [
    "move"
   ],
   "carries": "coal and water"
  },
  "steam-tank-0-6-0": {
   "file": "steam-locomotives/steam-tank-0-6-0.glb",
   "scaleClass": "vehicle-large",
   "kind": "locomotive",
   "L": 96,
   "couplers": {
    "f": -48,
    "r": 48
   },
   "guides": [
    -22,
    22
   ],
   "bogies": [],
   "wheels": {
    "wheel-d1": 9,
    "wheel-d2": 9,
    "wheel-d3": 9
   },
   "powered": true,
   "paint": "magenta",
   "trim": "arcane",
   "accent": "gold",
   "clips": [
    "move",
    "idle"
   ],
   "traction": "steam",
   "wheelArrangement": "0-6-0T",
   "carries": "coal and water",
   "rods": [
    {
     "drivers": [
      "wheel-d1",
      "wheel-d2",
      "wheel-d3"
     ],
     "main": "wheel-d2",
     "crank": 4,
     "slideY": 15,
     "mainLen": 26,
     "tag": ""
    }
   ]
  },
  "steam-streamlined-blue": {
   "file": "steam-locomotives/steam-streamlined-blue.glb",
   "scaleClass": "vehicle-large",
   "kind": "locomotive",
   "L": 160,
   "couplers": {
    "f": -85,
    "r": 75
   },
   "guides": [
    -57,
    57
   ],
   "bogies": [
    "bogie-f"
   ],
   "wheels": {
    "wheel-f1": 6,
    "wheel-f2": 6,
    "wheel-d1": 12,
    "wheel-d2": 12,
    "wheel-d3": 12,
    "wheel-t1": 6
   },
   "powered": true,
   "paint": "blue",
   "trim": "khaki",
   "accent": "red",
   "clips": [
    "move",
    "idle"
   ],
   "traction": "steam",
   "wheelArrangement": "4-6-2",
   "tender": "tender-streamlined-blue",
   "rods": [
    {
     "drivers": [
      "wheel-d1",
      "wheel-d2",
      "wheel-d3"
     ],
     "main": "wheel-d2",
     "crank": 5,
     "slideY": 14,
     "mainLen": 42,
     "tag": ""
    }
   ]
  },
  "tender-streamlined-blue": {
   "file": "steam-locomotives/tender-streamlined-blue.glb",
   "scaleClass": "vehicle-large",
   "kind": "tender",
   "L": 96,
   "couplers": {
    "f": -48,
    "r": 48
   },
   "guides": [
    -26,
    26
   ],
   "bogies": [],
   "wheels": {
    "wheel-a1": 6,
    "wheel-a2": 6,
    "wheel-a3": 6
   },
   "powered": false,
   "paint": "blue",
   "trim": "khaki",
   "accent": "red",
   "clips": [
    "move"
   ],
   "carries": "coal and water"
  },
  "steam-articulated-giant": {
   "file": "steam-locomotives/steam-articulated-giant.glb",
   "scaleClass": "vehicle-large",
   "kind": "locomotive",
   "L": 160,
   "couplers": {
    "f": -79,
    "r": 81
   },
   "guides": [
    -61,
    61
   ],
   "bogies": [],
   "wheels": {
    "wheel-l1": 6,
    "wheel-d1": 9,
    "wheel-d2": 9,
    "wheel-d3": 9,
    "wheel-d4": 9,
    "wheel-t1": 6
   },
   "powered": true,
   "paint": "arcane",
   "trim": "khaki",
   "accent": "gold",
   "clips": [
    "move",
    "idle"
   ],
   "traction": "steam",
   "wheelArrangement": "2-4-4-2",
   "articulated": true,
   "tender": "tender-articulated-giant",
   "rods": [
    {
     "drivers": [
      "wheel-d1",
      "wheel-d2"
     ],
     "main": "wheel-d2",
     "crank": 4,
     "slideY": 16,
     "mainLen": 28,
     "tag": ""
    },
    {
     "drivers": [
      "wheel-d3",
      "wheel-d4"
     ],
     "main": "wheel-d4",
     "crank": 4,
     "slideY": 16,
     "mainLen": 28,
     "tag": "b"
    }
   ]
  },
  "tender-articulated-giant": {
   "file": "steam-locomotives/tender-articulated-giant.glb",
   "scaleClass": "vehicle-large",
   "kind": "tender",
   "L": 128,
   "couplers": {
    "f": -64,
    "r": 64
   },
   "guides": [
    -36,
    36
   ],
   "bogies": [
    "bogie-f",
    "bogie-r"
   ],
   "wheels": {
    "wheel-f1": 6,
    "wheel-f2": 6,
    "wheel-r1": 6,
    "wheel-r2": 6
   },
   "powered": false,
   "paint": "arcane",
   "trim": "khaki",
   "accent": "gold",
   "clips": [
    "move"
   ],
   "carries": "coal and water"
  },
  "diesel-streamlined-cab": {
   "file": "diesel-locomotives/diesel-streamlined-cab.glb",
   "scaleClass": "vehicle-large",
   "kind": "locomotive",
   "L": 160,
   "couplers": {
    "f": -81,
    "r": 79
   },
   "guides": [
    -49,
    49
   ],
   "bogies": [
    "bogie-f",
    "bogie-r"
   ],
   "wheels": {
    "wheel-f1": 6,
    "wheel-f2": 6,
    "wheel-r1": 6,
    "wheel-r2": 6
   },
   "powered": true,
   "paint": "khaki",
   "trim": "red",
   "accent": "gold",
   "clips": [
    "move",
    "idle"
   ],
   "traction": "diesel"
  },
  "diesel-road-switcher": {
   "file": "diesel-locomotives/diesel-road-switcher.glb",
   "scaleClass": "vehicle-large",
   "kind": "locomotive",
   "L": 160,
   "couplers": {
    "f": -80,
    "r": 80
   },
   "guides": [
    -48,
    48
   ],
   "bogies": [
    "bogie-f",
    "bogie-r"
   ],
   "wheels": {
    "wheel-f1": 9,
    "wheel-f2": 9,
    "wheel-r1": 9,
    "wheel-r2": 9
   },
   "powered": true,
   "paint": "orange",
   "trim": "arcane",
   "accent": "gold",
   "clips": [
    "move",
    "idle"
   ],
   "traction": "diesel"
  },
  "diesel-express-power-car": {
   "file": "diesel-locomotives/diesel-express-power-car.glb",
   "scaleClass": "vehicle-large",
   "kind": "power-car",
   "L": 160,
   "couplers": {
    "f": -86,
    "r": 74
   },
   "guides": [
    -46,
    46
   ],
   "bogies": [
    "bogie-f",
    "bogie-r"
   ],
   "wheels": {
    "wheel-f1": 6,
    "wheel-f2": 6,
    "wheel-r1": 6,
    "wheel-r2": 6
   },
   "powered": true,
   "paint": "skin",
   "trim": "blue",
   "accent": "gold",
   "clips": [
    "move",
    "idle"
   ],
   "traction": "diesel",
   "set": "wedge"
  },
  "diesel-twin-cab": {
   "file": "diesel-locomotives/diesel-twin-cab.glb",
   "scaleClass": "vehicle-large",
   "kind": "locomotive",
   "L": 160,
   "couplers": {
    "f": -80,
    "r": 80
   },
   "guides": [
    -48,
    48
   ],
   "bogies": [
    "bogie-f",
    "bogie-r"
   ],
   "wheels": {
    "wheel-f1": 9,
    "wheel-f2": 9,
    "wheel-r1": 9,
    "wheel-r2": 9
   },
   "powered": true,
   "paint": "blue",
   "trim": "skin",
   "accent": "gold",
   "clips": [
    "move",
    "idle"
   ],
   "traction": "diesel"
  },
  "diesel-yard-shunter": {
   "file": "diesel-locomotives/diesel-yard-shunter.glb",
   "scaleClass": "vehicle-large",
   "kind": "locomotive",
   "L": 96,
   "couplers": {
    "f": -48,
    "r": 48
   },
   "guides": [
    -22,
    22
   ],
   "bogies": [],
   "wheels": {
    "wheel-a1": 9,
    "wheel-a2": 9,
    "wheel-a3": 9
   },
   "powered": true,
   "paint": "forest",
   "trim": "arcane",
   "accent": "gold",
   "clips": [
    "move",
    "idle"
   ],
   "traction": "diesel",
   "wheelArrangement": "0-6-0",
   "rods": [
    {
     "drivers": [
      "wheel-a1",
      "wheel-a2",
      "wheel-a3"
     ],
     "main": "wheel-a1",
     "crank": 4,
     "slideY": 9,
     "mainLen": 14,
     "tag": ""
    }
   ]
  },
  "diesel-rural-railcar": {
   "file": "diesel-locomotives/diesel-rural-railcar.glb",
   "scaleClass": "vehicle-large",
   "kind": "railcar",
   "L": 160,
   "couplers": {
    "f": -80,
    "r": 80
   },
   "guides": [
    -48,
    48
   ],
   "bogies": [
    "bogie-f",
    "bogie-r"
   ],
   "wheels": {
    "wheel-f1": 6,
    "wheel-f2": 6,
    "wheel-r1": 6,
    "wheel-r2": 6
   },
   "powered": true,
   "paint": "red",
   "trim": "bone",
   "accent": "gold",
   "clips": [
    "move",
    "idle",
    "open",
    "close"
   ],
   "traction": "diesel",
   "floorY": 16,
   "doors": 4
  },
  "electric-streamlined-deco": {
   "file": "electric-locomotives/electric-streamlined-deco.glb",
   "scaleClass": "vehicle-large",
   "kind": "locomotive",
   "L": 160,
   "couplers": {
    "f": -80,
    "r": 80
   },
   "guides": [
    -48,
    48
   ],
   "bogies": [
    "bogie-f",
    "bogie-r"
   ],
   "wheels": {
    "wheel-f1": 9,
    "wheel-f2": 9,
    "wheel-r1": 9,
    "wheel-r2": 9
   },
   "powered": true,
   "paint": "magenta",
   "trim": "gold",
   "accent": "arcane",
   "clips": [
    "move",
    "open",
    "close"
   ],
   "traction": "electric",
   "pantoRaise": 15.5
  },
  "electric-articulated-freight": {
   "file": "electric-locomotives/electric-articulated-freight.glb",
   "scaleClass": "vehicle-large",
   "kind": "locomotive",
   "L": 160,
   "couplers": {
    "f": -80,
    "r": 80
   },
   "guides": [
    -58,
    58
   ],
   "bogies": [],
   "wheels": {
    "wheel-a1": 9,
    "wheel-a2": 9,
    "wheel-a3": 9,
    "wheel-a4": 9
   },
   "powered": true,
   "paint": "forest",
   "trim": "arcane",
   "accent": "red",
   "clips": [
    "move",
    "open",
    "close"
   ],
   "traction": "electric",
   "articulated": true,
   "pantoRaise": 15.5,
   "rods": [
    {
     "drivers": [
      "wheel-a1",
      "wheel-a2"
     ],
     "main": "wheel-a2",
     "crank": 4,
     "slideY": 9,
     "mainLen": 14,
     "tag": ""
    },
    {
     "drivers": [
      "wheel-a3",
      "wheel-a4"
     ],
     "main": "wheel-a3",
     "crank": 4,
     "slideY": 9,
     "mainLen": 14,
     "tag": "-b"
    }
   ]
  },
  "electric-boxcab": {
   "file": "electric-locomotives/electric-boxcab.glb",
   "scaleClass": "vehicle-large",
   "kind": "locomotive",
   "L": 128,
   "couplers": {
    "f": -64,
    "r": 64
   },
   "guides": [
    -38,
    38
   ],
   "bogies": [
    "bogie-f",
    "bogie-r"
   ],
   "wheels": {
    "wheel-f1": 9,
    "wheel-f2": 9,
    "wheel-r1": 9,
    "wheel-r2": 9
   },
   "powered": true,
   "paint": "arcane",
   "trim": "gold",
   "accent": "red",
   "clips": [
    "move",
    "open",
    "close"
   ],
   "traction": "electric",
   "pantoRaise": 15.5
  },
  "electric-modern": {
   "file": "electric-locomotives/electric-modern.glb",
   "scaleClass": "vehicle-large",
   "kind": "locomotive",
   "L": 160,
   "couplers": {
    "f": -80,
    "r": 80
   },
   "guides": [
    -44,
    44
   ],
   "bogies": [
    "bogie-f",
    "bogie-r"
   ],
   "wheels": {
    "wheel-f1": 9,
    "wheel-f2": 9,
    "wheel-r1": 9,
    "wheel-r2": 9
   },
   "powered": true,
   "paint": "red",
   "trim": "skin",
   "accent": "khaki",
   "clips": [
    "move",
    "open",
    "close"
   ],
   "traction": "electric",
   "pantoRaise": 15.5
  },
  "electric-express-blue": {
   "file": "electric-locomotives/electric-express-blue.glb",
   "scaleClass": "vehicle-large",
   "kind": "locomotive",
   "L": 160,
   "couplers": {
    "f": -80,
    "r": 80
   },
   "guides": [
    -44,
    44
   ],
   "bogies": [
    "bogie-f",
    "bogie-r"
   ],
   "wheels": {
    "wheel-f1": 9,
    "wheel-f2": 9,
    "wheel-r1": 9,
    "wheel-r2": 9
   },
   "powered": true,
   "paint": "blue",
   "trim": "khaki",
   "accent": "skin",
   "clips": [
    "move",
    "open",
    "close"
   ],
   "traction": "electric",
   "pantoRaise": 15.5
  },
  "highspeed-bullet-power-car": {
   "file": "high-speed-trains/highspeed-bullet-power-car.glb",
   "scaleClass": "vehicle-large",
   "kind": "power-car",
   "L": 160,
   "couplers": {
    "f": -90,
    "r": 70
   },
   "guides": [
    -46,
    46
   ],
   "bogies": [
    "bogie-f",
    "bogie-r"
   ],
   "wheels": {
    "wheel-f1": 6,
    "wheel-f2": 6,
    "wheel-r1": 6,
    "wheel-r2": 6
   },
   "powered": true,
   "paint": "skin",
   "trim": "blue",
   "accent": "sky",
   "clips": [
    "move"
   ],
   "traction": "electric",
   "set": "bullet",
   "floorY": 16
  },
  "highspeed-bullet-car": {
   "file": "high-speed-trains/highspeed-bullet-car.glb",
   "scaleClass": "vehicle-large",
   "kind": "coach",
   "L": 160,
   "couplers": {
    "f": -80,
    "r": 80
   },
   "guides": [
    -52,
    52
   ],
   "bogies": [
    "bogie-f",
    "bogie-r"
   ],
   "wheels": {
    "wheel-f1": 6,
    "wheel-f2": 6,
    "wheel-r1": 6,
    "wheel-r2": 6
   },
   "powered": false,
   "paint": "skin",
   "trim": "blue",
   "accent": "sky",
   "clips": [
    "move"
   ],
   "set": "bullet",
   "floorY": 16
  },
  "highspeed-longnose-power-car": {
   "file": "high-speed-trains/highspeed-longnose-power-car.glb",
   "scaleClass": "vehicle-large",
   "kind": "power-car",
   "L": 160,
   "couplers": {
    "f": -91,
    "r": 69
   },
   "guides": [
    -45,
    45
   ],
   "bogies": [
    "bogie-f",
    "bogie-r"
   ],
   "wheels": {
    "wheel-f1": 6,
    "wheel-f2": 6,
    "wheel-r1": 6,
    "wheel-r2": 6
   },
   "powered": true,
   "paint": "skin",
   "trim": "red",
   "accent": "khaki",
   "clips": [
    "move",
    "open",
    "close"
   ],
   "traction": "electric",
   "set": "long-nose",
   "floorY": 16
  },
  "highspeed-longnose-car": {
   "file": "high-speed-trains/highspeed-longnose-car.glb",
   "scaleClass": "vehicle-large",
   "kind": "coach",
   "L": 160,
   "couplers": {
    "f": -80,
    "r": 80
   },
   "guides": [
    -52,
    52
   ],
   "bogies": [
    "bogie-f",
    "bogie-r"
   ],
   "wheels": {
    "wheel-f1": 6,
    "wheel-f2": 6,
    "wheel-r1": 6,
    "wheel-r2": 6
   },
   "powered": false,
   "paint": "skin",
   "trim": "red",
   "accent": "khaki",
   "clips": [
    "move"
   ],
   "set": "long-nose",
   "floorY": 16
  },
  "highspeed-wedge-power-car": {
   "file": "high-speed-trains/highspeed-wedge-power-car.glb",
   "scaleClass": "vehicle-large",
   "kind": "power-car",
   "L": 160,
   "couplers": {
    "f": -90,
    "r": 70
   },
   "guides": [
    -46,
    46
   ],
   "bogies": [
    "bogie-f",
    "bogie-r"
   ],
   "wheels": {
    "wheel-f1": 6,
    "wheel-f2": 6,
    "wheel-r1": 6,
    "wheel-r2": 6
   },
   "powered": true,
   "paint": "skin",
   "trim": "orange",
   "accent": "arcane",
   "clips": [
    "move",
    "open",
    "close"
   ],
   "traction": "electric",
   "set": "wedge",
   "floorY": 16
  },
  "highspeed-wedge-car": {
   "file": "high-speed-trains/highspeed-wedge-car.glb",
   "scaleClass": "vehicle-large",
   "kind": "coach",
   "L": 160,
   "couplers": {
    "f": -80,
    "r": 80
   },
   "guides": [
    -52,
    52
   ],
   "bogies": [
    "bogie-f",
    "bogie-r"
   ],
   "wheels": {
    "wheel-f1": 6,
    "wheel-f2": 6,
    "wheel-r1": 6,
    "wheel-r2": 6
   },
   "powered": false,
   "paint": "skin",
   "trim": "orange",
   "accent": "arcane",
   "clips": [
    "move"
   ],
   "set": "wedge",
   "floorY": 16
  },
  "highspeed-double-deck-power-car": {
   "file": "high-speed-trains/highspeed-double-deck-power-car.glb",
   "scaleClass": "vehicle-large",
   "kind": "power-car",
   "L": 160,
   "couplers": {
    "f": -93,
    "r": 67
   },
   "guides": [
    -43,
    43
   ],
   "bogies": [
    "bogie-f",
    "bogie-r"
   ],
   "wheels": {
    "wheel-f1": 6,
    "wheel-f2": 6,
    "wheel-r1": 6,
    "wheel-r2": 6
   },
   "powered": true,
   "paint": "skin",
   "trim": "blue",
   "accent": "gold",
   "clips": [
    "move",
    "open",
    "close"
   ],
   "traction": "electric",
   "set": "double-deck",
   "floorY": 16,
   "decks": 2,
   "liveries": {
    "yellow-line": {
     "paint": "skin",
     "trim": "blue",
     "accent": "gold"
    },
    "pink-line": {
     "paint": "skin",
     "trim": "blue",
     "accent": "pink"
    }
   }
  },
  "highspeed-double-deck-car": {
   "file": "high-speed-trains/highspeed-double-deck-car.glb",
   "scaleClass": "vehicle-large",
   "kind": "coach",
   "L": 160,
   "couplers": {
    "f": -80,
    "r": 80
   },
   "guides": [
    -52,
    52
   ],
   "bogies": [
    "bogie-f",
    "bogie-r"
   ],
   "wheels": {
    "wheel-f1": 6,
    "wheel-f2": 6,
    "wheel-r1": 6,
    "wheel-r2": 6
   },
   "powered": false,
   "paint": "skin",
   "trim": "blue",
   "accent": "gold",
   "clips": [
    "move"
   ],
   "set": "double-deck",
   "floorY": 16,
   "decks": 2,
   "liveries": {
    "yellow-line": {
     "paint": "skin",
     "trim": "blue",
     "accent": "gold"
    },
    "pink-line": {
     "paint": "skin",
     "trim": "blue",
     "accent": "pink"
    }
   }
  },
  "tram-heritage": {
   "file": "trams-metro/tram-heritage.glb",
   "scaleClass": "vehicle-large",
   "kind": "tram",
   "L": 96,
   "couplers": {
    "f": -48,
    "r": 48
   },
   "guides": [
    -14,
    14
   ],
   "bogies": [],
   "wheels": {
    "wheel-a1": 6,
    "wheel-a2": 6
   },
   "powered": true,
   "paint": "red",
   "trim": "bone",
   "accent": "gold",
   "clips": [
    "move",
    "open",
    "close"
   ],
   "traction": "electric",
   "floorY": 16,
   "doors": 0,
   "bidirectional": true
  },
  "tram-modern": {
   "file": "trams-metro/tram-modern.glb",
   "scaleClass": "vehicle-large",
   "kind": "tram",
   "L": 160,
   "couplers": {
    "f": -80,
    "r": 80
   },
   "guides": [
    -50,
    50
   ],
   "bogies": [
    "bogie-f",
    "bogie-r"
   ],
   "wheels": {
    "wheel-f1": 6,
    "wheel-f2": 6,
    "wheel-r1": 6,
    "wheel-r2": 6
   },
   "powered": true,
   "paint": "skin",
   "trim": "lime",
   "accent": "arcane",
   "clips": [
    "move",
    "open",
    "close"
   ],
   "traction": "electric",
   "floorY": 16,
   "doors": 4,
   "bidirectional": true
  },
  "cable-car-hill": {
   "file": "trams-metro/cable-car-hill.glb",
   "scaleClass": "vehicle-large",
   "kind": "cable-car",
   "L": 96,
   "couplers": {
    "f": -48,
    "r": 48
   },
   "guides": [
    -18,
    18
   ],
   "bogies": [],
   "wheels": {
    "wheel-a1": 6,
    "wheel-a2": 6
   },
   "powered": true,
   "paint": "red",
   "trim": "bone",
   "accent": "gold",
   "clips": [
    "move"
   ],
   "traction": "cable",
   "floorY": 16,
   "doors": 0,
   "bidirectional": true
  },
  "metro-cab-car": {
   "file": "trams-metro/metro-cab-car.glb",
   "scaleClass": "vehicle-large",
   "kind": "metro",
   "L": 160,
   "couplers": {
    "f": -80,
    "r": 80
   },
   "guides": [
    -52,
    52
   ],
   "bogies": [
    "bogie-f",
    "bogie-r"
   ],
   "wheels": {
    "wheel-f1": 6,
    "wheel-f2": 6,
    "wheel-r1": 6,
    "wheel-r2": 6
   },
   "powered": true,
   "paint": "khaki",
   "trim": "blue",
   "accent": "red",
   "clips": [
    "move",
    "open",
    "close"
   ],
   "traction": "third-rail",
   "floorY": 16,
   "doors": 8,
   "set": "metro"
  },
  "metro-middle-car": {
   "file": "trams-metro/metro-middle-car.glb",
   "scaleClass": "vehicle-large",
   "kind": "metro",
   "L": 160,
   "couplers": {
    "f": -80,
    "r": 80
   },
   "guides": [
    -52,
    52
   ],
   "bogies": [
    "bogie-f",
    "bogie-r"
   ],
   "wheels": {
    "wheel-f1": 6,
    "wheel-f2": 6,
    "wheel-r1": 6,
    "wheel-r2": 6
   },
   "powered": true,
   "paint": "khaki",
   "trim": "blue",
   "accent": "red",
   "clips": [
    "move",
    "open",
    "close"
   ],
   "traction": "third-rail",
   "floorY": 16,
   "doors": 8,
   "set": "metro"
  },
  "commuter-double-deck-cab-car": {
   "file": "trams-metro/commuter-double-deck-cab-car.glb",
   "scaleClass": "vehicle-large",
   "kind": "commuter",
   "L": 160,
   "couplers": {
    "f": -82,
    "r": 78
   },
   "guides": [
    -50,
    50
   ],
   "bogies": [
    "bogie-f",
    "bogie-r"
   ],
   "wheels": {
    "wheel-f1": 6,
    "wheel-f2": 6,
    "wheel-r1": 6,
    "wheel-r2": 6
   },
   "powered": false,
   "paint": "skin",
   "trim": "teal",
   "accent": "arcane",
   "clips": [
    "move",
    "open",
    "close"
   ],
   "traction": "push-pull",
   "floorY": 16,
   "doors": 4,
   "decks": 2
  },
  "commuter-stainless-cab-car": {
   "file": "trams-metro/commuter-stainless-cab-car.glb",
   "scaleClass": "vehicle-large",
   "kind": "commuter",
   "L": 160,
   "couplers": {
    "f": -80,
    "r": 80
   },
   "guides": [
    -52,
    52
   ],
   "bogies": [
    "bogie-f",
    "bogie-r"
   ],
   "wheels": {
    "wheel-f1": 6,
    "wheel-f2": 6,
    "wheel-r1": 6,
    "wheel-r2": 6
   },
   "powered": true,
   "paint": "leaf",
   "trim": "arcane",
   "accent": "khaki",
   "clips": [
    "move",
    "open",
    "close"
   ],
   "floorY": 16,
   "doors": 8,
   "traction": "electric",
   "set": "commuter-stainless",
   "liveries": {
    "green-band": {
     "paint": "leaf",
     "trim": "arcane",
     "accent": "khaki"
    },
    "orange-band": {
     "paint": "orange",
     "trim": "arcane",
     "accent": "khaki"
    },
    "sky-band": {
     "paint": "sky",
     "trim": "arcane",
     "accent": "khaki"
    },
    "yellow-band": {
     "paint": "gold",
     "trim": "arcane",
     "accent": "khaki"
    },
    "blue-band": {
     "paint": "blue",
     "trim": "arcane",
     "accent": "khaki"
    },
    "pink-band": {
     "paint": "pink",
     "trim": "arcane",
     "accent": "khaki"
    }
   },
   "pantoRaise": 15.5
  },
  "commuter-stainless-middle-car": {
   "file": "trams-metro/commuter-stainless-middle-car.glb",
   "scaleClass": "vehicle-large",
   "kind": "commuter",
   "L": 160,
   "couplers": {
    "f": -80,
    "r": 80
   },
   "guides": [
    -52,
    52
   ],
   "bogies": [
    "bogie-f",
    "bogie-r"
   ],
   "wheels": {
    "wheel-f1": 6,
    "wheel-f2": 6,
    "wheel-r1": 6,
    "wheel-r2": 6
   },
   "powered": true,
   "paint": "leaf",
   "trim": "arcane",
   "accent": "khaki",
   "clips": [
    "move",
    "open",
    "close"
   ],
   "floorY": 16,
   "doors": 8,
   "traction": "electric",
   "set": "commuter-stainless",
   "liveries": {
    "green-band": {
     "paint": "leaf",
     "trim": "arcane",
     "accent": "khaki"
    },
    "orange-band": {
     "paint": "orange",
     "trim": "arcane",
     "accent": "khaki"
    },
    "sky-band": {
     "paint": "sky",
     "trim": "arcane",
     "accent": "khaki"
    },
    "yellow-band": {
     "paint": "gold",
     "trim": "arcane",
     "accent": "khaki"
    },
    "blue-band": {
     "paint": "blue",
     "trim": "arcane",
     "accent": "khaki"
    },
    "pink-band": {
     "paint": "pink",
     "trim": "arcane",
     "accent": "khaki"
    }
   }
  },
  "commuter-painted-cab-car": {
   "file": "trams-metro/commuter-painted-cab-car.glb",
   "scaleClass": "vehicle-large",
   "kind": "commuter",
   "L": 160,
   "couplers": {
    "f": -80,
    "r": 80
   },
   "guides": [
    -52,
    52
   ],
   "bogies": [
    "bogie-f",
    "bogie-r"
   ],
   "wheels": {
    "wheel-f1": 6,
    "wheel-f2": 6,
    "wheel-r1": 6,
    "wheel-r2": 6
   },
   "powered": true,
   "paint": "orange",
   "trim": "arcane",
   "accent": "khaki",
   "clips": [
    "move",
    "open",
    "close"
   ],
   "floorY": 16,
   "doors": 8,
   "traction": "electric",
   "set": "commuter-painted",
   "liveries": {
    "orange": {
     "paint": "orange",
     "trim": "arcane",
     "accent": "khaki"
    },
    "green": {
     "paint": "lime",
     "trim": "arcane",
     "accent": "khaki"
    },
    "sky": {
     "paint": "sky",
     "trim": "arcane",
     "accent": "khaki"
    },
    "yellow": {
     "paint": "gold",
     "trim": "arcane",
     "accent": "khaki"
    },
    "blue": {
     "paint": "blue",
     "trim": "arcane",
     "accent": "khaki"
    }
   },
   "pantoRaise": 15.5
  },
  "commuter-painted-middle-car": {
   "file": "trams-metro/commuter-painted-middle-car.glb",
   "scaleClass": "vehicle-large",
   "kind": "commuter",
   "L": 160,
   "couplers": {
    "f": -80,
    "r": 80
   },
   "guides": [
    -52,
    52
   ],
   "bogies": [
    "bogie-f",
    "bogie-r"
   ],
   "wheels": {
    "wheel-f1": 6,
    "wheel-f2": 6,
    "wheel-r1": 6,
    "wheel-r2": 6
   },
   "powered": true,
   "paint": "orange",
   "trim": "arcane",
   "accent": "khaki",
   "clips": [
    "move",
    "open",
    "close"
   ],
   "floorY": 16,
   "doors": 8,
   "traction": "electric",
   "set": "commuter-painted",
   "liveries": {
    "orange": {
     "paint": "orange",
     "trim": "arcane",
     "accent": "khaki"
    },
    "green": {
     "paint": "lime",
     "trim": "arcane",
     "accent": "khaki"
    },
    "sky": {
     "paint": "sky",
     "trim": "arcane",
     "accent": "khaki"
    },
    "yellow": {
     "paint": "gold",
     "trim": "arcane",
     "accent": "khaki"
    },
    "blue": {
     "paint": "blue",
     "trim": "arcane",
     "accent": "khaki"
    }
   }
  },
  "metro-rounded-cab-car": {
   "file": "trams-metro/metro-rounded-cab-car.glb",
   "scaleClass": "vehicle-large",
   "kind": "metro",
   "L": 160,
   "couplers": {
    "f": -80,
    "r": 80
   },
   "guides": [
    -52,
    52
   ],
   "bogies": [
    "bogie-f",
    "bogie-r"
   ],
   "wheels": {
    "wheel-f1": 6,
    "wheel-f2": 6,
    "wheel-r1": 6,
    "wheel-r2": 6
   },
   "powered": true,
   "paint": "red",
   "trim": "skin",
   "accent": "khaki",
   "clips": [
    "move",
    "open",
    "close"
   ],
   "floorY": 16,
   "doors": 8,
   "traction": "third-rail",
   "set": "metro-rounded",
   "liveries": {
    "red": {
     "paint": "red",
     "trim": "skin",
     "accent": "khaki"
    },
    "silver-green": {
     "paint": "khaki",
     "trim": "leaf",
     "accent": "skin"
    },
    "blue": {
     "paint": "blue",
     "trim": "skin",
     "accent": "khaki"
    }
   }
  },
  "metro-rounded-middle-car": {
   "file": "trams-metro/metro-rounded-middle-car.glb",
   "scaleClass": "vehicle-large",
   "kind": "metro",
   "L": 160,
   "couplers": {
    "f": -80,
    "r": 80
   },
   "guides": [
    -52,
    52
   ],
   "bogies": [
    "bogie-f",
    "bogie-r"
   ],
   "wheels": {
    "wheel-f1": 6,
    "wheel-f2": 6,
    "wheel-r1": 6,
    "wheel-r2": 6
   },
   "powered": true,
   "paint": "red",
   "trim": "skin",
   "accent": "khaki",
   "clips": [
    "move",
    "open",
    "close"
   ],
   "floorY": 16,
   "doors": 8,
   "traction": "third-rail",
   "set": "metro-rounded",
   "liveries": {
    "red": {
     "paint": "red",
     "trim": "skin",
     "accent": "khaki"
    },
    "silver-green": {
     "paint": "khaki",
     "trim": "leaf",
     "accent": "skin"
    },
    "blue": {
     "paint": "blue",
     "trim": "skin",
     "accent": "khaki"
    }
   }
  },
  "metro-retro-cab-car": {
   "file": "trams-metro/metro-retro-cab-car.glb",
   "scaleClass": "vehicle-large",
   "kind": "metro",
   "L": 160,
   "couplers": {
    "f": -80,
    "r": 80
   },
   "guides": [
    -52,
    52
   ],
   "bogies": [
    "bogie-f",
    "bogie-r"
   ],
   "wheels": {
    "wheel-f1": 6,
    "wheel-f2": 6,
    "wheel-r1": 6,
    "wheel-r2": 6
   },
   "powered": true,
   "paint": "gold",
   "trim": "arcane",
   "accent": "khaki",
   "clips": [
    "move",
    "open",
    "close"
   ],
   "floorY": 16,
   "doors": 8,
   "traction": "third-rail",
   "set": "metro-retro",
   "liveries": {
    "yellow": {
     "paint": "gold",
     "trim": "arcane",
     "accent": "khaki"
    },
    "orange": {
     "paint": "orange",
     "trim": "arcane",
     "accent": "khaki"
    }
   }
  },
  "coach-classic": {
   "file": "passenger-carriages/coach-classic.glb",
   "scaleClass": "vehicle-large",
   "kind": "coach",
   "L": 160,
   "couplers": {
    "f": -80,
    "r": 80
   },
   "guides": [
    -52,
    52
   ],
   "bogies": [
    "bogie-f",
    "bogie-r"
   ],
   "wheels": {
    "wheel-f1": 6,
    "wheel-f2": 6,
    "wheel-r1": 6,
    "wheel-r2": 6
   },
   "powered": false,
   "paint": "blood",
   "trim": "bone",
   "accent": "gold",
   "clips": [
    "move"
   ],
   "floorY": 16,
   "doors": 4
  },
  "coach-intercity": {
   "file": "passenger-carriages/coach-intercity.glb",
   "scaleClass": "vehicle-large",
   "kind": "coach",
   "L": 160,
   "couplers": {
    "f": -80,
    "r": 80
   },
   "guides": [
    -52,
    52
   ],
   "bogies": [
    "bogie-f",
    "bogie-r"
   ],
   "wheels": {
    "wheel-f1": 6,
    "wheel-f2": 6,
    "wheel-r1": 6,
    "wheel-r2": 6
   },
   "powered": false,
   "paint": "skin",
   "trim": "red",
   "accent": "blue",
   "clips": [
    "move"
   ],
   "floorY": 16,
   "doors": 4
  },
  "coach-sleeper": {
   "file": "passenger-carriages/coach-sleeper.glb",
   "scaleClass": "vehicle-large",
   "kind": "coach",
   "L": 160,
   "couplers": {
    "f": -80,
    "r": 80
   },
   "guides": [
    -52,
    52
   ],
   "bogies": [
    "bogie-f",
    "bogie-r"
   ],
   "wheels": {
    "wheel-f1": 6,
    "wheel-f2": 6,
    "wheel-r1": 6,
    "wheel-r2": 6
   },
   "powered": false,
   "paint": "blue",
   "trim": "gold",
   "accent": "bone",
   "clips": [
    "move"
   ],
   "floorY": 16,
   "doors": 4,
   "service": "sleeping"
  },
  "coach-dining": {
   "file": "passenger-carriages/coach-dining.glb",
   "scaleClass": "vehicle-large",
   "kind": "coach",
   "L": 160,
   "couplers": {
    "f": -80,
    "r": 80
   },
   "guides": [
    -52,
    52
   ],
   "bogies": [
    "bogie-f",
    "bogie-r"
   ],
   "wheels": {
    "wheel-f1": 6,
    "wheel-f2": 6,
    "wheel-r1": 6,
    "wheel-r2": 6
   },
   "powered": false,
   "paint": "magenta",
   "trim": "gold",
   "accent": "bone",
   "clips": [
    "move"
   ],
   "floorY": 16,
   "doors": 4,
   "service": "dining"
  },
  "coach-observation": {
   "file": "passenger-carriages/coach-observation.glb",
   "scaleClass": "vehicle-large",
   "kind": "coach",
   "L": 160,
   "couplers": {
    "f": -80,
    "r": 80
   },
   "guides": [
    -52,
    52
   ],
   "bogies": [
    "bogie-f",
    "bogie-r"
   ],
   "wheels": {
    "wheel-f1": 6,
    "wheel-f2": 6,
    "wheel-r1": 6,
    "wheel-r2": 6
   },
   "powered": false,
   "paint": "forest",
   "trim": "gold",
   "accent": "red",
   "clips": [
    "move"
   ],
   "floorY": 16,
   "doors": 2,
   "service": "observation",
   "endOfTrain": true
  },
  "coach-dome": {
   "file": "passenger-carriages/coach-dome.glb",
   "scaleClass": "vehicle-large",
   "kind": "coach",
   "L": 160,
   "couplers": {
    "f": -80,
    "r": 80
   },
   "guides": [
    -52,
    52
   ],
   "bogies": [
    "bogie-f",
    "bogie-r"
   ],
   "wheels": {
    "wheel-f1": 6,
    "wheel-f2": 6,
    "wheel-r1": 6,
    "wheel-r2": 6
   },
   "powered": false,
   "paint": "khaki",
   "trim": "red",
   "accent": "sky",
   "clips": [
    "move"
   ],
   "floorY": 16,
   "doors": 4,
   "service": "dome"
  },
  "coach-baggage-mail": {
   "file": "passenger-carriages/coach-baggage-mail.glb",
   "scaleClass": "vehicle-large",
   "kind": "coach",
   "L": 160,
   "couplers": {
    "f": -80,
    "r": 80
   },
   "guides": [
    -52,
    52
   ],
   "bogies": [
    "bogie-f",
    "bogie-r"
   ],
   "wheels": {
    "wheel-f1": 6,
    "wheel-f2": 6,
    "wheel-r1": 6,
    "wheel-r2": 6
   },
   "powered": false,
   "paint": "blood",
   "trim": "bone",
   "accent": "gold",
   "clips": [
    "move"
   ],
   "floorY": 16,
   "doors": 4,
   "service": "baggage and mail"
  },
  "coach-double-deck": {
   "file": "passenger-carriages/coach-double-deck.glb",
   "scaleClass": "vehicle-large",
   "kind": "coach",
   "L": 160,
   "couplers": {
    "f": -80,
    "r": 80
   },
   "guides": [
    -52,
    52
   ],
   "bogies": [
    "bogie-f",
    "bogie-r"
   ],
   "wheels": {
    "wheel-f1": 6,
    "wheel-f2": 6,
    "wheel-r1": 6,
    "wheel-r2": 6
   },
   "powered": false,
   "paint": "skin",
   "trim": "sky",
   "accent": "blue",
   "clips": [
    "move"
   ],
   "floorY": 16,
   "doors": 4,
   "decks": 2
  },
  "wagon-boxcar": {
   "file": "freight-wagons/wagon-boxcar.glb",
   "scaleClass": "vehicle-large",
   "kind": "wagon",
   "L": 128,
   "couplers": {
    "f": -64,
    "r": 64
   },
   "guides": [
    -40,
    40
   ],
   "bogies": [
    "bogie-f",
    "bogie-r"
   ],
   "wheels": {
    "wheel-f1": 6,
    "wheel-f2": 6,
    "wheel-r1": 6,
    "wheel-r2": 6
   },
   "powered": false,
   "paint": "blood",
   "trim": "bone",
   "accent": "gold",
   "clips": [
    "move",
    "open",
    "close"
   ],
   "doors": 2
  },
  "wagon-flatcar": {
   "file": "freight-wagons/wagon-flatcar.glb",
   "scaleClass": "vehicle-large",
   "kind": "wagon",
   "L": 128,
   "couplers": {
    "f": -64,
    "r": 64
   },
   "guides": [
    -40,
    40
   ],
   "bogies": [
    "bogie-f",
    "bogie-r"
   ],
   "wheels": {
    "wheel-f1": 6,
    "wheel-f2": 6,
    "wheel-r1": 6,
    "wheel-r2": 6
   },
   "powered": false,
   "paint": "arcane",
   "trim": "gold",
   "accent": "red",
   "clips": [
    "move"
   ],
   "loadClass": "flat",
   "deck": 18
  },
  "wagon-covered-hopper": {
   "file": "freight-wagons/wagon-covered-hopper.glb",
   "scaleClass": "vehicle-large",
   "kind": "wagon",
   "L": 128,
   "couplers": {
    "f": -64,
    "r": 64
   },
   "guides": [
    -40,
    40
   ],
   "bogies": [
    "bogie-f",
    "bogie-r"
   ],
   "wheels": {
    "wheel-f1": 6,
    "wheel-f2": 6,
    "wheel-r1": 6,
    "wheel-r2": 6
   },
   "powered": false,
   "paint": "bone",
   "trim": "red",
   "accent": "arcane",
   "clips": [
    "move"
   ],
   "carries": "bulk"
  },
  "wagon-tank": {
   "file": "freight-wagons/wagon-tank.glb",
   "scaleClass": "vehicle-large",
   "kind": "wagon",
   "L": 128,
   "couplers": {
    "f": -64,
    "r": 64
   },
   "guides": [
    -40,
    40
   ],
   "bogies": [
    "bogie-f",
    "bogie-r"
   ],
   "wheels": {
    "wheel-f1": 6,
    "wheel-f2": 6,
    "wheel-r1": 6,
    "wheel-r2": 6
   },
   "powered": false,
   "paint": "arcane",
   "trim": "skin",
   "accent": "red",
   "clips": [
    "move"
   ],
   "carries": "liquid"
  },
  "wagon-gondola": {
   "file": "freight-wagons/wagon-gondola.glb",
   "scaleClass": "vehicle-large",
   "kind": "wagon",
   "L": 128,
   "couplers": {
    "f": -64,
    "r": 64
   },
   "guides": [
    -40,
    40
   ],
   "bogies": [
    "bogie-f",
    "bogie-r"
   ],
   "wheels": {
    "wheel-f1": 6,
    "wheel-f2": 6,
    "wheel-r1": 6,
    "wheel-r2": 6
   },
   "powered": false,
   "paint": "blood",
   "trim": "gold",
   "accent": "arcane",
   "clips": [
    "move"
   ],
   "loadClass": "gondola",
   "deck": 17
  },
  "wagon-livestock": {
   "file": "freight-wagons/wagon-livestock.glb",
   "scaleClass": "vehicle-large",
   "kind": "wagon",
   "L": 128,
   "couplers": {
    "f": -64,
    "r": 64
   },
   "guides": [
    -40,
    40
   ],
   "bogies": [
    "bogie-f",
    "bogie-r"
   ],
   "wheels": {
    "wheel-f1": 6,
    "wheel-f2": 6,
    "wheel-r1": 6,
    "wheel-r2": 6
   },
   "powered": false,
   "paint": "blood",
   "trim": "bone",
   "accent": "arcane",
   "clips": [
    "move"
   ],
   "carries": "livestock"
  },
  "wagon-refrigerator": {
   "file": "freight-wagons/wagon-refrigerator.glb",
   "scaleClass": "vehicle-large",
   "kind": "wagon",
   "L": 128,
   "couplers": {
    "f": -64,
    "r": 64
   },
   "guides": [
    -40,
    40
   ],
   "bogies": [
    "bogie-f",
    "bogie-r"
   ],
   "wheels": {
    "wheel-f1": 6,
    "wheel-f2": 6,
    "wheel-r1": 6,
    "wheel-r2": 6
   },
   "powered": false,
   "paint": "gold",
   "trim": "orange",
   "accent": "arcane",
   "clips": [
    "move"
   ],
   "carries": "chilled goods"
  },
  "wagon-container-spine": {
   "file": "freight-wagons/wagon-container-spine.glb",
   "scaleClass": "vehicle-large",
   "kind": "wagon",
   "L": 128,
   "couplers": {
    "f": -64,
    "r": 64
   },
   "guides": [
    -40,
    40
   ],
   "bogies": [
    "bogie-f",
    "bogie-r"
   ],
   "wheels": {
    "wheel-f1": 6,
    "wheel-f2": 6,
    "wheel-r1": 6,
    "wheel-r2": 6
   },
   "powered": false,
   "paint": "orange",
   "trim": "arcane",
   "accent": "gold",
   "clips": [
    "move"
   ],
   "loadClass": "flat",
   "deck": 16,
   "carries": "containers"
  },
  "wagon-log": {
   "file": "freight-wagons/wagon-log.glb",
   "scaleClass": "vehicle-large",
   "kind": "wagon",
   "L": 128,
   "couplers": {
    "f": -64,
    "r": 64
   },
   "guides": [
    -40,
    40
   ],
   "bogies": [
    "bogie-f",
    "bogie-r"
   ],
   "wheels": {
    "wheel-f1": 6,
    "wheel-f2": 6,
    "wheel-r1": 6,
    "wheel-r2": 6
   },
   "powered": false,
   "paint": "arcane",
   "trim": "gold",
   "accent": "red",
   "clips": [
    "move"
   ],
   "loadClass": "flat",
   "deck": 18,
   "carries": "logs"
  },
  "wagon-caboose": {
   "file": "freight-wagons/wagon-caboose.glb",
   "scaleClass": "vehicle-large",
   "kind": "wagon",
   "L": 96,
   "couplers": {
    "f": -48,
    "r": 48
   },
   "guides": [
    -24,
    24
   ],
   "bogies": [
    "bogie-f",
    "bogie-r"
   ],
   "wheels": {
    "wheel-f1": 6,
    "wheel-f2": 6,
    "wheel-r1": 6,
    "wheel-r2": 6
   },
   "powered": false,
   "paint": "red",
   "trim": "gold",
   "accent": "arcane",
   "clips": [
    "move"
   ],
   "endOfTrain": true
  },
  "wagon-brake-van": {
   "file": "freight-wagons/wagon-brake-van.glb",
   "scaleClass": "vehicle-large",
   "kind": "wagon",
   "L": 96,
   "couplers": {
    "f": -48,
    "r": 48
   },
   "guides": [
    -18,
    18
   ],
   "bogies": [],
   "wheels": {
    "wheel-a1": 6,
    "wheel-a2": 6
   },
   "powered": false,
   "paint": "khaki",
   "trim": "red",
   "accent": "arcane",
   "clips": [
    "move"
   ],
   "endOfTrain": true
  },
  "wagon-crane": {
   "file": "freight-wagons/wagon-crane.glb",
   "scaleClass": "vehicle-large",
   "kind": "wagon",
   "L": 128,
   "couplers": {
    "f": -64,
    "r": 64
   },
   "guides": [
    -40,
    40
   ],
   "bogies": [
    "bogie-f",
    "bogie-r"
   ],
   "wheels": {
    "wheel-f1": 6,
    "wheel-f2": 6,
    "wheel-r1": 6,
    "wheel-r2": 6
   },
   "powered": false,
   "paint": "gold",
   "trim": "arcane",
   "accent": "red",
   "clips": [
    "move"
   ],
   "carries": "crane"
  }
 },
 "loads": {
  "load-container": {
   "file": "freight-loads/load-container.glb",
   "scaleClass": "kit",
   "kind": "load",
   "loadClass": "flat",
   "paint": "teal",
   "trim": "skin"
  },
  "load-coal": {
   "file": "freight-loads/load-coal.glb",
   "scaleClass": "kit",
   "kind": "load",
   "loadClass": "gondola"
  },
  "load-logs": {
   "file": "freight-loads/load-logs.glb",
   "scaleClass": "kit",
   "kind": "load",
   "loadClass": "flat"
  },
  "load-crates": {
   "file": "freight-loads/load-crates.glb",
   "scaleClass": "kit",
   "kind": "load",
   "loadClass": "flat"
  },
  "load-pipes": {
   "file": "freight-loads/load-pipes.glb",
   "scaleClass": "kit",
   "kind": "load",
   "loadClass": "flat"
  }
 },
 "structures": {
  "platform-side": {
   "file": "stations-platforms/platform-side.glb",
   "scaleClass": "kit",
   "kind": "platform",
   "frame": "trackside",
   "length": 64,
   "top": 24,
   "edge": 25,
   "depth": 39
  },
  "platform-ramp-end": {
   "file": "stations-platforms/platform-ramp-end.glb",
   "scaleClass": "kit",
   "kind": "platform",
   "frame": "trackside",
   "length": 64,
   "top": 24,
   "edge": 25,
   "depth": 39,
   "ramp": true
  },
  "platform-island": {
   "file": "stations-platforms/platform-island.glb",
   "scaleClass": "kit",
   "kind": "platform",
   "frame": "trackside",
   "length": 64,
   "top": 24,
   "edge": 25,
   "island": true,
   "trackSpacing": 128,
   "width": 78
  },
  "platform-canopy": {
   "file": "stations-platforms/platform-canopy.glb",
   "scaleClass": "kit",
   "kind": "canopy",
   "frame": "trackside",
   "length": 64,
   "standsOn": "platform",
   "base": 24
  },
  "station-country": {
   "file": "stations-platforms/station-country.glb",
   "scaleClass": "building",
   "kind": "station",
   "frame": "trackside",
   "length": 128,
   "floorY": 24,
   "footprint": [
    64,
    128
   ]
  },
  "station-town": {
   "file": "stations-platforms/station-town.glb",
   "scaleClass": "building",
   "kind": "station",
   "frame": "trackside",
   "length": 128,
   "floorY": 24,
   "footprint": [
    64,
    128
   ],
   "storeys": 2
  },
  "station-terminus": {
   "file": "stations-platforms/station-terminus.glb",
   "scaleClass": "building",
   "kind": "terminus",
   "frame": "line-end",
   "tracks": [
    0,
    64,
    128
   ],
   "faceZ": 0,
   "width": 256
  },
  "signal-box": {
   "file": "stations-platforms/signal-box.glb",
   "scaleClass": "building",
   "kind": "signal-box",
   "trackOffset": 64
  },
  "house-terraced": {
   "file": "city-buildings/house-terraced.glb",
   "scaleClass": "building",
   "kind": "building",
   "footprint": [
    96,
    48
   ],
   "storeys": 2,
   "homes": 3
  },
  "house-detached": {
   "file": "city-buildings/house-detached.glb",
   "scaleClass": "building",
   "kind": "building",
   "footprint": [
    64,
    64
   ],
   "storeys": 2
  },
  "apartment-block": {
   "file": "city-buildings/apartment-block.glb",
   "scaleClass": "building",
   "kind": "building",
   "footprint": [
    96,
    64
   ],
   "storeys": 4
  },
  "shop-row": {
   "file": "city-buildings/shop-row.glb",
   "scaleClass": "building",
   "kind": "building",
   "footprint": [
    128,
    48
   ],
   "storeys": 3,
   "shops": 4,
   "paint": "red",
   "trim": "bone",
   "accent": "teal"
  },
  "office-tower": {
   "file": "city-buildings/office-tower.glb",
   "scaleClass": "building",
   "kind": "building",
   "footprint": [
    64,
    64
   ],
   "storeys": 10,
   "height": 182
  },
  "church": {
   "file": "city-buildings/church.glb",
   "scaleClass": "building",
   "kind": "building",
   "footprint": [
    96,
    128
   ],
   "height": 176
  },
  "factory": {
   "file": "city-buildings/factory.glb",
   "scaleClass": "building",
   "kind": "building",
   "footprint": [
    128,
    96
   ],
   "height": 150
  },
  "warehouse": {
   "file": "city-buildings/warehouse.glb",
   "scaleClass": "building",
   "kind": "building",
   "footprint": [
    128,
    78
   ],
   "loadingSide": "-z",
   "dockHeight": 8
  },
  "hill-tunnel": {
   "file": "scenery-terrain/hill-tunnel.glb",
   "scaleClass": "terrain",
   "kind": "tunnel-hill",
   "length": 128,
   "bore": {
    "halfWidth": 33,
    "height": 101
   },
   "height": 190,
   "width": 320,
   "fits": "tunnel-portal at both ends, over straight track"
  },
  "mountain-peak": {
   "file": "scenery-terrain/mountain-peak.glb",
   "scaleClass": "terrain",
   "kind": "mountain",
   "height": 260,
   "footprint": [
    256,
    256
   ]
  },
  "hill-mound": {
   "file": "scenery-terrain/hill-mound.glb",
   "scaleClass": "terrain",
   "kind": "mound",
   "height": 60,
   "footprint": [
    192,
    192
   ]
  },
  "cliff-face": {
   "file": "scenery-terrain/cliff-face.glb",
   "scaleClass": "terrain",
   "kind": "cliff",
   "length": 64,
   "height": 48,
   "depth": 24,
   "tiles": "along x"
  },
  "retaining-wall": {
   "file": "scenery-terrain/retaining-wall.glb",
   "scaleClass": "terrain",
   "kind": "retaining-wall",
   "length": 64,
   "height": 40,
   "thickness": 8,
   "tiles": "along x"
  }
 },
 "props": {
  "signal-semaphore": {
   "file": "signals-crossings/signal-semaphore.glb",
   "scaleClass": "tall-prop",
   "kind": "signal",
   "trackOffset": 34,
   "states": {
    "close": "danger",
    "open": "clear"
   }
  },
  "signal-colour-light": {
   "file": "signals-crossings/signal-colour-light.glb",
   "scaleClass": "tall-prop",
   "kind": "signal",
   "trackOffset": 34,
   "states": {
    "close": "danger",
    "open": "clear",
    "active": "caution"
   }
  },
  "crossing-gate": {
   "file": "signals-crossings/crossing-gate.glb",
   "scaleClass": "tall-prop",
   "kind": "crossing",
   "trackOffset": 40,
   "boomLength": 76,
   "states": {
    "close": "road closed",
    "open": "road open"
   }
  },
  "crossing-lights": {
   "file": "signals-crossings/crossing-lights.glb",
   "scaleClass": "tall-prop",
   "kind": "crossing",
   "trackOffset": 40,
   "states": {
    "active": "warning"
   }
  },
  "water-tower": {
   "file": "lineside-props/water-tower.glb",
   "scaleClass": "tall-prop",
   "kind": "water",
   "trackOffset": 60
  },
  "water-crane": {
   "file": "lineside-props/water-crane.glb",
   "scaleClass": "tall-prop",
   "kind": "water",
   "trackOffset": 34,
   "armLength": 34
  },
  "catenary-mast": {
   "file": "lineside-props/catenary-mast.glb",
   "scaleClass": "tall-prop",
   "kind": "catenary",
   "trackOffset": 34,
   "wireY": 92,
   "span": 64
  },
  "lamp-post": {
   "file": "lineside-props/lamp-post.glb",
   "scaleClass": "lamp",
   "kind": "lamp",
   "standsOn": "platform or ground"
  },
  "platform-bench": {
   "file": "lineside-props/platform-bench.glb",
   "scaleClass": "kit",
   "kind": "bench",
   "standsOn": "platform"
  },
  "station-nameboard": {
   "file": "lineside-props/station-nameboard.glb",
   "scaleClass": "kit",
   "kind": "sign",
   "standsOn": "platform or ground",
   "board": [
    46,
    10
   ]
  },
  "luggage-trolley": {
   "file": "lineside-props/luggage-trolley.glb",
   "scaleClass": "kit",
   "kind": "trolley",
   "standsOn": "platform"
  },
  "speed-board": {
   "file": "lineside-props/speed-board.glb",
   "scaleClass": "kit",
   "kind": "sign",
   "trackOffset": 30
  },
  "road-straight": {
   "file": "city-street/road-straight.glb",
   "scaleClass": "tile",
   "kind": "road",
   "tile": 64,
   "along": "z",
   "lanes": 2
  },
  "road-crossroads": {
   "file": "city-street/road-crossroads.glb",
   "scaleClass": "tile",
   "kind": "road",
   "tile": 64,
   "junction": "cross"
  },
  "car-small": {
   "file": "city-street/car-small.glb",
   "scaleClass": "prop",
   "kind": "road-vehicle",
   "length": 40,
   "paint": "sky",
   "trim": "arcane",
   "accent": "khaki"
  },
  "car-estate": {
   "file": "city-street/car-estate.glb",
   "scaleClass": "prop",
   "kind": "road-vehicle",
   "length": 48,
   "paint": "red",
   "trim": "arcane",
   "accent": "khaki"
  },
  "bus": {
   "file": "city-street/bus.glb",
   "scaleClass": "prop",
   "kind": "road-vehicle",
   "length": 110,
   "doors": 2,
   "paint": "red",
   "trim": "bone",
   "accent": "arcane"
  },
  "delivery-van": {
   "file": "city-street/delivery-van.glb",
   "scaleClass": "prop",
   "kind": "road-vehicle",
   "length": 56,
   "paint": "skin",
   "trim": "blue",
   "accent": "arcane"
  },
  "street-lamp": {
   "file": "city-street/street-lamp.glb",
   "scaleClass": "lamp",
   "kind": "lamp",
   "light": "warm"
  },
  "person-standing": {
   "file": "city-street/person-standing.glb",
   "scaleClass": "prop",
   "kind": "person",
   "height": 36,
   "paint": "teal",
   "trim": "navy",
   "accent": "arcane"
  },
  "person-walking": {
   "file": "city-street/person-walking.glb",
   "scaleClass": "prop",
   "kind": "person",
   "height": 36,
   "paint": "orange",
   "trim": "arcane",
   "accent": "khaki"
  },
  "park-bench": {
   "file": "city-street/park-bench.glb",
   "scaleClass": "prop",
   "kind": "bench",
   "seats": 3
  },
  "telegraph-pole": {
   "file": "city-street/telegraph-pole.glb",
   "scaleClass": "tall-prop",
   "kind": "pole",
   "trackOffset": 44
  },
  "tree-conifer": {
   "file": "scenery-nature/tree-conifer.glb",
   "scaleClass": "tree",
   "kind": "tree",
   "height": 70,
   "footprint": 34
  },
  "tree-conifer-tall": {
   "file": "scenery-nature/tree-conifer-tall.glb",
   "scaleClass": "tree",
   "kind": "tree",
   "height": 110,
   "footprint": 38
  },
  "tree-deciduous": {
   "file": "scenery-nature/tree-deciduous.glb",
   "scaleClass": "tree",
   "kind": "tree",
   "height": 80,
   "footprint": 54
  },
  "tree-deciduous-round": {
   "file": "scenery-nature/tree-deciduous-round.glb",
   "scaleClass": "tree",
   "kind": "tree",
   "height": 60,
   "footprint": 40
  },
  "tree-birch": {
   "file": "scenery-nature/tree-birch.glb",
   "scaleClass": "tree",
   "kind": "tree",
   "height": 90,
   "footprint": 30
  },
  "bush-round": {
   "file": "scenery-nature/bush-round.glb",
   "scaleClass": "tree",
   "kind": "bush",
   "height": 18,
   "footprint": 24
  },
  "bush-flowering": {
   "file": "scenery-nature/bush-flowering.glb",
   "scaleClass": "tree",
   "kind": "bush",
   "height": 16,
   "footprint": 22
  },
  "rock-small": {
   "file": "scenery-nature/rock-small.glb",
   "scaleClass": "terrain",
   "kind": "rock",
   "height": 12,
   "footprint": 19
  },
  "rock-large": {
   "file": "scenery-nature/rock-large.glb",
   "scaleClass": "terrain",
   "kind": "rock",
   "height": 30,
   "footprint": 45
  },
  "flowerbed": {
   "file": "scenery-nature/flowerbed.glb",
   "scaleClass": "tile",
   "kind": "flowerbed",
   "footprint": [
    64,
    24
   ]
  }
 },
 "tokens": {
  "token-train-car": {
   "file": "board-game-tokens/token-train-car.glb",
   "scaleClass": "kit",
   "kind": "token",
   "paint": "red",
   "trim": "bone",
   "accent": "gold",
   "length": 34
  },
  "token-station": {
   "file": "board-game-tokens/token-station.glb",
   "scaleClass": "kit",
   "kind": "token",
   "paint": "bone",
   "trim": "blue",
   "accent": "red"
  },
  "token-route": {
   "file": "board-game-tokens/token-route.glb",
   "scaleClass": "kit",
   "kind": "token",
   "paint": "teal",
   "trim": "skin",
   "accent": "gold",
   "length": 46
  }
 }
};
export { TrainFx, chuffsBetween, chuffInterval } from './trainfx.js';

const RAD = Math.PI / 180;
const SECTIONS = ['stock', 'track', 'civil', 'loads', 'structures', 'props', 'tokens'];

export class TrainKit {
  static async load(base, manifest = KIT) {
    manifest ??= await (await fetch(base + 'kit.json', { cache: 'no-store' })).json();
    return new TrainKit(base, manifest);
  }

  constructor(base, manifest) {
    this.base = base;
    this.m = manifest;
    this.loader = new GLTFLoader();
    this.cache = new Map();
  }

  /** Catalogue entry for any model id. */
  entry(id) {
    for (const s of SECTIONS) if (this.m[s]?.[id]) return this.m[s][id];
    throw new Error(`unknown model ${id}`);
  }

  _gltf(file) {
    // ?v=<build stamp> (editor builds): a rebuilt kit never comes out of the browser cache
    if (!this.cache.has(file)) this.cache.set(file, this.loader.loadAsync(`${this.base}${file}${this.m.version ? `?v=${this.m.version}` : ''}`));
    return this.cache.get(file);
  }

  /** Any model as {group, entry, mixer, play(clip)}: props, stations, loads, single vehicles. */
  async model(id, colours = {}) {
    const e = this.entry(id);
    const g = await this._gltf(e.file);
    const group = g.scene.clone(true);
    this.recolour(group, e, colours);
    const mixer = new THREE.AnimationMixer(group);
    const play = (name) => {
      const clip = g.animations.find((a) => a.name === name);
      if (!clip) return null;
      mixer.stopAllAction();
      const a = mixer.clipAction(clip);
      a.setLoop(['open', 'close'].includes(name) ? THREE.LoopOnce : THREE.LoopRepeat); // one-shots in the prop vocabulary
      a.clampWhenFinished = true;
      a.reset().play();
      return a;
    };
    return { group, entry: e, mixer, play, clips: g.animations };
  }

  /** Swap a model's paint, trim and accent ramps: {paint: 'red', trim: 'bone', accent: 'gold'}. */
  recolour(group, entry, colours) {
    const swaps = ['paint', 'trim', 'accent'].filter((r) => entry[r] && colours[r] && colours[r] !== entry[r]).map((r) => [entry[r], colours[r]]);
    const done = new Map();
    group.traverse((o) => {
      if (!o.isMesh || !o.material?.map) return;
      // always repaint from the as-built material, so a model can be recoloured again and again
      const base = (o.userData.asBuilt ??= o.material);
      if (!swaps.length) { o.material = base; return; }
      if (!done.has(base)) done.set(base, this._repaint(base, swaps));
      o.material = done.get(base);
    });
  }

  // Recolour a pixel atlas: every texel of a source ramp shade becomes the same
  // shade of the target ramp. Atlases hold exact palette colours; a small
  // tolerance absorbs PNG rounding. Ported from the Wasteland Wheels helper.
  _repaint(material, swaps) {
    const mat = material.clone();
    const img = mat.map.image;
    const c = document.createElement('canvas');
    c.width = img.width;
    c.height = img.height;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, c.width, c.height);
    const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
    const map = [];
    for (const [from, to] of swaps) this.m.ramps[from].forEach((h, k) => map.push([rgb(h), rgb(this.m.ramps[to][k])]));
    const d = data.data;
    for (let i = 0; i < d.length; i += 4) {
      for (const [a, b] of map) {
        if (Math.abs(d[i] - a[0]) + Math.abs(d[i + 1] - a[1]) + Math.abs(d[i + 2] - a[2]) <= 3) {
          d[i] = b[0];
          d[i + 1] = b[1];
          d[i + 2] = b[2];
          break;
        }
      }
    }
    ctx.putImageData(data, 0, 0);
    const tex = new THREE.CanvasTexture(c);
    for (const k of ['flipY', 'magFilter', 'minFilter', 'wrapS', 'wrapT', 'colorSpace', 'generateMipmaps']) tex[k] = mat.map[k];
    mat.map = tex;
    return mat;
  }

  /**
   * Overhead wires for electric running: a catenary mast every `span` along every route of a
   * layout, on whichever side of the track is clear of other tracks (right first). Each mast
   * carries its own run of contact wire, so the runs join into one wire, a polygon round curves.
   * `skip(placedPiece)` leaves pieces out (tunnels, turntables). Returns a THREE.Group.
   */
  async catenary(layout, { span, offset, clearance = 30, skip = () => false } = {}) {
    const e = this.entry('catenary-mast');
    span ??= e.span ?? 64;
    offset ??= e.trackOffset ?? 34;
    const group = new THREE.Group();
    const edges = layout.edges().filter((ed) => !skip(layout.placed[ed.piece]));
    const samples = [];
    edges.forEach((ed, i) => {
      for (let u = 0; u <= ed.route.length; u += 8) samples.push({ p: layout.edgeAt(ed, u).p, i });
    });
    const d2 = (a, b) => (a[0] - b[0]) ** 2 + (a[2] - b[2]) ** 2;
    const masts = [];
    for (const [i, ed] of edges.entries()) {
      const n = Math.max(1, Math.round(ed.route.length / span));
      for (let k = 0; k < n; k++) {
        const { p, t } = layout.edgeAt(ed, (ed.route.length * (k + 0.5)) / n);
        const len = Math.hypot(t[0], t[2]);
        const right = [-t[2] / len, 0, t[0] / len];
        // the shared start of a switch's two routes already has a mast here: skip
        if (masts.some((m) => d2(m, p) < 16 && Math.abs(m[1] - p[1]) < 4)) continue;
        for (const side of [1, -1]) {
          const q = [p[0] + right[0] * offset * side, p[1], p[2] + right[2] * offset * side];
          const clear = samples.every((smp) => smp.i === i || d2(smp.p, q) > clearance ** 2);
          if (!clear) continue;
          const m = await this.model('catenary-mast');
          m.group.position.set(...q);
          m.group.rotation.y = (headingOf(t[0], t[2]) + (side > 0 ? 0 : 180)) * RAD;
          group.add(m.group);
          masts.push(p);
          break;
        }
      }
    }
    return group;
  }

  /** Lay track: see trackpath.js Layout for the step format. */
  async layout(steps, start) {
    const layout = new TrackLayout(this.m, steps, start);
    await layout._build(this);
    return layout;
  }

  /** A consist: [{id, flip?, paint?, trim?, accent?}, ...], front first. */
  async consist(cars) {
    const made = await Promise.all(cars.map(async (c) => {
      const m = await this.model(c.id, c);
      return new Car(m.group, m.entry, !!c.flip, m);
    }));
    return new Train(made, this.m.contract.railTop);
  }

  /** A trackside model (platform, station) placed beside a layout step like the track it serves, `along` voxels in. */
  async beside(layout, step, id, along = 0, colours = {}) {
    const m = await this.model(id, colours);
    const pc = layout.placed[step];
    const [x, z] = rotate(0, -along, pc.theta);
    m.group.position.set(pc.tx + x, pc.ty, pc.tz + z);
    m.group.rotation.y = pc.theta * RAD;
    return m;
  }
}

class TrackLayout extends Layout {
  async _build(kit) {
    this.group = new THREE.Group();
    this.models = await Promise.all(this.placed.map(async (pc) => {
      const m = await kit.model(pc.name);
      m.group.position.set(pc.tx, pc.ty, pc.tz);
      m.group.rotation.y = pc.theta * RAD;
      this.group.add(m.group);
      return m;
    }));
  }

  /** Set points or a turntable: plays the piece's own open/close clip (blades and lever)
   * and, for a turntable, turns its bridge to the state's angle. */
  setSwitch(i, state) {
    super.setSwitch(i, state);
    const m = this.models?.[i];
    if (!m) return;
    m.play(state);
    const tt = m.entry.turntable;
    if (tt) {
      const bridge = m.group.getObjectByName(tt.bridge);
      if (bridge) bridge.rotation.y = (tt.turn[state] ?? 0) * RAD;
    }
  }

  /** Advance the pieces' own animations (switch blades). */
  update(dt) {
    for (const m of this.models ?? []) m.mixer.update(dt);
  }
}

export class Car {
  constructor(group, entry, flip, model) {
    Object.assign(this, { group, entry, flip, model });
    this.root = group.children[0] ?? group;
    this.bogies = (entry.bogies ?? []).map((n) => group.getObjectByName(n));
    this.wheels = Object.entries(entry.wheels ?? {}).map(([n, r]) => ({ node: group.getObjectByName(n), r })).filter((w) => w.node);
    for (const w of this.wheels) w.rest = w.node.rotation.x;
    // steam motion: one or more rod groups (articulated engines have two), each with both sides
    this.rods = (entry.rods ?? []).flatMap((g) => ['l', 'r'].map((side) => {
      const nodes = Object.fromEntries(['rod', 'mainrod', 'crosshead'].map((k) => [k, group.getObjectByName(`${k}-${side}${g.tag ?? ''}`)]));
      return { side, group: g, r: entry.wheels[g.main], nodes,
        rest: Object.fromEntries(Object.entries(nodes).map(([k, n]) => [k, { p: n.position.clone(), rx: n.rotation.x }])) };
    }));
  }

  /** Play one of the model's own clips, whole (every part it moves). */
  play(name) {
    if (this.hasPanto && (name === 'open' || name === 'close')) this.pantoUp = name === 'open';
    return this.model.play(name);
  }

  get hasPanto() {
    let found = false;
    this.group.traverse((o) => { if (o.name.startsWith('panto')) found = true; });
    return found;
  }

  /** Raise (true) or lower (false) the pantograph, leaving the doors alone. */
  setPantograph(up) {
    this.pantoUp = !!up;
    return this._playParts(up ? 'open' : 'close', 'panto');
  }

  /** Open (true) or close (false) the doors, leaving the pantograph alone. */
  setDoors(open) {
    this.doorsOpen = !!open;
    return this._playParts(open ? 'open' : 'close', 'door-');
  }

  // The open / close clips move doors and pantographs together; these play the
  // part of a clip whose tracks animate nodes starting with `prefix`.
  _sub(name, prefix) {
    this._subs ??= new Map();
    const key = `${name}:${prefix}`;
    if (!this._subs.has(key)) {
      const clip = this.model.clips.find((c) => c.name === name);
      const tracks = clip ? clip.tracks.filter((t) => t.name.split('.')[0].startsWith(prefix)) : [];
      this._subs.set(key, tracks.length ? new THREE.AnimationClip(key, -1, tracks) : null);
    }
    return this._subs.get(key);
  }

  _playParts(name, prefix) {
    const clip = this._sub(name, prefix);
    if (!clip) return null;
    const other = this._sub(name === 'open' ? 'close' : 'open', prefix);
    if (other) this.model.mixer.existingAction(other)?.stop();
    const a = this.model.mixer.clipAction(clip);
    a.setLoop(THREE.LoopOnce, 1);
    a.clampWhenFinished = true;
    a.reset().play();
    return a;
  }

  pose(p, rolled) {
    this.lastPose = p;
    this.group.position.set(...p.pos);
    this.group.rotation.set(0, p.yaw * RAD, 0, 'YXZ');
    this.group.rotation.x = p.pitch * RAD; // pitch is nose-up positive; +X rotation lifts a -Z nose
    this.bogies.forEach((b, i) => { if (b) b.rotation.y = p.bogieYaw[i] * RAD; });
    const sign = this.flip ? 1 : -1; // wheels roll backwards relative to a reversed car
    const roll = sign * rolled + (this.rollOffset ?? 0); // rollOffset keeps the wheels' angle when the train reverses
    for (const w of this.wheels) w.node.rotation.x = w.rest + roll / w.r;
    for (const { side, group, r, nodes, rest } of this.rods) {
      const q = rodPose(roll / r, group, r, side === 'l' ? 0 : Math.PI / 2);
      nodes.rod.position.set(rest.rod.p.x, rest.rod.p.y + q.rod[0], rest.rod.p.z + q.rod[1]);
      nodes.mainrod.position.set(rest.mainrod.p.x, rest.mainrod.p.y + q.main[0], rest.mainrod.p.z + q.main[1]);
      nodes.mainrod.rotation.x = rest.mainrod.rx + q.main[2];
      nodes.crosshead.position.set(rest.crosshead.p.x, rest.crosshead.p.y, rest.crosshead.p.z + q.crosshead);
    }
  }
}

export class Train {
  constructor(cars, railTop) {
    this.cars = cars;
    this.railTop = railTop;
    this.group = new THREE.Group();
    for (const c of cars) this.group.add(c.group);
    this.speed = 0; // voxels per second; set it directly, or use go() / brake() for a smooth change
    this.target = null; // speed go() / brake() are heading for
    this.acceleration = 40; // voxels/s² for go()
    this.braking = 70; // voxels/s² for brake()
    this.accel = 0; // smoothed change of speed, voxels/s² (effects read it)
    this.rolled = 0;
    this.prevRolled = 0;
  }

  /** Accelerate smoothly to `speed`. */
  go(speed) {
    this.target = speed;
  }

  /** Brake smoothly to a stand. */
  brake() {
    this.target = 0;
  }

  get length() {
    return this.cars.reduce((a, c) => a + c.entry.L, 0);
  }

  /** Distance along the track from the front coupler back to the rear coupler, as last placed. */
  get tailDistance() {
    const last = this.cars[this.cars.length - 1];
    const p = last?.lastPose;
    if (!p) return this.length;
    const { couplers: c, guides: g } = last.entry;
    return p.d[1] + (last.flip ? g[0] - c.f : c.r - g[1]);
  }

  /**
   * Turn the train round where it stands: the rear car leads, every car runs the other way
   * round (its flip toggles), and the cursor moves to the old rear coupler facing back along
   * the track the train came over. Speed drops to zero.
   */
  reverse() {
    if (!this.runner) return;
    this.runner = this.runner.reversed(this.tailDistance);
    this.runner.keep = this.length * 2 + 512;
    for (const c of this.cars) {
      const signOld = c.flip ? 1 : -1;
      c.rollOffset = (c.rollOffset ?? 0) + 2 * signOld * this.rolled;
      c.flip = !c.flip;
    }
    this.cars.reverse();
    this.speed = 0;
    this.target = 0;
    this.accel = 0;
    this.prevRolled = this.rolled;
    this.update(0);
  }

  /** Put the lead car's front coupler `u` along `edge` (from layout.edge()). The train backs onto the track behind it. */
  setTrack(layout, edge, u = 0) {
    this.layout = layout;
    this.runner = new Runner(layout, edge, u);
    this.runner.keep = this.length * 2 + 512;
    this.runner.backfill(this.length + 512);
    this.update(0);
  }

  update(dt) {
    if (!this.runner) return;
    const before = this.speed;
    if (this.target !== null) {
      const rate = this.target < this.speed ? this.braking : this.acceleration;
      const step = rate * dt;
      this.speed = Math.abs(this.target - this.speed) <= step ? this.target : this.speed + Math.sign(this.target - this.speed) * step;
    }
    const moved = this.runner.advance(Math.max(0, this.speed * dt));
    if (this.runner.stopped) this.speed = 0;
    if (dt > 0) this.accel += ((this.speed - before) / dt - this.accel) * Math.min(1, dt * 8);
    this.prevRolled = this.rolled;
    this.rolled += moved;
    const poses = placeConsist(this.runner, this.cars.map((c) => ({ couplers: c.entry.couplers, guides: c.entry.guides, flip: c.flip })), this.railTop);
    this.cars.forEach((c, i) => c.pose(poses[i], this.rolled));
    for (const c of this.cars) c.model.mixer.update(dt);
  }

  /** The whole consist as one static GLB, posed where it stands. */
  async exportGLB() {
    return new GLTFExporter().parseAsync(this.group, { binary: true });
  }
}
