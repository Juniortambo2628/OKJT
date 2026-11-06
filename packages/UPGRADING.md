# Upgrading

## site 0.1.0 → 0.2.0 (with @okjt/ui 0.2.2): dark public pages

Also `@okjt/dashboard` 0.4.1 (nothing to change): presence isn't asked for
without the kit's `api`; the sign-in card's border and the floating
toolbar's glass, border and shadow can be set in CSS (`--okjt-toolbar-bg`,
`--okjt-toolbar-border`, `--okjt-shadow`) for dark dashboards.

1. `npm i @okjt/site@^0.2.0 @okjt/ui@^0.2.2`
2. **Regenerate the theme** (`npx okjt-theme`): the public pages now use two
   new colours, `onInk` and `panel`. Skipping this leaves the dark buttons'
   text and the footer panel without a colour.

Shadows on the public pages are tinted with `--okjt-shadow` (CSS, default
`ink`); dark pages set it to black in their CSS.

Nothing changes on screen unless you set them: `onInk` defaults to white and
`panel` to `ink`, and cards, pills and menus that were white are now
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
