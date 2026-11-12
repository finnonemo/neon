// What the CDS-match spec measures: one stable selector per element and target,
// never a text search. The CDS selectors follow CDS 9.26's rendered DOM; a
// neon selector, following the Neon base fixture (fixtures/neon/), is added as
// each component lands. The Neon target skips targets that have none yet.
//
// query is the fixture route; check lists the properties compared with the baseline:
//   font   font size, line height and weight of the element's own text
//   color  text color          bg      background color
//   h, w   rounded box size    pad     the four paddings
//   radius rendered top-left radius, capped at half the box, so a 56px pill
//          and a 9999px pill of the same height agree
//   radii  all four corners the same way (top-left, top-right, bottom-right,
//          bottom-left), for a box rounded on some sides only
//   border the stroke inside the box: the top border's width and color, or, where no border
//          is drawn, an outline offset inward by its own width (Core's fields and segments)
//   opacity the element's opacity times its ancestors', which disabled controls set
// both: the Neon fixture mirrors the CDS markup, so one selector reads either.
//
// core names the cell of the item's Counterpart the Neon element renders. On
// the Neon target such a target is held to the Core baseline (core-baseline.mjs)
// for the properties its item's table lists, and to the CDS baseline for the rest.
import { expansionItems } from './expansion.mjs';
import { buttonCell } from './core/button.mjs';
import { fieldCell } from './core/text-field.mjs';
import { textAreaCell } from './core/text-area.mjs';
import { selectCell } from './core/select.mjs';
import { segmentCell, segmentedCell } from './core/segmented-control.mjs';
import { tagCell } from './core/display-tag.mjs';
import { avatarCell } from './core/avatar.mjs';
import { listCell } from './core/list-item.mjs';
import { tableCell } from './core/table.mjs';

