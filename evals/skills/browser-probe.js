// Paste into a browser JavaScript console or evaluator tool on a rebuilt app
// page. Returns the CDS rebuild browser checks (README "CDS rebuild") as JSON,
// naming each element and the viewport width it was measured at, so a claim
// cites what was measured. It reads the page and changes nothing.
(() => {
  const width = document.documentElement.clientWidth;
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

  const rgb = value => (value.match(/[\d.]+/g) || []).slice(0, 4).map(Number);
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
  const backgroundOf = element => {
    for (let node = element; node; node = node.parentElement) {
      const color = rgb(getComputedStyle(node).backgroundColor);
      if (color.length === 3 || color[3] > 0) return color.slice(0, 3);
    }
    return [255, 255, 255];
  };

  const overflowing = all
    .filter(element => getComputedStyle(element).position !== 'fixed')
    .filter(element => {
      const box = element.getBoundingClientRect();
      return box.right > width + 1 || box.left < -1;
    })
    .map(element => ({ element: label(element), left: Math.round(element.getBoundingClientRect().left), right: Math.round(element.getBoundingClientRect().right) }));
  const sideways = all
    .filter(element => /(auto|scroll)/.test(getComputedStyle(element).overflowX) && element.scrollWidth > element.clientWidth + 1)
    .map(element => ({ element: label(element), scrollWidth: element.scrollWidth, clientWidth: element.clientWidth }));

  const leaves = all.filter(element => element.children.length === 0 && element.textContent.trim());
  const serif = leaves.filter(element => /serif/i.test(getComputedStyle(element).fontFamily) && !/sans-serif/i.test(getComputedStyle(element).fontFamily));

  const darkButtons = [...document.querySelectorAll('button, [role="button"], a[href]')]
    .filter(visible)
    .map(element => ({ element, fg: rgb(getComputedStyle(element).color).slice(0, 3), bg: backgroundOf(element) }))
    .filter(({ bg }) => luminance(bg) < 0.2)
    .map(({ element, fg, bg }) => ({ element: label(element), fg: `rgb(${fg})`, bg: `rgb(${bg})`, contrast: contrast(fg, bg) }));

  const underlinedNav = [...document.querySelectorAll('nav a, [role="navigation"] a, [role="tablist"] a')]
    .filter(visible)
    .filter(element => getComputedStyle(element).textDecorationLine.includes('underline'))
    .map(label);

  const dialogs = [...document.querySelectorAll('[role="dialog"], dialog[open]')].filter(visible).map(element => {
    const box = element.getBoundingClientRect();
    return { element: label(element), left: Math.round(box.left), right: Math.round(box.right), width: Math.round(box.width), fits: box.left >= 0 && box.right <= width };
  });

  const body = getComputedStyle(document.body);
  return {
    url: location.href,
    viewportWidth: width,
    documentScrollWidth: document.documentElement.scrollWidth,
    horizontalOverflow: document.documentElement.scrollWidth > width,
    overflowingElements: overflowing.slice(0, 10),
    sidewaysScrollers: sideways.slice(0, 10),
    body: {
      fontFamily: body.fontFamily,
      background: body.backgroundColor,
      color: body.color,
      colorScheme: body.colorScheme,
      prefersDark: matchMedia('(prefers-color-scheme: dark)').matches,
    },
    plexThaiLoaded: document.fonts.check('16px "IBM Plex Sans Thai"'),
    serifTextCount: serif.length,
    serifSamples: serif.slice(0, 5).map(label),
    darkBackgroundControls: darkButtons.slice(0, 15),
    underlinedNavLinks: underlinedNav,
    dialogs,
  };
})();
