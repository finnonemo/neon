# Neon base

Read when building, styling or adding components in a new app, one already on the Neon base (its `components.json` names an `@neon` registry) or a shadcn app taking Neon items. An app already on CDS follows [CDS integration](cds-integration.md) instead. One app never mixes Neon items and CDS components.

## Add Neon items

Neon's components are items in the Neon registry pinned to this release. From the resolved Neon root:

```sh
node "<Neon root>/scripts/install.mjs" <app-dir> --add <item>...
```

It adds each `@neon/<item>` with its dependencies. If the app has no `@neon` registry entry, it adds one for this release. It keeps Neon files the app has already tuned and checks that every file landed. Never run `shadcn add` with a stock item or another registry, and never install CDS. Where no Neon item fits, compose Neon items and plain elements styled with Neon roles, and report the gap.

Items: `button`, `input`, `textarea`, `label`, `checkbox`, `avatar`, `tag`, `list-row`, `segmented-control`, `tooltip`, `sonner`, `popover`, `select`, `dropdown-menu`, `dialog`, `calendar`, `date-picker`, `table`, `separator`, `field`, `input-group`, plus `logo`, `layouts` and `immersive-themes`. Each imports from `@/components/ui/<item>`. Inspect the installed file for its exports and props instead of assuming stock shadcn's.

Use these Neon items in place of stock shadcn ones:

- `tag` in place of Badge.
- `segmented-control` (a radio group) in place of Tabs used as a filter.
- `list-row` rows in place of Cards for records and settings.

## What the base supplies

`AppRoot` sets the color scheme as `data-theme` on `<html>` from its `colorScheme` prop. It also holds the one `TooltipProvider` and `Toaster`, so screens add neither and the app uses no `next-themes`. The base also supplies:

- IBM Plex Sans Thai, loaded in `main.tsx`.
- The theme in `src/theme/`.
- Neon's `cn` in `@/lib/utils`.
- The [starter layouts](scaffold.md#starter-layouts) in `@/layout/`.
- `Logo`.
- `button`, `tooltip` and `sonner`.

## Styling

- **Type:** use Neon type roles as utilities: `text-display1`–`text-display3`, `text-title1`–`text-title4`, `text-headline`, `text-body`, `text-label1`, `text-label2`, `text-caption` and `text-legal`. Each role carries its own size, line height and weight. Add no `font-medium` or `font-bold` beside a role, and no stock size such as `text-sm`.
- **Color:** use Neon role utilities only:
  - surfaces and text: `bg-background`, `text-foreground`, `text-muted-foreground`, `bg-card`;
  - fills and lines: `bg-primary` with `text-primary-foreground`, `bg-secondary`, `border-border`, `ring-ring`;
  - status: `text-positive`, `text-warning`, `text-negative` and their `-wash` fills.

  Use no stock palette (`bg-blue-500`, `text-gray-600`) and no `dark:` class: roles switch with `data-theme`. Check a pair you introduce in both schemes.
- **Merging classes:** import `cn` from `@/lib/utils`, never from the bare `cn` package, which drops type roles when it merges classes.
- **Geometry:** use Tailwind's spacing scale and the theme's `rounded-sm`–`rounded-xl` for app layout. Preserve documented layout dimensions.
- **Components:** style them through their props, such as Button `variant` (`default`, `secondary`, `outline`, `ghost`, `destructive`, `link`) and `size`, and Tag `variant`. `className` on a component adds placement, width or wrapping, never its own colors or type. Give icon-only controls an `aria-label`.
- **Neon item files:** Neon owns these files. Edit one only when every use in the app needs the change, and report it as tuned.
- **App stylesheets:** hold only layout for elements the app renders itself, and every selector starts with an app class (`.fr-table th`). A bare `body`, `h1`, `button` or `*` rule fails this. The base's `index.css` and the theme files stay as installed.

## Check

Before reporting:

- Every file in `src/components/ui/` is a Neon item.
- No source imports `@coinbase/cds-*` or the bare `cn`.
- No `dark:` class or stock palette utility remains.
- Run the [source lint](../../neon-redesign/references/verification.md#shared-checklist) on the change.
- Name each `@neon/` item the work added in the Done report.
