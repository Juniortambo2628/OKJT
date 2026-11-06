/**
 * OKJTech's theme for the OKJT kit (@okjt/ui): the deep brown and warm gold
 * of the OKJTech site, as the tokens every kit page and the dashboard use.
 * The public pages and the dashboard are both dark, so the light and dark
 * tokens are swapped compared with a light project: `ink` (headlines) is the
 * lightest cream, `paper`/`tint` (the page) the deep brown, and the grey ramp
 * runs from dark (50) to light (950).
 *
 * src/okjt-theme.css is generated from this before every `npm run dev` and
 * `npm run build` (or now: npm run theme).
 */
export default {
  theme: {
    colors: {
      ink: '#faf5e8',
      inkDeep: '#0b0906',
      body: '#dcc89a',
      soft: '#bba67e',
      muted: '#978561',
      faint: '#7a6a4c',
      accent: '#ebc882',
      accentStrong: '#f3d9a0',
      accentDark: '#c9a45c',
      accentSoft: '#9c8558',
      line: '#3a3221',
      lineStrong: '#5b4e33',
      tint: '#14110b',
      paper: '#14110b',
      paperWarm: '#1a1610',
      positive: '#9cbf74',
      positiveDark: '#b9d896',
      surface: '#211c12',
      contrast: '#ffffff',
      action: '#ebc882',
      // Filled controls (buttons, the chosen tab) sit close to the page, in
      // dark brown with gold text; headlines stay cream (ink).
      fill: '#2a2418',
      fillHover: '#3a3221',
      onInk: '#f3d9a0',
      panel: '#0d0b07',
      tone: {
        50: '#1e1a11',
        100: '#2a2418',
        200: '#3a3221',
        300: '#5b4e33',
        400: '#8f7f60',
        500: '#a8977a',
        600: '#bfae8f',
        700: '#d4c4a3',
        800: '#e6d9bc',
        900: '#f3ead5',
        950: '#faf5e8',
      },
    },
    fonts: {
      sans: "'Geist', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
      display: "'Geist', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    },
  },
};