const both = (selector, check) => ({ cds: selector, neon: selector, check });
const button = (n, core, check = ['font', 'color', 'bg', 'h', 'pad', 'radius']) => ({ ...both(`[data-measure=actions] button:nth-of-type(${n})`, check), core });
const coreOnly = (selector, core, check = ['font', 'color', 'bg', 'h', 'pad', 'radius', 'opacity']) => ({ neon: `[data-measure=core-buttons] ${selector}`, check, core });
const primary = buttonCell('Primary');
const secondary = buttonCell('Secondary');
const danger = buttonCell('Primary', { Type: 'Danger' });
// A field's Title, empty Field and text, as Core's Text field draws them at Large.
const title = fieldCell('label', 'title', { filled: 'False' });
const emptyField = fieldCell('input', 'field', { filled: 'False' });
const fieldBox = ['h', 'radius', 'border', 'bg', 'opacity'];
const coreField = (hook, selector, core, check = fieldBox) => ({ neon: `[data-measure=core-fields] [data-field=${hook}] ${selector}`, check, core });
// A segment that is chosen, and the Sizes and the Disabled control CDS's tabs have no element for.
const chosen = segmentCell({ Selected: 'True' });
const trackBox = ['h', 'pad', 'radius', 'bg', 'opacity'];
const segmentBox = ['h', 'pad', 'radius', 'bg', 'border', 'color', 'font'];
const coreSegment = (hook, selector, core, check) => ({ neon: `[data-measure=core-segments] [data-segments=${hook}]${selector}`, check, core });
const segmentSet = (name, hook, cell) => ({
  [`${name}Track`]: coreSegment(hook, '', segmentedCell(cell), trackBox),
  [`${name}Chosen`]: coreSegment(hook, ' [role=radio][data-state=checked]', segmentCell({ ...cell, Selected: 'True' }), segmentBox),
  [`${name}Segment`]: coreSegment(hook, ' [role=radio][data-state=unchecked]', segmentCell(cell), segmentBox),
});
const coreSegments = {
  ...segmentSet('smSegmented', 'sm', { Size: 'Small' }),
  ...segmentSet('lgSegmented', 'lg', { Size: 'Large' }),
  // A disabled control is the track at half opacity over segments that keep their Enabled look;
  // a segment disabled on its own takes the item's Disabled cell.
  disabledSegmentedTrack: coreSegment('disabled', '', segmentedCell({ State: 'Disabled' }), trackBox),
  disabledSegmentedChosen: coreSegment('disabled', ' [role=radio][data-state=checked]', chosen, segmentBox),
  disabledSegmentedSegment: coreSegment('disabled', ' [role=radio][data-state=unchecked]', segmentCell(), segmentBox),
  disabledChosenSegment: coreSegment('one-disabled', ' [role=radio][data-state=checked]', segmentCell({ Selected: 'True', State: 'Disabled' }), segmentBox),
  disabledSegment: coreSegment('one-disabled', ' [role=radio][data-state=unchecked]:disabled', segmentCell({ State: 'Disabled' }), segmentBox),
};
const coreFields = {
  readOnlyInput: coreField('read-only', 'input', fieldCell('input', 'field', { State: 'Read-only' })),
  invalidInput: coreField('invalid', 'input', fieldCell('input', 'field', { State: 'Error' })),
  disabledLabel: coreField('disabled', 'label', fieldCell('label', 'title', { State: 'Disabled' }), ['font', 'color', 'opacity']),
  placeholder: coreField('placeholder', 'input', fieldCell('input', 'field', { filled: 'False' })),
  invalidTextarea: coreField('invalid-textarea', 'textarea', textAreaCell('field', { State: 'Error' })),
  disabledTextarea: coreField('disabled-textarea', 'textarea', textAreaCell('field', { State: 'Disabled' })),
  disabledTextareaText: coreField('disabled-textarea', 'textarea', textAreaCell('text', { State: 'Disabled' }), ['font', 'color', 'opacity']),
  invalidSelect: coreField('invalid-select', '[data-slot=select-trigger]', selectCell('field', { State: 'Error' })),
  disabledSelect: coreField('disabled-select', '[data-slot=select-trigger]', selectCell('field', { State: 'Disabled' })),
  disabledSelectValue: coreField('disabled-select', '[data-slot=select-value]', selectCell('value', { State: 'Disabled' }), ['font', 'color', 'opacity']),
  selectChevron: coreField('invalid-select', '[data-slot=select-trigger] > svg', selectCell('chevron', { State: 'Error' }), ['color']),
  disabledSelectChevron: coreField('disabled-select', '[data-slot=select-trigger] > svg', selectCell('chevron', { State: 'Disabled' }), ['color']),
};
const tagBox = ['font', 'h', 'pad', 'radius', 'bg', 'color', 'border', 'opacity'];
const expansionSection = (n) => `:has(> [data-measure=title]) > section:nth-of-type(${n})`;

