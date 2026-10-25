# Neon

Neon distributes Finnomena's brand theme, a CDS starter and the skills that apply them to employees' apps.

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
