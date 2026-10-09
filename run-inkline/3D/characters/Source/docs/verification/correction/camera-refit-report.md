# Preview camera refit verification

The renderer keeps the current orbit direction during content changes. A new static asset, effect, or district layout receives an exact fit. This prevents a small pistol or a smaller district from remaining small after a larger view. Clip, proportion, and body-variant changes expand the frame when needed. These content fits recenter the subject. An explicit camera, mode, or reset can choose the default view.

Resize uses the change in aspect ratio. It keeps the target, orbit, and selected framing. A narrower viewport expands the visible area. A wider viewport retains the current scale. The stored minimum aspect prevents repeated wide-to-narrow changes from adding more zoom-out. A new user orbit or content fit starts a new aspect baseline. Perspective resize includes the content depth extent. Orthographic resize retains the current user zoom.

Full content fits use the complete animation bounds for avatars, animation previews, and character assets. Static assets, district views, and crowd views use actual content bounds. Effects use their full authored preview radius. Exact orthographic fits set the boom outside the sphere through the farthest bounds corner. The near-plane margin then remains valid during a later user orbit. Expand-only fits retain the previous distance and the current near-plane guard.

## Browser checks

`camera-preview-current.json` records 45 passing checks at 1440 by 900 and 390 by 844. They cover clip changes, avatar dimensions, equipment, body selection, user orbit, effect scale, static and animated assets, and resize. Six checks require default content fits to retain all corners after phone resize. Twelve headwear captures cover the tested head-scale limits. No browser errors occurred.

A user orbit can crop content before resize. The resize checks preserve both raw outside-corner counts and normalized extents. They reject new clipping. They do not require a resize to remove a crop that the user selected. `camera-resize-baseline.json` proves this distinction for the cargo container and district. Both initial default fits have no outside corners. After orbit, both views have crops. Phone resize retains their horizontal bounds exactly.

The one-pixel resize check measures the body span in CSS pixels. At fixed width, one added pixel of viewport height must not change that span. It can change the span as a fraction of viewport height. This check preserves user zoom without reinstating a full-content margin.

`camera-integration-browser.json` separately records 26 passing checks for small-to-large and large-to-small asset changes in Side and Top, all overview cameras, repeated resize, the 600-pixel gameplay width boundary, and paused reset after a knockout.

Earlier `camera-refit-*.json` files record intermediate versions. The current report and source hashes identify the tested final preview behavior. The gameplay cutaway and motion evidence remains separate in `camera-diagnosis.md`.
