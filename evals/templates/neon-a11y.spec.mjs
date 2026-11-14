// The Neon base's own accessibility: axe on every screen in both modes, tag
// contrast, the segmented control's keyboard, focus return from the overlays
// and the DatePicker's format. Runs on the neon target only.
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { computedColor as computed, expansionItems, focusColor, gotoExpansion, keyboardFocus, settled } from './expansion.mjs';

test.skip(process.env.NEON_TARGET !== 'neon', 'The Neon base only');

for (const [layout, mode] of ['approval', 'extras', 'expansion'].flatMap((layout) => ['light', 'dark'].map((mode) => [layout, mode]))) {
  test(`${layout} passes axe in ${mode}`, async ({ page }) => {
    await page.goto(`/?layout=${layout}${mode === 'dark' ? '&mode=dark' : ''}`);
    await page.evaluate(() => document.fonts.ready);
    // Colors transition into dark mode; axe reads them once they settle.
    await settled(page);
    // The role-and-color span probes cn, not a component, so axe skips it. A disabled field's helper
    // is Core's Text/text-disabled, part of an inactive control (WCAG 1.4.3 exempts it); axe exempts
    // a disabled control's label but not its description.
    const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .exclude('[data-measure=role-and-color]').exclude('[data-measure=field-disabled] [data-slot=field-description]').analyze();
    expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
  });
}

// Axe reads each overlay open, which the screen pass above cannot. An alert dialog and a sheet
// read theirs in their own expansion files.
const overlays = [
  ['dialog', 'click', '[data-measure=actions] button:nth-of-type(1)', '[data-slot=dialog-content]'],
  ['popover', 'click', '[data-measure=core-popover] button', '[data-slot=popover-content]'],
  ['menu', 'click', '[data-measure=core-menu] button', '[data-slot=dropdown-menu-content]'],
  ['tooltip', 'focus', '[data-measure=help] button', '[data-slot=tooltip-content]'],
  ['toast', 'click', '[data-measure=toast-action] button', '[data-sonner-toast]'],
];
for (const [name, action, trigger, surface] of overlays) for (const mode of ['light', 'dark']) {
  test(`an open ${name} passes axe in ${mode}`, async ({ page }) => {
    await page.goto(`/?layout=extras${mode === 'dark' ? '&mode=dark' : ''}`);
    await page.evaluate(() => document.fonts.ready);
    await page.locator(trigger)[action]();
    await expect(page.locator(surface)).toBeVisible();
    await settled(page);
    const { violations } = await new AxeBuilder({ page }).include(surface).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
  });
}

