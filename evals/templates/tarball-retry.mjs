// Runs a command that installs from npm, and runs it again when npm has not served a tarball yet.
// A version is listed minutes before its tarball can be fetched, and an install that resolves to
// it in that window fails with E404 through no fault of this repository.
import { spawn } from 'node:child_process';

const MISSING_TARBALL = /404 Not Found - GET (\S+\.tgz)/;

function once(command, args, { cwd, env, stdout, stderr }) {
  return new Promise((done, reject) => {
    const child = spawn(command, args, { cwd, env, stdio: ['inherit', 'pipe', 'pipe'] });
    let output = '';
    child.stdout.on('data', (chunk) => { output += chunk; stdout.write(chunk); });
    child.stderr.on('data', (chunk) => { output += chunk; stderr.write(chunk); });
    child.on('error', reject);
    child.on('close', (code) => done({ code, output }));
  });
}

/**
 * Runs `command`, showing its output as it comes. When it fails on a tarball npm answers 404
 * for, waits `waitMs`, calls `beforeRetry` (to clear what the failed run left) and runs it
 * again, `tries` runs at most. Any other failure rejects at once, as does the last 404.
 */
export async function runRetryingMissingTarball(command, args, {
  cwd, env = process.env, tries = 5, waitMs = 60_000, beforeRetry = async () => {},
  log = console.error, stdout = process.stdout, stderr = process.stderr,
} = {}) {
  for (let attempt = 1; ; attempt++) {
    const { code, output } = await once(command, args, { cwd, env, stdout, stderr });
    if (code === 0) return;
    const tarball = output.match(MISSING_TARBALL)?.[1];
    if (!tarball) throw new Error(`${command} exited ${code}`);
    if (attempt === tries) throw new Error(`${command} exited ${code}: npm still answers 404 for ${tarball} after ${tries} runs`);
    log(`npm does not serve ${tarball} yet; run ${attempt + 1} of ${tries} in ${Math.round(waitMs / 1000)}s.`);
    await new Promise((resume) => setTimeout(resume, waitMs));
    await beforeRetry();
  }
}
