# Neon carries Block's engine and ships as finno

Employees ask for brand artwork (an ad, a post, a cover) as often as for an app, and Block, Finnomena's Pattern builder, already draws it within the guideline. Block's repository is private and under a personal account, and its planned hosted tool server was never built (Block ADR 0003; the research kept in `pawisssh/block` issue 66 found no server code on 2026-11-01). So Neon carries a built copy of Block's engine, the Block snapshot, and gains a skill, `neon-block`, that turns a spoken request into Brand Artwork. Neon as a whole is also published to npm, as the package `finnomena` whose command is `finno`: one package that is a command, a local tool server for agents, and its own installer, after the pattern of `rea-agents`. Decided with the owner on 2026-11-13.

## Decisions

- **Block stays the source; Neon carries a snapshot.** A Neon script builds the engine (`packages/core` of Block) into one readable bundle and records the Block commit it came from. The repository check refuses a hand edit to it, as for the Core snapshot. Block's web app, review pages, gallery, Advanced mode, verdicts and its PDF and PPTX exports stay in Block.
- **The snapshot is public.** Neon is public under MIT, so the engine's built code, its Pattern rules and its Reference Pattern masks become public with it. The owner accepted this.
- **Finnomena Trek does not ship; the snapshot carries IBM Plex Sans Thai.** The engine draws Page text as outlines, and Block's composition rules are measured on Finnomena Trek. Trek's licence (Fontcraft, "Exclusive for Finnomena") forbids distributing the font files without written permission, and Neon is public, so the files are not committed, packaged or published. Where an employee's computer holds them (`FINNO_FONTS_DIR`, or a maintainer's local `block/fonts/`), artwork is drawn in Trek; otherwise in IBM Plex Sans Thai through Block's own Plex shaper (Block ADR 0002), with a warning that the result is not final brand artwork. This was found while building, after the owner had agreed to ship Trek; shipping it waits for Fontcraft's written permission. Apps keep IBM Plex Sans Thai either way, and [ADR 0009](0009-neon-matches-core-not-cds.md)'s deferral of a web move to Trek stands.
- **The agent reads the request; the engine draws.** The agent chooses a Format, a Colourway, a Slope, a Page layout and the words, then calls the engine. Neon calls no model and needs no network to draw. The engine refuses a colour or typeface outside the guideline and never returns a Pattern that breaks the Pattern rules, so a wrong reading gives an on-brand picture of the wrong thing, not an off-brand one.
- **Three tools, one list.** `options` lists what may be chosen, `candidates` draws a Candidate set of twelve for the employee to pick from, and `render` writes the SVG, a PNG and the Document it was drawn from. The command line and the tool server expose the same three.
- **Local first.** The tool server runs on the employee's computer. It works in Claude Code, in Codex, in Cowork sessions that run on the computer, and in Claude Desktop once `finno setup` has registered it. Chat on claude.ai does not start local servers, so a hosted server from the same tool list is left for later.
- **First release scope.** A Pattern alone, or one Page in the `pattern`, `headline`, `cover` or `closing` layout, without photos, on Block's Reference set 3. Decks, proposals, photo layouts and drawing a Campaign Page's Brand Pattern through the engine come later.
- **Placing artwork elsewhere is the agent's job.** Neon builds no connector to Figma or Slides; the skill points the agent at the connectors the employee already has, as Block ADR 0001 decided.
- **One plugin.** `neon-block` and the tool server join the existing `neon` plugin. The four existing skills keep their names and behaviour, and the marketplace keeps pointing at the repository.
- **`finno setup`.** It shows its plan and waits for approval, keeps a backup of any configuration it changes, and checks the tools answer. For Claude Code and Codex it installs the plugin through the agent's own commands. For Claude Desktop it can only register the tool server; Desktop gets the skills when an organization Owner adds this repository as a synced marketplace, or from the packaged plugin `setup` produces.
- **Colours follow Block for artwork.** Twenty-six of Block's thirty-two colour values equal Neon tokens. Three differ by one step of rounding (Yellow, Blue and Purple at 50) and are brought into line. Green at 75, 50 and 25 differs from Neon's Green steps and keeps Block's values, which come from the guideline's Patterns; Neon's tokens come from Core and govern app screens.
- **The command is `finno`; the npm package is `finnomena`.** `neon` on npm belongs to the Neon database company, as does a family of `neon-` packages, so a `neon-` name risks confusion or a dispute that would break the install sentence employees are given. The package was to be `finno` too, but on 2026-11-13 npm refused that name as too similar to `pino` and `minio`, then refused `fena` as too similar to `lerna`, `eta` and `send`: a rule only a real publish tests, and one short names keep meeting. The owner chose the company's name over a scoped name, so the install sentence is `npx finnomena@latest setup`; the command, the tool server and the tools keep the name `finno`, and a package with one command is run by `npx` whatever the package is called.

## Considered Options

- **A hosted tool server first:** it reaches chat on claude.ai, but needs hosting, rate limits and an Owner to add the connector for every organization. Deferred, not rejected.
- **Publish the package from Block:** no second copy to sync, and Block's source stays private. Rejected by the owner in favour of one place employees install from.
- **A separate plugin for artwork:** keeps the tool server away from people who only build apps. Rejected so one install gives every skill.
- **Carry Block's TypeScript source:** rejected; two editable copies would drift.
- **Commit Finnomena Trek to the public repository:** every employee would get guideline-exact text with no setup. Not done without Fontcraft's written permission; until then Trek is read from the employee's computer.

## Consequences

- Neon gains a package manifest at its root and a release step that publishes to npm. Publishing stays a deliberate act by a maintainer.
- A change to Block's engine reaches employees only after the snapshot is rebuilt and Neon is released.
- The plugin must never grow a top-level directory named `bin`: chat and Cowork refuse a plugin that has one.
- An employee's computer needs Node 20.15 or later for the tools.
- Artwork drawn without the Trek files is on-brand in colour, Pattern and layout but not in typeface, and says so.
- Share links point at Block's web app, which today is on a personal Vercel address; the address is a setting.
