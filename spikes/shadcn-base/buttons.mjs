import { createRequire } from 'node:module';
const require = createRequire(process.argv[2] + '/');
const { chromium } = require('@playwright/test');
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(process.argv[3]); await p.waitForLoadState('networkidle');
console.log(await p.evaluate(() => [...document.querySelectorAll('button,[role=button],[role=combobox],input')].map(e => `${e.tagName}${e.getAttribute('role') ? '[' + e.getAttribute('role') + ']' : ''}:${e.getAttribute('aria-label') || e.textContent.trim().slice(0, 20) || e.placeholder}`).join(' | ')));
await b.close();
