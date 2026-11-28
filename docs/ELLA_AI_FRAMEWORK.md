# Ella — AI.docx pilot

Development preview; name requested by owner, not formal Ministry approval. Character, report, speech and local retrieval preserved. The reusable wrapper and tenant manifest are src/bc-ambassador.js and src/ambassador-config.js. Local answers and navigation first; existing optional on-device retrieval remains automatic. The cloud adapter is disabled and unconfigured. It requires approval, public classification, consent and an exact endpoint before sending a bounded question, tenant and version. It never sends report text or history. Only local-verified answers can be returned after a cloud rewrite. Browser filters are not a security boundary.

## Central onboarding gates
No Cloudflare account access, plan/usage verification, tenant registry, authentication, rate limiting, atomic quotas, or actual inference was available. Do not point Ella at the legacy gia-ai endpoint. Audit/export the Worker, pilot the central service on public Beginning Concepts material, verify free billing and atomic account/tenant limits, abuse protection, isolation and privacy, then obtain Ministry approval. No billing changes or cloud traffic in this pilot. Consent is false by default even if the configuration is changed; production onboarding must implement the actual consent and server enforcement.

## Publication governance
The current Git tree contains docs/Internal_CSAT_Report_2025_Final.pdf although README and SOURCE_VERIFICATION.md describe it as excluded. The reader has been preserved as requested; verify distribution approval or move restricted content to controlled hosting before public rollout. A new deletion would not remove Git history. No new report copies were added. Review official sources, naming, voice and accessibility approvals.

## Testing and rollback
Run node qa/ambassador.mjs plus existing CI. New checks use the real local logic and mock cloud transport; real remote inference, browser navigation and physical device checks are not verified by these tests. Revert the pilot commit if needed. Cloud is off by default.
