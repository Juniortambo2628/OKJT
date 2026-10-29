# @okjt/ui

Theme tokens for OKJTech sites and dashboards. A project sets its colours and
fonts once, in `okjt.config.js`; the kit's pages and components use them by
name (`text-ink`, `bg-accent`, `border-tone-200`, `font-display`).

## Use it

```bash
npm i -D @okjt/ui
```

`okjt.config.js`, at the app's root:

```js
export default {
  theme: {
    colors: {
      ink: '#2B221C', inkDeep: '#1F1813', body: '#4A3F35', soft: '#6B5D52', muted: '#8B7B6B', faint: '#A68B76',
      accent: '#A67B5B', accentStrong: '#A06A47', accentDark: '#8B5E3C', accentSoft: '#C8A68E',
      line: '#E8DDD3', lineStrong: '#D9CBBE', tint: '#F3EDE7', paper: '#FBF8F5', paperWarm: '#FAF7F2',
      positive: '#7C8B6A', positiveDark: '#56634A',
      tone: 'stone', // or 'slate', 'gray', 'zinc', 'neutral', or { 50: …, 100: …, …, 950: … }
    },
    fonts: { sans: "'Lato', sans-serif", display: "'Manrope Variable', 'Lato', sans-serif" },
  },
};
```

Generate the theme, and import it straight after Tailwind:

```bash
npx okjt-theme            # writes src/okjt-theme.css
npx okjt-theme --check    # in CI: fails if the file is out of date
```

```css
@import "tailwindcss";
@import "./okjt-theme.css";
```

A missing or misspelt token fails `okjt-theme` with its name, instead of
rendering as no colour at all.

## The tokens

| Token | For |
|---|---|
| `ink`, `inkDeep` | Headlines, the darkest text, dark buttons; darker panels and footers |
| `body`, `soft`, `muted`, `faint` | Body text, secondary text, hints and captions, the lightest readable text |
| `accent`, `accentStrong`, `accentDark`, `accentSoft` | The brand colour, its hover, its pressed state, its decorative use |
| `line`, `lineStrong` | Borders and dividers; borders that must show |
| `tint`, `paper`, `paperWarm` | The palest coloured surface; the page; a second off-white |
| `positive`, `positiveDark` | Confirmations; positive text on pale surfaces |
| `tone-50` … `tone-950` | The grey ramp, step for step like Tailwind's |

Status colours (errors, warnings, success badges) stay Tailwind's red, amber
and green.

## Proving a styling change changed nothing

`tools/style-snapshot.mjs` records the computed colours and fonts of every
visible element of a page in a Playwright test, and compares two recordings.
Colours compare as the pixels they paint, so `#A67B5B` and
`var(--color-accent)` are equal.

```js
import { captureStyles } from '@okjt/ui/tools/style-snapshot';
await writeFile(`${dir}/${name}.json`, JSON.stringify(await captureStyles(page)));
```

```bash
node node_modules/@okjt/ui/tools/style-snapshot.mjs compare before/ after/
```
