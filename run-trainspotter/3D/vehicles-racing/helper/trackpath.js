// trackpath.js: track layout and train-following maths for the Trainspotter kit.
// Segments: 'line' (p0 -> p1), 'arc' (centre c in x/z, radius r, a0 -> a1 degrees,
// at height y) and 'poly' (graded track: straight between exact 3D points).
// No dependencies (runs in a browser or in Node), so games can use it with any
// engine. All units are voxels; headings are degrees about +Y with 0 = -Z and
// 270 = +X, the same as the kit catalogue (kit.json) and the Python build.

const RAD = Math.PI / 180;

// ---------------------------------------------------------------- segments (piece frame)
const chunk = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);

export function segLength(s) {
  if (s.t === 'line') return chunk(s.p0, s.p1);
  if (s.t === 'arc') return s.r * Math.abs(s.a1 - s.a0) * RAD;
  if (s.t === 'poly') return s.pts.slice(1).reduce((a, p, i) => a + chunk(s.pts[i], p), 0);
  throw new Error(`unknown segment type ${s.t}`);
}

/** Point and unit tangent at distance u along a segment: {p: [x,y,z], t: [x,y,z]}. */
export function segAt(s, u) {
  const L = segLength(s);
  const f = L > 0 ? Math.min(Math.max(u / L, 0), 1) : 0;
  if (s.t === 'line') {
    const d = [s.p1[0] - s.p0[0], s.p1[1] - s.p0[1], s.p1[2] - s.p0[2]];
    return { p: [s.p0[0] + d[0] * f, s.p0[1] + d[1] * f, s.p0[2] + d[2] * f], t: d.map((c) => c / L) };
  }
  if (s.t === 'poly') {
    // graded track (ramps): straight between exact vertices
    let rest = Math.min(Math.max(u, 0), L);
    for (let k = 0; k < s.pts.length - 1; k++) {
      const a = s.pts[k], b = s.pts[k + 1], c = chunk(a, b);
      if (rest <= c + 1e-9 || k === s.pts.length - 2) {
        const g = c > 0 ? Math.min(rest / c, 1) : 0;
        return { p: a.map((v, i) => v + (b[i] - v) * g), t: a.map((v, i) => (b[i] - v) / c) };
      }
      rest -= c;
    }
  }
  const a = (s.a0 + (s.a1 - s.a0) * f) * RAD;
  const sign = s.a1 > s.a0 ? 1 : -1;
  return { p: [s.c[0] + s.r * Math.cos(a), s.y ?? 0, s.c[1] + s.r * Math.sin(a)], t: [-Math.sin(a) * sign, 0, Math.cos(a) * sign] };
}

export function routeAt(route, u) {
  for (const s of route.segs) {
    const L = segLength(s);
    if (u <= L + 1e-9) return segAt(s, Math.max(0, u));
    u -= L;
  }
  const last = route.segs[route.segs.length - 1];
  return segAt(last, segLength(last));
}

export const headingOf = (tx, tz) => ((Math.atan2(-tx, -tz) / RAD) % 360 + 360) % 360;

// ---------------------------------------------------------------- placement
/** Turn (x, z) by theta degrees about +Y (three.js rotation.y has the same sense). */
export function rotate(x, z, theta) {
  const t = theta * RAD;
  return [x * Math.cos(t) + z * Math.sin(t), -x * Math.sin(t) + z * Math.cos(t)];
}

export class Placed {
  constructor(name, spec, theta, tx, tz, ty = 0) {
    Object.assign(this, { name, spec, theta, tx, tz, ty });
    this.state = 'close'; // switches: the state whose route is set
  }
  toWorld(p) {
    const [x, z] = rotate(p[0], p[2], this.theta);
    return [x + this.tx, p[1] + this.ty, z + this.tz];
  }
  dirToWorld(t) {
    const [x, z] = rotate(t[0], t[2], this.theta);
    return [x, t[1], z];
  }
  connector(name) {
    const c = this.spec.connectors[name];
    if (!c) throw new Error(`${this.name} has no connector ${name}`);
    return { p: this.toWorld(c.p), yaw: (((c.yaw + this.theta) % 360) + 360) % 360 };
  }
  get isSwitch() {
    return this.spec.routes.some((r) => r.state);
  }
}

