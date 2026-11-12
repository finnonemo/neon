# Neon

Neon distributes Finnomena's brand theme, Neon's components and the skills that apply them to employees' apps, and carries Block's engine so the same skills can draw Brand Artwork. New work is built on the Neon base; CDS is kept, frozen, for apps already on it.

The package and installing terms describe Neon itself. The employee work terms describe what employees bring and ask for.

## Language

### Package

**Neon root**:
The complete Neon package directory. Skills resolve every theme, starter and installer resource from it, never from the employee's app.
_Avoid_: plugin root, `CLAUDE_PLUGIN_ROOT`

**Canonical theme assets**:
The one source copy of the theme: the Neon registry's items and the CSS adapter. Every install takes from it. The frozen CDS theme files stay beside them for apps already on CDS.
_Avoid_: starter theme, theme copy

**Neon base**:
shadcn/ui on Tailwind with Radix primitives, carrying Neon's components tuned to match their Core Counterparts in theming, sizing and spacing. Behavior is Radix's unless it would be less accessible than Core specifies.
_Avoid_: shadcn (alone, which names the stock components), new starter

**Neon registry**:
The shadcn registry Neon publishes, pinned to each Neon release. Its items are the Neon base, Neon's components and layouts, the theme, the Immersive Themes and the Theme Briefs. Skills add Neon's item, never the stock shadcn one.
_Avoid_: component library, npm package

**Core**:
Finnomena's design system, "(v3) Components / Core": the components, their specs and the Theme tokens that Neon's look is matched to. Its web look is each component's `iOS=False` look at the Large text size.
_Avoid_: the DS, v3, Figma library

**Core snapshot**:
The compiled copy of Core that Neon carries, pinned to one Core commit. Skills and evals read Core only through it, since employees cannot reach Core's own repository.
_Avoid_: Core copy, DS export

**Counterpart**:
The Core component a Neon component is matched to and measured against, such as Divider for separator or Alert for alert-dialog. A Neon component whose Core doc is not yet approved keeps its earlier CDS tuning until it is, and says so. In the frozen CDS context, a CDS Counterpart is the CDS component an item was first tuned to.
_Avoid_: equivalent, twin

**Counterpart table**:
The list that names each Neon registry item's Counterpart, or says why it has none.
_Avoid_: mapping, counterparts file

**Role table**:
The list that names the Core Theme token each color role of the CSS adapter takes, in light and in dark, or says why a role has none.
_Avoid_: role mapping, color mapping

**Type role table**:
The list that names the Core text style each type role of the CSS adapter takes its size and line height from.
_Avoid_: type mapping, type scale mapping

**Supporting item**:
A Neon registry item that exists only for other Neon items to depend on, such as the toggle a toggle group is built from. It has no Counterpart of its own, is shaped to fit the items that use it, and is not listed as a component for employees to choose.
_Avoid_: internal component, helper component

