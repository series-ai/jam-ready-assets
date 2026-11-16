// furrykit.js: assemble, recolour and animate Furries Unleashed characters in three.js, in the pack's toon look.
//
//   const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
//   const kit = await loadFurryKit('assets/furries-unleashed/kit/', { loader });
//   const fur = await kit.makeFurry('fox');            // a species preset, or your own look (below)
//   scene.add(fur.object);
//   fur.play('trot');
//   // every frame: fur.update(dt)
//
// Mix and match: every part fits every other, so build whatever creature you want. A look is plain data
// (every key optional; a species preset fills the rest):
//   { species: 'fox', head, ears, cheeks, hair, eyes, teeth, tail, feet, tuft, claws, top, bottom,
//     colours: { fur: '#ee7a34', fur_light: '#fff4e4', ... } }
// head:   one of the 23 species heads ('wolf', 'fox', 'dragon', ...); everything else fits every head
// ears, cheeks, hair, tail: a style or 'none'      eyes: a style      feet: 'paws' | 'hooves' | ...
// teeth:  'none' or a style; the helper picks the version fitted to the chosen head's snout
// tuft:   chest fluff (true/false)   claws: finger and toe claws (true/false)   top, bottom: hoodie, shorts
import * as THREE from 'three';
import { clone as cloneSkinned } from 'three/addons/utils/SkeletonUtils.js';

