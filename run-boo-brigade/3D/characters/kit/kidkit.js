// Boo Brigade avatar kit for three.js: mix-and-match regular kids.
//
// A kid is the base kid (head, face, skin body, the skeleton and every clip) plus one item per
// slot: hair, face (glasses, freckles ...), top, bottom, shoes and prop. Each item has up to four
// colour channels (main, trim, accent, detail) and a few colourways; any colour works. The kid is
// merged into one skinned mesh with one material, so it is one draw call, and recolouring it
// (skin included) is a uniform change.
//
//   import { loadKidKit } from './kidkit.js';
//   const kit = await loadKidKit('assets/kids/kit/');          // the folder with the kit GLBs
//   const kid = await kit.makeKid(kit.looks['kid-spiky']);     // a ready-made look ...
//   const other = await kit.makeKid(kit.randomLook());         // ... or any mix
//   scene.add(kid.object);
//   kid.play('walk');                                          // clips: kit.clips
//   await kid.wear('top', 'raincoat', 'red');                  // swap an item (colourway name or colours)
//   kid.paint('top', 'main', '#3a7bd5');                       // recolour one channel
//   kid.setSkin(3);                                            // a skin tone index or any colour
//   // every frame:  kid.update(dt);
//
// A look is { skin, hair, face, top, bottom, shoes, prop }, each slot { item, way } or
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

