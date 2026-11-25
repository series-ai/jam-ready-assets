// driver.js: run trains like a railway, not a merry-go-round. Trains brake for stations, stand
// with their doors open, and pull away again; shuttles reverse at the end of the line; trains
// sharing a line keep their distance; station exit signals show danger while a train stands
// and clear as it leaves. No dependencies beyond the Train objects from train-kit.js.
//
//   const ops = new Operations(world, { trains, plan });   // world.signals: [{ model, step }]
//   ops.addTrain(myTrain, { speed: 75, stops: [{ step: 4, at: 100, dwell: 8 }] });
//   // every frame, before each train.update(dt):
//   ops.update(dt);
//
// Distances are voxels along the track; `at` is measured along a layout step's route in the
// train's direction of travel, to where the FRONT coupler stops.

const DEFAULT_DWELL = 8;
const DOORS_SECONDS = 1.2; // doors close this long before departure

export class Driver {
  /**
   * spec: { speed, stops: [{step, at, dwell}], shuttle, dwellEnd, braking, gap, manual, onEvent }
   * `manual`: the driver never touches the train (someone else drives it); it is still kept
   * clear of by the other trains.
   */
  constructor(train, spec = {}, ops = null) {
    this.train = train;
    this.ops = ops;
    this.cruise = spec.speed ?? (train.target || train.speed || 75);
    this.stops = (spec.stops ?? []).map((s) => ({ step: s.step, at: s.at, dwell: s.dwell ?? DEFAULT_DWELL }));
    this.shuttle = !!spec.shuttle;
    this.dwellEnd = spec.dwellEnd ?? DEFAULT_DWELL;
    this.braking = spec.braking ?? Math.min(45, (train.braking ?? 70) * 0.7); // planning rate, below the train's own
    this.gap = spec.gap ?? 32; // voxels kept to the train ahead
    this.manual = !!spec.manual;
    this.onEvent = spec.onEvent ?? null;
    this.state = 'run'; // run | dwell | held | ended
    this.timer = 0;
    this.ignore = null; // a stop just served: {stop, until (train.rolled)}
    this.standing = null; // where the train stands: {step}
    this.reverseAfter = false;
  }

  /** Stop where you are (true) or carry on (false). */
  hold(on = true) {
    if (on && this.state !== 'held') { this.state = 'held'; this.train.target = 0; }
    else if (!on && this.state === 'held') this.state = 'run';
  }

  _emit(name, extra = {}) {
    this.onEvent?.(name, this.train, extra);
    this.ops?._event(name, this, extra);
  }

  _doors(open) {
    for (const c of this.train.cars) c.setDoors?.(open);
  }

  /** What lies ahead: the next stop to serve, the end of the line, and the nearest train ahead. */
  look(trains = []) {
    const t = this.train;
    const r = t.runner;
    const max = Math.max(400, this.cruise ** 2 / (2 * this.braking) + 300);
    const { edges, end } = r.ahead(max);
    let stop = null;
    for (const s of this.stops) {
      if (this.ignore?.stop === s && t.rolled < this.ignore.until) continue;
      for (const { edge, start } of edges) {
        if (edge.piece !== s.step) continue;
        const d = start + s.at;
        if (d < -1) continue; // passed it on this edge; it comes round again later
        if (!stop || d < stop.d) stop = { d, s };
        break;
      }
    }
    let block = null;
    for (const o of trains) {
      if (o === t || !o.runner) continue;
      const spans = o.runner.spans(o.tailDistance);
      for (const { edge, start } of edges) {
        const L = edge.route.length;
        for (const sp of spans) {
          if (sp.piece !== edge.piece || sp.route !== edge.route) continue;
          let off = edge.dir > 0 ? sp.lo : L - sp.hi; // where the other train starts, in our direction
          if (start < 0) { // our current edge: only what lies ahead of the front
            const far = edge.dir > 0 ? sp.hi : L - sp.lo;
            if (far <= -start + 1e-6) continue;
            off = Math.max(off, -start);
          }
          const d = start + off - this.gap;
          if (block === null || d < block) block = d;
        }
      }
    }
    return { stop, end, block };
  }

