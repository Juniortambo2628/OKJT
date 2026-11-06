import { useMemo } from 'react';
import { Cookie, FileText, Handshake, LifeBuoy, MapPin, ShieldCheck } from 'lucide-react';
import { live, usePillars, useServices, useSettings } from './lib/content';
import { mediaUrl } from './lib/media';
import { getToken } from './lib/api';
import ServicesMega from './components/ServicesMega';

const LOGO = '/logos/OKJT-Logos/OKJTechLogo-White_Transparent.png';
const PLACEHOLDER = '/brand/placeholder.svg';
const FAVICON = '/logos/OKJT-Logos/OKJTechLogo-Black_BG-favicon.png';

/** Settings that hold each named place's picture or clip on the pages. */
const PLACES = {
  footer: 'bg_home_cta',
  'home-approach': 'bg_home_value_proposition',
  'home-stats': 'bg_home_stats',
  'home-services': 'bg_home_services',
  'about-mission': 'bg_about_mission',
  'about-values': 'bg_about_values',
  'about-team': 'bg_about_team',
  'contact-form': 'bg_contact_form',
  'impact-testimonials': 'bg_client_impact_testimonials',
};

/** A service category as an address-safe id: 'UI/UX Design' → 'ui-ux-design'. */
export const categorySlug = (text) => String(text || 'other').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export const DESCRIPTION = 'Web applications for health, legal, construction, events, commerce and nonprofit organisations, designed and built end to end in Nairobi, Kenya.';

const page = (title, description = DESCRIPTION) => ({ title: `${title} | OKJTech`, description });

/** Titles for pages made from data: the record's own title is set by the page once it loads. */
const DETAIL = [
  [/^\/services\/[^/]+$/, 'Service'],
  [/^\/insights\/[^/]+$/, 'Insight'],
  [/^\/projects\/(?!flagship$)[^/]+$/, 'Project'],
  [/^\/our-approach\/[^/]+$/, 'Approach'],
];

/**
 * OKJTech's public pages (@okjt/site): the words, links and pictures the
 * kit's layout shows. Built from the CMS settings, so what the dashboard
 * changes shows here. Colours and fonts are in okjt.config.js.
 */
