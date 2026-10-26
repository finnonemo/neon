// Paste into a browser JavaScript console or evaluator tool on a rebuilt app
// page. Returns the CDS rebuild browser checks (README "CDS rebuild") as JSON,
// naming each element and the viewport width it was measured at, so a claim
// cites what was measured. It reads the page and changes nothing.
(() => {
  const width = document.documentElement.clientWidth || window.innerWidth;
  const label = element => {
    const id = element.id ? `#${element.id}` : '';
    const classes = typeof element.className === 'string' && element.className.trim() ? `.${element.className.trim().split(/\s+/).slice(0, 2).join('.')}` : '';
    const text = (element.innerText || element.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 40);
    return `${element.tagName.toLowerCase()}${id}${classes}${text ? ` "${text}"` : ''}`;
  };
  const visible = element => {
    const box = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return box.width > 0 && box.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
  };
  const all = [...document.body.querySelectorAll('*')].filter(visible);

  const luminance = ([r, g, b]) => {
    const channel = value => {
      const c = value / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
  };
  const contrast = (a, b) => {
    const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return Math.round(((high + 0.05) / (low + 0.05)) * 100) / 100;
  };
  // A 1px canvas composites alpha and any CSS color syntax (oklch, lab) as drawn.
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  const composite = colors => {
    context.fillStyle = '#fff';
    context.fillRect(0, 0, 1, 1);
    for (const color of colors) {
      context.fillStyle = color;
      context.fillRect(0, 0, 1, 1);
    }
    return [...context.getImageData(0, 0, 1, 1).data.slice(0, 3)];
  };
  const fillsUnder = element => {
    const colors = [];
    for (let node = element; node; node = node.parentElement) colors.unshift(getComputedStyle(node).backgroundColor);
    return colors;
  };
  const backgroundOf = element => composite(fillsUnder(element));
  const colorOf = element => composite([...fillsUnder(element), getComputedStyle(element).color]);

  const overflowing = all
    .filter(element => getComputedStyle(element).position !== 'fixed')
    .filter(element => {
      const box = element.getBoundingClientRect();
      return box.right > width + 1 || box.left < -1;
    })
    .map(element => ({ element: label(element), left: Math.round(element.getBoundingClientRect().left), right: Math.round(element.getBoundingClientRect().right) }));
  // Content scrolled sideways at load hides its start, such as a board scrolled to its last column.
  const scrolled = all
    .filter(element => element.scrollLeft > 0)
    .map(element => ({ element: label(element), scrollLeft: Math.round(element.scrollLeft), scrollWidth: element.scrollWidth, clientWidth: element.clientWidth }));
  const sideways = all
    .filter(element => /(auto|scroll)/.test(getComputedStyle(element).overflowX) && element.scrollWidth > element.clientWidth + 1)
    .map(element => ({ element: label(element), scrollWidth: element.scrollWidth, clientWidth: element.clientWidth }));

  const leaves = all.filter(element => element.children.length === 0 && element.textContent.trim());
  // Browser defaults compute to a face name such as `Times`, not `serif`.
  const serifFamily = /^\s*"?(serif|Times( New Roman)?|Georgia|Cambria|Noto Serif[^",]*)"?\s*(,|$)/i;
  const serif = leaves.filter(element => serifFamily.test(getComputedStyle(element).fontFamily));
  const leafFonts = {};
  for (const element of leaves) {
    const family = getComputedStyle(element).fontFamily;
    leafFonts[family] = (leafFonts[family] || 0) + 1;
  }

  // Text and SVG icons draw in the control's color; an empty dot or an image-only link has no foreground to contrast.
  const drawsForeground = element => element.textContent.trim() || element.querySelector('svg');
  const darkButtons = [...document.querySelectorAll('button, [role="button"], a[href]')]
    .filter(visible)
    .filter(drawsForeground)
    .map(element => ({ element, fg: colorOf(element), bg: backgroundOf(element) }))
    .filter(({ bg }) => luminance(bg) < 0.2)
    .map(({ element, fg, bg }) => ({ element: label(element), fg: `rgb(${fg})`, bg: `rgb(${bg})`, contrast: contrast(fg, bg) }));

  const underlinedNav = [...document.querySelectorAll('nav a, [role="navigation"] a, [role="tablist"] a')]
    .filter(visible)
    .filter(element => element.textContent.trim())
    .filter(element => getComputedStyle(element).textDecorationLine.includes('underline'))
    .map(label);

  const dialogs = [...document.querySelectorAll('[role="dialog"], dialog[open]')].filter(visible).map(element => {
    const box = element.getBoundingClientRect();
    return { element: label(element), left: Math.round(box.left), right: Math.round(box.right), width: Math.round(box.width), fits: box.left >= 0 && box.right <= width };
  });

  // A fill within 1.1:1 of what sits behind it, with no visible border or
  // shadow, draws no shape: a badge or secondary button the color of its card.
  // Only rounded elements count, so wrappers repeating the page background and
  // square nav buttons sharing their bar's fill do not.
  const transparent = color => color === 'transparent' || /(,\s*|\/\s*)0\)$/.test(color);
  const drawsEdge = (style, fill) => ['Top', 'Right', 'Bottom', 'Left'].some(side => parseFloat(style[`border${side}Width`]) > 0
      && !['none', 'hidden'].includes(style[`border${side}Style`])
      && contrast(composite([`rgb(${fill})`, style[`border${side}Color`]]), fill) >= 1.1)
    || [...style.boxShadow.matchAll(/(?:rgba?|oklch|oklab|lab|lch|color)\([^)]*\)/g)].some(([color]) => !transparent(color));
  const sameFill = all
    .filter(element => parseFloat(getComputedStyle(element).borderTopLeftRadius) > 0)
    .filter(element => !transparent(getComputedStyle(element).backgroundColor) && getComputedStyle(element).backgroundImage === 'none')
    .map(element => ({ element, fill: backgroundOf(element), behind: backgroundOf(element.parentElement) }))
    .filter(({ element, fill, behind }) => contrast(fill, behind) < 1.1 && !drawsEdge(getComputedStyle(element), fill))
    .map(({ element, fill, behind }) => ({ element: label(element), fill: `rgb(${fill})`, behind: `rgb(${behind})`, contrast: contrast(fill, behind) }));

  const body = getComputedStyle(document.body);
  return {
    url: location.href,
    // A hidden tab can lay out at width 0, which voids the measurements.
    visibility: document.visibilityState,
    viewportWidth: width,
    documentScrollWidth: document.documentElement.scrollWidth,
    horizontalOverflow: document.documentElement.scrollWidth > width,
    overflowingElements: overflowing.slice(0, 10),
    scrolledOnLoad: { page: Math.round(window.scrollX), elements: scrolled.slice(0, 10) },
    sidewaysScrollers: sideways.slice(0, 10),
    body: {
      fontFamily: body.fontFamily,
      background: body.backgroundColor,
      color: body.color,
      colorScheme: body.colorScheme,
      prefersDark: matchMedia('(prefers-color-scheme: dark)').matches,
    },
    plexThaiLoaded: document.fonts.check('16px "IBM Plex Sans Thai"'),
    textCountByFont: leafFonts,
    serifTextCount: serif.length,
    serifSamples: serif.slice(0, 5).map(label),
    darkBackgroundControls: darkButtons.slice(0, 15),
    sameAsParentFill: sameFill.slice(0, 15),
    underlinedNavLinks: underlinedNav,
    dialogs,
  };
})();
