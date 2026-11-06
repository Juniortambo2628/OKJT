/**
 * The app uses the OKJT kit straight from ../../packages (file: links), so
 * it builds with the kit at the same commit. Build the kit's packages when
 * their dist/ folders are missing (a fresh checkout, CI, the deploy); skip
 * it otherwise. `npm run kit` rebuilds them on purpose.
 */
import { existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const packages = fileURLToPath(new URL('../../../packages/', import.meta.url));
const built = ['ui', 'site', 'dashboard'].every((name) => existsSync(`${packages}${name}/dist/index.js`));

if (!built) {
  console.log('Building the OKJT kit (packages/)…');
  execSync('npm ci --no-audit --no-fund', { cwd: packages, stdio: 'inherit' });
  execSync('npm run build --workspaces --if-present', { cwd: packages, stdio: 'inherit' });
}
