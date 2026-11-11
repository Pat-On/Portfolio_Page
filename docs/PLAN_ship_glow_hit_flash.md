---
title: "Plan: ship glows that leak into the hit flash"
status: proposed
created: 2026-11-11
updated: 2026-11-11
---

# Plan: ship glows that leak into the hit flash

Branch `fix/ship-glow-hit-flash`, cut from `perf/visual-perf-v3`, because the fix builds on that
branch's `_hitEnemy` change, which leaves shader-material plumes out of the flash, and on its
`game/shipHitFlash.test.js`.

## The problem

When a laser hits an enemy, `GameSystem._hitEnemy` swaps every mesh on the ship to one red flash
material (`enemy.flashMat`) and fades its `emissiveIntensity` from 3 to 0 over the flash. Three
glowing parts are animated by writing `emissiveIntensity` on **whatever material the mesh wears
now**. During a flash, that is the shared flash material:

| Ship | Writer | Effect during a flash |
|---|---|---|
| Saucer (`spaceship.js`) | `animation.js`: `engineMesh.material.emissiveIntensity` (0.3–1.1) | the whole ship's flash runs at the engine pulse instead of fading out |
| Borg Cube (`borg.js`) | `animation.js`: `emitter.material.emissiveIntensity` (0.7–2.3) | the same, at the emitter pulse |
| Death Star (`deathStar.js`) | `GameSystem._updateBoss`: emitter glow 3.5 → 20 while the superlaser charges | the whole Death Star blazes red at up to 20 |
| Death Star | `GameSystem._resetBossGlow` sets 3.5 when the beam ends | if the beam ends mid-flash, the reset lands on the flash material and the emitter's own material stays at full charge glow for the whole idle period |

`ViewGL.update` runs `GameSystem.update` before `animate`, so the ambient glow write wins every
frame. None of this throws: the flash material has `emissiveIntensity`. The Falcon crash fixed on
`perf/visual-perf-v3` had the same cause, a mesh animated through `mesh.material` while the flash
had replaced that material. The problems in the table already exist on `main`.

## The fix

Leave a ship's light sources out of the hit flash, as the plumes already are. The hull flashes
red; the engine and emitters keep their own material and keep glowing, so the writes above land
where they were meant to.

- Tag the three parts with `userData.keepMaterialOnHit = true`: the saucer's `engine`, the Borg
  `emitter`, the Death Star `emitter`.
- `_hitEnemy` skips a mesh that is a `ShaderMaterial` **or** carries the tag. The restore paths
  (flash end, respawn, cleanup) need no change: they only touch meshes that have `_origMat`.
- `mergeStatic` already keeps all three parts, because `userData` references them.

**Alternative considered:** store the glow *materials* in `userData` (`engineMat`, `emitterMat`)
and animate those directly, whichever material the mesh wears. The whole ship then flashes red,
including the engine. Rejected: every writer and reader changes (animation, boss charge and reset,
ship builders) to keep a red engine for a quarter of a second, and the next animated part would
have to remember the same rule. A tag at the one place that swaps materials keeps the rule in one
place.

## Steps (test first)

1. **Red:** in `shipHitFlash.test.js`, after the hit and the animation frames, the flash
   material's `emissiveIntensity` is still the 3 that `_hitEnemy` set, for every ship. This fails
   for the saucer and the Borg Cube today.
2. **Red:** the Death Star with real three: `_boss` is the hit Death Star, `_bossPhase` is
   `charging`, `_updateBoss` runs. The flash material is untouched and the emitter's own material
   charges. Then `_resetBossGlow` runs during the flash, and after the flash ends the emitter
   reads 3.5. This fails today.
3. **Green:** add the tag in the three builders and the check in `_hitEnemy`. Full suite and
   lint.
4. **Browser check (Playwright, `?quality=high`):** in game mode, hit the saucer, the Borg Cube,
   the Falcon and the Death Star mid-charge. Take screenshots during the flash and after it, and
   check the console stays free of errors. This also gives the Falcon crash fix its first
   in-browser confirmation. SwiftShader hangs when fire and move are held together (also on
   `main`), so trigger hits through the scene's `apiRef` rather than holding inputs.
5. Commit, then record the outcome in this file's status.

## Out of scope

- The flash's own look: one shared red material for the whole ship.
- The SwiftShader game-mode hang with fire and move held.
