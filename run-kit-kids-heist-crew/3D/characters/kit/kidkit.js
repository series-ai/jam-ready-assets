// Kit Kids: Heist Crew. An avatar kit for three.js: mix-and-match kids.
//
// A kid is the base kid (head, face, skin body, the skeleton and every clip) plus one item per
// slot: hair, hat, ears, horns (and antennae), eyewear, markings (freckles, stripes, a belly patch ...),
// muzzle (animal faces, with their own expression mouths), mouth (tusks, fangs ...), neck, top,
// bottom (either can be none: the skin underneath), shoes (and paws, hooves ...), hands, back
// (wings, capes, packs), tail and prop. Under a hat the hair is its short-cut
// version, or none (a hat that hides it), or the hat's own (hairAs: a hat that sits on top wears
// the short crop, in the kid's hair colours); a one-piece top (full) leaves
// the bottoms off, and an outer top hides the overalls' bib. Each item has up to four
// colour channels (main, trim, accent, detail) and a few colourways; any colour works. The kid is
// merged into one skinned mesh with one material, so it is one draw call, and recolouring it
// (skin included) is a uniform change.
//
//   import { loadKidKit } from './kidkit.js';
//   const kit = await loadKidKit('assets/run-kit-kids-heist-crew/kit/');  // the folder with the GLBs (the catalog is built in)
//   const kid = await kit.makeKid(kit.looks['kid-spiky']);     // a ready-made look ...
//   const other = await kit.makeKid(kit.randomLook());         // ... or any mix
//   scene.add(kid.object);
//   kid.play('walk');                                          // clips: kit.clips
//   kid.play(kit.items.ride.snowboard.clip);                   // a ride (snowboard, sled) has its own clip; skis too
//   await kid.wear('top', 'raincoat', 'red');                  // swap an item (colourway name or colours)
//   kid.paint('top', 'main', '#3a7bd5');                       // recolour one channel
//   kid.setSkin(3);                                            // a skin tone index or any colour ('#7cb85a' for an orc)
//   kid.setMaterial(pal => withKitPalette(new THREE.MeshToonMaterial(), pal));   // any material, the kit's colours
//   // every frame:  kid.update(dt);
//
// A look is { skin, hair, hat, ears, ... prop } (kit.slots), each slot { item, way } or
// { item, colours: [main, trim, accent, detail] } (hex strings; fewer is fine). kit.items lists
// every slot's items with their channel names and colourways.
//
// Plain glTF loaders can open any of the GLBs: they show the item in its first colourway.
// The compressed shipping copies (scripts/compress.mjs) need a loader with the meshopt decoder:
//   const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
//   const kit = await loadKidKit('assets/kids/kit/', { loader });
// Clips change the face (mouths, brows, closed eyes) by scaling switch bones, as in the
// ready-made kids; nothing else is needed for that.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const CH = ['main', 'trim', 'accent', 'detail'];
// how often a random kid leaves a slot empty: mostly kids, with the odd creature
const QUIET = { ride: 0.92, hat: 0.55, ears: 0.8, horns: 0.85, eyewear: 0.7, markings: 0.75, muzzle: 0.85, mouth: 0.85, neck: 0.7,
  hands: 0.8, back: 0.8, tail: 0.8, top: 0, bottom: 0 };

