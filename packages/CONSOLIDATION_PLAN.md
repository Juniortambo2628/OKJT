# OKJT kit: consolidation plan (Phase 7)

Status: **draft for review** (2026-11-15). Nothing here is built yet.

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
| G8 | Text size | Tena-host `V2Site.css` | Small labels are 9 to 11 px, set in 35 places in the kit. Tena-host overrides them to 12 px, and TFE's accessibility tests would fail them too. Add a theme minimum (`type.minLabel`, default unchanged) and use it everywhere. | P2 |
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

- [ ] G1 Modal widths, `showClose`, title and footer slots (the full tabbed dialog comes in R2)
- [ ] G2 inputs: their own background, `ref` forwarding, can be used without label and error
- [ ] G3 unsaved-changes guard lifted from Najenga
- [ ] G5 ContextMenu `onClick` accepted as another name, development warning, focus check
- [ ] G9 passkey errors answered and logged
- [ ] F1 `installChunkReload()`
- [ ] S1 `SecurityHeaders` with CSP from config
- [ ] Consumers: Naoa, Najenga, Tena-host move to `site ^0.2` and the R1 versions. Najenga finishes 6d.2 and 6d.3 and deletes `Modal`, `TextInput`, `SelectInput`, `TextArea` and its guard. Naoa and naoa-dt delete their chunk-reload code. Naoa deletes `SecurityHeaders`.
- Done when: style comparison shows no differences on Naoa and Najenga except the agreed ones; every suite passes.

### R2: phones and forms (kit 0.6, then 1.0): about 2 weeks

- [ ] F2 `Modal` v2 (tabs, footer that follows the open tab, fixed height, phone bottom sheet), lifted from `TfeModal`
- [ ] F3 `TwoPaneForm`
- [ ] F4 glass toolbar variant
- [ ] F6 card view on phones and details dialog in `AdminListPanel`
- [ ] F12 contrast check in `okjt-theme`
- [ ] G4, G6, G7, G8, G10
- [ ] Consumers: Naoa deletes `TwoPaneForm`, `TwoPaneDialog`, `useMobileToolbar` and its toolbar CSS. Najenga finishes 6d.4 and 6d.6.
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
- [ ] F5, F7 to F11, S9, S10 as demand appears; each is P3 and can wait
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
