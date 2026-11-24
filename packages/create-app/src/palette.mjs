/**
 * The theme's seventeen colours (@okjt/ui's tokens) from the two a project
 * chooses: its accent and its ink (the darkest text). Lighter and darker
 * shades are mixes towards white and black, so the palette stays in one
 * family; edit okjt.config.js to fine-tune any of them.
 */

const toRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const toHex = (rgb) => `#${rgb.map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('')}`.toUpperCase();

/** `amount` of the way from `hex` to `towards` (0 = hex, 1 = towards). */
export function mix(hex, towards, amount) {
  const a = toRgb(hex);
  const b = toRgb(towards);
  return toHex(a.map((v, i) => v + (b[i] - v) * amount));
}

const WHITE = '#FFFFFF';
const BLACK = '#000000';

export function palette({ accent, ink, tone = 'stone' }) {
  return {
    ink,
    inkDeep: mix(ink, BLACK, 0.3),
    body: mix(ink, WHITE, 0.15),
    soft: mix(ink, WHITE, 0.3),
    muted: mix(ink, WHITE, 0.45),
    faint: mix(ink, WHITE, 0.58),
    accent,
    accentStrong: mix(accent, BLACK, 0.1),
    accentDark: mix(accent, BLACK, 0.25),
    accentSoft: mix(accent, WHITE, 0.4),
    line: mix(accent, WHITE, 0.85),
    lineStrong: mix(accent, WHITE, 0.75),
    tint: mix(accent, WHITE, 0.93),
    paper: mix(accent, WHITE, 0.975),
    paperWarm: mix(accent, WHITE, 0.96),
    positive: '#5B8A5B',
    positiveDark: '#3F6B3F',
    tone,
  };
}
