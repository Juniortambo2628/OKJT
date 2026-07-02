# Database Schema Reference

This document represents the final canonical schema for all application tables.
Generated after all migrations have been applied.

## Infrastructure Tables

### `password_reset_tokens`
| Column | Type | Constraints |
|--------|------|-------------|
| email | varchar(255) | PK |
| token | varchar(255) | NOT NULL |
| created_at | timestamp | NULLABLE |

### `sessions`
| Column | Type | Constraints |
|--------|------|-------------|
| id | varchar(255) | PK |
| user_id | bigint | NULLABLE, INDEX |
| ip_address | varchar(45) | NULLABLE |
| user_agent | text | NULLABLE |
| payload | longText | NOT NULL |
| last_activity | int | NOT NULL, INDEX |

### `cache`
| Column | Type | Constraints |
|--------|------|-------------|
| key | varchar(255) | PK |
| value | mediumText | NOT NULL |
| expiration | int | NOT NULL |

### `cache_locks`
| Column | Type | Constraints |
|--------|------|-------------|
| key | varchar(255) | PK |
| owner | varchar(255) | NOT NULL |
| expiration | int | NOT NULL |

### `jobs`
| Column | Type | Constraints |
|--------|------|-------------|
| id | bigint | PK, auto-increment |
| queue | varchar(255) | NOT NULL, INDEX |
| payload | longText | NOT NULL |
| attempts | tinyint unsigned | NOT NULL |
| reserved_at | int unsigned | NULLABLE |
| available_at | int unsigned | NOT NULL |
| created_at | int unsigned | NOT NULL |

### `job_batches`
| Column | Type | Constraints |
|--------|------|-------------|
| id | varchar(255) | PK |
| name | varchar(255) | NOT NULL |
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
| id | bigint | PK, auto-increment |
| uuid | varchar(255) | NOT NULL, UNIQUE |
| connection | text | NOT NULL |
| queue | text | NOT NULL |
| payload | longText | NOT NULL |
| exception | longText | NOT NULL |
| failed_at | timestamp | DEFAULT CURRENT_TIMESTAMP |

### `personal_access_tokens`
| Column | Type | Constraints |
|--------|------|-------------|
| id | bigint | PK, auto-increment |
| tokenable_type | varchar(255) | NOT NULL (MORPH type) |
| tokenable_id | bigint | NOT NULL (MORPH id) |
| name | varchar(255) | NOT NULL |
| token | varchar(64) | NOT NULL, UNIQUE |
| abilities | text | NULLABLE |
| last_used_at | timestamp | NULLABLE |
| expires_at | timestamp | NULLABLE, INDEX |
| created_at | timestamp | NULLABLE |
| updated_at | timestamp | NULLABLE |

## Application Tables

### `users`
| Column | Type | Constraints |
|--------|------|-------------|
| id | bigint | PK, auto-increment |
| name | varchar(255) | NOT NULL |
| email | varchar(255) | NOT NULL, UNIQUE |
| email_verified_at | timestamp | NULLABLE |
| password | varchar(255) | NOT NULL |
| remember_token | varchar(100) | NULLABLE |
| created_at | timestamp | NULLABLE |
| updated_at | timestamp | NULLABLE |

### `services`
| Column | Type | Constraints |
|--------|------|-------------|
| id | bigint | PK, auto-increment |
| title | varchar(255) | NOT NULL |
| slug | varchar(255) | NOT NULL, UNIQUE |
| category | varchar(255) | NOT NULL |
| description | text | NULLABLE |
| content | longText | NULLABLE |
| icon | varchar(255) | NULLABLE |
| image | varchar(255) | NULLABLE |
| is_active | boolean | DEFAULT TRUE |
| pillar_id | bigint | FK -> pillars.id, ON DELETE SET NULL, NULLABLE |
| created_at | timestamp | NULLABLE |
| updated_at | timestamp | NULLABLE |
| deleted_at | timestamp | NULLABLE (SoftDeletes) |

**Indexes:** UNIQUE(slug), INDEX(is_active), FULLTEXT(title, description, category)

