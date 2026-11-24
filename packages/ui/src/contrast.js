import { defineConfig } from './theme.js';

/**
 * Colour contrast for a project's theme (WCAG 2 AA), lifted from Naoa's
 * src/config/contrast.test.js: every text/background pair the kit's own
 * components draw, read from okjt.config.js, so a colour change that makes
 * text unreadable fails `okjt-theme --check-contrast` instead of shipping.
 *
 * A colour in a pair is a token name ('body', 'tone-500'), a token with an
 * opacity laid over the background ('accent/15', as `bg-accent/15` draws
 * it), or a hex colour ('#ffffff').
 */

/** 4.5:1 for text, 3:1 for large text and for what isn't text (focus rings, icons). */
export const TEXT = 4.5;
export const LARGE = 3;

/**
 * [what, text, background, minimum, where]: the pairs the kit's components
 * draw, and where they draw them ('site': the public pages, 'dashboard', or
 * both when left out). A project adds its own in `theme.contrastPairs` (and
 * `theme.dashboard.contrastPairs` for the dashboard only), in the same shape.
 */
export const KIT_PAIRS = [
  ['Body text on the page', 'body', 'paper', TEXT],
  ['Body text on cards and dialogs', 'body', 'surface', TEXT],
  ['Headlines on the page', 'ink', 'paper', TEXT],
  ['Secondary text on cards', 'soft', 'surface', TEXT],
  ['Links and eyebrows on cards', 'accent', 'surface', TEXT],
  ['Links and eyebrows on the page', 'accent', 'paper', TEXT],
  ['Accent button text (secondary button, active filter)', '#ffffff', 'accent', TEXT],
  ['Focus ring on cards', 'accent', 'surface', LARGE],
  ['Accent text on a tint (pricing, FAQ)', 'accent', 'tint', TEXT, 'site'],
  ['Filled controls (chosen tab or chip, dark button)', 'onInk', 'fill', TEXT, 'site'],
  ['Text on the dark footer panel', '#ffffff', 'panel', TEXT, 'site'],
  ['Action button text (empty list, summary cards)', '#ffffff', 'action', TEXT, 'dashboard'],
  ['Badge text (accent-dark on accent/15)', 'accentDark', 'accent/15', TEXT, 'dashboard'],
];

const camel = (name) => name.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());

/** oklch(L C h) → sRGB 0–255 (Björn Ottosson's OKLab matrices), clamped to the gamut. */
function oklchToRgb(L, C, h) {
  const a = C * Math.cos((h * Math.PI) / 180);
  const b = C * Math.sin((h * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const linear = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  return linear.map((c) => {
    const v = Math.min(1, Math.max(0, c));
    return 255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);
  });
}

const alphaOf = (raw) => (raw == null ? 1 : raw.endsWith('%') ? parseFloat(raw) / 100 : parseFloat(raw));

/** [r, g, b, alpha] from #rgb, #rrggbb(aa), rgb()/rgba() or oklch(); null otherwise. */
function parseColor(value) {
  const v = String(value).trim();
  const ok = /^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)(?:deg)?\s*(?:\/\s*([\d.]+%?))?\s*\)$/i.exec(v);
  if (ok) return [...oklchToRgb(ok[2] ? parseFloat(ok[1]) / 100 : parseFloat(ok[1]), parseFloat(ok[3]), parseFloat(ok[4])), alphaOf(ok[5])];
  if (v.startsWith('#')) {
    const h = v.slice(1);
    const full = h.length === 3 || h.length === 4 ? [...h].map((c) => c + c).join('') : h;
    if (!/^[0-9a-f]{6}([0-9a-f]{2})?$/i.test(full)) return null;
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
    return [r, g, b, full.length === 8 ? parseInt(full.slice(6), 16) / 255 : 1];
  }
  const m = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)\s*(?:[,/]\s*([\d.]+%?))?\s*\)$/i.exec(v);
  if (!m) return null;
  return [+m[1], +m[2], +m[3], alphaOf(m[4])];
}

