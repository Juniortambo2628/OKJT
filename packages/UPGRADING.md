# Upgrading

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
