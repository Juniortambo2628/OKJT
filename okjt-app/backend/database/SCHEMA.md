# Database Schema Reference

This document represents the final canonical schema for all application tables.
Generated after all migrations have been applied.

**Verified against:** a fresh `php artisan migrate` on MySQL 8.4 (all 44
migrations), cross-checked column by column against `information_schema`.

**Storage engine:** no migration pins an engine, so every table inherits the
server's `default_storage_engine`. The local WAMP instance runs MyISAM, which
means the foreign keys declared below are downgraded by MySQL to plain `KEY`
entries - see [Foreign Key Summary](#foreign-key-summary). Confirm the engine
on production before relying on referential integrity or transactions.

**String width:** all string columns are `varchar(191)`, not `varchar(255)`.
utf8mb4 stores 4 bytes per character and Laravel sizes indexed strings to
191 so a unique index stays inside the 3072-byte InnoDB / 1000-byte MyISAM
key limit.

## Infrastructure Tables

### `migrations`
| Column | Type | Constraints |
|--------|------|-------------|
| id | int unsigned | PK, auto-increment |
| migration | varchar(191) | NOT NULL |
| batch | int | NOT NULL |

### `password_reset_tokens`
| Column | Type | Constraints |
|--------|------|-------------|
| email | varchar(191) | PK |
| token | varchar(191) | NOT NULL |
| created_at | timestamp | NULLABLE |

### `sessions`
| Column | Type | Constraints |
|--------|------|-------------|
| id | varchar(191) | PK |
| user_id | bigint unsigned | NULLABLE, INDEX |
| ip_address | varchar(45) | NULLABLE |
| user_agent | text | NULLABLE |
| payload | longText | NOT NULL |
| last_activity | int | NOT NULL, INDEX |

### `cache`
| Column | Type | Constraints |
|--------|------|-------------|
| key | varchar(191) | PK |
| value | mediumText | NOT NULL |
| expiration | int | NOT NULL |

### `cache_locks`
| Column | Type | Constraints |
|--------|------|-------------|
| key | varchar(191) | PK |
| owner | varchar(191) | NOT NULL |
| expiration | int | NOT NULL |

### `jobs`
| Column | Type | Constraints |
|--------|------|-------------|
| id | bigint unsigned | PK, auto-increment |
| queue | varchar(191) | NOT NULL, INDEX |
| payload | longText | NOT NULL |
| attempts | tinyint unsigned | NOT NULL |
| reserved_at | int unsigned | NULLABLE |
| available_at | int unsigned | NOT NULL |
| created_at | int unsigned | NOT NULL |

### `job_batches`
| Column | Type | Constraints |
|--------|------|-------------|
| id | varchar(191) | PK |
| name | varchar(191) | NOT NULL |
| total_jobs | int | NOT NULL |
| pending_jobs | int | NOT NULL |
| failed_jobs | int | NOT NULL |
| failed_job_ids | longText | NOT NULL |
| options | mediumText | NULLABLE |
| cancelled_at | int | NULLABLE |
| created_at | int | NOT NULL |
| finished_at | int | NULLABLE |

### `failed_jobs`
| Column | Type | Constraints |
|--------|------|-------------|
| id | bigint unsigned | PK, auto-increment |
| uuid | varchar(191) | NOT NULL, UNIQUE |
| connection | text | NOT NULL |
| queue | text | NOT NULL |
| payload | longText | NOT NULL |
| exception | longText | NOT NULL |
| failed_at | timestamp | DEFAULT CURRENT_TIMESTAMP |

### `personal_access_tokens`
| Column | Type | Constraints |
|--------|------|-------------|
| id | bigint unsigned | PK, auto-increment |
| tokenable_type | varchar(191) | NOT NULL (MORPH type) |
| tokenable_id | bigint unsigned | NOT NULL (MORPH id) |
| name | text | NOT NULL |
| token | varchar(64) | NOT NULL, UNIQUE |
| abilities | text | NULLABLE |
| last_used_at | timestamp | NULLABLE |
| expires_at | timestamp | NULLABLE, INDEX |
| created_at | timestamp | NULLABLE |
| updated_at | timestamp | NULLABLE |

**Indexes:** UNIQUE(token), INDEX(expires_at), INDEX(tokenable_type, tokenable_id)

## Application Tables

### `users`
| Column | Type | Constraints |
|--------|------|-------------|
| id | bigint unsigned | PK, auto-increment |
| name | varchar(191) | NOT NULL |
| email | varchar(191) | NOT NULL, UNIQUE |
| email_verified_at | timestamp | NULLABLE |
| password | varchar(191) | NOT NULL |
| is_admin | boolean | DEFAULT FALSE |
| remember_token | varchar(100) | NULLABLE |
| created_at | timestamp | NULLABLE |
| updated_at | timestamp | NULLABLE |
| deleted_at | timestamp | NULLABLE (SoftDeletes) |

**Indexes:** UNIQUE(email)

### `services`
| Column | Type | Constraints |
|--------|------|-------------|
| id | bigint unsigned | PK, auto-increment |
| title | varchar(191) | NOT NULL |
| slug | varchar(191) | NOT NULL, UNIQUE |
| category | varchar(191) | NOT NULL |
| description | text | NULLABLE |
| content | longText | NULLABLE |
| icon | varchar(191) | NULLABLE |
| image | varchar(191) | NULLABLE |
| is_active | boolean | DEFAULT TRUE |
| created_at | timestamp | NULLABLE |
| updated_at | timestamp | NULLABLE |
| pillar_id | bigint unsigned | NULLABLE, INDEX |
| deleted_at | timestamp | NULLABLE (SoftDeletes) |

**Indexes:** UNIQUE(slug), INDEX(is_active), INDEX(pillar_id), FULLTEXT(title, description, category)
**Notes:** `pillar_id` is appended after `updated_at` because it was added by a
later migration, and carries a key named `services_pillar_id_foreign`.

### `insights`
| Column | Type | Constraints |
|--------|------|-------------|
| id | bigint unsigned | PK, auto-increment |
| title | varchar(191) | NOT NULL |
| slug | varchar(191) | NOT NULL, UNIQUE |
| category | varchar(191) | NULLABLE |
| excerpt | text | NULLABLE |
| content | longText | NOT NULL |
| image | varchar(191) | NULLABLE |
| user_id | bigint unsigned | NOT NULL, INDEX |
| is_published | boolean | DEFAULT FALSE |
| published_at | timestamp | NULLABLE |
| created_at | timestamp | NULLABLE |
| updated_at | timestamp | NULLABLE |
| deleted_at | timestamp | NULLABLE (SoftDeletes) |

**Indexes:** UNIQUE(slug), INDEX(is_published, published_at), INDEX(user_id), FULLTEXT(title, excerpt, category)

### `projects`
| Column | Type | Constraints |
|--------|------|-------------|
| id | bigint unsigned | PK, auto-increment |
| type | varchar(191) | DEFAULT 'client' |
| title | varchar(191) | NOT NULL |
| slug | varchar(191) | NOT NULL, UNIQUE |
| client_name | varchar(191) | NULLABLE |
| tagline | varchar(191) | NULLABLE |
| category | varchar(191) | NULLABLE |
| technologies | json | NULLABLE |
| focus_areas | json | NULLABLE |
| significant_figure | varchar(191) | NULLABLE |
| description | text | NULLABLE |
| problem | text | NULLABLE |
| methodology | text | NULLABLE |
| outcome | text | NULLABLE |
| testimonial_quote | text | NULLABLE |
| testimonial_author | varchar(191) | NULLABLE |
| image | varchar(191) | NULLABLE |
| bg_image | varchar(191) | NULLABLE |
| gallery | json | NULLABLE |
| url | varchar(191) | NULLABLE |
| is_active | boolean | DEFAULT TRUE |
| is_featured | boolean | DEFAULT FALSE |
| order | integer | DEFAULT 0 |
| created_at | timestamp | NULLABLE |
| updated_at | timestamp | NULLABLE |
| deleted_at | timestamp | NULLABLE (SoftDeletes) |

**Indexes:** UNIQUE(slug), INDEX(type), INDEX(is_active), INDEX(is_featured), INDEX(category), INDEX(order), FULLTEXT(title, client_name, category)
**Notes:** `focus_areas` and `bg_image` are appended after their neighbouring
columns because they were added by later migrations. `website_url` was dropped
in favour of a single nullable `url`.

### `pillars`
| Column | Type | Constraints |
|--------|------|-------------|
| id | bigint unsigned | PK, auto-increment |
| title | varchar(191) | NOT NULL |
| slug | varchar(191) | NOT NULL, UNIQUE |
| overview | text | NULLABLE |
| content | longText | NULLABLE |
| icon | varchar(191) | NULLABLE |
| image | varchar(191) | NULLABLE |
| is_active | boolean | DEFAULT TRUE |
| created_at | timestamp | NULLABLE |
| updated_at | timestamp | NULLABLE |
| deleted_at | timestamp | NULLABLE (SoftDeletes) |

**Indexes:** UNIQUE(slug), INDEX(is_active)

### `stats`
| Column | Type | Constraints |
|--------|------|-------------|
| id | bigint unsigned | PK, auto-increment |
| label | varchar(191) | NOT NULL |
| value | varchar(191) | NOT NULL |
| description | text | NULLABLE |
| icon | varchar(191) | NULLABLE |
| order | integer | DEFAULT 0 |
| created_at | timestamp | NULLABLE |
| updated_at | timestamp | NULLABLE |
| deleted_at | timestamp | NULLABLE (SoftDeletes) |

**Indexes:** INDEX(order)

### `testimonials`
| Column | Type | Constraints |
|--------|------|-------------|
| id | bigint unsigned | PK, auto-increment |
| name | varchar(191) | NOT NULL |
| role | varchar(191) | NOT NULL |
| company | varchar(191) | NOT NULL |
| quote | text | NOT NULL |
| avatar | varchar(191) | NULLABLE |
| rating | integer | DEFAULT 5 |
| is_featured | boolean | DEFAULT TRUE |
| order | integer | DEFAULT 0 |
| created_at | timestamp | NULLABLE |
| updated_at | timestamp | NULLABLE |
| deleted_at | timestamp | NULLABLE (SoftDeletes) |

**Indexes:** INDEX(is_featured), INDEX(order)

### `clients`
| Column | Type | Constraints |
|--------|------|-------------|
| id | bigint unsigned | PK, auto-increment |
| name | varchar(191) | NOT NULL |
| logo | varchar(191) | NULLABLE |
| website | varchar(191) | NULLABLE |
| category | varchar(191) | NULLABLE |
| is_active | boolean | DEFAULT TRUE |
| order | integer | DEFAULT 0 |
| created_at | timestamp | NULLABLE |
| updated_at | timestamp | NULLABLE |
| deleted_at | timestamp | NULLABLE (SoftDeletes) |

**Indexes:** INDEX(is_active), INDEX(order)

### `team_members`
| Column | Type | Constraints |
|--------|------|-------------|
| id | bigint unsigned | PK, auto-increment |
| name | varchar(191) | NOT NULL |
| role | varchar(191) | NOT NULL |
| bio | text | NULLABLE |
| linkedin | varchar(191) | NULLABLE |
| image | varchar(191) | NULLABLE |
| order | integer | DEFAULT 0 |
| created_at | timestamp | NULLABLE |
| updated_at | timestamp | NULLABLE |
| deleted_at | timestamp | NULLABLE (SoftDeletes) |

**Notes:** `qualifications` was dropped by a later migration.
**Indexes:** INDEX(order)

### `values`
| Column | Type | Constraints |
|--------|------|-------------|
| id | bigint unsigned | PK, auto-increment |
| icon | varchar(191) | NULLABLE |
| title | varchar(191) | NOT NULL |
| description | text | NOT NULL |
| order | integer | DEFAULT 0 |
| created_at | timestamp | NULLABLE |
| updated_at | timestamp | NULLABLE |
| deleted_at | timestamp | NULLABLE (SoftDeletes) |

**Indexes:** INDEX(order)

### `site_settings`
| Column | Type | Constraints |
|--------|------|-------------|
| id | bigint unsigned | PK, auto-increment |
| key | varchar(191) | NOT NULL, UNIQUE |
| value | text | NULLABLE |
| type | varchar(191) | DEFAULT 'text' |
| group | varchar(191) | DEFAULT 'general' |
| created_at | timestamp | NULLABLE |
| updated_at | timestamp | NULLABLE |

**Indexes:** UNIQUE(key), INDEX(group)

### `subscribers`
| Column | Type | Constraints |
|--------|------|-------------|
| id | bigint unsigned | PK, auto-increment |
| email | varchar(191) | NOT NULL, UNIQUE |
| name | varchar(191) | NULLABLE |
| source | varchar(191) | DEFAULT 'footer' |
| is_active | boolean | DEFAULT TRUE |
| created_at | timestamp | NULLABLE |
| updated_at | timestamp | NULLABLE |
| deleted_at | timestamp | NULLABLE (SoftDeletes) |

**Indexes:** UNIQUE(email), INDEX(is_active, created_at)

### `consultation_requests`
| Column | Type | Constraints |
|--------|------|-------------|
| id | bigint unsigned | PK, auto-increment |
| first_name | varchar(191) | NOT NULL |
| last_name | varchar(191) | NOT NULL |
| email | varchar(191) | NOT NULL |
| subject | varchar(191) | NULLABLE |
| message | text | NOT NULL |
| status | varchar(191) | DEFAULT 'pending' |
| created_at | timestamp | NULLABLE |
| updated_at | timestamp | NULLABLE |
| deleted_at | timestamp | NULLABLE (SoftDeletes) |

**Indexes:** INDEX(status), INDEX(status, created_at)
**Status values:** pending, contacted, resolved, archived

### `rsvps`
| Column | Type | Constraints |
|--------|------|-------------|
| id | bigint unsigned | PK, auto-increment |
| name | varchar(191) | NOT NULL |
| email | varchar(191) | NOT NULL, UNIQUE |
| company | varchar(191) | NULLABLE |
| job_title | varchar(191) | NULLABLE |
| sector | varchar(191) | NULLABLE |
| interest | varchar(191) | NULLABLE |
| consent | boolean | DEFAULT FALSE |
| newsletter | boolean | DEFAULT FALSE |
| attendance | varchar(191) | NULLABLE |
| type | varchar(191) | DEFAULT 'early_access' |
| created_at | timestamp | NULLABLE |
| updated_at | timestamp | NULLABLE |
| deleted_at | timestamp | NULLABLE (SoftDeletes) |

**Indexes:** UNIQUE(email), INDEX(type)
**Type values:** early_access, rsvp
**Attendance values:** accepted, declined, null

> `2026_06_25_100750` also requests `INDEX(type, attendance)` and
> `INDEX(email, type)`. Neither exists. Each composite is two `varchar(191)`
> utf8mb4 columns - 1528 bytes - which exceeds MyISAM's 1000-byte key limit,
> so MySQL rejects them with `ERROR 1071` and the migration's bare
> `catch (Exception $e) {}` swallows the failure. They will be created
> automatically once the tables are InnoDB.

### `page_views`
| Column | Type | Constraints |
|--------|------|-------------|
| id | bigint unsigned | PK, auto-increment |
| path | varchar(191) | NOT NULL |
| referrer | varchar(191) | NULLABLE |
| user_agent | varchar(191) | NULLABLE |
| ip | varchar(45) | NULLABLE |
| country | varchar(191) | NULLABLE |
| created_at | timestamp | NULLABLE |
| updated_at | timestamp | NULLABLE |

**Indexes:** INDEX(created_at), INDEX(path), INDEX(ip), INDEX(path, created_at)

## Foreign Key Summary

| Child Table | Column | Parent Table | On Delete | Enforced |
|-------------|--------|-------------|-----------|----------|
| sessions | user_id | users | (implicit) | no |
| insights | user_id | users | CASCADE | no |
| services | pillar_id | pillars | SET NULL | no |

**Enforced = no.** The keys above are declared in the migrations and MySQL
creates an entry named `*_foreign` for each, but because the tables are MyISAM
the constraint itself is discarded: `information_schema.referential_constraints`
is empty and `SHOW CREATE TABLE` shows only a plain `KEY`. Deleting a parent
row therefore does **not** cascade or null the children today.

Re-run `2026_06_25_100409_add_foreign_keys_to_core_tables` after converting the
tables to InnoDB to make the constraints real. Laravel also declares soft-delete
morph relations and other logical relationships that live in application code
rather than the database.

## Relationship Diagram

```
User ──hasMany──> Insight
Pillar ──hasMany──> Service
```
