# Neon workflow contract

Shared routing and handoff rules for implementation skills. Reuse a settled context; read this when routing or scope is unresolved, not on every follow-up.

## Resources

Resolve the Neon root two directories above the loaded skill's real directory (follow symlinks). References write that root as `<Neon root>`; substitute the resolved path, whether or not the host sets an environment variable for it. Resolve resources from the same complete package, not from the employee app's working directory. Missing required assets mean an incomplete installation; identify the missing path before setup.

## Scope precedence

Use the employee's explicit request, then established conversation/project instructions, then inspected app evidence. Generic CDS usage alone does not establish Finnomena branding. Carry confirmed intent and scope forward; ask only about a missing target or a material unresolved choice.

Treat three decisions separately: requested operation, visual surface, and implementation tier. Functional means restrained navy/white with indigo interaction highlights; immersive permits colorful Finnomena compositions. Neither implies changing framework.

For existing UI, omitted `composition` means `preserve`. Set `adapt` for explicitly requested layout or hierarchy changes. An ambiguous “make it Finnomena” request changes styling, not composition. Colors-only preserves fonts, spacing, radius and geometry. If instructions require both changing and preserving the same property, clarify that conflict before editing it. Presentation changes do not authorize changing routes, handlers, service contracts or data meaning.

## Routing

| Evidence/request | Next action |
| --- | --- |
| Review only | `neon-review`; no installation or implementation handoff |
| New React app, or new app without a named framework | `neon-create`; new-project path |
| Existing Finnomena CDS app, feature request | `neon-create`; reuse setup, start at the feature |
| App already on CDS (frozen), colors-only change to CDS components | `neon-create`; colors-only scope through CDS props, configuration or a scoped wrapper, not app stylesheet rules on the component |
| Explicit CSS-only restyle, or colors-only on CSS-styled UI | `neon-redesign`, even if CDS is a dependency |
| Existing non-React app | `neon-redesign` for styling; preserve framework |
| Explicit non-React new app | Use the framework's normal scaffold, then the CSS styling path; the Neon starter is React-only |
| Explicit rebuild of an existing React app on CDS | `neon-create`; rebuild path into a new directory |
| Campaign or landing page with a supplied reference design | `neon-create` for a new page, `neon-redesign` for an existing one; both apply the [reference design](reference-design.md) procedure |
| Explicit CDS adoption in React | `neon-create`; integration path |
| Target or integration choice remains unclear | `neon-audit`; inspect only missing evidence |

Direct calls perform only the preparation needed for their task. Existing theme files are reuse evidence, not an invitation to upgrade. Selecting an implementation skill does not require replacing already working theme/provider wiring. For non-React feature functionality, use the app's normal framework workflow and apply Neon through its CSS path.

## Handoff data

Keep this record in working conversation context, not a file in the employee app. Preserve existing fields and enum values; callers without the new optional fields remain valid.

```ts
type NeonContext = {
  brandConfirmed: boolean;
  operation: 'new-project' | 'new-screen' | 'restyle';
  projectRoot: string;
  targetPaths: string[];
  tier: 'colors' | 'visual-system' | 'cds';
  framework: 'react' | 'vue' | 'svelte' | 'other' | 'unknown';
  rendering: 'client' | 'ssr' | 'unknown';
  packageManager: 'npm' | 'pnpm' | 'yarn' | 'bun' | null;
  themeDir: string;
  styling: string[];
  darkMode: string;
  preserve: string[];
  verificationCommands: string[];
  surface?: 'functional' | 'immersive';
  composition?: 'preserve' | 'adapt';
  referenceDesign?: string;
  brandIntensity?: 'finnomena-led' | 'blended' | 'reference-led';
  workType?: 'campaign' | 'back-office' | 'product-feature';
  readiness?: 'ship-ready' | 'brand-ready';
};
```

`referenceDesign` and `brandIntensity` apply to campaign pages only. Decide `readiness` with [readiness and handoff](readiness.md) before reporting.

`tier`: `colors` changes colors only, through CSS color variables or, on CDS components, CDS configuration; `visual-system` also uses brand typography, spacing and radius; `cds` uses real CDS components and the Finnomena theme. Tier does not grant composition changes. Omit `surface` until known; do not guess it to fill a record. Unknown framework/rendering stays `unknown`; missing package manager stays `null`. Other unavailable evidence can remain empty with its uncertainty noted. Only investigate unknowns that affect the next action.

`preserve` carries protected behavior and local/global style conflicts. `targetPaths` includes relevant existing wiring; `verificationCommands` records discovered app checks. Reuse task, primary action and relevant states from the conversation without creating another mandatory schema. Theme-only integration uses `operation: 'restyle'` with `tier: 'cds'`; no new operation enum is required.
