---
scenarios:
  - request: Finnomena event page and Back Office approvals screen, baseline against revised skills (blind)
    observe: A judge who cannot tell the packages apart prefers one output per pair, or neither, at 375px and 1440px and names problems with the Look and fix questions and habits table; no numeric score; never feeds readiness.
---

# Output quality (blind)

The other sections check that a skill follows its contract. This one asks whether a skill change made the output look and work better, as a blind reviewer judgment. It compares two packages, such as main and a revision, on the same two requests, with a judge who sees only screenshots under neutral names. It records preferences and named problems, never a numeric score or rating scale, and the result never feeds readiness, which follows work type ([ADR 0002](../../../docs/adr/0002-readiness-by-work-type.md)).

## Requests

Each sample starts in its own empty folder, a fresh git repository outside the Neon checkout, so no `AGENTS.md` or other package sits above it. The only per-run text is the trailing port sentence. Verbatim:

> /neon:neon-create Build a Finnomena event page in ./event. The event is "Finnomena Data Night: เบื้องหลังเครื่องมือข้อมูล", an evening meetup for engineers, analysts and designers about how our team builds data tools. It's on Thursday 10 December 2026, 18:30–21:00, at Finnomena HQ, Column Tower 22nd floor, Ratchadaphisek Road, Bangkok. Agenda: three short talks by our data team, a live demo of our internal dashboards, then networking with food and drinks. Registration is on https://example.com/data-night. Headline in Thai. Use port &lt;port&gt; for any dev or preview server.

> /neon:neon-create Build a Finnomena Back Office approvals screen in ./approvals with mock data. Operations staff review pending customer requests (fund switches, redemptions over the daily limit and KYC updates), open one to see its details, then approve it, or reject it with a reason. Use port &lt;port&gt; for any dev or preview server.

The event page is a Finnomena-led Campaign Page: no Reference Design is attached, so the dial does not apply and the page is Finnomena's own. All of its content is supplied and it has no form or Investment Content, so content honesty and readiness do not confound the comparison.

## Samples and screenshots

