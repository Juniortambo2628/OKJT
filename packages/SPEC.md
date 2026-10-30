# OKJT Kit: specification (Phase 0)

The public pages and the dashboard that Naoa and Najenga share, as packages a
new OKJTech project installs and configures, instead of copying files from
one repository to the next.

Status: **approved** (2026-10-29). The questions are answered; see "Decisions
after review" at the end.

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
| global `manager` | account staff, with owner access to the projects they manage |
| project `owner` / `editor` / `viewer` | the same |
| project `manager` | owner (co-owner) |
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
| 1 | `packages/` workspace, CI and publishing. `@okjt/ui` with theme tokens, and Naoa's public pages and dashboard switched from hard-coded colours to those tokens (see "Phase 1: what the code showed"). | Every element's computed colours and fonts identical before and after |
| 2 | `@okjt/site`; Naoa's public pages built from it | Naoa's screenshots unchanged |
| 3 | `@okjt/dashboard`, the UI layer (the connected layer moves with Phase 4); Naoa's dashboard pages built from it | Comparison: no differences; tests pass |
| 4 | `okjt/laravel-kit` and the dashboard's connected layer (shell, header, sidebar, presence, history, sharing, sign-in, Console); Naoa uses both | Naoa's PHPUnit and Vitest suites pass; comparison: no differences |
| 5 | `create-okjt-app`: asks for name, colours, modules and role preset; writes both configs; adds the deploy-kit workflow | A new test site deployed to the VPS in under 30 minutes |
| 6 | Najenga on the kit. **(a)** Roles restructured like Naoa's. **(b)** A React app at `frontend/` on `@okjt/site` and `@okjt/dashboard`; the controllers return JSON through `laravel-kit`. Pages move one at a time: the new app serves the pages already moved while Inertia keeps the rest, until none remain. **(c)** Remove Inertia, `Components/Landing/` and the pieces the kit replaces. | Najenga's tests pass and its pages match today's screenshots, with the differences you agreed listed in the PR |

Before Phase 1 changes anything people see, we write a checklist of how
Naoa builds its pages (components, theme values, how it validates forms and
shows errors). Each extraction is checked against it.

Phase 6 is the largest single piece: Najenga has 30 controllers and 13 page
groups on Inertia, plus Tailwind 3 → 4 and React 18 → 19. Moving one page at
a time keeps Najenga deployable throughout.

## Phase 1: what the code showed

Read 2026-10-29, Naoa at `38027b8`.

**The theme in `index.css` is the guest wedding site's, not Naoa's.** Its
`@theme` block (blush, rose, warm brown; Great Vibes, Cormorant, Lato) is used
only by the guest site (85 uses, 10 files). Naoa's public pages and dashboard,
the two parts the kit takes, use no theme entry at all (0 uses in
`components/marketing`, `pages/platform`, `components/admin`, `pages/admin`).
They write colours by hand:

| Area | Files | Hand-written hex | Tailwind palette |
|---|---|---|---|
| Public pages | 35 | 745 uses, 35 shades | `white` 235; status red/green/amber 34 |
| Dashboard | 71 | 528 uses, 35 shades | `stone` 1,097 (steps 50–900); status red/green/amber 191 |

So Phase 1 introduces the tokens and switches about 2,400 class names in about
105 files to them. The switch is mechanical, one exact class name at a time,
and checked by comparing every element's computed colours before and after.

### Tokens, with Naoa's values

One token per shade, at the value written today, so nothing Naoa shows changes.

| Token | Naoa value | Uses (public + dashboard) |
|---|---|---|
| `ink` | `#2B221C` | 161 + 7 |
| `ink-deep` | `#1F1813` | 14 + 0 |
| `body` | `#4A3F35` | 91 + 42 |
| `soft` | `#6B5D52` | 58 + 6 |
| `muted` | `#8B7B6B` | 83 + 14 |
| `faint` | `#A68B76` | 12 + 4 |
| `accent` | `#A67B5B` | 62 + 376 |
| `accent-strong` | `#A06A47` | 24 + 5 |
| `accent-dark` | `#8B5E3C` | 0 + 15 |
| `accent-soft` | `#C8A68E` | 30 + 2 |
| `line` | `#E8DDD3` | 62 + 2 |
| `line-strong` | `#D9CBBE` | 15 + 0 |
| `tint` | `#F3EDE7` | 26 + 1 |
| `paper` | `#FBF8F5` | 14 + 2 |
| `paper-warm` | `#FAF7F2` | 0 + 13 |
| `positive` | `#7C8B6A` | 11 + 0 |
| `positive-dark` | `#56634A` | 7 + 0 |
| `tone-50` … `tone-950` | Tailwind `stone` | 0 + 1,097 |

