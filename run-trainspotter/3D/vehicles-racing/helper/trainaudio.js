// train-audio.js: Trainspotter sound effects for running trains (Web Audio, no dependencies).
//
//   const audio = new TrainAudio({ base: 'sounds/' });   // the folder holding <id>_01.ogg, <id>_02.ogg
//   await audio.start();                                 // call from a click: browsers need a user gesture
//   audio.attach(train);                                 // chuffs, engine, rail clatter, brakes, by distance
//   audio.event('depart', train);                        // or wire it: ops.on((name, train) => audio.event(name, train))
//   audio.horn(train);
//   audio.update(dt, camera.position);                   // every frame
//
// Sounds come from Trainspotter Audio (the pack's audio folder). Takes alternate so repeats don't feel identical.
// Rhythm comes from the train's own motion, never from a loop: a steam engine chuffs on every
// exhaust beat (four per turn of the driving wheels), and the axles of the car nearest the
// listener clack as they cross each rail joint, so a train at a steady speed keeps a steady
// clickety-clack and a slowing train slows its rhythm. Under that runs a smooth rolling rumble;
// trains sound their horns now and then, and birds and a breeze play over the countryside.

const lead = (train) => train.cars[0];
const traction = (train) => train.cars.find((c) => c.entry.traction)?.entry.traction ?? 'none';
const TAKES = { 'steam-chuff': 4, 'rail-joint': 4, 'bird-chirp': 6 }; // others ship two takes
export const JOINT = 128; // rail length between joints, voxels (two track units, about a coach)
const AHEAD = 0.04; // seconds: hits are scheduled this far ahead, at their exact place in the frame
const ACCENT = [1, 0.72, 0.88, 0.68]; // a two-cylinder engine's beats are not all equal

/**
 * Where a moving point crosses multiples of `spacing` (rail joints, exhaust beats) between two
 * distances: [{k, f}] with k the multiple crossed and f its fraction (0..1) of the way through
 * the move. Works in either direction. Pure.
 */
export function crossings(prev, cur, spacing, offset = 0) {
  const a = (prev - offset) / spacing, b = (cur - offset) / spacing;
  if (a === b) return [];
  const out = [];
  if (b > a) for (let k = Math.floor(a) + 1; k <= Math.floor(b); k++) out.push({ k, f: (k - a) / (b - a) });
  else for (let k = Math.ceil(a) - 1; k >= Math.ceil(b); k--) out.push({ k, f: (a - k) / (a - b) });
  return out;
}

/**
 * Each axle's distance back from the front of the train: [{car, d}]. `axleZ(car)` gives a car's
 * axle positions along its own length (local z, front toward -z). Pure.
 */
export function axleOffsets(cars, axleZ) {
  const out = [];
  let front = 0;
  cars.forEach((c, ci) => {
    const { f, r } = c.entry.couplers;
    for (const z of axleZ(c)) out.push({ car: ci, d: front + (c.flip ? r - z : z - f) });
    front += r - f;
  });
  return out;
}

export class TrainAudio {
  constructor({ base = 'sounds/', volume = 0.8, range = 900 } = {}) {
    Object.assign(this, { base, range });
    this.buffers = new Map();
    this.trains = new Map();
    this.volume = volume;
    this.enabled = false;
    this.take = 0;
    this.hornsAuto = true; // trains sound their horns now and then on their own
    this.ambience = true; // the countryside: a breeze, birdsong and its bed
    this.daylight = 1; // 1 day .. 0 night: the birds go quiet after dark
  }

  /** Create the audio context (from a click) and preload the core sounds. */
  async start() {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.volume;
      this.master.connect(this.ctx.destination);
    }
    await this.ctx.resume();
    this.enabled = true;
    this.ready ??= {};
    if (!this.noise) {
      // one second of white noise; looped through a low-pass it is the rolling rumble (white noise has no seam)
      this.noise = this.ctx.createBuffer(1, this.ctx.sampleRate, this.ctx.sampleRate);
      const d = this.noise.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    await Promise.all(['steam-chuff', 'rail-joint', 'diesel-idle-loop', 'brake-squeal', 'steam-whistle-short', 'diesel-horn-short',
      'electric-horn', 'door-open', 'door-close', 'station-chime', 'guard-whistle', 'tram-bell'].map(async (id) => { this.ready[id] = await this._load(id); }));
    for (const [train] of this.trains) this._loops(train);
    this._startAmbience();
  }