/** The kit's catalog, when it is built in (the asset-library copies, scripts/pack-kits.mjs); otherwise kit.json is loaded. */
export const CATALOG = {"slots":["hair","hat","ears","horns","eyewear","markings","muzzle","mouth","neck","top","bottom","shoes","hands","back","tail","prop","offhand","ride"],"slotLabels":{"horns":"Horns & antennae","mouth":"Tusks & fangs","muzzle":"Animal muzzle","back":"On the back","prop":"Left hand","offhand":"Right hand","ride":"Ride on"},"channels":["main","trim","accent","detail"],"items":{"hair":{"crop":{"channels":{"main":"Hair"},"ways":{"black":["#1a1412"],"dark":["#402617"],"brown":["#7a4c29"],"chestnut":["#6b331a"],"ginger":["#e66b24"],"copper":["#cc541f"],"blonde":["#facc5c"],"platinum":["#f5f0d6"],"pink":["#ff73b2"],"blue":["#384c9e"]},"deathLift":[-2.62,-2.45,-2.15,-2.07,-2.09,-2.17,-2.28,-2.41,-2.48,-2.44,-2.36,-2.29,-2.21,-2.13,-2.06,-2.01,-1.97,-1.97,-2,-2.05,-2.03,-2.01,-2.01,-2.12,-2.26,-2.24,-2.33,-2.42,-2.51,-2.58,-2.51,-2.23,-1.49,-0.51,0.16,-0.14,-0.33,-0.43,-0.3,-0.03,0.16,-0.01,-0.02,0.09,0.12,0.13,0.13,0.14,0.14,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15],"file":"hair-crop.glb","hatDeathLift":[-2.62,-2.45,-2.15,-2.07,-2.09,-2.17,-2.28,-2.41,-2.48,-2.44,-2.36,-2.29,-2.21,-2.13,-2.06,-2.01,-1.97,-1.97,-2,-2.05,-2.03,-2.01,-2.01,-2.12,-2.26,-2.24,-2.33,-2.42,-2.51,-2.58,-2.51,-2.23,-1.49,-0.51,0.06,-0.15,-0.33,-0.43,-0.3,-0.03,0.14,-0.01,-0.02,0.09,0.12,0.13,0.13,0.14,0.14,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15],"hatFile":"hair-crop-hat.glb"},"long":{"channels":{"main":"Hair","trim":"Flower"},"ways":{"black":["#1a1412","#ffffff"],"dark":["#402617","#ffffff"],"brown":["#7a4c29","#ffffff"],"chestnut":["#6b331a","#ffffff"],"ginger":["#e66b24","#ffffff"],"copper":["#cc541f","#ffffff"],"blonde":["#facc5c","#ffffff"],"platinum":["#f5f0d6","#ffffff"],"pink":["#ff73b2","#ffffff"],"blue":["#384c9e","#ffffff"]},"deathLift":[-1.35,-1.24,-0.93,-0.85,-0.87,-0.94,-1.05,-1.17,-1.23,-1.15,-1.08,-1.01,-0.95,-0.89,-0.82,-0.77,-0.74,-0.74,-0.78,-0.85,-0.82,-0.78,-0.78,-0.88,-0.93,-0.86,-0.97,-1.15,-1.27,-1.37,-1.3,-1.05,-0.58,-0.26,0.24,-0.05,-0.08,-0.01,0.04,0.08,0.25,0.12,0.17,0.21,0.22,0.23,0.23,0.24,0.24,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25],"file":"hair-long.glb","hatDeathLift":[-1.35,-1.24,-0.93,-0.85,-0.87,-0.94,-1.05,-1.17,-1.23,-1.15,-1.08,-1.01,-0.95,-0.89,-0.82,-0.77,-0.74,-0.74,-0.78,-0.85,-0.82,-0.78,-0.78,-0.88,-0.93,-0.86,-0.97,-1.15,-1.27,-1.37,-1.3,-1.05,-0.58,-0.26,0.01,-0.17,-0.08,-0.01,0.04,0.08,0.07,0.12,0.17,0.21,0.22,0.23,0.23,0.24,0.24,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25],"hatFile":"hair-long-hat.glb"},"braids":{"channels":{"main":"Hair","trim":"Bows"},"ways":{"black":["#1a1412","#59bf8c"],"dark":["#402617","#59bf8c"],"brown":["#7a4c29","#59bf8c"],"chestnut":["#6b331a","#59bf8c"],"ginger":["#e66b24","#59bf8c"],"copper":["#cc541f","#59bf8c"],"blonde":["#facc5c","#59bf8c"],"platinum":["#f5f0d6","#59bf8c"],"pink":["#ff73b2","#59bf8c"],"blue":["#384c9e","#59bf8c"]},"deathLift":[-0.03,-0.01,0.02,0.08,0.13,0.16,0.15,0.11,0.08,0.15,0.21,0.25,0.27,0.28,0.28,0.27,0.24,0.19,0.12,0.03,0.07,0.15,0.22,0.31,0.37,0.37,0.28,0.14,0.01,-0.09,-0.17,-0.31,-0.72,-0.5,0.16,-0.14,-0.32,-0.41,-0.28,-0.03,0.16,0,-0.01,0.09,0.12,0.13,0.13,0.14,0.14,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15],"file":"hair-braids.glb","hatDeathLift":[-0.03,-0.01,0.02,0.08,0.13,0.16,0.15,0.11,0.08,0.15,0.21,0.25,0.27,0.28,0.28,0.27,0.24,0.19,0.12,0.03,0.07,0.15,0.22,0.31,0.37,0.37,0.28,0.14,0.01,-0.09,-0.17,-0.31,-0.72,-0.5,0.06,-0.15,-0.32,-0.41,-0.28,-0.03,0.14,0,-0.01,0.09,0.12,0.13,0.13,0.14,0.14,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15],"hatFile":"hair-braids-hat.glb"},"ponytail":{"channels":{"main":"Hair","trim":"Scrunchie"},"ways":{"black":["#1a1412","#4cb2f2"],"dark":["#402617","#4cb2f2"],"brown":["#7a4c29","#4cb2f2"],"chestnut":["#6b331a","#4cb2f2"],"ginger":["#e66b24","#4cb2f2"],"copper":["#cc541f","#4cb2f2"],"blonde":["#facc5c","#4cb2f2"],"platinum":["#f5f0d6","#4cb2f2"],"pink":["#ff73b2","#4cb2f2"],"blue":["#384c9e","#4cb2f2"]},"deathLift":[-2.28,-2.02,-1.6,-1.55,-1.62,-1.75,-1.9,-2.04,-2.13,-2.15,-2.12,-2.06,-1.98,-1.88,-1.78,-1.68,-1.59,-1.52,-1.48,-1.47,-1.49,-1.53,-1.62,-1.85,-2.14,-2.24,-2.33,-2.14,-2.15,-2.19,-2.03,-1.59,-0.74,0.3,1.03,0.79,0.57,0.48,0.64,0.98,1.2,1,0.99,1.14,1.18,1.19,1.19,1.2,1.21,1.21,1.21,1.21,1.21,1.21,1.21,1.21,1.21,1.21,1.21,1.21,1.21,1.21,1.21,1.21,1.21,1.21,1.21],"file":"hair-ponytail.glb","hatDeathLift":[-0.87,-0.67,-0.38,-0.33,-0.38,-0.47,-0.57,-0.67,-0.74,-0.76,-0.74,-0.71,-0.66,-0.6,-0.52,-0.45,-0.38,-0.32,-0.28,-0.28,-0.29,-0.33,-0.39,-0.55,-0.75,-0.91,-0.9,-0.76,-0.78,-0.81,-0.72,-0.46,-0.13,-0.01,-0.03,0.07,0.18,0.32,0.35,0.34,0.34,0.38,0.43,0.48,0.5,0.5,0.51,0.52,0.52,0.53,0.53,0.53,0.53,0.53,0.53,0.53,0.53,0.53,0.53,0.53,0.53,0.53,0.53,0.53,0.53,0.53,0.53],"hatFile":"hair-ponytail-hat.glb"},"buzz":{"channels":{"main":"Hair"},"ways":{"black":["#1a1412"],"dark":["#402617"],"brown":["#7a4c29"],"chestnut":["#6b331a"],"ginger":["#e66b24"],"copper":["#cc541f"],"blonde":["#facc5c"],"platinum":["#f5f0d6"],"pink":["#ff73b2"],"blue":["#384c9e"]},"deathLift":[-2.76,-2.61,-2.34,-2.27,-2.28,-2.35,-2.45,-2.57,-2.63,-2.59,-2.52,-2.45,-2.38,-2.31,-2.25,-2.2,-2.17,-2.17,-2.2,-2.25,-2.23,-2.21,-2.21,-2.3,-2.41,-2.37,-2.46,-2.58,-2.67,-2.74,-2.69,-2.44,-1.72,-0.67,0.16,-0.18,-0.51,-0.64,-0.5,-0.12,0.12,-0.1,-0.16,0,0.04,0.04,0.05,0.06,0.06,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07],"file":"hair-buzz.glb","hatDeathLift":[-2.76,-2.61,-2.34,-2.27,-2.28,-2.35,-2.45,-2.57,-2.63,-2.59,-2.52,-2.45,-2.38,-2.31,-2.25,-2.2,-2.17,-2.17,-2.2,-2.25,-2.23,-2.21,-2.21,-2.3,-2.41,-2.37,-2.46,-2.58,-2.67,-2.74,-2.69,-2.44,-1.72,-0.67,-0.06,-0.29,-0.51,-0.64,-0.5,-0.2,-0.02,-0.18,-0.21,-0.09,-0.05,-0.05,-0.04,-0.04,-0.03,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02],"hatFile":"hair-buzz-hat.glb"},"afro":{"channels":{"main":"Hair"},"ways":{"black":["#1a1412"],"dark":["#402617"],"brown":["#7a4c29"],"chestnut":["#6b331a"],"ginger":["#e66b24"],"copper":["#cc541f"],"blonde":["#facc5c"],"platinum":["#f5f0d6"],"pink":["#ff73b2"],"blue":["#384c9e"]},"deathLift":[-2.62,-2.45,-2.15,-2.07,-2.09,-2.17,-2.28,-2.41,-2.48,-2.44,-2.36,-2.29,-2.21,-2.13,-2.06,-2.01,-1.97,-1.97,-2,-2.05,-2.03,-2.01,-2.01,-2.12,-2.26,-2.24,-2.33,-2.42,-2.51,-2.58,-2.51,-2.23,-1.49,-0.33,0.56,0.19,-0.12,-0.3,-0.12,0.28,0.53,0.3,0.25,0.41,0.45,0.46,0.46,0.47,0.47,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48],"file":"hair-afro.glb","hatDeathLift":[-2.27,-2.11,-1.83,-1.76,-1.78,-1.85,-1.95,-2.06,-2.14,-2.09,-2.02,-1.94,-1.87,-1.8,-1.74,-1.69,-1.66,-1.65,-1.68,-1.74,-1.72,-1.69,-1.7,-1.79,-1.91,-1.93,-2.01,-2.08,-2.17,-2.24,-2.19,-1.91,-1.26,-0.33,0.19,0.02,-0.14,-0.22,-0.09,0.17,0.32,0.19,0.19,0.3,0.33,0.33,0.34,0.34,0.35,0.36,0.36,0.36,0.36,0.36,0.36,0.36,0.36,0.36,0.36,0.36,0.36,0.36,0.36,0.36,0.36,0.36,0.36],"hatFile":"hair-afro-hat.glb"},"none":{"channels":{},"ways":{"-":["#ffffff"]}}},"hat":{"ski-mask":{"channels":{"main":"Knit","trim":"Rims"},"ways":{"black":["#26262e","#404559"],"red":["#eb4040","#991f1f"],"striped":["#333861","#eb4040"],"lime":["#9ed14c","#4c9e66"]},"hidesHair":true,"deathLift":[-1.34,-1.28,-1.18,-1.14,-1.15,-1.16,-1.16,-1.16,-1.17,-1.18,-1.18,-1.19,-1.19,-1.19,-1.17,-1.12,-1.09,-1.08,-1.1,-1.12,-1.14,-1.11,-1.12,-1.18,-1.16,-1.14,-1.19,-1.27,-1.32,-1.36,-1.34,-1.26,-0.88,-0.34,0.29,-0.04,-0.16,-0.15,-0.08,0.06,0.27,0.09,0.12,0.19,0.21,0.21,0.22,0.22,0.23,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24,0.24],"file":"hat-ski-mask.glb"},"headlamp":{"channels":{"main":"Band","trim":"Lamp","accent":"Lens"},"ways":{"black":["#26262e","#404559","#fae059"],"orange":["#fa8c33","#404559","#f7f7f7"],"green":["#4c9e66","#26262e","#9ed14c"]},"keepsHair":true,"deathLift":[-3.22,-3.11,-2.72,-2.63,-2.66,-2.76,-2.91,-3.08,-3.17,-3.11,-3.01,-2.9,-2.79,-2.69,-2.6,-2.53,-2.49,-2.49,-2.53,-2.61,-2.58,-2.54,-2.55,-2.7,-2.89,-2.76,-2.9,-3.08,-3.18,-3.27,-3.16,-2.75,-1.76,-0.41,0.25,0.03,-0.21,-0.36,-0.2,0.16,0.34,0.18,0.14,0.28,0.32,0.33,0.33,0.34,0.34,0.35,0.35,0.35,0.35,0.35,0.35,0.35,0.35,0.35,0.35,0.35,0.35,0.35,0.35,0.35,0.35,0.35,0.35],"file":"hat-headlamp.glb"},"beanie":{"channels":{"main":"Hat","trim":"Cuff","accent":"Pompom"},"ways":{"red":["#eb4040","#eb4040","#f7f7f7"],"mustard":["#fab826","#fab826","#faf2e0"],"navy":["#333861","#66bff2","#f7f7f7"],"pink":["#ff66a6","#f2738c","#bf8cf2"],"black":["#26262e","#26262e","#404559"]},"deathLift":[-3.23,-3.01,-2.62,-2.52,-2.56,-2.66,-2.81,-2.98,-3.07,-3.01,-2.91,-2.8,-2.69,-2.59,-2.5,-2.43,-2.39,-2.39,-2.43,-2.5,-2.48,-2.44,-2.45,-2.6,-2.78,-2.66,-2.8,-2.98,-3.08,-3.16,-3.05,-2.64,-1.66,-0.31,0.4,0.14,-0.1,-0.24,-0.08,0.28,0.46,0.3,0.27,0.41,0.45,0.46,0.46,0.47,0.47,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48],"file":"hat-beanie.glb"},"fedora":{"channels":{"main":"Hat","trim":"Band"},"ways":{"grey":["#8c99b2","#26262e"],"brown":["#8c613d","#26262e"],"black":["#404559","#eb4040"],"tan":["#d9b280","#8c613d"]},"deathLift":[-3.11,-3.07,-2.68,-2.6,-2.64,-2.75,-2.89,-3.05,-3.09,-3.02,-2.97,-2.88,-2.78,-2.68,-2.6,-2.53,-2.49,-2.49,-2.51,-2.56,-2.55,-2.53,-2.55,-2.69,-2.67,-2.51,-2.67,-3.06,-3.15,-3.23,-3.11,-2.67,-1.45,0.1,0.7,0.56,0.35,0.21,0.39,0.77,0.93,0.79,0.77,0.92,0.96,0.96,0.97,0.98,0.98,0.99,0.99,0.99,0.99,0.99,0.99,0.99,0.99,0.99,0.99,0.99,0.99,0.99,0.99,0.99,0.99,0.99,0.99],"file":"hat-fedora.glb"},"peaked-cap":{"channels":{"main":"Cap","trim":"Peak and band","accent":"Badge"},"ways":{"police":["#333861","#26262e","#fab826"],"pilot":["#f7f7f7","#26262e","#fab826"],"captain":["#f7f7f7","#333861","#fab826"]},"deathLift":[-3.02,-3.04,-2.64,-2.56,-2.59,-2.71,-2.86,-2.98,-2.96,-2.9,-2.88,-2.84,-2.74,-2.64,-2.55,-2.48,-2.45,-2.44,-2.46,-2.52,-2.51,-2.48,-2.5,-2.65,-2.67,-2.53,-2.65,-2.94,-3.08,-3.16,-3.07,-2.64,-1.64,-0.35,0.55,0.19,-0.15,-0.28,-0.12,0.27,0.54,0.28,0.21,0.4,0.45,0.45,0.46,0.47,0.47,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48],"file":"hat-peaked-cap.glb"},"tactical-helmet":{"channels":{"main":"Helmet","trim":"Rim","accent":"Mount"},"ways":{"black":["#26262e","#404559","#404559"],"navy":["#333861","#26262e","#26262e"],"olive":["#6b754c","#4c5438","#26262e"],"tan":["#d9b280","#8c613d","#26262e"]},"deathLift":[-2.73,-2.63,-2.43,-2.35,-2.34,-2.37,-2.45,-2.55,-2.61,-2.53,-2.44,-2.37,-2.3,-2.24,-2.2,-2.18,-2.18,-2.21,-2.28,-2.33,-2.33,-2.27,-2.22,-2.24,-2.27,-2.25,-2.36,-2.52,-2.65,-2.74,-2.74,-2.45,-1.47,-0.27,0.37,0.11,-0.06,-0.16,-0.02,0.27,0.42,0.3,0.28,0.41,0.44,0.45,0.45,0.46,0.46,0.47,0.47,0.47,0.47,0.47,0.47,0.47,0.47,0.47,0.47,0.47,0.47,0.47,0.47,0.47,0.47,0.47,0.47],"file":"hat-tactical-helmet.glb"},"none":{"channels":{},"ways":{"-":["#ffffff"]}}},"ears":{"none":{"channels":{},"ways":{"-":["#ffffff"]}}},"horns":{"none":{"channels":{},"ways":{"-":["#ffffff"]}}},"eyewear":{"domino-mask":{"channels":{"main":"Mask"},"ways":{"black":["#26262e"],"red":["#eb4040"],"purple":["#8047bf"]},"file":"eyewear-domino-mask.glb"},"night-vision":{"channels":{"main":"Goggles","trim":"Strap","accent":"Lenses"},"ways":{"black":["#404559","#26262e","#9ed14c"],"olive":["#66734c","#26262e","#9ed14c"]},"deathLift":[-2.65,-2.69,-2.34,-2.25,-2.27,-2.37,-2.5,-2.61,-2.59,-2.53,-2.51,-2.48,-2.39,-2.3,-2.22,-2.16,-2.12,-2.13,-2.17,-2.24,-2.21,-2.17,-2.17,-2.3,-2.31,-2.17,-2.28,-2.57,-2.71,-2.8,-2.74,-2.4,-1.61,-0.56,-0.05,-0.22,-0.39,-0.49,-0.36,-0.1,0.05,-0.07,-0.09,0.02,0.05,0.06,0.06,0.07,0.07,0.08,0.08,0.08,0.08,0.08,0.08,0.08,0.08,0.08,0.08,0.08,0.08,0.08,0.08,0.08,0.08,0.08,0.08],"file":"eyewear-night-vision.glb"},"sunglasses":{"channels":{"main":"Frames","trim":"Lenses"},"ways":{"black":["#26262e","#404559"],"gold":["#fab826","#4c3326"],"white":["#f7f7f7","#333861"]},"file":"eyewear-sunglasses.glb"},"none":{"channels":{},"ways":{"-":["#ffffff"]}}},"markings":{"mask":{"channels":{"main":"Mask"},"ways":{"raccoon":["#404559"],"panda":["#26262e"],"hero":["#eb4040"]},"file":"markings-mask.glb"},"none":{"channels":{},"ways":{"-":["#ffffff"]}}},"muzzle":{"none":{"channels":{},"ways":{"-":["#ffffff"]}}},"mouth":{"face-mask":{"channels":{"main":"Mask","trim":"Pleats and loops"},"ways":{"white":["#f7f7f7","#66bff2"],"black":["#26262e","#404559"],"blue":["#66bff2","#f7f7f7"]},"file":"mouth-face-mask.glb"},"gaiter":{"channels":{"main":"Gaiter","trim":"Edge"},"ways":{"black":["#26262e","#404559"],"camo":["#6b7a4c","#8c613d"],"red":["#eb4040","#26262e"]},"deathLift":[-1.34,-1.28,-1.14,-1.06,-1.07,-1.15,-1.16,-1.16,-1.17,-1.18,-1.18,-1.19,-1.18,-1.11,-1.04,-0.98,-0.95,-0.95,-0.98,-1.05,-1.02,-0.99,-0.99,-1.09,-1.16,-1.14,-1.19,-1.27,-1.32,-1.36,-1.34,-1.24,-0.74,-0.29,-0.06,-0.1,-0.12,-0.08,-0.01,0.08,0.17,0.11,0.15,0.21,0.24,0.24,0.25,0.25,0.26,0.27,0.27,0.27,0.27,0.27,0.27,0.27,0.27,0.27,0.27,0.27,0.27,0.27,0.27,0.27,0.27,0.27,0.27],"file":"mouth-gaiter.glb"},"none":{"channels":{},"ways":{"-":["#ffffff"]}}},"neck":{"none":{"channels":{},"ways":{"-":["#ffffff"]}}},"top":{"turtleneck":{"channels":{"main":"Top"},"ways":{"black":["#26262e"],"charcoal":["#404559"],"navy":["#333861"],"cream":["#faf2e0"]},"file":"top-turtleneck.glb"},"trench-coat":{"channels":{"main":"Coat","trim":"Belt","accent":"Buttons and buckle"},"ways":{"black":["#26262e","#404559","#d1d6e0"],"tan":["#d9b280","#8c613d","#fab826"],"grey":["#8c99b2","#404559","#fab826"]},"outer":true,"deathLift":[-0.37,-0.32,-0.23,-0.2,-0.19,-0.19,-0.19,-0.19,-0.2,-0.21,-0.22,-0.24,-0.26,-0.26,-0.22,-0.19,-0.16,-0.14,-0.14,-0.15,-0.17,-0.19,-0.21,-0.21,-0.21,-0.2,-0.23,-0.31,-0.35,-0.4,-0.42,-0.43,-0.53,-0.75,-0.99,-0.86,-0.76,-0.7,-0.73,-0.81,-0.84,-0.78,-0.75,-0.76,-0.75,-0.75,-0.74,-0.74,-0.73,-0.72,-0.72,-0.72,-0.72,-0.72,-0.72,-0.72,-0.72,-0.72,-0.72,-0.72,-0.72,-0.72,-0.72,-0.72,-0.72,-0.72,-0.72],"file":"top-trench-coat.glb"},"guard-uniform":{"channels":{"main":"Shirt","trim":"Belt and tabs","accent":"Badge"},"ways":{"navy":["#333861","#26262e","#fab826"],"grey":["#8c99b2","#404559","#fab826"],"sky":["#66bff2","#333861","#d1d6e0"]},"file":"top-guard-uniform.glb"},"stripy":{"channels":{"main":"Top","trim":"Stripes"},"ways":{"sailor":["#faf2e0","#f25959"],"navy":["#333861","#f7f7f7"],"bee":["#ffd126","#26262e"],"mint":["#8cd9b8","#bf8cf2"],"burglar":["#f7f7f7","#26262e"]},"file":"top-stripy.glb"},"tactical-vest":{"channels":{"main":"Vest","trim":"Pouches and straps","accent":"Shirt"},"ways":{"black":["#26262e","#404559","#404559"],"navy":["#333861","#26262e","#404559"],"olive":["#6b754c","#4c5438","#596147"],"tan":["#d9b280","#8c613d","#99805c"]},"outer":true,"file":"top-tactical-vest.glb"},"none":{"channels":{},"ways":{"-":["#ffffff"]}}},"bottom":{"pants":{"channels":{"main":"Trousers","trim":"Turn-ups"},"ways":{"charcoal":["#404559","#404559"],"khaki":["#d9b280","#d9b280"],"brown":["#665240","#665240"],"grey":["#8c99b2","#8c99b2"],"yellow":["#ffd126","#ffd126"],"red":["#eb4040","#eb4040"]},"deathLift":[-0.23,-0.22,-0.19,-0.18,-0.18,-0.18,-0.19,-0.19,-0.2,-0.2,-0.21,-0.21,-0.21,-0.21,-0.2,-0.19,-0.18,-0.17,-0.17,-0.17,-0.17,-0.18,-0.18,-0.18,-0.17,-0.17,-0.19,-0.23,-0.26,-0.29,-0.32,-0.39,-0.56,-0.83,-1.05,-0.93,-0.84,-0.79,-0.81,-0.88,-0.92,-0.85,-0.83,-0.85,-0.85,-0.84,-0.84,-0.83,-0.83,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82],"file":"bottom-pants.glb"},"jeans":{"channels":{"main":"Denim","trim":"Rips","accent":"Pockets and belt"},"ways":{"light":["#7399d9","#f2ebd9","#6185c7"],"dark":["#333861","#66bff2","#8c613d"],"black":["#26262e","#8c99b2","#404559"]},"file":"bottom-jeans.glb"},"leggings":{"channels":{"main":"Leggings","trim":"Stripe"},"ways":{"black":["#26262e","#ff66a6"],"navy":["#333861","#f7f7f7"],"purple":["#8047bf","#9ed14c"],"pink":["#ff66a6","#f7f7f7"]},"deathLift":[-0.2,-0.19,-0.17,-0.16,-0.16,-0.16,-0.16,-0.17,-0.17,-0.18,-0.18,-0.18,-0.19,-0.18,-0.18,-0.17,-0.16,-0.15,-0.15,-0.15,-0.15,-0.15,-0.16,-0.15,-0.15,-0.15,-0.17,-0.2,-0.24,-0.26,-0.3,-0.37,-0.56,-0.83,-1.05,-0.93,-0.84,-0.79,-0.81,-0.88,-0.92,-0.85,-0.83,-0.85,-0.85,-0.84,-0.84,-0.83,-0.83,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82],"file":"bottom-leggings.glb"},"track-pants":{"channels":{"main":"Pants","trim":"Stripe"},"ways":{"navy":["#333861","#f7f7f7"],"red":["#eb4040","#f7f7f7"],"black":["#26262e","#9ed14c"],"teal":["#33b2b2","#f7f7f7"]},"deathLift":[-0.21,-0.2,-0.18,-0.16,-0.16,-0.17,-0.17,-0.18,-0.18,-0.19,-0.19,-0.19,-0.19,-0.19,-0.18,-0.18,-0.17,-0.16,-0.16,-0.16,-0.16,-0.16,-0.16,-0.16,-0.15,-0.15,-0.17,-0.21,-0.24,-0.27,-0.3,-0.37,-0.55,-0.83,-1.05,-0.93,-0.84,-0.79,-0.81,-0.88,-0.92,-0.85,-0.83,-0.85,-0.85,-0.84,-0.84,-0.83,-0.83,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82],"file":"bottom-track-pants.glb"},"cargo-shorts":{"channels":{"main":"Shorts","trim":"Pockets","accent":"Belt"},"ways":{"olive":["#73804c","#616b40","#26262e"],"khaki":["#d9b280","#b29466","#8c613d"],"grey":["#8c99b2","#404559","#26262e"]},"file":"bottom-cargo-shorts.glb"},"cargo-pants":{"channels":{"main":"Pants","trim":"Pockets"},"ways":{"black":["#26262e","#404559"],"olive":["#6b754c","#4c5438"],"tan":["#d9b280","#8c613d"]},"file":"bottom-cargo-pants.glb"},"none":{"channels":{},"ways":{"-":["#ffffff"]}}},"shoes":{"bare-feet":{"channels":{},"ways":{"-":["#ffffff"]},"deathLift":[-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.01,0.01,0.02,-0.01,-0.05,-0.07,-0.09,-0.13,-0.23,-0.44,-0.88,-1.24,-1.1,-1,-0.97,-1.01,-1.12,-1.17,-1.1,-1.09,-1.13,-1.14,-1.13,-1.12,-1.12,-1.11,-1.11,-1.11,-1.11,-1.11,-1.11,-1.11,-1.11,-1.11,-1.11,-1.11,-1.11,-1.11,-1.11,-1.11,-1.11,-1.11,-1.11,-1.11],"file":"shoes-bare-feet.glb"},"sneakers":{"channels":{"main":"Shoe","trim":"Laces and sole","accent":"Flash"},"ways":{"white":["#f7f7f7","#e63333","#f7f7f7"],"black":["#26262e","#f7f7f7","#f7f7f7"],"blue":["#4c99f2","#f7f7f7","#f7f7f7"],"red":["#eb4040","#f7f7f7","#ffd126"]},"deathLift":[0.01,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.02,0.04,0.06,0.03,-0.02,-0.05,-0.06,-0.09,-0.17,-0.37,-0.82,-1.21,-1.06,-0.96,-0.92,-0.97,-1.09,-1.14,-1.06,-1.05,-1.1,-1.11,-1.1,-1.1,-1.09,-1.08,-1.08,-1.08,-1.08,-1.08,-1.08,-1.08,-1.08,-1.08,-1.08,-1.08,-1.08,-1.08,-1.08,-1.08,-1.08,-1.08,-1.08,-1.08],"file":"shoes-sneakers.glb"},"boots":{"channels":{"main":"Boot","trim":"Sole","accent":"Laces"},"ways":{"brown":["#8c613d","#404559","#d9b280"],"black":["#26262e","#404559","#eb4040"],"tan":["#d9b280","#8c613d","#eb4040"]},"deathLift":[0.02,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.03,0.05,0.06,0.03,-0.02,-0.04,-0.05,-0.08,-0.16,-0.37,-0.81,-1.21,-1.06,-0.95,-0.92,-0.96,-1.08,-1.14,-1.06,-1.05,-1.09,-1.1,-1.09,-1.08,-1.08,-1.07,-1.06,-1.06,-1.06,-1.06,-1.06,-1.06,-1.06,-1.06,-1.06,-1.06,-1.06,-1.06,-1.06,-1.06,-1.06,-1.06,-1.06,-1.06],"file":"shoes-boots.glb"},"classic":{"channels":{"main":"Shoe","trim":"Strap"},"ways":{"red":["#d9334c","#d9334c"],"yellow":["#fad94c","#fad94c"],"brown":["#73401f","#73401f"],"gold":["#f2bf40","#f2bf40"],"black":["#26262e","#26262e"]},"deathLift":[-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,0,0.02,0.03,0,-0.05,-0.07,-0.09,-0.12,-0.21,-0.42,-0.85,-1.22,-1.08,-0.98,-0.95,-0.99,-1.1,-1.15,-1.08,-1.06,-1.1,-1.11,-1.11,-1.1,-1.09,-1.09,-1.08,-1.08,-1.08,-1.08,-1.08,-1.08,-1.08,-1.08,-1.08,-1.08,-1.08,-1.08,-1.08,-1.08,-1.08,-1.08,-1.08,-1.08],"file":"shoes-classic.glb"}},"hands":{"gloves":{"channels":{"main":"Gloves","trim":"Cuffs"},"ways":{"red":["#eb4040","#f7f7f7"],"white":["#f7f7f7","#f7f7f7"],"black":["#26262e","#404559"],"yellow":["#ffd126","#fa8c33"]},"file":"hands-gloves.glb"},"none":{"channels":{},"ways":{"-":["#ffffff"]}}},"back":{"backpack":{"channels":{"main":"Pack","trim":"Pocket","accent":"Straps"},"ways":{"red":["#e64c4c","#ffd94c","#e64c4c"],"blue":["#4773cc","#ffd126","#4773cc"],"green":["#4c9e66","#fa8c33","#4c9e66"]},"deathLift":[-0.67,-0.59,-0.48,-0.44,-0.46,-0.46,-0.47,-0.47,-0.47,-0.48,-0.48,-0.48,-0.49,-0.48,-0.46,-0.44,-0.43,-0.42,-0.43,-0.45,-0.48,-0.51,-0.54,-0.57,-0.61,-0.62,-0.62,-0.61,-0.64,-0.67,-0.64,-0.55,-0.47,-0.48,-0.63,-0.49,-0.37,-0.28,-0.28,-0.34,-0.38,-0.3,-0.25,-0.26,-0.26,-0.25,-0.25,-0.24,-0.24,-0.23,-0.23,-0.23,-0.23,-0.23,-0.23,-0.23,-0.23,-0.23,-0.23,-0.23,-0.23,-0.23,-0.23,-0.23,-0.23,-0.23,-0.23],"file":"back-backpack.glb"},"none":{"channels":{},"ways":{"-":["#ffffff"]}}},"tail":{"none":{"channels":{},"ways":{"-":["#ffffff"]}}},"prop":{"crowbar":{"channels":{"main":"Bar"},"ways":{"red":["#eb4040"],"steel":["#b8bdc7"],"black":["#404559"]},"file":"prop-crowbar.glb"},"money-bag":{"channels":{"main":"Bag","trim":"Tie and sign"},"ways":{"burlap":["#c7a36b","#4c9e66"],"green":["#669e59","#f7f7f7"]},"deathLift":[0.19,0.12,-0.05,-0.06,-0.06,-0.07,-0.1,-0.13,-0.15,-0.16,-0.15,-0.13,-0.09,-0.03,0.04,0.12,0.19,0.25,0.29,0.31,0.31,0.3,0.28,0.26,0.23,0.2,0.14,0.08,0.08,0.09,0.06,-0.05,-0.3,-0.95,-1.32,-1.25,-1.19,-1.13,-1.11,-1.15,-1.19,-1.16,-1.15,-1.17,-1.17,-1.16,-1.15,-1.15,-1.14,-1.13,-1.13,-1.14,-1.14,-1.14,-1.14,-1.14,-1.14,-1.14,-1.14,-1.14,-1.14,-1.14,-1.14,-1.14,-1.14,-1.14,-1.14],"file":"prop-money-bag.glb"},"gold-bar":{"channels":{"main":"Gold"},"ways":{"gold":["#fab826"],"silver":["#d1d6e0"]},"file":"prop-gold-bar.glb"},"diamond":{"channels":{"main":"Stone"},"ways":{"ice":["#b2ebff"],"pink":["#ff66a6"],"ruby":["#eb4040"]},"file":"prop-diamond.glb"},"flashlight":{"channels":{"main":"Body","trim":"Head"},"ways":{"red":["#eb4040","#404559"],"yellow":["#ffd126","#26262e"],"blue":["#4773cc","#8c99b2"]},"file":"prop-flashlight.glb"},"sack":{"channels":{"main":"Sack","trim":"Tie","accent":"Sticker"},"ways":{"burlap":["#c7a36b","#8c613d","#fa8c33"],"white":["#f7f7f7","#fa8c33","#8047bf"],"striped":["#66bff2","#eb4040","#ffd126"],"black":["#404559","#fa8c33","#9ed14c"]},"deathLift":[0.02,-0.04,-0.2,-0.21,-0.21,-0.23,-0.26,-0.28,-0.31,-0.32,-0.31,-0.28,-0.24,-0.19,-0.12,-0.04,0.03,0.09,0.12,0.14,0.14,0.13,0.11,0.09,0.06,0.03,-0.02,-0.09,-0.09,-0.08,-0.11,-0.21,-0.42,-0.98,-1.3,-1.26,-1.21,-1.15,-1.12,-1.16,-1.19,-1.15,-1.14,-1.15,-1.15,-1.14,-1.13,-1.13,-1.12,-1.12,-1.12,-1.12,-1.12,-1.12,-1.12,-1.12,-1.12,-1.12,-1.12,-1.12,-1.12,-1.12,-1.12,-1.12,-1.12,-1.12,-1.12],"file":"prop-sack.glb"},"none":{"channels":{},"ways":{"-":["#ffffff"]}}},"offhand":{"riot-shield":{"channels":{"main":"Shield","trim":"Window and strap"},"ways":{"black":["#404559","#66bff2"],"clear":["#bfd1e0","#333861"]},"deathLift":[-0.13,-0.23,-0.42,-0.41,-0.37,-0.25,-0.17,-0.12,-0.1,-0.13,-0.19,-0.25,-0.28,-0.29,-0.29,-0.29,-0.28,-0.27,-0.27,-0.26,-0.26,-0.24,-0.22,-0.18,-0.13,-0.09,-0.09,-0.15,-0.18,-0.2,-0.27,-0.42,-0.74,-1.37,-1.56,-1.51,-1.5,-1.45,-1.42,-1.47,-1.5,-1.49,-1.49,-1.48,-1.48,-1.47,-1.46,-1.45,-1.45,-1.44,-1.44,-1.44,-1.44,-1.44,-1.44,-1.44,-1.44,-1.44,-1.44,-1.44,-1.44,-1.44,-1.44,-1.44,-1.44,-1.44,-1.44],"file":"offhand-riot-shield.glb"},"none":{"channels":{},"ways":{"-":["#ffffff"]}}},"ride":{"none":{"channels":{},"ways":{"-":["#ffffff"]}}}},"looks":{"cat-burglar":{"skin":0,"hair":{"item":"crop","way":"black"},"hat":{"item":"ski-mask","way":"black"},"ears":{"item":"none"},"horns":{"item":"none"},"eyewear":{"item":"none"},"markings":{"item":"none"},"muzzle":{"item":"none"},"mouth":{"item":"none"},"neck":{"item":"none"},"top":{"item":"turtleneck","way":"black"},"bottom":{"item":"pants","way":"charcoal"},"shoes":{"item":"sneakers","way":"black"},"hands":{"item":"gloves","way":"black"},"back":{"item":"backpack","way":"red"},"tail":{"item":"none"},"prop":{"item":"sack","way":"burlap"},"offhand":{"item":"none"},"ride":{"item":"none"}},"striped-robber":{"skin":1,"hair":{"item":"long","way":"black"},"hat":{"item":"beanie","way":"black"},"ears":{"item":"none"},"horns":{"item":"none"},"eyewear":{"item":"domino-mask","way":"black"},"markings":{"item":"none"},"muzzle":{"item":"none"},"mouth":{"item":"none"},"neck":{"item":"none"},"top":{"item":"stripy","way":"burglar"},"bottom":{"item":"pants","way":"charcoal"},"shoes":{"item":"sneakers","way":"black"},"hands":{"item":"none"},"back":{"item":"none"},"tail":{"item":"none"},"prop":{"item":"money-bag","way":"burlap"},"offhand":{"item":"none"},"ride":{"item":"none"}},"night-crawler":{"skin":2,"hair":{"item":"braids","way":"black"},"hat":{"item":"none"},"ears":{"item":"none"},"horns":{"item":"none"},"eyewear":{"item":"night-vision","way":"black"},"markings":{"item":"none"},"muzzle":{"item":"none"},"mouth":{"item":"gaiter","way":"black"},"neck":{"item":"none"},"top":{"item":"turtleneck","way":"black"},"bottom":{"item":"cargo-pants","way":"black"},"shoes":{"item":"boots","way":"black"},"hands":{"item":"gloves","way":"black"},"back":{"item":"none"},"tail":{"item":"none"},"prop":{"item":"diamond","way":"ice"},"offhand":{"item":"none"},"ride":{"item":"none"}},"mastermind":{"skin":3,"hair":{"item":"ponytail","way":"black"},"hat":{"item":"fedora","way":"black"},"ears":{"item":"none"},"horns":{"item":"none"},"eyewear":{"item":"sunglasses","way":"black"},"markings":{"item":"none"},"muzzle":{"item":"none"},"mouth":{"item":"none"},"neck":{"item":"none"},"top":{"item":"trench-coat","way":"black"},"bottom":{"item":"pants","way":"charcoal"},"shoes":{"item":"classic","way":"black"},"hands":{"item":"none"},"back":{"item":"none"},"tail":{"item":"none"},"prop":{"item":"gold-bar","way":"gold"},"offhand":{"item":"none"},"ride":{"item":"none"}},"security-guard":{"skin":4,"hair":{"item":"buzz","way":"black"},"hat":{"item":"peaked-cap","way":"police"},"ears":{"item":"none"},"horns":{"item":"none"},"eyewear":{"item":"none"},"markings":{"item":"none"},"muzzle":{"item":"none"},"mouth":{"item":"none"},"neck":{"item":"none"},"top":{"item":"guard-uniform","way":"navy"},"bottom":{"item":"pants","way":"charcoal"},"shoes":{"item":"boots","way":"black"},"hands":{"item":"none"},"back":{"item":"none"},"tail":{"item":"none"},"prop":{"item":"flashlight","way":"red"},"offhand":{"item":"none"},"ride":{"item":"none"}},"swat":{"skin":5,"hair":{"item":"afro","way":"black"},"hat":{"item":"tactical-helmet","way":"black"},"ears":{"item":"none"},"horns":{"item":"none"},"eyewear":{"item":"none"},"markings":{"item":"none"},"muzzle":{"item":"none"},"mouth":{"item":"gaiter","way":"black"},"neck":{"item":"none"},"top":{"item":"tactical-vest","way":"black"},"bottom":{"item":"cargo-pants","way":"black"},"shoes":{"item":"boots","way":"black"},"hands":{"item":"gloves","way":"black"},"back":{"item":"none"},"tail":{"item":"none"},"prop":{"item":"none"},"offhand":{"item":"riot-shield","way":"black"},"ride":{"item":"none"}},"commando":{"skin":0,"hair":{"item":"crop","way":"black"},"hat":{"item":"tactical-helmet","way":"olive"},"ears":{"item":"none"},"horns":{"item":"none"},"eyewear":{"item":"none"},"markings":{"item":"none"},"muzzle":{"item":"none"},"mouth":{"item":"gaiter","way":"camo"},"neck":{"item":"none"},"top":{"item":"tactical-vest","way":"olive"},"bottom":{"item":"cargo-pants","way":"olive"},"shoes":{"item":"boots","way":"brown"},"hands":{"item":"gloves","way":"black"},"back":{"item":"none"},"tail":{"item":"none"},"prop":{"item":"none"},"offhand":{"item":"none"},"ride":{"item":"none"}},"safecracker":{"skin":1,"hair":{"item":"long","way":"black"},"hat":{"item":"headlamp","way":"black"},"ears":{"item":"none"},"horns":{"item":"none"},"eyewear":{"item":"none"},"markings":{"item":"none"},"muzzle":{"item":"none"},"mouth":{"item":"face-mask","way":"black"},"neck":{"item":"none"},"top":{"item":"turtleneck","way":"charcoal"},"bottom":{"item":"cargo-pants","way":"black"},"shoes":{"item":"sneakers","way":"black"},"hands":{"item":"none"},"back":{"item":"none"},"tail":{"item":"none"},"prop":{"item":"crowbar","way":"red"},"offhand":{"item":"none"},"ride":{"item":"none"}}},"skinTones":["#fcdbbd","#f2c79e","#e0a87a","#bd8052","#8f5936","#613b24"],"suggest":{"cloth":{"red":"#eb4040","tomato":"#f26b4c","orange":"#fa8c33","gold":"#fab826","yellow":"#ffd126","butter":"#fae059","lime":"#9ed14c","green":"#4c9e66","mint":"#8cd9b8","teal":"#33b2b2","sky":"#66bff2","blue":"#4773cc","navy":"#333861","purple":"#8047bf","lilac":"#bf8cf2","pink":"#ff66a6","rose":"#f2738c","brown":"#8c613d","tan":"#d9b280","cream":"#faf2e0","white":"#f7f7f7","grey":"#8c99b2","charcoal":"#404559","black":"#26262e"},"hair":{"black":"#1a1412","dark":"#402617","brown":"#7a4c29","chestnut":"#6b331a","ginger":"#e66b24","copper":"#cc541f","blonde":"#facc5c","platinum":"#f5f0d6","pink":"#ff73b2","blue":"#384c9e"},"skin":{"orc":"#8cb861","goblin":"#adc759","sea":"#73b8cc","blue":"#7394e6","fairy":"#c7adf2","imp":"#e66b61","alien":"#9ea8b2","ghoul":"#d1dbcc"}},"clips":["idle","walk","run","jump","pick-up","celebrate","scared","attack","trick-or-treat","wave","hit","sad","sneak","spin","idle-peek","idle-yawn","idle-look","dance-wiggle","dance-robot","run-jump","eat-candy","death","aim","run-aim","shoot","ready","slash","smash","fly","lift-off","snowboard","ski","sled"],"oneShots":["death","lift-off"],"deathLiftStep":0.03333333333333333,"baseDeathLift":[-0.22,-0.21,-0.18,-0.17,-0.17,-0.18,-0.18,-0.18,-0.19,-0.2,-0.2,-0.2,-0.2,-0.2,-0.19,-0.18,-0.17,-0.17,-0.16,-0.16,-0.17,-0.17,-0.17,-0.17,-0.17,-0.16,-0.19,-0.22,-0.25,-0.28,-0.32,-0.39,-0.57,-0.59,0,-0.31,-0.44,-0.46,-0.37,-0.23,-0.03,-0.2,-0.19,-0.12,-0.1,-0.09,-0.09,-0.08,-0.08,-0.07,-0.07,-0.07,-0.07,-0.07,-0.07,-0.07,-0.07,-0.07,-0.07,-0.07,-0.07,-0.07,-0.07,-0.07,-0.07,-0.07,-0.07]};