Shadows written as `rgba(43,34,28,a)` are `ink` at that strength (20 uses), and
`rgba(166,123,91,a)` is `accent` (7); both are rewritten from their token.
Fonts: `display` (Manrope, public pages) and `sans` (Lato, everywhere).

### Left as they are in Phase 1

* Status colours (Tailwind red, green and amber): they mean a state, not the brand.
* Six near-identical pale tints (`#F0E8E0` 12, `#EFE6DD` 12, `#EFE7E0` 10,
  `#F7F2ED` 9, `#F4EFEA` 7, `#FBF3EC` 4), and 23 shades used three times or
  fewer: hand-written until the decision below.
* Text sizes `text-[9px]`/`[10px]`/`[11px]` (185 uses) and letter-spacing
  literals: type, not colour.
* The guest site's `@theme` block and the global `body`, `h1`–`h3` and `p`
  colours in `index.css`. They belong to the guest site; the public pages
  override them with `!` (24 places), which the kit's pages will not need.

### Decision (answered 2026-10-29: merge them, see "Decided")

Fold the six near-identical tints, and the rare shades, into the nearest token?
The difference is too small to see, but it is not zero, so screenshots of the
pages concerned (28 files) change and get new baselines in the same PR. A new
project then sets about 17 colours instead of about 40.

### Phase 1 tasks

Status: unticked is to do, ticked is done; a parked task says why. Each task
carries the checklist it is checked against, because a task may be handed to
someone who has only that task. The check is never run by whoever made the
change.

The checklist is a snapshot of Naoa at `38027b8`, read 2026-10-29; where it
and the code disagree, the code wins and the checklist is worked out again.

- [x] **1.1 The comparison tool**: `packages/ui/tools/style-snapshot.mjs`, a
      Playwright script that opens each route given to it, at desktop width
      (1280) and phone width (390), with the API answered from fixtures, and
      writes every visible element's computed `color`, `background-color`,
      `background-image`, border colours, `box-shadow`, `outline-color`, `fill`,
      `stroke` and `font-family` to JSON, plus a full-page screenshot. A second
      command compares two snapshots and lists every element that differs. It
      lives in the kit because Najenga's migration (Phase 6) needs the same proof.
- [x] **1.2 Calibrate the comparison.** On a scratch copy of Naoa outside the
      checkout, someone other than the person checking changes one class to a
      neighbouring shade (`text-[#4A3F35]` → `text-[#4A3F36]` in one marketing
      component) and one `stone-200` to `stone-300` on one dashboard page.
      The checker is told only that something differs. Passed when both are
      reported with their route and element. If either is missed, stop: the
      check is blind to it.
- [x] **1.3 `packages/` workspace and `@okjt/ui`**: npm workspaces under
      `packages/`; `defineConfig()`; a theme compiler that turns `theme` into a
      Tailwind 4 `@theme` block (`--color-*`, `--font-*`, `--shadow-*`) written
      to a CSS file the app imports; the token names in the table above as the
      kit's names; unit tests; `packages-ci.yml` (lint, test, build on pull
      requests) and `packages-release.yml` (publish on `v*` tags with
      `NPM_TOKEN`).
- [x] **1.4 Naoa takes `@okjt/ui`**: `frontend/okjt.config.js` with the
      values in the table above; the generated theme imported in `index.css`
      straight after `tailwindcss`, the guest site's `@theme` block left as it
      is. Installed from the local checkout until the first release.
      Checklist: no class name changes yet; snapshot of every route identical
      to the baseline taken before this task.