export const CATALOG = {
 "parts": {
  "cheeks": [
   "fin",
   "round",
   "spiky"
  ],
  "ears": [
   "bat",
   "big_round",
   "bunny",
   "cat",
   "deer",
   "fin",
   "fox",
   "horse",
   "lop",
   "round",
   "small",
   "tall",
   "wolf"
  ],
  "eyes": [
   "almond",
   "dot",
   "happy",
   "round",
   "sharp",
   "sleepy",
   "slit"
  ],
  "feet": [
   "cloven",
   "hooves",
   "paws",
   "reptile",
   "talons"
  ],
  "hair": [
   "crest",
   "long",
   "mohawk",
   "swoop"
  ],
  "head": [
   "bat",
   "bear",
   "bird",
   "bunny",
   "cat",
   "deer",
   "dog",
   "dragon",
   "fox",
   "goat",
   "horse",
   "husky",
   "hyena",
   "kangaroo",
   "lion",
   "lizard",
   "mouse",
   "otter",
   "raccoon",
   "redpanda",
   "shark",
   "tiger",
   "wolf"
  ],
  "tail": [
   "bat",
   "bear",
   "bird",
   "bunny",
   "cat",
   "deer",
   "dragon",
   "fox",
   "horse",
   "hyena",
   "kangaroo",
   "lion",
   "lizard",
   "mouse",
   "otter",
   "raccoon",
   "redpanda",
   "shark",
   "tiger",
   "wolf"
  ],
  "teeth": [
   "buck",
   "fangs",
   "shark",
   "snaggle",
   "tusks"
  ]
 },
 "species": {
  "wolf": {
   "head": "wolf",
   "snout": "dog",
   "ears": "wolf",
   "cheeks": "spiky",
   "hair": "crest",
   "eyes": "almond",
   "teeth": "none",
   "tail": "wolf",
   "feet": "paws",
   "tuft": true,
   "colours": {
    "fur": "#70809e",
    "fur_light": "#e2e8f2",
    "fur_dark": "#4e5a78",
    "hair": "#34a896",
    "inner_ear": "#d6dce8",
    "nose": "#1c1c22",
    "iris": "#78968c",
    "horn": "#e8dec4",
    "pads": "#3a3c4c"
   }
  },
  "husky": {
   "head": "husky",
   "snout": "dog",
   "ears": "wolf",
   "cheeks": "spiky",
   "hair": "none",
   "eyes": "round",
   "teeth": "none",
   "tail": "wolf",
   "feet": "paws",
   "tuft": true,
   "colours": {
    "fur": "#464c60",
    "fur_light": "#f5f5fa",
    "fur_dark": "#303442",
    "hair": "#464c60",
    "iris": "#6ec8ff"
   }
  },
  "fox": {
   "head": "fox",
   "snout": "fox",
   "ears": "fox",
   "cheeks": "spiky",
   "hair": "swoop",
   "eyes": "sharp",
   "teeth": "none",
   "tail": "fox",
   "feet": "paws",
   "tuft": true,
   "colours": {
    "fur": "#ee7a34",
    "fur_light": "#fff4e4",
    "fur_dark": "#382828",
    "hair": "#fa78be",
    "iris": "#6ed25a",
    "inner_ear": "#fff4e4"
   }
  },
  "dog": {
   "head": "dog",
   "snout": "lab",
   "ears": "lop",
   "cheeks": "spiky",
   "hair": "none",
   "eyes": "round",
   "teeth": "none",
   "tail": "wolf",
   "feet": "paws",
   "tuft": true,
   "colours": {
    "fur": "#d6a860",
    "fur_light": "#faecce",
    "fur_dark": "#966838",
    "hair": "#966838",
    "iris": "#604028"
   }
  },
  "cat": {
   "head": "cat",
   "snout": "cat",
   "ears": "cat",
   "cheeks": "spiky",
   "hair": "crest",
   "eyes": "slit",
   "teeth": "none",
   "tail": "cat",
   "feet": "paws",
   "tuft": true,
   "colours": {
    "fur": "#b096dc",
    "fur_light": "#f4ecfc",
    "fur_dark": "#6e50aa",
    "hair": "#6e50aa",
    "iris": "#ffc43c",
    "nose": "#f096aa",
    "inner_ear": "#f0aabe"
   }
  },
  "tiger": {
   "head": "tiger",
   "snout": "bigcat",
   "ears": "round",
   "cheeks": "spiky",
   "hair": "none",
   "eyes": "sharp",
   "teeth": "fangs",
   "tail": "tiger",
   "feet": "paws",
   "tuft": true,
   "colours": {
    "fur": "#f28c32",
    "fur_light": "#fff6e6",
    "fur_dark": "#281e1e",
    "hair": "#281e1e",
    "iris": "#b4d250",
    "inner_ear": "#fff6e6"
   }
  },
  "lion": {
   "head": "lion",
   "snout": "bigcat",
   "ears": "round",
   "cheeks": "spiky",
   "hair": "none",
   "eyes": "almond",
   "teeth": "none",
   "tail": "lion",
   "feet": "paws",
   "tuft": true,
   "colours": {
    "fur": "#deb068",
    "fur_light": "#faecce",
    "fur_dark": "#784828",
    "hair": "#965228",
    "iris": "#c8963c",
    "nose": "#965c50"
   }
  },
  "bunny": {
   "head": "bunny",
   "snout": "bunny",
   "ears": "bunny",
   "cheeks": "round",
   "hair": "swoop",
   "eyes": "round",
   "teeth": "buck",
   "tail": "bunny",
   "feet": "paws",
   "tuft": true,
   "colours": {
    "fur": "#faece2",
    "fur_light": "#fffaf6",
    "fur_dark": "#f0c8d6",
    "hair": "#ffaac8",
    "iris": "#dc5078",
    "nose": "#f096aa",
    "inner_ear": "#f0a0b4"
   }
  },
  "deer": {
   "head": "deer",
   "snout": "deer",
   "ears": "deer",
   "cheeks": "spiky",
   "hair": "none",
   "eyes": "round",
   "teeth": "none",
   "tail": "deer",
   "feet": "cloven",
   "tuft": true,
   "colours": {
    "fur": "#c4824e",
    "fur_light": "#faeedc",
    "fur_dark": "#784c32",
    "hair": "#784c32",
    "iris": "#603c28",
    "horn": "#ecdcbe",
    "inner_ear": "#fad2d2"
   }
  },
  "horse": {
   "head": "horse",
   "snout": "horse",
   "ears": "horse",
   "cheeks": "spiky",
   "hair": "none",
   "eyes": "almond",
   "teeth": "none",
   "tail": "horse",
   "feet": "hooves",
   "tuft": true,
   "colours": {
    "fur": "#825234",
    "fur_light": "#f5eee2",
    "fur_dark": "#3c281e",
    "hair": "#281c18",
    "iris": "#462e1e",
    "horn": "#322824",
    "nose": "#3c2e28"
   }
  },
  "goat": {
   "head": "goat",
   "snout": "goat",
   "ears": "deer",
   "cheeks": "spiky",
   "hair": "none",
   "eyes": "sharp",
   "teeth": "none",
   "tail": "deer",
   "feet": "cloven",
   "tuft": true,
   "colours": {
    "fur": "#ceb898",
    "fur_light": "#faf6ec",
    "fur_dark": "#786e64",
    "hair": "#c8c4ba",
    "iris": "#dcaa32",
    "horn": "#96826e",
    "nose": "#786464"
   }
  },
  "bear": {
   "head": "bear",
   "snout": "bear",
   "ears": "round",
   "cheeks": "round",
   "hair": "none",
   "eyes": "dot",
   "teeth": "none",
   "tail": "bear",
   "feet": "paws",
   "tuft": true,
   "colours": {
    "fur": "#82583c",
    "fur_light": "#d6b68c",
    "fur_dark": "#503626",
    "hair": "#503626",
    "iris": "#3c281e"
   }
  },
  "raccoon": {
   "head": "raccoon",
   "snout": "raccoon",
   "ears": "round",
   "cheeks": "spiky",
   "hair": "mohawk",
   "eyes": "round",
   "teeth": "none",
   "tail": "raccoon",
   "feet": "paws",
   "tuft": true,
   "colours": {
    "fur": "#8c8c96",
    "fur_light": "#e8e8ec",
    "fur_dark": "#28262e",
    "hair": "#28262e",
    "iris": "#fab43c"
   }
  },
  "redpanda": {
   "head": "redpanda",
   "snout": "raccoon",
   "ears": "round",
   "cheeks": "round",
   "hair": "none",
   "eyes": "dot",
   "teeth": "none",
   "tail": "redpanda",
   "feet": "paws",
   "tuft": true,
   "colours": {
    "fur": "#c45228",
    "fur_light": "#fcf4e8",
    "fur_dark": "#3c1e1a",
    "hair": "#c45228",
    "iris": "#3c1e14",
    "inner_ear": "#fcf4e8"
   }
  },
  "otter": {
   "head": "otter",
   "snout": "otter",
   "ears": "small",
   "cheeks": "round",
   "hair": "none",
   "eyes": "dot",
   "teeth": "none",
   "tail": "otter",
   "feet": "paws",
   "tuft": true,
   "colours": {
    "fur": "#78563c",
    "fur_light": "#d6bea0",
    "fur_dark": "#503828",
    "hair": "#503828",
    "iris": "#281e18"
   }
  },
  "hyena": {
   "head": "hyena",
   "snout": "hyena",
   "ears": "round",
   "cheeks": "spiky",
   "hair": "mohawk",
   "eyes": "sharp",
   "teeth": "fangs",
   "tail": "hyena",
   "feet": "paws",
   "tuft": true,
   "colours": {
    "fur": "#ceb078",
    "fur_light": "#e8d6b0",
    "fur_dark": "#46362c",
    "hair": "#46362c",
    "iris": "#dcaa32"
   }
  },
  "mouse": {
   "head": "mouse",
   "snout": "mouse",
   "ears": "big_round",
   "cheeks": "round",
   "hair": "swoop",
   "eyes": "dot",
   "teeth": "buck",
   "tail": "mouse",
   "feet": "paws",
   "tuft": true,
   "colours": {
    "fur": "#a09ca6",
    "fur_light": "#ece8ee",
    "fur_dark": "#6e6874",
    "hair": "#6e6874",
    "iris": "#1e1a1e",
    "nose": "#f096aa",
    "inner_ear": "#f0aabe",
    "pads": "#f0aabe"
   }
  },
  "kangaroo": {
   "head": "kangaroo",
   "snout": "kangaroo",
   "ears": "tall",
   "cheeks": "spiky",
   "hair": "none",
   "eyes": "almond",
   "teeth": "none",
   "tail": "kangaroo",
   "feet": "paws",
   "tuft": true,
   "colours": {
    "fur": "#b07c5c",
    "fur_light": "#ecdcc8",
    "fur_dark": "#6e4c3a",
    "hair": "#6e4c3a",
    "iris": "#3c281e",
    "inner_ear": "#ecc8be"
   }
  },
  "bat": {
   "head": "bat",
   "snout": "bat",
   "ears": "bat",
   "cheeks": "spiky",
   "hair": "swoop",
   "eyes": "round",
   "teeth": "fangs",
   "tail": "bat",
   "feet": "paws",
   "tuft": true,
   "colours": {
    "fur": "#543c68",
    "fur_light": "#966eaa",
    "fur_dark": "#382846",
    "hair": "#c878ff",
    "iris": "#ff5a8c",
    "inner_ear": "#f096be",
    "nose": "#d678ac"
   }
  },
  "dragon": {
   "head": "dragon",
   "snout": "dragon",
   "ears": "fin",
   "cheeks": "fin",
   "hair": "none",
   "eyes": "slit",
   "teeth": "fangs",
   "tail": "dragon",
   "feet": "reptile",
   "tuft": false,
   "colours": {
    "fur": "#345cc4",
    "fur_light": "#face5c",
    "fur_dark": "#1e3882",
    "hair": "#face5c",
    "iris": "#ffaa28",
    "horn": "#faf5e6",
    "inner_ear": "#6ec8e6",
    "claws": "#faf5e6"
   }
  },
  "lizard": {
   "head": "lizard",
   "snout": "lizard",
   "ears": "none",
   "cheeks": "none",
   "hair": "none",
   "eyes": "slit",
   "teeth": "none",
   "tail": "lizard",
   "feet": "reptile",
   "tuft": false,
   "colours": {
    "fur": "#5aaa5a",
    "fur_light": "#dcecaa",
    "fur_dark": "#326e3c",
    "hair": "#fa783c",
    "iris": "#fad23c",
    "horn": "#dcecaa"
   }
  },
  "shark": {
   "head": "shark",
   "snout": "shark",
   "ears": "none",
   "cheeks": "fin",
   "hair": "none",
   "eyes": "dot",
   "teeth": "shark",
   "tail": "shark",
   "feet": "paws",
   "tuft": false,
   "colours": {
    "fur": "#628cac",
    "fur_light": "#f0f4f8",
    "fur_dark": "#466482",
    "hair": "#ff6e5a",
    "iris": "#1e1e28"
   }
  },
  "bird": {
   "head": "bird",
   "snout": "bird",
   "ears": "none",
   "cheeks": "none",
   "hair": "none",
   "eyes": "round",
   "teeth": "none",
   "tail": "bird",
   "feet": "talons",
   "tuft": true,
   "colours": {
    "fur": "#466ec8",
    "fur_light": "#f0f0fa",
    "fur_dark": "#283c82",
    "hair": "#fac83c",
    "iris": "#fab428",
    "horn": "#fabe3c"
   }
  }
 },
 "regions": [
  "claws",
  "cloth_bottom",
  "cloth_bottom_trim",
  "cloth_top",
  "cloth_top_trim",
  "eye_white",
  "fur",
  "fur_dark",
  "fur_light",
  "hair",
  "horn",
  "inner_ear",
  "iris",
  "mouth",
  "nose",
  "pads",
  "pupil",
  "shine"
 ],
 "defaults": {
  "fur": "#70809e",
  "fur_dark": "#4e5a78",
  "pads": "#3a3c4c",
  "fur_light": "#e2e8f2",
  "cloth_bottom": "#2e2e34",
  "cloth_bottom_trim": "#38383e",
  "claws": "#282830",
  "inner_ear": "#d6dce8",
  "eye_white": "#f4f4f0",
  "iris": "#78968c",
  "pupil": "#14161a",
  "shine": "#ffffff",
  "mouth": "#282a34",
  "horn": "#e8dec4",
  "hair": "#34a896",
  "nose": "#1c1c22",
  "cloth_top": "#222226",
  "cloth_top_trim": "#2c2c32"
 },
 "trails": {
  "slash_r": [
   {
    "bone": "R",
    "start": 0.18,
    "end": 0.4
   }
  ],
  "slash_l": [
   {
    "bone": "L",
    "start": 0.18,
    "end": 0.4
   }
  ],
  "slash_combo": [
   {
    "bone": "R",
    "start": 0.18,
    "end": 0.4
   },
   {
    "bone": "L",
    "start": 0.47,
    "end": 0.69
   }
  ],
  "maul": [
   {
    "bone": "L",
    "start": 0.26,
    "end": 0.46
   },
   {
    "bone": "R",
    "start": 0.26,
    "end": 0.46
   }
  ]
 }
};
export const CLIPS = {"bark":{"duration":1,"loop":true},"bite":{"duration":1.083,"loop":false},"collect":{"duration":1.042,"loop":false},"death":{"duration":2.292,"loop":false},"fours_down":{"duration":1.042,"loop":false},"fours_idle":{"duration":2,"loop":true},"fours_up":{"duration":1.167,"loop":false},"gallop":{"duration":0.583,"loop":true},"gather":{"duration":1.208,"loop":true},"hurt":{"duration":0.75,"loop":false},"idle":{"duration":3,"loop":true},"interact":{"duration":1.083,"loop":false},"jump":{"duration":1.125,"loop":false},"maul":{"duration":1,"loop":false},"pickup":{"duration":1.75,"loop":false},"roar":{"duration":1.583,"loop":false},"sit_down":{"duration":1,"loop":false},"sit_eat":{"duration":2,"loop":true},"sit_idle":{"duration":3,"loop":true},"sit_talk":{"duration":2.417,"loop":true},"sit_type":{"duration":2,"loop":true},"sit_up":{"duration":0.958,"loop":false},"slash_combo":{"duration":1.125,"loop":false},"slash_l":{"duration":0.833,"loop":false},"slash_r":{"duration":0.833,"loop":false},"sprint":{"duration":0.583,"loop":true},"tpose":{"duration":0.042,"loop":false},"trot":{"duration":0.75,"loop":true},"type":{"duration":2,"loop":true},"walk":{"duration":0.833,"loop":true},"wave":{"duration":1.833,"loop":true},"wave_princess":{"duration":1.208,"loop":true}};   // name -> { duration, loop }