Run three samples of each request per package, twelve runs in a round, on the agent's browser tool where it has one and the same permissions for every run. Name each run's folder neutrally, such as `56-run-07`, with the package mapping kept elsewhere, since the agent sees its own path. Use the [run harness](../README.md#run-harness) note and allowlist for every run, since agents otherwise read one denied command as the whole shell being blocked. A denial voids a sample only when it stopped the run building its output or looking at it; record every denied command either way. Cap each run's wall-clock time. A run killed at the cap keeps its output for judging and is recorded as killed, without a report.

The evaluator, not the agent, builds each output, serves its production build and screenshots it in light mode in its loaded state, with nothing clicked, at 375×812 and 1440×900: the first screen at each size, then the full page after scrolling through it so scroll-triggered reveals run. Every output gets the same procedure, so an approvals screen is judged as it first opens. Record any output that does not build, and judge what renders.

## Blinding

Pair baseline sample *n* with revised sample *n* for each request, giving six pairs. For each pair, randomly assign one output to side A and the other to side B, then shuffle the pair order. Copy the screenshots into a judge folder as `pair-<n>/<A|B>-<width>-<first|full>.png`, with the same modification time, and write the key (pair, side, package, sample) to a folder the judge never reads. Before judging, check that no screenshot names its package, revision or run.

## Judge

A fresh `claude -p` process with no transcript context, whose working directory is the judge folder and whose only tools are `Read` and `Glob`. The folder also holds a rubric file with the text of:

- the [Look and fix](../../../skills/neon-redesign/references/verification.md#look-and-fix) critique questions;
- the [functional screen habits](../../../skills/neon-review/references/review-checks.md#functional-screen-habits) table, applied to the approvals pairs only, since the event page is immersive;
- the [color roles](../../../skills/INSTRUCTION.md#color-roles) and [one question, first screen](../../../skills/neon-create/references/new-ui-workflow.md#one-question-first-screen) passages those questions link to.

For each pair the judge states a preference for A, B or neither, the reason in a sentence or two, and named problems for each side, each with its width and screenshot. It gives no number, score or rating. Save its answer before unblinding.

## Recording

Unblind with the key and record per pair: the preferred package or none, the judge's reason, and the named problems per output. Tally preferences per request as counts of pairs ("revised preferred in two of three pairs"), not percentages. Label the result as one reviewer's judgment. Under Limits, record the agent and version, the judge's model, samples, widths, color modes, states, permissions, ports, and every void, killed or unbuilt run.

Generated apps, run logs, screenshots, the key and the judge's answer stay under `.local/evals/`; only this protocol and its recorded results are tracked.

## November 2026 round

Baseline is the main package at `6c0a1f6`. Revised is the integration tip at `1b7e7c6`, which adds Look and fix (#53), the functional screen habits table (#54), the probe runner (#58) and the source lint (#57). Claude Code 2.1.316, `claude -p --model claude-opus-5-5 --setting-sources project,local --plugin-dir <package> --add-dir <package> --mcp-config <browser> --strict-mcp-config --permission-mode dontAsk --allowedTools <list> --append-system-prompt <note>`, with the evaluator's browser tool from [Browser probe in verification](browser-probe-in-verification.md). At most three runs went at once on ports 5601–5603, under a 45-minute cap. The judge was `claude -p --model claude-opus-5-5 --setting-sources local --tools Read,Glob --strict-mcp-config --permission-mode dontAsk` in the judge folder. It made one Glob and 55 Reads, all inside that folder, with no denials.

| Pair | Request, sample | Preferred | Judge's reason, shortened |
| --- | --- | --- | --- |
| 1 | Event, 1 | Revised | Date, venue and one register action in one hero column, and a numbered agenda; the baseline repeats date and venue, misaligns blocks and breaks a Thai word |
| 2 | Event, 3 | Revised | A strong headline and a date, time and venue row at both widths; the baseline shrinks the headline at 375, uses light section headings and breaks Thai words |
| 6 | Event, 2 | Revised | Thai wraps cleanly and sections follow one structure; the baseline breaks Thai words and mixes heading weights |
| 3 | Approvals, 1 | Baseline | Opens with a request selected, so details and Approve/Reject are on the first screen; the revised output leaves the right half as an empty "select a request" pane |
| 5 | Approvals, 2 | Revised | Opens with a request selected, with the review reason and actions on the first screen; the baseline shows an empty detail pane |
| 4 | Approvals, 3 | Revised | Both leave the detail pane empty; the revised list right-aligns amounts and due times and names the overdue item in words |

Pair numbers are the judge's, from the shuffled order; rows are grouped by request. Revised was preferred in three of three event pairs and two of three approvals pairs. In the one approvals pair the baseline won, the revised run was killed at the cap with no report. Each output had problems the judge named in both arms:

- Thai words broken across lines, such as `เครื่อง / ดื่ม`, in four of the six event pages: three baseline (two at 1440px, two at 375px; one at both) and one revised (375px).
- On load at 1440px, an empty detail pane beside the list in four approvals outputs, two from each arm.
- At 375px, five of the six approvals outputs, three baseline and two revised, put a "View details" button above the page heading; the judge noted no logo or page context in three of them.
- At 1440px, figures left-aligned in proportional digits, named as a functional screen habit, in two baseline outputs and one revised.
- At 1440px, light-weight section headings or a pale closing register button in two baseline and one revised event page.

| Run | Request, arm and sample | Denied commands | Agent's own browser screenshots | Report lines naming Look and fix | Readiness reported |
| --- | --- | --- | --- | --- | --- |
| `56-run-01` | Event, baseline 1 | 0 | 5 | 0 | Ship-ready |
| `56-run-05` | Event, baseline 2 | 0 | 4 | 0 | Ship-ready |
| `56-run-09` | Event, baseline 3 | 1: a `cp` from the package | 7 | 0 | Ship-ready |
| `56-run-04` | Event, revised 1 | 1: a compound `cd …; grep … \| head` | 7 | 0 | Ship-ready |
| `56-run-08` | Event, revised 2 | 0 | 9 | 1 | Ship-ready |
| `56-run-12` | Event, revised 3 | 1: an `ls` above the workspace | 7 | 3 | Ship-ready |
| `56-run-03` | Approvals, baseline 1 | 2: a `for` loop, a `sed -i` | 9 | 0 | Brand-ready |
| `56-run-07` | Approvals, baseline 2 | 1: a compound `cd … && grep -v` | 11 | 0 | Brand-ready |
| `56-run-11` | Approvals, baseline 3 | 1: a `head` of a package file | 6 | 0 | Brand-ready |
| `56-run-02` | Approvals, revised 1 | 1: a `for` loop | 2 | None: killed at the cap during a browser `evaluate` that never returned | None |
| `56-run-06` | Approvals, revised 2 | 1: a variable assignment | 19 | 3 | Brand-ready |
| `56-run-10` | Approvals, revised 3 | 1: a compound `cd … && ls` | 10 | 1 | Brand-ready |

Every run built its app and screenshotted it in the browser, and every output built for the evaluator with no sideways scroll at either width. No denial stopped a run building or looking, so none is void under this section's rule.

Limits: one round of three samples per request and package, one judge, and Claude Code only, with the judge on the same model as the agents. Six pairs carry no statistical weight; read the result as one reviewer's judgment. Light mode only, and the loaded state only. Nothing was clicked, so approvals detail views, the reject flow, empty and error states, and the 375px detail route were not judged. Designs that open with a request selected were favored. The approvals screens scroll inside their panels, so their full-page shots equal their first screens. The rubric is the revised package's own checklist, which the baseline runs never saw, so the judgment partly measures following instructions only one arm received. The revised package also carries #57 and #58, so a preference cannot be credited to Look and fix or the habits table alone. The evaluator checked only one of the judge's claims, the empty pane in pair 3.

Every run got this harness note, verbatim: "Shell permissions in this session: Bash is allowed for commands that start with one of: ls pwd cd cat head tail wc grep find echo test sed rg sort which curl lsof kill sleep mkdir cp node npm npx sips file python3, npm run, git status, git log, git diff, git ls-files, git rev-parse, git show, git branch. A denied command blocks only that command; the shell stays available for allowed commands. Variable assignments, loops and $(...) substitutions are always denied, so run each command on its own, with literal paths." Earlier sections ran without it, so their runs are not comparable on this point. Allowlist: `Read Edit Write Glob Grep Skill`, the five `mcp__browser__*` tools, and `Bash(…:*)` for those prefixes. Bash was never unrestricted. The orchestrator's rule voids any sample with a denial. This round voids a sample only when a denial stopped it building or looking, since no prefix allowlist covers assignments and loops; ten of the twelve runs had one or two denials.

A first round of seven runs had no harness note and is void (`56-void-01`…`07`). Each opened with a compound `ls …; B=<package>; ls $B`, was denied, and then treated the whole shell as blocked. Three baseline runs finished with source only, saying the shell was blocked. Three more, from both arms, were stopped mid-run with no install, build or screenshot. Only `56-void-01`, a revised event run, recovered, and its folder name revealed its arm. When a run left its dev server up after reporting, the server was killed so `claude -p` could exit, and some runs then wrote a one-line follow-up saying the server had stopped.

Evidence is in `.local/evals/`: run logs, prompts, harness notes, app sources without dependencies or builds, and the evaluator's screenshots, in `56-run-01`…`12` and `56-void-01`…`07`; the judge folder and its answer in `56-judge`; the key in `56-key`; and scripts, the rubric, the run map and the summary in `56-tools`.
