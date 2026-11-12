// alert → Core's In-line banner in Primary, one per variant: the box's fill, radius and padding,
// the icon in Icon/icon-primary, then the label1 title on the label2 message. informational,
// warning and error take Core's values for what the banner's table lists; their size, the icon's
// box and the gaps stay beside the CDS Banner, where they are recorded differences. promotional
// has no Status in Core and stays on the CDS baseline. success and the title-only alert (Core's
// 80px minimum height) are not in CDS, so they are held to Core alone.
import { bannerCell } from '../core/banner.mjs';

const at = (hook) => `[data-measure=${hook}]`;
const variants = ['informational', 'warning', 'error', 'promotional'];
const core = (part, variant) => (variant === 'promotional' ? {} : { core: bannerCell(part, variant) });
const parts = (variant) => {
  const hook = at(`alert-${variant}`);
  return {
    [`${variant}Box`]: { cds: `${hook} .cds-Banner-content`, neon: `${hook} [data-slot=alert]`, check: ['h', 'w', 'pad', 'radius', 'bg', 'border'], ...core('box', variant), coreProperties: ['pad', 'radius', 'bg'] },
    [`${variant}Icon`]: { cds: `${hook} .cds-Banner-start span[role=img]`, neon: `${hook} [data-slot=alert-content] > svg`, check: ['h', 'w', 'color'], ...core('icon', variant) },
    [`${variant}Title`]: { cds: `${hook} .cds-Banner-middle > div > :nth-child(1)`, neon: `${hook} [data-slot=alert-title]`, check: ['font', 'color', 'h'], ...core('title', variant) },
    [`${variant}Message`]: { cds: `${hook} .cds-Banner-middle > div > :nth-child(2)`, neon: `${hook} [data-slot=alert-description]`, check: ['font', 'color', 'h'], ...core('message', variant) },
  };
};
const success = at('alert-success');
const coreOnly = {
  successBox: { neon: `${success} [data-slot=alert]`, check: ['pad', 'radius', 'bg'], core: bannerCell('box', 'success') },
  successIcon: { neon: `${success} [data-slot=alert-content] > svg`, check: ['color'], core: bannerCell('icon', 'success') },
  successTitle: { neon: `${success} [data-slot=alert-title]`, check: ['font', 'color'], core: bannerCell('title', 'success') },
  successMessage: { neon: `${success} [data-slot=alert-description]`, check: ['font', 'color'], core: bannerCell('message', 'success') },
  titleOnlyBox: { neon: `${at('alert-title-only')} [data-slot=alert]`, check: ['h', 'pad'], core: bannerCell('box', 'informational') },
};
const partGaps = (variant) => [
  [`${variant}Icon`, `${variant}Title`, 'x'],
  [`${variant}Title`, `${variant}Icon`, 'y'],
  [`${variant}Title`, `${variant}Message`, 'y'],
];

export const screens = [{
  targets: Object.assign({}, ...variants.map(parts), coreOnly),
  gaps: [
    ...variants.flatMap(partGaps),
    ...variants.slice(1).map((variant, i) => [`${variants[i]}Box`, `${variant}Box`, 'y']),
  ],
}];

// The text a screen reader can reach in an element: aria-hidden subtrees are left out.
const exposedText = (el) => {
  const walk = (node) => node.nodeType === 3 ? node.textContent
    : node.nodeType === 1 && node.getAttribute('aria-hidden') !== 'true' ? [...node.childNodes].map(walk).join(' ') : '';
  return walk(el).replace(/\s+/g, ' ').trim();
};

// An alert is a polite live region that is in place, still silent, before its
// message is exposed, so a screen reader announces an alert that appears
// without interrupting. It stays silent through the frame it is painted in, so
// the message never lands in the same task as the region. It never takes
// role=alert, which is assertive.
// Evidence limit: the accessibility tree's view, not a screen reader's speech.
export function a11y({ test, expect, gotoExpansion }) {
  test('an alert that appears is announced politely: its live region is in place before its message', async ({ page }) => {
    await gotoExpansion(page);
    const hook = page.locator(at('alert-appears'));
    await page.evaluate(([selector, exposed]) => {
      const exposedText = new Function(`return (${exposed})`)();
      window.__alertInserts = [];
      new MutationObserver((records) => {
        for (const node of records.flatMap((record) => [...record.addedNodes])) {
          if (node.nodeType !== 1 || !node.querySelector('[data-slot=alert-title]') && !node.matches('[data-slot=alert]')) continue;
          const region = node.closest('[aria-live]') ?? node.querySelector('[aria-live]');
          const text = () => region ? exposedText(region) : null;
          const insert = { live: region?.getAttribute('aria-live') ?? null, atInsert: text(), paintFrame: undefined, frameAfter: undefined };
          window.__alertInserts.push(insert);
          requestAnimationFrame(() => {
            insert.paintFrame = text();
            requestAnimationFrame(() => { insert.frameAfter = text(); });
          });
        }
      }).observe(document.querySelector(selector), { childList: true, subtree: true });
    }, [at('alert-appears'), exposedText.toString()]);

    await hook.getByRole('button', { name: 'ส่งคำขอ / Submit' }).click();
    await expect(hook.locator('[data-slot=alert]')).toBeVisible();
    await expect.poll(() => page.evaluate(() => window.__alertInserts.every((insert) => insert.frameAfter !== undefined))).toBe(true);
    const inserts = await page.evaluate(() => window.__alertInserts);
    expect(inserts, 'the alert was inserted once').toHaveLength(1);
    expect(inserts[0].live, 'the alert sits in a polite live region').toBe('polite');
    expect(inserts[0].atInsert, 'the live region is silent when it appears').toBe('');
    expect(inserts[0].paintFrame, 'the live region is still silent in the frame it is painted in').toBe('');
    expect(inserts[0].frameAfter, 'and at the start of the frame after it').toBe('');

    const region = hook.locator('[data-slot=alert]');
    await expect.poll(() => region.evaluate((el, exposed) => new Function(`return (${exposed})`)()(el.closest('[aria-live]')), exposedText.toString()))
      .toBe('ส่งคำขอไม่สำเร็จ / Request failed กรุณาลองใหม่อีกครั้ง / Please try again');
    await expect(hook.getByRole('status')).toHaveCount(1);
    await expect(page.locator('[data-slot=alert][role=alert]'), 'no alert is assertive').toHaveCount(0);
  });

  test('long Thai titles and messages wrap inside the alert without overflow', async ({ page }) => {
    for (const width of [375, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await gotoExpansion(page);
      await page.evaluate(() => document.fonts.ready);
      for (const variant of variants) {
        const measured = await page.locator(`${at(`alert-${variant}`)} [data-slot=alert]`).evaluate((box) => {
          const right = box.getBoundingClientRect().right - parseFloat(getComputedStyle(box).paddingRight);
          return ['title', 'description'].map((part) => {
            const el = box.querySelector(`[data-slot=alert-${part}]`);
            return { part, lines: Math.round(el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight)), overflow: el.scrollWidth - el.clientWidth, inside: el.getBoundingClientRect().right <= right + 0.5 };
          });
        });
        const [title, message] = measured;
        expect(message.lines, `${variant} message at ${width}px`).toBeGreaterThanOrEqual(2);
        for (const part of measured) {
          expect(part.overflow, `${variant} ${part.part} at ${width}px`).toBeLessThanOrEqual(0);
          expect(part.inside, `${variant} ${part.part} at ${width}px`).toBe(true);
        }
        expect(title.lines, `${variant} title at ${width}px`).toBeGreaterThanOrEqual(1);
      }
    }
  });
}
