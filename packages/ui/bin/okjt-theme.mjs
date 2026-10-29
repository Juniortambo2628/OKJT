#!/usr/bin/env node
/**
 * Writes the project's theme (okjt.config.js → theme) as a Tailwind 4 @theme
 * block. Run from the app's root, before `vite` and `vite build`:
 *
 *   okjt-theme [--config okjt.config.js] [--out src/okjt-theme.css] [--check]
 *
 * --check writes nothing and fails if the file is out of date (for CI).
 */
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { compileTheme } from '../src/theme.js';

const { values } = parseArgs({
  options: {
    config: { type: 'string', default: 'okjt.config.js' },
    out: { type: 'string', default: 'src/okjt-theme.css' },
    check: { type: 'boolean', default: false },
  },
});

const configPath = resolve(values.config);
const outPath = resolve(values.out);
const { default: config } = await import(pathToFileURL(configPath).href);
const css = compileTheme(config);
const current = await readFile(outPath, 'utf8').catch(() => null);

if (values.check) {
  if (current !== css) {
    console.error(`okjt-theme: ${values.out} is out of date with ${values.config}. Run okjt-theme.`);
    process.exit(1);
  }
} else if (current !== css) {
  await writeFile(outPath, css);
  console.log(`okjt-theme: wrote ${values.out}`);
}
