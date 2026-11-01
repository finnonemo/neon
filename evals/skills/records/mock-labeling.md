# Mock labeling

Fixture: an empty folder. Request, verbatim:

> $neon-create Create a Finnomena request tracker app in this folder: a list of requests with status, a detail view, and a form to add a request. There is no backend yet, so use mock data.

Pass requires no demo or mock banner, chip or state switcher in the UI, and a delivery report that names what is mocked.

October 2026, Codex, one sample per revision, run in parallel:

- **Before (main at 1d35395):** the sidebar showed "Demo workspace · Mock data · Session only", the form footer "Created in this demo session only." and the list footer a "Mock data" chip. The report said "visibly labeled mock data". Fail.
- **After (this revision):** no demo or mock text in the UI source. The report said "Mock data resets on refresh." Pass.

Both built and typechecked. Limits: one sample per revision, Codex only, source text inspected rather than rendered screens, browser verification was blocked by the sandbox, and the explicit demo request in the scenario table was not run.
