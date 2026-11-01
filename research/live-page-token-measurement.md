# Measuring a live page's design tokens

Research for [#75](https://github.com/finnonemo/neon/issues/75), part of map [#73](https://github.com/finnonemo/neon/issues/73) (a skill that writes a Refero-format DESIGN file from a web page). Gathered 2026-11-01.

**Question.** With the tools a Neon session has (the desktop app's browser pane, Claude in Chrome, plain HTTP fetch, Playwright in a scratch project), how can an agent collect what a DESIGN file needs from one live page, and where does each method stop?

## Answer

Measure the rendered page, and read the stylesheets for the names.

1. **Main method: a read-only `getComputedStyle` sweep run in a real browser**, at two set viewport widths (375 and 1280 or 1440) in light mode, then again with dark emulated. In a desktop session this runs through the browser pane's JavaScript tool. Claude in Chrome and a scratch Playwright script can run the same code. The sweep gives used values and how often each appears, which no stylesheet read can give.
2. **Add the CSSOM and CSS text** (`document.styleSheets`, or a plain HTTP fetch of the linked CSS) to recover custom-property names, theme variants and `:hover`/`:focus` rules that the sweep can't see unless the state is active.
3. **Take screenshots for judgment only:** recurring components, imagery, overall density. Treat them as evidence for judgment calls. Don't read token values from them.
4. **Use Playwright with a CDP session only when needed:** forced pseudo-states without a pointer, flattened shadow DOM and iframes, or a headless batch run. It is Chromium-only and needs a browser install. Headless runs announce automation.

No method gets past a sign-in wall the agent isn't already through, or a bot challenge. Page JavaScript can't reach a closed shadow root. A CDP snapshot or `pierce` might reach one, but the protocol doesn't say and this wasn't tested. robots.txt is a crawler convention, not access control. What the skill does about it is a policy question for #73.

## What a DESIGN file needs, and where each field comes from

| Field | Best source | Caveat |
| --- | --- | --- |
| Colors with usage frequency | Computed sweep: `color` per text element; `background-color` weighted by box area; border colors | Translucent fills (`rgba(0,0,0,0.05)`) aren't what's painted. Composite them, as `browser-probe.js` does. Colors may serialize as `oklch()`/`lab()` (MDN). |
| Color token names | CSSOM rules or the fetched CSS text; `getPropertyValue('--x')` | A defined token isn't a used one. Mapping a used value back to a name is ambiguous when two variables share a value. |
| Font families | Computed `font-family` (first entry); CDP `CSS.getPlatformFontsForNode` for the font actually rendered | The computed stack names what was asked for, not what loaded. |
| Font sizes, weights | Computed sweep on elements with their own text | Responsive: the h1 measured 48px at 1280 and 32px at 375 on the test page. |
| Line height | Computed `line-height` | Comes back as used px (CSSOM §9), so ratios are lost: 26.4px on 16px text is 1.65. Divide by font size. |
| Letter spacing | Computed `letter-spacing` | Usually `normal`. Record only deviations. |
| Spacing steps | Computed padding, margin and gap | Used px (CSSOM §9). `auto` centering margins show up as large px numbers and pollute the scale. rem steps show up as fractions (6.4px = 0.4rem). Filter, then fit a scale. |
| Radii | Computed `border-*-radius` | Mostly clean. `50%` marks pills and avatars. |
| Shadows | Computed `box-shadow` | Clean strings. Few distinct values. |
| Page max-width | Computed `max-width` on wide containers | Mixed with `100%`, `75%` and `calc()` noise. Pick the px value on the main container. |
| Recurring components | DOM signatures (repeated tag and class shapes), the accessibility tree (`read_page`), screenshots | Judgment, not measurement. Say so in the output. |

## Methods and their reach

| | Computed sweep (pane, Chrome, Playwright `evaluate`) | CSSOM / custom properties | Screenshot | HTTP fetch of HTML/CSS | Playwright scratch project | CDP `CSS`/`DOMSnapshot` (via Playwright) |
| --- | --- | --- | --- | --- | --- | --- |
| Used values and frequency | Yes | No (declared, not used) | No | No | Yes | Yes (`captureSnapshot` with a list of styles) |
| Token names, theme variants | Value only per name: `getPropertyValue('--x')`; computed style also enumerates every valid custom property (CSSOM) | Yes, when the sheet is origin-clean | No | Yes, all variants at once | Yes | `getMatchedStylesForNode`, `getStyleSheetText` |
| Cross-origin stylesheets | Yes, computed style includes them (CSSOM) | No: `cssRules` throws `SecurityError` when the origin-clean flag is unset | n/a | Yes, fetched directly | Yes | Yes |
| Viewport and responsive states | Emulate the size, then sweep each width | Media queries are readable, but not which one applies | Per width | Media queries only | `viewport`, `setViewportSize`, device presets | `Emulation.setDeviceMetricsOverride` |
| Hover and focus | Only while the state is real: hover the pointer, wait out transitions | `:hover` rules readable | After a pointer hover | Rules only | `locator.hover()`, `focus()` | `CSS.forcePseudoState` forces it without a pointer |
| Dark mode | Emulate `prefers-color-scheme`. A site toggle (a class or `data-theme`) may also need setting. | Both variants visible | After emulation | Both variants visible; which one applies is unknown | `colorScheme`, `emulateMedia` | `Emulation.setEmulatedMedia` |
| Lazy and below-the-fold content | Only once inserted: scroll first | Lazily loaded CSS chunks only after they load | Use full-page mode | Initial HTML only | Scroll, then `fullPage` screenshot | Same as the sweep |
| Shadow DOM | Open roots, by walking `el.shadowRoot`; closed roots return `null` | Per-root `adoptedStyleSheets` (not tested) | Visible | Declarative shadow DOM only | Locators pierce open roots, not closed ones | `captureSnapshot` flattens shadow DOM; `DOM.getDocument` with `pierce` |
| Iframes | Same-origin only; cross-origin `contentDocument` is `null` | Same | Visible | Separate fetch | `frameLocator`, `page.frames()` | `captureSnapshot` includes iframes (cross-origin and out-of-process frames not tested) |
| Sign-in walls | Pane: sign-ins persist in its own profile. Chrome: the user's own sign-ins. | Same | Same | No | Only with stored state | Same as Playwright |
| Bot detection | Real browser; `navigator.webdriver` was `false` in the pane | Same | Same | Most exposed | Automation flags set `navigator.webdriver` (MDN) | Same as Playwright |

## Evidence

### Specs and APIs

- **Resolved values.** `getComputedStyle` returns a live, read-only object of resolved values. For `line-height`, `width`, `height`, `margin-*` and `padding-*`, "the resolved value is the used value" when the element is rendered. For other properties it is the computed value ([CSSOM §9 Resolved Values](https://drafts.csswg.org/cssom/#resolved-values)). An animating property returns its value "at the current point in the animation" ([MDN getComputedStyle](https://developer.mozilla.org/en-US/docs/Web/API/Window/getComputedStyle)).
- **Custom properties and cross-origin sheets.** The `getComputedStyle` algorithm appends "all the custom properties whose computed value for obj is not the guaranteed-invalid value", in undefined order. The method "exposes information from CSS style sheets with the origin-clean flag unset" ([CSSOM, getComputedStyle](https://drafts.csswg.org/cssom/#dom-window-getcomputedstyle)). By contrast, reading `cssRules` throws `SecurityError` when that flag is unset ([CSSOM §6.1.2](https://drafts.csswg.org/cssom/#dom-cssstylesheet-cssrules)). In practice, cross-origin CSS loaded without CORS is unreadable as rules but still shows up in computed style. The CORS detail is general knowledge, not tested here.
- **`:visited`.** Browsers "may lie about the computed styles for a visited link" ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/getComputedStyle)), so link colors should be read from unvisited links.
- **Shadow DOM and iframes.** `element.shadowRoot` is `null` for closed roots ([MDN shadowRoot](https://developer.mozilla.org/en-US/docs/Web/API/Element/shadowRoot)). A cross-origin iframe's `contentDocument` is `null` ([MDN contentDocument](https://developer.mozilla.org/en-US/docs/Web/API/HTMLIFrameElement/contentDocument)). Playwright locators "by default work with elements in Shadow DOM", except via XPath, and "closed-mode shadow roots are not supported" ([Playwright locators](https://playwright.dev/docs/locators)).
- **Dark mode.** `prefers-color-scheme` "reflects the page color scheme, which will generally reflect a user's preferred color scheme, but might not if the page overrides that", for example with a page-specific toggle. Iframes match the parent's scheme ([Media Queries 5 §12.5.1](https://drafts.csswg.org/mediaqueries-5/#ua-color-scheme)). Emulation covers sites that follow the media query. Sites with their own toggle may need it set directly, as the repo's `--dark-class` switch does (`evals/skills/run-probe.mjs:8-9`).
- **Lazy loading.** `loading="lazy"` defers resources "until the user scrolls near them", and JavaScript loaders use Intersection Observer, which fires when an element enters the viewport ([MDN Lazy loading](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Lazy_loading)). Content that hasn't been inserted isn't in the DOM, so scroll through the page before sweeping.
- **Playwright.** The context and `page.emulateMedia` options cover `viewport`, `deviceScaleFactor`, device presets, `colorScheme` (light by default), `reducedMotion`, `forcedColors` and `contrast` ([emulation](https://playwright.dev/docs/emulation); [API params source](https://github.com/microsoft/playwright/blob/main/docs/src/api/params.md), "context-option-colorscheme", microsoft/playwright `main` at 1.65.0-next). `fullPage` "takes a screenshot of the full scrollable page" (same source, "screenshot-option-full-page"). Hover moves the real mouse over the element's center after actionability checks ([Page API source](https://github.com/microsoft/playwright/blob/main/docs/src/api/class-page.md), `Page.hover`). "CDP sessions are only supported on Chromium-based browsers" ([BrowserContext API source](https://github.com/microsoft/playwright/blob/main/docs/src/api/class-browsercontext.md), `BrowserContext.newCDPSession`).
- **Chrome DevTools Protocol** (`browser_protocol.json` 1.3 from ChromeDevTools/devtools-protocol `master`; [CSS domain](https://chromedevtools.github.io/devtools-protocol/tot/CSS/)):
  - `CSS.forcePseudoState(nodeId, forcedPseudoClasses)` "ensures that the given node will have specified pseudo-classes whenever its style is computed".
  - `CSS.getComputedStyleForNode`, `getMatchedStylesForNode` (matched rules, inherited chain, pseudo-elements, `@property` registrations), `getStyleSheetText` and `getPlatformFontsForNode` are all stable.
  - `CSS.getBackgroundColors` returns the background colors behind text, plus its computed font size and weight.
  - `DOMSnapshot.captureSnapshot` returns the whole DOM "including iframes", with "white-listed computed style information". "Shadow DOM in the returned DOM tree is flattened." It can include blended background colors.
  - `DOM.getDocument` has `pierce` for iframes and shadow roots.
  - `Emulation.setEmulatedMedia` and `setDeviceMetricsOverride` emulate media features and viewport.
  - `CSS.trackComputedStyleUpdates` and `resolveValues` are experimental.
- **Automation flag.** In Chrome, `navigator.webdriver` is true when "the `--enable-automation` or `--headless` flag is used, or the `--remote-debugging-port` flag specifying port 0 is used" ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/webdriver)). How any particular bot-detection vendor reacts wasn't researched.
- **robots.txt.** "These rules are not a form of access authorization" (RFC 9309 §1). They address crawlers: matching groups by user-agent token (§2.2.1), caching for no more than 24 hours (§2.4), and treating a 5xx robots.txt as complete disallow (§2.3.1.4) ([RFC 9309](https://www.rfc-editor.org/rfc/rfc9309.html)). Whether a single page, measured on a user's request, counts as crawling is a policy call for #73.

### What a Claude Code session has

- **Claude in Chrome** (documented, [code.claude.com/docs/en/chrome](https://code.claude.com/docs/en/chrome)). It acts in the user's Chrome or another Chromium browser and "shares your browser's login state". When it hits "a login page or CAPTCHA, it pauses and asks you to handle it manually". It reads DOM and console, and does data extraction and screenshots. Site permissions come from the extension. It requires a direct Anthropic plan and `/login` auth, and isn't available through Bedrock, Vertex or Foundry. Not exercised for this note. In this session its tool list includes a `javascript_tool`, so the same sweep should run there; that is untested.
- **Desktop browser pane** (documented, [code.claude.com/docs/en/desktop](https://code.claude.com/docs/en/desktop.md)). It is a tabbed browser that opens external sites. Claude "takes screenshots, inspects the DOM, clicks elements". It "uses a clean browser profile, separate from your personal browser", and sign-ins can persist (**Keep cookies**). Each site needs its own approval. Claude "won't purchase items, create accounts, or bypass CAPTCHAs without your input". Admins can turn off external-page tools (`browserExternalPageTools`) or external navigation (`disableBrowserExternalNavigation`). It isn't available in SSH sessions. The docs page does **not** state that Claude can run JavaScript, set the viewport or emulate a color scheme.
- **Observed in this session, 2026-11-01** (tool schemas and use, not public docs): the pane exposes `javascript_tool` (described as "for DEBUGGING and INSPECTION only"; a read-only sweep is inspection), `resize_window` with a width, height and `colorScheme` (emulation is cleared when the turn ends), a `computer` hover action, `read_page` (accessibility tree) and screenshots. It has no forced pseudo-state and no CDP access. A skill shouldn't depend on these names; it should say "a browser tool that can run JavaScript", as the repo's verification checklist already does (`evals/skills/README.md:101`).
- **Bash** can `curl` HTML, CSS and robots.txt, and run Playwright when it is installed. The repo already has a Playwright path: `evals/skills/run-probe.mjs:39-48` opens a page with a set viewport and `colorScheme`, waits for `networkidle` and evaluates a probe. Browser launch can fail in agent sandboxes: a recorded Codex run "tried to launch Chromium through a cached `playwright-core`; it failed" (`evals/skills/README.md:109`).

### Experiment: one public page

One page, `https://playwright.dev/docs/intro`, measured in the desktop browser pane with a read-only sweep: walk every element, keep rendered ones, and tally computed values. Text properties are counted per element with its own text node, backgrounds are weighted by box area, and the rest are counted per element. The script lives in the session scratchpad, not the repo. No other page was loaded besides the plain `curl` of that page, its stylesheet and its robots.txt.

- **A hidden pane lays out at width 0.** The first sweep ran with the pane hidden and reported a `[0, 0]` viewport, a 70,112px scroll height and 240 rendered elements. After `resize_window` 1280×800 it reported `[1280, 800]`, 5,465px and 625 elements. That matches `evals/skills/README.md:193` ("A hidden pane lays out at width 0"). **Rule: set the viewport, then check `innerWidth` before trusting a sweep.** A screenshot taken in the same hidden state rendered a dark canvas under light-theme text. That wasn't investigated further; it is one more reason not to read values from screenshots.
- **At 1280×800, light** (top values, count after ×): text colors `rgb(96,103,112)` ×69, `rgb(28,30,33)` ×57, primary `rgb(26,126,31)` ×39. Backgrounds by area: `rgb(246,248,250)` first, then `rgb(48,56,70)` (the dark footer). Fonts: `system-ui` ×199, `SFMono-Regular` ×34. Sizes 16px ×160, 15.2px ×34, 32px ×18, 12.8px ×13. Weights 400/500/700. Line heights 20px, 26.4px, 22.04px (used px; 26.4 / 16 = 1.65). Radii 4px ×78, 6.4px ×63. One shadow, `rgba(0,0,0,0.1) 0px 1px 2px 0px`. `.container` max-width 1140px, mixed with `100%`, `75%` and `calc(100% - 300px)`.
- **Responsive.** At 375×812 the h1 was 32px, against 48px at 1280. The sidebar computed `display: none` and the menu toggle `flex`. The top spacing values changed from 4/12/16/6px to 16/20/6.4/1.6px. A single-width sweep would misstate the type scale.
- **Dark mode.** With `colorScheme: dark` the site switched `data-theme` to `dark` on its own. Body text became `rgb(227,227,227)`, and the computed `--ifm-color-primary` went from `#1a7e1f` to `#45ba4b`.
- **Custom properties.** The computed style of `<html>` enumerated 341 custom properties. The one same-origin stylesheet was readable (1,026 rules).
- **Plain HTTP.** `curl` returned 200 for the page, with one `<link rel=stylesheet>`. The CSS text held all three `--ifm-color-primary` definitions at once: `#3578e5` (framework default), `#45ba4b` and `#1a7e1f`. Dark rules are keyed on `[data-theme=dark]` (18 occurrences), not on a media query. So static CSS shows the token names and both themes, but not which value applies, and nothing about frequency or layout without running the site's JavaScript.
- **Hover.** A real pointer hover (`computer` hover on the link's ref) made `:hover` match at once. The computed `color` still read the old value, then read the hover color (`rgb(26,126,31)`, the `--ifm-navbar-link-hover-color`) after 500 ms. The link has `transition: color 0.2s`. **Rule: wait out transitions before reading a hover or focus state.** The `:hover` rule was also readable from the CSSOM.
- **Lazy content.** 3 of the page's 4 images had `loading="lazy"`. The page had no iframes and no open shadow roots, so those paths weren't exercised.
- **Automation flag.** `navigator.webdriver` read `false` in the pane.

### Repo precedent

`skills/neon-redesign/references/browser-probe.js` is already a read-only probe that a browser tool evaluates at two widths. It reports which elements it measured, and it composites colors on a 1px canvas so that `oklch()` and translucent fills "measure as drawn" (`browser-probe.js:33-36`). A token sweep can follow the same shape: one evaluated file, JSON out, the width it measured at included.

## Recommended sequence for the skill

1. Fetch nothing but the one page the user named. Check robots.txt and sign-in state, and follow whatever rule #73 sets.
2. Open it in the browser tool. Set 1280 (or 1440)×800 in light mode, and confirm `innerWidth`.
3. Scroll to the bottom and back to insert lazy content, then wait for network idle.
4. Evaluate the sweep: per-element text tallies, area-weighted backgrounds, composited colors, used-px spacing, radii, shadows and container max-width. Also collect `:root` custom properties and readable `:hover`/`:focus` rules.
5. Repeat at 375×812, then in dark at both widths. If nothing changes, look for a class or `data-theme` toggle.
6. Hover and focus two or three representative controls with the pointer, wait about 300 ms, and read them again.
7. Take screenshots at each width for component and imagery judgment.
8. Normalize the results: line height as a ratio, a fitted spacing scale, rem steps, auto margins dropped. Name each token from the custom properties where a value maps to exactly one name.

Fallbacks:

- **No browser tool:** use HTTP fetch and CSS text only. The output must say that values and frequencies are unmeasured.
- **Need forced states, shadow-DOM or iframe flattening, or batch runs:** use Playwright with `newCDPSession`, Chromium only. Whether this reaches closed roots is untested.

## Evidence limits

- One public page, one session, desktop browser pane only. Claude in Chrome, Playwright and CDP were not exercised. Their rows rest on the docs and the protocol JSON.
- The test page had no iframes, no shadow DOM, no sign-in and no bot challenge. Those rows are untested.
- The browser-pane capabilities used here come from this session's tool schemas, not from public documentation. They may differ across app versions.
- The CORS/`crossorigin` explanation for `SecurityError` is general knowledge, not quoted from a spec. Whether `getComputedStyle` works on elements inside closed shadow roots, given an element reference, was not verified. Neither was whether `DOMSnapshot.captureSnapshot` or `DOM.getDocument` with `pierce` includes closed roots: the protocol says "flattened" and "shadow roots" without naming the mode.
- Bot-detection behavior beyond `navigator.webdriver` was not researched.
- The sweep's weighting (text per element, backgrounds per area) is one choice. It counts the whole page, not only what is above the fold.
