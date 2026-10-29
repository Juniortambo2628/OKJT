# OKJT Kit: specification (Phase 0)

The public pages and the dashboard that Naoa and Najenga share, as packages a
new OKJTech project installs and configures, instead of copying files from
one repository to the next.

Status: **draft for review**. Nothing here is built yet; the open questions
at the end need answers before Phase 1.

## Decisions taken

| # | Decision | Consequence |
|---|---|---|
| 1 | Shared packages, not a one-time template | One fix reaches every project through an update. A project changes how its pages look and what they say through config, not by editing kit code. |
| 2 | Naoa's stack for every project: Laravel 12 API + React 19 app (Vite, react-router 7, Tailwind 4, TanStack Query) | Packages can import react-router and TanStack Query directly: no adapter layer for Inertia. **Najenga moves off Inertia** (Phase 6). |
| 3 | Packages live here, in `packages/` beside `deploy-kit/` | One repo for everything shared across OKJTech projects. |
| 4 | Roles follow Naoa's model everywhere; Najenga is restructured to match | Below, under "Roles". |

## Packages

```
packages/
  ui/              @okjt/ui          theme tokens, primitives, feedback (toasts, confirm dialogs)
  site/            @okjt/site        public pages: layout, nav, footer, sections, SEO
  dashboard/       @okjt/dashboard   shell, page layout, toolbar, side panel, lists, history, presence
  laravel-kit/     okjt/laravel-kit  Composer: auth, workspaces and roles, invites, revisions, presence
  create-app/      create-okjt-app   the installer
```

`@okjt/site` and `@okjt/dashboard` both depend on `@okjt/ui`, so a site's
public pages and its dashboard share one theme. `@okjt/dashboard` expects
the API routes that `okjt/laravel-kit` registers.

## How a project uses the kit

```
my-project/
  backend/   composer require okjt/laravel-kit   → config/okjt.php
  frontend/  npm i @okjt/site @okjt/dashboard    → src/okjt.config.js, src/content/*
```

Everything a project defines itself:

| What | Where | Example |
|---|---|---|
| Name, logo, favicon, domain | `okjt.config.js` → `brand` | `{ name: 'Najenga', logo: '/brand/logo.svg' }` |
| Colours, fonts, radius, shadows | `okjt.config.js` → `theme` | Written into CSS variables; Tailwind 4 reads them via `@theme`. |
| Public nav, footer, pages and their sections | `okjt.config.js` → `site` | The landing page as an ordered list of sections (below). |
| Words and photos | `src/content/*.js` | Naoa's `config/marketing.js`, which already works this way. |
| Dashboard modules, sidebar groups, who sees what | `okjt.config.js` → `dashboard` | `{ id: 'expenses', path: 'expenses', icon: Receipt, roles: ['owner', 'editor'] }` |
| Role setup | `config/okjt.php` (server), sent to the app at sign-in | Presets, below. |
| The project's own pages and components | the project | Naoa's guests, seating and invitation designer; Najenga's receipts and OCR. |

### `okjt.config.js` (sketch)

