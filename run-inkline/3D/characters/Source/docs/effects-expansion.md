# Effects expansion

The procedural effects catalog now contains 64 recipes. The catalog keeps five groups and seven instanced shape pools. The default pool capacity remains 2,048 particles.

The 24 added recipes are:

- Combat: `blade-contact`, `weapon-clash`, `shield-bash`, `guard-shock`, `counter-flash`
- Weapons: `muzzle-snap`, `ricochet`, `shell-burst`, `plasma-hit`
- Movement: `vault-dust`, `wall-kick`, `grind-sparks`, `zipline-streak`, `hard-stop`
- Destruction: `welding-arc`, `steam-burst`, `electric-arc`, `pipe-leak`, `hazard-flare`, `oil-splash`
- Status: `combo-rise`, `damage-pips`, `focus-pulse`, `danger-pulse`

The recipes use short durations, clear centers, and small accents. They use paper, ink, and accent roles. Large transparent smoke planes are not used.

`effectPreviewBounds(effect, scale, lifetime)` samples the same seeded particle rules as the runtime. It includes the delayed start schedule. A delayed particle stays at its spawn point until it becomes visible. The bounds also include particle travel, gravity, floor travel, spiral offsets, paired star cores, shape extent, scale, and lifetime. It returns:

```ts
{
  center: THREE.Vector3       // sampled local visual center
  radius: number              // sampled world-space visual radius
  frameRadius: number         // compact camera radius for existing callers
}
```

`effectPreviewRadius` remains available for consumers that need one radius. The renderer and capture page use the sampled center and radius. They fit the smaller camera field of view and add a 12 percent margin. All 512 exported frames have a clear edge margin.

The preview sampler and `InkEffects.clear()` use the fixed seed `1234567`. Clearing a pool also resets paired-star IDs. A cleared pool therefore produces the same transforms as a new pool for the same trigger sequence. Runtime gameplay keeps its random sequence until a caller clears the pool.

The tests check all 64 IDs, finite bounds, scale and lifetime growth, spiral reach, seven pools, default capacity, finite transforms, color roles, and pool cleanup.
