import { RAMPS } from './ramps.js';

/**
 * The colours every kit component may use, by the name a project gives them in
 * `theme.colors` (camelCase) and the class name they become (kebab-case):
 * `accentStrong` → `--color-accent-strong` → `text-accent-strong`.
 */
export const COLOR_TOKENS = {
  ink: 'Headlines and the darkest text; dark buttons',
  inkDeep: 'Darker than ink: dark panels and footers',
  body: 'Body text on light surfaces',
  soft: 'Secondary text',
  muted: 'Hints, captions, placeholders',
  faint: 'The lightest text that still reads',
  accent: 'The brand colour: links, eyebrows, active states',
  accentStrong: 'Accent on hover, or where it must stand out',
  accentDark: 'Accent on dark-on-light buttons and pressed states',
  accentSoft: 'Accent for decoration: rules, icons, borders',
  line: 'Borders and dividers',
  lineStrong: 'Borders that must show: outlines, inputs',
  tint: 'The palest coloured surface: hovers, chips, panels',
  paper: 'The page itself, off-white',
  paperWarm: 'A second off-white, for surfaces on the page',
  positive: 'Confirmations and ticks',
  positiveDark: 'Positive text on pale surfaces',
};

/**
 * Colours a project may set; left out, they take the value the kit used
 * before they existed, so nothing changes for a project that doesn't set them.
 */
export const OPTIONAL_COLOR_TOKENS = {
  surface: ['Cards, panels, menus and dialogs on the page', '#ffffff'],
  contrast: ['What hovers and pressed states shade toward: black on light, white on dark', '#000000'],
  action: ['Solid action buttons (e.g. an empty list\'s next step)', 'var(--color-accent)'],
};

/** Steps of the grey ramp (`theme.colors.tone`), as Tailwind numbers them. */
export const TONE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

export const FONT_TOKENS = {
  sans: 'Everything that sets no other font',
  display: 'Large headlines on the public pages',
};

const kebab = (name) => name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

/**
 * Checks a project's config and fills in what the kit derives, so a mistake
 * shows up when the theme is built, not as a colour that silently renders as
 * nothing.
 */
export function defineConfig(config) {
  const theme = config?.theme;
  if (!theme?.colors) throw new Error('okjt config: theme.colors is required');

  const missing = Object.keys(COLOR_TOKENS).filter((name) => !theme.colors[name]);
  if (missing.length) throw new Error(`okjt config: theme.colors is missing ${missing.join(', ')}`);

  checkUnknown(theme.colors, 'theme.colors');
  const defaults = Object.fromEntries(Object.entries(OPTIONAL_COLOR_TOKENS).map(([name, [, value]]) => [name, value]));
  const colors = { ...defaults, ...theme.colors, tone: resolveTone(theme.colors.tone) };

  // theme.dashboard: the same colours again, for the dashboard only (a dark
  // dashboard beside light public pages). Any token may be left out.
  let dashboard;
  if (theme.dashboard) {
    if (!theme.dashboard.colors) throw new Error('okjt config: theme.dashboard needs colors');
    checkUnknown(theme.dashboard.colors, 'theme.dashboard.colors');
    dashboard = { ...theme.dashboard, colors: { ...theme.dashboard.colors, ...(theme.dashboard.colors.tone ? { tone: resolveTone(theme.dashboard.colors.tone) } : {}) } };
  }

  return { ...config, theme: { ...theme, colors, ...(dashboard ? { dashboard } : {}) } };
}

function checkUnknown(colors, where) {
  const known = [...Object.keys(COLOR_TOKENS), ...Object.keys(OPTIONAL_COLOR_TOKENS), 'tone'];
  const unknown = Object.keys(colors).filter((name) => !known.includes(name));
  if (unknown.length) throw new Error(`okjt config: ${where} has unknown ${unknown.join(', ')} (known: ${known.join(', ')})`);
}

/** The colour declarations for a set of colours, one per line. */
function colorLines(colors) {
  const lines = [];
  for (const name of [...Object.keys(COLOR_TOKENS), ...Object.keys(OPTIONAL_COLOR_TOKENS)]) {
    if (colors[name]) lines.push(`  --color-${kebab(name)}: ${colors[name]};`);
  }
  if (colors.tone) for (const step of TONE_STEPS) lines.push(`  --color-tone-${step}: ${colors.tone[step]};`);
  return lines;
}

/** `tone` is a ramp's name ('stone', 'slate', …) or the eleven steps written out. */
function resolveTone(tone = 'stone') {
  if (typeof tone === 'string') {
    if (!RAMPS[tone]) throw new Error(`okjt config: theme.colors.tone '${tone}' is not one of ${Object.keys(RAMPS).join(', ')}`);
    return RAMPS[tone];
  }
  const missing = TONE_STEPS.filter((step) => !tone[step]);
  if (missing.length) throw new Error(`okjt config: theme.colors.tone is missing steps ${missing.join(', ')}`);
  return tone;
}

/**
 * The theme as a Tailwind 4 `@theme` block. The app imports the file it is
 * written to straight after `tailwindcss`; every token becomes a CSS variable
 * and the matching utilities (`bg-accent`, `text-tone-500`, `font-display`).
 */
export function compileTheme(config) {
  const { theme } = defineConfig(config);
  const lines = ['/* Generated by @okjt/ui from okjt.config.js. Do not edit: change the config and run okjt-theme. */', '@theme {'];

  lines.push(...colorLines(theme.colors));
  for (const [name, value] of Object.entries(theme.fonts ?? {})) {
    if (!(name in FONT_TOKENS)) throw new Error(`okjt config: theme.fonts has unknown ${name} (known: ${Object.keys(FONT_TOKENS).join(', ')})`);
    lines.push(`  --font-${kebab(name)}: ${value};`);
  }

  lines.push('}', '');

  // The dashboard's own colours: DashboardShell puts `admin-theme` on <html>
  // while it is open, so its portalled menus and dialogs take them too.
  if (theme.dashboard) {
    lines.push(':root.admin-theme {', ...colorLines(theme.dashboard.colors));
    if (theme.dashboard.colorScheme) lines.push(`  color-scheme: ${theme.dashboard.colorScheme};`);
    lines.push('}', '');
  }
  return lines.join('\n');
}
