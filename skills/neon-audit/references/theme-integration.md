# Theme integration details

Read only the section matching a change to fonts, mode ownership or installer conflicts. Reuse existing integration evidence; ordinary feature work does not require this file.

## Font loading

Colors-only never changes font loading. For typography changes, inspect the existing loader and use it for IBM Plex Sans Thai. Support self-hosted fonts when required by offline/CSP constraints; do not add a second loader alongside a working one.

Load weights used by affected typography. The current adapter uses 400/500/600/700; 600 is a hand-captured value, not a confirmed Finnomena font-weight mapping. Verify the actual generated theme and installed font assets before asserting provenance. A smaller set is appropriate when only those roles are used.

Check font resources and computed family, then inspect real Thai and Latin text at the target widths. Family declaration alone does not prove a Thai glyph loaded. Report unresolved fallback rather than declaring success from the CSS string. Typography expansion reuses assets but still needs application and wrapping checks.

## Theme-mode ownership

Identify whether the app uses an explicit toggle/state, OS preference only, or a single scheme. Adapt CSS selectors to its class/attribute. A stored explicit light choice must not be overridden by dark OS preference. Preserve OS-only behavior where already used; do not invent a new toggle or mode to satisfy verification.

Check existing/requested modes and relevant transitions.

## Installer conflicts

The installer preflights destination content before copying theme files and refuses to overwrite customization. Compare the canonical source (`theme/css/theme.css`, or the files under `theme/cds/` in an app already on CDS) with the actual destination. Merge only legitimate incoming changes while retaining local tokens, selectors and configuration. Ask a precise question only for an irreconcilable same-property conflict not resolved by the request.

Never delete customized files or modify the installer to bypass protection. A merged file retaining local additions still differs from canonical source; do not claim rerunning installation becomes a no-op. Finish the required file merges individually, verify resulting imports/dependencies, and rerun only operations whose preconditions are met.

If a copy fails after starting, inspect which files landed before retrying. Known content conflicts are preflighted; unexpected disk/I/O failures can leave partial writes and are not automatically rolled back.

## Worked conflict example

The app added a local accent while an incoming update corrects an unrelated semantic assignment. Apply the incoming correction and retain the local addition, then inspect the other theme files and dependencies. The customized result remains different from canonical content, so a whole installer rerun may still refuse it. If both changed the same assignment differently, show those actual values and the existing rationale when asking which to retain.
