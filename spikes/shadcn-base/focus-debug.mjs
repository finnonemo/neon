import { createRequire } from 'node:module';
const require = createRequire(process.argv[2] + '/');
const { chromium } = require('@playwright/test');
const b = await chromium.launch(); const url = process.argv[3];
const act = (p) => p.evaluate(() => { const a = document.activeElement; return `${a.tagName}:${a.getAttribute('aria-label') || a.textContent.trim().slice(0, 20)}`; });
let p = await b.newPage(); await p.goto(url); await p.waitForLoadState('networkidle');
await p.getByRole('button', { name: 'ปฏิเสธคำขอ' }).click(); await p.waitForTimeout(500); await p.keyboard.press('Escape');
for (const t of [200, 1000, 2500]) { await p.waitForTimeout(t); console.log(`dialog +${t}`, await p.getByRole('dialog').count(), await act(p)); }
await p.close(); p = await b.newPage(); await p.goto(url); await p.waitForLoadState('networkidle');
await p.getByRole('button', { name: 'ตัวเลือก Somchai Jaidee' }).click(); await p.waitForTimeout(400); console.log('menu focus on open', await act(p)); await p.keyboard.press('Escape');
for (const t of [200, 1500]) { await p.waitForTimeout(t); console.log(`menu +${t}`, await p.getByRole('menuitem').filter({ visible: true }).count(), await act(p)); }
await p.close(); p = await b.newPage(); await p.goto(url); await p.waitForLoadState('networkidle');
const opener = p.getByRole('button', { name: /^(Open calendar|วันที่ส่ง)/ });
console.log('date openers', await opener.count());
await opener.first().click({ timeout: 4000 }).catch(e => console.log('open err', e.message.split('\n')[0]));
await p.waitForTimeout(500);
console.log('day names', await p.evaluate(() => [...document.querySelectorAll('button')].filter(e => /^15$/.test(e.textContent.trim())).map(e => e.getAttribute('aria-label'))), 'focus', await act(p));
await b.close();
