import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseEnv } from 'node:util';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const cli = fileURLToPath(new URL('../node_modules/@angular/cli/bin/ng.js', import.meta.url));

export function loadCredentials(directory = projectRoot, environment = process.env) {
  const localFile = join(directory, '.env.local');
  const variables = existsSync(localFile) ? parseEnv(readFileSync(localFile, 'utf8')) : environment;
  return {
    username: variables.DEMO_USERNAME || 'admin',
    password: variables.DEMO_PASSWORD || 'admin123',
  };
}

export function defineArgs({ username, password }) {
  return [
    `--define=__DEMO_USERNAME__=${JSON.stringify(username)}`,
    `--define=__DEMO_PASSWORD__=${JSON.stringify(password)}`,
  ];
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === fileURLToPath(new URL(`file://${process.argv[1]}`))
) {
  const [command, ...options] = process.argv.slice(2);
  const child = spawn(
    process.execPath,
    [cli, command, ...defineArgs(loadCredentials()), ...options],
    {
      stdio: 'inherit',
    },
  );
  child.on('error', (error) => {
    console.error(error);
    process.exitCode = 1;
  });
  child.on('exit', (code, signal) => {
    if (signal) process.kill(process.pid, signal);
    else process.exitCode = code ?? 1;
  });
}