// The pack's look: toon shading (`steps` bands from the `shadow` level up to full colour) and a dark outline
// (each region's colour times `ink`, `outline` thick in model units). Tune it with fur.setStyle({ ... }).
export const STYLE = { outline: 0.0085, ink: 0.3, steps: 3, shadow: 0.24 };
const NO_OUTLINE = new Set(['iris', 'pupil', 'eye_white', 'mouth']);   // face decals: an outline round them reads as noise

/** The full look for a species preset, with any changes on top. */
export function lookFor(species = 'wolf', changes = {}) {
  const r = CATALOG.species[species];
  if (!r) throw new Error(`no species "${species}" (try ${Object.keys(CATALOG.species).join(', ')})`);
  const look = { species, head: r.head, ears: r.ears, cheeks: r.cheeks, hair: r.hair, eyes: r.eyes, teeth: r.teeth, tail: r.tail,
    feet: r.feet, tuft: r.tuft !== false, claws: true, top: false, bottom: false, colours: { ...r.colours } };
  return { ...look, ...changes, colours: { ...look.colours, ...(changes.colours || {}) } };
}

/** A random, always-valid look: a random species with some parts swapped in from others. */
export function randomLook(rng = Math.random) {
  const pick = a => a[Math.floor(rng() * a.length)];
  const look = lookFor(pick(Object.keys(CATALOG.species)));
  for (const k of ['ears', 'cheeks', 'hair', 'eyes', 'tail', 'feet', 'teeth'])
    if (rng() < 0.35) look[k] = pick([...CATALOG.parts[k], ...(['ears', 'cheeks', 'hair', 'tail', 'teeth'].includes(k) ? ['none'] : [])]);
  return look;
}

