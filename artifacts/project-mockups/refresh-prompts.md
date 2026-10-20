# Project refresh: 20 October 2026

Generated with the built-in image generation tool, using captured app screens as references. Source PNGs and web-ready WebP versions are saved in `public/project-posters`:

- `aarthik-mockup`: two mobile devices showing the current Overview and Insights views. Replaces Meridian imagery and its old video in the portfolio.
- `looma-mockup`: desktop enterprise dashboard and tablet restaurant workspace, in a warm contemporary business/hospitality studio. Replaces NorthStar.
- `logiflowai-dashboard-mockup`: the actual dashboard captured after creating a separate demo agency at the user's request, inserted into the container-port setting. Its sample-data indicators remain visible. The supplied personal login details were not used for this capture and are not stored in project files.

## Aarthik prompt

Create a premium photorealistic portfolio product mockup image in landscape 16:9, high resolution. Image 1 is the actual Aarthik app home screenshot; image 2 is its actual Insights screen. Treat both as immutable screen inserts: preserve their typography, all text, rupee amounts, dark design, bottom navigation, branding and layout as accurately as possible. Show two elegant current black smartphones, front-facing with a subtle three-quarter perspective, home screen on the prominent phone, insights on a slightly smaller companion phone behind. Devices must be fully visible with comfortable margins, screens sharp and legible, no hands, no extra copy, no invented UI. Sophisticated dark charcoal studio setting with curved brushed graphite plinths, subtle warm champagne edge light and a faint iridescent reflection that echoes the app's central plus button. Refined art direction, physically plausible soft shadows, restrained reflections, crisp device edges, tasteful negative space, visually striking designer portfolio case-study cover. No watermarks or external logos.

## Looma prompt

Create an exceptional photorealistic designer portfolio product mockup, landscape 16:9 high resolution. Image 1 is an actual Looma enterprise operations dashboard screenshot. Image 2 is the actual restaurant dashboard. Use the provided screenshots as screen inserts, preserving their real content, exact Looma branding, layout, data cards, peach charts, backgrounds and interface typography faithfully. Hero: a large thin-bezel desktop monitor displaying image 1 on a sculptural dark walnut desk; companion elegant tablet in landscape displaying image 2 in the foreground. A refined contemporary hospitality-business studio with warm limestone, brushed aluminum details and soft amber practical lighting, dusk city through glass in distant bokeh. Suggest the meeting of restaurant, retail and enterprise operations through subtle spatial styling, without literal clutter, no people. Screens should occupy most of composition and remain legible, minimal perspective skew. Warm sophisticated material palette consistent with the actual app, realistic shadows and glass reflections, professional editorial product photography, confident negative space, no added headline, no invented UI or logos, no watermarks, no decorative text.

## LogiFlow prompt

Create a beautiful photorealistic portfolio case-study mockup, high-resolution landscape 16:9. The input image is the real LogiFlow public agency workspace access screen. Use this exact supplied screen inside a premium large thin-bezel desktop monitor, preserving the navy/teal/lilac LogiFlow interface, exact real branding, welcome copy, agency owner/vendor cards and empty login form. Do not invent an authenticated dashboard, statistics, AI output or extra screen content. Creative but realistic logistics setting: an immaculate modern freight control office overlooking an Indian container port at blue hour, distant gantry cranes, stacked shipping containers and a cargo vessel visible through panoramic glass. Monitor is dominant, frontal with subtle perspective and crisp legible screen, resting on a graphite operations desk with a small neat stack of shipping documents and an understated metal container model. Teal light accents echo the app and warm amber task light creates dimensional material contrast. No people, no clutter, no added slogans, no watermarks. Strong editorial composition, comfortable margins around monitor, physically correct shadows and modest realistic reflections. Actual app screen is the hero; the logistics context supports it.

## Implementation and evidence

Final LogiFlow edit prompt: preserve the original port-setting mockup photograph and replace only its monitor screen with the captured authenticated demo dashboard. Preserve the real navy gradient, lime Overview pill, shipment KPI cards, fleet/load planning, truck cargo plan and Ask LogiFlow control; retain the actual sample values, and invent no additional dashboard content. Generated with the built-in image generation tool; saved as `public/project-posters/logiflowai-dashboard-mockup.png` and an optimised WebP counterpart.

The supplied URL suffixes `/-use` and `/-` were prose attached to links. The canonical app roots are used for navigation.

`projectUpdates.ts` provides project content for the home reel, project listing, details and dialogs. Aarthik remains ID 02, Looma replaces ID 05, and the new LogiFlow AI workspace is ID 10; ID 03 preserves the earlier logistics project.

Looma's Restaurant & hospitality, Enterprise operations and Commerce & retail workspaces were inspected with browser-local sample data. Aarthik's actual Earnings screen distinguishes received payouts from expected payouts and includes buffer planning. Its case study and PDF now link to the live demo and explain changes from the original design specification.

The résumé overlay is marked `data-native-cursor`; the liquid cursor suspends and its global cursor-hiding class clears while it exists. Normal pointer styles cover the chooser, download link and embedded PDF viewer. Closing restores the liquid cursor on the next mouse move. Graphic design routes continue to exclude liquid effects.
