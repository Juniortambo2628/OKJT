# Upgrading

## 0.12 → 0.13 (ui 0.7.0, dashboard 0.13.0, laravel-kit 0.13.0, create-okjt-app 0.1.12)

The browser error log (S4), from TFE. Nothing changes until you use it.
Raise ui and dashboard together (dashboard 0.13 needs ui 0.7; with ui alone
npm nests a second copy): `npm i @okjt/ui@^0.7.0 @okjt/dashboard@^0.13.0`
and `composer require okjt/laravel-kit:^0.13.0`.

- **Browser half**: `import { installErrorReporter } from '@okjt/ui/helpers'`
  and call it once at start-up. Options: `endpoint` (default
  `/client-errors`), `skipPages` (RegExps on the path whose errors must
  never leave the browser), `maxPerPage` (10).
- **Server half**: `Route::post('/client-errors',
  [Okjt\Kit\Http\Controllers\ClientErrorController::class, 'store'])
  ->middleware('throttle:30,1');` outside any auth group (signed-out pages
  report too). Pages and sources are kept as paths only, the user as an id.
  `okjt.client_errors.skip_paths` lists pages whose reports are dropped
  (`'fan/bank-savings'`); reports go to the `okjt_client` log channel, a
  7-day daily file `storage/logs/client-errors.log` the kit adds unless you
  define the channel yourself. Read that file before asking a tester for
  their console.
- TFE: delete `lib/errorReporter.js`, `ClientErrorController`, its
  `client` log channel and their tests; call the kit's with
  `skipPages: [/^\/fan\/bank-savings/, /^\/sandbox-bank/]` and set
  `okjt.client_errors.skip_paths`.

## 0.11 → 0.12 (dashboard 0.12.0, laravel-kit 0.12.0, create-okjt-app 0.1.11)

Start of R4 (platform services). Nothing changes until you use the new
pieces. `npm i @okjt/dashboard@^0.12.0` and `composer require
okjt/laravel-kit:^0.12.0`; then `php artisan vendor:publish
--tag=okjt-migrations` and `php artisan migrate` (a new `okjt_switches`
table).

- **On/off switches (S2).** Declare a project's switches in
  `config/okjt.php`:
  ```php
  'switches' => [
      'mpesa_extras' => [
          'label' => 'Sell extras with M-Pesa',
          'description' => 'Guests can pay for extras on the splash page.',
          'default' => env('OKJT_SWITCH_MPESA_EXTRAS', false),
          'public' => true,   // signed-out pages may ask (optional)
      ],
  ],
  ```
  Read one with `Okjt\Kit\Switches\Switches::on('mpesa_extras')`; guard a
  feature's routes with `RequireSwitch::class.':mpesa_extras'` (404 while
  off). Admin routes, superadmins only:
  `GET /switches` → `SwitchController@index`, `PUT /switches/{key}` →
  `@update` (each flip goes in the console audit log), and optionally a
  signed-out `GET /public-switches` → `@publicIndex`. The screen is
  `<AdminSwitches />` from `@okjt/dashboard` (`path`, `translate`,
  `confirm` options). Only declared switches can be flipped; an undeclared
  key reads as off.
- **Stale cookies (S3), from TFE.** Add
  `Okjt\Kit\Http\Middleware\ForgetShadowedCookies` to the `web` group
  (`$middleware->web(append: [...])`). When a cookie's name arrives twice
  (an old copy under another domain after `SESSION_DOMAIN` changed), the
  stale copies are expired, so sign-in stops answering 419. It watches the
  session cookie and `XSRF-TOKEN`; `okjt.cookies.shadowed` names others.
  TFE: delete `App\Http\Middleware\ForgetShadowedCookies` and its test.

## 0.11.0 → 0.11.1 (dashboard 0.11.1)

`npm i @okjt/dashboard@^0.11.1`; nothing to change. A fix, from TFE.

