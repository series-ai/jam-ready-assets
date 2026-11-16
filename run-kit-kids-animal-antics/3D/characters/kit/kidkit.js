// Kit Kids: Animal Antics. An avatar kit for three.js: mix-and-match kids.
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
//   const kit = await loadKidKit('assets/run-kit-kids-animal-antics/kit/');  // the folder with the GLBs (the catalog is built in)
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
export const CATALOG = {"slots":["hair","hat","ears","horns","eyewear","markings","muzzle","mouth","neck","top","bottom","shoes","hands","back","tail","prop","offhand","ride"],"slotLabels":{"horns":"Horns & antennae","mouth":"Tusks & fangs","muzzle":"Animal muzzle","back":"On the back","prop":"Left hand","offhand":"Right hand","ride":"Ride on"},"channels":["main","trim","accent","detail"],"items":{"hair":{"crop":{"channels":{"main":"Hair"},"ways":{"black":["#1a1412"],"dark":["#402617"],"brown":["#7a4c29"],"chestnut":["#6b331a"],"ginger":["#e66b24"],"copper":["#cc541f"],"blonde":["#facc5c"],"platinum":["#f5f0d6"],"pink":["#ff73b2"],"blue":["#384c9e"]},"deathLift":[-2.62,-2.45,-2.15,-2.07,-2.09,-2.17,-2.28,-2.41,-2.48,-2.44,-2.36,-2.29,-2.21,-2.13,-2.06,-2.01,-1.97,-1.97,-2,-2.05,-2.03,-2.01,-2.01,-2.12,-2.26,-2.24,-2.33,-2.42,-2.51,-2.58,-2.51,-2.23,-1.49,-0.51,0.16,-0.14,-0.33,-0.43,-0.3,-0.03,0.16,-0.01,-0.02,0.09,0.12,0.13,0.13,0.14,0.14,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15],"file":"hair-crop.glb","hatDeathLift":[-2.62,-2.45,-2.15,-2.07,-2.09,-2.17,-2.28,-2.41,-2.48,-2.44,-2.36,-2.29,-2.21,-2.13,-2.06,-2.01,-1.97,-1.97,-2,-2.05,-2.03,-2.01,-2.01,-2.12,-2.26,-2.24,-2.33,-2.42,-2.51,-2.58,-2.51,-2.23,-1.49,-0.51,0.06,-0.15,-0.33,-0.43,-0.3,-0.03,0.14,-0.01,-0.02,0.09,0.12,0.13,0.13,0.14,0.14,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15],"hatFile":"hair-crop-hat.glb"},"long":{"channels":{"main":"Hair","trim":"Flower"},"ways":{"black":["#1a1412","#ffffff"],"dark":["#402617","#ffffff"],"brown":["#7a4c29","#ffffff"],"chestnut":["#6b331a","#ffffff"],"ginger":["#e66b24","#ffffff"],"copper":["#cc541f","#ffffff"],"blonde":["#facc5c","#ffffff"],"platinum":["#f5f0d6","#ffffff"],"pink":["#ff73b2","#ffffff"],"blue":["#384c9e","#ffffff"]},"deathLift":[-1.35,-1.24,-0.93,-0.85,-0.87,-0.94,-1.05,-1.17,-1.23,-1.15,-1.08,-1.01,-0.95,-0.89,-0.82,-0.77,-0.74,-0.74,-0.78,-0.85,-0.82,-0.78,-0.78,-0.88,-0.93,-0.86,-0.97,-1.15,-1.27,-1.37,-1.3,-1.05,-0.58,-0.26,0.24,-0.05,-0.08,-0.01,0.04,0.08,0.25,0.12,0.17,0.21,0.22,0.23,0.23,0.24,0.24,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25],"file":"hair-long.glb","hatDeathLift":[-1.35,-1.24,-0.93,-0.85,-0.87,-0.94,-1.05,-1.17,-1.23,-1.15,-1.08,-1.01,-0.95,-0.89,-0.82,-0.77,-0.74,-0.74,-0.78,-0.85,-0.82,-0.78,-0.78,-0.88,-0.93,-0.86,-0.97,-1.15,-1.27,-1.37,-1.3,-1.05,-0.58,-0.26,0.01,-0.17,-0.08,-0.01,0.04,0.08,0.07,0.12,0.17,0.21,0.22,0.23,0.23,0.24,0.24,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25],"hatFile":"hair-long-hat.glb"},"braids":{"channels":{"main":"Hair","trim":"Bows"},"ways":{"black":["#1a1412","#59bf8c"],"dark":["#402617","#59bf8c"],"brown":["#7a4c29","#59bf8c"],"chestnut":["#6b331a","#59bf8c"],"ginger":["#e66b24","#59bf8c"],"copper":["#cc541f","#59bf8c"],"blonde":["#facc5c","#59bf8c"],"platinum":["#f5f0d6","#59bf8c"],"pink":["#ff73b2","#59bf8c"],"blue":["#384c9e","#59bf8c"]},"deathLift":[-0.03,-0.01,0.02,0.08,0.13,0.16,0.15,0.11,0.08,0.15,0.21,0.25,0.27,0.28,0.28,0.27,0.24,0.19,0.12,0.03,0.07,0.15,0.22,0.31,0.37,0.37,0.28,0.14,0.01,-0.09,-0.17,-0.31,-0.72,-0.5,0.16,-0.14,-0.32,-0.41,-0.28,-0.03,0.16,0,-0.01,0.09,0.12,0.13,0.13,0.14,0.14,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15],"file":"hair-braids.glb","hatDeathLift":[-0.03,-0.01,0.02,0.08,0.13,0.16,0.15,0.11,0.08,0.15,0.21,0.25,0.27,0.28,0.28,0.27,0.24,0.19,0.12,0.03,0.07,0.15,0.22,0.31,0.37,0.37,0.28,0.14,0.01,-0.09,-0.17,-0.31,-0.72,-0.5,0.06,-0.15,-0.32,-0.41,-0.28,-0.03,0.14,0,-0.01,0.09,0.12,0.13,0.13,0.14,0.14,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15],"hatFile":"hair-braids-hat.glb"},"ponytail":{"channels":{"main":"Hair","trim":"Scrunchie"},"ways":{"black":["#1a1412","#4cb2f2"],"dark":["#402617","#4cb2f2"],"brown":["#7a4c29","#4cb2f2"],"chestnut":["#6b331a","#4cb2f2"],"ginger":["#e66b24","#4cb2f2"],"copper":["#cc541f","#4cb2f2"],"blonde":["#facc5c","#4cb2f2"],"platinum":["#f5f0d6","#4cb2f2"],"pink":["#ff73b2","#4cb2f2"],"blue":["#384c9e","#4cb2f2"]},"deathLift":[-2.28,-2.02,-1.6,-1.55,-1.62,-1.75,-1.9,-2.04,-2.13,-2.15,-2.12,-2.06,-1.98,-1.88,-1.78,-1.68,-1.59,-1.52,-1.48,-1.47,-1.49,-1.53,-1.62,-1.85,-2.14,-2.24,-2.33,-2.14,-2.15,-2.19,-2.03,-1.59,-0.74,0.3,1.03,0.79,0.57,0.48,0.64,0.98,1.2,1,0.99,1.14,1.18,1.19,1.19,1.2,1.21,1.21,1.21,1.21,1.21,1.21,1.21,1.21,1.21,1.21,1.21,1.21,1.21,1.21,1.21,1.21,1.21,1.21,1.21],"file":"hair-ponytail.glb","hatDeathLift":[-0.87,-0.67,-0.38,-0.33,-0.38,-0.47,-0.57,-0.67,-0.74,-0.76,-0.74,-0.71,-0.66,-0.6,-0.52,-0.45,-0.38,-0.32,-0.28,-0.28,-0.29,-0.33,-0.39,-0.55,-0.75,-0.91,-0.9,-0.76,-0.78,-0.81,-0.72,-0.46,-0.13,-0.01,-0.03,0.07,0.18,0.32,0.35,0.34,0.34,0.38,0.43,0.48,0.5,0.5,0.51,0.52,0.52,0.53,0.53,0.53,0.53,0.53,0.53,0.53,0.53,0.53,0.53,0.53,0.53,0.53,0.53,0.53,0.53,0.53,0.53],"hatFile":"hair-ponytail-hat.glb"},"buzz":{"channels":{"main":"Hair"},"ways":{"black":["#1a1412"],"dark":["#402617"],"brown":["#7a4c29"],"chestnut":["#6b331a"],"ginger":["#e66b24"],"copper":["#cc541f"],"blonde":["#facc5c"],"platinum":["#f5f0d6"],"pink":["#ff73b2"],"blue":["#384c9e"]},"deathLift":[-2.76,-2.61,-2.34,-2.27,-2.28,-2.35,-2.45,-2.57,-2.63,-2.59,-2.52,-2.45,-2.38,-2.31,-2.25,-2.2,-2.17,-2.17,-2.2,-2.25,-2.23,-2.21,-2.21,-2.3,-2.41,-2.37,-2.46,-2.58,-2.67,-2.74,-2.69,-2.44,-1.72,-0.67,0.16,-0.18,-0.51,-0.64,-0.5,-0.12,0.12,-0.1,-0.16,0,0.04,0.04,0.05,0.06,0.06,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07],"file":"hair-buzz.glb","hatDeathLift":[-2.76,-2.61,-2.34,-2.27,-2.28,-2.35,-2.45,-2.57,-2.63,-2.59,-2.52,-2.45,-2.38,-2.31,-2.25,-2.2,-2.17,-2.17,-2.2,-2.25,-2.23,-2.21,-2.21,-2.3,-2.41,-2.37,-2.46,-2.58,-2.67,-2.74,-2.69,-2.44,-1.72,-0.67,-0.06,-0.29,-0.51,-0.64,-0.5,-0.2,-0.02,-0.18,-0.21,-0.09,-0.05,-0.05,-0.04,-0.04,-0.03,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02],"hatFile":"hair-buzz-hat.glb"},"afro":{"channels":{"main":"Hair"},"ways":{"black":["#1a1412"],"dark":["#402617"],"brown":["#7a4c29"],"chestnut":["#6b331a"],"ginger":["#e66b24"],"copper":["#cc541f"],"blonde":["#facc5c"],"platinum":["#f5f0d6"],"pink":["#ff73b2"],"blue":["#384c9e"]},"deathLift":[-2.62,-2.45,-2.15,-2.07,-2.09,-2.17,-2.28,-2.41,-2.48,-2.44,-2.36,-2.29,-2.21,-2.13,-2.06,-2.01,-1.97,-1.97,-2,-2.05,-2.03,-2.01,-2.01,-2.12,-2.26,-2.24,-2.33,-2.42,-2.51,-2.58,-2.51,-2.23,-1.49,-0.33,0.56,0.19,-0.12,-0.3,-0.12,0.28,0.53,0.3,0.25,0.41,0.45,0.46,0.46,0.47,0.47,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48,0.48],"file":"hair-afro.glb","hatDeathLift":[-2.27,-2.11,-1.83,-1.76,-1.78,-1.85,-1.95,-2.06,-2.14,-2.09,-2.02,-1.94,-1.87,-1.8,-1.74,-1.69,-1.66,-1.65,-1.68,-1.74,-1.72,-1.69,-1.7,-1.79,-1.91,-1.93,-2.01,-2.08,-2.17,-2.24,-2.19,-1.91,-1.26,-0.33,0.19,0.02,-0.14,-0.22,-0.09,0.17,0.32,0.19,0.19,0.3,0.33,0.33,0.34,0.34,0.35,0.36,0.36,0.36,0.36,0.36,0.36,0.36,0.36,0.36,0.36,0.36,0.36,0.36,0.36,0.36,0.36,0.36,0.36],"hatFile":"hair-afro-hat.glb"},"lion-mane":{"channels":{"main":"Mane"},"ways":{"gold":["#d98c33"],"brown":["#8c613d"],"dark":["#59331a"],"white":["#faf2e0"]},"deathLift":[-1.52,-1.48,-1.36,-1.3,-1.3,-1.32,-1.35,-1.39,-1.42,-1.38,-1.35,-1.32,-1.3,-1.28,-1.25,-1.23,-1.22,-1.23,-1.25,-1.3,-1.28,-1.26,-1.25,-1.25,-1.24,-1.25,-1.31,-1.4,-1.49,-1.57,-1.61,-1.55,-1.35,-0.51,0.17,-0.13,-0.33,-0.43,-0.3,-0.03,0.16,-0.01,-0.02,0.09,0.12,0.13,0.13,0.14,0.14,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15],"file":"hair-lion-mane.glb","hatDeathLift":[-1.52,-1.48,-1.36,-1.3,-1.3,-1.32,-1.35,-1.39,-1.42,-1.38,-1.35,-1.32,-1.3,-1.28,-1.25,-1.23,-1.22,-1.23,-1.25,-1.3,-1.28,-1.26,-1.25,-1.25,-1.24,-1.25,-1.31,-1.4,-1.49,-1.57,-1.61,-1.55,-1.35,-0.51,0.06,-0.15,-0.33,-0.43,-0.3,-0.03,0.14,-0.01,-0.02,0.09,0.12,0.13,0.13,0.14,0.14,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15],"hatFile":"hair-lion-mane-hat.glb"},"none":{"channels":{},"ways":{"-":["#ffffff"]}}},"hat":{"none":{"channels":{},"ways":{"-":["#ffffff"]}}},"ears":{"cat":{"channels":{"main":"Inner"},"ways":{"pink":["#ff66a6"],"cream":["#faf2e0"],"dark":["#404559"]},"file":"ears-cat.glb"},"bunny":{"channels":{"main":"Inner"},"ways":{"pink":["#ff66a6"],"cream":["#faf2e0"]},"deathLift":[-4.02,-3.91,-3.66,-3.6,-3.62,-3.69,-3.77,-3.86,-3.91,-3.88,-3.84,-3.79,-3.73,-3.67,-3.62,-3.57,-3.54,-3.53,-3.54,-3.57,-3.56,-3.55,-3.55,-3.63,-3.71,-3.75,-3.83,-3.88,-3.96,-4.03,-3.99,-3.76,-2.92,-1.33,0.11,-0.66,-1.21,-1.51,-1.33,-0.78,-0.38,-0.78,-0.89,-0.69,-0.64,-0.64,-0.63,-0.62,-0.62,-0.61,-0.61,-0.61,-0.61,-0.61,-0.61,-0.61,-0.61,-0.61,-0.61,-0.61,-0.61,-0.61,-0.61,-0.61,-0.61,-0.61,-0.61],"file":"ears-bunny.glb"},"bear":{"channels":{"main":"Inner"},"ways":{"tan":["#d9b280"],"cream":["#faf2e0"],"dark":["#404559"]},"file":"ears-bear.glb"},"mouse":{"channels":{"main":"Inner"},"ways":{"pink":["#ff66a6"],"cream":["#faf2e0"]},"file":"ears-mouse.glb"},"pig":{"channels":{"main":"Inner"},"ways":{"pink":["#f299a6"],"tan":["#d9b280"]},"file":"ears-pig.glb"},"dog":{"channels":{"main":"Tips"},"ways":{"brown":["#8c613d"],"black":["#26262e"],"cream":["#faf2e0"]},"file":"ears-dog.glb"},"cow":{"channels":{"main":"Inner"},"ways":{"pink":["#fab8bf"],"cream":["#faf2e0"]},"file":"ears-cow.glb"},"elephant":{"channels":{"main":"Inner"},"ways":{"pink":["#ff66a6"],"grey":["#8c99b2"]},"file":"ears-elephant.glb"},"none":{"channels":{},"ways":{"-":["#ffffff"]}}},"horns":{"crest":{"channels":{"main":"Plume","trim":"Tip"},"ways":{"red":["#eb4040","#fab826"],"blue":["#4773cc","#66bff2"],"green":["#4c9e66","#9ed14c"]},"file":"horns-crest.glb"},"bull":{"channels":{"main":"Horn","trim":"Tip"},"ways":{"ivory":["#f2e6c7","#404559"],"black":["#26262e","#8c99b2"],"brown":["#d9b280","#8c613d"]},"file":"horns-bull.glb"},"antlers":{"channels":{"main":"Antler"},"ways":{"tan":["#d9b280"],"brown":["#8c613d"],"white":["#faf2e0"]},"file":"horns-antlers.glb"},"frog-eyes":{"channels":{"trim":"Eyes","accent":"Pupils"},"ways":{"-":["#f7f7f7","#f7f7f7"]},"file":"horns-frog-eyes.glb"},"none":{"channels":{},"ways":{"-":["#ffffff"]}}},"eyewear":{"none":{"channels":{},"ways":{"-":["#ffffff"]}}},"markings":{"mask":{"channels":{"main":"Mask"},"ways":{"raccoon":["#404559"],"panda":["#26262e"],"hero":["#eb4040"]},"file":"markings-mask.glb"},"belly":{"channels":{"main":"Belly"},"ways":{"cream":["#faf2e0"],"white":["#f7f7f7"],"tan":["#d9b280"]},"file":"markings-belly.glb"},"stripes":{"channels":{"main":"Stripes"},"ways":{"black":["#26262e"],"red":["#eb4040"],"white":["#f7f7f7"],"blue":["#4773cc"]},"file":"markings-stripes.glb"},"none":{"channels":{},"ways":{"-":["#ffffff"]}}},"muzzle":{"cat":{"channels":{"main":"Muzzle","trim":"Nose"},"ways":{"white":["#f7f7f7","#ff66a6"],"cream":["#faf2e0","#f28c99"]},"file":"muzzle-cat.glb"},"dog":{"channels":{"main":"Snout","trim":"Nose"},"ways":{"cream":["#faf2e0","#26262e"],"tan":["#d9b280","#26262e"],"white":["#f7f7f7","#404559"]},"file":"muzzle-dog.glb"},"bear":{"channels":{"main":"Snout","trim":"Nose"},"ways":{"tan":["#d9b280","#26262e"],"cream":["#faf2e0","#8c613d"],"white":["#f7f7f7","#26262e"]},"file":"muzzle-bear.glb"},"pig":{"channels":{"main":"Snout","trim":"Nostrils"},"ways":{"pink":["#faadb8","#bf596b"],"tan":["#d9b280","#8c613d"]},"file":"muzzle-pig.glb"},"mouse":{"channels":{"main":"Snout","trim":"Nose"},"ways":{"grey":["#c7c7cc","#ff66a6"],"white":["#f7f7f7","#ff66a6"],"brown":["#d9b280","#26262e"]},"file":"muzzle-mouse.glb"},"beak":{"channels":{"main":"Beak","trim":"Inside"},"ways":{"orange":["#fa8c33","#eb4040"],"yellow":["#ffd126","#eb4040"],"black":["#404559","#ff66a6"]},"file":"muzzle-beak.glb"},"lizard":{"channels":{"main":"Mouth","trim":"Nostrils"},"ways":{"green":["#9ed14c","#4c9e66"],"teal":["#8cd9b8","#33b2b2"],"cream":["#faf2e0","#8c613d"]},"file":"muzzle-lizard.glb"},"cow":{"channels":{"main":"Muzzle","trim":"Nostrils"},"ways":{"pink":["#fab8bf","#994c59"],"grey":["#8c99b2","#404559"],"cream":["#faf2e0","#8c613d"]},"file":"muzzle-cow.glb"},"trunk":{"channels":{"trim":"Tip"},"ways":{"pink":["#ff66a6"],"grey":["#8c99b2"]},"file":"muzzle-trunk.glb"},"none":{"channels":{},"ways":{"-":["#ffffff"]}}},"mouth":{"whiskers":{"channels":{"main":"Whiskers"},"ways":{"black":["#26262e"],"white":["#f7f7f7"]},"file":"mouth-whiskers.glb"},"none":{"channels":{},"ways":{"-":["#ffffff"]}}},"neck":{"pet-collar":{"channels":{"main":"Collar","trim":"Bell"},"ways":{"red":["#eb4040","#fab826"],"blue":["#4773cc","#fab826"],"pink":["#ff66a6","#d1d6e0"]},"file":"neck-pet-collar.glb"},"none":{"channels":{},"ways":{"-":["#ffffff"]}}},"top":{"cardigan":{"channels":{"main":"Cardigan","trim":"Tee","accent":"Pompom"},"ways":{"mint":["#8cd9b8","#faf2e6","#ff99b2"],"mustard":["#fab826","#faf2e0","#eb4040"],"rose":["#f2738c","#f7f7f7","#66bff2"],"navy":["#333861","#fae059","#f7f7f7"]},"outer":true,"file":"top-cardigan.glb"},"sailor":{"channels":{"main":"Blouse","trim":"Collar","accent":"Neckerchief"},"ways":{"navy":["#f7f7f7","#333861","#eb4040"],"red":["#f7f7f7","#eb4040","#333861"],"sky":["#f7f7f7","#66bff2","#333861"]},"file":"top-sailor.glb"},"stripy":{"channels":{"main":"Top","trim":"Stripes"},"ways":{"sailor":["#faf2e0","#f25959"],"navy":["#333861","#f7f7f7"],"bee":["#ffd126","#26262e"],"mint":["#8cd9b8","#bf8cf2"],"burglar":["#f7f7f7","#26262e"]},"file":"top-stripy.glb"},"none":{"channels":{},"ways":{"-":["#ffffff"]}}},"bottom":{"pants":{"channels":{"main":"Trousers","trim":"Turn-ups"},"ways":{"charcoal":["#404559","#404559"],"khaki":["#d9b280","#d9b280"],"brown":["#665240","#665240"],"grey":["#8c99b2","#8c99b2"],"yellow":["#ffd126","#ffd126"],"red":["#eb4040","#eb4040"]},"deathLift":[-0.23,-0.22,-0.19,-0.18,-0.18,-0.18,-0.19,-0.19,-0.2,-0.2,-0.21,-0.21,-0.21,-0.21,-0.2,-0.19,-0.18,-0.17,-0.17,-0.17,-0.17,-0.18,-0.18,-0.18,-0.17,-0.17,-0.19,-0.23,-0.26,-0.29,-0.32,-0.39,-0.56,-0.83,-1.05,-0.93,-0.84,-0.79,-0.81,-0.88,-0.92,-0.85,-0.83,-0.85,-0.85,-0.84,-0.84,-0.83,-0.83,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82],"file":"bottom-pants.glb"},"jeans":{"channels":{"main":"Denim","trim":"Rips","accent":"Pockets and belt"},"ways":{"light":["#7399d9","#f2ebd9","#6185c7"],"dark":["#333861","#66bff2","#8c613d"],"black":["#26262e","#8c99b2","#404559"]},"file":"bottom-jeans.glb"},"leggings":{"channels":{"main":"Leggings","trim":"Stripe"},"ways":{"black":["#26262e","#ff66a6"],"navy":["#333861","#f7f7f7"],"purple":["#8047bf","#9ed14c"],"pink":["#ff66a6","#f7f7f7"]},"deathLift":[-0.2,-0.19,-0.17,-0.16,-0.16,-0.16,-0.16,-0.17,-0.17,-0.18,-0.18,-0.18,-0.19,-0.18,-0.18,-0.17,-0.16,-0.15,-0.15,-0.15,-0.15,-0.15,-0.16,-0.15,-0.15,-0.15,-0.17,-0.2,-0.24,-0.26,-0.3,-0.37,-0.56,-0.83,-1.05,-0.93,-0.84,-0.79,-0.81,-0.88,-0.92,-0.85,-0.83,-0.85,-0.85,-0.84,-0.84,-0.83,-0.83,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82],"file":"bottom-leggings.glb"},"overalls":{"channels":{"main":"Denim","trim":"Turn-ups","accent":"Buttons"},"ways":{"denim":["#4773cc","#8cb2e6","#fac740"],"red":["#eb4040","#faf2e0","#f7f7f7"],"yellow":["#ffd126","#f7f7f7","#4773cc"],"brown":["#8c613d","#d9b280","#fab826"]},"deathLift":[-0.22,-0.21,-0.18,-0.17,-0.17,-0.18,-0.18,-0.18,-0.19,-0.2,-0.2,-0.2,-0.2,-0.2,-0.19,-0.18,-0.17,-0.17,-0.16,-0.16,-0.17,-0.17,-0.17,-0.17,-0.16,-0.16,-0.18,-0.22,-0.25,-0.28,-0.31,-0.38,-0.55,-0.83,-1.05,-0.93,-0.84,-0.79,-0.81,-0.88,-0.92,-0.85,-0.83,-0.85,-0.85,-0.84,-0.84,-0.83,-0.83,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82,-0.82],"file":"bottom-overalls.glb","bib":"bottom-overalls-bib.glb"},"skirt":{"channels":{"main":"Skirt","trim":"Socks","accent":"Hem"},"ways":{"rose":["#f2738c","#f7f7f7","#f2738c"],"navy":["#333861","#f7f7f7","#f7f7f7"],"tartan":["#eb4040","#26262e","#fab826"],"denim":["#4773cc","#f7f7f7","#66bff2"]},"deathLift":[-0.19,-0.18,-0.16,-0.15,-0.15,-0.16,-0.16,-0.16,-0.17,-0.17,-0.18,-0.18,-0.18,-0.18,-0.17,-0.16,-0.15,-0.15,-0.15,-0.15,-0.15,-0.15,-0.15,-0.15,-0.14,-0.14,-0.16,-0.2,-0.23,-0.26,-0.29,-0.36,-0.38,-0.52,-0.76,-0.6,-0.48,-0.4,-0.42,-0.5,-0.55,-0.47,-0.43,-0.45,-0.46,-0.45,-0.44,-0.44,-0.43,-0.42,-0.42,-0.42,-0.42,-0.42,-0.42,-0.42,-0.42,-0.42,-0.42,-0.42,-0.42,-0.42,-0.42,-0.42,-0.42,-0.42,-0.42],"file":"bottom-skirt.glb"},"none":{"channels":{},"ways":{"-":["#ffffff"]}}},"shoes":{"bare-feet":{"channels":{},"ways":{"-":["#ffffff"]},"deathLift":[-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.01,0.01,0.02,-0.01,-0.05,-0.07,-0.09,-0.13,-0.23,-0.44,-0.88,-1.24,-1.1,-1,-0.97,-1.01,-1.12,-1.17,-1.1,-1.09,-1.13,-1.14,-1.13,-1.12,-1.12,-1.11,-1.11,-1.11,-1.11,-1.11,-1.11,-1.11,-1.11,-1.11,-1.11,-1.11,-1.11,-1.11,-1.11,-1.11,-1.11,-1.11,-1.11,-1.11],"file":"shoes-bare-feet.glb"},"sneakers":{"channels":{"main":"Shoe","trim":"Laces and sole","accent":"Flash"},"ways":{"white":["#f7f7f7","#e63333","#f7f7f7"],"black":["#26262e","#f7f7f7","#f7f7f7"],"blue":["#4c99f2","#f7f7f7","#f7f7f7"],"red":["#eb4040","#f7f7f7","#ffd126"]},"deathLift":[0.01,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.02,0.04,0.06,0.03,-0.02,-0.05,-0.06,-0.09,-0.17,-0.37,-0.82,-1.21,-1.06,-0.96,-0.92,-0.97,-1.09,-1.14,-1.06,-1.05,-1.1,-1.11,-1.1,-1.1,-1.09,-1.08,-1.08,-1.08,-1.08,-1.08,-1.08,-1.08,-1.08,-1.08,-1.08,-1.08,-1.08,-1.08,-1.08,-1.08,-1.08,-1.08,-1.08,-1.08],"file":"shoes-sneakers.glb"},"boots":{"channels":{"main":"Boot","trim":"Sole","accent":"Laces"},"ways":{"brown":["#8c613d","#404559","#d9b280"],"black":["#26262e","#404559","#eb4040"],"tan":["#d9b280","#8c613d","#eb4040"]},"deathLift":[0.02,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.03,0.05,0.06,0.03,-0.02,-0.04,-0.05,-0.08,-0.16,-0.37,-0.81,-1.21,-1.06,-0.95,-0.92,-0.96,-1.08,-1.14,-1.06,-1.05,-1.09,-1.1,-1.09,-1.08,-1.08,-1.07,-1.06,-1.06,-1.06,-1.06,-1.06,-1.06,-1.06,-1.06,-1.06,-1.06,-1.06,-1.06,-1.06,-1.06,-1.06,-1.06,-1.06,-1.06],"file":"shoes-boots.glb"},"paws":{"channels":{"main":"Paw","trim":"Ankle fur"},"ways":{"ginger":["#fa8c33","#faf2e0"],"black":["#26262e","#404559"],"white":["#f7f7f7","#faf2e0"],"brown":["#8c613d","#d9b280"]},"deathLift":[-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.01,0,0.01,-0.02,-0.05,-0.07,-0.09,-0.14,-0.23,-0.44,-0.86,-1.22,-1.08,-0.98,-0.95,-0.99,-1.09,-1.13,-1.07,-1.05,-1.08,-1.08,-1.08,-1.07,-1.06,-1.06,-1.05,-1.05,-1.05,-1.05,-1.05,-1.05,-1.05,-1.05,-1.05,-1.05,-1.05,-1.05,-1.05,-1.05,-1.05,-1.05,-1.05,-1.05],"file":"shoes-paws.glb"},"hooves":{"channels":{"main":"Fur","trim":"Hoof"},"ways":{"brown":["#8c613d","#4c382e"],"tan":["#d9b280","#404559"],"white":["#faf2e0","#8c99b2"]},"deathLift":[-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.01,0.01,0.02,-0.01,-0.05,-0.07,-0.09,-0.13,-0.22,-0.44,-0.9,-1.22,-1.09,-1,-0.97,-1,-1.1,-1.14,-1.07,-1.06,-1.09,-1.1,-1.09,-1.09,-1.08,-1.07,-1.07,-1.07,-1.07,-1.07,-1.07,-1.07,-1.07,-1.07,-1.07,-1.07,-1.07,-1.07,-1.07,-1.07,-1.07,-1.07,-1.07,-1.07],"file":"shoes-hooves.glb"},"alien-feet":{"channels":{"main":"Toe pads"},"ways":{"pink":["#ff66a6"],"lime":["#9ed14c"],"purple":["#8047bf"]},"deathLift":[-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,0.01,0.04,0.06,0.02,-0.04,-0.07,-0.09,-0.14,-0.24,-0.47,-0.89,-1.25,-1.11,-1.02,-0.99,-1.03,-1.14,-1.18,-1.11,-1.1,-1.14,-1.15,-1.14,-1.14,-1.13,-1.13,-1.12,-1.12,-1.12,-1.12,-1.12,-1.12,-1.12,-1.12,-1.12,-1.12,-1.12,-1.12,-1.12,-1.12,-1.12,-1.12,-1.12,-1.12],"file":"shoes-alien-feet.glb"},"ballet-flats":{"channels":{"main":"Slipper","trim":"Bow"},"ways":{"pink":["#ffbfd1","#f2738c"],"black":["#26262e","#26262e"],"red":["#eb4040","#f7f7f7"],"gold":["#fab826","#faf2e0"]},"deathLift":[-0.01,-0.01,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.01,-0.01,-0.01,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.02,-0.01,0,0.02,0.03,0,-0.04,-0.07,-0.08,-0.12,-0.21,-0.42,-0.86,-1.23,-1.09,-0.99,-0.96,-1,-1.11,-1.16,-1.09,-1.08,-1.12,-1.13,-1.12,-1.12,-1.11,-1.11,-1.1,-1.1,-1.1,-1.1,-1.1,-1.1,-1.1,-1.1,-1.1,-1.1,-1.1,-1.1,-1.1,-1.1,-1.1,-1.1,-1.1,-1.1],"file":"shoes-ballet-flats.glb"}},"hands":{"paws":{"channels":{"main":"Pads"},"ways":{"pink":["#ff66a6"],"black":["#404559"]},"file":"hands-paws.glb"},"none":{"channels":{},"ways":{"-":["#ffffff"]}}},"back":{"turtle-shell":{"channels":{"main":"Shell","trim":"Rim"},"ways":{"green":["#4c9e66","#fae059"],"brown":["#8c613d","#d9b280"],"teal":["#33b2b2","#8cd9b8"]},"deathLift":[-0.21,-0.16,-0.07,-0.04,-0.04,-0.06,-0.07,-0.08,-0.09,-0.09,-0.1,-0.1,-0.1,-0.09,-0.07,-0.06,-0.04,-0.03,-0.04,-0.05,-0.07,-0.08,-0.1,-0.13,-0.17,-0.18,-0.18,-0.17,-0.2,-0.24,-0.25,-0.25,-0.28,-0.44,-0.62,-0.48,-0.36,-0.26,-0.26,-0.32,-0.36,-0.28,-0.24,-0.24,-0.24,-0.24,-0.23,-0.22,-0.22,-0.21,-0.21,-0.21,-0.21,-0.21,-0.21,-0.21,-0.21,-0.21,-0.21,-0.21,-0.21,-0.21,-0.21,-0.21,-0.21,-0.21,-0.21],"file":"back-turtle-shell.glb"},"shark-fin":{"channels":{"main":"Fin"},"ways":{"grey":["#8094ad"],"blue":["#4773cc"],"orange":["#fa8c33"]},"deathLift":[-0.74,-0.65,-0.51,-0.48,-0.49,-0.51,-0.52,-0.53,-0.52,-0.52,-0.51,-0.5,-0.5,-0.5,-0.48,-0.47,-0.47,-0.47,-0.49,-0.53,-0.56,-0.6,-0.62,-0.67,-0.71,-0.73,-0.72,-0.69,-0.7,-0.72,-0.65,-0.48,-0.34,-0.31,-0.35,-0.31,-0.17,-0.05,-0.05,0.02,0.05,0.07,0.14,0.24,0.26,0.27,0.27,0.28,0.28,0.29,0.29,0.29,0.29,0.29,0.29,0.29,0.29,0.29,0.29,0.29,0.29,0.29,0.29,0.29,0.29,0.29,0.29],"file":"back-shark-fin.glb"},"none":{"channels":{},"ways":{"-":["#ffffff"]}}},"tail":{"cat":{"channels":{"main":"Fur","trim":"Tip"},"ways":{"black":["#26262e","#26262e"],"ginger":["#fa8c33","#faf2e0"],"grey":["#8c99b2","#f7f7f7"]},"deathLift":[-0.42,-0.35,-0.24,-0.2,-0.22,-0.23,-0.25,-0.26,-0.26,-0.26,-0.26,-0.26,-0.26,-0.26,-0.24,-0.23,-0.21,-0.21,-0.22,-0.24,-0.26,-0.28,-0.3,-0.35,-0.4,-0.42,-0.41,-0.37,-0.4,-0.43,-0.4,-0.3,-0.16,-0.1,-0.2,-0.04,0.11,0.26,0.28,0.23,0.18,0.28,0.34,0.35,0.36,0.36,0.37,0.37,0.38,0.39,0.39,0.39,0.39,0.39,0.39,0.39,0.39,0.39,0.39,0.39,0.39,0.39,0.39,0.39,0.39,0.39,0.39],"file":"tail-cat.glb"},"fox":{"channels":{"main":"Fur","trim":"Tip"},"ways":{"red":["#fa8c33","#f7f7f7"],"silver":["#8c99b2","#f7f7f7"],"arctic":["#f7f7f7","#66bff2"]},"deathLift":[-0.38,-0.31,-0.19,-0.16,-0.17,-0.19,-0.2,-0.21,-0.22,-0.22,-0.22,-0.22,-0.22,-0.21,-0.2,-0.18,-0.17,-0.17,-0.17,-0.19,-0.22,-0.24,-0.26,-0.31,-0.37,-0.39,-0.37,-0.33,-0.35,-0.38,-0.35,-0.18,-0.02,0.12,0.08,0.23,0.39,0.57,0.62,0.6,0.56,0.65,0.73,0.76,0.77,0.78,0.78,0.79,0.8,0.8,0.8,0.8,0.8,0.8,0.8,0.8,0.8,0.8,0.8,0.8,0.8,0.8,0.8,0.8,0.8,0.8,0.8],"file":"tail-fox.glb"},"bunny":{"channels":{"main":"Fluff"},"ways":{"white":["#f7f7f7"],"brown":["#d9b280"],"pink":["#ff66a6"]},"deathLift":[-0.44,-0.39,-0.29,-0.26,-0.27,-0.28,-0.3,-0.31,-0.32,-0.32,-0.33,-0.33,-0.33,-0.32,-0.3,-0.29,-0.27,-0.26,-0.26,-0.28,-0.29,-0.31,-0.33,-0.36,-0.4,-0.42,-0.41,-0.4,-0.43,-0.47,-0.47,-0.44,-0.47,-0.62,-0.81,-0.69,-0.58,-0.5,-0.51,-0.58,-0.62,-0.54,-0.51,-0.52,-0.52,-0.51,-0.51,-0.5,-0.5,-0.49,-0.49,-0.49,-0.49,-0.49,-0.49,-0.49,-0.49,-0.49,-0.49,-0.49,-0.49,-0.49,-0.49,-0.49,-0.49,-0.49,-0.49],"file":"tail-bunny.glb"},"pig":{"channels":{},"ways":{"-":["#ffffff"]},"deathLift":[-0.41,-0.35,-0.24,-0.21,-0.22,-0.23,-0.24,-0.25,-0.26,-0.27,-0.27,-0.27,-0.28,-0.27,-0.25,-0.23,-0.21,-0.21,-0.21,-0.23,-0.25,-0.27,-0.29,-0.33,-0.38,-0.4,-0.38,-0.36,-0.39,-0.43,-0.41,-0.36,-0.38,-0.55,-0.77,-0.64,-0.52,-0.44,-0.45,-0.52,-0.56,-0.49,-0.45,-0.46,-0.46,-0.46,-0.45,-0.44,-0.44,-0.43,-0.43,-0.43,-0.43,-0.43,-0.43,-0.43,-0.43,-0.43,-0.43,-0.43,-0.43,-0.43,-0.43,-0.43,-0.43,-0.43,-0.43],"file":"tail-pig.glb"},"tuft":{"channels":{"main":"Tail","trim":"Tuft"},"ways":{"tan":["#d9b280","#8c613d"],"black":["#26262e","#26262e"],"white":["#f7f7f7","#404559"]},"deathLift":[0.07,0.16,0.31,0.34,0.32,0.3,0.28,0.27,0.26,0.27,0.28,0.29,0.29,0.3,0.32,0.33,0.34,0.33,0.31,0.28,0.25,0.22,0.19,0.11,0.02,-0.02,0.02,0.12,0.11,0.09,0.17,0.32,0.35,0.18,-0.15,0.1,0.31,0.45,0.43,0.3,0.21,0.34,0.41,0.37,0.37,0.37,0.38,0.39,0.39,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4],"file":"tail-tuft.glb"},"feathers":{"channels":{"main":"Feathers","trim":"Alternate"},"ways":{"blue":["#4773cc","#33b2b2"],"red":["#eb4040","#fa8c33"],"white":["#f7f7f7","#8c99b2"]},"deathLift":[-0.55,-0.49,-0.4,-0.37,-0.38,-0.39,-0.4,-0.41,-0.42,-0.43,-0.43,-0.43,-0.43,-0.43,-0.41,-0.39,-0.38,-0.37,-0.37,-0.38,-0.39,-0.41,-0.43,-0.46,-0.49,-0.51,-0.51,-0.5,-0.54,-0.57,-0.58,-0.55,-0.56,-0.67,-0.81,-0.71,-0.61,-0.53,-0.54,-0.57,-0.59,-0.53,-0.49,-0.48,-0.47,-0.47,-0.46,-0.45,-0.45,-0.44,-0.44,-0.44,-0.44,-0.44,-0.44,-0.44,-0.44,-0.44,-0.44,-0.44,-0.44,-0.44,-0.44,-0.44,-0.44,-0.44,-0.44],"file":"tail-feathers.glb"},"fish-tail":{"channels":{"main":"Tail","trim":"Fin"},"ways":{"teal":["#33b2b2","#8cd9b8"],"orange":["#fa8c33","#fab826"],"purple":["#8047bf","#ff66a6"]},"deathLift":[-0.27,-0.21,-0.1,-0.06,-0.08,-0.09,-0.11,-0.12,-0.13,-0.13,-0.13,-0.13,-0.13,-0.12,-0.1,-0.09,-0.08,-0.07,-0.08,-0.1,-0.11,-0.13,-0.16,-0.2,-0.25,-0.28,-0.26,-0.23,-0.25,-0.28,-0.26,-0.18,-0.09,-0.18,-0.2,-0.07,0.06,0.21,0.25,0.23,0.19,0.28,0.34,0.37,0.38,0.38,0.39,0.4,0.4,0.41,0.41,0.41,0.41,0.41,0.41,0.41,0.41,0.41,0.41,0.41,0.41,0.41,0.41,0.41,0.41,0.41,0.41],"file":"tail-fish-tail.glb"},"none":{"channels":{},"ways":{"-":["#ffffff"]}}},"prop":{"none":{"channels":{},"ways":{"-":["#ffffff"]}}},"offhand":{"none":{"channels":{},"ways":{"-":["#ffffff"]}}},"ride":{"none":{"channels":{},"ways":{"-":["#ffffff"]}}}},"looks":{"cat":{"skin":"#f08a3a","hair":{"item":"none","way":"-"},"hat":{"item":"none"},"ears":{"item":"cat","way":"pink"},"horns":{"item":"none"},"eyewear":{"item":"none"},"markings":{"item":"belly","way":"cream"},"muzzle":{"item":"cat","way":"white"},"mouth":{"item":"whiskers","way":"black"},"neck":{"item":"none"},"top":{"item":"none"},"bottom":{"item":"none"},"shoes":{"item":"paws","way":"ginger"},"hands":{"item":"paws","way":"pink"},"back":{"item":"none"},"tail":{"item":"cat","way":"black"},"prop":{"item":"none"},"offhand":{"item":"none"},"ride":{"item":"none"}},"dog":{"skin":"#b2804c","hair":{"item":"none","way":"-"},"hat":{"item":"none"},"ears":{"item":"dog","way":"brown"},"horns":{"item":"none"},"eyewear":{"item":"none"},"markings":{"item":"belly","way":"cream"},"muzzle":{"item":"dog","way":"cream"},"mouth":{"item":"none"},"neck":{"item":"pet-collar","way":"red"},"top":{"item":"none"},"bottom":{"item":"none"},"shoes":{"item":"paws","way":"ginger"},"hands":{"item":"paws","way":"pink"},"back":{"item":"none"},"tail":{"item":"cat","way":"black"},"prop":{"item":"none"},"offhand":{"item":"none"},"ride":{"item":"none"}},"bear":{"skin":"#8c5c38","hair":{"item":"none","way":"-"},"hat":{"item":"none"},"ears":{"item":"bear","way":"tan"},"horns":{"item":"none"},"eyewear":{"item":"none"},"markings":{"item":"belly","way":"cream"},"muzzle":{"item":"bear","way":"tan"},"mouth":{"item":"none"},"neck":{"item":"none"},"top":{"item":"none"},"bottom":{"item":"overalls","way":"red"},"shoes":{"item":"paws","way":"ginger"},"hands":{"item":"paws","way":"pink"},"back":{"item":"none"},"tail":{"item":"bunny","way":"white"},"prop":{"item":"none"},"offhand":{"item":"none"},"ride":{"item":"none"}},"pig":{"skin":"#f7b8c2","hair":{"item":"none","way":"-"},"hat":{"item":"none"},"ears":{"item":"pig","way":"pink"},"horns":{"item":"none"},"eyewear":{"item":"none"},"markings":{"item":"none"},"muzzle":{"item":"pig","way":"pink"},"mouth":{"item":"none"},"neck":{"item":"none"},"top":{"item":"stripy","way":"navy"},"bottom":{"item":"overalls","way":"denim"},"shoes":{"item":"hooves","way":"brown"},"hands":{"item":"none"},"back":{"item":"none"},"tail":{"item":"pig","way":"-"},"prop":{"item":"none"},"offhand":{"item":"none"},"ride":{"item":"none"}},"mouse":{"skin":"#b8b8c2","hair":{"item":"none","way":"-"},"hat":{"item":"none"},"ears":{"item":"mouse","way":"pink"},"horns":{"item":"none"},"eyewear":{"item":"none"},"markings":{"item":"none"},"muzzle":{"item":"mouse","way":"grey"},"mouth":{"item":"none"},"neck":{"item":"none"},"top":{"item":"cardigan","way":"rose"},"bottom":{"item":"skirt","way":"navy"},"shoes":{"item":"ballet-flats","way":"pink"},"hands":{"item":"none"},"back":{"item":"none"},"tail":{"item":"tuft","way":"tan"},"prop":{"item":"none"},"offhand":{"item":"none"},"ride":{"item":"none"}},"duck":{"skin":"#f7f7f2","hair":{"item":"none","way":"-"},"hat":{"item":"none"},"ears":{"item":"none"},"horns":{"item":"crest","way":"red"},"eyewear":{"item":"none"},"markings":{"item":"none"},"muzzle":{"item":"beak","way":"orange"},"mouth":{"item":"none"},"neck":{"item":"none"},"top":{"item":"sailor","way":"navy"},"bottom":{"item":"pants","way":"charcoal"},"shoes":{"item":"sneakers","way":"white"},"hands":{"item":"none"},"back":{"item":"none"},"tail":{"item":"feathers","way":"blue"},"prop":{"item":"none"},"offhand":{"item":"none"},"ride":{"item":"none"}},"frog":{"skin":"#73b84d","hair":{"item":"none","way":"-"},"hat":{"item":"none"},"ears":{"item":"none"},"horns":{"item":"frog-eyes","way":"-"},"eyewear":{"item":"none"},"markings":{"item":"belly","way":"cream"},"muzzle":{"item":"lizard","way":"green"},"mouth":{"item":"none"},"neck":{"item":"none"},"top":{"item":"none"},"bottom":{"item":"none"},"shoes":{"item":"alien-feet","way":"pink"},"hands":{"item":"none"},"back":{"item":"none"},"tail":{"item":"none"},"prop":{"item":"none"},"offhand":{"item":"none"},"ride":{"item":"none"}},"cow":{"skin":"#f5f2ea","hair":{"item":"none","way":"-"},"hat":{"item":"none"},"ears":{"item":"cow","way":"pink"},"horns":{"item":"bull","way":"ivory"},"eyewear":{"item":"none"},"markings":{"item":"mask","way":"raccoon"},"muzzle":{"item":"cow","way":"pink"},"mouth":{"item":"none"},"neck":{"item":"pet-collar","way":"red"},"top":{"item":"none"},"bottom":{"item":"overalls","way":"denim"},"shoes":{"item":"hooves","way":"brown"},"hands":{"item":"none"},"back":{"item":"none"},"tail":{"item":"tuft","way":"tan"},"prop":{"item":"none"},"offhand":{"item":"none"},"ride":{"item":"none"}},"elephant":{"skin":"#9aa0aa","hair":{"item":"none","way":"-"},"hat":{"item":"none"},"ears":{"item":"elephant","way":"pink"},"horns":{"item":"none"},"eyewear":{"item":"none"},"markings":{"item":"none"},"muzzle":{"item":"trunk","way":"pink"},"mouth":{"item":"none"},"neck":{"item":"none"},"top":{"item":"none"},"bottom":{"item":"none"},"shoes":{"item":"hooves","way":"brown"},"hands":{"item":"none"},"back":{"item":"none"},"tail":{"item":"tuft","way":"tan"},"prop":{"item":"none"},"offhand":{"item":"none"},"ride":{"item":"none"}},"bunny":{"skin":"#f4f1ea","hair":{"item":"none","way":"-"},"hat":{"item":"none"},"ears":{"item":"bunny","way":"pink"},"horns":{"item":"none"},"eyewear":{"item":"none"},"markings":{"item":"belly","way":"cream"},"muzzle":{"item":"mouse","way":"grey"},"mouth":{"item":"none"},"neck":{"item":"none"},"top":{"item":"none"},"bottom":{"item":"none"},"shoes":{"item":"paws","way":"ginger"},"hands":{"item":"paws","way":"pink"},"back":{"item":"none"},"tail":{"item":"bunny","way":"white"},"prop":{"item":"none"},"offhand":{"item":"none"},"ride":{"item":"none"}},"fox":{"skin":"#e0702a","hair":{"item":"none","way":"-"},"hat":{"item":"none"},"ears":{"item":"cat","way":"pink"},"horns":{"item":"none"},"eyewear":{"item":"none"},"markings":{"item":"belly","way":"cream"},"muzzle":{"item":"dog","way":"cream"},"mouth":{"item":"none"},"neck":{"item":"none"},"top":{"item":"none"},"bottom":{"item":"none"},"shoes":{"item":"paws","way":"ginger"},"hands":{"item":"paws","way":"pink"},"back":{"item":"none"},"tail":{"item":"fox","way":"red"},"prop":{"item":"none"},"offhand":{"item":"none"},"ride":{"item":"none"}},"lion":{"skin":"#d9a24a","hair":{"item":"lion-mane","way":"gold"},"hat":{"item":"none"},"ears":{"item":"bear","way":"tan"},"horns":{"item":"none"},"eyewear":{"item":"none"},"markings":{"item":"none"},"muzzle":{"item":"cat","way":"white"},"mouth":{"item":"whiskers","way":"black"},"neck":{"item":"none"},"top":{"item":"none"},"bottom":{"item":"none"},"shoes":{"item":"paws","way":"ginger"},"hands":{"item":"paws","way":"pink"},"back":{"item":"none"},"tail":{"item":"tuft","way":"tan"},"prop":{"item":"none"},"offhand":{"item":"none"},"ride":{"item":"none"}},"tiger":{"skin":"#f08a3a","hair":{"item":"none","way":"-"},"hat":{"item":"none"},"ears":{"item":"cat","way":"pink"},"horns":{"item":"none"},"eyewear":{"item":"none"},"markings":{"item":"stripes","way":"black"},"muzzle":{"item":"cat","way":"white"},"mouth":{"item":"none"},"neck":{"item":"none"},"top":{"item":"none"},"bottom":{"item":"none"},"shoes":{"item":"paws","way":"ginger"},"hands":{"item":"paws","way":"pink"},"back":{"item":"none"},"tail":{"item":"cat","way":"black"},"prop":{"item":"none"},"offhand":{"item":"none"},"ride":{"item":"none"}},"raccoon":{"skin":"#8a8a92","hair":{"item":"none","way":"-"},"hat":{"item":"none"},"ears":{"item":"bear","way":"tan"},"horns":{"item":"none"},"eyewear":{"item":"none"},"markings":{"item":"mask","way":"raccoon"},"muzzle":{"item":"mouse","way":"grey"},"mouth":{"item":"none"},"neck":{"item":"none"},"top":{"item":"none"},"bottom":{"item":"none"},"shoes":{"item":"paws","way":"ginger"},"hands":{"item":"paws","way":"pink"},"back":{"item":"none"},"tail":{"item":"fox","way":"red"},"prop":{"item":"none"},"offhand":{"item":"none"},"ride":{"item":"none"}},"deer":{"skin":"#a8744a","hair":{"item":"none","way":"-"},"hat":{"item":"none"},"ears":{"item":"cow","way":"pink"},"horns":{"item":"antlers","way":"tan"},"eyewear":{"item":"none"},"markings":{"item":"none"},"muzzle":{"item":"dog","way":"cream"},"mouth":{"item":"none"},"neck":{"item":"none"},"top":{"item":"none"},"bottom":{"item":"none"},"shoes":{"item":"hooves","way":"brown"},"hands":{"item":"none"},"back":{"item":"none"},"tail":{"item":"bunny","way":"white"},"prop":{"item":"none"},"offhand":{"item":"none"},"ride":{"item":"none"}},"turtle":{"skin":"#6aa84f","hair":{"item":"none","way":"-"},"hat":{"item":"none"},"ears":{"item":"none"},"horns":{"item":"none"},"eyewear":{"item":"none"},"markings":{"item":"none"},"muzzle":{"item":"lizard","way":"green"},"mouth":{"item":"none"},"neck":{"item":"none"},"top":{"item":"none"},"bottom":{"item":"none"},"shoes":{"item":"paws","way":"ginger"},"hands":{"item":"none"},"back":{"item":"turtle-shell","way":"green"},"tail":{"item":"none"},"prop":{"item":"none"},"offhand":{"item":"none"},"ride":{"item":"none"}},"shark":{"skin":"#7a9ab8","hair":{"item":"none","way":"-"},"hat":{"item":"none"},"ears":{"item":"none"},"horns":{"item":"none"},"eyewear":{"item":"none"},"markings":{"item":"belly","way":"cream"},"muzzle":{"item":"none"},"mouth":{"item":"none"},"neck":{"item":"none"},"top":{"item":"none"},"bottom":{"item":"none"},"shoes":{"item":"bare-feet","way":"-"},"hands":{"item":"none"},"back":{"item":"shark-fin","way":"grey"},"tail":{"item":"fish-tail","way":"teal"},"prop":{"item":"none"},"offhand":{"item":"none"},"ride":{"item":"none"}}},"skinTones":["#fcdbbd","#f2c79e","#e0a87a","#bd8052","#8f5936","#613b24"],"suggest":{"cloth":{"red":"#eb4040","tomato":"#f26b4c","orange":"#fa8c33","gold":"#fab826","yellow":"#ffd126","butter":"#fae059","lime":"#9ed14c","green":"#4c9e66","mint":"#8cd9b8","teal":"#33b2b2","sky":"#66bff2","blue":"#4773cc","navy":"#333861","purple":"#8047bf","lilac":"#bf8cf2","pink":"#ff66a6","rose":"#f2738c","brown":"#8c613d","tan":"#d9b280","cream":"#faf2e0","white":"#f7f7f7","grey":"#8c99b2","charcoal":"#404559","black":"#26262e"},"hair":{"black":"#1a1412","dark":"#402617","brown":"#7a4c29","chestnut":"#6b331a","ginger":"#e66b24","copper":"#cc541f","blonde":"#facc5c","platinum":"#f5f0d6","pink":"#ff73b2","blue":"#384c9e"},"skin":{"orc":"#8cb861","goblin":"#adc759","sea":"#73b8cc","blue":"#7394e6","fairy":"#c7adf2","imp":"#e66b61","alien":"#9ea8b2","ghoul":"#d1dbcc"}},"clips":["idle","walk","run","jump","pick-up","celebrate","scared","attack","trick-or-treat","wave","hit","sad","sneak","spin","idle-peek","idle-yawn","idle-look","dance-wiggle","dance-robot","run-jump","eat-candy","death","aim","run-aim","shoot","ready","slash","smash","fly","lift-off","snowboard","ski","sled"],"oneShots":["death","lift-off"],"deathLiftStep":0.03333333333333333,"baseDeathLift":[-0.22,-0.21,-0.18,-0.17,-0.17,-0.18,-0.18,-0.18,-0.19,-0.2,-0.2,-0.2,-0.2,-0.2,-0.19,-0.18,-0.17,-0.17,-0.16,-0.16,-0.17,-0.17,-0.17,-0.17,-0.17,-0.16,-0.19,-0.22,-0.25,-0.28,-0.32,-0.39,-0.57,-0.59,0,-0.31,-0.44,-0.46,-0.37,-0.23,-0.03,-0.2,-0.19,-0.12,-0.1,-0.09,-0.09,-0.08,-0.08,-0.07,-0.07,-0.07,-0.07,-0.07,-0.07,-0.07,-0.07,-0.07,-0.07,-0.07,-0.07,-0.07,-0.07,-0.07,-0.07,-0.07,-0.07]};

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