/** Which part GLBs a look needs (names relative to the kit folder, without .glb). */
export function partsFor(look) {
  const l = look, out = [];
  const snout = CATALOG.species[l.head]?.snout;
  out.push('head-' + l.head, 'eyes-' + l.eyes, 'feet-' + l.feet);
  for (const k of ['ears', 'cheeks', 'hair', 'tail']) if (l[k] && l[k] !== 'none') out.push(`${k}-${l[k]}`);
  if (l.teeth && l.teeth !== 'none' && snout) out.push(`teeth-${l.teeth}__${snout}`);
  if (l.tuft) out.push('tuft');
  if (l.claws) { out.push('claws'); if (l.feet === 'paws') out.push('claws-paws'); }
  if (l.top) out.push('top');
  if (l.bottom) out.push('bottom');
  return out;
}

/** Give a ready-made character (characters/<species>.glb, loaded yourself) the pack's toon look, in place. */
export function toonify(object, style = {}) {
  const meshes = [];
  object.traverse(o => { if (o.isSkinnedMesh && !o.userData.furryOutline) meshes.push({ mesh: o, src: o.geometry, srcMat: o.material, part: o.name }); });
  const colours = {};
  for (const r of meshes) for (const m of [r.srcMat].flat()) colours[m.name] = '#' + m.color.getHexString();
  toonMeshes(meshes, colours, { ...STYLE, ...style });
  return object;
}

