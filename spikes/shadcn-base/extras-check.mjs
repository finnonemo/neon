// PROTOTYPE (spike): keyboard/focus/a11y behavior of overlays, select, date picker, table, plus axe.
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
const require = createRequire(process.argv[2] + '/');
const { chromium } = require('@playwright/test');
const axeSrc = readFileSync(process.argv[3], 'utf8');
const [, , , , base, shot] = process.argv;
const browser = await chromium.launch();
const out = {};
const step = async (name, fn) => { try { await fresh(); out[name] = await fn(); } catch (e) { out[name] = 'ERROR ' + e.message.split('\n')[0]; } };
const active = (page) => page.evaluate(() => { const a = document.activeElement; return a ? (a.getAttribute('aria-label') || a.textContent.trim().slice(0, 30) || a.tagName) : null; });
const visibleText = (page, t) => page.getByText(t, { exact: true }).filter({ visible: true }).count();

async function axe(page) {
  await page.addScriptTag({ content: axeSrc });
  const r = await page.evaluate(async () => (await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa'] })).violations.map(v => `${v.id}(${v.impact})x${v.nodes.length}: ` + v.nodes.slice(0, 3).map(n => n.target.join(' ') + ' ' + (n.any[0]?.message || n.all[0]?.message || '').slice(0, 90)).join(' ;; ')));
  return r;
}
for (const mode of ['', '&dark']) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${base}/?x${mode}`); await page.waitForLoadState('networkidle');
  out[`axe main ${mode || 'light'}`] = await axe(page);
  await page.goto(`${base}/?extras${mode}`); await page.waitForLoadState('networkidle');
  out[`axe extras ${mode || 'light'}`] = await axe(page);
  if (!mode) await page.screenshot({ path: `${shot}-extras.png` });
  await page.close();
}
let page;
const fresh = async () => { if (page) await page.close(); page = await browser.newPage({ viewport: { width: 1440, height: 900 } }); await page.goto(`${base}/?extras`); await page.waitForLoadState('networkidle'); await page.evaluate(() => document.fonts.ready); };

await step('table', () => page.evaluate(() => {
  const th = document.querySelector('thead th, thead td'); const td = document.querySelector('tbody tr'); const s = getComputedStyle(th.querySelector('*:not(:has(*))') || th);
  return { headerFont: `${s.fontSize}/${s.lineHeight} ${s.fontWeight}`, headerColor: s.color, rowHeight: Math.round(td.getBoundingClientRect().height) };
}));
await step('select keyboard', async () => {
  const trigger = page.getByRole('button', { name: /ประเภท|เลือกประเภท/ }).or(page.getByRole('combobox')).first(); await trigger.focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(300);
  const options = () => page.getByRole('option').filter({ visible: true }).count();
  const opened = await options();
  await page.screenshot({ path: `${shot}-select.png` });
  await page.keyboard.press('ArrowDown'); await page.keyboard.press('ArrowDown'); await page.keyboard.press('Enter'); await page.waitForTimeout(300);
  const closed = (await options()) === 0;
  const shown = await trigger.evaluate(e => (e.value || e.textContent || '').trim()).catch(() => '?');
  const r = { optionRolesVisibleAfterEnter: opened, closedAfterPick: closed, triggerShows: shown, focus: await active(page) };
  if (!closed) { await page.keyboard.press('Escape'); await page.waitForTimeout(300); r.closedAfterEscape = (await options()) === 0; }
  return r;
});
await step('date picker', async () => {
  await page.getByRole('button', { name: /^(Open calendar|วันที่ส่ง)/ }).first().click(); await page.waitForTimeout(500);
  const opened = await page.evaluate(() => document.querySelectorAll('[role=grid],[role=dialog]').length);
  const focusOnOpen = await active(page);
  await page.screenshot({ path: `${shot}-date.png` });
  await page.getByRole('button', { name: /\b15(th)?\b/ }).first().click(); await page.waitForTimeout(400);
  const value = await page.evaluate(() => { const i = [...document.querySelectorAll('input')].find(e => e.value); const b = [...document.querySelectorAll('button')].find(e => /\d{1,2}\/\d{1,2}\/\d{4}/.test(e.textContent)); return i?.value || b?.textContent.trim() || null; });
  const stillOpen = await page.evaluate(() => document.querySelectorAll('[role=grid],[role=dialog]').length);
  return { opened: opened > 0, focusOnOpen, pickedValue: value, closedAfterPick: stillOpen === 0, focusAfterPick: await active(page) };
});
await step('row menu', async () => {
  const trigger = page.getByRole('button', { name: 'ตัวเลือก Somchai Jaidee' }); await trigger.click(); await page.waitForTimeout(300);
  const items = await page.getByRole('menuitem').count(); const visible = await visibleText(page, 'ดูรายละเอียด');
  await page.screenshot({ path: `${shot}-menu.png` });
  await page.keyboard.press('ArrowDown'); const afterArrow = await active(page);
  await page.keyboard.press('Escape'); await page.waitForTimeout(300);
  return { menuitemRoles: items, itemsVisible: visible > 0, focusAfterArrow: afterArrow, closedOnEscape: (await page.getByRole('menuitem').filter({ visible: true }).count()) === 0, focusReturned: await active(page) };
});
await step('dialog', async () => {
  const trigger = page.getByRole('button', { name: 'ปฏิเสธคำขอ' }); await trigger.click(); await page.waitForTimeout(500);
  const dlg = page.getByRole('dialog'); const n = await dlg.count();
  const info = n ? await dlg.first().evaluate(d => ({ ariaModal: d.getAttribute('aria-modal'), labelled: !!(d.getAttribute('aria-labelledby') || d.getAttribute('aria-label')), focusInside: d.contains(document.activeElement) })) : {};
  await page.screenshot({ path: `${shot}-dialog.png` });
  let trapped = true; for (let i = 0; i < 6; i++) { await page.keyboard.press('Tab'); if (n && !(await dlg.first().evaluate(d => d.contains(document.activeElement)))) trapped = false; }
  await page.keyboard.press('Escape'); await page.waitForTimeout(500);
  return { dialogRole: n, ...info, focusTrapped: trapped, closedOnEscape: (await page.getByRole('dialog').count()) === 0, focusReturned: await active(page) };
});
await step('toast', async () => {
  await page.getByRole('button', { name: 'บันทึก', exact: true }).click(); await page.waitForTimeout(600);
  const shown = await visibleText(page, 'บันทึกแล้ว / Saved');
  const live = await page.evaluate(() => { const el = [...document.querySelectorAll('*')].find(e => e.childElementCount === 0 && e.textContent.trim() === 'บันทึกแล้ว / Saved'); const r = el?.closest('[role=status],[role=alert],[aria-live]'); return r ? (r.getAttribute('role') || 'aria-live=' + r.getAttribute('aria-live')) : null; });
  await page.screenshot({ path: `${shot}-toast.png` });
  return { visible: shown > 0, liveRegion: live };
});
await step('tooltip on focus', async () => {
  await page.getByRole('button', { name: 'ช่วยเหลือ', exact: true }).focus(); await page.waitForTimeout(900);
  const shown = await visibleText(page, 'ช่วยเหลือ / Help');
  const describedBy = await page.getByRole('button', { name: 'ช่วยเหลือ', exact: true }).evaluate(b => b.getAttribute('aria-describedby'));
  return { visibleOnKeyboardFocus: shown > 0, ariaDescribedby: !!describedBy };
});
console.log(JSON.stringify(out, null, 1));
await browser.close();
