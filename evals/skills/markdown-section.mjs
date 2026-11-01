// Helpers shared by the static guard tests over skill and README prose.

const escape = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// The body under `heading` at `level` (`##`, `###`), up to the next heading at that level or above.
export function section(source, heading, level = '##') {
  return source.match(new RegExp(`^${level} ${escape(heading)}\\n([\\s\\S]*?)(?=^#{2,${level.length}} |$(?![\\s\\S]))`, 'm'))?.[1] ?? '';
}

// Numeric visual-score shapes ADR 0002 rules out: "8/10", "4 out of 5", a weighted score, a score cap.
export const numericScore = /\b\d+(?:\.\d+)?\s*(?:\/|out of)\s*(?:5|10|100)\b|\bweighted score\b|\bscore (?:of|cap)\b/i;
