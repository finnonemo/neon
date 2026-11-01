import { readFile } from 'node:fs/promises';

// Hosts drop a skill whose frontmatter a YAML parser rejects, without saying why.
const MAX_NAME = 64;
const MAX_DESCRIPTION = 1024;
// Text that was UTF-8, misread as Latin-1/CP1252 and saved again: Thai (à¸, à¹),
// Latin accents (Ã + another non-ASCII char), punctuation (â€), or a lossy
// round-trip that already replaced bytes (U+FFFD).
const DOUBLE_ENCODED = /à[¸¹]|Ã[^\x00-\x7F]|â€|�/;
const decoder = new TextDecoder('utf-8', { fatal: true });

async function readUtf8(file) {
  const bytes = await readFile(file);
  try {
    return decoder.decode(bytes);
  } catch {
    throw new Error(`Markdown is not valid UTF-8: ${file}`);
  }
}

export async function checkMarkdownEncoding(file) {
  const lines = (await readUtf8(file)).split('\n');
  const index = lines.findIndex(line => DOUBLE_ENCODED.test(line));
  if (index !== -1) {
    throw new Error(`Double-encoded text in ${file} at line ${index + 1}: re-save the source text as UTF-8 (found "${lines[index].match(DOUBLE_ENCODED)[0]}")`);
  }
}

// A strict reading of one single-line YAML scalar. Double-quoted values are
// decoded as JSON, which rejects YAML-only escapes such as \x41 and \e; that is
// stricter than YAML, never looser.
function parseScalar(raw, fail) {
  if (raw.startsWith('"')) {
    if (!/^"(?:[^"\\]|\\.)*"$/.test(raw)) fail('a double-quoted value must end at its closing quote');
    try {
      return JSON.parse(raw);
    } catch {
      return fail('unsupported escape in a double-quoted value');
    }
  }
  if (raw.startsWith("'")) {
    const quoted = raw.match(/^'((?:[^']|'')*)'$/);
    if (!quoted) fail("a single-quoted value must end at its closing quote (write '' for a quote inside it)");
    return quoted[1].replaceAll("''", "'");
  }
  if (/^[|>]/.test(raw)) fail('use a single-line value, not a block scalar');
  if (/^([[\]{}#&*!%@`,]|[-?:](\s|$))/.test(raw)) fail(`a plain value cannot start with "${raw[0]}"; quote it`);
  if (raw.includes(': ') || raw.endsWith(':')) fail('a plain value cannot contain ": "; quote the whole value');
  if (/\s#/.test(raw)) fail('" #" starts a YAML comment in a plain value; quote the whole value');
  return raw;
}

export async function checkSkillMetadata(file) {
  const fail = reason => { throw new Error(`Invalid skill metadata in ${file}: ${reason}`); };
  const block = (await readUtf8(file)).match(/^---\n([\s\S]*?)\n---(?:\n|$)/);
  if (!block) fail('frontmatter must open the file and close with a --- line');
  const fields = new Map();
  let key;
  for (const line of block[1].split('\n')) {
    if (line.trim() === '' || line.startsWith('#')) continue;
    if (/^\s/.test(line)) {
      if (key === 'name' || key === 'description') fail(`"${key}" must be a single-line value`);
      continue;
    }
    const field = line.match(/^([\w-]+):(?:[ \t]+(.*?))?[ \t]*$/);
    if (!field) fail(`cannot parse "${line}"`);
    key = field[1];
    const raw = field[2] ?? '';
    if (fields.has(key)) fail(`duplicate "${key}"`);
    if (key === 'name' || key === 'description') {
      fields.set(key, raw && parseScalar(raw, reason => fail(`"${key}": ${reason}`)));
    } else {
      // Other keys may hold flow or block values; only catch the misread plain value.
      if (!/^["'[{|>&*!]/.test(raw) && raw.includes(': ')) fail(`"${key}": a plain value cannot contain ": "; quote the whole value`);
      fields.set(key, raw);
    }
  }
  const name = fields.get('name');
  if (!name || name.length > MAX_NAME || !/^[a-z0-9-]+$/.test(name)) fail(`"name" must be 1-${MAX_NAME} lowercase letters, digits or hyphens`);
  const description = fields.get('description');
  if (!description) fail('"description" is required');
  if (description.length > MAX_DESCRIPTION) fail(`"description" is ${description.length} characters; the limit is ${MAX_DESCRIPTION}`);
}

// Evals showed agents skip a reference that a numbered step only links
// ("Verify with the shared checklist"); a read verb makes them load it.
const STEP = /^\s*\d+\.\s/;
const MARKDOWN_LINK = /\]\([^)\s]+\.md(?:#[^)]*)?\)/;
const READ_VERB = /\b(read|use|follow)\b/i;

export async function checkStepReads(file) {
  const lines = (await readUtf8(file)).split('\n');
  const index = lines.findIndex(line => STEP.test(line) && MARKDOWN_LINK.test(line) && !READ_VERB.test(line));
  if (index !== -1) {
    throw new Error(`Step links a reference without a read verb in ${file} at line ${index + 1}: say "read the [...]" so agents load it`);
  }
}
