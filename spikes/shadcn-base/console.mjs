import { createRequire } from 'node:module';
const require = createRequire(process.argv[2] + '/');
const { chromium } = require('@playwright/test');
const b = await chromium.launch(); const p = await b.newPage();
p.on('console', m => m.type() === 'error' && console.log('console:', m.text().slice(0, 300))); p.on('pageerror', e => console.log('pageerror:', e.message.slice(0, 300)));
await p.goto(process.argv[3]); await p.waitForTimeout(1500); console.log('body text:', (await p.textContent('body')).slice(0, 80)); await b.close();
