# Neon

Neon lets Finnomena employees who are not designers or developers bring a project they vibe coded up to the company's brand, so it can be shipped as a campaign page, back office screen or product feature.

## Inputs

**Vibe-coded Project**:
An employee's existing project produced with an AI builder or coding assistant, typically React with Tailwind and shadcn/ui.
_Avoid_: prototype, employee app, user project

**Reference Design**:
An outside DESIGN.md describing another product's visual style, brought by the employee (for example from Refero Styles), used to shape a page's look while Finnomena keeps ownership of its brand.
_Avoid_: design.md (alone), template, theme

**Brand Contract**:
Finnomena's visual language and semantic color rules; wins over any Reference Design on every property it owns.
_Avoid_: design guide, FINNOMENA.md, style guide

**Brand Intensity**:
How much of a Reference Design survives on a Campaign Page: Finnomena-led (only its section structure), Blended (also its geometry and motion) or Reference-led (also its neutral surfaces).
_Avoid_: strength, mix, Finnomena level

**Brand Floor**:
The Finnomena properties no Brand Intensity may remove: the Finnomena logo, Finnomena typeface, Finnomena accent and action colors, accessible contrast, and the absence of any source brand's logo, imagery, copy or product names.
_Avoid_: minimum branding, baseline

**CDS Starter**:
The Finnomena-themed React starter built on Coinbase Design System components.
_Avoid_: Coinbase template, base, boilerplate

## Paths

**Restyle**:
Bringing a Vibe-coded Project to Finnomena branding while keeping its framework, components and behavior.
_Avoid_: theming (alone), แต่ง style, reskin

**Rebuild**:
Recreating a Vibe-coded Project on the CDS Starter, treating the original as a spec for content, flow and data shape rather than as code to port.
_Avoid_: migration, port, Full CDS (which installs CDS into the existing app instead)

**Theming tier**:
How deep a Restyle reaches: Colors only, Visual system (adds typography, spacing, radius) or Full CDS (Finnomena theme plus real CDS components).
_Avoid_: level, mode

**Composition**:
The arrangement and hierarchy of a screen, chosen independently of theming tier; preserved unless the employee explicitly asks to adapt it.
_Avoid_: layout change, redesign (alone)

## Work types

**Campaign Page**:
A public, story-led page such as a campaign or landing page, built with an immersive layout.
_Avoid_: microsite, marketing page

**Back Office**:
An internal management screen built with a functional layout for scanning, comparing and acting on records.
_Avoid_: admin, dashboard (alone), internal tool

**Product Feature**:
New functionality added to a Finnomena product, built with a functional layout.
_Avoid_: new feature (alone), module

## Readiness

**Brand-ready**:
Output whose UI matches the Brand Contract but still needs an engineer's review before real users rely on it.
_Avoid_: done, production-ready

**Ship-ready**:
Output an employee may deploy to real users without engineering review.
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