- **The sidebar marks one current item.** With nested paths in `shell.nav`
  (Tickets at `/app/tickets`, Sales at `/app/tickets/sales`), a nested page
  marked both, because each item matched on its own prefix. Now the longest
  match alone is current. Which items can match is unchanged (the page, or a
  path it starts with; the home item only on its own page), so a sidebar
  without nested paths is exactly as before; Naoa's and Najenga's have none.
  The tab bar already did this (`activeNavItem`).
- New export: `sidebarActivePath(nav, pathname, homePath)`, the rule above.

## 0.10 → 0.11 (ui 0.6.0, dashboard 0.11.0, inertia 0.1.0 (new), create-okjt-app 0.1.10)

Raise your ranges together (dashboard 0.11 needs ui 0.6): `npm i
@okjt/ui@^0.6.0 @okjt/dashboard@^0.11.0`. `@okjt/site` stays at 0.3, and
`okjt/laravel-kit`'s v0.11.0 tag is the same code as v0.10.0. Nothing
changes on screen unless you use the new options.

- **`Modal`: tabs, a footer per tab, a fixed height and a phone sheet**
  (F2, from TFE's `TfeModal`). All off by default.
  - `tabs={[{ id, label, icon?, badge?, disabled?, content? }]}` (or
    `['Overview', 'Details']`) draws a row of tabs under the title and turns
    on the card chrome. The body is the open tab's `content`, else
    `children(activeId)` when children is a function. Arrow keys, Home and
    End move between tabs. `defaultTab`, or `activeTab` + `onTabChange` to
    control it. A tab list that changes while the dialog is open (a form
    that adds a step) falls back to a tab that exists, never an empty body.
    `icon` is a lucide component or an element.
  - `footer={(activeId) => …}`: the actions follow the open tab. A Save
    button for a form that isn't on screen does nothing, so show it only on
    that form's tab, and point it at the form with `form="the-form-id"`.
  - `fixedHeight`: the card keeps one height, `min(40rem, 88dvh)`, whatever
    the open tab holds; only the body scrolls. Override with `className`
    (`h-[32rem]`).
  - `sheet`: below `sm` the card sits at the bottom of the screen, full
    width, with a handle; swipe the header down to close (a long pull or a
    quick flick). Not swipeable when `closeable={false}`. The footer clears
    the iPhone home bar.
- **A tab bar on phones** (F5, from TFE's `TabBar`): `shell.tabBar = { tabs:
  ['/app', { path: '/app/plan', primary: true, label: 'Plan' }, '/app/inbox'] }`
  in `DashboardProvider`. Off by default. Below `lg` a floating bar at the
  bottom shows those sidebar items (picked from `shell.nav` by path, so a
  tab's label and icon come from the sidebar; a path not in the nav is left
  out), the current one behind a lens, `primary` with an outline, a dot when
  others changed that page, and a Menu tab that opens the sidebar (`menu:
  false` to drop it). Labels fold away while scrolling down. The floating
  toolbar (plain and bold) moves above it, and the page ends clear of it.
  If your project has its own phone tab bar or bottom nav, delete it when
  you turn this on.
- **A skeleton while a page loads** (F9, from TFE's `PageTransition`):
  `shell.pageSkeleton: true` (or `{ patterns, fallback, grace }`). Off by
  default. The page gets its own Suspense boundary inside the shell, so a
  lazy route that is still loading shows a placeholder shaped like it after
  220 ms while the sidebar and header stay, instead of falling through to
  your app's own boundary above the shell (which replaces the whole
  dashboard). Shapes: `dashboard`, `cards`, `table`, `split`, matched on the
  path; add your pages' patterns in front of `DEFAULT_SKELETON_PATTERNS`.
  If your routes have a `<Suspense>` around each page only to keep the
  shell up, you can drop it.
- **Undo instead of "are you sure?"** (F7, from TFE): `undoable(message,
  commit, { onUndo, onError })` shows an Undo toast and runs `commit` only
  when the 5 s window closes, so Undo never has to reverse anything.
  `useUndoableRemoval()` does it for a list: `remove(id, { message, commit
  })` hides the row at once, puts it back on Undo or on a failed commit, and
  commits what is pending when the page is left. `notifyUndo` (runs first,
  reverses on Undo) is unchanged. Keep `confirmAction()` for what can't
  safely be taken back (something that tells someone else or moves money).
- **`StepFlow`** (F8, from TFE): `<StepFlow variant="inline" steps={['Details',
  'Party', 'Confirm']} cursor={2} />` in a wizard, or `variant="docked"` for
  a "how it works" pill at the bottom of a page. Without `cursor` or per-step
  `state` it explains a flow and marks nothing done. Below `sm` it shows the
  current step and "Step 2 of 4". If your project has its own step indicator
  or "Step X of Y" caption, it can switch. For sections a person may move
  between freely, use `Modal`'s `tabs` instead.
- **Format helpers** (F11, from TFE): `formatNumber(n, digits?, locale?)`
  ("1,234,567"; junk reads "0"), `formatDateTime(value, intlOptions?,
  locale?)` ("Jun 14, 2027, 7:00 PM"; '' when missing or invalid),
  `statusLabel('pending_payment')` ("Pending payment"), `titleCase(slug)`.
  The locale is pinned (en-US unless passed) so a number reads the same on
  every machine; the time zone stays the viewer's. From `@okjt/ui` or
  `@okjt/ui/helpers`. Replace bare `toLocaleString()` calls with them.
- **The kit in an Inertia app: `@okjt/inertia`** (R3, new package,
  generalised from Tena-host's bridge). `npm i @okjt/inertia
  react-router-dom`, then wrap the kit in `<InertiaRouter>` inside your
  Inertia layout: every kit `Link`, `NavLink` and `useNavigate` makes an
  Inertia visit, a `#section` on the same page stays on the page, and links
  to other sites stay plain links. See its README. **Tena-host**: replace the
  `<Router location navigator>` in `V2Site.jsx` with `<InertiaRouter>` and
  delete `useInertiaLocation` and `navigate` there (your `v2Link` stays).
- **React 18: sign-in fields** (dashboard, a fix). `AuthField` didn't
  forward its ref, so on React 18 the kit's `SignInPage` never registered
  its email and password fields and Sign in did nothing. Nothing to do; the
  kit's tests now run on React 18 as well as 19.
- **Projects with their own tabbed dialog**: TFE `TfeModal`, Tena-host
  `TabbedModal`, Naoa `TwoPaneDialog` (keeps its two panes; use `tabs` where
  it only switches sections), Najenga's own `Modal`. Each moves to `Modal`
  in its own consumer PR, with screenshots.

## 0.9 → 0.10 (dashboard 0.10.0, laravel-kit 0.10.0, create-okjt-app 0.1.9)

Raise your ranges: `npm i @okjt/dashboard@^0.10.0` and `composer require
okjt/laravel-kit:^0.10.0`. `@okjt/ui` and `@okjt/site` stay at 0.5 and 0.3.

- **Reset links (laravel-kit), check this one.** The emailed reset link
  used to go to `{app.frontend_url}{path}/{token}` always, and Laravel's
  `frontend_url` defaults to `http://localhost:3000`. Now, by default, it
  goes there only when your app has no `password.reset` route; with one,
  Laravel's own link to it is used. Set
  `okjt.auth.password_reset.link_to_app` to `true` to always link to the
  app (an app on another origin), or `false` to always leave it to Laravel.
  Naoa (no `password.reset` route): unchanged. Najenga (its own route at the
  same path): the link now comes from its route on its own host instead of
  `FRONTEND_URL`. TFE and Tena-host: links stop pointing at localhost.
- **`AdminDataTable`** (`import AdminDataTable from '@okjt/dashboard/table'`,
  needs `npm i @tanstack/react-table`), from Tena-host: a table from `lg`
  and one card per row below it, with search, sorting, client or server
  paging (`serverPagination` + `onPageChange`), selection (`selectedIds` to
  control it), `rowActions` and "View details" (`detailTitle`; columns with
  `meta.detailOnly` show only there; `meta.label` names a column on the
  cards). `translate` passes labels through a project's own wording.

## 0.8 → 0.9 (ui 0.5.0, site 0.3.0, dashboard 0.9.0, create-okjt-app 0.1.8)

More of R2. Nothing changes on screen unless you use the new options. Raise
your ranges together (dashboard 0.9 needs ui 0.5; with ui left at 0.4 npm
nests a second copy): `npm i @okjt/ui@^0.5.0 @okjt/site@^0.3.0
@okjt/dashboard@^0.9.0`. `okjt/laravel-kit`'s v0.9.0 tag is the same code as
v0.8.0.

- **A floor for small text**: `theme: { type: { minText: '12px' } }` in
  `okjt.config.js`, then `npm run theme`. The kit's 9 to 11 px labels (36 of
  them, in all three packages) never draw smaller. Tena-host: set it to
  `'12px'` and delete the `.v2-site .text-\[11px\]` rule in `V2Site.css`.
