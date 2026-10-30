#!/usr/bin/env node
/**
 * npm create okjt-app@latest [folder] -- [--name … --preset … --features a,b --yes]
 *
 * Asks for what it isn't given; --yes takes the defaults for the rest.
 */
import { resolve } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { parseArgs } from 'node:util';
import { FEATURES, PRESETS, describeProject, featuresFor, slugify } from '../src/answers.mjs';
import { createProject } from '../src/create.mjs';

const { values: flags, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    name: { type: 'string' },
    slug: { type: 'string' },
    domain: { type: 'string' },
    tagline: { type: 'string' },
    accent: { type: 'string' },
    ink: { type: 'string' },
    workspace: { type: 'string' },
    preset: { type: 'string' },
    features: { type: 'string' },
    yes: { type: 'boolean', short: 'y', default: false },
    'no-install': { type: 'boolean', default: false },
    'no-checks': { type: 'boolean', default: false },
    'no-git': { type: 'boolean', default: false },
    help: { type: 'boolean', short: 'h', default: false },
  },
});

if (flags.help) {
  console.log(`create-okjt-app [folder]

  --name "Bloom"          the product's name
  --domain bloom.co.ke    where it will live
  --tagline "…"           one line about it
  --accent #2563EB        the brand colour
  --ink #1F2937           the darkest text colour
  --workspace project     what people work on together (a project, a site, a case)
  --preset standard       roles: ${Object.entries(PRESETS).map(([k, v]) => `${k} (${v})`).join('; ')}
  --features a,b          ${Object.keys(FEATURES).join(', ')}
  --yes                   defaults for anything not given
  --no-install            write the files only
  --no-checks             skip running the tests and the build
  --no-git                no git repository`);
  process.exit(0);
}

const rl = flags.yes ? null : createInterface({ input: process.stdin, output: process.stdout });
const ask = async (question, fallback) => {
  if (!rl) return fallback;
  const answer = (await rl.question(`${question}${fallback ? ` (${fallback})` : ''}: `)).trim();
  return answer || fallback;
};

try {
  const name = flags.name || await ask('Project name', positionals[0] || 'My app');
  const slug = flags.slug || slugify(positionals[0] || name);
  const domain = flags.domain || await ask('Domain', `${slug}.okjtech.co.ke`);
  const tagline = flags.tagline || await ask('One line about it', `${name} keeps your work in one place.`);
  const accent = flags.accent || await ask('Brand colour', '#2563EB');
  const ink = flags.ink || await ask('Text colour', '#1F2937');
  const workspace = flags.workspace || await ask('What do people work on together? (project, site, case…)', 'project');
  if (rl && !flags.preset) console.log(Object.entries(PRESETS).map(([k, v]) => `  ${k}: ${v}`).join('\n'));
  const preset = flags.preset || await ask('Roles', 'standard');
  let features = flags.features?.split(',').map((f) => f.trim()).filter(Boolean);
  if (!features) {
    const offered = featuresFor(preset);
    if (rl) console.log(offered.map((f) => `  ${f}: ${FEATURES[f]}`).join('\n'));
    const answer = await ask('Features (comma-separated, or none)', offered.filter((f) => f !== 'billing').join(','));
    features = answer === 'none' ? [] : answer.split(',').map((f) => f.trim()).filter(Boolean);
  }
  rl?.close();

  const project = describeProject({ name, slug, domain, tagline, accent, ink, workspace, preset, features });
  await createProject(project, {
    dir: resolve(positionals[0] || project.slug),
    install: !flags['no-install'],
    checks: !flags['no-checks'],
    git: !flags['no-git'],
  });
} catch (error) {
  rl?.close();
  console.error(`\ncreate-okjt-app: ${error.message}`);
  process.exit(1);
}
