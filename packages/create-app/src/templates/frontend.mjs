/**
 * The React app (frontend/): public pages on @okjt/site, sign-in pages and
 * the dashboard on @okjt/dashboard, as path → contents. `p` is the project.
 */
import { palette } from '../palette.mjs';

const lines = (...parts) => parts.filter((part) => part !== false && part != null).join('\n');
const js = (value) => JSON.stringify(value);

export function frontendFiles(p) {
  return {
    'package.json': packageJson(p),
    'index.html': indexHtml(p),
    'vite.config.js': viteConfig(),
    'okjt.config.js': okjtConfig(p),
    '.env.example': 'VITE_API_URL=/api\n',
    'public/brand/logo-dark.svg': wordmark(p.name, palette(p.colors).ink),
    'public/brand/logo-light.svg': wordmark(p.name, '#FFFFFF'),
    'public/brand/okjt-mark.svg': okjtMark(),
    'src/main.jsx': mainJsx(),
    'src/index.css': indexCss(),
    'src/App.jsx': appJsx(p),
    'src/services/api.js': apiJs(p),
    'src/workspace.js': workspaceJs(p),
    'src/site.config.jsx': siteConfig(p),
    'src/dashboard.config.js': dashboardConfig(p),
    'src/components/AuthLayout.jsx': authLayout(),
    'src/components/RequireAuth.jsx': requireAuth(),
    'src/pages/Home.jsx': homePage(p),
    'src/pages/NotFound.jsx': notFound(),
    'src/pages/SignIn.jsx': signIn(p),
    'src/pages/SignUp.jsx': signUp(p),
    'src/pages/AuthPages.jsx': authPages(p),
    'src/pages/Workspaces.jsx': workspacesPage(p),
    'src/pages/dashboard/Dashboard.jsx': dashboardPage(),
    'src/pages/dashboard/Overview.jsx': overviewPage(p),
    'src/pages/dashboard/Notes.jsx': notesPage(),
    'src/pages/dashboard/AccountMenu.jsx': accountMenu(p),
  };
}

function packageJson(p) {
  return `${JSON.stringify({
    name: `${p.slug}-frontend`,
    private: true,
    version: '0.0.0',
    type: 'module',
    scripts: {
      theme: 'okjt-theme',
      predev: 'okjt-theme',
      dev: 'vite',
      prebuild: 'okjt-theme',
      build: 'vite build',
      preview: 'vite preview',
    },
    dependencies: {
      '@okjt/dashboard': '^0.2.0',
      '@okjt/site': '^0.1.0',
      '@okjt/ui': '^0.1.0',
      '@tanstack/react-query': '^5.90.12',
      axios: '^1.13.2',
      'date-fns': '^4.1.0',
      'framer-motion': '^12.23.26',
      'lucide-react': '^0.559.0',
      react: '^19.2.0',
      'react-dom': '^19.2.0',
      'react-hook-form': '^7.68.0',
      'react-hot-toast': '^2.6.0',
      'react-router-dom': '^7.10.1',
    },
    devDependencies: {
      '@tailwindcss/vite': '^4.1.17',
      '@vitejs/plugin-react': '^5.2.0',
      tailwindcss: '^4.1.17',
      vite: '^7.2.4',
    },
  }, null, 2)}\n`;
}

function indexHtml(p) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="${p.colors.accent}" />
    <title>${p.name}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`;
}

function viteConfig() {
  return `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// In development the API runs beside this app (cd backend && php artisan serve);
// when deployed, both are served from one domain.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: { '/api': { target: 'http://127.0.0.1:8000', changeOrigin: true } },
  },
});
`;
}

function okjtConfig(p) {
  const colors = palette(p.colors);
  const body = Object.entries(colors).map(([name, value]) => `      ${name}: ${js(value)},`).join('\n');
  return `/**
 * ${p.name}'s theme for the OKJT kit (@okjt/ui): the colours and fonts every
 * page and the dashboard use (\`text-ink\`, \`bg-accent\`, \`border-line\`).
 * src/okjt-theme.css is generated from it before every \`npm run dev\` and
 * \`npm run build\` (or now: npm run theme).
 *
 * Made from two colours: accent ${p.colors.accent} and ink ${p.colors.ink}. Change any of them.
 */