- **A contrast check**: `okjt-theme --check-contrast` checks every
  text/background pair the kit draws (body on the page, links on cards,
  white on accent buttons, filled controls, ...) against WCAG AA, for the
  public pages and, with `theme.dashboard`, the dashboard. It exits 1 if a
  pair is too faint. Add your own pairs in `theme.contrastPairs` (and
  `theme.dashboard.contrastPairs`): `[what, text, background, minimum]`,
  where a colour is a token (`'body'`, `'tone-500'`), a token over the
  background (`'accent/15'`) or a colour (`'#ffffff'`). In your own tests:
  `import { checkContrast, contrastRatio } from '@okjt/ui/contrast'`.
  Add `"check:contrast": "okjt-theme --check-contrast"` to your scripts
  (new projects have it). Today it reports pairs below AA in Naoa (public
  pages), Najenga (dashboard) and okjt-app; see the plan.
- **`useAdminAction` without a Query client**: on a page or in a test with
  no `QueryClientProvider`, the action runs and nothing is refetched.
  `refreshHistory: false` skips refetching the kit's version history; set it
  for every action with `componentDefaults: { AdminAction: { refreshHistory:
  false } }` in `DashboardProvider` (Najenga, whose history is its own).

## 0.7 → 0.8 (dashboard 0.8.0, laravel-kit 0.8.0, create-okjt-app 0.1.7)