const parseHex = (value) => parseColor(value)?.slice(0, 3) ?? null;

const toHex = (rgb) => `#${rgb.map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')}`;

/** Relative luminance of an [r, g, b] (0–255). */
function luminance(rgb) {
  const [r, g, b] = rgb.map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** The contrast ratio of two hex colours (1 to 21). */
export function contrastRatio(a, b) {
  const [l1, l2] = [luminance(parseHex(a)), luminance(parseHex(b))].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

/** A colour at an opacity laid over a background, as the eye sees it. */
export function over(color, alpha, background) {
  const fg = parseHex(color);
  const bg = parseHex(background);
  return toHex(fg.map((c, i) => c * alpha + bg[i] * (1 - alpha)));
}

/** A token's hex value; follows `var(--color-x)` defaults to the token they name. */
function tokenValue(colors, name, seen = []) {
  const key = camel(name);
  const tone = /^tone(\d+)$/.exec(key);
  const value = tone ? colors.tone?.[tone[1]] : colors[key];
  if (value == null) throw new Error(`okjt contrast: unknown colour '${name}'`);
  const ref = /^var\(--color-([a-z0-9-]+)\)$/.exec(String(value).trim());
  if (ref) {
    if (seen.includes(ref[1])) throw new Error(`okjt contrast: '${name}' refers to itself`);
    return tokenValue(colors, ref[1], [...seen, ref[1]]);
  }
  if (!parseColor(value)) throw new Error(`okjt contrast: '${name}' is ${value}; the check reads hex, rgb() and oklch() colours`);
  return String(value);
}

/**
 * A pair's colour as opaque hex: a hex or rgb() value, a token, or
 * `token/NN`. A translucent colour (rgb(… / 0.9), or `token/NN`) is laid over
 * `under`, as the eye sees it.
 */
function colorOf(colors, spec, under) {
  const [name, opacity] = /^(#|rgb|oklch)/.test(spec) ? [spec] : spec.split('/');
  const value = /^(#|rgb|oklch)/.test(name) ? name : tokenValue(colors, name);
  const [r, g, b, a] = parseColor(value);
  const alpha = a * (opacity == null ? 1 : Number(opacity) / 100);
  if (alpha >= 1) return toHex([r, g, b]);
  if (!under) throw new Error(`okjt contrast: '${spec}' is see-through and needs a background under it`);
  return over(toHex([r, g, b]), alpha, under);
}

function checkSet(colors, pairs, where) {
  // Cards sit on the page; a see-through background is seen over the card.
  const paper = colorOf(colors, 'paper');
  const surface = colorOf(colors, 'surface', paper);
  return pairs.filter(([, , , , scope]) => !scope || scope === where).map(([what, text, background, min]) => {
    const bg = colorOf(colors, background, background === 'surface' ? paper : surface);
    const fg = colorOf(colors, text, bg);
    const ratio = contrastRatio(fg, bg);
    return { where, what, text, background, fg, bg, min, ratio: Math.round(ratio * 100) / 100, ok: ratio >= min };
  });
}

/**
 * Every pair checked against the project's theme: the kit's pairs and the
 * project's own (`theme.contrastPairs`), on the public pages and, when the theme
 * has `theme.dashboard`, on the dashboard too (its colours over the site's).
 *
 * @returns {{ where: 'site'|'dashboard', what: string, fg: string, bg: string, ratio: number, min: number, ok: boolean }[]}
 */
export function checkContrast(config) {
  const { theme } = defineConfig(config);
  const results = checkSet(theme.colors, [...KIT_PAIRS, ...(theme.contrastPairs ?? [])], 'site');
  if (theme.dashboard) {
    const colors = { ...theme.colors, ...theme.dashboard.colors };
    results.push(...checkSet(colors, [...KIT_PAIRS, ...(theme.contrastPairs ?? []), ...(theme.dashboard.contrastPairs ?? [])], 'dashboard'));
  }
  return results;
}
