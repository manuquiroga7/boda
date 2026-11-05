import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

function files(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? files(join(dir, e.name)) : [join(dir, e.name)]));
}

test('assets (sin la música) pesan menos de 3 MB', () => {
  const total = files('assets')
    .filter((f) => !f.replaceAll('\\', '/').startsWith('assets/audio/'))
    .reduce((sum, f) => sum + statSync(f).size, 0);
  assert.ok(total < 3 * 1024 * 1024, `pesan ${total} bytes`);
});

test('ninguna foto de la historia pesa más de 300 KB', () => {
  for (const f of files('assets/img/story')) assert.ok(statSync(f).size <= 300 * 1024, `${f} es demasiado pesada`);
});
