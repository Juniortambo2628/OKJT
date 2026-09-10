-- =====================================================================
-- accurate_content_cleanup.sql
--
-- Fallback for the AccurateContentSeeder. Use this ONLY if you can't run
-- `php artisan db:seed --class=AccurateContentSeeder` in production.
--
-- What this does:
--   1. Removes the fabricated testimonials, team members and stats.
--   2. Rewrites the About page copy in site_settings (idempotent).
--   3. Neutralises the fake `projects.significant_figure` hero metrics.
--
-- What it deliberately does NOT do:
--   - It does NOT insert the full project catalog or the insight articles
--     — those are large and easier to insert via the Laravel seeder.
--
-- Run in phpMyAdmin (or `mysql -u ... okjtech_db < accurate_content_cleanup.sql`).
-- Take a backup first: `mysqldump okjtech_db > backup_before_reseed.sql`
-- =====================================================================

START TRANSACTION;

-- ---------------------------------------------------------------------
-- 1. Hard-delete every fabricated testimonial. Real testimonials will
--    only ever be added later, in the client's own words, with consent.
-- ---------------------------------------------------------------------
DELETE FROM `testimonials`;

-- ---------------------------------------------------------------------
-- 2. Hard-delete the fabricated team members. OKJTechnologies is a
--    one-person studio.
--
--    Row 1 (Kevin Tambo) is kept but rewritten below.
-- ---------------------------------------------------------------------
DELETE FROM `team_members`
WHERE `name` IN ('Eluid Kibet', 'Brenda Wanjiku');

UPDATE `team_members`
   SET `role`     = 'Founder · Web Application Developer',
       `bio`      = CONCAT(
         'Founder of OKJTechnologies. I design, build, deploy and administer full-stack web applications for clients across LegalTech, HealthTech, PropTech, FinTech, e-commerce, events and non-profit sectors, working solo in Laravel, Next.js / React and the classic LAMP stack.\n\n',
         'My approach is shaped by an ecosystem-mapping practice I picked up on the Afrilabs capacity-building programme in Addis Ababa: before writing code I map every stakeholder the software touches — client, end user, regulator, partner, community — and design the system so each has an aligned reason to participate.\n\n',
         'Before OKJTechnologies I was Software Developer, Justice Innovation at the Lawyers Hub, where I spearheaded the Digital Policy site, designed the Africa Law Tech Festival and AI Policy Lab platforms, chaired a hackathon at ALTF 2023, and supported delivery of the Africa Digital Policy Institute''s data-protection trainings (Africa Data Protection Course and CIPP/E).'
       ),
       `linkedin` = 'https://www.linkedin.com/in/kevin-tambo'
 WHERE `name` = 'Kevin Tambo';

-- ---------------------------------------------------------------------
-- 3. Replace the fabricated stats with honest, defensible ones.
-- ---------------------------------------------------------------------
DELETE FROM `stats`;

INSERT INTO `stats` (`label`, `value`, `description`, `icon`, `order`, `created_at`, `updated_at`) VALUES
  ('Building for the web',    'Since 2021',                  'Full-time web application development from Nairobi.', 'Calendar', 1, NOW(), NOW()),
  ('Studio + client projects','20+',                          'Shipped across LegalTech, HealthTech, PropTech, FinTech, e-commerce, events and NGO work.', 'Layers',  2, NOW(), NOW()),
  ('Primary stack',           'Laravel · Next.js · React',    'Plus LAMP for classic client work, and AI-accelerated tooling in the loop.', 'Code2',   3, NOW(), NOW()),
  ('Studio headcount',        'One founder',                  'A deliberate one-person studio. Same person from concept to production.', 'User',    4, NOW(), NOW());

