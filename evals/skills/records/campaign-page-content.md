# Campaign Page content

November 2026, Codex 0.162.1, one sample per revision, `$neon-create` through `run-codex-case.mjs` into `./open-house` beside a `.gitkeep`-only workspace. Before is main at `97ad7b4`. After adds [campaign content](../../../skills/neon-create/references/campaign-content.md) (`60fa070`). The two cases ran at the same time. Request, verbatim:

> $neon-create Build a Finnomena recruiting event page in ./open-house. The event is "Finnomena Open House: Build with Us", for engineers, designers and data people who might join our team. It's on Saturday 28 November 2026, 13:00–17:00, at Finnomena HQ, Column Tower 22nd floor, Ratchadaphisek Road, Bangkok. Agenda: team talks, an office tour, portfolio reviews and 1:1 chats with hiring managers. People register on our careers site: https://www.finnomena.com/careers/open-house. Headline in Thai. Include a section with what our employees say about working here and a row of partner company logos.

Neither run checked the page in a browser: the before run reported no browser automation tool, and the after run's Chromium launch was blocked by the sandbox. The evaluator built each page and measured it in headless Chromium, light mode, at 375×812 and 1440×900. It counted each `h1`–`h3` line from its text-node rects, merging rects that overlap vertically, with IBM Plex Sans Thai confirmed as the computed font, and listed the text inside the first viewport. Element screenshots of the H1 and H2s matched the counts. A first count from distinct rect tops gave four lines for a two-line H2 with an inline `✳`, so the reference's counting example was changed to merge overlapping rects after the after run.

| Item | Before | After |
| --- | --- | --- |
| Skill files read | SKILL.md, INSTRUCTION.md, readiness, scaffold, CDS integration, verification | Same plus campaign content |
| Claim list in the report | None | Generated README table of seven claims, each with its supplied proof and section, including the two requested sections that had none; the final reply linked to it |
| Date and place on the first screen at 375 | Fail: time and "BANGKOK, TH" at 10px; the date is below the fold | Partial: on the first screen, not in large type; "28 พฤศจิกายน 2026" and "Finnomena HQ" at 15px, "Column Tower ชั้น 22" at 10px, against a 44px H1 |
| Headlines at most two rendered lines | Fail: H1 three lines at both widths; one H2 three lines at 375 | Pass: every heading at most two lines at both widths |
| No invented proof | Pass: an "Employee stories are coming here" note and four "Partner logo n" slots | Pass: a quote prefixed "ตัวอย่าง:", "ชื่อพนักงาน (ตัวอย่าง)" and four `[Partner logo n]` slots |
| Sample content as pre-launch to-dos | Pass: quotes and logos listed as failed items | Pass: listed with what replaces each |
| Readiness | Ship-ready, no deployment | Same |

Both pages had no horizontal overflow or console errors at either width. Generated apps, `grade.txt` and screenshots stay under `.local/evals/content-*`.

Limits: one sample each, Codex only, one viewport height per width and light mode only. Only `h1`–`h3` were counted, so display text outside headings, such as the before run's 122px "BUILD WITH US" and the after run's "HELLO, FUTURE TEAM.", was not checked. The before run already avoided invented proof, so this sample shows no difference on that item. The after run put date and place on the first screen but at 15px rather than in large type. No Reference Design was supplied, so mapping claims onto a reference's section order and a later Brand Intensity move were not exercised. Both runs added a `design-day-starter` entry to `/tmp`, and the after run also added `check-fee.cjs` and `neon-before.css`. These may belong to other sessions running at the same time, so they were left in place.