/** One catalog from several (Kit Kids packs share one rig and one set of file names): put their GLBs in one folder
 *  and pass loadKidKit(base, { catalog: mergeCatalogs(a, b, ...) }). */
export function mergeCatalogs(...cats) {
  const out = structuredClone(cats[0]);
  for (const c of cats.slice(1)) {
    for (const [slot, items] of Object.entries(c.items)) out.items[slot] = { ...(out.items[slot] ?? {}), ...items };
    out.looks = { ...out.looks, ...c.looks };
  }
  return out;
}

export async function loadKidKit(base, { loader = new GLTFLoader(), catalog = CATALOG } = {}) {
  if (!base.endsWith('/')) base += '/';
  catalog ??= await (await fetch(base + 'kit.json')).json();
  const slots = catalog.slots;
  const files = new Map();  // file -> Promise<geometry with kitChan, in the base skeleton's bone order>
  const baseGltf = await loader.loadAsync(base + 'base.glb');
  const baseMesh = findSkinned(baseGltf.scene);
  const boneNames = baseMesh.skeleton.bones.map(b => b.name);
  const baseGeo = prepare(baseMesh, -1);
  const clips = Object.fromEntries(baseGltf.animations.map(a => [a.name, a]));

  // a piece's geometry: positions, normals, colours, skinning, and kitChan, the palette slot each
  // vertex reads (0: its own fixed colour, 1: skin, 2 + 4 * slot + channel: the item's channels)
  function prepare(mesh, slotIndex) {
    // the working copies carry normals and the paint channel in TEXCOORD_0.x; the slimmed shipping
    // copies (scripts/compress.mjs) carry no normals (they draw flat) and the channel in the colour's
    // alpha, as code / 8
    const src = mesh.geometry;
    const g = new THREE.BufferGeometry();
    g.setIndex(src.index ? src.index.clone() : null);
    g.setAttribute('position', src.attributes.position.clone());
    if (src.attributes.normal) g.setAttribute('normal', src.attributes.normal.clone());
    const n = src.attributes.position.count;
    const col = new Float32Array(n * 3), chan = new Float32Array(n);
    const c = src.attributes.color, uv = src.attributes.uv;
    for (let i = 0; i < n; i++) {
      col[i * 3] = c.getX(i); col[i * 3 + 1] = c.getY(i); col[i * 3 + 2] = c.getZ(i);
      const code = Math.round(uv ? uv.getX(i) : c.getW(i) * 8);
      chan[i] = code <= 1 ? code : 2 + slotIndex * 4 + (code - 2);
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    g.setAttribute('kitChan', new THREE.BufferAttribute(chan, 1));
    // joints: the piece's own bone order -> the base skeleton's
    const own = mesh.skeleton.bones.map(b => boneNames.indexOf(b.name));
    const si = src.attributes.skinIndex, idx = new Uint16Array(n * 4);
    for (let i = 0; i < n * 4; i++) idx[i] = own[si.array[i]];
    g.setAttribute('skinIndex', new THREE.BufferAttribute(idx, 4));
    const sw = src.attributes.skinWeight, wt = new Float32Array(n * 4);
    for (let i = 0; i < n; i++) for (let k = 0; k < 4; k++) wt[i * 4 + k] = sw.getComponent(i, k);
    g.setAttribute('skinWeight', new THREE.BufferAttribute(wt, 4));
    return g;
  }

  function piece(file, slot) {
    if (!files.has(file)) {
      files.set(file, loader.loadAsync(base + file).then(gl => prepare(findSkinned(gl.scene), slots.indexOf(slot))));
    }
    return files.get(file);
  }

  function colours(slot, item, spec) {
    const it = catalog.items[slot][item];
    const ways = it.ways, first = Object.keys(ways)[0];
    let cs = spec?.colours ?? ways[spec?.way ?? first] ?? ways[first];
    cs = cs.length ? cs : ['#ffffff'];
    return CH.map((_, i) => cs[Math.min(i, cs.length - 1)]);
  }

  function normalise(look) {
    const out = { skin: look.skin ?? 1 };
    for (const slot of slots) {
      const fallback = 'none' in catalog.items[slot] ? 'none' : Object.keys(catalog.items[slot])[0];
      const s = typeof look[slot] === 'string' ? { item: look[slot] } : (look[slot] ?? { item: fallback });
      out[slot] = { item: s.item, colours: colours(slot, s.item, s) };
    }
    // a ride (snowboard, sled) can't be worn with what it conflicts with (skis, ski poles): those go
    const clash = catalog.items.ride?.[out.ride?.item]?.conflicts ?? {};
    for (const [slot, items] of Object.entries(clash)) {
      if (!items.includes(out[slot]?.item)) continue;
      const item = 'none' in catalog.items[slot] ? 'none' : slot === 'shoes' && catalog.items.shoes['snow-boots'] ? 'snow-boots' : Object.keys(catalog.items[slot])[0];
      out[slot] = { item, colours: colours(slot, item, {}) };
    }
    return out;
  }

  function randomLook(rng = Math.random) {
    const pick = a => a[Math.floor(rng() * a.length)];
    const look = { skin: Math.floor(rng() * catalog.skinTones.length) };
    for (const slot of slots) {
      const names = Object.keys(catalog.items[slot]);
      const pool = QUIET[slot] === 0 ? names.filter((n) => n !== 'none') : names;  // no random kid goes without a top or bottoms
      const item = rng() < (QUIET[slot] ?? 0) ? 'none' : pick(pool);
      look[slot] = { item, way: pick(Object.keys(catalog.items[slot][item].ways)) };
    }
    return look;  // makeKid drops anything the ride conflicts with
  }

  async function makeKid(look) {
    const kid = new Kid(normalise(look));
    await kid._build();
    return kid;
  }

  class Kid {
    constructor(look) {
      this.look = look;
      this.object = SkeletonUtils.clone(baseGltf.scene);
      const holder = findSkinned(this.object);
      this.skeleton = holder.skeleton;
      this.mesh = null;
      this._holder = holder;
      holder.visible = false;  // the base's own mesh is replaced by the merged kid
      this.palette = Array.from({ length: 2 + slots.length * 4 }, () => new THREE.Color());
      this.material = kidMaterial(this.palette);
      this.mixer = new THREE.AnimationMixer(this.object);
      this.action = null;
      this._applyColours();
    }

    async _build() {
      const look = this.look, items = catalog.items;
      const jobs = [], lifts = [];
      const hat = items.hat[look.hat.item], top = items.top[look.top.item];
      for (const slot of slots) {
        const it = items[slot][look[slot].item];
        if (slot === 'bottom' && top.full) continue;
        const file = slot !== 'hair' || !hat.file ? it.file
          : hat.hidesHair ? null : hat.hairAs ? items.hair[hat.hairAs].file : hat.keepsHair ? it.file : it.hatFile;
        if (file) jobs.push(piece(file, slot));
        const lift = slot !== 'hair' || !hat.file ? it.deathLift
          : hat.hidesHair ? null : hat.hairAs ? items.hair[hat.hairAs].deathLift : hat.keepsHair ? it.deathLift : it.hatDeathLift;
        if (file && lift) lifts.push(lift);
        if (it.bib && !top.outer) jobs.push(piece(it.bib, slot));
      }
      // lying down (death): every moment, the kid moves so its lowest piece (the plain kid's own or a
      // worn item's) touches the floor: nothing sinks and nothing floats
      const baseLift = catalog.baseDeathLift;
      this._deathLift = baseLift ? baseLift.map((b, i) => Math.max(b, ...lifts.map((l) => l[i]))) : null;
      const geos = [baseGeo, ...(await Promise.all(jobs))];
      const merged = mergeGeometries(geos, false);
      merged.computeBoundingSphere();
      const h = this._holder;
      const mesh = new THREE.SkinnedMesh(merged, this.material);
      mesh.name = 'kid';
      mesh.position.copy(h.position); mesh.quaternion.copy(h.quaternion); mesh.scale.copy(h.scale);
      mesh.bind(this.skeleton, h.bindMatrix);
      mesh.frustumCulled = false;  // the clips move it out of its bind-pose bounds
      mesh.castShadow = mesh.receiveShadow = true;
      if (this.mesh) { this.mesh.parent.remove(this.mesh); this.mesh.geometry.dispose(); }
      h.parent.add(mesh);
      this.mesh = mesh;
    }

    _applyColours() {
      const L = this.look, tone = L.skin;
      this.palette[1].set(typeof tone === 'number' ? catalog.skinTones[tone] : tone);
      slots.forEach((slot, s) => L[slot].colours.forEach((hex, c) => this.palette[2 + s * 4 + c].set(hex)));
    }

    /** Put on another item: `colours` is a colourway name, an array of colours, or nothing (its first colourway). */
    async wear(slot, item, colours) {
      const spec = typeof colours === 'string' ? { way: colours } : Array.isArray(colours) ? { colours } : {};
      this.look[slot] = { item, colours: kit.colours(slot, item, spec) };
      this._applyColours();
      await this._build();
    }

    /** Recolour one channel of a slot ('main', 'trim', 'accent' or 'detail'), or all of them with a colourway name. */
    paint(slot, channel, colour) {
      const cs = this.look[slot].colours;
      if (channel in catalog.items[slot][this.look[slot].item].ways && colour === undefined) {
        this.look[slot].colours = kit.colours(slot, this.look[slot].item, { way: channel });
      } else {
        cs[CH.indexOf(channel)] = colour;
      }
      this._applyColours();
    }

    setSkin(tone) { this.look.skin = tone; this._applyColours(); }

    play(name, { fade = 0.2, loop = !(catalog.oneShots ?? ['death']).includes(name) } = {}) {
      const clip = clips[name];
      if (!clip) throw new Error(`no clip ${name}`);
      const next = this.mixer.clipAction(clip);
      next.reset();
      next.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, Infinity);
      next.clampWhenFinished = !loop;
      if (this.action && this.action !== next) next.crossFadeFrom(this.action, fade, false);
      next.play();
      this.action = next;
      return next;
    }

    /** Draw the kid with another material: make(palette) returns it, e.g.
     *  kid.setMaterial(pal => withKitPalette(new THREE.MeshToonMaterial({ gradientMap }), pal)). */
    setMaterial(make) {
      this.material.dispose();
      this.material = make(this.palette);
      if (this.mesh) this.mesh.material = this.material;
    }

    update(dt) {
      // undo last frame's death lift first: a finished clip holds its pose without rewriting the bone
      if (this._lifted) { this._lifted.bone.position.sub(this._lifted.by); this._lifted = null; }
      this.mixer.update(dt);
      const a = this.action;
      if (this._deathLift && a?.getClip().name === 'death') {
        const L = this._deathLift, f = Math.min(a.time / catalog.deathLiftStep, L.length - 1);
        const i = Math.floor(f), lift = L[i] + (L[Math.min(i + 1, L.length - 1)] - L[i]) * (f - i);
        if (Math.abs(lift) > 1e-4) this._raise(lift);
      }
    }

    _raise(lift) {
      // lift the root bone straight up in the kid's own space, by `lift` kit units
      const root = this.skeleton.bones.find((b) => b.name === 'root');
      this.object.updateMatrixWorld(true);
      const w = root.getWorldPosition(new THREE.Vector3());
      const up = this.object.localToWorld(this.object.worldToLocal(w.clone()).add(new THREE.Vector3(0, lift, 0)));
      const by = root.parent.worldToLocal(up).sub(root.parent.worldToLocal(w.clone()));
      root.position.add(by);
      this._lifted = { bone: root, by };
    }

    /** The look as plain data (save it, send it, rebuild it with kit.makeKid). */
    toJSON() { return JSON.parse(JSON.stringify(this.look)); }

    dispose() {
      this.mixer.stopAllAction();
      this.mesh?.geometry.dispose();
      this.material.dispose();
      this.object.removeFromParent();
    }
  }

  const kit = {
    slots, slotLabels: catalog.slotLabels ?? {}, items: catalog.items, looks: catalog.looks, clips: Object.keys(clips), skinTones: catalog.skinTones,
    suggest: catalog.suggest, makeKid, randomLook, colours,
  };
  return kit;
}

