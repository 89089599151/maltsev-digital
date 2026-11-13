# Expressive pages implementation plan

> **For agentic workers:** Use subagent-driven development for the independent page and motion work; root integrates and verifies.

**Goal:** Replace empty layouts with authored compositions and visible interaction across the requested pages.
**Architecture:** Existing static Astro project, scoped page styles, shared lightweight motion. No price/contact/backend changes.
**Spec:** `docs/superpowers/specs/2026-11-14-expressive-pages-design.md`.

- [x] Root: generate services browser sculpture; rebuild Services and tariff comparison, close the Home gap.
- [x] About worker: redesign only `src/pages/about.astro`, preserving factual content and portrait.
- [x] Works worker: redesign `src/pages/portfolio/index.astro` and `src/components/WorkFeature.astro`, preserving real project data.
- [x] Motion worker: enhance `src/scripts/motion.ts` and `src/styles/global.css`, using shared attributes without editing page-owned files.
- [x] Root: integrate and refresh case screenshots. Earlier source review, type check, production build and 360/768/1024 viewport checks completed. User explicitly stopped further verification and requested deployment; no new audits or Lighthouse runs.
- [ ] Root: commit, publish to GitHub Pages, follow deployment and verify the live site.

Shared review focus: all content must show without JS; no duplicated wrapper transforms; small-screen overflow; keyboard reachability; performance with motion enabled; correct base path for all image and page links.

Final color direction: light site and Works canvas; blue Business / dark Premium pricing cards and dark responsibility panels are intentional contextual accents, as clarified by the user.