/** Place a piece so its connector `enter` mates with a world connector `onto`. */
export function place(name, spec, enter, onto) {
  const c = spec.connectors[enter];
  const theta = (((onto.yaw + 180 - c.yaw) % 360) + 360) % 360;
  const [x, z] = rotate(c.p[0], c.p[2], theta);
  return new Placed(name, spec, theta, onto.p[0] - x, onto.p[2] - z, onto.p[1] - c.p[1]);
}

const key = (p) => p.map((v) => Math.round(v * 64)).join(',');

/**
 * A layout from steps. Each step is a piece name (entered at `a`, left at
 * `b`) or {piece, enter = 'a', leave = 'b', from: [stepIndex, connector], at: {p, yaw}}; by
 * default a step attaches to the previous step's `leave` connector; `at` starts a separate chain. The first
 * step sits at `start` (default: connector `a` at the origin, track running -Z).
 */
export class Layout {
  constructor(catalogue, steps, start = { p: [0, 0, 0], yaw: 0 }) {
    this.cat = catalogue;
    this.placed = [];
    let onto = start;
    let prevLeave = null;
    for (const raw of steps) {
      const st = typeof raw === 'string' ? { piece: raw } : raw;
      // routed pieces: the track section, and bridges in the civil section
      const spec = catalogue.track?.[st.piece] ?? (catalogue.civil?.[st.piece]?.routes ? catalogue.civil[st.piece] : undefined);
      if (!spec) throw new Error(`unknown track piece ${st.piece}`);
      if (st.at) onto = st.at; // start a separate chain here: {p: [x, y, z], yaw}
      else if (st.from) onto = this.placed[st.from[0]].connector(st.from[1]);
      else if (prevLeave) onto = prevLeave;
      const p = place(st.piece, spec, st.enter ?? 'a', onto);
      this.placed.push(p);
      prevLeave = spec.connectors[st.leave ?? 'b'] ? p.connector(st.leave ?? 'b') : null;
    }
    this._link();
  }

  _link() {
    // every connector, hashed by position; mates face opposite ways
    this.at = new Map();
    this.placed.forEach((pc, i) => {
      for (const name of Object.keys(pc.spec.connectors)) {
        const c = pc.connector(name);
        const k = key(c.p);
        if (!this.at.has(k)) this.at.set(k, []);
        this.at.get(k).push({ piece: i, conn: name, yaw: c.yaw });
      }
    });
  }

  /** The connector that mates with (piece, conn), or null at an open end. */
  mate(piece, conn) {
    const c = this.placed[piece].connector(conn);
    for (const o of this.at.get(key(c.p)) ?? []) {
      if (o.piece === piece && o.conn === conn) continue;
      const d = Math.abs((((o.yaw - c.yaw) % 360) + 360) % 360 - 180);
      if (d < 1e-3) return o;
    }
    return null;
  }

  /** Open connectors (no mate): where track ends. */
  openEnds() {
    const out = [];
    this.placed.forEach((pc, i) => {
      for (const name of Object.keys(pc.spec.connectors)) if (!this.mate(i, name)) out.push({ piece: i, conn: name });
    });
    return out;
  }

  setSwitch(i, state) {
    if (!this.placed[i].isSwitch) throw new Error(`step ${i} is not a switch`);
    this.placed[i].state = state;
  }

  /** Routes leaving a piece through connector `conn`, given its switch state. */
  routesFrom(piece, conn) {
    const pc = this.placed[piece];
    const out = [];
    for (const r of pc.spec.routes) {
      if (r.from === conn && (!r.state || r.state === pc.state)) out.push({ piece, route: r, dir: 1 });
      else if (r.to === conn) out.push({ piece, route: r, dir: -1 });
    }
    return out;
  }

