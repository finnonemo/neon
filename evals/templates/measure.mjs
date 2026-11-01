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
//   border top border width and color
const button = (n, check = ['font', 'color', 'bg', 'h', 'pad', 'radius']) => ({ cds: `[data-measure=actions] button:nth-of-type(${n})`, check });

export const screens = [
  {
    name: 'approval',
    query: 'layout=approval',
    targets: {
      title: { cds: '[data-measure=title] h1', check: ['font', 'color'] },
      searchLabel: { cds: '[data-measure=search] label', check: ['font', 'color'] },
      searchInput: { cds: '[data-measure=search] [data-testid=input-interactable-area]', check: ['h', 'radius', 'border', 'bg'] },
      searchText: { cds: '[data-measure=search] input', check: ['font', 'color'] },
      segmented: { cds: '[data-measure=segmented] [role=tablist]', check: ['h', 'radius', 'bg'] },
      segmentThumb: { cds: '[data-measure=segmented] [data-testid=tabs-active-indicator]', check: ['h', 'radius', 'bg'] },
      segmentActive: { cds: '[data-measure=segmented] [role=tablist] > div:nth-child(2) [role=tab]', check: ['h', 'font', 'color'] },
      segment: { cds: '[data-measure=segmented] [role=tablist] > div:nth-child(3) [role=tab]', check: ['h', 'font', 'color'] },
      row: { cds: '[data-measure=list] > div > div:nth-child(2) > button', check: ['h', 'radius'] },
      rowTitle: { cds: '[data-measure=list] > div > div:nth-child(2) button > div > div:nth-child(2) > div > div:nth-child(1)', check: ['font', 'color'] },
      rowDescription: { cds: '[data-measure=list] > div > div:nth-child(2) button > div > div:nth-child(2) > div > div:nth-child(2)', check: ['font', 'color'] },
      rowAvatar: { cds: '[data-measure=list] > div > div:nth-child(2) [data-shape=circle]', check: ['h', 'w'] },
      tag: { cds: '[data-measure=list] > div > div:nth-child(3) [data-testid=cds-tag]', check: ['font', 'h', 'pad', 'radius'] },
      selectedRow: { cds: '[data-measure=list] > div > div:nth-child(1) > button', check: ['h'] },
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
      detailAvatar: { cds: '[data-measure=summary] [data-shape=circle]', check: ['h', 'w'] },
      detailTitle: { cds: '[data-measure=summary] h2', check: ['font', 'color'] },
      detailMeta: { cds: '[data-measure=summary] h2 + span', check: ['font', 'color'] },
      detailsHeading: { cds: '[data-measure=details] span:nth-child(1)', check: ['font', 'color'] },
      detailsBody: { cds: '[data-measure=details] span:nth-child(2)', check: ['font', 'color'] },
      detailsCaption: { cds: '[data-measure=details] span:nth-child(3)', check: ['font', 'color'] },
      notesLabel: { cds: '[data-measure=notes] label', check: ['font', 'color'] },
      notes: { cds: '[data-measure=notes] [data-testid=input-interactable-area]', check: ['h', 'radius', 'border', 'bg'] },
      notesText: { cds: '[data-measure=notes] textarea', check: ['font', 'color', 'pad'] },
      checkbox: { cds: '[data-measure=confirm] [data-testid=checkbox-outer]', check: ['h', 'w', 'radius', 'border'] },
      checkboxLabel: { cds: '[data-measure=confirm] label span[id]', check: ['font', 'color'] },
      approve: button(1),
      requestInfo: button(2),
      reject: button(3),
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
      title: { cds: '[data-measure=title] h1', check: ['font', 'color'] },
      selectLabel: { cds: '[data-measure=select] label', check: ['font', 'color'] },
      selectTrigger: { cds: '[data-measure=select] [data-testid=input-interactable-area]', check: ['h', 'radius', 'border', 'bg'] },
      selectValue: { cds: '[data-measure=select] button p', check: ['font', 'color'] },
      dateLabel: { cds: '[data-measure=date] label', check: ['font', 'color'] },
      dateField: { cds: '[data-measure=date] [data-testid=input-interactable-area]', check: ['h', 'radius', 'border', 'bg'] },
      helpButton: { cds: '[data-measure=help] button', check: ['h', 'w'] },
      headerCell: { cds: '[data-measure=table] thead th:nth-child(1)', check: ['font', 'color', 'h'] },
      bodyRow: { cds: '[data-measure=table] tbody tr:nth-child(1)', check: ['h'] },
      bodyCell: { cds: '[data-measure=table] tbody tr:nth-child(1) td:nth-child(1) div:not(:has(*))', check: ['font', 'color'] },
      rowMenuButton: { cds: '[data-measure=table] tbody tr:nth-child(1) button', check: ['h', 'w'] },
      rejectRequest: button(1),
      save: button(2),
    },
    gaps: [
      ['selectLabel', 'selectTrigger', 'y'],
      ['bodyRow', 'bodyRow2', 'y'],
      ['rejectRequest', 'save', 'x'],
    ],
    extraTargets: {
      bodyRow2: { cds: '[data-measure=table] tbody tr:nth-child(2)', check: [] },
    },
  },
  // Overlays are measured open, one per page load.
  {
    name: 'select-open',
    query: 'layout=extras',
    open: { action: 'click', cds: '[data-measure=select] button' },
    targets: {
      listbox: { cds: '[role=listbox] > div > div', check: ['radius', 'bg'] },
      option: { cds: '[role=option]:nth-of-type(2)', check: ['h', 'font', 'color'] },
    },
    gaps: [],
  },
  {
    name: 'date-open',
    query: 'layout=extras',
    open: { action: 'click', cds: '[data-measure=date] button[aria-label="Open calendar"]' },
    targets: {
      calendar: { cds: '[role=dialog] [role=menu]', check: ['radius', 'bg'] },
      month: { cds: '[role=dialog] h3', check: ['font', 'color'] },
      day: { cds: '[data-calendar-date$="-10"]', check: ['h', 'w', 'font', 'color'] },
    },
    gaps: [],
  },
  {
    name: 'menu-open',
    query: 'layout=extras',
    open: { action: 'click', cds: '[data-measure=table] tbody tr:nth-child(1) button' },
    targets: {
      menu: { cds: '[role=menu]', check: ['radius', 'bg'] },
      menuItem: { cds: '[role=menuitem]:nth-of-type(1)', check: ['h', 'font', 'color'] },
      menuItemNegative: { cds: '[role=menuitem]:nth-of-type(2)', check: ['font', 'color'] },
    },
    gaps: [],
  },
  {
    name: 'dialog-open',
    query: 'layout=extras',
    open: { action: 'click', cds: '[data-measure=actions] button:nth-of-type(1)' },
    targets: {
      dialog: { cds: '[data-testid=modal-dialog-motion] > div', check: ['w', 'radius', 'bg'] },
      dialogTitle: { cds: '[role=dialog] h2', check: ['font', 'color'] },
      dialogBody: { cds: '[role=dialog] [tabindex="0"] span', check: ['font', 'color'] },
      dialogCancel: { cds: '[role=dialog] button[data-variant=secondary]:not([data-compact])', check: ['h', 'font', 'pad', 'radius', 'bg'] },
      dialogConfirm: { cds: '[role=dialog] button[data-variant=negative]', check: ['h', 'font', 'pad', 'radius', 'bg'] },
    },
    gaps: [['dialogCancel', 'dialogConfirm', 'x']],
  },
  {
    name: 'toast-open',
    query: 'layout=extras',
    open: { action: 'click', cds: '[data-measure=actions] button:nth-of-type(2)' },
    targets: {
      toast: { cds: '[data-testid=cds-toast] > div', check: ['radius', 'bg'] },
      toastText: { cds: '[data-testid=cds-toast] p', check: ['font', 'color'] },
    },
    gaps: [],
  },
  {
    name: 'tooltip-open',
    query: 'layout=extras',
    open: { action: 'focus', cds: '[data-measure=help] button' },
    targets: {
      tooltip: { cds: '[role=tooltip]', check: ['radius', 'bg', 'pad'] },
      tooltipText: { cds: '[role=tooltip] span', check: ['font', 'color'] },
    },
    gaps: [],
  },
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
  const px = (value) => Math.round(parseFloat(value) * 10) / 10;
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
      color: text.color, bg: style.backgroundColor,
      pad: [style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft].map(px),
      radius: px(Math.min(parseFloat(style.borderTopLeftRadius), box.width / 2, box.height / 2)),
      border: { width: px(style.borderTopWidth), color: style.borderTopColor },
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
/** Differences between a measurement and its baseline: ±1px for sizes, ±2 per color channel. */
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
        const ok = part === 'weight' ? got[part] === want[part] : near(got[part], want[part]);
        if (!ok) problems.push(`font.${part} ${got[part]} ≠ ${want[part]}`);
      }
    } else if (key === 'pad') { if (!want.every((v, i) => near(got[i], v))) problems.push(`pad ${got} ≠ ${want}`); }
    else if (key === 'border') {
      if (!near(got.width, want.width)) problems.push(`border.width ${got.width} ≠ ${want.width}`);
      else if (want.width > 0 && !sameColor(got.color, want.color)) problems.push(`border.color ${got.color} ≠ ${want.color}`);
    } else if (!near(got, want)) problems.push(`${key} ${got} ≠ ${want}`);
  }
  return problems;
}