```js
import { defineConfig } from '@okjt/ui';
import { Receipt, Images, FileText } from 'lucide-react';
import * as content from './content';

export default defineConfig({
  brand: { name: 'Najenga', logo: '/brand/logo.svg', favicon: '/brand/favicon.png' },

  theme: {
    colors: { primary: '#8B0000', primaryLight: '#DC143C', primaryDark: '#5C0000',
              surface: '#0b0c0d', text: '#1a1a1a', muted: '#6b6b6b' },
    fonts: { sans: 'Figtree', display: 'Manrope' },
    radius: 'lg',
  },

  site: {
    nav: content.NAV,
    footer: content.FOOTER_COLUMNS,
    pages: {
      '/': [
        { section: 'PhotoHero', ...content.HERO },
        { section: 'FeatureExplorer', groups: content.FEATURE_GROUPS },
        { section: 'ShowcaseCarousel', items: content.SHOWCASE },
        { section: 'Pricing', plans: content.PLANS },   // or { source: 'api' }
        { section: 'Faq', items: content.FAQ },
      ],
      '/features': 'Features',                          // built-in page template
      '/for-homeowners': { template: 'Journey', journey: content.HOMEOWNER_JOURNEY },
      '/terms': { template: 'Legal', doc: content.TERMS },
    },
    sections: {},  // the project's own section components, used like built-in ones
  },

  dashboard: {
    workspace: { label: 'project', plural: 'projects' },  // "wedding" in Naoa
    groups: [
      { title: 'Spending', items: [
        { id: 'expenses', label: 'Expenses', path: 'expenses', icon: Receipt, page: () => import('./pages/Expenses') },
      ]},
      { title: 'Site records', items: [
        { id: 'photos', label: 'Photos', path: 'photos', icon: Images, page: () => import('./pages/Photos') },
        { id: 'documents', label: 'Documents', path: 'documents', icon: FileText, page: () => import('./pages/Documents') },
      ]},
    ],
    features: { history: true, presence: true, tutorial: true, savedViews: true, console: true, billing: false },
  },
});
```

### `config/okjt.php` (sketch)

```php
return [
    // The record people collaborate on: Naoa's Wedding, Najenga's Project.
    'workspace' => [
        'model' => App\Models\Project::class,
        'pivot' => 'project_user',
        'route_parameter' => 'project',
    ],

    // 'full' | 'standard' | 'simple' (below), or a custom list.
    'roles' => 'standard',

    // Writes a viewer may still make (Naoa's EnforceRole::VIEWER_WRITES).
    'viewer_writes' => ['api/logout', 'api/collaboration/heartbeat', 'api/2fa/*', 'api/notifications/mark-read'],

    'auth' => ['google' => true, 'passkeys' => true, 'two_factor' => true, 'verify_email' => true],
    'revisions' => ['retain_days' => 180, 'coalesce_minutes' => 10],
    'presence' => ['heartbeat_seconds' => 20],
    'billing' => false,  // Naoa's Paystack plans and limits, when a project charges
];
```

## Roles

Naoa's model, generalised. It has three layers; a project turns on the ones
it needs.

| Layer | Naoa | Najenga today | In the kit |
|---|---|---|---|
| **Platform**: the people who run the product | `users.is_superadmin`, `EnsureSuperadmin`, the Console | global role `admin` (`AdminOnly`, `UserPolicy`) | `is_superadmin`; the Console with an audit log |
| **Account**: a business that works on many workspaces | `account_user` (owner / staff), staff on all or chosen weddings with one role | global role `manager` (no team record) | optional `accounts` |
| **Workspace**: the record people work on together | `wedding_user`: owner / editor / viewer; `ResolveWedding` picks the current one; `EnforceRole` checks it on every request | `project_user`: owner / manager / editor / viewer; checked in `ProjectPolicy` | `workspace_user`, `ResolveWorkspace`, `EnforceRole`, `useRole()` |

The presets cover the setups you named:

| Preset | Layers | Reads as |
|---|---|---|
| `full` | platform + accounts + workspace | superadmin › account owner / staff › owner / editor / viewer (Naoa) |
| `standard` | platform + workspace | superadmin › owner / editor / viewer |
| `simple` | workspace only, two roles | admin › user (owner and viewer, relabelled) |

Labels are config. A project can call `owner` "Admin" and `viewer` "User"
without touching the checks.

### Najenga, restructured like Naoa

| Najenga today | Becomes |
|---|---|
| global `admin` | `is_superadmin = true` |
| global `client` | an ordinary user; owner of the projects whose `client_id` is theirs (already true in `project_user` since 2026-10-27) |
| global `manager` | **open question 1** |
| project `owner` / `editor` / `viewer` | the same |
| project `manager` | **open question 2** |
| `users.role` column | dropped once nothing reads it, in a later, separately reviewed migration |

