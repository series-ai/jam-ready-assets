var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key2, value) => key2 in obj ? __defProp(obj, key2, { enumerable: true, configurable: true, writable: true, value }) : obj[key2] = value;
var __publicField = (obj, key2, value) => __defNormalProp(obj, typeof key2 !== "symbol" ? key2 + "" : key2, value);
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
const P = (r, y, tag = "body", sharp) => ({ r, y, tag, sharp });
function curve(y0, y1, rs, n = 10, tag = "body") {
  const out = [];
  const spline = new THREE.SplineCurve(rs.map((r, i) => new THREE.Vector2(r, y0 + (y1 - y0) * i / (rs.length - 1))));
  for (let i = 0; i <= n; i++) {
    const p = spline.getPoint(i / n);
    out.push({ r: p.x, y: p.y, tag });
  }
  return out;
}
const foot = (r, h = 0.04) => [P(0, 0, "base"), P(r - h, 0, "base"), P(r - h * 0.3, h * 0.3, "base"), P(r, h, "body", true)];
const collar = (r, y, out = 0.04, h = 0.13) => [
  P(r, y, "rim", true),
  P(r + out, y + 0.01, "rim", true),
  P(r + out, y + h - 0.015, "rim"),
  P(r + out - 0.012, y + h, "rim", true)
];
const roundLip = (r, y) => [P(r, y - 0.02, "rim", true), P(r + 8e-3, y - 6e-3, "rim"), P(r, y, "rim")];
const TERRACOTTA = [
  { name: "Terracotta", body: "#c96f45", accent: "#a9552f" },
  { name: "Whitewash", body: "#e9e1d4", accent: "#c9b9a3" },
  { name: "Aged moss", body: "#b7764f", accent: "#7f9a5c", rim: "#8ea36a" },
  { name: "Dipped rim", body: "#c96f45", accent: "#f2ead8", rim: "#f2ead8" },
  { name: "Charcoal", body: "#4a4744", accent: "#2f2d2b" }
];
const POTS = [
  {
    id: "classic",
    name: "Classic Pot",
    finish: "clay",
    outline: [...foot(0.36), P(0.36, 0.03), P(0.44, 0.55, "body", true), ...collar(0.44, 0.55)],
    colourways: TERRACOTTA
  },
  {
    id: "azalea",
    name: "Azalea Pot (short)",
    finish: "clay",
    outline: [...foot(0.4), P(0.4, 0.03), P(0.47, 0.36, "body", true), ...collar(0.47, 0.36, 0.035, 0.11)],
    colourways: TERRACOTTA
  },
  {
    id: "stepped",
    name: "Stepped Sage",
    finish: "glaze",
    outline: [
      ...foot(0.42),
      P(0.42, 0.03),
      P(0.44, 0.2, "band", true),
      P(0.46, 0.21, "body", true),
      P(0.47, 0.4, "band", true),
      P(0.49, 0.41, "body", true),
      P(0.5, 0.62, "body"),
      ...roundLip(0.5, 0.64)
    ],
    colourways: [
      { name: "Sage", body: "#a9bf9f", accent: "#93ab89" },
      { name: "Butter", body: "#efd98f", accent: "#dcc274" },
      { name: "Sky", body: "#a8c7d8", accent: "#8fb2c6" },
      { name: "Ink", body: "#2f3f52", accent: "#24313f" }
    ]
  },
  {
    id: "cylinder",
    name: "Glossy Cylinder",
    finish: "glaze",
    outline: [...foot(0.44), P(0.44, 0.03), ...curve(0.03, 0.62, [0.44, 0.47, 0.48, 0.475]), ...roundLip(0.47, 0.64)],
    colourways: [
      { name: "Peach", body: "#f19a7a", accent: "#e3876a" },
      { name: "Cream", body: "#f4ecdc", accent: "#e2d6bf" },
      { name: "Cobalt", body: "#2f5fb3", accent: "#244c91" },
      { name: "Mint", body: "#a6dcc3", accent: "#8bc7ab" },
      { name: "Lilac", body: "#c7b4e2", accent: "#ad98ce" },
      { name: "Indigo", body: "#3b3f8f", accent: "#2c2f73" }
    ]
  },
  {
    id: "speckle",
    name: "Speckled Stone",
    finish: "stone",
    pattern: "speckle",
    outline: [...foot(0.42), P(0.42, 0.03), ...curve(0.03, 0.6, [0.42, 0.48, 0.5, 0.49]), ...roundLip(0.49, 0.63)],
    colourways: [
      { name: "Oat", body: "#ece4d4", accent: "#4a443c" },
      { name: "Charcoal", body: "#3d3b3a", accent: "#e8e2d6" },
      { name: "Blush", body: "#f0cfc4", accent: "#7b4d43" }
    ]
  },
  {
    id: "terrazzo",
    name: "Terrazzo Planter",
    finish: "stone",
    pattern: "terrazzo",
    outline: [...foot(0.46), P(0.46, 0.03), P(0.46, 0.6, "body", true), P(0.46, 0.62, "rim", true), P(0.45, 0.63, "rim")],
    colourways: [
      { name: "Classic", body: "#efe9df", accent: "#d9735a" },
      { name: "Green chip", body: "#e9e6dc", accent: "#4f8a68" },
      { name: "Dark", body: "#4b4a49", accent: "#e9c46a" }
    ]
  },
  {
    id: "bowl",
    name: "Low Bowl",
    finish: "stone",
    outline: [...foot(0.36), P(0.36, 0.03), ...curve(0.03, 0.28, [0.36, 0.5, 0.56, 0.57], 8), P(0.55, 0.32, "rim", true), P(0.53, 0.33, "rim")],
    soilDepth: 0.07,
    colourways: [
      { name: "Taupe", body: "#9b8a7b", accent: "#7d6d60" },
      { name: "Slate", body: "#6f7a80", accent: "#5a646a" },
      { name: "Sand", body: "#d8c3a0", accent: "#bba582" }
    ]
  },
  {
    id: "belly",
    name: "Pot Belly",
    finish: "glaze",
    outline: [...foot(0.3), P(0.3, 0.03), ...curve(0.03, 0.58, [0.3, 0.48, 0.52, 0.44, 0.38], 12), P(0.4, 0.62, "rim", true), P(0.42, 0.66, "rim"), P(0.4, 0.68, "rim", true)],
    colourways: [
      { name: "Celadon", body: "#a9c9b4", accent: "#8bb39a" },
      { name: "Honey", body: "#e0a948", accent: "#c88f30" },
      { name: "Oxblood", body: "#7b2e2b", accent: "#5f2220" }
    ]
  },
  {
    id: "egg",
    name: "Egg Pot",
    finish: "matte",
    outline: [...foot(0.22, 0.02), P(0.22, 0.02), ...curve(0.02, 0.7, [0.22, 0.42, 0.48, 0.46, 0.38], 12), P(0.36, 0.72, "rim")],
    colourways: [
      { name: "Eggshell", body: "#f3ede1", accent: "#d8cdb8" },
      { name: "Speckled egg", body: "#e6ddc8", accent: "#7c6f5a" },
      { name: "Robin", body: "#9fd1cf", accent: "#5a8c8a" }
    ]
  },
  {
    id: "tulip",
    name: "Tulip Flare",
    finish: "glaze",
    outline: [...foot(0.24), P(0.24, 0.03), ...curve(0.03, 0.66, [0.24, 0.3, 0.38, 0.5, 0.6], 10), P(0.62, 0.68, "rim", true), P(0.6, 0.69, "rim")],
    colourways: [
      { name: "Coral", body: "#f08a6c", accent: "#d76f52" },
      { name: "Teal", body: "#2f8a8a", accent: "#236e6e" },
      { name: "Mustard", body: "#d9a62e", accent: "#bb8b1d" }
    ]
  },
  {
    id: "fluted",
    name: "Fluted Pot",
    finish: "glaze",
    flutes: [14, 0.05],
    segments: 56,
    outline: [...foot(0.4), P(0.4, 0.03), P(0.47, 0.58, "body", true), P(0.49, 0.6, "rim", true), P(0.49, 0.64, "rim"), P(0.47, 0.65, "rim", true)],
    colourways: [
      { name: "Milk", body: "#f2eee6", accent: "#dcd5c8" },
      { name: "Pistachio", body: "#c4d8a4", accent: "#a9c287" },
      { name: "Rose", body: "#e9a8a8", accent: "#d38f8f" }
    ]
  },
  {
    id: "ribbed",
    name: "Ribbed Planter",
    finish: "matte",
    outline: [
      ...foot(0.44),
      P(0.44, 0.03),
      P(0.47, 0.1, "band"),
      P(0.44, 0.17),
      P(0.47, 0.24, "band"),
      P(0.44, 0.31),
      P(0.47, 0.38, "band"),
      P(0.44, 0.45),
      P(0.47, 0.52, "band"),
      P(0.45, 0.59),
      P(0.47, 0.62, "rim", true),
      P(0.46, 0.63, "rim")
    ],
    colourways: [
      { name: "Clay", body: "#c58763", accent: "#b07452" },
      { name: "Black", body: "#2f2f2f", accent: "#3b3b3b" },
      { name: "Seafoam", body: "#9ec9bd", accent: "#86b5a8" }
    ]
  },
  {
    id: "hex",
    name: "Hex Geo",
    finish: "glaze",
    faceted: true,
    segments: 6,
    outline: [...foot(0.4), P(0.4, 0.03), P(0.5, 0.58, "body", true), P(0.5, 0.6, "rim", true), P(0.48, 0.61, "rim")],
    colourways: [
      { name: "Concrete", body: "#a8a59f", accent: "#8f8c86" },
      { name: "White", body: "#f1efea", accent: "#d9d6cf" },
      { name: "Copper", body: "#b8734a", accent: "#9a5c38" }
    ]
  },
  {
    id: "gem",
    name: "Faceted Gem",
    finish: "glaze",
    faceted: true,
    segments: 8,
    outline: [...foot(0.24), P(0.24, 0.03), P(0.46, 0.22, "body", true), P(0.52, 0.42, "body", true), P(0.46, 0.62, "body", true), P(0.46, 0.64, "rim", true), P(0.44, 0.65, "rim")],
    colourways: [
      { name: "Amethyst", body: "#9a7bc7", accent: "#7d5fb0" },
      { name: "Emerald", body: "#3d9a6e", accent: "#2c7c56" },
      { name: "Ruby", body: "#c8435a", accent: "#a83247" },
      { name: "Gold", body: "#e3b440", accent: "#c4952a" }
    ]
  },
  {
    id: "box",
    name: "Square Box",
    finish: "matte",
    faceted: true,
    segments: 4,
    outline: [...foot(0.4), P(0.4, 0.03), P(0.44, 0.58, "body", true), P(0.46, 0.6, "rim", true), P(0.46, 0.63, "rim"), P(0.44, 0.64, "rim", true)],
    colourways: [
      { name: "Cement", body: "#b2aea6", accent: "#97938b" },
      { name: "Black", body: "#2d2c2b", accent: "#444" },
      { name: "Painted blue", body: "#5b86b8", accent: "#f2ead8" }
    ]
  },
  {
    id: "nursery",
    name: "Nursery Pot",
    finish: "plastic",
    outline: [...foot(0.31), P(0.31, 0.03), P(0.41, 0.56, "body", true), P(0.44, 0.57, "rim", true), P(0.45, 0.6, "rim"), P(0.45, 0.64, "rim"), P(0.43, 0.65, "rim", true)],
    colourways: [
      { name: "Black", body: "#2a2a2a", accent: "#3a3a3a" },
      { name: "Terracotta", body: "#c96f45", accent: "#b25c36" },
      { name: "Green", body: "#4f8a68", accent: "#3f7357" }
    ]
  },
  {
    id: "crate",
    name: "Wooden Crate",
    finish: "wood",
    faceted: true,
    segments: 4,
    pattern: "planks",
    repeat: 4,
    outline: [P(0, 0, "base"), P(0.45, 0, "base", true), P(0.45, 0.55, "body", true), P(0.45, 0.56, "rim", true), P(0.45, 0.6, "rim")],
    colourways: [
      { name: "Pine", body: "#d6ac74", accent: "#b88a54" },
      { name: "Weathered", body: "#a9a093", accent: "#857c70" },
      { name: "Painted", body: "#c96a5a", accent: "#a9503f" }
    ]
  },
  {
    id: "barrel",
    name: "Half Barrel",
    finish: "wood",
    pattern: "planks",
    repeat: 14,
    hoops: [0.18, 0.82],
    outline: [...foot(0.44), P(0.44, 0.03), ...curve(0.03, 0.58, [0.44, 0.5, 0.52, 0.5], 8), P(0.5, 0.6, "rim", true), P(0.48, 0.61, "rim")],
    colourways: [
      { name: "Oak", body: "#a8743f", accent: "#3d3a38" },
      { name: "Whiskey", body: "#7d4b2a", accent: "#2c2b2a" },
      { name: "Silver birch", body: "#cfc5b3", accent: "#5a5652" }
    ]
  },
  {
    id: "basket",
    name: "Woven Basket",
    finish: "wicker",
    pattern: "weave",
    repeat: 10,
    outline: [...foot(0.38), P(0.38, 0.03), ...curve(0.03, 0.5, [0.38, 0.45, 0.48], 6), P(0.5, 0.52, "rim", true), P(0.51, 0.56, "rim"), P(0.49, 0.58, "rim", true)],
    colourways: [
      { name: "Rattan", body: "#d6a865", accent: "#b5864a" },
      { name: "Seagrass", body: "#b5ad7c", accent: "#8f875c" },
      { name: "Two-tone", body: "#e9dcc0", accent: "#2f2f2f" }
    ]
  },
  {
    id: "bucket",
    name: "Tin Bucket",
    finish: "metal",
    handles: { kind: "bail", at: 0.95, size: 0.5 },
    hoops: [0.12, 0.88],
    outline: [...foot(0.38), P(0.38, 0.03), P(0.47, 0.6, "body", true), P(0.49, 0.61, "rim", true), P(0.49, 0.63, "rim"), P(0.47, 0.64, "rim", true)],
    colourways: [
      { name: "Galvanised", body: "#b9bfc2", accent: "#8e969a" },
      { name: "Red enamel", body: "#c8443a", accent: "#f1ece2" },
      { name: "Rust", body: "#9a5a34", accent: "#6e3c22" }
    ]
  },
  {
    id: "tincan",
    name: "Tin Can",
    finish: "metal",
    pattern: "label",
    outline: [
      ...foot(0.36, 0.02),
      P(0.36, 0.02, "band"),
      P(0.37, 0.05, "band", true),
      P(0.37, 0.06),
      P(0.37, 0.5, "band", true),
      P(0.37, 0.51, "band"),
      P(0.37, 0.55, "rim", true),
      P(0.375, 0.56, "rim")
    ],
    colourways: [
      { name: "Tomato", body: "#d9473a", accent: "#f4e7c8", rim: "#c3c8ca", base: "#c3c8ca" },
      { name: "Beans", body: "#3f6fb0", accent: "#f2c84b", rim: "#c3c8ca", base: "#c3c8ca" },
      { name: "Peaches", body: "#f2a65a", accent: "#5b8c3a", rim: "#c3c8ca", base: "#c3c8ca" }
    ]
  },
  {
    id: "teacup",
    name: "Teacup",
    finish: "glaze",
    handles: { kind: "mug", at: 0.55, size: 0.22 },
    pattern: "dots",
    repeat: 8,
    outline: [...foot(0.24, 0.04), P(0.24, 0.04), ...curve(0.04, 0.46, [0.26, 0.4, 0.5, 0.56], 8), P(0.57, 0.48, "rim", true), P(0.555, 0.49, "rim")],
    soilDepth: 0.08,
    colourways: [
      { name: "Rosebud", body: "#f6efe8", accent: "#e58aa0", rim: "#d8b45a" },
      { name: "Blue willow", body: "#f3f4f7", accent: "#4a6fb3", rim: "#4a6fb3" },
      { name: "Mint", body: "#c9ead9", accent: "#ffffff" }
    ]
  },
  {
    id: "mug",
    name: "Coffee Mug",
    finish: "glaze",
    handles: { kind: "mug", at: 0.5, size: 0.26 },
    pattern: "stripes",
    repeat: 1,
    outline: [...foot(0.4, 0.02), P(0.4, 0.02), P(0.42, 0.6, "body", true), P(0.42, 0.62, "rim", true), P(0.41, 0.63, "rim")],
    colourways: [
      { name: "Diner", body: "#f3efe6", accent: "#d64f3c" },
      { name: "Navy stripe", body: "#f3efe6", accent: "#2c3f66" },
      { name: "Camp enamel", body: "#2f6e4f", accent: "#f3efe6", rim: "#1f2a33" }
    ]
  },
  {
    id: "amphora",
    name: "Amphora",
    finish: "clay",
    handles: { kind: "ear", at: 0.8, size: 0.16 },
    pattern: "zigzag",
    repeat: 6,
    outline: [...foot(0.2), P(0.2, 0.03), ...curve(0.03, 0.66, [0.2, 0.42, 0.48, 0.36, 0.3], 12), P(0.36, 0.7, "rim", true), P(0.36, 0.73, "rim"), P(0.34, 0.74, "rim", true)],
    colourways: [
      { name: "Greek", body: "#d9824e", accent: "#2a2420" },
      { name: "Black figure", body: "#2a2420", accent: "#d9824e" },
      { name: "Sea", body: "#e8e2d2", accent: "#2c6c8c" }
    ]
  },
  {
    id: "cauldron",
    name: "Cauldron",
    finish: "metal",
    handles: { kind: "ear", at: 0.85, size: 0.12 },
    outline: [P(0, 0, "base"), P(0.12, 0, "base"), ...curve(0.02, 0.52, [0.2, 0.44, 0.52, 0.48, 0.44], 10), P(0.47, 0.54, "rim", true), P(0.47, 0.58, "rim"), P(0.45, 0.59, "rim", true)],
    colourways: [
      { name: "Iron", body: "#353535", accent: "#262626" },
      { name: "Copper", body: "#b86b3e", accent: "#8e4f2c" },
      { name: "Witchy", body: "#2d2a3e", accent: "#7ac96a" }
    ]
  },
  {
    id: "striped",
    name: "Beach Stripe",
    finish: "glaze",
    pattern: "stripes",
    repeat: 1,
    outline: [...foot(0.4), P(0.4, 0.03), ...curve(0.03, 0.6, [0.4, 0.46, 0.48]), ...roundLip(0.48, 0.62)],
    colourways: [
      { name: "Sailor", body: "#f4f0e6", accent: "#2c4f86" },
      { name: "Candy", body: "#f6eee6", accent: "#e36a7c" },
      { name: "Lime", body: "#f6f3df", accent: "#7fb348" }
    ]
  },
  {
    id: "polka",
    name: "Polka Pot",
    finish: "glaze",
    pattern: "dots",
    repeat: 6,
    outline: [...foot(0.36), P(0.36, 0.03), P(0.44, 0.56, "body", true), ...collar(0.44, 0.56, 0.035, 0.1)],
    colourways: [
      { name: "Cherry", body: "#d8443d", accent: "#f6efe2" },
      { name: "Sunny", body: "#f3c845", accent: "#ffffff" },
      { name: "Night", body: "#253556", accent: "#f6e7a6" }
    ]
  },
  {
    id: "drip",
    name: "Drip Glaze",
    finish: "glaze",
    pattern: "drip",
    repeat: 7,
    outline: [...foot(0.4), P(0.4, 0.03), ...curve(0.03, 0.6, [0.4, 0.47, 0.5, 0.49]), ...roundLip(0.49, 0.63)],
    colourways: [
      { name: "Ocean", body: "#c9b49a", accent: "#2f6f8f", rim: "#2f6f8f" },
      { name: "Honey", body: "#5a4a3e", accent: "#e0a43e", rim: "#e0a43e" },
      { name: "Matcha", body: "#e9e2d3", accent: "#7f9e4f", rim: "#7f9e4f" }
    ]
  },
  {
    id: "checker",
    name: "Checkerboard",
    finish: "glaze",
    pattern: "checker",
    repeat: 8,
    outline: [...foot(0.42), P(0.42, 0.03), P(0.46, 0.6, "body", true), ...roundLip(0.46, 0.63)],
    colourways: [
      { name: "Retro", body: "#f3eadb", accent: "#2f2f2f" },
      { name: "Peachy", body: "#f6dcc8", accent: "#e3876a" },
      { name: "Lilac", body: "#ece4f6", accent: "#9f86c9" }
    ]
  },
  {
    id: "wavy",
    name: "Wavy Squiggle",
    finish: "glaze",
    pattern: "waves",
    repeat: 5,
    outline: [...foot(0.38), P(0.38, 0.03), ...curve(0.03, 0.6, [0.38, 0.47, 0.48, 0.46]), ...roundLip(0.46, 0.62)],
    colourways: [
      { name: "Lagoon", body: "#bfe3e0", accent: "#2f8a8a" },
      { name: "Sunset", body: "#fbe0c2", accent: "#e36a3a" },
      { name: "Grape", body: "#e6dcf3", accent: "#6a4fa3" }
    ]
  },
  {
    id: "hearts",
    name: "Sweetheart",
    finish: "glaze",
    pattern: "hearts",
    repeat: 6,
    outline: [...foot(0.3), P(0.3, 0.03), ...curve(0.03, 0.56, [0.3, 0.46, 0.5, 0.46]), ...roundLip(0.46, 0.58)],
    colourways: [
      { name: "Valentine", body: "#f8dce2", accent: "#d8445a" },
      { name: "Cream", body: "#f6efe2", accent: "#e58aa0" }
    ]
  },
  {
    id: "crackle",
    name: "Crackle Glaze",
    finish: "glaze",
    pattern: "crackle",
    repeat: 3,
    outline: [...foot(0.3), P(0.3, 0.03), ...curve(0.03, 0.62, [0.3, 0.46, 0.5, 0.44, 0.4], 10), P(0.42, 0.64, "rim", true), P(0.41, 0.66, "rim")],
    colourways: [
      { name: "Celadon", body: "#bcd6c2", accent: "#6f8f7a" },
      { name: "Ivory", body: "#efe8d8", accent: "#8c7f68" }
    ]
  },
  {
    id: "mossy",
    name: "Mossy Ruin",
    finish: "stone",
    pattern: "moss",
    repeat: 3,
    outline: [...foot(0.42), P(0.42, 0.03), P(0.47, 0.58, "body", true), ...collar(0.47, 0.58, 0.03, 0.09)],
    colourways: [
      { name: "Forest", body: "#9a9488", accent: "#6f9a4a", rim: "#8aa860" },
      { name: "Ancient", body: "#bfa98a", accent: "#5f8a3a" }
    ]
  },
  {
    id: "scales",
    name: "Dragon Scales",
    finish: "glaze",
    pattern: "scales",
    repeat: 9,
    outline: [...foot(0.34), P(0.34, 0.03), ...curve(0.03, 0.6, [0.34, 0.46, 0.5, 0.47]), ...roundLip(0.47, 0.62)],
    colourways: [
      { name: "Jade dragon", body: "#3f8a66", accent: "#7fc49a" },
      { name: "Fire dragon", body: "#b8402e", accent: "#f0a03c" },
      { name: "Mermaid", body: "#3a6fa3", accent: "#8fe0d0" }
    ]
  },
  {
    id: "confetti",
    name: "Party Confetti",
    finish: "plastic",
    pattern: "confetti",
    repeat: 3,
    outline: [...foot(0.4), P(0.4, 0.03), P(0.45, 0.58, "body", true), P(0.47, 0.6, "rim", true), P(0.47, 0.63, "rim"), P(0.45, 0.64, "rim", true)],
    colourways: [
      { name: "Birthday", body: "#fff6e6", accent: "#e8486a" },
      { name: "Neon", body: "#262335", accent: "#4fe0c0" }
    ]
  },
  {
    id: "diamond",
    name: "Harlequin",
    finish: "glaze",
    pattern: "diamonds",
    repeat: 6,
    outline: [...foot(0.36), P(0.36, 0.03), P(0.45, 0.6, "body", true), ...roundLip(0.45, 0.62)],
    colourways: [
      { name: "Jester", body: "#f1e6d3", accent: "#b8302e" },
      { name: "Teal", body: "#e6efe9", accent: "#2f7f7a" }
    ]
  },
  {
    id: "pinstripe",
    name: "Pinstripe Tall",
    finish: "matte",
    pattern: "pinstripe",
    repeat: 24,
    outline: [...foot(0.36), P(0.36, 0.03), P(0.4, 0.84, "body", true), P(0.42, 0.86, "rim", true), P(0.42, 0.89, "rim"), P(0.4, 0.9, "rim", true)],
    colourways: [
      { name: "Graphite", body: "#3a3c40", accent: "#c9cdd2" },
      { name: "Paper", body: "#f2efe8", accent: "#2f2f2f" }
    ]
  }
];
function rand(seed) {
  let x = seed;
  return () => (x = x * 16807 % 2147483647) / 2147483647;
}
const PAINTERS$1 = {
  speckle: (ctx, W, H) => {
    const r = rand(7);
    for (let i = 0; i < 260; i++) {
      ctx.beginPath();
      ctx.arc(r() * W, r() * H, 1 + r() * 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  terrazzo: (ctx, W, H) => {
    const r = rand(11);
    for (let i = 0; i < 70; i++) {
      const x = r() * W;
      const y = r() * H;
      const s = 3 + r() * 8;
      ctx.beginPath();
      for (let k = 0; k < 5; k++) {
        const a = k / 5 * Math.PI * 2 + r();
        ctx.lineTo(x + Math.cos(a) * s * (0.6 + r() * 0.5), y + Math.sin(a) * s * (0.6 + r() * 0.5));
      }
      ctx.fill();
    }
  },
  stripes: (ctx, W, H) => {
    for (let k = 0; k < 5; k++) ctx.fillRect(0, H * (0.1 + k * 0.18), W, H * 0.08);
  },
  pinstripe: (ctx, W, H, n) => {
    for (let k = 0; k < n; k++) ctx.fillRect(k / n * W, 0, Math.max(1.5, W / n / 8), H);
  },
  dots: (ctx, W, H, n) => {
    const rows = 4;
    for (let j = 0; j < rows; j++)
      for (let k = 0; k < n; k++) {
        ctx.beginPath();
        ctx.arc((k + j % 2 * 0.5) / n * W, H * (0.16 + j * 0.23), Math.min(W / n, H / rows) * 0.22, 0, Math.PI * 2);
        ctx.fill();
      }
  },
  drip: (ctx, W, H, n) => {
    const r = rand(5);
    ctx.fillRect(0, 0, W, H * 0.22);
    for (let k = 0; k < n * 2; k++) {
      const x = k / (n * 2) * W + r() * (W / n / 3);
      const len = H * (0.22 + r() * 0.35);
      const w = W / n / 5 + r() * 6;
      ctx.fillRect(x - w / 2, 0, w, len);
      ctx.beginPath();
      ctx.arc(x, len, w / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  weave: (ctx, W, H, n) => {
    const rows = 9;
    const cw = W / n;
    const rh = H / rows;
    for (let j = 0; j < rows; j++)
      for (let k = 0; k < n; k++) {
        const x = k * cw;
        const y = j * rh;
        ctx.fillRect(x, y + rh - 2, cw, 2);
        if ((j + k) % 2) ctx.fillRect(x + cw / 2 - 1, y, 2, rh);
        else ctx.fillRect(x, y + rh / 2 - 1, cw * 0.5, 1.5);
      }
  },
  planks: (ctx, W, H, n) => {
    for (let k = 0; k < n; k++) ctx.fillRect(k / n * W, 0, 2.5, H);
    const r = rand(3);
    for (let i = 0; i < n * 2; i++) {
      ctx.beginPath();
      ctx.ellipse(r() * W, r() * H, 3, 1.6, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  zigzag: (ctx, W, H, n) => {
    for (const y0 of [0.25, 0.7]) {
      ctx.beginPath();
      for (let k = 0; k <= n * 2; k++) ctx.lineTo(k / (n * 2) * W, H * (y0 + (k % 2 ? 0.06 : -0.06)));
      for (let k = n * 2; k >= 0; k--) ctx.lineTo(k / (n * 2) * W, H * (y0 + 0.07 + (k % 2 ? 0.06 : -0.06)));
      ctx.fill();
    }
    ctx.fillRect(0, H * 0.48, W, H * 0.03);
  },
  checker: (ctx, W, H, n) => {
    const rows = 5;
    for (let j = 0; j < rows; j++) for (let k = 0; k < n; k++) if ((j + k) % 2) ctx.fillRect(k / n * W, j / rows * H, W / n + 0.5, H / rows + 0.5);
  },
  crackle: (ctx, W, H) => {
    const r = rand(13);
    ctx.lineWidth = 1.4;
    ctx.strokeStyle = ctx.fillStyle;
    for (let i = 0; i < 60; i++) {
      let x = r() * W;
      let y = r() * H;
      ctx.beginPath();
      ctx.moveTo(x, y);
      for (let k = 0; k < 4; k++) {
        x += (r() - 0.5) * 26;
        y += (r() - 0.5) * 26;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  },
  waves: (ctx, W, H, n) => {
    ctx.lineWidth = H * 0.035;
    ctx.strokeStyle = ctx.fillStyle;
    for (const y0 of [0.22, 0.48, 0.74]) {
      ctx.beginPath();
      for (let x = 0; x <= W; x += 2) ctx.lineTo(x, H * y0 + Math.sin(x / W * Math.PI * 2 * n) * H * 0.05);
      ctx.stroke();
    }
  },
  hearts: (ctx, W, H, n) => {
    const s = Math.min(W / n, H / 2) * 0.3;
    for (let j = 0; j < 2; j++)
      for (let k = 0; k < n; k++) {
        const x = (k + j % 2 * 0.5) / n * W;
        const y = H * (0.3 + j * 0.4);
        ctx.beginPath();
        ctx.moveTo(x, y + s);
        ctx.bezierCurveTo(x - s * 1.4, y, x - s * 0.6, y - s * 1.1, x, y - s * 0.35);
        ctx.bezierCurveTo(x + s * 0.6, y - s * 1.1, x + s * 1.4, y, x, y + s);
        ctx.fill();
      }
  },
  label: (ctx, W, H) => {
    ctx.fillRect(0, H * 0.18, W, H * 0.64);
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(W * 0.25, H * 0.5, H * 0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
  },
  moss: (ctx, W, H) => {
    const r = rand(17);
    for (let i = 0; i < 90; i++) {
      const top = r() < 0.4;
      const x = r() * W;
      const y = top ? r() * H * 0.25 : H - r() * H * 0.45;
      ctx.beginPath();
      ctx.arc(x, y, 4 + r() * 10, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  diamonds: (ctx, W, H, n) => {
    const rows = 3;
    for (let j = 0; j < rows; j++)
      for (let k = 0; k < n; k++) {
        if ((j + k) % 2) continue;
        const cx = (k + 0.5) / n * W;
        const cy = (j + 0.5) / rows * H;
        ctx.beginPath();
        ctx.moveTo(cx, cy - H / rows / 2);
        ctx.lineTo(cx + W / n / 2, cy);
        ctx.lineTo(cx, cy + H / rows / 2);
        ctx.lineTo(cx - W / n / 2, cy);
        ctx.fill();
      }
  },
  scales: (ctx, W, H, n) => {
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = ctx.fillStyle;
    const rows = 7;
    for (let j = 0; j < rows; j++)
      for (let k = 0; k <= n; k++) {
        ctx.beginPath();
        ctx.arc((k + j % 2 * 0.5) / n * W, j / rows * H, W / n / 2, 0.15 * Math.PI, 0.85 * Math.PI);
        ctx.stroke();
      }
  },
  confetti: (ctx, W, H) => {
    const r = rand(23);
    for (let i = 0; i < 80; i++) {
      ctx.save();
      ctx.translate(r() * W, r() * H);
      ctx.rotate(r() * Math.PI);
      ctx.fillRect(-4, -1.5, 8, 3);
      ctx.restore();
    }
  }
};
const texCache = /* @__PURE__ */ new Map();
function bodyTexture(def, cw) {
  const key2 = `${def.id}|${cw.name}`;
  const hit = texCache.get(key2);
  if (hit) return hit;
  const W = 256;
  const H = 128;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d");
  ctx.fillStyle = cw.body;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = cw.accent;
  for (const dx of [-W, 0, W]) {
    ctx.save();
    ctx.translate(dx, 0);
    ctx.fillStyle = cw.accent;
    ctx.strokeStyle = cw.accent;
    PAINTERS$1[def.pattern](ctx, W, H, def.repeat ?? 6);
    ctx.restore();
  }
  ctx.globalCompositeOperation = "destination-over";
  ctx.fillStyle = cw.body;
  ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = "source-over";
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = THREE.RepeatWrapping;
  t.anisotropy = 4;
  texCache.set(key2, t);
  return t;
}
const FINISH = {
  clay: { roughness: 0.95, metalness: 0 },
  matte: { roughness: 0.8, metalness: 0 },
  stone: { roughness: 0.9, metalness: 0 },
  glaze: { roughness: 0.55, metalness: 0 },
  plastic: { roughness: 0.6, metalness: 0 },
  metal: { roughness: 0.5, metalness: 0.2 },
  wood: { roughness: 0.85, metalness: 0 },
  wicker: { roughness: 0.9, metalness: 0 }
};
const matCache = /* @__PURE__ */ new Map();
function solid(colour, finish, flat = false, vertexColors = false, doubleSided = false) {
  const key2 = `${colour}|${finish}|${flat}|${vertexColors}|${doubleSided}`;
  let m = matCache.get(key2);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color: colour, ...FINISH[finish], flatShading: flat, vertexColors, side: doubleSided ? THREE.DoubleSide : THREE.FrontSide });
    matCache.set(key2, m);
  }
  return m;
}
function shade(colour, k) {
  return "#" + new THREE.Color(colour).multiplyScalar(k).getHexString();
}
const SOIL = new THREE.MeshStandardMaterial({ color: "#5a3d2b", roughness: 1 });
function buildPot(def, colourway = 0) {
  const cw = def.colourways[colourway % def.colourways.length];
  const segs = def.segments ?? 14;
  const wall = def.wall ?? 0.075;
  const soilDepth = def.soilDepth ?? 0.09;
  const pts = def.outline;
  const top = pts[pts.length - 1];
  const lipR = wall / 2;
  const lip = [];
  for (let k = 1; k <= 6; k++) {
    const a = k / 6 * Math.PI;
    lip.push({ r: top.r - lipR + lipR * Math.cos(a), y: top.y + lipR * Math.sin(a) * 0.9, tag: k === 6 ? "inner" : top.tag ?? "rim", sharp: k === 6 });
  }
  const height = top.y + lipR * 0.9;
  const rimRadius = Math.max(...pts.filter((p) => p.y > height - 0.15).map((p) => p.r));
  const innerR = top.r - wall;
  const soilY = height - soilDepth;
  const profile = [...pts.slice(0, -1), { ...top, sharp: top.sharp }, ...lip, P(innerR - 0.01, soilY - 0.02, "inner")];
  const colourOf = (tag) => tag === "rim" ? cw.rim ?? cw.body : tag === "band" ? cw.accent : tag === "base" ? cw.base ?? shade(cw.body, 0.8) : tag === "inner" ? cw.inner ?? shade(cw.rim ?? cw.body, 0.62) : cw.body;
  const group = new THREE.Group();
  const flutes = def.flutes;
  const runs = [];
  for (let i = 0; i < profile.length - 1; i++) {
    const tag = profile[i].tag ?? "body";
    const last = runs[runs.length - 1];
    if (last && last.tag === tag && !profile[i].sharp) last.to = i + 1;
    else runs.push({ tag, from: i, to: i + 1 });
  }
  const bodyIdx = profile.map((p, i) => i).filter((i) => (profile[i].tag ?? "body") === "body" && i < profile.length - 1);
  const yLo = bodyIdx.length ? Math.min(...bodyIdx.map((i) => profile[i].y)) : 0;
  const yHi = bodyIdx.length ? Math.max(...bodyIdx.map((i) => profile[i + 1].y)) : 1;
  for (const run of runs) {
    const ring = profile.slice(run.from, run.to + 1);
    const pos = [];
    const uv = [];
    const idx = [];
    for (let j = 0; j < ring.length; j++) {
      for (let i = 0; i <= segs; i++) {
        const phi = i / segs * Math.PI * 2 + (def.faceted && segs === 4 ? Math.PI / 4 : 0);
        let r = ring[j].r;
        if (flutes && run.tag === "body") r *= 1 - flutes[1] * Math.pow(Math.abs(Math.sin(phi * flutes[0] / 2)), 0.6);
        if (def.faceted) r /= Math.cos(Math.PI / segs);
        pos.push(Math.sin(phi) * r, ring[j].y, Math.cos(phi) * r);
        uv.push(i / segs, (ring[j].y - yLo) / Math.max(1e-6, yHi - yLo));
      }
    }
    for (let j = 0; j < ring.length - 1; j++)
      for (let i = 0; i < segs; i++) {
        const a = j * (segs + 1) + i;
        const b = a + 1;
        const c = a + segs + 1;
        const d = c + 1;
        idx.push(a, b, c, b, d, c);
      }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(idx);
    const col = new Float32Array(pos.length / 3 * 3);
    for (let v = 0; v < pos.length / 3; v++) {
      const t = THREE.MathUtils.clamp(pos[v * 3 + 1] / height, 0, 1);
      const k = run.tag === "inner" ? 1 : 0.8 + 0.28 * Math.pow(t, 0.8);
      col[v * 3] = col[v * 3 + 1] = col[v * 3 + 2] = k;
    }
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    geo.computeVertexNormals();
    const n = geo.getAttribute("normal");
    for (let j = 0; j < ring.length; j++) {
      const a = j * (segs + 1);
      const b = a + segs;
      const v = new THREE.Vector3(n.getX(a) + n.getX(b), n.getY(a) + n.getY(b), n.getZ(a) + n.getZ(b)).normalize();
      n.setXYZ(a, v.x, v.y, v.z);
      n.setXYZ(b, v.x, v.y, v.z);
    }
    const flat = !!def.faceted;
    let mat2;
    if (run.tag === "body" && def.pattern) {
      mat2 = new THREE.MeshStandardMaterial({ map: bodyTexture(def, cw), ...FINISH[def.finish], flatShading: flat, vertexColors: true });
    } else mat2 = solid(colourOf(run.tag), def.finish, flat, true, run.tag === "inner");
    const mesh = new THREE.Mesh(geo, mat2);
    group.add(mesh);
  }
  const soilR = innerR - 0.012;
  const soil = new THREE.Mesh(new THREE.CylinderGeometry(soilR * (def.faceted ? 1 / Math.cos(Math.PI / segs) : 1), soilR, 0.02, def.faceted ? segs : 14, 1), SOIL);
  if (def.faceted && segs === 4) soil.rotation.y = Math.PI / 4;
  soil.position.y = soilY - 0.01;
  group.add(soil);
  const radiusAt = (y) => {
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i];
      const b = pts[i + 1];
      if (y >= a.y && y <= b.y || y <= a.y && y >= b.y) {
        const t = Math.abs(b.y - a.y) < 1e-6 ? 1 : (y - a.y) / (b.y - a.y);
        return THREE.MathUtils.lerp(a.r, b.r, t);
      }
    }
    return y < pts[0].y ? pts[0].r : top.r;
  };
  const bottomRadius = Math.max(...pts.filter((p) => p.y <= Math.min(...pts.map((q) => q.y)) + 0.05).map((p) => p.r));
  addExtras(group, def, cw, { height, radiusAt, rimRadius });
  return { group, height, rimRadius, soilY, soilRadius: soilR, bottomRadius, radiusAt };
}
function addExtras(group, def, cw, info) {
  const accent = solid(cw.accent, def.finish === "clay" || def.finish === "stone" ? "glaze" : def.finish);
  const bodyMat = solid(cw.body, def.finish);
  if (def.saucer) {
    const r0 = info.radiusAt(0.03) + 0.1;
    const saucer2 = new THREE.Mesh(
      new THREE.LatheGeometry([new THREE.Vector2(0, 0), new THREE.Vector2(r0 - 0.03, 0), new THREE.Vector2(r0, 0.05), new THREE.Vector2(r0 - 0.015, 0.06), new THREE.Vector2(r0 - 0.04, 0.02), new THREE.Vector2(0, 0.02)], 16),
      def.id === "teacup" ? solid(cw.body, def.finish) : solid(cw.rim ?? cw.body, def.finish)
    );
    saucer2.position.y = -0.01;
    group.add(saucer2);
  }
  for (const h of def.hoops ?? []) {
    const y = h * info.height;
    const r = info.radiusAt(y) + 8e-3;
    const hoop = new THREE.Mesh(new THREE.TorusGeometry(r, 0.016, 5, 20), solid(cw.accent, "metal"));
    hoop.rotation.x = Math.PI / 2;
    hoop.position.y = y;
    hoop.scale.z = 1.6;
    group.add(hoop);
  }
  if (def.feet) {
    const { n, kind, size } = def.feet;
    const r = Math.max(0.16, info.radiusAt(size * 0.5 + 0.06) * 0.72);
    for (let k = 0; k < n; k++) {
      const a = k / n * Math.PI * 2 + Math.PI / n;
      let foot2;
      if (kind === "ball") foot2 = new THREE.Mesh(new THREE.SphereGeometry(size, 8, 6), accent);
      else if (kind === "block") foot2 = new THREE.Mesh(new THREE.BoxGeometry(size * 1.4, size, size * 1.4), accent);
      else if (kind === "claw") {
        foot2 = new THREE.Mesh(new THREE.SphereGeometry(size, 8, 6), accent);
        foot2.scale.set(1, 1.2, 1.4);
      } else {
        const geo = new THREE.CylinderGeometry(0.025, 0.035, size + 0.08, 6);
        foot2 = new THREE.Mesh(geo, accent);
        foot2.rotation.set(0, 0, 0);
        const out = new THREE.Vector3(Math.sin(a), 0, Math.cos(a));
        foot2.position.copy(out.clone().multiplyScalar(r + 0.03)).setY((size + 0.08) / 2 - 0.01);
        foot2.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(-out.x * 0.35, 1, -out.z * 0.35).normalize());
        group.add(foot2);
        continue;
      }
      foot2.position.set(Math.sin(a) * r, size * 0.8, Math.cos(a) * r);
      group.add(foot2);
    }
  }
  if (def.handles) {
    const { kind, at, size } = def.handles;
    const y = at * info.height;
    const r = info.radiusAt(y);
    if (kind === "bail") {
      const arc = new THREE.Mesh(new THREE.TorusGeometry(info.rimRadius + 0.02, 0.012, 4, 20, Math.PI), solid(cw.accent, "metal"));
      arc.position.y = y;
      arc.rotation.x = -0.25;
      group.add(arc);
    } else {
      const sides = kind === "mug" ? [1] : [1, -1];
      for (const s of sides) {
        const torus2 = new THREE.Mesh(new THREE.TorusGeometry(size * 0.5, kind === "mug" ? 0.035 : 0.028, 6, 12, kind === "mug" ? Math.PI * 1.25 : Math.PI), kind === "mug" ? bodyMat : bodyMat);
        torus2.position.set(s * (r + (kind === "mug" ? size * 0.25 : 0)), y - (kind === "mug" ? 0.02 : 0), 0);
        torus2.rotation.z = s > 0 ? -Math.PI / 2 - (kind === "mug" ? Math.PI * 0.125 : 0) : Math.PI / 2;
        group.add(torus2);
      }
    }
  }
}
const potById = (id) => POTS.find((p) => p.id === id) ?? POTS[0];
const SKIN_PATTERNS = {
  none: "plain skin",
  vitiligo: "pale patches (Monstera Albo)",
  marble: "streaky marbling (Marble Queen pothos)",
  splash: "patches + daubs (N’Joy pothos)",
  spots: "round daubs (Thai Constellation, whale fin)",
  speckle: "fine freckles (peace lily Domino)",
  brindle: "broken stripes round the limb",
  wavy: "wavy bands (snake plant)",
  pinstripe: "fine stripes down the limb (calathea)"
};
const IDS = { none: 0, vitiligo: 1, marble: 2, splash: 3, spots: 4, speckle: 5, brindle: 6, wavy: 7, pinstripe: 8 };
const NOISE = (
  /* glsl */
  `
  float h31(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
  vec3 h33(vec3 p) { return vec3(h31(p), h31(p + 17.3), h31(p + 41.7)); }
  float vnoise(vec3 x) {
    vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(h31(i), h31(i + vec3(1,0,0)), f.x), mix(h31(i + vec3(0,1,0)), h31(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(h31(i + vec3(0,0,1)), h31(i + vec3(1,0,1)), f.x), mix(h31(i + vec3(0,1,1)), h31(i + vec3(1,1,1)), f.x), f.y), f.z);
  }
  float fbm(vec3 p) { float v = 0.0, a = 0.5; for (int i = 0; i < 3; i++) { v += a * vnoise(p); p *= 2.03; a *= 0.5; } return v; }
  // distance to the nearest jittered cell point, minus that point's own radius (< 0 inside a dot of varying size)
  float dots(vec3 p, float keep) {
    vec3 i = floor(p); vec3 f = fract(p); float d = 9.0;
    for (int z = -1; z <= 1; z++) for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
      vec3 g = vec3(x, y, z); vec3 c = i + g; vec3 o = h33(c);
      if (h31(c + 7.1) > keep) continue;
      float r = 0.18 + 0.3 * h31(c + 3.3);
      d = min(d, length(g + o - f) - r);
    }
    return d;
  }
  // signed pattern field: > 0 = pattern colour
  // p: rest position shifted by the seed (noise), r: unshifted rest position (angle round the limb's own axis)
  float skinField(vec3 p, vec3 r) {
    float ang = atan(r.z, r.x);
    #if SKIN_PATTERN == 1
      return fbm(p * 5.5) - (0.6 - 0.25 * uAmount);
    #elif SKIN_PATTERN == 2
      return fbm(p * vec3(11.0, 3.5, 11.0) + fbm(p * 4.0) * 1.5) - (0.62 - 0.2 * uAmount);
    #elif SKIN_PATTERN == 3
      return max(fbm(p * 4.5) - (0.66 - 0.2 * uAmount), -dots(p * 13.0, 0.25 + 0.3 * uAmount));
    #elif SKIN_PATTERN == 4
      return -dots(p * 12.0, 0.45 + 0.45 * uAmount);
    #elif SKIN_PATTERN == 5
      return -dots(p * 26.0, 0.35 + 0.4 * uAmount) - 0.06;
    #elif SKIN_PATTERN == 6
      return sin(p.y * 46.0 + fbm(p * 7.0) * 7.0) * 0.5 + fbm(p * 14.0) * 0.6 - (0.75 - 0.4 * uAmount);
    #elif SKIN_PATTERN == 7
      return sin((p.y + 0.02 * sin(ang * 5.0 + p.y * 18.0)) * 48.0) - (0.55 - 0.9 * uAmount);
    #elif SKIN_PATTERN == 8
      return sin(ang * 9.0 + fbm(p * 3.0) * 1.5) - (0.82 - 0.5 * uAmount);
    #else
      return -1.0;
    #endif
  }
`
);
const cache = /* @__PURE__ */ new Map();
function skinMaterial(o) {
  const pattern = o.pattern ?? "none";
  const key2 = `${o.skin}|${pattern}|${o.patternColor}|${o.amount}|${o.seed}`;
  const hit = cache.get(key2);
  if (hit) return hit;
  const m = new THREE.MeshStandardMaterial({ color: o.skin, roughness: 0.7, vertexColors: true });
  m.userData.skinOpts = { ...o, pattern };
  if (pattern !== "none") {
    const uniforms = {
      uPatternColor: { value: new THREE.Color(o.patternColor ?? "#f1ead4") },
      uAmount: { value: o.amount ?? 0.5 },
      uSeed: { value: new THREE.Vector3((o.seed ?? 0) * 3.17, (o.seed ?? 0) * 1.31, (o.seed ?? 0) * 2.53) }
    };
    m.defines = { SKIN_PATTERN: IDS[pattern] };
    m.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, uniforms);
      shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vRest;").replace("#include <begin_vertex>", "#include <begin_vertex>\nvRest = position;");
      shader.fragmentShader = shader.fragmentShader.replace("#include <common>", `#include <common>
varying vec3 vRest;
uniform vec3 uPatternColor;
uniform float uAmount;
uniform vec3 uSeed;
${NOISE}`).replace(
        "#include <color_fragment>",
        `#include <color_fragment>
          {
            float f = skinField(vRest + uSeed, vRest);
            float w = fwidth(f) * 0.75 + 1e-4;
            float k = smoothstep(-w, w, f); // crisp, anti-aliased two-colour edge
            vec3 shadeK = vec3(1.0);
            #ifdef USE_COLOR
              shadeK = vColor.rgb; // keep the soft gradient on the pattern colour too
            #endif
            diffuseColor.rgb = mix(diffuseColor.rgb, uPatternColor * shadeK, k);
          }`
      );
    };
    m.customProgramCacheKey = () => `skin-${pattern}`;
  }
  cache.set(key2, m);
  return m;
}
const HIP_IN = 0.04;
const FIST_HEIGHT = 0.2;
const partsPromises = /* @__PURE__ */ new Map();
function loadBodyParts(base2 = "/assets/body", loader = new GLTFLoader()) {
  let partsPromise = partsPromises.get(base2);
  partsPromise ?? (partsPromise = (async () => {
    const load = async (url, darkTop) => {
      const root = (await loader.loadAsync(url)).scene;
      root.traverse((o) => {
        const m = o;
        if (!m.isSkinnedMesh) return;
        const g = m.geometry;
        const p = g.getAttribute("position");
        const c = new Float32Array(p.count * 3);
        for (let i = 0; i < p.count; i++) {
          const k = 0.8 + 0.25 * THREE.MathUtils.smoothstep(-p.getY(i) / darkTop, 0, 1);
          c[i * 3] = c[i * 3 + 1] = c[i * 3 + 2] = k;
        }
        g.setAttribute("color", new THREE.BufferAttribute(c, 3));
        m.frustumCulled = false;
      });
      const box2 = new THREE.Box3().setFromObject(root);
      return { root, drop: -box2.min.y };
    };
    const [arm, leg] = await Promise.all([load(`${base2}/arm.glb`, 0.6), load(`${base2}/leg.glb`, 0.45)]);
    return { arm: arm.root, leg: leg.root, armDrop: arm.drop, legDrop: leg.drop };
  })());
  partsPromises.set(base2, partsPromise);
  return partsPromise;
}
function makeLimb(src, side, mat2, k1 = 1, k2 = 1) {
  var _a, _b;
  const root = SkeletonUtils.clone(src);
  const bones = {};
  const rest = {};
  let mesh = null;
  const chain = [];
  root.traverse((o) => {
    if (o.isBone) {
      bones[o.name] = o;
      rest[o.name] = o.quaternion.clone();
      chain.push(o);
    }
    if (o.isSkinnedMesh) {
      mesh = o;
      mesh.material = mat2;
    }
  });
  let stretch = 0;
  if (mesh && (k1 !== 1 || k2 !== 1) && chain.length >= 3) {
    const m = mesh;
    root.updateMatrixWorld(true);
    const [b0, b1, b2] = chain;
    const toMesh = m.matrixWorld.clone().invert();
    const P0 = b0.getWorldPosition(new THREE.Vector3());
    const P1 = b1.getWorldPosition(new THREE.Vector3());
    const P2 = b2.getWorldPosition(new THREE.Vector3());
    const d1 = P1.clone().sub(P0).multiplyScalar(k1 - 1);
    const d2 = P2.clone().sub(P1).multiplyScalar(k2 - 1);
    stretch = -(d1.y + d2.y);
    const p0 = P0.clone().applyMatrix4(toMesh);
    const p1 = P1.clone().applyMatrix4(toMesh);
    const p2 = P2.clone().applyMatrix4(toMesh);
    const m1 = d1.clone().transformDirection(toMesh).multiplyScalar(d1.length());
    const m2 = d2.clone().transformDirection(toMesh).multiplyScalar(d2.length());
    const s1 = p1.clone().sub(p0);
    const s2 = p2.clone().sub(p1);
    m.geometry = m.geometry.clone();
    const pos = m.geometry.getAttribute("position");
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const t1 = THREE.MathUtils.clamp(v.clone().sub(p0).dot(s1) / s1.lengthSq(), 0, 1);
      const t2 = THREE.MathUtils.clamp(v.clone().sub(p1).dot(s2) / s2.lengthSq(), 0, 1) * (t1 > 0.999 ? 1 : 0);
      v.addScaledVector(m1, t1).addScaledVector(m2, t2);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    pos.needsUpdate = true;
    m.geometry.computeBoundingSphere();
    b1.position.copy(b0.worldToLocal(P1.clone().add(d1)));
    b1.updateMatrixWorld(true);
    b2.position.copy(b1.worldToLocal(P2.clone().add(d1).add(d2)));
    root.updateMatrixWorld(true);
    m.skeleton.calculateInverses();
    m.bind(m.skeleton, m.matrixWorld);
  }
  if (side < 0) root.scale.x = -1;
  root.updateMatrixWorld(true);
  const inv = root.matrixWorld.clone().invert();
  const at = (n) => bones[n] ? bones[n].getWorldPosition(new THREE.Vector3()).applyMatrix4(inv) : void 0;
  const knee = at("shin");
  const ankle = at("foot");
  (_a = bones.hand) == null ? void 0 : _a.scale.setScalar(1.3);
  (_b = bones.foot) == null ? void 0 : _b.scale.setScalar(1.12);
  return { root, bones, rest, side, knee, ankle, stretch };
}
function pose(l, bone, x, z = 0) {
  const b = l.bones[bone];
  if (!b) return;
  b.quaternion.copy(l.rest[bone]).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(x, 0, z)));
}
function buildMonster(pot, parts, opts = {}) {
  const seed = opts.seed ?? 0;
  const NAMES = ["legL", "legR", "armL", "armR"];
  const mat2 = (k) => {
    var _a;
    const own = (_a = opts.limbs) == null ? void 0 : _a[NAMES[k]];
    return skinMaterial({
      skin: opts.skin ?? "#8fae8c",
      pattern: (own == null ? void 0 : own.pattern) ?? opts.pattern,
      patternColor: (own == null ? void 0 : own.color) ?? opts.patternColor,
      amount: opts.patternAmount,
      seed: seed * 4 + k
    });
  };
  const kL = opts.legLength ?? 1;
  const kA = opts.armLength ?? 1;
  const group = new THREE.Group();
  const hipX = THREE.MathUtils.clamp(pot.bottomRadius * 0.45, 0.13, 0.2);
  const legs = [-1, 1].map((side, i) => makeLimb(parts.leg, side, mat2(i), kL, kL));
  const legDrop = parts.legDrop + legs[0].stretch;
  const potOffset = legDrop - HIP_IN;
  pot.group.position.y = potOffset;
  group.add(pot.group);
  legs.forEach((l, i) => {
    const side = i === 0 ? -1 : 1;
    l.hip = new THREE.Vector3(side * hipX, HIP_IN, 0);
    l.root.position.set(side * hipX, legDrop, 0);
    group.add(l.root);
  });
  const arms = [-1, 1].map((side, i) => makeLimb(parts.arm, side, mat2(2 + i), kA, kA));
  const armDrop = parts.armDrop + arms[0].stretch;
  const yS = Math.min(pot.height * 0.6, pot.height - 0.08);
  const rS = pot.radiusAt(yS);
  const drop = potOffset + yS - Math.max(0.05, FIST_HEIGHT - arms[0].stretch);
  const armLift = drop >= armDrop ? 0 : Math.min(0.45, Math.acos(THREE.MathUtils.clamp(drop / armDrop, 0.2, 1)));
  arms.forEach((l, i) => {
    const side = i === 0 ? -1 : 1;
    l.root.position.set(side * (rS - 0.06), yS, -0.01);
    l.root.userData.limb = true;
    pot.group.add(l.root);
  });
  const socket = new THREE.Group();
  socket.position.y = pot.soilY;
  socket.userData.limb = true;
  pot.group.add(socket);
  const m = { group, pot, potOffset, arms, legs, armLift, socket, legDrop };
  return m;
}
const mats = /* @__PURE__ */ new Map();
function mat(color, rough = 0.75, metal = 0, extra = {}) {
  const key2 = `${color}|${rough}|${metal}|${JSON.stringify(extra)}`;
  let m = mats.get(key2);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, ...extra });
    mats.set(key2, m);
  }
  return m;
}
const M = (geo, m, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => {
  const o = new THREE.Mesh(geo, m);
  o.position.set(x, y, z);
  o.rotation.set(rx, ry, rz);
  o.castShadow = true;
  return o;
};
const box = (w, h, d, r = 0.02) => new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2 - 1e-3, h / 2 - 1e-3, d / 2 - 1e-3));
const cyl = (rt, rb, h, seg = 20) => new THREE.CylinderGeometry(rt, rb, h, seg);
const sph = (r, seg = 16) => new THREE.SphereGeometry(r, seg, Math.max(8, seg * 0.6));
const cap = (r, len) => new THREE.CapsuleGeometry(r, len, 6, 18);
const lathe = (pts, seg = 24) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg);
function tube(pts, r, closed = false, seg = 24) {
  const c = new THREE.CatmullRomCurve3(pts.map(([x, y, z]) => new THREE.Vector3(x, y, z)), closed);
  return new THREE.TubeGeometry(c, seg, r, 8, closed);
}
const torus = (R, r, arc = Math.PI * 2) => new THREE.TorusGeometry(R, r, 8, 24, arc);
function labelTex(w, h, draw) {
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  draw(cv.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const FONT = '"Sniglet", "Arial Rounded MT Bold", sans-serif';
const pick = (list, cw) => list[cw % list.length];
function wateringCan(kind, c) {
  const g = new THREE.Group();
  const [body, accent] = c;
  const metal = kind === "classic" || kind === "haws";
  const bm = mat(body, metal ? 0.45 : kind === "kids" ? 0.5 : 0.4, metal ? 0.35 : 0);
  const am = mat(accent, 0.5, metal ? 0.3 : 0);
  if (kind === "teapot") {
    g.add(M(lathe([[0, 0], [0.13, 0], [0.2, 0.06], [0.23, 0.16], [0.2, 0.27], [0.12, 0.32], [0.07, 0.33], [0, 0.34]]), bm));
    g.add(M(sph(0.045), am, 0, 0.35, 0));
    g.add(M(tube([[0.18, 0.1, 0], [0.3, 0.16, 0], [0.38, 0.28, 0], [0.42, 0.32, 0]], 0.025), bm));
    g.add(M(torus(0.11, 0.022, Math.PI), am, -0.03, 0.3, 0, 0, 0, 0));
    g.add(M(cyl(0.035, 0.03, 0.03), am, 0.425, 0.33, 0, 0, 0, -0.9));
  } else if (kind === "slim") {
    g.add(M(lathe([[0, 0], [0.1, 0], [0.12, 0.04], [0.12, 0.34], [0.09, 0.4], [0, 0.41]]), bm));
    g.add(M(tube([[0.1, 0.06, 0], [0.3, 0.22, 0], [0.5, 0.4, 0], [0.62, 0.46, 0]], 0.014), am));
    g.add(M(tube([[-0.11, 0.3, 0], [-0.22, 0.32, 0], [-0.22, 0.12, 0], [-0.11, 0.1, 0]], 0.022), am));
  } else {
    const w = kind === "kids" ? 0.26 : 0.3;
    const h = kind === "kids" ? 0.28 : 0.34;
    const drum = M(lathe([[0, 0], [w * 0.92, 0], [w, 0.03], [w, h - 0.03], [w * 0.9, h], [0, h]]), bm);
    drum.scale.set(1, 1, kind === "haws" ? 0.85 : 0.75);
    g.add(drum);
    g.add(M(cyl(w * 0.55, w * 0.55, 0.02), am, 0, h + 5e-3, 0));
    const reach2 = kind === "haws" ? 0.72 : kind === "kids" ? 0.48 : 0.62;
    g.add(M(tube([[w * 0.8, 0.06, 0], [reach2 * 0.55, h * 0.55, 0], [reach2 * 0.85, h * 0.95, 0], [reach2, h * 1.12, 0]], kind === "kids" ? 0.03 : 0.022), bm));
    const rose = M(cyl(kind === "kids" ? 0.07 : 0.06, 0.025, 0.06), am, reach2 + 0.02, h * 1.15, 0, 0, 0, -1);
    rose.name = "rose";
    g.add(rose);
    g.add(M(cyl(kind === "kids" ? 0.066 : 0.056, kind === "kids" ? 0.066 : 0.056, 8e-3), mat("#d9d4c8", 0.4, 0.3), reach2 + 0.045, h * 1.17, 0, 0, 0, -1));
    g.add(M(tube([[-w * 0.85, h - 0.02, 0], [-w * 0.6, h + 0.2, 0], [w * 0.2, h + 0.22, 0], [w * 0.5, h - 0.02, 0]], 0.022), am));
    if (kind !== "kids") g.add(M(tube([[-w * 0.98, h * 0.85, 0], [-w * 1.25, h * 0.6, 0], [-w * 0.98, h * 0.2, 0]], 0.02), am));
    if (metal) for (const y of [0.04, h - 0.04]) g.add(M(torus(w * 1, 0.012), am, 0, y, 0, Math.PI / 2));
    if (kind === "kids") g.add(M(sph(0.05), mat("#ffffff", 0.5), 0, h * 0.55, w * 0.74));
  }
  return g;
}
function mister(c) {
  const g = new THREE.Group();
  const [body, accent] = c;
  g.add(M(lathe([[0, 0], [0.08, 0], [0.095, 0.02], [0.095, 0.2], [0.07, 0.25], [0.035, 0.27], [0, 0.27]]), mat(body, 0.15, 0, { transparent: true, opacity: 0.8 })));
  g.add(M(cyl(0.04, 0.045, 0.06), mat(accent, 0.5), 0, 0.3, 0));
  g.add(M(box(0.05, 0.05, 0.12, 0.015), mat(accent, 0.5), 0, 0.35, 0.04));
  g.add(M(box(0.03, 0.09, 0.04, 0.012), mat(accent, 0.5), 0, 0.29, 0.07, 0.3));
  return g;
}
const glow = (c = "#fff1c4") => mat(c, 0.3, 0, { emissive: new THREE.Color(c), emissiveIntensity: 1.2 });
function growLamp(kind, c) {
  const g = new THREE.Group();
  const [body, accent, light] = c;
  const bm = mat(body, 0.45, 0.2);
  const am = mat(accent, 0.5, 0.2);
  const lm = glow(light);
  if (kind === "clip") {
    g.add(M(box(0.14, 0.05, 0.12, 0.015), am, 0, 0.025, 0));
    g.add(M(tube([[0, 0.05, 0], [0.02, 0.3, 0.02], [0.12, 0.5, 0.06], [0.28, 0.55, 0.1]], 0.016, false, 40), bm));
    const head = new THREE.Group();
    head.add(M(lathe([[0.03, 0], [0.1, -0.02], [0.13, -0.08], [0.13, -0.1], [0, -0.1]]), am));
    head.add(M(cyl(0.11, 0.11, 0.01), lm, 0, -0.1, 0));
    head.position.set(0.3, 0.57, 0.1);
    head.rotation.z = -0.5;
    g.add(head);
  } else if (kind === "pendant") {
    g.add(M(cyl(8e-3, 8e-3, 0.6), am, 0, 0.9, 0));
    g.add(M(lathe([[0.03, 0.62], [0.06, 0.6], [0.2, 0.48], [0.24, 0.42], [0.22, 0.41], [0, 0.45]]), bm));
    g.add(M(sph(0.06), lm, 0, 0.44, 0));
  } else if (kind === "tripod") {
    for (let k = 0; k < 3; k++) {
      const a = k / 3 * Math.PI * 2;
      g.add(M(tube([[0, 0.7, 0], [Math.sin(a) * 0.2, 0.35, Math.cos(a) * 0.2], [Math.sin(a) * 0.3, 0, Math.cos(a) * 0.3]], 0.014), am));
    }
    g.add(M(cyl(0.012, 0.012, 0.35), am, 0, 0.87, 0));
    const head = new THREE.Group();
    head.add(M(lathe([[0.03, 0.08], [0.16, 0], [0.18, -0.04], [0, -0.03]]), bm));
    head.add(M(cyl(0.15, 0.15, 0.01), lm, 0, -0.03, 0));
    head.position.set(0.05, 1.05, 0.05);
    head.rotation.set(0.3, 0, -0.4);
    g.add(head);
  } else if (kind === "bar") {
    g.add(M(box(0.3, 0.03, 0.18, 0.015), am, 0, 0.015, 0));
    g.add(M(cyl(0.012, 0.012, 0.6), am, 0, 0.32, 0));
    g.add(M(box(0.62, 0.04, 0.1, 0.02), bm, 0, 0.64, 0.05));
    g.add(M(box(0.58, 0.012, 0.07, 6e-3), mat(light, 0.3, 0, { emissive: new THREE.Color(light), emissiveIntensity: 1.4 }), 0, 0.615, 0.05));
  } else {
    g.add(M(cyl(0.12, 0.14, 0.06), am, 0, 0.03, 0));
    g.add(M(sph(0.15, 24), lm, 0, 0.22, 0));
    g.add(M(torus(0.2, 0.012), bm, 0, 0.22, 0, Math.PI / 2 - 0.3));
  }
  return g;
}
const HANGER_ANGLES = [Math.PI / 3, -Math.PI / 3, Math.PI];
function surfaceAt(pot, a, y) {
  if (!pot.group) return pot.radiusAt(y);
  const g = pot.group;
  g.updateMatrixWorld(true);
  const far = 5;
  const o = new THREE.Vector3(Math.sin(a) * far, y, Math.cos(a) * far).applyMatrix4(g.matrixWorld);
  const t = new THREE.Vector3(0, y, 0).applyMatrix4(g.matrixWorld);
  const ray = new THREE.Raycaster(o, t.clone().sub(o).normalize(), 0, o.distanceTo(t));
  const meshes = [];
  g.traverse((x) => {
    let fx2 = false;
    for (let q = x; q && q !== g; q = q.parent) fx2 || (fx2 = !!q.userData.fx || !!q.userData.limb);
    if (x.isMesh && !fx2) meshes.push(x);
  });
  const hit = ray.intersectObjects(meshes, false)[0];
  if (!hit) return pot.radiusAt(y);
  const p = g.worldToLocal(hit.point.clone());
  return Math.hypot(p.x, p.z);
}
function hanger(kind, pot, top = 0.5, c = ["#e9dcc4", "#c9a36a"]) {
  const g = new THREE.Group();
  const [line, accent] = c;
  const { height, rimRadius: rimR } = pot;
  const lm = mat(line, 0.9);
  const am = mat(accent, 0.6, kind === "clips" ? 0.4 : 0);
  const ringY = height + top;
  const lineR = kind === "macrame" ? 0.012 : 7e-3;
  for (const a of HANGER_ANGLES) {
    const sx = Math.sin(a);
    const sz = Math.cos(a);
    const rimA = Math.max(surfaceAt(pot, a, height - 0.01), surfaceAt(pot, a, height - 0.04)) + 0.012;
    const rx = sx * rimA;
    const rz = sz * rimA;
    g.add(M(tube([[rx, height + 0.02, rz], [rx * 0.5, (height + ringY) / 2 + 0.02, rz * 0.5], [0, ringY, 0]], lineR, false, 12), lm));
    if (kind === "clips") {
      const clip = M(tube([[0, -0.05, 0.012], [0, 0, 0.012], [0, 0.03, -4e-3], [0, 0, -0.022], [0, -0.03, -0.022]], 8e-3, false, 16), am);
      clip.position.set(rx, height, rz);
      clip.rotation.y = a;
      g.add(clip);
    } else if (kind === "macrame") {
      const pts = [];
      for (let k = 0; k <= 8; k++) {
        const y = height + 0.02 - (height + 0.02) * (k / 8);
        const r = surfaceAt(pot, a, Math.max(0.01, y)) + 0.016;
        pts.push([sx * r, y, sz * r]);
      }
      pts.push([sx * pot.bottomRadius * 0.5, -0.02, sz * pot.bottomRadius * 0.5], [0, -0.035, 0]);
      g.add(M(tube(pts, lineR, false, 40), lm));
      const yk = height * 0.55;
      const rk = surfaceAt(pot, a, yk) + 0.018;
      g.add(M(sph(0.026), lm, sx * rk, yk, sz * rk));
      const f = 0.3;
      g.add(M(sph(0.024), lm, rx * (1 - f), height + 0.02 + (ringY - height - 0.02) * f, rz * (1 - f)));
    }
  }
  if (kind === "macrame") {
    g.add(M(sph(0.035), lm, 0, -0.04, 0));
    for (let k = 0; k < 7; k++) g.add(M(cyl(6e-3, 4e-3, 0.16), lm, Math.sin(k) * 0.015, -0.13, Math.cos(k) * 0.015));
  }
  g.add(M(torus(0.04, 0.012), am, 0, ringY, 0));
  g.userData.ringY = ringY;
  return g;
}
function ceilingHook(c = ["#3b3b3b"]) {
  const g = new THREE.Group();
  const m = mat(c[0], 0.4, 0.5);
  g.add(M(cyl(0.05, 0.05, 0.02), m, 0, -0.01, 0));
  g.add(M(tube([[0, -0.02, 0], [0, -0.1, 0], [0.03, -0.15, 0], [0, -0.18, 0], [-0.03, -0.15, 0]], 9e-3, false, 16), m));
  return g;
}
function rope(len, c = ["#d8c49e", "#9aa0a6"]) {
  const g = new THREE.Group();
  g.add(M(tube([[0, 0, 0], [0, -len * 0.5, 0], [0, -len + 0.06, 0]], 0.01, false, 6), mat(c[0], 0.95)));
  g.add(M(sph(0.016), mat(c[0], 0.95), 0, -len + 0.06, 0));
  g.add(M(tube([[0, -len + 0.07, 0], [0.025, -len + 0.06, 0], [0.02, -len + 0.035, 0], [0, -len + 0.02, 0], [-0.02, -len + 5e-3, 0], [-0.018, -len - 0.02, 0], [0, -len - 0.03, 0], [0.012, -len - 0.015, 0]], 6e-3, false, 24), mat(c[1] ?? "#9aa0a6", 0.35, 0.6)));
  return g;
}
function bench(c) {
  const g = new THREE.Group();
  const wood = mat(c[0], 0.85);
  const dark = mat(c[1], 0.85);
  g.add(M(box(1.6, 0.06, 0.7, 0.02), wood, 0, 0.78, 0));
  g.add(M(box(1.5, 0.04, 0.6, 0.015), wood, 0, 0.22, 0));
  for (const [x, z] of [[-0.74, -0.3], [0.74, -0.3], [-0.74, 0.3], [0.74, 0.3]]) g.add(M(box(0.06, 0.78, 0.06, 0.012), dark, x, 0.39, z));
  g.add(M(box(1.6, 0.6, 0.04, 0.015), mat(c[2] ?? "#e8dcc4", 0.9), 0, 1.11, -0.34));
  for (let i = 0; i < 9; i++) for (let j = 0; j < 3; j++) g.add(M(sph(0.012, 6), dark, -0.68 + i * 0.17, 0.9 + j * 0.17, -0.31));
  g.add(M(box(1.6, 0.12, 0.04, 0.015), wood, 0, 0.84, 0.33));
  g.add(M(box(0.3, 0.04, 0.3, 0.012), mat("#6b4a33", 1), -0.45, 0.82, 0.05));
  return g;
}
function sackGeo(w, h, d, seed = 0) {
  const geo = new THREE.SphereGeometry(1, 40, 36);
  const p = geo.getAttribute("position");
  const S = THREE.MathUtils.smoothstep;
  for (let i = 0; i < p.count; i++) {
    const x0 = p.getX(i);
    const y0 = p.getY(i);
    const z0 = p.getZ(i);
    const th = Math.atan2(z0, x0);
    const u = Math.acos(THREE.MathUtils.clamp(-y0, -1, 1)) / Math.PI;
    let a = Math.sin(Math.min(1, u / 0.1) * Math.PI / 2) * (1 + 0.06 * Math.sin(Math.PI * S(u, 0.05, 0.75)));
    a *= 1 - 0.82 * S(u, 0.62, 0.8);
    a += 0.38 * S(u, 0.8, 0.88) * (1 - S(u, 0.93, 1));
    a *= 1 + 0.12 * Math.sin(th * 7 + seed) * S(u, 0.82, 0.9);
    const dd = 1 - 0.35 * S(u, 0.15, 0.6);
    const c = Math.cos(th);
    const sn = Math.sin(th);
    const n = 2.8 - 1.6 * S(u, 0.55, 0.8);
    const k = Math.pow(Math.pow(Math.abs(c), n) + Math.pow(Math.abs(sn), n), -1 / n);
    let x = c * k * a * (w / 2);
    const z = sn * k * a * dd * (d / 2);
    let y = u < 0.1 ? 0.03 * h * Math.sin(u / 0.1 * Math.PI / 2) : 0.03 * h + (u - 0.1) / 0.9 * 0.97 * h;
    const puff = 0.12 * Math.sin(Math.PI * S(u, 0.05, 0.7)) * Math.cos(c * Math.PI / 2);
    const z2 = z * (1 + puff);
    x += 0.04 * w * Math.pow(u, 2) * (seed % 2 ? 1 : -1);
    y -= 0.03 * h * S(u, 0.3, 0.75) * Math.abs(c);
    p.setXYZ(i, x, y, z2);
  }
  geo.computeVertexNormals();
  return geo;
}
function sackIcon(kind, ink) {
  return labelTex(256, 256, (x, w, h) => {
    x.clearRect(0, 0, w, h);
    x.fillStyle = "rgba(255,248,234,0.92)";
    x.beginPath();
    x.arc(w / 2, h / 2, 118, 0, Math.PI * 2);
    x.fill();
    x.fillStyle = ink;
    x.strokeStyle = ink;
    x.lineCap = "round";
    x.lineWidth = 12;
    if (kind === "soil") {
      x.beginPath();
      x.ellipse(128, 170, 80, 38, 0, Math.PI, 0);
      x.fill();
      x.beginPath();
      x.moveTo(128, 140);
      x.lineTo(128, 92);
      x.stroke();
      for (const s of [-1, 1]) {
        x.beginPath();
        x.ellipse(128 + s * 26, 84, 24, 12, s * -0.5, 0, Math.PI * 2);
        x.fill();
      }
    } else if (kind === "food") {
      x.beginPath();
      x.ellipse(120, 140, 64, 34, -0.7, 0, Math.PI * 2);
      x.fill();
      x.strokeStyle = "rgba(255,248,234,0.9)";
      x.lineWidth = 6;
      x.beginPath();
      x.moveTo(80, 185);
      x.lineTo(160, 95);
      x.stroke();
      x.fillStyle = ink;
      const star = (cx, cy, r) => {
        x.beginPath();
        for (let i = 0; i < 8; i++) {
          const a = i / 8 * Math.PI * 2;
          const rr = i % 2 ? r * 0.35 : r;
          x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
        }
        x.fill();
      };
      star(185, 75, 26);
      star(205, 135, 14);
    } else if (kind === "perlite") {
      x.fillStyle = ink;
      for (let i = 0; i < 14; i++) {
        const a = i * 2.4;
        const r = 18 + 60 * Math.sqrt(i / 14);
        x.beginPath();
        x.arc(128 + Math.sin(a) * r, 140 + Math.cos(a) * r * 0.6, 17, 0, Math.PI * 2);
        x.fill();
      }
    } else if (kind === "bark") {
      for (let i = 0; i < 6; i++) {
        x.save();
        x.translate(80 + i % 3 * 48, 105 + Math.floor(i / 3) * 52);
        x.rotate((i % 2 ? 1 : -1) * 0.4);
        x.beginPath();
        x.roundRect(-30, -14, 60, 28, 10);
        x.fill();
        x.restore();
      }
    } else {
      x.beginPath();
      x.moveTo(36, 180);
      x.quadraticCurveTo(110, 100, 220, 180);
      x.closePath();
      x.fill();
      x.beginPath();
      x.arc(180, 85, 22, 0, Math.PI * 2);
      x.fill();
    }
  });
}
function supplyBag(kind, c, h = 0.42) {
  const g = new THREE.Group();
  const [sackCol, ink, tie] = c;
  const w = 0.3;
  const d = 0.2;
  const seed = kind.length;
  const sack = M(sackGeo(w, h, d, seed), mat(sackCol, 0.95));
  g.add(sack);
  const neckY = 0.03 * h + (0.71 - 0.1) / 0.9 * 0.97 * h;
  const tieM = mat(tie ?? "#c9a36a", 0.9);
  const lean = (u) => 0.04 * w * u * u * (seed % 2 ? 1 : -1);
  const tieRing = M(torus(w * 0.11, 0.011), tieM, lean(0.71), neckY, 0, Math.PI / 2);
  tieRing.scale.set(1, 0.75, 1);
  g.add(tieRing);
  g.add(pill([lean(0.71) + w * 0.08, neckY, d * 0.06], [lean(0.71) + w * 0.16, neckY - 0.05, d * 0.12], 8e-3, tieM));
  g.add(pill([lean(0.71) + w * 0.08, neckY, d * 0.06], [lean(0.71) + w * 0.19, neckY - 0.02, d * 0.02], 8e-3, tieM));
  const decal = new THREE.PlaneGeometry(0.16, 0.16, 10, 10);
  const dp = decal.getAttribute("position");
  const ray = new THREE.Raycaster();
  sack.updateMatrixWorld();
  const cy = h * 0.36;
  for (let i = 0; i < dp.count; i++) {
    const x = dp.getX(i);
    const y = dp.getY(i) + cy;
    ray.set(new THREE.Vector3(x, y, 1), new THREE.Vector3(0, 0, -1));
    const hit = ray.intersectObject(sack)[0];
    dp.setXYZ(i, x, y, (hit ? hit.point.z : d / 2) + 3e-3);
  }
  decal.computeVertexNormals();
  g.add(M(decal, new THREE.MeshStandardMaterial({ map: sackIcon(kind, ink), transparent: true, roughness: 0.95, polygonOffset: true, polygonOffsetFactor: -2 })));
  return g;
}
function shears(c) {
  const g = new THREE.Group();
  const blade2 = mat("#c9ccd0", 0.3, 0.7);
  const grip = mat(c[0], 0.5);
  for (const s of [-1, 1]) {
    const half = new THREE.Group();
    half.add(M(box(0.2, 0.012, 0.035, 6e-3), blade2, 0.1, 0, 0));
    half.add(M(cap(0.022, 0.16), grip, -0.11, 0, 0, 0, 0, Math.PI / 2));
    half.rotation.y = s * 0.18;
    half.position.y = 0.02 + (s > 0 ? 0.012 : 0);
    g.add(half);
  }
  g.add(M(cyl(0.014, 0.014, 0.04), mat("#8a8d90", 0.3, 0.7), 0, 0.02, 0));
  return g;
}
function trowel(c, fork = false) {
  const g = new THREE.Group();
  g.add(M(cap(0.028, 0.14), mat(c[0], 0.6), -0.13, 0.03, 0, 0, 0, Math.PI / 2));
  g.add(M(cyl(0.012, 0.012, 0.08), mat("#b9bcc0", 0.3, 0.6), -0.02, 0.03, 0, 0, 0, Math.PI / 2));
  if (fork) for (const z of [-0.03, 0, 0.03]) g.add(M(cap(8e-3, 0.16), mat("#b9bcc0", 0.3, 0.6), 0.1, 0.02, z, 0, 0, Math.PI / 2));
  else {
    const scoop = M(sph(0.07, 16), mat("#b9bcc0", 0.3, 0.6), 0.1, 0.02, 0);
    scoop.scale.set(1.5, 0.25, 0.8);
    g.add(scoop);
  }
  return g;
}
function dibber(c) {
  const g = new THREE.Group();
  g.add(M(cyl(0.025, 6e-3, 0.22), mat(c[0], 0.8), 0, 0.11, 0));
  g.add(M(sph(0.035), mat(c[0], 0.8), 0, 0.24, 0));
  return g;
}
function gloves(c) {
  const g = new THREE.Group();
  const m = mat(c[0], 0.9);
  for (const s of [-1, 1]) {
    const hand = new THREE.Group();
    const palm = M(box(0.12, 0.03, 0.16, 0.014), m, 0, 0.015, 0);
    hand.add(palm);
    for (let i = 0; i < 4; i++) hand.add(M(cap(0.013, 0.07), m, -0.04 + i * 0.027, 0.015, 0.12, Math.PI / 2));
    hand.add(M(cap(0.014, 0.05), m, 0.07, 0.015, 0.03, Math.PI / 2, 0, -0.7));
    hand.add(M(box(0.13, 0.035, 0.05, 0.012), mat(c[1], 0.9), 0, 0.017, -0.09));
    hand.position.set(s * 0.09, s > 0 ? 0.03 : 0, 0);
    hand.rotation.y = s * 0.25;
    g.add(hand);
  }
  return g;
}
function nurseryPot(c, r = 0.13, h = 0.14) {
  return M(lathe([[0, 0], [r * 0.78, 0], [r, h], [r * 1.06, h], [r * 1.06, h + 0.012], [r * 0.95, h + 0.012], [r * 0.74, 0.012], [0, 0.012]]), mat(c[0], 0.6));
}
function potStack(c) {
  const g = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    const p = nurseryPot(c);
    p.position.y = i * 0.035;
    p.rotation.z = (i % 2 ? 1 : -1) * 0.02;
    g.add(p);
  }
  return g;
}
function saucer(c) {
  return M(lathe([[0, 0], [0.22, 0], [0.26, 0.04], [0.25, 0.045], [0.2, 0.012], [0, 0.012]]), mat(c[0], 0.9));
}
function squareCup(col, w = 0.16, h = 0.15) {
  const g = new THREE.Group();
  const m = mat(col, 0.6);
  const outer = new THREE.CylinderGeometry(w / 2 * Math.SQRT2, w * 0.36 * Math.SQRT2, h, 4, 1, true);
  outer.rotateY(Math.PI / 4);
  g.add(M(outer, new THREE.MeshStandardMaterial({ color: col, roughness: 0.6, side: THREE.DoubleSide, flatShading: true }), 0, h / 2, 0));
  g.add(M(box(w * 0.74, 0.012, w * 0.74, 4e-3), m, 0, 6e-3, 0));
  for (let k = 0; k < 4; k++) {
    const a = k / 4 * Math.PI * 2;
    g.add(M(box(w + 0.014, 0.014, 0.014, 5e-3), m, Math.sin(a) * (w / 2), h, Math.cos(a) * (w / 2), 0, a, 0));
  }
  const hole = mat("#5b3d2b", 1);
  for (let k = 0; k < 4; k++) {
    const a = k / 4 * Math.PI * 2;
    const r = w * 0.37 + 3e-3;
    g.add(M(box(0.04, 0.016, 4e-3, 2e-3), hole, Math.sin(a) * r, 0.02, Math.cos(a) * r, 0, a, 0));
  }
  for (const [x, z] of [[-0.03, -0.03], [0.03, -0.03], [-0.03, 0.03], [0.03, 0.03], [0, 0]]) g.add(M(cyl(8e-3, 8e-3, 2e-3, 10), hole, x, -1e-3, z));
  return g;
}
function seedlingCup(c) {
  const g = new THREE.Group();
  g.add(squareCup(c[0]));
  g.add(M(box(0.15, 0.02, 0.15, 6e-3), mat("#5b3d2b", 1), 0, 0.138, 0));
  const mound = M(sph(0.03, 12), mat("#5b3d2b", 1), 0, 0.146, 0);
  mound.scale.set(1.6, 0.25, 1.6);
  g.add(mound);
  const leaf = mat("#78b866", 0.7);
  g.add(M(cyl(8e-3, 0.01, 0.1), leaf, 0, 0.18, 0));
  for (const s of [-1, 1]) {
    const l = M(sph(0.035, 12), leaf, s * 0.035, 0.235, 0);
    l.scale.set(1.2, 0.35, 0.8);
    l.rotation.z = s * 0.4;
    g.add(l);
  }
  return g;
}
function cuttingJar(c) {
  const g = new THREE.Group();
  g.add(M(lathe([[0, 0], [0.07, 0], [0.08, 0.02], [0.08, 0.16], [0.065, 0.19], [0, 0.19]]), mat("#cfe9e6", 0.1, 0, { transparent: true, opacity: 0.45 })));
  g.add(M(cyl(0.072, 0.072, 0.1), mat("#9fd3e6", 0.1, 0, { transparent: true, opacity: 0.5 }), 0, 0.06, 0));
  const stem = mat("#5e9a52", 0.7);
  g.add(M(tube([[0, 0.03, 0], [0.01, 0.15, 0], [0.03, 0.27, 0]], 8e-3), stem));
  for (const [x, y, s] of [[0.06, 0.27, 1], [-0.03, 0.24, -1]]) {
    const l = M(sph(0.05, 12), mat(c[0], 0.6), x, y, 0);
    l.scale.set(1.3, 0.3, 0.9);
    l.rotation.z = s * 0.5;
    g.add(l);
  }
  for (let k = 0; k < 4; k++) g.add(M(tube([[0, 0.03, 0], [Math.sin(k * 1.7) * 0.025, 0.01, Math.cos(k * 1.7) * 0.025], [Math.sin(k * 1.7) * 0.04, 0, Math.cos(k * 1.7) * 0.04]], 3e-3), mat("#f1ead2", 0.8)));
  return g;
}
function plantFoodSpray(c) {
  const g = mister([c[0], c[1]]);
  const tex = labelTex(128, 128, (x, w, h) => {
    x.fillStyle = c[2] ?? "#fff6e6";
    x.fillRect(0, 0, w, h);
    x.font = `800 40px ${FONT}`;
    x.textAlign = "center";
    x.fillText("🌿", w / 2, h * 0.55);
  });
  g.add(M(cyl(0.097, 0.097, 0.1, 20), mat("#ffffff", 0.8, 0, { map: tex }), 0, 0.11, 0));
  return g;
}
function labels(c) {
  const g = new THREE.Group();
  [0, 1, 2].forEach((i) => {
    const s = M(box(0.05, 0.16, 8e-3, 4e-3), mat(c[i % c.length], 0.6), i * 0.06 - 0.06, 0.08, 0, 0, 0, (i - 1) * 0.15);
    g.add(s);
  });
  return g;
}
function twine(c) {
  const g = new THREE.Group();
  g.add(M(cyl(0.08, 0.08, 0.1, 24), mat(c[0], 0.95), 0, 0.05, 0));
  g.add(M(cyl(0.03, 0.03, 0.105, 12), mat("#8a6a4a", 0.9), 0, 0.05, 0));
  g.add(M(tube([[0.08, 0.05, 0], [0.14, 0.02, 0.04], [0.2, 5e-3, 0.02]], 4e-3), mat(c[0], 0.95)));
  return g;
}
function moistureMeter(c) {
  const g = new THREE.Group();
  g.add(M(cyl(6e-3, 4e-3, 0.2), mat("#c9ccd0", 0.3, 0.7), 0, 0.1, 0));
  g.add(M(cyl(0.06, 0.06, 0.03, 24), mat(c[0], 0.5), 0, 0.23, 0, Math.PI / 2));
  const face = labelTex(128, 128, (x, w, h) => {
    x.fillStyle = "#fff8ea";
    x.fillRect(0, 0, w, h);
    const gr = x.createLinearGradient(20, 0, 108, 0);
    gr.addColorStop(0, "#d9734a");
    gr.addColorStop(0.5, "#7bbf6a");
    gr.addColorStop(1, "#4a8fd9");
    x.strokeStyle = gr;
    x.lineWidth = 14;
    x.beginPath();
    x.arc(64, 80, 42, Math.PI * 1.1, Math.PI * 1.9);
    x.stroke();
    x.strokeStyle = "#333";
    x.lineWidth = 5;
    x.beginPath();
    x.moveTo(64, 80);
    x.lineTo(84, 46);
    x.stroke();
  });
  g.add(M(cyl(0.052, 0.052, 5e-3, 24), mat("#ffffff", 0.6, 0, { map: face }), 0, 0.23, 0.016, Math.PI / 2));
  return g;
}
function mossPole(c) {
  const g = new THREE.Group();
  g.add(M(cyl(0.05, 0.05, 0.9, 12), mat(c[0], 1), 0, 0.45, 0));
  for (let i = 0; i < 18; i++) g.add(M(sph(0.035, 8), mat(c[1], 1), Math.sin(i * 2.3) * 0.045, 0.06 + i * 0.048, Math.cos(i * 2.3) * 0.045));
  return g;
}
function bamboo(c) {
  const g = new THREE.Group();
  g.add(M(cyl(0.012, 0.014, 0.9), mat(c[0], 0.6), 0, 0.45, 0));
  for (let i = 1; i < 5; i++) g.add(M(cyl(0.016, 0.016, 0.012), mat(c[1], 0.6), 0, i * 0.18, 0));
  return g;
}
function pebbleTray(c) {
  const g = new THREE.Group();
  g.add(M(lathe([[0, 0], [0.3, 0], [0.32, 0.05], [0.3, 0.055], [0.28, 0.01], [0, 0.01]], 32), mat(c[0], 0.5)));
  g.add(M(cyl(0.28, 0.28, 0.02, 32), mat("#a8d8e6", 0.1, 0, { transparent: true, opacity: 0.6 }), 0, 0.02, 0));
  for (let i = 0; i < 30; i++) {
    const a = i * 2.4;
    const r = 0.04 + 0.22 * Math.sqrt(i / 30);
    const p = M(sph(0.03, 8), mat(["#d8d2c4", "#bfb8a8", "#e8e2d4", "#a9a294"][i % 4], 0.8), Math.sin(a) * r, 0.03, Math.cos(a) * r);
    p.scale.set(1, 0.6, 0.9);
    g.add(p);
  }
  return g;
}
function caddy(c) {
  const g = new THREE.Group();
  g.add(M(cyl(0.34, 0.34, 0.05, 32), mat(c[0], 0.8), 0, 0.09, 0));
  for (let k = 0; k < 4; k++) {
    const a = k / 4 * Math.PI * 2 + Math.PI / 4;
    g.add(M(sph(0.04, 10), mat(c[1], 0.5), Math.sin(a) * 0.26, 0.04, Math.cos(a) * 0.26));
  }
  return g;
}
function cloche(c) {
  const g = new THREE.Group();
  const glass = mat("#e8f6f4", 0.05, 0, { transparent: true, opacity: 0.28, side: THREE.DoubleSide });
  g.add(M(lathe([[0.2, 0], [0.2, 0.25], [0.17, 0.36], [0.1, 0.42], [0, 0.44]], 32), glass));
  g.add(M(sph(0.035), mat(c[0], 0.4, 0.2), 0, 0.46, 0));
  g.add(M(cyl(0.21, 0.22, 0.02, 32), mat(c[1], 0.8), 0, 0.01, 0));
  return g;
}
function bugSpray(c) {
  const g = new THREE.Group();
  const tex = labelTex(128, 128, (x, w, h) => {
    x.fillStyle = c[0];
    x.fillRect(0, 0, w, h);
    x.font = `64px "Apple Color Emoji"`;
    x.textAlign = "center";
    x.textBaseline = "middle";
    x.fillText("🐛", w / 2, h / 2);
    x.strokeStyle = "#d8443d";
    x.lineWidth = 10;
    x.beginPath();
    x.arc(w / 2, h / 2, 40, 0, Math.PI * 2);
    x.moveTo(w / 2 - 28, h / 2 + 28);
    x.lineTo(w / 2 + 28, h / 2 - 28);
    x.stroke();
  });
  g.add(M(cyl(0.065, 0.065, 0.24, 20), mat("#ffffff", 0.5, 0, { map: tex }), 0, 0.12, 0));
  g.add(M(cyl(0.05, 0.065, 0.05, 20), mat(c[1], 0.4), 0, 0.265, 0));
  g.add(M(cyl(0.022, 0.022, 0.03), mat(c[1], 0.4), 0, 0.3, 0));
  return g;
}
const SEEDS = [
  ["Sunflower", "#f6c544", "🌻"],
  ["Basil", "#7cbf6a", "🌿"],
  ["Tomato", "#e05a48", "🍅"],
  ["Strawberry", "#f08a9a", "🍓"],
  ["Pumpkin", "#ec9a3e", "🎃"],
  ["Cactus", "#9cc78a", "🌵"],
  ["Mystery", "#a98ad6", "❓"],
  ["Monstera", "#4f9a6a", "🌱"]
];
function seedPacket(cw) {
  const [name, col, emoji] = SEEDS[cw % SEEDS.length];
  const tex = labelTex(192, 256, (x, w, h) => {
    x.fillStyle = "#fff6e6";
    x.fillRect(0, 0, w, h);
    x.fillStyle = col;
    x.beginPath();
    x.roundRect(12, 12, w - 24, h * 0.66, 18);
    x.fill();
    x.font = `92px "Apple Color Emoji"`;
    x.textAlign = "center";
    x.textBaseline = "middle";
    x.fillText(emoji, w / 2, h * 0.36);
    x.fillStyle = "#4a2c20";
    x.font = `800 ${name.length > 8 ? 26 : 32}px ${FONT}`;
    x.fillText(name.toUpperCase(), w / 2, h * 0.84);
  });
  const g = new THREE.Group();
  const p = M(box(0.16, 0.22, 0.02, 8e-3), [mat("#fff6e6", 0.8), mat("#fff6e6", 0.8), mat("#fff6e6", 0.8), mat("#fff6e6", 0.8), mat("#ffffff", 0.8, 0, { map: tex }), mat("#fff6e6", 0.8)], 0, 0.11, 0, -0.12);
  g.add(p);
  return g;
}
function pill(a, b, r, m) {
  const A = new THREE.Vector3(...a);
  const B = new THREE.Vector3(...b);
  const o = new THREE.Mesh(cap(r, Math.max(1e-3, A.distanceTo(B))), m);
  o.position.copy(A).add(B).multiplyScalar(0.5);
  o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
  o.castShadow = true;
  return o;
}
function blob$1(rx, ry, rz, m, x = 0, y = 0, z = 0, seg = 24) {
  const o = M(sph(1, seg), m, x, y, z);
  o.scale.set(rx, ry, rz);
  return o;
}
function wingGeo(pts, thick = 4e-3, round = 0.4) {
  const sh = new THREE.Shape();
  const n = pts.length;
  const lerp = (p, q, t) => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
  for (let i = 0; i < n; i++) {
    const prev = pts[(i + n - 1) % n];
    const cur = pts[i];
    const next = pts[(i + 1) % n];
    const a = lerp(cur, prev, round / 2);
    const b = lerp(cur, next, round / 2);
    if (i === 0) sh.moveTo(...a);
    else sh.lineTo(...a);
    sh.quadraticCurveTo(cur[0], cur[1], b[0], b[1]);
  }
  sh.closePath();
  const g = new THREE.ExtrudeGeometry(sh, { depth: thick, bevelEnabled: true, bevelThickness: thick, bevelSize: thick * 1.2, bevelSegments: 4, curveSegments: 10 });
  g.translate(0, 0, -thick / 2);
  g.rotateX(Math.PI / 2);
  g.computeVertexNormals();
  return g;
}
function pest(kind) {
  const g = new THREE.Group();
  if (kind === "aphid") {
    const m = mat("#9fd68f", 0.7);
    const b = blob$1(0.045, 0.04, 0.06, m, 0, 0.052, -8e-3);
    b.rotation.x = -0.15;
    g.add(b, blob$1(0.03, 0.028, 0.03, m, 0, 0.046, 0.045));
    for (const s of [-1, 1]) {
      for (const z of [-0.038, -6e-3, 0.026]) g.add(pill([s * 0.03, 0.024, z], [s * 0.04, 0.011, z + 4e-3], 0.011, m));
      g.add(pill([s * 0.012, 0.066, 0.058], [s * 0.018, 0.078, 0.066], 9e-3, m));
      g.add(pill([s * 0.016, 0.08, -0.05], [s * 0.02, 0.09, -0.06], 9e-3, m));
    }
  } else if (kind === "mite") {
    const m = mat("#ec6e58", 0.7);
    g.add(blob$1(0.042, 0.038, 0.044, m, 0, 0.05, 0));
    for (const s of [-1, 1]) for (const z of [-0.022, 0.022]) g.add(pill([s * 0.026, 0.026, z], [s * 0.034, 0.012, z * 1.25], 0.012, m));
  } else if (kind === "mealybug") {
    const m = mat("#f6f2ea", 0.85);
    g.add(blob$1(0.042, 0.04, 0.065, m, 0, 0.035, 0));
    for (let k = 0; k < 4; k++) g.add(blob$1(0.04 - Math.abs(k - 1.5) * 7e-3, 0.036, 0.014, m, 0, 0.04, -0.036 + k * 0.024));
    for (const s of [-1, 1]) {
      for (const z of [-0.035, -8e-3, 0.02]) g.add(pill([s * 0.036, 0.018, z], [s * 0.048, 0.012, z + 4e-3], 9e-3, m));
      g.add(pill([s * 0.012, 0.045, -0.05], [s * 0.022, 0.075, -0.08], 9e-3, m));
      g.add(pill([s * 0.014, 0.025, 0.055], [s * 0.03, 0.02, 0.08], 8e-3, m));
    }
  } else if (kind === "gnat") {
    const m = mat("#5d5c5a", 0.7);
    g.add(blob$1(0.034, 0.032, 0.04, m, 0, 0.075, -8e-3), blob$1(0.022, 0.022, 0.022, m, 0, 0.078, 0.038));
    for (const s of [-1, 1]) {
      for (const z of [-0.02, 5e-3, 0.03]) {
        g.add(pill([s * 0.02, 0.062, z], [s * 0.045, 0.05, z * 1.5], 8e-3, m), pill([s * 0.045, 0.05, z * 1.5], [s * 0.058, 9e-3, z * 2], 8e-3, m));
      }
      const w = new THREE.Group();
      w.add(blob$1(4e-3, 0.05, 0.016, mat("#77756f", 0.6), 0, 0.05, 0));
      w.position.set(s * 0.014, 0.098, -0.01);
      w.rotation.set(-0.55, 0, -s * 0.38);
      g.add(w);
    }
  } else if (kind === "scale") {
    const m = mat("#a8714f", 0.7);
    g.add(blob$1(0.058, 0.012, 0.05, m, 0, 0.012, 0), blob$1(0.038, 0.02, 0.034, m, 0, 0.016, -2e-3));
  } else if (kind === "thrips") {
    const m = mat("#f2cd5e", 0.7);
    g.add(pill([0, 0.026, 0], [0, 0.03, 0.05], 0.022, m), pill([0, 0.022, -0.075], [0, 0.026, 0], 0.016, m));
    for (const s of [-1, 1]) {
      g.add(pill([s * 0.012, 0.01, -0.02], [s * 0.026, 6e-3, -0.03], 5e-3, m), pill([s * 0.012, 0.01, 0.025], [s * 0.026, 6e-3, 0.032], 5e-3, m));
      const wing = new THREE.Group();
      const wm = mat("#f7e1a0", 0.7);
      wing.add(blob$1(4e-3, 9e-3, 0.05, wm, 0, 0, -0.05));
      for (let k = 0; k < 5; k++) wing.add(pill([0, 6e-3, -0.024 - k * 0.013], [0, 0.014, -0.03 - k * 0.013], 45e-4, wm));
      wing.position.set(s * 0.01, 0.048, 0.03);
      wing.rotation.set(0.5, 0, -s * 0.5);
      g.add(wing);
    }
  } else {
    const m = mat("#f8f6f0", 0.8);
    g.add(blob$1(0.022, 0.024, 0.04, m, 0, 0.03, 5e-3), M(sph(0.018), m, 0, 0.034, 0.045));
    for (const s of [-1, 1]) {
      const w = M(wingGeo([[0, 0.035], [0, -0.035], [0.065, -0.055], [0.055, 0]], 35e-4, 0.6), m);
      w.position.set(s * 0.01, 0.05, 0);
      w.rotation.set(0, 0, s * 1.15);
      w.scale.x = s;
      g.add(w);
    }
    for (const s of [-1, 1]) for (const z of [-0.01, 0.025]) g.add(pill([s * 0.014, 0.014, z], [s * 0.022, 6e-3, z], 5e-3, m));
  }
  return g;
}
function foodBalls(c) {
  const g = new THREE.Group();
  g.add(M(lathe([[0, 0], [0.1, 0], [0.11, 0.02], [0.11, 0.2], [0.08, 0.23], [0, 0.23]]), mat("#e8f4f4", 0.1, 0, { transparent: true, opacity: 0.35 })));
  g.add(M(cyl(0.085, 0.085, 0.04, 20), mat(c[1], 0.5), 0, 0.25, 0));
  for (let i = 0; i < 26; i++) {
    const a = i * 2.4;
    const r = 0.025 + 0.06 * (i * 0.37 % 1);
    g.add(M(sph(0.02, 8), mat(c[0], 0.4), Math.sin(a) * r, 0.03 + Math.floor(i / 7) * 0.035, Math.cos(a) * r));
  }
  return g;
}
function treat(c) {
  const g = new THREE.Group();
  g.add(M(sph(0.06, 16), mat(c[0], 0.35), 0, 0.06, 0));
  g.add(M(sph(0.024, 10), mat("#ffffff", 0.3), -0.022, 0.09, 0.03));
  return g;
}
const PROPS = [
  // watering cans
  { id: "can-classic", name: "Classic can", group: "watering", colourways: [["#b9bfc2", "#8e969a"], ["#3f7a5a", "#2c5a40"], ["#e3c45a", "#b8952e"]], build: (cw) => wateringCan("classic", pick(PROPS[0].colourways, cw)) },
  { id: "can-teapot", name: "Teapot can", group: "watering", colourways: [["#f2ece0", "#d8443d"], ["#7fb5d9", "#f6efe2"], ["#e9a3b5", "#f6efe2"]], build: (cw) => wateringCan("teapot", pick(PROPS[1].colourways, cw)) },
  { id: "can-slim", name: "Indoor slim can", group: "watering", colourways: [["#f4efe6", "#2f2f2f"], ["#2f2f2f", "#c9a45a"], ["#a9c9b4", "#f4efe6"]], build: (cw) => wateringCan("slim", pick(PROPS[2].colourways, cw)) },
  { id: "can-kids", name: "Kid's can", group: "watering", colourways: [["#f2c845", "#e8486a"], ["#4fa8e8", "#f2c845"], ["#e8486a", "#4fd0a0"]], build: (cw) => wateringCan("kids", pick(PROPS[3].colourways, cw)) },
  { id: "can-haws", name: "Copper can", group: "watering", colourways: [["#c47a48", "#8e4f2c"], ["#d9b25a", "#9a7a36"]], build: (cw) => wateringCan("haws", pick(PROPS[4].colourways, cw)) },
  { id: "mister", name: "Mister", group: "watering", colourways: [["#bfe3e8", "#f4efe6"], ["#f3d6dc", "#2f2f2f"], ["#e8e2d6", "#4f8a68"]], build: (cw) => mister(pick(PROPS[5].colourways, cw)) },
  // grow lamps
  { id: "lamp-clip", name: "Clip lamp", group: "lamps", colourways: [["#2f2f2f", "#2f2f2f", "#ffd7f0"], ["#f4efe6", "#f4efe6", "#fff1c4"]], build: (cw) => growLamp("clip", pick(PROPS[6].colourways, cw)) },
  { id: "lamp-pendant", name: "Pendant grow light", group: "lamps", colourways: [["#2f2f2f", "#c9a45a", "#fff1c4"], ["#f2ece0", "#2f2f2f", "#ffd7f0"]], build: (cw) => growLamp("pendant", pick(PROPS[7].colourways, cw)) },
  { id: "lamp-tripod", name: "Tripod lamp", group: "lamps", colourways: [["#f4efe6", "#7a4f30", "#fff1c4"], ["#e3c45a", "#2f2f2f", "#fff1c4"]], build: (cw) => growLamp("tripod", pick(PROPS[8].colourways, cw)) },
  { id: "lamp-bar", name: "LED grow bar", group: "lamps", colourways: [["#e9e6e0", "#9a9a9a", "#ff9ee8"], ["#2f2f2f", "#2f2f2f", "#c8a6ff"]], build: (cw) => growLamp("bar", pick(PROPS[9].colourways, cw)) },
  { id: "lamp-orb", name: "Sun orb", group: "lamps", colourways: [["#e3c45a", "#c79a62", "#ffe08a"], ["#f2ece0", "#8a6a4a", "#fff1c4"]], build: (cw) => growLamp("orb", pick(PROPS[10].colourways, cw)) },
  // hangers (shown on a stand-in pot rim)
  { id: "hang-clips", name: "Clip hanger", group: "hangers", colourways: [["#e9dcc4", "#9aa0a6"], ["#2f2f2f", "#c9a45a"]], build: (cw) => hangerDemo("clips", pick(PROPS[11].colourways, cw)) },
  { id: "hang-macrame", name: "Macramé hanger", group: "hangers", colourways: [["#efe3cc", "#c9a36a"], ["#e9b48f", "#c9a36a"], ["#a9c9b4", "#c9a36a"]], build: (cw) => hangerDemo("macrame", pick(PROPS[12].colourways, cw)) },
  { id: "hook", name: "Ceiling hook + rope", group: "hangers", colourways: [["#3b3b3b"], ["#c9a45a"]], build: (cw) => {
    const g = new THREE.Group();
    [0.35, 0.6, 0.85].forEach((len, i) => {
      const h = ceilingHook(pick(PROPS[13].colourways, cw));
      h.position.set((i - 1) * 0.2, 1, 0);
      const r = rope(len);
      r.position.set((i - 1) * 0.2, 1 - 0.17, 0);
      g.add(h, r);
    });
    return g;
  } },
  // potting station + supplies
  { id: "bench", name: "Potting bench", group: "potting", colourways: [["#d6ac74", "#a87d4c", "#efe3cc"], ["#a9c9b4", "#7fa38e", "#f4efe6"]], build: (cw) => bench(pick(PROPS[14].colourways, cw)) },
  { id: "bag-soil", name: "Potting soil", group: "potting", colourways: [["#d9c4a0", "#6b4a33", "#8a6a4a"], ["#c9a882", "#3a2418", "#e9dcc4"]], build: (cw) => supplyBag("soil", pick(PROPS[15].colourways, cw)) },
  { id: "bag-food", name: "Fertiliser", group: "potting", colourways: [["#e9e1cf", "#4f8a68", "#c9a36a"], ["#cfe0c4", "#2f5a40", "#e9dcc4"]], build: (cw) => supplyBag("food", pick(PROPS[16].colourways, cw), 0.38) },
  { id: "bag-perlite", name: "Perlite", group: "potting", colourways: [["#e9e4d8", "#4f86b8", "#9aa0a6"], ["#dfe8ee", "#4f86b8", "#e9dcc4"]], build: (cw) => supplyBag("perlite", pick(PROPS[17].colourways, cw), 0.36) },
  { id: "bag-bark", name: "Bark mix", group: "potting", colourways: [["#d8c4a4", "#8a5a34", "#5a3a22"]], build: (cw) => supplyBag("bark", pick(PROPS[18].colourways, cw), 0.38) },
  { id: "bag-sand", name: "Sand", group: "potting", colourways: [["#ece0c4", "#c9a050", "#8a6a3a"]], build: (cw) => supplyBag("sand", pick(PROPS[19].colourways, cw), 0.32) },
  { id: "shears", name: "Shears", group: "tools", colourways: [["#d8443d"], ["#4f8a68"], ["#f2c845"]], build: (cw) => shears(pick(PROPS[20].colourways, cw)) },
  { id: "trowel", name: "Trowel", group: "tools", colourways: [["#d8443d"], ["#4fa8e8"], ["#c79a62"]], build: (cw) => trowel(pick(PROPS[21].colourways, cw)) },
  { id: "fork", name: "Hand fork", group: "tools", colourways: [["#d8443d"], ["#4fa8e8"], ["#c79a62"]], build: (cw) => trowel(pick(PROPS[22].colourways, cw), true) },
  { id: "dibber", name: "Dibber", group: "tools", colourways: [["#c79a62"]], build: (cw) => dibber(pick(PROPS[23].colourways, cw)) },
  { id: "gloves", name: "Gloves", group: "tools", colourways: [["#f2c845", "#4f8a68"], ["#e9a3b5", "#f6efe2"], ["#7fb5d9", "#2f5a80"]], build: (cw) => gloves(pick(PROPS[24].colourways, cw)) },
  // nursery
  { id: "nursery-stack", name: "Nursery pots", group: "nursery", colourways: [["#2f2f2f"], ["#4f8a68"], ["#c96f45"]], build: (cw) => potStack(pick(PROPS[25].colourways, cw)) },
  { id: "saucer", name: "Saucer", group: "nursery", colourways: [["#c96f45"], ["#e9e1d4"]], build: (cw) => saucer(pick(PROPS[26].colourways, cw)) },
  { id: "seedling", name: "Seedling cup", group: "nursery", colourways: [["#262626"]], build: (cw) => seedlingCup(pick(PROPS[27].colourways, cw)) },
  { id: "cutting", name: "Cutting in water", group: "nursery", colourways: [["#5e9a52"], ["#7bbf6a"]], build: (cw) => cuttingJar(pick(PROPS[28].colourways, cw)) },
  // care extras
  { id: "food-spray", name: "Plant food spray", group: "care", colourways: [["#bfe3a8", "#4f8a68", "#fff6e6"]], build: (cw) => plantFoodSpray(pick(PROPS[29].colourways, cw)) },
  { id: "labels", name: "Plant labels", group: "care", colourways: [["#f6efe2", "#f2c845", "#a9c9b4"]], build: (cw) => labels(pick(PROPS[30].colourways, cw)) },
  { id: "twine", name: "Twine", group: "care", colourways: [["#d8c49e"]], build: (cw) => twine(pick(PROPS[31].colourways, cw)) },
  { id: "meter", name: "Moisture meter", group: "care", colourways: [["#4f8a68"], ["#f2c845"]], build: (cw) => moistureMeter(pick(PROPS[32].colourways, cw)) },
  { id: "moss-pole", name: "Moss pole", group: "care", colourways: [["#8a6a4a", "#7a9a52"]], build: (cw) => mossPole(pick(PROPS[33].colourways, cw)) },
  { id: "bamboo", name: "Bamboo stake", group: "care", colourways: [["#d9c27a", "#b89a4a"]], build: (cw) => bamboo(pick(PROPS[34].colourways, cw)) },
  { id: "pebble-tray", name: "Pebble tray", group: "care", colourways: [["#f4efe6"], ["#9cb3d4"]], build: (cw) => pebbleTray(pick(PROPS[35].colourways, cw)) },
  { id: "caddy", name: "Plant caddy", group: "care", colourways: [["#c79a62", "#2f2f2f"], ["#e9e1d4", "#c9a45a"]], build: (cw) => caddy(pick(PROPS[36].colourways, cw)) },
  { id: "cloche", name: "Cloche", group: "care", colourways: [["#c9a45a", "#a87d4c"]], build: (cw) => cloche(pick(PROPS[37].colourways, cw)) },
  { id: "bug-spray", name: "Bug spray", group: "care", colourways: [["#f2c845", "#2f2f2f"], ["#a9c9b4", "#4f8a68"]], build: (cw) => bugSpray(pick(PROPS[38].colourways, cw)) },
  // seeds, pests, treats
  { id: "seeds", name: "Seed packet", group: "seeds", colourways: SEEDS.map(([n]) => [n]), build: (cw) => seedPacket(cw) },
  { id: "pest-aphid", name: "Aphid", group: "pests", colourways: [[""]], build: () => pest("aphid") },
  { id: "pest-mite", name: "Spider mite", group: "pests", colourways: [[""]], build: () => pest("mite") },
  { id: "pest-mealybug", name: "Mealybug", group: "pests", colourways: [[""]], build: () => pest("mealybug") },
  { id: "pest-gnat", name: "Fungus gnat", group: "pests", colourways: [[""]], build: () => pest("gnat") },
  { id: "pest-scale", name: "Scale", group: "pests", colourways: [[""]], build: () => pest("scale") },
  { id: "pest-thrips", name: "Thrips", group: "pests", colourways: [[""]], build: () => pest("thrips") },
  { id: "pest-whitefly", name: "Whitefly", group: "pests", colourways: [[""]], build: () => pest("whitefly") },
  { id: "food-balls", name: "Plant food pearls", group: "treats", colourways: [["#7bc6e8", "#f2c845"], ["#f08a9a", "#4f8a68"], ["#f2c845", "#e8486a"]], build: (cw) => foodBalls(pick(PROPS[47].colourways, cw)) },
  { id: "treat", name: "Plant treat", group: "treats", colourways: [["#7bc6e8"], ["#f08a9a"], ["#f2c845"], ["#9be08a"]], build: (cw) => treat(pick(PROPS[48].colourways, cw)) }
];
function hangerDemo(kind, c) {
  const g = new THREE.Group();
  const H = 0.5;
  const R = 0.32;
  const shape = { height: H + 0.04, rimRadius: R * 1.06, bottomRadius: R * 0.8, radiusAt: (y) => y >= H ? R * 1.06 : R * 0.8 + (R - R * 0.8) * (y / H) };
  g.add(M(lathe([[0, 0], [R * 0.8, 0], [R, H], [R * 1.06, H], [R * 1.06, H + 0.04], [R * 0.95, H + 0.04], [0, H]]), mat("#c96f45", 0.9)));
  const hg = hanger(kind, shape, 0.5, c);
  g.add(hg);
  const r = rope(0.3);
  r.position.y = hg.userData.ringY + 0.3;
  g.add(r);
  const hk = ceilingHook();
  hk.position.y = hg.userData.ringY + 0.3 + 0.17;
  g.add(hk);
  return g;
}
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const TAU = Math.PI * 2;
function base() {
  return {
    y: 0,
    x: 0,
    z: 0,
    pitch: 0,
    roll: 0,
    yaw: 0,
    squash: 1,
    spin: 0,
    legs: [{ mode: "plant", z: 0, lift: 0 }, { mode: "plant", z: 0, lift: 0 }],
    width: 1,
    hipZ: 0,
    arms: [{ upper: 0, spread: 0.2, fore: -0.18 }, { upper: 0, spread: 0.2, fore: -0.18 }],
    waggle: 0.035,
    waggleRate: 1.3,
    speed: 0
  };
}
function key(k, u) {
  for (let i = 0; i < k.length - 1; i++)
    if (u <= k[i + 1][0]) {
      const x = THREE.MathUtils.clamp((u - k[i][0]) / Math.max(1e-6, k[i + 1][0] - k[i][0]), 0, 1);
      const e = k[i + 1][2] ?? "io";
      const f = e === "in" ? x * x * x : e === "out" ? 1 - (1 - x) ** 3 : e === "lin" ? x : x * x * x * (x * (x * 6 - 15) + 10);
      return THREE.MathUtils.lerp(k[i][1], k[i + 1][1], f);
    }
  return k[k.length - 1][1];
}
const win = (u, a, b, e = 0.06) => THREE.MathUtils.smoothstep(u, a, a + e) * (1 - THREE.MathUtils.smoothstep(u, b - e, b));
const GAITS = {
  idle: { label: "idle", period: 3.2, stance: 1, stride: 0, lift: 0, crouch: 0.012, bob: 6e-3, sway: 0.012, armSwing: 0.04, elbow: 0.18 },
  walk: { label: "walk", period: 1.3, stance: 0.62, stride: 0.2, lift: 0.07, crouch: 0.02, bob: 0.014, lean: 0.04, roll: 0.04, sway: 0.05, armSwing: 0.32, elbow: 0.3, waggle: 0.07 },
  waddle: { label: "waddle (toddler)", period: 0.95, stance: 0.62, stride: 0.1, lift: 0.055, width: 1.4, crouch: 0.035, bob: 0.012, lean: -0.04, roll: 0.15, sway: 0.06, yaw: 0.08, armSwing: 0.12, spread: 0.6, elbow: 0.35, waggle: 0.1 },
  scamper: { label: "scamper (excited toddler)", period: 0.48, stance: 0.55, stride: 0.13, lift: 0.07, width: 1.15, crouch: 0.02, bob: 0.03, lean: 0.1, roll: 0.06, armSwing: 0.45, armUp: -0.7, spread: 0.45, elbow: 0.6, elbowSwing: 0.3, waggle: 0.14 },
  strut: { label: "strut (proud)", period: 1.15, stance: 0.62, stride: 0.36, lift: 0.09, crouch: 0.075, bob: 0.025, lean: -0.17, roll: 0.07, sway: 0.04, yaw: 0.22, armSwing: 0.85, spread: 0.35, elbow: 0.15, waggle: 0.1 },
  sneak: { label: "sneak (tiptoe)", period: 1.8, stance: 0.66, stride: 0.16, lift: 0.12, crouch: 0.07, bob: 6e-3, lean: 0.14, roll: 0.02, armSwing: 0.05, armUp: -0.95, spread: 0.32, elbow: 1.5, waggle: 0.03 },
  lurch: { label: "lurch (slow, heavy)", period: 2.3, stance: 0.7, stride: 0.22, lift: 0.05, limp: 0.85, crouch: 0.07, bob: 0.03, lean: 0.22, roll: 0.1, sway: 0.06, yaw: 0.06, armSwing: 0.14, armUp: 0.08, spread: 0, elbow: 0.04, waggle: 0.09 },
  trudge: { label: "trudge (tired)", period: 1.9, stance: 0.68, stride: 0.12, lift: 0.025, crouch: 0.02, bob: 0.02, lean: 0.2, roll: 0.06, armSwing: 0.1, armUp: 0.1, spread: 0.05, elbow: 0, waggle: 0.03 },
  run: { label: "run", period: 0.44, stance: 0.32, stride: 0.42, lift: 0.17, crouch: 0.05, bob: 0, flight: 0.05, lean: 0.28, roll: 0.03, yaw: 0.1, armSwing: 1, elbow: 1.45, elbowSwing: 0.2, waggle: 0.18 },
  carry: { label: "carry something (pick up & walk)", period: 1.4, stance: 0.64, stride: 0.16, lift: 0.06, crouch: 0.03, bob: 0.016, lean: -0.05, roll: 0.05, sway: 0.05, armSwing: 0, elbow: 0.6, waggle: 0.07 }
};
function gait(g, t, curvatureX = 0) {
  const f = base();
  const moving = g.stride > 0;
  let c = t / g.period % 1;
  if (g.limp) c = (c - g.limp * 0.07 * Math.sin(TAU * c) / 1 + 1) % 1;
  const s = Math.sin(TAU * c);
  f.width = g.width ?? 1;
  f.pitch = g.lean ?? 0;
  const twice = 0.5 - 0.5 * Math.cos(2 * TAU * c);
  f.y = -(g.crouch ?? 0) + (g.bob ?? 0) * (moving ? twice : 0.5 + 0.5 * Math.sin(t * 2));
  const hop = g.hopBob ? g.hopBob * Math.max(0, Math.sin(2 * TAU * c - 0.6)) ** 2 : 0;
  f.y += hop;
  if (g.flight && moving) f.y += g.flight * 0.5 * (1 + Math.cos(2 * TAU * (c - (g.stance + 0.5) / 2)));
  if (g.limp) f.y -= g.limp * 0.035 * Math.max(0, Math.sin(TAU * c + 0.4)) ** 3;
  f.roll = -(g.roll ?? 0) * s - (g.limp ?? 0) * 0.06 * Math.max(0, s);
  f.x = (g.sway ?? 0) * (moving ? s : Math.sin(t * 0.8));
  f.yaw = (g.yaw ?? 0) * s;
  for (const i of [0, 1]) {
    const side = i === 0 ? -1 : 1;
    const p = (c + (side > 0 ? 0 : 0.5)) % 1;
    let z = 0;
    let lift = 0;
    const stride = g.stride * (1 - side * curvatureX);
    if (moving) {
      if (p < g.stance) z = stride / 2 - stride * (p / g.stance);
      else {
        const u = (p - g.stance) / (1 - g.stance);
        z = -stride / 2 + stride * THREE.MathUtils.smootherstep(u, 0, 1);
        lift = g.lift * Math.sin(Math.PI * u) * (g.limp && side < 0 ? 1 - g.limp * 0.75 : 1);
        if (g.limp && side < 0) z = -stride / 2 + stride * Math.pow(THREE.MathUtils.smootherstep(u, 0, 1), 1.8);
      }
    }
    f.legs[i] = { mode: "plant", z, lift: lift + hop * 0.9 };
  }
  const swing = moving ? s : Math.sin(t * 1.6) * 0.5;
  for (const i of [0, 1]) {
    const side = i === 0 ? -1 : 1;
    const a = swing * side * (g.armSwing ?? 0.3);
    f.arms[i] = {
      upper: (g.armUp ?? 0) + a,
      spread: 0.2 + (g.spread ?? 0) + (g.limp ? 0.05 * Math.sin(TAU * c * 2) : 0),
      fore: -(g.elbow ?? 0.2) - (g.elbowSwing ?? 0.2) * Math.max(0, -a)
    };
  }
  if (!moving) idleLife(f, t);
  f.waggle = g.waggle ?? 0.04;
  f.waggleRate = moving ? 2 / g.period : 1.3;
  f.speed = moving ? g.stride / (g.stance * g.period) : 0;
  return f;
}
function idleLife(f, t) {
  const look2 = key([[0, 0], [0.08, 0.32], [0.28, 0.32], [0.36, -0.28], [0.55, -0.28], [0.62, 0], [1, 0]], t / 7.3 % 1);
  f.yaw = look2;
  f.roll = 0.07 * look2 + 0.015 * Math.sin(t * 0.8);
  f.pitch = 0.03 * Math.sin(t * 0.55) - 0.04 * Math.abs(look2);
  const shift = Math.sin(t * 0.7);
  f.x = 0.03 * shift;
  f.squash = 1 + 6e-3 * Math.sin(t * 2);
  f.legs = [{ mode: "plant", z: 0, lift: 0 }, { mode: "plant", z: 0, lift: 0 }];
  for (const i of [0, 1]) {
    const side = i === 0 ? -1 : 1;
    f.arms[i].upper = 0.05 * Math.sin(t * 1.3 + side);
    f.arms[i].spread = 0.2 + 0.04 * Math.sin(t * 0.9 + side * 2);
  }
}
function onBelly(m, yFrac, x, out = 0.08) {
  const y = m.pot.height * yFrac;
  return V(x, y, m.pot.radiusAt(y) + out);
}
const AIR = { from: 0.36, to: 0.66, height: 0.4, tuck: 0.14 };
const FIST = 0.1;
function fistCenter(m, l, out = new THREE.Vector3()) {
  const w = m.group.worldToLocal(l.bones.hand.getWorldPosition(new THREE.Vector3()));
  const e = m.group.worldToLocal(l.bones.fore.getWorldPosition(new THREE.Vector3()));
  return out.copy(w).addScaledVector(w.clone().sub(e).normalize(), FIST);
}
const SCRUFF_H = 0.45;
function heldPose(m, t, f, up, lift, kickAmt, swing) {
  const H = m.pot.height;
  const r = m.pot.radiusAt(H);
  const kp = t * TAU * 1.6;
  const kL = Math.sin(kp) * kickAmt;
  const kR = Math.sin(kp + Math.PI) * kickAmt;
  const pitch = swing ? swing.pitch : 0.38 * up + up * (-0.07 * Math.sin(kp - 0.9) * kickAmt + 0.02 * Math.sin(t * 1.3));
  const roll = up * (0.13 * Math.sin(kp - 0.7) * kickAmt + 0.025 * Math.sin(t * 1.1));
  const dz = -r - (-r * Math.cos(pitch) - H * Math.sin(pitch));
  const dy = H - (-r * Math.sin(pitch) + H * Math.cos(pitch));
  f.pitch = pitch;
  f.roll = roll;
  f.z = dz;
  f.x = H * Math.sin(roll);
  f.y = lift + dy + H * (1 - Math.cos(roll));
  const lag = swing ? -0.55 * swing.vel : 0;
  for (const i of [0, 1]) {
    const k = i === 0 ? kL : kR;
    const thigh = (-0.42 * k + lag) * up;
    const shin = (0.25 * Math.max(0, -k) + 0.25 * Math.max(0, -lag)) * up;
    f.legs[i] = up > 0.01 ? { mode: "fk", thigh, shin, foot: (0.2 * k + 0.3 * lag) * up, splay: -0.22 * up } : { mode: "plant", z: 0, lift: 0 };
    const paddle = Math.sin(kp + i * Math.PI + 1.2) * kickAmt;
    f.arms[i] = { upper: (0.95 * paddle + 0.6 * lag) * up, spread: 0.25 + (0.45 * kickAmt + 0.15 * Math.abs(paddle)) * up, fore: -0.12 - 0.08 * Math.abs(paddle) * up };
  }
  f.waggle = 0.025 + 0.025 * kickAmt * up;
  f.waggleRate = 3;
  f.leafDamp = 8;
}
const HANG = { top: 0.5, rope: 0.45, base: 0.62 };
function hangSetup(m) {
  return { kind: "macrame", rope: HANG.rope, ...m.group.userData.hang };
}
function swingFrame(m, t) {
  const f = base();
  const H = m.pot.height;
  const { kind, rope: rope2 } = hangSetup(m);
  const D = H + HANG.top + rope2;
  const w = Math.sqrt(9.8 / (D * 1.6)) * 1.25;
  const ph = t * w;
  const A = 0.34;
  const phi = A * Math.sin(ph);
  const pivotY = HANG.base + D;
  f.pitch = phi;
  f.y = pivotY - D * Math.cos(phi) - m.potOffset;
  f.z = -D * Math.sin(phi);
  f.hang = kind;
  const fwd = Math.max(0, -Math.sin(ph));
  const bk = Math.max(0, Math.sin(ph));
  for (const i of [0, 1]) {
    const kick = 0.12 * Math.sin(t * 9 + i * Math.PI) * (0.4 + 0.6 * fwd);
    f.legs[i] = { mode: "fk", thigh: -0.25 - 0.85 * fwd + 0.35 * bk + kick, shin: 0.2 + 1 * bk - 0.15 * fwd, foot: 0.2 - 0.3 * fwd + 0.2 * bk, splay: -0.08 };
  }
  const R = m.pot.rimRadius + 0.012;
  const fr = 0.3;
  for (const i of [0, 1]) {
    const a = HANGER_ANGLES[0];
    f.arms[i] = {
      upper: -0.4,
      spread: 0.2,
      fore: -0.6,
      target: V(Math.sin(a) * R * (1 - fr), H + HANG.top * fr, Math.cos(a) * R * (1 - fr)),
      fist: true,
      w: 1,
      pole: V(1, -0.6, 0.3),
      stretch: 1.8,
      bend: 0.8
    };
  }
  f.noClear = true;
  f.waggle = 0.04;
  f.waggleRate = 2;
  f.leafDamp = 5;
  return f;
}
function settle(target, tau, w = 3.4, zeta = 1.5) {
  if (tau <= 0) return { pitch: 0, vel: 0 };
  const e = Math.exp(-zeta * tau);
  const c = Math.cos(w * tau);
  const sn = Math.sin(w * tau);
  return { pitch: target * (1 - e * (c + zeta / w * sn)), vel: target * e * sn * (w + zeta * zeta / w) };
}
function scruffFrame(m, t, part) {
  const f = base();
  if (part === "held") {
    heldPose(m, t, f, 1, SCRUFF_H, 0.75);
    return f;
  }
  if (part === "up") {
    const T2 = 4;
    const tt2 = t % T2;
    const lift2 = SCRUFF_H * THREE.MathUtils.smootherstep(tt2, 0.12, 0.5);
    const up = THREE.MathUtils.smoothstep(lift2, 0, SCRUFF_H * 0.4);
    const sw = settle(0.38, tt2 - 0.15, 4.2, 1.1);
    const kick = 0.85 * THREE.MathUtils.smoothstep(tt2, 0.55, 0.85);
    heldPose(m, t, f, up, lift2, kick, { pitch: sw.pitch * up, vel: sw.vel * up * 1.9 });
    const surprise = win(tt2, 0.15, 1.7, 0.25);
    for (const i of [0, 1]) {
      const wave = Math.sin(t * 9 + i * 1.7);
      const a = f.arms[i];
      f.arms[i] = {
        upper: THREE.MathUtils.lerp(a.upper, -1.5 + 0.5 * wave, surprise),
        spread: THREE.MathUtils.lerp(a.spread, 0.9 + 0.25 * wave, surprise),
        fore: THREE.MathUtils.lerp(a.fore, -0.35 - 0.25 * Math.max(0, wave), surprise)
      };
    }
    f.squash = key([[0, 1], [0.03, 0.92], [0.08, 1.1], [0.16, 1.02], [0.3, 1], [1, 1]], tt2 / T2);
    const whip = Math.exp(-Math.max(0, tt2 - 0.15) * 1.4) * (tt2 > 0.1 ? 1 : 0);
    f.waggle = 0.03 + 0.28 * whip;
    f.waggleRate = 7;
    f.leafDamp = 3 + 5 * (1 - whip);
    return f;
  }
  const T = 4;
  const tt = t % T;
  const tRel = 0.45;
  const g = 26;
  const fall = Math.max(0, tt - tRel);
  const lift = Math.max(0, SCRUFF_H - 0.5 * g * fall * fall);
  const tLand = tRel + Math.sqrt(2 * SCRUFF_H / g);
  const falling = tt >= tRel && tt < tLand;
  const fu = falling ? (tt - tRel) / (tLand - tRel) : tt >= tLand ? 1 : 0;
  const level = 1 - THREE.MathUtils.smoothstep(fu, 0, 0.85);
  const snap = THREE.MathUtils.smoothstep(fall, 0, 0.07);
  heldPose(m, t, f, 1 - fu, lift, 0.85 * (1 - snap), { pitch: 0.38 * level, vel: 0 });
  if (snap >= 1) f.legs = [{ mode: "plant", z: 0, lift }, { mode: "plant", z: 0, lift }];
  else for (const lf of f.legs) if (lf.mode === "fk") lf.thigh *= 1 - snap, lf.shin *= 1 - snap, lf.foot *= 1 - snap, lf.splay = (lf.splay ?? 0) * (1 - snap);
  const land = tt - tLand;
  if (land > 0) {
    const absorb = -0.21 * Math.exp(-land * 5.5) * Math.sin(land * 19.6);
    const rock = Math.exp(-land * 1.6);
    const roll = 0.16 * rock * Math.sin(land * 7.5);
    f.y = absorb + 0.03 * rock * Math.max(0, Math.sin(land * 15));
    f.roll = roll;
    f.pitch = 0.07 * rock * Math.sin(land * 5.5 + 1);
    f.x = -0.04 * rock * Math.sin(land * 7.5);
    f.squash = 1 + 1.4 * absorb;
    for (const i of [0, 1]) {
      const side = i === 0 ? -1 : 1;
      const fling = THREE.MathUtils.smoothstep(land, 0, 0.12);
      const catchUp = fling * rock * (0.8 + 0.5 * side * Math.sin(land * 7.5));
      f.arms[i] = { upper: -0.5 * fling * rock * Math.sin(land * 6 + i * 2), spread: 0.2 + catchUp, fore: -0.18 - 0.2 * fling * rock };
    }
    f.legs = [{ mode: "plant", z: 0, lift: 0 }, { mode: "plant", z: 0, lift: 0 }];
    f.waggle = (0.025 + 0.1 * Math.exp(-land * 5)) * (1 - THREE.MathUtils.smoothstep(land, 1, 2));
    f.waggleRate = 5;
    f.leafDamp = 4 + 9 * THREE.MathUtils.smoothstep(land, 0.15, 0.7);
  } else {
    f.squash = 1;
  }
  return f;
}
function podSpots(m) {
  const H = m.pot.height;
  const rest = V(0, POD_REST, m.pot.bottomRadius + 0.34);
  const hold = V(0, m.potOffset + 0.42 * H, m.pot.radiusAt(0.42 * H) + 0.3);
  return { rest, hold };
}
function gripArm(p) {
  return { upper: -0.3, spread: 0.2, fore: -0.5, target: V(POD_REST + 0.06, p.y, p.z), body: true, fist: true, w: 1, pole: V(1, -0.3, -0.4), stretch: 1.8, bend: 0.85 };
}
function sitFrame(m, t, mood) {
  const f = base();
  const seat = 0.3;
  f.couch = seat;
  f.y = seat - m.potOffset;
  f.hipZ = m.pot.bottomRadius * 0.7;
  const rate = mood === "impatient" ? 8 : mood === "lazy" ? 1.1 : 3.2;
  const amp = mood === "impatient" ? 1.25 : mood === "lazy" ? 0.35 : 1;
  for (const i of [0, 1]) {
    const kick = Math.max(0, Math.sin(t * rate + i * Math.PI)) ** (mood === "impatient" ? 1 : 2);
    f.legs[i] = { mode: "fk", thigh: -0.95 - 0.35 * kick * amp, shin: 0.75 - 0.6 * kick * amp, foot: 0.15 - 0.2 * kick };
  }
  if (mood === "impatient") {
    const k = Math.sin(t * rate);
    f.pitch = -0.02 + 0.03 * Math.abs(k);
    f.roll = 0.05 * k;
    f.yaw = 0.25 * key([[0, 0], [0.2, 0.6], [0.45, 0.6], [0.55, -0.6], [0.85, -0.6], [1, 0]], t / 4 % 1);
    f.squash = 1 + 0.02 * Math.abs(k);
    f.arms = [0, 1].map((i) => ({ upper: -0.15 - 0.12 * Math.max(0, Math.sin(t * rate * 0.5 + i * Math.PI)), spread: 0.55, fore: -0.3 }));
    f.waggle = 0.12;
    f.waggleRate = 4;
  } else if (mood === "lazy") {
    f.y -= 0.03;
    f.pitch = -0.24 + 0.015 * Math.sin(t * 0.9);
    f.roll = 0.05;
    f.squash = 0.97 + 0.015 * Math.sin(t * 0.9);
    f.arms = [{ upper: 0.25, spread: 0.95, fore: -0.05 }, { upper: 0.25, spread: 0.95, fore: -0.05 }];
    f.waggle = 0.02;
  } else {
    f.pitch = -0.05 + 0.02 * Math.sin(t * 1.1);
    f.roll = 0.03 * Math.sin(t * 0.9);
    f.squash = 1 + 8e-3 * Math.sin(t * 2);
    f.arms = [{ upper: -0.15, spread: 0.55, fore: -0.25 }, { upper: -0.15, spread: 0.55, fore: -0.25 }];
    f.waggle = 0.04;
  }
  return f;
}
function lerpFrame(a, b, w) {
  if (w <= 0) return a;
  if (w >= 1) return b;
  const L = THREE.MathUtils.lerp;
  const f = { ...a };
  for (const k of ["y", "x", "z", "pitch", "roll", "yaw", "squash", "spin", "width", "hipZ", "waggle", "waggleRate", "speed"]) f[k] = L(a[k], b[k], w);
  f.legs = [0, 1].map((i) => {
    const la = a.legs[i];
    const lb = b.legs[i];
    if (la.mode === "plant" && lb.mode === "plant") return { mode: "plant", z: L(la.z, lb.z, w), lift: L(la.lift, lb.lift, w) };
    return w < 0.5 ? la : lb;
  });
  f.arms = [0, 1].map((i) => {
    const x = a.arms[i];
    const y = b.arms[i];
    return { ...w < 0.5 ? x : y, upper: L(x.upper, y.upper, w), spread: L(x.spread, y.spread, w), fore: L(x.fore, y.fore, w), w: L(x.target ? x.w ?? 1 : 0, y.target ? y.w ?? 1 : 0, w), target: y.target ?? x.target };
  });
  return f;
}
const ACTIONS = {
  hop: {
    label: "hop",
    fn: (_m2, t) => {
      const u = t / 1.9 % 1;
      const f = base();
      f.y = key([[0, 0], [0.24, -0.13], [0.3, -0.13], [0.36, 0, "in"], [0.66, 0], [0.72, -0.11, "out"], [0.8, 0.02], [0.87, -0.025], [0.94, 6e-3], [1, 0]], u);
      let lift = 0;
      if (u > AIR.from && u < AIR.to) {
        const x = (u - AIR.from) / (AIR.to - AIR.from);
        const arc = 4 * x * (1 - x);
        f.y += AIR.height * arc;
        lift = Math.max(0, AIR.height * arc - AIR.tuck * Math.sin(Math.PI * x));
      }
      f.z = -key([[0, 0], [0.24, 0.04], [0.36, 0], [1, 0]], u);
      f.pitch = key([[0, 0], [0.24, 0.24], [0.36, -0.08, "in"], [0.6, -0.04], [0.66, 0.06], [0.74, 0.2, "out"], [0.88, 0], [1, 0]], u);
      f.squash = key([[0, 1], [0.24, 0.9], [0.3, 0.9], [0.38, 1.1], [0.5, 1.02], [0.66, 1.03], [0.72, 0.86, "out"], [0.8, 1.04], [0.87, 0.97], [0.94, 1.01], [1, 1]], u);
      f.legs = [{ mode: "plant", z: 0, lift }, { mode: "plant", z: 0, lift }];
      const arm = {
        upper: key([[0, 0], [0.24, 0.75], [0.3, 0.8], [0.42, -0.35], [0.62, -0.25], [0.74, 0.25], [0.9, 0], [1, 0]], u),
        fore: key([[0, -0.18], [0.24, -0.15], [0.42, -0.04], [0.62, -0.08], [0.74, -0.5], [0.9, -0.2], [1, -0.18]], u),
        spread: key([[0, 0.2], [0.24, 0.05], [0.44, 1.9], [0.6, 1.7], [0.76, 0.25], [0.9, 0.2], [1, 0.2]], u)
      };
      f.arms = [arm, { ...arm }];
      f.waggle = 0.16 * (0.3 + win(u, 0.3, 0.9, 0.1));
      f.waggleRate = 9;
      return f;
    }
  },
  hops: {
    label: "hop hop hop",
    fn: (_m2, t) => {
      const T = 3.2;
      const u = t / T % 1;
      const f = base();
      const HOPS = [[0.12, 0.24, 0.16], [0.3, 0.42, 0.2], [0.5, 0.7, 0.42]];
      let y = key([[0, 0], [0.08, -0.1], [0.12, -0.06], [0.24, -0.06], [0.27, -0.08], [0.3, -0.06], [0.42, -0.06], [0.46, -0.13], [0.5, -0.04], [0.7, -0.04], [0.75, -0.13, "out"], [0.84, 0.02], [0.9, -0.02], [1, 0]], u);
      let lift = 0;
      let air = 0;
      for (const [a, b, h] of HOPS) {
        if (u > a && u < b) {
          const x = (u - a) / (b - a);
          y += h * 4 * x * (1 - x);
          lift = Math.max(0, h * 4 * x * (1 - x) - 0.1 * h * Math.sin(Math.PI * x) * 2);
          air = Math.sin(Math.PI * x) * (h / 0.42);
        }
      }
      f.y = y;
      f.squash = key([[0, 1], [0.08, 0.9], [0.12, 1.06], [0.24, 0.92], [0.3, 1.06], [0.42, 0.9], [0.46, 0.88], [0.52, 1.12], [0.7, 1.03], [0.75, 0.85, "out"], [0.84, 1.04], [0.92, 0.98], [1, 1]], u);
      f.pitch = key([[0, 0], [0.08, 0.14], [0.12, -0.05], [0.24, 0.1], [0.3, -0.05], [0.44, 0.18], [0.52, -0.08], [0.7, 0.05], [0.76, 0.2], [0.9, 0], [1, 0]], u);
      f.legs = [{ mode: "plant", z: 0, lift }, { mode: "plant", z: 0, lift }];
      const up = Math.max(air, key([[0, 0], [0.5, 0], [0.56, 1], [0.66, 1], [0.74, 0.2], [1, 0]], u));
      const arm = { upper: 0.3 * (1 - up) - 0.35 * up, spread: 0.2 + 1.6 * up, fore: -0.25 + 0.15 * up };
      f.arms = [arm, { ...arm }];
      f.waggle = 0.08 + 0.12 * air;
      f.waggleRate = 8;
      return f;
    }
  },
  swing: { label: "swing (hanging planter)", fn: (m, t) => swingFrame(m, t) },
  scruffup: { label: "scruff: picked up", fn: (m, t) => scruffFrame(m, t, "up") },
  scruff: { label: "scruff: held (protest loop)", fn: (m, t) => scruffFrame(m, t, "held") },
  scruffdown: { label: "scruff: put down (plop)", fn: (m, t) => scruffFrame(m, t, "down") },
  pickup: {
    label: "pick up",
    fn: (m, t) => {
      const u = t / 5.2 % 1;
      const f = base();
      const down = key([[0, 0], [0.18, 1], [0.26, 1], [0.4, 0], [0.74, 0], [0.84, 1], [0.88, 1], [1, 0]], u);
      const holding = u > 0.4 && u < 0.74 ? 1 : 0;
      const bounce = holding * Math.abs(Math.sin((u - 0.4) * Math.PI * 6)) * 0.02;
      f.y = -0.15 * down + bounce;
      f.z = -0.05 * down;
      f.pitch = 0.5 * down;
      f.squash = 1 + bounce * 0.8;
      const { rest, hold } = podSpots(m);
      const lift = key([[0, 0], [0.26, 0], [0.4, 1], [0.74, 1], [0.84, 0], [1, 0]], u);
      const p = rest.clone().lerp(hold, lift).add(V(0, bounce, 0));
      const reach2 = key([[0, 0], [0.16, 1], [0.88, 1], [0.98, 0], [1, 0]], u);
      for (const i of [0, 1]) f.arms[i] = { ...gripArm(p), w: reach2 };
      f.held = THREE.MathUtils.smoothstep(u, 0.2, 0.26) * (1 - THREE.MathUtils.smoothstep(u, 0.82, 0.88));
      f.waggle = 0.06 + 0.06 * holding;
      return f;
    }
  },
  shake: {
    label: "shake off (like a dog)",
    fn: (m, t) => {
      const u = t / 2.6 % 1;
      const f = base();
      const env = key([[0, 0], [0.14, 0], [0.3, 1, "out"], [0.55, 0.8], [0.72, 0, "in"], [1, 0]], u);
      const HZ = 4.6;
      const w = Math.sin(t * TAU * HZ);
      f.width = 1.3;
      f.y = key([[0, 0], [0.12, -0.06], [0.72, -0.05], [0.8, 0.02], [0.9, 0], [1, 0]], u);
      f.yaw = 0.55 * env * w;
      f.roll = 0.12 * env * Math.sin(t * TAU * HZ + 0.8);
      f.pitch = key([[0, 0], [0.12, 0.08], [0.72, 0.06], [0.82, -0.08], [0.92, 0], [1, 0]], u);
      f.squash = key([[0, 1], [0.12, 0.93], [0.72, 0.95], [0.8, 1.06], [0.9, 1], [1, 1]], u);
      for (const i of [0, 1]) {
        const side = i === 0 ? -1 : 1;
        const lag = Math.sin(t * TAU * HZ - 1.2 + side * 0.5);
        f.arms[i] = { upper: 0.3 * env * lag, spread: 0.25 + 0.8 * env * (0.5 + 0.5 * lag * side), fore: -0.25 - 0.35 * env * (0.5 + 0.5 * lag) };
      }
      f.waggle = 0.05 + 0.45 * env;
      f.waggleRate = 9;
      f.fling = env;
      return f;
    }
  },
  wiggle: {
    label: "dance: waggle",
    fn: (_m2, t) => {
      const beat = 0.44;
      const b = t / beat;
      const f = base();
      const bounce = Math.abs(Math.sin(Math.PI * b));
      const wag = Math.sin(TAU * b);
      const sway = Math.sin(Math.PI * b / 2);
      f.y = -0.07 + 0.06 * bounce;
      f.squash = 0.94 + 0.08 * bounce;
      f.roll = 0.2 * wag;
      f.yaw = 0.16 * Math.sin(TAU * b + 0.9);
      f.x = 0.07 * sway;
      f.pitch = 0.04 * Math.cos(TAU * b);
      f.width = 1.2;
      const step = Math.max(0, Math.sin(Math.PI * b)) * 0.05;
      const leftTurn = Math.floor(b) % 2 === 0;
      f.legs = [{ mode: "plant", z: 0.01, lift: leftTurn ? step : 0 }, { mode: "plant", z: 0.01, lift: leftTurn ? 0 : step }];
      for (const i of [0, 1]) {
        const side = i === 0 ? -1 : 1;
        f.arms[i] = { upper: -2.3 + 0.15 * bounce, spread: 0.62 + 0.3 * sway * side, fore: -0.35 - 0.25 * Math.max(0, wag * side) };
      }
      f.waggle = 0.16;
      f.waggleRate = 1 / beat;
      return f;
    }
  },
  twist: {
    label: "dance: twist",
    fn: (_m2, t) => {
      const b = t / 0.5;
      const bi = Math.floor(b);
      const x = b - bi;
      const A = 0.42;
      const from = bi % 2 ? A : -A;
      const back = (v) => 1 + 2.7 * (v - 1) ** 3 + 1.7 * (v - 1) ** 2;
      const hit = x < 0.36 ? back(x / 0.36) : 1;
      const yaw = from + (-from - from) * hit;
      const f = base();
      f.width = 1.25;
      f.yaw = yaw;
      const pop = x < 0.36 ? Math.sin(Math.PI * x / 0.36) : 0;
      f.y = -0.06 - 0.035 * pop - 0.03 * (0.5 + 0.5 * Math.cos(TAU * t / 4));
      f.roll = 0.04 * (yaw / A);
      f.squash = 1 - 0.03 * pop;
      for (const i of [0, 1]) {
        const side = i === 0 ? -1 : 1;
        f.arms[i] = { upper: 0.5 * side * (yaw / A), spread: 1, fore: -0.75 };
      }
      f.legs = [{ mode: "plant", z: 0.025 * (yaw / A), lift: 0 }, { mode: "plant", z: -0.025 * (yaw / A), lift: 0 }];
      f.waggle = 0.12;
      f.waggleRate = 4;
      return f;
    }
  },
  spin: {
    label: "dance: twirl",
    fn: (_m2, t) => {
      const u = t / 2.2 % 1;
      const f = base();
      const air0 = 0.28;
      const air1 = 0.5;
      f.y = key([[0, 0], [0.22, -0.13], [air0, -0.02, "in"], [air1, 0], [0.55, -0.11, "out"], [0.7, 0.015], [0.8, 0], [1, 0]], u);
      if (u > air0 && u < air1) {
        const x = (u - air0) / (air1 - air0);
        f.y += 0.24 * 4 * x * (1 - x);
      }
      const inAir = u > air0 && u < air1 ? Math.sin(Math.PI * (u - air0) / (air1 - air0)) : 0;
      f.yaw = key([[0, 0], [0.22, -0.6], [0.3, 0.15], [0.4, 0], [1, 0]], u);
      f.spin = TAU * key([[0, 0], [0.26, 0], [air0 + 0.01, 0.05, "in"], [air1 - 0.01, 0.95, "lin"], [0.56, 1, "out"], [1, 1]], u);
      f.squash = key([[0, 1], [0.22, 0.87], [0.3, 1.1], [0.46, 1.03], [0.55, 0.86, "out"], [0.68, 1.04], [0.8, 1], [1, 1]], u);
      f.pitch = key([[0, 0], [0.22, 0.16], [0.3, -0.06], [0.5, 0], [0.55, 0.12], [0.7, -0.06], [1, 0]], u);
      f.legs = [{ mode: "plant", z: 0, lift: 0.14 * inAir }, { mode: "plant", z: 0, lift: 0.14 * inAir }];
      const tuck = key([[0, 0], [0.22, 0], [0.3, 1], [0.48, 1], [0.54, 0], [1, 0]], u);
      const tada = key([[0, 0], [0.5, 0], [0.58, 1], [0.84, 1], [1, 0]], u);
      for (const i of [0, 1]) {
        const side = i === 0 ? -1 : 1;
        const across = key([[0, 0], [0.22, 0.5 * side], [0.3, 0], [1, 0]], u);
        f.arms[i] = { upper: -0.3 * tuck - 0.6 * tada + across, spread: 0.2 - 0.1 * tuck + 1.3 * tada, fore: -0.2 - 1.1 * tuck };
      }
      f.waggle = 0.06;
      f.waggleRate = 6;
      return f;
    }
  },
  sit: { label: "sit on the couch", fn: (m, t) => sitFrame(m, t, "happy") },
  sitkick: { label: "sit: impatient kicking", fn: (m, t) => sitFrame(m, t, "impatient") },
  sitlazy: { label: "sit: lazy slump", fn: (m, t) => sitFrame(m, t, "lazy") },
  cuddle: {
    label: "cuddle up (self hug)",
    fn: (m, t) => {
      const f = base();
      const u = t / 5 % 1;
      const tuck = key([[0, 0], [0.12, 1], [0.9, 1], [1, 0]], u);
      const rock = Math.sin(t * 1.4);
      f.roll = 0.1 * rock * tuck;
      f.pitch = 0.05 * tuck;
      const squeeze = 0.5 + 0.5 * Math.sin(t * 2.8);
      f.squash = 1 - 0.04 * squeeze * tuck;
      for (const i of [0, 1]) {
        f.arms[i] = {
          upper: -0.3,
          spread: 0.2,
          fore: -0.9,
          target: onBelly(m, 0.44, 0.33 - 0.03 * squeeze, 0),
          // wrists at the front-sides, close in: hands flat on the pot either side of the middle
          w: tuck,
          pole: V(1.3, -0.15, -0.7),
          stretch: 2.2,
          bend: 0.72,
          hand: [-0.9, 0]
          // turn the hand so the palm lies flat on the pot
        };
      }
      f.waggle = 0.04;
      return f;
    }
  },
  rubhands: {
    label: "rub hands (eager)",
    fn: (m, t) => {
      const f = base();
      const r = Math.sin(t * TAU * 1.4);
      f.y = 0.01 + 0.012 * Math.abs(r);
      f.pitch = 0.08;
      f.roll = 0.03 * r;
      for (const i of [0, 1]) {
        const side = i === 0 ? -1 : 1;
        f.arms[i] = {
          upper: -0.4,
          spread: 0.2,
          fore: -0.9,
          target: onBelly(m, 0.62 + 0.045 * r * side, 0.2, 0.26),
          // fists pressed together in the middle (a touch of overlap is fine)
          w: 1,
          pole: V(1.2, -0.5, -0.5),
          stretch: 2.2,
          bend: 0.74
        };
      }
      f.waggle = 0.06;
      f.waggleRate = 2.8;
      return f;
    }
  },
  bellyrub: {
    label: "rub belly (hungry)",
    fn: (m, t) => {
      const f = base();
      const c = t * TAU * 0.45;
      f.pitch = -0.1;
      f.roll = 0.04 * Math.sin(c);
      f.x = 0.02 * Math.sin(c);
      f.squash = 1 + 0.01 * Math.sin(c * 2);
      f.arms = [
        { upper: 0.08 + 0.04 * Math.sin(c), spread: 0.12, fore: -0.25 },
        // relaxed, down at the side
        { upper: -0.3, spread: 0.2, fore: -0.9, target: onBelly(m, 0.38 + 0.07 * Math.sin(c), 0.24 + 0.06 * Math.cos(c), 0), w: 1, pole: V(1.3, -0.3, -0.6), stretch: 1.8, bend: 0.76 }
      ];
      f.waggle = 0.04;
      return f;
    }
  },
  slide: {
    label: "baseball slide",
    fn: (m, t) => {
      const T = 3.4;
      const u = t / T % 1;
      const run = gait(GAITS.run, t);
      const r = m.pot.bottomRadius;
      const lean = 0.75;
      const slideF = base();
      slideF.pitch = -lean;
      slideF.y = r * Math.sin(lean) + 0.01 - m.potOffset;
      slideF.legs = [{ mode: "plant", z: 0.34, lift: 0 }, { mode: "plant", z: 0.3, lift: 0.01 }];
      slideF.arms = [{ upper: 0.7, spread: 0.5, fore: -0.3 }, { upper: -2.7, spread: 0.3, fore: -0.25 }];
      slideF.squash = 0.97;
      slideF.waggle = 0.08;
      slideF.leafDamp = 9;
      slideF.waggleRate = 6;
      const stand = base();
      const toSlide = THREE.MathUtils.smoothstep(u, 0.3, 0.4);
      const toStand = THREE.MathUtils.smoothstep(u, 0.74, 0.86);
      let f = lerpFrame(run, slideF, toSlide);
      f = lerpFrame(f, stand, toStand);
      if (u < 0.06) f = lerpFrame(stand, run, THREE.MathUtils.smoothstep(u, 0, 0.06));
      const vRun = run.speed;
      const x = THREE.MathUtils.clamp((u - 0.34) / 0.36, 0, 1);
      f.speed = u < 0.34 ? vRun * (u < 0.06 ? u / 0.06 : 1) : u < 0.7 ? vRun * (1 - x) ** 1.6 : 0;
      f.y += 0.06 * win(u, 0.76, 0.88, 0.05);
      return f;
    }
  },
  hide: {
    label: "hide in the pot",
    fn: (m, t) => {
      const T = 5.2;
      const u = t / T % 1;
      const f = base();
      const air0 = 0.74;
      const air1 = 0.86;
      const tuck = key([[0, 0], [0.1, 1, "in"], [0.735, 1], [0.755, 0, "out"], [1, 0]], u);
      const inAir = u > air0 && u < air1;
      const x = inAir ? (u - air0) / (air1 - air0) : 0;
      const arc = inAir ? 4 * x * (1 - x) : 0;
      f.legs = tuck > 0.02 ? [{ mode: "tuck", amount: tuck }, { mode: "tuck", amount: tuck }] : [{ mode: "plant", z: 0, lift: Math.max(0, 0.38 * arc - 0.06) }, { mode: "plant", z: 0, lift: Math.max(0, 0.38 * arc - 0.06) }];
      const base0 = -m.potOffset * tuck;
      f.y = base0 + 0.38 * arc + key([[0, 0], [0.86, 0], [0.9, -0.1, "out"], [0.95, 0.02], [1, 0]], u);
      const s = Math.max(0, u - 0.11) * T;
      const amp = u > 0.11 && u < 0.66 ? 0.2 * Math.exp(-s * 1.6) : 0;
      const ph = s * TAU * 1.6;
      const shiver = win(u, 0.67, 0.74, 0.015) * Math.sin(t * TAU * 14) * 0.06;
      f.roll = amp * Math.sin(ph) + shiver;
      f.pitch = amp * Math.cos(ph);
      f.squash = key([[0, 1], [0.08, 1.04], [0.12, 0.9, "out"], [0.2, 1.03], [0.28, 1], [0.67, 1], [0.725, 0.88], [0.76, 1.14], [0.82, 1.03], [0.86, 1], [0.89, 0.84, "out"], [0.94, 1.05], [1, 1]], u);
      const star = key([[0, 0], [0.735, 0], [0.775, 1], [0.86, 0.9], [0.92, 0.6], [1, 0]], u);
      for (const i of [0, 1]) f.arms[i] = { upper: -0.5 * star, spread: 0.2 + 1.7 * star, fore: -0.1, tuck };
      f.waggle = 0.03 + amp * 0.6 + 0.2 * star;
      f.waggleRate = inAir ? 8 : 3;
      return f;
    }
  }
};
const ANIMS = [
  { group: "walks", items: Object.entries(GAITS).map(([k, g]) => [k, g.label]) },
  { group: "actions", items: Object.entries(ACTIONS).map(([k, a]) => [k, a.label]) }
];
function frameFor(m, t, anim, curvature = 0) {
  if (anim === "carry") {
    const f = gait(GAITS.carry, t, curvature * Math.abs(m.legs[1].hip.x));
    const bob = Math.sin(2 * TAU * t / GAITS.carry.period);
    const { hold } = podSpots(m);
    for (const i of [0, 1]) f.arms[i] = gripArm(hold.clone().add(V(0, 0.02 * bob, 0)));
    f.held = 1;
    return f;
  }
  if (anim in GAITS) return gait(GAITS[anim], t, curvature * Math.abs(m.legs[1].hip.x));
  return (ACTIONS[anim] ?? ACTIONS.hop).fn(m, t);
}
function solveLeg(l, z, y) {
  const K = l.knee;
  const A = l.ankle;
  const L1 = K.length();
  const L2 = A.clone().sub(K).length();
  const a1 = Math.atan2(K.z, -K.y);
  const a2 = Math.atan2(A.z - K.z, -(A.y - K.y));
  const d = Math.min(L1 + L2 - 1e-4, Math.max(Math.abs(L1 - L2) + 1e-4, Math.hypot(z, y)));
  const phi = Math.atan2(z, -y);
  const hipIn = Math.acos(THREE.MathUtils.clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
  const kneeIn = Math.acos(THREE.MathUtils.clamp((L1 * L1 + L2 * L2 - d * d) / (2 * L1 * L2), -1, 1));
  const t1 = phi + hipIn;
  const t2 = t1 - (Math.PI - kneeIn);
  const thigh = -(t1 - a1);
  const shin = -(t2 - t1 - (a2 - a1));
  pose(l, "thigh", thigh);
  pose(l, "shin", shin);
  pose(l, "foot", -(thigh + shin));
}
const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _qp = new THREE.Quaternion();
const _s = new THREE.Vector3();
function inRoot(l, o, inv) {
  const p = new THREE.Vector3();
  const q = new THREE.Quaternion();
  _m.multiplyMatrices(inv, o.matrixWorld).decompose(p, q, _s);
  return { p, q };
}
function aim(l, b, from, to, inv) {
  const head = inRoot(l, b, inv);
  const qb = head.q;
  const qp = b.parent ? inRoot(l, b.parent, inv).q : new THREE.Quaternion();
  const d = new THREE.Quaternion().setFromUnitVectors(from.clone().sub(head.p).normalize(), to.clone().sub(head.p).normalize());
  b.quaternion.copy(_qp.copy(qp).invert().multiply(d).multiply(_q.copy(qb)));
  b.updateMatrixWorld(true);
}
function reach(m, l, target, pole, w, stretch = 1, bend = 0.97, clear = true) {
  const up = l.bones.upper;
  const fore = l.bones.fore;
  const hand = l.bones.hand;
  if (!up || !fore || !hand || w <= 0) return;
  const qUp0 = up.quaternion.clone();
  const qFore0 = fore.quaternion.clone();
  l.root.updateMatrixWorld(true);
  const inv = l.root.matrixWorld.clone().invert();
  const toRoot = (v2) => new THREE.Vector3(v2.x * l.side, v2.y, v2.z).applyMatrix4(m.pot.group.matrixWorld).applyMatrix4(inv);
  const Tfull = toRoot(target);
  if (stretch > 1) {
    const S0 = inRoot(l, up, inv).p;
    const L = inRoot(l, fore, inv).p.distanceTo(S0) + inRoot(l, hand, inv).p.distanceTo(inRoot(l, fore, inv).p);
    const k = 1 + (THREE.MathUtils.clamp(Tfull.distanceTo(S0) / (L * bend), 1, stretch) - 1) * w;
    fore.position.copy(fore.userData.p0).multiplyScalar(k);
    hand.position.copy(hand.userData.p0).multiplyScalar(k);
    l.root.updateMatrixWorld(true);
  }
  const S = inRoot(l, up, inv).p;
  const E = inRoot(l, fore, inv).p;
  const W = inRoot(l, hand, inv).p;
  const T = Tfull.clone();
  {
    const r2p = m.pot.group.matrixWorld.clone().invert().multiply(l.root.matrixWorld);
    const p2r = r2p.clone().invert();
    const reachMax = (E.distanceTo(S) + W.distanceTo(E)) * 0.97;
    for (let k = 0; k < (clear ? 4 : 1); k++) {
      const off = T.clone().sub(S);
      if (off.length() > reachMax) T.copy(S).addScaledVector(off.normalize(), reachMax);
      const tp = T.clone().applyMatrix4(r2p);
      const r = Math.hypot(tp.x, tp.z);
      const need = m.pot.radiusAt(THREE.MathUtils.clamp(tp.y, 0, m.pot.height)) + 0.09;
      if (!clear || tp.y < -0.05 || tp.y > m.pot.height + 0.05 || r >= need) break;
      tp.x *= need / Math.max(1e-4, r);
      tp.z *= need / Math.max(1e-4, r);
      T.copy(tp.applyMatrix4(p2r));
    }
  }
  const shoulderPot = l.root.position.clone();
  const P2 = toRoot(new THREE.Vector3(shoulderPot.x * l.side, shoulderPot.y, shoulderPot.z).add(pole));
  const L1 = E.distanceTo(S);
  const L2 = W.distanceTo(E);
  const dir = T.clone().sub(S);
  const d = THREE.MathUtils.clamp(dir.length(), Math.abs(L1 - L2) + 1e-4, L1 + L2 - 1e-4);
  dir.normalize();
  const v = P2.clone().sub(S);
  v.addScaledVector(dir, -v.dot(dir)).normalize();
  const a = Math.acos(THREE.MathUtils.clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
  const rootToPot = m.pot.group.matrixWorld.clone().invert().multiply(l.root.matrixWorld);
  const potToRoot = rootToPot.clone().invert();
  let E2 = S.clone().addScaledVector(dir, L1 * Math.cos(a)).addScaledVector(v, L1 * Math.sin(a));
  for (let k = 0; k < (clear ? 6 : 0); k++) {
    const ep = E2.clone().applyMatrix4(rootToPot);
    const r = Math.hypot(ep.x, ep.z);
    const need = m.pot.radiusAt(THREE.MathUtils.clamp(ep.y, 0, m.pot.height)) + 0.07;
    if (ep.y < 0 || ep.y > m.pot.height + 0.05 || r >= need) break;
    const outPot = new THREE.Vector3(ep.x, 0, ep.z).normalize().multiplyScalar(need - r + 0.02).add(ep);
    const out = outPot.applyMatrix4(potToRoot).sub(S);
    out.addScaledVector(dir, -out.dot(dir)).normalize();
    v.lerp(out, 0.6).normalize();
    E2 = S.clone().addScaledVector(dir, L1 * Math.cos(a)).addScaledVector(v, L1 * Math.sin(a));
  }
  aim(l, up, E, E2, inv);
  inRoot(l, fore, inv).p;
  const W3 = inRoot(l, hand, inv).p;
  aim(l, fore, W3, S.clone().addScaledVector(dir, d), inv);
  if (w < 1) {
    up.quaternion.copy(qUp0.slerp(up.quaternion.clone(), w));
    fore.quaternion.copy(qFore0.slerp(fore.quaternion.clone(), w));
    l.root.updateMatrixWorld(true);
  }
}
const _w = new THREE.Vector3();
function inPot(m, l) {
  l.root.updateMatrixWorld(true);
  for (const b of [l.bones.fore, l.bones.hand]) {
    if (!b) continue;
    const p = m.pot.group.worldToLocal(b.getWorldPosition(_w));
    if (p.y > 0 && p.y < l.root.position.y && Math.hypot(p.x, p.z) < m.pot.radiusAt(p.y) + 0.04) return true;
  }
  return false;
}
function squashPot(m, k) {
  var _a, _b;
  for (const c of m.pot.group.children) {
    if (c === m.socket || m.arms.some((l) => l.root === c) || c.userData.fx) continue;
    c.scale.set(1 + (1 - k) * 0.6, k, 1 + (1 - k) * 0.6);
    const y0 = (_a = c.userData).y0 ?? (_a.y0 = c.position.y);
    c.position.y = y0 * k;
  }
  m.socket.position.y = m.pot.soilY * k;
  for (const l of m.arms) l.root.position.y = ((_b = l.root.userData).y0 ?? (_b.y0 = l.root.position.y)) * k;
}
const POD_SCALE = 2;
const POD_REST = 0.075 * 0.85 * POD_SCALE;
function fx(m) {
  if (m.group.userData.fx) return m.group.userData.fx;
  const couch = new THREE.Group();
  const fabric = new THREE.MeshStandardMaterial({ color: "#8fb1b8", roughness: 0.95 });
  const fabric2 = new THREE.MeshStandardMaterial({ color: "#7a9da5", roughness: 0.95 });
  const seat = new THREE.Mesh(new RoundedBoxGeometry(1.5, 0.3, 1, 3, 0.08), fabric);
  seat.name = "seat";
  const back = new THREE.Mesh(new RoundedBoxGeometry(1.5, 0.75, 0.28, 3, 0.1), fabric2);
  back.name = "back";
  couch.add(seat, back);
  couch.visible = false;
  m.group.add(couch);
  const dropGeo = new THREE.SphereGeometry(0.045, 10, 8);
  dropGeo.translate(0, 0.018, 0);
  const water = new THREE.MeshStandardMaterial({ color: "#9ad4f0", roughness: 0.15, transparent: true, opacity: 0.85 });
  const sweat = [0, 1].map((i) => {
    const d = new THREE.Mesh(dropGeo, water);
    d.scale.set(0.8, 1.25, 0.8);
    d.userData.fx = true;
    d.position.set(i ? -0.12 : 0.1, m.pot.height - 0.06 - i * 0.03, m.pot.rimRadius + 0.02);
    m.pot.group.add(d);
    return d;
  });
  const drops = Array.from({ length: 10 }, () => {
    const d = new THREE.Mesh(dropGeo, water);
    d.visible = false;
    m.group.add(d);
    return d;
  });
  const thing = new THREE.Group();
  const pod = new THREE.Mesh(new THREE.SphereGeometry(0.075, 14, 10), new THREE.MeshStandardMaterial({ color: "#f1e3b4", roughness: 0.7 }));
  pod.scale.set(1, 0.85, 1);
  const sprout = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), new THREE.MeshStandardMaterial({ color: "#6fae5c", roughness: 0.7 }));
  sprout.scale.set(0.7, 1.5, 0.7);
  sprout.position.set(0.015, 0.075, 0);
  sprout.rotation.z = -0.4;
  thing.add(pod, sprout);
  thing.visible = false;
  m.group.add(thing);
  const out = { couch, sweat, drops, thing, ground: null };
  m.group.userData.fx = out;
  return out;
}
function hash$1(n) {
  const x = Math.sin(n * 127.1) * 43758.5453;
  return x - Math.floor(x);
}
function applyFx(m, f, t) {
  var _a;
  const e = fx(m);
  const hs = hangSetup(m);
  const key2 = `${f.hang}:${hs.rope}`;
  if (f.hang && ((_a = e.hang) == null ? void 0 : _a.key) !== key2) {
    if (e.hang) m.pot.group.remove(e.hang.on), m.group.remove(e.hang.hook);
    const on = new THREE.Group();
    const H = m.pot.height;
    const hg = hanger(f.hang, { ...m.pot, group: m.pot.group }, HANG.top);
    const r = rope(hs.rope);
    r.position.y = H + HANG.top + hs.rope;
    on.add(hg, r);
    on.userData.fx = true;
    m.pot.group.add(on);
    const hook = ceilingHook();
    hook.position.y = HANG.base + H + HANG.top + hs.rope + 0.17;
    m.group.add(hook);
    e.hang = { key: key2, on, hook };
  }
  if (e.hang) e.hang.on.visible = e.hang.hook.visible = !!f.hang;
  e.thing.visible = f.held !== void 0;
  if (f.held !== void 0) {
    const mid = fistCenter(m, m.arms[0]).add(fistCenter(m, m.arms[1])).multiplyScalar(0.5);
    const ground = podSpots(m).rest;
    e.thing.position.copy(ground).lerp(mid, THREE.MathUtils.clamp(f.held, 0, 1));
    e.thing.scale.setScalar(POD_SCALE);
  }
  e.couch.visible = f.couch !== void 0;
  if (f.couch !== void 0) {
    const h = f.couch;
    const seat = e.couch.getObjectByName("seat");
    const back = e.couch.getObjectByName("back");
    const depth = 1;
    seat.position.set(0, h / 2, f.hipZ - depth / 2 - 0.04);
    back.position.set(0, h + 0.3, f.hipZ - depth + 0.1);
  }
  for (const d of e.sweat) d.visible = (f.sweat ?? 0) > 0.05;
  for (const d of e.sweat) d.scale.setScalar(Math.max(0.01, f.sweat ?? 0)).multiply(V(0.8, 1.25, 0.8));
  const fl = f.fling ?? 0;
  e.drops.forEach((d, i) => {
    const life = 0.6;
    const ph = (t / life + hash$1(i)) % 1;
    d.visible = fl > 0.15;
    if (!d.visible) return;
    const a = hash$1(i + 7) * TAU;
    const r = m.pot.rimRadius + ph * 0.7;
    d.position.set(Math.cos(a) * r, m.potOffset + m.pot.height * (0.6 + 0.3 * hash$1(i + 3)) + ph * 0.3 - ph * ph * 0.9, Math.sin(a) * r);
    d.scale.setScalar((1 - ph) * fl);
  });
}
function waggle(m, f, t) {
  var _a, _b;
  const st = (_a = m.group.userData).leaf ?? (_a.leaf = { t, pos: new THREE.Vector3(), vel: new THREE.Vector3(), yaw: 0, springs: /* @__PURE__ */ new Map() });
  m.socket.updateMatrixWorld(true);
  const pos = new THREE.Vector3().setFromMatrixPosition(m.socket.matrixWorld);
  const q = new THREE.Quaternion();
  m.socket.getWorldQuaternion(q);
  const yaw = new THREE.Euler().setFromQuaternion(q, "YXZ").y;
  let dt = t - st.t;
  const reset = dt <= 0 || dt > 0.1;
  if (reset) dt = 1 / 60;
  const vel = reset ? st.vel.clone() : pos.clone().sub(st.pos).divideScalar(dt);
  const acc = reset ? new THREE.Vector3() : vel.clone().sub(st.vel).divideScalar(dt);
  let dyaw = yaw - st.yaw;
  dyaw = Math.atan2(Math.sin(dyaw), Math.cos(dyaw));
  const yawRate = reset ? 0 : dyaw / dt;
  st.t = t;
  st.pos.copy(pos);
  st.vel.copy(vel);
  st.yaw = yaw;
  const local = acc.clone().applyQuaternion(q.clone().invert());
  const still = dt === 1 / 60 && reset;
  let k = 0;
  for (const holder of m.socket.children)
    for (const plant of holder.children)
      for (const part of plant.children) {
        const q0 = (_b = part.userData).q0 ?? (_b.q0 = part.quaternion.clone());
        const p = k++ * 1.7;
        const sp = st.springs.get(part) ?? [0, 0, 0, 0, 0, 0];
        const stiff = 90 + 50 * Math.sin(p * 2.3) ** 2;
        const damp = f.leafDamp ?? 4.5;
        const sway = [f.waggle * Math.sin(t * f.waggleRate * 2.1 + p * 0.7), f.waggle * 0.7 * Math.sin(t * f.waggleRate * 1.6 + p * 1.3), 0];
        const drive = [THREE.MathUtils.clamp(-local.z * 0.012, -0.5, 0.5) + THREE.MathUtils.clamp(local.y * 0.01, -0.4, 0.4) * (0.6 + 0.4 * Math.sin(p)), THREE.MathUtils.clamp(local.x * 0.012, -0.5, 0.5), THREE.MathUtils.clamp(-yawRate * 0.06, -0.6, 0.6)];
        if (!still)
          for (let a = 0; a < 3; a++) {
            const target = sway[a] + drive[a];
            const accA = stiff * (target - sp[a]) - damp * sp[3 + a];
            sp[3 + a] += accA * dt;
            sp[a] += sp[3 + a] * dt;
            sp[a] = THREE.MathUtils.clamp(sp[a], -0.7, 0.7);
          }
        st.springs.set(part, sp);
        part.quaternion.copy(q0).premultiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(sp[0], sp[2], sp[1])));
      }
}
function poseMonster(m, t, anim, curvature = 0) {
  return applyPose(m, t, anim, curvature);
}
function applyPose(m, t, anim, curvature) {
  const f = frameFor(m, t, anim, curvature);
  const pg = m.pot.group;
  m.group.rotation.y = f.spin;
  pg.position.set(f.x, m.potOffset + f.y, f.z);
  pg.rotation.set(f.pitch, f.yaw, f.roll, "YXZ");
  pg.updateMatrix();
  pg.updateMatrixWorld(true);
  squashPot(m, f.squash);
  const hip = new THREE.Vector3();
  m.legs.forEach((l, i) => {
    const lf = f.legs[i];
    const side = l.side;
    hip.copy(l.hip).add(V(0, 0, f.hipZ)).applyMatrix4(pg.matrix);
    l.root.position.copy(hip);
    l.root.rotation.set(0, 0, 0);
    l.root.scale.set(side, 1, 1);
    if (lf.mode === "tuck") {
      const r = lf.amount;
      l.root.scale.set(side * (1 - 0.6 * r), 1 - 0.85 * r, 1 - 0.6 * r);
      l.root.position.y += 0.06 * r;
      for (const b of ["thigh", "shin", "foot"]) pose(l, b, 0);
      return;
    }
    if (lf.mode === "fk") {
      l.root.rotation.set(f.pitch, 0, 0);
      pose(l, "thigh", lf.thigh, lf.splay ?? 0);
      pose(l, "shin", lf.shin);
      pose(l, "foot", lf.foot);
      return;
    }
    const restX = l.hip.x * f.width + (lf.x ?? 0);
    const H = hip.y;
    const roll = -Math.atan2(hip.x - restX, H);
    l.root.rotation.z = roll;
    const ankleH = m.legDrop + l.ankle.y;
    solveLeg(l, lf.z + l.ankle.z - hip.z, -(H / Math.cos(roll) - ankleH - lf.lift));
  });
  pg.updateMatrixWorld(true);
  m.arms.forEach((l, i) => {
    var _a, _b;
    const a = f.arms[i];
    const p0 = (_a = l.root.userData).p0 ?? (_a.p0 = l.root.position.clone());
    const tk = a.tuck ?? 0;
    l.root.position.set(p0.x * (1 - 0.35 * tk), p0.y * f.squash, p0.z);
    l.root.rotation.set(0, 0, 0);
    l.root.scale.set(l.side * (1 - 0.85 * tk), 1 - 0.85 * tk, 1 - 0.85 * tk);
    for (const b of [l.bones.fore, l.bones.hand]) if (b) b.position.copy((_b = b.userData).p0 ?? (_b.p0 = b.position.clone())).multiplyScalar(a.len ?? 1);
    l.root.updateMatrixWorld(true);
    pose(l, "upper", a.upper, -(m.armLift + a.spread));
    pose(l, "fore", a.fore);
    pose(l, "hand", 0);
    if ((!a.target || (a.w ?? 1) < 0.5) && tk < 0.05 && !f.noClear) {
      if (inPot(m, l)) {
        let lo = 0;
        let hi = 1.2;
        for (let k = 0; k < 9; k++) {
          const mid = (lo + hi) / 2;
          pose(l, "upper", a.upper, -(m.armLift + a.spread + mid));
          if (inPot(m, l)) lo = mid;
          else hi = mid;
        }
        pose(l, "upper", a.upper, -(m.armLift + a.spread + hi));
      }
    }
    if (a.fromRest && (a.w ?? 1) > 1e-3) {
      l.root.updateMatrixWorld(true);
      const wp = m.pot.group.worldToLocal(l.bones.hand.getWorldPosition(new THREE.Vector3()));
      a.target = a.fromRest(V(wp.x * l.side, wp.y, wp.z));
    }
    if (a.target && (a.w ?? 1) > 1e-3) {
      const toPot = (v) => {
        const g = m.group.localToWorld(V(v.x * l.side, v.y, v.z));
        const p = m.pot.group.worldToLocal(g);
        return V(p.x * l.side, p.y, p.z);
      };
      const want = a.body ? toPot(a.target) : a.target.clone();
      let aim2 = want.clone();
      reach(m, l, aim2, a.pole ?? V(0.4, -0.2, -0.6), a.w ?? 1, a.stretch ?? 1, a.bend ?? 0.97, !f.noClear);
      if (a.fist) {
        for (let k = 0; k < 2; k++) {
          const w0 = m.group.worldToLocal(l.bones.hand.getWorldPosition(new THREE.Vector3()));
          const off = fistCenter(m, l).sub(w0);
          const wp = toPot(V(w0.x * l.side, w0.y, w0.z));
          const fp = toPot(V((w0.x + off.x) * l.side, w0.y + off.y, w0.z + off.z));
          aim2 = want.clone().sub(fp.sub(wp));
          pose(l, "upper", a.upper, -(m.armLift + a.spread));
          pose(l, "fore", a.fore);
          pose(l, "hand", 0);
          for (const bn of [l.bones.fore, l.bones.hand]) if (bn) bn.position.copy(bn.userData.p0);
          reach(m, l, aim2, a.pole ?? V(0.4, -0.2, -0.6), a.w ?? 1, a.stretch ?? 1, a.bend ?? 0.97, !f.noClear);
        }
      }
    }
    if (a.hand) pose(l, "hand", a.hand[0] * (a.w ?? 1), a.hand[1] * (a.w ?? 1));
  });
  applyFx(m, f, t);
  waggle(m, f, t);
  return f.speed;
}
const KIT_STALK_UV = { u: 0.16209, vBase: 0.44614, vTip: 0.33626 };
const UP$2 = new THREE.Vector3(0, 1, 0);
function buildStalk(options) {
  const length = options.length;
  const baseRadius = options.baseRadius ?? THREE.MathUtils.clamp(length * 0.03, 0.012, 0.06);
  const tipRadius = options.tipRadius ?? baseRadius * 0.75;
  const lean = options.lean ?? 0.15;
  const arch = options.arch ?? 0.9;
  const archPower = options.archPower ?? 1.8;
  const heading = options.heading ?? 0;
  const sides = Math.max(3, options.sides ?? 6);
  const segments = Math.max(2, options.segments ?? 10);
  const uv = options.uv ?? KIT_STALK_UV;
  const out = new THREE.Vector3(Math.sin(heading), 0, Math.cos(heading));
  const side = new THREE.Vector3().crossVectors(out, UP$2).normalize();
  const angleAt = (s) => lean + arch * Math.pow(s, archPower);
  const tangentAt = (a) => out.clone().multiplyScalar(Math.sin(a)).addScaledVector(UP$2, Math.cos(a));
  const points = [new THREE.Vector3()];
  const step = length / segments;
  for (let i = 1; i <= segments; i++) {
    const a = angleAt((i - 0.5) / segments);
    points.push(points[i - 1].clone().addScaledVector(tangentAt(a), step));
  }
  const ringVerts = sides + 1;
  const positions = new Float32Array((segments + 1) * ringVerts * 3);
  const normals = new Float32Array((segments + 1) * ringVerts * 3);
  const uvs = new Float32Array((segments + 1) * ringVerts * 2);
  const p = new THREE.Vector3();
  const n = new THREE.Vector3();
  for (let i = 0; i <= segments; i++) {
    const s = i / segments;
    const t = tangentAt(angleAt(s));
    const inPlane = new THREE.Vector3().crossVectors(side, t).normalize();
    const r = THREE.MathUtils.lerp(baseRadius, tipRadius, s);
    for (let j = 0; j < ringVerts; j++) {
      const th = j / sides * Math.PI * 2;
      n.copy(inPlane).multiplyScalar(Math.cos(th)).addScaledVector(side, Math.sin(th));
      p.copy(points[i]).addScaledVector(n, r);
      const k = i * ringVerts + j;
      positions.set([p.x, p.y, p.z], k * 3);
      normals.set([n.x, n.y, n.z], k * 3);
      uvs.set([uv.u, THREE.MathUtils.lerp(uv.vBase, uv.vTip, s)], k * 2);
    }
  }
  const indices = [];
  for (let i = 0; i < segments; i++) {
    for (let j = 0; j < sides; j++) {
      const a = i * ringVerts + j;
      const b = a + 1;
      const c = a + ringVerts;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
  geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  const tipTangent = tangentAt(angleAt(1));
  const chord = points[segments].clone().sub(points[0]);
  const hang = chord.addScaledVector(tipTangent, -chord.dot(tipTangent));
  if (hang.lengthSq() < 1e-8) hang.copy(out).addScaledVector(tipTangent, -out.dot(tipTangent));
  hang.normalize();
  const xAxis = new THREE.Vector3().crossVectors(tipTangent, hang).normalize();
  const tipQuaternion = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(xAxis, tipTangent, hang));
  return { geometry, tipPosition: points[segments].clone(), tipQuaternion, points };
}
function createLeaf(blade2, stalkOptions, stalkMaterial, bladeScale = 1, bladePitch = 0) {
  const group = new THREE.Group();
  const stalk = buildStalk(stalkOptions);
  group.add(new THREE.Mesh(stalk.geometry, stalkMaterial));
  const mounted = blade2.clone();
  mounted.position.copy(stalk.tipPosition);
  mounted.quaternion.copy(stalk.tipQuaternion).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), bladePitch));
  mounted.scale.setScalar(bladeScale);
  group.add(mounted);
  return group;
}
const axesCache = /* @__PURE__ */ new WeakMap();
function bladeAxes(blade2) {
  const cached = axesCache.get(blade2);
  if (cached) return cached;
  blade2.updateMatrixWorld(true);
  const inv = blade2.matrixWorld.clone().invert();
  const pts = [];
  blade2.traverse((o) => {
    const mesh = o;
    if (!mesh.isMesh) return;
    const pos = mesh.geometry.getAttribute("position");
    const m = inv.clone().multiply(mesh.matrixWorld);
    for (let i = 0; i < pos.count; i += 1) pts.push(new THREE.Vector3().fromBufferAttribute(pos, i).applyMatrix4(m));
  });
  const centre = pts.reduce((a, p) => a.add(p), new THREE.Vector3()).multiplyScalar(1 / pts.length);
  const score = (p) => p.distanceTo(centre) + 0.6 * p.length();
  const tip = pts.reduce((a, b) => score(b) > score(a) ? b : a);
  const midrib = tip.clone().normalize();
  const perp = (p) => p.clone().addScaledVector(midrib, -p.dot(midrib));
  const widest = pts.reduce((a, b) => perp(b).lengthSq() > perp(a).lengthSq() ? b : a);
  const across = perp(widest).normalize();
  const normal = new THREE.Vector3().crossVectors(midrib, across).normalize();
  const maxW = perp(widest).length();
  let mid = 0;
  let midN = 0;
  let edge = 0;
  let edgeN = 0;
  for (const p of pts) {
    const w = perp(p).length() / maxW;
    const h = p.dot(normal);
    if (w < 0.25) mid += h, midN++;
    else if (w > 0.7) edge += h, edgeN++;
  }
  if (midN && edgeN && mid / midN < edge / edgeN) normal.negate();
  const axes = { midrib, normal };
  axesCache.set(blade2, axes);
  return axes;
}
function orientBlade(blade2, mount) {
  const { midrib, normal } = bladeAxes(blade2);
  const out = new THREE.Vector3(Math.sin(mount.heading), 0, Math.cos(mount.heading));
  const mW = out.clone().multiplyScalar(Math.cos(mount.drop)).addScaledVector(UP$2, -Math.sin(mount.drop)).normalize();
  const pref = (mount.face ?? UP$2).clone();
  let nW = pref.addScaledVector(mW, -pref.dot(mW));
  if (nW.lengthSq() < 1e-6) nW = out.clone().addScaledVector(mW, -out.dot(mW));
  nW.normalize().applyAxisAngle(mW, mount.roll ?? 0);
  const local = new THREE.Matrix4().makeBasis(new THREE.Vector3().crossVectors(midrib, normal).normalize(), midrib, normal);
  const world = new THREE.Matrix4().makeBasis(new THREE.Vector3().crossVectors(mW, nW).normalize(), mW, nW);
  const mounted = blade2.clone();
  mounted.quaternion.setFromRotationMatrix(world.multiply(local.transpose()));
  return mounted;
}
function createNaturalLeaf(blade2, stalkOptions, mount, stalkMaterial, bladeScale = 1) {
  const group = new THREE.Group();
  const stalk = buildStalk(stalkOptions);
  group.add(new THREE.Mesh(stalk.geometry, stalkMaterial));
  const mounted = orientBlade(blade2, mount);
  mounted.position.copy(stalk.tipPosition);
  mounted.scale.setScalar(bladeScale);
  group.add(mounted);
  return group;
}
function hash(x, y, seed) {
  const h = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;
  return h - Math.floor(h);
}
function smooth(t) {
  return t * t * (3 - 2 * t);
}
function vnoise(x, y, seed) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = smooth(x - xi);
  const yf = smooth(y - yi);
  const a = hash(xi, yi, seed);
  const b = hash(xi + 1, yi, seed);
  const c = hash(xi, yi + 1, seed);
  const d = hash(xi + 1, yi + 1, seed);
  return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf;
}
function fbm(x, y, seed, oct = 4) {
  let v = 0;
  let amp = 0.5;
  let f = 1;
  for (let i = 0; i < oct; i++) {
    v += amp * vnoise(x * f, y * f, seed + i * 13);
    amp *= 0.5;
    f *= 2.03;
  }
  return v;
}
function splashAt(a, s, seed, amount, scale = 1, density = 0.35) {
  const cell = 0.11 * scale;
  const cx = Math.floor(a / cell);
  const cy = Math.floor(s / (cell * 0.55));
  for (let oy = -1; oy <= 1; oy++)
    for (let ox = -1; ox <= 1; ox++) {
      const gx = cx + ox;
      const gy = cy + oy;
      if (hash(gx, gy, seed + 1) > density + 0.45 * amount) continue;
      const px = (gx + hash(gx, gy, seed + 2)) * cell;
      const py = (gy + hash(gx, gy, seed + 3)) * cell * 0.55;
      const r = cell * (0.18 + 0.55 * Math.pow(hash(gx, gy, seed + 4), 2));
      if ((a - px) ** 2 + ((s - py) * 1.8) ** 2 < r * r) return true;
    }
  return false;
}
let splashScale = 1;
let dotScale = 1;
let splashDensity = 0.35;
function cream(style, a, s, seed, amount) {
  const vx = s - 0.35 * a;
  const n = () => fbm(a * 2.6, s * 2.6, seed, 3);
  const fine = () => fbm(a * 9 / dotScale, s * 9 / dotScale, seed + 99, 2);
  switch (style) {
    case "green":
      return fine() > 0.8 - 0.05 * amount;
    // a few flecks
    case "speckle":
      return fine() > 0.7 - 0.08 * amount;
    case "edge": {
      const depth = 0.35 + 0.4 * amount;
      return a + (n() - 0.5) * 0.7 > 1 - depth || fine() > 0.84;
    }
    case "midrib": {
      const reach2 = 0.3 + 0.45 * amount;
      return a + (n() - 0.5) * 0.8 < reach2 || fine() > 0.84;
    }
    case "full":
      return n() > 0.36 - 0.15 * amount;
    case "marble": {
      const m = fbm(vx * 7, a * 1.8, seed + 7, 3);
      return m > 0.56 - 0.12 * amount;
    }
    case "splash":
      return splashAt(a, s, seed, amount, splashScale, splashDensity);
    case "streak": {
      const m = fbm(vx * 5.5, a * 1.2, seed + 3, 3);
      return m > 0.6 - 0.12 * amount;
    }
  }
}
function freckleMask(W, H, spec) {
  const mask = new Uint8Array(W * H);
  const cell = W / 16 * (spec.freckleCell ?? 1);
  for (let gy = -1; gy <= Math.ceil(H / cell); gy++)
    for (let gx = -1; gx <= Math.ceil(W / cell); gx++) {
      if (hash(gx, gy, spec.seed + 900) > 0.25 + 0.45 * spec.freckle) continue;
      const px = (gx + hash(gx, gy, spec.seed + 901)) * cell;
      const py = (gy + hash(gx, gy, spec.seed + 902)) * cell;
      const r = cell * (0.12 + 0.28 * hash(gx, gy, spec.seed + 903));
      for (let y = Math.max(0, Math.floor(py - r)); y <= Math.min(H - 1, Math.ceil(py + r)); y++)
        for (let x = Math.max(0, Math.floor(px - r)); x <= Math.min(W - 1, Math.ceil(px + r)); x++)
          if ((x - px) ** 2 + (y - py) ** 2 < r * r) mask[y * W + x] = 1;
    }
  return mask;
}
function paintVariegation(ctx, W, H, spec, rgb) {
  splashScale = spec.splashScale ?? 1;
  dotScale = spec.dotScale ?? 1;
  splashDensity = spec.splashDensity ?? 0.35;
  const freckles = spec.freckle > 0 ? freckleMask(W, H, spec) : null;
  const img = ctx.createImageData(W, H);
  const d = img.data;
  for (let y = 0; y < H; y++) {
    const s = 1 - y / H;
    const wobble = (fbm(s * 4, 3.3, spec.seed + 71, 3) - 0.5) * 0.18;
    for (let x = 0; x < W; x++) {
      const signed = (x - W / 2) / (W / 2) - wobble;
      const a = Math.min(1, Math.abs(signed));
      const style = signed < 0 ? spec.left : spec.right;
      const seed = signed < 0 ? spec.seed : spec.rightSeed ?? spec.seed + 500;
      const amount = signed < 0 ? spec.amount : spec.rightAmount ?? spec.amount;
      const speck = freckles !== null && freckles[y * W + x] === 1;
      const isCream = cream(style, a, s, seed, amount);
      const show = spec.freckleMode === "cream" ? isCream && !speck : speck !== isCream;
      if (show) {
        const i = (y * W + x) * 4;
        d[i] = rgb[0];
        d[i + 1] = rgb[1];
        d[i + 2] = rgb[2];
        d[i + 3] = 255;
      }
    }
  }
  ctx.putImageData(img, 0, 0);
}
function randomSpec(seed) {
  if (seed >= 1e5) {
    const b = baseSpec(seed - 1e5);
    let x = seed;
    const r = () => (x = (x * 16807 + 11) % 2147483647) / 2147483647;
    return { ...b, amount: Math.max(b.amount, 0.6), freckle: 0.55 + 0.4 * r(), freckleMode: "cream" };
  }
  return baseSpec(seed);
}
function baseSpec(seed) {
  let x = seed * 9301 + 49297;
  const r = () => (x = x * 16807 % 2147483647) / 2147483647;
  const heavy = ["edge", "edge", "midrib", "marble", "streak", "full"];
  const light = ["green", "speckle", "streak", "edge", "marble", "green"];
  const h = heavy[Math.floor(r() * heavy.length)];
  const l = light[Math.floor(r() * light.length)];
  const swap = r() < 0.5;
  return { left: swap ? h : l, right: swap ? l : h, seed: Math.floor(r() * 1e3), amount: 0.3 + r() * 0.6, freckle: r() < 0.5 ? r() : 0 };
}
const CURATED_POTHOS = [100, 101, 103, 104, 107, 111, 112, 113, 114, 115, 401, 402, 404, 405, 406, 414, 415];
const CURATED_POTHOS_CREAM_FRECKLE = [100100, 100101, 100112, 100113, 100114, 100115, 100401, 100402, 100403, 100406, 100414, 100415];
const PICKED_HALVES = (() => {
  const out = [];
  const seen = /* @__PURE__ */ new Set();
  for (const id of [...CURATED_POTHOS, ...CURATED_POTHOS_CREAM_FRECKLE]) {
    const s = randomSpec(id);
    for (const [style, seed] of [[s.left, s.seed], [s.right, s.seed + 500]]) {
      if (style === "edge" || style === "midrib") continue;
      const key2 = `${style}:${seed}`;
      if (seen.has(key2)) continue;
      seen.add(key2);
      out.push({ style, seed, amount: s.amount });
    }
  }
  return out;
})();
const PROFILES$1 = {
  // Golden/marble pothos family (N'Joy, Pearls and Jade, Marble Queen): only the picked halves.
  pothos: { halves: PICKED_HALVES, freckleChance: 0.35, creamFreckleChance: 0.35, freckleCell: 1.5, color: [243, 239, 214] },
  // Monstera 'Albo Borsigiana': big white half-moons and sectors, often one whole half white.
  monsteraAlbo: { styles: [["full", 4], ["marble", 3], ["streak", 2], ["green", 1]], amount: [0.55, 0.9], freckleChance: 0.08, creamFreckleChance: 0.25, freckleCell: 1.6, plainHalfChance: 0.4, color: [255, 255, 250] },
  // Monstera 'Thai Constellation': cream daubs scattered over the leaf, no big sectors. Kept light (art review: the
  // realistic dense version read too busy for the style): fewer, bigger daubs, a calm half now and then.
  monsteraThai: { styles: [["splash", 1]], amount: [0.05, 0.3], freckleChance: 0, creamFreckleChance: 0, freckleCell: 2.4, plainHalfChance: 0.2, splashScale: 2, splashDensity: 0.1, color: [245, 240, 214] },
  // Peace lily 'Domino': thin white streaks along the veins plus freckles.
  peaceLilyDomino: { styles: [["streak", 3], ["marble", 2], ["speckle", 3]], amount: [0.4, 0.65], matchHalves: true, freckleChance: 0.8, creamFreckleChance: 0, freckleCell: 1.5, color: [255, 255, 248] },
  // ZZ 'Variegata' (rare sport): pale yellow-cream sectors and marbling, some leaflets nearly all cream, others green.
  zzVariegata: { styles: [["full", 4], ["marble", 2], ["green", 2]], amount: [0.5, 0.85], freckleChance: 0.1, creamFreckleChance: 0.3, freckleCell: 2.2, plainHalfChance: 0.45, color: [240, 234, 180] },
  // Whale fin (Dracaena masoniana): pale green mottling, round daubs over both halves.
  whaleFin: { styles: [["splash", 1]], amount: [0.1, 0.35], matchHalves: true, freckleChance: 0, creamFreckleChance: 0, splashScale: 2.2, splashDensity: 0.15, color: [122, 168, 120] },
  // Alocasia 'Frydek Variegata': bold white sectors, hemispheric.
  alocasiaFrydekVar: { styles: [["full", 4], ["marble", 2], ["green", 2]], amount: [0.55, 0.9], freckleChance: 0.08, creamFreckleChance: 0.25, freckleCell: 1.6, plainHalfChance: 0.45, color: [255, 255, 250] },
  // Calathea 'White Fusion': white streaks and marbling, lilac-white.
  calatheaWhiteFusion: { styles: [["marble", 3], ["streak", 3]], amount: [0.45, 0.75], matchHalves: true, freckleChance: 0.2, creamFreckleChance: 0.2, freckleCell: 1.5, color: [250, 248, 255] }
};
function rnd(seed) {
  let x = (seed * 9301 + 49297) % 2147483647;
  return () => (x = x * 16807 % 2147483647) / 2147483647;
}
function pickWeighted(list, r) {
  const total = list.reduce((a, [, w]) => a + w, 0);
  let t = r() * total;
  for (const [v, w] of list) if ((t -= w) <= 0) return v;
  return list[list.length - 1][0];
}
function assembleSpec(profile, n, scale = 1) {
  const p = PROFILES$1[profile];
  const r = rnd(n * 7919 + profile.length * 104729);
  const half = () => {
    if (p.halves) return p.halves[Math.floor(r() * p.halves.length)];
    const [a0, a1] = p.amount ?? [0.4, 0.8];
    return { style: pickWeighted(p.styles, r), seed: Math.floor(r() * 1e5), amount: a0 + r() * (a1 - a0) };
  };
  let L = half();
  let R = half();
  if (p.matchHalves) R = { style: L.style, seed: R.seed, amount: Math.min(1, Math.max(0, L.amount + (r() - 0.5) * 0.16)) };
  if (p.plainHalfChance && r() < p.plainHalfChance) {
    if (r() < 0.5) L = { ...L, style: "green" };
    else R = { ...R, style: "green" };
  }
  const fr = r();
  const freckleMode = fr < p.creamFreckleChance ? "cream" : fr < p.creamFreckleChance + p.freckleChance ? "both" : void 0;
  return {
    left: L.style,
    right: R.style,
    seed: L.seed,
    rightSeed: R.seed,
    amount: L.amount,
    rightAmount: R.amount,
    freckle: freckleMode ? 0.5 + 0.45 * r() : 0,
    freckleMode,
    freckleCell: (p.freckleCell ?? 1) * scale,
    splashScale: (p.splashScale ?? 1) * Math.sqrt(scale),
    dotScale: Math.sqrt(scale),
    splashDensity: p.splashDensity
  };
}
function profileColor(profile) {
  return PROFILES$1[profile].color;
}
const PATTERN_COLOR = {
  njoy: "#f3efd6",
  pearls: "#f0ecd0",
  marble: "#f1edd2",
  golden: "#ead46b",
  orbifolia: "#cfe2b2",
  polly: "#eef4e4",
  trifasciata: "#3e6b47",
  // dark zigzags on the pale kit leaf, like the photo
  masoniana: "#5f9a6c",
  rings: "#5b8a4f",
  vittatum: "#f2edc8",
  flecks: "#e6efe2",
  laurentii: "#e4d35e"
};
const X = (W, a) => W * (0.5 + 0.5 * a);
const Y = (H, s) => H * (1 - s);
function rng$1(seed) {
  let x = seed;
  return () => (x = x * 16807 % 2147483647) / 2147483647;
}
function band(ctx, W, H, side, s0, rise, w0, w1, reach2 = 1) {
  const N = 16;
  const upper = [];
  const lower = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const a = side * t * reach2;
    const sc = s0 + rise * Math.pow(t, 1.3);
    const w = w0 + (w1 - w0) * t;
    upper.push([X(W, a), Y(H, sc + w / 2)]);
    lower.push([X(W, a), Y(H, sc - w / 2)]);
  }
  ctx.beginPath();
  ctx.moveTo(...upper[0]);
  upper.forEach((p) => ctx.lineTo(...p));
  lower.reverse().forEach((p) => ctx.lineTo(...p));
  ctx.closePath();
  ctx.fill();
}
function midStripe(ctx, W, H, s0, s1, h0, h1) {
  const N = 20;
  ctx.beginPath();
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const h = (h0 + (h1 - h0) * t) * Math.min(1, Math.sin(Math.PI * Math.min(1, t * 1.05)) * 3);
    const p = [X(W, h), Y(H, s0 + (s1 - s0) * t)];
    if (i === 0) ctx.moveTo(...p);
    else ctx.lineTo(...p);
  }
  for (let i = N; i >= 0; i--) {
    const t = i / N;
    const h = (h0 + (h1 - h0) * t) * Math.min(1, Math.sin(Math.PI * Math.min(1, t * 1.05)) * 3);
    ctx.lineTo(X(W, -h), Y(H, s0 + (s1 - s0) * t));
  }
  ctx.closePath();
  ctx.fill();
}
function edgeCream(ctx, W, H, side, s0, s1, depth, r) {
  ctx.save();
  ctx.beginPath();
  if (side > 0) ctx.rect(W / 2, 0, W / 2, H);
  else ctx.rect(0, 0, W / 2, H);
  ctx.clip();
  const N = 14;
  for (let i = 0; i <= N; i++) {
    const sv = s0 + (s1 - s0) * (i / N);
    const taper = Math.sin(Math.PI * (i / N));
    const reach2 = depth * (0.5 + 0.5 * taper) * (0.8 + 0.4 * r());
    const R = W * 0.5 * (0.2 + 0.25 * r());
    blob(ctx, X(W, side * (1 - reach2)) + side * R, Y(H, sv), R * 1.05);
    blob(ctx, X(W, side * 1), Y(H, sv), W * 0.5 * reach2);
  }
  ctx.restore();
}
function blob(ctx, x, y, rad) {
  ctx.beginPath();
  ctx.arc(x, y, rad, 0, Math.PI * 2);
  ctx.fill();
}
function daubs(ctx, W, H, r, n, rmin, rmax) {
  for (let i = 0; i < n; i++) blob(ctx, X(W, (r() * 2 - 1) * 0.9), Y(H, 0.06 + r() * 0.88), W * (rmin + r() * (rmax - rmin)));
}
const PAINTERS = {
  // Illustrative pothos variegation, built from round daubs. Half-circles clipped at the midrib give the
  // "hemispheric" patches of N'Joy / Pearls and Jade; loose dots give the speckle.
  njoy: (ctx, W, H) => {
    const r = rng$1(41);
    edgeCream(ctx, W, H, 1, 0.05, 0.98, 0.95, r);
    edgeCream(ctx, W, H, -1, 0.55, 0.98, 0.7, r);
    daubs(ctx, W, H, r, 8, 0.015, 0.035);
  },
  pearls: (ctx, W, H) => {
    const r = rng$1(17);
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = "destination-out";
    for (let i = 0; i < 26; i++) {
      const sv = 0.04 + i / 26 * 0.86;
      const spread = 0.35 + 0.35 * Math.sin(Math.PI * sv);
      blob(ctx, X(W, (r() * 2 - 1) * spread * 0.6), Y(H, sv), W * (0.1 + r() * 0.12) * (0.6 + 0.6 * Math.sin(Math.PI * sv)));
    }
    ctx.globalCompositeOperation = "source-over";
    daubs(ctx, W, H, r, 10, 0.012, 0.028);
  },
  marble: (ctx, W, H) => {
    const r = rng$1(29);
    edgeCream(ctx, W, H, -1, 0.25, 0.85, 0.75, r);
    for (let c = 0; c < 10; c++) {
      const ca = (r() * 2 - 1) * 0.7;
      const cs = 0.1 + r() * 0.8;
      for (let i = 0; i < 9; i++) blob(ctx, X(W, ca + (r() - 0.5) * 0.35), Y(H, cs + (r() - 0.5) * 0.12), W * (0.012 + r() * 0.03));
    }
  },
  golden: (ctx, W, H) => {
    const r = rng$1(23);
    edgeCream(ctx, W, H, 1, 0.3, 0.8, 0.6, r);
    daubs(ctx, W, H, r, 14, 0.02, 0.05);
  },
  orbifolia: (ctx, W, H) => {
    const n = 8;
    const step = 0.84 / n;
    for (let k = 0; k < n; k++) {
      const s0 = 0.08 + step * k;
      for (const side of [1, -1]) band(ctx, W, H, side, s0, 0.2, step * 0.5, step * 0.32, 0.9);
    }
    midStripe(ctx, W, H, -0.02, 0.97, 0.035, 0.015);
  },
  polly: (ctx, W, H) => {
    midStripe(ctx, W, H, -0.02, 0.97, 0.09, 0.025);
    for (let k = 0; k < 5; k++) for (const side of [1, -1]) band(ctx, W, H, side, 0.28 + 0.13 * k, 0.1, 0.03, 0.012, 0.9);
  },
  laurentii: (ctx, W, H) => {
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(X(W, side * 1.05), Y(H, -0.02));
      for (let i = 0; i <= 40; i++) {
        const s = i / 40;
        const w = (0.2 + 0.03 * Math.sin(s * 37)) * (s > 0.85 ? Math.max(0.3, 1 - (s - 0.85) * 4) : 1);
        ctx.lineTo(X(W, side * (1 - w)), Y(H, s));
      }
      ctx.lineTo(X(W, side * 1.05), Y(H, 1.02));
      ctx.closePath();
      ctx.fill();
    }
  },
  trifasciata: (ctx, W, H) => {
    const r = rng$1(9);
    const n = 8;
    for (let k = 0; k < n; k++) {
      const s = 0.05 + 0.92 * k / n;
      const h = 0.022 + r() * 0.01;
      const teeth = 3 + Math.floor(r() * 2);
      const tilt = (r() - 0.5) * 0.03;
      const amp = 0.03 + r() * 0.012;
      ctx.beginPath();
      for (let i = 0; i <= teeth * 2; i++) {
        const a = -1.02 + 2.04 * i / (teeth * 2);
        ctx.lineTo(X(W, a), Y(H, s + h + tilt * a + (i % 2 ? amp : -amp * 0.4)));
      }
      for (let i = teeth * 2; i >= 0; i--) {
        const a = -1.02 + 2.04 * i / (teeth * 2);
        ctx.lineTo(X(W, a), Y(H, s - h + tilt * a + (i % 2 ? amp : -amp * 0.4)));
      }
      ctx.closePath();
      ctx.fill();
    }
  },
  masoniana: (ctx, W, H) => {
    const r = rng$1(5);
    for (let i = 0; i < 45; i++) {
      const a = (r() * 2 - 1) * 0.95;
      const s = 0.03 + r() * 0.92;
      const rad = W * (0.025 + r() * 0.035);
      ctx.beginPath();
      ctx.ellipse(X(W, a), Y(H, s), rad, rad * (1.3 + r()), r() * 3, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  rings: (ctx, W, H) => {
    for (let k = 0; k < 9; k++) ctx.fillRect(0, Y(H, 0.08 + k * 0.1) - H * 7e-3, W, H * 0.014);
  },
  vittatum: (ctx, W, H) => {
    midStripe(ctx, W, H, 0, 0.98, 0.34, 0.14);
  },
  flecks: (ctx, W, H) => {
    const r = rng$1(3);
    for (let i = 0; i < 26; i++) {
      ctx.beginPath();
      ctx.ellipse(X(W, (r() * 2 - 1) * 0.75), Y(H, 0.08 + r() * 0.8), W * 0.018, H * 0.012, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
};
const textures = /* @__PURE__ */ new Map();
function patternTexture(name) {
  const hit = textures.get(name);
  if (hit) return hit;
  const W = 256;
  const H = 512;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, W, H);
  ctx.filter = "none";
  if (name.startsWith("pothos:")) {
    paintVariegation(ctx, W, H, randomSpec(Number(name.slice(7))), [243, 239, 214]);
  } else if (name.startsWith("var:")) {
    const [, prof, n, sc] = name.split(":");
    paintVariegation(ctx, W, H, assembleSpec(prof, Number(n), sc ? Number(sc) : 1), profileColor(prof));
  } else {
    const fixed = name;
    ctx.fillStyle = PATTERN_COLOR[fixed];
    PAINTERS[fixed](ctx, W, H);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.channel = 1;
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  textures.set(name, tex);
  return tex;
}
const materials = /* @__PURE__ */ new Map();
function patternMaterial(name, bothFaces = false) {
  const hit = materials.get(`${name}|${bothFaces}`);
  if (hit) return hit;
  const m = new THREE.MeshStandardMaterial({
    map: patternTexture(name),
    alphaTest: 0.5,
    // crisp two-colour edges
    emissive: new THREE.Color(16777215),
    emissiveMap: patternTexture(name),
    // a little self-light so pale patches stay pale in shade, like painted colour
    emissiveIntensity: 0.18,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
    roughness: 0.9,
    side: bothFaces ? THREE.DoubleSide : THREE.FrontSide
  });
  materials.set(`${name}|${bothFaces}`, m);
  return m;
}
function patternMidrib(blade2, normal) {
  blade2.updateMatrixWorld(true);
  const inv = blade2.matrixWorld.clone().invert();
  const pts = [];
  blade2.traverse((o) => {
    const mesh = o;
    if (!mesh.isMesh) return;
    const pos = mesh.geometry.getAttribute("position");
    const m = inv.clone().multiply(mesh.matrixWorld);
    for (let i = 0; i < pos.count; i++) pts.push(new THREE.Vector3().fromBufferAttribute(pos, i).applyMatrix4(m));
  });
  const c = pts.reduce((a, p) => a.add(p), new THREE.Vector3()).multiplyScalar(1 / pts.length);
  const tip = pts.reduce((best, p) => p.distanceTo(c) + 0.6 * p.length() > best.distanceTo(c) + 0.6 * best.length() ? p : best);
  const base2 = pts.reduce((best, p) => p.lengthSq() < best.lengthSq() ? p : best);
  const d = tip.clone().sub(base2);
  return d.addScaledVector(normal, -d.dot(normal)).normalize();
}
function addLeafSpaceUV(blade2, mapping2 = "contour") {
  const { normal } = bladeAxes(blade2);
  const midrib = patternMidrib(blade2, normal);
  const across = new THREE.Vector3().crossVectors(normal, midrib).normalize();
  const copy = blade2.clone();
  copy.updateMatrixWorld(true);
  const inv = copy.matrixWorld.clone().invert();
  const meshes = [];
  copy.traverse((o) => {
    if (o.isMesh) meshes.push(o);
  });
  const BINS = 24;
  let L = 1e-6;
  let s0 = Infinity;
  for (const mesh of meshes) {
    const pos = mesh.geometry.getAttribute("position");
    const m = inv.clone().multiply(mesh.matrixWorld);
    for (let i = 0; i < pos.count; i++) s0 = Math.min(s0, new THREE.Vector3().fromBufferAttribute(pos, i).applyMatrix4(m).dot(midrib));
  }
  const pts = meshes.map((mesh) => {
    mesh.geometry = mesh.geometry.clone();
    const pos = mesh.geometry.getAttribute("position");
    const m = inv.clone().multiply(mesh.matrixWorld);
    const out = [];
    for (let i = 0; i < pos.count; i++) {
      const p = new THREE.Vector3().fromBufferAttribute(pos, i).applyMatrix4(m);
      const s = p.dot(midrib) - s0;
      L = Math.max(L, s);
      out.push({ s, x: p.dot(across) });
    }
    return out;
  });
  const lo = new Array(BINS).fill(Infinity);
  const hi = new Array(BINS).fill(-Infinity);
  const bin = (s) => Math.min(BINS - 1, Math.max(0, Math.floor(s / L * BINS)));
  for (const list of pts)
    for (const p of list) {
      const b = bin(p.s);
      lo[b] = Math.min(lo[b], p.x);
      hi[b] = Math.max(hi[b], p.x);
    }
  for (let b = 0; b < BINS; b++)
    if (!isFinite(lo[b])) {
      const n = [b - 1, b + 1].find((k) => k >= 0 && k < BINS && isFinite(lo[k]));
      if (n !== void 0) lo[b] = lo[n], hi[b] = hi[n];
      else lo[b] = -1, hi[b] = 1;
    }
  let centre = (_b) => 0;
  let half = lo.map((l, b) => Math.max(1e-6, Math.abs(l), Math.abs(hi[b])));
  const halfAt = (s) => {
    const f = THREE.MathUtils.clamp(s / L * BINS - 0.5, 0, BINS - 1);
    const i = Math.min(BINS - 2, Math.floor(f));
    return THREE.MathUtils.lerp(half[i], half[i + 1], f - i);
  };
  if (mapping2 === "planar") {
    let sw = 0, ss = 0, sc = 0, sss = 0, ssc = 0;
    for (let b = 0; b < BINS; b++) {
      const w = hi[b] - lo[b];
      const sb = (b + 0.5) / BINS;
      const cb = (lo[b] + hi[b]) / 2;
      sw += w;
      ss += w * sb;
      sc += w * cb;
      sss += w * sb * sb;
      ssc += w * sb * cb;
    }
    const det = sw * sss - ss * ss || 1e-9;
    const c1 = (sw * ssc - ss * sc) / det;
    const c0 = (sc - c1 * ss) / sw;
    let hmax = 1e-6;
    for (let b = 0; b < BINS; b++) {
      const cb = c0 + c1 * ((b + 0.5) / BINS);
      hmax = Math.max(hmax, Math.abs(hi[b] - cb), Math.abs(lo[b] - cb));
    }
    centre = () => 0;
    half = half.map(() => hmax);
    for (const list of pts) for (const p of list) p.x -= c0 + c1 * THREE.MathUtils.clamp(p.s / L, 0, 1);
  }
  meshes.forEach((mesh, k) => {
    const uv1 = new Float32Array(pts[k].length * 2);
    pts[k].forEach((p, i) => {
      const s = THREE.MathUtils.clamp(p.s / L, 0, 1);
      const b = bin(p.s);
      const a = THREE.MathUtils.clamp((p.x - centre(b)) / (mapping2 === "planar" ? half[b] : halfAt(p.s)), -1, 1);
      uv1[i * 2] = 0.5 + 0.5 * a;
      uv1[i * 2 + 1] = s;
    });
    mesh.geometry.setAttribute("uv1", new THREE.BufferAttribute(uv1, 2));
  });
  return copy;
}
function topFaceOnly(mesh, up, root) {
  const g = mesh.geometry;
  const pos = g.getAttribute("position");
  root.updateMatrixWorld(true);
  const m = root.matrixWorld.clone().invert().multiply(mesh.matrixWorld);
  const nm = new THREE.Matrix3().getNormalMatrix(m);
  const src = g.index ? Array.from(g.index.array) : Array.from({ length: pos.count }, (_, i) => i);
  const keep = [];
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  for (let i = 0; i < src.length; i += 3) {
    a.fromBufferAttribute(pos, src[i]);
    b.fromBufferAttribute(pos, src[i + 1]);
    c.fromBufferAttribute(pos, src[i + 2]);
    const n = b.clone().sub(a).cross(c.clone().sub(a)).applyMatrix3(nm).normalize();
    if (n.dot(up) > -0.3) keep.push(src[i], src[i + 1], src[i + 2]);
  }
  const out = new THREE.BufferGeometry();
  for (const [k, v] of Object.entries(g.attributes)) out.setAttribute(k, v);
  out.setIndex(keep);
  return out;
}
const patterned = /* @__PURE__ */ new Map();
function withPattern(blade2, name, cacheKey, mapping2 = "contour", bothFaces) {
  if (!name) return blade2;
  const key2 = cacheKey ? `${cacheKey}|${name}|${mapping2}|${bothFaces}` : void 0;
  if (key2 && patterned.has(key2)) return patterned.get(key2);
  const base2 = addLeafSpaceUV(blade2, mapping2);
  const group = new THREE.Group();
  group.add(base2);
  const meshes = [];
  base2.traverse((o) => {
    if (o.isMesh) meshes.push(o);
  });
  const { normal } = bladeAxes(blade2);
  const both = bothFaces ?? (name.startsWith("var:") || name.startsWith("pothos:"));
  for (const mesh of meshes) {
    const overlay = new THREE.Mesh(both ? mesh.geometry : topFaceOnly(mesh, normal, base2), patternMaterial(name, both));
    overlay.renderOrder = 1;
    mesh.add(overlay);
  }
  if (key2) patterned.set(key2, group);
  return group;
}
function mapping(o) {
  const L = o.length;
  const notch = o.notch ?? 0;
  const notchY = notch * L;
  let maxW = 0;
  for (let i = 0; i <= 40; i++) maxW = Math.max(maxW, o.halfWidth(i / 40) * L);
  const thick = (o.thickness ?? 0.1) * L;
  const cup = (o.cup ?? -0.04) * L;
  const bend = (o.bend ?? 0.08) * L;
  const at = (side, s, a) => {
    const hw = o.halfWidth(s) * L;
    const inner = notch > 0 && s < notch ? hw * 0.6 * Math.pow(1 - s / notch, 0.7) : 0;
    const x = side * (inner + a * (hw - inner));
    const local = (hw - inner) / Math.max(1e-6, maxW);
    const ends = Math.pow(Math.min(1, 5 * s, 5 * (1 - s)), 0.35);
    const bulge = thick * Math.min(1, local * 1.8) * ends * Math.pow(Math.max(0, 1 - Math.pow(a, 2.5)), 0.32);
    const across = Math.abs(x) / Math.max(1e-6, maxW);
    const fold = -0.05 * L * across;
    const lift = cup * across * across + fold;
    const droop = -bend * s * s;
    const roll = o.roll ?? 0;
    if (roll > 1e-3 && hw > 1e-6) {
      const span = roll * Math.PI * 0.92;
      const R = hw / span;
      const th = x / hw * span;
      const [sn, cs] = [Math.sin(th), Math.cos(th)];
      const px = R * sn;
      const pz = R * (1 - cs);
      const zf = lift + bulge * 0.6;
      const zb = lift - bulge * 0.4;
      return { x: px - (zf + zb) / 2 * sn, y: s * L - notchY, zFront: pz + zf * cs + droop, zBack: pz + zb * cs + droop };
    }
    return { x, y: s * L - notchY, zFront: lift + droop + bulge * 0.6, zBack: lift + droop - bulge * 0.4 };
  };
  return { L, maxW, at };
}
function smoothNormals(geo) {
  geo.computeVertexNormals();
  const pos = geo.getAttribute("position");
  const nrm = geo.getAttribute("normal");
  const acc = /* @__PURE__ */ new Map();
  const key2 = (i) => `${pos.getX(i).toFixed(4)},${pos.getY(i).toFixed(4)},${pos.getZ(i).toFixed(4)}`;
  for (let i = 0; i < pos.count; i++) {
    const k = key2(i);
    const v = acc.get(k) ?? new THREE.Vector3();
    v.x += nrm.getX(i);
    v.y += nrm.getY(i);
    v.z += nrm.getZ(i);
    acc.set(k, v);
  }
  for (let i = 0; i < pos.count; i++) {
    const v = acc.get(key2(i)).clone().normalize();
    nrm.setXYZ(i, v.x, v.y, v.z);
  }
  nrm.needsUpdate = true;
}
function veinAmount(p, s, a) {
  const from = p.from ?? 0.12;
  const to = p.to ?? 0.88;
  const rise = p.rise ?? 0.18;
  const strength = p.strength ?? 0.7;
  const width = p.width ?? 0.35;
  let v = 0;
  if (p.midrib !== false) v = Math.max(v, Math.exp(-Math.pow(a / 0.12, 2)));
  const phase = (s - rise * a - from) / Math.max(1e-6, to - from) * Math.max(1, p.count - 1);
  if (phase > -0.5 && phase < p.count - 0.5) {
    const d = phase - Math.round(phase);
    v = Math.max(v, Math.exp(-Math.pow(d / width, 2)) * (1 - 0.5 * a * a));
  }
  return v * strength;
}
function paddedLeaf(o) {
  const map = mapping(o);
  const rows = o.samples ?? 14;
  const cols = o.cols ?? 6;
  const sheen = o.sheen ?? 0;
  const pos = [];
  const uv = [];
  const idx = [];
  const uvOf = (p, s, a) => [
    THREE.MathUtils.lerp(p.u0, p.u1, 0.5 + 0.5 * a),
    THREE.MathUtils.lerp(p.vBase, p.vTip, THREE.MathUtils.clamp(s * (1 - sheen) + (1 - a) * sheen, 0, 1))
  ];
  for (const side of [1, -1]) {
    for (const face of [1, -1]) {
      const start = pos.length / 3;
      for (let i = 0; i <= rows; i++) {
        const s = i / rows;
        for (let j = 0; j <= cols; j++) {
          const a = 1 - Math.pow(1 - j / cols, 1.6);
          const p = map.at(side, s, a);
          pos.push(p.x, p.y, face > 0 ? p.zFront : p.zBack);
          const t = face > 0 ? uvOf(o.uv, s, a) : uvOf(o.backUV ?? o.uv, s, a);
          if (face > 0 && o.pattern) t[1] = THREE.MathUtils.lerp(t[1], o.pattern.v, veinAmount(o.pattern, s, a));
          uv.push(...t);
        }
      }
      const flip = face > 0 !== side > 0;
      for (let i = 0; i < rows; i++)
        for (let j = 0; j < cols; j++) {
          const a = start + i * (cols + 1) + j;
          const b = a + 1;
          const c = a + cols + 1;
          const d = c + 1;
          if (flip) idx.push(a, c, b, b, c, d);
          else idx.push(a, b, c, b, d, c);
        }
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx);
  smoothNormals(geo);
  return geo;
}
const profiles = {
  /** Classic snake plant sword: narrow stalk-like base, long straight blade, drawn-out point. */
  sword: (s) => 0.012 + 0.068 * Math.min(1, s / 0.18) ** 0.6 * Math.pow(Math.max(0, 1 - Math.max(0, s - 0.55) / 0.45), 0.85),
  /** Whale fin sansevieria: narrow base, very broad paddle, short rounded point. */
  whaleFin: (s) => 0.02 + 0.13 * Math.pow(Math.sin(Math.PI * Math.min(1, Math.pow(s, 0.85))), 0.6) * (s > 0.85 ? Math.max(0.05, 1 - (s - 0.85) * 5.5) : 1)
};
function swatch(col, row, from, to) {
  return { u0: col * 0.125 + 0.03, u1: col * 0.125 + 0.095, vBase: (row + from) * 0.25, vTip: (row + to) * 0.25 };
}
const PALETTE = {
  deepGreen: swatch(1, 1, 0.66, 0.3),
  // glossy dark green (peace lily)
  inkGreen: swatch(1, 1, 0.74, 0.46),
  // very dark green (alocasia); the swatch's light end is pale yellow-green for veins
  freshGreen: swatch(1, 1, 0.56, 0.2),
  // calathea green; the swatch's light end paints the stripes
  oliveGreen: swatch(6, 2, 0.88, 0.38),
  // calathea feathering: soft, a few shades lighter than the leaf
  white: swatch(3, 0, 0.05, 0.3),
  cream: swatch(0, 3, 0.35, 0.65),
  orange: swatch(0, 2, 0.25, 0.65),
  blue: swatch(4, 1, 0.45, 0.85),
  lavender: swatch(6, 1, 0.4, 0.7)
};
const PROFILES = {
  peaceLily: (s) => 0.015 + 0.2 * Math.pow(Math.sin(Math.PI * Math.pow(s, 0.68)), 0.75),
  // Alocasia 'Frydek': long arrowhead (sagittate) with rounded back lobes, broad shoulders, convex sides, drawn-out tip
  alocasia: (s) => s < 0.3 ? 0.27 * (0.4 + 0.6 * Math.sqrt(Math.max(0, 1 - Math.pow((0.3 - s) / 0.3, 2)))) : 0.27 * Math.pow(1 - (s - 0.3) / 0.7, 0.7) + 6e-3,
  // near-straight sides to a long point
  calathea: (s) => 0.02 + 0.38 * Math.pow(Math.sin(Math.PI * Math.pow(s, 0.9)), 0.55),
  paddle: (s) => 0.012 + 0.16 * Math.pow(Math.sin(Math.PI * Math.pow(s, 0.85)), 0.5),
  spathe: (s) => 0.01 + 0.2 * Math.pow(Math.sin(Math.PI * Math.pow(s, 0.65)), 0.8)
};
function jitter$1(key2) {
  const x = Math.sin(key2 * 127.1 + 311.7) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
}
const UP$1 = new THREE.Vector3(0, 1, 0);
const bladeCache = /* @__PURE__ */ new Map();
const plainBlades = /* @__PURE__ */ new Map();
function blade(key2, leaf, material, pattern = null, veins) {
  const hit = bladeCache.get(`${key2}|${pattern}`);
  if (hit) return hit;
  let g = plainBlades.get(key2);
  if (!g) {
    g = new THREE.Group();
    const { pattern: _ignored, ...plain } = leaf;
    g.add(new THREE.Mesh(paddedLeaf(plain), material));
    plainBlades.set(key2, g);
  }
  const out = withPattern(g, pattern, key2);
  bladeCache.set(`${key2}|${pattern}`, out);
  return out;
}
function variegated(profile, g, fallback) {
  return profile ? `var:${profile}:${g % 12}` : fallback;
}
function growClump(spec, age2, potRadius, stalkMaterial) {
  var _a;
  const plant = new THREE.Group();
  if (age2 <= 0) return plant;
  const total = Math.floor(age2);
  const unfurl = age2 - total;
  const golden = 2.39996;
  for (let k = 0; k * spec.perCrown <= total; k++) {
    const first = k * spec.perCrown;
    const count = Math.min(spec.perCrown, total - first + 1);
    const ang = k * golden + 0.7;
    const rad = k === 0 ? potRadius * 0.15 : potRadius * (0.62 + 0.15 * (k % 2));
    const base2 = new THREE.Vector3(Math.sin(ang) * rad, -0.03, Math.cos(ang) * rad);
    let tallest = 0;
    for (let j = 0; j < count; j++) {
      const g = first + j;
      const isNewest = g === total;
      const grow = isNewest ? 0.45 + 0.55 * unfurl : 1;
      const m = Math.min(1, g / spec.matureAt);
      const age01 = (count - 1 - j) / Math.max(1, spec.perCrown - 1);
      const heading = ang + j * golden + 0.25 * jitter$1(g * 7);
      const len = spec.stalk(m) * grow * (1 + 0.08 * jitter$1(g * 7 + 1));
      tallest = Math.max(tallest, len);
      const lean = THREE.MathUtils.lerp(spec.lean[0], spec.lean[1], age01) + (k ? 0.1 : 0) + 0.05 * jitter$1(g * 7 + 2);
      const drop = THREE.MathUtils.lerp(spec.drop[0], spec.drop[1], age01) + 0.1 * jitter$1(g * 7 + 3);
      const roll = Math.min(0.9, 0.45 * Math.pow(1 - m, 2) + (isNewest ? 0.8 * (1 - unfurl) : 0));
      const b = spec.blade(m, g, Math.round(roll * 8) / 8);
      const leaf = createNaturalLeaf(
        b.obj,
        { length: len, lean, arch: (spec.arch ?? 0.15) + 0.08 * jitter$1(g * 7 + 4), heading, baseRadius: spec.stalkRadius, tipRadius: spec.stalkRadius * 0.7 },
        // upright (tip-up) leaves face outward like in the photos; spreading leaves face up
        { heading, drop, roll: 0.12 * jitter$1(g * 7 + 5), face: UP$1.clone().addScaledVector(new THREE.Vector3(Math.sin(heading), 0, Math.cos(heading)), 0.3 + 1.6 * Math.max(0, -drop)).normalize() },
        stalkMaterial,
        b.scale * grow
      );
      leaf.position.copy(base2);
      plant.add(leaf);
    }
    const f = (_a = spec.flower) == null ? void 0 : _a.call(spec, k, total, tallest, ang + 1.3);
    if (f) {
      f.position.add(base2);
      plant.add(f);
    }
  }
  return plant;
}
function basis(obj, x, y, z) {
  obj.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));
}
function flowerStalk(length, heading, lean, material) {
  const stalk = buildStalk({ length, baseRadius: 0.014, tipRadius: 0.011, lean, arch: 0.1, heading, segments: 6 });
  return { mesh: new THREE.Mesh(stalk.geometry, material), tip: stalk.tipPosition };
}
function peaceLily(leafMat, variegation) {
  return {
    perCrown: 8,
    matureAt: 8,
    stalkRadius: 0.012,
    lean: [0.1, 0.55],
    drop: [-1, 0.25],
    arch: 0.25,
    stalk: (m) => 0.2 + 0.28 * m,
    blade: (m, g, roll) => {
      const v = g % 2;
      const obj = blade(`pl${v}r${roll}`, {
        length: 0.85 + 0.1 * v,
        halfWidth: PROFILES.peaceLily,
        uv: PALETTE.deepGreen,
        cup: -0.045,
        bend: 0.2,
        roll
      }, leafMat, variegated(variegation, g, null));
      return { obj, scale: 0.5 + 0.5 * m };
    },
    flower: (k, g, tallest, heading) => {
      if (g < 9 + k * 3) return null;
      const grp = new THREE.Group();
      const st = flowerStalk(tallest + 0.75, heading, 0.14, leafMat);
      grp.add(st.mesh);
      const spatheOpts = { length: 0.36, halfWidth: PROFILES.spathe, uv: PALETTE.white, cup: 0.06, bend: -0.04, thickness: 0.02 };
      const spathe = new THREE.Mesh(paddedLeaf(spatheOpts), leafMat);
      const spadix = new THREE.Mesh(new THREE.CapsuleGeometry(0.018, 0.09, 3, 6), leafMat);
      setUV(spadix.geometry, PALETTE.cream);
      spadix.position.set(0, 0.075, 0.03);
      const head = new THREE.Group();
      head.add(spathe, spadix);
      const out = new THREE.Vector3(Math.sin(heading), 0, Math.cos(heading));
      const yDir = UP$1.clone().addScaledVector(out, 0.35).normalize();
      const zDir = out.clone().addScaledVector(yDir, -out.dot(yDir)).normalize();
      basis(head, new THREE.Vector3().crossVectors(yDir, zDir), yDir, zDir);
      head.position.copy(st.tip);
      grp.add(head);
      return grp;
    }
  };
}
function alocasia(leafMat, variegation) {
  return {
    perCrown: 3,
    matureAt: 5,
    stalkRadius: 0.032,
    lean: [0.12, 0.5],
    drop: [0.25, 0.85],
    arch: 0.08,
    stalk: (m) => 0.55 + 0.75 * m,
    blade: (m, g, roll) => {
      const v = g % 2;
      const opts = { length: 1 + 0.08 * v, halfWidth: PROFILES.alocasia, uv: PALETTE.inkGreen, cup: -0.03, bend: 0.06, notch: 0.3, roll };
      const obj = blade(`al${v}r${roll}`, opts, leafMat, variegated(variegation, g, "polly"));
      return { obj, scale: 0.6 + 0.55 * m };
    }
  };
}
function calathea(leafMat, variegation) {
  return {
    perCrown: 7,
    matureAt: 7,
    stalkRadius: 0.012,
    lean: [0.1, 0.6],
    drop: [-0.9, 0.35],
    arch: 0.22,
    stalk: (m) => 0.22 + 0.3 * m,
    blade: (m, g, roll) => {
      const v = g % 2;
      const opts = { length: 0.68 + 0.06 * v, halfWidth: PROFILES.calathea, uv: PALETTE.freshGreen, backUV: PALETTE.deepGreen, cup: -0.04, bend: 0.08, roll };
      const obj = blade(`ca${v}r${roll}`, opts, leafMat, variegated(variegation, g, "orbifolia"));
      return { obj, scale: 0.55 + 0.45 * m };
    }
  };
}
function birdOfParadise(leafMat) {
  return {
    perCrown: 6,
    matureAt: 6,
    stalkRadius: 0.024,
    lean: [0.06, 0.45],
    drop: [-1, -0.15],
    // long stalks, paddles held up high, older ones opening out
    arch: 0.08,
    stalk: (m) => 0.5 + 0.75 * m,
    blade: (m, g, roll) => {
      const v = g % 2;
      const obj = blade(`bp${v}r${roll}`, {
        length: 0.95 + 0.1 * v,
        halfWidth: PROFILES.paddle,
        uv: PALETTE.oliveGreen,
        cup: -0.025,
        bend: 0.03,
        roll
      }, leafMat, null);
      return { obj, scale: 0.5 + 0.5 * m };
    },
    flower: (k, g, tallest, heading) => {
      if (g < 9 + k * 4) return null;
      const grp = new THREE.Group();
      const st = flowerStalk(tallest * 0.95, heading, 0.2, leafMat);
      grp.add(st.mesh);
      const head = new THREE.Group();
      const beak = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.32, 6), leafMat);
      setUV(beak.geometry, PALETTE.lavender);
      beak.rotation.z = -Math.PI / 2;
      beak.position.x = 0.12;
      head.add(beak);
      for (let i = 0; i < 3; i++) {
        const petal = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.2, 5), leafMat);
        setUV(petal.geometry, PALETTE.orange);
        petal.position.set(0.02 + i * 0.03, 0.09, (i - 1) * 0.02);
        petal.rotation.z = -0.35 - i * 0.25;
        head.add(petal);
      }
      const tongue = new THREE.Mesh(new THREE.ConeGeometry(0.012, 0.16, 5), leafMat);
      setUV(tongue.geometry, PALETTE.blue);
      tongue.position.set(0.1, 0.06, 0);
      tongue.rotation.z = -0.9;
      head.add(tongue);
      head.rotation.y = heading - Math.PI / 2;
      head.scale.setScalar(1.8);
      head.position.copy(st.tip);
      grp.add(head);
      return grp;
    }
  };
}
function setUV(geo, p) {
  const uv = geo.getAttribute("uv");
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (p.u0 + p.u1) / 2, THREE.MathUtils.lerp(p.vBase, p.vTip, uv.getY(i)));
  uv.needsUpdate = true;
}
const UP = new THREE.Vector3(0, 1, 0);
const POTHOS_UV = { u: 0.0562, vBase: 0.28, vTip: 0.39 };
function jitter(key2) {
  const x = Math.sin(key2 * 127.1 + 311.7) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
}
function monsteraLeafFor(type, node) {
  const seq = [
    { file: "monstera_baby_A", scale: 0.85, stalk: 0.55 },
    { file: "monstera_baby_B", scale: 1, stalk: 0.7 },
    { file: "monstera_baby_C", scale: 1.1, stalk: 0.8 },
    { file: `monstera_${type}_stage1`, scale: 0.6, stalk: 0.95 },
    { file: `monstera_${type}_stage2`, scale: 0.7, stalk: 1.05 },
    { file: `monstera_${type}_stage3`, scale: 0.82, stalk: 1.15 },
    { file: `monstera_${type}_stage4`, scale: 0.92, stalk: 1.25 },
    { file: `monstera_${type}_stage5`, scale: 1.02, stalk: 1.35 }
  ];
  return seq[Math.min(node, seq.length - 1)];
}
function aerialRoot(from, outward, length, material) {
  const end = from.clone().addScaledVector(outward, length * 0.45).setY(from.y - length);
  const mid = from.clone().addScaledVector(outward, length * 0.35).add(new THREE.Vector3(0, -length * 0.2, 0));
  return new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(from, mid, end), 4, 0.01, 5, false), material);
}
function rootNub(from, outward, length, material) {
  const dir = outward.clone().multiplyScalar(0.55).add(new THREE.Vector3(0, -1, 0)).normalize();
  const geo = new THREE.CylinderGeometry(9e-3, 0.024, length, 6, 1);
  geo.translate(0, -length / 2, 0);
  const mesh = new THREE.Mesh(geo, material);
  mesh.position.copy(from);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir);
  return mesh;
}
function growMonstera(assets, type, age2, options) {
  const plant = new THREE.Group();
  if (age2 <= 0) return plant;
  const per = options.leavesPerShoot ?? 4;
  const sink = options.sink ?? 0.05;
  const total = Math.floor(age2);
  const unfurl = age2 - total;
  const internode = 0.13;
  const golden = 2.39996;
  for (let k = 0; k * per <= total; k++) {
    const first = k * per;
    const count = Math.min(per, total - first + 1);
    const shootIsGrowing = first + count - 1 === total;
    const ang = k * golden + 0.6;
    const rad = k === 0 ? options.potRadius * 0.15 : options.potRadius * (0.62 + 0.12 * (k % 2));
    const base2 = new THREE.Vector3(Math.sin(ang) * rad, -sink, Math.cos(ang) * rad);
    const outAng = k === 0 ? 0.6 : ang;
    const stemLen = sink + Math.max(0.04, (count - 1 + (shootIsGrowing ? unfurl : 1)) * internode);
    const stem = buildStalk({ length: stemLen, baseRadius: 0.06, tipRadius: 0.048, lean: 0.1, arch: 0.05, heading: outAng, segments: 4 });
    const stemMesh = new THREE.Mesh(stem.geometry, assets.stalkMaterial);
    stemMesh.position.copy(base2);
    plant.add(stemMesh);
    const along = (d) => {
      const pts = stem.points;
      const f = THREE.MathUtils.clamp(d / stemLen, 0, 1) * (pts.length - 1);
      const i = Math.min(pts.length - 2, Math.floor(f));
      return pts[i].clone().lerp(pts[i + 1], f - i).add(base2);
    };
    for (let j = 0; j < count; j++) {
      const g = first + j;
      const isNewest = g === total;
      const nodePos = along(sink + j * internode + 0.02);
      const fan = k === 0 ? 0.75 + 0.35 * j : 0.55 + 0.25 * j;
      const heading = outAng + (j % 2 === 0 ? -1 : 1) * fan + (k === 0 ? j % 2 * Math.PI : 0) + 0.25 * jitter(g * 7 + 1);
      const stage = Math.max(0, g - 2 * k);
      const leaf = monsteraLeafFor(type, stage);
      if (isNewest && unfurl < 0.5) {
        if (unfurl <= 0.05) break;
        const grow = THREE.MathUtils.smoothstep(unfurl, 0.05, 0.5);
        plant.add(positioned(createLeaf(assets.monstera.get("monstera_rolled"), { length: leaf.stalk * (0.35 + 0.45 * grow), lean: 0.08, arch: 0.05, heading, baseRadius: 0.03, tipRadius: 0.024 }, assets.stalkMaterial, 0.5 + 0.4 * grow), nodePos));
        continue;
      }
      const expand = isNewest ? 0.7 + 0.3 * THREE.MathUtils.smoothstep(unfurl, 0.5, 1) : 1;
      const stalkLen = leaf.stalk * expand * (1 + 0.08 * jitter(g * 7 + 3));
      const reach2 = Math.min(1, stalkLen / 1.35);
      const age01 = (count - 1 - j) / Math.max(1, per - 1);
      const lean = 0.2 + 0.35 * age01 + 0.12 * reach2 + 0.06 * jitter(g * 7 + 2);
      const drop = -0.1 + 0.55 * age01 + 0.25 * reach2 + 0.12 * jitter(g * 7 + 6);
      const r = THREE.MathUtils.clamp(stalkLen * 0.016, 0.012, 0.024);
      const pattern = options.sport && isNewest ? options.sport : options.variegation;
      const patternIx = options.sport && isNewest ? options.sportIx ?? 0 : g % 12;
      const leafGroup = positioned(
        createNaturalLeaf(
          // baby leaves are small: bigger freckles/daubs so they stay readable
          pattern ? withPattern(assets.monstera.get(leaf.file), `var:${pattern}:${patternIx}:${leaf.file.includes("baby") ? 1.4 : 1}`, leaf.file, "planar") : assets.monstera.get(leaf.file),
          { length: stalkLen, lean, arch: 0.12 + 0.1 * jitter(g * 7 + 4), heading, baseRadius: r, tipRadius: r * 0.75 },
          { heading, drop, roll: 0.15 * jitter(g * 7 + 8) },
          assets.stalkMaterial,
          leaf.scale * expand * (1 + 0.07 * jitter(g * 7 + 5))
        ),
        nodePos
      );
      if (options.sport && isNewest) leafGroup.userData.sport = true;
      plant.add(leafGroup);
    }
    if (count >= 3) {
      for (let j = 0; j < count - 2; j++) {
        const at = along(sink + j * internode + 0.01);
        const out = new THREE.Vector3(Math.sin(outAng + j * 2.1), 0, Math.cos(outAng + j * 2.1));
        plant.add(rootNub(at.addScaledVector(out, 0.045), out, 0.05 + at.y * 1.2 + 0.06, assets.rootMaterial));
      }
    }
  }
  return plant;
}
function growPothos(assets, age2, rimRadius, rimHeight, heading = 0, internode = 0.17) {
  var _a, _b, _c, _d, _e;
  const plant = new THREE.Group();
  if (age2 <= 0) return plant;
  const nodes = Math.floor(age2);
  const unfurl = age2 - nodes;
  const len = (nodes + unfurl) * internode + 0.05 + rimRadius * 0.6;
  const out = new THREE.Vector3(Math.sin(heading), 0, Math.cos(heading));
  const path = new THREE.CatmullRomCurve3([
    out.clone().multiplyScalar(rimRadius * 0.3).setY(-0.03),
    out.clone().multiplyScalar(rimRadius * 0.45).setY(0.12),
    out.clone().multiplyScalar(rimRadius * 1.05).setY(0.1),
    out.clone().multiplyScalar(rimRadius * 1.3).setY(-rimHeight * 0.35),
    out.clone().multiplyScalar(rimRadius * 1.35).add(new THREE.Vector3(0, -rimHeight * 0.85, 0)).applyAxisAngle(UP, 0.25),
    out.clone().multiplyScalar(rimRadius * 1.3).add(new THREE.Vector3(0, -rimHeight * 1.3, 0)).applyAxisAngle(UP, 0.45)
  ]);
  const full = path.getLength();
  const used = Math.min(len, full);
  const tEnd = used / full;
  const nSeg = Math.max(4, Math.ceil(used / 0.05));
  const pts = [];
  for (let i = 0; i <= nSeg; i++) pts.push(path.getPointAt(i / nSeg * tEnd));
  const tube2 = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), pts.length - 1, 0.018, 5, false);
  setStripUV(tube2, 0.0562, 0.28, 0.39);
  plant.add(new THREE.Mesh(tube2, assets.stalkMaterial));
  let startLen = 0;
  for (let d = 0; d < full; d += 0.01) {
    const q = path.getPointAt(d / full);
    if (Math.hypot(q.x, q.z) >= rimRadius * 0.35) {
      startLen = d;
      break;
    }
  }
  for (let n = 0; n <= nodes; n++) {
    const s = (startLen + n * internode) / full;
    if (s > tEnd) break;
    const isNewest = n === nodes;
    const p = path.getPointAt(s);
    const t = path.getTangentAt(s);
    const radial = new THREE.Vector3(p.x, 0, p.z);
    if (radial.lengthSq() < 1e-6) radial.copy(out);
    radial.normalize();
    const hang = THREE.MathUtils.smoothstep(-p.y, -0.02, rimHeight * 0.3);
    const alt = n % 2 === 0 ? 1 : -1;
    const leafHeading = Math.atan2(radial.x, radial.z) + alt * (0.55 - 0.25 * hang) + 0.2 * jitter(n * 13 + heading * 7);
    const drop = THREE.MathUtils.lerp(-0.15, 0.45, hang) + 0.15 * jitter(n * 13 + heading * 7 + 1);
    const face = UP.clone().multiplyScalar(1 - 0.55 * hang).addScaledVector(radial, 0.25 + 0.8 * hang).normalize();
    const upPerp = UP.clone().addScaledVector(t, -UP.dot(t));
    if (upPerp.lengthSq() < 1e-4) upPerp.copy(out);
    upPerp.normalize();
    const facing = radial;
    const fromTip = nodes - n;
    const sizeIdx = fromTip <= 1 ? 0 : fromTip <= 3 ? 1 : 2;
    let scale = 0.85;
    const vars = (_a = assets.pothosVariants) == null ? void 0 : _a[sizeIdx];
    let leafObj = vars ? vars[Math.floor((n * 7 + heading * 13) % vars.length + vars.length) % vars.length] : assets.pothos[sizeIdx];
    if (isNewest) {
      leafObj = ((_e = (_b = assets.pothosVariants) == null ? void 0 : _b[0]) == null ? void 0 : _e[n % (((_d = (_c = assets.pothosVariants) == null ? void 0 : _c[0]) == null ? void 0 : _d.length) ?? 1)]) ?? assets.pothos[0];
      scale = 0.35 + 0.5 * unfurl;
    }
    const leaf = orientBlade(leafObj, { heading: leafHeading, drop, face, roll: 0.15 * jitter(n * 13 + heading * 7 + 2) });
    leaf.position.copy(p);
    leaf.scale.setScalar(scale);
    plant.add(leaf);
    plant.add(petiole(leaf, leafObj, assets.stalkMaterial));
    if (!isNewest && n % 2 === 1) plant.add(aerialRoot(p, facing.clone().negate(), 0.05, assets.rootMaterial));
  }
  return plant;
}
const bladeBase = /* @__PURE__ */ new WeakMap();
function baseOf(src) {
  let b = bladeBase.get(src);
  if (b) return b;
  src.updateMatrixWorld(true);
  const inv = src.matrixWorld.clone().invert();
  let best = Infinity;
  b = new THREE.Vector3();
  const v = new THREE.Vector3();
  src.traverse((o) => {
    const m = o;
    if (!m.isMesh || m.renderOrder === 1) return;
    const pos = m.geometry.getAttribute("position");
    const mat2 = inv.clone().multiply(m.matrixWorld);
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i).applyMatrix4(mat2);
      const d = v.lengthSq();
      if (d < best) best = d, b.copy(v);
    }
  });
  bladeBase.set(src, b);
  return b;
}
function petiole(leaf, src, mat2) {
  const end = baseOf(src).clone().multiplyScalar(leaf.scale.x).applyQuaternion(leaf.quaternion);
  const g = new THREE.Group();
  if (end.length() < 0.01) return g;
  const start = leaf.position.clone();
  const tip = start.clone().add(end);
  const mid = start.clone().lerp(tip, 0.5).add(new THREE.Vector3(0, end.length() * 0.18, 0));
  const tube2 = new THREE.TubeGeometry(new THREE.CatmullRomCurve3([start, mid, tip]), 8, 0.012 + 6e-3 * leaf.scale.x, 5, false);
  setStripUV(tube2, 0.0562, 0.28, 0.39);
  g.add(new THREE.Mesh(tube2, mat2));
  return g;
}
function positioned(obj, at) {
  obj.position.copy(at);
  return obj;
}
function setStripUV(geo, u, v0, v1) {
  const uv = geo.getAttribute("uv");
  for (let i = 0; i < uv.count; i++) uv.setXY(i, u, THREE.MathUtils.lerp(v0, v1, uv.getX(i)));
  uv.needsUpdate = true;
}
function growPothosCrown(assets, age2, potRadius) {
  var _a;
  const crown = new THREE.Group();
  if (age2 <= 0) return crown;
  const shoots = Math.min(9, Math.floor(age2 / 1.3) + 1);
  const golden = 2.39996;
  for (let k = 0; k < shoots; k++) {
    const grown = THREE.MathUtils.clamp(age2 / 1.3 - k, 0, 1);
    const ang = k * golden + 0.4;
    const rad = potRadius * (k === 0 ? 0.1 : 0.25 + 0.35 * (k * 0.37 % 1));
    const base2 = new THREE.Vector3(Math.sin(ang) * rad, -0.03, Math.cos(ang) * rad);
    const height = (0.32 + 0.4 * (k * 0.61 % 1)) * (0.4 + 0.6 * grown);
    const stem = buildStalk({ length: height, baseRadius: 0.016, tipRadius: 0.012, lean: 0.12 + 0.35 * (rad / potRadius), arch: 0.2, heading: ang, segments: 5, uv: POTHOS_UV });
    const mesh = new THREE.Mesh(stem.geometry, assets.stalkMaterial);
    mesh.position.copy(base2);
    crown.add(mesh);
    const leaves = 3 + k % 2;
    for (let j = 0; j < leaves; j++) {
      const t = (j + 1) / leaves;
      const pts = stem.points;
      const f = t * (pts.length - 1);
      const i = Math.min(pts.length - 2, Math.floor(f));
      const at = pts[i].clone().lerp(pts[i + 1], f - i).add(base2);
      const heading = ang + (j % 2 === 0 ? 1 : -1) * (0.7 + 0.3 * jitter(k * 31 + j)) + 0.3 * jitter(k * 31 + j + 9);
      const isTip = j === leaves - 1;
      const size = isTip ? 1 : 2;
      const pv = (_a = assets.pothosVariants) == null ? void 0 : _a[Math.min(assets.pothos.length - 1, size)];
      const leaf = orientBlade(pv ? pv[(k * 5 + j * 3) % pv.length] : assets.pothos[Math.min(assets.pothos.length - 1, size)], {
        heading,
        drop: isTip ? -0.55 : -0.2 + 0.2 * jitter(k * 31 + j + 3),
        // the youngest leaf at a shoot's tip stands up
        face: new THREE.Vector3(Math.sin(heading), 1.2, Math.cos(heading)).normalize(),
        roll: 0.2 * jitter(k * 31 + j + 5)
      });
      leaf.position.copy(at);
      leaf.scale.setScalar(1 * (0.5 + 0.5 * grown));
      crown.add(leaf);
      crown.add(petiole(leaf, pv ? pv[(k * 5 + j * 3) % pv.length] : assets.pothos[Math.min(assets.pothos.length - 1, size)], assets.stalkMaterial));
    }
  }
  return crown;
}
const SANSEVIERIA_UV = { u0: 0.8, u1: 0.82, vBase: 0.66, vTip: 0.6 };
const WHALE_UV = { u0: 0.17, u1: 0.21, vBase: 0.43, vTip: 0.37 };
function youngRoll(maturity, unfurl) {
  const r = Math.min(0.9, 0.45 * Math.pow(1 - maturity, 2) + 0.85 * (1 - unfurl));
  return Math.round(r * 8) / 8;
}
const SWORD_UV = { u0: 0.17, u1: 0.21, vBase: 0.36, vTip: 0.32 };
const swordLeaves = /* @__PURE__ */ new Map();
function swordLeaf(n, roll, material) {
  let leaf = swordLeaves.get(`${n}|${roll}`);
  if (!leaf) {
    const geo = paddedLeaf({ length: 1, halfWidth: profiles.sword, uv: SWORD_UV, cup: 0.03, bend: 0.015 + 0.01 * n, thickness: 0.07, samples: 16, roll });
    leaf = withPattern(new THREE.Mesh(geo, material), "trifasciata", `sword${n}r${roll}`, "contour", true);
    swordLeaves.set(`${n}|${roll}`, leaf);
  }
  return leaf;
}
const whaleLeaves = /* @__PURE__ */ new Map();
function whaleLeaf(n, roll, material) {
  let leaf = whaleLeaves.get(`${n}|${roll}`);
  if (!leaf) {
    leaf = withPattern(new THREE.Mesh(paddedLeaf({ length: 1, halfWidth: profiles.whaleFin, uv: WHALE_UV, cup: -0.04, bend: 0.06, roll }), material), `var:whaleFin:${n}`);
    whaleLeaves.set(`${n}|${roll}`, leaf);
  }
  return leaf;
}
function cylinderLeaf(length, radius, curve2, material) {
  const seg = 10;
  const sides = 7;
  const pos = [];
  const uv = [];
  const idx = [];
  for (let i = 0; i <= seg; i++) {
    const s = i / seg;
    const cy = curve2 === 0 ? s * length : length / curve2 * Math.sin(curve2 * s);
    const cz = curve2 === 0 ? 0 : length / curve2 * (1 - Math.cos(curve2 * s));
    const r = radius * (s < 0.88 ? 1 - 0.25 * s : (1 - 0.25 * 0.88) * Math.sqrt(Math.max(0, 1 - ((s - 0.88) / 0.12) ** 2))) + 5e-4;
    for (let j = 0; j <= sides; j++) {
      const th = j / sides * Math.PI * 2;
      pos.push(Math.cos(th) * r, cy, cz + Math.sin(th) * r);
      uv.push(THREE.MathUtils.lerp(SANSEVIERIA_UV.u0, SANSEVIERIA_UV.u1, j / sides), THREE.MathUtils.lerp(SANSEVIERIA_UV.vBase, SANSEVIERIA_UV.vTip, s));
    }
  }
  for (let i = 0; i < seg; i++)
    for (let j = 0; j < sides; j++) {
      const a = i * (sides + 1) + j;
      idx.push(a, a + sides + 1, a + 1, a + 1, a + sides + 1, a + sides + 2);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return new THREE.Mesh(g, material);
}
function plantUpright(obj, at, heading, lean, twist, scale) {
  const o = obj.clone();
  o.position.copy(at);
  const q = new THREE.Quaternion().setFromAxisAngle(UP, heading);
  q.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), lean));
  q.multiply(new THREE.Quaternion().setFromAxisAngle(UP, twist));
  o.quaternion.copy(q);
  if (typeof scale === "number") o.scale.setScalar(scale);
  else o.scale.copy(scale);
  return o;
}
function growSansevieria(assets, kind, age2, potRadius) {
  const plant = new THREE.Group();
  if (age2 <= 0) return plant;
  const per = kind === "whale" ? 2 : kind === "cylindrical" ? 5 : kind === "classic" ? 6 : 7;
  const total = Math.floor(age2);
  const grow = age2 - total;
  const golden = 2.39996;
  for (let k = 0; k * per <= total; k++) {
    const first = k * per;
    const count = Math.min(per, total - first + 1);
    const ang = k * golden + 0.9;
    const rad = k === 0 ? potRadius * 0.2 : potRadius * (0.78 + 0.12 * (k % 2));
    const base2 = new THREE.Vector3(Math.sin(ang) * rad, -0.02, Math.cos(ang) * rad);
    const fanDir = ang + 0.4 * jitter(k * 17);
    for (let j = 0; j < count; j++) {
      const g = first + j;
      const isNewest = g === total;
      const up = isNewest ? 0.25 + 0.75 * grow : 1;
      const ageInClump = (count - 1 - j) / Math.max(1, per - 1);
      const sizeIdx = Math.min(2, Math.floor(g / 4 * 1) + (j >= 2 ? 1 : 0));
      if (kind === "cylindrical") {
        const side = j % 2 === 0 ? 1 : -1;
        const heading = fanDir + (side > 0 ? 0 : Math.PI);
        const lean = 0.06 + 0.4 * ageInClump + 0.05 * jitter(g * 5);
        const len = (0.7 + 0.5 * Math.min(1, g / 6) + 0.1 * jitter(g * 5 + 1)) * up;
        const leaf = withPattern(cylinderLeaf(len, 0.05 + 0.015 * Math.min(1, g / 6), 0.15 + 0.2 * ageInClump, assets.leafMaterial), "rings", void 0, "planar");
        plant.add(plantUpright(leaf, base2, heading, lean, 0, 1));
      } else {
        const heading = j * golden + ang + 0.3 * jitter(g * 5);
        const variants = assets.sansevieria[sizeIdx];
        const src = variants[(g + k) % variants.length];
        const outward = k === 0 ? 0 : 0.12;
        const lean = (kind === "whale" ? 0.05 + 0.25 * ageInClump : 0.06 + 0.36 * ageInClump) + outward + 0.06 * jitter(g * 5 + 2);
        const twist = 1.2 * jitter(g * 5 + 3);
        if (kind === "classic") {
          const len = (1.6 + 1.1 * Math.min(1, g / 10) + 0.3 * jitter(g * 5 + 4)) * up;
          plant.add(plantUpright(swordLeaf(g % 3, youngRoll(Math.min(1, g / 10), isNewest ? grow : 1), assets.leafMaterial), base2, heading, lean * 0.8, twist, len));
          continue;
        }
        if (kind === "whale") {
          const side = j % 2 === 0 ? 1 : -1;
          const h = fanDir + (side > 0 ? 0 : Math.PI) + 0.2 * jitter(g * 5 + 6);
          const len = (2.3 + 0.9 * Math.min(1, g / 4) + 0.2 * jitter(g * 5 + 4)) * up;
          const at = base2.clone().add(new THREE.Vector3(Math.sin(h), 0, Math.cos(h)).multiplyScalar(0.05));
          plant.add(plantUpright(whaleLeaf(g % 12, youngRoll(Math.min(1, g / 4), isNewest ? grow : 1), assets.leafMaterial), at, h, 0.2 + 0.12 * ageInClump + outward * 0.6 + 0.04 * jitter(g * 5 + 2), 0.15 * jitter(g * 5 + 3), len));
          continue;
        }
        const sc = new THREE.Vector3(0.82, up * (1.25 + 0.2 * jitter(g * 5 + 4)), 0.82);
        plant.add(plantUpright(src, base2, heading, lean, twist, sc));
      }
    }
  }
  return plant;
}
const ravenCache = /* @__PURE__ */ new WeakMap();
function raven(src) {
  let r = ravenCache.get(src);
  if (!r) {
    r = src.clone(true);
    r.traverse((o) => {
      const m = o.material;
      if (!m) return;
      const d = m.clone();
      d.color = new THREE.Color("#5d6a5c");
      d.roughness = 0.3;
      o.material = d;
    });
    ravenCache.set(src, r);
  }
  return r;
}
function growZZ(assets, age2, potRadius, variegated2 = false) {
  const plant = new THREE.Group();
  if (age2 <= 0) return plant;
  const total = Math.floor(age2);
  const grow = age2 - total;
  const golden = 2.39996;
  for (let g = 0; g <= total; g++) {
    const isNewest = g === total;
    const up = isNewest ? 0.3 + 0.7 * grow : 1;
    const ang = g * golden + 0.2;
    const rad = potRadius * Math.min(0.85, 0.18 + 0.12 * Math.sqrt(g) * 1.6) * (0.65 + 0.35 * (g * 0.37 % 1));
    const base2 = new THREE.Vector3(Math.sin(ang) * rad, -0.02, Math.cos(ang) * rad);
    const relAge = (total - g) / Math.max(1, total);
    const sizeIdx = g < 2 ? 0 : g < 5 ? 1 : 2;
    const variants = assets.zz[sizeIdx];
    const plain = variants[g % variants.length];
    const src = variegated2 === "raven" ? raven(plain) : variegated2 ? withPattern(plain, `var:zzVariegata:${g % 12}:1.4`, `zz${sizeIdx}${g % variants.length}`, "planar") : plain;
    const lean = 0.12 + 0.45 * relAge + 0.25 * (rad / potRadius) + 0.06 * jitter(g * 11);
    plant.add(plantUpright(src, base2, ang, lean, 1.5 * jitter(g * 11 + 1), new THREE.Vector3(1, up, 1).multiplyScalar(0.9 + 0.15 * jitter(g * 11 + 2))));
  }
  return plant;
}
const MONSTERA_FILES = [
  "monstera_rolled",
  "monstera_baby_A",
  "monstera_baby_B",
  "monstera_baby_C",
  ...["fenestrated", "heavy", "heavybig", "skeleton"].flatMap((t) => [1, 2, 3, 4, 5].map((k) => `monstera_${t}_stage${k}`))
];
const POTHOS_FILES = ["pothos_small_C_1", "pothos_medium_B_1", "pothos_large_A_1"];
async function loadKit(base2 = "/assets/", opts = {}) {
  if (!base2.endsWith("/")) base2 += "/";
  const ext = opts.ext ?? ".gltf";
  const loader = opts.loader ?? new GLTFLoader();
  const loadDouble = async (url) => {
    const obj = (await loader.loadAsync(url)).scene;
    obj.traverse((o) => {
      const mm = o.material;
      if (mm) mm.side = THREE.DoubleSide;
    });
    return obj;
  };
  const monstera = new Map(await Promise.all(MONSTERA_FILES.map(async (f) => [f, await loadDouble(`${base2}monstera/${f}.glb`)])));
  let map = null;
  monstera.get("monstera_fenestrated_stage5").traverse((o) => {
    const m = o.material;
    if (m == null ? void 0 : m.map) map = m.map;
  });
  const stalk = new THREE.MeshStandardMaterial({ map, roughness: 0.9, metalness: 0 });
  const pothos = await Promise.all(POTHOS_FILES.map((f) => loadDouble(`${base2}pothos/${f}.glb`)));
  const assets = { monstera, pothos, stalkMaterial: stalk, rootMaterial: new THREE.MeshStandardMaterial({ color: "#7a5a3c", roughness: 1 }) };
  assets.pothosVariants = pothos.map((leaf, si) => Array.from({ length: 12 }, (_, k) => withPattern(leaf, `var:pothos:${si * 12 + k}:${[1.6, 1.25, 1][si]}`, `pv${si}`, "planar")));
  const loadSet = (prefix) => Promise.all(["small", "medium", "large"].map((s) => Promise.all(["A", "B", "C"].map((v) => loadDouble(`${base2}${opts.leafDir ?? "kit"}/${prefix}_${s}_${v}${ext}`)))));
  const clump = { sansevieria: await loadSet("sansevieria_leaf"), zz: await loadSet("zzplant_leaf"), leafMaterial: stalk };
  return { assets, clump, parts: await loadBodyParts(`${base2}body`, loader), stalk };
}
const tintCache = /* @__PURE__ */ new Map();
function recolor(root, tint, overlay, lift = 0.35) {
  root.traverse((o) => {
    const mesh = o;
    if (!mesh.isMesh) return;
    const m = mesh.material;
    if (!(m == null ? void 0 : m.isMeshStandardMaterial)) return;
    const isOverlay = mesh.renderOrder === 1;
    if (isOverlay && !overlay) return;
    const key2 = `${m.uuid}|${isOverlay ? "o" + overlay : "t" + tint}`;
    let t = tintCache.get(key2);
    if (!t) {
      const c = m.clone();
      if (isOverlay) c.color = new THREE.Color(overlay);
      else {
        const col = new THREE.Color(tint);
        c.onBeforeCompile = (sh) => {
          sh.uniforms.uTint = { value: col };
          sh.fragmentShader = sh.fragmentShader.replace("#include <common>", "#include <common>\nuniform vec3 uTint;").replace("#include <map_fragment>", `#include <map_fragment>
  diffuseColor.rgb = uTint * (${lift.toFixed(2)} + 1.9 * dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114)));`);
        };
        c.customProgramCacheKey = () => "tint" + tint;
        c.userData.tint = { tint, lift };
      }
      tintCache.set(key2, c);
      t = c;
    }
    mesh.material = t;
  });
  return root;
}
const TINTED = {
  alocasia: { tint: "#2d6f68", lift: 0.36, overlay: "#e4f1ea" },
  monstera: { tint: "#2b5b41", lift: 0.28 },
  // a plain monstera: deep, dark glossy green (Blanche)
  thai: { tint: "#6aa868", lift: 0.42 },
  // Thai Constellation: a fresher, lighter green under the cream daubs (Stella) // alocasias: deep blue-green velvet, pale veins
  cebu: { tint: "#9fc4c0", lift: 0.45 },
  // Cebu Blue pothos: silvery blue-green
  neon: { tint: "#c8f04a", lift: 0.55 },
  // Neon pothos: glowing chartreuse
  satin: { tint: "#6f9478", lift: 0.4, overlay: "#d9e6e2" },
  // Satin pothos: dusty green with silver flecks
  blackvelvet: { tint: "#2a3330", lift: 0.25, overlay: "#cfd8d4" },
  // Alocasia 'Black Velvet': near-black, silvery veins
  dottie: { tint: "#3a2a3a", lift: 0.25, overlay: "#f2a3c0" }
  // Calathea 'Dottie': dark plum, hot-pink markings
};
const SPORT_IX = Number(typeof location !== "undefined" && new URLSearchParams(location.search).get("sportix") || 1);
let plainPothos = null;
let fleckPothos = null;
let laurentiiClump = null;
function growPlant(kit, species, age2, r, drop = r * 2, sport = false) {
  const g = new THREE.Group();
  const { stalk } = kit;
  let { assets, clump } = kit;
  if (species === "cebu" || species === "neon") assets = plainPothos ?? (plainPothos = { ...kit.assets, pothosVariants: void 0 });
  if (species === "satin") assets = fleckPothos ?? (fleckPothos = { ...kit.assets, pothosVariants: kit.assets.pothos.map((leaf, si) => [withPattern(leaf, "flecks", `satin${si}`, "planar")]) });
  if (species === "laurentii")
    clump = laurentiiClump ?? (laurentiiClump = { ...kit.clump, sansevieria: kit.clump.sansevieria.map((size, i) => size.map((l, j) => withPattern(l, "laurentii", `laur${i}${j}`, "planar"))) });
  const base2 = { cebu: "pothos", neon: "pothos", satin: "pothos", blackvelvet: "alocasia", dottie: "calathea", laurentii: "sansevieria" }[species] ?? species;
  const tinted = TINTED[species];
  const out = growPlantBase(base2, age2, r, drop, assets, clump, stalk, g, sport);
  if (tinted == null ? void 0 : tinted.tint) recolor(out, tinted.tint, tinted.overlay, tinted.lift);
  return out;
}
function growPlantBase(species, age2, r, drop, assets, clump, stalk, g, sport = false) {
  const clumpSpecies = {
    peacelily: [(m) => peaceLily(m), 22],
    domino: [(m) => peaceLily(m, "peaceLilyDomino"), 22],
    alocasia: [(m) => alocasia(m), 7],
    frydek: [(m) => alocasia(m, "alocasiaFrydekVar"), 7],
    calathea: [(m) => calathea(m), 20],
    whitefusion: [(m) => calathea(m, "calatheaWhiteFusion"), 20],
    bop: [(m) => birdOfParadise(m), 16]
  };
  const c = clumpSpecies[species];
  if (c) g.add(growClump(c[0](stalk), age2 * c[1], r, stalk));
  else if (species === "zz" || species === "zzvar" || species === "raven") g.add(growZZ(clump, age2 * 12, r, species === "raven" ? "raven" : species === "zzvar"));
  else if (species === "monstera" || species === "albo" || species === "thai")
    g.add(growMonstera(assets, "fenestrated", age2 * 14, { potRadius: r, variegation: species === "albo" ? "monsteraAlbo" : species === "thai" ? "monsteraThai" : void 0, sport: sport ? "monsteraAlbo" : void 0, sportIx: SPORT_IX }));
  else if (species === "pothos") {
    g.add(growPothosCrown(assets, age2 * 19, r * 1.45));
    [1.35, -1.35, 2.2, -2.3, 3.1].forEach((h, i) => g.add(growPothos(assets, age2 * 15 - [0, 1, 3, 4, 6][i], r * 1.3, drop * 0.6, h, 0.3)));
  } else {
    const kind = species === "snake" ? "classic" : species === "sansevieria" ? "common" : species;
    g.add(growSansevieria(clump, kind, age2 * (kind === "whale" ? 5 : kind === "cylindrical" ? 12 : 18), r));
  }
  return g;
}
const SCALE = 1.6;
class Tot {
  constructor(kit, o = {}) {
    __publicField(this, "root", new THREE.Group());
    __publicField(this, "monster");
    __publicField(this, "holder", new THREE.Group());
    __publicField(this, "anim", "idle");
    /** Animation clock offset (so a crowd isn't in sync). */
    __publicField(this, "t0", 0);
    __publicField(this, "r");
    this.kit = kit;
    this.o = o;
    const pot = buildPot(potById(o.pot ?? "classic"), o.cw ?? 0);
    this.monster = buildMonster(pot, kit.parts, {
      skin: o.skin ?? "#8fae8c",
      pattern: o.pattern,
      patternColor: o.patternColor,
      legLength: o.legs,
      armLength: o.arms,
      seed: o.seed
    });
    this.root.add(this.monster.group);
    this.root.scale.setScalar(SCALE * (o.size ?? 1));
    this.holder.scale.setScalar(1 / SCALE);
    this.monster.socket.add(this.holder);
    this.r = pot.soilRadius * SCALE * 0.85;
    if (o.species) this.setPlant(o.species, o.age ?? 0.6);
    this.root.traverse((x) => {
      x.castShadow = true;
    });
  }
  setPlant(species, age2, sport = false) {
    this.holder.clear();
    this.holder.add(growPlant(this.kit, species, age2, this.r, this.monster.pot.height * SCALE * 0.95, sport));
    this.holder.traverse((x) => x.castShadow = true);
  }
  /** Pose at time t; returns travel speed in scene units / s. */
  pose(t, anim = this.anim) {
    return poseMonster(this.monster, t + this.t0, anim) * SCALE * (this.o.size ?? 1);
  }
  /** All four limb meshes (for swapping skin materials live). */
  limbMeshes() {
    const out = [];
    for (const l of [...this.monster.legs, ...this.monster.arms]) l.root.traverse((x) => x.isMesh ? out.push(x) : null);
    return out;
  }
}
const PEST_KINDS = [
  ["aphid", "aphids"],
  ["mite", "spider mites"],
  ["mealybug", "mealybugs"],
  ["gnat", "fungus gnats"],
  ["scale", "scale"],
  ["thrips", "thrips"],
  ["whitefly", "whiteflies"]
];
const MAX_PESTS = 5;
function rng(seed) {
  let a = seed >>> 0 || 1;
  return () => {
    a = a + 1831565813 >>> 0;
    let t = a;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function rollPestCount(seed) {
  const r = rng(seed * 7919 + 13)();
  const weights = [0.15, 0.3, 0.25, 0.18, 0.08, 0.04];
  let acc = 0;
  for (let n = 0; n < weights.length; n++) if (r < (acc += weights[n])) return n;
  return 1;
}
function leafSpots(plant, minUp) {
  plant.updateMatrixWorld(true);
  const tris = [];
  const nm = new THREE.Matrix3();
  plant.traverse((o) => {
    const mesh = o;
    if (!mesh.isMesh || mesh.userData.pest) return;
    const pos = mesh.geometry.getAttribute("position");
    if (!pos) return;
    const idx = mesh.geometry.getIndex();
    const count = idx ? idx.count : pos.count;
    nm.getNormalMatrix(mesh.matrixWorld);
    const v = (i) => new THREE.Vector3().fromBufferAttribute(pos, idx ? idx.getX(i) : i);
    for (let i = 0; i + 2 < count; i += 3) {
      const a = v(i), b = v(i + 1), c = v(i + 2);
      const n = new THREE.Vector3().subVectors(b, a).cross(new THREE.Vector3().subVectors(c, a));
      const area = n.length() / 2;
      if (area < 1e-9) continue;
      n.normalize();
      const wn = n.clone().applyMatrix3(nm).normalize();
      if (wn.y < 0) n.negate(), wn.negate();
      if (wn.y < minUp) continue;
      const wa = a.clone().applyMatrix4(mesh.matrixWorld), wb = b.clone().applyMatrix4(mesh.matrixWorld), wc = c.clone().applyMatrix4(mesh.matrixWorld);
      const warea = new THREE.Vector3().subVectors(wb, wa).cross(new THREE.Vector3().subVectors(wc, wa)).length() / 2;
      tris.push({ mesh, a, b, c, n, area: warea });
    }
  });
  return tris;
}
function infest(plant, kind, count, seed = 1, size = 0.09) {
  clearPests(plant);
  if (!kind || count <= 0) return [];
  let tris = leafSpots(plant, 0.45);
  if (tris.length < 20) tris = leafSpots(plant, 0.15);
  if (!tris.length) return [];
  const bb = new THREE.Box3();
  plant.traverse((o) => {
    if (o.isMesh && !o.userData.pest) bb.expandByObject(o, true);
  });
  const floor = bb.min.y + (bb.max.y - bb.min.y) * 0.25;
  const high = tris.filter((t) => new THREE.Vector3().add(t.a).add(t.b).add(t.c).multiplyScalar(1 / 3).applyMatrix4(t.mesh.matrixWorld).y > floor);
  if (high.length > 10) tris = high;
  const total = tris.reduce((s, t) => s + t.area, 0);
  const rand2 = rng(seed);
  const spots = [];
  const minGap = size * 2.2;
  for (let tries = 0; spots.length < Math.min(count, MAX_PESTS) && tries < 400; tries++) {
    let r = rand2() * total;
    const t = tris.find((x) => (r -= x.area) <= 0) ?? tris[tris.length - 1];
    let u = rand2(), w = rand2();
    if (u + w > 1) u = 1 - u, w = 1 - w;
    const p = t.a.clone().multiplyScalar(1 - u - w).addScaledVector(t.b, u).addScaledVector(t.c, w);
    const world = p.clone().applyMatrix4(t.mesh.matrixWorld);
    if (spots.some((s) => s.world.distanceTo(world) < minGap)) continue;
    spots.push({ mesh: t.mesh, p, n: t.n, world });
  }
  const out = [];
  for (const s of spots) {
    const bug = pest(kind);
    const len = new THREE.Box3().setFromObject(bug).getSize(new THREE.Vector3());
    const k = size / Math.max(len.x, len.z, 1e-3);
    const ws = new THREE.Vector3();
    s.mesh.matrixWorld.decompose(new THREE.Vector3(), new THREE.Quaternion(), ws);
    bug.scale.set(k / ws.x, k / ws.y, k / ws.z);
    bug.position.copy(s.p);
    bug.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), s.n).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), rand2() * Math.PI * 2));
    bug.userData.pest = kind;
    bug.traverse((o) => (o.userData.pest = kind, o.castShadow = true));
    s.mesh.add(bug);
    out.push(bug);
  }
  return out;
}
function clearPests(plant) {
  const bugs = [];
  plant.traverse((o) => {
    var _a;
    if (o.userData.pest && !((_a = o.parent) == null ? void 0 : _a.userData.pest)) bugs.push(o);
  });
  for (const b of bugs) b.removeFromParent();
}
const PERSONAS = [
  ["#f2826a", "spots", "#ffd36b"],
  ["#bfe3c8", "marble", "#ffffff"],
  ["#4fb3a9", "pinstripe", "#e9fff6"],
  ["#d9c6ef", "speckle", "#7a5aa6"],
  ["#f4c95d", "brindle", "#e07448"],
  ["#8fae8c", "vitiligo", "#efe6c8"],
  ["#3a3540", "wavy", "#9b7fd1"],
  ["#f6cdb2", "splash", "#e9846b"],
  ["#9b7fd1", "spots", "#f3e8c4"],
  ["#c4dcf2", "wavy", "#5b86b8"],
  ["#2f4a3a", "pinstripe", "#bfe3a8"],
  ["#f6c6d0", "none", "#ffffff"],
  ["#7fa38e", "brindle", "#e9e4c8"],
  ["#e9846b", "marble", "#fff0e0"]
];
const look = (k) => {
  const [skin, pattern, patternColor] = PERSONAS[k % PERSONAS.length];
  return { skin, pattern, patternColor, seed: k };
};
const AGE = { laurentii: 0.6, satin: 0.4, blackvelvet: 0.65, dottie: 0.55, monstera: 0.93, albo: 0.9, thai: 0.9, pothos: 0.35, bop: 0.75, snake: 0.6, cylindrical: 0.6, whale: 0.7, peacelily: 0.6, domino: 0.6, zz: 0.5, raven: 0.55, alocasia: 0.6, frydek: 0.6, calathea: 0.55, whitefusion: 0.55 };
const age = (sp) => AGE[sp] ?? 0.55;
const MEMBERS = [
  { sp: "monstera", name: "Blanche", plant: "Monstera", title: "The Minimalist.", joke: "Beige is a personality.", o: { size: 1.7, pot: "egg", cw: 0, skin: "#e6b08c", pattern: "vitiligo", patternColor: "#fbf6ee", legs: 1.35, arms: 1.1 } },
  { sp: "thai", name: "Stella", plant: "Thai Constellation", title: "The Dreamer.", joke: "Named after the stars. Brings it up a lot.", o: { size: 1.2, pot: "stepped", cw: 3, skin: "#2f4f6e", pattern: "spots", patternColor: "#f6e9b8", legs: 0.9, arms: 1.1 } },
  { sp: "domino", name: "Domino", plant: "Peace Lily 'Domino'", title: "The Wildcard.", joke: "Knocks things over. On purpose.", o: { size: 0.95, pot: "checker", cw: 0, skin: "#f4f1ea", pattern: "spots", patternColor: "#2a2a2a" } },
  { sp: "alocasia", name: "Velvet", plant: "Alocasia 'Frydek'", title: "The Drama Queen.", joke: "Droops if you look at her wrong.", o: { size: 1, pot: "scales", cw: 2, skin: "#2e5a3e", pattern: "splash", patternColor: "#e3f0d6", legs: 0.75, arms: 1.2 } },
  { sp: "calathea", name: "Tutu", plant: "Calathea", title: "The Ballerina.", joke: "Folds her leaves up every night. Dramatic exit.", o: { size: 0.9, pot: "hearts", cw: 1, skin: "#f6c6d0", pattern: "pinstripe", patternColor: "#ffffff", legs: 1.5, arms: 1.1 } },
  { sp: "raven", name: "Raven", plant: "ZZ 'Raven'", title: "The Goth.", joke: "A plant who hates the sun.", o: { size: 1.1, pot: "cauldron", cw: 2, skin: "#433a4c", pattern: "brindle", patternColor: "#8a3058", legs: 1.4, arms: 1.3 } },
  { sp: "whale", name: "Finn", plant: "Whale Fin", title: "The Sailor.", joke: "Has never seen the sea. Won’t stop talking about it.", o: { size: 1.15, pot: "barrel", cw: 0, skin: "#7f9cb5", pattern: "wavy", patternColor: "#e8f1f6", legs: 0.8, arms: 0.9 } },
  { sp: "laurentii", name: "Sunny", plant: "Snake Plant 'Laurentii'", title: "The Optimist.", joke: "Up at 6am. Thrilled about it.", o: { size: 1, pot: "drip", cw: 1, skin: "#f2cf5b", pattern: "none", patternColor: "#4f8a52", legs: 1.1 } },
  { sp: "satin", name: "Pearl", plant: "Satin Pothos", title: "The Spy.", joke: "Not actually a pothos. Shh.", o: { size: 0.8, pot: "crackle", cw: 0, skin: "#c9a7b6", pattern: "speckle", patternColor: "#f4eef0", legs: 1 } },
  { sp: "dottie", name: "Dottie", plant: "Calathea 'Dottie'", title: "The Foodie.", joke: "Calls fertiliser “a little treat.”", o: { size: 0.85, pot: "fluted", cw: 2, skin: "#4a2f45", pattern: "spots", patternColor: "#f2a3c0", legs: 0.9 } }
];
const M_ = (name) => MEMBERS.find((m) => m.name === name);
const CAST = Object.fromEntries(MEMBERS.map((m) => [m.sp, m.o]));
function who(name, k = 0) {
  const m = M_(name);
  return { species: m.sp, age: age(m.sp), ...m.o, seed: k + 11 };
}
const cast = (sp, k = 0) => ({ species: sp, age: age(sp), ...look(k), ...CAST[sp] ?? {}, seed: k });
const loadPackKit = (base2, loader) => loadKit(base2, { ext: ".glb", leafDir: "leaves", loader });
export {
  ANIMS,
  CAST,
  GAITS,
  MAX_PESTS,
  MEMBERS,
  PEST_KINDS,
  POTS,
  PROPS,
  SCALE,
  SKIN_PATTERNS,
  Tot,
  buildMonster,
  buildPot,
  cast,
  ceilingHook,
  clearPests,
  frameFor,
  growPlant,
  hangSetup,
  hanger,
  infest,
  loadBodyParts,
  loadKit,
  loadPackKit,
  look,
  pest,
  poseMonster,
  potById,
  rollPestCount,
  rope,
  skinMaterial,
  who
};