export function useSiteConfig() {
  const { setting } = useSettings();
  const { data: services } = useServices();
  const { data: pillars } = usePillars();

  return useMemo(() => {
    // Photos of the home page's tabbed sections (FeatureExplorer's `group-<id>`):
    // each pillar's image, and each service category's first image (or the
    // category's background from Site settings).
    const groupPhotos = {};
    for (const p of live(pillars)) groupPhotos[`group-pillar-${p.slug}`] = p.image || null;
    for (const svc of live(services)) {
      const key = `group-cat-${categorySlug(svc.category)}`;
      groupPhotos[key] ||= svc.image || setting(`bg_services_${categorySlug(svc.category).replace(/-/g, '_')}`) || null;
    }
    const logo = mediaUrl(setting('logo_dark', LOGO));
    const serviceLinks = live(services).slice(0, 6).map((s) => ({ to: `/services/${s.slug}`, label: s.title }));
    return {
      brand: { name: 'OKJTech', logo: { light: logo, dark: logo } },

      nav: [
        { to: '/services', label: 'Services', mega: { Menu: ServicesMega, MobileList: ServicesMega.MobileList, id: 'services-menu', buttonLabel: 'show all services' } },
        { to: '/projects', label: 'Work' },
        { to: '/our-approach', label: 'Approach' },
        { to: '/client-impact', label: 'Impact' },
        { to: '/about', label: 'About' },
      ],

      // The "account" corner of the bar: Insights and the call to action for
      // visitors, the dashboard for someone signed in to it.
      useAccount: () => ({ signedIn: Boolean(getToken()) }),
      accountLinks: {
        signIn: { to: '/insights', label: 'Insights' },
        signUp: { to: '/contact', label: 'Start a project' },
        home: { to: '/admin', label: 'Dashboard' },
      },

      // A record without a picture gets the brand's dark placeholder.
      usePhotos: () => ({ url: (key) => (key ? mediaUrl(key) : PLACEHOLDER), alt: () => '' }),
      usePlaces: () => (place) => (PLACES[place] ? setting(PLACES[place]) || null : groupPhotos[place] ?? null),
      media: {},

      footer: {
        about: setting('company_tagline', 'Design-led web engineering from Nairobi. Web applications for health, legal, commerce, events and nonprofit organisations, designed and built end to end.'),
        columns: [
          { title: 'Services', links: serviceLinks.length ? serviceLinks : [{ to: '/services', label: 'All services' }] },
          { title: 'Studio', links: [
            { to: '/about', label: 'About' },
            { to: '/projects', label: 'Projects' },
            { to: '/our-approach', label: 'Our approach' },
            { to: '/client-impact', label: 'Client impact' },
            { to: '/insights', label: 'Insights' },
            { to: '/contact', label: 'Contact' },
          ] },
          { title: 'Legal', links: [
            { to: '/privacy', label: 'Privacy policy' },
            { to: '/terms', label: 'Terms of service' },
            { to: '/cookies', label: 'Cookie policy' },
          ] },
        ],
        promises: [
          { icon: MapPin, text: 'Designed and built in Nairobi' },
          { icon: Handshake, text: 'One team from brief to launch' },
          { icon: LifeBuoy, text: 'Supported after launch' },
        ],
        cta: {
          place: 'footer',
          eyebrow: setting('cta_badge', 'Get in touch'),
          title: setting('cta_title', 'Have a platform in mind?'),
          text: setting('cta_subtitle', 'Share a short brief. It will be mapped against the people the platform needs to serve, scoped into clear stages and returned with a realistic path to launch.'),
          primary: { to: '/contact', label: 'Start a project' },
          secondary: { to: '/projects', label: 'View the work' },
        },
        watermark: 'okjtech.',
        copyright: 'OKJTechnologies',
        madeBy: { label: 'Designed and built in Nairobi by', name: 'OKJTechnologies', href: '/about', logo: FAVICON },
      },

      legal: {
        documents: [
          { to: '/privacy', label: 'Privacy policy', icon: ShieldCheck },
          { to: '/terms', label: 'Terms of service', icon: FileText },
          { to: '/cookies', label: 'Cookie policy', icon: Cookie },
        ],
        contact: `Questions about these documents: ${setting('contact_email', 'hello@okjtech.co.ke')}.`,
        lastUpdated: setting('legal_last_updated', '2026-03-01'),
        seeAlso: [
          { to: '/privacy', label: 'Privacy policy' },
          { to: '/terms', label: 'Terms of service' },
          { to: '/cookies', label: 'Cookie policy' },
        ],
      },

      seo: {
        origin: 'https://okjtech.co.ke',
        siteName: 'OKJTech',
        locale: 'en_KE',
        defaultTitle: 'OKJTech — Design-led Web Engineering',
        defaultDescription: DESCRIPTION,
        pages: {
          '/': { title: 'OKJTech — Design-led Web Engineering', description: DESCRIPTION },
          '/about': page('About', 'A web engineering studio in Nairobi taking platforms from first idea to a live, supported system.'),
          '/services': page('Services', 'Web application engineering, e-commerce, dashboards, interface design and technical strategy.'),
          '/projects': page('Projects', 'Web platforms for health, law, construction, events, commerce and nonprofits, built end to end.'),
          '/projects/flagship': page('Flagship projects', 'Products developed and owned by OKJTechnologies.'),
          '/our-approach': page('Our approach', 'Six principles guide every project, from the first sketch to a platform that keeps growing.'),
          '/client-impact': page('Client impact', 'Platforms in daily use by clinics, law firms, workshops, event companies and nonprofits.'),
          '/insights': page('Insights', 'Notes on building web platforms that people rely on.'),
          '/contact': page('Contact', 'Describe the platform, the people it should serve and the timeline.'),
          '/privacy': page('Privacy policy'),
          '/terms': page('Terms of service'),
          '/cookies': page('Cookie policy'),
        },
        resolve: (path) => {
          const match = DETAIL.find(([pattern]) => pattern.test(path));
          return match ? page(match[1]) : undefined;
        },
      },
    };
  }, [setting, services, pillars]);
}
