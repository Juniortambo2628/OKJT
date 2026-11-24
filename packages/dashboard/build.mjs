// Compiles src/ to dist/: JSX to plain JS, one file per module, nothing bundled.
// Class names stay as written, so the app's Tailwind can scan dist/.
import { build } from 'esbuild';
import { copyFile, readdir, rm } from 'node:fs/promises';

const entryPoints = (await readdir('src')).filter((f) => /\.(jsx?|mjs)$/.test(f)).map((f) => `src/${f}`);
await rm('dist', { recursive: true, force: true });
await build({ entryPoints, outdir: 'dist', format: 'esm', jsx: 'automatic', target: 'es2022', logLevel: 'warning' });

// Stylesheets ship as they are (e.g. toolbar-glass.css).
for (const f of (await readdir('src')).filter((f) => f.endsWith('.css'))) await copyFile(`src/${f}`, `dist/${f}`);