// ---------------------------------------------------------------- the toon look

// welded normals: average the face normals of every corner at the same position (smooth shading bands)
const smoothCache = new WeakMap();
function smoothGeometry(src) {
  if (smoothCache.has(src)) return smoothCache.get(src);
  const g = src.index ? src.toNonIndexed() : src.clone();
  const pos = g.attributes.position, n = pos.count, sum = new Map(), a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  const key = i => `${Math.round(pos.getX(i) * 1e4)},${Math.round(pos.getY(i) * 1e4)},${Math.round(pos.getZ(i) * 1e4)}`;
  for (let i = 0; i < n; i += 3) {
    a.fromBufferAttribute(pos, i); b.fromBufferAttribute(pos, i + 1); c.fromBufferAttribute(pos, i + 2);
    const f = c.sub(b).cross(a.sub(b));   // area-weighted face normal
    for (let k = 0; k < 3; k++) {
      const h = key(i + k);
      if (!sum.has(h)) sum.set(h, new THREE.Vector3());
      sum.get(h).add(f);
    }
  }
  const out = new Float32Array(n * 3), v = new THREE.Vector3();
  for (let i = 0; i < n; i++) v.copy(sum.get(key(i))).normalize().toArray(out, i * 3);
  g.setAttribute('normal', new THREE.BufferAttribute(out, 3));
  smoothCache.set(src, g);
  return g;
}