/** The kit's catalog: slots, items, colourways and the ten ready-made looks (built in, so only the GLBs need loading). */
export const CATALOG = {"slots":["hair","face","top","bottom","shoes","prop"],"channels":["main","trim","accent","detail"],"items":{"hair":{"crop":{"channels":{"main":"Hair"},"ways":{"black":["#1a1412"],"dark":["#402617"],"brown":["#7a4c29"],"chestnut":["#6b331a"],"ginger":["#e66b24"],"copper":["#cc541f"],"blonde":["#facc5c"],"platinum":["#f5f0d6"],"pink":["#ff73b2"],"blue":["#384c9e"]},"file":"hair-crop.glb"},"anime":{"channels":{"main":"Hair"},"ways":{"black":["#1a1412"],"dark":["#402617"],"brown":["#7a4c29"],"chestnut":["#6b331a"],"ginger":["#e66b24"],"copper":["#cc541f"],"blonde":["#facc5c"],"platinum":["#f5f0d6"],"pink":["#ff73b2"],"blue":["#384c9e"]},"file":"hair-anime.glb"},"swoop":{"channels":{"main":"Hair"},"ways":{"black":["#1a1412"],"dark":["#402617"],"brown":["#7a4c29"],"chestnut":["#6b331a"],"ginger":["#e66b24"],"copper":["#cc541f"],"blonde":["#facc5c"],"platinum":["#f5f0d6"],"pink":["#ff73b2"],"blue":["#384c9e"]},"file":"hair-swoop.glb"},"quiff":{"channels":{"main":"Hair"},"ways":{"black":["#1a1412"],"dark":["#402617"],"brown":["#7a4c29"],"chestnut":["#6b331a"],"ginger":["#e66b24"],"copper":["#cc541f"],"blonde":["#facc5c"],"platinum":["#f5f0d6"],"pink":["#ff73b2"],"blue":["#384c9e"]},"file":"hair-quiff.glb"},"mohawk":{"channels":{"main":"Hair","trim":"Shaved sides"},"ways":{"punk":["#ff73b2","#1a1412"],"lime":["#9ed14c","#402617"],"blue":["#384c9e","#facc5c"],"natural":["#7a4c29","#402617"]},"file":"hair-mohawk.glb"},"afro":{"channels":{"main":"Hair","trim":"Comb"},"ways":{"black":["#1a1412","#f25973"],"dark":["#402617","#f25973"],"brown":["#7a4c29","#f25973"],"chestnut":["#6b331a","#f25973"],"ginger":["#e66b24","#f25973"],"copper":["#cc541f","#f25973"],"blonde":["#facc5c","#f25973"],"platinum":["#f5f0d6","#f25973"],"pink":["#ff73b2","#f25973"],"blue":["#384c9e","#f25973"]},"file":"hair-afro.glb"},"cloud":{"channels":{"main":"Hair"},"ways":{"black":["#1a1412"],"dark":["#402617"],"brown":["#7a4c29"],"chestnut":["#6b331a"],"ginger":["#e66b24"],"copper":["#cc541f"],"blonde":["#facc5c"],"platinum":["#f5f0d6"],"pink":["#ff73b2"],"blue":["#384c9e"]},"file":"hair-cloud.glb"},"puffs":{"channels":{"main":"Hair","trim":"Ties"},"ways":{"black":["#1a1412","#ff66a6"],"dark":["#402617","#ff66a6"],"brown":["#7a4c29","#ff66a6"],"chestnut":["#6b331a","#ff66a6"],"ginger":["#e66b24","#ff66a6"],"copper":["#cc541f","#ff66a6"],"blonde":["#facc5c","#ff66a6"],"platinum":["#f5f0d6","#ff66a6"],"pink":["#ff73b2","#ff66a6"],"blue":["#384c9e","#ff66a6"]},"file":"hair-puffs.glb"},"braids":{"channels":{"main":"Hair","trim":"Bows"},"ways":{"black":["#1a1412","#59bf8c"],"dark":["#402617","#59bf8c"],"brown":["#7a4c29","#59bf8c"],"chestnut":["#6b331a","#59bf8c"],"ginger":["#e66b24","#59bf8c"],"copper":["#cc541f","#59bf8c"],"blonde":["#facc5c","#59bf8c"],"platinum":["#f5f0d6","#59bf8c"],"pink":["#ff73b2","#59bf8c"],"blue":["#384c9e","#59bf8c"]},"file":"hair-braids.glb"},"ponytail":{"channels":{"main":"Hair","trim":"Scrunchie"},"ways":{"black":["#1a1412","#4cb2f2"],"dark":["#402617","#4cb2f2"],"brown":["#7a4c29","#4cb2f2"],"chestnut":["#6b331a","#4cb2f2"],"ginger":["#e66b24","#4cb2f2"],"copper":["#cc541f","#4cb2f2"],"blonde":["#facc5c","#4cb2f2"],"platinum":["#f5f0d6","#4cb2f2"],"pink":["#ff73b2","#4cb2f2"],"blue":["#384c9e","#4cb2f2"]},"file":"hair-ponytail.glb"},"long":{"channels":{"main":"Hair","trim":"Flower"},"ways":{"black":["#1a1412","#ffffff"],"dark":["#402617","#ffffff"],"brown":["#7a4c29","#ffffff"],"chestnut":["#6b331a","#ffffff"],"ginger":["#e66b24","#ffffff"],"copper":["#cc541f","#ffffff"],"blonde":["#facc5c","#ffffff"],"platinum":["#f5f0d6","#ffffff"],"pink":["#ff73b2","#ffffff"],"blue":["#384c9e","#ffffff"]},"file":"hair-long.glb"}},"face":{"none":{"channels":{},"ways":{"-":["#ffffff"]}},"freckles":{"channels":{"main":"Freckles"},"ways":{"brown":["#ad6642"],"dark":["#663d29"]},"file":"face-freckles.glb"},"round-glasses":{"channels":{"main":"Frames"},"ways":{"black":["#26262e"],"red":["#eb4040"],"tortoise":["#8c613d"],"teal":["#33b2b2"]},"file":"face-round-glasses.glb"},"square-glasses":{"channels":{"main":"Frames"},"ways":{"black":["#26262e"],"blue":["#4773cc"],"pink":["#ff66a6"],"gold":["#fab826"]},"file":"face-square-glasses.glb"},"plaster":{"channels":{"main":"Plaster","trim":"Pad"},"ways":{"plain":["#d9b280","#faf2e0"],"stars":["#66bff2","#ffd126"],"pink":["#ff66a6","#f7f7f7"]},"file":"face-plaster.glb"}},"top":{"tee":{"channels":{"main":"Tee","trim":"Collar","accent":"Pocket"},"ways":{"white":["#f7f7f7","#eb4040","#66bff2"],"green":["#4c9e66","#faf2e0","#fae059"],"black":["#26262e","#ff66a6","#ff66a6"],"yellow":["#ffd126","#333861","#333861"]},"file":"top-tee.glb"},"stripy":{"channels":{"main":"Top","trim":"Stripes"},"ways":{"sailor":["#faf2e0","#f25959"],"navy":["#333861","#f7f7f7"],"bee":["#ffd126","#26262e"],"mint":["#8cd9b8","#bf8cf2"]},"file":"top-stripy.glb"},"hoodie":{"channels":{"main":"Hoodie","trim":"Trim","accent":"Strings"},"ways":{"red":["#eb4040","#fae059","#f7f7f7"],"grey":["#8c99b2","#404559","#f7f7f7"],"lilac":["#bf8cf2","#8cd9b8","#f7f7f7"],"green":["#4c9e66","#fa8c33","#faf2e0"]},"outer":true,"file":"top-hoodie.glb"},"jersey":{"channels":{"main":"Jersey","trim":"Trim","accent":"Number"},"ways":{"gold":["#fab826","#8047bf","#8047bf"],"red":["#eb4040","#f7f7f7","#f7f7f7"],"teal":["#33b2b2","#26262e","#f7f7f7"],"blue":["#4773cc","#fa8c33","#f7f7f7"]},"file":"top-jersey.glb"},"cardigan":{"channels":{"main":"Cardigan","trim":"Tee","accent":"Pompom"},"ways":{"mint":["#8cd9b8","#faf2e6","#ff99b2"],"mustard":["#fab826","#faf2e0","#eb4040"],"rose":["#f2738c","#f7f7f7","#66bff2"],"navy":["#333861","#fae059","#f7f7f7"]},"outer":true,"file":"top-cardigan.glb"},"tube-top":{"channels":{"main":"Top","trim":"Star","accent":"Wristbands"},"ways":{"pink":["#ff66a6","#ffe64c","#ffd94c"],"sky":["#66bff2","#f7f7f7","#ff66a6"],"lime":["#9ed14c","#8047bf","#8047bf"],"black":["#26262e","#fab826","#fab826"]},"file":"top-tube-top.glb"},"raincoat":{"channels":{"main":"Coat","trim":"Trim","accent":"Lining"},"ways":{"yellow":["#ffd126","#d9991a","#4c99e6"],"red":["#eb4040","#333861","#fae059"],"green":["#4c9e66","#ffd126","#fa8c33"],"sky":["#66bff2","#f7f7f7","#ff66a6"]},"outer":true,"file":"top-raincoat.glb"},"band-tee":{"channels":{"main":"Tee","trim":"Bandana","accent":"Bolt"},"ways":{"rock":["#292933","#e63340","#ffd933"],"white":["#f7f7f7","#333861","#eb4040"],"purple":["#8047bf","#26262e","#9ed14c"],"red":["#eb4040","#26262e","#f7f7f7"]},"file":"top-band-tee.glb"},"sweater-vest":{"channels":{"main":"Vest","trim":"Shirt","accent":"Diamonds","detail":"Bow tie"},"ways":{"green":["#4c8c73","#faf7f2","#facc59","#e63340"],"navy":["#333861","#f7f7f7","#eb4040","#eb4040"],"brown":["#8c613d","#66bff2","#faf2e0","#333861"],"plum":["#8047bf","#faf2e0","#ff66a6","#fab826"]},"outer":true,"file":"top-sweater-vest.glb"},"puffer":{"channels":{"main":"Vest","trim":"Top","accent":"Backpack"},"ways":{"teal":["#33b2b2","#fa8c33","#e64c4c"],"black":["#26262e","#eb4040","#ffd126"],"pink":["#ff66a6","#333861","#8cd9b8"],"orange":["#fa8c33","#8c99b2","#4773cc"]},"outer":true,"file":"top-puffer.glb"},"sweater":{"channels":{"main":"Sweater","trim":"Stripes","accent":"Headphones"},"ways":{"midnight":["#333861","#faf7f0","#66d9f2"],"cream":["#faf2e0","#eb4040","#26262e"],"forest":["#4c9e66","#fae059","#f7f7f7"],"lilac":["#bf8cf2","#f7f7f7","#ff66a6"]},"outer":true,"file":"top-sweater.glb"}},"bottom":{"pants":{"channels":{"main":"Trousers","trim":"Turn-ups"},"ways":{"charcoal":["#404559","#404559"],"khaki":["#d9b280","#d9b280"],"brown":["#665240","#665240"],"grey":["#8c99b2","#8c99b2"],"yellow":["#ffd126","#ffd126"],"red":["#eb4040","#eb4040"]},"file":"bottom-pants.glb"},"jeans":{"channels":{"main":"Denim","trim":"Rips","accent":"Pockets and belt"},"ways":{"light":["#7399d9","#f2ebd9","#6185c7"],"dark":["#333861","#66bff2","#8c613d"],"black":["#26262e","#8c99b2","#404559"]},"file":"bottom-jeans.glb"},"joggers":{"channels":{"main":"Joggers","trim":"Stripes and cuffs"},"ways":{"grey":["#8c99b2","#f7f7f7"],"navy":["#333861","#eb4040"],"black":["#26262e","#f7f7f7"],"pink":["#ff66a6","#f7f7f7"]},"file":"bottom-joggers.glb"},"shorts":{"channels":{"main":"Shorts","trim":"Stripes","accent":"Socks","detail":"Sock stripes"},"ways":{"purple":["#8047bf","#fab826","#f7f7f7","#8047bf"],"khaki":["#8c6b4c","#8c6b4c","#e6e6e6","#4c8c73"],"red":["#eb4040","#f7f7f7","#f7f7f7","#eb4040"],"denim":["#4773cc","#4773cc","#f7f7f7","#66bff2"]},"file":"bottom-shorts.glb"},"skirt":{"channels":{"main":"Skirt","trim":"Socks","accent":"Hem"},"ways":{"rose":["#f2738c","#f7f7f7","#f2738c"],"navy":["#333861","#f7f7f7","#f7f7f7"],"tartan":["#eb4040","#26262e","#fab826"],"denim":["#4773cc","#f7f7f7","#66bff2"]},"file":"bottom-skirt.glb"},"tutu":{"channels":{"main":"Tutu","trim":"Top layer","accent":"Leggings"},"ways":{"lilac":["#bf8cf2","#ffd1eb","#59478c"],"mint":["#8cd9b8","#f7f7f7","#33b2b2"],"gold":["#fab826","#fae059","#26262e"],"pink":["#ff66a6","#f2738c","#333861"]},"file":"bottom-tutu.glb"},"overalls":{"channels":{"main":"Denim","trim":"Turn-ups","accent":"Buttons"},"ways":{"denim":["#4773cc","#8cb2e6","#fac740"],"red":["#eb4040","#faf2e0","#f7f7f7"],"yellow":["#ffd126","#f7f7f7","#4773cc"],"brown":["#8c613d","#d9b280","#fab826"]},"file":"bottom-overalls.glb","bib":"bottom-overalls-bib.glb"}},"shoes":{"sneakers":{"channels":{"main":"Shoe","trim":"Laces and sole","accent":"Flash"},"ways":{"white":["#f7f7f7","#e63333","#f7f7f7"],"black":["#26262e","#f7f7f7","#f7f7f7"],"blue":["#4c99f2","#f7f7f7","#f7f7f7"],"red":["#eb4040","#f7f7f7","#ffd126"]},"file":"shoes-sneakers.glb"},"classic":{"channels":{"main":"Shoe","trim":"Strap"},"ways":{"red":["#d9334c","#d9334c"],"yellow":["#fad94c","#fad94c"],"brown":["#73401f","#73401f"],"gold":["#f2bf40","#f2bf40"],"black":["#26262e","#26262e"]},"file":"shoes-classic.glb"},"high-tops":{"channels":{"main":"Shoe","trim":"Toe and sole","accent":"Laces"},"ways":{"red":["#eb4040","#f7f7f7","#f7f7f7"],"black":["#26262e","#f7f7f7","#f7f7f7"],"purple":["#8047bf","#f7f7f7","#9ed14c"],"teal":["#33b2b2","#faf2e0","#fa8c33"]},"file":"shoes-high-tops.glb"},"wellies":{"channels":{"main":"Boot","trim":"Rim"},"ways":{"red":["#eb3840","#ffffff"],"yellow":["#ffd126","#f7f7f7"],"green":["#4c9e66","#ffd126"],"navy":["#333861","#eb4040"]},"file":"shoes-wellies.glb"},"boots":{"channels":{"main":"Boot","trim":"Sole","accent":"Laces"},"ways":{"brown":["#8c613d","#404559","#d9b280"],"black":["#26262e","#404559","#eb4040"],"tan":["#d9b280","#8c613d","#eb4040"]},"file":"shoes-boots.glb"}},"prop":{"none":{"channels":{},"ways":{"-":["#ffffff"]}},"bucket":{"channels":{"main":"Bucket","trim":"Rim"},"ways":{"pumpkin":["#ff8014","#d95c0d"],"ghost":["#f7f7f7","#8c99b2"],"purple":["#8047bf","#bf8cf2"],"green":["#9ed14c","#4c9e66"]},"file":"prop-bucket.glb"},"bucket-full":{"channels":{"main":"Bucket","trim":"Rim"},"ways":{"pumpkin":["#ff8014","#d95c0d"],"ghost":["#f7f7f7","#8c99b2"],"purple":["#8047bf","#bf8cf2"],"green":["#9ed14c","#4c9e66"]},"file":"prop-bucket-full.glb"},"sack":{"channels":{"main":"Sack","trim":"Tie","accent":"Sticker"},"ways":{"white":["#f7f7f7","#fa8c33","#8047bf"],"striped":["#66bff2","#eb4040","#ffd126"],"black":["#404559","#fa8c33","#9ed14c"]},"file":"prop-sack.glb"},"flashlight":{"channels":{"main":"Body","trim":"Head"},"ways":{"red":["#eb4040","#404559"],"yellow":["#ffd126","#26262e"],"blue":["#4773cc","#8c99b2"]},"file":"prop-flashlight.glb"},"lollipop":{"channels":{"main":"Candy","trim":"Swirl"},"ways":{"strawberry":["#ff66a6","#f7f7f7"],"lemon":["#ffd126","#fa8c33"],"rainbow":["#66bff2","#bf8cf2"]},"file":"prop-lollipop.glb"},"wand":{"channels":{"main":"Stick","trim":"Star"},"ways":{"gold":["#8047bf","#fab826"],"pink":["#f7f7f7","#ff66a6"],"silver":["#333861","#d9dee6"]},"file":"prop-wand.glb"},"teddy":{"channels":{"main":"Fur","trim":"Tummy","accent":"Bow"},"ways":{"brown":["#8c613d","#d9b280","#eb4040"],"honey":["#fab826","#faf2e0","#66bff2"],"pink":["#f2738c","#f7f7f7","#8047bf"]},"file":"prop-teddy.glb"}}},"looks":{"kid-spiky":{"skin":1,"hair":{"item":"anime","colours":["#384c9e"]},"face":{"item":"none","colours":["#ffffff"]},"top":{"item":"hoodie","colours":["#eb4040","#fae059","#f7f7f7"]},"bottom":{"item":"pants","colours":["#404559","#404559"]},"shoes":{"item":"sneakers","colours":["#f7f7f7","#e63333","#f7f7f7"]},"prop":{"item":"bucket-full","colours":["#ff8014","#d95c0d"]}},"kid-pigtails":{"skin":0,"hair":{"item":"braids","colours":["#e66b24","#59bf8c"]},"face":{"item":"none","colours":["#ffffff"]},"top":{"item":"stripy","colours":["#faf2e0","#f25959"]},"bottom":{"item":"overalls","colours":["#4773cc","#8cb2e6","#fac740"]},"shoes":{"item":"classic","colours":["#f2bf40","#f2bf40"]},"prop":{"item":"bucket","colours":["#ff8014","#d95c0d"]}},"kid-afro":{"skin":5,"hair":{"item":"afro","colours":["#1a1412","#f25973"]},"face":{"item":"none","colours":["#ffffff"]},"top":{"item":"jersey","colours":["#fab826","#8047bf","#8047bf"]},"bottom":{"item":"shorts","colours":["#8047bf","#fab826","#f7f7f7","#8047bf"]},"shoes":{"item":"sneakers","colours":["#f7f7f7","#8047bf","#f7f7f7"]},"prop":{"item":"bucket-full","colours":["#ff8014","#d95c0d"]}},"kid-bob":{"skin":2,"hair":{"item":"long","colours":["#6b331a","#ffffff"]},"face":{"item":"none","colours":["#ffffff"]},"top":{"item":"cardigan","colours":["#8cd9b8","#faf2e6","#ff99b2"]},"bottom":{"item":"skirt","colours":["#f2738c","#f7f7f7","#f2738c"]},"shoes":{"item":"classic","colours":["#d9334c","#d9334c"]},"prop":{"item":"bucket","colours":["#ff8014","#d95c0d"]}},"kid-puffs":{"skin":4,"hair":{"item":"puffs","colours":["#402617","#ff66a6"]},"face":{"item":"none","colours":["#ffffff"]},"top":{"item":"tube-top","colours":["#ff66a6","#ffe64c","#ffd94c"]},"bottom":{"item":"tutu","colours":["#bf8cf2","#ffd1eb","#59478c"]},"shoes":{"item":"classic","colours":["#fad94c","#fad94c"]},"prop":{"item":"bucket-full","colours":["#ff8014","#d95c0d"]}},"kid-ponytail":{"skin":3,"hair":{"item":"ponytail","colours":["#7a4c29","#4cb2f2"]},"face":{"item":"none","colours":["#ffffff"]},"top":{"item":"raincoat","colours":["#ffd126","#d9991a","#4c99e6"]},"bottom":{"item":"pants","colours":["#ffd126","#ffd126"]},"shoes":{"item":"wellies","colours":["#eb3840","#ffffff"]},"prop":{"item":"bucket","colours":["#ff8014","#d95c0d"]}},"kid-buzz":{"skin":4,"hair":{"item":"mohawk","colours":["#ff73b2","#1a1412"]},"face":{"item":"none","colours":["#ffffff"]},"top":{"item":"band-tee","colours":["#292933","#e63340","#ffd933"]},"bottom":{"item":"jeans","colours":["#7399d9","#f2ebd9","#6185c7"]},"shoes":{"item":"sneakers","colours":["#26262e","#f7f7f7","#f7f7f7"]},"prop":{"item":"bucket","colours":["#ff8014","#d95c0d"]}},"kid-bun":{"skin":1,"hair":{"item":"quiff","colours":["#facc5c"]},"face":{"item":"none","colours":["#ffffff"]},"top":{"item":"sweater-vest","colours":["#4c8c73","#faf7f2","#facc59","#e63340"]},"bottom":{"item":"shorts","colours":["#8c6b4c","#8c6b4c","#e6e6e6","#4c8c73"]},"shoes":{"item":"classic","colours":["#73401f","#73401f"]},"prop":{"item":"bucket-full","colours":["#ff8014","#d95c0d"]}},"kid-curly":{"skin":3,"hair":{"item":"cloud","colours":["#cc541f"]},"face":{"item":"none","colours":["#ffffff"]},"top":{"item":"puffer","colours":["#33b2b2","#fa8c33","#e64c4c"]},"bottom":{"item":"pants","colours":["#665240","#665240"]},"shoes":{"item":"sneakers","colours":["#4c99f2","#f7f7f7","#f7f7f7"]},"prop":{"item":"bucket-full","colours":["#ff8014","#d95c0d"]}},"kid-platinum":{"skin":0,"hair":{"item":"swoop","colours":["#f5f0d6"]},"face":{"item":"none","colours":["#ffffff"]},"top":{"item":"sweater","colours":["#333861","#faf7f0","#66d9f2"]},"bottom":{"item":"pants","colours":["#8c99b2","#8c99b2"]},"shoes":{"item":"sneakers","colours":["#f7f7f7","#26262e","#f7f7f7"]},"prop":{"item":"bucket","colours":["#ff8014","#d95c0d"]}}},"skinTones":["#fcdbbd","#f2c79e","#e0a87a","#bd8052","#8f5936","#613b24"],"suggest":{"cloth":{"red":"#eb4040","tomato":"#f26b4c","orange":"#fa8c33","gold":"#fab826","yellow":"#ffd126","butter":"#fae059","lime":"#9ed14c","green":"#4c9e66","mint":"#8cd9b8","teal":"#33b2b2","sky":"#66bff2","blue":"#4773cc","navy":"#333861","purple":"#8047bf","lilac":"#bf8cf2","pink":"#ff66a6","rose":"#f2738c","brown":"#8c613d","tan":"#d9b280","cream":"#faf2e0","white":"#f7f7f7","grey":"#8c99b2","charcoal":"#404559","black":"#26262e"},"hair":{"black":"#1a1412","dark":"#402617","brown":"#7a4c29","chestnut":"#6b331a","ginger":"#e66b24","copper":"#cc541f","blonde":"#facc5c","platinum":"#f5f0d6","pink":"#ff73b2","blue":"#384c9e"}},"clips":["idle","walk","run","jump","pick-up","celebrate","scared","attack","trick-or-treat","wave","hit","sad","sneak","spin","idle-peek","idle-yawn","idle-look","dance-wiggle","dance-robot","run-jump","eat-candy","death"]};