More of R2. Nothing changes on screen unless you use the new pieces. Raise
your ranges: `npm i @okjt/dashboard@^0.8.0` and `composer require
okjt/laravel-kit:^0.8.0`. `@okjt/ui` stays at 0.4.

- **`useFilteredItems(items, { searchQuery, searchFields, where, sortFn, filterFn })`**:
  search chosen fields, keep items whose fields equal values (`where:
  { project_id }`, compared as text, empty values ignored), and sort. The
  positional form `(items, searchQuery, filterFn)` works as before.
- **`TwoPaneForm`** and **`TwoPaneDialog`** (and `FieldError`), from Naoa: long
  forms in two panes, with a check as each field is left, a draft for new
  entries and a final "Check details". Naoa: delete your copies and import
  them from `@okjt/dashboard`; the markup is the same.
- **The glass toolbar on phones**, from Naoa:
  `import '@okjt/dashboard/toolbar-glass.css'` and call
  `useGlassToolbar({ storageKey })` in the dashboard. Colours are
  `--okjt-toolbar-glass-bg`, `--okjt-toolbar-solid-bg`,
  `--okjt-toolbar-glass-border` and `--okjt-toolbar-glass-shadow` (defaults:
  Naoa's warm white). Naoa: delete `useMobileToolbar` and the phone-toolbar
  rules in `index.css`, and pass `storageKey: 'naoa-toolbar-solid'`.
- **laravel-kit `Messages`**: a message missing from your published
  `config/okjt.php` now falls back to the kit's wording, so new messages
  reach projects with their own list. Yours still wins where you have one.

## 0.6 → 0.7 (dashboard 0.7.0, create-okjt-app 0.1.6)

Room in the bell and the tour for a project to draw its own (R2, option B,
step two). Raise your range: `npm i @okjt/dashboard@^0.7.0`. `@okjt/ui`
stays at 0.4; `okjt/laravel-kit`'s v0.7.0 tag is the same code as v0.5.0.

Two small behaviour changes, no change in how anything looks:

- **The bell closes on a click outside it and on Escape.** It never did.
- **→ in the tour stops at the last step.** It used to finish the tour,
  which a stray key press could do; finishing is the card's own button.

New, all optional:

- **`useNotifications({ listPath, markAllPath, markOnePath, map })`**: the
  bell's behaviour on its own (fetched on mount and every 30 seconds;
  `markRead(id)`, `markAllRead()`, `refresh()`, `notifications`,
  `unreadCount`).
