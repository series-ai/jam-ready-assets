// Kit Kids: Quest Crew. An avatar kit for three.js: mix-and-match kids.
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
//   const kit = await loadKidKit('assets/run-kit-kids-quest-crew/kit/');  // the folder with the GLBs (the catalog is built in)
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
export const CATALOG = {"slots":["hair","hat","ears","horns","eyewear","markings","muzzle","mouth","neck","top","bottom","shoes","hands","back","tail","prop","offhand","ride"],"slotLabels":{"horns":"Horns & antennae","mouth":"Tusks & fangs","muzzle":"Animal muzzle","back":"On the back","prop":"Left hand","offhand":"Right hand","ride":"Ride on"},"channels":["main","trim","accent","detail"],"items":{"hair":{"crop":{"channels":{"main":"Hair"},"ways":{"black":["#1a1412"],"dark":["#402617"],"brown":["#7a4c29"],"chestnut":["#6b331a"],"ginger":["#e66b24"],"copper":["#cc541f"],"blonde":["#facc5c"],"platinum":["#f5f0d6"],"pink":["#ff73b2"],"blue":["#384c9e"]},"deathLift":[-2.62,-2.45,-2.15,-2.07,-2.09,-2.17,-2.28,-2.41,-2.48,-2.44,-2.36,-2.29,-2.21,-2.13,-2.06,-2.01,-1.97,-1.97,-2,-2.05,-2.03,-2.01,-2.01,-2.12,-2.26,-2.24,-2.33,-2.42,-2.51,-2.58,-2.51,-2.23,-1.49,-0.51,0.16,-0.14,-0.33,-0.43,-0.3,-0.03,0.16,-0.01,-0.02,0.09,0.12,0.13,0.13,0.14,0.14,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15],"file":"hair-crop.glb","hatDeathLift":[-2.62,-2.45,-2.15,-2.07,-2.09,-2.17,-2.28,-2.41,-2.48,-2.44,-2.36,-2.29,-2.21,-2.13,-2.06,-2.01,-1.97,-1.97,-2,-2.05,-2.03,-2.01,-2.01,-2.12,-2.26,-2.24,-2.33,-2.42,-2.51,-2.58,-2.51,-2.23,-1.49,-0.51,0.06,-0.15,-0.33,-0.43,-0.3,-0.03,0.14,-0.01,-0.02,0.09,0.12,0.13,0.13,0.14,0.14,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15],"hatFile":"hair-crop-hat.glb"},"long":{"channels":{"main":"Hair","trim":"Flower"},"ways":{"black":["#1a1412","#ffffff"],"dark":["#402617","#ffffff"],"brown":["#7a4c29","#ffffff"],"chestnut":["#6b331a","#ffffff"],"ginger":["#e66b24","#ffffff"],"copper":["#cc541f","#ffffff"],"blonde":["#facc5c","#ffffff"],"platinum":["#f5f0d6","#ffffff"],"pink":["#ff73b2","#ffffff"],"blue":["#384c9e","#ffffff"]},"deathLift":[-1.35,-1.24,-0.93,-0.85,-0.87,-0.94,-1.05,-1.17,-1.23,-1.15,-1.08,-1.01,-0.95,-0.89,-0.82,-0.77,-0.74,-0.74,-0.78,-0.85,-0.82,-0.78,-0.78,-0.88,-0.93,-0.86,-0.97,-1.15,-1.27,-1.37,-1.3,-1.05,-0.58,-0.26,0.24,-0.05,-0.08,-0.01,0.04,0.08,0.25,0.12,0.17,0.21,0.22,0.23,0.23,0.24,0.24,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25],"file":"hair-long.glb","hatDeathLift":[-1.35,-1.24,-0.93,-0.85,-0.87,-0.94,-1.05,-1.17,-1.23,-1.15,-1.08,-1.01,-0.95,-0.89,-0.82,-0.77,-0.74,-0.74,-0.78,-0.85,-0.82,-0.78,-0.78,-0.88,-0.93,-0.86,-0.97,-1.15,-1.27,-1.37,-1.3,-1.05,-0.58,-0.26,0.01,-0.17,-0.08,-0.01,0.04,0.08,0.07,0.12,0.17,0.21,0.22,0.23,0.23,0.24,0.24,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25],"hatFile":"hair-long-hat.glb"},"braids":{"channels":{"main":"Hair","trim":"Bows"},"ways":{"black":["#1a1412","#59bf8c"],"dark":["#402617","#59bf8c"],"brown":["#7a4c29","#59bf8c"],"chestnut":["#6b331a","#59bf8c"],"ginger":["#e66b24","#59bf8c"],"copper":["#cc541f","#59bf8c"],"blonde":["#facc5c","#59bf8c"],"platinum":["#f5f0d6","#59bf8c"],"pink":["#ff73b2","#59bf8c"],"blue":["#384c9e","#59bf8c"]},"deathLift":[-0.03,-0.01,0.02,0.08,0.13,0.16,0.15,0.11,0.08,0.15,0.21,0.25,0.27,0.28,0.28,0.27,0.24,0.19,0.12,0.03,0.07,0.15,0.22,0.31,0.37,0.37,0.28,0.14,0.01,-0.09,-0.17,-0.31,-0.72,-0.5,0.16,-0.14,-0.32,-0.41,-0.28,-0.03,0.16,0,-0.01,0.09,0.12,0.13,0.13,0.14,0.14,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15],"file":"hair-braids.glb","hatDeathLift":[-0.03,-0.01,0.02,0.08,0.13,0.16,0.15,0.11,0.08,0.15,0.21,0.25,0.27,0.28,0.28,0.27,0.24,0.19,0.12,0.03,0.07,0.15,0.22,0.31,0.37,0.37,0.28,0.14,0.01,-0.09,-0.17,-0.31,-0.72,-0.5,0.06,-0.15,-0.32,-0.41,-0.28,-0.03,0.14,0,-0.01,0.09,0.12,0.13,0.13,0.14,0.14,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15],"hatFile":"hair-braids-hat.glb"},"ponytail":{"channels":{"main":"Hair","trim":"Scrunchie"},"ways":{"black":["#1a1412","#4cb2f2"],"dark":["#402617","#4cb2f2"],"brown":["#7a4c29","#4cb2f2"],"chestnut":["#6b331a","#4cb2f2"],"ginger":["#e66b24","#4cb2f2"],"copper":["#cc541f","#4cb2f2"],"blonde":["#facc5c","#4cb2f2"],"platinum":["#f5f0d6","#4cb2f2"],"pink":["#ff73b2","#4cb2f2"],"blue":["#384c9e","#4cb2f2"]},"deathLift":[-2.28,-2.02,-1.6,-1.55,-1.62,-1.75,-1.9,-2.04,-2.13,-2.15,-2.12,-2.06,-1.98,-1.88,-1.78,-1.68,-1.59,-1.52,-1.48,-1.47,-1.49,-1.53,-1.62,-1.85,-2.14,-2.24,-2.33,-2.14,-2.15,-2.19,-2.03,-1.59,-0.74,0.3,1.03,0.79,0.57,0.48,0.64,0.98,1.2,1,0.99,1.14,1.18,1.19,1.19,1.2,1.21,1.21,1.21,1.21,1.21,1.21,1.21,1.21,1.21,1.21,1.21,1.21,1.21,1.21,1.21,1.21,1.21,1.21,1.21],"file":"hair-ponytail.glb","hatDeathLift":[-0.87,-0.67,-0.38,-0.33,-0.38,-0.47,-0.57,-0.67,-0.74,-0.76,-0.74,-0.71,-0.66,-0.6,-0.52,-0.45,-0.38,-0.32,-0.28,-0.28,-0.29,-0.33,-0.39,-0.55,-0.75,-0.91,-0.9,-0.76,-0.78,-0.81,-0.72,-0.46,-0.13,-0.01,-0.03,0.07,0.18,0.32,0.35,0.34,0.34,0.38,0.43,0.48,0.5,0.5,0.51,0.52,0.52,0.53,0.53,0.53,0.53,0.53,0.53,0.53,0.53,0.53,0.53,0.53,0.53,0.53,0.53,0.53,0.53,0.53,0.53],"hatFile":"hair-ponytail-hat.glb"},"buzz":{"channels":{"main":"Hair"},"ways":{"black":["#1a1412"],"dark":["#402617"],"brown":["#7a4c29"],"chestnut":["#6b331a"],"ginger":["#e66b24"],"copper":["#cc541f"],"blonde":["#facc5c"],"platinum":["#f5f0d6"],"pink":["#ff73b2"],"blue":["#384c9e"]},"deathLift":[-2.76,-2.61,-2.34,-2.27,-2.28,-2.35,-2.45,-2.57,-2.63,-2.59,-2.52,-2.45,-2.38,-2.31,-2.25,-2.2,-2.17,-2.17,-2.2,-2.25,-2.23,-2.21,-2.21,-2.3,-2.41,-2.37,-2.46,-2.58,-2.67,-2.74,-2.69,-2.44,-1.72,-0.67,0.16,-0.18,-0.51,-0.64,-0.5,-0.12,0.12,-0.1,-0.16,0,0.04,0.04,0.05,0.06,0.06,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07],"file":"hair-buzz.glb","hatDeathLift":[-2.76,-2.61,-2.34,-2.27,-2.28,-2.35,-2.45,-2.57,-2.63,-2.59,-2.52,-2.45,-2.38,-2.31,-2.25,-2.2,-2.17,-2.17,-2.2,-2.25,-2.23,-2.21,-2.21,-2.3,-2.41,-2.37,-2.46,-2.58,-2.67,-2.74,-2.69,-2.44,-1.72,-0.67,-0.06,-0.29,-0.51,-0.64,-0.5,-0.2,-0.02,-0.18,-0.21,-0.09,-0.05,-0.05,-0.04,-0.04,-0.03,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02],"hatFile":"hair-buzz-hat.glb"},"afro":{"channels":{"main":"Hair"},"ways":{"black":["#1a1412"],"dark":["#402617"],"brown":["#7a4c29"],"chestnut":["#6b331a"],"ginger":["#e66b24"],"copper":["#cc541f"],"blonde":["#facc5c"],"platinum":["#f5f0d6"],"pink":["#ff73b2"],"blue":["#384c9e"]},"deathLift":[-2.62,-2.45,-2.15,-2.07,-2.09,-2.17,-2.28,-2.41,-2.48,-2.44,-2.36,-2.29,-2.21,-2.13,-2.06,-2.01,-1.97,-1.97,-2,-2.05,-2.03,-2.01,-2.01,-2.12,-2.26,-2.24,-2.33,-2.42,-2.51,-2.58,-2.51,-2.23,-1.49,-0.33,0.56,0.19,-0.12,-0.3,-0.12,0.28,0.53,0.3,0.25,0.41,0.45,0.46,0.46,0.47,0.47,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48],"file":"hair-afro.glb","hatDeathLift":[-2.27,-2.11,-1.83,-1.76,-1.78,-1.85,-1.95,-2.06,-2.14,-2.09,-2.02,-1.94,-1.87,-1.8,-1.74,-1.69,-1.66,-1.65,-1.68,-1.74,-1.72,-1.69,-1.7,-1.79,-1.91,-1.93,-2.01,-2.08,-2.17,-2.24,-2.19,-1.91,-1.26,-0.33,0.19,0.02,-0.14,-0.22,-0.09,0.17,0.32,0.19,0.19,0.3,0.33,0.33,0.34,0.34,0.35,0.36,0.36,0.36,0.36,0.36,0.36,0.36,0.36,0.36,0.36,0.36,0.36,0.36,0.36,0.36,0.36,0.36,0.36],"hatFile":"hair-afro-hat.glb"},"mohawk":{"channels":{"main":"Hair","trim":"Shaved sides"},"ways":{"punk":["#ff73b2","#1a1412"],"lime":["#9ed14c","#402617"],"blue":["#384c9e","#facc5c"],"natural":["#7a4c29","#402617"]},"deathLift":[-3.54,-3.37,-3.05,-2.97,-3,-3.09,-3.2,-3.33,-3.41,-3.36,-3.28,-3.2,-3.12,-3.04,-2.96,-2.91,-2.87,-2.87,-2.89,-2.95,-2.93,-2.91,-2.92,-3.03,-3.17,-3.08,-3.2,-3.35,-3.43,-3.51,-3.44,-3.11,-2.16,-0.57,0.53,0.09,-0.36,-0.67,-0.43,0.14,0.44,0.14,0.05,0.26,0.31,0.32,0.32,0.33,0.34,0.34,0.34,0.34,0.34,0.34,0.34,0.34,0.34,0.34,0.34,0.34,0.34,0.34,0.34,0.34,0.34,0.34,0.34],"file":"hair-mohawk.glb"},"none":{"channels":{},"ways":{"-":["#ffffff"]}}},"hat":{"wizard":{"channels":{"main":"Hat","trim":"Band","accent":"Star"},"ways":{"blue":["#4773cc","#fab826","#fab826"],"purple":["#8047bf","#bf8cf2","#ffd126"],"black":["#26262e","#8047bf","#9ed14c"]},"deathLift":[-3.25,-3.06,-2.56,-2.48,-2.55,-2.69,-2.87,-3.05,-3.15,-3.05,-2.93,-2.8,-2.69,-2.59,-2.51,-2.44,-2.4,-2.38,-2.39,-2.4,-2.41,-2.42,-2.46,-2.61,-2.68,-2.62,-2.78,-3.03,-3.15,-3.23,-3.05,-2.46,-1.23,0.2,0.71,0.61,0.45,0.35,0.51,0.84,0.98,0.87,0.86,1,1.04,1.04,1.05,1.05,1.06,1.07,1.07,1.07,1.07,1.07,1.07,1.07,1.07,1.07,1.07,1.07,1.07,1.07,1.07,1.07,1.07,1.07,1.07],"file":"hat-wizard.glb"},"crown":{"channels":{"main":"Velvet","trim":"Gold","accent":"Jewels"},"ways":{"royal":["#eb4040","#fab826","#66bff2"],"purple":["#8047bf","#fab826","#9ed14c"],"silver":["#333861","#d1d6e0","#ff66a6"]},"deathLift":[-3.34,-3.12,-2.73,-2.64,-2.67,-2.77,-2.92,-3.09,-3.18,-3.12,-3.02,-2.91,-2.8,-2.7,-2.61,-2.54,-2.51,-2.51,-2.55,-2.62,-2.59,-2.56,-2.56,-2.71,-2.89,-2.77,-2.91,-3.09,-3.19,-3.27,-3.16,-2.76,-1.78,-0.22,0.52,0.29,0.01,-0.17,0.01,0.43,0.63,0.45,0.41,0.57,0.61,0.62,0.62,0.63,0.63,0.64,0.64,0.64,0.64,0.64,0.64,0.64,0.64,0.64,0.64,0.64,0.64,0.64,0.64,0.64,0.64,0.64,0.64],"file":"hat-crown.glb"},"ranger-cap":{"channels":{"main":"Cap","trim":"Band","accent":"Feather"},"ways":{"green":["#4c9e66","#8c613d","#eb4040"],"brown":["#8c613d","#4c9e66","#f7f7f7"],"red":["#eb4040","#fab826","#f7f7f7"]},"deathLift":[-3.28,-3.04,-2.64,-2.56,-2.59,-2.71,-2.86,-3.02,-3.12,-3.05,-2.95,-2.84,-2.74,-2.64,-2.55,-2.48,-2.45,-2.44,-2.46,-2.52,-2.51,-2.48,-2.5,-2.65,-2.8,-2.7,-2.84,-3.03,-3.12,-3.2,-3.07,-2.64,-1.64,-0.35,0.4,0.06,-0.15,-0.28,-0.12,0.21,0.37,0.23,0.2,0.34,0.37,0.38,0.38,0.39,0.39,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4],"file":"hat-ranger-cap.glb"},"none":{"channels":{},"ways":{"-":["#ffffff"]}}},"ears":{"elf":{"channels":{"main":"Inner ear"},"ways":{"pink":["#f29ea3"],"peach":["#fabf9e"],"lilac":["#bf8cf2"]},"file":"ears-elf.glb"},"pixie":{"channels":{"main":"Inner ear"},"ways":{"pink":["#f29ea3"],"peach":["#fabf9e"],"mint":["#8cd9b8"]},"file":"ears-pixie.glb"},"goblin":{"channels":{"main":"Inner ear"},"ways":{"pink":["#f29ea3"],"olive":["#8c994c"],"rose":["#f2738c"]},"file":"ears-goblin.glb"},"none":{"channels":{},"ways":{"-":["#ffffff"]}}},"horns":{"devil":{"channels":{"main":"Horn","trim":"Tip"},"ways":{"red":["#eb4040","#80141a"],"black":["#26262e","#eb4040"],"gold":["#fab826","#fa8c33"]},"file":"horns-devil.glb"},"bull":{"channels":{"main":"Horn","trim":"Tip"},"ways":{"ivory":["#f2e6c7","#404559"],"black":["#26262e","#8c99b2"],"brown":["#d9b280","#8c613d"]},"file":"horns-bull.glb"},"ram":{"channels":{"main":"Horn","trim":"Ridges"},"ways":{"tan":["#d9b280","#8c613d"],"grey":["#8c99b2","#404559"],"gold":["#fab826","#fa8c33"]},"file":"horns-ram.glb"},"unicorn":{"channels":{"main":"Horn","trim":"Spiral"},"ways":{"gold":["#fab826","#f7f7f7"],"pearl":["#f7f7f7","#bf8cf2"],"rainbow":["#ff66a6","#66bff2"]},"file":"horns-unicorn.glb"},"antlers":{"channels":{"main":"Antler"},"ways":{"tan":["#d9b280"],"brown":["#8c613d"],"white":["#faf2e0"]},"file":"horns-antlers.glb"},"none":{"channels":{},"ways":{"-":["#ffffff"]}}},"eyewear":{"none":{"channels":{},"ways":{"-":["#ffffff"]}}},"markings":{"none":{"channels":{},"ways":{"-":["#ffffff"]}}},"muzzle":{"none":{"channels":{},"ways":{"-":["#ffffff"]}}},"mouth":{"tusks":{"channels":{"main":"Tusks"},"ways":{"ivory":["#f7f0d6"],"yellowed":["#e6d18c"]},"file":"mouth-tusks.glb"},"fangs":{"channels":{"main":"Fangs"},"ways":{"white":["#f7f7f7"]},"file":"mouth-fangs.glb"},"none":{"channels":{},"ways":{"-":["#ffffff"]}}},"neck":{"none":{"channels":{},"ways":{"-":["#ffffff"]}}},"top":{"tunic":{"channels":{"main":"Tunic","trim":"Belt","accent":"Border and sash"},"ways":{"white":["#faf2e0","#8c613d","#eb4040"],"red":["#eb4040","#fab826","#fab826"],"blue":["#66bff2","#8c613d","#333861"]},"full":true,"deathLift":[-0.24,-0.19,-0.1,-0.06,-0.06,-0.06,-0.06,-0.07,-0.07,-0.09,-0.1,-0.12,-0.13,-0.13,-0.1,-0.07,-0.04,-0.02,-0.02,-0.03,-0.04,-0.07,-0.09,-0.09,-0.09,-0.07,-0.1,-0.18,-0.22,-0.27,-0.29,-0.3,-0.4,-0.69,-1,-0.84,-0.73,-0.68,-0.71,-0.81,-0.87,-0.78,-0.76,-0.79,-0.79,-0.78,-0.78,-0.77,-0.77,-0.76,-0.76,-0.76,-0.76,-0.76,-0.76,-0.76,-0.76,-0.76,-0.76,-0.76,-0.76,-0.76,-0.76,-0.76,-0.76,-0.76,-0.76],"file":"top-tunic.glb"},"gown":{"channels":{"main":"Gown","trim":"Girdle and neckline","accent":"Hem"},"ways":{"blue":["#4773cc","#fab826","#fab826"],"green":["#4c9e66","#fab826","#faf2e0"],"red":["#eb4040","#fab826","#fab826"],"lilac":["#bf8cf2","#f7f7f7","#8047bf"]},"full":true,"deathLift":[-0.26,-0.2,-0.1,-0.06,-0.07,-0.08,-0.09,-0.09,-0.1,-0.11,-0.11,-0.12,-0.13,-0.12,-0.1,-0.08,-0.06,-0.05,-0.04,-0.05,-0.06,-0.08,-0.11,-0.11,-0.08,-0.06,-0.11,-0.2,-0.24,-0.28,-0.27,-0.24,-0.31,-0.57,-0.88,-0.71,-0.59,-0.52,-0.56,-0.66,-0.72,-0.63,-0.6,-0.63,-0.64,-0.63,-0.63,-0.62,-0.62,-0.61,-0.61,-0.61,-0.61,-0.61,-0.61,-0.61,-0.61,-0.61,-0.61,-0.61,-0.61,-0.61,-0.61,-0.61,-0.61,-0.61,-0.61],"file":"top-gown.glb"},"armour":{"channels":{"main":"Plate","trim":"Trim","accent":"Crest"},"ways":{"steel":["#b8bdc7","#8c919e","#eb4040"],"gold":["#fab826","#cc8c1f","#4773cc"],"black":["#404559","#8c99b2","#8047bf"]},"outer":true,"deathLift":[-0.32,-0.26,-0.17,-0.13,-0.13,-0.12,-0.12,-0.12,-0.12,-0.13,-0.15,-0.17,-0.19,-0.19,-0.15,-0.11,-0.08,-0.07,-0.06,-0.08,-0.1,-0.13,-0.15,-0.15,-0.15,-0.12,-0.16,-0.25,-0.29,-0.34,-0.35,-0.34,-0.42,-0.66,-0.94,-0.79,-0.68,-0.62,-0.65,-0.74,-0.79,-0.71,-0.68,-0.71,-0.72,-0.71,-0.71,-0.7,-0.7,-0.69,-0.69,-0.69,-0.69,-0.69,-0.69,-0.69,-0.69,-0.69,-0.69,-0.69,-0.69,-0.69,-0.69,-0.69,-0.69,-0.69,-0.69],"file":"top-armour.glb"},"robe":{"channels":{"main":"Robe","trim":"Belt and collar","accent":"Stripe"},"ways":{"blue":["#4773cc","#fab826","#fab826"],"purple":["#8047bf","#fab826","#bf8cf2"],"grey":["#8c99b2","#f7f7f7","#66bff2"],"red":["#eb4040","#fab826","#26262e"]},"full":true,"deathLift":[-0.32,-0.25,-0.13,-0.1,-0.11,-0.11,-0.12,-0.13,-0.13,-0.14,-0.14,-0.15,-0.16,-0.15,-0.13,-0.11,-0.09,-0.08,-0.07,-0.08,-0.1,-0.12,-0.15,-0.16,-0.12,-0.1,-0.15,-0.25,-0.29,-0.32,-0.3,-0.23,-0.25,-0.46,-0.75,-0.57,-0.44,-0.36,-0.38,-0.49,-0.55,-0.46,-0.42,-0.45,-0.46,-0.45,-0.44,-0.44,-0.43,-0.42,-0.42,-0.42,-0.42,-0.42,-0.42,-0.42,-0.42,-0.42,-0.42,-0.42,-0.42,-0.42,-0.42,-0.42,-0.42,-0.42,-0.42],"file":"top-robe.glb"},"ranger":{"channels":{"main":"Tunic","trim":"Shirt","accent":"Belt and strap"},"ways":{"green":["#4c9e66","#faf2e0","#8c613d"],"brown":["#8c613d","#4c9e66","#26262e"],"grey":["#8c99b2","#faf2e0","#8c613d"]},"outer":true,"file":"top-ranger.glb"},"none":{"channels":{},"ways":{"-":["#ffffff"]}}},"bottom":{"pants":{"channels":{"main":"Trousers","trim":"Turn-ups"},"ways":{"charcoal":["#404559","#404559"],"khaki":["#d9b280","#d9b280"],"brown":["#665240","#665240"],"grey":["#8c99b2","#8c99b2"],"yellow":["#ffd126","#ffd126"],"red":["#eb4040","#eb4040"]},"deathLift":[-0.23,-0.22,-0.19,-0.18,-0.18,-0.18,-0.19,-0.19,-0.2,-0.2,-0.21,-0.21,-0.21,-0.21,-0.2,-0.19,-0.18,-0.17,-0.17,-0.17,-0.17,-0.18,-0.18,-0.18,-0.17,-0.17,-0.19,-0.23,-0.26,-0.29,-0.32,-0.39,-0.56,-0.83,-1.05,-0.93,-0.84,-0.79,-0.81,-0.88,-0.92,-0.85,-0.83,-0.85,-0.85,-0.84,-0.84,-0.83,-0.83,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82],"file":"bottom-pants.glb"},"jeans":{"channels":{"main":"Denim","trim":"Rips","accent":"Pockets and belt"},"ways":{"light":["#7399d9","#f2ebd9","#6185c7"],"dark":["#333861","#66bff2","#8c613d"],"black":["#26262e","#8c99b2","#404559"]},"file":"bottom-jeans.glb"},"leggings":{"channels":{"main":"Leggings","trim":"Stripe"},"ways":{"black":["#26262e","#ff66a6"],"navy":["#333861","#f7f7f7"],"purple":["#8047bf","#9ed14c"],"pink":["#ff66a6","#f7f7f7"]},"deathLift":[-0.2,-0.19,-0.17,-0.16,-0.16,-0.16,-0.16,-0.17,-0.17,-0.18,-0.18,-0.18,-0.19,-0.18,-0.18,-0.17,-0.16,-0.15,-0.15,-0.15,-0.15,-0.15,-0.16,-0.15,-0.15,-0.15,-0.17,-0.2,-0.24,-0.26,-0.3,-0.37,-0.56,-0.83,-1.05,-0.93,-0.84,-0.79,-0.81,-0.88,-0.92,-0.85,-0.83,-0.85,-0.85,-0.84,-0.84,-0.83,-0.83,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82],"file":"bottom-leggings.glb"},"none":{"channels":{},"ways":{"-":["#ffffff"]}}},"shoes":{"bare-feet":{"channels":{},"ways":{"-":["#ffffff"]},"deathLift":[-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.01,0.01,0.02,-0.01,-0.05,-0.07,-0.09,-0.13,-0.23,-0.44,-0.88,-1.24,-1.1,-1,-0.97,-1.01,-1.12,-1.17,-1.1,-1.09,-1.13,-1.14,-1.13,-1.12,-1.12,-1.11,-1.11,-1.11,-1.11,-1.11,-1.11,-1.11,-1.11,-1.11,-1.11,-1.11,-1.11,-1.11,-1.11,-1.11,-1.11,-1.11,-1.11,-1.11],"file":"shoes-bare-feet.glb"},"sneakers":{"channels":{"main":"Shoe","trim":"Laces and sole","accent":"Flash"},"ways":{"white":["#f7f7f7","#e63333","#f7f7f7"],"black":["#26262e","#f7f7f7","#f7f7f7"],"blue":["#4c99f2","#f7f7f7","#f7f7f7"],"red":["#eb4040","#f7f7f7","#ffd126"]},"deathLift":[0.01,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.02,0.04,0.06,0.03,-0.02,-0.05,-0.06,-0.09,-0.17,-0.37,-0.82,-1.21,-1.06,-0.96,-0.92,-0.97,-1.09,-1.14,-1.06,-1.05,-1.1,-1.11,-1.1,-1.1,-1.09,-1.08,-1.08,-1.08,-1.08,-1.08,-1.08,-1.08,-1.08,-1.08,-1.08,-1.08,-1.08,-1.08,-1.08,-1.08,-1.08,-1.08,-1.08,-1.08],"file":"shoes-sneakers.glb"},"boots":{"channels":{"main":"Boot","trim":"Sole","accent":"Laces"},"ways":{"brown":["#8c613d","#404559","#d9b280"],"black":["#26262e","#404559","#eb4040"],"tan":["#d9b280","#8c613d","#eb4040"]},"deathLift":[0.02,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.03,0.05,0.06,0.03,-0.02,-0.04,-0.05,-0.08,-0.16,-0.37,-0.81,-1.21,-1.06,-0.95,-0.92,-0.96,-1.08,-1.14,-1.06,-1.05,-1.09,-1.1,-1.09,-1.08,-1.08,-1.07,-1.06,-1.06,-1.06,-1.06,-1.06,-1.06,-1.06,-1.06,-1.06,-1.06,-1.06,-1.06,-1.06,-1.06,-1.06,-1.06,-1.06,-1.06],"file":"shoes-boots.glb"},"hooves":{"channels":{"main":"Fur","trim":"Hoof"},"ways":{"brown":["#8c613d","#4c382e"],"tan":["#d9b280","#404559"],"white":["#faf2e0","#8c99b2"]},"deathLift":[-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.01,0.01,0.02,-0.01,-0.05,-0.07,-0.09,-0.13,-0.22,-0.44,-0.9,-1.22,-1.09,-1,-0.97,-1,-1.1,-1.14,-1.07,-1.06,-1.09,-1.1,-1.09,-1.09,-1.08,-1.07,-1.07,-1.07,-1.07,-1.07,-1.07,-1.07,-1.07,-1.07,-1.07,-1.07,-1.07,-1.07,-1.07,-1.07,-1.07,-1.07,-1.07,-1.07],"file":"shoes-hooves.glb"},"dragon-feet":{"channels":{"main":"Scales","trim":"Top scales","accent":"Claws"},"ways":{"green":["#4c9e66","#9ed14c","#f7f7f7"],"red":["#eb4040","#fab826","#26262e"],"purple":["#8047bf","#bf8cf2","#f7f7f7"]},"deathLift":[-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,0,0.03,0.05,0.01,-0.05,-0.07,-0.09,-0.11,-0.15,-0.32,-0.72,-1.11,-0.94,-0.83,-0.78,-0.83,-0.95,-1.01,-0.92,-0.91,-0.95,-0.96,-0.96,-0.95,-0.94,-0.94,-0.93,-0.93,-0.93,-0.93,-0.93,-0.93,-0.93,-0.93,-0.93,-0.93,-0.93,-0.93,-0.93,-0.93,-0.93,-0.93,-0.93,-0.93],"file":"shoes-dragon-feet.glb"}},"hands":{"claws":{"channels":{"main":"Claws"},"ways":{"dark":["#404559"],"white":["#faf2e0"],"red":["#eb4040"]},"deathLift":[-0.19,-0.28,-0.55,-0.56,-0.51,-0.43,-0.35,-0.29,-0.26,-0.28,-0.32,-0.37,-0.41,-0.45,-0.45,-0.35,-0.26,-0.18,-0.13,-0.11,-0.1,-0.11,-0.13,-0.15,-0.17,-0.21,-0.21,-0.25,-0.27,-0.28,-0.33,-0.46,-0.71,-1.23,-1.53,-1.63,-1.61,-1.53,-1.44,-1.42,-1.42,-1.42,-1.42,-1.42,-1.41,-1.4,-1.39,-1.38,-1.38,-1.37,-1.37,-1.37,-1.37,-1.37,-1.37,-1.37,-1.37,-1.37,-1.37,-1.37,-1.37,-1.37,-1.37,-1.37,-1.37,-1.37,-1.37],"file":"hands-claws.glb"},"gauntlets":{"channels":{"main":"Plate","trim":"Ridge"},"ways":{"steel":["#b8bdc7","#8c919e"],"gold":["#fab826","#cc8c1f"]},"file":"hands-gauntlets.glb"},"none":{"channels":{},"ways":{"-":["#ffffff"]}}},"back":{"fairy-wings":{"channels":{"main":"Wings","trim":"Veins"},"ways":{"pink":["#ff66a6","#f7f7f7"],"mint":["#8cd9b8","#33b2b2"],"lilac":["#bf8cf2","#8047bf"]},"deathLift":[-0.33,-0.26,-0.15,-0.11,-0.1,-0.09,-0.07,-0.06,-0.06,-0.07,-0.09,-0.12,-0.15,-0.16,-0.11,-0.07,-0.03,-0.01,-0.01,-0.03,-0.06,-0.1,-0.15,-0.22,-0.3,-0.3,-0.27,-0.24,-0.28,-0.33,-0.33,-0.28,-0.31,-0.52,-0.8,-0.63,-0.51,-0.43,-0.46,-0.55,-0.61,-0.52,-0.49,-0.51,-0.52,-0.51,-0.51,-0.5,-0.5,-0.49,-0.49,-0.49,-0.49,-0.49,-0.49,-0.49,-0.49,-0.49,-0.49,-0.49,-0.49,-0.49,-0.49,-0.49,-0.49,-0.49,-0.49],"file":"back-fairy-wings.glb"},"bat-wings":{"channels":{"main":"Wings","trim":"Bones"},"ways":{"black":["#404559","#26262e"],"purple":["#8047bf","#404559"],"red":["#eb4040","#80141a"]},"file":"back-bat-wings.glb"},"angel-wings":{"channels":{"main":"Feathers"},"ways":{"white":["#f7f7f7"],"gold":["#fab826"],"black":["#404559"]},"deathLift":[-0.42,-0.35,-0.23,-0.19,-0.18,-0.17,-0.15,-0.14,-0.13,-0.14,-0.17,-0.2,-0.23,-0.24,-0.19,-0.14,-0.1,-0.08,-0.08,-0.1,-0.13,-0.18,-0.23,-0.31,-0.4,-0.41,-0.37,-0.33,-0.37,-0.42,-0.41,-0.34,-0.35,-0.51,-0.76,-0.6,-0.47,-0.39,-0.41,-0.5,-0.56,-0.47,-0.43,-0.46,-0.46,-0.45,-0.45,-0.44,-0.44,-0.43,-0.43,-0.43,-0.43,-0.43,-0.43,-0.43,-0.43,-0.43,-0.43,-0.43,-0.43,-0.43,-0.43,-0.43,-0.43,-0.43,-0.43],"file":"back-angel-wings.glb"},"cape":{"channels":{"main":"Cape","trim":"Clasp"},"ways":{"red":["#eb4040","#fab826"],"purple":["#8047bf","#fab826"],"black":["#26262e","#d1d6e0"],"blue":["#4773cc","#ffd126"]},"deathLift":[-0.44,-0.38,-0.28,-0.24,-0.24,-0.23,-0.23,-0.22,-0.22,-0.23,-0.25,-0.27,-0.29,-0.29,-0.26,-0.22,-0.19,-0.17,-0.17,-0.18,-0.21,-0.24,-0.28,-0.32,-0.37,-0.37,-0.36,-0.37,-0.41,-0.46,-0.46,-0.43,-0.48,-0.66,-0.9,-0.76,-0.65,-0.58,-0.61,-0.69,-0.73,-0.66,-0.62,-0.65,-0.65,-0.64,-0.64,-0.63,-0.63,-0.62,-0.62,-0.62,-0.62,-0.62,-0.62,-0.62,-0.62,-0.62,-0.62,-0.62,-0.62,-0.62,-0.62,-0.62,-0.62,-0.62,-0.62],"file":"back-cape.glb"},"none":{"channels":{},"ways":{"-":["#ffffff"]}}},"tail":{"devil":{"channels":{"main":"Tail","trim":"Spade"},"ways":{"red":["#eb4040","#80141a"],"black":["#26262e","#eb4040"],"purple":["#8047bf","#ff66a6"]},"deathLift":[-0.42,-0.35,-0.24,-0.21,-0.22,-0.24,-0.25,-0.27,-0.27,-0.28,-0.28,-0.27,-0.27,-0.26,-0.25,-0.23,-0.22,-0.21,-0.22,-0.23,-0.25,-0.28,-0.3,-0.34,-0.39,-0.42,-0.4,-0.37,-0.4,-0.43,-0.41,-0.26,-0.13,-0.11,-0.13,0,0.14,0.29,0.34,0.32,0.28,0.37,0.44,0.47,0.47,0.48,0.49,0.49,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5],"file":"tail-devil.glb"},"dragon":{"channels":{"main":"Scales","trim":"Belly","accent":"Spikes"},"ways":{"green":["#4c9e66","#fae059","#fa8c33"],"red":["#eb4040","#fab826","#26262e"],"purple":["#8047bf","#bf8cf2","#9ed14c"]},"deathLift":[-0.12,-0.03,0.14,0.17,0.14,0.1,0.07,0.06,0.06,0.07,0.09,0.12,0.14,0.16,0.18,0.2,0.21,0.21,0.18,0.14,0.1,0.05,0.01,-0.07,-0.17,-0.22,-0.18,-0.08,-0.09,-0.1,0.03,0.29,0.55,0.53,0.21,0.49,0.73,0.92,0.9,0.77,0.66,0.81,0.89,0.86,0.86,0.86,0.87,0.87,0.88,0.89,0.89,0.89,0.89,0.89,0.89,0.89,0.89,0.89,0.89,0.89,0.89,0.89,0.89,0.89,0.89,0.89,0.89],"file":"tail-dragon.glb"},"fox":{"channels":{"main":"Fur","trim":"Tip"},"ways":{"red":["#fa8c33","#f7f7f7"],"silver":["#8c99b2","#f7f7f7"],"arctic":["#f7f7f7","#66bff2"]},"deathLift":[-0.38,-0.31,-0.19,-0.16,-0.17,-0.19,-0.2,-0.21,-0.22,-0.22,-0.22,-0.22,-0.22,-0.21,-0.2,-0.18,-0.17,-0.17,-0.17,-0.19,-0.22,-0.24,-0.26,-0.31,-0.37,-0.39,-0.37,-0.33,-0.35,-0.38,-0.35,-0.18,-0.02,0.12,0.08,0.23,0.39,0.57,0.62,0.6,0.56,0.65,0.73,0.76,0.77,0.78,0.78,0.79,0.8,0.8,0.8,0.8,0.8,0.8,0.8,0.8,0.8,0.8,0.8,0.8,0.8,0.8,0.8,0.8,0.8,0.8,0.8],"file":"tail-fox.glb"},"none":{"channels":{},"ways":{"-":["#ffffff"]}}},"prop":{"wand":{"channels":{"main":"Stick","trim":"Star"},"ways":{"gold":["#8047bf","#fab826"],"pink":["#f7f7f7","#ff66a6"],"silver":["#333861","#d9dee6"]},"file":"prop-wand.glb"},"axe":{"channels":{"main":"Blade","trim":"Haft","accent":"Socket"},"ways":{"steel":["#d1d6e0","#8c613d","#404559"],"gold":["#fab826","#8c613d","#eb4040"]},"file":"prop-axe.glb"},"hammer":{"channels":{"main":"Head","trim":"Haft","accent":"Bands"},"ways":{"iron":["#404559","#8c613d","#fab826"],"toy":["#eb4040","#ffd126","#f7f7f7"],"stone":["#8c99b2","#8c613d","#d9b280"]},"file":"prop-hammer.glb"},"sword":{"channels":{"main":"Blade","trim":"Guard and pommel","accent":"Grip"},"ways":{"steel":["#d1d6e0","#fab826","#8c613d"],"wood":["#d9b280","#8c613d","#eb4040"],"crystal":["#66bff2","#8047bf","#f7f7f7"]},"file":"prop-sword.glb"},"staff":{"channels":{"main":"Staff","trim":"Claw","accent":"Crystal"},"ways":{"wood":["#8c613d","#fab826","#66bff2"],"dark":["#404559","#8047bf","#9ed14c"],"white":["#faf2e0","#fab826","#ff66a6"]},"file":"prop-staff.glb"},"potion":{"channels":{"main":"Neck","trim":"Cork","accent":"Potion"},"ways":{"red":["#66bff2","#d9b280","#eb4040"],"green":["#66bff2","#d9b280","#9ed14c"],"purple":["#66bff2","#d9b280","#8047bf"]},"file":"prop-potion.glb"},"bow":{"channels":{"main":"Bow","trim":"String and grip"},"ways":{"wood":["#8c613d","#faf2e0"],"elven":["#fab826","#f7f7f7"],"dark":["#404559","#eb4040"]},"deathLift":[0.37,0.31,0.14,0.14,0.16,0.18,0.17,0.15,0.13,0.11,0.11,0.12,0.14,0.18,0.23,0.29,0.34,0.39,0.42,0.44,0.44,0.44,0.44,0.43,0.42,0.4,0.36,0.3,0.28,0.28,0.24,0.1,-0.2,-0.98,-1.34,-1.15,-1.1,-1.09,-1.12,-1.23,-1.29,-1.23,-1.22,-1.26,-1.26,-1.26,-1.25,-1.25,-1.24,-1.24,-1.24,-1.24,-1.24,-1.24,-1.24,-1.24,-1.24,-1.24,-1.24,-1.24,-1.24,-1.24,-1.24,-1.24,-1.24,-1.24,-1.24],"file":"prop-bow.glb"},"none":{"channels":{},"ways":{"-":["#ffffff"]}}},"offhand":{"shield":{"channels":{"main":"Face","trim":"Rim","accent":"Boss"},"ways":{"blue":["#4773cc","#fab826","#fab826"],"red":["#eb4040","#d1d6e0","#d1d6e0"],"green":["#4c9e66","#fab826","#f7f7f7"]},"deathLift":[-0.17,-0.28,-0.5,-0.49,-0.44,-0.31,-0.22,-0.18,-0.17,-0.2,-0.24,-0.29,-0.33,-0.36,-0.38,-0.39,-0.39,-0.39,-0.39,-0.38,-0.37,-0.35,-0.31,-0.26,-0.19,-0.12,-0.13,-0.2,-0.23,-0.24,-0.31,-0.46,-0.77,-1.37,-1.55,-1.6,-1.59,-1.54,-1.49,-1.48,-1.48,-1.47,-1.47,-1.46,-1.46,-1.45,-1.44,-1.44,-1.43,-1.42,-1.42,-1.42,-1.42,-1.42,-1.42,-1.42,-1.42,-1.42,-1.42,-1.42,-1.42,-1.42,-1.42,-1.42,-1.42,-1.42,-1.42],"file":"offhand-shield.glb"},"torch":{"channels":{"main":"Stick","trim":"Wrap","accent":"Flame"},"ways":{"fire":["#8c613d","#d9b280","#fa8c33"],"magic":["#404559","#8047bf","#66bff2"]},"file":"offhand-torch.glb"},"spellbook":{"channels":{"main":"Cover","trim":"Pages","accent":"Emblem"},"ways":{"red":["#eb4040","#faf2e0","#fab826"],"purple":["#8047bf","#faf2e0","#9ed14c"],"brown":["#8c613d","#faf2e0","#66bff2"]},"deathLift":[-0.18,-0.22,-0.36,-0.35,-0.32,-0.26,-0.22,-0.18,-0.17,-0.18,-0.21,-0.25,-0.29,-0.32,-0.34,-0.35,-0.36,-0.37,-0.38,-0.38,-0.37,-0.35,-0.31,-0.25,-0.18,-0.12,-0.13,-0.21,-0.24,-0.25,-0.31,-0.39,-0.59,-1.14,-1.47,-1.44,-1.4,-1.31,-1.23,-1.26,-1.29,-1.28,-1.29,-1.3,-1.3,-1.28,-1.27,-1.27,-1.26,-1.26,-1.26,-1.26,-1.26,-1.26,-1.26,-1.26,-1.26,-1.26,-1.26,-1.26,-1.26,-1.26,-1.26,-1.26,-1.26,-1.26,-1.26],"file":"offhand-spellbook.glb"},"orb":{"channels":{"main":"-","trim":"Claw","accent":"Orb"},"ways":{"blue":["#fab826","#fab826","#66bff2"],"purple":["#fab826","#fab826","#8047bf"],"green":["#404559","#404559","#9ed14c"]},"file":"offhand-orb.glb"},"none":{"channels":{},"ways":{"-":["#ffffff"]}}},"ride":{"none":{"channels":{},"ways":{"-":["#ffffff"]}}}},"looks":{"wizard":{"skin":0,"hair":{"item":"crop","way":"black"},"hat":{"item":"wizard","way":"blue"},"ears":{"item":"none"},"horns":{"item":"none"},"eyewear":{"item":"none"},"markings":{"item":"none"},"muzzle":{"item":"none"},"mouth":{"item":"none"},"neck":{"item":"none"},"top":{"item":"robe","way":"blue"},"bottom":{"item":"none"},"shoes":{"item":"sneakers","way":"white"},"hands":{"item":"none"},"back":{"item":"none"},"tail":{"item":"none"},"prop":{"item":"staff","way":"wood"},"offhand":{"item":"spellbook","way":"red"},"ride":{"item":"none"}},"orc":{"skin":"#8cb861","hair":{"item":"mohawk","way":"punk"},"hat":{"item":"none"},"ears":{"item":"goblin","way":"pink"},"horns":{"item":"none"},"eyewear":{"item":"none"},"markings":{"item":"none"},"muzzle":{"item":"none"},"mouth":{"item":"tusks","way":"ivory"},"neck":{"item":"none"},"top":{"item":"armour","way":"black"},"bottom":{"item":"pants","way":"charcoal"},"shoes":{"item":"boots","way":"black"},"hands":{"item":"none"},"back":{"item":"none"},"tail":{"item":"none"},"prop":{"item":"axe","way":"steel"},"offhand":{"item":"shield","way":"blue"},"ride":{"item":"none"}},"fairy":{"skin":"#c7adf2","hair":{"item":"braids","way":"black"},"hat":{"item":"none"},"ears":{"item":"pixie","way":"pink"},"horns":{"item":"none"},"eyewear":{"item":"none"},"markings":{"item":"none"},"muzzle":{"item":"none"},"mouth":{"item":"none"},"neck":{"item":"none"},"top":{"item":"gown","way":"lilac"},"bottom":{"item":"none"},"shoes":{"item":"sneakers","way":"white"},"hands":{"item":"none"},"back":{"item":"fairy-wings","way":"pink"},"tail":{"item":"none"},"prop":{"item":"wand","way":"gold"},"offhand":{"item":"none"},"ride":{"item":"none"}},"elf-ranger":{"skin":3,"hair":{"item":"ponytail","way":"black"},"hat":{"item":"ranger-cap","way":"green"},"ears":{"item":"elf","way":"pink"},"horns":{"item":"none"},"eyewear":{"item":"none"},"markings":{"item":"none"},"muzzle":{"item":"none"},"mouth":{"item":"none"},"neck":{"item":"none"},"top":{"item":"ranger","way":"green"},"bottom":{"item":"leggings","way":"black"},"shoes":{"item":"boots","way":"brown"},"hands":{"item":"none"},"back":{"item":"cape","way":"red"},"tail":{"item":"none"},"prop":{"item":"bow","way":"wood"},"offhand":{"item":"none"},"ride":{"item":"none"}},"imp":{"skin":"#e66b61","hair":{"item":"buzz","way":"black"},"hat":{"item":"none"},"ears":{"item":"none"},"horns":{"item":"devil","way":"red"},"eyewear":{"item":"none"},"markings":{"item":"none"},"muzzle":{"item":"none"},"mouth":{"item":"fangs","way":"white"},"neck":{"item":"none"},"top":{"item":"tunic","way":"red"},"bottom":{"item":"none"},"shoes":{"item":"sneakers","way":"white"},"hands":{"item":"none"},"back":{"item":"bat-wings","way":"black"},"tail":{"item":"devil","way":"red"},"prop":{"item":"none"},"offhand":{"item":"none"},"ride":{"item":"none"}},"dragon-kid":{"skin":5,"hair":{"item":"afro","way":"black"},"hat":{"item":"none"},"ears":{"item":"none"},"horns":{"item":"bull","way":"ivory"},"eyewear":{"item":"none"},"markings":{"item":"none"},"muzzle":{"item":"none"},"mouth":{"item":"none"},"neck":{"item":"none"},"top":{"item":"tunic","way":"white"},"bottom":{"item":"leggings","way":"black"},"shoes":{"item":"dragon-feet","way":"green"},"hands":{"item":"claws","way":"dark"},"back":{"item":"none"},"tail":{"item":"dragon","way":"green"},"prop":{"item":"none"},"offhand":{"item":"none"},"ride":{"item":"none"}},"unicorn":{"skin":0,"hair":{"item":"mohawk","way":"punk"},"hat":{"item":"none"},"ears":{"item":"none"},"horns":{"item":"unicorn","way":"gold"},"eyewear":{"item":"none"},"markings":{"item":"none"},"muzzle":{"item":"none"},"mouth":{"item":"none"},"neck":{"item":"none"},"top":{"item":"gown","way":"blue"},"bottom":{"item":"none"},"shoes":{"item":"hooves","way":"brown"},"hands":{"item":"none"},"back":{"item":"none"},"tail":{"item":"fox","way":"red"},"prop":{"item":"none"},"offhand":{"item":"none"},"ride":{"item":"none"}},"angel":{"skin":1,"hair":{"item":"crop","way":"black"},"hat":{"item":"none"},"ears":{"item":"none"},"horns":{"item":"none"},"eyewear":{"item":"none"},"markings":{"item":"none"},"muzzle":{"item":"none"},"mouth":{"item":"none"},"neck":{"item":"none"},"top":{"item":"robe","way":"grey"},"bottom":{"item":"none"},"shoes":{"item":"sneakers","way":"white"},"hands":{"item":"none"},"back":{"item":"angel-wings","way":"white"},"tail":{"item":"none"},"prop":{"item":"none"},"offhand":{"item":"orb","way":"blue"},"ride":{"item":"none"}},"goblin":{"skin":"#adc759","hair":{"item":"long","way":"black"},"hat":{"item":"none"},"ears":{"item":"goblin","way":"pink"},"horns":{"item":"none"},"eyewear":{"item":"none"},"markings":{"item":"none"},"muzzle":{"item":"none"},"mouth":{"item":"fangs","way":"white"},"neck":{"item":"none"},"top":{"item":"tunic","way":"white"},"bottom":{"item":"none"},"shoes":{"item":"bare-feet","way":"-"},"hands":{"item":"none"},"back":{"item":"none"},"tail":{"item":"none"},"prop":{"item":"none"},"offhand":{"item":"torch","way":"fire"},"ride":{"item":"none"}},"paladin":{"skin":3,"hair":{"item":"braids","way":"black"},"hat":{"item":"crown","way":"royal"},"ears":{"item":"none"},"horns":{"item":"none"},"eyewear":{"item":"none"},"markings":{"item":"none"},"muzzle":{"item":"none"},"mouth":{"item":"none"},"neck":{"item":"none"},"top":{"item":"armour","way":"gold"},"bottom":{"item":"pants","way":"charcoal"},"shoes":{"item":"sneakers","way":"white"},"hands":{"item":"gauntlets","way":"steel"},"back":{"item":"none"},"tail":{"item":"none"},"prop":{"item":"hammer","way":"iron"},"offhand":{"item":"shield","way":"blue"},"ride":{"item":"none"}},"ghoul":{"skin":"#d1dbcc","hair":{"item":"ponytail","way":"black"},"hat":{"item":"none"},"ears":{"item":"none"},"horns":{"item":"none"},"eyewear":{"item":"none"},"markings":{"item":"none"},"muzzle":{"item":"none"},"mouth":{"item":"none"},"neck":{"item":"none"},"top":{"item":"robe","way":"purple"},"bottom":{"item":"none"},"shoes":{"item":"sneakers","way":"white"},"hands":{"item":"none"},"back":{"item":"none"},"tail":{"item":"none"},"prop":{"item":"potion","way":"red"},"offhand":{"item":"orb","way":"blue"},"ride":{"item":"none"}}},"skinTones":["#fcdbbd","#f2c79e","#e0a87a","#bd8052","#8f5936","#613b24"],"suggest":{"cloth":{"red":"#eb4040","tomato":"#f26b4c","orange":"#fa8c33","gold":"#fab826","yellow":"#ffd126","butter":"#fae059","lime":"#9ed14c","green":"#4c9e66","mint":"#8cd9b8","teal":"#33b2b2","sky":"#66bff2","blue":"#4773cc","navy":"#333861","purple":"#8047bf","lilac":"#bf8cf2","pink":"#ff66a6","rose":"#f2738c","brown":"#8c613d","tan":"#d9b280","cream":"#faf2e0","white":"#f7f7f7","grey":"#8c99b2","charcoal":"#404559","black":"#26262e"},"hair":{"black":"#1a1412","dark":"#402617","brown":"#7a4c29","chestnut":"#6b331a","ginger":"#e66b24","copper":"#cc541f","blonde":"#facc5c","platinum":"#f5f0d6","pink":"#ff73b2","blue":"#384c9e"},"skin":{"orc":"#8cb861","goblin":"#adc759","sea":"#73b8cc","blue":"#7394e6","fairy":"#c7adf2","imp":"#e66b61","alien":"#9ea8b2","ghoul":"#d1dbcc"}},"clips":["idle","walk","run","jump","pick-up","celebrate","scared","attack","trick-or-treat","wave","hit","sad","sneak","spin","idle-peek","idle-yawn","idle-look","dance-wiggle","dance-robot","run-jump","eat-candy","death","aim","run-aim","shoot","ready","slash","smash","fly","lift-off","snowboard","ski","sled"],"oneShots":["death","lift-off"],"deathLiftStep":0.03333333333333333,"baseDeathLift":[-0.22,-0.21,-0.18,-0.17,-0.17,-0.18,-0.18,-0.18,-0.19,-0.2,-0.2,-0.2,-0.2,-0.2,-0.19,-0.18,-0.17,-0.17,-0.16,-0.16,-0.17,-0.17,-0.17,-0.17,-0.17,-0.16,-0.19,-0.22,-0.25,-0.28,-0.32,-0.39,-0.57,-0.59,0,-0.31,-0.44,-0.46,-0.37,-0.23,-0.03,-0.2,-0.19,-0.12,-0.1,-0.09,-0.09,-0.08,-0.08,-0.07,-0.07,-0.07,-0.07,-0.07,-0.07,-0.07,-0.07,-0.07,-0.07,-0.07,-0.07,-0.07,-0.07,-0.07,-0.07,-0.07,-0.07]};

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