  /**
   * The world's ambience: both countryside takes looping together (5.0 s and 5.55 s, so the pair
   * takes about a minute to repeat), a soft gusting breeze, and single bird calls scattered at
   * random times, pitches and places in the stereo field.
   */
  async _startAmbience() {
    if (this.amb) return;
    const ctx = this.ctx;
    const bus = ctx.createGain();
    bus.gain.value = this.ambience ? 1 : 0;
    bus.connect(this.master);
    this.amb = { bus, beds: [], birdIn: 1.5, t: 0 };
    const takes = await this._load('countryside-ambience-loop');
    takes.forEach((buf, i) => {
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      const g = ctx.createGain();
      g.gain.value = 0.9;
      src.connect(g).connect(bus);
      src.start(ctx.currentTime + i * 1.7);
      this.amb.beds.push(g);
    });
    const wind = ctx.createBufferSource();
    wind.buffer = this.noise;
    wind.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 500;
    bp.Q.value = 0.5;
    const wg = ctx.createGain();
    wg.gain.value = 0;
    wind.connect(bp).connect(wg).connect(bus);
    wind.start();
    Object.assign(this.amb, { bp, wg });
    this.ready['bird-chirp'] = await this._load('bird-chirp');
  }

  /** A bird call: a short phrase of one chirp repeated, at one pitch, somewhere left or right. */
  _bird(gain) {
    const takes = this.ready['bird-chirp'];
    if (!takes?.length) return;
    const ctx = this.ctx, buf = takes[Math.floor(Math.random() * takes.length)];
    const pan = ctx.createStereoPanner();
    pan.pan.value = Math.random() * 1.6 - 0.8;
    const g = ctx.createGain();
    g.gain.value = gain;
    g.connect(pan).connect(this.amb.bus);
    const rate = 0.85 + Math.random() * 0.4, n = 1 + Math.floor(Math.random() * 4), gap = 0.08 + Math.random() * 0.14;
    for (let k = 0; k < n; k++) {
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.playbackRate.value = rate * (1 + (Math.random() - 0.5) * 0.04);
      src.connect(g);
      src.start(ctx.currentTime + 0.02 + k * (buf.duration / rate + gap));
    }
  }

  _ambienceUpdate(dt) {
    const a = this.amb;
    if (!a) return;
    const now = this.ctx.currentTime;
    a.t += dt;
    a.bus.gain.setTargetAtTime(this.ambience ? 1 : 0, now, 0.4);
    const day = Math.max(0, Math.min(1, this.daylight));
    for (const g of a.beds) g.gain.setTargetAtTime(0.35 + 0.55 * day, now, 1.5); // its birdsong thins after dark
    // the breeze: slow overlapping swells, a little brighter in a gust
    const gust = 0.5 + 0.3 * Math.sin(a.t * 0.23) + 0.2 * Math.sin(a.t * 0.61 + 1.3);
    a.wg?.gain.setTargetAtTime(0.035 + 0.05 * gust, now, 0.8);
    a.bp?.frequency.setTargetAtTime(380 + 420 * gust, now, 0.8);
    // birds: more often and nearer by day, none at night
    a.birdIn -= dt;
    if (a.birdIn <= 0) {
      a.birdIn = (0.6 + Math.random() * 3.4) / Math.max(0.25, day);
      if (day > 0.2 && this.ambience) this._bird((0.05 + Math.random() * 0.13) * day);
    }
  }

  stop() {
    this.enabled = false;
    this.ctx?.suspend();
  }

  async _load(id) {
    if (this.buffers.has(id)) return this.buffers.get(id);
    const names = Array.from({ length: TAKES[id] ?? 2 }, (_, k) => String(k + 1).padStart(2, '0'));
    const p = Promise.all(names.map(async (n) => {
      try {
        const r = await fetch(`${this.base}${id}_${n}.ogg`);
        if (!r.ok) return null;
        return await this.ctx.decodeAudioData(await r.arrayBuffer());
      } catch { return null; }
    })).then((b) => b.filter(Boolean));
    this.buffers.set(id, p);
    return p;
  }

  /** Play a one-shot sound now (or at audio-clock time `at`); returns the source (or null). */
  async play(id, { gain = 1, rate = 1, at = 0 } = {}) {
    if (!this.enabled) return null;
    const takes = await this._load(id);
    if (!takes.length) return null;
    const src = this.ctx.createBufferSource();
    src.buffer = takes[this.take++ % takes.length];
    src.playbackRate.value = rate;
    const g = this.ctx.createGain();
    g.gain.value = gain;
    src.connect(g).connect(this.master);
    src.start(Math.max(at, this.ctx.currentTime));
    return src;
  }

