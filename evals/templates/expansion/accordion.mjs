// accordion → CDS Accordion: an open item's header (its padding, title and
// caret) and panel, and a closed item below it, its long Thai/English title
// wrapping. CDS draws the line between items as a Divider and Neon as the
// item's bottom border, so the line is measured by the 1px it adds between
// one item and the next, not by its color (both are bgLine).
const at = '[data-measure=accordion-default]';
// CDS: Accordion > item, Divider, item, Divider, item (the Dividers are divs too); Neon: Accordion > item, item, item.
const cdsItem = (n) => `${at} .cds-Accordion > :nth-child(${n} of .cds-AccordionItem)`;
const neonItem = (n) => `${at} [data-slot=accordion-item]:nth-child(${n})`;
const header = (n) => ({ cds: `${cdsItem(n)} button`, neon: `${neonItem(n)} [data-slot=accordion-trigger]` });

const item = (n, name) => ({
  [`${name}Header`]: { ...header(n), check: ['h', 'w', 'bg'] },
  [`${name}HeaderBox`]: { cds: `${cdsItem(n)} button > div`, neon: `${neonItem(n)} [data-slot=accordion-trigger]`, check: ['pad'] },
  [`${name}Title`]: { cds: `${cdsItem(n)} button > div > div:first-child > div > div`, neon: `${neonItem(n)} [data-slot=accordion-trigger-title]`, check: ['h', 'w', 'font', 'color'] },
  [`${name}Caret`]: { cds: `${cdsItem(n)} [data-icon-name=caretUp]`, neon: `${neonItem(n)} [data-slot=accordion-trigger-icon]`, check: ['h', 'w', 'color'] },
});

export const screens = [{
  targets: {
    ...item(1, 'open'),
    ...item(2, 'closed'),
    panelText: { cds: `${cdsItem(1)} [role=region] p`, neon: `${neonItem(1)} [data-slot=accordion-content] p`, check: ['h', 'w', 'font', 'color'] },
  },
  gaps: [
    ['openTitle', 'openCaret', 'x'],
    ['openHeader', 'panelText', 'y'],
    ['panelText', 'closedHeader', 'y'],
    ['closedHeader', 'lastHeader', 'y'],
  ],
  extraTargets: {
    lastHeader: { ...header(3), check: [] },
  },
}];
