// Facet Fauna: Cats - mix-and-match kit for three.js.
//
// Assembles a cat from the kit's parts (a build with its skeleton and clips, a
// head, a pair of ears, a coat shell and a tail) and colours it with pattern
// masks, so any combination - and any cross of two cats - can be made at run
// time. For a fixed cat with no code, load a ready-made breed from breeds/.
//
//   import { loadCatKit } from './catkit.js';
//   const kit = await loadCatKit('assets/cats/kit/');       // the folder holding the cat_*.glb parts
//   const cat = kit.makeCat('Bengal');                      // a breed from breeds.csv ...
//   const kitten = kit.makeCat(kit.breed(kit.breeds.Siamese, kit.breeds['Maine Coon']));   // ... or a cross
//   scene.add(cat.object);
//   cat.play('walk');
//   // every frame:  cat.update(dt);
//
// A cat is described by the same fields as a row of breeds.csv (all names from
// catalog.json): build, size, head, ears, tail, coat (short / ruff / fluffy /
// semilong / long / rex / hairless), base (colour), layers ("pattern:colour|..."
// up to three, painted in order), nose. Cats are lit by the scene's lights
// (a standard material with the pattern colours injected).
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

// Where the parts live under `base`. 'pack': the asset library's flat kit
// folder (the default). 'source': run-cat-pack/kit in run-workshop.
const LAYOUTS = {
  pack: { build: b => `cat_build_${b}.glb`, head: h => `cat_head_${h}.glb`, ear: (e, s) => `cat_ear_${e}_${s}.glb`,
          pattern: (kind, key) => `patterns/cat_pattern_${kind}_${key}.png` },
  source: { build: b => `builds/${b}.glb`, head: h => `heads/${h}.glb`, ear: (e, s) => `parts/ear-${e}-${s}.glb`,
            pattern: (kind, key) => `patterns/${kind}-${key}.png` },
};

const FIXED = { eye: '#151313', ink: '#554b50', inner: '#f7d4d4', shine: '#ffffff' };