  /** The edge a train takes after leaving `edge` at its far end, or null (dead end). */
  next(edge) {
    const exitConn = edge.dir > 0 ? edge.route.to : edge.route.from;
    if (!exitConn) return null; // buffer stop
    const m = this.mate(edge.piece, exitConn);
    if (!m) return null;
    const options = this.routesFrom(m.piece, m.conn);
    return options[0] ?? null;
  }

  /** The edge a train came along to enter `edge` at its start, or null (open end or buffer stop).
   * Walking backwards through points follows the route their state sets. */
  prev(edge) {
    const entry = edge.dir > 0 ? edge.route.from : edge.route.to;
    if (!entry) return null;
    const m = this.mate(edge.piece, entry);
    if (!m) return null;
    const out = this.routesFrom(m.piece, m.conn)[0];
    return out ? { piece: out.piece, route: out.route, dir: -out.dir } : null;
  }

  /** Every route of every placed piece, as forward edges (for scenery such as overhead wires). */
  edges() {
    return this.placed.flatMap((pc, piece) => pc.spec.routes.map((route) => ({ piece, route, dir: 1 })));
  }

  /** Point and tangent (world) at distance u along an edge, in its travel direction. */
  edgeAt(edge, u) {
    const L = edge.route.length;
    const pc = this.placed[edge.piece];
    const { p, t } = routeAt(edge.route, edge.dir > 0 ? u : L - u);
    const tw = pc.dirToWorld(t);
    return { p: pc.toWorld(p), t: edge.dir > 0 ? tw : tw.map((c) => -c) };
  }

  /** An edge leaving a given piece's connector (for placing a train). */
  edge(piece, conn = 'a') {
    const e = this.routesFrom(piece, conn)[0];
    if (!e) throw new Error(`no route leaves step ${piece} at ${conn}`);
    return e;
  }
}

// ---------------------------------------------------------------- following
/**
 * A cursor running along a layout, remembering the track it has covered so
 * points behind it (where the cars are) stay on the rails it actually took,
 * whatever the switches do afterwards.
 */
const reverseEdge = (e) => ({ piece: e.piece, route: e.route, dir: -e.dir });

export class Runner {
  constructor(layout, edge, u = 0, { backfill = true } = {}) {
    this.layout = layout;
    this.edge = edge;
    this.u = u;
    this.history = []; // edges already left, oldest first
    this.stopped = false;
    this.keep = 4096; // voxels of history to keep
    if (backfill) this.backfill();
  }

  /** The edge and travel offset d behind the cursor: {index, edge, x}, index -1 for the
   * current edge, else into history. Past the history it clamps to the oldest edge's start. */
  locate(d) {
    if (d <= this.u) return { index: -1, edge: this.edge, x: this.u - d };
    d -= this.u;
    for (let i = this.history.length - 1; i >= 0; i--) {
      const L = this.history[i].route.length;
      if (d <= L) return { index: i, edge: this.history[i], x: L - d };
      d -= L;
    }
    return { index: 0, edge: this.history[0] ?? this.edge, x: 0 };
  }

  /** A runner facing the other way, d behind this one (at the rear of a train d long),
   * whose history is the track this one just came over, in its new direction. */
  reversed(d) {
    const at = this.locate(d);
    const list = [...this.history, this.edge];
    const k = at.index < 0 ? list.length - 1 : at.index;
    const r = new Runner(this.layout, reverseEdge(list[k]), list[k].route.length - at.x, { backfill: false });
    r.history = list.slice(k + 1).reverse().map(reverseEdge);
    r.keep = this.keep;
    r.backfill();
    return r;
  }

