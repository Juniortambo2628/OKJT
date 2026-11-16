# OKJT kit: consolidation plan (Phase 7)

Status: **approved** (2026-11-15), with the recommendations in section 7. R1's kit
changes are built (kit 0.5); see R1 below.

Since the kit reached v0.4 (2 November), the projects have kept moving: bugs
fixed, pages reworked for phones, and whole features added (M-Pesa, privacy,
media libraries, installable sites). Most of that work happened inside one
project, so the others don't get it. Some of it repeats work another project
already did. This plan lists what should move into the shared packages, what
stays where it is, and the order to do it in. The goal is that a fix or feature
built once reaches Naoa, Najenga, Tena-host, TFE, naoa-dt, okjt-app and every
project `create-okjt-app` makes later.

Read on 2026-11-15, at: OKJT `ed2d1f6`, Naoa `e0a8045`, Najenga `eb8f951`,
Tena-host `98f457d`, TFE `0148216`, naoa-dt `5957b2b`.

---

## 1. Where each project stands

| Project | Stack | Kit it uses | How much of the UI is the kit |
|---|---|---|---|
| **Naoa** | Laravel 12 API + React 19 SPA, Tailwind 4 | site `^0.1`, dashboard `^0.4`, ui `^0.2.1`, laravel-kit `^0.4` | Public pages, dashboard frame, sign-in, collaboration. The kit came from here. |
| **Najenga** | Laravel 12 + React 19 SPA (`frontend/`), Tailwind 4 | the same versions | Public pages, shell, page layout, toolbar, list and side panels, sign-in. Still has its own copies of about 15 kit pieces (`docs/plan-kit-6d.md`). |
| **okjt-app** | Laravel 11 API + React SPA | `file:` links to `packages/` | Public site and admin, always on the kit's latest commit. |
| **Tena-host** | Laravel 12 + **Inertia** + **React 18**, Tailwind 4 | site `^0.1`, ui `^0.2.1` | Only the v2 public pages, through its own Inertia ↔ React Router bridge (`Components/V2/V2Site.jsx`). Its dashboard is its own. |
| **TFE** | Laravel 12 + **Inertia** + React 19, **Tailwind 3** + Bootstrap utilities | none | None. It rebuilt Naoa's toolbar, side panel and Najenga's landing structure by hand, because the kit needs Tailwind 4 and react-router (`docs/meetings/2026-11-02-ux-review-plan.md`). |
| **naoa-dt** | Laravel 12 API + React 19 SPA, Tailwind 4 | none | None. It is the single-wedding app Naoa started as, so it still has its own copies of the 73 dashboard files that became the kit. |

Two things stand out:

* **The packages are behind the projects that use them.** `@okjt/site` 0.2.0
  is released, but Naoa, Najenga and Tena-host all ask for `^0.1.0`, and in
  0.x `^0.1.0` never installs 0.2. They won't get any `site` fix until each
  one raises its version range by hand.
* **Two of the six projects can't use the kit at all**, and a third can use
  only a sliver of it. The reason is how the kit is built (react-router
  imported directly in 22 modules; Tailwind 4 `@source`), not anything about
  those projects. Until that changes, their good work can't come back to the
  kit, and the kit's work can't reach them.

---

## 2. Rules for this phase

These are the rules `SPEC.md` already follows, kept for this phase:

1. **Nothing changes on screen unless the project asks for it.** A new look
   or behaviour is an option. Its default is what the kit does today. Each
   change is proven with `@okjt/ui/tools/style-snapshot.mjs` on Naoa's 41
   routes and Najenga's 50 pages, at 1280 and 390 px.
2. **New features start switched off** (the Tena-host and Naoa pattern).
   Anything involving payments, sign-in or personal data waits for Kevin's
   approval.
3. **One kit change per PR, and a release after each group.** A consumer
   update is a separate PR in that project, and it deletes the local copy the
   kit has replaced. A change a project has to make by hand bumps the
   version and gets an entry in `UPGRADING.md`.
4. **Lift, don't rewrite.** Take the version that has already been through
   tests and real users, plus its tests, and generalise only what is
   project-specific.

---

## 3. What was found, and where it goes

Priority: **P1** fixes a bug or a gap a project is blocked on. **P2** has been
built twice or more, or a second project needs it. **P3** is good to share,
but only one project needs it now.

### 3a. Bugs and gaps in pieces the kit already has

