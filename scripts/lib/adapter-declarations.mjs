// The Core sync rewrites the CSS adapter's generated values a line at a time, and the repository check
// compares them the same way, so each one is declared alone on its line. CSS can declare the same
// property in shapes a line pattern does not see; this refuses them.

/** The lines of `css` with its comments blanked, so a line's index still names the adapter's line. */
export function codeLines(css) {
  return css.replace(/"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|\/\*[\s\S]*?\*\//g, token => (token.startsWith('/*') ? token.replace(/[^\n]/g, ' ') : token)).split('\n');
}

/**
 * Refuses a line of `css` that names a property of `family` (a pattern source, as `--color-`) without
 * being `declaration`: a comment before the colon, the colon on the next line, a second declaration on
 * the line. A name inside a comment or a var() reference is not a declaration. Also refuses any CSS
 * escape outside a comment, which can spell a property's name so that no pattern finds it.
 * `alone` finishes the sentence "<file>:<line> must hold …".
 */
export function refuseUnseenDeclarations(file, css, family, declaration, alone) {
  const lines = css.split('\n');
  const code = codeLines(css);
  const escape = code.findIndex(line => line.includes('\\'));
  if (escape > -1) throw new Error(`${file}:${escape + 1} holds a CSS escape, which can spell a property's name another way. Write the name out.`);
  const named = new RegExp(`(?<!var\\(\\s*)${family}`);
  const stray = code.findIndex((line, index) => named.test(line) && !declaration.test(lines[index]));
  if (stray > -1) throw new Error(`${file}:${stray + 1} must hold ${alone}`);
}
