// Shared dog clips for three.js. One clips.glb drives every rigged dog.
//
//   const lib = await loadClipLibrary(loader, 'rigged/clips.glb');
//   const dog = setupDog(gltf.scene, lib);           // per dog
//   dog.play('trot');
//   dog.setSpeed(1.2, scale);                         // gaits: feet stay planted at this ground speed
//   dog.onEvent = (name, dog) => { ... };             // 'catch', 'release', 'bark', 'pee_start', ...
//   dog.update(dt);
//
// Clips are authored on the Labrador. Two adjustments fit them to each dog:
// - root motion (bounce, crouch, jump) scales with leg length, so short legs crouch less;
// - body tilt (hips, spine, chest) shrinks for long-bodied dogs, so a Dachshund's chest
//   drops as far in a bow as a Labrador's instead of going through the floor. Legs, tail
//   and neck are counter-rotated to keep their world angle, so the paws stay planted;
// - tails are fitted to each dog (hanging, curled, bobbed), so tail rotations are
//   re-based from the Labrador's tail rest pose onto this dog's.
// Clips flagged nose_ground (sniff) get a small per-frame fix after the mixer runs:
// the neck tips until the nose is on the ground, whatever this breed's neck and legs.
// Clips with a tail_line window (point) straighten the tail out behind the same way.
import * as THREE from 'three';

export async function loadClipLibrary(loader, url) {
  const gltf = await loader.loadAsync(url);
  let meta = {}, leg = 1, body = 1;
  const rest = {};
  // the rest pose of every animated node (bones or not: a compressed clips file may lose the
  // unused skin that makes three treat its nodes as bones)
  const animated = new Set(gltf.animations.flatMap(c => c.tracks.map(t => t.name.split('.')[0])));
  gltf.scene.traverse(o => {
    if (o.isBone || animated.has(o.name)) rest[o.name] = o.quaternion.clone();
    if (o.userData.clips) meta = JSON.parse(o.userData.clips);
    if (o.userData.leg_length) leg = o.userData.leg_length;
    if (o.userData.body_length) body = o.userData.body_length;
  });
  return { clips: gltf.animations, meta, leg, body, rest };
}

const BODY = ['hips', 'spine', 'chest'];
const ON_HIPS = ['thighL', 'thighR', 'tail1'];
const ON_CHEST = ['upperarmL', 'upperarmR', 'neck'];
const I = new THREE.Quaternion();

function retarget(clip, legRatio, tilt, restRef = {}, restDog = {}, lieScale = 1, tailScale = 1) {
  const c = clip.clone();
  // Bones whose rest pose differs from the Labrador's (fitted tails) are animated in their
  // own frame (local = rest * delta), so swap the rest: local = restDog * restRef^-1 * clip.
  c.tracks = c.tracks.map(track => {
    const name = track.name.split('.')[0];
    const a = restRef[name], b = restDog[name];
    if (track.ValueTypeName !== 'quaternion' || !a || !b || Math.abs(a.dot(b)) > 0.9999) return track;
    const fix = b.clone().multiply(a.clone().invert()), q = new THREE.Quaternion(), values = track.values.slice();
    // curled tails: a smaller motion about their own rest (they wiggle, they don't swing)
    const damp = tailScale !== 1 && /^tail/.test(name);
    for (let k = 0; k < values.length; k += 4) {
      q.fromArray(values, k).premultiply(fix);
      if (damp) q.copy(b.clone().slerp(q, tailScale));
      q.toArray(values, k);
    }
    return new THREE.QuaternionKeyframeTrack(track.name, track.times, values);
  });
  const byName = Object.fromEntries(c.tracks.map(t => [t.name.split('.')[0], t]));
  const sampler = name => {
    const t = byName[name];
    if (!t || t.ValueTypeName !== 'quaternion') return () => new THREE.Quaternion();
    const interp = t.createInterpolant();
    return time => new THREE.Quaternion().fromArray(interp.evaluate(time));
  };
  const body = Object.fromEntries(BODY.map(n => [n, sampler(n)]));
  const scaled = (n, time) => I.clone().slerp(body[n](time), tilt);
  const chain = (time, f) => f('hips', time).multiply(f('spine', time)).multiply(f('chest', time));
  const times = [...new Set(BODY.flatMap(n => byName[n] ? [...byName[n].times] : []))].sort((a, b) => a - b);

  const tracks = [];
  for (const track of c.tracks) {
    const name = track.name.split('.')[0];
    if (name === 'root' && track.ValueTypeName === 'vector') {
      track.values = track.values.map(v => v * legRatio);
      if (lieScale !== 1) {   // lying down: drop to this dog's own belly line (the most-lowered axis)
        for (let i = 1; i < track.values.length; i += 3) if (track.values[i] < 0) track.values[i] *= lieScale;   // y: up
      }
    } else if (tilt !== 1 && track.ValueTypeName === 'quaternion' &&
               (BODY.includes(name) || ON_HIPS.includes(name) || ON_CHEST.includes(name))) {
      const own = sampler(name);
      const ts = [...new Set([...times, ...track.times])].sort((a, b) => a - b);
      const values = [];
      for (const time of ts) {
        let q;
        if (BODY.includes(name)) q = scaled(name, time);
        else {
          const [oldP, newP] = ON_HIPS.includes(name)
            ? [body.hips(time), scaled('hips', time)]
            : [chain(time, (n, t) => body[n](t)), chain(time, scaled)];
          q = newP.invert().multiply(oldP).multiply(own(time));
        }
        values.push(q.x, q.y, q.z, q.w);
      }
      tracks.push(new THREE.QuaternionKeyframeTrack(track.name, ts, values));
      continue;
    }
    tracks.push(track);
  }
  c.tracks = tracks;
  return c;
}