  /** A short hit at an exact time, from already-loaded takes (no await, so the timing holds). */
  _hit(id, at, gain, rate, take = null) {
    const takes = this.ready[id];
    if (!takes?.length || gain < 0.01) return;
    const src = this.ctx.createBufferSource();
    src.buffer = takes[(take ?? Math.floor(Math.random() * takes.length)) % takes.length]; // a fixed take per axle keeps the pattern's voice
    src.playbackRate.value = rate;
    const g = this.ctx.createGain();
    g.gain.value = gain;
    src.connect(g).connect(this.master);
    src.start(Math.max(at, this.ctx.currentTime));
  }

  _rumble() {
    const src = this.ctx.createBufferSource();
    src.buffer = this.noise;
    src.loop = true;
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 120;
    lp.Q.value = 0.7;
    const g = this.ctx.createGain();
    g.gain.value = 0;
    src.connect(lp).connect(g).connect(this.master);
    src.start();
    return Promise.resolve({ src, g, lp });
  }

  async _loop(id) {
    const takes = await this._load(id);
    if (!takes.length) return null;
    const src = this.ctx.createBufferSource();
    src.buffer = takes[0];
    src.loop = true;
    const g = this.ctx.createGain();
    g.gain.value = 0;
    src.connect(g).connect(this.master);
    src.start();
    return { src, g };
  }

  /** Follow a train: chuffs from its driving wheels, its engine, rail clatter and brakes. */
  attach(train) {
    if (this.trains.has(train)) return;
    this.trains.set(train, { loops: {}, near: 0, lastSquealt: -9, squeal: 0 });
    if (this.enabled) this._loops(train);
  }

  detach(train) {
    const s = this.trains.get(train);
    if (!s) return;
    for (const l of Object.values(s.loops)) l?.then?.((x) => x?.src.stop());
    this.trains.delete(train);
  }

  _loops(train) {
    const s = this.trains.get(train);
    if (!s || s.loops.clatter) return;
    s.loops.clatter = this._rumble();
    if (traction(train) === 'diesel') s.loops.engine = this._loop('diesel-idle-loop');
  }

  /** A train event from the driver (viewer/driver.js Operations): arrive, depart, reverse. */
  async event(name, train) {
    const s = this.trains.get(train);
    if (!s || !this.enabled || s.near < 0.15) return;
    const g = s.near;
    const doors = train.cars.some((c) => c.entry.doors);
    if (name === 'arrive') {
      this.play('brake-squeal', { gain: 0.6 * g });
      if (doors) setTimeout(() => this.play('door-open', { gain: 0.8 * g }), 600);
      setTimeout(() => this.play('station-chime', { gain: 0.7 * g }), 900);
    } else if (name === 'depart') {
      if (doors) this.play('door-close', { gain: 0.8 * g });
      setTimeout(() => this.play('guard-whistle', { gain: 0.6 * g }), doors ? 900 : 0);
      setTimeout(() => this.horn(train, { short: true }), doors ? 1500 : 600);
    } else if (name === 'reverse') {
      this.play('coupling-clank', { gain: 0.6 * g });
    }
  }

  /** Sound the train's whistle or horn. */
  horn(train, { short = false } = {}) {
    const s = this.trains.get(train);
    const g = s ? Math.max(0.25, s.near) : 1;
    const kind = traction(train);
    const tram = train.cars.some((c) => /^tram-|cable-car/.test(c.entry.file?.split('/').pop() ?? ''));
    const id = tram ? 'tram-bell' : kind === 'steam' ? (short ? 'steam-whistle-short' : 'steam-whistle-long')
      : kind === 'diesel' ? (short ? 'diesel-horn-short' : 'diesel-horn-long')
      : train.cars.some((c) => c.entry.set) ? 'highspeed-horn' : 'electric-horn';
    return this.play(id, { gain: g });
  }

  _near(p, listener) {
    const d = Math.hypot(p.x - listener.x, p.y - listener.y, p.z - listener.z);
    return Math.max(0, Math.min(1, this.range / Math.max(d, 1) - 0.15));
  }

  /** A car's axle positions along its length (local z of its wheel nodes), measured once. */
  _axleZ(car) {
    if (!car._axleZ) {
      car.group.updateMatrixWorld(true);
      const zs = [];
      for (const w of car.wheels ?? []) {
        const v = w.node.getWorldPosition(w.node.position.clone());
        const z = car.group.worldToLocal(v).z;
        if (!zs.some((q) => Math.abs(q - z) < 1)) zs.push(z);
      }
      car._axleZ = zs.sort((a, b) => a - b);
    }
    return car._axleZ;
  }

