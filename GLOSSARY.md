# Neon

Neon distributes Finnomena's brand theme, a CDS starter and the skills that apply them to employees' apps.

The package and installing terms describe Neon itself. The employee work terms describe what employees bring and ask for.

## Language

### Package

**Neon root**:
The complete Neon package directory. Skills resolve every theme, starter and installer resource from it, never from the employee's app.
_Avoid_: plugin root, `CLAUDE_PLUGIN_ROOT`

**Canonical theme assets**:
The one source copy of the CDS theme files and the CSS adapter. Every install and every starter assembly copies from it.
_Avoid_: starter theme, theme copy

### Installing

**Installer**:
The part of Neon that puts canonical theme assets into a target project and, unless told to skip, installs the dependencies they need.
_Avoid_: setup script, install script

**Install mode**:
One of three things the installer can do: **New**, which assembles the starter into an empty directory; **CDS**, which adds the CDS theme to an existing project; and **CSS-only**, which adds only the CSS adapter.
_Avoid_: tier. Tier is the styling decision a skill makes. Install mode is what the installer does to carry it out.

**Starter assembly**:
Combining the starter's source with the canonical theme assets to produce a complete, runnable app.
_Avoid_: scaffold copy, starter sync

**Preflight**:
The installer's guarantee that every check finishes before the first write, so a refused install leaves the target untouched.
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
Recreating an existing React app on CDS from the Neon starter in a new directory, treating the original as the spec rather than as code to port.
_Avoid_: migration, port, CDS adoption (which installs CDS into the existing app instead)

**Tier**:
How far a skill's styling reaches: colors only, visual system (adds typography, spacing and radius) or CDS (the Finnomena theme plus real CDS components).
_Avoid_: level, mode, install mode

**Composition**:
The arrangement and hierarchy of a screen, chosen independently of tier; preserved unless the employee explicitly asks to adapt it.
_Avoid_: layout change, redesign (alone)

### Reference designs

**Reference Design**:
An outside style description of another product, brought by the employee (for example from Refero Styles), that shapes a Campaign Page's look while Finnomena keeps ownership of its brand.
_Avoid_: template, theme, inspiration

**Brand Contract**:
Finnomena's visual language and semantic color rules; wins over any Reference Design on every property it owns.
_Avoid_: design guide, style guide

**Brand Intensity**:
How much of a Reference Design survives on a Campaign Page: Finnomena-led (only its section structure), Blended (also its geometry and motion) or Reference-led (also its colors).
_Avoid_: strength, mix, Finnomena level

**Brand Floor**:
The Finnomena properties no Brand Intensity may remove: the Finnomena logo, Finnomena typeface, at least one identifiable Finnomena color, accessible contrast, and the absence of any source brand's logo, imagery, copy or product names.
_Avoid_: minimum branding, baseline

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