test('every tag reads at 4.5:1 or more on its wash in light', async ({ page }) => {
  await page.goto('/?layout=approval');
  const ratios = await page.$$eval('[data-slot=tag]', (tags) => {
    const luminance = (rgb) => {
      const [r, g, b] = rgb.match(/[\d.]+/g).slice(0, 3).map((v) => { const c = Number(v) / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    return tags.map((tag) => {
      const style = getComputedStyle(tag);
      const [a, b] = [luminance(style.color), luminance(style.backgroundColor)].sort((x, y) => y - x);
      return { variant: tag.dataset.variant, ratio: Math.round(((a + 0.05) / (b + 0.05)) * 100) / 100 };
    });
  });
  expect(new Set(ratios.map((r) => r.variant))).toEqual(new Set(['warning', 'positive', 'negative']));
  for (const { variant, ratio } of ratios) expect(ratio, `${variant} tag`).toBeGreaterThanOrEqual(4.5);
});

// Core's List item: Focus turns the row's 2px stroke Focus/focus and hides its Divider.
for (const mode of ['light', 'dark']) test(`${mode}: a list row reached from the keyboard draws Core's Focus stroke inside it and hides its Divider`, async ({ page }) => {
  await page.goto(`/?layout=approval${mode === 'dark' ? '&mode=dark' : ''}`);
  const item = page.locator('[data-measure=list] li:nth-child(2)');
  const divider = item.locator('[data-slot=list-row-divider]');
  await expect(divider).toBeVisible();
  const focus = await keyboardFocus(page, item.locator('[data-slot=list-row]'));
  expect(focus.focusVisible).toBe(true);
  expect(focus.after).toBe(`outline 2px ${await focusColor(page)} -2px`);
  await expect(divider).toBeHidden();
});

test('a selected list row shows by its Checkmark, one line is 56px and the last row has no Divider', async ({ page }) => {
  await page.goto('/?layout=approval');
  const rows = page.locator('[data-measure=list] [data-slot=list-row]');
  await expect(rows.first()).toHaveAttribute('aria-current', 'true');
  await expect(rows.first().locator('[data-slot=list-row-check]')).toBeVisible();
  await expect(rows.nth(1).locator('[data-slot=list-row-check]')).toHaveCount(0);
  await expect(page.locator('[data-measure=list] li:last-child [data-slot=list-row-divider]')).toBeHidden();
  await page.goto('/?layout=extras');
  const oneLine = page.locator('[data-measure=core-list] li:nth-child(2) [data-slot=list-row]');
  expect((await oneLine.boundingBox()).height).toBe(56);
  await expect(page.locator('[data-measure=core-list] li:nth-child(1) [data-slot=list-row]')).toBeDisabled();
});

// Core's Table: Hover is a Body row's.
test('a table row fills on hover in the body only', async ({ page }) => {
  await page.goto('/?layout=extras');
  const hover = await computed(page, 'var(--layer-hover)');
  const fill = async (row) => { await row.hover(); await settled(page); return row.evaluate((el) => getComputedStyle(el).backgroundColor); };
  expect(await fill(page.locator('[data-measure=table] tbody tr').first())).toBe(hover);
  expect(await fill(page.locator('[data-measure=table] thead tr'))).not.toBe(hover);
});

test('the segmented control is one radio group the arrow keys move through', async ({ page }) => {
  await page.goto('/?layout=approval');
  const group = page.getByRole('radiogroup', { name: 'สถานะ / Status' });
  await group.getByRole('radio', { name: 'ทั้งหมด' }).focus();
  // Radix checks the radio its focus lands on only while the arrow is still down.
  await page.keyboard.down('ArrowRight');
  await expect(group.getByRole('radio', { name: 'รอ' })).toBeChecked();
  await page.keyboard.up('ArrowRight');
  await expect(group.getByRole('radio', { name: 'รอ' })).toBeFocused();
  await expect(page.locator('[data-measure=list] [data-slot=tag]')).toHaveText(Array(4).fill('รออนุมัติ'));
});

// Core's Focus state: the stroke inside the control turns Focus/focus, 3px on a field and 2px on a segment.
// A focused text field on the web is being edited, so it takes State=Focus, not Core's ring outside a field at rest.
for (const mode of ['light', 'dark']) test(`${mode}: a field and a segment reached from the keyboard draw Core's Focus stroke inside them`, async ({ page }) => {
  const dark = mode === 'dark' ? '&mode=dark' : '';
  await page.goto(`/?layout=approval${dark}`);
  const inside = async (control, width) => {
    const focus = await keyboardFocus(page, control);
    expect(focus.focusVisible).toBe(true);
    expect(focus.after).toBe(`outline ${width}px ${await focusColor(page)} -${width}px`);
  };
  await inside(page.locator('[data-measure=search] input'), 3);
  await inside(page.getByRole('radiogroup', { name: 'สถานะ / Status' }).getByRole('radio', { name: 'ทั้งหมด' }), 2);
  await page.goto(`/?layout=approval&pane=inspector${dark}`);
  await inside(page.locator('[data-measure=notes] textarea'), 3);
  await page.goto(`/?layout=extras${dark}`);
  await inside(page.locator('[data-measure=select] [data-slot=select-trigger]'), 3);
  // Focus shows over invalid, and a read-only field's 2px stroke grows to the 3px Focus stroke.
  await inside(page.locator('[data-measure=core-fields] [data-field=invalid] input'), 3);
  await inside(page.locator('[data-measure=core-fields] [data-field=read-only] input'), 3);
});

test('the dialog and the row menu return focus to their triggers', async ({ page }) => {
  await page.goto('/?layout=extras');
  const reject = page.getByRole('button', { name: 'ปฏิเสธคำขอ' });
  await reject.click();
  const dialog = page.getByRole('dialog', { name: 'ยืนยันการปฏิเสธ' });
  await expect(dialog).toBeVisible();
  // Radix hides the page behind the dialog from assistive technology, and keeps
  // every live region reachable: the toaster's, and the month heading of each
  // calendar on the screen (react-day-picker's aria-live). So it hides the
  // sections beside the calendars' rather than main (the trigger's own, and the
  // one after the calendars), and in a calendar everything but that heading.
  await expect(page.locator('[data-measure=actions]')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('[data-measure=core-buttons]')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('[data-measure=core-calendar] [data-calendar=date] [role=grid]')).toHaveAttribute('aria-hidden', 'true');
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(reject).toBeFocused();

  const more = page.getByRole('button', { name: 'ตัวเลือก Somchai Jaidee' });
  await more.click();
  await expect(page.getByRole('menu')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('menu')).toBeHidden();
  await expect(more).toBeFocused();
});

// Core's Layer/layer-hover-01 and Layer/layer-active-01 (core/theme.json).
const layerFill = { light: { hover: 'rgba(1, 23, 43, 0.05)', active: 'rgba(1, 23, 43, 0.08)' }, dark: { hover: 'rgba(255, 255, 255, 0.08)', active: 'rgba(255, 255, 255, 0.12)' } };

test('a menu row fills Layer/layer-hover-01 under the pointer and draws the Focus/focus stroke, with no fill, from the keyboard', async ({ page }) => {
  for (const mode of ['light', 'dark']) {
    await page.goto(`/?layout=extras${mode === 'dark' ? '&mode=dark' : ''}`);
    const trigger = page.locator('[data-measure=core-menu] button');
    const row = page.getByRole('menuitem', { name: 'แก้ไข' });
    const drawn = () => row.evaluate((el) => {
      const style = getComputedStyle(el);
      return { bg: style.backgroundColor, outline: `${style.outlineWidth} ${style.outlineColor}` };
    });
    const clear = 'rgba(0, 0, 0, 0)';
    // The pointer: the hover fill and no stroke, then the pressed fill; the press picks the row and closes the menu.
    await trigger.click();
    await row.hover();
    await settled(page);
    expect(await drawn(), `${mode} pointer`).toEqual({ bg: layerFill[mode].hover, outline: `2px ${clear}` });
    await page.mouse.down();
    await settled(page);
    expect((await drawn()).bg, `${mode} pressed`).toBe(layerFill[mode].active);
    await page.mouse.up();
    await expect(page.getByRole('menu')).toBeHidden();
    await expect(trigger).toBeFocused();

    // Opened from the keyboard, Radix moves focus to the first row: the stroke, and no fill.
    await page.mouse.move(0, 0);
    await page.keyboard.press('Enter');
    await expect(row).toBeFocused();
    await settled(page);
    expect(await drawn(), `${mode} keyboard`).toEqual({ bg: clear, outline: `2px ${await focusColor(page)}` });
    // A disabled row is skipped: the next key lands on the row after it.
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('menuitem', { name: 'ลบ' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('menu')).toBeHidden();
    await expect(trigger).toBeFocused();
  }
});

test('a popover is a dialog its trigger opens, and Escape or a press outside closes it with focus back on the trigger', async ({ page }) => {
  await page.goto('/?layout=extras');
  const trigger = page.locator('[data-measure=core-popover] button');
  const popover = page.locator('[data-slot=popover-content]');
  await trigger.click();
  await expect(popover).toBeVisible();
  await expect(popover).toHaveRole('dialog');
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(popover).toBeHidden();
  await expect(trigger).toBeFocused();

  await trigger.click();
  await expect(popover).toBeVisible();
  await page.locator('[data-measure=title] h1').click();
  await expect(popover).toBeHidden();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
});

test('a tooltip names its icon button, its caret meets the trigger, and Esc closes it with focus still on the trigger', async ({ page }) => {
  await page.goto('/?layout=extras');
  for (const [hook, caret] of [['help', { width: 16, height: 8 }], ['help-sm', { width: 8, height: 4 }], ['help-lg', { width: 16, height: 8 }]]) {
    const trigger = page.locator(`[data-measure=${hook}] button`);
    await trigger.focus();
    const tip = page.locator('[data-slot=tooltip-content]');
    await expect(tip).toBeVisible();
    await settled(page);
    const arrow = await tip.locator('[data-slot=tooltip-arrow]').boundingBox();
    const box = await trigger.boundingBox();
    expect({ width: Math.round(arrow.width), height: Math.round(arrow.height) }).toEqual(caret);
    // The tip sits above its trigger, the caret's point on the trigger's top edge and at its center.
    expect(Math.abs(arrow.y + arrow.height - box.y)).toBeLessThanOrEqual(1);
    expect(Math.abs(arrow.x + arrow.width / 2 - (box.x + box.width / 2))).toBeLessThanOrEqual(1);
    await page.keyboard.press('Escape');
    await expect(tip).toBeHidden();
    await expect(trigger).toBeFocused();
  }
});

test('picking an option closes the select', async ({ page }) => {
  await page.goto('/?layout=extras');
  await page.getByRole('combobox', { name: 'ประเภท / Type' }).click();
  await page.getByRole('option', { name: 'ลาพักร้อน' }).click();
  await expect(page.getByRole('listbox')).toBeHidden();
  await expect(page.getByRole('combobox', { name: 'ประเภท / Type' })).toHaveText('ลาพักร้อน');
});

test('the toast is announced politely without a provider in the screen', async ({ page }) => {
  await page.goto('/?layout=extras');
  await page.getByRole('button', { name: 'บันทึก', exact: true }).click();
  await expect(page.locator('[data-sonner-toast]')).toHaveText('บันทึกแล้ว / Saved');
  await expect(page.locator('section[aria-live]')).toHaveAttribute('aria-live', 'polite');
});

// Core's Snackbar (core/components/snackbar.md, Usage): at the top, never the bottom. Up to 600
// wide it is flush under the status bar, here the top of the page, and 8 from each side; past
// 600 it is centered 16 from the top edge and 320 to 540 wide: sonner's 356.
test('a toast sits at the top center: flush with the top and 8 from each side on a phone, 16 from the top past 600', async ({ page }) => {
  const placed = async (width) => {
    await page.setViewportSize({ width, height: 812 });
    await page.goto('/?layout=extras');
    await page.getByRole('button', { name: 'บันทึก', exact: true }).click();
    const toast = page.locator('[data-sonner-toast]');
    await expect(toast).toBeVisible();
    await settled(page);
    const box = await toast.boundingBox();
    return { top: Math.round(box.y), left: Math.round(box.x), right: Math.round(width - box.x - box.width), width: Math.round(box.width) };
  };
  expect(await placed(375)).toEqual({ top: 0, left: 8, right: 8, width: 359 });
  expect(await placed(600)).toEqual({ top: 0, left: 8, right: 8, width: 584 });
  expect(await placed(1440)).toEqual({ top: 16, left: 542, right: 542, width: 356 });
});

test('a toast leaves focus on its trigger, sets its icon 16px from its text, and its action fills on hover', async ({ page }) => {
  await page.goto('/?layout=extras');
  const trigger = page.locator('[data-measure=toast-action] button');
  await trigger.focus();
  await page.keyboard.press('Enter');
  const toast = page.locator('[data-sonner-toast]');
  await expect(toast).toBeVisible();
  await expect(trigger).toBeFocused();
  await settled(page);
  const icon = await toast.locator('[data-icon]').boundingBox();
  const text = await toast.locator('[data-title]').boundingBox();
  expect(Math.round(text.x - (icon.x + icon.width))).toBe(16);
  // Core's Medium glyph, 18px in a 24px box that stays by the first line: 16px below the toast's top.
  expect(Math.round(icon.y - (await toast.boundingBox()).y)).toBe(16);
  expect(await toast.locator('[data-icon] svg').evaluate((el) => el.getBoundingClientRect().width)).toBe(18);
  const action = toast.getByRole('button', { name: 'เลิกทำ' });
  await action.hover();
  await settled(page);
  expect(await action.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(await computed(page, 'var(--color-bgButtonTertiaryInverseHover)'));
  await action.click();
  await expect(toast).toBeHidden();
});

for (const mode of ['light', 'dark']) test(`${mode}: a button reached from the keyboard draws Core's focus color and its Hover fill`, async ({ page }) => {
  await page.goto(`/?layout=extras${mode === 'dark' ? '&mode=dark' : ''}`);
  const save = page.getByRole('button', { name: 'บันทึก', exact: true });
  const focus = await keyboardFocus(page, save);
  expect(focus.focusVisible).toBe(true);
  expect(focus.before).toBe('');
  // Focus/focus, 2px, 2px outside the button.
  expect(focus.after).toBe(`outline 2px ${await focusColor(page)} 2px`);
  await expect(save).toHaveCSS('background-color', await computed(page, 'var(--color-bgButtonSecondaryHover)'));
});

// Core's Checkbox: the Focus ring is square, Focus/focus 2px wide, its outer edge 4px out from the Box.
for (const mode of ['light', 'dark']) test(`${mode}: a checkbox reached from the keyboard draws Core's square Focus ring`, async ({ page }) => {
  await page.goto(`/?layout=extras${mode === 'dark' ? '&mode=dark' : ''}`);
  const news = page.getByRole('checkbox', { name: 'รับข่าวสาร / News' });
  const focus = await keyboardFocus(page, news);
  await expect(news).toBeFocused();
  expect(focus.focusVisible).toBe(true);
  expect(focus.before).toBe('');
  expect(focus.after).toBe(`outline 2px ${await focusColor(page)} 2px`);
  await expect(news).toHaveCSS('border-radius', '0px');
});

// One glyph per Selection, always drawn: the outlined square, the square cut by a check, the square cut by a bar.
test('a checkbox draws the glyph of its Selection, Space ticks it and a press takes indeterminate to checked', async ({ page }) => {
  await page.goto('/?layout=extras');
  const drawn = (box) => box.locator('[data-slot=checkbox-indicator] path').evaluateAll((paths) =>
    paths.flatMap((path, at) => (getComputedStyle(path).display === 'none' ? [] : [at])));
  const news = page.getByRole('checkbox', { name: 'รับข่าวสาร / News' });
  await expect(news).toHaveAttribute('aria-checked', 'false');
  expect(await drawn(news)).toEqual([0]);
  await news.focus();
  await page.keyboard.press('Space');
  await expect(news).toHaveAttribute('aria-checked', 'true');
  expect(await drawn(news)).toEqual([1]);
  await page.keyboard.press('Space');
  await expect(news).toHaveAttribute('aria-checked', 'false');

  const all = page.getByRole('checkbox', { name: 'ทุกบัญชี / All accounts' });
  await expect(all).toHaveAttribute('aria-checked', 'mixed');
  expect(await drawn(all)).toEqual([2]);
  await all.click();
  await expect(all).toHaveAttribute('aria-checked', 'true');
  expect(await drawn(all)).toEqual([1]);

  const channels = page.getByRole('checkbox', { name: 'ทุกช่องทาง / All channels' });
  await expect(channels).toBeDisabled();
  await expect(channels).toHaveAttribute('aria-checked', 'mixed');
  expect(await drawn(channels)).toEqual([2]);
});

// Core's Date and time: the calendar's three fixtures, with 15 October as today.
const gotoCalendars = async (page, mode = 'light') => {
  await page.clock.setFixedTime(new Date(2026, 9, 15, 12));
  await page.goto(`/?layout=extras${mode === 'dark' ? '&mode=dark' : ''}`);
  await page.evaluate(() => document.fonts.ready);
};
const calendarDay = (page, hook, date) => page.locator(`[data-measure=core-calendar] [data-calendar=${hook}] button[data-day="${date}"]`);
const box = async (locator) => {
  const { x, y, width, height } = await locator.boundingBox();
  return { left: Math.round(x), top: Math.round(y), right: Math.round(x + width), bottom: Math.round(y + height) };
};

// The cell is the target; the ring is drawn on the 36px Mark inside it: Focus/focus, 2px, 2px out.
for (const mode of ['light', 'dark']) test(`${mode}: a calendar day reached from the keyboard draws Core's Focus ring outside its Mark, and the pointer fills a Mark`, async ({ page }) => {
  await gotoCalendars(page, mode);
  await calendarDay(page, 'date', '2026-10-10').focus();
  await page.keyboard.press('ArrowRight');
  const day = calendarDay(page, 'date', '2026-10-11');
  await expect(day).toBeFocused();
  expect(await day.evaluate((el) => el.matches(':focus-visible'))).toBe(true);
  await expect(day).toHaveCSS('outline-style', 'none');
  const mark = day.locator('[data-slot=calendar-day-mark]');
  await expect(mark).toHaveCSS('outline-style', 'solid');
  await expect(mark).toHaveCSS('outline-width', '2px');
  await expect(mark).toHaveCSS('outline-offset', '2px');
  await expect(mark).toHaveCSS('outline-color', await focusColor(page));
  // A day the pointer is over takes Layer/layer-hover-01 in its Mark; a picked day keeps its disc.
  const hovered = calendarDay(page, 'date', '2026-10-20');
  await hovered.hover();
  await expect(hovered.locator('[data-slot=calendar-day-mark]')).toHaveCSS('background-color', await computed(page, 'var(--color-bgElevation1Hover)'));
  const picked = calendarDay(page, 'date', '2026-10-10');
  await picked.hover();
  await expect(picked.locator('[data-slot=calendar-day-mark]')).toHaveCSS('background-color', await computed(page, 'var(--color-bgToggleOn)'));
});

test("a calendar's Header, Weekdays and Weeks stack with no gap, and today's dot sits 4 under its number", async ({ page }) => {
  await gotoCalendars(page);
  const calendar = page.locator('[data-measure=core-calendar] [data-calendar=date] [data-slot=calendar]');
  const header = await box(calendar.locator('.rdp-month_caption'));
  const weekdays = await box(calendar.locator('.rdp-weekdays'));
  const weeks = await Promise.all((await calendar.locator('.rdp-week').all()).map(box));
  expect(weekdays.top).toBe(header.bottom);
  expect(weeks[0].top).toBe(weekdays.bottom);
  for (let at = 1; at < weeks.length; at++) expect(weeks[at].top).toBe(weeks[at - 1].bottom);
  // Seven 48px days: the grid is 336 wide, the arrows end at its right edge.
  expect(weeks[0].right - weeks[0].left).toBe(336);
  expect((await box(calendar.locator('.rdp-button_next'))).right).toBe(weeks[0].right);
  expect((await box(calendarDay(page, 'date', '2026-10-21'))).left).toBe((await box(calendarDay(page, 'date', '2026-10-20'))).right);
  await expect(calendar.locator('.rdp-weekday')).toHaveText(['S', 'M', 'T', 'W', 'T', 'F', 'S']);
  await expect(calendar.locator('.rdp-weekday').first()).toHaveAttribute('aria-label', 'Sunday');

  const today = calendarDay(page, 'date', '2026-10-15');
  const number = await box(today.locator('[data-slot=calendar-day-number]'));
  const dot = await box(today.locator('[data-slot=calendar-day-dot]'));
  expect(dot.top - number.bottom).toBe(4);
  expect(dot.left + dot.right).toBe(number.left + number.right);
  // Current and Selected is drawn as Selected: the dot goes.
  await expect(calendarDay(page, 'today', '2026-10-15').locator('[data-slot=calendar-day-dot]')).toHaveCount(0);
});

test('a calendar announces its days, moves by the keyboard and picks a day', async ({ page }) => {
  await gotoCalendars(page);
  const calendar = page.locator('[data-measure=core-calendar] [data-calendar=date] [data-slot=calendar]');
  await expect(calendar.getByRole('grid')).toHaveCount(1);
  const picked = calendarDay(page, 'date', '2026-10-10');
  await expect(picked).toHaveAccessibleName(/Saturday, October 10th, 2026/);
  await expect(calendar.locator('[role=gridcell][aria-selected=true]')).toHaveAttribute('data-day', '2026-10-10');
  await expect(calendarDay(page, 'date', '2026-10-15')).toHaveAttribute('aria-current', 'date');
  await expect(picked).not.toHaveAttribute('aria-current');
  // A disabled day is skipped by a press and announced.
  await expect(calendarDay(page, 'date', '2026-10-02')).toBeDisabled();

  await picked.focus();
  await page.keyboard.press('ArrowDown');
  await expect(calendarDay(page, 'date', '2026-10-17')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(calendar.locator('[role=gridcell][aria-selected=true]')).toHaveAttribute('data-day', '2026-10-17');
  await expect(picked.locator('[data-slot=calendar-day-mark]')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await page.keyboard.press('PageDown');
  await expect(calendar.locator('.rdp-caption_label')).toHaveText('November 2026');
  await expect(calendar.locator('.rdp-caption_label')).toHaveAttribute('aria-live', 'polite');
});

// Core's Icon button, Tertiary: an arrow that cannot move takes Icon/icon-disabled and no fill.
test('a calendar arrow at the first month is disabled in Core\'s Disabled ink', async ({ page }) => {
  await gotoCalendars(page);
  const calendar = page.locator('[data-measure=core-calendar] [data-calendar=today] [data-slot=calendar]');
  const previous = calendar.locator('.rdp-button_previous');
  await expect(previous).toHaveAttribute('aria-disabled', 'true');
  await expect(previous).toHaveCSS('color', await computed(page, 'var(--color-fgIconDisabled)'));
  await expect(previous).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await previous.click({ force: true });
  await expect(calendar.locator('.rdp-caption_label')).toHaveText('October 2026');
  const next = calendar.locator('.rdp-button_next');
  await expect(next).toHaveCSS('color', await computed(page, 'var(--color-fgIcon)'));
  await next.click();
  await expect(calendar.locator('.rdp-caption_label')).toHaveText('November 2026');
  await expect(previous).not.toHaveAttribute('aria-disabled');
});

// Core's Range start, In range and Range end: one band from the first disc's middle to the last's.
test("a range draws one band between its ends, and a new end moves it", async ({ page }) => {
  await gotoCalendars(page);
  const calendar = page.locator('[data-measure=core-calendar] [data-calendar=range] [data-slot=calendar]');
  const band = (date) => calendarDay(page, 'range', date).locator('[data-slot=calendar-day-band]');
  await expect(calendar.locator('[role=gridcell][aria-selected=true]')).toHaveCount(8);
  await expect(calendar.locator('[data-slot=calendar-day-band]')).toHaveCount(8);
  const start = await box(calendarDay(page, 'range', '2026-11-17'));
  const end = await box(calendarDay(page, 'range', '2026-11-24'));
  expect(await box(band('2026-11-17'))).toMatchObject({ left: start.left + 24, right: start.right });
  expect((await box(band('2026-11-18'))).left).toBe(start.right);
  expect(await box(band('2026-11-24'))).toMatchObject({ left: end.left, right: end.left + 24 });
  expect((await box(band('2026-11-23'))).right).toBe(end.left);
  // The band is 36 tall, centred in the 48px week.
  expect(await box(band('2026-11-20'))).toMatchObject({ top: start.top + 6, bottom: start.bottom - 6 });
  // The days outside it have none.
  await expect(band('2026-11-16')).toHaveCount(0);
  await expect(band('2026-11-25')).toHaveCount(0);

  await calendarDay(page, 'range', '2026-11-26').click();
  await expect(calendarDay(page, 'range', '2026-11-26')).toHaveAttribute('data-range', 'end');
  await expect(calendarDay(page, 'range', '2026-11-24')).toHaveAttribute('data-range', 'middle');
  await expect(calendar.locator('[data-slot=calendar-day-band]')).toHaveCount(10);
});

test('a loading button keeps its size, focus and name, is announced as busy and ignores a press', async ({ page }) => {
  await page.goto('/?layout=extras');
  const send = page.getByRole('button', { name: 'ส่งรายงาน' });
  const size = async () => { const { width, height } = await send.boundingBox(); return { width, height }; };
  const idle = await size();
  await send.focus();
  await page.keyboard.press('Enter');
  await expect(send).toHaveAttribute('aria-busy', 'true');
  await expect(page.locator('[data-sonner-toast]')).toHaveCount(1);
  expect(await size()).toEqual(idle);
  await expect(send).toBeFocused();
  // The spinner takes the label's place; the label stays in the button for its name and its width.
  await expect(send.locator('[data-slot=button-spinner]')).toBeVisible();
  await expect(send).toHaveCSS('-webkit-text-fill-color', 'rgba(0, 0, 0, 0)');
  await page.keyboard.press('Enter');
  await send.click();
  await page.waitForTimeout(300);
  await expect(page.locator('[data-sonner-toast]')).toHaveCount(1);
});

test('the loading spinner turns once a second and stands still under reduced motion', async ({ page }) => {
  await page.goto('/?layout=extras');
  const spinner = page.locator('[data-measure=core-buttons] [aria-busy=true] [data-slot=button-spinner]');
  await expect(spinner).toHaveCSS('animation-duration', '1s');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(spinner).toHaveCSS('animation-name', 'none');
});

test.describe('in a Thai browser', () => {
  test.use({ locale: 'th-TH' });
  test('the DatePicker shows the format it is given, with no Buddhist year', async ({ page }) => {
    await page.clock.setFixedTime(new Date(2026, 9, 15, 12));
    await page.goto('/?layout=extras');
    expect(await page.evaluate(() => new Date(2026, 9, 10).toLocaleDateString())).toContain('2569');
    const field = page.locator('[data-measure=date] [data-slot=date-picker]');
    await field.click();
    const calendar = page.locator('[data-slot=popover-content] [data-slot=calendar]');
    await expect(calendar.locator('.rdp-caption_label')).toHaveText('October 2026');
    await calendar.locator('button[data-day="2026-10-10"]').click();
    await expect(field).toHaveText('10/10/2026');
    await expect(field).toBeFocused();
  });
});

// Each registry expansion item's behavior checks, from expansion/<item>.mjs.
for (const item of expansionItems) if (item.a11y) test.describe(item.name, () => item.a11y({ test, expect, gotoExpansion, keyboardFocus, focusColor, computedColor: computed }));