// <generated> catalog.json and breeds.csv, written in by scripts/build_breeds.py
const DATA = {"catalog":{"builds":["domestic","cobby","large","wild","munchkin","kitten"],"heads":["domestic","round","wedge","flat","pixie","lynx"],"headForBuild":{"cobby":"round","wild":"wedge","large":"lynx","kitten":"round"},"ears":["standard","round","large","small","fold","curl","tufted"],"tails":["long","thin","plume","thick","curl","bob","stub"],"furs":["none","ruff","fluffy","semilong","long","rex"],"coatShell":{"ruff":"ruff","fluffy":"fluffy","semilong":"semilong","long":"long","rex":"rex"},"patterns":{"points":{"region":"points"},"cream":{"region":"cream"},"bicolor":{"region":"bicolor"},"van":{"region":"van"},"mitted":{"region":"mitted"},"locket":{"region":"locket"},"harlequin":{"region":"harlequin"},"mackerel":{"region":"mackerel"},"classic":{"region":"classic"},"shaded":{"region":"shaded"},"spots":{"tile":"spots"},"rosettes":{"tile":"rosettes"},"ticking":{"tile":"ticking"},"tortie":{"tile":"tortie"}},"colours":{"black":"#1e1b1a","charcoal":"#3d3c3f","blue":"#7f8a96","chocolate":"#5a3a26","lilac":"#b8a9a6","cinnamon":"#8a5a3a","fawn":"#c9ad94","red":"#eba15f","darkred":"#c26f35","cream":"#f5e6c8","white":"#f4f1ea","silver":"#c9cbcd","seal":"#3d2c22","golden":"#d8a65e","brown":"#9a7048","ruddy":"#b5652f","sepia":"#a8875f","sable":"#5e4030","orange":"#e09040","pinkskin":"#e8bfae","greyskin":"#a39b98"},"noseColours":{"pink":"#e59a96","brick":"#b5614e","black":"#2a2224","blue":"#6c7480","brown":"#6a4232","lilac":"#bfa3a3","grey":"#8d8486"},"eyeColours":{"blue":"#4a86cc","green":"#6a9a45","gold":"#b37a35","copper":"#9a5424","hazel":"#8a7232","odd":"#3f7cc4"},"fixedColours":{"eye":"#151313","ink":"#554b50","innerEar":"#f7d4d4","shine":"#ffffff"},"sizes":{"XS":0.3,"S":0.45,"M":0.55,"L":0.66,"XL":0.8}},"breeds":[{"breed":"Domestic Shorthair","build":"domestic","size":"M","head":"domestic","ears":"standard","tail":"long","coat":"short","eyes":"green","base":"brown","layers":"cream:cream|mackerel:black","nose":"brick"},{"breed":"Domestic Shorthair (ginger)","build":"domestic","size":"M","head":"domestic","ears":"standard","tail":"long","coat":"short","eyes":"gold","base":"red","layers":"cream:cream|mackerel:darkred","nose":"pink"},{"breed":"Domestic Shorthair (tuxedo)","build":"domestic","size":"M","head":"domestic","ears":"standard","tail":"long","coat":"short","eyes":"green","base":"black","layers":"bicolor:white","nose":"black"},{"breed":"Domestic Shorthair (calico)","build":"domestic","size":"M","head":"domestic","ears":"standard","tail":"long","coat":"short","eyes":"gold","base":"black","layers":"tortie:red|bicolor:white","nose":"pink"},{"breed":"Domestic Shorthair (tortie)","build":"domestic","size":"M","head":"domestic","ears":"standard","tail":"long","coat":"short","eyes":"gold","base":"black","layers":"tortie:red","nose":"black"},{"breed":"Domestic Shorthair (grey tabby)","build":"domestic","size":"M","head":"domestic","ears":"standard","tail":"long","coat":"short","eyes":"green","base":"silver","layers":"classic:black","nose":"brick"},{"breed":"Domestic Longhair","build":"large","size":"M","head":"lynx","ears":"tufted","tail":"plume","coat":"fluffy","eyes":"gold","base":"brown","layers":"classic:black|bicolor:white","nose":"brick"},{"breed":"American Shorthair","build":"domestic","size":"M","head":"round","ears":"standard","tail":"thick","coat":"short","eyes":"gold","base":"silver","layers":"classic:black","nose":"brick"},{"breed":"European Shorthair","build":"domestic","size":"M","head":"domestic","ears":"standard","tail":"long","coat":"short","eyes":"green","base":"brown","layers":"mackerel:black","nose":"brick"},{"breed":"American Bobtail","build":"large","size":"L","head":"lynx","ears":"standard","tail":"curl","coat":"semilong","eyes":"gold","base":"brown","layers":"mackerel:black","nose":"brick"},{"breed":"Japanese Bobtail","build":"domestic","size":"M","head":"wedge","ears":"large","tail":"bob","coat":"short","eyes":"gold","base":"white","layers":"harlequin:black|tortie:red","nose":"pink"},{"breed":"Kurilian Bobtail","build":"large","size":"M","head":"lynx","ears":"standard","tail":"bob","coat":"ruff","eyes":"gold","base":"brown","layers":"mackerel:black","nose":"brick"},{"breed":"Manx","build":"cobby","size":"M","head":"round","ears":"standard","tail":"stub","coat":"short","eyes":"gold","base":"black","layers":"","nose":"black"},{"breed":"Cymric","build":"cobby","size":"M","head":"round","ears":"standard","tail":"stub","coat":"semilong","eyes":"gold","base":"red","layers":"classic:darkred","nose":"pink"},{"breed":"American Curl","build":"domestic","size":"M","head":"domestic","ears":"curl","tail":"plume","coat":"semilong","eyes":"gold","base":"white","layers":"van:red","nose":"pink"},{"breed":"Pixie-bob","build":"large","size":"L","head":"lynx","ears":"tufted","tail":"bob","coat":"short","eyes":"gold","base":"brown","layers":"spots:black","nose":"brick"},{"breed":"American Wirehair","build":"domestic","size":"M","head":"round","ears":"standard","tail":"long","coat":"rex","eyes":"gold","base":"white","layers":"","nose":"pink"},{"breed":"Snowshoe","build":"domestic","size":"M","head":"domestic","ears":"standard","tail":"long","coat":"short","eyes":"blue","base":"cream","layers":"points:seal|mitted:white","nose":"pink"},{"breed":"British Shorthair","build":"cobby","size":"L","head":"round","ears":"round","tail":"thick","coat":"short","eyes":"copper","base":"blue","layers":"","nose":"blue"},{"breed":"British Shorthair (lilac)","build":"cobby","size":"L","head":"round","ears":"round","tail":"thick","coat":"short","eyes":"copper","base":"lilac","layers":"","nose":"lilac"},{"breed":"British Longhair","build":"cobby","size":"L","head":"round","ears":"round","tail":"plume","coat":"fluffy","eyes":"copper","base":"cream","layers":"","nose":"pink"},{"breed":"Chartreux","build":"cobby","size":"L","head":"round","ears":"standard","tail":"thick","coat":"short","eyes":"copper","base":"blue","layers":"","nose":"blue"},{"breed":"Scottish Fold","build":"cobby","size":"M","head":"round","ears":"fold","tail":"thick","coat":"short","eyes":"copper","base":"silver","layers":"classic:black","nose":"brick"},{"breed":"Scottish Straight","build":"cobby","size":"M","head":"round","ears":"standard","tail":"thick","coat":"short","eyes":"copper","base":"blue","layers":"","nose":"blue"},{"breed":"Highland Fold","build":"cobby","size":"M","head":"round","ears":"fold","tail":"plume","coat":"fluffy","eyes":"copper","base":"cream","layers":"classic:red","nose":"pink"},{"breed":"Persian","build":"cobby","size":"M","head":"flat","ears":"small","tail":"plume","coat":"long","eyes":"copper","base":"white","layers":"","nose":"pink"},{"breed":"Persian (black)","build":"cobby","size":"M","head":"flat","ears":"small","tail":"plume","coat":"long","eyes":"copper","base":"black","layers":"","nose":"black"},{"breed":"Exotic Shorthair","build":"cobby","size":"M","head":"flat","ears":"round","tail":"thick","coat":"short","eyes":"copper","base":"cream","layers":"classic:red","nose":"pink"},{"breed":"Himalayan","build":"cobby","size":"M","head":"flat","ears":"small","tail":"plume","coat":"long","eyes":"blue","base":"cream","layers":"points:seal","nose":"black"},{"breed":"Burmilla","build":"domestic","size":"M","head":"round","ears":"standard","tail":"long","coat":"short","eyes":"green","base":"silver","layers":"shaded:charcoal","nose":"brick"},{"breed":"Burmese","build":"cobby","size":"M","head":"round","ears":"standard","tail":"long","coat":"short","eyes":"gold","base":"sable","layers":"","nose":"brown"},{"breed":"Bombay","build":"cobby","size":"M","head":"round","ears":"standard","tail":"long","coat":"short","eyes":"copper","base":"black","layers":"","nose":"black"},{"breed":"Selkirk Rex","build":"cobby","size":"L","head":"round","ears":"small","tail":"thick","coat":"rex","eyes":"copper","base":"white","layers":"","nose":"pink"},{"breed":"Siamese","build":"wild","size":"M","head":"wedge","ears":"large","tail":"thin","coat":"short","eyes":"blue","base":"cream","layers":"points:seal","nose":"black"},{"breed":"Siamese (blue point)","build":"wild","size":"M","head":"wedge","ears":"large","tail":"thin","coat":"short","eyes":"blue","base":"white","layers":"points:blue","nose":"blue"},{"breed":"Oriental Shorthair","build":"wild","size":"M","head":"wedge","ears":"large","tail":"thin","coat":"short","eyes":"green","base":"chocolate","layers":"","nose":"brown"},{"breed":"Oriental Longhair","build":"wild","size":"M","head":"wedge","ears":"large","tail":"plume","coat":"semilong","eyes":"green","base":"cinnamon","layers":"","nose":"brick"},{"breed":"Balinese","build":"wild","size":"M","head":"wedge","ears":"large","tail":"plume","coat":"semilong","eyes":"blue","base":"cream","layers":"points:seal","nose":"black"},{"breed":"Javanese","build":"wild","size":"M","head":"wedge","ears":"large","tail":"plume","coat":"semilong","eyes":"blue","base":"white","layers":"points:red","nose":"pink"},{"breed":"Colorpoint Shorthair","build":"wild","size":"M","head":"wedge","ears":"large","tail":"thin","coat":"short","eyes":"blue","base":"white","layers":"points:red","nose":"pink"},{"breed":"Thai","build":"domestic","size":"M","head":"domestic","ears":"large","tail":"thin","coat":"short","eyes":"blue","base":"cream","layers":"points:seal","nose":"black"},{"breed":"Tonkinese","build":"domestic","size":"M","head":"domestic","ears":"standard","tail":"long","coat":"short","eyes":"blue","base":"sable","layers":"points:seal","nose":"brown"},{"breed":"Peterbald","build":"wild","size":"M","head":"wedge","ears":"large","tail":"thin","coat":"hairless","eyes":"green","base":"pinkskin","layers":"","nose":"pink"},{"breed":"Cornish Rex","build":"wild","size":"M","head":"pixie","ears":"large","tail":"thin","coat":"rex","eyes":"gold","base":"white","layers":"harlequin:black","nose":"pink"},{"breed":"Devon Rex","build":"wild","size":"S","head":"pixie","ears":"large","tail":"thin","coat":"rex","eyes":"gold","base":"cream","layers":"","nose":"pink"},{"breed":"Sphynx","build":"wild","size":"M","head":"pixie","ears":"large","tail":"thin","coat":"hairless","eyes":"green","base":"pinkskin","layers":"harlequin:greyskin","nose":"pink"},{"breed":"Donskoy","build":"wild","size":"M","head":"pixie","ears":"large","tail":"thin","coat":"hairless","eyes":"blue","base":"greyskin","layers":"","nose":"grey"},{"breed":"Lykoi","build":"wild","size":"M","head":"pixie","ears":"large","tail":"thin","coat":"rex","eyes":"gold","base":"charcoal","layers":"ticking:black","nose":"black"},{"breed":"Abyssinian","build":"wild","size":"M","head":"domestic","ears":"large","tail":"long","coat":"short","eyes":"gold","base":"ruddy","layers":"ticking:black","nose":"brick"},{"breed":"Somali","build":"wild","size":"M","head":"domestic","ears":"large","tail":"plume","coat":"semilong","eyes":"gold","base":"ruddy","layers":"ticking:black","nose":"brick"},{"breed":"Singapura","build":"wild","size":"S","head":"round","ears":"large","tail":"long","coat":"short","eyes":"hazel","base":"sepia","layers":"ticking:sable","nose":"brick"},{"breed":"Russian Blue","build":"wild","size":"M","head":"domestic","ears":"large","tail":"long","coat":"short","eyes":"green","base":"blue","layers":"","nose":"blue"},{"breed":"Nebelung","build":"wild","size":"M","head":"domestic","ears":"large","tail":"plume","coat":"semilong","eyes":"green","base":"blue","layers":"","nose":"blue"},{"breed":"Korat","build":"wild","size":"M","head":"round","ears":"large","tail":"long","coat":"short","eyes":"green","base":"blue","layers":"","nose":"blue"},{"breed":"Bengal","build":"wild","size":"L","head":"domestic","ears":"standard","tail":"thick","coat":"short","eyes":"green","base":"golden","layers":"rosettes:black","nose":"brick"},{"breed":"Bengal (snow)","build":"wild","size":"L","head":"domestic","ears":"standard","tail":"thick","coat":"short","eyes":"blue","base":"white","layers":"rosettes:fawn","nose":"pink"},{"breed":"Egyptian Mau","build":"wild","size":"M","head":"domestic","ears":"large","tail":"long","coat":"short","eyes":"green","base":"silver","layers":"spots:black","nose":"brick"},{"breed":"Ocicat","build":"wild","size":"L","head":"domestic","ears":"large","tail":"long","coat":"short","eyes":"gold","base":"cream","layers":"spots:chocolate","nose":"brick"},{"breed":"Savannah","build":"wild","size":"XL","head":"wedge","ears":"large","tail":"thick","coat":"short","eyes":"gold","base":"golden","layers":"spots:black","nose":"black"},{"breed":"Serengeti","build":"wild","size":"L","head":"wedge","ears":"large","tail":"long","coat":"short","eyes":"gold","base":"golden","layers":"spots:black","nose":"black"},{"breed":"Toyger","build":"wild","size":"M","head":"domestic","ears":"standard","tail":"long","coat":"short","eyes":"gold","base":"orange","layers":"mackerel:black","nose":"brick"},{"breed":"Chausie","build":"wild","size":"XL","head":"wedge","ears":"tufted","tail":"thick","coat":"short","eyes":"gold","base":"brown","layers":"ticking:black","nose":"black"},{"breed":"Turkish Angora","build":"wild","size":"M","head":"wedge","ears":"large","tail":"plume","coat":"semilong","eyes":"odd","base":"white","layers":"","nose":"pink"},{"breed":"LaPerm","build":"domestic","size":"M","head":"domestic","ears":"standard","tail":"curl","coat":"rex","eyes":"gold","base":"red","layers":"classic:darkred","nose":"pink"},{"breed":"Maine Coon","build":"large","size":"XL","head":"lynx","ears":"tufted","tail":"plume","coat":"semilong","eyes":"gold","base":"brown","layers":"classic:black|bicolor:white","nose":"brick"},{"breed":"Maine Coon (silver)","build":"large","size":"XL","head":"lynx","ears":"tufted","tail":"plume","coat":"semilong","eyes":"green","base":"silver","layers":"classic:black","nose":"brick"},{"breed":"Norwegian Forest Cat","build":"large","size":"XL","head":"lynx","ears":"tufted","tail":"plume","coat":"ruff","eyes":"green","base":"brown","layers":"mackerel:black|bicolor:white","nose":"brick"},{"breed":"Siberian","build":"large","size":"L","head":"lynx","ears":"tufted","tail":"plume","coat":"ruff","eyes":"gold","base":"golden","layers":"mackerel:black","nose":"brick"},{"breed":"Neva Masquerade","build":"large","size":"L","head":"lynx","ears":"tufted","tail":"plume","coat":"semilong","eyes":"blue","base":"cream","layers":"points:seal","nose":"black"},{"breed":"Ragdoll","build":"large","size":"XL","head":"round","ears":"round","tail":"plume","coat":"fluffy","eyes":"blue","base":"cream","layers":"points:seal|mitted:white","nose":"black"},{"breed":"Birman","build":"large","size":"L","head":"round","ears":"round","tail":"plume","coat":"fluffy","eyes":"blue","base":"cream","layers":"points:seal|mitted:white","nose":"black"},{"breed":"Ragamuffin","build":"large","size":"XL","head":"round","ears":"round","tail":"plume","coat":"fluffy","eyes":"green","base":"blue","layers":"bicolor:white","nose":"blue"},{"breed":"Turkish Van","build":"large","size":"L","head":"domestic","ears":"large","tail":"plume","coat":"semilong","eyes":"odd","base":"white","layers":"van:red","nose":"pink"},{"breed":"Siberian Forest (blue)","build":"large","size":"L","head":"lynx","ears":"tufted","tail":"curl","coat":"ruff","eyes":"gold","base":"blue","layers":"classic:charcoal","nose":"blue"},{"breed":"Munchkin","build":"munchkin","size":"S","head":"domestic","ears":"standard","tail":"long","coat":"short","eyes":"gold","base":"red","layers":"mackerel:darkred","nose":"pink"},{"breed":"Munchkin Longhair","build":"munchkin","size":"S","head":"domestic","ears":"standard","tail":"plume","coat":"fluffy","eyes":"blue","base":"cream","layers":"points:seal","nose":"black"},{"breed":"Minskin","build":"munchkin","size":"S","head":"pixie","ears":"large","tail":"thin","coat":"rex","eyes":"blue","base":"pinkskin","layers":"points:greyskin","nose":"pink"},{"breed":"Bambino","build":"munchkin","size":"S","head":"pixie","ears":"large","tail":"thin","coat":"hairless","eyes":"blue","base":"pinkskin","layers":"","nose":"pink"},{"breed":"Lambkin","build":"munchkin","size":"S","head":"round","ears":"standard","tail":"thick","coat":"rex","eyes":"gold","base":"white","layers":"","nose":"pink"},{"breed":"Kitten (ginger)","build":"kitten","size":"XS","head":"round","ears":"standard","tail":"long","coat":"short","eyes":"blue","base":"red","layers":"cream:cream|mackerel:darkred","nose":"pink"},{"breed":"Kitten (tuxedo)","build":"kitten","size":"XS","head":"round","ears":"standard","tail":"long","coat":"short","eyes":"blue","base":"black","layers":"bicolor:white","nose":"pink"},{"breed":"Kitten (calico)","build":"kitten","size":"XS","head":"round","ears":"standard","tail":"long","coat":"short","eyes":"blue","base":"white","layers":"harlequin:black|tortie:red","nose":"pink"},{"breed":"Kitten (fluffy)","build":"kitten","size":"XS","head":"flat","ears":"small","tail":"plume","coat":"fluffy","eyes":"blue","base":"cream","layers":"","nose":"pink"}]};
// </generated>