export default {
  theme: {
    colors: {
${body}
    },
    fonts: {
      sans: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
      display: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    },
  },
};
`;
}

/** A plain wordmark in the brand's ink; replace public/brand/ with the real logo. */
function wordmark(name, color) {
  const text = name.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const width = Math.max(80, Math.round(name.length * 15 + 16));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="32" viewBox="0 0 ${width} 32"><text x="0" y="24" font-family="ui-sans-serif, system-ui, sans-serif" font-size="24" font-weight="700" fill="${color}">${text}</text></svg>\n`;
}

function okjtMark() {
  return '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#111"/><text x="12" y="16" text-anchor="middle" font-family="ui-sans-serif, system-ui, sans-serif" font-size="9" font-weight="700" fill="#fff">OKJ</text></svg>\n';
}

function mainJsx() {
  return `import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
`;
}

function indexCss() {
  return `@import "tailwindcss";
@import "./okjt-theme.css";

/* Let Tailwind see the kit's class names. */
@source "../node_modules/@okjt/ui/dist";
@source "../node_modules/@okjt/site/dist";
@source "../node_modules/@okjt/dashboard/dist";

/* "fit": desktop viewports tall enough for the dashboard's fixed-height
   lists (AdminPageLayout \`fill\`), where only the rows scroll. */
@custom-variant fit (@media (min-width: 64rem) and (min-height: 40rem));

body {
  background: var(--color-paper);
  color: var(--color-body);
  font-family: var(--font-sans);
}

/* ---- The dashboard (DashboardShell sets .admin-theme on <html>) ---- */
/* Light greys used for text: darker in the dashboard, for contrast. */
.admin-theme {
  --color-tone-400: #79716b;
  --color-tone-500: #66605a;
}

/* Always show where keyboard focus is. */
.admin-theme :focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .admin-theme *,
  .admin-theme *::before,
  .admin-theme *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* View-only people: fields in an EditableFieldset are disabled. */
.admin-theme fieldset:disabled :is(input, select, textarea, button, label) {
  cursor: not-allowed;
}
`;
}

function appJsx(p) {
  const w = p.workspace;
  return lines(
    "import { lazy, Suspense } from 'react';",
    "import { BrowserRouter, Route, Routes } from 'react-router-dom';",
    "import { QueryClient, QueryClientProvider } from '@tanstack/react-query';",
    "import { Toaster } from 'react-hot-toast';",
    "import { AuthProvider } from '@okjt/dashboard';",
    "import { SiteProvider } from '@okjt/site';",
    "import api from './services/api';",
    "import { site } from './site.config';",
    "import RequireAuth from './components/RequireAuth';",
    "import Home from './pages/Home';",
    '',
    "const SignIn = lazy(() => import('./pages/SignIn'));",
    "const SignUp = lazy(() => import('./pages/SignUp'));",
    "const AuthPages = lazy(() => import('./pages/AuthPages'));",
    "const Workspaces = lazy(() => import('./pages/Workspaces'));",
    "const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));",
    "const Overview = lazy(() => import('./pages/dashboard/Overview'));",
    "const Notes = lazy(() => import('./pages/dashboard/Notes'));",
    "const NotFound = lazy(() => import('./pages/NotFound'));",
    '',
    'const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } } });',
    '',
    '/**',
    ` * ${p.name}: the public pages (/), signing in and up, your ${w.plural} (/${w.path}),`,
    ` * and the dashboard of the ${w.label} you open (/dashboard).`,
    ' */',
    'export default function App() {',
    '  return (',
    '    <QueryClientProvider client={queryClient}>',
    '      <BrowserRouter>',
    '        <AuthProvider api={api}>',
    '          <SiteProvider site={site}>',
    '            <Toaster position="top-right" />',
    '            <Suspense fallback={null}>',
    '              <Routes>',
    '                <Route path="/" element={<Home />} />',
    '                <Route path="/sign-in" element={<SignIn />} />',
    '                <Route path="/sign-up" element={<SignUp />} />',
    p.features.google && '                <Route path="/auth/google" element={<AuthPages page="google" />} />',
    '                <Route path="/verify-email/:id/:hash" element={<AuthPages page="verify" />} />',
    '                <Route path="/accept-invite" element={<AuthPages page="invite" />} />',
    `                <Route path="/${w.path}" element={<RequireAuth><Workspaces /></RequireAuth>} />`,
    '                <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>}>',
    '                  <Route index element={<Overview />} />',
    '                  <Route path="notes" element={<Notes />} />',
    '                </Route>',
    '                <Route path="*" element={<NotFound />} />',
    '              </Routes>',
    '            </Suspense>',
    '          </SiteProvider>',
    '        </AuthProvider>',
    '      </BrowserRouter>',
    '    </QueryClientProvider>',
    '  );',
    '}',
    '',
  );
}