  update(dt, trains = []) {
    const t = this.train;
    if (this.manual || !t.runner) return;
    if (this.state === 'ended' || this.state === 'held') { t.target = 0; return; }
    if (this.state === 'dwell') {
      t.target = 0;
      t.speed = 0;
      this.timer -= dt;
      if (this.doorsOpen && this.timer <= DOORS_SECONDS) { this._doors(false); this.doorsOpen = false; }
      if (this.timer <= 0) this.depart();
      return;
    }
    const { stop, end, block } = this.look(trains);
    let limit = Infinity;
    let kind = null;
    if (stop) { limit = stop.d; kind = 'stop'; }
    if (end !== null && end < limit) { limit = end; kind = 'end'; }
    if (block !== null && block < limit) { limit = block; kind = 'block'; }
    const room = Math.max(0, limit);
    t.target = Math.min(this.cruise, Math.sqrt(2 * this.braking * room));
    if (dt > 0 && t.speed * dt > room) t.speed = room / dt; // never run through a stopping point in one frame
    if (kind !== 'block' && limit <= 0.5 && t.speed < 3) this.arrive(kind, stop?.s);
  }

  arrive(kind, stop) {
    const t = this.train;
    t.speed = 0;
    t.target = 0;
    const step = t.runner.edge.piece;
    if (kind === 'stop') {
      this.state = 'dwell';
      this.timer = stop.dwell;
      this.ignore = { stop, until: t.rolled + 64 };
    } else if (this.shuttle) {
      this.state = 'dwell';
      this.timer = this.dwellEnd;
      this.reverseAfter = true;
    } else {
      this.state = 'ended';
    }
    this.standing = { step };
    if (this.state === 'dwell') { this._doors(true); this.doorsOpen = true; }
    this._emit('arrive', { step, stop: kind === 'stop' ? stop : null, end: kind === 'end' });
  }

  depart() {
    const t = this.train;
    if (this.doorsOpen) { this._doors(false); this.doorsOpen = false; }
    const step = this.standing?.step;
    if (this.reverseAfter) {
      this.reverseAfter = false;
      t.reverse();
      this.ignore = null;
      this._emit('reverse', { step });
    }
    this.state = 'run';
    this.standing = null;
    t.target = this.cruise;
    this._emit('depart', { step });
  }
}

/** Every driver on a layout, and the signals that protect its stations. */
export class Operations {
  /**
   * world: {signals: [{model, step}], plan} (from buildDemo). trains: Train objects for the
   * plan's own trains; each takes its spec from `train.spec`, else plan.trains[i].
   */
  constructor(world = {}, { trains = [], plan = world.plan } = {}) {
    this.world = world;
    this.drivers = new Map();
    this.signals = (world.signals ?? []).map((s) => ({ model: s.model, step: s.step, state: 'danger', train: null }));
    this.listeners = [];
    trains.forEach((t, i) => this.addTrain(t, t.spec ?? plan?.trains?.[i] ?? {}));
  }

  addTrain(train, spec = {}) {
    const d = new Driver(train, spec, this);
    this.drivers.set(train, d);
    return d;
  }

  removeTrain(train) {
    this.drivers.delete(train);
    for (const sg of this.signals) if (sg.train === train) this._set(sg, 'danger');
  }

  driver(train) {
    return this.drivers.get(train);
  }

  /** Listen to every driver's events: fn(name, train, extra). */
  on(fn) {
    this.listeners.push(fn);
  }

  update(dt) {
    const trains = [...this.drivers.keys()];
    for (const d of this.drivers.values()) d.update(dt, trains);
    // a cleared signal goes back to danger once the departed train has left its step
    for (const sg of this.signals) {
      if (sg.state !== 'clear' || !sg.train) continue;
      const tr = sg.train;
      const spans = tr.runner ? tr.runner.spans(tr.tailDistance) : [];
      if (!spans.some((sp) => sp.piece === sg.step)) this._set(sg, 'danger');
    }
  }

  _event(name, driver, extra) {
    for (const fn of this.listeners) fn(name, driver.train, extra);
    if (extra?.step == null) return;
    for (const sg of this.signals) {
      if (sg.step !== extra.step) continue;
      if (name === 'arrive') this._set(sg, 'danger');
      if (name === 'depart') { this._set(sg, 'clear'); sg.train = driver.train; }
    }
  }

  _set(sg, state) {
    if (state === 'danger') sg.train = null;
    if (sg.state === state) return;
    sg.state = state;
    sg.model?.play?.(state === 'clear' ? 'open' : 'close');
  }
}
