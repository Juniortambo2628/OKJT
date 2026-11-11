import { screenOf } from './content';
/**
 * What goes into each principle of the approach, for the Approach page and
 * each principle's own page. Matched to a pillar by its title. A pillar
 * whose text in the dashboard has a bullet list uses that list instead of
 * these points; `projects` are the words its standout projects are picked by;
 * `stats` are the three figures its tab on the home page highlights.
 */
export const PRINCIPLES = [
  {
    match: ['design'],
    stats: [['0', 'templates: every layout drawn for its own people'], ['5', 'parts of an identity, from tone to type'], ['2', 'screens for every view: desktop and phone']],
    lead: 'What goes into design',
    points: [
      { title: 'Tone', text: 'How the platform speaks: measured for a law firm, warm for a clinic, lively for an event. Agreed before a word is written.' },
      { title: 'Personality', text: 'The character the interface carries in its layout, motion and details, so it feels like the organisation behind it.' },
      { title: 'Brand colours', text: 'A palette built from the brand and tested for contrast, so every word stays readable on every screen.' },
      { title: 'Identity', text: 'Logo, type and imagery set out as rules, so every page looks like the same organisation.' },
      { title: 'Layouts from scratch', text: 'Screens designed for each project’s own people and content, never squeezed into a template.' },
    ],
    receive: ['Design direction and moodboard', 'Colour and type system', 'Key screens on desktop and phone', 'A component library handed to engineering'],
    projects: ['brand', 'creative', 'portfolio', 'design', 'marketing', 'wedding', 'event'],
  },
  {
    match: ['style'],
    stats: [['1', 'set of components behind every page'], ['1', 'icon family, start to finish'], ['3', 'signal colours: success, warning, error']],
    lead: 'What goes into style',
    points: [
      { title: 'Typography', text: 'A type scale with a clear order for headings, body text and data, readable at every size.' },
      { title: 'Colour in use', text: 'Where the accent goes, and what signals success, a warning or an error.' },
      { title: 'Imagery and icons', text: 'A direction for photos and illustration, and one consistent set of icons.' },
      { title: 'Motion', text: 'Transitions that guide attention to what changed, and never slow anyone down.' },
      { title: 'Consistency', text: 'One set of components, so every page and every state matches.' },
    ],
    receive: ['A style guide', 'Design tokens shared by design and code', 'An icon set', 'Motion rules'],
    projects: ['brand', 'communications', 'hospitality', 'event', 'retail', 'creative'],
  },
  {
    match: ['human', 'experience', 'ux'],
    stats: [['Every', 'group it touches, mapped before building'], ['AA', 'contrast aimed for on every screen'], ['Real', 'people test the prototypes']],
    lead: 'What goes into a human-centred experience',
    points: [
      { title: 'Everyone it touches', text: 'Each group who will use the platform or be affected by it, mapped with what they need from it.' },
      { title: 'Their journeys', text: 'The steps each group takes, and where they get stuck today.' },
      { title: 'Accessibility', text: 'Contrast, keyboard use and screen readers designed in from the start, not patched in later.' },
      { title: 'Plain language', text: 'The words people already use, instead of system jargon.' },
      { title: 'Tested with real people', text: 'Prototypes put in front of the people who will use them, and changed by what they show.' },
    ],
    receive: ['A map of everyone the platform serves', 'User journeys', 'Accessibility checks', 'Findings from testing'],
    projects: ['health', 'clinic', 'legal', 'ngo', 'non-profit', 'education', 'community', 'alumni'],
  },
  {
    match: ['speed', 'fast', 'performance'],
    stats: [['WebP', 'images, converted as they upload'], ['1920px', 'the largest picture ever sent'], ['Mobile', 'data: the first speed test']],
    lead: 'What goes into speed',
    points: [
      { title: 'A fast first load', text: 'Pages light enough to open quickly on mobile data, where most visitors are.' },
      { title: 'Optimised images', text: 'Pictures resized and converted to WebP as they are uploaded.' },
      { title: 'Lean code', text: 'Each page downloads only what it needs.' },
      { title: 'Caching', text: 'Content served from cache and refreshed the moment it changes.' },
      { title: 'Measured', text: 'Load times tracked before and after launch, so slow pages are caught early.' },
    ],
    receive: ['A performance budget', 'An image pipeline', 'Caching set up', 'Speed monitoring'],
    projects: ['commerce', 'retail', 'food', 'marketplace', 'shop', 'agri'],
  },
  {
    match: ['launch', 'deploy', 'release'],
    stats: [['Staging', 'copy tried before every release'], ['SSL', 'on every domain, from day one'], ['Auto', 'deployments, checked before going live']],
    lead: 'What goes into a launch',
    points: [
      { title: 'Staging first', text: 'Every change tried on a copy of the live platform before anyone else sees it.' },
      { title: 'Automatic deployment', text: 'Changes go live through checks and tests, not by hand.' },
      { title: 'Domains and security', text: 'Domain, SSL certificates and email set up and verified.' },
      { title: 'Data moved safely', text: 'Existing content and users brought over and checked.' },
      { title: 'Handover', text: 'Training and a short guide for the people who will run it day to day.' },
    ],
    receive: ['A staging site', 'Automatic deployments with checks', 'SSL and domain set-up', 'Training for your team'],
    projects: ['legal', 'policy', 'govtech', 'event', 'trade'],
  },
  {
    match: ['scale', 'grow'],
    stats: [['M-Pesa', 'and Paystack, ready to connect'], ['Roles', 'from owners to viewers'], ['1', 'team caring for it after launch']],
    lead: 'What goes into scale',
    points: [
      { title: 'Built to grow', text: 'A structure that takes more users, data and features without a rebuild.' },
      { title: 'Roles and permissions', text: 'The right access for everyone on the team, from owners to viewers.' },
      { title: 'Integrations', text: 'Payments such as M-Pesa and Paystack, messaging and other systems connected.' },
      { title: 'Backups and monitoring', text: 'Regular backups, and alerts when something is down or failing.' },
      { title: 'Ongoing care', text: 'Updates, security fixes and new features after launch, by the same team.' },
    ],
    receive: ['A hosting plan', 'Backups and monitoring', 'Roles and permissions', 'Support after launch'],
    projects: ['fintech', 'saas', 'construction', 'proptech', 'platform', 'collaborative', 'automotive'],
  },
];

/** The principle details for a pillar, by its title. */
export const principleFor = (pillar) => {
  const title = String(pillar?.title || '').toLowerCase();
  return PRINCIPLES.find((p) => p.match.some((word) => title.includes(word))) || null;
};

/** Up to `count` projects that show a principle: matching words first, pictured ones first. */
export function standoutProjects(principle, projects, count = 3, avoid = new Set()) {
  const words = principle?.projects ?? [];
  const text = (p) => `${p.title} ${p.category} ${(p.focus_areas ?? []).join(' ')}`.toLowerCase();
  const score = (p) => words.filter((w) => text(p).includes(w)).length * 2 + (screenOf(p) ? 1 : 0) + (p.is_featured ? 1 : 0);
  return [...projects]
    .filter((p) => !avoid.has(p.id))
    .sort((a, b) => score(b) - score(a))
    .slice(0, count);
}
