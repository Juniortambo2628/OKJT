import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';

const src = new URL('../src/', import.meta.url);
const dist = new URL('../dist/', import.meta.url);

test('every source module is built, and the index names only built modules', async () => {
  const built = new Set(await readdir(dist));
  for (const file of await readdir(src)) assert.ok(built.has(file.replace(/\.jsx$/, '.js')), `${file} was not built`);
  const index = await readFile(new URL('index.js', dist), 'utf8');
  for (const [, path] of index.matchAll(/from "\.\/([^"]+)"/g)) assert.ok(built.has(path), `index.js names ${path}`);
});

test('relative imports name the built file, so the output is valid ESM', async () => {
  for (const file of await readdir(dist)) {
    const code = await readFile(new URL(file, dist), 'utf8');
    for (const [, path] of code.matchAll(/from "(\.[^"]+)"/g)) assert.match(path, /\.js$/, `${file} imports ${path}`);
  }
});

test('no project-specific words in the kit: they come from `site`', async () => {
  for (const file of await readdir(src)) {
    const code = await readFile(new URL(file, src), 'utf8');
    assert.doesNotMatch(code, /naoa|najenga|wedding|okjtech/i, file);
  }
});
