# create-okjt-app

Starts an OKJTech project: a Laravel 12 API on
[`okjt/laravel-kit`](https://packagist.org/packages/okjt/laravel-kit) and a
React 19 app on [`@okjt/site`](https://www.npmjs.com/package/@okjt/site) and
[`@okjt/dashboard`](https://www.npmjs.com/package/@okjt/dashboard), with your
name, colours, roles and features, and a workflow that tests and deploys it.

```bash
npm create okjt-app@latest bloom
```

Needs Node 20+, PHP 8.2+ and Composer.

## What it asks

| Question | Becomes |
|---|---|
| Name, domain, one line about it | The public pages, the SEO, the deploy workflow |
| Brand colour and text colour | The whole palette in `frontend/okjt.config.js` (17 colours mixed from the two; edit any) |
| What people work on together | The workspace: "project" makes `Project`, `projects`, `project_user`, `/projects` |
| Roles | `full`: superadmin › account owner / staff › owner / editor / viewer. `standard`: superadmin › owner / editor / viewer. `simple`: admin › user |
| Features | `google`, `passkeys`, `backups`, `console` (superadmin presets), `billing` (Paystack; `full` only) |

Or answer with flags, for scripts:

```bash
npm create okjt-app@latest bloom -- --yes --name "Bloom" --accent "#0F766E" --preset full --features google,console,billing
```

`--no-install` writes the files only; `--no-checks` skips running the tests and the build.

## What you get

```
bloom/
  backend/    Laravel 12 + okjt/laravel-kit: sign-in, two-step codes, email
              verification, workspaces and roles, sharing and invitations,
              presence, version history, notifications, and the features you
              chose; a starter Notes module with its tests; SQLite locally
  frontend/   React 19 + Vite + Tailwind 4: the home page, sign-in and sign-up,
              your workspaces, and the dashboard (overview and notes)
  .github/workflows/deploy.yml   tests both, then deploys through deploy-kit
  README.md   running it, where things are, adding a module, deploying
```

It installs everything, migrates, creates the first user (printed at the end,
from `backend/.env`), runs the API's tests and builds the app.