// Standard material + the kit's colouring: base coat, three pattern layers
// (region masks read through the anatomical UV set, tile masks through UV0),
// and tagged faces (COLOR_0) for nose, eyes, mouth line and inner ears.
function coatMaterial(shared, { part = false, partUv = [0, 0], uvScale = 1 } = {}) {
  const m = new THREE.MeshStandardMaterial({ roughness: 1, metalness: 0, flatShading: true, side: THREE.DoubleSide });
  const own = { isPart: { value: part ? 1 : 0 }, partUv: { value: new THREE.Vector2(...partUv) },
                uvScale: { value: uvScale } };
  m.userData.uniforms = own;
  m.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, shared, own);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', `#include <common>
        attribute vec4 color;
        attribute vec2 uv1;
        uniform float uvScale;
        varying vec2 vKitUv; varying vec2 vKitUv1; varying vec3 vKitTag;`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        vKitUv = uv * uvScale; vKitUv1 = uv1; vKitTag = color.rgb;`);
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>
        uniform vec3 coat, color1, color2, color3, noseColor, eyeColor, inkColor, innerColor, shineColor;
        uniform sampler2D tex1, tex2, tex3;
        uniform float mode1, mode2, mode3, isPart;
        uniform vec2 partUv;
        varying vec2 vKitUv; varying vec2 vKitUv1; varying vec3 vKitTag;
        float kitLayer(sampler2D tex, float mode) {
          if (mode < 0.5) return 0.0;
          float t = texture2D(tex, mode < 1.5 ? mix(vKitUv1, partUv, isPart) : vKitUv).r;
          float aa = fwidth(t);
          return smoothstep(0.5 - aa, 0.5 + aa, t);
        }`)
      .replace('vec4 diffuseColor = vec4( diffuse, opacity );', `
        vec3 c = coat;
        c = mix(c, color1, kitLayer(tex1, mode1));
        c = mix(c, color2, kitLayer(tex2, mode2));
        c = mix(c, color3, kitLayer(tex3, mode3));
        vec3 t = step(vec3(0.5), vKitTag);
        c = mix(c, noseColor, t.r * (1.0 - t.g) * (1.0 - t.b));
        c = mix(c, innerColor, t.r * t.b * (1.0 - t.g));
        c = mix(c, eyeColor, t.g * (1.0 - t.r));
        c = mix(c, inkColor, t.b * (1.0 - t.r) * (1.0 - t.g));
        c = mix(c, shineColor, t.r * t.g * t.b);
        vec4 diffuseColor = vec4(c, opacity);`);
  };
  return m;
}

export async function loadCatKit(base = './', { layout = 'pack' } = {}) {
  if (!base.endsWith('/')) base += '/';
  const L = LAYOUTS[layout];
  const gltf = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const catalog = DATA.catalog;
  const breeds = Object.fromEntries(DATA.breeds.map(r => [r.breed, r]));

  const builds = {}, heads = {}, ears = {};
  const byName = (g, n) => g.scene.getObjectByName(n);
  await Promise.all([
    ...catalog.builds.map(async b => {
      const g = await gltf.loadAsync(base + L.build(b));
      builds[b] = { scene: g.scene, clips: g.animations, looping: byName(g, 'rig')?.userData.looping_clips || [] };
    }),
    ...catalog.heads.map(async h => {
      const g = await gltf.loadAsync(base + L.head(h));
      const sockets = {};
      g.scene.traverse(o => { if (o.name.startsWith('socket_')) sockets[o.name.slice(7)] = o; });
      heads[h] = { head: byName(g, 'head').geometry, eyes: byName(g, 'eyes'),
                   coats: Object.fromEntries(catalog.furs.map(f => [f, byName(g, `coat_${f}`)?.geometry])), sockets };
    }),
    ...catalog.ears.flatMap(e => ['L', 'R'].map(async s => {
      const g = await gltf.loadAsync(base + L.ear(e, s));
      ears[`${e}-${s}`] = byName(g, `ear-${e}-${s}`).geometry;
    })),
  ]);
  const texLoader = new THREE.TextureLoader();
  const masks = {};
  await Promise.all(Object.entries(catalog.patterns).map(async ([name, p]) => {
    const t = await texLoader.loadAsync(base + L.pattern(p.region ? 'region' : 'tile', p.region || p.tile));
    if (p.region) t.flipY = false;          // read through the glTF UV set: glTF convention
    else t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.needsUpdate = true;
    masks[name] = { tex: t, mode: p.region ? 1 : 2 };
  }));
  const blank = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1);
  blank.needsUpdate = true;
  const colour = (table, name, fallback) => new THREE.Color(table[name] || fallback);

  function makeCat(spec) {
    const r = typeof spec === 'string' ? breeds[spec] : spec;
    if (!r) throw new Error(`No breed "${spec}" in breeds.csv`);
    const head = r.head || catalog.headForBuild[r.build] || 'domestic';
    const fur = catalog.coatShell[r.coat] || 'none';
    const B = builds[r.build], H = heads[head];

    const shared = { coat: { value: new THREE.Color() }, noseColor: { value: new THREE.Color() },
                     eyeColor: { value: new THREE.Color(FIXED.eye) }, inkColor: { value: new THREE.Color(FIXED.ink) },
                     innerColor: { value: new THREE.Color(FIXED.inner) }, shineColor: { value: new THREE.Color(FIXED.shine) } };
    [1, 2, 3].forEach(i => {
      shared[`color${i}`] = { value: new THREE.Color() };
      shared[`tex${i}`] = { value: blank };
      shared[`mode${i}`] = { value: 0 };
    });
    // Coat colours: base, up to three pattern layers ("pattern:colour|..."), nose.
    function recolour({ base = r.base, layers = r.layers, nose = r.nose } = {}) {
      shared.coat.value.copy(colour(catalog.colours, base, '#999999'));
      shared.noseColor.value.copy(colour(catalog.noseColours, nose, catalog.noseColours.pink));
      const ls = (layers || '').split('|').filter(Boolean).map(l => l.split(':'));
      [1, 2, 3].forEach(i => {
        const [pat, col] = ls[i - 1] || [];
        shared[`color${i}`].value.copy(colour(catalog.colours, col, '#ffffff'));
        shared[`tex${i}`].value = masks[pat]?.tex || blank;
        shared[`mode${i}`].value = masks[pat]?.mode || 0;
      });
    }
    recolour();

    // Body: the build's rig, with only this cat's coat shell and tail shown.
    const rig = SkeletonUtils.clone(B.scene);
    const bodyMat = coatMaterial(shared);
    let socketHead;
    rig.traverse(o => {
      if (o.name === 'socket_head') socketHead = o;
      if (!o.isMesh) return;
      o.material = bodyMat;
      o.frustumCulled = false;
      if (o.name.startsWith('coat_')) o.visible = o.name === `coat_${fur}`;
      if (o.name.startsWith('tail_')) o.visible = o.name === `tail_${r.tail}`;
    });

    // Head group on the head socket: head, fluff, eyes, ears.
    const headScale = socketHead.scale.x;
    const group = new THREE.Group();
    group.add(new THREE.Mesh(H.head, coatMaterial(shared, { uvScale: headScale })));
    if (fur !== 'none' && H.coats[fur]) group.add(new THREE.Mesh(H.coats[fur], coatMaterial(shared, { uvScale: headScale })));
    const eyes = new THREE.Mesh(H.eyes.geometry, coatMaterial(shared, { uvScale: headScale }));
    eyes.position.copy(H.eyes.position);
    group.add(eyes);
    const earScale = socketHead.userData.ear_scale ?? 1;
    const earMeshes = {};
    for (const s of ['L', 'R']) {
      const sock = H.sockets[`ear_${s}`];
      const m = new THREE.Mesh(ears[`${r.ears}-${s}`],
        coatMaterial(shared, { part: true, partUv: sock.userData.uv2, uvScale: headScale * sock.scale.x * earScale }));
      m.position.copy(sock.position);
      m.scale.copy(sock.scale).multiplyScalar(earScale);
      group.add(m);
      earMeshes[s] = m;
    }
    group.traverse(o => { if (o.isMesh) o.frustumCulled = false; });
    socketHead.add(group);

    // Ear bones and the lids bone carry no skin: copy them onto the ears / eyes.
    const sanitize = THREE.PropertyBinding.sanitizeNodeName;
    const earBones = Object.fromEntries(['L', 'R'].map(s => {
      const b = rig.getObjectByName(sanitize(`ear.${s}`));
      return [s, { bone: b, rest: b.quaternion.clone() }];
    }));
    const lids = rig.getObjectByName('lids');
    const q = new THREE.Quaternion();
    function follow() {
      for (const [s, e] of Object.entries(earBones)) {
        q.copy(e.rest).invert().multiply(e.bone.quaternion);
        earMeshes[s].quaternion.set(-q.z, q.y, q.x, q.w);   // bone space -> head space
      }
      eyes.scale.y = Math.min(1, lids.scale.y);
    }

    const object = new THREE.Group();
    object.add(rig);
    object.scale.setScalar(catalog.sizes[r.size] || 0.55);   // the kit is built 1 unit long: metres
    object.userData.cat = r;
    const mixer = new THREE.AnimationMixer(rig);
    let current = null;
    return {
      object, spec: r, clips: B.clips.map(c => c.name), mixer, length: catalog.sizes[r.size] || 0.55,
      clip: name => B.clips.find(c => c.name === name), looping: B.looping, headGroup: group,
      // Repaint the coat: any of { base, layers, nose } (catalog names), e.g. a dye or a breeding result.
      recolour,
      // Play a clip by name; looping clips (walk, idles...) repeat, the rest hold their last frame.
      play(name, { fade = 0.15 } = {}) {
        const clip = B.clips.find(c => c.name === name);
        if (!clip) throw new Error(`No clip "${name}"`);
        const next = mixer.clipAction(clip);
        next.reset();
        next.setLoop(B.looping.includes(name) ? THREE.LoopRepeat : THREE.LoopOnce, Infinity);
        next.clampWhenFinished = true;
        next.play();
        if (current && current !== next && fade > 0) current.crossFadeTo(next, fade, false);
        else if (current && current !== next) current.stop();
        current = next;
        return next;
      },
      update(dt) { mixer.update(dt); follow(); },
    };
  }

  // A kitten of two cats: each slot (build, size, head, ears, tail, coat
  // length, base colour, pattern layers, nose) comes from one parent or the other.
  function breed(a, b, random = Math.random) {
    const pa = typeof a === 'string' ? breeds[a] : a, pb = typeof b === 'string' ? breeds[b] : b;
    const pick = k => (random() < 0.5 ? pa : pb)[k];
    return { breed: `${pa.breed} × ${pb.breed}`, build: pick('build'), size: pick('size'), head: pick('head'),
             ears: pick('ears'), tail: pick('tail'), coat: pick('coat'), eyes: pick('eyes'), base: pick('base'),
             layers: pick('layers'), nose: pick('nose') };
  }

  return { catalog, breeds, makeCat, breed };
}
