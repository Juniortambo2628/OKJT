# @okjt/site

The public pages of an OKJTech project: layout, navigation, footer, SEO, and
the sections pages are built from (photo hero, feature explorer, showcase,
pricing, FAQ, legal documents). Colours and fonts come from `@okjt/ui`'s
theme; words, links, pictures and screens come from the project's `site`
settings.

## Install

```bash
npm i @okjt/site
npm i -D @okjt/ui
```

Peer dependencies: `react`, `react-router-dom`, `framer-motion`, `lucide-react`.

Let Tailwind see the kit's class names, after the theme (see `@okjt/ui`):

```css
@import "tailwindcss";
@import "./okjt-theme.css";
@source "../node_modules/@okjt/site/dist";
```

## Set it up

```jsx
import { SiteProvider } from '@okjt/site';
import { site } from './site.config';

<SiteProvider site={site}>
  <App />
</SiteProvider>
```

```jsx
// src/site.config.jsx
import { ShieldCheck, FileText } from 'lucide-react';
import { useAuth } from './context/AuthContext';

export const site = {
  brand: { name: 'Najenga', logo: { light: '/brand/logo-light.png', dark: '/brand/logo-dark.png' } },

  // `mega: { Menu, MobileList, id, buttonLabel }` on one item opens a large menu under the bar.
  nav: [
    { to: '/', label: 'Home' },
    { to: '/features', label: 'Features' },
    { to: '/#pricing', label: 'Pricing' },
  ],

  useAccount: () => ({ signedIn: useAuth().isAuthenticated }),
  accountLinks: {
    signIn: { to: '/sign-in', label: 'Sign in' },
    signUp: { to: '/sign-up', label: 'Get started' },
    home: { to: '/projects', label: 'Your projects' },
  },

  // Photos are keys; these two hooks turn a key into a URL and alt text, and a
  // named place on the pages ("footer", "group-money") into its photo(s).
  usePhotos: () => ({ url: (key, width) => `/photos/${key}${width <= 900 ? '-sm' : ''}.webp`, alt: (key) => ALT[key] }),
  usePlaces: () => (place) => PLACES[place],

  // Product screens and clips: { src, alt, url, video?, phone? }.
  media: { dashboard: { src: '/screens/dashboard.webp', alt: 'The dashboard', url: 'najenga.co.ke/dashboard' } },

  footer: {
    about: 'Najenga keeps every shilling and every site photo of your build in one place.',
    columns: [{ title: 'Product', links: [{ to: '/features', label: 'Features' }, { to: '/sign-in', label: 'Sign in', signedIn: false }] }],
    promises: [{ icon: ShieldCheck, text: 'Your records stay yours' }],
    cta: {
      place: 'footer', eyebrow: 'Start today', title: 'Build with your eyes open.', text: 'Set up a project in a minute.',
      primary: { to: '/sign-up', label: 'Start a project' }, secondary: { to: '/features', label: 'Explore features' },
    },
    watermark: 'najenga.',
    copyright: 'Najenga',
    madeBy: { label: 'Built to last by', name: 'OKJ Technologies', href: 'https://okjtech.co.ke', logo: '/okjt-logo.png' },
  },

  legal: {
    documents: [{ to: '/terms', label: 'Terms of service', icon: FileText }],
    contact: 'Contact OKJ Technologies through okjtech.co.ke.',
    lastUpdated: '2026-10-29',
    seeAlso: [{ to: '/terms', label: 'Terms of service' }],
  },

  seo: {
    origin: 'https://najenga.co.ke',
    siteName: 'Najenga',
    locale: 'en_KE',
    defaultTitle: 'Najenga — building, accounted for',
    defaultDescription: 'Track the costs, receipts and progress of your construction projects.',
    pages: { '/features': { title: 'Features | Najenga', description: '…' } },
    resolve: (path) => undefined, // titles for pages made from data, e.g. /projects/:slug
  },
};
```

Any path not in `seo.pages` (and not resolved) gets the defaults and `noindex`.

## Building blocks

| Export | What it is |
|---|---|
| `SiteLayout` | Nav, page, footer; `overlay` puts the nav over a full-bleed hero, `cta={false}` drops the footer's call to action |
| `SiteNav`, `SiteFooter`, `Seo` | The parts `SiteLayout` uses |
| `Container`, `Logo`, `PillLink`, `Eyebrow`, `Chip`, `SectionHeading` | Page width, the brand mark, call-to-action links, labels, headings |
| `PhotoHero`, `HeroOrnament` | A full-bleed photo hero with a large light headline |
| `ImageCard` | A large rounded card with a photo behind its words; a link when given `to` |
| `Photo` | A photo filling its parent; a list of keys cross-fades |
| `MediaFrame`, `MediaFill` | A product screen or clip in a browser or phone frame, or bare |
| `FeatureExplorer` | Feature groups as tabs beside a large photo card with a summary, numbers and a screen |
| `FeatureGroup` | One feature group in depth: heading, numbers, photo card and screen, every tool |
| `JourneyGlance`, `JourneyChapter` | A journey's numbers at a glance, and one chapter of it |
| `ShowcaseCarousel` | A stack of screens with arrows and a list |
| `SectionNav`, `SECTION_OFFSET`, `useScrollSpy` | The sticky bar of the page's sections, with "you are here" |
| `FaqSection` | Questions and answers |
| `PricingSection` | Plan cards, already worded by the project |
| `LegalPage` | A legal document with its contents beside it |
| `RollingWord`, `useRolling` | Words that roll through a list in a headline |

Headings inside the kit's components carry `!` on their font and colour, so a
host app's own global `h1`–`h3` styles don't change them.