  /**
   * The track ahead, as the runner will take it with the points as they are set now:
   * {edges: [{edge, start}], end}. `start` is the distance from the cursor to where the
   * edge begins (negative for the current edge); `end` is the distance to the end of the
   * line (a buffer stop's face, less `margin`), or null if the track runs on past `max`.
   */
  ahead(max, margin = 2) {
    const edges = [{ edge: this.edge, start: -this.u }];
    let e = this.edge;
    let start = -this.u;
    for (let n = 0; n < 512; n++) {
      const L = e.route.length;
      const nxt = this.layout.next(e);
      if (!nxt) {
        const stopAt = this.layout.placed[e.piece].spec.stopAt;
        const face = e.dir > 0 && e.route.to == null && stopAt != null ? stopAt : L;
        return { edges, end: start + face - margin };
      }
      start += L;
      if (start > max) return { edges, end: null };
      edges.push({ edge: nxt, start });
      e = nxt;
    }
    return { edges, end: null };
  }

  /** Track occupied from the cursor back `d`: [{piece, route, lo, hi}], offsets along each
   * route from its `from` end (whatever way the runner travels it). */
  spans(d) {
    const out = [];
    const add = (e, a, b) => {
      const L = e.route.length;
      const [lo, hi] = e.dir > 0 ? [a, b] : [L - b, L - a];
      out.push({ piece: e.piece, route: e.route, lo, hi });
    };
    if (d <= this.u) { add(this.edge, this.u - d, this.u); return out; }
    add(this.edge, 0, this.u);
    d -= this.u;
    for (let i = this.history.length - 1; i >= 0 && d > 0; i--) {
      const e = this.history[i];
      const L = e.route.length;
      add(e, Math.max(0, L - d), L);
      d -= L;
    }
    return out;
  }

  /** Fill the history with the track behind the start, so a train placed mid-layout
   * lies along the real curves behind it rather than on a straight extension. */
  backfill(length = this.keep) {
    let total = this.u + this.history.reduce((t, h) => t + h.route.length, 0);
    let e = this.history[0] ?? this.edge;
    const before = [];
    while (total < length) {
      const p = this.layout.prev(e);
      if (!p) break;
      before.unshift(p);
      total += p.route.length;
      e = p;
      if (before.length > 512) break; // guards a malformed layout
    }
    this.history = before.concat(this.history);
  }

  /** Move forward by ds (>= 0). Stops at a dead end; returns the distance actually moved. */
  advance(ds) {
    let moved = 0;
    while (ds > 1e-12) {
      const L = this.edge.route.length;
      const room = L - this.u;
      if (ds <= room) {
        this.u += ds;
        moved += ds;
        break;
      }
      const nxt = this.layout.next(this.edge);
      if (!nxt) {
        moved += room;
        this.u = L;
        this.stopped = true;
        break;
      }
      moved += room;
      ds -= room;
      this.history.push(this.edge);
      this.edge = nxt;
      this.u = 0;
    }
    this._prune();
    return moved;
  }

  _prune() {
    let total = this.u;
    for (let i = this.history.length - 1; i >= 0; i--) {
      total += this.history[i].route.length;
      if (total > this.keep) {
        this.history.splice(0, i);
        return;
      }
    }
  }

  /** Point and forward tangent d behind the cursor (d >= 0). Beyond the history, extends straight back. */
  behind(d) {
    if (d <= this.u) return this.layout.edgeAt(this.edge, this.u - d);
    d -= this.u;
    for (let i = this.history.length - 1; i >= 0; i--) {
      const e = this.history[i];
      const L = e.route.length;
      if (d <= L) return this.layout.edgeAt(e, L - d);
      d -= L;
    }
    const first = this.history[0] ?? this.edge;
    const { p, t } = this.layout.edgeAt(first, 0);
    return { p: p.map((c, k) => c - t[k] * d), t };
  }
}

// ---------------------------------------------------------------- consists
const sub = (a, b) => a.map((c, i) => c - b[i]);
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

