/**
 * Writes the project and installs it: the React app from templates, the
 * Laravel API from `laravel/laravel` with the kit on top, then checks both
 * (the API's tests, the app's build).
 */
import { spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { backendFiles } from './templates/backend.mjs';
import { frontendFiles } from './templates/frontend.mjs';
import { rootFiles } from './templates/root.mjs';

export function writeFiles(dir, files) {
  for (const [path, body] of Object.entries(files)) {
    const target = join(dir, path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, body);
  }
}

function run(command, args, cwd, log) {
  log(`  $ ${command} ${args.join(' ')}`);
  const result = spawnSync(command, args, { cwd, stdio: 'inherit', shell: process.platform === 'win32' });
  if (result.error) throw new Error(`${command} isn't available (${result.error.code}). Install it and try again.`);
  if (result.status !== 0) throw new Error(`"${command} ${args.join(' ')}" failed in ${cwd}.`);
}

/** Sets keys in an .env file: replaces the ones it has, adds the rest at the end. */
export function setEnv(text, values) {
  let out = text.endsWith('\n') ? text : `${text}\n`;
  const added = [];
  for (const [key, value] of Object.entries(values)) {
    const line = `${key}=${value}`;
    const pattern = new RegExp(`^#?\\s*${key}=.*$`, 'm');
    if (pattern.test(out)) out = out.replace(pattern, () => line);
    else added.push(line);
  }
  return added.length ? `${out}\n${added.join('\n')}\n` : out;
}

/** The .env settings the kit and its features read. */
export function envValues(p, { example = false } = {}) {
  const quote = (v) => (/\s/.test(v) ? `"${v}"` : v);
  return {
    APP_NAME: quote(p.name),
    APP_URL: 'http://localhost:8000',
    FRONTEND_URL: 'http://localhost:5173',
    OKJT_ADMIN_NAME: quote(`${p.name} admin`),
    OKJT_ADMIN_EMAIL: `admin@${p.domain}`,
    OKJT_ADMIN_PASSWORD: example ? '' : randomBytes(9).toString('base64url'),
    ...(p.features.backups ? { AUTO_BACKUPS: 'true' } : {}),
    ...(p.features.billing ? { BILLING_ENABLED: 'false', BILLING_CURRENCY: 'KES', PAYSTACK_SECRET_KEY: '', PAYSTACK_PUBLIC_KEY: '' } : {}),
    ...(p.features.google ? { GOOGLE_CLIENT_ID: '', GOOGLE_CLIENT_SECRET: '', GOOGLE_REDIRECT_URI: '"${APP_URL}/api/auth/google/callback"' } : {}),
  };
}

/** Laravel's own files the kit needs a line in (kept, not replaced). */
export function patchLaravel(backend, p) {
  const appConfig = join(backend, 'config/app.php');
  const app = readFileSync(appConfig, 'utf8');
  if (!app.includes("'frontend_url'")) {
    writeFileSync(appConfig, app.replace(/(\n\s*'url' => env\('APP_URL'[^\n]*\n)/, (m) => `${m}\n    // Where the React app is (links in emails, Google sign-in's return).\n    'frontend_url' => env('FRONTEND_URL', env('APP_URL')),\n`));
  }
  if (p.features.google) {
    const servicesPath = join(backend, 'config/services.php');
    const services = readFileSync(servicesPath, 'utf8');
    if (!services.includes("'google'")) {
      writeFileSync(servicesPath, services.replace(/\n\];\s*$/, "\n\n    'google' => [\n        'client_id' => env('GOOGLE_CLIENT_ID'),\n        'client_secret' => env('GOOGLE_CLIENT_SECRET'),\n        'redirect' => env('GOOGLE_REDIRECT_URI'),\n    ],\n\n];\n"));
    }
  }
  for (const [file, example] of [['.env', false], ['.env.example', true]]) {
    const path = join(backend, file);
    if (existsSync(path)) writeFileSync(path, setEnv(readFileSync(path, 'utf8'), envValues(p, { example })));
  }
}

export async function createProject(p, { dir, install = true, checks = true, git = true, log = console.log }) {
  if (existsSync(dir) && readdirSync(dir).length) throw new Error(`${dir} already exists and isn't empty.`);
  mkdirSync(dir, { recursive: true });
  const backend = join(dir, 'backend');
  const frontend = join(dir, 'frontend');

  log(`\nWriting ${p.name} in ${dir}`);
  writeFiles(dir, rootFiles(p));
  writeFiles(frontend, frontendFiles(p));

  if (!install) {
    writeFiles(backend, backendFiles(p));
    log("Files written (--no-install: backend/ holds only the kit's files, without Laravel).");
    return;
  }

  log('\nThe API: Laravel 12 with the OKJT kit');
  run('composer', ['create-project', 'laravel/laravel:^12.0', 'backend', '--no-interaction', '--prefer-dist', '--quiet'], dir, log);
  run('php', ['artisan', 'install:api', '--without-migration-prompt', '--no-interaction'], backend, log);
  const packages = ['okjt/laravel-kit:^0.2', 'bacon/bacon-qr-code:^3.0'];
  if (p.features.google) packages.push('laravel/socialite:^5.0');
  if (p.features.passkeys) packages.push('laravel/passkeys:^0.2');
  run('composer', ['require', ...packages, '--no-interaction', '--quiet'], backend, log);
  writeFiles(backend, backendFiles(p));
  patchLaravel(backend, p);
  run('php', ['artisan', 'vendor:publish', '--tag=okjt-migrations', '--no-interaction'], backend, log);
  if (p.features.passkeys) run('php', ['artisan', 'vendor:publish', '--tag=passkeys-migrations', '--no-interaction'], backend, log);
  run('php', ['artisan', 'migrate', '--force', '--no-interaction'], backend, log);
  run('php', ['artisan', 'db:seed', '--force', '--no-interaction'], backend, log);

  log('\nThe app: React on @okjt/site and @okjt/dashboard');
  run('npm', ['install', '--no-audit', '--no-fund'], frontend, log);

  if (checks) {
    log('\nChecking it works');
    run('php', ['artisan', 'test'], backend, log);
    run('npm', ['run', 'build'], frontend, log);
  }

  if (git && !existsSync(join(dir, '.git')) && spawnSync('git', ['init', '-q', '-b', 'main'], { cwd: dir }).status === 0) {
    spawnSync('git', ['add', '-A'], { cwd: dir });
    spawnSync('git', ['commit', '-q', '-m', `${p.name}: created with create-okjt-app`], { cwd: dir });
  }

  const env = readFileSync(join(backend, '.env'), 'utf8');
  log(`
${p.name} is ready.

  cd ${dir}/backend && php artisan serve
  cd ${dir}/frontend && npm run dev     → http://localhost:5173

Sign in as ${env.match(/^OKJT_ADMIN_EMAIL=(.*)$/m)?.[1]} with the password ${env.match(/^OKJT_ADMIN_PASSWORD=(.*)$/m)?.[1]} (in backend/.env).
Deploying: README.md › Deploy.
`);
}
