# Owner review set

Eight requests the owner judges ✓/✗ on live builds: four functional screens and four Campaign Pages. They are the evidence for two skill changes the owner asked for on 2026-11-14:

- Functional screens get a detail checklist.
- Campaign Pages get the named scroll patterns of [ADR 0013](../../docs/adr/0013-campaign-pages-tell-a-story-with-named-scroll-patterns.md).

A **round** runs every request once on one package. The baseline round runs main's skills before either change. A later round runs the changed skills, and the owner judges it the same way. This set does not replace the contract checks in [Skill behavior scenarios](../skills/README.md). It is one reviewer's judgment, and it never feeds readiness.

## The requests

The prompts are verbatim in [cases.json](cases.json). Names are neutral (`review-01`…), so a page in the review never says which package built it. Every content fact the page needs is in the prompt. No request carries Investment Content, so content honesty and readiness do not confound the verdicts.

| Case | Request | What a later round should visibly change |
| --- | --- | --- |
| review-01 | Back Office approvals queue: filter, open, approve or reject with a reason | Real, uneven queue data. Loading, empty and error states. Status badges and the wait time on each row. Hover and press on rows. The selected request leads, not a grid of equal cards. |
| review-02 | Campaign Page, Club · Run Theme Brief: a fun run with a four-point route | The route told as a Pinned story or with a Progress rail. Last year's 1,200 and this year's 1,500 as Count-up figures. |
| review-03 | Product Feature home: portfolio value, holdings with a 30-day trend, orders, auto-invest | Uneven figures, not round numbers. A sparkline per fund. Pending-order states. A clear first-read for the total over equal tiles. |
| review-04 | Campaign Page, Exclusive theme: Finnomena's 15-year story in four steps | The four years as a Pinned story. The 300 people as a Count-up figure. |
| review-05 | Back Office KYC document review, from a slow or failing service | Loading, error and empty states. A status per document. A case history. Accept and request-again as press states. |
| review-06 | Campaign Page, Ultra · Run Theme Brief: a night run with a five-step evening | The evening's schedule with a Progress rail or as a Pinned story. The 400 places as a Count-up figure. |
| review-07 | Product Feature auto-invest plans: runs, pause, edit, new, no-plan state | The no-plan state. Failed and skipped runs shown apart. Small details on each run. Hover and press on the plan actions. |
| review-08 | Campaign Page, Private theme: a five-day learning week | The five days as a Pinned story or with a Progress rail. The 18, 12 and 40 as Count-up figures. |

## Running a round

Each round costs money. The owner agrees the budget first. Past records put a run that creates an app at about $3–7, so a round of eight comes to about $25–60.

1. Give the round a name with its package, such as `2026-11-baseline-4f523bf`. Keep the name out of what the owner sees: the page shows only the round name and the neutral case names.
2. Run the batch with the [run harness](../skills/README.md#run-harness). Put it under its own root, so a later round's `review-01` does not collide with this one:

   ```sh
   node evals/skills/run-claude-case.mjs --cases evals/review/cases.json --parallel 4 \
     --ref <commit> --serve-registry --root .local/review/<round>
   ```

   Run it with `run_in_background`, because a round passes the tool timeout.
   - **The registry.** `--serve-registry` serves this checkout's registry. For a baseline, run from a checkout at `<commit>` too, so the registry and the skills match.
   - **Check the first run.** Run `check-run.mjs` on the first finished run before trusting the rest. A void run is rerun, not judged.
3. Build and serve:

   ```sh
   node evals/review/review-server.mjs --round <round> --build
   ```

   - **The page.** It is at `http://localhost:5190/`. Each case's production build runs on its own port from 5191, shown in a 375px frame and a 1440px frame, and the page links to it full size. The owner judges motion on these live builds, not on screenshots.
   - **Reduced motion.** This page does not judge reduced motion. The [Motion safety](../skills/records/motion-safety.md) case does.
   - **Failed builds.** A build that fails is shown as not built and recorded under Limits.

## The owner's verdicts

- **Judging.** The owner gives each case ✓ or ✗, with the tags that name what is wrong and an optional note. A later click replaces the earlier one.
- **Tags.** The tags are the five functional items, then the Campaign Page complaints:
  - data not real
  - states missing
  - small details missing
  - no micro-interaction
  - unclear hierarchy or equal cards
  - no story
  - motion too restrained
  - a generic habit
  - looks like a fake website
  - broken at 375
- **Finishing a round.** The owner presses เสร็จเซ็ตนี้ on the page and says so in the chat.
- **What the agent then does:**
  1. Reads [verdicts.json](verdicts.json).
  2. Records the round below: the package, ✓ count, tags per case, notes, cost and limits.
  3. Commits both.
- **The agent never judges.** It never presses ✓ or ✗ on a round's page. To try the page it opens `review.html?sandbox`, which reads the verdicts and never writes them.
- **The record.** `verdicts.json` is tracked, and the agent commits it only after the owner finishes a round. Generated apps, run logs and builds stay under `.local/review/`.

## Limits

- **One sample per request.** Sample variation alone can move a verdict, as it did in [#277](https://github.com/finnonemo/neon/pull/277). Read a change between rounds by the tags across the set, not by one case flipping.
- **The judge knows the plan.** The owner knows which rounds are before and after the change. Neutral case names hide which package built a page only when a round mixes packages.

## Rounds

None yet.