function apiJs(p) {
  return `import axios from 'axios';
import { toast } from 'react-hot-toast';
import { currentWorkspace } from '../workspace';

/**
 * The API client: sends your token, and inside the dashboard the ${p.workspace.label}
 * you're working on (X-Workspace); answers are unwrapped from the kit's
 * { success, message, data } to their data.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) config.headers.Authorization = \`Bearer \${token}\`;
  const slug = currentWorkspace();
  if (slug && window.location.pathname.startsWith('/dashboard') && !config.headers['X-Workspace']) {
    config.headers['X-Workspace'] = slug;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    const payload = response.data;
    if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) response.data = payload.data;
    return response;
  },
  (error) => {
    if (error.response?.status === 403 && error.response.data?.reason === 'role') {
      toast.error(error.response.data.message || 'You don’t have permission to do that.', { id: 'role-denied' });
    }
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      if (window.location.pathname.startsWith('/dashboard')) window.location.assign('/sign-in');
    }
    return Promise.reject(error);
  },
);

export default api;
`;
}

function workspaceJs(p) {
  const w = p.workspace;
  return `import { useQuery } from '@tanstack/react-query';
import api from './services/api';

/** The ${w.label} the dashboard works on: its address (slug), remembered in this browser. */
const KEY = 'workspace';

export function currentWorkspace() {
  try { return localStorage.getItem(KEY); } catch { return null; }
}

export function openWorkspace(slug) {
  try { localStorage.setItem(KEY, slug); } catch { /* private window: this visit only */ }
}

/** Your ${w.plural}: [{ id, name, slug, status, role }]. */
export function useWorkspaces() {
  return useQuery({ queryKey: ['workspaces'], queryFn: () => api.get('/${w.path}').then((res) => res.data) });
}
`;
}

