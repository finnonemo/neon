// finno's tool server: the Model Context Protocol over stdin and stdout, one JSON-RPC message a line. Written by
// hand because the plugin is installed from the repository with no install step, so it can have no dependencies.
import { createInterface } from 'node:readline';
import { ArtworkError } from './artwork.mjs';
import { TOOLS, VERSION, callTool, toContent } from './tools.mjs';

const PROTOCOL_VERSIONS = ['2025-11-25', '2025-06-18', '2025-03-26', '2024-11-05'];
const INSTRUCTIONS = 'Draws Finnomena Brand Artwork (a Pattern, or one Page with a headline and the logo) with the Block engine, on this computer. '
  + 'Call options once, then candidates to show the employee twelve Patterns, then render with the set and the number they pick. '
  + 'Choose every Format, Colourway and layout from options; the engine refuses anything else.';

/** Answers one JSON-RPC message, or returns nothing for a notification. */
export async function handle(message) {
  const { id, method, params } = message;
  const reply = result => ({ jsonrpc: '2.0', id, result });
  const fail = (code, text) => ({ jsonrpc: '2.0', id: id ?? null, error: { code, message: text } });
  if (typeof method !== 'string') return id === undefined ? undefined : fail(-32600, 'Not a request.');
  if (id === undefined) return undefined; // A notification: nothing to answer.
  switch (method) {
    case 'initialize':
      return reply({
        protocolVersion: PROTOCOL_VERSIONS.includes(params?.protocolVersion) ? params.protocolVersion : PROTOCOL_VERSIONS[0],
        capabilities: { tools: {} },
        serverInfo: { name: 'finno', title: 'Finnomena Brand Artwork', version: VERSION },
        instructions: INSTRUCTIONS,
      });
    case 'ping':
      return reply({});
    case 'tools/list':
      return reply({ tools: TOOLS.map(({ name, description, inputSchema }) => ({ name, description, inputSchema })) });
    case 'tools/call':
      try {
        return reply({ content: toContent(await callTool(params?.name, params?.arguments ?? {})) });
      } catch (error) {
        // A refused request is the tool's answer, so the agent can read it and try again.
        const text = error instanceof ArtworkError ? error.message : `finno failed: ${error?.stack ?? error}`;
        return reply({ content: [{ type: 'text', text }], isError: true });
      }
    case 'resources/list':
      return reply({ resources: [] });
    case 'prompts/list':
      return reply({ prompts: [] });
    default:
      return fail(-32601, `Method not found: ${method}`);
  }
}

/** Serves until the input closes. Messages are answered in the order they arrive. */
export async function serve({ input = process.stdin, output = process.stdout } = {}) {
  const lines = createInterface({ input, crlfDelay: Infinity });
  for await (const line of lines) {
    if (!line.trim()) continue;
    let message;
    try {
      message = JSON.parse(line);
    } catch {
      output.write(`${JSON.stringify({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } })}\n`);
      continue;
    }
    const answers = Array.isArray(message) ? (await Promise.all(message.map(handle))).filter(Boolean) : await handle(message);
    if (answers && (!Array.isArray(answers) || answers.length)) output.write(`${JSON.stringify(answers)}\n`);
  }
}
