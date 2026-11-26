# Service Excellence in Action
### Bringing research, people and service improvement together

An interactive development preview for the Ministry of Health and Wellness, Jamaica — Enabling Environment in Health and Client Services Division (EEHCSD). Developed by Beginning Concepts.

**Research source:** Internal Customer Satisfaction Study Report; survey conducted in 2025; original cover dated 2026; 74 PDF pages.

**Status:** Working frontend prototype on branch **feature/service-excellence-preview**. It is not yet an approved Ministry product, an official training programme, or a live implementation-monitoring system.

## Open the prototype

The project is entirely static and does not require an npm install, bundler or backend. Run a local HTTPS-compatible test server or serve the repository root through Render Static Site or GitHub Pages only after content distribution approval.

To test locally:
1. Download/clone the preview branch.
2. Start a local HTTP server (for example, Python 3: python -m http.server 4173).
3. Visit http://localhost:4173/#/home.
4. For PWA installation testing, use HTTPS or localhost and a supporting browser.

It has deliberately not been publicly deployed from this repository because the source publication is internal. Hosting requires Ministry clearance, including a decision about public access to the aggregate findings.

## Eight experiences

1. **Welcome:** cinematic cover-inspired entry point with the provisional animated guide, 2025 CSAT baseline, and clear exploration paths.
2. **The Study:** sampling frame, sampling method, participants, five GOJ service dimensions and data-quality notes.
3. **The Results:** overall 54% satisfaction, 85% policy benchmark, staged 65% target, interactive dimension scores and explanations.
4. **By Division:** Table 2 satisfaction data, Table 3 five-dimension comparisons, contextual interpretation.
5. **What Staff Shared:** four original qualitative themes, presented without sensitive verbatim focus-group disclosures.
6. **From Findings to Action:** all ten original Appendix 5 workstreams, responsibilities, periods, activities and intended outcomes — no fabricated progress.
7. **Learn & Improve:** accessible practice scenarios inspired by the research; no official certificates.
8. **Digital Report Library:** offline-private, device-local loading of the supplied PDF, original page references, navigation, and a browser reader with download and full-view controls.

## Guide and original cover treatment

The included animated SVG is a provisional visual study based on the cover's braided, headset-wearing Jamaican woman. On selecting an authorised copy of the original PDF, the app extracts the embedded 1024×1536 JPEG cover image locally from the PDF bytes and makes that original art available on the welcome screen. **The PDF never leaves the device.**

The welcome uses optional device speech synthesis with play, pause, restart, mute and volume plus a written transcript. This is a functional narration demonstration, **not** final licensed Jamaican voice acting, video, or lip-synchronised animation. Final character identity and voice require approval.

## PWA and accessibility

- Valid manifest, installable 192/512 icons, standalone mode, cacheable app shell, offline lightweight content, update-aware service worker.
- Browser install prompts where available; installation guidance elsewhere (notably iOS Safari).
- Responsive layouts, keyboard navigation, focus outlines, labelled controls and data charts, contrast/text-size/reduced-motion preferences, speech transcript and no forced autoplay.
- Local-only PDF file loading with no API upload, storage of confidential feedback, login imitation or fictitious analytics.
- Share button and downloadable QR image use a third-party QR service **only for the current public app URL**, not user or report contents. This service must undergo the host organisation's privacy review before production.

## Architecture

- index.html — semantic application shell
- src/styles.css — design system and responsive layouts
- src/data.js — historical study data and citation indexes; single source of truth
- src/app.js — modular functions for eight experiences, state, data visualisations, interactive learning and document handling
- assets/guide.svg — animated cover-inspired concept character
- assets/icon.svg, icon-192.png, icon-512.png — application identity and installation icons
- manifest.webmanifest, sw.js — PWA setup
- docs/SOURCE_VERIFICATION.md — reconciliations and research-verification log
- docs/CHARACTER_AND_MEDIA.md — character/audio production and approval requirements
- qa/smoke.mjs — source invariants, syntax, PWA asset and privacy checks

Run automated checks: node qa/smoke.mjs

## Original publication not publicly hosted

The supplied 74-page PDF, sensitive participant comments and original interview records are not stored in this public repository. The source-derived aggregate dashboard remains a development preview and must not be described as a present-day performance assessment. All recommendation indicators are **proposed future outcomes**.

If the Ministry authorises public access, add the approved, redacted or original publication to a controlled location, configure a trusted report URL in the app, and verify its distribution permissions before showing unrestricted download links. If access is restricted, use authenticated staff-only hosting instead of public static delivery.

See docs/SOURCE_VERIFICATION.md for identified discrepancies requiring the research team's review.

## Deployment and QA checkpoints

**Prior to external launch:** Ministry approval of the name, artwork, voice, research content, branding, acknowledgements, QR integration and privacy arrangements; reconciliation of research data; screen-reader, phone, tablet and desktop validation; PWA installation testing on real devices; publication access controls; final licensed lip-synchronised welcome video; appropriate monitoring/logging.

**Development credit:** [Beginning Concepts](https://beginningconcepts.org/) — original research remains attributable to the Ministry and its research team.