- **`NotificationsBell`**: `markOnePath` (`'/notifications/:id/read'`, or a
  function of the id), and `renderButton` / `renderPanel` to draw your own
  bell on the kit's behaviour (`{ open, toggle, close, unreadCount,
  notifications, markRead, markAllRead, refresh }`).
- **`AdminTutorial`**: `render` draws the whole tour yourself (overlay,
  spotlight, card) from `{ step, index, count, rect, next, back, finish }`,
  rendered into `document.body`; `scrollIntoView={false}` leaves the page
  where it is.

## 0.5 → 0.6 (ui 0.4.0, dashboard 0.6.0, create-okjt-app 0.1.5)

Style options, so a project whose dialogs and fields look different from the
kit's can use the kit's anyway (R2, option B). Nothing changes on screen
unless you use them. Raise your ranges: `npm i @okjt/ui@^0.4.0
@okjt/dashboard@^0.6.0`. `okjt/laravel-kit` has no changes (its v0.6.0 tag is
the same code as v0.5.0).

- **Fields' base classes**: `AdminInput`, `AdminSelect` and `AdminTextarea`
  take your project's classes in place of the kit's, set once in
  DashboardProvider:
  ```js
  componentDefaults: { Field: { classNames: { input: '…', select: '…', textarea: '…' } } }
  ```
  or per field with `baseClassName`. `className` and the error border still
  apply after them.
- **`Modal`**: `overlayClassName` (how the dialog sits on the page),
  `backdropClassName`, and `classNames: { panel, body }`, each replacing the
  kit's classes. For dialogs that draw their own header, close button and
  footer as the content (`showClose={false}`), while the kit keeps the
  backdrop, Escape, focus and scroll lock.
- **`@okjt/ui/helpers`**: `installChunkReload` and its helpers, importable
  without React or toasts (`import { installChunkReload } from
  '@okjt/ui/helpers'`). For apps without `react-hot-toast`, such as Inertia
  apps.

## 0.4 → 0.5 (ui 0.3.0, dashboard 0.5.0, laravel-kit 0.5.0, create-okjt-app 0.1.4)

Release R1 of the consolidation plan (`CONSOLIDATION_PLAN.md`). Nothing
changes on screen or in a response unless you use the new options. You have to
raise your version ranges yourself, because in 0.x `^0.4.0` does not install 0.5:

1. `npm i @okjt/ui@^0.3.0 @okjt/dashboard@^0.5.0` and
   `composer require okjt/laravel-kit:^0.5.0`, then regenerate the theme
   (`npx okjt-theme`): it gains four colours at their defaults, and nothing
   on screen changes. **`@okjt/site` 0.2.0 isn't on npm yet** (it has no
   Trusted Publisher); stay on `^0.1` until it is, then see "site 0.1.0 →
   0.2.0" below.

New, all optional:

- **`installChunkReload()`** (`@okjt/ui`): call it once in `main.jsx`, before
  rendering. A tab left open across a deploy then reloads once into the new
  build instead of failing to open lazy pages. It replaces Naoa's
  `vite:preloadError` handler and naoa-dt's `utils/chunkReload.js`.
- **`Modal`**: `maxWidth` `6xl`, `7xl` and `full`; `showClose={false}` for
  content with its own close button; `closeable={false}` for a step that must
  be finished; `title`, `description` and `footer` make the panel a card (a
  header with the close button, a body that scrolls, a footer that stays put);
  `className` for the panel. Keyboard focus now moves into an open modal (its
  autofocus field, else its first control), stays inside on Tab, and goes back
  to what had it when it closes.
- **`NotificationsBell`**: `listPath`, `markAllPath` and `map` (turns one of
  your API's items into `{ id, title, message, link, icon, read_at,
  created_at }`), for an app with its own notifications API, such as Laravel
  database notifications.
- **`AdminTutorial`**: `open` (the app decides when it shows and remembers who
  has finished; nothing goes in localStorage), `skipMissing` (leaves out steps
  whose element isn't on screen), a step's `selector` instead of an element
  id, and ←, → and Escape. Its card is a dialog named by the step's title.
- **`ContextMenu`**: items may say `onClick` as well as `onSelect`. In
  development an item with neither logs a warning. Focus goes back to whatever
  opened the menu when it closes, so adapters that did this themselves (Najenga's)
  can stop.
- **`AdminInput`, `AdminSelect`, `AdminTextarea`**: take a `ref`; `bare`
  renders the control alone; background and text colour come from
  `--okjt-field-bg` and `--okjt-field-text` (default: transparent and
  inherit). A dark dashboard using `@tailwindcss/forms` sets them, e.g.
  `.admin-theme { --okjt-field-bg: #1c1c1c; --okjt-field-text: #f2f2f2; }`.
- **Unsaved changes**: every `useUnsavedChangesGuard` reports to one page-wide
  record. `<UnsavedChangesStatus />` without `dirty` shows its chip whenever
  anything is unsaved (passing `dirty` works as before). For navigation the
  guard can't see: `useGuardedNavigate()` (asks before a `navigate()` call)
  and `confirmLeave()` (for another router's visits, e.g. an Inertia-style
  router's `before` event). After saving, call `allowNextNavigation()` before
  redirecting. Also exported: `useHasUnsavedChanges()`, `hasUnsavedChanges()`.
  The browser's Back button is still not caught (react-router needs a data
  router for that).
- **`Okjt\Kit\Http\Middleware\SecurityHeaders`**: append it in
  `bootstrap/app.php` and delete your own. The defaults are Naoa's headers
  exactly. Add sources with `okjt.security_headers.csp_extra`
  (naoa-dt: `['connect-src' => ['data:', 'blob:']]`).
- **Passkeys**: an unexpected failure (a stored key that no longer decrypts,
  a database error) now answers 422 with `okjt.messages.passkey_failed`, and
  the cause is logged. If your published `config/okjt.php` has its own
  `messages`, add `passkey_failed` to change the wording; otherwise the kit's
  wording is used.

## site 0.1.0 → 0.2.0 (with @okjt/ui 0.2.2): dark public pages

Also `@okjt/dashboard` 0.4.1 (nothing to change): presence isn't asked for
without the kit's `api`; the sign-in card's border and the floating
toolbar's glass, border and shadow can be set in CSS (`--okjt-toolbar-bg`,
`--okjt-toolbar-border`, `--okjt-shadow`) for dark dashboards.