| # | Kit piece | Found in | Gap | P |
|---|---|---|---|---|
| G1 | `@okjt/ui` `Modal` | Najenga 6d | Widths stop at `5xl` (previews need `7xl`, and full screen). The close button can't be turned off, so a dialog with its own header shows two. No title, tabs or footer slots. | P1 |
| G2 | `@okjt/dashboard` `AdminInput` / `AdminSelect` / `AdminTextarea` | Najenga 6d | No background of their own, so `@tailwindcss/forms` turns them white on dark dashboards. No `ref` forwarding. Label and error are built in, with no way to use the field alone. | P1 |
| G3 | `useUnsavedChangesGuard` | Najenga 6d | Catches link clicks but not the router's own navigations. No "Unsaved changes" chip in the header. Najenga's version does both: lift it. | P1 |
| G4 | `useFilteredItems` | Najenga 6d | Searches every field. Can't limit to chosen fields, add a project filter or sort. Najenga's version does: lift it. | P2 |
| G5 | `ContextMenu` | Najenga #87 | Items must use `onSelect`. An item written with `onClick` silently does nothing, which is what broke Najenga's right-click menu. Accept `onClick` as another name for it, and warn in development about unknown keys. Also check that focus goes back to the button that opened the menu (Najenga's adapter still does this itself). | P1 |
| G6 | `NotificationsBell` | Najenga 6d.6 | Expects `{title, message, link, icon}` at the top level of each notification and only offers "mark all read". Laravel's database notifications keep those under `data`, and need marking one at a time. Add a `normalize` option and per-item marking. | P2 |
| G7 | `AdminTutorial` | Najenga 6d.6 | Finds steps only by id. Has no "open" state, doesn't skip steps whose element isn't on screen, and doesn't respond to arrow keys. | P2 |
| G8 | Text size | Tena-host `V2Site.css` | Small labels are 9 to 11 px, set in 35 places in the kit. Tena-host overrides them to 12 px, and TFE's accessibility tests would fail them too. Add a theme minimum (`type.minText`, default unchanged) and use it everywhere. | P2 |
| G9 | `PasskeyController` (laravel-kit) | TFE Sprint 48 | Catches nothing. If a stored passkey can't be decrypted (for example after an `APP_KEY` change), the request fails with a bare 500 and nothing in the log. TFE turns this into a 422 with a clear message and switches off the bad passkey. Bring that behaviour across, with TFE's test. | P1 |
| G10 | `useAdminAction` | Najenga 6d.5 | Every page test needs a TanStack Query client, and it always refreshes the history queries. Make both optional. | P3 |
| G11 | Version ranges | all | Consumers ask for `^0.1` / `^0.2.1`, which in 0.x misses 0.2 releases. Release a `1.0` once R1 and R2 have landed, so that caret ranges pick up later fixes by themselves. | P1 |

### 3b. Front-end pieces built in a project that belong in the kit