const ramps = new Map();
function ramp(steps, shadow) {
  const key = steps + ':' + shadow;
  if (!ramps.has(key)) {
    const n = Math.max(2, Math.round(steps)), v = Array.from({ length: n }, (_, i) => Math.round(255 * (shadow + (1 - shadow) * i / (n - 1))));
    const t = new THREE.DataTexture(new Uint8Array(v.flatMap(x => [x, x, x, 255])), n, 1);
    t.minFilter = t.magFilter = THREE.NearestFilter;
    t.needsUpdate = true;
    ramps.set(key, t);
  }
  return ramps.get(key);
}

// toon materials in the region colours, smooth normals, and an outline hull per mesh ({ mesh, src, srcMat, part, outline })
function toonMeshes(meshes, col, s) {
  const gradient = ramp(s.steps, s.shadow);
  for (const r of meshes) {
    const regions = [r.srcMat].flat().map(m => m.name);
    const mats = regions.map(region => {
      const m = new THREE.MeshToonMaterial({ color: new THREE.Color(col[region] || '#ff00ff'), gradientMap: gradient });
      m.name = region;
      return m;
    });
    for (const old of [r.mesh.material].flat()) if (![r.srcMat].flat().includes(old)) old.dispose();
    r.mesh.material = Array.isArray(r.srcMat) ? mats : mats[0];
    r.mesh.geometry = smoothGeometry(r.src);
    // the outline: an inverted hull pushed out along the smooth normals (teeth keep theirs: they sit on pale fur)
    if (r.outline) { r.outline.removeFromParent(); [r.outline.material].flat().forEach(m => m.dispose()); r.outline = null; }
    if (s.outline > 0 && (r.part.startsWith('teeth') || !regions.every(x => NO_OUTLINE.has(x)))) {
      const lineMats = regions.map(region => {
        const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(col[region] || '#000').multiplyScalar(s.ink), side: THREE.BackSide });
        m.onBeforeCompile = sh => {
          sh.vertexShader = sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>\n  transformed += normalize(normal) * ${s.outline.toFixed(5)};`);
        };
        m.customProgramCacheKey = () => 'furry-outline-' + s.outline;
        return m;
      });
      const line = new THREE.SkinnedMesh(smoothGeometry(r.src), Array.isArray(r.srcMat) ? lineMats : lineMats[0]);
      line.bind(r.mesh.skeleton, r.mesh.bindMatrix);
      line.frustumCulled = false;
      line.userData.furryOutline = true;
      r.mesh.add(line);
      r.outline = line;
    }
  }
}

// ---------------------------------------------------------------- the kit

export async function loadFurryKit(dir, { loader } = {}) {
  if (!loader) throw new Error('loadFurryKit needs { loader }: a GLTFLoader with setMeshoptDecoder(MeshoptDecoder)');
  if (dir && !dir.endsWith('/')) dir += '/';
  const gltfs = new Map();
  const glb = name => {
    if (!gltfs.has(name)) gltfs.set(name, loader.loadAsync(`${dir}${name}.glb`));
    return gltfs.get(name);
  };
  const base = await glb('base');
  const clips = Object.fromEntries(base.animations.map(a => [a.name, a]));

  class Furry {
    constructor() {
      this.object = cloneSkinned(base.scene);
      this.bones = {};
      this.meshes = [];
      this.object.traverse(o => {
        if (o.isBone) this.bones[o.name] = o;
        if (o.isSkinnedMesh) this.meshes.push({ mesh: o, src: o.geometry, srcMat: o.material, part: 'base' });
      });
      this.rig = this.meshes[0]?.mesh.parent || this.object;
      this.mixer = new THREE.AnimationMixer(this.object);
      this.style = { ...STYLE };
      this.look = null;
    }

    /** Change any part of the look (or { species } for another preset); re-dresses and recolours. */
    async set(changes) {
      if (changes.species && changes.species !== this.look?.species) changes = lookFor(changes.species, changes);
      const colours = { ...(this.look?.colours || {}), ...(changes.colours || {}) };
      this.look = { ...(this.look || lookFor('wolf')), ...changes, colours };
      const loaded = await Promise.all(partsFor(this.look).map(glb));
      for (const r of this.meshes.filter(r => r.part !== 'base')) {
        r.mesh.removeFromParent();
        for (const m of [r.mesh.material, r.outline?.material].flat()) m?.dispose?.();
      }
      this.meshes = this.meshes.filter(r => r.part === 'base');
      for (const g of loaded) g.scene.traverse(src => {
        if (!src.isSkinnedMesh) return;
        const m = new THREE.SkinnedMesh(src.geometry, src.material);
        m.name = src.name;
        m.castShadow = true;
        m.bind(new THREE.Skeleton(src.skeleton.bones.map(b => this.bones[b.name]), src.skeleton.boneInverses), src.bindMatrix);
        this.rig.add(m);
        this.meshes.push({ mesh: m, src: src.geometry, srcMat: src.material, part: src.name });
      });
      this.setStyle();
      return this;
    }

    /** Recolour by region (CATALOG.regions): fur.paint({ fur: '#3a7bd5', hair: '#ff6fd8' }). */
    paint(colours = {}) {
      Object.assign(this.look.colours, colours);
      return this.setStyle();
    }

    /** Tune the toon look: fur.setStyle({ outline: 0.012, steps: 2 }) (see STYLE). */
    setStyle(style = {}) {
      this.style = { ...this.style, ...style };
      toonMeshes(this.meshes, { ...CATALOG.defaults, ...this.look.colours }, this.style);
      return this;
    }

    /** Play a clip, cross-fading from the current one. One-shots hold their last frame unless loop: true. */
    play(name, { fade = 0.15, loop, timeScale = 1 } = {}) {
      const clip = clips[name];
      if (!clip) throw new Error(`no clip "${name}"`);
      const a = this.mixer.clipAction(clip);
      const repeat = loop ?? CLIPS[name]?.loop ?? false;
      a.reset();
      a.setLoop(repeat ? THREE.LoopRepeat : THREE.LoopOnce, Infinity);
      a.clampWhenFinished = true;
      a.timeScale = timeScale;
      if (this.current && this.current !== a) this.current.fadeOut(fade);
      a.fadeIn(this.current && this.current !== a ? fade : 0).play();
      this.current = a;
      this.clip = name;
      return a;
    }

    /** Swing-trail windows of the current clip (or a named one): [{ paw: 'L'|'R', start, end }] in seconds. */
    trails(name = this.clip) {
      return (CATALOG.trails[name] || []).map(w => ({ paw: w.bone, start: w.start, end: w.end }));
    }

    /** World position of a paw's claw tips ('L' or 'R'): attach slash FX here during a trail window. */
    clawTip(paw, target = new THREE.Vector3()) {
      const a = this.bones['hand' + paw].getWorldPosition(new THREE.Vector3());
      this.bones['fingers' + paw].getWorldPosition(target);
      return target.add(target.clone().sub(a).multiplyScalar(1.2));
    }

    update(dt) { this.mixer.update(dt); }

    dispose() {
      this.mixer.stopAllAction();
      this.object.removeFromParent();
      for (const r of this.meshes) for (const m of [r.mesh.material, r.outline?.material].flat()) m?.dispose?.();
    }
  }

  return {
    catalog: CATALOG,
    clips: CLIPS,
    animations: clips,
    style: STYLE,
    lookFor,
    randomLook,
    partsFor,
    toonify,
    /** Build a character from a species name or a look (see the top of this file). */
    async makeFurry(look = 'wolf') {
      const f = new Furry();
      await f.set(typeof look === 'string' ? lookFor(look) : look.species ? lookFor(look.species, look) : { ...lookFor('wolf'), ...look });
      f.play('idle');
      return f;
    },
  };
}