/** Distance behind the runner whose point is `chord` (straight line) from `from`, searching from `d0`. */
function chordBehind(runner, from, d0, chord) {
  let lo = d0;
  let hi = d0 + chord * 1.6 + 1;
  if (dist(runner.behind(hi).p, from) < chord) return hi; // past the history: extrapolated straight
  for (let k = 0; k < 40; k++) {
    const mid = (lo + hi) / 2;
    if (dist(runner.behind(mid).p, from) < chord) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/**
 * Where every car of a consist sits, given the runner at the lead car's front
 * coupler. cars: [{couplers: {f, r}, guides: [gf, gr], flip}] (catalogue
 * numbers, local z). Returns per car {front, rear, pos, yaw, pitch, bogieYaw:
 * [f, r] (relative to the body), d: [front, rear] distances behind the runner}.
 * Guides lie exactly on the rails; consecutive couplers meet to within the
 * chord-vs-arc error of one car length.
 */
export function placeConsist(runner, cars, railTop = 8) {
  const out = [];
  let couplerPoint = runner.behind(0).p;
  let dCoupler = 0;
  for (const car of cars) {
    let [gf, gr] = car.guides;
    let { f, r } = car.couplers;
    if (car.flip) [gf, gr, f, r] = [-gr, -gf, -r, -f];
    const dFront = chordBehind(runner, couplerPoint, dCoupler, gf - f);
    const front = runner.behind(dFront);
    const dRear = chordBehind(runner, front.p, dFront, gr - gf);
    const rear = runner.behind(dRear);
    const fwd = sub(front.p, rear.p);
    const flat = Math.hypot(fwd[0], fwd[2]);
    const yaw = headingOf(fwd[0], fwd[2]);
    const pitch = Math.atan2(fwd[1], flat) / RAD;
    const pos = [(front.p[0] + rear.p[0]) / 2, (front.p[1] + rear.p[1]) / 2 + railTop, (front.p[2] + rear.p[2]) / 2];
    const rel = (t) => ((((headingOf(t[0], t[2]) - yaw) % 360) + 540) % 360) - 180;
    const unit = fwd.map((c) => c / Math.hypot(...fwd));
    couplerPoint = rear.p.map((c, k) => c - unit[k] * (r - gr));
    // search the next car from about where this coupler sits on the path (just short of it,
    // so the bisection starts inside the chord)
    dCoupler = dRear + Math.max(0, r - gr - 1);
    out.push({ front: front.p, rear: rear.p, pos, yaw: car.flip ? yaw + 180 : yaw, pitch: car.flip ? -pitch : pitch,
      bogieYaw: car.flip ? [rel(rear.t), rel(front.t)] : [rel(front.t), rel(rear.t)], d: [dFront, dRear] });
  }
  return out;
}

// ---------------------------------------------------------------- steam motion (same maths as kit/stock.py)
/** (y, z) of a crank pin after the wheel turns theta radians about +X; phase 0 = top. */
export function crankPin(theta, c, phase) {
  const y0 = c * Math.cos(phase);
  const z0 = -c * Math.sin(phase);
  return [y0 * Math.cos(theta) - z0 * Math.sin(theta), y0 * Math.sin(theta) + z0 * Math.cos(theta)];
}

/** Offsets from rest for one side's rods: {rod: [dy, dz], main: [dy, dz, dRotX (rad)], crosshead: dz}. */
export function rodPose(theta, rods, r, phase) {
  const [py0, pz0] = crankPin(0, rods.crank, phase);
  const [py, pz] = crankPin(theta, rods.crank, phase);
  const beta = (py_) => {
    const dy = rods.slideY - (r + py_);
    return [dy, -Math.sqrt(rods.mainLen ** 2 - dy * dy)];
  };
  const [dy0, dz0] = beta(py0);
  const [dy, dz] = beta(py);
  const b0 = Math.atan2(dy0, -dz0);
  const b = Math.atan2(dy, -dz);
  return { rod: [py - py0, pz - pz0], main: [py - py0, pz - pz0, b - b0], crosshead: pz + dz - (pz0 + dz0) };
}
