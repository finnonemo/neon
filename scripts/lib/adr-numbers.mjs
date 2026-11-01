import { readdir } from 'node:fs/promises';

// Two ADRs with one number make "ADR 0003" ambiguous. A pull request is checked
// on its merge with main, so an ADR numbered on a branch while main took the
// same number for another decision fails here.
export async function checkAdrNumbers(directory) {
  const byNumber = new Map();
  for (const name of (await readdir(directory)).filter(name => /^\d{4}-.*\.md$/.test(name)).sort()) {
    const number = name.slice(0, 4);
    byNumber.set(number, [...(byNumber.get(number) ?? []), name]);
  }
  const duplicates = [...byNumber.values()].filter(names => names.length > 1);
  if (duplicates.length) {
    throw new Error(`ADR numbers used twice:\n${duplicates.map(names => names.join(', ')).join('\n')}\nRenumber the newer ADR to the next free number and update its references.`);
  }
}