-- ---------------------------------------------------------------------
-- 4. Rewrite the About-page copy in site_settings.
--    Uses ON DUPLICATE KEY UPDATE so it's idempotent.
-- ---------------------------------------------------------------------
INSERT INTO `site_settings` (`key`, `value`, `type`, `group`, `created_at`, `updated_at`) VALUES
  ('about_title',
   'Design-led web engineering,\nbuilt around ecosystems.',
   'textarea', 'about', NOW(), NOW()),
  ('about_tagline',
   'The OKJTechnologies Story',
   'text',     'about', NOW(), NOW()),
  ('about_story',
   'OKJTechnologies is a one-person studio out of Nairobi, run by Kevin Tambo. I build full-stack web applications end to end — concept, UI, engineering, deployment and ongoing administration — mostly in Laravel, Next.js / React and the classic LAMP stack, with AI-accelerated tooling in the loop. Before I write code I map the ecosystem the software has to live in, so every stakeholder — client, end user, regulator, adjacent partner — has an aligned reason to participate.',
   'textarea', 'about', NOW(), NOW()),
  ('about_mission_title',
   'Ecosystem mapping before a line of code.',
   'text',     'about', NOW(), NOW()),
  ('about_mission_text1',
   'The way I approach every engagement is shaped by an ecosystem-mapping practice I picked up on the Afrilabs capacity-building programme <em>Leveraging Stakeholder Relationships through Ecosystem Mapping and Building</em> (Addis Ababa, Ethiopia), which I attended and earned a certificate for while working with the Lawyers Hub. Before scoping, I map out every stakeholder who could be affected by or beneficial to the proposition — the paying client, the end user, the regulator, adjacent service providers, upstream and downstream data holders, the wider community.',
   'textarea', 'about', NOW(), NOW()),
  ('about_mission_text2',
   'I then design the solution so each of those stakeholders has a clearly aligned way to benefit from it. That mapping is what turns a website into a working system inside its own context. Combined with AI-accelerated development, it''s how a one-person studio ships the same class of application a small team would take on.',
   'textarea', 'about', NOW(), NOW()),
  ('about_team_title',
   'One founder. One practitioner. All the accountability.',
   'text',     'about', NOW(), NOW()),
  ('about_team_subtitle',
   'OKJTechnologies is deliberately a one-person studio. Every project is designed, built, deployed and administered by the same person — no hand-offs, no dropped context, one point of accountability from concept to production.',
   'textarea', 'about', NOW(), NOW()),
  ('about_cta_title',
   'Have a system you want built end to end?',
   'text',     'about', NOW(), NOW()),
  ('about_cta_subtitle',
   'Whether it''s a customer-facing application, an internal dashboard, or a national-scale concept still at problem-statement stage, I''d like to hear about it. Start with a short brief and we''ll map the ecosystem together.',
   'textarea', 'about', NOW(), NOW()),

  -- Homepage — drop the "we"/plural framing.
  ('hero_tagline',
   'Design-led web engineering from Nairobi',
   'text', 'homepage', NOW(), NOW()),
  ('hero_subtitle',
   'I design and build bespoke, high-performance web applications, robust APIs and clean admin systems — solo, end to end, in Laravel, Next.js and React.',
   'textarea', 'homepage', NOW(), NOW()),
  ('vp_section_subtitle',
   'Architectural discipline and aesthetic mastery, delivered as one system by one person.',
   'textarea', 'homepage', NOW(), NOW())
ON DUPLICATE KEY UPDATE
   `value`      = VALUES(`value`),
   `type`       = VALUES(`type`),
   `group`      = VALUES(`group`),
   `updated_at` = NOW();

-- ---------------------------------------------------------------------
-- 5. Neutralise the fake per-project "significant_figure" hero metrics.
--    (For example: "100% Real-time Sync", "65% Efficiency Increase",
--    "5k+ Active Moments", "100% Policy Visibility" — none real.)
--
--    The AccurateContentSeeder replaces the whole projects table with
--    an accurate rebuild. This is a lightweight version if you only
--    want to strip the fake numbers today.
-- ---------------------------------------------------------------------
UPDATE `projects`
   SET `significant_figure` = NULL,
       `updated_at` = NOW();

-- ---------------------------------------------------------------------
-- 6. Delete the three fabricated insight articles (about design-led
--    engineering, scaling Laravel APIs, and Next.js App Router web
--    vitals) that were never written by Kevin.
-- ---------------------------------------------------------------------
DELETE FROM `insights`
WHERE `slug` IN (
  'the-power-of-design-led-engineering-in-modern-web-development',
  'scaling-laravel-apis-database-indexing-and-caching-strategies',
  'nextjs-app-router-maximizing-page-load-and-core-web-vitals'
);

COMMIT;

-- =====================================================================
-- Done.
--
-- After running this, verify the About page reloads with the ecosystem
-- mapping copy, that stats show four honest rows, that testimonials are
-- empty, and that only Kevin Tambo appears in team members.
--
-- If you want the full project + insight rewrite (recommended), run:
--   php artisan db:seed --class=AccurateContentSeeder
-- from the backend directory.
-- =====================================================================
