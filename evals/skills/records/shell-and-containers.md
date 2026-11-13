---
scenarios:
  - request: Build a Finnomena Back Office screen for one advisor with three groups of content (contact and licences, meetings against target, clients)
    observe: No card wraps a group and no on-page region has a shadow; no file under the shell's layout folder is edited; the sidebar holds no record list; the report names the layout the screen takes and why.
  - request: Build the same screen for a team lead who first picks one of eight advisors
    observe: The advisors are listed in content, never in the sidebar; picking one opens that advisor's detail, in the detail pane of the layout that supplies list and detail panes (`AppShell` in the starter), not a simpler layout; no shell file is edited.
  - request: Build a Finnomena Back Office screen no shell layout fits (two advisors compared in columns that scroll apart, with a notes panel docked along the bottom)
    observe: The screen is built in the nearest shell layout; no file under the shell's layout folder is edited and the shell is not rebuilt beside it; the report says what did not fit.
---

# Shell and containers

November 2026. The contract now states the app's shell as fixed, puts containers last when grouping, and says the sidebar is the app's menu ([ADR 0011](../../../docs/adr/0011-a-functional-screen-has-four-layers-each-with-one-source.md)). One sample per row with `run-claude-case.mjs` and `claude-opus-5-5`, each building a new app in an empty folder.

| Case | Ref | Cost (USD) | Turns | Minutes | Denied commands |
| --- | --- | --- | --- | --- | --- |
| One advisor | baseline `fd6e2e9` | 2.70 | 79 | 8.6 | 0 |
| One advisor | `9fd0167` (shell fixed, containers last) | 2.79 | 93 | 8.1 | 1 |
| One advisor | `67bd78e` (adds the sidebar rule) | 3.10 | 91 | 10.7 | 0 |
| One advisor | `e0f38df` (main, all changes merged) | 2.80 | 80 | 7.4 | 1 |
| Pick from a team | `67bd78e` | 2.85 | 76 | 8.5 | 3 |
| Pick from a team | `c8f0f3d` (list and detail layout named) | 3.23 | 102 | 8.8 | 1 |
| Pick from a team | baseline `fd6e2e9` | 3.24 | 94 | 8.8 | 1 |
| No layout fits | `61a3590` (main) | 3.83 | 80 | 10.6 | 1 |
| No layout fits | baseline `fd6e2e9` | 2.62 | 87 | 7.3 | 1 |

A first run at `9fd0167` ended its turn while the scaffold installed (22 turns) and is not counted.

**Containers: no difference.** None of the four builds wraps a group in a card or puts a shadow on a region; groups are separated by space and hairlines. The baseline does the same, so this scenario does not show what the containers wording changed.

**Shell fixed: broken once, before the sidebar rule.** The `9fd0167` run added a `toolbar` prop to `SimpleLayout.tsx` and put a list of advisors in the sidebar, though the request named one advisor. The two runs at `67bd78e` changed no file under `src/layout/`. The baseline changed none either.

**Sidebar is the menu: met at `67bd78e`.** The one-advisor run left the sidebar without a record list and built in `ContentLayout`. The team run passed `sidebar={null}` and an empty navigation, listed the eight advisors in a list pane with the detail beside it, and shows them as two views with a "Back to team" link only on narrow screens. It took `AppShell`, the starter's list and detail layout, which is what the owner asked for; the `9fd0167` run had taken `SimpleLayout`. The contract at that commit also allowed a list page and a detail page; the next commit names the list and detail layout as the one form and has not been run.

**List and detail layout from the start (`c8f0f3d`): taken, and the baseline takes it too.** Both later runs of the team request import `AppShell`, pass `sidebar={null}` and an empty navigation, put the eight advisors in its list pane, and change no file under `src/layout/`. The baseline does the same without the sentence, so this request does not show what the sentence changed; the one run that took `SimpleLayout` for a list was the one-advisor request at `9fd0167`. Neither report says which layout it took or why, though both give a thesis written before building. The baseline report notes a React style warning logged from the starter's `ResponsivePanes`, which the run left alone.

**One advisor on main (`e0f38df`): `ContentLayout`, shell untouched.** The request that once took `SimpleLayout` with a list in the sidebar was rerun on main. It took `ContentLayout` with the contact details and licences in the inspector, passed `sidebar={null}` and one menu destination, changed no file under `src/layout/`, and used no card or shadow. Its report gives the thesis written before building and does not say which layout it took or why. Its transcript holds no React style warning; that fix merged before the run.

**No layout fits (`61a3590`): the shell is kept and reported, but no layout is used.** The request asks for two columns that scroll apart and a notes panel docked along the bottom, which no shell layout supplies. The baseline dropped the shell: its screen imports only `Logo`, draws its own header, has no sidebar, and its report does not mention the shell. The run on main changed no file under `src/layout/` and kept the sidebar and the phone bottom bar, but it did not build in a layout: `src/App.tsx` puts `Sidebar`, `InspectorView` and `BottomNav` together itself. Its report lists that as a departure, with the reason that `SimpleLayout` has no slot for the page title; it does not name the docked panel or the two columns as what did not fit. So the contract's "not edited" held, "build in the nearest one" did not, and the report said so in part. Neither build uses a card or a shadow.

**Report names the layout: in two of the five runs after the change, and not in either baseline.** The baseline report does not say why it took `ContentLayout`; the `67bd78e` runs name the layout and the reason, and the team run wrote its thesis before its first source file. The `9fd0167` run names `SimpleLayout` only to report the prop it added, and the two later runs (`c8f0f3d` and `e0f38df`) name no layout, so the contract does not make this reliable.

What the runs do not show: whether the containers wording changes any build; whether the list and detail sentence changes a build, since the baseline also takes that layout for the team request, and the request that once took `SimpleLayout` took `ContentLayout` in one rerun, as the baseline and the `67bd78e` run had; whether a run builds inside the nearest layout when none fits, since the one run on main put the shell's parts together itself. Every run from `67bd78e` on, the team baseline included, was served a registry with the pane order fixed (sidebar, content, inspector); the first two were not, so their pane positions are not comparable. The "report names the layout" result holds for the two `67bd78e` runs only.

Limits: one sample per row, graded by the author of the change from each run's report, patch and file list, and 1440px screenshots of the built pages; no interaction was exercised beyond picking an advisor.
