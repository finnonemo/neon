# Core compiles the snapshot Neon carries, and holds the palette

[ADR 0009](0009-neon-matches-core-not-cds.md) had a Neon script compile the Core snapshot from Core's docs, and made Core's `theme.json` the source of Neon's token export. Three costs showed on 2026-11-14. Neon's compiler reads Core's docs by their headings and `> Status:` lines from outside Core's repository, while Core's repository compiles the same docs a second time for its screenflow Skill set. `theme/tokens/colors.json`, the 903 colour values every token resolves against, has no script behind it and has not changed since the first Neon; Core records only the 256 that a Theme token aliases. And a resync happens when a maintainer remembers: the pin was eight commits of Core's docs behind, one of which changed 13 `Chart/*` tokens, after ADR 0009 had found 64 of 111 names apart. So Core's repository now compiles the copy and records the whole palette, Neon carries both, and a pull request proposes each resync. Decided with the owner on 2026-11-14; Core's ADR 0017 records its side.

## Decisions

- **Core compiles; Neon carries.** Core's repository owns the script that compiles its approved docs into the form the web uses: no Figma node ids or keys, no `iOS=True` look, no Revision history, no Dynamic Type. `sync-core` runs that script from a Core checkout, as `sync-block` runs Block's bundle build, then records the Core commit and each file's hash. This amends ADR 0009's "A Neon script compiles it"; the rest of ADR 0009 stands.
- **Neon keeps the Counterpart table.** Core compiles every approved doc, and the snapshot carries them all, as it did. Which of them a registry item is matched to is still decided by `registry/core-counterparts.json`, which only Neon can know, and the sync writes `core/index.json` from it.
- **The palette comes from Core.** `theme/tokens/colors.json` becomes a file the sync writes from Core's record of the `Colors` library. The repository check refuses a hand edit to it, as for the snapshot. The Role tables, the Immersive Themes and the Theme Brief scripts keep reading it where they read it today.
- **The pin stays; a pull request proposes each resync.** When Core's or Block's `main` has moved past the pinned commit and the sync's output would change, a workflow opens a "Resync" pull request. A maintainer merges it, and nothing reaches employees before a release.
- **Colours for artwork are unchanged.** Block's Green at 75, 50 and 25 keeps the guideline's values ([ADR 0010](0010-neon-carries-blocks-engine-and-ships-as-finno.md)); Block now takes its other values from the same Core record (Block's ADR 0014).

## Considered Options

- **Keep compiling in Neon:** rejected. Two compilers read one set of docs, and a change to Core's doc format breaks Neon's without a failing check in Core.
- **Follow Core's `main` with no pin:** rejected. A token change can change contrast, and the registry is pinned per release tag so that an app's look moves only when it asks.
- **Carry the screenflow Skill set as it is:** still rejected, for ADR 0009's reason: it carries Figma placement and no sizing. The web form is a second output of Core's compiler, not the same output.

## Consequences

- A change to what the web form holds is a change in Core's repository. Neon asks for it there.
- The resync workflow crosses two accounts: `finnonemo/neon` is public, and `pawisssh/design-system` and `pawisssh/block` are private. Whichever side opens the pull request, the owner creates the credential it uses.
- Of the 903 values in `colors.json`, the 256 Core records today are equal by name and hex. The other 647 are compared on the first generated copy, and any that differ are reviewed before the merge.
- `scripts/lib/core-snapshot.mjs` keeps the copy, the hashes and the repository check, and loses the reading of Core's Markdown.
- A Core commit older than Core's compile script is compiled by a newer checkout's compiler, and the snapshot then records both commits.
- The decisions land one change at a time: the compile with this ADR, the palette and the resync workflow after it. Until its change lands, `theme/tokens/colors.json` stays a raw export and a maintainer starts each resync.