### `insights`
| Column | Type | Constraints |
|--------|------|-------------|
| id | bigint | PK, auto-increment |
| title | varchar(255) | NOT NULL |
| slug | varchar(255) | NOT NULL, UNIQUE |
| category | varchar(255) | NULLABLE |
| excerpt | text | NULLABLE |
| content | longText | NOT NULL |
| image | varchar(255) | NULLABLE |
| user_id | bigint | FK -> users.id, ON DELETE CASCADE, NOT NULL |
| is_published | boolean | DEFAULT FALSE |
| published_at | timestamp | NULLABLE |
| created_at | timestamp | NULLABLE |
| updated_at | timestamp | NULLABLE |
| deleted_at | timestamp | NULLABLE (SoftDeletes) |

**Indexes:** UNIQUE(slug), INDEX(is_published, published_at), FULLTEXT(title, excerpt, category)

### `projects`
| Column | Type | Constraints |
|--------|------|-------------|
| id | bigint | PK, auto-increment |
| type | varchar(255) | DEFAULT 'client' |
| title | varchar(255) | NOT NULL |
| slug | varchar(255) | NOT NULL, UNIQUE |
| client_name | varchar(255) | NULLABLE |
| tagline | varchar(255) | NULLABLE |
| category | varchar(255) | NULLABLE |
| technologies | json | NULLABLE |
| significant_figure | varchar(255) | NULLABLE |
| description | text | NULLABLE |
| problem | text | NULLABLE |
| methodology | text | NULLABLE |
| outcome | text | NULLABLE |
| testimonial_quote | text | NULLABLE |
| testimonial_author | varchar(255) | NULLABLE |
| image | varchar(255) | NULLABLE |
| gallery | json | NULLABLE |
| url | varchar(255) | NULLABLE |
| is_active | boolean | DEFAULT TRUE |
| is_featured | boolean | DEFAULT FALSE |
| order | integer | DEFAULT 0 |
| created_at | timestamp | NULLABLE |
| updated_at | timestamp | NULLABLE |
| deleted_at | timestamp | NULLABLE (SoftDeletes) |

**Indexes:** UNIQUE(slug), INDEX(type), INDEX(is_active), INDEX(is_featured), INDEX(category), INDEX(order), FULLTEXT(title, client_name, category)

### `pillars`
| Column | Type | Constraints |
|--------|------|-------------|
| id | bigint | PK, auto-increment |
| title | varchar(255) | NOT NULL |
| slug | varchar(255) | NOT NULL, UNIQUE |
| overview | text | NULLABLE |
| content | longText | NULLABLE |
| icon | varchar(255) | NULLABLE |
| image | varchar(255) | NULLABLE |
| is_active | boolean | DEFAULT TRUE |
| created_at | timestamp | NULLABLE |
| updated_at | timestamp | NULLABLE |
| deleted_at | timestamp | NULLABLE (SoftDeletes) |

**Indexes:** UNIQUE(slug), INDEX(is_active)

### `stats`
| Column | Type | Constraints |
|--------|------|-------------|
| id | bigint | PK, auto-increment |
| label | varchar(255) | NOT NULL |
| value | varchar(255) | NOT NULL |
| description | text | NULLABLE |
| icon | varchar(255) | NULLABLE |
| order | integer | DEFAULT 0 |
| created_at | timestamp | NULLABLE |
| updated_at | timestamp | NULLABLE |
| deleted_at | timestamp | NULLABLE (SoftDeletes) |

**Indexes:** INDEX(order)

### `testimonials`
| Column | Type | Constraints |
|--------|------|-------------|
| id | bigint | PK, auto-increment |
| name | varchar(255) | NOT NULL |
| role | varchar(255) | NOT NULL |
| company | varchar(255) | NOT NULL |
| quote | text | NOT NULL |
| avatar | varchar(255) | NULLABLE |
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
| id | bigint | PK, auto-increment |
| name | varchar(255) | NOT NULL |
| logo | varchar(255) | NULLABLE |
| website | varchar(255) | NULLABLE |
| category | varchar(255) | NULLABLE |
| is_active | boolean | DEFAULT TRUE |
| order | integer | DEFAULT 0 |
| created_at | timestamp | NULLABLE |
| updated_at | timestamp | NULLABLE |
| deleted_at | timestamp | NULLABLE (SoftDeletes) |

**Indexes:** INDEX(is_active), INDEX(order)

