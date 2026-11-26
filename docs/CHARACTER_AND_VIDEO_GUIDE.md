# Service Excellence Guide — character and video production bible

**Status:** Development identity reference, pending MOHW review and approval. The image attached to the project conversation on 26 November 2026 is the visual master reference for the character. This repository currently includes an optimised portrait crop at `assets/guide-portrait.svg` and the earlier provisional full-body illustration at `assets/guide.svg`. The portrait crop is for the interface and **is not an HD video-production master**.

## Canonical character identity

- A friendly, professional Black Jamaican woman, with braided/cornrow hair, a warm smile, expressive eyes, small hoop earrings and a dark over-ear headset with a boom microphone.
- Pale grey-blue tailored blazer over a white blouse; confident, welcoming posture with arms opened toward the viewer.
- In wider scenes, contextualise the character with diverse Jamaican healthcare and public-service staff. Avoid implying those supporting characters are identifiable research participants.
- The character is the visual lead of the Service Excellence initiative: greeting the visitor, introducing findings, guiding report exploration and eventually presenting short animated explainers.
- The **same facial proportions, hairstyle, complexion, headset, blazer and voice identity** must be maintained across all assets and episodes. Do not replace the character with a generic or unrelated avatar.

## What is implemented

1. The reference-character portrait appears in the floating guide control, the chatbot dialogue, the welcome/narration panel, and a homepage introduction.
2. A report-grounded Q&A interface supports multiple messages, suggested questions and citations to original PDF pages. It is currently **rules-based**, **not connected to a generative AI endpoint**.
3. Browser text-to-speech narrates the first introduction on demand, with an accessible transcript and play, pause, restart, stop, volume and mute controls.
4. The animated full-figure SVG remains a provisional illustration and may not precisely reproduce the supplied image; the interface portrait is a faithful crop of the actual supplied character.
5. The avatar is available offline with the PWA shell. The full confidential PDF is never cached.

## Recommended video series

| Episode | Proposed title | Core story | Suggested duration |
| --- | --- | --- | --- |
| 01 | Welcome to Service Excellence in Action | Meet the guide, explain the 2025 historical study and invite exploration | 30–45 seconds |
| 02 | Understanding the 54% baseline | Present the overall 2025 result, explaining historical context and study limitations | 45–60 seconds |
| 03 | Five dimensions of service | Introduce each dimension and its documented 2025 score | 60–90 seconds |
| 04 | What we heard from staff | Explain the four aggregated focus-group themes without quoting or identifying individual staff | 45–60 seconds |
| 05 | From findings to action | Explain the Appendix 5 recommendations as **proposals**, not implemented outcomes | 60–90 seconds |

For each episode produce a landscape master (16:9), a mobile cut (9:16), a poster frame, WebVTT captions, a readable transcript, and a silent/poster fallback for users who disable motion or sound.

## Production and approval checklist

- Retain the *original image* in an approved media library. Do not rely on the 128px web portrait as the video master.
- Obtain permission for the character artwork and approval of visual likeness, narration script, Jamaican voice, accessibility and Ministry branding **before publication**.
- Prefer clear, warm Jamaican English with a professional service-oriented delivery; do not impersonate a specific real employee or fabricate a voice endorsement.
- Use source-verified statements. Keep 2025 study findings, 2026 report branding and future recommendations distinguishable. Cite exact PDF pages.
- Never expose raw focus-group comments, names, personal case information or the full internal report in a public video.
- Do not autoplay narration with sound. Provide subtitles and a transcript; allow users to pause or stop audio.
- Include a clear disclaimer when animated scenes are artistic or simulated rather than real Ministry events.

## Future integration

Store approved welcome video as `assets/video/guide-welcome.mp4` and its poster at `assets/video/guide-welcome-poster.webp` only when assets are actually delivered. The existing `Hear her introduction` action provides a working, accessible fallback until then. A later, Ministry-approved generative conversational backend must introduce consent, privacy controls, data minimisation, document-scoped retrieval, auditability and escalation to authorised staff. Never embed AI API keys or staff data in this static frontend.

**Workflow:** Develop on `render` → test visually and for accessibility → obtain content and media approvals → review PR → merge to `main`. A branch commit does not authorise public deployment.
