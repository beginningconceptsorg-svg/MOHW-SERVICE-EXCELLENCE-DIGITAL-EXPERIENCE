# Service Excellence in Action
### Bringing research, people and service improvement together

An interactive development preview for the Ministry of Health and Wellness, Jamaica — Enabling Environment in Health and Client Services Division (EEHCSD). Developed by Beginning Concepts.

**Research source:** Internal Customer Satisfaction Study Report; survey conducted in 2025; original cover dated 2026; 74 PDF pages.

**Status:** Working frontend prototype on branch **main**, the sole active development branch. It is not yet an approved Ministry product, an official training programme, or a live implementation-monitoring system.

## Open the prototype

The project is entirely static and does not require an npm install, bundler or backend. For private review, run a local test server or use Ministry-controlled hosting. Static hosting alone does not restrict access to an internal document.

To test locally:
1. Download/clone the `main` branch.
2. Start a local HTTP server (for example, Python 3: python -m http.server 4173).
3. Visit http://localhost:4173/#/home.
4. For PWA installation testing, use HTTPS or localhost and a supporting browser.

This GitHub repository is public and may have a publicly accessible frontend preview through Pages. The internal PDF is deliberately excluded; hosting the original report requires a documented Ministry access decision and appropriate delivery controls.

## Eight experiences

1. **Welcome:** cinematic cover-inspired entry point with the provisional animated guide, 2025 CSAT baseline, and clear exploration paths.
2. **The Study:** sampling frame, sampling method, participants, five GOJ service dimensions and data-quality notes.
3. **The Results:** overall 54% satisfaction, 85% policy benchmark, staged 65% target, interactive dimension scores and explanations.
4. **By Division:** Table 2 satisfaction data, Table 3 five-dimension comparisons, contextual interpretation.
5. **What Staff Shared:** four original qualitative themes, presented without sensitive verbatim focus-group disclosures.
6. **From Findings to Action:** all ten original Appendix 5 workstreams, responsibilities, periods, activities and intended outcomes — no fabricated progress.
7. **Learn & Improve:** accessible practice scenarios inspired by the research; no official certificates.
8. **Digital Report Library:** WRHA-inspired built-in PDF.js canvas reader, source-page navigation, optional swish page-turn audio, double-page mode, search, zoom, read-aloud, full-screen and original-document viewing/download once publication delivery is authorised.

## Guide and original cover treatment

The included animated SVG is a provisional visual study based on the cover's braided, headset-wearing Jamaican woman. When the original PDF is available from an authorised same-origin delivery path, the reader opens it automatically and extracts available cover art locally. **Visitors are not asked to upload a PDF.**

The welcome uses optional device speech synthesis with play, pause, restart, mute and volume plus a written transcript. This is a functional narration demonstration, **not** final licensed Jamaican voice acting, video, or lip-synchronised animation. Final character identity and voice require approval.

## PWA and accessibility

- Valid manifest, installable 192/512 icons, standalone mode, cacheable app shell, offline lightweight content, update-aware service worker.
- Browser install prompts where available; installation guidance elsewhere (notably iOS Safari).
- Responsive layouts, keyboard navigation, focus outlines, labelled controls and data charts, contrast/text-size/reduced-motion preferences, speech transcript and no forced autoplay.
- Automatic same-origin PDF delivery through the built-in reader, with no file-upload control, confidential feedback storage, login imitation or fictitious analytics.
- Share button and downloadable QR image use a third-party QR service **only for the current public app URL**, not user or report contents. This service must undergo the host organisation's privacy review before production.

## Architecture

- index.html — semantic application shell
- src/styles.css — design system and responsive layouts
- src/data.js — historical study data and citation indexes; single source of truth
- src/app.js — routes, source references, historical findings, educational interactions and guide
- src/reader.js, src/reader.css — PDF.js book viewer, optional sound, text-to-speech, mobile reading and accessible controls
- assets/guide.svg — animated cover-inspired concept character
- assets/icon.svg, icon-192.png, icon-512.png — application identity and installation icons
- manifest.webmanifest, sw.js — PWA setup
- docs/SOURCE_VERIFICATION.md — reconciliations and research-verification log
- docs/CHARACTER_AND_MEDIA.md — character/audio production and approval requirements
- qa/smoke.mjs — source invariants, syntax, PWA asset and privacy checks

Run automated checks: node qa/smoke.mjs

## Original publication not publicly hosted

The supplied 74-page PDF, sensitive participant comments and original interview records are not stored in this public repository. The app requests the authorised report at `docs/Internal_CSAT_Report_2025_Final.pdf`; without an approved, access-controlled same-origin copy, the reader displays an access notice and disables document/download controls. It never displays a file chooser. The source-derived aggregate dashboard remains a development preview and must not be described as a present-day performance assessment. All recommendation indicators are **proposed future outcomes**.

If the Ministry authorises public access, deploy the cleared publication at `docs/Internal_CSAT_Report_2025_Final.pdf` in the authorised hosting environment. If access is restricted, protect both the application and that same-origin document behind authenticated staff-only hosting; a public GitHub Pages site alone cannot provide confidentiality. Never commit the internal PDF to this public repository without explicit clearance. If access is restricted, use authenticated staff-only hosting instead of public static delivery.

See docs/SOURCE_VERIFICATION.md for identified discrepancies requiring the research team's review.

## Deployment and QA checkpoints

**Prior to external launch:** Ministry approval of the name, artwork, voice, research content, branding, acknowledgements, QR integration and privacy arrangements; reconciliation of research data; screen-reader, phone, tablet and desktop validation; PWA installation testing on real devices; publication access controls; final licensed lip-synchronised welcome video; appropriate monitoring/logging.

**Development credit:** [Beginning Concepts](https://beginningconcepts.org/) — original research remains attributable to the Ministry and its research team.

## Character-led guide (November 2026)

The headset-wearing woman on the study cover is the continuity character for the application, conversational assistant and planned video series. Her supplied portrait is now integrated into the homepage, floating assistant, source-grounded conversation and browser-narrated introduction. **This is not yet a generative AI chatbot, lip-synchronised video or approved character voice.** All answers still come from verified, static report summaries, and questions are not sent to a server.

The production continuity guide and proposed first five episodes are documented in [Character and Video Guide](docs/CHARACTER_AND_VIDEO_GUIDE.md). The optimised portrait inside the app is not an HD source master. The full report and confidential participant details remain excluded from public assets.

All development and commits take place directly on `main`. Earlier branches are historical snapshots only. Public deployment still requires Ministry clearance.
