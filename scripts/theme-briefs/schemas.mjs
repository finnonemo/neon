// Closed schemas for Theme Brief inputs. Every object rejects unknown keys,
// and every input is scanned for hex-like strings, px values and font fields
// (type and colors come from the theme, never from an input).

const SECTION_ROLES = ['hero', 'proof', 'detail-list', 'call-out', 'form', 'footer'];
// What a section sits on: the canvas, the theme's strongest tint step, its strongest accent step, or the
// Brand Pattern's ground, which the picks file chooses.
export const GROUNDS = ['canvas', 'tint', 'accent', 'pattern'];
export const COLOURWAYS = ['palette', 'accent', 'support'];
// Block's primary Colourways (COLOURWAYS_LIST in block/block-engine.mjs): a ground color and one block color.
// Block draws a Brand Pattern in one of these and no other; a test holds this list to the engine's.
const BLOCK_COLORS = { navy: 'Navy', grey: 'Light Grey', white: 'White', yellow: 'Yellow' };
export const BLOCK_COLOURWAYS = ['navy__yellow-100', 'navy__grey-100', 'navy__white-100', 'grey__yellow-100', 'grey__navy-100', 'grey__white-100', 'white__yellow-100', 'white__grey-100', 'white__navy-100'];
// The two colors a Block Colourway draws with, as Immersive Theme color names.
export function blockColourway(id) {
  const [ground, blocks] = String(id).split('__');
  return { ground: `${BLOCK_COLORS[ground]}.100`, blocks: `${BLOCK_COLORS[String(blocks).replace(/-100$/, '')]}.100` };
}
// A theme's variable for one of its colors at full strength: the canvas, the text or a family's 100 step.
export function colorVariable(theme, color) {
  if (color === theme.canvas) return 'canvas';
  const family = theme.families.find((name) => theme.steps[name]['100']?.bg === color);
  return family ? `${family}-100` : color === theme.text ? 'text' : null;
}
const SECONDARIES = ['green', 'blue', 'purple', 'red', 'orange'];
const REVIEW_STATUSES = ['illustrative', 'partially-reviewed', 'reviewed'];
// The components every brief renders itself; an occasion component never takes one of their names.
export const FIXED_COMPONENTS = ['Main Action', 'Secondary Action', 'Logo', 'Tint Block', 'Accent Block', 'Support Block'];
export const ENTRIES = ['tagline', 'mood-occasion', 'occasion-components', 'preset-dos-donts', 'imagery', 'layout', 'example-prompts'];
// What an entry may take: preset fields (never a source), theme text and facts, picks, computed lists and
// earlier entries' output. A whole preset ("layout", "imagery") leaves out its kind, slug and source.
export const INPUTS = [
  ...['taglineIntent', 'moodIntent', 'components', 'dos', 'donts', 'promptInputs', 'secondaryHighlights'].map((field) => `occasion.${field}`),
  'layout', ...['sections', 'heroPattern', 'navigation', 'footer', 'density', 'blockRadius', 'sectionGap', 'cardPadding', 'pageWidth', 'motion', 'brandPattern', 'grounds', 'featureRadius', 'factRole'].map((field) => `layout.${field}`),
  'imagery', ...['leads', 'framing', 'subject', 'illustration', 'density'].map((field) => `imagery.${field}`),
  'theme.kind', 'theme.label', 'theme.mood', 'theme.sibling', 'theme.roles', 'brief.name', 'brandPattern.colourway', 'brandPattern.section',
  'accentPlacements', 'offActionFills', 'colorVars', 'typeRoles', 'sectionGrounds', 'occasion-components.components', 'occasion-components.names',
];
// The bands each entry's soft checks read from its targets.
export const TARGETS = {
  tagline: ['words', 'firstClauseWords'],
  'mood-occasion': ['paragraphWords'],
  'occasion-components': ['roleWords', 'paragraphWords', 'paragraphSentences'],
  'preset-dos-donts': ['words'],
  imagery: ['words'],
  layout: ['words'],
  'example-prompts': ['count', 'words'],
};
export const PLACEHOLDERS = ['{{variables}}', '{{typeRoles}}'];

