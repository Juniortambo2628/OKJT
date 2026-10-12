# Ops archive

One-off data scripts that are **not** part of the seed pipeline. They were moved
out of `database/seeders/` so they cannot be picked up by `php artisan db:seed`
or by any class-name autoloading.

| File | What it did | Why archived |
|---|---|---|
| `AccurateContentSeeder.php` | `withTrashed()->forceDelete()` across stats, values, team_members, testimonials, projects, insights, then re-inserted fixed copy | One-off content push. Referenced by nothing (verified: 0 hits in `DatabaseSeeder`, migrations, routes, app code). Not reversible. |
| `FocusAreasBackfillSeeder.php` | Backfilled `projects.focus_areas` by slug | Superseded by migration `2026_09_14_140000_add_focus_areas_to_projects_table.php`, which backfills the same column. Referenced by nothing. |
| `accurate_content_cleanup.sql` | `DELETE FROM` all testimonials; deleted 2 team members and 3 insights; truncated stats; nullified every `projects.significant_figure` | Manual DBA script. Irreversible. Referenced by nothing. |

## Restoring one

Copy it back into `database/seeders/` (and for the two PHP seeders, back into the
`Database\Seeders` namespace) if the operation ever needs re-running. Review the
data-loss operations listed above first — **none of them are reversible.**

`PortfolioContentSeeder.php` was deliberately **left in `database/seeders/`**:
it is invoked by migration `2026_09_21_120000_populate_portfolio_project_writeups.php`
and is therefore still live.
