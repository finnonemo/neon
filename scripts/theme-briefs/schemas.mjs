// Closed schemas for Theme Brief inputs. Every object rejects unknown keys,
// and every input is scanned for hex-like strings, px values and font fields
// (type and colors come from the theme, never from an input).

export const SECTION_ROLES = ['hero', 'proof', 'detail-list', 'call-out', 'form', 'footer'];
export const COLOURWAYS = ['palette', 'accent', 'support'];
export const SECONDARIES = ['green', 'blue', 'purple', 'red', 'orange'];
export const REVIEW_STATUSES = ['illustrative', 'partially-reviewed', 'reviewed'];
export const ENTRIES = ['tagline', 'mood-occasion', 'occasion-components', 'preset-dos-donts', 'imagery', 'layout', 'example-prompts'];

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
      components: list(object({ name: text, role: text, contentNotes: text, roles: list(oneOf(...COLOURWAYS, 'action'), 1) }), 2, 6),
      dos: list(text, 1, 3),
      donts: list(text, 1, 3),
      promptInputs: list(text, 1, 5),
      secondaryHighlights: list(oneOf(...SECONDARIES)),
    });
  }
  if (kind === 'layout') {
    return object({
      ...common,
      sections: list(oneOf(...SECTION_ROLES), 1),
      heroPattern: text,
      navigation: text,
      footer: text,
      density: oneOf('compact', 'comfortable', 'spacious'),
      blockRadius: step(facts.borderRadius, 'borderRadius'),
      sectionGap: step(facts.space, 'space'),
      cardPadding: step(facts.space, 'space'),
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
    brandPattern: object({ colourway: oneOf(...COLOURWAYS), ground: { type: 'integer' } }),
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
  (Array.isArray(data?.inputs) ? data.inputs : []).forEach((input, index) => {
    if (String(input).split('.').includes('source')) problems.push(`"inputs.${index}" names a preset source, which is never an input`);
  });
  if (Array.isArray(data?.after) && data.after.includes(name)) problems.push('"after" names the entry itself');
  return problems;
}

export function layoutProblems(data) {
  const { sections, brandPattern } = data ?? {};
  return Array.isArray(sections) && brandPattern?.section && !sections.includes(brandPattern.section)
    ? [`Brand Pattern section "${brandPattern.section}" is not one of its sections`] : [];
}

// Finnomena's own pages need no design review; every other host is a third party.
export function sourceHost(preset) {
  try {
    return new URL(preset?.source?.url).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return undefined;
  }
}
export const isThirdParty = (host) => Boolean(host) && host !== 'finnomena.com' && !host.endsWith('.finnomena.com');
