#!/usr/bin/env node
// finno (GLOSSARY, ADR 0010): Neon as one command. `finno setup` installs Neon into an agent, `finno mcp` is the
// tool server an agent starts, and options, candidates and render are the same tools for a person at a terminal.
import { ArtworkError } from './lib/finno/artwork.mjs';
import { TOOLS, VERSION, callTool } from './lib/finno/tools.mjs';

const HELP = `finno ${VERSION}: Finnomena brand tools for agents

  finno setup [--yes]       Install Neon into the agents on this computer. Shows its plan first.
  finno options             List the Formats, Colourways, Slopes and Page layouts artwork is drawn with.
  finno candidates [...]    Draw twelve Patterns on one numbered sheet, to pick from.
  finno render [...]        Draw one Brand Artwork: an SVG, a PNG and its Document.
  finno mcp                 Run the tool server (an agent starts this; it speaks MCP on stdin and stdout).

Settings for candidates and render, each as --name value:
${Object.entries(TOOLS.find(tool => tool.name === 'render').inputSchema.properties)
    .map(([name, { description }]) => `  --${name.padEnd(12)}${description}`).join('\n')}

  --json                    Print the answer as JSON.

Example:
  finno candidates --format story-9-16 --layout headline --headline "Invest [every month]"
  finno render --format story-9-16 --layout headline --headline "Invest [every month]" --set <set> --pick 4
`;

/** Reads --name value flags into the settings a tool takes, typed by the tool's schema. */
function parseSettings(tool, argv) {
  const settings = {};
  let json = false;
  for (let index = 0; index < argv.length; index++) {
    const flag = argv[index];
    if (flag === '--json') { json = true; continue; }
    const [name, inline] = flag.startsWith('--') ? flag.slice(2).split(/=(.*)/s) : [];
    const property = name && tool.inputSchema.properties[name];
    if (!property) throw new ArtworkError(`finno ${tool.name} takes no ${flag}. Run finno --help for the settings.`);
    if (property.type === 'boolean') { settings[name] = inline === undefined ? true : inline !== 'false'; continue; }
    const value = inline ?? argv[++index];
    if (value === undefined) throw new ArtworkError(`${flag} needs a value.`);
    settings[name] = property.type === 'string' ? value : Number(value);
  }
  return { settings, json };
}

function print(name, result) {
  if (name === 'options') {
    const { formats, colourways, slopes, layouts, text, defaults, customSize } = result;
    console.log(`Formats (default ${defaults.format})`);
    for (const format of formats) console.log(`  ${format.id.padEnd(14)}${format.width} x ${format.height}  ${format.label}`);
    console.log(`  ${customSize}`);
    console.log(`\nColourways (default ${defaults.colourway}): background, then block colours`);
    for (const colourway of colourways) console.log(`  ${colourway.id.padEnd(28)}${colourway.background}  ${colourway.blocks.join(' ')}`);
    console.log(`\nSlopes (default ${defaults.slope})`);
    for (const slope of slopes) console.log(`  ${slope.id.padEnd(14)}${slope.note}`);
    console.log(`\nPage layouts (default ${defaults.layout})`);
    for (const layout of layouts) console.log(`  ${layout.id.padEnd(14)}${layout.note}${layout.text.length ? ` Text: ${layout.text.join(', ')}.` : ''}`);
    console.log(`\n${text.highlight}\nText is drawn in ${text.typeface}.`);
  } else if (name === 'candidates') {
    console.log(`${result.count} Candidates: ${result.sheet}\nSet: ${result.set}\nTo draw one: finno render <the same settings> --set ${result.set} --pick <1 to ${result.count}>`);
  } else {
    console.log(`${result.files.svg}\n${result.files.png}\n${result.files.document}`);
    for (const warning of result.warnings) console.log(`Warning: ${warning.message}`);
    if (result.openInBlock) console.log(`Open in Block: ${result.openInBlock}`);
  }
}

const [command, ...rest] = process.argv.slice(2);
try {
  if (!command || command === '--help' || command === '-h' || command === 'help') {
    console.log(HELP);
  } else if (command === '--version' || command === '-v') {
    console.log(VERSION);
  } else if (command === 'mcp') {
    await (await import('./lib/finno/mcp.mjs')).serve();
  } else if (command === 'setup') {
    process.exitCode = await (await import('./lib/finno/setup.mjs')).setup(rest);
  } else if (TOOLS.some(tool => tool.name === command)) {
    const { settings, json } = parseSettings(TOOLS.find(tool => tool.name === command), rest);
    const { result } = await callTool(command, settings);
    if (json) console.log(JSON.stringify(result, null, 2));
    else print(command, result);
  } else {
    throw new ArtworkError(`finno has no command "${command}". Run finno --help.`);
  }
} catch (error) {
  if (!(error instanceof ArtworkError)) throw error;
  console.error(error.message);
  process.exitCode = 1;
}
