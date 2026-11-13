// Brand Artwork (GLOSSARY, ADR 0010): what finno's three tools do, over the Block snapshot. The agent chooses the
// settings; the Block engine draws, through the same commands Block's web app runs, so a share link reopens the
// same artwork there. Nothing here calls a model or the network.
import { accessSync, constants, existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, isAbsolute, join, parse, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { TREK_FONTS } from '../block-snapshot.mjs';

export const NEON_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const SNAPSHOT = join(NEON_ROOT, 'block');
const DEFAULT_BLOCK_URL = 'https://block-ten-chi.vercel.app';
export const OUT_DIR_NAME = 'finnomena-artwork';

/** The Page layouts this release draws (ADR 0010): the others need photos or a deck. */
export const LAYOUTS = ['pattern', 'headline', 'cover', 'closing'];
const LAYOUT_NOTES = {
  pattern: 'The Pattern alone: no text and no logo. A background or a texture.',
  headline: 'A headline across the top over the Pattern, with the logo. An ad or a social post.',
  cover: 'A headline in a flat area at the top right, with a small label. The cover of a document or deck.',
  closing: 'A closing line across the top half, with the logo. The last frame or a sign-off.',
};
const TEXT_FIELDS = ['headline', 'secondary', 'label'];

/** A request the engine or this module refuses; its message is written for the employee. */
export class ArtworkError extends Error {}

let enginePromise;
export function loadEngine() {
  enginePromise ??= import(pathToFileURL(join(SNAPSHOT, 'block-engine.mjs')).href);
  return enginePromise;
}

let shaperPromise;
/**
 * The shaper artwork text is drawn with: Finnomena Trek where its files are at hand (FINNO_FONTS_DIR, else the
 * snapshot's fonts directory), otherwise IBM Plex Sans Thai, which the snapshot always carries.
 */
function loadShaper() {
  shaperPromise ??= (async () => {
    const e = await loadEngine();
    const fontsDir = join(SNAPSHOT, 'fonts');
    const trekDir = [process.env.FINNO_FONTS_DIR, fontsDir].find(dir => dir && TREK_FONTS.every(name => existsSync(join(dir, name))));
    const files = trekDir ? e.FACE_FILES : e.PLEX_FACE_FILES;
    const fonts = {};
    for (const id of e.FACE_IDS) {
      const inTrekDir = trekDir && join(trekDir, files[id]);
      fonts[id] = new Uint8Array(await readFile(inTrekDir && existsSync(inTrekDir) ? inTrekDir : join(fontsDir, files[id])));
    }
    const wasmBinary = await readFile(join(SNAPSHOT, 'hb.wasm'));
    return { shaper: await e.createShaper(fonts, { wasmBinary }), typeface: trekDir ? 'Finnomena Trek' : 'IBM Plex Sans Thai' };
  })();
  return shaperPromise;
}

function run(e, doc, command) {
  const result = e.execute(doc, command);
  if ('rejected' in result) throw new ArtworkError(result.rejected.message);
  return result;
}

/** The Document the settings describe, before a Pattern is drawn for it. */
function documentFor(e, settings) {
  let doc = run(e, null, { type: 'createDocument' }).document;
  if (settings.format !== undefined && (settings.width !== undefined || settings.height !== undefined)) {
    throw new ArtworkError('Give a format, or a width and a height, not both.');
  }
  if (settings.width !== undefined || settings.height !== undefined) {
    doc = run(e, doc, { type: 'setFormat', format: 'custom', widthPx: settings.width, heightPx: settings.height }).document;
  } else if (settings.format !== undefined) {
    if (settings.format === 'custom') throw new ArtworkError('For a size of your own give width and height in px, not format "custom".');
    doc = run(e, doc, { type: 'setFormat', format: settings.format }).document;
  }
  if (settings.colourway !== undefined) doc = run(e, doc, { type: 'setColourway', colourway: settings.colourway }).document;
  const params = {};
  if (settings.slope !== undefined) params.slope = settings.slope;
  if (settings.guidance !== undefined) params.guidance = settings.guidance;
  if (Object.keys(params).length) doc = run(e, doc, { type: 'setGeneratorParams', params }).document;
  const layout = settings.layout ?? 'pattern';
  if (!LAYOUTS.includes(layout)) throw new ArtworkError(`Page layout "${layout}" is not drawn yet. Choose one of: ${LAYOUTS.join(', ')}.`);
  const text = Object.fromEntries(TEXT_FIELDS.filter(field => settings[field] !== undefined && settings[field] !== '').map(field => [field, settings[field]]));
  const slots = Object.keys(e.layoutSlotsFor(doc, layout).slots);
  const unplaced = Object.keys(text).filter(field => !slots.includes(field));
  if (unplaced.length) {
    throw new ArtworkError(layout === 'pattern'
      ? `Page layout "pattern" has no text. Choose headline, cover or closing to place the ${unplaced.join(' and ')}.`
      : `Page layout "${layout}" has no place for ${unplaced.join(' or ')}; it takes ${slots.filter(slot => TEXT_FIELDS.includes(slot)).join(', ')}.`);
  }
  if (layout !== 'pattern') {
    doc = run(e, doc, { type: 'setPageLayout', layout }).document;
    if (Object.keys(text).length) doc = run(e, doc, { type: 'setPageContent', content: text }).document;
  }
  if (settings.transparent) doc = run(e, doc, { type: 'setTransparentBackground', transparent: true }).document;
  return doc;
}

async function svgOf(e, doc) {
  const page = doc.pages[0];
  if (!page.layout || page.layout === 'pattern') return { svg: e.renderSvg(doc), typeface: null };
  const { shaper, typeface } = await loadShaper();
  return { svg: e.renderSvg(doc, 0, { shaper }), typeface };
}

function outDir(out) {
  if (out) return isAbsolute(out) ? out : resolve(process.cwd(), out);
  if (process.env.FINNO_OUT_DIR) return resolve(process.env.FINNO_OUT_DIR);
  // A desktop app starts the tool server in a directory that is not the employee's (the filesystem root).
  const cwd = process.cwd();
  let writable = cwd !== parse(cwd).root;
  if (writable) try { accessSync(cwd, constants.W_OK); } catch { writable = false; }
  return join(writable ? cwd : homedir(), OUT_DIR_NAME);
}

const safeName = name => name.replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'artwork';

/** What may be chosen: the answer to the `options` tool. */
export async function options() {
  const e = await loadEngine();
  const doc = run(e, null, { type: 'createDocument' }).document;
  const { typeface } = await loadShaper();
  return {
    formats: e.listFormats().filter(format => format.id !== 'custom').map(({ id, label, widthPx, heightPx }) => ({ id, label, width: widthPx, height: heightPx })),
    customSize: 'Instead of a format, give width and height in px, each from 64 to 8000.',
    colourways: e.COLOURWAYS_LIST.map(({ id, group, background, tints }) => ({ id, group, background, blocks: tints })),
    slopes: [
      { id: 'flat', note: 'Level steps: calm and stable.' },
      { id: 'half', note: 'A moderate rise: the default.' },
      { id: '75', note: 'A steep rise: growth and momentum.' },
    ],
    layouts: LAYOUTS.map(id => ({ id, note: LAYOUT_NOTES[id], text: Object.keys(e.layoutSlotsFor(doc, id).slots).filter(slot => TEXT_FIELDS.includes(slot)) })),
    text: {
      highlight: `Put [square brackets] around the words of the headline to Highlight; at most ${e.MAX_HIGHLIGHT_WORDS} words.`,
      languages: 'Thai and English.',
      typeface,
    },
    defaults: { format: doc.format, colourway: doc.colourway, slope: doc.generator.slope, layout: 'pattern', guidance: doc.generator.guidance },
    candidatesPerSet: e.CANDIDATE_COUNT,
  };
}

// ---- The contact sheet ---------------------------------------------------------------------------------------------

const SHEET_WIDTH = 1500;
const GAP = 18;
const LABEL_HEIGHT = 30;
const SHEET_BACKGROUND = [233, 239, 242]; // Grey 25
const LABEL_COLOUR = [1, 23, 43]; // Navy
// Digits 0 to 9 as 5x7 bitmaps, one string of rows each: the sheet numbers its Candidates without a font.
const DIGITS = ['01110 10001 10011 10101 11001 10001 01110', '00100 01100 00100 00100 00100 00100 01110', '01110 10001 00001 00010 00100 01000 11111',
  '11110 00001 00001 01110 00001 00001 11110', '00010 00110 01010 10010 11111 00010 00010', '11111 10000 11110 00001 00001 10001 01110',
  '00110 01000 10000 11110 10001 10001 01110', '11111 00001 00010 00100 01000 01000 01000', '01110 10001 10001 01110 10001 10001 01110',
  '01110 10001 10001 01111 00001 00010 01100'].map(rows => rows.split(' '));

function drawNumber(raster, number, x, y, scale) {
  [...String(number)].forEach((digit, index) => {
    DIGITS[Number(digit)].forEach((row, r) => [...row].forEach((bit, c) => {
      if (bit !== '1') return;
      for (let dy = 0; dy < scale; dy++) for (let dx = 0; dx < scale; dx++) {
        raster.data.set([...LABEL_COLOUR, 255], ((y + r * scale + dy) * raster.width + x + (index * 6 + c) * scale + dx) * 4);
      }
    }));
  });
}

/** Lays the tiles out in a grid on one raster, each under its number. */
function contactSheet(tiles) {
  const tall = tiles[0].height > tiles[0].width * 1.2;
  const cols = tall ? 6 : 4;
  const rows = Math.ceil(tiles.length / cols);
  const { width: tileW, height: tileH } = tiles[0];
  const width = GAP + cols * (tileW + GAP);
  const height = GAP + rows * (LABEL_HEIGHT + tileH + GAP);
  const sheet = { width, height, data: new Uint8Array(width * height * 4) };
  for (let i = 0; i < width * height; i++) sheet.data.set([...SHEET_BACKGROUND, 255], i * 4);
  tiles.forEach((tile, index) => {
    const x = GAP + (index % cols) * (tileW + GAP);
    const y = GAP + Math.floor(index / cols) * (LABEL_HEIGHT + tileH + GAP);
    drawNumber(sheet, index + 1, x, y + 2, 3);
    for (let row = 0; row < tile.height; row++) {
      for (let col = 0; col < tile.width; col++) {
        const from = (row * tile.width + col) * 4;
        const to = ((y + LABEL_HEIGHT + row) * width + x + col) * 4;
        const alpha = tile.data[from + 3] / 255;
        // A transparent background shows the sheet through.
        for (let c = 0; c < 3; c++) sheet.data[to + c] = Math.round(tile.data[from + c] * alpha + sheet.data[to + c] * (1 - alpha));
      }
    }
  });
  return sheet;
}

export function tileScale(widthPx, heightPx) {
  const cols = heightPx > widthPx * 1.2 ? 6 : 4;
  return (SHEET_WIDTH - GAP * (cols + 1)) / cols / widthPx;
}

function candidateSetFor(e, doc, setSeed) {
  const set = e.generateCandidates(doc, setSeed);
  if (set.length < e.CANDIDATE_COUNT) throw new ArtworkError('The Block engine could not draw a full Candidate set for these settings. Try another Slope or size.');
  return set;
}

/**
 * A Candidate set (GLOSSARY: Candidate): twelve Patterns from the same settings on one numbered sheet. The same
 * settings and `set` draw the same twelve again, which is how `render` finds the one picked.
 */
export async function candidates(settings) {
  const e = await loadEngine();
  const doc = documentFor(e, settings);
  const setSeed = settings.set ?? e.generateRandomSeed();
  const set = candidateSetFor(e, doc, setSeed);
  const { widthPx, heightPx } = e.getFormatDimensions(doc);
  const scale = tileScale(widthPx, heightPx);
  const tiles = [];
  let typeface = null;
  for (const candidate of set) {
    const drawn = await svgOf(e, run(e, doc, { type: 'pickCandidate', candidate }).document);
    typeface = drawn.typeface;
    tiles.push(e.rasterizeSvg(drawn.svg, { scale }));
  }
  const png = e.encodePng(contactSheet(tiles));
  const directory = outDir(settings.out);
  await mkdir(directory, { recursive: true });
  const sheet = join(directory, `candidates-${safeName(setSeed)}.png`);
  await writeFile(sheet, png);
  return { set: setSeed, count: set.length, sheet, png, typeface, width: widthPx, height: heightPx, colourway: doc.colourway };
}

/** Draws one Brand Artwork and writes its SVG, its PNG and the Document it was drawn from. */
export async function render(settings) {
  const e = await loadEngine();
  let doc = documentFor(e, settings);
  let result;
  if (settings.pick !== undefined) {
    if (settings.set === undefined) throw new ArtworkError('To pick a Candidate, give the set it came from as well as its number.');
    if (settings.seed !== undefined) throw new ArtworkError('Give a set and a pick, or a seed, not both.');
    const set = candidateSetFor(e, doc, settings.set);
    if (!Number.isInteger(settings.pick) || settings.pick < 1 || settings.pick > set.length) throw new ArtworkError(`Pick a Candidate from 1 to ${set.length}.`);
    result = run(e, doc, { type: 'pickCandidate', candidate: set[settings.pick - 1] });
  } else {
    if (settings.set !== undefined) throw new ArtworkError('A set needs a pick: the number of the Candidate to draw.');
    result = run(e, doc, { type: 'generate', seed: settings.seed ?? e.generateRandomSeed() });
  }
  doc = result.document;
  const page = doc.pages[0];
  const rules = e.checkPatternRules(page.pattern, e.gridFor(doc));
  if (!rules.ok) throw new ArtworkError(`The Pattern breaks the Pattern rules (${rules.violations.join('; ')}), so it was not written. Draw again with another seed.`);

  const { svg, typeface } = await svgOf(e, doc);
  const { widthPx, heightPx } = e.getFormatDimensions(doc);
  const pngScale = settings.pngScale ?? 1;
  if (!(pngScale > 0 && pngScale <= 4) || Math.max(widthPx, heightPx) * pngScale > 8000) {
    throw new ArtworkError('pngScale must be above 0 and at most 4, and the PNG no more than 8000 px a side.');
  }
  const png = e.encodePng(e.rasterizeSvg(svg, { scale: pngScale }));
  const previewScale = Math.min(1, 1024 / Math.max(widthPx, heightPx));
  const preview = previewScale === pngScale ? png : e.encodePng(e.rasterizeSvg(svg, { scale: previewScale }));

  const warnings = result.warnings.map(({ code, message }) => ({ code, message }));
  if (typeface === 'IBM Plex Sans Thai') {
    warnings.push({ code: 'finno.plexTypeface', message: 'The text is drawn in IBM Plex Sans Thai because the Finnomena Trek font files are not on this computer. For final brand artwork, set FINNO_FONTS_DIR to a directory that holds them and draw again.' });
  }
  const share = e.encodeShareLinkDetailed(doc);
  const blockUrl = (process.env.FINNO_BLOCK_URL || DEFAULT_BLOCK_URL).replace(/\/+$/, '');
  const directory = outDir(settings.out);
  const name = safeName(settings.name ?? `${page.layout ?? 'pattern'}-${doc.format === 'custom' ? `${widthPx}x${heightPx}` : doc.format}-${doc.seed}`);
  await mkdir(directory, { recursive: true });
  const files = { svg: join(directory, `${name}.svg`), png: join(directory, `${name}.png`), document: join(directory, `${name}.json`) };
  await writeFile(files.svg, svg);
  await writeFile(files.png, png);
  await writeFile(files.document, e.serialize(doc));
  return {
    files,
    preview,
    width: widthPx,
    height: heightPx,
    layout: page.layout ?? 'pattern',
    colourway: doc.colourway,
    seed: doc.seed,
    typeface,
    warnings,
    openInBlock: share.tooLong ? null : `${blockUrl}/#p=${share.link}`,
  };
}
