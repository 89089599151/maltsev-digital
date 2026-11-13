# White and blue site release implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the existing white and electric-blue redesign, integrate its generated hero, and publish to the existing GitHub Pages site.

**Architecture:** Retain the Astro static site, its content, prices, contact flow, and existing Pages workflow. Continue the owner's uncommitted redesign in the current checkout on `codex/finish-white-blue-site` so no existing work is discarded.

**Tech Stack:** Astro, TypeScript, CSS, Sharp, GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-11-14-white-theme-redesign-design.md`

## Global constraints

- White theme, electric blue `#1a2ffb`, no pixel style or fabricated portfolio facts.
- Preserve the existing inner-page layouts, confirmed contacts, and prices.
- Keep reduced-motion support, readable contrast, and correct `/maltsev-digital` paths.
- Publish only site source and assets; leave unrelated `output/`, reference images, and local launch settings intact.

## Review focus

- The generated glass object must composite cleanly on white and dark surfaces.
- Meaningful muted headings must remain readable against the lavender page background.
- The mobile menu must open and close; the estimator must transfer its selection to the brief.
- Preview images in the case must show the current site.
- Production assets, internal links, and canonical URLs must use the GitHub Pages base path.

## Task 1: Complete visuals

- [x] Copy the generated transparent jellyfish to `src/assets/gen/hero-object-v2.png`; prefer it in `HeroNova.astro`, preserving the existing image.
- [x] Darken `.tone-mute` to a readable muted color; verify contrast and responsive layout.
- [x] Refresh the five `src/assets/case/` screenshots and the social preview; synchronize the case's iteration count.
- [x] Record the final image prompt and output path in `IMAGE_GENERATION_PROMPTS.md`.

## Task 2: Verify and publish

- [x] Run `npm run check`, `npm run check:launch`, and a production build with the existing Pages URL and base path.
- [x] Check pages, image loads, horizontal overflow, mobile navigation, estimator, and the brief; obtain an independent source review.
- [ ] Commit the site changes, fast-forward `main`, and push to the existing GitHub repository.
- [ ] Follow the triggered Deploy workflow through completion and verify the live site contains the new hero.

## Progress

- Baseline: Astro check reports 0 errors/warnings/hints; launch check passes.
- The initial hero already has alpha transparency; the black field seen by the image viewer was its display backdrop.
- Image generation: a refined glass-jellyfish edit was created with the built-in image generator, requesting transparent alpha and no outer halo.
- Muted heading contrast improved from 2.73:1 to 3.60:1 against the lavender background.
- Browser checks: responsive home at 375/768/1024/1440; mobile menu opens, Escape closes, focus returns. A START estimate with copywriting reaches the brief as 41,000 RUB with its complete selection.
- Embedded axe audits: no reported violations on the home or contacts pages; gradients and the closed native dialog require manual interpretation, and were checked in the browser.
- Independent source review: no important findings. Static review found all asset/fragment references valid; corrected the special 404 canonical path to the actual `404.html` file.
- Final checks: Astro reports 0 errors/warnings/hints; launch check passes; production build generates 9 pages. All eight content pages fit at 360px, and home fits at 1920px, without horizontal overflow or broken loaded images.
- Lighthouse 13.6.0: isolated mobile run scores 93/100/100/100 (performance/accessibility/best practices/SEO), LCP 2.86s, TBT 179ms, CLS 0; desktop scores 100/100/100/100. The initial mobile run overlapped other browser work and had an unattributed stall that disappeared in isolation. No motion changes were warranted.
