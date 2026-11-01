import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// Static guards for the blind output-quality protocol (#56; README "Output quality (blind)").
// They check the protocol is stated, not that a round was run well.
const readme = await readFile(new URL('./README.md', import.meta.url), 'utf8');
const section = readme.match(/^## Output quality \(blind\)\n([\s\S]*?)(?=^## )/m)?.[1] ?? '';

test('the protocol sits before the flow refactor evaluation and has the last row of the scenario table', () => {
  const headings = [...readme.matchAll(/^## (.+)$/gm)].map(match => match[1]);
  assert.equal(headings[headings.indexOf('Flow refactor evaluation') - 1], 'Output quality (blind)');
  const table = readme.match(/^\| Request\/context \| Observe \|\n(?:^\|.*\n)+/m)[0].trim().split('\n');
  assert.match(table.at(-1), /See \[Output quality \(blind\)\]\(#output-quality-blind\)/);
});

test('both requests appear verbatim, with only the port left per run', () => {
  for (const request of [
    '> /neon:neon-create Build a Finnomena event page in ./event. The event is "Finnomena Data Night: เบื้องหลังเครื่องมือข้อมูล", an evening meetup for engineers, analysts and designers about how our team builds data tools. It\'s on Thursday 10 December 2026, 18:30–21:00, at Finnomena HQ, Column Tower 22nd floor, Ratchadaphisek Road, Bangkok. Agenda: three short talks by our data team, a live demo of our internal dashboards, then networking with food and drinks. Registration is on https://example.com/data-night. Headline in Thai. Use port &lt;port&gt; for any dev or preview server.',
    '> /neon:neon-create Build a Finnomena Back Office approvals screen in ./approvals with mock data. Operations staff review pending customer requests (fund switches, redemptions over the daily limit and KYC updates), open one to see its details, then approve it, or reject it with a reason. Use port &lt;port&gt; for any dev or preview server.',
  ]) assert.ok(section.includes(`\n${request}\n`), request.slice(0, 60));
});

test('three samples per request and package, judged blind at 375px and 1440px', () => {
  assert.match(section, /three samples of each request per package/);
  assert.match(section, /375×812 and 1440×900/);
  assert.match(section, /randomly assign one output to side A/);
  assert.match(section, /key .* to a folder the judge never reads/);
  assert.match(section, /no transcript context/);
  // The rubric is the Look and fix questions plus the habits table.
  assert.match(section, /verification\.md#look-and-fix/);
  assert.match(section, /review-checks\.md#functional-screen-habits/);
});

test('results are preferences and named problems, never a score, and stay out of readiness', () => {
  assert.match(section, /preference for A, B or neither/);
  assert.match(section, /named problems/);
  assert.match(section, /never feeds readiness/);
  assert.match(section, /`\.local\/evals\/`/);
  // The score shapes look-and-fix.test.mjs bans from skill files, plus percentages and rating scales
  // ("1-5", not a model id such as claude-opus-5-5).
  assert.doesNotMatch(section, /\b\d+(?:\.\d+)?\s*(?:\/|out of)\s*(?:5|10|100)\b|\bweighted score\b|\bscore (?:of|cap)\b|\d\s*%|(?<![\w-])[1-5]\s*(?:-|–|to)\s*(?:5|10)\b/i);
});