### `team_members`
| Column | Type | Constraints |
|--------|------|-------------|
| id | bigint | PK, auto-increment |
| name | varchar(255) | NOT NULL |
| role | varchar(255) | NOT NULL |
| bio | text | NULLABLE |
| qualifications | varchar(255) | NULLABLE |
| linkedin | varchar(255) | NULLABLE |
| image | varchar(255) | NULLABLE |
| order | integer | DEFAULT 0 |
| created_at | timestamp | NULLABLE |
| updated_at | timestamp | NULLABLE |
| deleted_at | timestamp | NULLABLE (SoftDeletes) |

**Indexes:** INDEX(order)

### `values`
| Column | Type | Constraints |
|--------|------|-------------|
| id | bigint | PK, auto-increment |
| icon | varchar(255) | NULLABLE |
| title | varchar(255) | NOT NULL |
| description | text | NOT NULL |
| order | integer | DEFAULT 0 |
| created_at | timestamp | NULLABLE |
| updated_at | timestamp | NULLABLE |
| deleted_at | timestamp | NULLABLE (SoftDeletes) |

**Indexes:** INDEX(order)

### `site_settings`
| Column | Type | Constraints |
|--------|------|-------------|
| id | bigint | PK, auto-increment |
| key | varchar(255) | NOT NULL, UNIQUE |
| value | text | NULLABLE |
| type | varchar(255) | DEFAULT 'text' |
| group | varchar(255) | DEFAULT 'general' |
| created_at | timestamp | NULLABLE |
| updated_at | timestamp | NULLABLE |

**Indexes:** UNIQUE(key)

### `subscribers`
| Column | Type | Constraints |
|--------|------|-------------|
| id | bigint | PK, auto-increment |
| email | varchar(255) | NOT NULL, UNIQUE |
| name | varchar(255) | NULLABLE |
| source | varchar(255) | DEFAULT 'footer' |
| is_active | boolean | DEFAULT TRUE |
| created_at | timestamp | NULLABLE |
| updated_at | timestamp | NULLABLE |

**Indexes:** UNIQUE(email), INDEX(is_active, created_at)

### `consultation_requests`
| Column | Type | Constraints |
|--------|------|-------------|
| id | bigint | PK, auto-increment |
| first_name | varchar(255) | NOT NULL |
| last_name | varchar(255) | NOT NULL |
| email | varchar(255) | NOT NULL |
| subject | varchar(255) | NULLABLE |
| message | text | NOT NULL |
| status | varchar(255) | DEFAULT 'pending' |
| created_at | timestamp | NULLABLE |
| updated_at | timestamp | NULLABLE |

**Indexes:** INDEX(status), INDEX(status, created_at)
**Status values:** pending, contacted, resolved, archived

### `rsvps`
| Column | Type | Constraints |
|--------|------|-------------|
| id | bigint | PK, auto-increment |
| name | varchar(255) | NOT NULL |
| email | varchar(255) | NOT NULL, UNIQUE |
| company | varchar(255) | NULLABLE |
| job_title | varchar(255) | NULLABLE |
| sector | varchar(255) | NULLABLE |
| interest | varchar(255) | NULLABLE |
| consent | boolean | DEFAULT FALSE |
| newsletter | boolean | DEFAULT FALSE |
| attendance | varchar(255) | NULLABLE |
| type | varchar(255) | DEFAULT 'early_access' |
| created_at | timestamp | NULLABLE |
| updated_at | timestamp | NULLABLE |

**Indexes:** UNIQUE(email), INDEX(type), INDEX(type, attendance), INDEX(email, type)
**Type values:** early_access, rsvp
**Attendance values:** accept, decline, null

### `page_views`
| Column | Type | Constraints |
|--------|------|-------------|
| id | bigint | PK, auto-increment |
| path | varchar(255) | NOT NULL |
| referrer | varchar(255) | NULLABLE |
| user_agent | varchar(255) | NULLABLE |
| ip | varchar(45) | NULLABLE |
| country | varchar(255) | NULLABLE |
| created_at | timestamp | NULLABLE |
| updated_at | timestamp | NULLABLE |

**Indexes:** INDEX(created_at), INDEX(path), INDEX(ip), INDEX(path, created_at)

## Foreign Key Summary

| Child Table | Column | Parent Table | On Delete |
|-------------|--------|-------------|-----------|
| sessions | user_id | users | (implicit) |
| insights | user_id | users | CASCADE |
| services | pillar_id | pillars | SET NULL |

## Relationship Diagram

```
User ──hasMany──> Insight
Pillar ──hasMany──> Service
```
