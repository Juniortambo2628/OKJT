/**
 * What the installer asks, and the project it describes: names, colours,
 * the role preset, and features. Everything is checked here, so the
 * templates can trust it.
 */

export const PRESETS = {
  full: 'superadmin › account owner / staff › owner / editor / viewer',
  standard: 'superadmin › owner / editor / viewer',
  simple: 'admin › user',
};

export const FEATURES = {
  google: 'Sign in with Google',
  passkeys: 'Passkeys',
  backups: 'Backups (superadmin)',
  console: 'Console with audit log (superadmin)',
  billing: 'Billing: plans and Paystack (needs accounts: the full preset)',
};

/** Features each preset can have: no superadmin in `simple`, no accounts outside `full`. */
export function featuresFor(preset) {
  const all = Object.keys(FEATURES);
  if (preset === 'simple') return ['google', 'passkeys'];
  if (preset === 'standard') return all.filter((f) => f !== 'billing');
  return all;
}

const HEX = /^#[0-9a-f]{6}$/i;

export const slugify = (text) => String(text).toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const pascal = (text) => slugify(text).split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('');

/** Answers (from prompts or flags) → the project the templates are written from. */
export function describeProject(answers) {
  const name = String(answers.name ?? '').trim();
  if (!name) throw new Error('A project name is needed.');
  const slug = slugify(answers.slug || name);
  if (!slug) throw new Error(`"${name}" gives no usable folder name; pass --slug.`);

  const preset = answers.preset || 'standard';
  if (!PRESETS[preset]) throw new Error(`Unknown role preset "${preset}" (${Object.keys(PRESETS).join(', ')}).`);

  const allowed = featuresFor(preset);
  const asked = (answers.features ?? []).filter(Boolean);
  const unknown = asked.filter((f) => !FEATURES[f]);
  if (unknown.length) throw new Error(`Unknown feature ${unknown.join(', ')} (${Object.keys(FEATURES).join(', ')}).`);
  const refused = asked.filter((f) => !allowed.includes(f));
  if (refused.length) throw new Error(`The ${preset} preset can't have ${refused.join(', ')}.`);
  const features = Object.fromEntries(Object.keys(FEATURES).map((f) => [f, asked.includes(f)]));

  const accent = answers.accent || '#2563EB';
  const ink = answers.ink || '#1F2937';
  for (const [label, value] of [['accent', accent], ['ink', ink]]) {
    if (!HEX.test(value)) throw new Error(`The ${label} colour must look like #1A2B3C (got "${value}").`);
  }

  const label = slugify(answers.workspace || 'project').replace(/-/g, ' ');
  const plural = answers.workspacePlural || (label.endsWith('s') ? label : `${label}s`);
  const Model = pascal(label);
  const key = slugify(label).replace(/-/g, '_');

  return {
    name,
    slug,
    domain: answers.domain || `${slug}.example.com`,
    tagline: answers.tagline || `${name} keeps your work in one place.`,
    preset,
    platform: preset !== 'simple',
    accounts: preset === 'full',
    features,
    colors: { accent: accent.toUpperCase(), ink: ink.toUpperCase(), tone: answers.tone || 'stone' },
    workspace: {
      label,
      plural,
      Model,
      table: `${key}s`,
      foreignKey: `${key}_id`,
      members: `${key}_user`,
      path: slugify(plural),
    },
    roles: preset === 'simple'
      ? [
        { value: 'owner', label: 'Admin', description: 'Can change everything, and invite people.' },
        { value: 'viewer', label: 'User', description: 'Can see everything, and change nothing.' },
      ]
      : [
        { value: 'owner', label: 'Owner', description: 'Can change everything, invite people and delete it.' },
        { value: 'editor', label: 'Editor', description: 'Can add and change things.' },
        { value: 'viewer', label: 'Viewer', description: 'Can see everything, and change nothing.' },
      ],
  };
}
