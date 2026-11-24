import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { checkContrast, contrastRatio, over, KIT_PAIRS } from '../src/contrast.js';

// A theme every kit pair passes: dark text on white, a dark accent.
const readable = {
  ink: '#111111', inkDeep: '#000000', body: '#222222', soft: '#555555', muted: '#666666', faint: '#777777',
  accent: '#7a3b12', accentStrong: '#5c2a0b', accentDark: '#4a2208', accentSoft: '#c9a27f',
  line: '#e5e5e5', lineStrong: '#d4d4d4', tint: '#f5f5f5', paper: '#fafafa', paperWarm: '#f7f4f0',
  positive: '#2f6b2f', positiveDark: '#1f4d1f',
};

test('contrast ratios match WCAG reference values', () => {
  assert.equal(Math.round(contrastRatio('#000000', '#ffffff') * 10) / 10, 21);
  assert.equal(contrastRatio('#777777', '#777777'), 1);
  // #767676 on white is the classic 4.54:1.
  assert.equal(Math.round(contrastRatio('#767676', '#ffffff') * 100) / 100, 4.54);
});

test('a translucent colour is mixed with what is under it', () => {
  assert.equal(over('#000000', 0.5, '#ffffff'), '#808080');
});

test('a readable theme passes every kit pair, on the site and the dashboard', () => {
  const results = checkContrast({ theme: { colors: readable, dashboard: { colors: { body: '#1a1a1a' } } } });
  assert.ok(results.length > KIT_PAIRS.length, 'checks the dashboard as well');
  assert.deepEqual(results.filter((r) => !r.ok), []);
});

test('a faint colour fails, naming the pair and the ratio', () => {
  // Naoa's public brown, as text on white: 3.75:1.
  const results = checkContrast({ theme: { colors: { ...readable, accent: '#A67B5B' } } });
  const links = results.find((r) => r.what === 'Links and eyebrows on cards');
  assert.equal(links.ok, false);
  assert.equal(links.ratio, 3.75);
  assert.equal(links.where, 'site');
});

test('the dashboard is checked with its own colours, and only for the pairs it draws', () => {
  const results = checkContrast({ theme: { colors: readable, dashboard: { colors: { surface: 'rgb(20 21 22 / 0.9)', paper: '#0b0c0d', body: '#e5e7eb', soft: '#9ca3af', ink: '#ffffff', accent: '#DC143C' } } } });
  const dash = results.filter((r) => r.where === 'dashboard');
  // The see-through panel is seen over the page.
  assert.equal(dash.find((r) => r.what === 'Body text on cards and dialogs').bg, over('#141516', 0.9, '#0b0c0d'));
  assert.equal(dash.find((r) => r.what === 'Links and eyebrows on cards').ok, false);
  // Site-only pairs (the footer, filled controls) aren't checked on the dashboard.
  assert.equal(dash.some((r) => r.what.startsWith('Text on the dark footer')), false);
  assert.equal(results.some((r) => r.where === 'site' && r.what.startsWith('Action button')), false);
});

test("a project's own pairs are checked too", () => {
  const results = checkContrast({ theme: { colors: readable, contrastPairs: [['Hints on cards', 'tone-400', 'surface', 4.5]] } });
  const hints = results.find((r) => r.what === 'Hints on cards');
  assert.ok(hints, 'checked');
  assert.equal(hints.ok, false); // stone-400 on white is about 2.5:1
});

test('okjt-theme --check-contrast exits 1 on a faint theme and 0 on a readable one', () => {
  const bin = fileURLToPath(new URL('../bin/okjt-theme.mjs', import.meta.url));
  const dir = mkdtempSync(join(tmpdir(), 'okjt-contrast-'));
  const write = (name, colors) => {
    const file = join(dir, name);
    writeFileSync(file, `export default { theme: { colors: ${JSON.stringify(colors)} } };\n`);
    return file;
  };
  const run = (file) => {
    try { execFileSync(process.execPath, [bin, '--config', file, '--check-contrast'], { stdio: 'pipe' }); return 0; } catch (err) { return err.status; }
  };
  assert.equal(run(write('ok.mjs', readable)), 0);
  assert.equal(run(write('faint.mjs', { ...readable, accent: '#A67B5B' })), 1);
});

test('reads oklch, as the kit writes its grey ramps', () => {
  // Tailwind's stone-500 is oklch(55.3% 0.013 58.071) ≈ #79716b.
  const results = checkContrast({ theme: { colors: readable, contrastPairs: [['x', 'oklch(55.3% 0.013 58.071)', '#79716b', 1]] } });
  assert.ok(results.at(-1).ratio < 1.03, `stone-500 read as ${results.at(-1).fg}`);
});
