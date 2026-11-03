// tabs → CDS Tabs (DefaultTab, DefaultTabsActiveIndicator): an active, an
// inactive and a disabled tab, the active tab's underline and the panel below.
// The selectors are ARIA state, which Radix and CDS both render; CDS sets the
// label in an h2 inside each tab, Neon in the trigger itself.
const at = '[data-measure=tabs-default]';
const tab = (state) => `${at} [role=tab]${state}`;
const same = (selector, check) => ({ cds: selector, neon: selector, check });
const active = tab('[aria-selected=true]');
const inactive = tab('[aria-selected=false]:not(:disabled)');
const disabled = tab(':disabled');

export const screens = [{
  targets: {
    tabList: same(`${at} [role=tablist]`, ['h', 'bg']),
    activeTab: same(active, ['h', 'w', 'bg', 'opacity']),
    activeLabel: same(active, ['font', 'color']),
    inactiveTab: same(inactive, ['h', 'w', 'bg', 'opacity']),
    inactiveLabel: same(inactive, ['font', 'color']),
    disabledTab: same(disabled, ['h', 'w', 'opacity']),
    disabledLabel: same(disabled, ['font', 'color']),
    indicator: { cds: `${at} [data-testid=tabs-active-indicator]`, neon: `${at} [data-slot=tabs-indicator]`, check: ['h', 'w', 'bg'] },
    panelText: same(`${at} [role=tabpanel] p`, ['font', 'color']),
  },
  gaps: [
    ['activeTab', 'inactiveTab', 'x'],
    ['inactiveTab', 'disabledTab', 'x'],
    ['activeTab', 'indicator', 'y'],
    ['tabList', 'panelText', 'y'],
  ],
  extraTargets: {},
}];
