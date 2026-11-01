import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { numericScore } from './markdown-section.mjs';
import { parseRecord } from './build-index.mjs';

// Static guards for the blind output-quality protocol (#56; records/output-quality-blind.md).
// They check the protocol is stated, not that a round was run well.
const file = new URL('./records/output-quality-blind.md', import.meta.url);
const section = await readFile(file, 'utf8');

test('the record owns the blind comparison scenario row', () => {
  const { title, scenarios } = parseRecord(section, 'records/output-quality-blind.md');
  assert.equal(title, 'Output quality (blind)');
  assert.ok(scenarios.some(row => /baseline against revised skills \(blind\)/.test(row.request) && /never feeds readiness/.test(row.observe)));
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
  // The score shapes banned from skill files, plus percentages and rating scales
  // ("1-5", not a model id such as claude-opus-5-5).
  assert.doesNotMatch(section, numericScore);
  assert.doesNotMatch(section, /\d\s*%|(?<![\w-])[1-5]\s*(?:-|–|to)\s*(?:5|10)\b/i);
});
