# OKJT

This repository holds OKJTech's own site (`okjt-app/`), the deploy kit
(`deploy-kit/`) and **the OKJT kit** (`packages/`): the shared packages every
OKJTech product is built on.

| Package | What |
|---|---|
| `@okjt/ui` | theme tokens, primitives (buttons, dialogs, menus), feedback, permissions |
| `@okjt/site` | public pages: layout, nav, footer, sections, SEO |
| `@okjt/dashboard` | dashboard shell, page layout, toolbar, lists, collaboration, sign-in |
| `okjt/laravel-kit` | server: workspaces and roles, auth, revisions, billing, security headers |
| `create-okjt-app` | the installer for new projects |

Projects using the kit: **Naoa** and **Najenga** (fully), **Tena-host**
(public pages only, through Inertia), **okjt-app** (linked from `packages/`).
**TFE** and **naoa-dt** don't use it yet. Read `packages/SPEC.md` for how the
kit came about and `packages/CONSOLIDATION_PLAN.md` for what is being brought
into it now and in what order.

## Every change to the kit

A kit change reaches every project, so each one does all of this, without
being asked:

0. **Before starting, check open pull requests here** (and recent commits on
   `main`) that touch the same packages. If one is already doing the work,
   build on it or fold it in, and say so; don't start a second copy. (R1 was
   started beside OKJT#44, which fixed the same gaps, and the two had to be
   merged afterwards.)
1. **One change per commit**, and the commit message says which project it
   came from and why.
2. **Tests**, in the package's own suite. For a bug fix, check the new test
   fails on the old code (say so in the commit).
3. **Nothing changes on screen unless a project asks for it.** A new look or
   behaviour is an option whose default is today's. Prove it: build the
   changed components with the kit before and after, capture every element's
   computed styles with `packages/ui/tools/style-snapshot.mjs` at 1280 and
   390 px, and compare. Then calibrate: make one deliberate change and check
   the comparison reports it. Put the result in the plan or the PR.
4. **Version bump** for each package that changed, and `packages/VERSION` for
   the release. While versions start with 0, a new option is a minor bump
   (`0.4` → `0.5`), because projects' `^0.4` ranges won't pick it up by
   themselves.
5. **`packages/UPGRADING.md`** entry: what to install, anything a project
   must do, and each new option with how to use it.
6. **`packages/CONSOLIDATION_PLAN.md`**: tick what was done and write what
   changed from the plan and anything found on the way.
7. Run `npm test` in `packages/` and `vendor/bin/phpunit` in
   `packages/laravel-kit/`, then open a pull request.

Lift, don't rewrite: when a project has already built the thing, take its
version and its tests, and generalise only what is project-specific.

Payments, sign-in, security headers and personal data: say so in the PR
title ("Needs Kevin") and wait for Kevin's review.

## Releasing

Done by a person, in this order:

1. Merge the pull request into `main`. **Packages CI** and **Kit consumers**
   (below) must be green.
2. Nothing to tag: because `packages/VERSION` changed, **Packages release**
   tags `v<VERSION>`, makes the GitHub release, stages the npm packages and
   copies `laravel-kit` to `Juniortambo2628/okjt-laravel-kit` (Packagist
   picks it up).
3. Approve the staged versions on npmjs.com → Staged Packages (two-step
   sign-in). Claude can't do this.
4. Dependabot opens the version-bump PR in each project that uses the kit.

## After a release

Without being asked, Claude then opens the update in each project that uses
the kit (Najenga, Naoa, then Tena-host, okjt-app), building on Dependabot's
PR where there is one. Each update:

- raises the kit versions and follows the `UPGRADING.md` entry;
- **deletes the project's own copy** of anything the kit now provides
  (the plan lists them per release);
- runs the project's checks (tests, lint, build) and its visual tests, and
  puts desktop and 390 px screenshots in the PR;
- follows that project's own CLAUDE.md (Tena-host: "Needs Kevin" for its
  high-risk areas).

## Kit consumers check

`.github/workflows/packages-consumers.yml` runs on every pull request that
touches `packages/`. It builds the kit from the PR and installs it into the
current `main` of Naoa and Najenga. Then it runs their JS tests and build,
their PHP tests against the PR's `laravel-kit`, and Naoa's Playwright visual
suite. A failure there means the kit change would break or change a project.
Fix the kit, or, if the project relied on a bug, say so in the PR.

It reads the other repositories with the `CONSUMERS_TOKEN` secret (a
fine-grained token with read access to Naoa and Najenga) when they are
private.

## What Claude can't do here

Merge, approve npm releases, push to `main`, or change repository settings
and secrets. It asks for those.
