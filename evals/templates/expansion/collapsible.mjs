// collapsible → CDS Collapsible, open: the region adds no padding, fill or
// type of its own, and sits where the page's stack puts it below the trigger.
const at = '[data-measure=collapsible-default]';

export const screens = [{
  targets: {
    content: { cds: `${at} [role=region]`, neon: `${at} [data-slot=collapsible-content]`, check: ['h', 'w', 'pad', 'bg'] },
    contentText: { cds: `${at} [role=region] p`, neon: `${at} [data-slot=collapsible-content] p`, check: ['font', 'color'] },
  },
  gaps: [['trigger', 'content', 'y']],
  extraTargets: {
    trigger: { cds: `${at} button`, neon: `${at} [data-slot=collapsible-trigger]`, check: [] },
  },
}];
