import { test } from 'node:test';
import assert from 'node:assert/strict';
import { describeProject, featuresFor } from '../src/answers.mjs';
import { mix, palette } from '../src/palette.mjs';
import { envValues, setEnv } from '../src/create.mjs';
import { backendFiles } from '../src/templates/backend.mjs';
import { frontendFiles } from '../src/templates/frontend.mjs';
import { rootFiles } from '../src/templates/root.mjs';

const project = (answers = {}) => describeProject({ name: 'Bloom Studio', ...answers });

test('answers become a project, with names derived from them', () => {
  const p = project({ workspace: 'site visit', preset: 'full', features: ['billing'] });
  assert.equal(p.slug, 'bloom-studio');
  assert.equal(p.domain, 'bloom-studio.example.com');
  assert.deepEqual(p.workspace, { label: 'site visit', plural: 'site visits', Model: 'SiteVisit', table: 'site_visits', foreignKey: 'site_visit_id', members: 'site_visit_user', path: 'site-visits' });
  assert.equal(p.accounts, true);
  assert.equal(p.features.billing, true);
  assert.equal(p.features.google, false);
});

test('presets limit the features they can have, and answers are checked', () => {
  assert.deepEqual(featuresFor('simple'), ['google', 'passkeys']);
  assert.ok(!featuresFor('standard').includes('billing'));
  assert.throws(() => project({ preset: 'simple', features: ['console'] }), /simple preset can't have console/);
  assert.throws(() => project({ preset: 'standard', features: ['billing'] }), /can't have billing/);
  assert.throws(() => project({ preset: 'boss' }), /Unknown role preset/);
  assert.throws(() => project({ features: ['teleport'] }), /Unknown feature teleport/);
  assert.throws(() => project({ accent: 'blue' }), /accent colour/);
  assert.throws(() => describeProject({ name: ' ' }), /name is needed/);
});

test('the simple preset is two roles, relabelled', () => {
  const p = project({ preset: 'simple' });
  assert.deepEqual(p.roles.map((r) => [r.value, r.label]), [['owner', 'Admin'], ['viewer', 'User']]);
  assert.equal(p.platform, false);
  const config = backendFiles(p)['config/okjt.php'];
  assert.match(config, /\$config\['roles'\]\['all'\] = \['owner', 'viewer'\];/);
  assert.match(config, /'default_role' => 'viewer'/);
});

test('the palette is the two colours and mixes of them', () => {
  assert.equal(mix('#000000', '#FFFFFF', 0.5), '#808080');
  const colors = palette({ accent: '#0F766E', ink: '#1C2B2A' });
  assert.equal(colors.accent, '#0F766E');
  assert.equal(colors.ink, '#1C2B2A');
  assert.equal(Object.keys(colors).length, 18); // the 17 tokens and the tone ramp
  for (const [name, value] of Object.entries(colors)) if (name !== 'tone') assert.match(value, /^#[0-9A-F]{6}$/, name);
});

test('features switch their routes, settings and packages on and off', () => {
  const bare = backendFiles(project());
  const all = backendFiles(project({ preset: 'full', features: ['google', 'passkeys', 'backups', 'console', 'billing'] }));

  for (const route of ['/team', '/billing', "prefix('console')", "prefix('backups')", 'auth/google']) {
    assert.ok(!bare['routes/api.php'].includes(route), `no ${route} without the feature`);
    assert.ok(all['routes/api.php'].includes(route), `${route} with the feature`);
  }
  assert.ok(!bare['routes/web.php'].includes('passkeys'));
  assert.match(all['routes/web.php'], /PasskeyController::class, 'loginOptions'/);
  assert.match(all['app/Models/User.php'], /implements MustVerifyEmail, PasskeyUser/);
  assert.match(all['app/Models/User.php'], /use HasAccounts, HasApiTokens, HasFactory, HasWorkspaceRoles, Notifiable, PasskeyAuthenticatable;/);
  assert.ok(all['app/Models/Account.php'].includes("'plan', 'plan_expires_at'"));
  assert.equal(bare['app/Models/Account.php'], undefined);
  assert.match(all['app/Http/Controllers/Api/ProjectController.php'], /Limits::ensure\('workspaces', 1, \$account\)/);
  assert.match(all['config/okjt.php'], /'api\/paystack\/webhook'/);

  assert.ok(!frontendFiles(project())['src/App.jsx'].includes('/auth/google'));
  assert.match(frontendFiles(project({ features: ['google'] }))['src/pages/SignIn.jsx'], /google=\{<GoogleButton \/>\}/);
});

test('generated PHP keeps its blank lines and has balanced braces', () => {
  for (const [path, body] of Object.entries(backendFiles(project({ preset: 'full', features: ['billing', 'console'] })))) {
    assert.ok(body.startsWith('<?php\n'), path);
    const open = (body.match(/\{/g) || []).length;
    const close = (body.match(/\}/g) || []).length;
    assert.equal(open, close, `${path}: { and } balance`);
    if (path.endsWith('Controller.php')) assert.match(body, /\n\n/, `${path} has blank lines`);
  }
});

test('the seeder reads the first user through config, so it works after config:cache', () => {
  const files = backendFiles(project());
  assert.match(files['config/admin.php'], /'email' => env\('OKJT_ADMIN_EMAIL'\)/);
  assert.match(files['database/seeders/DatabaseSeeder.php'], /config\('admin\.email'\)/);
  assert.ok(!files['database/seeders/DatabaseSeeder.php'].includes("env('"));
});

test('the workflow deploys the API with the app built into it', () => {
  const flow = rootFiles(project({ domain: 'bloom.okjtech.co.ke' }))['.github/workflows/deploy.yml'];
  assert.match(flow, /uses: Juniortambo2628\/OKJT\/\.github\/workflows\/deploy-laravel\.yml@main/);
  assert.match(flow, /domain: bloom\.okjtech\.co\.ke\n\s+app_name: bloom-studio\n\s+app_dir: backend\n\s+spa_dir: frontend/);
  assert.match(flow, /needs: \[backend, frontend\]/);
});

test('.env values replace existing keys and add the rest', () => {
  const out = setEnv('APP_NAME=Laravel\nAPP_URL=http://localhost\n# GOOGLE_CLIENT_ID=x\n', { APP_NAME: '"Bloom Studio"', GOOGLE_CLIENT_ID: '', NEW_KEY: '1' });
  assert.equal(out, 'APP_NAME="Bloom Studio"\nAPP_URL=http://localhost\nGOOGLE_CLIENT_ID=\n\nNEW_KEY=1\n');
  const example = envValues(project({ features: ['google'] }), { example: true });
  assert.equal(example.OKJT_ADMIN_PASSWORD, '');
  assert.equal(example.GOOGLE_REDIRECT_URI, '"${APP_URL}/api/auth/google/callback"');
  assert.ok(envValues(project()).OKJT_ADMIN_PASSWORD.length >= 12);
});
