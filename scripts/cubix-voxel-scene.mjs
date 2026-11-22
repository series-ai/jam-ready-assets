function requireField(valid, message) {
  if (!valid) throw new Error(message);
}

const record = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const name = (value) => typeof value === 'string' && value.trim().length > 0;
const tuple = (value, length, check) => Array.isArray(value) && value.length === length && value.every(check);

function validatePalette(palette, regions, field) {
  requireField(record(palette), `${field} must be a palette object`);
  for (const [region, color] of Object.entries(palette)) {
    requireField(regions.has(region), `${field} has unknown region ${region}`);
    requireField(typeof color === 'string' && /^#[0-9a-f]{6}$/i.test(color), `${field}.${region} needs an sRGB hex color`);
  }
}

function validateFinishes(finishes, regions) {
  requireField(record(finishes) && record(finishes.regions), 'expected material finishes');
  const unit = (value) => Number.isFinite(value) && value >= 0 && value <= 1;
  requireField(Object.keys(finishes.regions).length === regions.size, 'expected one finish per palette region');
  for (const region of regions) {
    requireField(Object.hasOwn(finishes.regions, region) && tuple(finishes.regions[region], 2, unit),
      `${region}: roughness and metalness must be from 0 to 1`);
  }
  requireField(tuple(finishes.water, 2, unit) && tuple(finishes.glass, 2, unit),
    'water and glass need roughness and metalness');
  requireField(unit(finishes.glassOpacity) && Number.isFinite(finishes.emissiveStrength)
    && finishes.emissiveStrength > 0, 'invalid glass opacity or lamp strength');
  const byte = (value) => Number.isInteger(value) && value >= 0 && value <= 255;
  requireField(tuple(finishes.grain, 16, (row) => tuple(row, 16, byte)), 'grain must be a 16 by 16 table of bytes');
}

function validatePrefab(id, prefab, doc, regions) {
  requireField(record(prefab), `${id} must be a prefab object`);
  requireField(tuple(prefab.origin, 3, Number.isFinite), `${id}.origin must contain three finite meter coordinates`);
  requireField(tuple(prefab.size, 3, (n) => Number.isSafeInteger(n) && n > 0), `${id}.size must contain three positive cell counts`);
  if (Object.hasOwn(prefab, 'palette')) validatePalette(prefab.palette, regions, `${id}.palette`);
  const palette = { ...doc.palette, ...prefab.palette };
  requireField(Array.isArray(prefab.runs) && prefab.runs.length > 0, `${id}.runs must contain occupied runs`);
  const [width, height, depth] = prefab.size;
  for (const run of prefab.runs) {
    requireField(tuple(run, 5, Number.isSafeInteger), `${id}: expected five integers per run`);
    const [x, y, z, length, code] = run;
    requireField(x >= 0 && y >= 0 && z >= 0 && y < height && z < depth && length > 0 && x <= width - length,
      `${id}: run lies outside prefab bounds or has invalid length`);
    requireField(code > 0, `${id}: occupied runs need a positive cell code`);
    const value = code - 1;
    // Arithmetic division keeps large input codes from wrapping to a valid 32-bit region.
    const region = doc.regions[Math.floor(value / 256)];
    requireField(region !== undefined && Object.hasOwn(palette, region), `${id}: cell code has an unknown or uncolored region`);
    const shade = (value >> 1) & 127;
    requireField(shade <= 24 || shade === 31, `${id}: unsupported shade ${shade}`);
  }
  // Compare adjacent intervals on each row without expanding large runs into cells.
  const ordered = [...prefab.runs].sort((a, b) => a[1] - b[1] || a[2] - b[2] || a[0] - b[0]);
  for (let i = 1; i < ordered.length; i++) {
    const [x, y, z, length] = ordered[i - 1];
    const next = ordered[i];
    requireField(y !== next[1] || z !== next[2] || x + length <= next[0], `${id}: occupied runs overlap`);
  }
}

function validateDemoGlb(glb, prefabs, placements) {
  requireField(glb.length >= 20 && glb.toString('ascii', 0, 4) === 'glTF'
    && glb.readUInt32LE(4) === 2 && glb.readUInt32LE(8) === glb.length, 'invalid demo.glb header');
  const length = glb.readUInt32LE(12);
  requireField(length % 4 === 0 && length <= glb.length - 20 && glb.toString('ascii', 16, 20) === 'JSON',
    'invalid demo.glb JSON chunk');
  const document = JSON.parse(glb.toString('utf8', 20, 20 + length));
  requireField(Array.isArray(document?.meshes), 'demo.glb needs named prefab meshes');
  const remaining = new Set(Object.keys(prefabs));
  for (const mesh of document.meshes) {
    requireField(remaining.delete(mesh?.name), `demo.glb has an unknown or duplicate mesh: ${mesh?.name}`);
  }
  requireField(!remaining.size, `demo.glb is missing prefab mesh: ${remaining.values().next().value}`);

  const sceneNodes = document.scenes?.[document.scene ?? 0]?.nodes;
  requireField(Array.isArray(sceneNodes) && Array.isArray(document.nodes), 'demo.glb needs a default scene');
  requireField(sceneNodes.every(Number.isSafeInteger) && new Set(sceneNodes).size === sceneNodes.length,
    'demo.glb has an invalid or repeated scene node index');
  const nodes = sceneNodes.map((index) => document.nodes[index]);
  requireField(nodes.every(record), 'demo.glb has an invalid scene node');
  requireField(nodes.every((node) => node.children === undefined
      || (Array.isArray(node.children) && node.children.length === 0)),
    'demo.glb needs direct scene nodes for the voxel placements');
  const placed = nodes.filter((node) => Object.hasOwn(node, 'mesh'));
  requireField(placed.length === placements.length, 'demo.glb placement count differs from its voxel scene');
  function equalTuple(actual, expected) {
    return tuple(actual, expected.length, Number.isFinite)
      && actual.every((value, index) => Math.abs(value - expected[index]) <= 1e-6);
  }
  for (const [index, { propId, position, turn }] of placements.entries()) {
    const node = placed[index];
    const angle = turn * Math.PI / 4;
    const rotation = [0, Math.sin(angle), 0, Math.cos(angle)];
    requireField(Number.isSafeInteger(node.mesh) && document.meshes[node.mesh]?.name === propId
      && node.matrix === undefined
      && equalTuple(node.scale ?? [1, 1, 1], [1, 1, 1])
      && equalTuple(node.translation ?? [0, 0, 0], position)
      && (equalTuple(node.rotation ?? [0, 0, 0, 1], rotation)
        || equalTuple(node.rotation, rotation.map((value) => -value))),
    `demo.glb placement ${index + 1} differs from its voxel scene`);
  }
}

export function validateCubixScene(doc, glb) {
  requireField(doc?.format === 'cubix-level-voxels' && doc.version === 1, 'expected cubix-level-voxels version 1');
  requireField(name(doc.pack), 'expected a pack name');
  requireField(doc.voxelSize === 0.1, 'voxelSize must be 0.1 meters');
  requireField(Array.isArray(doc.regions) && doc.regions.length > 0 && doc.regions.every(name), 'expected named regions');
  const regions = new Set(doc.regions);
  requireField(regions.size === doc.regions.length, 'region names must be unique');
  validatePalette(doc.palette, regions, 'palette');
  if (doc.finishes !== undefined) validateFinishes(doc.finishes, regions);
  requireField(record(doc.prefabs) && Object.keys(doc.prefabs).length > 0, 'expected prefabs');
  for (const [id, prefab] of Object.entries(doc.prefabs)) {
    requireField(name(id), 'expected a prefab identifier');
    validatePrefab(id, prefab, doc, regions);
  }
  requireField(Array.isArray(doc.scene?.placements) && doc.scene.placements.length > 0, 'expected scene placements');
  for (const placement of doc.scene.placements) {
    requireField(name(placement?.propId) && Object.hasOwn(doc.prefabs, placement.propId), 'placement references an unknown prefab');
    requireField(tuple(placement.position, 3, Number.isFinite), 'placement.position must contain three finite meter coordinates');
    requireField(Number.isInteger(placement.turn) && placement.turn >= 0 && placement.turn <= 3,
      'placement.turn must be a quarter-turn index from 0 to 3');
  }
  if (glb !== undefined) validateDemoGlb(glb, doc.prefabs, doc.scene.placements);
}
