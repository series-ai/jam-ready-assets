import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { validateCubixScene } from './cubix-voxel-scene.mjs';

const coreCharacters = 'run-cubix-core/3D/characters';
const cubix = 'run-cubix-core/3D/prototype-blocks';
const noDemo = 'run-cubix-fantasy/3D/fantasy';
const other = 'demo-props/3D/city';
const voxelScene = 'level-kit/demo.voxels.json';
const license = readFileSync(new URL('../' + coreCharacters + '/License.txt', import.meta.url));

function voxelDocument() {
  return {
    format: 'cubix-level-voxels', version: 1, pack: 'core', voxelSize: 0.1,
    regions: ['metal', 'trim'], palette: { metal: '#748390' },
    prefabs: { bench: { size: [3, 1, 1], origin: [-0.15, 0, 0],
      palette: { trim: '#abcdef' }, runs: [[2, 0, 0, 1, 320], [0, 0, 0, 2, 49]] } },
    scene: { placements: [{ propId: 'bench', position: [0.035, 0, 1], turn: 3 }] },
  };
}

function demoGlb(names, raw = voxelDocument(), editNodes) {
  const nodes = raw.scene.placements.map(({ propId, position, turn }) => ({
    mesh: names.indexOf(propId),
    translation: position,
    rotation: [0, Math.sin(turn * Math.PI / 4), 0, Math.cos(turn * Math.PI / 4)],
  }));
  const roots = nodes.map((_, i) => i);
  editNodes?.(nodes);
  const doc = JSON.stringify({
    asset: { version: '2.0' }, meshes: names.map((name) => ({ name })), nodes,
    scene: 0, scenes: [{ nodes: roots }],
  });
  const chunk = Buffer.from(doc.padEnd(Math.ceil(doc.length / 4) * 4));
  const header = Buffer.alloc(20);
  header.write('glTF');
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(20 + chunk.length, 8);
  header.writeUInt32LE(chunk.length, 12);
  header.write('JSON', 16);
  return Buffer.concat([header, chunk]);
}

