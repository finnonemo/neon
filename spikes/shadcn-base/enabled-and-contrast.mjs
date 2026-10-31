// PROTOTYPE (spike): enabled primary button colors + tag text contrast (sRGB, composited on page bg).
import { createRequire } from 'node:module';
const require = createRequire(process.argv[2] + '/');
const { chromium } = require('@playwright/test');
const browser = await chromium.launch();
for (const [app, port] of [['cds', 4801], ['shadcn', 4802]]) for (const q of ['', '?dark']) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`http://127.0.0.1:${port}/${q}`); await page.waitForLoadState('networkidle');
  await page.getByText('ตรวจสอบเอกสารครบแล้ว').click(); await page.waitForTimeout(600);
  const r = await page.evaluate(() => {
    const parse = (c) => { const ctx = document.createElement('canvas').getContext('2d'); ctx.fillStyle = c; ctx.fillRect(0, 0, 1, 1); return [...ctx.getImageData(0, 0, 1, 1).data]; };
    // Composite each ancestor background over the page background.
    const bgOf = (el) => { const layers = []; for (let e = el; e; e = e.parentElement) layers.push(getComputedStyle(e).backgroundColor); layers.push(getComputedStyle(document.body).backgroundColor);
      let acc = [255, 255, 255]; for (const l of layers.reverse()) { const c = l.match(/[\d.]+/g)?.map(Number) ?? [0,0,0,0]; let rgba;
        if (l.startsWith('rgb')) rgba = [c[0], c[1], c[2], c[3] ?? 1]; else { const p = parse(l); rgba = [p[0], p[1], p[2], p[3] / 255]; }
        acc = acc.map((v, i) => v * (1 - rgba[3]) + rgba[i] * rgba[3]); } return acc; };
    const fgOf = (el) => { const p = parse(getComputedStyle(el).color); return p.slice(0, 3); };
    const lum = (c) => { const [r, g, b] = c.map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
    const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return +((x + 0.05) / (y + 0.05)).toFixed(2); };
    const btn = [...document.querySelectorAll('button')].find(b => b.textContent.includes('Approve'));
    const s = getComputedStyle(btn);
    const tags = {};
    for (const t of ['รออนุมัติ', 'อนุมัติแล้ว', 'ปฏิเสธ']) { const el = [...document.querySelectorAll('span,div,p')].find(e => e.childElementCount === 0 && e.textContent.trim() === t && !e.closest('button:not([aria-pressed])') ); if (el) tags[t] = ratio(fgOf(el), bgOf(el)); }
    return { approve: { bg: s.backgroundColor, color: s.color, opacity: s.opacity, disabled: btn.disabled }, tagContrast: tags };
  });
  console.log(app.padEnd(7), (q || 'light').padEnd(6), JSON.stringify(r));
  await page.close();
}
await browser.close();
