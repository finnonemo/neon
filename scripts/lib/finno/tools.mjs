// finno's three tools (ADR 0010), declared once: the tool server lists them to agents and the command line takes
// the same names and settings as flags.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ArtworkError, LAYOUTS, NEON_ROOT, candidates, options, render } from './artwork.mjs';

export const VERSION = JSON.parse(readFileSync(join(NEON_ROOT, '.claude-plugin/plugin.json'), 'utf8')).version;

const SETTINGS = {
  format: { type: 'string', description: 'A Format id from `options`, such as square, story-9-16 or a4-portrait. Default square. Leave out when giving width and height.' },
  width: { type: 'integer', description: 'Width in px (64 to 8000) for a size of your own; give height too.' },
  height: { type: 'integer', description: 'Height in px (64 to 8000) for a size of your own; give width too.' },
  colourway: { type: 'string', description: 'A Colourway id from `options`, such as navy__yellow-100. It fixes the background and the block colours together.' },
  slope: { type: 'string', enum: ['flat', 'half', '75'], description: 'How steeply the Pattern rises: flat (calm), half (the default), 75 (steep, for growth and momentum).' },
  layout: { type: 'string', enum: LAYOUTS, description: 'The Page layout. pattern (the default) is the Pattern alone; headline, cover and closing place text and the logo.' },
  headline: { type: 'string', description: 'The headline, in Thai or English. Put [square brackets] around the words to Highlight. Not for layout pattern.' },
  secondary: { type: 'string', description: 'A supporting line under the headline. Not for layout pattern.' },
  label: { type: 'string', description: 'A short label, such as REPORT. Layout cover only.' },
  guidance: { type: 'integer', description: 'How closely the Pattern keeps to the guideline\'s Reference Patterns, 0 to 100. Leave at the default (90) unless the employee asks for something freer.' },
  transparent: { type: 'boolean', description: 'Leave the background transparent, so only the blocks and text are drawn.' },
  out: { type: 'string', description: 'The directory to write into. Default: finnomena-artwork in the working directory.' },
};
const SET = 'The Candidate set: the `set` value `candidates` returned.';

const schema = (extra = {}) => ({ type: 'object', properties: { ...SETTINGS, ...extra }, additionalProperties: false });
const text = value => ({ type: 'text', text: typeof value === 'string' ? value : JSON.stringify(value, null, 2) });
const image = png => ({ type: 'image', data: Buffer.from(png).toString('base64'), mimeType: 'image/png' });

export const TOOLS = [
  {
    name: 'options',
    description: 'Lists what Finnomena Brand Artwork can be drawn with: Formats, Colourways, Slopes, Page layouts and the text each layout takes. Call it once before `candidates` or `render`, and choose ids from its answer.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    run: async () => ({ result: await options() }),
  },
  {
    name: 'candidates',
    description: 'Draws a Candidate set: twelve Patterns from the same settings, on one numbered sheet, for the employee to pick from. Returns the sheet as an image and a file, and the `set` to pass to `render` with the number picked. Call it again without `set` for twelve new ones.',
    inputSchema: schema({ set: { type: 'string', description: 'Draw this Candidate set again. Leave out for a new set.' } }),
    run: async settings => {
      const { png, ...result } = await candidates(settings);
      return { result: { ...result, next: `Show the sheet to the employee. To draw the one they pick, call render with the same settings, set "${result.set}" and pick 1 to ${result.count}.` }, images: [png] };
    },
  },
  {
    name: 'render',
    description: 'Draws one Brand Artwork and writes it as an SVG (vector), a PNG and the Document it was drawn from. Give the same settings as `candidates` with `set` and `pick` to draw a picked Candidate; without them it draws a new Pattern. Returns the file paths, a preview image, any warnings, and a link that opens the artwork in Block for editing by hand.',
    inputSchema: schema({
      set: { type: 'string', description: SET },
      pick: { type: 'integer', minimum: 1, maximum: 12, description: 'The number of the Candidate on the sheet. Needs `set` and the same settings the sheet was drawn with.' },
      seed: { type: 'string', description: 'Draw the Pattern from this seed instead of a Candidate: the same seed and settings draw the same Pattern.' },
      name: { type: 'string', description: 'The file name, without an extension.' },
      pngScale: { type: 'number', description: 'The PNG\'s size relative to the Format, above 0 and at most 4. Default 1.' },
    }),
    run: async settings => {
      const { preview, ...result } = await render(settings);
      return { result, images: [preview] };
    },
  },
];

/** Refuses a setting the tool does not take or of the wrong type, in words the agent can act on. */
function checkArguments(tool, args) {
  const properties = tool.inputSchema.properties;
  for (const [key, value] of Object.entries(args)) {
    const property = properties[key];
    if (!property) throw new ArtworkError(`${tool.name} takes no "${key}". It takes: ${Object.keys(properties).join(', ') || 'nothing'}.`);
    const ok = property.type === 'integer' ? Number.isInteger(value) : typeof value === property.type;
    if (!ok) throw new ArtworkError(`"${key}" must be ${property.type === 'integer' ? 'a whole number' : `a ${property.type}`}.`);
    if (property.enum && !property.enum.includes(value)) throw new ArtworkError(`"${key}" must be one of: ${property.enum.join(', ')}.`);
  }
}

/** Runs a tool by name. Returns `{ result, images }`; throws ArtworkError for a request that cannot be drawn. */
export async function callTool(name, args = {}) {
  const tool = TOOLS.find(candidate => candidate.name === name);
  if (!tool) throw new ArtworkError(`There is no tool "${name}". The tools are: ${TOOLS.map(candidate => candidate.name).join(', ')}.`);
  checkArguments(tool, args);
  return { images: [], ...await tool.run(args) };
}

/** A tool's answer as tool-server content: the result as text, then its images. */
export const toContent = ({ result, images }) => [text(result), ...images.map(image)];
