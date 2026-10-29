import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compileTheme, defineConfig, COLOR_TOKENS } from '../src/theme.js';
import { RAMPS } from '../src/ramps.js';

const colors = Object.fromEntries(Object.keys(COLOR_TOKENS).map((name, i) => [name, `#00000${i % 10}`]));

test('every colour token becomes a --color variable, in kebab case', () => {
  const css = compileTheme({ theme: { colors: { ...colors, accentStrong: '#A06A47' } } });
  assert.match(css, /^@theme \{$/m);
  assert.match(css, /--color-accent-strong: #A06A47;/);
  assert.match(css, /--color-ink-deep: /);
});

test('tone defaults to Tailwind stone, step for step', () => {
  const css = compileTheme({ theme: { colors } });
  assert.match(css, new RegExp(`--color-tone-200: ${RAMPS.stone[200].replace(/[().%]/g, '\\$&')};`));
  assert.match(css, /--color-tone-950: /);
});

test('tone can name another ramp or be written out', () => {
  assert.match(compileTheme({ theme: { colors: { ...colors, tone: 'slate' } } }), new RegExp(RAMPS.slate[500].replace(/[().%]/g, '\\$&')));
  const own = Object.fromEntries([50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((s) => [s, `#${String(s).padStart(6, '0')}`]));
  assert.match(compileTheme({ theme: { colors: { ...colors, tone: own } } }), /--color-tone-500: #000500;/);
});

test('fonts become --font variables', () => {
  const css = compileTheme({ theme: { colors, fonts: { display: "'Manrope Variable', sans-serif" } } });
  assert.match(css, /--font-display: 'Manrope Variable', sans-serif;/);
});

test('a missing, unknown or misspelt token fails the build, naming it', () => {
  const { ink, ...noInk } = colors;
  assert.throws(() => defineConfig({ theme: { colors: noInk } }), /missing ink/);
  assert.throws(() => defineConfig({ theme: { colors: { ...colors, brand: '#fff' } } }), /unknown brand/);
  assert.throws(() => defineConfig({ theme: { colors: { ...colors, tone: 'beige' } } }), /tone 'beige'/);
  assert.throws(() => defineConfig({ theme: { colors: { ...colors, tone: { 50: '#fff' } } } }), /missing steps 100/);
  assert.throws(() => compileTheme({ theme: { colors, fonts: { serif: 'x' } } }), /unknown serif/);
  assert.throws(() => defineConfig({}), /theme.colors is required/);
});