export function setupDog(root, lib) {
  let leg = 0.4, body = 0.55, ballRadius = 0.05, mouth = null, bellyGap = 0.55, tailRadius = 0.03, tailCurl = false;
  const rest = {}, bones = {};
  root.traverse(o => {
    if (o.isBone) { rest[o.name] = o.quaternion.clone(); bones[o.name] = o; }
    if (o.userData.leg_length) leg = o.userData.leg_length;
    if (o.userData.body_length) body = o.userData.body_length;
    if (o.userData.ball_radius) ballRadius = o.userData.ball_radius;
    if (o.userData.belly_gap) bellyGap = o.userData.belly_gap;
    if (o.userData.tail_radius) tailRadius = o.userData.tail_radius;
    if (o.userData.tail_curl) tailCurl = true;
    if (o.isBone && o.name === 'mouth') mouth = o;
  });
  const mixer = new THREE.AnimationMixer(root);
  // Long dogs tilt less: keep the chest drop the same in leg lengths.
  const tilt = Math.min(1.2, Math.max(0.4, (lib.body / lib.leg) / (body / leg)));
  // Lying down: clips drop the body by `lie` leg lengths (a middling dog); nudge each dog
  // toward its own belly line (deep-chested dogs less far, stocky ones further), by at most
  // 0.1 leg so the folded legs still reach the floor.
  const lieScale = lie => {
    if (!lie) return 1;
    const want = 1 - bellyGap - 0.03;
    return 1 + Math.max(-0.1, Math.min(0.1, want - lie)) / lie;
  };
  const clips = Object.fromEntries(lib.clips.map(c => [c.name,
    retarget(c, leg / lib.leg, lib.meta[c.name]?.full_tilt ? 1 : tilt, lib.rest, rest, lieScale(lib.meta[c.name]?.lie),
      tailCurl ? 0.4 : 1)]));
  const dog = {
    root, leg, body, tilt, ballRadius, mouth, mixer, lib, clips, name: null, action: null, onEvent: null,
    play(name, { fade = 0.2, time = 0 } = {}) {
      const next = mixer.clipAction(clips[name]);
      next.reset();
      next.time = time;
      next.setLoop(lib.meta[name]?.loop === false ? THREE.LoopOnce : THREE.LoopRepeat);
      next.clampWhenFinished = true;
      next.play();
      if (dog.action && dog.action !== next) dog.action.crossFadeTo(next, fade, false);
      dog.action = next;
      dog.name = name;
      dog.last = time;
      return next;
    },
    // Gait clips: clip speed so the planted feet match `speed` (world units / s).
    setSpeed(speed, scale = 1) {
      const m = lib.meta[dog.name];
      if (!m?.gait || !dog.action) return;
      dog.action.timeScale = speed * m.duration / (m.stride * leg * scale);
    },
    update(dt) {
      mixer.update(dt);
      const m0 = lib.meta[dog.name];
      if (m0?.nose_ground) groundNose();
      if (m0?.tail_line && dog.action) tailLine(dog.action.time, m0.tail_line);
      if (m0?.clear_floor || m0?.lie || dog.name?.startsWith('play_dead')) clearFloor();   // every lying pose agrees
      if (m0?.from) tailFloor();   // only pose clips (sit, down, beg, play dead...) bring the tail near the floor
      const a = dog.action, m = lib.meta[dog.name];
      if (!a || !m || !dog.onEvent) return;
      const now = a.time, prev = dog.last;
      dog.last = now;
      for (const [ev, at] of Object.entries(m.events)) {
        const crossed = now >= prev ? prev < at && at <= now : at > prev || at <= now;  // handles wrap-around
        if (crossed) dog.onEvent(ev, dog);
      }
    },
    mouthPosition(target = new THREE.Vector3()) {
      return mouth ? mouth.getWorldPosition(target) : root.getWorldPosition(target);
    },
  };
  // Tip the neck about the dog's side axis so the mouth sits just above the floor. Solved
  // exactly (rotating the mouth around the neck pivot in the dog's side plane), taking the
  // solution nearest the clip's own pose, so it can't jump between frames.
  const v = new THREE.Vector3(), w = new THREE.Vector3(), qa = new THREE.Quaternion(), qb = new THREE.Quaternion();
  function groundNose() {
    const neck = bones.neck;
    if (!neck || !mouth) return;
    root.updateMatrixWorld(true);
    const pivot = root.worldToLocal(neck.getWorldPosition(v));
    const tip = root.worldToLocal(mouth.getWorldPosition(w));
    const dy = tip.y - pivot.y, dz = tip.z - pivot.z, r = Math.hypot(dy, dz);
    const c = Math.max(-1, Math.min(1, (ballRadius * 0.7 - pivot.y) / r));
    // Rotating by a about +X: height = pivot.y + r * cos(a + beta)
    const beta = Math.atan2(dz, dy), wrap = x => Math.atan2(Math.sin(x), Math.cos(x));
    const options = [wrap(Math.acos(c) - beta), wrap(-Math.acos(c) - beta)];
    const a = Math.max(-0.6, Math.min(0.9, Math.abs(options[0]) < Math.abs(options[1]) ? options[0] : options[1]));
    const axis = new THREE.Vector3(1, 0, 0).applyQuaternion(root.getWorldQuaternion(qa))
      .applyQuaternion(neck.parent.getWorldQuaternion(qb).invert());
    neck.quaternion.premultiply(qa.setFromAxisAngle(axis, a));
  }

  // Point the tail straight out behind (slightly up), blending in over the clip's window.
  const tailBones = ['tail1', 'tail2', 'tail3', 'tailtip'].map(n => bones[n]).filter(Boolean);
  function tailLine(time, [a, b, c, d]) {
    const k = Math.min(1, Math.max(0, (time - a) / (b - a || 1))) * (1 - Math.min(1, Math.max(0, (time - c) / (d - c || 1))));
    if (k <= 0) return;
    const back = new THREE.Vector3(0, 0.12, -1).normalize().applyQuaternion(root.getWorldQuaternion(qa));
    for (let i = 0; i < tailBones.length - 1; i++) {
      const bone = tailBones[i];
      root.updateMatrixWorld(true);
      const from = tailBones[i + 1].getWorldPosition(v).sub(bone.getWorldPosition(w)).normalize();
      // At most ~65° per bone, so long, curled or feathered tails extend without wrenching.
      const full = qa.setFromUnitVectors(from, back), angle = 2 * Math.acos(Math.min(1, Math.abs(full.w)));
      const turn = new THREE.Quaternion().slerp(full, k * Math.min(1, 1.13 / Math.max(angle, 1e-3)));
      const parent = bone.parent.getWorldQuaternion(qb);
      bone.quaternion.premultiply(parent.clone().invert().multiply(turn).multiply(parent));
    }
  }

  // Keep the tail above the floor in every clip (a long tail sitting or splooting would go
  // through it): any tail joint below the floor lifts its bone just enough, from the base
  // out, so the tail lies out along the floor instead.
  const tailChain = ['tail1', 'tail2', 'tail3', 'tailtip'].map(n => bones[n]).filter(Boolean);
  const floorPt = new THREE.Vector3(), up = new THREE.Vector3(), jp = new THREE.Vector3(), cp = new THREE.Vector3();
  function tailFloor() {
    if (tailChain.length < 2) return;
    root.updateMatrixWorld(true);
    root.getWorldPosition(floorPt);
    const scale = root.getWorldScale(v).y;
    const minY = floorPt.y + (Math.min(tailRadius, 0.3 * leg) + 0.01) * scale;   // bones up by the tail's own thickness
    // the dog's backward direction on the floor: where a tail lying down should point
    const back = new THREE.Vector3(0, 0, -1).applyQuaternion(root.getWorldQuaternion(qa)).setY(0).normalize();
    let lying = false;
    for (let i = 0; i < tailChain.length - 1; i++) {
      const bone = tailChain[i];
      bone.updateMatrixWorld(true);
      bone.getWorldPosition(jp);
      tailChain[i + 1].getWorldPosition(cp);
      // once part of the tail is on the floor, the rest lies along it too (no flicking up)
      if (cp.y >= minY && !(lying && cp.y > minY + 0.3 * (cp.distanceTo(jp)))) continue;
      const d = cp.clone().sub(jp), len = d.length();
      if (len < 1e-6) continue;
      // keep the bone's own heading on the floor, but a tail pointing nearly straight down
      // (sitting up, begging) has no heading to keep: lean it toward behind the dog, smoothly
      const dh = new THREE.Vector3(d.x, 0, d.z), hl = dh.length();
      dh.addScaledVector(back, Math.max(0, 0.6 * len - hl));
      const along = dh.dot(back), size = dh.length();
      if (along < 0.5 * size) dh.addScaledVector(back, 0.5 * size - along);   // never forward, under the dog
      dh.normalize();
      // rise to the floor line, but never steeply: with the tail's root itself low (sitting
      // up, the bum swings it under the hips) the tail just lies out behind, not flicks up
      const ty = Math.max(-len, Math.min(0.4 * len, minY - jp.y));
      lying = true;
      const th = Math.sqrt(Math.max(len * len - ty * ty, 0));
      const target = dh.multiplyScalar(th).setY(ty);
      const turn = new THREE.Quaternion().setFromUnitVectors(d.normalize(), target.normalize());
      const parent = bone.parent.getWorldQuaternion(qb);
      bone.quaternion.premultiply(parent.clone().invert().multiply(turn).multiply(parent));
      bone.updateMatrixWorld(true);
    }
  }

  // Rolling over / falling onto the side: lift the whole dog just enough that no leg goes
  // through the floor (leggy dogs fold taller than the Labrador the clip was made on).
  const limbEnds = ['hand', 'foot', 'forearm', 'shin'].flatMap(n => [bones[n + 'L'], bones[n + 'R']]).filter(Boolean);
  const rootBone = bones.root;
  function clearFloor() {
    if (!rootBone || !limbEnds.length) return;
    root.updateMatrixWorld(true);
    root.getWorldPosition(floorPt);
    const scale = root.getWorldScale(v).y;
    let low = Infinity;
    for (const b of limbEnds) {
      low = Math.min(low, b.getWorldPosition(jp).y);
      for (const c of b.children) if (c.isBone) low = Math.min(low, c.getWorldPosition(jp).y);
    }
    const need = floorPt.y + 0.09 * leg * scale - low;   // joints, plus the paw below them
    if (need <= 0) return;
    // world up, in the root bone's parent space
    const parent = rootBone.parent;
    const p0 = parent.worldToLocal(rootBone.getWorldPosition(jp).clone());
    const p1 = parent.worldToLocal(rootBone.getWorldPosition(cp).clone().add(up.set(0, need, 0)));
    rootBone.position.add(p1.sub(p0));
    rootBone.updateMatrixWorld(true);
  }

  dog.groundNose = groundNose;
  return dog;
}

