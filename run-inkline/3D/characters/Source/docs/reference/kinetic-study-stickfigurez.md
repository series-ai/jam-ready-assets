# Stickfigurez kinetic study

## Sources

The primary source was the [official Stickfigurez Steam page](https://store.steampowered.com/app/2476150/Stickfigurez/). It names Studio Bidou as the developer and Studio Bidou with Hyun's Dojo as the publisher. It describes a platform fighter with direct movement and control.

The [Studio Bidou first playtest post](https://www.patreon.com/posts/first-playtest-107745909) says that the first playtest ended. It also says that the team planned a first official game trailer after polish work on visual effects, sound, and stages.

The [Studio Bidou Stickfigurez post](https://www.patreon.com/posts/stickfigurez-122293042) documents an older build and planned new content. The [Studio Bidou Bluesky profile](https://bsky.app/profile/studiobidou.bsky.social) identifies the studio account.

## Still image observations

These observations come from the official screenshots shown on the Steam page. They are still images. They do not prove motion timing.

- Fighters use clear, high contrast silhouettes.
- Attack poses use large limb angles and open space around the moving figure.
- Contact marks are sparse. They stay close to the contact point.
- Stages use simple large surfaces. The surfaces keep the figures readable.
- The images use strong accent colors for attacks, special states, and interface marks.
- Some scenes include large simple reactive objects. The objects do not fill the action area.
- Frame step and debug overlays appear in some screenshots. They show a creator tool context. They do not prove the final runtime timing.

## Normal-speed motion follow-up

On 26 September, the official Steam page exposed a [short gameplay clip](https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2476150/extras/f7bc3618456433bada8bef7774220221.mp4?t=1748259588). The clip is about 4.93 seconds at 700 by 448 pixels. Headless Chromium played it at rate 1. A local frame sheet sampled it at four frames per second. The reference clip and frame sheet remain in the excluded study cache.

| Approximate clip time | Visible result | Use in INKLINE |
| --- | --- | --- |
| 0.25–1.0 s | A run becomes an airborne strike. A large white wedge appears briefly at contact. A small white floor mark identifies the landing. | Separate the airborne pose from the ground pose. Keep the contact shape brief. Put landing marks at the support surface. |
| 1.25–2.0 s | The target rises above the attacker. Open space makes the travel easy to follow. The attacker compresses into a low pose before the next move. | Use an early peak in target travel and a clear recovery. Keep body movement larger than camera movement. |
| 2.25–3.25 s | The attacker follows the target off the ledge. Black and white arcs and angular marks appear near the bodies. | Follow the actual hand or weapon path. Keep a dark outer stroke and a light core. Avoid a fixed effect detached from the action. |
| 3.5–4.25 s | The airborne figures separate. A later contact produces a strong launch and long directional streaks. | Use stronger profiles for heavy contact. Keep large travel and long streaks for exceptional events. The training demo uses bounded target recovery. |

This sample supports broad sequence and shape observations. It does not identify exact hit-stop values, input-buffer settings, or the internal physics system. It also does not prove that the clip is a final released build. Earlier browser permission failures limited the first study to still images. The follow-up resolved that access limit.

## Original decisions for INKLINE

These decisions transfer the readable visual ideas. They keep the INKLINE rig, equipment, palette, and stage designs original.

- Use a separate bounded impact profile for light, heavy, kick, melee, and ranged actions.
- Use a short reaction pulse with an early peak and a zero end state. The current pure sampler keeps heavy travel near `0.85 m` and lift near `0.18 m`. It keeps light travel near `0.30 m`.
- Sample trails from the active limb or weapon contact points. Do not place a trail at a fixed screen location.
- Use sparse contact effects. Use the effect that matches the action and tool.
- Keep camera kick and zoom small. Keep the figure and contact point visible.
- Queue one input edge for `0.16 s`. Do not repeat an action while the input stays held.
- Keep action space open around the figures. Use large simple props when a scene needs a clear reaction.

The source images and short clip support the readability choices. They do not define our numeric values. INKLINE tests and visual review check those values.
