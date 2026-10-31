// PROTOTYPE (spike): measure rendered geometry/typography of matching elements.
import { createRequire } from 'node:module';
const require = createRequire(process.argv[2] + '/');
const { chromium } = require('@playwright/test');
const [, , , url, out] = process.argv;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(url); await page.waitForLoadState('networkidle'); await page.evaluate(() => document.fonts.ready);
const targets = {
  h1: () => [...document.querySelectorAll('h1')][0],
  h2: () => [...document.querySelectorAll('h2')][0],
  approve: () => [...document.querySelectorAll('button')].find(b => b.textContent.includes('Approve')),
  secondaryBtn: () => [...document.querySelectorAll('button')].find(b => b.textContent.includes('ขอข้อมูลเพิ่ม')),
  rejectBtn: () => [...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'ปฏิเสธ'),
  input: () => document.querySelector('input[placeholder="ชื่อผู้ขอ"]'),
  inputLabel: () => [...document.querySelectorAll('label')].find(l => l.textContent.includes('Search')),
  textarea: () => document.querySelector('textarea'),
  listRow: () => [...document.querySelectorAll('button,[role=button],li,a,div')].filter(e => e.textContent.includes('Kanya Srisuk') && e.textContent.includes('ลาพักร้อน')).sort((a, b) => a.textContent.length - b.textContent.length).find(e => e.getBoundingClientRect().height > 40),
  rowTitle: () => [...document.querySelectorAll('*')].find(e => e.childElementCount === 0 && e.textContent.trim() === 'Kanya Srisuk'),
  rowDesc: () => [...document.querySelectorAll('*')].filter(e => e.childElementCount === 0 && e.textContent.trim() === 'ลาพักร้อน')[0],
  tag: () => [...document.querySelectorAll('*')].filter(e => e.childElementCount === 0 && e.textContent.trim() === 'อนุมัติแล้ว')[0],
  segment: () => [...document.querySelectorAll('button,[role=tab],[role=radio],label')].find(e => e.textContent.trim() === 'ทั้งหมด'),
  bodyText: () => [...document.querySelectorAll('*')].find(e => e.childElementCount === 0 && e.textContent.startsWith('ขออนุมัติตาม')),
  checkbox: () => document.querySelector('[role=checkbox], input[type=checkbox]'),
  avatarLarge: () => [...document.querySelectorAll('*')].filter(e => { const r = e.getBoundingClientRect(); return r.width === r.height && r.width >= 48 && getComputedStyle(e).borderRadius.includes('%') || (r.width === r.height && r.width >= 48 && parseFloat(getComputedStyle(e).borderRadius) >= r.width / 2); })[0],
};
const result = {};
for (const [name, fn] of Object.entries(targets)) {
  result[name] = await page.evaluate(src => {
    const el = eval(`(${src})`)();
    if (!el) return null;
    const r = el.getBoundingClientRect(), s = getComputedStyle(el);
    return { w: Math.round(r.width), h: Math.round(r.height), font: `${s.fontSize}/${s.lineHeight} ${s.fontWeight}`, family: s.fontFamily.split(',')[0], radius: s.borderRadius, pad: `${s.paddingTop} ${s.paddingRight}`, bg: s.backgroundColor, color: s.color, border: s.borderTopWidth + ' ' + s.borderTopColor };
  }, fn.toString());
}
console.log(JSON.stringify(result, null, 1));
if (out) await page.screenshot({ path: out });
await browser.close();