**Block**:
Finnomena's Pattern builder, a separate product with its own repository and web app, where designers draw and review Patterns and Pages within the guideline.
_Avoid_: block (lower case, which in Block's own language is one rectangle of a Pattern), pattern builder

**Block engine**:
The part of Block that draws Patterns and Pages and refuses anything outside the guideline; the same engine runs in Block's web app and in Neon.
_Avoid_: core (Core is the design system), generator (one part of the engine)

**Block snapshot**:
The built copy of the Block engine that Neon carries, pinned to one Block commit, with the typeface it draws text in.
_Avoid_: Block copy, vendored Block

**finno**:
Neon as one command: it installs Neon into an employee's agent and gives that agent, or a person at a terminal, the Block engine's tools.
_Avoid_: Neon CLI, Installer (which puts theme assets into an app)

### Installing

**Installer**:
The part of Neon that puts canonical theme assets into a target project and, unless told to skip, installs the dependencies they need: the Neon registry for React apps, and the CSS-only script for everything else.
_Avoid_: setup script, install script

**Install mode**:
One of the things the installer can do: **New**, which starts an app from the Neon base in an empty directory; **Add**, which adds Neon registry items to an existing app; **CSS-only**, which adds only the CSS adapter; and **CDS**, frozen for apps already on CDS, which adds the CDS theme to an existing project.
_Avoid_: tier. Tier is the styling decision a skill makes. Install mode is what the installer does to carry it out.

**Starter assembly**:
Combining the frozen CDS starter with the CDS theme files to produce a complete, runnable CDS app. A new app starts from the Neon base in the Neon registry instead.
_Avoid_: scaffold copy, starter sync

**Preflight**:
The CSS-only script's guarantee that every check finishes before the first write, so a refused install leaves the target untouched.
_Avoid_: validation, dry run

**Package-manager evidence**:
The lockfiles and declared `packageManager` field found in the target or its parent directories, up to the repository root. The installer uses it to choose npm, pnpm, yarn or bun.
_Avoid_: project config

### Employee work

**Campaign Page**:
A public, story-led page such as a campaign, landing, event or recruiting page, built with an immersive layout.
_Avoid_: microsite, marketing page

**Back Office**:
An internal management screen built with a functional layout for scanning, comparing and acting on records.
_Avoid_: admin, dashboard (alone), internal tool

**Product Feature**:
New functionality added to a Finnomena product, built with a functional layout.
_Avoid_: new feature (alone), module

**Restyle**:
Bringing an existing app to Finnomena branding while keeping its framework, components and behavior.
_Avoid_: theming (alone), reskin

**Rebuild**:
Recreating an existing React app on the Neon base in a new directory, treating the original as the spec rather than as code to port.
_Avoid_: migration, port, component adoption (which adds Neon's components into the existing app instead)

**Tier**:
How far a skill's styling reaches: colors only, visual system (adds typography, spacing and radius) or components (the Finnomena theme plus Neon's components; CDS components in an app already on CDS).
_Avoid_: level, mode, install mode

**Composition**:
The arrangement and hierarchy of a screen, chosen independently of tier; preserved unless the employee explicitly asks to adapt it.
_Avoid_: layout change, redesign (alone)

**Immersive Theme**:
One of four on-brand color sets for a Campaign Page, taken from the Finnomena Guidelines' membership levels: Club (white canvas), Exclusive (yellow), Private (light grey) and Ultra (navy). Each fixes the canvas, text, its own 100/75/50/25 steps, an accent family's steps and the action; the guideline's secondary colors are available in all four. A page switches between them by one attribute.
_Avoid_: tier (a styling decision), palette, color mode

**Theme Brief**:
A style description in the Refero Styles format that Finnomena writes for one Immersive Theme, whose typeface and colors the theme fixes. It is where a Campaign Page starts when the employee brings no Reference Design.
_Avoid_: design file (names the file, not the concept), Reference Design, template

**Preset**:
A maintainer's reusable choice for one part of a Theme Brief: its occasion, its layout or its imagery. A Theme Brief combines one of each with an Immersive Theme.
_Avoid_: Tailwind preset, Reference Design (which an employee brings), template

**Brand Pattern**:
Finnomena background artwork made by Block's generator from a locked seed, placed in a section that a Theme Brief or the employee names.
_Avoid_: texture, background, Page (Block's full composition)

**Brand Pattern colourway**:
The one Immersive Theme color family (its palette, accent or support) whose steps a Brand Pattern and the block beneath it use.
_Avoid_: pattern palette, pattern color, secondary color

**Brand Artwork**:
A finished Finnomena picture drawn by the Block engine from an employee's request: a Pattern alone, or one Page with a headline and the logo, for an ad, a post or a cover. Unlike a Brand Pattern it is a file of its own, not part of an app's screen.
_Avoid_: block, image, graphic, Campaign Page (which is a web page)

**Candidate**:
One of the twelve Patterns the Block engine draws side by side from the same settings, for the employee to pick the one that becomes their Brand Artwork.
_Avoid_: option, variant, draft

### Reference designs

**Reference Design**:
An outside style description of another product, brought by the employee (for example from Refero Styles), that shapes a Campaign Page's look while Finnomena keeps ownership of its brand.
_Avoid_: template, theme, inspiration, Theme Brief (which Finnomena writes)

**Brand Contract**:
Finnomena's visual language and semantic color rules; wins over any Reference Design on every property it owns.
_Avoid_: design guide, style guide

**Brand Intensity**:
How much of a Reference Design survives on a Campaign Page: Finnomena-led (only its section structure), Blended (also its geometry and motion) or Reference-led (also its colors).
_Avoid_: strength, mix, Finnomena level

**Brand Floor**:
The Finnomena properties no Brand Intensity may remove: the Finnomena logo, Finnomena typeface, at least one identifiable Finnomena color, accessible contrast, and the absence of any source brand's logo, imagery, copy or product names.
_Avoid_: minimum branding, baseline

**Gradient Recipe**:
A named Finnomena gradient built only from palette steps, used on a Reference-led Campaign Page (an Immersive Theme uses none) instead of any Reference Design's own gradient colors; provisional until a design owner approves it.
_Avoid_: brand gradient, gradient token

### Readiness

**Brand-ready**:
Output whose UI matches the Brand Contract but still needs an engineer's review before real users rely on it.
_Avoid_: done, production-ready

**Ship-ready**:
Output an employee may deploy to real users without engineering review, once they finish its pre-launch checklist. Only a Campaign Page with no Investment Content, whose personal data goes only to an Approved Form Service, can be Ship-ready; failed or unverified checklist items are the employee's pre-launch to-dos, not a reason for Brand-ready.
_Avoid_: production-ready, live

**Investment Content**:
Anything on a page that mentions an investment product or its returns; it makes the page subject to compliance review before it can be shipped.
_Avoid_: financial content, product page

**Approved Form Service**:
A company service already cleared to receive personal data from public pages; the only place a Ship-ready page may send a form.
_Avoid_: backend, form endpoint

**Handoff Summary**:
The record that accompanies Brand-ready output to engineering, stating what is mocked, what needs wiring and what was not verified.
_Avoid_: notes, report