| # | What | Built in (and repeated in) | Goes to | P |
|---|---|---|---|---|
| F1 | **Reload once after a deploy** (when the browser asks for code files the new release has removed) | Naoa `main.jsx`; naoa-dt `utils/chunkReload.js` with tests | `@okjt/ui` `installChunkReload()`; create-app calls it | P1 |
| F2 | **One dialog with title, tabs, footer and a fixed height**, a bottom sheet you swipe down on phones, rendered at the top of the page (portalled) | TFE `TfeModal` (replaced six dialogs); Tena-host `TabbedModal`; Naoa `TwoPaneDialog`; Najenga's own `Modal` | `@okjt/ui` `Modal` v2. This is also the fix for G1. | P2 |
| F3 | **Long forms in two panes**: sections with progress, a check as each field is left, a draft for new entries, then "Check details" | Naoa `TwoPaneForm` (+ tests) | `@okjt/dashboard` `TwoPaneForm` | P2 |
| F4 | **Glass toolbar on phones**: hides as you scroll down, comes back as you scroll up, 44 px touch targets, and turns solid when the person asks for reduced transparency or the device struggles | Naoa `useMobileToolbar` + about 50 lines of `!important` and `:has()` overrides of the kit's toolbar in `index.css` | `AdminFloatingToolbar variant="glass"`. Naoa then deletes its overrides. | P2 |
| F5 | **Bottom tab bar on phones**: tabs picked from the sidebar's own items, so the two can't drift apart | TFE `TabBar` + `lib/dashboardTabs.js` | `@okjt/dashboard` `shell.tabBar` (off by default) | P3 |
| F6 | **Lists that become cards on phones**, with a "View details" dialog and per-row actions | Tena-host `DataTable` (`rowActions`, `detailTitle`, `meta.detailOnly`) | `AdminListPanel` options | P2 |
| F7 | **Undo instead of "are you sure?"** for things that can be taken back: the request is only sent once the 5-second Undo window closes | TFE `useUndoableRemoval` + `lib/undo` | `@okjt/ui` `undoable()` beside `confirmAction()` | P3 |
| F8 | **Step indicator**, inline in a wizard or docked at the bottom of a page, that shows progress only when there really is some | TFE `StepFlow` + `lib/stepFlow.js` (tests); the kit's `Journey` | `@okjt/site` / `@okjt/ui` `StepFlow` | P3 |
| F9 | **Skeleton while a page loads, and a cross-fade between pages** | TFE `PageTransition` + `lib/pageSkeleton.js` | `DashboardShell` option | P3 |
| F10 | **Pricing for 3 or 4 plans**, and a monthly/one-off price switch | Tena-host `V2Site.css` grid; Tena-host plan cards | `PricingSection` `columns` and `toggle` | P3 |
| F11 | **Labels and number formats the same everywhere**: status words in sentence case, numbers and dates in one fixed locale | TFE `statusLabel`, `formatNumber`, `formatDateTime` | `@okjt/ui` format helpers | P3 |
| F12 | **Contrast test** checking every text/background pair in the theme | Naoa `config/contrast.test.js` | `okjt-theme --check-contrast`; create-app runs it in CI | P2 |
| F13 | **Media picker** (pick an image already uploaded instead of uploading it again) | okjt-app `admin/Media.jsx`; TFE `MediaPicker` | `@okjt/dashboard` `MediaPicker`, used with S5 | P2 |
| F14 | **Grouped settings page** whose list of groups stays in view while you scroll | okjt-app `admin/Settings.jsx` (#43); Tena-host Admin → Settings | `@okjt/dashboard` `SettingsPage` | P3 |

### 3c. Server pieces built in a project that belong in `okjt/laravel-kit`

| # | What | Built in (and repeated in) | P |
|---|---|---|---|
| S1 | **Security headers and CSP**. Already in `SPEC.md`'s list but never moved. The two copies have drifted: naoa-dt allows `data:` and `blob:` connections, Naoa doesn't. | Naoa, naoa-dt `SecurityHeaders` | P1 |
| S2 | **On/off switches** for trying a feature before turning it on | Tena-host `Setting::getValue('…_enabled')` + Admin → Settings; Naoa "Phase 7, switched off"; TFE `SiteSetting` | P2 |
| S3 | **Clearing stale cookies after a domain change** (otherwise every login fails with 419 "Page Expired") | TFE `ForgetShadowedCookies` + test. Every project that moved from cPanel to the VPS can hit this. | P2 |
| S4 | **Front-end errors logged on the server**: page paths only, user id only, rate-limited, browser-extension noise dropped | TFE `lib/errorReporter` + `POST /client-errors` | P2 |
| S5 | **Images optimised on upload, plus a media library**: shrink to a maximum of 1920 px, re-encode at quality 82, record each upload as an asset, refuse SVG | TFE `MediaLibraryService`; naoa-dt #59 "optimise every image upload"; okjt-app media | P2 |
| S6 | **Editable site content**: site settings, page copy, the photos chosen for each page, FAQs, the contact form. In `SPEC.md`'s inventory, never built. Every project has written its own instead. | Naoa `SiteMedia` / `PageContent`; okjt-app `SiteSetting`; Tena-host `Services/Cms`; TFE `SiteSetting` + `LandingContent` | P2 |
| S7 | **Privacy**: a schedule for how long data is kept, requests to delete data, erasure | Naoa `Services/Privacy/Retention`, `ErasureRequest`, `PrivacyController` (wedding-specific parts stay in Naoa); Tena-host unsubscribe confirm | P2 |
| S8 | **M-Pesa**: STK push through Daraja with the callback checked, connecting M-Pesa from the admin, reading pasted M-Pesa and bank messages, a payment recorder | Five separate implementations: Naoa `Services/Payments` (StkPush, MessageParser, MessageReconciler); naoa-dt `MpesaService`; Tena-host `MpesaService` + `MpesaCallbackController` + `MpesaSettingsController`; Najenga (reads M-Pesa transfers on receipts); TFE (through Paystack mobile money) | P2, **needs Kevin** |
| S9 | **Installable site and web push**: manifest, offline page, a service worker that never caches pages, push notifications that carry no content | TFE PWA + `WebPushService` (no extra package needed) | P3 |
| S10 | **Asking for the password again before sensitive pages** (a recent password or passkey check) | TFE `RequireFreshPassword` + passkey confirm; the kit has `ConfirmPasswordController` but no middleware | P3 |

### 3d. Checks to share

TFE and Naoa each wrote tests that catch whole classes of bug. These go to
`@okjt/ui/tools`, and `create-okjt-app` puts them in a new project's CI:

* **Accessibility check** with axe on the main pages (TFE `tests/e2e/a11y.spec.js`).
* **Grids that overflow on phones**: a fixed-width `minmax()` minimum that pushes cards off the screen (TFE `gridOverflow.test.mjs`).
* **Image paths that don't exist on disk** (TFE `assetLiterals.test.mjs`).
* **What lands in which code bundle**, so heavy libraries stay out of the first download (TFE `bundleBoundaries.test.mjs`).
* **Contrast** (F12).

### 3e. Stays in the project

These are specific to one product, so they stay where they are: Naoa's
guests, invitations, seating, traditions, storefronts, document reading and
run-sheet; naoa-dt's polaroids and stories, check-in, ushers, programme and
guest tour; Najenga's receipts, OCR, expense sheet and image annotator;
Tena-host's WiFi portal, UniFi, devices, property transfers and messaging;
TFE's tournaments, partners, stadium map, budget calculator and schools.
Wedding features naoa-dt has and Naoa lacks (check-in by QR, usher role, cash
gifts through Pay Bill) should move **into Naoa**, not into the kit.

---

## 4. Making the kit reachable from Tena-host, TFE and naoa-dt

### 4a. Inertia: let the project supply the router (recommended)

The kit imports `Link`, `NavLink`, `useLocation` and `useNavigate` from
react-router-dom in 22 modules. Two projects have worked around this, each in
its own way: Tena-host with a React Router bridge, Najenga with a small page
API (`Link`, `router`, `useForm`, `usePage`). The fix is to make navigation
something the project passes in:

* `SiteProvider` / `DashboardProvider` accept a `navigation` setting
  (`{ Link, NavLink, useLocation, navigate }`). If it's left out, react-router
  is used, as today.
* A new small package, `@okjt/inertia`, gives the Inertia version. It is
  generalised from Tena-host's bridge: Inertia visits between pages,
  `#section` links stay on the page, and links to other sites stay plain
  links.
* Tena-host then deletes its bridge, and can start using kit dashboard pieces
  one at a time (F2, F6 first, since it has its own versions of both). The
  kit already allows React 18 (`react >= 18`). Check this in CI with a
  React 18 test run.

### 4b. TFE and Tailwind 3: don't support it in the kit

Shipping a compiled stylesheet for Tailwind 3 projects would mean two ways
to style every component. Instead:

* TFE uses the parts that don't depend on Tailwind straight away: the helper
  functions and hooks (`installChunkReload`, `undoable`, the format helpers,
  `@okjt/inertia`) and every server package (`okjt/laravel-kit` S1 to S10
  work with Inertia apps too).
* Moving TFE's styles to Tailwind 4 is a separate TFE project, and should be
  scheduled on its own. Until then TFE **gives** to the kit (F2, F5, F7 to
  F9, F11, S3 to S5, S9, S10, and the checks), and its own copies stay.

### 4c. naoa-dt: decision needed

naoa-dt is the app Naoa grew from, still serving one wedding. There are two
ways forward:

* **(a) Rebuild it as a Naoa wedding.** First move its wedding features into
  Naoa (check-in, ushers, Pay Bill gifts, programme live updates, the guest
  tour). Then the wedding runs on Naoa and naoa-dt is archived. Best in the
  long run; costs most up front.
* **(b) Keep it separate, and move it onto the kit the way Naoa did (Phase
  1 to 4 steps).** Its 73 dashboard copies are replaced by kit pieces.

Recommendation: **(a)** once the wedding date has passed. Until then, only
take security and bug fixes (S1, F1) in naoa-dt, so the live event isn't put
at risk.

---

## 5. Releases, in order

Each release lists the projects that update after it and the copies they
delete. A box is ticked when its kit PR and every consumer PR are merged.

### R1: fixes and gaps (kit 0.5): about 1 week

- [x] G1 Modal widths, `showClose`, title and footer slots (the full tabbed dialog comes in R2)
- [x] G2 inputs: their own background, `ref` forwarding, can be used without label and error
- [x] G3 unsaved-changes guard lifted from Najenga
- [x] G5 ContextMenu `onClick` accepted as another name, development warning, focus check
- [x] G9 passkey errors answered and logged
- [x] F1 `installChunkReload()`
- [x] S1 `SecurityHeaders` with CSP from config
- [x] G6 `NotificationsBell` reads another API (`listPath`, `markAllPath`, `map`; marking one notification at a time is still open, R2) and G7 `AdminTutorial` (`open`, `skipMissing`, selectors, arrow keys), from OKJT#44, brought forward from R2
- [x] `Modal` keeps keyboard focus inside while open (from OKJT#44)
- [ ] Consumers: Naoa, Najenga, Tena-host move to `site ^0.2` and the R1 versions. Najenga finishes 6d.2 and 6d.3 and deletes `Modal`, `TextInput`, `SelectInput`, `TextArea` and its guard. Naoa and naoa-dt delete their chunk-reload code. Naoa deletes `SecurityHeaders`.
- Done when: style comparison shows no differences on Naoa and Najenga except the agreed ones; every suite passes.

**R1 result so far (2026-11-15).** The seven kit changes are on the branch, one
commit each, with tests (ui 21 → 35, dashboard 112 → 124, laravel-kit 64 → 72;
the new PHP tests fail on the old code). Versions: `@okjt/ui` 0.3.0,
`@okjt/dashboard` 0.5.0, `okjt/laravel-kit` v0.5.0, `create-okjt-app` 0.1.4
(which also stops asking for `@okjt/site ^0.1`). `UPGRADING.md` has the entry.

* G3, as built: every consumer uses `<BrowserRouter>`, where react-router can't
  hold a navigation (`useBlocker` needs a data router). So the guard became
  a page-wide record plus `confirmLeave()` / `useGuardedNavigate()`, which
  other routers' visits call. Najenga's Inertia-style shim will call it from its
  `before` event (its consumer PR). The browser's Back button is still not caught.
* G9, as built: the failing passkey is not switched off (TFE does that); a
  clear 422 and the logged cause were enough, without deleting anyone's data.
* Found on the way: Naoa's and Najenga's published `config/okjt.php` have their
  own `messages`, and config merges only at the top level, so every message
  the kit adds is missing for them. The passkey message falls back to the kit's
  wording. Later messages should do the same, or `Messages::get` should fall
  back to the kit's file (R2).
* Proof that nothing changes on screen, at the scale of this change: the
  components R1 touched (the four field types with and without an error, the
  default `Modal`, a `ContextMenu` with a header, separator and danger item),
  built with the kit before and after R1, under Tailwind 4 and Naoa's
  generated theme. Every element's computed styles were captured with
  `style-snapshot.mjs` at 1280 and 390 px. Result: **no differences**.
  Calibration: setting `--okjt-field-bg` / `--okjt-field-text` on the "after"
  build was reported on exactly the four fields. The full 41-route comparison
  runs in each consumer PR, as before.
  After OKJT#44 was merged in, the comparison was run again. **One difference**,
  intended: a Modal opened from the keyboard now moves focus to its first
  control, so the browser draws its focus ring on the close button.
  Opened with the mouse, nothing is drawn (checked: `:focus-visible` is false),
  and on close focus goes back to the button that opened it.
* OKJT#44, an earlier pull request for the same Najenga gaps, was merged into
  this release. #45's version was kept where the two overlapped. The fields'
  default background stays transparent, because #44's white would have
  changed Naoa's fields. #44 brought the Modal's focus handling, the bell's
  `listPath` / `markAllPath` / `map` (G6) and the tour's controlled mode,
  skipping and keys (G7).
* **Released 2026-11-15**: `@okjt/ui` 0.3.0, `@okjt/dashboard` 0.5.0,
  `create-okjt-app` 0.1.4 on npm; `okjt/laravel-kit` v0.5.0 on Packagist.
  **`@okjt/site` 0.2.0 did not publish**: it has no Trusted Publisher on
  npmjs.com (the token exchange answers "package not found"), so it has never
  left 0.1.0. Until it is set and the failed job re-run, `create-okjt-app`
  0.1.4 (which asks for `@okjt/site ^0.2.0`) can't install.
* Consumer updates: Najenga#89 (versions, the kit's guard, ContextMenu
  focus; screenshots identical to `main`), Najenga#90 (dialogs and fields on
  kit 0.6), Najenga#91 / Naoa#38 / Tena-host#108 (`@okjt/site` 0.2, which
  published once its Trusted Publisher was set), Tena-host#109
  (`installChunkReload` from `@okjt/ui/helpers`), Naoa#37 (versions, the kit's
  `SecurityHeaders` with a test pinning the headers, `installChunkReload()`),
  Tena-host#107 (`@okjt/ui` 0.3). okjt-app links `packages/`, nothing to do.