- [x] **1.5 Shared pieces first**: `components/marketing/ui.jsx` (button
      variants, `Eyebrow`, `Badge`, `SectionHeading`), `components/Button.jsx`,
      and the dashboard pieces the pages wrap themselves in (`AdminShell`,
      `Sidebar`, `Header`, `AdminPageHero`, `AdminSummaryCards`, `StatCard`,
      `AdminCard`, `AdminFloatingToolbar`, `AdminSidePanel`, `AdminModal`,
      `ConfirmHost`). Checklist below.
- [x] **1.6 Public pages**: the rest of `components/marketing/` and
      `pages/platform/` (35 files in all, with 1.5's). Checked on `/`,
      `/features`, `/for-couples`, `/for-planners`, `/traditions`, one
      `/traditions/:slug`, one `/plan/:tradition`, `/sign-up`, `/sign-in`,
      `/terms`, `/privacy`, `/community-guidelines`, `/weddings`,
      `/new-wedding`, `/billing`, `/team`, `/console`. Checklist below.
- [x] **1.7 Dashboard**: the rest of `components/admin/` and `pages/admin/`
      (71 files in all, with 1.5's). Checked on every page in
      `frontend/tests/visual/helpers/admin-pages.js`, plus the sign-in page and
      the invitation designer. Checklist below.
- [x] **1.8 Fold near-identical tints and rare shades into tokens**: released by
      the decision below. 102 uses in 39 files; the shades that are a different
      colour, not a variant of a token, kept as written (see "Phase 1: result").
- [ ] **1.9 Close Phase 1**: Naoa's PR reviewed and merged; this PR merged and
      `@okjt/ui` 0.1.0 published. Naoa does not need the package to build:
      it commits the generated `src/okjt-theme.css`. Once 0.1.0 is on npm, Naoa
      adds it as a dev dependency and runs `okjt-theme --check` in CI.

**Checklist carried by 1.5, 1.6 and 1.7** (1.4 carries its own line above):

- [ ] each hand-written colour in the token table becomes its token at the same
      value (`text-[#A67B5B]` → `text-accent`), opacity kept
      (`bg-[#2B221C]/5` → `bg-ink/5`): one token per shade, as the table says
- [ ] dashboard `stone-N` becomes `tone-N`, same step: 1,097 uses, 71 files
- [ ] `rgba(43,34,28,a)` in shadows written from `ink`, `rgba(166,123,91,a)`
      from `accent`, same strength
- [ ] a colour a shared piece sets is changed in the shared piece once (1.5),
      never repeated in the pages that use it
- [ ] left as written: status red, green and amber; the six near-identical tints
      and the 23 rare shades (until 1.8); `text-[9px]`/`[10px]`/`[11px]` and
      letter spacing; the `!` overrides of the guest site's global colours
- [ ] the guest site (`components/` outside `admin/` and `marketing/`,
      `pages/` outside `admin/` and `platform/`, 44 files) is not touched
- [ ] proof: 1.1's comparison over the task's routes, both widths, reports no
      element that differs from the baseline taken before Phase 1, and Naoa's
      Vitest suite passes

### Phase 1: result

* **Token names**: as in the table, except the grey ramp is `tone`, not
  `base`: `text-base` is already Tailwind's font size.
* **Proof**: 41 routes (public pages, sign-in, Console, dashboard, two guest
  pages) at 1280 and 390 px, 13,661 elements each width. Two baseline runs
  with no change: identical. Calibration: a one-unit change to one text colour
  on the home page and a one-step grey change in the dashboard header were
  both reported (the header on all 21 dashboard pages). After 1.4–1.7:
  identical. After 1.8: every difference is one of the planned folds.
* **Found while switching**:
  * Naoa darkens `stone-400`/`stone-500` inside the dashboard (`.admin-theme`,
    for contrast on white). The comparison caught it: `tone` had Tailwind's
    lighter values. The dashboard now darkens `tone-400`/`500` too (and keeps
    `stone-400`/`500` for wedding-only components that still use stone). This
    belongs to `@okjt/dashboard` (Phase 3).
  * The guest site's global `p`, `h1`–`h3` and `body` colours in `index.css`
    are unlayered, so they beat any colour class on those elements, on every
    page: `text-stone-400` on a dashboard paragraph renders `#6B5D52`. The
    public pages work around it with `!`. The kit's pages must not inherit
    them: in Phase 2 they move under the guest site's own wrapper. That changes
    what some paragraphs show (to the colour their class names), so it gets its
    own comparison and review.
  * Colours set in JavaScript (charts, the invitation designer, budget
    categories: about 150 strings) are not classes and were not switched. Most
    are wedding-only; the kit's charts take theirs from the tokens when they
    are extracted (Phase 3).
  * Two of Naoa's dashboard screenshot tests (the sign-in page) already failed
    before this work: their baselines are out of date. Left for Naoa to refresh.
* **Kept as written** (a different colour, not a variant of a token): the
  sign-in panel's orange gradient and focus ring, the browser-window dots in the
  product screenshots' frames, Billing's error red, one sidebar badge, the WhatsApp
  preview bubble. 19 uses.

### Decided

- "go ahead, merge them" (2026-10-29): fold the near-identical and rare shades
  into their nearest token. Released 1.8.

## Phase 2: `@okjt/site`

Read 2026-10-29, Naoa at `218950a` (Phase 1 applied).

### What the code showed

The public pages already keep most of their words and pictures in config
(`config/marketing.js`, `config/journeys.js`, `config/legal.js`). The building
blocks reach into Naoa in eight places, and each becomes a setting a project
passes to `<SiteProvider site={…}>`:

| Building block reaches for | Becomes `site.…` |
|---|---|
| `useAuth()` (signed in?) in the nav and footer | `useAccount()`: `{ signedIn }`, plus the account links and their labels |
| `MARKETING_NAV`, the traditions mega menu | `nav` items; an item may carry its own `mega` menu (desktop and phone components) |
| `FOOTER_COLUMNS`, `PROMISES`, the closing call to action, the "naoa." watermark, `LEGAL` | `footer` |
| `/brand/naoa-logo-*.png`, "Naoa home" | `brand` |
| `useSitePhotos()`, `photoUrl()`, `PHOTOS` (the Console's picture choices) | `usePhotos()`: `{ url(key, width), alt(key) }`, and `usePlaces()` |
| `MEDIA` (product screens and clips) | `media` |
| `Seo`'s page titles, private paths, the traditions lookup | `seo` |
| Billing API and plan copy in `Pricing` | stays in Naoa; the kit's `PricingSection` takes the plans as props |

`site` is a JavaScript module of the app (`src/site.config.jsx`), not part of
`okjt.config.js`: it holds components and hooks, and `okjt.config.js` must
stay readable by the `okjt-theme` command in Node.

**Moves to the kit**: `ui.jsx` (Container, Logo, PillLink, Eyebrow, Chip,
SectionHeading), `MarketingLayout` (as `SiteLayout`), `MarketingNav`,
`MarketingFooter`, `Seo`, `Photo`, `PhotoHero` and `HeroOrnament`, `ImageCard`,
`MediaFrame` and `MediaFill`, `FeatureExplorer`, `ShowcaseCarousel`,
`SectionNav` and `useScrollSpy`, `FaqSection`, `RollingWord` and `useRolling`,
the presentational half of `Pricing`, `LegalPage`, and the pieces Features and
the journeys are made of (`FeatureGroup`, `JourneyGlance`, `JourneyChapter`).

**Stays in Naoa** (it imports the kit's pieces): the pages themselves (each is
a short composition of sections), `TraditionFinder`, `TraditionsMenu`,
`PlanDemo`, `EssentialElements`, `CommunityNotes`, `SuggestedCommunities`,
`GuestPreview`, `ModuleSwitcher` (it previews a wedding website),
`PhraseCaption` (it names Kenyan languages), `LegalNote`, `UnconfirmedBadge`,
and `usePlans`/`costAnswer`.

Full page templates built from config wait for Phase 5: the installer writes
a new project's pages from these sections, which is where a template earns its
keep.

### Changed from the plan

* **The guest site's global `p`/`h1`–`h3`/`body` colours stay for now.** Kit
  components keep their `!` overrides, which hold whatever global CSS the
  host app has. Scoping those globals to the guest site changes what dashboard
  paragraphs show (they would take the colour their class names ask for, which
  they never have). That is a visible change, so it becomes its own step with
  its own before/after review, not part of a move that must change nothing.
* **Naoa can't install `@okjt/site` until it is on npm.** The Naoa change is
  built and proven against the packed package, and its CI can't pass until
  `@okjt/site` 0.1.0 is published (npm organisation and `NPM_TOKEN`).

### Phase 2 tasks

Checked like Phase 1: the style comparison over the same 41 routes at 1280 and
390 px, against the state before the task, by the tool, not by whoever moved
the code. A move changes nothing on screen, so the expected result is no
differences.

**Checklist carried by every task below** (snapshot of Naoa at `218950a`,
2026-10-29; the code wins where they disagree):

- [ ] markup and class names move unchanged: same elements, same order, same
      classes (the comparison keys elements by their DOM path, so a wrapper
      added or lost shows up)
- [ ] every Naoa word, link, logo, photo and screen reaches the kit through
      `site`, never written into kit code
- [ ] photos through `site.usePhotos()`/`site.usePlaces()`, screens through
      `site.media`, signed-in state through `site.useAccount()`
- [ ] the `!` overrides on headings stay (host apps may style `h1`–`h3`)
- [ ] Tailwind sees the kit's classes (`@source` on the package's `dist/`)
- [ ] Naoa's wedding-only sections import the kit's pieces; none is copied
- [ ] Naoa's Vitest suite, lint and build pass; comparison: no differences

- [x] **2.1 `packages/site`**: the components above, compiled to `dist/` with
      esbuild (JSX → JS, one file per module, no bundling), peer dependencies
      `react`, `react-router-dom`, `framer-motion`, `lucide-react`;
      `SiteProvider`/`useSite`; README with the `site` settings.
- [x] **2.2 Naoa's `site.config.jsx`** and `<SiteProvider>` at the app's root.
- [x] **2.3 Naoa's public pages and wedding-only sections import the kit**;
      the moved files are deleted; tests updated to the new imports.
- [ ] **2.4 Close Phase 2**: publish `@okjt/site` 0.1.0, then Naoa's
      `package.json`/lockfile name the published version.


### Phase 2: result

* `@okjt/site` 0.1.0: 21 modules, compiled with esbuild; tests check the
  build and that no project's words are in the kit.
* Naoa: 16 files moved out, `site.config.jsx` added, 25 files import the kit,
  8 test files render through `SiteProvider` with Naoa's own settings.
  Vitest 260/260, lint and build pass.
* Comparison against Phase 1's result, 41 routes at 1280 and 390 px: no
  differences. Page titles and meta tags (title, description, robots,
  canonical, Open Graph, Twitter) on 14 routes, including a community page
  and an unknown one: identical.
* Waiting on: `@okjt/site` on npm (2.4).

## Phase 3: `@okjt/dashboard`

Read 2026-10-29, Naoa at `56c2196` (Phases 1 and 2 applied).

### What the code showed

Naoa's dashboard pieces fall into two layers:

| Layer | Pieces | Reaches into Naoa for |
|---|---|---|
| **UI** | primitives (Button, Modal, Overlay, SegmentedControl, Skeleton, Loader, Spinner, ContextMenu), confirm dialogs and toasts, page layout, hero, summary cards, floating toolbar with search and filters, side panel, list panel, pagination, bulk actions, cards, inputs, toggles, empty and error states, unsaved-changes guard, tutorial, `useAdminAction` | the person's permissions (`useRole`), the panel a page without one gets (the activity panel), what to refresh after a save (presence), the breadcrumb's home, the tutorial's steps |
| **Connected** | shell, header, sidebar, account menu, presence and "what changed", activity panel, version history, sharing and invites, sign-in pages, Console, team, workspace picker | Naoa's API (`services/api`), `AuthContext`, `CollaborationContext` |

The connected layer is the client half of what `okjt/laravel-kit` (Phase 4)
serves. Extracting it before that API exists would mean designing its calls
twice, so **it moves in Phase 4, together with the server side**. Phase 3
takes the UI layer, which is what every page is built from.

The UI layer has almost nothing Naoa-specific in it: the breadcrumb's home
(`/admin/dashboard`), the tutorial's steps, and `bulkActionPresets`, which
nothing uses (it stays behind).

### Where things go

* `@okjt/ui` (now also React, peer dependencies optional for the theme
  command): `Button` and `buttonStyles`, `Overlay`, `Modal`, `SegmentedControl`,
  `Skeleton`, `Loader`, `Spinner`, `ContextMenu`, `useDismiss`, the feedback
  helpers (`confirmAction`, `promptAction`, `notifySuccess`, `notifyError`,
  `notifyUndo`) and `ConfirmHost`, and **`PermissionsProvider`/`usePermissions`**:
  `{ role, isOwner, canEdit }`, everything allowed outside a provider (Naoa's
  `useRole` behaves the same way today).
* `@okjt/dashboard`: **`DashboardProvider`** with `home` (the breadcrumb's
  first crumb), `useDefaultPanel()` and `useAfterChange()`; the page layout,
  hero and chrome context, summary cards and `StatCard`, the floating toolbar,
  search and filters, side panel, list panel, pagination, bulk actions,
  `AdminCard`, `AdminInput`, `AdminModal`, `EditableFieldset`, `DeleteButton`,
  `ToggleButton`, `EmptyState`, `QueryError`, `UnsavedChangesStatus`,
  `AdminTutorial` (steps as a prop), `useAdminAction`, `useCrudHandlers`,
  `useUnsavedChangesGuard`, `useFilteredItems`, `useSavedViews`.
* Names stay as they are in Naoa (`AdminPageLayout`, `AdminPageHero`…), so
  the 71 dashboard files change only their imports.
* Their tests move with them and run in the kit (Vitest, jsdom).

### Phase 3 tasks

Checked like Phases 1 and 2: the comparison over the same 41 routes at both
widths, against the state before, by the tool. Expected: no differences.

**Checklist carried by every task below** (snapshot of Naoa at `56c2196`,
2026-10-29; the code wins where they disagree):

- [ ] markup and class names move unchanged (the comparison keys elements by
      DOM path)
- [ ] a component that hid or disabled controls for viewers still does, through
      `usePermissions()`, fed by Naoa's own `useRole`
- [ ] pages without a panel still get Naoa's activity panel, through
      `useDefaultPanel`; a save still refreshes presence, through `useAfterChange`
- [ ] the moved tests pass in the kit; Naoa's remaining tests pass
- [ ] Naoa's lint and build pass; comparison: no differences

- [x] **3.1 `@okjt/ui` primitives and permissions**, with their tests.
- [x] **3.2 `packages/dashboard`**, with its tests and README.
- [x] **3.3 Naoa**: `PermissionsProvider` and `DashboardProvider` at the app's
      root, the 71 files import the kit, the moved files deleted.
- [ ] **3.4 Close Phase 3**: both packages published, Naoa's lockfile updated.

### Phase 3: result

* `@okjt/ui` 0.1.0 gains 12 React modules and permissions; `@okjt/dashboard`
  0.1.0: 30 modules and `DashboardProvider`.
* 79 tests moved from Naoa with their components and pass in the kit, plus
  3 new ones for `DashboardProvider` (82 component tests, plus the theme and
  build tests). Naoa: 58 files moved out, 102 import the kit; its remaining
  181 tests, lint and build pass.
* Comparison against Phase 2's result, 41 routes at 1280 and 390 px: no
  differences. The confirm dialog's module is bundled once and shared by
  Naoa's code and the kit's (a duplicate would leave confirms unanswered).
* `useAdminAction` still invalidates the `['revisions']` query after a save:
  that is version history, which arrives with Phase 4; harmless where a
  project has none.
* The packages workspace installs with `legacy-peer-deps` (`packages/.npmrc`):
  npm 10 crashes resolving the kit's peers against the workspace's own copies.
  Projects installing the packages are unaffected.
* Waiting on: publishing (3.4).

## Phase 4: `okjt/laravel-kit` and the connected dashboard

Read 2026-10-29, Naoa at `0eabc02`.

### What the code showed

The server side is wedding-shaped all the way down: a `wedding_id` column on
28 models (`BelongsToWedding`), `CurrentWedding` used in 46 files, the
`X-Wedding` header, `wedding_user` for roles, open routes and viewer writes
hard-coded in the middleware, and messages that name the wedding. All of it
becomes settings (`config/okjt.php`); Naoa's classes stay as thin subclasses
and traits under their old names, so none of those 46 files change.

Phase 4 is three steps, each proven by Naoa's own test suites:

| Step | Takes | Status |
|---|---|---|
| **4a** | Server core: workspace scoping (`CurrentWorkspace`, `BelongsToWorkspace`, `ResolveWorkspace`), roles (`EnforceRole`, `EnsureSuperadmin`, `HasWorkspaceRoles`), version history (`Revision`, `RecordsRevisions`, `RevisionController`), `ApiResponse`, publishable migrations | done |
| **4b** | Collaboration, both halves: presence and "what changed" (heartbeat, module visits), collaborators and invitations (invite, accept, change role, remove), and the dashboard's connected layer: `CollaborationProvider`, avatars, activity panel, version-history drawer, share dialog. Then the shell (header, sidebar, account menu) | collaboration done; shell next |
| **4c** | Accounts and sign-in: sign-in and sign-up, Google, passkeys, two-step verification, email verification, teams/accounts, Console, backups, notifications; billing as an optional module | after 4b |

### Phase 4a: result

* `okjt/laravel-kit` 0.1.0: 13 classes, config, two publishable migrations,
  11 tests (49 assertions) on Orchestra Testbench: scoping, open routes,
  unpublished and inactive workspaces, roles and viewer writes, superadmins,
  per-workspace roles, recording, merging, restoring, another workspace's
  history not found, nothing recorded during migrations.
* Naoa: 12 files become wrappers or lose code to the kit, `config/okjt.php`
  added with every name, route list and message as it was. All 367 backend
  tests (1,586 assertions) pass unchanged, as before the change; Pint passes.
* Composer installs the kit from its mirror,
  `Juniortambo2628/okjt-laravel-kit`, which `packages-release.yml` fills on
  every `v*` tag (`git subtree split`). Naoa's lockfile is updated after the
  first release.
* Composer reports 72 security advisories in 20 of Naoa's existing
  dependencies (not the kit's): worth a separate `composer audit` pass.

### Phase 4b: result so far

* Server: `CollaborationController` in the kit, with the parts that are
  Naoa's (plan limit, invitation email, links, sign-in answer) as methods
  Naoa overrides; `DELETE /collaborators/{user}` added for projects without
  their own way to remove access. Kit: 16 tests. Naoa: 367 backend tests
  pass unchanged.
* Client: presence, avatars, activity panel, version history and sharing in
  `@okjt/dashboard`, talking to the kit's endpoints through the project's
  API client. Kit: 66 dashboard tests. Naoa: 181 tests, lint and build pass;
  comparison over 41 routes at both widths: no differences.
* The comparison flagged the home page once: its hero photo was caught
  mid cross-fade on a slow run (two pictures for a moment). A rerun matched.
  Untouched by this step; noted because a slow machine can do it again.
* The shell followed: `DashboardShell`, `DashboardSidebar` and
  `DashboardHeader` in `@okjt/dashboard`, set up through the `shell` part of
  the dashboard settings (logo, navigation, quick links, backgrounds, the
  banner, notifications and account menu slots). Naoa's `dashboard.config.js`
  holds its exact colours and navigation; the account menu stays in Naoa
  for now. Comparison: no differences.

### Phase 4c: result so far

* Server, in the kit, each with the parts that are the project's as methods
  it overrides: `AuthController` (sign in, two-step code, sign up, sign out,
  who you are), `TwoFactorController`, `EmailVerificationController`,
  `NotificationController` and the `NotifiesWorkspace` trait,
  `SocialAuthController` (Google, needs `laravel/socialite`; a first sign-in
  calls `joined()` so the project can create an account) and
  `PasskeyController` (needs `laravel/passkeys`). What every way of signing
  in hands back is one method, `signedIn()` (`SignsPeopleIn`); Naoa adds its
  weddings once, in a trait its controllers share. Kit: 27 tests, 157
  assertions. Naoa: 367 backend tests pass unchanged.
* Client: sign-in state (`AuthProvider`/`useAuth`, with `extend` for what a
  project adds), the notifications bell, the Google button and the passkey
  client (`loginWithPasskey`, `registerPasskey`, `passkeysSupported`) in
  `@okjt/dashboard`. Kit: 77 dashboard tests. Naoa: 181 tests, lint and
  build pass; comparison over 41 routes at both widths: no differences.
* Backups: `BackupService` (every table to JSON in a zip, so it works on
  shared hosting without database tools; restore after a safety backup;
  verify into a throwaway database; off-site copies to a disk or by email),
  `BackupController`, and the `backups:create` / `backups:verify` commands.
  Naoa's `BackupService` is a subclass with its upload folders, its
  off-site settings and the step that brings old backups up to today's
  guest lists. Kit: 34 tests, 185 assertions. Naoa: 367 backend tests pass.
* The Console: `ConsoleController` (every workspace, found by name or
  address; suspend, reactivate or archive with a reason; delete for good
  after typing its address; the audit log) and the `AuditLog` model, whose
  subject type is the record's class name. Naoa's Console extends it and
  keeps accounts, plans and payments; its audit log is a subclass. Kit: 38
  tests, 214 assertions. Naoa: 367 backend tests pass.
* Next in 4c: teams and accounts. They need an accounts layer in the kit
  (a business that owns many workspaces, with staff on all or some of
  them), which Najenga needs too (its global manager becomes account
  staff). Then billing as an optional module; the sign-in pages and the
  account menu after that.

## Publishing

All packages are public. **Released: v0.1.0** (30 October 2026):
`@okjt/ui`, `@okjt/site` and `@okjt/dashboard` 0.1.0 on npm, and
`okjt/laravel-kit` v0.1.0 in `Juniortambo2628/okjt-laravel-kit`, listed on
Packagist (auto-updated from new tags). Naoa's lockfiles use them. To retry the Composer copy for an existing tag, run
**Packages release** by hand from the Actions tab with that tag.

| Package | Where | How it gets there |
|---|---|---|
| `@okjt/*` (npm) | npmjs.com, organisation `okjt` | `packages-release.yml`: a `v*` tag publishes every package whose version changed, with the `NPM_TOKEN` secret |
| `okjt/laravel-kit` (Composer) | Packagist | A GitHub Action splits `packages/laravel-kit` into `Juniortambo2628/okjt-laravel-kit` (Composer needs `composer.json` at a repository's root) and tags it; Packagist picks the tag up |

Versions follow semver. A change that makes a project edit its config is a
major version, and comes with an entry in `packages/UPGRADING.md`.

### What only you can do (once)

**npm** (the three JavaScript packages):

1. On npmjs.com: profile picture → **Add Organization** → name **okjt** →
   **Unlimited public packages** (free) → Create.
2. Profile picture → **Access Tokens** → **Generate New Token** → granular
   token: packages and scopes **Read and write**, organisation **okjt**,
   the shortest expiry that covers the first release (write tokens last at
   most 90 days).
3. In this repository: Settings → Secrets and variables → Actions → **New
   repository secret** `NPM_TOKEN`, the token as its value.
4. After the first release: on each package's page on npmjs.com, Settings →
   **Trusted Publisher** → GitHub Actions → `Juniortambo2628` / `OKJT` /
   `packages-release.yml`. Set it up shortly before the next release: a
   trusted publisher that hasn't published within 2 days expires. Then delete
   `NPM_TOKEN` and the token.

**Composer** (the PHP package):

5. Create an empty public repository **Juniortambo2628/okjt-laravel-kit** (no
   README, no licence: the release fills it).
6. Create a fine-grained GitHub token with access to that repository only,
   permission **Contents: Read and write**, and add it here as the secret
   `SPLIT_TOKEN`.
7. Optional: submit the repository on packagist.org, so projects need no
   `repositories` entry.

**Release**: merge the kit into `main`, then push a tag:
`git tag v0.1.0 && git push origin v0.1.0`. After it succeeds, update
Naoa's lockfiles (`npm install` in `frontend/`, `composer update
okjt/laravel-kit` in `backend/`).

## Decisions after review

| # | Question | Decision |
|---|---|---|
| 1 | Najenga's global **manager** | Account **staff** (`full` preset), with owner access to the projects they manage (`projects.manager_id`) |
| 2 | Najenga's project **manager** role | Becomes **owner** (co-owner). Deleting a project stays with the owner whose `client_id` it is. |
| 3 | Public or private | **Public**: npmjs.com and Packagist |
| 4 | Names | Scope **`@okjt`**: `@okjt/ui`, `@okjt/site`, `@okjt/dashboard`, `create-okjt-app`; Composer `okjt/laravel-kit` |
| — | `okjt-app` (Next.js) | Out of scope for now |
