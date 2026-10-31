// Evaluate this file's text in a browser JavaScript console or a browser
// tool's evaluate action on the rendered page, once per viewport width. It
// returns JSON naming each element it measured and the width it measured at,
// so a verification claim cites what was measured. It reads the page, changes
// nothing and needs no dependencies. Its lists are leads to inspect, not a
// pass/fail verdict; see verification.md's shared checklist. For a Reference
// Design page, evaluate `window.neonProbeSourceBrands = ['Brand'];` as its own
// call first, so the probe lists where the source brand appears. Without a
// browser tool, the Neon root's scripts/probe-page.mjs runs this file in Chrome.
(() => {
  const width = document.documentElement.clientWidth || window.innerWidth;
  const label = element => {
    const id = element.id ? `#${element.id}` : '';
    const classes = typeof element.className === 'string' && element.className.trim() ? `.${element.className.trim().split(/\s+/).slice(0, 2).join('.')}` : '';
    const text = (element.innerText || element.getAttribute('aria-label') || element.getAttribute('alt') || '').trim().replace(/\s+/g, ' ').slice(0, 40);
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
  const transparent = color => color === 'transparent' || /^rgba\(.*,\s*0\)$/.test(color) || /\/\s*0\)$/.test(color);
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

  // IBM Plex Sans Thai: document.fonts.check() is true when no face matches,
  // so read the loaded faces and resolve each text element's family stack.
  const plex = 'ibm plex sans thai';
  const familyName = family => family.trim().replace(/^["']|["']$/g, '').toLowerCase();
  const faces = [...document.fonts];
  const plexFaces = faces.filter(face => familyName(face.family) === plex);
  const covers = (face, code) => face.unicodeRange.split(',').some(range => {
    const [low, high = low] = range.trim().replace(/^U\+/i, '').split('-');
    return code >= parseInt(low.replace(/\?/g, '0'), 16) && code <= parseInt(high.replace(/\?/g, 'F'), 16);
  });
  // The first family in the element's stack with a loaded face covering the
  // character draws it. A family with no @font-face is a system font or a
  // generic, taken to cover it.
  const drawingFamily = (element, code) => {
    for (const family of getComputedStyle(element).fontFamily.split(',').map(familyName)) {
      const declared = faces.filter(face => familyName(face.family) === family);
      if (!declared.length || declared.some(face => face.status === 'loaded' && covers(face, code))) return family;
    }
    return 'browser fallback';
  };
  const ownText = element => [...element.childNodes].filter(node => node.nodeType === Node.TEXT_NODE).map(node => node.textContent).join('').trim();
  const textElements = all.filter(ownText);
  const inPlex = pattern => {
    const yes = [];
    const no = [];
    for (const element of textElements) {
      const match = ownText(element).match(pattern);
      if (match) (drawingFamily(element, match[0].codePointAt(0)) === plex ? yes : no).push(label(element));
    }
    return { inPlexCount: yes.length, inPlex: yes.slice(0, 5), notInPlexCount: no.length, notInPlex: no.slice(0, 10) };
  };
  const loadedFaces = [...new Set(plexFaces.filter(face => face.status === 'loaded').map(face => {
    const scripts = [covers(face, 0x0e01) && 'Thai', covers(face, 0x41) && 'Latin'].filter(Boolean).join('+') || 'other';
    return `${face.weight} ${face.style} ${scripts}`;
  }))];

  // Vite inlines small assets as data: URIs, so the logo is known by its alt,
  // aria-label or <title>, its file name, or the shipped SVG's path data.
  const logoShapes = ['M23.6 4V7.2H6V15.2H25.2V4H23.6Z', 'M11.64 10.12H2.96V15.2H10.24V18H2.96V26H0V7.29999H11.64V10.12Z'];
  const finnomena = /finnomena|ฟินโนมีนา/i;
  const decode = src => {
    try {
      const [, meta, body] = src.match(/^data:([^,]*),([\s\S]*)$/) ?? [];
      if (meta === undefined) return '';
      return /;base64$/i.test(meta) ? atob(body) : decodeURIComponent(body);
    } catch {
      return '';
    }
  };
  const logoMatch = element => {
    const by = [];
    if (finnomena.test(element.getAttribute('alt') ?? '')) by.push('alt');
    if (finnomena.test(element.getAttribute('aria-label') ?? '')) by.push('aria-label');
    if (element.tagName.toLowerCase() === 'svg' && finnomena.test(element.querySelector('title')?.textContent ?? '')) by.push('title');
    const src = element.getAttribute('src') ?? '';
    if (src && !src.startsWith('data:') && finnomena.test(src.split(/[?#]/)[0].split('/').pop())) by.push('file name');
    const drawn = element.tagName.toLowerCase() === 'img' ? decode(src) : element.outerHTML;
    if (logoShapes.some(shape => drawn.includes(shape))) by.push('asset shape');
    return by;
  };
  const logos = [...new Set(document.querySelectorAll('img, svg, [role="img"]'))]
    .map(element => ({ element, by: logoMatch(element) }))
    .filter(({ by }) => by.length);

  // Reference Design pages: evaluate `window.neonProbeSourceBrands = ['Brand'];`
  // first, then this file, to list where a source brand name appears.
  const brands = [].concat(window.neonProbeSourceBrands ?? []).filter(Boolean);
  let sourceBrand = null;
  if (brands.length) {
    const named = text => brands.some(brand => text.toLowerCase().includes(String(brand).toLowerCase()));
    const metas = [...document.querySelectorAll('meta[content]')];
    const labelled = [...document.querySelectorAll('[alt], [aria-label]')];
    const found = [];
    if (named(document.title)) found.push({ element: 'title', text: document.title });
    for (const meta of metas) {
      const key = meta.getAttribute('name') ? `name="${meta.getAttribute('name')}"` : `property="${meta.getAttribute('property')}"`;
      if (named(meta.content)) found.push({ element: `meta[${key}]`, text: meta.content.slice(0, 80) });
    }
    for (const element of labelled) {
      for (const attribute of ['alt', 'aria-label']) {
        const text = element.getAttribute(attribute);
        if (text && named(text)) found.push({ element: `${label(element)} [${attribute}]`, text });
      }
    }
    for (const element of textElements) {
      if (named(ownText(element))) found.push({ element: label(element), text: ownText(element).slice(0, 80) });
    }
    sourceBrand = { brands, checked: { title: document.title, meta: metas.length, altOrLabel: labelled.length, textElements: textElements.length }, found: found.slice(0, 15) };
  }

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
    plexThai: {
      loadedFaces,
      failedFaces: plexFaces.filter(face => face.status === 'error').length,
      thai: inPlex(/[฀-๿]/),
      latin: inPlex(/[A-Za-z]/),
    },
    finnomenaLogo: {
      visible: logos.filter(({ element }) => visible(element)).map(({ element, by }) => ({ element: label(element), by })),
      hidden: logos.filter(({ element }) => !visible(element)).map(({ element }) => label(element)),
    },
    sourceBrand,
    textCountByFont: leafFonts,
    serifTextCount: serif.length,
    serifSamples: serif.slice(0, 5).map(label),
    darkBackgroundControls: darkButtons.slice(0, 15),
    sameAsParentFill: sameFill.slice(0, 15),
    underlinedNavLinks: underlinedNav,
    dialogs,
  };
})();