* Found during the consumer updates, for R2:
  * **`@okjt/ui`'s main entry needs `react-hot-toast`** even for a helper that
    doesn't use it (`feedback.js` is in the same entry). Tena-host has no
    toasts, so `import { installChunkReload } from '@okjt/ui'` fails its build.
    Add an entry for the helpers that need no React or toasts
    (`@okjt/ui/helpers`: `installChunkReload`, format helpers).
  * **`Modal` has no backdrop option.** Najenga's dialogs use a darker
    backdrop (`bg-black/80`) than the kit's (`bg-black/60`); add
    `backdropClassName`, passed to `Overlay`.
  * **Moving Najenga's dialogs, fields, bell and tour onto the kit's changes
    how they look.** The kit's own styles differ from Najenga's
    (padding, borders, focus rings, the dark gradient on tabbed dialogs). It
    needs either a decision to take the kit's look, or style options in the
    kit first. Waiting on that decision (Najenga `docs/plan-kit-6d.md`).

### R2: phones and forms (kit 0.6, then 1.0): about 2 weeks

- [x] F2 `Modal` v2 (kit 0.11: `tabs`, a `footer` per tab, `fixedHeight`, `sheet`; lifted from TFE's `TfeModal` with its tests). F7, F8, F11 and R3 are still being done by the TFE session (TFE `docs/proposals/okjt-kit-migration.md`); don't start them here.
- [x] F5 tab bar on phones (kit 0.11: `shell.tabBar`, lifted from TFE's `TabBar` + `lib/dashboardTabs.js` with its tests; brought forward from R6 because it came with F2)
- [x] F9 page skeleton (kit 0.11: `shell.pageSkeleton`, lifted from TFE's `PageTransition` / `PageSkeleton` / `lib/pageSkeleton.js` with its tests; brought forward from R6 with F2 and F5)
- [x] F3 `TwoPaneForm` (kit 0.8, with `TwoPaneDialog`, lifted unchanged)
- [x] F4 glass toolbar (kit 0.8: `toolbar-glass.css` + `useGlassToolbar`; a stylesheet entry rather than a prop, because the look is media queries and `:has()` on the bar's wrapper)
- [x] F6 card view on phones and details dialog (kit 0.10: `AdminDataTable`, `@okjt/dashboard/table`, lifted from Tena-host's `DataTable`; not `AdminListPanel` options, see below)
- [x] F12 contrast check (kit 0.9: `okjt-theme --check-contrast`, `@okjt/ui/contrast`; create-app adds a `check:contrast` script and warns at creation rather than failing CI, see below)
- [x] G4 `useFilteredItems` options (kit 0.8)
- [x] Messages fallback in laravel-kit (kit 0.8; found in R1)
- [x] G8, G10 (kit 0.9: `theme.type.minText`; `useAdminAction` without a Query client, `refreshHistory`) (G6 and G7 landed in R1)
- [x] `@okjt/ui/helpers` entry (no React, no toasts) and `Modal` `backdropClassName` (found in R1's consumer updates). Kit 0.6.
- [x] Option B for Najenga (decided 2026-11-15: style options in the kit first, then Najenga switches with its screenshots unchanged). Kit 0.6: fields take a project's base classes (`componentDefaults.Field.classNames`, `baseClassName`); `Modal` takes `overlayClassName`, `backdropClassName`, `classNames.panel` / `body`, so Najenga's `Modal` becomes a wrapper drawing its own chrome on the kit's dialog. The defaults' class strings are asserted exactly in tests, so the markup of every existing dialog and field is unchanged.
- [x] Option B, second step: the bell and the tour. Kit 0.7: `useNotifications()` and `renderButton` / `renderPanel` / `markOnePath` on `NotificationsBell` (which also closes outside and on Escape now); `render` and `scrollIntoView` on `AdminTutorial` (→ stops at the last step). Najenga's `NotificationsDropdown` and `Tour` draw on them.
- [x] Consumers: Naoa deletes `TwoPaneForm`, `TwoPaneDialog`, `useMobileToolbar` and its toolbar CSS (Naoa#39). Najenga finishes 6d.4 (Najenga#93) and 6d.6 (Najenga#92).
- [ ] Consumers of 0.9: Najenga on the kit's `useAdminAction` with `refreshHistory: false` (6d.5); Tena-host sets `minText: '12px'` and deletes its 11px rule; each project adds `check:contrast`.

Notes from kit 0.11:

* F2, as built: options on the existing `Modal` rather than a second dialog,
  so every dialog keeps its markup (the default class strings are asserted
  exactly). Lifted from TFE: `modalTabs.js` and `sheetDrag.js` with their
  node tests. Changed on the way: no `tabs` means no tab list (TFE always
  drew one, made up from the title); tabs run along the top under the title
  in the kit's look, not in TFE's side rail; icons are components or
  elements with no default; the footer on a sheet clears the iPhone home bar.
  Portalling was already done (`Overlay`).
* Proof that nothing changes on screen: the default, card (title,
  description, footer), not-closeable and 7xl dialogs, built with the kit
  before and after under Tailwind 4 and okjt-app's theme. `style-snapshot`
  at 1280 and 390 px: **no differences**. Calibration: changing the title's
  colour token on the "after" build was reported on exactly the two dialogs
  with a title. `style-snapshot` records colours and fonts, not spacing, so
  the 390 px screenshots were also compared pixel by pixel: identical.
* F5, as built: `shell.tabBar = { tabs, menu, label, className }`, tabs
  picked from `shell.nav` by path (TFE picks by route name; the kit's nav has
  none). The kit's tokens replace TFE's stylesheet (`public-tabbar.css`), so
  the default look is a light glass pill in the theme's surface colour; a
  dark dashboard passes `className`. Added on the way: the Menu tab (TFE's
  role sidebars passed one by hand), the sidebar's new-changes dot on a tab,
  and the floating toolbars (plain and bold) lifted above the bar. The
  accessible name is "Tabs", since the header's shortcuts are already
  "Quick links". Off by default: the shell with a floating toolbar, before
  and after, compared at 1280 and 390 px (styles and pixels): no difference.
* F9, as built: `shell.pageSkeleton`. In TFE the wait is an Inertia visit
  (router events); in the kit's react-router projects it is a lazy route, so
  the skeleton is the fallback of a Suspense boundary the shell puts inside
  its keyed page wrapper (a fresh boundary per page, so it shows even when
  the navigation runs in a transition). The cross-fade half was already in
  the kit (`PageContent`). Found on the way: without a boundary inside the
  shell, a lazy page suspends to the project's boundary above it and the
  whole dashboard (sidebar and header) is replaced by its fallback. The pure
  half is `skeletonShapes.js`: `pageSkeleton.js` beside `PageSkeleton.jsx`
  compile to names that differ only in case, which esbuild refuses. Off by
  default: same before/after comparison as F5, no difference.
* Consumers: TFE moves to it with the shell swap (it needs R3 first);
  Tena-host, Naoa and Najenga can move their tabbed dialogs in their 0.11
  updates.

Notes from kit 0.10:

* F6, as built: `AdminListPanel` is only the panel around a page's own
  markup and never sees the rows, so the card view is a table component,
  `AdminDataTable`, in its own entry (`@okjt/dashboard/table`) because it
  needs `@tanstack/react-table` (an optional peer). Lifted from Tena-host;
  generalised: `translate` for `useTerms()`, the kit's `Modal` for
  `GlassModal`, `onPageChange` for the Inertia visit, the kit's tokens for
  the BEM stylesheet. Tena-host moves to it with R3 (Inertia).
* Found by the TFE session: laravel-kit pointed every reset link at
  `app.frontend_url` (Laravel's default: `http://localhost:3000`), breaking
  apps with their own reset page. Now `okjt.auth.password_reset.link_to_app`
  (true / false / null: only when there is no `password.reset` route).

Notes from kit 0.9:

* G8, as built: the option is `theme.type.minText` (the plan said
  `minLabel`; it applies to all of the kit's small text, not only labels).
  The kit draws 9 to 11 px text in 36 places, not 35. Each is
  `max(<size>, var(--okjt-min-text, 0px))`.
* F12, as built: the pairs are the ones the kit's components draw, each
  scoped to where it draws them (public pages, dashboard, or both), plus a
  project's own. The plan said create-app would run it in CI; the generated
  project's only workflow is the shared deploy, and failing an owner's deploy
  over the brand colour they chose is too blunt, so the installer warns and
  the project gets a script to add to its own CI.
* **Found by F12**, each a design decision for its project, not fixed here:
  - Naoa, public pages: the brand brown `#A67B5B` is 3.54 to 3.75:1 as link
    text and under white button text (AA needs 4.5 for normal text). The
    dashboard is fine (its accent is the ink).
  - Najenga, dashboard: the red `#DC143C` as text on the dark panels is 3.7
    to 3.92:1.
  - okjt-app: white text on the gold accent `#EBC882` is 1.6:1 (the kit's
    secondary button and active filter count).
  Fixes would be a darker accent for text (or a separate `accentStrong` for
  links), which changes how the brand looks; to be decided per project.
* G10, as built: `useContext(QueryClientContext)` rather than
  `useQueryClient()`, which throws without a provider.
- [ ] Release **1.0**, so caret ranges pick up later fixes by themselves (G11)

### R3: Inertia (`@okjt/inertia` 0.1, kit 1.1): about 1 week

- [ ] `navigation` setting in both providers, with react-router as the default
- [ ] `@okjt/inertia`, generalised from Tena-host's bridge, with tests
- [ ] CI runs the kit's tests on React 18 as well
- [ ] Consumers: Tena-host deletes its bridge; it trials `Modal` v2 in place of `TabbedModal` on one screen

### R4: platform services (laravel-kit 0.5, dashboard 1.2): about 2 to 3 weeks

- [ ] S2 on/off switches (server and an admin screen)
- [ ] S3 clearing stale cookies
- [ ] S4 front-end error log (server and `@okjt/ui` reporter)
- [ ] S5 + F13 image optimisation, media library and picker
- [ ] S6 + F14 editable site content and settings page, in steps: settings → page copy → page photos → FAQs → contact form
- [ ] S7 privacy: retention schedule and requests to delete data
- [ ] Consumers: Naoa first (it has the most to delete), then okjt-app, Najenga, Tena-host (server pieces only, through Inertia), TFE (server pieces only)

### R5: M-Pesa (laravel-kit 0.6, dashboard 1.3): about 2 weeks, **needs Kevin**

- [ ] Compare the five implementations line by line and write the result here before writing any code: which checks each does on the callback, and how each stores the settings and secrets
- [ ] `Okjt\Kit\Payments\Mpesa`: Daraja STK push behind a gateway interface, callback signature and amount checks, idempotent recording, settings encrypted and edited in the admin, a fake gateway for tests
- [ ] Message parser for pasted M-Pesa and bank SMS (from Naoa, with its tests)
- [ ] `StkPrompt` in `@okjt/dashboard` (from Naoa)
- [ ] Off by default; each project switches it on with S2
- [ ] Consumers: Naoa, then naoa-dt (if 4c (b)), then Tena-host. This is high risk for Tena-host, so it goes in its own PR, marked "Needs Kevin".

### R6: new projects and the rest (create-okjt-app 0.2): about 1 week

- [ ] create-app writes the new options (chunk reload, security headers, switches, error log, contrast and accessibility checks in CI)
- [ ] F7, F8, F10, F11, S9, S10 as demand appears; each is P3 and can wait (F5 and F9 landed in 0.11)
- [ ] A short `packages/CLAUDE.md` ("kit rules"), copied into each project's CLAUDE.md, so Claude Code sessions in any project know a kit piece exists before writing its own

---

## 6. Stopping the drift from starting again

* **Fix it upstream first.** When a project fixes or extends a kit piece in
  its own code, it opens an OKJT issue labelled `kit-candidate` in the same
  PR, linking the local fix. The kit-rules snippet (R6) tells Claude Code to
  do this.
* **Drift report.** `npx okjt-drift` (in `@okjt/ui/tools`): lists local
  components whose names or exports match kit pieces (`*Modal`, `*Toolbar`,
  `useFilteredItems`, …), local CSS that overrides kit classes (selectors on
  `.admin-floating-toolbar`), and kit versions behind the latest. It runs
  monthly in each project's CI and posts a summary. It doesn't block merges.
* **The kit's CI tests against its consumers.** On every kit PR, build Naoa
  and Najenga against the PR's packages and run the style comparison, so a
  kit change that would alter a page is caught before release, not after.

---

## 7. Decisions needed

| # | Question | Recommendation |
|---|---|---|
| 1 | Is the order R1 → R6 right, or should M-Pesa (R5) come sooner because Naoa's Phase 7 is waiting on it? | Keep the order; Naoa's M-Pesa stays switched off until R5 |
| 2 | Inertia support through `@okjt/inertia` (4a)? | Yes |
| 3 | TFE: Tailwind 4 move as its own project, not part of this plan (4b)? | Yes |
| 4 | naoa-dt: rebuild as a Naoa wedding, or move onto the kit (4c)? | Rebuild as a Naoa wedding, after the wedding date |
| 5 | Go to 1.0 at the end of R2 (G11)? | Yes |
| 6 | Who reviews kit PRs that change server security (G9, S1, S3, S7, S8)? | Kevin, as Tena-host's CLAUDE.md already requires |

Rough total: **8 to 10 weeks** of kit work for R1 to R5, with consumer PRs
alongside. R1 alone fixes everything a project is currently blocked on.
