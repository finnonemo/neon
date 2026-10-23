# Neon

**Build features that feel like Finnomena — describe what you need, and let your AI coding assistant handle the UI.**

Neon is a set of four AI skills, Finnomena theme assets, and a React starter. The main journeys are create, redesign and review. Audit is an optional assessment when the target or integration approach is unclear. For React feature building, it uses real [Coinbase Design System](https://github.com/coinbase/cds) components through `@coinbase/cds-web`.

You can write your requests in Thai or English. You do not need to know component names or design token values to get started.

- **Functional screens:** Restrained, task-led simplicity, navy/white foundations, and indigo interaction highlights. Other colors communicate accents, status, support and illustration.
- **Immersive pages:** colorful Finnomena surfaces, expressive imagery and palette-based gradients are welcome when they support the story.

[Get started](#get-started) · [Example requests](#example-requests) · [Choose a skill](#choose-a-skill) · [Troubleshooting](#troubleshooting) · [Contributing](#contributing)

## Get started

### 1. Prepare your workspace

Use an AI coding assistant that supports skills and can read and edit your project files. For app creation, it also needs a terminal, Node.js and a package manager. Node.js 22 is the version used by this repository's CI. Browser or preview access lets the assistant inspect the finished UI.

Open the **app you want to work on** in your assistant. For a new app, specify a new, empty destination folder. The Neon repository itself contains the reusable tooling; it is not your employee app.

### 2. Install Neon

**Claude Code**

Run these commands inside Claude Code:

```text
/plugin marketplace add pawisssh/neon
/plugin install neon@finnomena-plugins
```

Open `/plugin` and confirm that `neon` is installed and enabled. If the current session does not pick it up, start a new session. For installation scopes and plugin management, see the [Claude Code installation guide](https://code.claude.com/docs/en/discover-plugins).

**Codex**

Run these commands:

```sh
codex plugin marketplace add pawisssh/neon
codex plugin add neon@finnomena-plugins
```

Start a new thread and confirm the four `neon-*` skills are available. Invoke one directly with `@neon-create`, `@neon-audit`, `@neon-redesign`, or `@neon-review`, or just describe your request naturally (mention Finnomena) and Codex will pick the matching skill.

To remove it later: `codex plugin remove neon`.

**Other skill-capable assistants**

Keep a complete checkout of this repository available:

```sh
git clone https://github.com/pawisssh/neon.git
```

Register the four folders under `skills/` using your assistant's supported skill-loading mechanism. Keep the checkout intact: these skills also need sibling `theme/`, `templates/` and `scripts/` resources. Copying a `SKILL.md` alone is insufficient.

If your assistant supports reading a skill directly, give it the absolute path to the relevant `SKILL.md` and your app's target directory. Automatic discovery varies by host; the repository checks do not verify host installation.

### 3. Ask for your first feature

Copy this into your assistant, replacing the feature details as needed:

```text
Build a Finnomena request tracker for our team in a new folder called
team-requests. Staff should be able to view requests, filter by status,
and open request details. Use mock data and clearly label the app as a demo.
Use Thai labels and make it work on mobile and desktop.
```

Neon guides the assistant to prepare the theme, build the requested content and interactions, and check the result. You should receive a feature you can try, with a summary of what was verified and what remains unfinished or mocked.

### 4. Refine the result

Once Finnomena branding is established for the app in the conversation, you can follow up naturally:

```text
Make the request list more compact and add an empty state when no results match.
```

You do not need to repeat “Finnomena” on every follow-up. For a fresh conversation, mention Finnomena or explicitly invoke a Neon skill to establish the intended branding.

## Example requests

### Add a feature to an existing app

```text
Add a Finnomena approvals screen to this app. Staff need to scan pending
requests, inspect details, and approve or reject a request. Reuse the existing
API, navigation, theme and providers. Include loading, empty and error states.
```

The assistant should add the feature in place and reuse working setup. It should not scaffold a replacement app.

### Build a colorful landing page

```text
Build a Finnomena landing page for our new employee learning program.
Use an immersive layout with colorful Finnomena illustrations and surfaces.
Include the program overview, benefits, schedule and a registration action.
Use the content provided below and mark any missing registration integration.
```

Immersive pages can be expressive. Functional controls and status feedback should remain clear and accessible.

### Start a landing page from a reference design

```text
ทำ landing page Finnomena สำหรับงานสัมมนาพนักงาน โดยใช้ DESIGN.md นี้เป็น
reference (แนบไฟล์) มีหัวข้อ กำหนดการ และปุ่มลงทะเบียนไปที่ลิงก์ที่ให้ไว้
```

Bring any outside DESIGN.md, for example from [Refero Styles](https://styles.refero.design). Neon starts at **Blended**: the reference's layout, spacing, radius and motion, with Finnomena colors, typeface and logo. Ask "ให้ดู finnomena มากขึ้น" or "make it closer to the reference" to move one step at a time between **Finnomena-led**, **Blended** and **Reference-led**. At every level the Finnomena logo, typeface, action colors and readable contrast stay, and nothing from the source brand (logo, imagery, copy, product names) is carried over. Brand Intensity applies to campaign and landing pages; back office screens and product features keep the standard Finnomena look.

### Restyle an existing screen without adopting CDS

```text
Apply Finnomena colors and typography to this Vue screen. Keep Vue,
the existing components, layout, routes and behavior. Do not install CDS.
```

This uses CSS theme variables while preserving the existing framework and component library.

### Change only one part of a page

```text
เปลี่ยนเฉพาะสี header ให้เป็น Finnomena โดยคงฟอนต์ layout และการทำงานเดิม
ส่วนอื่นของแอปไม่ต้องเปลี่ยน
```

A partial change stays local. Shared theme variables should not be changed in a way that unexpectedly restyles unrelated screens.

### Review without editing

```text
Review this Finnomena dashboard on mobile and desktop for brand consistency,
readability and keyboard accessibility. Report prioritized findings with
evidence and suggested fixes. Do not edit the app.
```

You can also provide a screenshot. A screenshot review covers the visible state; it cannot establish keyboard behavior or other screen sizes.

## Choose a skill

Start with the task: create a feature, redesign existing UI, or review the result. Natural-language requests can select the relevant skill through your assistant. To be explicit in Claude Code, use the commands below. You do not need to run all four in sequence.

| Skill / command | When to use it | What it does |
| --- | --- | --- |
| [`/neon:neon-create`](skills/neon-create/SKILL.md) | Build a feature, screen, component or new React app | Uses real CDS components and Finnomena tokens; reuses existing setup or prepares a new app |
| [`/neon:neon-audit`](skills/neon-audit/SKILL.md) | An existing app needs Finnomena branding, but the approach is unclear | Inspects the app without editing it, selects or clarifies the theming depth, then hands off |
| [`/neon:neon-redesign`](skills/neon-redesign/SKILL.md) | Change existing UI styling or explicitly requested composition without adopting CDS | Applies scoped CSS changes, supports requested layout/hierarchy adaptation, and preserves product behavior |
| [`/neon:neon-review`](skills/neon-review/SKILL.md) | Check existing UI or screenshots | Reports findings, evidence, suggested fixes and unavailable checks; review-only requests do not edit the app |

**Typical paths**

- New React app → `neon-create`.
- New feature in an already themed CDS app → `neon-create`, reusing the current setup.
- Existing app with unclear theming needs → `neon-audit` → `neon-create` or `neon-redesign`.
- Colors-only change → `neon-redesign`.
- Landing page from a reference DESIGN.md → `neon-create` for a new page, `neon-redesign` for an existing one.
- Move an existing vibe-coded project onto the starter → `neon-create` rebuild into a new folder.
- UI quality check → `neon-review`.

## Choose how much to change

When an existing app needs theming, Neon supports three levels:

| Level | What changes | CDS required? |
| --- | --- | --- |
| Colors only | Semantic color variables | No |
| Visual system | Colors, typography, spacing and radius within the agreed scope | No |
| Full CDS | Finnomena theme plus real CDS components | Yes; React |

Layout is a separate choice from these tiers. Existing composition is preserved by default. Ask explicitly to reorganize layout or hierarchy when you want that changed; an ambiguous “make it Finnomena” request changes styling. Even a composition redesign preserves framework, routes, handlers, services and data meaning.

```text
Reorganize this Finnomena Vue request page: place filters above results and
stack the controls on mobile. Keep the current theme, routes, filter handlers
and service contracts. Do not adopt CDS or add new product behavior.
```

Your explicit request takes priority. “Change only the colors” stays colors-only even if the app already has CDS installed. Vue, Svelte and other non-React apps use the CSS path; Neon does not silently convert them to React.

New apps default to the included Vite + React + TypeScript starter unless you explicitly request another framework. The starter itself does not scaffold other frameworks.

To move an existing project onto the starter instead of restyling it, ask for a **rebuild** and name a new folder. Neon treats the original as a spec for content, flow and data, recomposes each screen the Finnomena way, and leaves the original untouched.

## Help Neon understand your feature

A useful request includes:

| Detail | Example |
| --- | --- |
| Target | “In the existing employee portal” |
| User and task | “Managers need to review leave requests” |
| Content and actions | “Show employee, dates, reason, and approve/reject” |
| Data | “Use our existing API” or “Use clearly labeled mock data” |
| Constraints | “Keep navigation and authentication unchanged” |
| Language and layout | “Thai labels; functional layout; mobile and desktop” |

You do not have to specify everything. The assistant should infer routine choices from the app and ask only when missing information materially affects the outcome. Attach available designs, content or screenshots when they explain the intended result.

## What to expect from the result

Neon guides the assistant to:

- Build requested content and working UI interactions, beyond an empty themed shell.
- Use Finnomena tokens and appropriate semantic colors, with real CDS APIs for CDS work.
- Preserve existing routes, providers, services, customized themes and dark-mode ownership.
- Include relevant loading, empty, validation, error and success states.
- Check build/typecheck, narrow and wide layouts, Thai/English text and primary interactions when the environment supports them.
- Explain mock behavior, incomplete integrations and checks that could not be performed.
- Say whether the result is **Ship-ready** or **Brand-ready**. Only a campaign or landing page with no investment content, and no personal-data form outside an approved company form service, can be Ship-ready; you get a static build and a pre-launch checklist. Back office screens, product features and pages that mention investment products or returns are Brand-ready: they match the brand and come with a `NEON-HANDOFF.md` for engineering and compliance review.

Skills guide an AI assistant; they are not a runtime enforcement layer. Review the resulting app before relying on it. The current CDS color mapping is provisional, and some exported or inherited values still need design review. See the [design contract](skills/INSTRUCTION.md) for visual policy and mapping boundaries.

## Troubleshooting

| Problem | What to do |
| --- | --- |
| Neon does not activate | Confirm the plugin is enabled, mention Finnomena in the request, or explicitly invoke the matching skill. |
| The assistant cannot find theme or design files | Keep the full repository/package together and provide its absolute location. Individual skill folders are not self-contained distributions. |
| The result looks like default Coinbase styling | Ask the assistant to verify that `createNeonTheme()` is connected to the existing provider and the affected UI uses Finnomena tokens. |
| A theme file conflict stops installation | Ask the assistant to compare and merge the customized theme. Do not delete it merely to make installation proceed. |
| The UI is styled but actions are placeholders | Specify the expected action and service. Ask for real interaction handling or clearly labeled demo behavior. |
| The assistant cannot inspect the preview | Ask for the checks it completed and the exact local preview steps. Treat browser-dependent checks as unverified. |
| You want feedback before changes | Use `neon-review` and explicitly request review only. |

## For developers and maintainers

Employees using an installed plugin do not need these commands for normal feature requests.

Validate repository resources and packaging:

```sh
node --test evals/skills/*.test.mjs
node scripts/check-repository.mjs
```

The [CI workflow](.github/workflows/validate.yml) runs these checks on pull requests and pushes to `main`. They verify packaging behavior, skill metadata and resource links in source and a fresh bundle; they do not certify rendered UI quality.

To preview the starter, run from the Neon repository root and use a fresh destination:

```sh
node scripts/assemble-starter.mjs /tmp/neon-preview
cd /tmp/neon-preview
npm install
npm run build
npm run dev
```

Open the local URL printed by Vite. Assembly supplies the canonical theme; the tracked starter source is not a standalone runnable app until assembled.

To package the distributable resources into an empty destination:

```sh
node scripts/package-plugin.mjs /tmp/neon-distribution
```

Packaging does not publish a release. Full contribution, token update and release procedures live in [CONTRIBUTING.md](CONTRIBUTING.md); repository instructions for agents live in [AGENTS.md](AGENTS.md).

## Repository map

| Path | Purpose |
| --- | --- |
| [`.claude-plugin/`](.claude-plugin/) | Claude Code plugin manifest and self-hosted marketplace metadata |
| [`.codex-plugin/`](.codex-plugin/) | Codex plugin manifest, read by `codex plugin add` |
| [`skills/`](skills/) | Four skill entrypoints and their supporting references |
| [`skills/INSTRUCTION.md`](skills/INSTRUCTION.md) | Shared functional and immersive design direction |
| [`theme/`](theme/) | Exported tokens, CDS adapters and CSS theme |
| [`templates/vitejs-cds/`](templates/vitejs-cds/) | React starter source, layouts and Finnomena logo assets |
| [`scripts/`](scripts/) | Theme installation, starter assembly, packaging and resource checks |
| [`evals/skills/`](evals/skills/) | Skill scenarios and packaging regression checks |
| [`docs/`](docs/) | Maintainer documentation and historical plans |



## Contributing

Found a confusing instruction or an off-brand result? Include the request you used, the affected skill, expected behavior, and screenshots or reproduction steps where available. See [CONTRIBUTING.md](CONTRIBUTING.md) for the repository workflow.

## License

[MIT](LICENSE).