  /** Every frame: levels by speed and by distance from the listener (camera position). */
  update(dt, listener) {
    if (!this.enabled) return;
    const now = this.ctx.currentTime;
    this._ambienceUpdate(dt);
    const heard = [...this.trains.keys()].filter((t) => Math.abs(t.speed) > 2).map((t) => [t, Math.max(0, ...t.cars.map((c) => this._near(c.group.position, listener)))]);
    const clackers = new Set(heard.filter(([, n]) => n > 0.1).sort((a, b) => b[1] - a[1]).slice(0, 1).map(([t]) => t));
    for (const [train, s] of this.trains) {
      const p = lead(train)?.group.position;
      if (!p) continue;
      s.near = this._near(p, listener);
      const v = Math.abs(train.speed);
      const prev = train.prevRolled ?? train.rolled, cur = train.rolled;
      const at = (f) => now + AHEAD + f * dt;
      // the rolling rumble: low and soft at a crawl, fuller and brighter with speed
      const near = train.cars.map((c) => this._near(c.group.position, listener));
      const loudest = Math.max(0, ...near);
      s.loops.clatter?.then?.((l) => {
        if (!l) return;
        l.g.gain.setTargetAtTime(loudest * Math.min(1, v / 90) * 0.55, now, 0.2);
        l.lp.frequency.setTargetAtTime(90 + Math.min(420, v * 1.6), now, 0.3);
      });
      // clickety-clack as heard riding in (or standing by) the car nearest the listener: its own
      // axles over each joint, "di-di ... dum-dum", once per rail length. Every axle of the whole
      // train at once is a scatter (cars and rails differ in length, so each car is out of step),
      // and only the nearest moving train clacks: two rhythms at once read as random.
      if (v > 2 && prev !== cur && clackers.has(train)) {
        const key = train.cars.map((c) => `${c.entry.file ?? c.entry.id ?? ''}${c.flip ? '<' : '>'}`).join();
        if (s.key !== key) {
          s.key = key;
          s.axles = axleOffsets(train.cars, (c) => this._axleZ(c));
          s.car = 0;
        }
        // the nearest two-bogie car (four axles: the classic pattern), unless only a locomotive is close
        const bogied = near.map((n, i) => (s.axles.filter((a) => a.car === i).length === 4 ? n : -1));
        const pick = Math.max(...bogied) >= loudest * 0.7 ? bogied : near;
        const best = pick.indexOf(Math.max(...pick));
        if (!(pick[s.car] >= pick[best] * 0.85)) s.car = best; // a little hysteresis, so the car doesn't flicker
        const g = near[s.car] ** 1.5 * (0.45 + 0.55 * Math.min(1, v / 120)) * 0.6;
        s.axles.forEach(({ car, d }, i) => {
          if (car !== s.car || g < 0.02) return;
          for (const { f } of crossings(prev, cur, JOINT, d)) this._hit('rail-joint', at(f), g, 0.98 + Math.random() * 0.04, i % 4);
        });
      }
      s.loops.engine?.then?.((l) => {
        if (!l) return;
        l.g.gain.setTargetAtTime(s.near * (0.35 + Math.min(0.5, Math.max(0, train.accel) / 60)), now, 0.2);
        l.src.playbackRate.setTargetAtTime(0.85 + Math.min(0.5, v / 260), now, 0.3);
      });
      // steam: one chuff per exhaust beat, four per turn of the driving wheels (the smoke puffs'
      // beats), hard when working and soft when drifting or braking
      const loco = train.cars.find((c) => c.entry.traction === 'steam' && c.entry.rods?.length);
      if (loco) {
        const r = loco.entry.wheels[loco.entry.rods[0].main];
        const working = train.accel > -5 && (train.target ?? train.speed) > 0;
        const g = this._near(loco.group.position, listener) ** 1.4 * (working ? 0.55 : 0.22); // sits back at viewing distance
        const beats = crossings(prev, cur, (2 * Math.PI * r) / 4);
        for (const { k, f } of beats.slice(-4)) this._hit('steam-chuff', at(f), g * ACCENT[((k % 4) + 4) % 4], 0.76 + Math.random() * 0.06 + Math.min(0.1, v / 1800)); // pitched down: deeper and a little longer
      }
      // now and then a running train sounds its horn or whistle as it goes round (one at a time)
      s.hornIn ??= 8 + Math.random() * 30;
      s.hornIn -= dt;
      if (s.hornIn <= 0) {
        s.hornIn = 25 + Math.random() * 35;
        if (this.hornsAuto && v > 20 && s.near > 0.12 && now - (this.lastHorn ?? -99) > 6) {
          this.lastHorn = now;
          this.horn(train, { short: Math.random() < 0.65 });
        }
      }
      // brakes: a squeal when slowing hard
      s.squeal -= dt;
      if (train.accel < -25 && v > 15 && s.squeal <= 0 && s.near > 0.1) {
        s.squeal = 6;
        this.play('brake-squeal', { gain: 0.5 * s.near });
      }
    }
  }
}
