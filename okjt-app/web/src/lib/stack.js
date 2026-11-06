/**
 * Technologies by their Simple Icons slug (simpleicons.org), so "Built with"
 * can show logos. A name is matched case-insensitively, first exactly, then
 * by its first words ("Laravel Sanctum" → Laravel). Names with no logo are
 * listed in words.
 */
const SLUGS = {
  react: 'react', 'react router': 'reactrouter', 'react hook form': 'reacthookform', 'tanstack query': 'reactquery', 'tanstack table': 'reacttable',
  mysql: 'mysql', postgresql: 'postgresql', laravel: 'laravel', php: 'php', phpunit: 'php', pest: 'php', composer: 'composer',
  'tailwind css': 'tailwindcss', tailwind: 'tailwindcss', bootstrap: 'bootstrap', 'font awesome': 'fontawesome', 'headless ui': 'headlessui',
  'radix ui': 'radixui', 'shadcn/ui': 'shadcnui', 'framer motion': 'framer', gsap: 'greensock', swiper: 'swiper', 'chart.js': 'chartdotjs',
  'github actions': 'githubactions', github: 'github', cpanel: 'cpanel', vercel: 'vercel', 'vercel analytics': 'vercel', 'vercel speed insights': 'vercel',
  'inertia.js': 'inertia', 'next.js': 'nextdotjs', typescript: 'typescript', javascript: 'javascript', 'vanilla js': 'javascript', jquery: 'jquery',
  vite: 'vite', vitest: 'vitest', jest: 'jest', eslint: 'eslint', sentry: 'sentry', zod: 'zod', swr: 'swr', i18next: 'i18next',
  pusher: 'pusher', websockets: 'socketdotio', stripe: 'stripe', paystack: 'paystack', meilisearch: 'meilisearch', leaflet: 'leaflet',
  openstreetmap: 'openstreetmap', calendly: 'calendly', typeform: 'typeform', 'google translate': 'googletranslate', 'whatsapp business api': 'whatsapp',
  'telegram bot api': 'telegram', 'spotify api': 'spotify', 'wikipedia api': 'wikipedia', capacitor: 'capacitor', 'progressive web app': 'pwa',
  'lighthouse ci': 'lighthouse', 'aws s3': 'amazons3', html: 'html5', css: 'css3', 'symfony components': 'symfony', twig: 'symfony',
  'mock service worker': 'mockserviceworker', filament: 'filament', livewire: 'livewire', 'alpine.js': 'alpinedotjs', docker: 'docker', redis: 'redis',
  nginx: 'nginx', wordpress: 'wordpress', woocommerce: 'woocommerce', shopify: 'shopify', figma: 'figma', firebase: 'firebase', 'node.js': 'nodedotjs',
  python: 'python', django: 'django', flutter: 'flutter', 'pdf.js': 'mozilla', blade: 'laravel', 'm-pesa': 'mpesa', 'deepseek ai': 'deepseek',
};

/** The slug for a technology, or null. */
export function slugFor(name) {
  const key = String(name).toLowerCase().replace(/\s*\(.*?\)\s*/g, '').trim();
  if (SLUGS[key]) return SLUGS[key];
  const words = key.split(/\s+/);
  for (let n = words.length - 1; n >= 1; n -= 1) {
    const prefix = words.slice(0, n).join(' ');
    if (SLUGS[prefix]) return SLUGS[prefix];
  }
  return null;
}

/**
 * A list of technologies as logos (one per brand, its names together) and
 * the rest in words: { logos: [{ slug, names }], words: [name] }.
 */
export function splitStack(names = []) {
  const logos = new Map();
  const words = [];
  for (const name of [...new Set(names.filter(Boolean))]) {
    const slug = slugFor(name);
    if (!slug) { words.push(name); continue; }
    if (!logos.has(slug)) logos.set(slug, { slug, names: [] });
    logos.get(slug).names.push(name);
  }
  return { logos: [...logos.values()], words };
}

export const logoUrl = (slug) => `https://cdn.simpleicons.org/${slug}`;