function findSkinned(root) {
  let m = null;
  root.traverse(o => { if (!m && o.isSkinnedMesh) m = o; });
  return m;
}

// The kit's colouring on any three.js material that supports vertex colours (standard, toon,
// lambert, basic ...): each vertex's colour is either its own (fixed details) or one of the kid's
// palette slots (skin and the items' channels), chosen by kitChan. A material's own onBeforeCompile
// (a style's extra shading) still runs, after the palette is in.
export function withKitPalette(m, palette) {
  const own = m.onBeforeCompile, ownKey = m.customProgramCacheKey?.() ?? '';
  m.vertexColors = true;
  m.flatShading = true;  // the kit is faceted, and the slimmed pieces have no normals of their own
  m.onBeforeCompile = (sh, r) => {
    sh.uniforms.kitPal = { value: palette };
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', `#include <common>
        attribute float kitChan;
        flat varying int vKitChan;`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        vKitChan = int(kitChan + 0.5);`);
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>
        uniform vec3 kitPal[${palette.length}];
        flat varying int vKitChan;`)
      .replace('#include <color_fragment>', `
        diffuseColor.rgb *= vKitChan == 0 ? vColor.rgb : kitPal[vKitChan];`);
    own?.call(m, sh, r);
  };
  m.customProgramCacheKey = () => `kidkit${palette.length}|${m.type}|${ownKey}`;
  return m;
}

function kidMaterial(palette) {
  return withKitPalette(new THREE.MeshStandardMaterial({ flatShading: true, roughness: 0.9, metalness: 0 }), palette);
}
