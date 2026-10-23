# Readiness depends on work type, not on visual quality

Neon promises Ship-ready output only for Campaign Pages that carry no Investment Content and collect no personal data outside an approved company form service; Back Office screens, Product Features and every other Campaign Page stop at Brand-ready and leave with a Handoff Summary. When Investment Content is uncertain, the page is treated as having it. Matching the Brand Contract says nothing about real data, authentication, PDPA obligations or SEC Thailand rules on investment claims, so letting non-developers deploy everything themselves would turn a design tool into an unreviewed release path for regulated and data-bearing software.

## Considered Options

- **Everything Ship-ready**: rejected; back office and product work touch real records and auth, and product campaigns need compliance sign-off.
- **Nothing Ship-ready**: rejected; low-risk public pages (events, recruiting, education) are the clearest case where non-developers can ship alone, and blocking them removes most of the value.