## Inventory: what goes into the kit

From Naoa (`frontend/src`, `backend/app`) at `38027b8`. **Kit**: moves into a
package. **Kit, after changes**: moves, once the change noted is made.
**Stays**: wedding-specific and stays in Naoa.

### Public pages → `@okjt/site`

| Naoa file | Verdict | Notes |
|---|---|---|
| `marketing/ui.jsx` (Container, Eyebrow, SectionHeading, PillLink, Icon) | Kit | The building blocks every section uses |
| `marketing/MarketingLayout.jsx`, `Seo.jsx` | Kit, after changes | `Seo` loses its traditions special case; titles come from config |
| `marketing/MarketingNav.jsx` | Kit, after changes | `TraditionsMenu` becomes a "mega menu" slot a project fills |
| `marketing/MarketingFooter.jsx` | Kit | Columns and legal links from config |
| `marketing/PhotoHero.jsx`, `Photo.jsx`, `ImageCard.jsx`, `MediaFrame.jsx` | Kit, after changes | `Photo` reads a project's photo list and `useSitePhotos` (photos chosen in the Console) instead of Naoa's |
| `marketing/FeatureExplorer.jsx`, `ModuleSwitcher.jsx`, `ShowcaseCarousel.jsx` | Kit | Data already comes from `config/marketing.js` |
| `marketing/SectionNav.jsx`, `hooks/useScrollSpy.js` | Kit | |
| `marketing/FaqSection.jsx`, `Pricing.jsx` | Kit | `Pricing` takes plans from config or the billing API |
| `marketing/RollingPhrase.jsx`, `hooks/useRolling.js` | Kit, after changes | Phrases as a prop, not from `config/languages` |
| `pages/platform/Landing.jsx`, `Features.jsx`, `Journey.jsx`, `LegalPage.jsx` | Kit, after changes | Become page templates built from config |
| `pages/platform/SignUp.jsx`, `admin/AdminLogin.jsx`, `admin/AuthLayout.jsx`, `admin/GoogleButton.jsx`, `GoogleAuthCallback.jsx`, `VerifyEmailPage.jsx`, `AcceptInvite.jsx` | Kit, after changes | `AuthLayout`'s right-hand panel becomes a slot (Naoa shows the wedding) |
| `CookieConsent.jsx`, `NotFound.jsx` | Kit | |
| `TraditionFinder`, `TraditionsMenu`, `PlanDemo`, `EssentialElements`, `CommunityNotes`, `SuggestedCommunities`, `GuestPreview(+Tools)`, `UnconfirmedBadge`, `LegalNote` | Stays | Naoa's own sections, added through `site.sections` |

### Dashboard → `@okjt/dashboard` and `@okjt/ui`

