import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { loadCredentials, defineArgs } from './demo-env.mjs';

function withLocalFile(fileContents, verify) {
  const directory = mkdtempSync(join(tmpdir(), 'people-desk-env-'));
  try {
    if (fileContents !== null) writeFileSync(join(directory, '.env.local'), fileContents);
    verify(directory);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

test('uses fallback demo credentials when local file and environment variables are absent', () => {
  withLocalFile(null, (directory) => {
    assert.deepEqual(loadCredentials(directory, {}), { username: 'admin', password: 'admin123' });
  });
});

test('uses configured local credentials when .env.local exists', () => {
  withLocalFile('DEMO_USERNAME=reviewer\nDEMO_PASSWORD="review pass"\n', (directory) => {
    assert.deepEqual(loadCredentials(directory, {}), {
      username: 'reviewer',
      password: 'review pass',
    });
  });
});

test('uses Vercel environment variables without a local file', () => {
  withLocalFile(null, (directory) => {
    assert.deepEqual(
      loadCredentials(directory, { DEMO_USERNAME: 'vercel-user', DEMO_PASSWORD: 'vercel-pass' }),
      {
        username: 'vercel-user',
        password: 'vercel-pass',
      },
    );
  });
});

test('falls back independently for missing or empty values', () => {
  withLocalFile('DEMO_USERNAME=reviewer\nDEMO_PASSWORD=\n', (directory) => {
    assert.deepEqual(loadCredentials(directory, { DEMO_PASSWORD: 'from-process' }), {
      username: 'reviewer',
      password: 'admin123',
    });
  });
});

test('encodes credentials as valid JavaScript string definitions', () => {
  assert.deepEqual(defineArgs({ username: 'a"b', password: 'line\npass' }), [
    '--define=__DEMO_USERNAME__="a\\"b"',
    '--define=__DEMO_PASSWORD__="line\\npass"',
  ]);
});
