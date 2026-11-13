# Expressive pages and motion

User direction: fill the empty home area, rebuild Works, Services and About, replace the spreadsheet-like comparison, add visible hover and scroll motion. User grants creative discretion and image generation; continue implementation directly.

## Visual direction

Retain cold white, electric blue #1a2ffb, Onest and the existing brand. Explicit user corrections: the overall site and Works canvas remain LIGHT; dark colors are appropriate as deliberate accents, particularly in Services pricing. Do not globally remove dark colors. Keep the blue Business and near-black Premium cards, dark responsibility cards and the existing featured price row; keep page backgrounds, Works, About hero and method light. Build a confident editorial studio site with purposeful illustrations, fine grids/connector lines, asymmetric composition, a real portrait and real website previews. Avoid generic blank cards, fake client work, invented stats and excessive decorative chips.

- Home: keep the jellyfish; replace the empty gap under the CTA with a compact, visually connected design/code/launch story. Rebalance the vertical layout and interactive facts.
- Services: custom hero with generated blue-glass website assembly object, visible pricing entry and meaningful terms. Integrate the differences into rich tariff cards; remove the large comparison table. Preserve all prices, contents, estimator, add-ons and contact links.
- Works: real project as the visual anchor from the first screen on a light studio canvas, purposeful art direction and a concise next-project invitation; no empty placeholder hero or retro folder.
- About: real owner photo, typographic personal introduction, an authored visual story and varied white/pale-lavender/light-blue sections. Preserve true personal facts, principles and AI transparency. No fictional experience, credentials or customers.
- Motion: clear reveal rhythm, stagger, image zoom, lift, interactive cards and subtle pointer response; use the existing GSAP/CSS stack, no heavy new runtime. Respect reduced motion and keyboard focus. Keep content visible without JS, no artificial preloader.

## Shared implementation interface

Existing `data-reveal`, `data-split`, `data-stagger`, `data-tilt-area`, `data-tilt`, `data-float`, `data-magnetic` remain available. New generic `data-hover-card` supplies hover/focus lift; `data-spotlight` optionally supplies a subtle pointer highlight. Individual page CSS owns layout and image transitions.

## Verification

Astro check, launch check, production build at /maltsev-digital; browser at 360/768/1024/1440/1920, scroll and hover behavior, reduced motion, menu, estimator-to-brief. Fresh independent review. Isolated Lighthouse to avoid host contention. Publish through the existing authorized GitHub Pages workflow and verify live imagery.