| Naoa file | Verdict | Notes |
|---|---|---|
| `admin/AdminShell.jsx`, `Sidebar.jsx`, `Header.jsx`, `HeaderAccountMenu.jsx`, `context/AdminChromeContext.jsx` | Kit, after changes | Sidebar groups from `dashboard.groups`; header links and the staff-only backup item from config |
| `admin/AdminPageLayout.jsx`, `AdminPageHero.jsx`, `AdminSummaryCards.jsx`, `StatCard.jsx` | Kit | The hero → summary cards → content + side panel → toolbar layout |
| `admin/AdminFloatingToolbar.jsx`, `AdminToolbarSearch.jsx`, `AdminToolbarFilters.jsx`, `context/SearchContext.jsx`, `hooks/useSavedViews.js` | Kit | |
| `admin/AdminSidePanel.jsx`, `ActivityPanel.jsx`, `useActivityPanel.jsx` | Kit | |
| `admin/AdminListPanel.jsx`, `AdminPagination.jsx`, `AdminBulkActions.jsx`, `hooks/useFilteredItems.js` | Kit | |
| `admin/AdminCard`, `AdminInput`, `AdminModal`, `EditableFieldset`, `DeleteButton`, `ToggleButton`, `EmptyState`, `QueryError`, `Spinner`, `ContextMenu`, `Modal`, `Button`, `SegmentedControl`, `Skeleton`, `Loader`, `TabbedTwoColumn` | Kit (`@okjt/ui`) | Primitives |
| `admin/ConfirmHost.jsx`, `utils/feedback.jsx` | Kit (`@okjt/ui`) | `confirmAction()`, toasts |
| `hooks/useAdminAction.js`, `useCrudHandlers.js`, `useUnsavedChangesGuard.js`, `admin/UnsavedChangesStatus.jsx` | Kit | One way to save: confirm, pending, toast, refresh, role |
| `hooks/useRole.js`, `utils/roles.js`, `admin/viewOnly` behaviour | Kit, after changes | Roles and labels from the server's role config |
| `admin/VersionHistoryDrawer.jsx` | Kit | |
| `context/CollaborationContext.jsx`, `admin/CollaboratorAvatars.jsx`, `hooks/usePolling.js`, `useSmartPolling.js` | Kit | Presence and "what changed" badges |
| `admin/ShareModal.jsx`, `pages/platform/Team.jsx` | Kit, after changes | Invites by email, roles from config |
| `admin/AdminTutorial.jsx` | Kit, after changes | Steps from config |
| `context/AuthContext.jsx`, `utils/passkeys.js` | Kit | |
| `pages/platform/Console.jsx` | Kit, after changes | Accounts, workspaces, audit and site photos are generic; contributions and payments are Naoa's tabs, added through config |
| `pages/platform/WeddingPicker.jsx`, `NewWedding.jsx` | Kit, after changes | Workspace picker and "new workspace" form, with the workspace's own fields from config |
| `pages/admin/AdminSettings.jsx` | Kit, after changes | Settings page with sections; a project adds its own |
| `admin/ImageUpload.jsx`, `ImportConflictModal.jsx`, `utils/assetUrl.js`, `utils/adminModules.js` | Kit | |
| `Guest*`, `Invitation*`, `EventPicker`, `RsvpProgressBar`, `WeddingPalettePicker`, `WhatsAppChecklistModal`, `TableInsertModal`, `SeatingChart`, `CheckInScanner`, the guest site | Stays | |

### Server → `okjt/laravel-kit`

| Naoa file | Verdict | Notes |
|---|---|---|
| `Tenancy/CurrentWedding.php`, `Middleware/ResolveWedding.php`, `Models/Concerns/BelongsToWedding.php` | Kit, after changes | `CurrentWorkspace`, `ResolveWorkspace`, `BelongsToWorkspace`, with the model from config |
| `Middleware/EnforceRole.php`, `EnsureSuperadmin.php` | Kit, after changes | Role names and viewer writes from config |
| `Models/Revision.php`, `Concerns/RecordsRevisions.php`, `RevisionController.php` | Kit | |
| `CollaborationController.php` (heartbeat, presence, unseen changes) | Kit | |
| `TeamController.php`, `Account.php`, invites | Kit, after changes | Only with the `full` preset |
| `AuthController`, `SocialAuthController`, `PasskeyController`, `TwoFactorController`, `EmailVerificationController` | Kit | Turned on and off in `auth` |
| `Notification.php`, `NotificationController`, `Traits/AdminNotifiable.php` | Kit | |
| `ConsoleController`, `ConsoleAuditLog` | Kit | |
| `BackupService`, `BackupController`, `CreateBackup`, `VerifyBackup` | Kit | |
| `Billing/*`, `BillingController` | Kit, after changes | Optional; plans and limits from config |
| `SiteMedia`, `SitePhotoPlacement`, `SitePhotosController`, `PageContent`, `Setting`, `Enquiry`, `Faq` | Kit | Photos the Console chooses for the public pages; editable copy; contact form |
| `Middleware/SecurityHeaders.php`, `Traits/ApiResponse.php`, `Traits/Reorderable.php`, `Traits/NormalizesUrls.php`, `Commands/Preflight.php` | Kit | |
| `Guest*`, `Invitation*`, `Event*`, `Table`, `Gift*`, `Contribution*`, `Flight*`, `Traditions`, `WeddingProvisioner` and the rest | Stays | |