export async function loadKidKit(base, { loader = new GLTFLoader(), catalog = CATALOG } = {}) {
  if (!base.endsWith('/')) base += '/';
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
    const src = mesh.geometry;
    const g = new THREE.BufferGeometry();
    g.setIndex(src.index ? src.index.clone() : null);
    g.setAttribute('position', src.attributes.position.clone());
    g.setAttribute('normal', src.attributes.normal.clone());
    const n = src.attributes.position.count;
    const col = new Float32Array(n * 3), chan = new Float32Array(n);
    const c = src.attributes.color, uv = src.attributes.uv;
    for (let i = 0; i < n; i++) {
      col[i * 3] = c.getX(i); col[i * 3 + 1] = c.getY(i); col[i * 3 + 2] = c.getZ(i);
      const code = Math.round(uv.getX(i));
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
      const s = typeof look[slot] === 'string' ? { item: look[slot] } : (look[slot] ?? { item: Object.keys(catalog.items[slot])[0] });
      out[slot] = { item: s.item, colours: colours(slot, s.item, s) };
    }
    return out;
  }

  function randomLook(rng = Math.random) {
    const pick = a => a[Math.floor(rng() * a.length)];
    const look = { skin: Math.floor(rng() * catalog.skinTones.length) };
    for (const slot of slots) {
      const names = Object.keys(catalog.items[slot]);
      const item = slot === 'face' && rng() < 0.55 ? 'none' : pick(names);
      look[slot] = { item, way: pick(Object.keys(catalog.items[slot][item].ways)) };
    }
    return look;
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
      const jobs = [];
      for (const slot of slots) {
        const it = items[slot][look[slot].item];
        if (it.file) jobs.push(piece(it.file, slot));
        if (it.bib && !items.top[look.top.item].outer) jobs.push(piece(it.bib, slot));
      }
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

    play(name, { fade = 0.2, loop = name !== 'death' } = {}) {
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

    update(dt) { this.mixer.update(dt); }

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
    slots, items: catalog.items, looks: catalog.looks, clips: Object.keys(clips), skinTones: catalog.skinTones,
    suggest: catalog.suggest, makeKid, randomLook, colours,
  };
  return kit;
}

function findSkinned(root) {
  let m = null;
  root.traverse(o => { if (!m && o.isSkinnedMesh) m = o; });
  return m;
}

// A standard material whose vertex colour is either the vertex's own (fixed details) or one of the
// kid's palette slots (skin and the items' channels), chosen per vertex by kitChan.
function kidMaterial(palette) {
  const m = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.9, metalness: 0 });
  m.onBeforeCompile = sh => {
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
  };
  m.customProgramCacheKey = () => `kidkit${palette.length}`;
  return m;
}
