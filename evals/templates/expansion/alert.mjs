// alert → CDS Banner (contextual style), one per variant: the box's fill,
// radius and padding, the 16px icon in its variant color, then the label1
// title and label2 message 4px apart. The box's height shows the Thai
// message's line count (both targets wrap it at 256px). The icon → title gaps
// place the icon 4px in from its 24px column and 2px down from the title.
const at = (hook) => `[data-measure=${hook}]`;
const variants = ['informational', 'warning', 'error', 'promotional'];
const parts = (variant) => {
  const hook = at(`alert-${variant}`);
  return {
    [`${variant}Box`]: { cds: `${hook} .cds-Banner-content`, neon: `${hook} [data-slot=alert]`, check: ['h', 'w', 'pad', 'radius', 'bg', 'border'] },
    [`${variant}Icon`]: { cds: `${hook} .cds-Banner-start span[role=img]`, neon: `${hook} [data-slot=alert-content] > svg`, check: ['h', 'w', 'color'] },
    [`${variant}Title`]: { cds: `${hook} .cds-Banner-middle > div > :nth-child(1)`, neon: `${hook} [data-slot=alert-title]`, check: ['font', 'color', 'h'] },
    [`${variant}Message`]: { cds: `${hook} .cds-Banner-middle > div > :nth-child(2)`, neon: `${hook} [data-slot=alert-description]`, check: ['font', 'color', 'h'] },
  };
};
const partGaps = (variant) => [
  [`${variant}Icon`, `${variant}Title`, 'x'],
  [`${variant}Title`, `${variant}Icon`, 'y'],
  [`${variant}Title`, `${variant}Message`, 'y'],
];

export const screens = [{
  targets: Object.assign({}, ...variants.map(parts)),
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
          const insert = { live: region?.getAttribute('aria-live') ?? null, atInsert: region ? exposedText(region) : null, nextFrame: undefined };
          window.__alertInserts.push(insert);
          requestAnimationFrame(() => { insert.nextFrame = region ? exposedText(region) : null; });
        }
      }).observe(document.querySelector(selector), { childList: true, subtree: true });
    }, [at('alert-appears'), exposedText.toString()]);

    await hook.getByRole('button', { name: 'ส่งคำขอ / Submit' }).click();
    await expect(hook.locator('[data-slot=alert]')).toBeVisible();
    await expect.poll(() => page.evaluate(() => window.__alertInserts.every((insert) => insert.nextFrame !== undefined))).toBe(true);
    const inserts = await page.evaluate(() => window.__alertInserts);
    expect(inserts, 'the alert was inserted once').toHaveLength(1);
    expect(inserts[0].live, 'the alert sits in a polite live region').toBe('polite');
    expect(inserts[0].atInsert, 'the live region is silent when it appears').toBe('');
    expect(inserts[0].nextFrame, 'the live region is still silent in the frame it is painted in').toBe('');

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