// Wearables (rigged/wear/<slug>--collar.glb, --bandana.glb) are fitted to one dog and skinned
// to the same skeleton. attachWear moves their meshes onto the dog and binds them to the
// dog's own bones, so they follow every clip:
//   const wear = attachWear(dogScene, (await loader.loadAsync('rigged/wear/pug--collar.glb')).scene);
//   wear.forEach(m => m.visible = false);
export function attachWear(dogRoot, wearRoot) {
  const bones = {}, skinned = [];
  dogRoot.traverse(o => { if (o.isBone) bones[o.name] = o; if (o.isSkinnedMesh && !skinned.length) skinned.push(o); });
  const ref = skinned[0];
  const meshes = [];
  wearRoot.traverse(o => { if (o.isSkinnedMesh) meshes.push(o); });
  for (const m of meshes) {
    const own = m.skeleton;
    // the wearable keeps its own node transform and bind matrix (a compressed dog's mesh node
    // carries a dequantization scale the wearable doesn't share); its bones are the dog's,
    // with the wearable's own inverse bind matrices (same skeleton rest pose)
    const skel = new THREE.Skeleton(own.bones.map(b => bones[b.name]), own.boneInverses.map(m4 => m4.clone()));
    const local = m.matrix.clone(), bind = m.bindMatrix.clone();
    ref.parent.add(m);
    local.decompose(m.position, m.quaternion, m.scale);
    m.bind(skel, bind);
    m.frustumCulled = false;
    m.userData.wear = true;   // dogcoat.js leaves it alone
  }
  return meshes;
}
