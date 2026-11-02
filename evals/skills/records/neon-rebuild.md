---
scenarios:
  - request: Rebuild an existing React prototype on the Neon base
    observe: "The rebuild is a new app created with `install.mjs --new`; `grade-rebuild.mjs` passes its Neon base check: an `@neon` registry in `components.json`, no CDS package or import, and every file in `src/components/ui/` a Neon item without stock shadcn marks (`dark:` classes, a bare `cn` import, weight utilities). The CDS rebuild record's checks carry over."
---

# Neon rebuild

A rebuild targets the Neon base ([ADR 0006](../../../docs/adr/0006-new-work-on-shadcn-matched-to-cds.md)), so `grade-rebuild.mjs` now grades the rebuild against it. The request, fixtures and pass list of the [CDS rebuild](cds-rebuild.md) record carry over, except that the rebuild goes to `<app>-neon` and the CDS button and stylesheet items become the Neon base check below.

```sh
node evals/skills/grade-rebuild.mjs --source <case>/<app> --rebuild <case>/<app>-neon --shots <name>
```

The "Neon base and items only" item fails a rebuild that:

- has no `components.json`, or one with no `@neon` registry entry;
- depends on or imports a `@coinbase/cds-*` package;
- has a file in `src/components/ui/` that is not a Neon registry item;
- has a ui file with stock shadcn's marks: a `dark:` class, the bare `cn` import, or a weight utility such as `font-medium`.

A Neon item the app tuned passes; its content is the app's. Tailwind is no longer a leftover source library, since the base is built on it. The Neon registry's own stylesheets, byte-identical to this checkout's registry, are left out of the selector check, because they set `:root`, `body` and the theme attributes. The typecheck runs `tsc -b` when `tsconfig.json` only references other configs, as the base's does: `tsc --noEmit` on it checks nothing.

## Grader check, 2 November 2026

At `cad0322`, three copies of an app built by `scripts/smoke-new-app.mjs` from this checkout's registry were graded against a git-initialized copy of `fixtures/shadcn-v4-app` as the source:

| Rebuild | Neon base and items only | Other items |
| --- | --- | --- |
| As built (Neon base, `dialog` added, `button.tsx` tuned by the smoke) | pass | stylesheet, source UI library, typecheck, build, mock data pass |
| Plus `npx shadcn@4.23.0 add accordion` (stock, default registry) | FAIL: `accordion.tsx` is not a Neon item, imports the bare `cn`, uses `font-medium` | as built |
| Plus `@coinbase/cds-web` in `package.json` and a `@coinbase/cds-web/buttons` import | FAIL: both named | typecheck and build fail on the missing package |

Every copy fails "tests" only because the stand-in source has no test script; a real rebuild copies its source's tests. Before the change, the as-built copy failed the stylesheet item on the registry's `neon.css`, `theme.css` and Immersive Theme files, and the source UI library item on `tailwindcss`.

Limits: this checks the grader, not a skill run. No rebuild case has run on the Neon base yet, so the parity, browser and inventory items of the CDS rebuild record are unverified for it.