test('mirrors and versions the paired Cubix voxel scene', (t) => {
  const root = mkdtempSync(join(tmpdir(), 'cubix-manifest-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  execFileSync('git', ['init', '-q'], { cwd: root });
  execFileSync('git', ['-c', 'user.name=Test', '-c', 'user.email=test@example.invalid',
    'commit', '--allow-empty', '-qm', 'Add manifest fixture'], { cwd: root });

  const preview = 'preview';
  const hash = createHash('sha256').update(preview).digest('hex');
  const selections = {};
  for (const id of [cubix, coreCharacters, noDemo, other]) {
    mkdirSync(join(root, id, 'level-kit'), { recursive: true });
    writeFileSync(join(root, id, 'License.txt'), license);
    writeFileSync(join(root, id, 'preview.webp'), preview);
    if (id !== coreCharacters) writeFileSync(join(root, id, voxelScene), id === cubix ? JSON.stringify(voxelDocument()) : '{}');
    writeFileSync(join(root, id, 'level-kit', 'authoring.json'), '{}');
    writeFileSync(join(root, id, 'level-kit', id === noDemo || id === coreCharacters ? 'prop.glb' : 'demo.glb'), id === cubix ? demoGlb(['bench']) : 'mesh');
    selections[id] = {
      kind: 'derived',
      sourcePath: 'preview-source.png',
      sourceSha256: hash,
      sourceUrl: 'https://example.invalid/preview',
      description: 'Fixture preview',
      licenseEvidence: id + '/License.txt',
      outputSha256: hash,
    };
  }
  const galleryImage = 'Previews/Workroom.jpg';
  mkdirSync(join(root, cubix, 'Previews'));
  writeFileSync(join(root, cubix, galleryImage), 'gallery cut');
  writeFileSync(join(root, cubix, 'prop.glb'), 'existing world prop');
  selections[cubix].gallery = [galleryImage];
  writeFileSync(join(root, 'preview-sources.json'), JSON.stringify({ schemaVersion: 1, packs: selections }));

  function build() {
    execFileSync(process.execPath, [fileURLToPath(new URL('./build-manifest.mjs', import.meta.url))], {
      cwd: root, stdio: 'pipe',
      env: { ...process.env, SKIP_PUBLISHED_CHECK: '1' },
    });
    return JSON.parse(readFileSync(join(root, 'manifest/v2/index.json')));
  }

  const first = build();
  assert.equal(first.packs.find((pack) => pack.id === coreCharacters).slug, 'run-cubix-core');
  assert.equal(first.packs.find((pack) => pack.id === cubix).slug, 'run-cubix-core-3d-prototype-blocks');
  const files = (id) => JSON.parse(readFileSync(join(root, 'manifest/v2/commits', first.commit,
    'packs', id.replaceAll('/', '--') + '.json'))).files;
  assert.equal(files(cubix).find((file) => file.path === voxelScene).runtime, true);
  assert.equal(files(cubix).find((file) => file.path === galleryImage).runtime, false);
  assert.equal(first.packs.find((pack) => pack.id === cubix).galleryOids.length, 1);
  assert.equal(files(cubix).find((file) => file.path === 'level-kit/authoring.json').runtime, false);
  for (const id of [noDemo, other]) {
    assert.equal(files(id).find((file) => file.path === voxelScene).runtime, false);
  }

  const changed = voxelDocument();
  changed.scene.placements[0].turn = 1;
  writeFileSync(join(root, cubix, voxelScene), JSON.stringify(changed));
  writeFileSync(join(root, cubix, 'level-kit/demo.glb'), demoGlb(['bench'], changed));
  const second = build();
  const version = (manifest) => manifest.packs.find((pack) => pack.id === cubix).version;
  assert.notEqual(version(first), version(second));
  writeFileSync(join(root, cubix, galleryImage), 'revised gallery cut');
  assert.equal(version(build()), version(second));

  const glb = demoGlb(['bench'], changed);
  const oid = createHash('sha256').update(glb).digest('hex');
  writeFileSync(join(root, cubix, 'level-kit/demo.glb'),
    `version https://git-lfs.github.com/spec/v1\noid sha256:${oid}\nsize ${glb.length}\n`);
  assert.equal(version(build()), version(second));

  changed.prefabs.bench.runs[0][4] = 51;
  writeFileSync(join(root, cubix, voxelScene), JSON.stringify(changed));
  function rejectedWith(reason) {
    assert.ok(!build().packs.some((pack) => pack.id === cubix));
    const rejected = JSON.parse(readFileSync(join(root, '.rejected-packs.json')));
    assert.match(rejected.find((pack) => pack.id === cubix).error, reason);
  }
  rejectedWith(/shade/i);
  writeFileSync(join(root, cubix, voxelScene), JSON.stringify(voxelDocument()));
  writeFileSync(join(root, cubix, 'level-kit/demo.glb'), demoGlb(['crate']));
  rejectedWith(/mesh/i);
  writeFileSync(join(root, cubix, voxelScene), JSON.stringify({ ...voxelDocument(),
    scene: { placements: [{ propId: 'bench', position: [0.035, 0, 4], turn: 3 }] } }));
  writeFileSync(join(root, cubix, 'level-kit/demo.glb'), demoGlb(['bench']));
  rejectedWith(/placement/i);
  writeFileSync(join(root, cubix, 'level-kit/demo.glb'), demoGlb(['bench']));
  rmSync(join(root, cubix, voxelScene));
  rejectedWith(/missing demo.voxels.json/i);
});

test('checks Cubix v1 tuples, cell bounds, palette codes and placements', () => {
  const cases = [
    ['format', (d) => { d.format = 'other'; }, /version/],
    ['version', (d) => { d.version = 2; }, /version/],
    ['units', (d) => { d.voxelSize = 1; }, /voxelSize/],
    ['regions', (d) => { d.regions[1] = 'metal'; }, /unique/],
    ['color', (d) => { d.palette.metal = 'green'; }, /hex/],
    ['override color', (d) => { d.prefabs.bench.palette.trim = '#12345Z'; }, /hex/],
    ['unknown override', (d) => { d.prefabs.bench.palette.fabric = '#ffffff'; }, /unknown region/],
    ['missing color', (d) => { delete d.prefabs.bench.palette.trim; }, /uncolored/],
    ['size', (d, p) => { p.size[1] = 0; }, /cell counts/],
    ['origin', (d, p) => { p.origin.pop(); }, /origin/],
    ['run fields', (d, p) => { p.runs[0].pop(); }, /integers/],
    ['negative index', (d, p) => { p.runs[0][2] = -1; }, /bounds/],
    ['extent', (d, p) => { p.runs[0][3] = 2; }, /bounds/],
    ['empty run', (d, p) => { p.runs[0][3] = 0; }, /length/],
    ['overlap', (d, p) => { p.runs[0][0] = 1; }, /overlap/],
    ['air', (d, p) => { p.runs[0][4] = 0; }, /positive/],
    ['large code', (d, p) => { p.runs[0][4] += 2 ** 32; }, /region/],
    ['shade', (d, p) => { p.runs[0][4] = 65; }, /shade/],
    ['prefab reference', (d) => { d.scene.placements[0].propId = 'toString'; }, /unknown prefab/],
    ['position', (d) => { d.scene.placements[0].position[1] = '0'; }, /position/],
    ['turn', (d) => { d.scene.placements[0].turn = 4; }, /turn/],
  ];
  for (const [label, change, error] of cases) {
    const scene = voxelDocument();
    change(scene, scene.prefabs.bench);
    assert.throws(() => validateCubixScene(scene), error, label);
  }
  const scene = voxelDocument();
  scene.finishes = {
    regions: { metal: [0.5, 0.3], trim: [0.8, 0] }, water: [0.2, 0], glass: [0.1, 0],
    glassOpacity: 0.27, emissiveStrength: 1.25,
    grain: Array.from({ length: 16 }, () => Array(16).fill(255)),
  };
  assert.doesNotThrow(() => validateCubixScene(scene, demoGlb(['bench'])));
  scene.finishes.regions.metal[0] = 3;
  assert.throws(() => validateCubixScene(scene), /roughness/);
  scene.finishes.regions.metal[0] = 0.5;
  scene.finishes.grain[3].pop();
  assert.throws(() => validateCubixScene(scene), /grain/);
  delete scene.finishes;
  assert.throws(() => validateCubixScene(scene, Buffer.from('mesh')), /header/);
  assert.throws(() => validateCubixScene(scene, demoGlb([])), /missing prefab mesh/);
  assert.throws(() => validateCubixScene(scene, demoGlb(['bench', 'bench'])), /duplicate mesh/);
  const nested = demoGlb(['bench'], scene, (nodes) => {
    nodes[0].children = [nodes.length];
    nodes.push({ mesh: 0 });
  });
  assert.throws(() => validateCubixScene(scene, nested), /direct scene nodes/);
  const shifted = voxelDocument();
  shifted.scene.placements[0].position[2] += 0.2;
  assert.throws(() => validateCubixScene(shifted, demoGlb(['bench'])), /placement 1/);
  shifted.scene.placements[0].position[2] -= 0.2;
  shifted.scene.placements[0].turn = 2;
  assert.throws(() => validateCubixScene(shifted, demoGlb(['bench'])), /placement 1/);
  shifted.scene.placements.push(shifted.scene.placements[0]);
  assert.throws(() => validateCubixScene(shifted, demoGlb(['bench'])), /placement count/);

});
