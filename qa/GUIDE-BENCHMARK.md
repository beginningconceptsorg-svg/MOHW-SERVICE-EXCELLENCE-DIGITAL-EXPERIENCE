# Service Excellence Guide — acceptance benchmark

Run `node qa/guide-benchmark.mjs` from repository root. The separate existing `node qa/smoke.mjs` suite remains mandatory. Both run in GitHub Actions on pushes and pull requests to main.

## Coverage

| Category | Cases |
|---|---:|
| Report facts | 400 |
| Language variation | 350 |
| Multi-turn context | 300 |
| Statistical analysis | 250 |
| Workplace reasoning | 200 |
| Executive assistance | 150 |
| Corrections and ambiguity | 100 |
| Voice and pronunciation | 100 |
| Learning and coaching | 100 |
| Confidentiality and evidence boundaries | 50 |
| Total | 2000 |

A case is a distinct question, conversational sequence or mocked speech operation; it counts once even when several conditions are checked. The benchmark checks evidence pages, canonical entity context and numerical content where applicable. Table 2 and Table 3 values and Appendix 5 workstream expectations are manually specified independently of the application data object. Voice tests exercise text formatting and simulated recognition, not real audio or microphones. Quiz tests cover 100 distinct full answer paths. This is a deterministic acceptance benchmark, not a measurement of general intelligence, independent external validation, or a guarantee against all possible language variants.

The first iteration passed 1,954/2,000. The final iteration corrected trailing punctuation in entity recognition, plural submission wording and the fixture's optional comma in the official Policy, Planning and Development title. No failing case was removed. The final iteration passed 2000/2000 plus 156 previously exercised chatbot assertions in the local JavaScript harness. GitHub CI also runs asset, reader and syntax checks.