function siteConfig(p) {
  const w = p.workspace;
  return `import { FileText, ShieldCheck } from 'lucide-react';
import { useAuth } from '@okjt/dashboard';

/**
 * ${p.name}'s public pages (@okjt/site): the words, links and pictures the
 * kit's layout and sections show. Colours and fonts are in okjt.config.js.
 */
export const site = {
  brand: { name: ${js(p.name)}, logo: { light: '/brand/logo-light.svg', dark: '/brand/logo-dark.svg' } },

  nav: [
    { to: '/', label: 'Home' },
    { to: '/#faq', label: 'Questions' },
  ],

  useAccount: () => ({ signedIn: useAuth().isAuthenticated }),
  accountLinks: {
    signIn: { to: '/sign-in', label: 'Sign in' },
    signUp: { to: '/sign-up', label: 'Get started' },
    home: { to: '/${w.path}', label: ${js(`Your ${w.plural}`)} },
  },

  // Photos are keys; add pictures to public/photos and name them here.
  usePhotos: () => ({ url: (key) => \`/photos/\${key}.jpg\`, alt: () => '' }),
  usePlaces: () => () => null,
  media: {},

  footer: {
    about: ${js(p.tagline)},
    columns: [
      { title: 'Product', links: [{ to: '/sign-up', label: 'Get started', signedIn: false }, { to: '/sign-in', label: 'Sign in', signedIn: false }] },
    ],
    promises: [{ icon: ShieldCheck, text: 'Your data stays yours' }],
    watermark: ${js(`${p.slug}.`)},
    copyright: ${js(p.name)},
    madeBy: { label: 'Built by', name: 'OKJ Technologies', href: 'https://okjtech.co.ke', logo: '/brand/okjt-mark.svg' },
  },

  legal: {
    documents: [{ to: '/terms', label: 'Terms of service', icon: FileText }],
    contact: 'Contact OKJ Technologies through okjtech.co.ke.',
    lastUpdated: ${js(new Date().toISOString().slice(0, 10))},
    seeAlso: [],
  },

  seo: {
    origin: ${js(`https://${p.domain}`)},
    siteName: ${js(p.name)},
    locale: 'en_KE',
    defaultTitle: ${js(p.name)},
    defaultDescription: ${js(p.tagline)},
    pages: { '/': { title: ${js(p.name)}, description: ${js(p.tagline)} } },
    resolve: () => undefined,
  },
};
`;
}

function dashboardConfig(p) {
  const w = p.workspace;
  return `import { useActivityPanel, useCollaboration, NotificationsBell } from '@okjt/dashboard';
import { LayoutDashboard, NotebookPen } from 'lucide-react';
import api from './services/api';
import AccountMenu from './pages/dashboard/AccountMenu';

/**
 * ${p.name}'s dashboard (@okjt/dashboard): its pages, roles, and shell. Add a
 * module: a page under pages/dashboard, a route in App.jsx, a sidebar item
 * here and an entry in MODULES (the key is the server's $revisionModule).
 */
export const MODULES = [
  { key: 'overview', path: '/dashboard', label: 'Overview' },
  { key: 'notes', path: '/dashboard/notes', label: 'Notes' },
];