1. `npm i @okjt/site@^0.2.0 @okjt/ui@^0.2.2`
2. **Regenerate the theme** (`npx okjt-theme`): the public pages now use two
   new colours, `onInk`, `panel`, `fill` and `fillHover`. Skipping this leaves the dark buttons'
   text and the footer panel without a colour.

Shadows on the public pages are tinted with `--okjt-shadow` (CSS, default
`ink`); dark pages set it to black in their CSS.

Nothing changes on screen unless you set them: `onInk` defaults to white and
`panel` to `ink`, `fill` (dark buttons, the chosen tab or chip) to `ink` and `fillHover` to `body`, and cards, pills and menus that were white are now
`surface` (default white). For dark public pages, swap the light and dark
tokens (`paper`/`tint` dark, `ink`/`body` light), set `surface` to the card
colour, `onInk` to a dark colour and `panel` to a dark one. OKJTech's own
site (`okjt-app/web`) does this.

## 0.3.0 → 0.4.0 (dashboard 0.4.0, ui 0.2.1, laravel-kit 0.4.0, create-okjt-app 0.1.3)

Upgrade both together: the server's two-step sign-in changed.

1. `npm i @okjt/dashboard@^0.4.0 @okjt/ui@^0.2.1` and `composer require okjt/laravel-kit:^0.4.0`
2. `php artisan migrate`: the kit's `login_codes` table (skipped where the
   app already has one).
