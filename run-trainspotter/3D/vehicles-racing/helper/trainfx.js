// trainfx.js: voxel-style particle effects for Trainspotter trains in three.js.
//
//   import { TrainFx } from './trainfx.js';
//   const fx = new TrainFx(scene);          // once per scene
//   fx.attach(train);                       // a Train from TrainKit.consist()
//   // every frame, after train.update(dt):
//   fx.update(dt);
//   fx.enabled.sparks = false;              // per-effect toggles: steam, cylinders, exhaust, arcs, sparks
//   fx.intensity = 0.5;                     // overall emission (0..2)
//
// Style (as the RUN voxel effects): hard faceted puffs that die by shrinking,
// voxel cubes for sparks, simulated in world space so a moving chimney leaves a
// trail and smoke rises along world up. Two instanced meshes in all, no
// textures. Particle sizes are in voxels and follow the train's world scale.
import * as THREE from 'three';

const UP = new THREE.Vector3(0, 1, 0);
const MAX_PER_EMITTER = 60;

/** How many exhaust beats fall between two rolled distances: four per driver turn (pure). */
export function chuffsBetween(prevRolled, rolled, driverR, perTurn = 4) {
  const spacing = (2 * Math.PI * driverR) / perTurn;
  return Math.max(0, Math.floor(rolled / spacing) - Math.floor(prevRolled / spacing));
}

/** Seconds between beats at a speed (voxels/s): handy for audio sync (pure). */
export function chuffInterval(speed, driverR, perTurn = 4) {
  return speed > 1e-6 ? (2 * Math.PI * driverR) / perTurn / speed : Infinity;
}

// ---------------------------------------------------------------- particle pools
class Pool {
  constructor(scene, geometry, material, max) {
    this.max = max;
    this.mesh = new THREE.InstancedMesh(geometry, material, max);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(max * 3), 3);
    this.mesh.frustumCulled = false;
    this.mesh.count = 0;
    scene.add(this.mesh);
    this.n = 0;
    this.p = new Float32Array(max * 3); // position
    this.v = new Float32Array(max * 3); // velocity
    this.age = new Float32Array(max);
    this.life = new Float32Array(max);
    this.size = new Float32Array(max);
    this.grow = new Float32Array(max); // size multiplier reached at the peak
    this.lift = new Float32Array(max); // upward acceleration (negative: gravity)
    this.drag = new Float32Array(max);
    this.spin = new Float32Array(max * 4); // axis xyz, rate
    this.owner = new Int32Array(max);
    this.live = new Map(); // owner -> live count
    this._m = new THREE.Matrix4();
    this._q = new THREE.Quaternion();
    this._s = new THREE.Vector3();
    this._a = new THREE.Vector3();
    this._pos = new THREE.Vector3();
    this._c = new THREE.Color();
  }

  count(owner) {
    return this.live.get(owner) ?? 0;
  }

  /** Spawn one particle; returns false when the pool or the emitter is full. */
  spawn(owner, pos, vel, { life, size, grow = 1, lift = 0, drag = 0, color, spin = 2 }) {
    if (this.n >= this.max || this.count(owner) >= MAX_PER_EMITTER) return false;
    const i = this.n++;
    this.p.set([pos.x, pos.y, pos.z], i * 3);
    this.v.set([vel.x, vel.y, vel.z], i * 3);
    this.age[i] = 0;
    this.life[i] = life;
    this.size[i] = size;
    this.grow[i] = grow;
    this.lift[i] = lift;
    this.drag[i] = drag;
    this._a.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
    this.spin.set([this._a.x, this._a.y, this._a.z, (Math.random() - 0.5) * 2 * spin], i * 4);
    this.owner[i] = owner;
    this.live.set(owner, this.count(owner) + 1);
    this.mesh.instanceColor.setXYZ(i, color.r, color.g, color.b);
    return true;
  }

  _kill(i) {
    const last = --this.n;
    const o = this.owner[i];
    this.live.set(o, this.count(o) - 1);
    if (i === last) return;
    const copy = (arr, w) => arr.copyWithin(i * w, last * w, last * w + w);
    copy(this.p, 3); copy(this.v, 3); copy(this.spin, 4);
    for (const arr of [this.age, this.life, this.size, this.grow, this.lift, this.drag, this.owner]) arr[i] = arr[last];
    const c = this.mesh.instanceColor;
    c.setXYZ(i, c.getX(last), c.getY(last), c.getZ(last));
  }

  /** Step the simulation and write instance matrices. `shape(f)` maps life fraction to size. */
  update(dt, shape) {
    for (let i = this.n - 1; i >= 0; i--) {
      this.age[i] += dt;
      if (this.age[i] >= this.life[i]) this._kill(i);
    }
    for (let i = 0; i < this.n; i++) {
      const k = i * 3;
      const d = Math.exp(-this.drag[i] * dt);
      this.v[k] *= d; this.v[k + 2] *= d;
      this.v[k + 1] = this.v[k + 1] * d + this.lift[i] * dt;
      this.p[k] += this.v[k] * dt; this.p[k + 1] += this.v[k + 1] * dt; this.p[k + 2] += this.v[k + 2] * dt;
      const f = this.age[i] / this.life[i];
      const s = this.size[i] * shape(f, this.grow[i]);
      this._a.set(this.spin[i * 4], this.spin[i * 4 + 1], this.spin[i * 4 + 2]);
      this._q.setFromAxisAngle(this._a, this.spin[i * 4 + 3] * this.age[i]);
      this._m.compose(this._pos.set(this.p[k], this.p[k + 1], this.p[k + 2]), this._q, this._s.set(s, s, s));
      this.mesh.setMatrixAt(i, this._m);
    }
    this.mesh.count = this.n;
    this.mesh.instanceMatrix.needsUpdate = true;
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
  }

  clear() {
    this.n = 0;
    this.live.clear();
    this.mesh.count = 0;
  }

  dispose() {
    this.mesh.removeFromParent();
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }
}

