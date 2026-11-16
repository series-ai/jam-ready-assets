// Kit Kids: Snow Day. An avatar kit for three.js: mix-and-match kids.
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
//   const kit = await loadKidKit('assets/run-kit-kids-snow-day/kit/');  // the folder with the GLBs (the catalog is built in)
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
export const CATALOG = {"slots":["hair","hat","ears","horns","eyewear","markings","muzzle","mouth","neck","top","bottom","shoes","hands","back","tail","prop","offhand","ride"],"slotLabels":{"horns":"Horns & antennae","mouth":"Tusks & fangs","muzzle":"Animal muzzle","back":"On the back","prop":"Left hand","offhand":"Right hand","ride":"Ride on"},"channels":["main","trim","accent","detail"],"items":{"hair":{"crop":{"channels":{"main":"Hair"},"ways":{"black":["#1a1412"],"dark":["#402617"],"brown":["#7a4c29"],"chestnut":["#6b331a"],"ginger":["#e66b24"],"copper":["#cc541f"],"blonde":["#facc5c"],"platinum":["#f5f0d6"],"pink":["#ff73b2"],"blue":["#384c9e"]},"deathLift":[-2.62,-2.45,-2.15,-2.07,-2.09,-2.17,-2.28,-2.41,-2.48,-2.44,-2.36,-2.29,-2.21,-2.13,-2.06,-2.01,-1.97,-1.97,-2,-2.05,-2.03,-2.01,-2.01,-2.12,-2.26,-2.24,-2.33,-2.42,-2.51,-2.58,-2.51,-2.23,-1.49,-0.51,0.16,-0.14,-0.33,-0.43,-0.3,-0.03,0.16,-0.01,-0.02,0.09,0.12,0.13,0.13,0.14,0.14,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15],"file":"hair-crop.glb","hatDeathLift":[-2.62,-2.45,-2.15,-2.07,-2.09,-2.17,-2.28,-2.41,-2.48,-2.44,-2.36,-2.29,-2.21,-2.13,-2.06,-2.01,-1.97,-1.97,-2,-2.05,-2.03,-2.01,-2.01,-2.12,-2.26,-2.24,-2.33,-2.42,-2.51,-2.58,-2.51,-2.23,-1.49,-0.51,0.06,-0.15,-0.33,-0.43,-0.3,-0.03,0.14,-0.01,-0.02,0.09,0.12,0.13,0.13,0.14,0.14,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15],"hatFile":"hair-crop-hat.glb"},"long":{"channels":{"main":"Hair","trim":"Flower"},"ways":{"black":["#1a1412","#ffffff"],"dark":["#402617","#ffffff"],"brown":["#7a4c29","#ffffff"],"chestnut":["#6b331a","#ffffff"],"ginger":["#e66b24","#ffffff"],"copper":["#cc541f","#ffffff"],"blonde":["#facc5c","#ffffff"],"platinum":["#f5f0d6","#ffffff"],"pink":["#ff73b2","#ffffff"],"blue":["#384c9e","#ffffff"]},"deathLift":[-1.35,-1.24,-0.93,-0.85,-0.87,-0.94,-1.05,-1.17,-1.23,-1.15,-1.08,-1.01,-0.95,-0.89,-0.82,-0.77,-0.74,-0.74,-0.78,-0.85,-0.82,-0.78,-0.78,-0.88,-0.93,-0.86,-0.97,-1.15,-1.27,-1.37,-1.3,-1.05,-0.58,-0.26,0.24,-0.05,-0.08,-0.01,0.04,0.08,0.25,0.12,0.17,0.21,0.22,0.23,0.23,0.24,0.24,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25],"file":"hair-long.glb","hatDeathLift":[-1.35,-1.24,-0.93,-0.85,-0.87,-0.94,-1.05,-1.17,-1.23,-1.15,-1.08,-1.01,-0.95,-0.89,-0.82,-0.77,-0.74,-0.74,-0.78,-0.85,-0.82,-0.78,-0.78,-0.88,-0.93,-0.86,-0.97,-1.15,-1.27,-1.37,-1.3,-1.05,-0.58,-0.26,0.01,-0.17,-0.08,-0.01,0.04,0.08,0.07,0.12,0.17,0.21,0.22,0.23,0.23,0.24,0.24,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25],"hatFile":"hair-long-hat.glb"},"braids":{"channels":{"main":"Hair","trim":"Bows"},"ways":{"black":["#1a1412","#59bf8c"],"dark":["#402617","#59bf8c"],"brown":["#7a4c29","#59bf8c"],"chestnut":["#6b331a","#59bf8c"],"ginger":["#e66b24","#59bf8c"],"copper":["#cc541f","#59bf8c"],"blonde":["#facc5c","#59bf8c"],"platinum":["#f5f0d6","#59bf8c"],"pink":["#ff73b2","#59bf8c"],"blue":["#384c9e","#59bf8c"]},"deathLift":[-0.03,-0.01,0.02,0.08,0.13,0.16,0.15,0.11,0.08,0.15,0.21,0.25,0.27,0.28,0.28,0.27,0.24,0.19,0.12,0.03,0.07,0.15,0.22,0.31,0.37,0.37,0.28,0.14,0.01,-0.09,-0.17,-0.31,-0.72,-0.5,0.16,-0.14,-0.32,-0.41,-0.28,-0.03,0.16,0,-0.01,0.09,0.12,0.13,0.13,0.14,0.14,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15],"file":"hair-braids.glb","hatDeathLift":[-0.03,-0.01,0.02,0.08,0.13,0.16,0.15,0.11,0.08,0.15,0.21,0.25,0.27,0.28,0.28,0.27,0.24,0.19,0.12,0.03,0.07,0.15,0.22,0.31,0.37,0.37,0.28,0.14,0.01,-0.09,-0.17,-0.31,-0.72,-0.5,0.06,-0.15,-0.32,-0.41,-0.28,-0.03,0.14,0,-0.01,0.09,0.12,0.13,0.13,0.14,0.14,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15],"hatFile":"hair-braids-hat.glb"},"ponytail":{"channels":{"main":"Hair","trim":"Scrunchie"},"ways":{"black":["#1a1412","#4cb2f2"],"dark":["#402617","#4cb2f2"],"brown":["#7a4c29","#4cb2f2"],"chestnut":["#6b331a","#4cb2f2"],"ginger":["#e66b24","#4cb2f2"],"copper":["#cc541f","#4cb2f2"],"blonde":["#facc5c","#4cb2f2"],"platinum":["#f5f0d6","#4cb2f2"],"pink":["#ff73b2","#4cb2f2"],"blue":["#384c9e","#4cb2f2"]},"deathLift":[-2.28,-2.02,-1.6,-1.55,-1.62,-1.75,-1.9,-2.04,-2.13,-2.15,-2.12,-2.06,-1.98,-1.88,-1.78,-1.68,-1.59,-1.52,-1.48,-1.47,-1.49,-1.53,-1.62,-1.85,-2.14,-2.24,-2.33,-2.14,-2.15,-2.19,-2.03,-1.59,-0.74,0.3,1.03,0.79,0.57,0.48,0.64,0.98,1.2,1,0.99,1.14,1.18,1.19,1.19,1.2,1.21,1.21,1.21,1.21,1.21,1.21,1.21,1.21,1.21,1.21,1.21,1.21,1.21,1.21,1.21,1.21,1.21,1.21,1.21],"file":"hair-ponytail.glb","hatDeathLift":[-0.87,-0.67,-0.38,-0.33,-0.38,-0.47,-0.57,-0.67,-0.74,-0.76,-0.74,-0.71,-0.66,-0.6,-0.52,-0.45,-0.38,-0.32,-0.28,-0.28,-0.29,-0.33,-0.39,-0.55,-0.75,-0.91,-0.9,-0.76,-0.78,-0.81,-0.72,-0.46,-0.13,-0.01,-0.03,0.07,0.18,0.32,0.35,0.34,0.34,0.38,0.43,0.48,0.5,0.5,0.51,0.52,0.52,0.53,0.53,0.53,0.53,0.53,0.53,0.53,0.53,0.53,0.53,0.53,0.53,0.53,0.53,0.53,0.53,0.53,0.53],"hatFile":"hair-ponytail-hat.glb"},"buzz":{"channels":{"main":"Hair"},"ways":{"black":["#1a1412"],"dark":["#402617"],"brown":["#7a4c29"],"chestnut":["#6b331a"],"ginger":["#e66b24"],"copper":["#cc541f"],"blonde":["#facc5c"],"platinum":["#f5f0d6"],"pink":["#ff73b2"],"blue":["#384c9e"]},"deathLift":[-2.76,-2.61,-2.34,-2.27,-2.28,-2.35,-2.45,-2.57,-2.63,-2.59,-2.52,-2.45,-2.38,-2.31,-2.25,-2.2,-2.17,-2.17,-2.2,-2.25,-2.23,-2.21,-2.21,-2.3,-2.41,-2.37,-2.46,-2.58,-2.67,-2.74,-2.69,-2.44,-1.72,-0.67,0.16,-0.18,-0.51,-0.64,-0.5,-0.12,0.12,-0.1,-0.16,0,0.04,0.04,0.05,0.06,0.06,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07],"file":"hair-buzz.glb","hatDeathLift":[-2.76,-2.61,-2.34,-2.27,-2.28,-2.35,-2.45,-2.57,-2.63,-2.59,-2.52,-2.45,-2.38,-2.31,-2.25,-2.2,-2.17,-2.17,-2.2,-2.25,-2.23,-2.21,-2.21,-2.3,-2.41,-2.37,-2.46,-2.58,-2.67,-2.74,-2.69,-2.44,-1.72,-0.67,-0.06,-0.29,-0.51,-0.64,-0.5,-0.2,-0.02,-0.18,-0.21,-0.09,-0.05,-0.05,-0.04,-0.04,-0.03,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02],"hatFile":"hair-buzz-hat.glb"},"afro":{"channels":{"main":"Hair"},"ways":{"black":["#1a1412"],"dark":["#402617"],"brown":["#7a4c29"],"chestnut":["#6b331a"],"ginger":["#e66b24"],"copper":["#cc541f"],"blonde":["#facc5c"],"platinum":["#f5f0d6"],"pink":["#ff73b2"],"blue":["#384c9e"]},"deathLift":[-2.62,-2.45,-2.15,-2.07,-2.09,-2.17,-2.28,-2.41,-2.48,-2.44,-2.36,-2.29,-2.21,-2.13,-2.06,-2.01,-1.97,-1.97,-2,-2.05,-2.03,-2.01,-2.01,-2.12,-2.26,-2.24,-2.33,-2.42,-2.51,-2.58,-2.51,-2.23,-1.49,-0.33,0.56,0.19,-0.12,-0.3,-0.12,0.28,0.53,0.3,0.25,0.41,0.45,0.46,0.46,0.47,0.47,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48],"file":"hair-afro.glb","hatDeathLift":[-2.27,-2.11,-1.83,-1.76,-1.78,-1.85,-1.95,-2.06,-2.14,-2.09,-2.02,-1.94,-1.87,-1.8,-1.74,-1.69,-1.66,-1.65,-1.68,-1.74,-1.72,-1.69,-1.7,-1.79,-1.91,-1.93,-2.01,-2.08,-2.17,-2.24,-2.19,-1.91,-1.26,-0.33,0.19,0.02,-0.14,-0.22,-0.09,0.17,0.32,0.19,0.19,0.3,0.33,0.33,0.34,0.34,0.35,0.36,0.36,0.36,0.36,0.36,0.36,0.36,0.36,0.36,0.36,0.36,0.36,0.36,0.36,0.36,0.36,0.36,0.36],"hatFile":"hair-afro-hat.glb"},"none":{"channels":{},"ways":{"-":["#ffffff"]}}},"hat":{"earmuffs":{"channels":{"main":"Muffs","trim":"Band"},"ways":{"pink":["#ff66a6","#8047bf"],"red":["#eb4040","#333861"],"white":["#f7f7f7","#66bff2"]},"keepsHair":true,"file":"hat-earmuffs.glb"},"trapper-hat":{"channels":{"main":"Hat","trim":"Fur"},"ways":{"brown":["#8c613d","#faf2e0"],"red":["#eb4040","#f7f7f7"],"navy":["#333861","#f7f7f7"]},"deathLift":[-1.94,-1.77,-1.47,-1.38,-1.39,-1.46,-1.57,-1.71,-1.79,-1.71,-1.62,-1.52,-1.43,-1.35,-1.29,-1.24,-1.23,-1.24,-1.3,-1.39,-1.35,-1.29,-1.27,-1.36,-1.47,-1.39,-1.52,-1.69,-1.81,-1.9,-1.85,-1.59,-1.05,-0.28,0.41,0.18,-0.06,-0.21,-0.05,0.32,0.51,0.34,0.31,0.45,0.49,0.5,0.5,0.51,0.51,0.52,0.52,0.52,0.52,0.52,0.52,0.52,0.52,0.52,0.52,0.52,0.52,0.52,0.52,0.52,0.52,0.52,0.52],"file":"hat-trapper-hat.glb"},"beanie":{"channels":{"main":"Hat","trim":"Cuff","accent":"Pompom"},"ways":{"red":["#eb4040","#eb4040","#f7f7f7"],"mustard":["#fab826","#fab826","#faf2e0"],"navy":["#333861","#66bff2","#f7f7f7"],"pink":["#ff66a6","#f2738c","#bf8cf2"],"black":["#26262e","#26262e","#404559"]},"deathLift":[-3.23,-3.01,-2.62,-2.52,-2.56,-2.66,-2.81,-2.98,-3.07,-3.01,-2.91,-2.8,-2.69,-2.59,-2.5,-2.43,-2.39,-2.39,-2.43,-2.5,-2.48,-2.44,-2.45,-2.6,-2.78,-2.66,-2.8,-2.98,-3.08,-3.16,-3.05,-2.64,-1.66,-0.31,0.4,0.14,-0.1,-0.24,-0.08,0.28,0.46,0.3,0.27,0.41,0.45,0.46,0.46,0.47,0.47,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48],"file":"hat-beanie.glb"},"top-hat":{"channels":{"main":"Hat","trim":"Band","accent":"Buckle"},"ways":{"black":["#26262e","#8047bf","#fab826"],"grey":["#8c99b2","#26262e","#f7f7f7"],"green":["#4c9e66","#fa8c33","#fab826"]},"hairAs":"crop","deathLift":[-4.07,-3.84,-3.43,-3.37,-3.44,-3.55,-3.7,-3.84,-3.93,-3.87,-3.78,-3.69,-3.6,-3.51,-3.44,-3.38,-3.32,-3.3,-3.3,-3.29,-3.31,-3.33,-3.37,-3.52,-3.59,-3.56,-3.69,-3.85,-3.94,-4,-3.86,-3.38,-2.2,-0.48,0.5,0.07,-0.28,-0.51,-0.31,0.15,0.4,0.17,0.11,0.28,0.33,0.33,0.34,0.34,0.35,0.36,0.36,0.36,0.36,0.36,0.36,0.36,0.36,0.36,0.36,0.36,0.36,0.36,0.36,0.36,0.36,0.36,0.36],"file":"hat-top-hat.glb"},"none":{"channels":{},"ways":{"-":["#ffffff"]}}},"ears":{"none":{"channels":{},"ways":{"-":["#ffffff"]}}},"horns":{"none":{"channels":{},"ways":{"-":["#ffffff"]}}},"eyewear":{"none":{"channels":{},"ways":{"-":["#ffffff"]}}},"markings":{"none":{"channels":{},"ways":{"-":["#ffffff"]}}},"muzzle":{"none":{"channels":{},"ways":{"-":["#ffffff"]}}},"mouth":{"none":{"channels":{},"ways":{"-":["#ffffff"]}}},"neck":{"scarf":{"channels":{"main":"Scarf","trim":"Stripes"},"ways":{"red":["#eb4040","#f7f7f7"],"green":["#4c9e66","#fab826"],"blue":["#4773cc","#66bff2"],"purple":["#8047bf","#9ed14c"]},"file":"neck-scarf.glb"},"none":{"channels":{},"ways":{"-":["#ffffff"]}}},"top":{"puffy-coat":{"channels":{"main":"Coat","trim":"Fur","accent":"Zip"},"ways":{"red":["#eb4040","#f7f7f7","#404559"],"blue":["#4773cc","#f7f7f7","#f7f7f7"],"purple":["#8047bf","#faf2e0","#fae059"],"yellow":["#ffd126","#f7f7f7","#404559"]},"outer":true,"file":"top-puffy-coat.glb"},"sweater":{"channels":{"main":"Sweater","trim":"Stripes","accent":"Headphones"},"ways":{"midnight":["#333861","#faf7f0","#66d9f2"],"cream":["#faf2e0","#eb4040","#26262e"],"forest":["#4c9e66","#fae059","#f7f7f7"],"lilac":["#bf8cf2","#f7f7f7","#ff66a6"]},"outer":true,"file":"top-sweater.glb"},"hoodie":{"channels":{"main":"Hoodie","trim":"Trim","accent":"Strings"},"ways":{"red":["#eb4040","#fae059","#f7f7f7"],"grey":["#8c99b2","#404559","#f7f7f7"],"lilac":["#bf8cf2","#8cd9b8","#f7f7f7"],"green":["#4c9e66","#fa8c33","#faf2e0"]},"outer":true,"file":"top-hoodie.glb"},"wool-coat":{"channels":{"main":"Coat","trim":"Collar and cuffs","accent":"Buttons"},"ways":{"charcoal":["#404559","#26262e","#fab826"],"plum":["#733359","#26262e","#fab826"],"forest":["#336140","#26262e","#fab826"],"navy":["#333861","#404559","#fab826"]},"outer":true,"deathLift":[-0.37,-0.32,-0.23,-0.2,-0.19,-0.19,-0.19,-0.19,-0.2,-0.21,-0.22,-0.24,-0.26,-0.26,-0.22,-0.19,-0.16,-0.14,-0.14,-0.15,-0.17,-0.19,-0.21,-0.21,-0.21,-0.2,-0.23,-0.31,-0.35,-0.4,-0.42,-0.43,-0.53,-0.75,-0.98,-0.86,-0.76,-0.7,-0.73,-0.8,-0.81,-0.76,-0.73,-0.71,-0.71,-0.7,-0.7,-0.69,-0.69,-0.68,-0.68,-0.68,-0.68,-0.68,-0.68,-0.68,-0.68,-0.68,-0.68,-0.68,-0.68,-0.68,-0.68,-0.68,-0.68,-0.68,-0.68],"file":"top-wool-coat.glb"},"none":{"channels":{},"ways":{"-":["#ffffff"]}}},"bottom":{"pants":{"channels":{"main":"Trousers","trim":"Turn-ups"},"ways":{"charcoal":["#404559","#404559"],"khaki":["#d9b280","#d9b280"],"brown":["#665240","#665240"],"grey":["#8c99b2","#8c99b2"],"yellow":["#ffd126","#ffd126"],"red":["#eb4040","#eb4040"]},"deathLift":[-0.23,-0.22,-0.19,-0.18,-0.18,-0.18,-0.19,-0.19,-0.2,-0.2,-0.21,-0.21,-0.21,-0.21,-0.2,-0.19,-0.18,-0.17,-0.17,-0.17,-0.17,-0.18,-0.18,-0.18,-0.17,-0.17,-0.19,-0.23,-0.26,-0.29,-0.32,-0.39,-0.56,-0.83,-1.05,-0.93,-0.84,-0.79,-0.81,-0.88,-0.92,-0.85,-0.83,-0.85,-0.85,-0.84,-0.84,-0.83,-0.83,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82],"file":"bottom-pants.glb"},"jeans":{"channels":{"main":"Denim","trim":"Rips","accent":"Pockets and belt"},"ways":{"light":["#7399d9","#f2ebd9","#6185c7"],"dark":["#333861","#66bff2","#8c613d"],"black":["#26262e","#8c99b2","#404559"]},"file":"bottom-jeans.glb"},"leggings":{"channels":{"main":"Leggings","trim":"Stripe"},"ways":{"black":["#26262e","#ff66a6"],"navy":["#333861","#f7f7f7"],"purple":["#8047bf","#9ed14c"],"pink":["#ff66a6","#f7f7f7"]},"deathLift":[-0.2,-0.19,-0.17,-0.16,-0.16,-0.16,-0.16,-0.17,-0.17,-0.18,-0.18,-0.18,-0.19,-0.18,-0.18,-0.17,-0.16,-0.15,-0.15,-0.15,-0.15,-0.15,-0.16,-0.15,-0.15,-0.15,-0.17,-0.2,-0.24,-0.26,-0.3,-0.37,-0.56,-0.83,-1.05,-0.93,-0.84,-0.79,-0.81,-0.88,-0.92,-0.85,-0.83,-0.85,-0.85,-0.84,-0.84,-0.83,-0.83,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82],"file":"bottom-leggings.glb"},"snow-pants":{"channels":{"main":"Pants","trim":"Band and straps","accent":"Buckles"},"ways":{"navy":["#333861","#66bff2","#f7f7f7"],"black":["#26262e","#eb4040","#f7f7f7"],"purple":["#8047bf","#ff66a6","#f7f7f7"]},"deathLift":[-0.23,-0.22,-0.19,-0.18,-0.18,-0.18,-0.19,-0.19,-0.2,-0.2,-0.21,-0.21,-0.21,-0.21,-0.2,-0.19,-0.18,-0.17,-0.17,-0.17,-0.17,-0.18,-0.18,-0.18,-0.17,-0.16,-0.19,-0.23,-0.26,-0.29,-0.32,-0.38,-0.55,-0.83,-1.05,-0.93,-0.84,-0.79,-0.81,-0.88,-0.92,-0.85,-0.83,-0.85,-0.85,-0.84,-0.84,-0.83,-0.83,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82],"file":"bottom-snow-pants.glb","bib":"bottom-snow-pants-bib.glb"},"joggers":{"channels":{"main":"Joggers","trim":"Stripes and cuffs"},"ways":{"grey":["#8c99b2","#f7f7f7"],"navy":["#333861","#eb4040"],"black":["#26262e","#f7f7f7"],"pink":["#ff66a6","#f7f7f7"]},"deathLift":[-0.22,-0.21,-0.18,-0.17,-0.17,-0.18,-0.18,-0.18,-0.19,-0.2,-0.2,-0.2,-0.2,-0.2,-0.19,-0.18,-0.17,-0.17,-0.16,-0.16,-0.17,-0.17,-0.17,-0.17,-0.16,-0.16,-0.18,-0.22,-0.25,-0.28,-0.31,-0.38,-0.55,-0.83,-1.05,-0.93,-0.84,-0.79,-0.81,-0.88,-0.92,-0.85,-0.83,-0.85,-0.85,-0.84,-0.84,-0.83,-0.83,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82],"file":"bottom-joggers.glb"},"none":{"channels":{},"ways":{"-":["#ffffff"]}}},"shoes":{"bare-feet":{"channels":{},"ways":{"-":["#ffffff"]},"deathLift":[-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.01,0.01,0.02,-0.01,-0.05,-0.07,-0.09,-0.13,-0.23,-0.44,-0.88,-1.24,-1.1,-1,-0.97,-1.01,-1.12,-1.17,-1.1,-1.09,-1.13,-1.14,-1.13,-1.12,-1.12,-1.11,-1.11,-1.11,-1.11,-1.11,-1.11,-1.11,-1.11,-1.11,-1.11,-1.11,-1.11,-1.11,-1.11,-1.11,-1.11,-1.11,-1.11,-1.11],"file":"shoes-bare-feet.glb"},"sneakers":{"channels":{"main":"Shoe","trim":"Laces and sole","accent":"Flash"},"ways":{"white":["#f7f7f7","#e63333","#f7f7f7"],"black":["#26262e","#f7f7f7","#f7f7f7"],"blue":["#4c99f2","#f7f7f7","#f7f7f7"],"red":["#eb4040","#f7f7f7","#ffd126"]},"deathLift":[0.01,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.02,0.04,0.06,0.03,-0.02,-0.05,-0.06,-0.09,-0.17,-0.37,-0.82,-1.21,-1.06,-0.96,-0.92,-0.97,-1.09,-1.14,-1.06,-1.05,-1.1,-1.11,-1.1,-1.1,-1.09,-1.08,-1.08,-1.08,-1.08,-1.08,-1.08,-1.08,-1.08,-1.08,-1.08,-1.08,-1.08,-1.08,-1.08,-1.08,-1.08,-1.08,-1.08,-1.08],"file":"shoes-sneakers.glb"},"boots":{"channels":{"main":"Boot","trim":"Sole","accent":"Laces"},"ways":{"brown":["#8c613d","#404559","#d9b280"],"black":["#26262e","#404559","#eb4040"],"tan":["#d9b280","#8c613d","#eb4040"]},"deathLift":[0.02,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.03,0.05,0.06,0.03,-0.02,-0.04,-0.05,-0.08,-0.16,-0.37,-0.81,-1.21,-1.06,-0.95,-0.92,-0.96,-1.08,-1.14,-1.06,-1.05,-1.09,-1.1,-1.09,-1.08,-1.08,-1.07,-1.06,-1.06,-1.06,-1.06,-1.06,-1.06,-1.06,-1.06,-1.06,-1.06,-1.06,-1.06,-1.06,-1.06,-1.06,-1.06,-1.06,-1.06],"file":"shoes-boots.glb"},"snow-boots":{"channels":{"main":"Boot","trim":"Fur"},"ways":{"brown":["#8c613d","#faf2e0"],"red":["#eb4040","#f7f7f7"],"navy":["#333861","#f7f7f7"]},"deathLift":[-0.01,-0.01,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.01,-0.01,-0.01,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.01,0,0.03,0.04,0.01,-0.04,-0.07,-0.08,-0.11,-0.19,-0.39,-0.82,-1.17,-1.04,-0.95,-0.91,-0.95,-1.04,-1.08,-1.02,-1,-1.03,-1.04,-1.03,-1.02,-1.02,-1.01,-1.01,-1.01,-1.01,-1.01,-1.01,-1.01,-1.01,-1.01,-1.01,-1.01,-1.01,-1.01,-1.01,-1.01,-1.01,-1.01,-1.01,-1.01],"file":"shoes-snow-boots.glb"},"ice-skates":{"channels":{"main":"Boot","trim":"Blade"},"ways":{"white":["#f7f7f7","#d1d6e0"],"black":["#26262e","#d1d6e0"]},"deathLift":[-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,0,0.03,0.04,0.01,-0.04,-0.07,-0.08,-0.11,-0.18,-0.37,-0.8,-1.19,-1.03,-0.93,-0.89,-0.93,-1.05,-1.11,-1.03,-1.01,-1.06,-1.07,-1.06,-1.06,-1.05,-1.04,-1.04,-1.04,-1.04,-1.04,-1.04,-1.04,-1.04,-1.04,-1.04,-1.04,-1.04,-1.04,-1.04,-1.04,-1.04,-1.04,-1.04,-1.04],"file":"shoes-ice-skates.glb"},"wellies":{"channels":{"main":"Boot","trim":"Rim"},"ways":{"red":["#eb3840","#ffffff"],"yellow":["#ffd126","#f7f7f7"],"green":["#4c9e66","#ffd126"],"navy":["#333861","#eb4040"]},"deathLift":[-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,0,0.02,0.03,0,-0.05,-0.07,-0.09,-0.12,-0.21,-0.42,-0.85,-1.18,-1.08,-0.98,-0.95,-0.99,-1.07,-1.09,-1.04,-1.02,-1.03,-1.03,-1.03,-1.02,-1.02,-1.01,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],"file":"shoes-wellies.glb"},"skis":{"channels":{"main":"Boots","trim":"Skis","accent":"Bindings"},"ways":{"red":["#404559","#eb4040","#f7f7f7"],"blue":["#f7f7f7","#4773cc","#26262e"],"yellow":["#26262e","#ffd126","#8c99b2"]},"clip":"ski","deathLift":[-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.01,0.04,0.1,0.14,0.08,-0.03,-0.07,-0.06,-0.02,0.01,-0.08,-0.42,-0.83,-0.63,-0.48,-0.4,-0.45,-0.58,-0.65,-0.55,-0.52,-0.57,-0.58,-0.57,-0.57,-0.56,-0.56,-0.55,-0.55,-0.55,-0.55,-0.55,-0.55,-0.55,-0.55,-0.55,-0.55,-0.55,-0.55,-0.55,-0.55,-0.55,-0.55,-0.55,-0.55],"file":"shoes-skis.glb"}},"hands":{"mittens":{"channels":{"main":"Mitten","trim":"Cuff"},"ways":{"red":["#eb4040","#f7f7f7"],"blue":["#4773cc","#f7f7f7"],"green":["#4c9e66","#faf2e0"]},"file":"hands-mittens.glb"},"none":{"channels":{},"ways":{"-":["#ffffff"]}}},"back":{"none":{"channels":{},"ways":{"-":["#ffffff"]}}},"tail":{"none":{"channels":{},"ways":{"-":["#ffffff"]}}},"prop":{"snowball":{"channels":{"main":"Snow"},"ways":{"-":["#f7f7f7"]},"file":"prop-snowball.glb"},"snow-shovel":{"channels":{"main":"Scoop","trim":"Handle"},"ways":{"blue":["#4773cc","#26262e"],"red":["#eb4040","#26262e"],"yellow":["#ffd126","#26262e"]},"deathLift":[-0.11,-0.17,-0.36,-0.37,-0.37,-0.37,-0.39,-0.42,-0.45,-0.46,-0.45,-0.43,-0.39,-0.33,-0.26,-0.18,-0.11,-0.05,-0.01,0.01,0.01,0,-0.02,-0.04,-0.04,-0.05,-0.14,-0.22,-0.22,-0.2,-0.24,-0.36,-0.61,-1.2,-1.44,-1.4,-1.38,-1.35,-1.33,-1.36,-1.38,-1.35,-1.35,-1.36,-1.36,-1.35,-1.34,-1.34,-1.33,-1.33,-1.33,-1.33,-1.33,-1.33,-1.33,-1.33,-1.33,-1.33,-1.33,-1.33,-1.33,-1.33,-1.33,-1.33,-1.33,-1.33,-1.33],"file":"prop-snow-shovel.glb"},"ski-pole":{"channels":{"main":"Grip and basket","trim":"Pole"},"ways":{"black":["#26262e","#d1d6e0"],"red":["#eb4040","#d1d6e0"]},"deathLift":[-0.12,-0.18,-0.36,-0.38,-0.38,-0.39,-0.42,-0.45,-0.47,-0.48,-0.47,-0.44,-0.4,-0.33,-0.26,-0.18,-0.1,-0.04,0,0.02,0.02,0,-0.02,-0.05,-0.08,-0.11,-0.17,-0.23,-0.23,-0.21,-0.24,-0.35,-0.57,-1.13,-1.5,-1.48,-1.45,-1.39,-1.34,-1.36,-1.39,-1.37,-1.38,-1.39,-1.38,-1.38,-1.37,-1.36,-1.36,-1.35,-1.35,-1.35,-1.35,-1.35,-1.35,-1.35,-1.35,-1.35,-1.35,-1.35,-1.35,-1.35,-1.35,-1.35,-1.35,-1.35,-1.35],"file":"prop-ski-pole.glb"},"none":{"channels":{},"ways":{"-":["#ffffff"]}}},"offhand":{"songbook":{"channels":{"main":"Cover","trim":"Pages"},"ways":{"red":["#eb4040","#faf2e0"],"green":["#4c9e66","#faf2e0"],"black":["#26262e","#faf2e0"]},"file":"offhand-songbook.glb"},"candle":{"channels":{"main":"Candle","trim":"Holder","accent":"Flame"},"ways":{"cream":["#faf2e0","#d9a640","#fa8c33"],"red":["#eb4040","#d1d6e0","#fa8c33"]},"file":"offhand-candle.glb"},"cocoa":{"channels":{"main":"Mug","trim":"Marshmallows","accent":"Cocoa"},"ways":{"red":["#eb4040","#f7f7f7","#8c613d"],"white":["#f7f7f7","#ff66a6","#8c613d"],"green":["#4c9e66","#f7f7f7","#8c613d"]},"file":"offhand-cocoa.glb"},"ski-pole":{"channels":{"main":"Grip and basket","trim":"Pole"},"ways":{"black":["#26262e","#d1d6e0"],"red":["#eb4040","#d1d6e0"]},"deathLift":[-0.12,-0.17,-0.34,-0.34,-0.3,-0.21,-0.15,-0.11,-0.1,-0.11,-0.15,-0.19,-0.24,-0.27,-0.3,-0.32,-0.33,-0.34,-0.35,-0.35,-0.34,-0.32,-0.29,-0.24,-0.18,-0.12,-0.1,-0.14,-0.17,-0.19,-0.24,-0.34,-0.57,-1.13,-1.5,-1.48,-1.44,-1.34,-1.25,-1.27,-1.31,-1.3,-1.32,-1.33,-1.33,-1.31,-1.3,-1.29,-1.29,-1.28,-1.29,-1.29,-1.29,-1.29,-1.29,-1.29,-1.29,-1.29,-1.29,-1.29,-1.29,-1.29,-1.29,-1.29,-1.29,-1.29,-1.29],"file":"offhand-ski-pole.glb"},"snowball":{"channels":{"main":"Snow"},"ways":{"-":["#f7f7f7"]},"file":"offhand-snowball.glb"},"none":{"channels":{},"ways":{"-":["#ffffff"]}}},"ride":{"snowboard":{"channels":{"main":"Board","trim":"Stripe","accent":"Bindings"},"ways":{"teal":["#33b2b2","#f7f7f7","#26262e"],"orange":["#fa8c33","#333861","#26262e"],"black":["#26262e","#9ed14c","#8c99b2"],"pink":["#ff66a6","#8047bf","#f7f7f7"]},"clip":"snowboard","conflicts":{"shoes":["skis"],"prop":["ski-pole"],"offhand":["ski-pole"]},"deathLift":[0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.08,0.11,0.12,0.09,0.04,0.02,0,-0.03,-0.1,-0.31,-0.76,-1.16,-0.99,-0.88,-0.85,-0.9,-1.03,-1.09,-1.01,-0.99,-1.04,-1.04,-1.04,-1.03,-1.03,-1.02,-1.01,-1.01,-1.01,-1.01,-1.01,-1.01,-1.01,-1.01,-1.01,-1.01,-1.01,-1.01,-1.01,-1.01,-1.01,-1.01,-1.01,-1.01],"file":"ride-snowboard.glb"},"sled":{"channels":{"main":"Wood","trim":"Runners"},"ways":{"wood":["#cc9961","#eb4040"],"blue":["#cc9961","#4773cc"]},"clip":"sled","conflicts":{"shoes":["skis"],"prop":["ski-pole"],"offhand":["ski-pole"]},"deathLift":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.04,0.08,0.11,0.07,-0.02,-0.05,-0.04,-0.02,0,-0.11,-0.47,-0.86,-0.66,-0.52,-0.45,-0.5,-0.63,-0.7,-0.6,-0.57,-0.62,-0.63,-0.62,-0.62,-0.61,-0.61,-0.6,-0.6,-0.6,-0.6,-0.6,-0.6,-0.6,-0.6,-0.6,-0.6,-0.6,-0.6,-0.6,-0.6,-0.6,-0.6,-0.6,-0.6],"file":"ride-sled.glb"},"saucer-sled":{"channels":{"main":"Saucer","trim":"Seat and handles"},"ways":{"red":["#eb4040","#f7f7f7"],"blue":["#4773cc","#f7f7f7"],"green":["#9ed14c","#f7f7f7"]},"clip":"sled","conflicts":{"shoes":["skis"],"prop":["ski-pole"],"offhand":["ski-pole"]},"deathLift":[-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.01,0.02,0.08,0.11,0.06,-0.03,-0.07,-0.05,-0.02,0.01,-0.07,-0.38,-0.72,-0.52,-0.38,-0.3,-0.33,-0.45,-0.52,-0.42,-0.38,-0.42,-0.43,-0.42,-0.42,-0.41,-0.41,-0.4,-0.4,-0.4,-0.4,-0.4,-0.4,-0.4,-0.4,-0.4,-0.4,-0.4,-0.4,-0.4,-0.4,-0.4,-0.4,-0.4,-0.4],"file":"ride-saucer-sled.glb"},"none":{"channels":{},"ways":{"-":["#ffffff"]}}}},"looks":{"skier":{"skin":0,"hair":{"item":"crop","way":"black"},"hat":{"item":"beanie","way":"red"},"ears":{"item":"none"},"horns":{"item":"none"},"eyewear":{"item":"none"},"markings":{"item":"none"},"muzzle":{"item":"none"},"mouth":{"item":"none"},"neck":{"item":"none"},"top":{"item":"puffy-coat","way":"blue"},"bottom":{"item":"snow-pants","way":"navy"},"shoes":{"item":"skis","way":"red"},"hands":{"item":"mittens","way":"red"},"back":{"item":"none"},"tail":{"item":"none"},"prop":{"item":"ski-pole","way":"black"},"offhand":{"item":"ski-pole","way":"black"},"ride":{"item":"none"}},"snowboarder":{"skin":1,"hair":{"item":"long","way":"black"},"hat":{"item":"trapper-hat","way":"brown"},"ears":{"item":"none"},"horns":{"item":"none"},"eyewear":{"item":"none"},"markings":{"item":"none"},"muzzle":{"item":"none"},"mouth":{"item":"none"},"neck":{"item":"none"},"top":{"item":"puffy-coat","way":"red"},"bottom":{"item":"snow-pants","way":"black"},"shoes":{"item":"snow-boots","way":"brown"},"hands":{"item":"mittens","way":"red"},"back":{"item":"none"},"tail":{"item":"none"},"prop":{"item":"none"},"offhand":{"item":"none"},"ride":{"item":"snowboard","way":"teal"}},"sledder":{"skin":2,"hair":{"item":"braids","way":"black"},"hat":{"item":"earmuffs","way":"pink"},"ears":{"item":"none"},"horns":{"item":"none"},"eyewear":{"item":"none"},"markings":{"item":"none"},"muzzle":{"item":"none"},"mouth":{"item":"none"},"neck":{"item":"scarf","way":"red"},"top":{"item":"puffy-coat","way":"yellow"},"bottom":{"item":"snow-pants","way":"purple"},"shoes":{"item":"snow-boots","way":"brown"},"hands":{"item":"mittens","way":"red"},"back":{"item":"none"},"tail":{"item":"none"},"prop":{"item":"none"},"offhand":{"item":"none"},"ride":{"item":"sled","way":"wood"}},"saucer-rider":{"skin":3,"hair":{"item":"ponytail","way":"black"},"hat":{"item":"beanie","way":"pink"},"ears":{"item":"none"},"horns":{"item":"none"},"eyewear":{"item":"none"},"markings":{"item":"none"},"muzzle":{"item":"none"},"mouth":{"item":"none"},"neck":{"item":"none"},"top":{"item":"hoodie","way":"lilac"},"bottom":{"item":"joggers","way":"pink"},"shoes":{"item":"snow-boots","way":"brown"},"hands":{"item":"none"},"back":{"item":"none"},"tail":{"item":"none"},"prop":{"item":"none"},"offhand":{"item":"none"},"ride":{"item":"saucer-sled","way":"red"}},"ice-skater":{"skin":4,"hair":{"item":"buzz","way":"black"},"hat":{"item":"earmuffs","way":"pink"},"ears":{"item":"none"},"horns":{"item":"none"},"eyewear":{"item":"none"},"markings":{"item":"none"},"muzzle":{"item":"none"},"mouth":{"item":"none"},"neck":{"item":"scarf","way":"red"},"top":{"item":"sweater","way":"lilac"},"bottom":{"item":"leggings","way":"purple"},"shoes":{"item":"ice-skates","way":"white"},"hands":{"item":"none"},"back":{"item":"none"},"tail":{"item":"none"},"prop":{"item":"none"},"offhand":{"item":"cocoa","way":"red"},"ride":{"item":"none"}},"snowball-fighter":{"skin":5,"hair":{"item":"afro","way":"black"},"hat":{"item":"beanie","way":"navy"},"ears":{"item":"none"},"horns":{"item":"none"},"eyewear":{"item":"none"},"markings":{"item":"none"},"muzzle":{"item":"none"},"mouth":{"item":"none"},"neck":{"item":"none"},"top":{"item":"puffy-coat","way":"purple"},"bottom":{"item":"snow-pants","way":"navy"},"shoes":{"item":"snow-boots","way":"brown"},"hands":{"item":"mittens","way":"red"},"back":{"item":"none"},"tail":{"item":"none"},"prop":{"item":"snowball","way":"-"},"offhand":{"item":"snowball","way":"-"},"ride":{"item":"none"}},"shoveller":{"skin":0,"hair":{"item":"crop","way":"black"},"hat":{"item":"trapper-hat","way":"brown"},"ears":{"item":"none"},"horns":{"item":"none"},"eyewear":{"item":"none"},"markings":{"item":"none"},"muzzle":{"item":"none"},"mouth":{"item":"none"},"neck":{"item":"none"},"top":{"item":"puffy-coat","way":"yellow"},"bottom":{"item":"snow-pants","way":"black"},"shoes":{"item":"snow-boots","way":"brown"},"hands":{"item":"mittens","way":"red"},"back":{"item":"none"},"tail":{"item":"none"},"prop":{"item":"snow-shovel","way":"blue"},"offhand":{"item":"none"},"ride":{"item":"none"}},"caroler":{"skin":1,"hair":{"item":"long","way":"black"},"hat":{"item":"top-hat","way":"black"},"ears":{"item":"none"},"horns":{"item":"none"},"eyewear":{"item":"none"},"markings":{"item":"none"},"muzzle":{"item":"none"},"mouth":{"item":"none"},"neck":{"item":"scarf","way":"red"},"top":{"item":"wool-coat","way":"charcoal"},"bottom":{"item":"pants","way":"charcoal"},"shoes":{"item":"snow-boots","way":"brown"},"hands":{"item":"none"},"back":{"item":"none"},"tail":{"item":"none"},"prop":{"item":"none"},"offhand":{"item":"songbook","way":"red"},"ride":{"item":"none"}},"candle-caroler":{"skin":2,"hair":{"item":"braids","way":"black"},"hat":{"item":"earmuffs","way":"pink"},"ears":{"item":"none"},"horns":{"item":"none"},"eyewear":{"item":"none"},"markings":{"item":"none"},"muzzle":{"item":"none"},"mouth":{"item":"none"},"neck":{"item":"scarf","way":"red"},"top":{"item":"wool-coat","way":"plum"},"bottom":{"item":"leggings","way":"black"},"shoes":{"item":"snow-boots","way":"brown"},"hands":{"item":"none"},"back":{"item":"none"},"tail":{"item":"none"},"prop":{"item":"none"},"offhand":{"item":"candle","way":"cream"},"ride":{"item":"none"}}},"skinTones":["#fcdbbd","#f2c79e","#e0a87a","#bd8052","#8f5936","#613b24"],"suggest":{"cloth":{"red":"#eb4040","tomato":"#f26b4c","orange":"#fa8c33","gold":"#fab826","yellow":"#ffd126","butter":"#fae059","lime":"#9ed14c","green":"#4c9e66","mint":"#8cd9b8","teal":"#33b2b2","sky":"#66bff2","blue":"#4773cc","navy":"#333861","purple":"#8047bf","lilac":"#bf8cf2","pink":"#ff66a6","rose":"#f2738c","brown":"#8c613d","tan":"#d9b280","cream":"#faf2e0","white":"#f7f7f7","grey":"#8c99b2","charcoal":"#404559","black":"#26262e"},"hair":{"black":"#1a1412","dark":"#402617","brown":"#7a4c29","chestnut":"#6b331a","ginger":"#e66b24","copper":"#cc541f","blonde":"#facc5c","platinum":"#f5f0d6","pink":"#ff73b2","blue":"#384c9e"},"skin":{"orc":"#8cb861","goblin":"#adc759","sea":"#73b8cc","blue":"#7394e6","fairy":"#c7adf2","imp":"#e66b61","alien":"#9ea8b2","ghoul":"#d1dbcc"}},"clips":["idle","walk","run","jump","pick-up","celebrate","scared","attack","trick-or-treat","wave","hit","sad","sneak","spin","idle-peek","idle-yawn","idle-look","dance-wiggle","dance-robot","run-jump","eat-candy","death","aim","run-aim","shoot","ready","slash","smash","fly","lift-off","snowboard","ski","sled"],"oneShots":["death","lift-off"],"deathLiftStep":0.03333333333333333,"baseDeathLift":[-0.22,-0.21,-0.18,-0.17,-0.17,-0.18,-0.18,-0.18,-0.19,-0.2,-0.2,-0.2,-0.2,-0.2,-0.19,-0.18,-0.17,-0.17,-0.16,-0.16,-0.17,-0.17,-0.17,-0.17,-0.17,-0.16,-0.19,-0.22,-0.25,-0.28,-0.32,-0.39,-0.57,-0.59,0,-0.31,-0.44,-0.46,-0.37,-0.23,-0.03,-0.2,-0.19,-0.12,-0.1,-0.09,-0.09,-0.08,-0.08,-0.07,-0.07,-0.07,-0.07,-0.07,-0.07,-0.07,-0.07,-0.07,-0.07,-0.07,-0.07,-0.07,-0.07,-0.07,-0.07,-0.07,-0.07]};

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