3. **Breaking: two-step sign-in needs the challenge.** `/login` (and an
   emailed code, a passkey, Google, an email link) now answers a two-step
   person with `{ requires_2fa, email, challenge }`; `/verify-2fa` takes
   `{ challenge, code }`. A code with an email address alone no longer
   signs anyone in. The kit's SignInPage and GoogleCallbackPage pass the
   challenge for you; your own calls use `verify2fa(challenge, code)`.
4. Wrong passwords are now throttled per address (5 a minute,
   `okjt.auth.throttle`); the wording is `okjt.messages.bad_credentials`.

New, all optional:

- **Session mode** (`okjt.auth.mode = 'session'`, and
  `<AuthProvider mode="session">`): sign in with Laravel's session cookie
  instead of a bearer token, for an app on the API's own origin. Put the
  auth routes on the `web` middleware. `initialUser` skips asking `/user`.
- **Sign in with an emailed code**: LoginCodeController (`/login-code`,
  `/login-code/verify`), and `emailCode` on SignInPage. Send your own email
  with `okjt.auth.login_codes.notification`.
- **Forgotten passwords**: PasswordResetController (`/forgot-password`,
  `/reset-password`), ForgotPasswordPage and ResetPasswordPage. The emailed
  link opens `{app.frontend_url}{okjt.auth.password_reset.path}/{token}`.
- **Confirming the password**: ConfirmPasswordController
  (`/confirm-password`, `/confirmed-password-status`), ConfirmPasswordPage.
- **Recovery codes** for two-step sign-in: handed out when it's turned on,
  `GET`/`POST /2fa/recovery-codes`, and accepted at the second step
  ("Use a recovery code instead").
- SignInPage: `remember`, `status`, `passkey` (false, or your own button),
  `labels`, `emailAutoComplete`.
