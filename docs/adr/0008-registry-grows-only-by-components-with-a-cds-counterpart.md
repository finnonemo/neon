# The Neon registry grows only by components with a CDS Counterpart

A new Neon component must have a Counterpart in CDS 9.26.1, so there is a CDS look to tune it to and measure it against (ADR 0006). The next set is the 21 shadcn components that have one: switch, radio-group, field, input-group, separator, spinner, progress, tabs, accordion, collapsible, alert, alert-dialog, sheet, toggle-group, button-group, pagination, card, sidebar, navigation-menu, carousel and chart. They ship in three batches, with one Neon release per batch.

shadcn components with no Counterpart, such as breadcrumb, command, slider and the chat items, are not added: Neon has nothing to match them to, and tuning them needs a design owner's decision. CDS components with no shadcn equivalent, such as Chip, CheckboxCell, Stepper and the dot indicators, are not added either, because each would need its behavior designed from scratch. Each is considered on its own when an app needs it.

## Decisions within the rule

- **Combobox is deferred.** shadcn's `radix-nova` Combobox depends on `@base-ui/react`. Adding it would bring in a second primitive library, and ADR 0006 measured only Radix. Whether to admit Base UI is a separate decision.
- **Supporting items are allowed.** Some components need shadcn items that have no Counterpart: toggle-group needs toggle, and sidebar needs skeleton and `use-mobile`. These ship as Supporting items. They are shaped to fit the items that use them and measured through those items, never on their own. They are marked so that the Catalog does not list them.
- **Names follow shadcn.** A new item takes its shadcn name, even where CDS names the Counterpart differently: alert for CDS Banner, alert-dialog for CDS Alert, sheet for CDS Tray, separator for CDS Divider. Developers read shadcn's docs alongside Neon's, and the Catalog shows each Counterpart's name. The existing `tag` keeps its name, because renaming it would break apps that already use it.
- **Chart is measured only where CDS can be matched.** CDS CartesianChart draws with its own engine. The CDS-match eval compares chart containers, axis and label type, series colors and tooltips, not the plotted shapes.
- **Unclear role mappings ship as provisional.** Each one gets a design-owner issue, as in ADR 0006, and the item ships without waiting on it.
