---
scenarios:
  - request: Thai request for an Instagram story ad with given words, wanting to see several before choosing
    observe: The run loads `neon-block`, calls the finno tools `options` and `candidates`, and asks for a Candidate number; the follow-up pick calls `render` with that `set` and `pick` and reports the three files, the warning and the compliance note.
  - request: "`$neon-block` cover for a report, A4 portrait with a label, one result and no choosing, in a session with no tool server"
    observe: The run reaches the same tools through the command line, picks one Candidate and says which, writes the files in the working directory, and relays `finno.plexTypeface`.
  - request: Ten-slide Finnomena pitch deck with team photos on each slide
    observe: The run loads `neon-block`, says a deck and photos are outside this release, draws nothing, and offers the cover, headline and closing frames.
---

# neon-block

`neon-block` turns a spoken request into Brand Artwork through the finno tools (`options`, `candidates`, `render`), which the plugin starts as a local tool server and which the command line also exposes. Three fresh-agent cases, each from its own empty directory, against the plugin packaged from this change. Requests, verbatim:

> ทำภาพโฆษณา Finnomena สำหรับ IG story ข้อความว่า "ลงทุนทุกเดือน เริ่มต้น 500 บาท" ขอดูหลายแบบก่อนเลือก

> $neon-block Make a cover for our "2027 Annual Outlook" report, A4 portrait, label it REPORT. Just give me one, no need to choose.

> Make me a 10-slide Finnomena pitch deck for a new fund, with team photos on each slide.

November 2026, Claude Code 2.1.322, `claude-sonnet-5-5`, one sample per case after the fixes below. Each run was `claude -p` with `--plugin-dir` and `--add-dir` for the package, `--setting-sources project,local` and `--permission-mode dontAsk`, started directly because `run-claude-case.mjs` passes `--strict-mcp-config`, which keeps the plugin's own tool server from starting. Allowed: `Read Write Glob Grep Skill`, `Bash` for `node`, `ls` and `pwd`, and the three finno tools. Case 2 added an empty `--mcp-config` with `--strict-mcp-config`, so it had no tool server. The package holds no Trek font files, so every picture is in IBM Plex Sans Thai.

| Item | Story ad | Its follow-up | Report cover (no tool server) | Pitch deck |
| --- | --- | --- | --- | --- |
| Session start | Five `neon` skills listed, `plugin:neon:finno` connected, three tools | Resumed | Five skills, no tool server | Five skills, server connected |
| Loaded `neon-block` | Yes, from plain words | (same session) | Yes | Yes, after the description fix |
| Engine calls | `options`, then `candidates` twice (navy with yellow at Slope 75, white with navy at half) | `render` twice with `set` and `pick` 4 | `finno.mjs options`, `candidates`, `render` with `--set` and `--pick 10` | None |
| Result | Two numbered sheets by path, asks for a set and a number | The story in SVG, PNG and Document, new words, same Pattern | The cover in SVG, PNG and Document in the case directory | Refuses the deck and photos, offers cover, headline and closing frames, asks for the words |
| Warning and compliance | `finno.plexTypeface` in plain words; Investment Content | Both | Both | Investment Content |
| Verdict | Pass | Pass | Pass | Pass |

The grader opened the pictures: both sheets show twelve numbered Candidates with the Thai headline and its Highlight, the story keeps Candidate 4's Pattern with the new words, and the cover's headline, Highlight and label are whole. The follow-up changed the words ("1,000 บาท") and kept `set` and `pick`, as the skill says; its second `render` added a line break because the first wrapped "เริ่มต้น" across two lines.

What the first round found, and what changed:

- **Broken letters in the PNG.** The first cover's SVG was right, but its PNG drew "2027" as "Z Z7": Block's raster flattened only cubic curves, and IBM Plex's outlines are quadratic. The agent saw it in the preview, reported the cover as unusable and did not hand it over. Fixed in Block (`ff66fdc`) and the snapshot rebuilt; `finno.test.mjs` now rasterises a quadratic curve.
- **Files written into the package.** The first cover run changed into the Neon root to run the command, so the artwork landed there. The skill now says to run it from the employee's working directory, and the rerun did.
- **The deck request never reached the skill.** In the first run the agent loaded no skill and wrote a ten-slide HTML deck in a generic green with photo placeholders. The description now names a deck, proposal or presentation as a case whose cover and closing frames the skill draws, and the rerun loaded the skill and answered as above.

Limits: one sample per case and one model; Claude Code only, with no Codex, Cowork or Claude Desktop run; no Trek, so guideline-exact text was not exercised by an agent; the sheet reached the employee as a file path, since `claude -p` shows no image; nothing was placed in Figma or Slides; and the run directories sit inside the neon worktree, whose paths the agents could see. The deck case's first run had this computer's own slide tools on offer, which an employee's session may not. Evidence is in `.local/evals/neon-block-1`, `neon-block-2` and `neon-block-3` (`run.jsonl`, the follow-up's `run-2.jsonl`, and the artwork); the first-round transcripts were overwritten by the reruns.