- `okjt.auth.two_factor.secrets_encrypted`: secrets kept as Laravel Fortify
  keeps them (an app moving from Fortify keeps everyone's two-step sign-in).
- `okjt.auth.verified_to_sign_in` (default true): false lets people sign in
  before verifying their address.
- **The bold look** (`componentDefaults` in DashboardProvider, e.g.
  `{ SidePanel: { variant: 'bold' } }`) for EmptyState, the side panel, the
  floating toolbar, summary cards, page layout and hero; **icons by name**
  (`iconFor` in DashboardProvider, DashboardIcon); `shell.menuNewsDot`;
  `countActiveFilterLists`.

Nothing changes on screen unless you ask for it. Naoa's dashboard and its
sign-in page were compared element by element: no differences, except the
new "Use a recovery code instead" link at the two-step step.

## Dashboard 0.2.2 → 0.3.0 (with @okjt/ui 0.1 → 0.2)

Nothing changes on screen unless you ask for it. Naoa's dashboard was compared
element by element (21 pages and the share and history panels): no
differences.

1. `npm i @okjt/dashboard@^0.3.0 @okjt/ui@^0.2.0`
2. **Regenerate the theme** (`npx okjt-theme`, or `npm run theme`): the kit's
   components now use two new colours, `surface` and `contrast`, and the theme
   file must define them. Skipping this leaves cards and menus transparent.
   Apps made by create-okjt-app do it before every `dev` and `build`.

New, all optional:

- **Colours** `surface` (cards, panels, menus, dialogs; default white) and
  `contrast` (what hovers shade toward; default black).
- **`theme.dashboard`**: the colours again, for the dashboard only — e.g. a
  dark dashboard beside light public pages. Any token may be left out;
  `colorScheme: 'dark'` makes native controls (date pickers, scrollbars) dark.
- **Shell options** (`shell` in DashboardProvider): `sidebarWidth`,
  `collapsible` (a rail of icons on wide screens, remembered) with
  `railWidth`; `headerActions` (`'online'`, `'share'`, `'history'`, `'tour'`
  or your own components, in order); `HeaderStart` and `Search` slots;
  your own `HistoryDrawer` and `ShareModal`; `MenuIcon`; and classes for every
  part of the frame (`sidebarClass`, `logoBoxClass`, `navClass`,
  `navItemClass`, `navActiveClass`, `navIdleClass`, `navLabelClass`,
  `navTitleClass`, `headerClass`, `headerStartClass`, `headerEndClass`,
  `menuButtonClass`, `headerButtonClass`, `mainClass`). See
  DashboardProvider.jsx.
- `<main>` has `id="main-content"`, for a skip link.

## 0.2.1 → 0.2.2

`okjt/laravel-kit` v0.2.2, `@okjt/dashboard` 0.2.2, `create-okjt-app` 0.1.1.

**Email verification links are signed.** The link used to prove an address
with the hash of the address alone, which anyone who knew a user's id and
email could compute. It now also carries an expiry and a signature made with
the app key (`Okjt\Kit\Auth\VerificationLink`), and
`EmailVerificationController` refuses a link without a valid one (403; an
expired link answers `reason: expired`). Links last
`okjt.auth.verify_minutes` (a day).

* Send the kit's email from the user model (or extend it):
  ```php
  public function sendEmailVerificationNotification(): void
  {
      $this->notify(new \Okjt\Kit\Auth\VerifyEmail);
  }
  ```
* `@okjt/dashboard`'s `VerifyEmailPage` sends the new parts; update both
  packages together.
* Links emailed before the upgrade stop working: the person signs in and asks
  for a new one.
* Tests that posted `{ id, hash: sha1(email) }` need a real link's parts
  (`VerificationLink::for($user)`).

## 0.2.0 → 0.2.1

`@okjt/dashboard` 0.2.1. The page title, its icon box, summary-card and
toolbar shadows and the bell's dot follow the theme (they had Naoa's colours
written in; the values are the same for Naoa). The sign-in fields' three
copper tones follow the theme too, unless the app sets them in its CSS:

```css
:root {
  --okjt-auth-glow: #D08A5E;        /* where the sign-in button's gradient ends */
  --okjt-auth-focus: #C49274;       /* a focused field's border and ring */
  --okjt-auth-placeholder: #B8A898; /* placeholders */
}
```

`AdminTutorial` with no steps no longer breaks the page.

## 0.1 → 0.2

`@okjt/dashboard` 0.2.0 and `okjt/laravel-kit` v0.2.0. Nothing is removed or
renamed; everything new is opt-in.

**Server (`okjt/laravel-kit`)**

* New: Google sign-in and passkeys, backups, the console and its audit log,
  accounts and teams, and billing. See the README for each.
* Laravel merges a package's config only at the top level. If your
  `config/okjt.php` has its own `messages` or `auth` section, copy the new
  keys from the kit's `config/okjt.php` into it:
  * `messages`: `sign_in_expired`, `account_not_found`, `confirm_address`,
    `team_owners_only`, `no_account`, `plan_limit`, `trial_limit`;
  * `auth`: `new_user_name`, `social`.
  New sections (`backups`, `console`, `accounts`, `billing`) come from the
  kit unless you override them.
* New tables, only if you use those parts:
  `php artisan vendor:publish --tag=okjt-migrations` then `php artisan migrate`
  (console audit log, accounts, billing). Each skips tables you already have.
* `backups:create` and `backups:verify` now come from the kit; delete your own
  commands with those names.
* `AUTO_BACKUPS` is read as `okjt.backups.auto`.

**Client (`@okjt/dashboard`)**

* New: the shell's account menu (`AccountMenu`), the sign-in pages
  (`AuthLayout`, `SignInPage`, `GoogleCallbackPage`, `VerifyEmailPage`,
  `AcceptInvitePage`), the passkey client, and `signedIn(result)` on
  `useAuth()`.
* `SignInPage` needs `react-hook-form` (a new peer dependency).