export const screens = [
  {
    name: 'approval',
    query: 'layout=approval',
    targets: {
      title: both('[data-measure=title] h1', ['font', 'color']),
      searchLabel: { neon: '[data-measure=search] label', cds: '[data-measure=search] label', check: ['font', 'color'], core: title },
      searchInput: { neon: '[data-measure=search] input', cds: '[data-measure=search] [data-testid=input-interactable-area]', check: ['h', 'radius', 'border', 'bg'], core: emptyField },
      searchText: { neon: '[data-measure=search] input', cds: '[data-measure=search] input', check: ['font', 'color'], core: fieldCell('input', 'text') },
      segmented: { neon: '[data-measure=segmented] [role=radiogroup]', cds: '[data-measure=segmented] [role=tablist]', check: ['h', 'radius', 'bg'], core: segmentedCell() },
      segmentThumb: { neon: '[data-measure=segmented] [role=radio][data-state=checked]', cds: '[data-measure=segmented] [data-testid=tabs-active-indicator]', check: ['h', 'radius', 'bg'], core: chosen },
      segmentActive: { neon: '[data-measure=segmented] [role=radio][data-state=checked]', cds: '[data-measure=segmented] [role=tablist] > div:nth-child(2) [role=tab]', check: ['h', 'font', 'color'], core: chosen },
      segment: { neon: '[data-measure=segmented] [role=radio]:nth-child(3)', cds: '[data-measure=segmented] [role=tablist] > div:nth-child(3) [role=tab]', check: ['h', 'font', 'color'], core: segmentCell() },
      // What CDS's tabs have no element for: the track's padding and each segment's own box and stroke.
      segmentedPad: { neon: '[data-measure=segmented] [role=radiogroup]', check: ['pad', 'opacity'], core: segmentedCell() },
      segmentChosenBox: { neon: '[data-measure=segmented] [role=radio][data-state=checked]', check: ['pad', 'border'], core: chosen },
      segmentBox: { neon: '[data-measure=segmented] [role=radio]:nth-child(3)', check: ['pad', 'radius', 'bg', 'border'], core: segmentCell() },
      row: { neon: '[data-measure=list] li:nth-child(2) [data-slot=list-row]', cds: '[data-measure=list] > div > div:nth-child(2) > button', check: ['h', 'radius'], core: listCell('row') },
      rowTitle: { neon: '[data-measure=list] li:nth-child(2) [data-slot=list-row-title]', cds: '[data-measure=list] > div > div:nth-child(2) button > div > div:nth-child(2) > div > div:nth-child(1)', check: ['font', 'color'], core: listCell('title') },
      rowDescription: { neon: '[data-measure=list] li:nth-child(2) [data-slot=list-row-description]', cds: '[data-measure=list] > div > div:nth-child(2) button > div > div:nth-child(2) > div > div:nth-child(2)', check: ['font', 'color'], core: listCell('subtitle') },
      rowAvatar: { neon: '[data-measure=list] li:nth-child(2) [data-slot=avatar]', cds: '[data-measure=list] > div > div:nth-child(2) [data-shape=circle]', check: ['h', 'w'], core: avatarCell('circle') },
      tag: { neon: '[data-measure=list] li:nth-child(3) [data-slot=tag]', cds: '[data-measure=list] > div > div:nth-child(3) [data-testid=cds-tag]', check: ['font', 'h', 'pad', 'radius'], core: tagCell({ Color: 'Green' }) },
      selectedRow: { neon: '[data-measure=list] li:nth-child(1) [data-slot=list-row]', cds: '[data-measure=list] > div > div:nth-child(1) > button', check: ['h'], core: listCell('row') },
      // What the CDS list has no element for, or draws another way: held to the Core baseline alone.
      rowBox: { neon: '[data-measure=list] li:nth-child(2) [data-slot=list-row]', check: ['pad', 'bg', 'border'], core: listCell('row') },
      rowText: { neon: '[data-measure=list] li:nth-child(2) [data-slot=list-row-content]', check: ['pad'], core: listCell('text') },
      // A selected row shows Core's Checkmark and keeps the row's fill.
      selectedRowBox: { neon: '[data-measure=list] li:nth-child(1) [data-slot=list-row]', check: ['bg', 'border'], core: listCell('row') },
      selectedCheck: { neon: '[data-measure=list] li:nth-child(1) [data-slot=list-row-check]', check: ['color'], core: listCell('checkmark') },
      rowAvatarFill: { neon: '[data-measure=list] li:nth-child(2) [data-slot=avatar-fallback]', check: ['radius', 'bg'], core: avatarCell('circle') },
      rowAvatarLabel: { neon: '[data-measure=list] li:nth-child(2) [data-slot=avatar-fallback]', check: ['font', 'color'], core: avatarCell('label') },
      tagFill: { neon: '[data-measure=list] li:nth-child(3) [data-slot=tag]', check: ['bg', 'color', 'border', 'opacity'], core: tagCell({ Color: 'Green' }) },
      warningTag: { neon: '[data-measure=list] li:nth-child(2) [data-slot=tag]', check: tagBox, core: tagCell({ Color: 'Orange' }) },
      negativeTag: { neon: '[data-measure=list] li:nth-child(4) [data-slot=tag]', check: tagBox, core: tagCell({ Color: 'Red' }) },
    },
    gaps: [
      ['searchLabel', 'searchInput', 'y'],
      ['selectedRow', 'row', 'y'],
    ],
  },
  {
    name: 'approval-detail',
    query: 'layout=approval&pane=inspector',
    targets: {
      detailAvatar: { neon: '[data-measure=summary] [data-slot=avatar]', cds: '[data-measure=summary] [data-shape=circle]', check: ['h', 'w'], core: avatarCell('circle', { Size: 'Medium' }) },
      detailAvatarLabel: { neon: '[data-measure=summary] [data-slot=avatar-fallback]', check: ['font', 'color'], core: avatarCell('label', { Size: 'Medium' }) },
      detailTitle: both('[data-measure=summary] h2', ['font', 'color']),
      detailMeta: both('[data-measure=summary] h2 + span', ['font', 'color']),
      detailsHeading: both('[data-measure=details] span:nth-child(1)', ['font', 'color']),
      detailsBody: both('[data-measure=details] span:nth-child(2)', ['font', 'color']),
      detailsCaption: both('[data-measure=details] span:nth-child(3)', ['font', 'color']),
      notesLabel: { neon: '[data-measure=notes] label', cds: '[data-measure=notes] label', check: ['font', 'color'], core: title },
      notes: { neon: '[data-measure=notes] textarea', cds: '[data-measure=notes] [data-testid=input-interactable-area]', check: ['h', 'radius', 'border', 'bg'], core: textAreaCell('field', { filled: 'False' }) },
      notesText: { neon: '[data-measure=notes] textarea', cds: '[data-measure=notes] textarea', check: ['font', 'color', 'pad'], core: textAreaCell('text') },
      checkbox: { neon: '[data-measure=confirm] [role=checkbox]', cds: '[data-measure=confirm] [data-testid=checkbox-outer]', check: ['h', 'w', 'radius', 'border'] },
      checkboxLabel: { neon: '[data-measure=confirm] label', cds: '[data-measure=confirm] label span[id]', check: ['font', 'color'] },
      approve: button(1, primary),
      requestInfo: button(2, secondary),
      reject: button(3, danger),
    },
    gaps: [
      ['detailTitle', 'detailMeta', 'y'],
      ['notesLabel', 'notes', 'y'],
      ['approve', 'requestInfo', 'x'],
      ['requestInfo', 'reject', 'x'],
    ],
  },
  {
    name: 'extras',
    query: 'layout=extras',
    targets: {
      title: both('[data-measure=title] h1', ['font', 'color']),
      selectLabel: { neon: '[data-measure=select] label', cds: '[data-measure=select] label', check: ['font', 'color'], core: title },
      selectTrigger: { neon: '[data-measure=select] [data-slot=select-trigger]', cds: '[data-measure=select] [data-testid=input-interactable-area]', check: ['h', 'radius', 'border', 'bg'], core: selectCell('field') },
      // Core's Select draws no placeholder: the value shown here is one, and takes Core's type only.
      selectValue: { neon: '[data-measure=select] [data-slot=select-value]', cds: '[data-measure=select] button p', check: ['font', 'color'], core: selectCell('value'), coreProperties: ['font'] },
      // The DatePicker is not retuned; its Label is Core's Title.
      dateLabel: { neon: '[data-measure=date] label', cds: '[data-measure=date] label', check: ['font', 'color'], core: title },
      dateField: { neon: '[data-measure=date] [data-slot=date-picker]', cds: '[data-measure=date] [data-testid=input-interactable-area]', check: ['h', 'radius', 'border', 'bg'] },
      helpButton: { neon: '[data-measure=help] button', cds: '[data-measure=help] button', check: ['h', 'w'] },
      headerCell: { neon: '[data-measure=table] thead th:nth-child(1)', cds: '[data-measure=table] thead th:nth-child(1)', check: ['font', 'color', 'h'], core: tableCell('headerCell') },
      bodyRow: { neon: '[data-measure=table] tbody tr:nth-child(1)', cds: '[data-measure=table] tbody tr:nth-child(1)', check: ['h'], core: tableCell('bodyRow') },
      bodyCell: { neon: '[data-measure=table] tbody tr:nth-child(1) td:nth-child(1)', cds: '[data-measure=table] tbody tr:nth-child(1) td:nth-child(1) div:not(:has(*))', check: ['font', 'color'], core: tableCell('bodyCell') },
      // A cell away from the table's edges: Core's cell padding, and the Header row's fill behind a header cell.
      headerCellBox: { neon: '[data-measure=table] thead th:nth-child(2)', check: ['pad', 'bg'], core: tableCell('headerCell') },
      bodyCellBox: { neon: '[data-measure=table] tbody tr:nth-child(1) td:nth-child(2)', check: ['pad', 'h'], core: tableCell('bodyCell') },
      // The row menu's cell is the row's last, so its right side carries the row's 8 too: its height is what is held.
      controlCell: { neon: '[data-measure=table] tbody tr:nth-child(1) td:nth-child(5)', check: ['h'], core: tableCell('controlCell') },
      rowMenuButton: { neon: '[data-measure=table] tbody tr:nth-child(1) button', cds: '[data-measure=table] tbody tr:nth-child(1) button', check: ['h', 'w'] },
      rejectRequest: button(1, danger),
      save: button(2, secondary),
      // A disabled Button and a disabled field take Core's disabled fill and text at full opacity;
      // the checkbox keeps CDS's blended fill and its opacity (spike trap 4) until retuned, while
      // its Label takes Text/text-disabled as beside every disabled control.
      forwardDisabled: button(3, buttonCell('Primary', { State: 'Disabled' }), ['h', 'opacity', 'bg', 'color']),
      // Core's values that CDS has none of: held to the Core baseline alone, on the Neon target only.
      medium: coreOnly('[data-size=md]', buttonCell('Primary', { Size: 'Medium' })),
      extraSmall: coreOnly('[data-size=xs]', buttonCell('Secondary', { Size: 'XSmall' })),
      small: coreOnly('[data-size=sm]', buttonCell('Tertiary', { Size: 'Small' })),
      brand: coreOnly('[data-variant=brand]', buttonCell('Primary', { Type: 'Brand' })),
      inverse: coreOnly('[data-variant=inverse]', buttonCell('Primary', { Type: 'Inverse' })),
      // Loading fixes the Enabled button's height and binds no label ink.
      loading: coreOnly('[aria-busy=true]', buttonCell('Primary', { State: 'Loading' }), ['bg', 'opacity']),
      disabledInput: { neon: '[data-measure=disabled-field] input', cds: '[data-measure=disabled-field] [data-testid=input-interactable-area]', check: ['h', 'border', 'bg', 'opacity'], core: fieldCell('input', 'field', { State: 'Disabled' }) },
      disabledInputText: { neon: '[data-measure=disabled-field] input', cds: '[data-measure=disabled-field] input', check: ['color', 'opacity'], core: fieldCell('input', 'text', { State: 'Disabled' }) },
      // Core's field states CDS has no baseline for: held to the Core baseline alone, on the Neon target only.
      ...coreFields,
      ...coreSegments,
      // Core's Display tag in the cells the approval list has none of: Navy, and the Medium and Large Sizes.
      neutralTag: { neon: '[data-measure=core-tags] [data-variant=neutral]', check: tagBox, core: tagCell() },
      mediumTag: { neon: '[data-measure=core-tags] [data-size=md]', check: tagBox, core: tagCell({ Color: 'Green', Size: 'Medium' }) },
      largeTag: { neon: '[data-measure=core-tags] [data-size=lg]', check: tagBox, core: tagCell({ Color: 'Red', Size: 'Large' }) },
      // A disabled row's text is Text/text-disabled on the row's own fill.
      disabledRow: { neon: '[data-measure=core-list] li:nth-child(1) [data-slot=list-row]', check: ['h', 'bg', 'border'], core: listCell('row', { State: 'Disabled' }) },
      disabledRowTitle: { neon: '[data-measure=core-list] li:nth-child(1) [data-slot=list-row-title]', check: ['font', 'color'], core: listCell('title', { State: 'Disabled' }) },
      disabledRowDescription: { neon: '[data-measure=core-list] li:nth-child(1) [data-slot=list-row-description]', check: ['font', 'color'], core: listCell('subtitle', { State: 'Disabled' }) },
      disabledCheckbox: { neon: '[data-measure=disabled-check] [role=checkbox]', cds: '[data-measure=disabled-check] [data-testid=checkbox-outer]', check: ['border', 'bg', 'opacity'] },
      disabledCheckboxLabel: { neon: '[data-measure=disabled-check] label', cds: '[data-measure=disabled-check] label span[id]', check: ['color', 'opacity'] },
    },
    gaps: [
      ['selectLabel', 'selectTrigger', 'y'],
      ['bodyRow', 'bodyRow2', 'y'],
      ['rejectRequest', 'save', 'x'],
    ],
    extraTargets: {
      bodyRow2: { neon: '[data-measure=table] tbody tr:nth-child(2)', cds: '[data-measure=table] tbody tr:nth-child(2)', check: [] },
    },
  },
  // Overlays are measured open, one per page load.
  {
    name: 'select-open',
    query: 'layout=extras',
    open: { action: 'click', neon: '[data-measure=select] [data-slot=select-trigger]', cds: '[data-measure=select] button' },
    targets: {
      // Open is Core's Active. CDS has no such element, so it is held to Core alone.
      openTrigger: { neon: '[data-measure=select] [data-slot=select-trigger]', check: fieldBox, core: selectCell('field', { State: 'Active' }) },
      listbox: { neon: '[data-slot=select-content]', cds: '[role=listbox] > div > div', check: ['radius', 'bg'] },
      option: { neon: '[role=option]:nth-of-type(2)', cds: '[role=option]:nth-of-type(2)', check: ['h', 'font', 'color'] },
    },
    gaps: [],
  },
  {
    name: 'date-open',
    query: 'layout=extras',
    open: { action: 'click', neon: '[data-measure=date] [data-slot=date-picker]', cds: '[data-measure=date] button[aria-label="Open calendar"]' },
    targets: {
      calendar: { neon: '[data-slot=popover-content]', cds: '[role=dialog] [role=menu]', check: ['radius', 'bg'] },
      month: { neon: '[data-slot=calendar] .rdp-caption_label', cds: '[role=dialog] h3', check: ['font', 'color'] },
      day: { neon: '[data-slot=calendar] button[data-day$="-10"]', cds: '[data-calendar-date$="-10"]', check: ['h', 'w', 'font', 'color'] },
    },
    gaps: [],
  },
  {
    name: 'menu-open',
    query: 'layout=extras',
    open: { action: 'click', neon: '[data-measure=table] tbody tr:nth-child(1) button', cds: '[data-measure=table] tbody tr:nth-child(1) button' },
    targets: {
      menu: { neon: '[data-slot=dropdown-menu-content]', cds: '[role=menu]', check: ['radius', 'bg'] },
      menuItem: { neon: '[role=menuitem]:nth-of-type(1)', cds: '[role=menuitem]:nth-of-type(1)', check: ['h', 'font', 'color'] },
      menuItemNegative: { neon: '[role=menuitem]:nth-of-type(2)', cds: '[role=menuitem]:nth-of-type(2)', check: ['font', 'color'] },
    },
    gaps: [],
  },
  {
    name: 'dialog-open',
    query: 'layout=extras',
    open: { action: 'click', neon: '[data-measure=actions] button:nth-of-type(1)', cds: '[data-measure=actions] button:nth-of-type(1)' },
    targets: {
      dialog: { neon: '[data-slot=dialog-content]', cds: '[data-testid=modal-dialog-motion] > div', check: ['w', 'radius', 'bg'] },
      dialogTitle: { neon: '[data-slot=dialog-title]', cds: '[role=dialog] h2', check: ['font', 'color'] },
      dialogBody: { neon: '[data-slot=dialog-body]', cds: '[role=dialog] [tabindex="0"] span', check: ['font', 'color'] },
      dialogCancel: { neon: '[data-slot=dialog-footer] [data-variant=secondary]', cds: '[role=dialog] button[data-variant=secondary]:not([data-compact])', check: ['h', 'font', 'pad', 'radius', 'bg'], core: secondary },
      dialogConfirm: { neon: '[data-slot=dialog-footer] [data-variant=destructive]', cds: '[role=dialog] button[data-variant=negative]', check: ['h', 'font', 'pad', 'radius', 'bg'], core: danger },
    },
    gaps: [['dialogCancel', 'dialogConfirm', 'x']],
  },
  {
    name: 'toast-open',
    query: 'layout=extras',
    open: { action: 'click', neon: '[data-measure=actions] button:nth-of-type(2)', cds: '[data-measure=actions] button:nth-of-type(2)' },
    targets: {
      toast: { neon: '[data-sonner-toast]', cds: '[data-testid=cds-toast] > div', check: ['radius', 'bg'] },
      toastText: { neon: '[data-sonner-toast] [data-title]', cds: '[data-testid=cds-toast] p', check: ['font', 'color'] },
    },
    gaps: [],
  },
  {
    name: 'tooltip-open',
    query: 'layout=extras',
    open: { action: 'focus', neon: '[data-measure=help] button', cds: '[data-measure=help] button' },
    targets: {
      tooltip: { neon: '[data-slot=tooltip-content]', cds: '[role=tooltip]', check: ['radius', 'bg', 'pad'] },
      tooltipText: { neon: '[data-slot=tooltip-content]', cds: '[role=tooltip] span', check: ['font', 'color'] },
    },
    gaps: [],
  },
  // The expansion screen itself: its title, padding, the gap between sections
  // and within one (heading → the item's own markup, past its display: contents hook).
  {
    name: 'expansion',
    query: 'layout=expansion',
    targets: {
      title: both('[data-measure=title] h1', ['font', 'color']),
      screen: both(':has(> [data-measure=title])', ['pad']),
      sectionHeading: both(`${expansionSection(1)} > h2`, ['font', 'color']),
    },
    extraTargets: {
      firstSection: both(expansionSection(1), []),
      sectionContent: both(`${expansionSection(1)} > [data-measure] > :first-child`, []),
      secondSection: both(expansionSection(2), []),
    },
    gaps: [
      ['title', 'firstSection', 'y'],
      ['sectionHeading', 'sectionContent', 'y'],
      ['firstSection', 'secondSection', 'y'],
    ],
  },
  // Each registry expansion item's entries, from expansion/<item>.mjs.
  ...expansionItems.flatMap((item) => item.screens),
];