/** A faceted puff: a white icosahedron whose downward facets are shaded to 77%. */
function puffGeometry() {
  const g = new THREE.IcosahedronGeometry(0.5, 0).toNonIndexed();
  g.computeVertexNormals();
  const n = g.getAttribute('normal');
  const col = new Float32Array(n.count * 3);
  for (let t = 0; t < n.count; t += 3) {
    const shade = n.getY(t) < -0.3 ? 0.77 : 1;
    for (let v = t; v < t + 3; v++) col.set([shade, shade, shade], v * 3);
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return g;
}

// Solid shapes die by size: puffs swell to their peak, then pop away; sparks just shrink.
const SWELL = (f, grow) => (f < 0.3 ? 0.55 + (grow - 0.55) * (f / 0.3) : grow * (1 - ((f - 0.3) / 0.7) ** 2));
const SHRINK = (f) => 1 - f;

// ---------------------------------------------------------------- per-car emitters
const tmp = new THREE.Vector3();
const tmp2 = new THREE.Vector3();
const tmpPush = new THREE.Vector3();
const tmpFwd = new THREE.Vector3();

class CarFx {
  constructor(fx, car, id) {
    Object.assign(this, { fx, car, id });
    const e = car.entry;
    const g = car.group;
    this.traction = e.traction ?? (e.rods ? 'steam' : null);
    this.smoke = g.getObjectByName('socket-smoke');
    this.cyl = ['socket-steam-l', 'socket-steam-r'].map((n) => g.getObjectByName(n)).filter(Boolean);
    this.panto = g.getObjectByName('socket-panto');
    this.pantoHead = g.getObjectByName('panto-head'); // the moving head, when the model has a pantograph (moving.py)
    const rods = Array.isArray(e.rods) ? e.rods : e.rods ? [e.rods] : [];
    this.driverR = rods.length ? e.wheels[rods[0].main] : null;
    // wheel contact points: each wheelset's parent frame, its centre, its radius
    this.wheels = Object.entries(e.wheels ?? {}).map(([n, r]) => ({ node: g.getObjectByName(n), r })).filter((w) => w.node);
    this.wisp = Math.random();
    this.startBoost = 0;
    this.restTime = 10;
  }

  get pantoUp() {
    return !this.pantoHead || this.car.pantoUp === true; // no modelled pantograph: always 'up'
  }

  socketPos(node, out) {
    return node.getWorldPosition(out);
  }

  update(dt, train) {
    const fx = this.fx;
    const k = fx.intensity;
    const unit = train.group.getWorldScale(tmp2).x || 1;
    const speed = Math.abs(train.speed);
    const accel = train.accel ?? 0;
    // time at rest: a start from rest gets a burst of cylinder steam
    if (speed < 2) this.restTime += dt;
    else {
      if (this.restTime > 1.5) this.startBoost = 2.2;
      this.restTime = 0;
    }
    this.startBoost = Math.max(0, this.startBoost - dt);

    if (this.traction === 'steam' && this.smoke && fx.enabled.steam) {
      const beats = this.driverR ? chuffsBetween(train.prevRolled, train.rolled, this.driverR) : 0;
      for (let b = 0; b < Math.min(beats, 3); b++) this.chuff(speed, unit, k);
      this.wisp += dt * (speed < 2 ? 1.6 : 0.4) * k;
      while (this.wisp >= 1) { this.wisp -= 1; this.puff(this.smoke, unit, { size: 5, up: 14, life: 2.6, grey: 0.97, spread: 3 }); }
    }
    if (this.traction === 'steam' && this.cyl.length && fx.enabled.cylinders) {
      const hiss = (this.startBoost > 0 ? 9 : speed > 2 && speed < 30 ? 1.5 : 0) * k;
      for (const node of this.cyl) {
        node._acc = (node._acc ?? Math.random()) + dt * hiss;
        while (node._acc >= 1) {
          node._acc -= 1;
          const side = Math.sign(node.position.x) || 1;
          const out = tmpPush.set(side, 0, 0).transformDirection(this.car.group.matrixWorld);
          this.puff(node, unit, { size: 4 + 3 * Math.random(), up: 8, life: 0.9, grey: 1, spread: 2, push: out.multiplyScalar(45) });
        }
      }
    }
    if (this.traction === 'diesel' && this.smoke && fx.enabled.exhaust) {
      const rate = (1.2 + speed * 0.05 + Math.max(0, accel) * 0.12) * k;
      this.exhaust = (this.exhaust ?? Math.random()) + dt * rate;
      while (this.exhaust >= 1) {
        this.exhaust -= 1;
        const hard = Math.max(0, accel) > 5;
        this.puff(this.smoke, unit, { size: hard ? 8 : 5 + speed * 0.02, up: hard ? 45 : 26, life: hard ? 2 : 1.6,
          grey: hard ? 0.26 : 0.36, spread: 2 });
      }
    }
    // arcs at the contact strip: a modelled pantograph head (electrics, trams), else an electric's roof socket
    const arcAt = this.pantoHead ?? (this.traction === 'electric' ? this.panto : null);
    if (arcAt && this.pantoUp && fx.enabled.arcs && speed > 8) {
      if (Math.random() < dt * 0.9 * k) {
        const p = arcAt.getWorldPosition(tmp).addScaledVector(UP, 2 * unit);
        const n = 3 + Math.floor(Math.random() * 6);
        for (let i = 0; i < n; i++) this.spark(p, unit, [0.75, 0.88, 1], 150, 0.4);
      }
    }
    if (fx.enabled.sparks && speed > 15) {
      const curve = Math.max(...(this.car.lastPose?.bogieYaw ?? [0]).map(Math.abs));
      const braking = accel < -12;
      const chance = ((braking ? 1.2 : 0) + (curve > 7 ? 0.4 : 0)) * k;
      if (chance > 0) {
        for (const w of this.wheels) {
          if (Math.random() >= dt * chance / Math.max(1, this.wheels.length / 4)) continue;
          const side = Math.random() < 0.5 ? -1 : 1;
          const parent = w.node.parent;
          const p = parent.localToWorld(tmp.copy(w.node.position).add(tmp2.set(side * 15, -w.r, 0)));
          const n = 3 + Math.floor(Math.random() * 4);
          for (let i = 0; i < n; i++) this.spark(p, unit, Math.random() < 0.5 ? [1, 0.85, 0.3] : [1, 0.55, 0.15], 110, 0.6, train);
        }
      }
    }
  }

  chuff(speed, unit, k) {
    const n = Math.max(1, Math.round((2 + speed / 60) * Math.min(1.5, k)));
    for (let i = 0; i < n; i++) {
      this.puff(this.smoke, unit, { size: 7 + speed * 0.03 + Math.random() * 3, up: 30 + speed * 0.25, life: 1.6 + Math.random() * 0.8,
        grey: 0.9 + Math.random() * 0.1, spread: 4 });
    }
  }

  puff(node, unit, { size, up, life, grey, spread, push }) {
    const p = node.getWorldPosition(tmp);
    p.x += (Math.random() - 0.5) * spread * unit;
    p.z += (Math.random() - 0.5) * spread * unit;
    const v = tmp2.set((Math.random() - 0.5) * 12, up, (Math.random() - 0.5) * 12).multiplyScalar(unit);
    if (push) v.addScaledVector(push, unit);
    const c = new THREE.Color(grey, grey, grey * 1.02);
    this.fx.puffs.spawn(this.id, p, v, { life, size: size * unit, grow: 2.1, lift: 10 * unit, drag: 1.2, color: c, spin: 1.5 });
  }

  spark(at, unit, rgb, speedV, life, train) {
    const v = tmp2.set((Math.random() - 0.5) * 2, 0.6 + Math.random(), (Math.random() - 0.5) * 2).normalize().multiplyScalar(speedV * (0.5 + Math.random()) * unit);
    if (train?.cars[0]) { // sparks fly back from the direction of travel
      const fwd = tmpFwd.set(0, 0, -1).transformDirection(this.car.group.matrixWorld);
      v.addScaledVector(fwd, -0.4 * Math.abs(train.speed) * unit * (this.car.flip ? -1 : 1));
    }
    this.fx.cubes.spawn(this.id + 100000, at, v, { life: life * (0.6 + Math.random() * 0.8), size: (2 + Math.random() * 1.5) * unit, lift: -380 * unit,
      drag: 0.8, color: new THREE.Color(...rgb), spin: 8 });
  }
}

// ---------------------------------------------------------------- the effects system
export class TrainFx {
  constructor(scene, { maxPuffs = 768, maxCubes = 384 } = {}) {
    this.scene = scene;
    this.intensity = 1;
    this.enabled = { steam: true, cylinders: true, exhaust: true, arcs: true, sparks: true };
    this.puffs = new Pool(scene, puffGeometry(), new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true }), maxPuffs);
    this.cubes = new Pool(scene, new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ toneMapped: false }), maxCubes);
    this.trains = new Map();
    this._ids = 0;
  }

  /** Start emitting for a train's cars (locos by traction, sparks for every car). */
  attach(train) {
    if (this.trains.has(train)) return;
    this.trains.set(train, train.cars.map((car) => new CarFx(this, car, ++this._ids)));
  }

  detach(train) {
    this.trains.delete(train);
  }

  /** Particles alive now: {puffs, cubes}. */
  get live() {
    return { puffs: this.puffs.n, cubes: this.cubes.n };
  }

  update(dt) {
    dt = Math.min(dt, 0.1);
    for (const [train, cars] of this.trains) {
      if (!train.runner) continue;
      train.group.updateMatrixWorld(true);
      for (const c of cars) c.update(dt, train);
    }
    this.puffs.update(dt, SWELL);
    this.cubes.update(dt, SHRINK);
  }

  clear() {
    this.puffs.clear();
    this.cubes.clear();
  }

  dispose() {
    this.puffs.dispose();
    this.cubes.dispose();
    this.trains.clear();
  }
}
