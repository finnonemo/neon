// Theme Briefs as neon-create meets them: listed from the Neon registry index
// and recognised by header plus registry match. A file is a brief only when
// its header and status paragraph name a `theme-brief` item whose file
// content equals it; everything else takes the Reference Design route.
import { fetchRegistryJson } from './registry.mjs';

const HEADER = /^# Finnomena (.+?) · (.+?) — Theme Brief\s*$/;
const STATUS = /^This is a Finnomena Theme Brief, not a Reference Design\b/m;
const THEME = /^\*\*Immersive Theme:\*\* (\S+)\s*$/m;

async function briefItems({ url, fetchJson }) {
  const index = await fetchJson(`${url}/registry.json`).catch((err) => {
    throw new Error(`The Theme Brief index at ${url}/registry.json is unreachable: ${err.message}`, { cause: err });
  });
  return index.items.filter((item) => item.categories?.includes('theme-brief'));
}

/** Every brief in the index, for offering by title, tagline, theme and occasion. Throws when the index is unreachable. */
export async function listThemeBriefs({ url, fetchJson = fetchRegistryJson }) {
  return (await briefItems({ url, fetchJson })).map((item) => ({
    name: item.name,
    title: item.title,
    tagline: item.description,
    theme: item.meta?.immersiveTheme,
    occasion: item.meta?.presets?.occasion,
  }));
}

/**
 * Decides what a file is from its text, never its path: `brief` (its item's
 * content, exactly), `differs` (headed as a real item but not equal: offer a
 * re-add) or `reference-design`, with the reason.
 */
export async function matchThemeBrief({ text, url, fetchJson = fetchRegistryJson }) {
  const header = text.split('\n', 1)[0].match(HEADER);
  const theme = text.match(THEME)?.[1];
  if (!header || !theme || !STATUS.test(text)) {
    return { verdict: 'reference-design', reason: 'it has no Theme Brief header and status paragraph' };
  }
  const title = `${header[1]} · ${header[2]}`;
  let items;
  try {
    items = await briefItems({ url, fetchJson });
  } catch (err) {
    return { verdict: 'reference-design', reason: `its header names ${title}, but the Theme Brief index at ${url}/registry.json is unreachable (${err.cause.message}), so it cannot be verified` };
  }
  const item = items.find((candidate) => candidate.title === title && candidate.meta?.immersiveTheme === theme);
  if (!item) return { verdict: 'reference-design', reason: `its header names ${title} (Immersive Theme ${theme}), which matches no Theme Brief in the registry` };
  let published;
  try {
    // A brief item ships one file, the brief.
    published = (await fetchJson(`${url}/${item.name}.json`)).files[0].content;
  } catch (err) {
    return { verdict: 'reference-design', reason: `its header names ${item.name}, but that item is unreachable (${err.message}), so it cannot be verified` };
  }
  if (published !== text) return { verdict: 'differs', item: item.name, theme };
  return { verdict: 'brief', item: item.name, theme };
}
