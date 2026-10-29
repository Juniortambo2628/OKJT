#!/usr/bin/env node
/**
 * Proves a styling refactor changed nothing people see: record the computed
 * colours and fonts of every visible element on a page, before and after, and
 * list each element that differs.
 *
 * In a Playwright test:
 *
 *   import { captureStyles } from '@okjt/ui/tools/style-snapshot';
 *   const elements = await captureStyles(page);   // write it to <dir>/<route>.json
 *
 * Then, from a shell:
 *
 *   node style-snapshot.mjs compare <before-dir> <after-dir>
 *
 * Colours are compared as the pixels they paint (sRGB, 8 bits a channel), so
 * `#A67B5B`, `var(--color-accent)` and `rgb(166 123 91)` count as the same.
 */
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Properties recorded for every visible element. */
export const PROPERTIES = [
  'color', 'background-color', 'background-image',
  'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color',
  'box-shadow', 'text-shadow', 'outline-color', 'text-decoration-color',
  'fill', 'stroke', 'caret-color', 'font-family', 'font-weight', 'font-size',
];

/** Every visible element of the page: its DOM path and PROPERTIES, colours as rgba(). */
export async function captureStyles(page, { root = 'body' } = {}) {
  return page.evaluate(({ root, properties }) => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const painted = new Map();
    const paint = (value) => {
      if (!painted.has(value)) {
        ctx.clearRect(0, 0, 1, 1);
        ctx.fillStyle = 'rgba(0,0,0,0)';
        ctx.fillStyle = value;
        ctx.fillRect(0, 0, 1, 1);
        const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
        painted.set(value, a === 0 ? 'transparent' : `rgba(${r},${g},${b},${a})`);
      }
      return painted.get(value);
    };
    const COLOR = /(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\([^()]*\)|#[0-9a-fA-F]{3,8}\b/g;
    const normalise = (value) => value.replace(COLOR, paint);

    const path = (el) => {
      const parts = [];
      for (let node = el; node && node !== document.body; node = node.parentElement) {
        const siblings = node.parentElement ? [...node.parentElement.children].filter((c) => c.tagName === node.tagName) : [];
        parts.unshift(siblings.length > 1 ? `${node.tagName.toLowerCase()}:${siblings.indexOf(node) + 1}` : node.tagName.toLowerCase());
      }
      return parts.join('>') || 'body';
    };

    const out = [];
    for (const el of [document.querySelector(root), ...document.querySelectorAll(`${root} *`)]) {
      if (!el || ['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'LINK', 'META'].includes(el.tagName)) continue;
      const style = getComputedStyle(el);
      const box = el.getBoundingClientRect();
      if (style.display === 'none' || style.visibility === 'hidden' || (box.width === 0 && box.height === 0)) continue;
      const props = {};
      for (const name of properties) props[name] = normalise(style.getPropertyValue(name));
      out.push({ path: path(el), class: el.getAttribute('class') ?? '', props });
    }
    return out;
  }, { root, properties: PROPERTIES });
}

/** Elements whose recorded properties differ, plus elements found on one side only. */
export function compareStyles(before, after) {
  const index = (list) => new Map(list.map((e) => [e.path, e]));
  const a = index(before);
  const b = index(after);
  const diffs = [];
  for (const [path, el] of a) {
    const other = b.get(path);
    if (!other) { diffs.push({ path, kind: 'missing after', class: el.class }); continue; }
    const changed = Object.keys(el.props).filter((p) => el.props[p] !== other.props[p]);
    if (changed.length) diffs.push({ path, kind: 'changed', classBefore: el.class, classAfter: other.class, changes: Object.fromEntries(changed.map((p) => [p, [el.props[p], other.props[p]]])) });
  }
  for (const [path, el] of b) if (!a.has(path)) diffs.push({ path, kind: 'new after', class: el.class });
  return diffs;
}

/** Compare every <name>.json in two folders. Returns { name: diffs } for the ones that differ. */
export async function compareFolders(beforeDir, afterDir) {
  const names = (await readdir(beforeDir)).filter((f) => f.endsWith('.json'));
  const result = {};
  for (const name of names) {
    const read = async (dir) => JSON.parse(await readFile(join(dir, name), 'utf8').catch(() => '[]'));
    const diffs = compareStyles(await read(beforeDir), await read(afterDir));
    if (diffs.length) result[name.replace(/\.json$/, '')] = diffs;
  }
  return result;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [command, beforeDir, afterDir] = process.argv.slice(2);
  if (command !== 'compare' || !beforeDir || !afterDir) {
    console.error('usage: style-snapshot.mjs compare <before-dir> <after-dir>');
    process.exit(2);
  }
  const result = await compareFolders(beforeDir, afterDir);
  const routes = Object.keys(result);
  for (const route of routes) {
    console.log(`\n${route}: ${result[route].length} element(s) differ`);
    for (const d of result[route].slice(0, 20)) {
      console.log(`  ${d.kind} ${d.path}`);
      for (const [prop, [from, to]] of Object.entries(d.changes ?? {})) console.log(`    ${prop}: ${from}  →  ${to}`);
    }
    if (result[route].length > 20) console.log(`  … and ${result[route].length - 20} more`);
  }
  console.log(routes.length ? `\n${routes.length} route(s) differ.` : 'No differences.');
  process.exit(routes.length ? 1 : 0);
}
