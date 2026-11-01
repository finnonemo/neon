---
scenarios:
  - request: Build a Finnomena request tracker
    observe: At 1440×900 the list (heading and at least three complete rows) and the add-request action are visible on load; a request's detail is reachable in one click.
  - request: Build a Back Office fee-report screen with mock data (first screen)
    observe: At 1440×900 the per-fund table shows its heading and at least three complete rows on load, with no summary band repeating totals the table carries.
---

# First screen

November 2026, Codex, rendered by the evaluator in headless Chromium at 1440×900; one sample per revision, two of the latest. The fixture and fee-report request are the ones in [Sample figures](sample-figures.md). The tracker request is the [mock labeling](mock-labeling.md) one, naming a new `request-tracker` folder for the same reason.

| Run | Requested block on load | Most frequent action | Main question stated |
| --- | --- | --- | --- |
| Tracker, before (`97ad7b4`) | List heading, 3 complete rows, detail beside | "New request" under the page title | No |
| Tracker, after (first wording) | List heading, 4 complete rows, detail beside | "New request" in the title row | No |
| Fee report, before (`97ad7b4`) | "Fund breakdown" heading at 704px; no complete fund row, under a KPI strip and a fee-type band | "Export CSV" in the title row | No |
| Fee report, after (first wording, "first rows") | Fund table heading at 630px; 1 complete row, under the same two bands | "Export CSV" in the title row | No |
| Fee report, after (second wording, "three complete rows") | Fund table heading at 627px; 1 complete row, under the same two bands | "Export CSV" in the title row | Yes, totals and change answer it |
| Fee report, after (this revision, "no band when the list carries the totals"), sample 1 | Table heading at 456px; all 6 fund rows complete (last ends at 875px); no summary band, fee types as columns; total footer row cut at the fold (ends 934px) | "Export CSV" in the title row | Yes |
| Fee report, after (this revision), sample 2 | Table heading at 417px; all 6 fund rows complete (last ends at 846px); no summary band, fee types as columns; total footer row ends at 908px, its text visible | "Export CSV" in the table's title row | Yes |

The tracker request does not tell the revisions apart: both pass. On the fee report, the first two wordings did not change the layout: both runs read the rule, could not render (the Chromium launch was blocked in the sandbox) and built a separate fee-type band, reading "per fund and fee type" as naming it. This revision says that when the list already carries the totals and the named breakdown as columns, no summary band goes above it. Both samples then dropped the KPI strip and the fee-type band, put fee types in columns and totals in a footer row, and passed. Both still could not render; each stated the main question and reported the rendered check as unverified. In sample 1 the grand-total footer row is cut at the fold, which the rule allows: it asks for three complete rows.

Review, same fixture: the baseline fee build plus its 1440×900 screenshot, `$neon-review Review our Finnomena fee report screen for usability. fee-report-1440x900.png is how it looks on load at 1440x900. Do not edit anything.` Before and after both reported "fund details below the fold" as Medium, citing the 1440×900 screenshot, and changed no files. The revised run ranked it first. That is no measurable difference.

Limits: Codex only, two samples of this revision and one of each earlier one, and no run could open a browser. The rule's example breakdown ("per fee type") matches this request, so the pass may partly reflect that wording; a request with a different breakdown was not run. The review runs used the second wording, not this one. The `composition: 'preserve'` caveat was not exercised. A summary the request asks for is exempt and kept, compact; no request asked for one, so the exemption was not exercised.