export const ROLES = ${JSON.stringify(p.roles, null, 2).replace(/"(\w+)":/g, '$1:').replace(/"/g, "'")};

export const roleLabel = (role) => ROLES.find((r) => r.value === role)?.label || role;

export const dashboard = {
  home: { label: 'Overview', path: '/dashboard' },
  useDefaultPanel: useActivityPanel,
  useAfterChange: () => useCollaboration().refresh,
  api,
  modules: MODULES,
  roles: ROLES,
  roleLabel,
  shell: {
    logo: { src: '/brand/logo-light.svg', alt: ${js(p.name)}, to: '/${w.path}' },
    nav: [
      { items: [{ path: '/dashboard', icon: LayoutDashboard, label: 'Overview', id: 'sidebar-overview' }] },
      { title: 'Work', items: [{ path: '/dashboard/notes', icon: NotebookPen, label: 'Notes', id: 'sidebar-notes' }] },
    ],
    quickLinks: [],
    Notifications: NotificationsBell,
    AccountMenu,
  },
};
`;
}

function authLayout() {
  return `import { AuthLayout as KitAuthLayout } from '@okjt/dashboard';
import { useSite } from '@okjt/site';

/** The sign-in pages' frame (the kit's), with this project's logo. */
export default function AuthLayout(props) {
  const { brand } = useSite();
  return <KitAuthLayout brand={<img src={brand.logo.dark} alt={brand.name} className="h-8 w-auto" />} {...props} />;
}
`;
}

function requireAuth() {
  return `import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@okjt/dashboard';

/** Signed-in pages: everyone else goes to sign in, and comes back after. */
export default function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to={\`/sign-in?next=\${encodeURIComponent(location.pathname)}\`} replace />;
  return children;
}
`;
}

function homePage(p) {
  const w = p.workspace;
  return `import { Container, FaqSection, PillLink, SectionHeading, SiteLayout } from '@okjt/site';

const FAQ = [
  { q: 'Who can see my ${w.plural}?', a: 'Only the people you invite, with the role you give them.' },
  { q: 'Can I undo a change?', a: 'Yes: every change is kept in the version history, and any version can be restored.' },
  { q: 'Can we work at the same time?', a: 'Yes: you see who else is there, and what changed since you last looked.' },
];

/** The home page: what ${p.name} is, a way in, and questions. Replace the words with your own. */
export default function Home() {
  return (
    <SiteLayout cta={false}>
      <section className="pt-36 pb-24 sm:pt-44">
        <Container>
          <SectionHeading
            as="h1"
            eyebrow=${js(p.name)}
            title=${js(p.tagline)}
            text="Everything your team works on, in one place: who's doing what, what changed, and nothing lost."
          />
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <PillLink to="/sign-up" size="lg">Get started</PillLink>
            <PillLink to="/sign-in" variant="light" size="lg" arrow>Sign in</PillLink>
          </div>
        </Container>
      </section>
      <section className="pb-24">
        <Container>
          <FaqSection items={FAQ} />
        </Container>
      </section>
    </SiteLayout>
  );
}
`;
}

function notFound() {
  return `import { Container, PillLink, SectionHeading, SiteLayout } from '@okjt/site';

export default function NotFound() {
  return (
    <SiteLayout cta={false}>
      <section className="pt-40 pb-32">
        <Container>
          <SectionHeading as="h1" eyebrow="404" title="This page isn’t here." text="It may have moved, or the address has a typo." />
          <div className="mt-10 flex justify-center"><PillLink to="/">Home</PillLink></div>
        </Container>
      </section>
    </SiteLayout>
  );
}
`;
}

function signIn(p) {
  return lines(
    "import { useEffect } from 'react';",
    "import { Link, useNavigate, useSearchParams } from 'react-router-dom';",
    `import { ${p.features.google ? 'GoogleButton, ' : ''}SignInPage, useAuth } from '@okjt/dashboard';`,
    "import AuthLayout from '../components/AuthLayout';",
    '',
    '/** Only paths on this site (never "//elsewhere.example"). */',
    "const safeNext = (next) => typeof next === 'string' && next.startsWith('/') && !next.startsWith('//');",
    '',
    `/** Signing in (the kit's page), then on to where you were going, or your ${p.workspace.plural}. */`,
    'export default function SignIn() {',
    '  const navigate = useNavigate();',
    '  const [params] = useSearchParams();',
    `  const next = safeNext(params.get('next')) ? params.get('next') : '/${p.workspace.path}';`,
    '  const { isAuthenticated } = useAuth();',
    '',
    '  useEffect(() => {',
    '    if (isAuthenticated) navigate(next, { replace: true });',
    '  }, [isAuthenticated, navigate, next]);',
    '',
    '  return (',
    '    <SignInPage',
    '      layout={AuthLayout}',
    '      onSignedIn={() => navigate(next, { replace: true })}',
    `      subtitle=${js(`Sign in to ${p.name}.`)}`,
    `      footer={<>New here? <Link to="/sign-up" className="font-medium text-accent-strong hover:underline">Create an account</Link></>}`,
    `      forgotHint="Forgot it? Ask an owner to invite you again."`,
    p.features.google && '      google={<GoogleButton />}',
    '    />',
    '  );',
    '}',
    '',
  );
}

function signUp(p) {
  return `import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthError, AuthField, AuthSubmit, useAuth } from '@okjt/dashboard';
import AuthLayout from '../components/AuthLayout';

/** Creating an account; then the verification email (the server asks for it before the first sign-in). */
export default function SignUp() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [sentTo, setSentTo] = useState(null);
  const [saving, setSaving] = useState(false);
  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const result = await register(form);
    setSaving(false);
    if (result.requires_verification) return setSentTo(result.email);
    setErrors(Object.fromEntries(Object.entries(result.errors || {}).map(([k, v]) => [k, v[0]])));
    setError(result.message);
  };

  if (sentTo) {
    return (
      <AuthLayout title="Check your inbox" subtitle={<>We sent a link to <strong className="text-body">{sentTo}</strong>. Open it to verify your address, then sign in.</>}
        footer={<Link to="/sign-in" className="hover:text-body">← Back to sign in</Link>} />
    );
  }

  return (
    <AuthLayout title=${js(`Join ${p.name}`)} subtitle="Create your account. It takes a minute."
      footer={<>Already have one? <Link to="/sign-in" className="font-medium text-accent-strong hover:underline">Sign in</Link></>}>
      <AuthError>{error}</AuthError>
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <AuthField id="sign-up-name" label="Your name" autoComplete="name" value={form.name} onChange={set('name')} error={errors.name} required />
        <AuthField id="sign-up-email" label="Email" type="email" autoComplete="email" value={form.email} onChange={set('email')} error={errors.email} required />
        <AuthField id="sign-up-password" label="Password" type="password" autoComplete="new-password" placeholder="At least 8 characters" value={form.password} onChange={set('password')} error={errors.password} required />
        <AuthField id="sign-up-password-confirm" label="Confirm password" type="password" autoComplete="new-password" value={form.password_confirmation} onChange={set('password_confirmation')} required />
        <div className="pt-2"><AuthSubmit loading={saving}>Create account</AuthSubmit></div>
      </form>
    </AuthLayout>
  );
}
`;
}

function authPages(p) {
  return lines(
    "import { useNavigate } from 'react-router-dom';",
    `import { AcceptInvitePage, ${p.features.google ? 'GoogleCallbackPage, ' : ''}VerifyEmailPage } from '@okjt/dashboard';`,
    "import api from '../services/api';",
    "import AuthLayout from '../components/AuthLayout';",
    '',
    `/** Where emailed links${p.features.google ? ' and Google sign-in' : ''} land (the kit's pages), then on to your ${p.workspace.plural}. */`,
    'export default function AuthPages({ page }) {',
    '  const navigate = useNavigate();',
    `  const home = () => navigate('/${p.workspace.path}', { replace: true });`,
    '',
    p.features.google && "  if (page === 'google') return <GoogleCallbackPage layout={AuthLayout} onSignedIn={home} />;",
    `  if (page === 'verify') return <VerifyEmailPage layout={AuthLayout} next="/${p.workspace.path}" />;`,
    '  return (',
    '    <AcceptInvitePage',
    '      layout={AuthLayout}',
    "      accept={(payload) => api.post('/collaborators/accept', payload).then((res) => res.data)}",
    '      onSignedIn={home}',
    '    />',
    '  );',
    '}',
    '',
  );
}

function workspacesPage(p) {
  const w = p.workspace;
  const Title = w.plural.charAt(0).toUpperCase() + w.plural.slice(1);
  const Label = w.label.charAt(0).toUpperCase() + w.label.slice(1);
  return `import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Plus } from 'lucide-react';
import { AuthError, AuthField, AuthSubmit, useAuth } from '@okjt/dashboard';
import AuthLayout from '../components/AuthLayout';
import api from '../services/api';
import { openWorkspace, useWorkspaces } from '../workspace';
import { roleLabel } from '../dashboard.config';

/** Your ${w.plural}: open one, or start a new one. */
export default function Workspaces() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, logout } = useAuth();
  const { data: workspaces = [], isLoading } = useWorkspaces();
  const [name, setName] = useState('');
  const [error, setError] = useState(null);

  const open = (slug) => {
    openWorkspace(slug);
    navigate('/dashboard');
  };

  const create = useMutation({
    mutationFn: () => api.post('/${w.path}', { name }).then((res) => res.data),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      open(created.slug);
    },
    onError: (err) => setError(err.response?.data?.message || 'Something went wrong. Try again.'),
  });

  return (
    <AuthLayout
      title=${js(`Your ${w.plural}`)}
      subtitle={user ? \`Signed in as \${user.email}.\` : null}
      footer={<button type="button" onClick={logout} className="hover:text-body">Sign out</button>}
    >
      {!isLoading && workspaces.length > 0 && (
        <ul className="mb-8 space-y-2">
          {workspaces.map((w) => (
            <li key={w.id}>
              <button type="button" onClick={() => open(w.slug)} className="flex w-full items-center justify-between gap-3 rounded-2xl border border-line bg-white px-5 py-4 text-left hover:border-accent">
                <span>
                  <span className="block text-sm font-semibold text-ink">{w.name}</span>
                  <span className="block text-xs text-muted">{roleLabel(w.role)}</span>
                </span>
                <ArrowRight className="h-4 w-4 text-accent" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <AuthError>{error}</AuthError>
      <form onSubmit={(e) => { e.preventDefault(); setError(null); create.mutate(); }} className="space-y-4">
        <AuthField id="new-workspace" label=${js(`Start a new ${w.label}`)} placeholder=${js(`${Label} name`)} value={name} onChange={(e) => setName(e.target.value)} required />
        <AuthSubmit loading={create.isPending}><Plus className="h-4 w-4" aria-hidden="true" /> Create</AuthSubmit>
      </form>
      {!isLoading && workspaces.length === 0 && <p className="mt-6 text-sm text-muted">${Title} you start or are invited to show up here.</p>}
    </AuthLayout>
  );
}
`;
}

function dashboardPage() {
  return `import { Navigate, Outlet } from 'react-router-dom';
import { DashboardProvider, DashboardShell } from '@okjt/dashboard';
import { PermissionsProvider } from '@okjt/ui';
import { dashboard } from '../../dashboard.config';
import { currentWorkspace, useWorkspaces } from '../../workspace';

/** The dashboard of the workspace you opened, with your role in it (viewers may only look). */
export default function Dashboard() {
  const { data: workspaces, isLoading } = useWorkspaces();
  if (isLoading) return null;
  const workspace = workspaces?.find((w) => w.slug === currentWorkspace());
  if (!workspace) return <Navigate to={dashboard.shell.logo.to} replace />;

  const permissions = { role: workspace.role, isOwner: workspace.role === 'owner', canEdit: workspace.role !== 'viewer' };
  return (
    <PermissionsProvider value={permissions}>
      <DashboardProvider dashboard={dashboard}>
        <DashboardShell>
          <Outlet context={{ workspace }} />
        </DashboardShell>
      </DashboardProvider>
    </PermissionsProvider>
  );
}
`;
}

function overviewPage(p) {
  return `import { Link, useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { NotebookPen } from 'lucide-react';
import { AdminCard, AdminPageHero, AdminPageLayout, AdminSummaryCards } from '@okjt/dashboard';
import api from '../../services/api';

/** The ${p.workspace.label}'s front page: a few numbers and where to go next. */
export default function Overview() {
  const { workspace } = useOutletContext();
  const { data: notes = [] } = useQuery({ queryKey: ['notes'], queryFn: () => api.get('/notes').then((res) => res.data) });

  return (
    <AdminPageLayout
      hero={<AdminPageHero title={workspace.name} breadcrumb="Overview" description="Everything in this ${p.workspace.label}, at a glance." />}
      summary={<AdminSummaryCards cards={[{ label: 'Notes', value: notes.length, icon: NotebookPen }]} />}
    >
      <AdminCard>
        <p className="text-sm text-soft">
          Start with <Link to="/dashboard/notes" className="font-medium text-accent-strong hover:underline">Notes</Link>: every change is kept in the version history, and the people you invite (Share, in the header) see who else is here.
        </p>
      </AdminCard>
    </AdminPageLayout>
  );
}
`;
}

function notesPage() {
  return `import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { NotebookPen, Plus } from 'lucide-react';
import {
  AdminInput, AdminListPanel, AdminModal, AdminPageHero, AdminPageLayout, AdminTextarea,
  DeleteButton, EmptyState, useAdminAction, useFilteredItems, useSearch,
} from '@okjt/dashboard';
import api from '../../services/api';

/**
 * The starter module: a list with search, add and edit in a dialog, delete
 * with a confirmation. Saving goes through useAdminAction (confirm, pending,
 * toast, refresh; hidden for viewers). Copy this page for your own modules.
 */
export default function Notes() {
  const { data: notes = [], isLoading } = useQuery({ queryKey: ['notes'], queryFn: () => api.get('/notes').then((res) => res.data) });
  const { searchQuery } = useSearch();
  const shown = useFilteredItems(notes, searchQuery);
  const [editing, setEditing] = useState(null);

  const save = useAdminAction(
    (note) => (note.id ? api.put(\`/notes/\${note.id}\`, note) : api.post('/notes', note)),
    { success: 'Note saved', invalidate: [['notes']], onSuccess: () => setEditing(null) },
  );
  const remove = useAdminAction((id) => api.delete(\`/notes/\${id}\`), {
    confirm: 'Delete this note?', success: 'Note deleted', invalidate: [['notes']],
  });

  return (
    <AdminPageLayout
      fill
      hero={<AdminPageHero title="Notes" breadcrumb="Notes" description="Decisions, reminders and anything worth writing down." />}
      search="Search notes"
      actions={[{ id: 'add-note', label: 'Add note', icon: Plus, onClick: () => setEditing({ title: '', body: '' }) }]}
    >
      <AdminListPanel>
        {shown.length === 0 ? (
          <EmptyState icon={NotebookPen} loading={isLoading} searchQuery={searchQuery} message="No notes yet." />
        ) : (
          <ul className="divide-y divide-line">
            {shown.map((note) => (
              <li key={note.id} className="flex items-start justify-between gap-4 px-5 py-4">
                <button type="button" onClick={() => setEditing(note)} className="min-w-0 text-left">
                  <span className="block font-semibold text-ink">{note.title}</span>
                  {note.body && <span className="mt-1 block truncate text-sm text-soft">{note.body}</span>}
                </button>
                <DeleteButton onClick={() => remove.run(note.id)} />
              </li>
            ))}
          </ul>
        )}
      </AdminListPanel>

      <AdminModal isOpen={!!editing} onClose={() => setEditing(null)} title={editing?.id ? 'Edit note' : 'Add note'}>
        {editing && (
          <form onSubmit={(e) => { e.preventDefault(); save.run(editing); }} className="space-y-4">
            <AdminInput id="note-title" label="Title" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} required />
            <AdminTextarea id="note-body" label="Note" rows={6} value={editing.body || ''} onChange={(e) => setEditing({ ...editing, body: e.target.value })} />
            <div className="flex justify-end">
              <button type="submit" disabled={save.pending} className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-strong disabled:opacity-60">Save</button>
            </div>
          </form>
        )}
      </AdminModal>
    </AdminPageLayout>
  );
}
`;
}

function accountMenu(p) {
  const w = p.workspace;
  return `import { ArrowLeftRight } from 'lucide-react';
import { AccountMenu as KitAccountMenu } from '@okjt/dashboard';
import { usePermissions } from '@okjt/ui';
import { roleLabel } from '../../dashboard.config';

/** The header's account menu (the kit's): your role here, back to your ${w.plural}, log out. */
export default function AccountMenu({ compactLinks }) {
  const { role } = usePermissions();
  return (
    <KitAccountMenu
      compactLinks={compactLinks}
      roleText={roleLabel(role)}
      fallbackName="You"
      extra={({ itemClass }) => (
        <a href="/${w.path}" role="menuitem" className={\`\${itemClass} border-b border-tone-100 mb-1\`}>
          <ArrowLeftRight className="w-4 h-4 text-accent" />
          ${'Your ' + w.plural}
        </a>
      )}
    />
  );
}
`;
}
