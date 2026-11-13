---
scenarios:
  - request: Thai request for a deck to present the provident fund service to a client's HR, about eight slides, finished with no choosing
    observe: The run loads `neon-deck` from plain words, copies the template, draws the cover, closing and panels with the finno tools at the slot sizes, opens every slide and `?check`, and reports the files, the Candidates it picked, `finno.plexTypeface` and the Investment Content note.
  - request: "`$neon-deck` six-slide proposal with three supplied figures, asking to see cover options first"
    observe: The run draws one sheet of cover Candidates, shows the outline, asks for a number and builds nothing more; the supplied figures are not marked as sample figures.
---

# neon-deck

`neon-deck` builds a deck as one HTML file of 16:9 slides from `skills/neon-deck/assets/deck.html`, with the cover, the closing and the Pattern panels drawn by the finno tools. Three fresh-agent runs, each from its own empty directory, against the plugin packaged from this change. Requests, verbatim:

> ช่วยทำ deck นำเสนอของ Finnomena หน่อย จะเอาไปเสนอบริการกองทุนสำรองเลี้ยงชีพให้ฝ่าย HR ของบริษัทลูกค้า ประมาณ 8 สไลด์ ไม่ต้องให้เลือกแบบ ทำให้เสร็จเลย

> $neon-deck Proposal deck for a corporate client: Finnomena's employee investment plan. 6 slides. Our figures: 120 companies served, 85,000 members, 98% contribution on time. Show me cover options before you finalise.

November 2026, Claude Code 2.1.325, `claude-sonnet-5-5`. Each run was `claude -p` with `--plugin-dir` and `--add-dir` for the package, `--setting-sources project,local` and `--permission-mode dontAsk`, started directly because `run-claude-case.mjs` passes `--strict-mcp-config`, which keeps the plugin's own tool server from starting. Allowed: `Read Edit Write Glob Grep Skill`, `Bash` for `node`, `ls`, `pwd`, `cp`, `mkdir` and `cat`, the three finno tools and the browser tool (`browser-mcp.mjs`). The Thai request ran twice: once on the first draft of the skill with the Block snapshot before `d0b1460`, and once on the final package. The package holds no Trek font files, so the text on every cover and closing is in IBM Plex Sans Thai.

| Item | Thai deck, first draft | Thai deck, final | Proposal, cover options first |
| --- | --- | --- | --- |
| Loaded `neon-deck` | Yes, from plain words | Yes, from plain words | Yes |
| Engine calls | `options`; `candidates` and `render` for the cover, the closing, a panel and a strip | `options`; `candidates` and `render` for the cover and the closing; three `render` and one `candidates` for two panels | `options`, one `candidates` for the cover |
| Deck | 8 slides: cover, statement, list with panel, columns, table, steps with strip, next step, closing | 8 slides: cover, statement, list with panel, columns, table, two columns, list with panel, closing | Not built: asks for a cover number and shows the six-slide outline |
| Looked | Every slide in the browser; `?check` returned `[]` after one fix | Every slide; `deckCheck()` returned `[]` after one fix | Not reached |
| Report | Paths, how to present and print, Candidates, `finno.plexTypeface`, Investment Content on three slides, its own words flagged for checking | The same, and why it redrew a panel | The sheet's path, its picks, the outline, the Investment Content slide, the supplied figures kept without a sample note |
| Turns, cost | 42, $0.62 | 42, $0.52 | 8, $0.15 |
| Verdict | Pass | Pass | Pass |

The grader opened both decks at 1280 x 720 and ran `deckCheck()`: `[]` in each. Every image sits whole in its slot, no text lies over artwork, and the panels fall on two of six content slides in the final run, never two in a row. On the final package the cover and closing draw a few large blocks; the first draft's cover still drew the staircase the Block change removed.

What the first run found, and what changed:

- **The strip drew a staircase.** A 1920 x 240 px Pattern comes out as many small steps, which the guideline's deck does not have. The template and the skill now have one Pattern slot, the 720 x 1080 px panel.
- **A panel drawn straight from a seed can be dense.** In the final run the agent rendered a panel without Candidates, saw small crowded blocks and drew it again from a sheet. The skill now says to draw each panel with `candidates` and take the fewest, largest blocks; no run has exercised that wording.

Limits: one model, Claude Code only, one sample per case on the final package; no Codex, Cowork or Claude Desktop run. `cp` of the template was denied in both deck runs (its source is outside the case directory), so the agents wrote the deck from the template they had read; a copy was not exercised. No run printed a PDF, added a chart, or asked for a PowerPoint or a photo slide. The follow-up to the cover question was not run. The run directories sit inside the neon worktree, whose paths the agents could see. Evidence is in `.local/evals/neon-deck-1`, `neon-deck-2` and `neon-deck-3` (`run.jsonl`, the deck and its artwork).
