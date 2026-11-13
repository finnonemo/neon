---
scenarios:
  - request: Build a Finnomena Back Office screen for one advisor with three groups of content (contact and licences, meetings against target, clients)
    observe: No card wraps a group and no on-page region has a shadow; no file under the shell's layout folder is edited; the sidebar holds no record list; the report names the layout the screen takes and why.
  - request: Build the same screen for a team lead who first picks one of eight advisors
    observe: The advisors are listed in content, never in the sidebar; picking one opens that advisor's detail, as a list page and a detail page or a layout's list and detail panes; no shell file is edited.
---

# Shell and containers

November 2026. The contract now states the app's shell as fixed, puts containers last when grouping, and says the sidebar is the app's menu ([ADR 0011](../../../docs/adr/0011-a-functional-screen-has-four-layers-each-with-one-source.md)). One sample per row with `run-claude-case.mjs` and `claude-opus-5-5`, each building a new app in an empty folder.

| Case | Ref | Cost (USD) | Turns | Minutes | Denied commands |
| --- | --- | --- | --- | --- | --- |
| One advisor | baseline `fd6e2e9` | 2.70 | 79 | 8.6 | 0 |
| One advisor | `9fd0167` (shell fixed, containers last) | 2.79 | 93 | 8.1 | 1 |
| One advisor | `67bd78e` (adds the sidebar rule) | 3.10 | 91 | 10.7 | 0 |
| Pick from a team | `67bd78e` | 2.85 | 76 | 8.5 | 3 |

A first run at `9fd0167` ended its turn while the scaffold installed (22 turns) and is not counted.

**Containers: no difference.** None of the four builds wraps a group in a card or puts a shadow on a region; groups are separated by space and hairlines. The baseline does the same, so this scenario does not show what the containers wording changed.

**Shell fixed: broken once, before the sidebar rule.** The `9fd0167` run added a `toolbar` prop to `SimpleLayout.tsx` and put a list of advisors in the sidebar, though the request named one advisor. The two runs at `67bd78e` changed no file under `src/layout/`. The baseline changed none either.

**Sidebar is the menu: met at `67bd78e`.** The one-advisor run left the sidebar without a record list and built in `ContentLayout`. The team run passed `sidebar={null}` and an empty navigation, listed the eight advisors in a list pane with the detail beside it, and shows them as two views with a "Back to team" link only on narrow screens. That is the contract's second form (a layout's list and detail panes), not two pages.

**Report names the layout: only with the change.** The baseline report does not say why it took `ContentLayout`; the `67bd78e` runs name the layout and the reason, and the team run wrote its thesis before its first source file.

What the runs do not show: whether the containers wording changes any build; whether a run chooses two pages over panes when the task is one record at a time; whether the shell stays unedited when no layout fits, since both `67bd78e` requests fit an existing layout. The last two runs were served a registry with the pane order fixed (sidebar, content, inspector); the first two were not, so their pane positions are not comparable.

Limits: one sample per row, graded by the author of the change from each run's report, patch and file list, and 1440px screenshots of the built pages; no interaction was exercised beyond picking an advisor.