const text = { type: 'string' };
const slug = { type: 'string', pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, describe: 'a lowercase hyphenated slug' };
const date = { type: 'string', pattern: /^\d{4}-\d{2}-\d{2}$/, describe: 'a YYYY-MM-DD date' };
const oneOf = (...values) => ({ enum: values });
const list = (items, min = 0, max = Infinity) => ({ type: 'array', items, min, max });
const object = (properties, optional = []) => ({ type: 'object', properties, optional });
const nullable = (schema) => ({ ...schema, nullable: true });
const step = (set, prefix) => ({ type: 'string', step: set, describe: `a ${prefix}-* step name` });

// Provenance of a preset drafted from a public page (ADR 0007). Never a drafting input.
const source = object({
  url: { type: 'string', pattern: /^https:\/\/[^\s#]+$/, describe: 'an https URL with no fragment' },
  measuredOn: date,
  kept: list(oneOf('structure', 'geometry', 'motion'), 1, 3),
  robotsDisallowed: { type: 'boolean' },
});

export function presetSchema(kind, name, facts) {
  const common = { kind: oneOf(kind), slug: { ...slug, equals: name } };
  if (kind === 'occasion') {
    return object({
      ...common,
      taglineIntent: text,
      moodIntent: text,
      // leadFact: the one fact the component sets in the layout's fact role. feature: it spans the content column.
      components: list(object({ name: text, role: text, contentNotes: text, roles: list(oneOf(...COLOURWAYS, 'action'), 1), leadFact: text, feature: { type: 'boolean' } }, ['leadFact', 'feature']), 2, 6),
      dos: list(text, 1, 3),
      donts: list(text, 1, 3),
      promptInputs: list(text),
      secondaryHighlights: list(oneOf(...SECONDARIES)),
    });
  }
  if (kind === 'layout') {
    return object({
      ...common,
      sections: list(oneOf(...SECTION_ROLES), 1),
      grounds: list(oneOf(...GROUNDS), 1),
      heroPattern: text,
      navigation: text,
      footer: text,
      density: oneOf('compact', 'comfortable', 'spacious'),
      blockRadius: step(facts.borderRadius, 'borderRadius'),
      sectionGap: step(facts.space, 'space'),
      cardPadding: step(facts.space, 'space'),
      featureRadius: step(facts.borderRadius, 'borderRadius'),
      factRole: oneOf(...facts.scale.type.map(({ role }) => role).filter((role) => role.startsWith('display'))),
      pageWidth: oneOf('contained', 'full-bleed'),
      motion: oneOf('still', 'subtle', 'lively'),
      brandPattern: object({ section: oneOf(...SECTION_ROLES) }),
      source,
    }, ['source']);
  }
  return object({ ...common, leads: text, framing: text, subject: text, illustration: text, density: text, source }, ['source']);
}

export function picksSchema(facts) {
  return object({
    theme: oneOf(...Object.keys(facts.themes)),
    briefName: { type: 'string', pattern: /^[A-Z][A-Za-z0-9]*(?: [A-Za-z0-9]+)*$/, describe: 'an English name starting with a capital, letters, digits and single spaces' },
    presets: object({ occasion: slug, layout: slug, imagery: slug }),
    // colourway and ground: the fill the Pattern's section takes. blockColourway: what Block draws the Pattern in.
    brandPattern: object({ colourway: oneOf(...COLOURWAYS), ground: { type: 'integer' }, blockColourway: oneOf(...BLOCK_COLOURWAYS) }),
    // The example-library review record, for a brief built from a third-party source.
    review: object({
      status: oneOf(...REVIEW_STATUSES),
      source_revision: text,
      reviewer: nullable(text),
      reviewed_on: nullable(date),
      approved_properties: list(text),
    }),
  }, ['review']);
}

export const themeTextSchema = object({ mood: text, sibling: text });

const band = { type: 'array', items: { type: 'integer' }, min: 2, max: 2 };
export const entrySchema = object({
  fills: text,
  inputs: list(text, 1),
  after: list(oneOf(...ENTRIES)),
  formula: list(text, 1),
  targets: { type: 'record', values: band },
  rules: list(text),
  output: { type: 'json-schema' },
  example: object({ input: { type: 'json-schema' }, output: { type: 'json-schema' } }),
}, ['example']);
export const sharedSchema = object({ preamble: list(text, 1), bans: list(text) });

const typeOf = (value) => Array.isArray(value) ? 'array' : value === null ? 'null' : typeof value;
const join = (path, key) => path ? `${path}.${key}` : String(key);

// Problems as messages without the file path; `path` is the dotted key path.
export function validate(value, schema, path = '', problems = []) {
  if (value === null && schema.nullable) return problems;
  if (schema.enum) {
    if (!schema.enum.includes(value)) problems.push(`"${path}" must be one of ${schema.enum.join(', ')}`);
  } else if (schema.type === 'object') {
    if (typeOf(value) !== 'object') return [...problems, `${path ? `"${path}"` : 'the file'} must be an object`];
    for (const key of Object.keys(value)) if (!(key in schema.properties)) problems.push(`unknown key "${join(path, key)}"`);
    for (const [key, inner] of Object.entries(schema.properties)) {
      if (key in value) validate(value[key], inner, join(path, key), problems);
      else if (!schema.optional.includes(key)) problems.push(`missing key "${join(path, key)}"`);
    }
  } else if (schema.type === 'array') {
    if (!Array.isArray(value)) return [...problems, `"${path}" must be an array`];
    if (value.length < schema.min || value.length > schema.max) {
      problems.push(`"${path}" must have ${schema.max === Infinity ? `at least ${schema.min}` : schema.min === schema.max ? schema.min : `${schema.min}–${schema.max}`} items, has ${value.length}`);
    }
    value.forEach((item, index) => validate(item, schema.items, join(path, index), problems));
  } else if (schema.type === 'record') {
    if (typeOf(value) !== 'object') return [...problems, `"${path}" must be an object`];
    for (const [key, inner] of Object.entries(value)) validate(inner, schema.values, join(path, key), problems);
  } else if (schema.type === 'json-schema') {
    if (typeOf(value) !== 'object') problems.push(`"${path}" must be an object`);
  } else if (schema.type === 'integer') {
    if (!Number.isInteger(value) || value <= 0) problems.push(`"${path}" must be a positive integer`);
  } else if (schema.type === 'boolean') {
    if (typeof value !== 'boolean') problems.push(`"${path}" must be true or false`);
  } else if (typeof value !== 'string' || !value.trim()) {
    problems.push(`"${path}" must be a non-empty string`);
  } else if (schema.equals !== undefined && value !== schema.equals) {
    problems.push(`"${path}" must match the file name "${schema.equals}"`);
  } else if ((schema.pattern && !schema.pattern.test(value)) || (schema.step && !schema.step.has(value))) {
    problems.push(`"${path}" must be ${schema.describe}`);
  }
  return problems;
}

const HEX = /#[0-9a-f]{3,8}\b/i;
const PX = /\b\d+(?:\.\d+)?px\b/i;

// The bans that hold everywhere: no font fields, hex-like strings or px values.
export function bans(value, path = '', problems = []) {
  if (typeof value === 'string') {
    if (HEX.test(value)) problems.push(`"${path}" holds a hex-like value`);
    if (PX.test(value)) problems.push(`"${path}" holds a px value; use a step name`);
  } else if (value && typeof value === 'object') {
    for (const [key, inner] of Object.entries(value)) {
      const at = join(path, key);
      if (/font|typeface/i.test(key)) problems.push(`"${at}" is a font field; type comes from the theme`);
      // A source URL is checked by its own pattern; a path segment like "12px" is not a value.
      if (key !== 'url') bans(inner, at, problems);
    }
  }
  return problems;
}

export const briefSlug = (briefName) => briefName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Not superlatives, though they end in -est; theme texts may talk about investing.
const NOT_SUPERLATIVE = new Set(['interest', 'invest', 'request', 'rest', 'test', 'honest', 'modest', 'earnest', 'forest', 'guest', 'west', 'nest', 'chest', 'crest', 'quest', 'digest', 'protest', 'manifest', 'suggest', 'harvest', 'contest', 'arrest', 'attest']);
const words = (value) => value.trim().split(/\s+/).filter(Boolean).length;

// Theme texts never go stale when a theme is added: no ratios, percentages, superlatives or comparisons.
export function themeTextProblems(data, id, facts) {
  const problems = [];
  const others = Object.values(facts.themes).filter((theme) => theme.id !== id).map((theme) => theme.label);
  for (const key of ['mood', 'sibling']) {
    const value = data?.[key];
    if (typeof value !== 'string') continue;
    if (/\d\s*(?::\s*1\b|%)/.test(value)) problems.push(`"${key}" holds a ratio or percentage`);
    const ranking = [
      ...value.matchAll(/\b(only|most|least|of the four)\b/gi),
      ...[...value.matchAll(/\b[a-z]+est\b/gi)].filter(([word]) => !NOT_SUPERLATIVE.has(word.toLowerCase())),
      ...others.flatMap((label) => [...value.matchAll(new RegExp(`\\b${label}\\b`, 'g'))]),
    ];
    for (const [word] of ranking) problems.push(`"${key}" compares or ranks themes ("${word}")`);
  }
  const sentences = typeof data?.mood === 'string' ? data.mood.match(/[^.!?]+[.!?]+/g)?.length ?? 0 : undefined;
  if (sentences !== undefined && (sentences < 2 || sentences > 4)) problems.push(`"mood" must be 2–4 sentences, has ${sentences}`);
  if (typeof data?.sibling === 'string' && words(data.sibling) > 20) problems.push(`"sibling" must be 20 words or fewer, has ${words(data.sibling)}`);
  return problems;
}

export function entryProblems(name, data) {
  if (!ENTRIES.includes(name)) return [`not a prompt library entry; entries are ${ENTRIES.join(', ')}, and shared`];
  const problems = [];
  const after = Array.isArray(data?.after) ? data.after : [];
  (Array.isArray(data?.inputs) ? data.inputs : []).forEach((input, index) => {
    // "layout." and "imagery." name preset fields; only the other entries' names name an output.
    const from = ENTRIES.find((entry) => !['layout', 'imagery'].includes(entry) && String(input).startsWith(`${entry}.`));
    if (String(input).split('.').includes('source')) problems.push(`"inputs.${index}" names a preset source, which is never an input`);
    else if (!INPUTS.includes(input)) problems.push(`"inputs.${index}" is not an input the tool supplies`);
    else if (from && !after.includes(from)) problems.push(`"inputs.${index}" takes the output of "${from}", which "after" does not name`);
  });
  if (after.includes(name)) problems.push('"after" names the entry itself');
  for (const key of Object.keys(data?.targets ?? {})) if (!TARGETS[name].includes(key)) problems.push(`"targets.${key}" is not a band ${name} checks; its bands are ${TARGETS[name].join(', ')}`);
  if (name === 'mood-occasion' && data?.output && !data.output.properties?.accentPlacement) problems.push('"output" must have an accentPlacement property');
  return problems;
}

export function sharedProblems(data) {
  const problems = [];
  for (const key of ['preamble', 'bans']) {
    (Array.isArray(data?.[key]) ? data[key] : []).forEach((line, index) => {
      for (const [placeholder] of String(line).matchAll(/\{\{\w*\}\}/g)) if (!PLACEHOLDERS.includes(placeholder)) problems.push(`"${key}.${index}" has the placeholder ${placeholder}; placeholders are ${PLACEHOLDERS.join(', ')}`);
    });
  }
  return problems;
}

// Problems with a model answer against an entry's output JSON Schema: the subset entries use.
export function jsonSchemaProblems(value, schema, path = '', problems = []) {
  const at = path ? `"${path}"` : 'the answer';
  if (schema.enum) {
    if (!schema.enum.includes(value)) problems.push(`${at} must be one of ${schema.enum.map((option) => JSON.stringify(option)).join(', ')}`);
  } else if (schema.type === 'object') {
    if (typeOf(value) !== 'object') {
      problems.push(`${at} must be an object`);
      return problems;
    }
    for (const key of Object.keys(value)) if (schema.additionalProperties === false && !(key in (schema.properties ?? {}))) problems.push(`unknown key "${join(path, key)}"`);
    for (const key of schema.required ?? []) if (!(key in value)) problems.push(`missing key "${join(path, key)}"`);
    for (const [key, inner] of Object.entries(schema.properties ?? {})) if (key in value) jsonSchemaProblems(value[key], inner, join(path, key), problems);
  } else if (schema.type === 'array') {
    if (!Array.isArray(value)) {
      problems.push(`${at} must be an array`);
      return problems;
    }
    if (value.length < (schema.minItems ?? 0) || value.length > (schema.maxItems ?? Infinity)) problems.push(`${at} has ${value.length} items`);
    value.forEach((item, index) => jsonSchemaProblems(item, schema.items ?? {}, join(path, index), problems));
  } else if (schema.type === 'string' && (typeof value !== 'string' || !value.trim())) {
    problems.push(`${at} must be a non-empty string`);
  }
  return problems;
}

// Entries in an order where each comes after the entries its "after" names; entries left over form a cycle.
// An "after" naming an entry not in the map is ignored here.
export function entryOrder(afters) {
  const order = [];
  const left = ENTRIES.filter((name) => name in afters);
  for (let progress = true; progress;) {
    progress = false;
    for (const name of [...left]) {
      if (afters[name].some((other) => left.includes(other))) continue;
      order.push(name);
      left.splice(left.indexOf(name), 1);
      progress = true;
    }
  }
  return { order, cycle: left };
}

const onDomain = (host, domain) => host === domain || host.endsWith(`.${domain}`);

export function presetProblems(kind, data) {
  const problems = [];
  const { sections, brandPattern } = data ?? {};
  if (kind === 'layout' && Array.isArray(sections) && brandPattern?.section && !sections.includes(brandPattern.section)) {
    problems.push(`Brand Pattern section "${brandPattern.section}" is not one of its sections`);
  }
  if (kind === 'layout' && Array.isArray(sections) && Array.isArray(data.grounds)) {
    const { grounds } = data;
    if (grounds.length !== sections.length) problems.push(`"grounds" has ${grounds.length} items; it gives one ground per section, and there are ${sections.length}`);
    else {
      const at = sections.indexOf(brandPattern?.section);
      grounds.forEach((ground, index) => {
        if (ground === 'pattern' && index !== at) problems.push(`"grounds.${index}" is "pattern", but the Brand Pattern section is ${at < 0 ? 'not a section' : `section ${at + 1}`}`);
      });
      if (at >= 0 && grounds[at] !== 'pattern') problems.push(`"grounds.${at}" must be "pattern": the Brand Pattern section takes the ground its picks file chooses`);
      if (grounds.every((ground) => ground === 'canvas' || ground === 'pattern')) problems.push('"grounds" leaves every section on the canvas; give at least one section a tint or accent ground');
    }
  }
  if (kind === 'occasion' && Array.isArray(data?.components)) {
    for (const { name } of data.components) if (FIXED_COMPONENTS.includes(name)) problems.push(`component "${name}" takes the name of a fixed component`);
  }
  if (onDomain(sourceHost(data) ?? '', 'refero.design')) problems.push('"source.url" is a Refero Styles page; the Refero corpus is never a preset source');
  return problems;
}

// A review past illustrative names who reviewed it and when; a partial one lists what was approved.
export function picksProblems(data) {
  const { status, reviewer, reviewed_on, approved_properties } = data?.review ?? {};
  const problems = [];
  if (status && status !== 'illustrative' && (!reviewer || !reviewed_on)) problems.push(`review status "${status}" needs a reviewer and reviewed_on`);
  if (status === 'partially-reviewed' && Array.isArray(approved_properties) && !approved_properties.length) problems.push('review status "partially-reviewed" needs its approved_properties');
  return problems;
}

// The preset's source host, '' when its URL cannot be read, undefined when it has no source.
export function sourceHost(preset) {
  if (!preset?.source) return undefined;
  try {
    return new URL(preset.source.url).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return '';
  }
}
// Finnomena's own pages need no design review; every other source, readable or not, is a third party.
export const isThirdParty = (host) => host !== undefined && !onDomain(host, 'finnomena.com');
