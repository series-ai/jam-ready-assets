# Combat stance and guns — 1.4.1

The torso correction preserved the original curved spine direction as whole-body lean. The old attack poses therefore still leaned too far. This pass changes those authored poses. It keeps the nearly straight spine. The standing kick also moves its planted foot below the body.

The old gun mount corrected rotation but did not seat the stock. The shotgun contact pose aimed 41 degrees upward. Its fixed support target sat behind the pump and removed pump motion. The old reload hand positions missed the magazine after the gun moved.

The source now bakes both arms against weapon contact points for each body. The runtime scales the rifle and shotgun to the arm length. Shared fit data defines stock, palm, support, pump, and magazine targets. The firing frame aims forward. Small recoil follows that frame. The shotgun pump and rifle magazine are separate moving meshes. Each adds one draw call while equipped. Character triangles and bones remain the same.

All 85 clip durations and existing contact times retain their 1.4.0 values. The exported Blender generator reads its adjacent `runtime/firearms.json`. The standalone character clips contain the arm motion. The runtime moves the prop parts and maintains the second hand contact.

Current checks and captures are in [docs/verification/stance](https://github.com/series-ai/run-workshop/blob/main/games/inkline-showcase/docs/verification/stance). Earlier reports in [docs/verification/polish](https://github.com/series-ai/run-workshop/tree/main/games/inkline-showcase/docs/verification/polish) describe the 1.4.0 pass. Physical Android performance remains unverified.