export const viewports = [{ width: 375, height: 812 }, { width: 1440, height: 900 }];
export const modes = ['light', 'dark'];

/** Runs in the page: measures each selector's first visible match. */
export function measureInPage(targets) {
  const textHost = (el) => {
    const owns = (node) => [...node.childNodes].some((child) => child.nodeType === 3 && child.textContent.trim());
    if (owns(el)) return el;
    for (const node of el.querySelectorAll('*')) if (owns(node) && node.getBoundingClientRect().width) return node;
    return el;
  };
  // What the eye sees: the element's opacity times every ancestor's, since CDS fades a control's wrapper.
  const opacity = (el) => { let value = 1; for (let node = el; node; node = node.parentElement) value *= Number(getComputedStyle(node).opacity); return value; };
  // color-mix() computes to color(srgb r g b / a); the baseline holds rgb().
  const rgb = (value) => {
    const match = value.match(/^color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)(?: \/ ([\d.]+))?\)$/);
    if (!match) return value;
    const [r, g, b] = match.slice(1, 4).map((v) => Math.round(Number(v) * 255));
    return match[4] === undefined || Number(match[4]) === 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${Number(match[4])})`;
  };
  const px = (value) => Math.round(parseFloat(value) * 10) / 10;
  // The stroke inside the box: the top border, or an outline offset inward by its own width.
  const stroke = (style) => {
    const border = px(style.borderTopWidth);
    const outline = style.outlineStyle === 'none' ? 0 : px(style.outlineWidth);
    if (!border && outline && px(style.outlineOffset) === -outline) return { width: outline, color: rgb(style.outlineColor) };
    return { width: border, color: rgb(style.borderTopColor) };
  };
  const out = {};
  for (const [name, selector] of Object.entries(targets)) {
    const el = [...document.querySelectorAll(selector)].find((node) => {
      const box = node.getBoundingClientRect();
      return box.width > 0 && box.height > 0 && getComputedStyle(node).visibility !== 'hidden';
    });
    if (!el) { out[name] = null; continue; }
    const box = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    const text = getComputedStyle(textHost(el));
    out[name] = {
      box: { top: box.top, right: box.right, bottom: box.bottom, left: box.left },
      h: Math.round(box.height), w: Math.round(box.width),
      font: { size: px(text.fontSize), lineHeight: text.lineHeight === 'normal' ? 'normal' : px(text.lineHeight), weight: Number(text.fontWeight) },
      color: rgb(text.color), bg: rgb(style.backgroundColor),
      pad: [style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft].map(px),
      radius: px(Math.min(parseFloat(style.borderTopLeftRadius), box.width / 2, box.height / 2)),
      radii: ['TopLeft', 'TopRight', 'BottomRight', 'BottomLeft'].map((corner) => px(Math.min(parseFloat(style[`border${corner}Radius`]), box.width / 2, box.height / 2))),
      border: stroke(style),
      opacity: Math.round(opacity(el) * 100) / 100,
    };
  }
  return out;
}

/** The distance between two measured boxes along one axis: b's start minus a's end. */
export function gap(a, b, axis) {
  return Math.round(axis === 'x' ? b.box.left - a.box.right : b.box.top - a.box.bottom);
}

/** Keeps only the checked properties, so the fixture stores what the spec compares. */
export function pick(measured, check) {
  const kept = {};
  for (const key of check) kept[key] = measured[key];
  return kept;
}

const channels = (color) => (color.match(/[\d.]+/g) ?? []).map(Number);
/**
 * Differences between a measurement and its baseline: ±1px for a measured size, ±2 per color channel.
 * A type size, line height and weight are set values and compare exactly; a weight the baseline
 * does not state (a Core emphasis no Neon type role carries) is not compared.
 */
export function compare(actual, expected, tolerance = 1) {
  const problems = [];
  const near = (a, b) => typeof a === 'number' && typeof b === 'number' ? Math.abs(a - b) <= tolerance : a === b;
  const sameColor = (a, b) => {
    const [x, y] = [channels(a), channels(b)];
    const alpha = (c) => c.length === 4 ? c[3] : 1;
    if (alpha(x) === 0 && alpha(y) === 0) return true;
    return x.length && x.slice(0, 3).every((v, i) => Math.abs(v - y[i]) <= 2) && Math.abs(alpha(x) - alpha(y)) <= 0.02;
  };
  for (const [key, want] of Object.entries(expected)) {
    const got = actual[key];
    if (key === 'color' || key === 'bg') { if (!sameColor(got, want)) problems.push(`${key} ${got} ≠ ${want}`); }
    else if (key === 'font') {
      for (const part of ['size', 'lineHeight', 'weight']) {
        if (part in want && got[part] !== want[part]) problems.push(`font.${part} ${got[part]} ≠ ${want[part]}`);
      }
    } else if (key === 'opacity') { if (Math.abs(got - want) > 0.02) problems.push(`opacity ${got} ≠ ${want}`); }
    else if (key === 'pad' || key === 'radii') { if (!want.every((v, i) => near(got[i], v))) problems.push(`${key} ${got} ≠ ${want}`); }
    else if (key === 'border') {
      if (!near(got.width, want.width)) problems.push(`border.width ${got.width} ≠ ${want.width}`);
      else if (want.width > 0 && !sameColor(got.color, want.color)) problems.push(`border.color ${got.color} ≠ ${want.color}`);
    } else if (!near(got, want)) problems.push(`${key} ${got} ≠ ${want}`);
  }
  return problems;
}

// A problem line for a box measurement, which rounding moves a pixel between platforms:
// "<element>: w|h|radius <measured> ≠ <baseline>" or "gap <a>→<b>: <measured> ≠ <baseline>".
const BOX = /^(?<what>.+: (?:w|h|radius)|gap .+:) (?<measured>-?\d+(?:\.\d+)?) ≠ (?<baseline>-?\d+(?:\.\d+)?)$/;

/**
 * The problems as the recorded differences word them: a problem that is a recorded box measurement
 * within the baseline's ±1px of the recorded number becomes the recorded line, since macOS and Linux
 * round a text's width a pixel apart. Anything else stays as measured, so it still reads as a problem:
 * a type size, line height, weight or opacity is a set value and holds to its recorded number.
 */
export function asRecorded(problems, recorded) {
  const known = new Map(recorded.map(line => [line.match(BOX)?.groups.what, line]));
  return problems.map(problem => {
    const now = problem.match(BOX)?.groups;
    const then = now && known.get(now.what)?.match(BOX).groups;
    return then && now.baseline === then.baseline && Math.abs(now.measured - then.measured) <= 1 ? known.get(now.what) : problem;
  });
}
