#!/usr/bin/env node
// Prepares a release, or checks that this checkout may be published.
//
//   node scripts/release.mjs <version>         set the version, rebuild registry/r/, check both packages
//   node scripts/release.mjs --check-publish   what `npm publish` runs first (package.json, prepublishOnly)
//
// It commits, pushes, tags and publishes nothing: it prints those steps, in order, when it is done.
import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { packagePlugin } from './package-plugin.mjs';
import { publishProblems, releaseTag, setVersion } from './lib/release.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const [argument] = process.argv.slice(2);

if (argument === '--check-publish') {
  const problems = await publishProblems({ root });
  for (const problem of problems) console.error(problem);
  process.exit(problems.length ? 1 : 0);
}
if (!argument) {
  console.error('Usage: node scripts/release.mjs <version> | --check-publish');
  process.exit(1);
}

const version = argument;
const trek = (path) => /trek/i.test(path);
await setVersion({ root, version });
execFileSync(process.execPath, [join(root, 'scripts/build-registry.mjs')], { cwd: root, stdio: 'inherit' });

// The plugin, packaged into an empty directory.
const destination = await mkdtemp(join(tmpdir(), 'neon-release-'));
try {
  await packagePlugin({ destination });
  for (const manifest of ['.claude-plugin/plugin.json', '.codex-plugin/plugin.json']) {
    const packaged = JSON.parse(await readFile(join(destination, manifest), 'utf8')).version;
    if (packaged !== version) throw new Error(`The packaged ${manifest} reads ${packaged}, not ${version}.`);
  }
  const fonts = (await readdir(destination, { recursive: true })).filter(trek);
  if (fonts.length) throw new Error(`The packaged plugin holds Finnomena Trek, which must not be distributed (ADR 0010): ${fonts.join(', ')}`);
} finally {
  await rm(destination, { recursive: true, force: true });
}

// The npm package, as `npm publish` would send it.
const [tarball] = JSON.parse(execFileSync('npm', ['pack', '--dry-run', '--json'], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }));
if (tarball.version !== version) throw new Error(`The npm package reads ${tarball.version}, not ${version}.`);
const sent = tarball.files.map((file) => file.path).filter(trek);
if (sent.length) throw new Error(`The npm package holds Finnomena Trek, which must not be distributed (ADR 0010): ${sent.join(', ')}`);

const tag = releaseTag(version);
console.log(`
${version} is prepared: ${tarball.entryCount} files in the npm package, no Finnomena Trek in either package.

What is left, in this order:
  1. node scripts/validate.mjs
     npm test --prefix evals/templates -- --target neon     (registry/r/ changed, so the browser suite applies)
  2. Commit, open the pull request, and merge it: node scripts/merge-pr.mjs <n>
  3. Tag the merge commit and push the tag. Until then the item URLs on main return 404:
     git tag ${tag} <merge commit>
     git push origin refs/tags/${tag}
  4. The owner publishes from the tagged commit; npm refuses anywhere else:
     git switch --detach ${tag}
     npm publish
  5. Install it on a real host: npx finnomena@latest setup
     Host installation, browser checks and design approval stay unverified until performed.
`);