## Phases

The order the earlier plan gave, with two phases added at the end. Each
extraction keeps Naoa looking and behaving exactly the same, which its
Playwright screenshot tests (53) and its Vitest and PHPUnit suites check.

| Phase | Work | Done when |
|---|---|---|
| 0 | This spec | You approve it and answer the open questions |
| 1 | `packages/` workspace, CI and publishing. `@okjt/ui` with theme tokens: Naoa's colours and fonts move from `index.css` into a config that writes the CSS variables. Naoa installs it. | Naoa's screenshots unchanged |
| 2 | `@okjt/site`; Naoa's public pages built from it | Naoa's screenshots unchanged |
| 3 | `@okjt/dashboard`; Naoa's dashboard built from it | Naoa's screenshots and tests unchanged |
| 4 | `okjt/laravel-kit`; Naoa's backend uses it | Naoa's PHPUnit suite passes unchanged |
| 5 | `create-okjt-app`: asks for name, colours, modules and role preset; writes both configs; adds the deploy-kit workflow | A new test site deployed to the VPS in under 30 minutes |
| 6 | Najenga on the kit. **(a)** Roles restructured like Naoa's. **(b)** A React app at `frontend/` on `@okjt/site` and `@okjt/dashboard`; the controllers return JSON through `laravel-kit`. Pages move one at a time: the new app serves the pages already moved while Inertia keeps the rest, until none remain. **(c)** Remove Inertia, `Components/Landing/` and the pieces the kit replaces. | Najenga's tests pass and its pages match today's screenshots, with the differences you agreed listed in the PR |

Before Phase 1 changes anything people see, we write a checklist of how
Naoa builds its pages (components, theme values, how it validates forms and
shows errors). Each extraction is checked against it.

Phase 6 is the largest single piece: Najenga has 30 controllers and 13 page
groups on Inertia, plus Tailwind 3 → 4 and React 18 → 19. Moving one page at
a time keeps Najenga deployable throughout.

## Publishing

| Package | How projects install it | Why |
|---|---|---|
| `@okjt/*` (npm) | GitHub Packages npm registry, scope `@okjt`; one read token per project in `.npmrc` and as a CI secret | Private, versioned, works with `npm ci` |
| `okjt/laravel-kit` (Composer) | A GitHub Action splits `packages/laravel-kit` into a read-only repo, `Juniortambo2628/okjt-laravel-kit`, tagged per release; projects add it as a `vcs` repository | Composer needs `composer.json` at a repository's root |

Versions follow semver. A change that would make a project edit its config
is a major version, and comes with an entry in `packages/UPGRADING.md`.

## Open questions

| # | Question | Recommendation |
|---|---|---|
| 1 | Najenga's global **manager** ("can manage projects, expenses, documents, and team members"; assigned to projects through `projects.manager_id`) | They work across many projects for one business, as Naoa's planners' staff do: make them account **staff** (`full` preset), with owner access to the projects they manage. If there is only ever one such business (Najenga's own team), the `standard` preset with them as owners of those projects is simpler. |
| 2 | Najenga's project **manager** role (edits everything, manages members) | Naoa has no such role. Make them **owners**: Naoa allows several owners per wedding and stops the last one being removed. Keep deleting a project to the owner whose `client_id` it is. |
| 3 | Can the npm packages be public? | Public on npmjs.com would remove the token setup in every project; the kit holds no secrets. Private (above) if you'd rather keep the code to yourself. |
| 4 | `okjt-app` (this repo's own site, Next.js) | Out of scope: it stays as it is. It could move to the kit later as one more project. |
| 5 | The package scope and names (`@okjt/ui`, `create-okjt-app`) | As written, unless you prefer `@okjtech`. |
