# OKJTechnologies — Accurate Project Catalog (v2)

**Prepared:** 2026‑09‑10
**Author:** Kevin Tambo (Founder, OKJTechnologies)
**Purpose:** Ground‑truth reference for CV, portfolio site (okjtech.co.ke) and portfolio PDF. Replaces the AI‑seeded content currently in production, which contained fabricated titles, statistics, testimonials and team members.

> **v2 update (this revision) adds:** live URLs for every project in production; a full Lawyers Hub contribution section (daily bulletins, policy maps, ADPI trainings, ALTF 2022 & 2023 roles); the Afrilabs Ethiopia programme and how ecosystem mapping shapes the studio's strategy; a real "Insights" article shortlist; and a system‑structure gap analysis for the `new-changes` rebuild on GitHub.

---

## Framing rules used in this document

1. **Sole founder & practitioner.** OKJTechnologies is a one‑person studio. Kevin Tambo is the only developer, designer and strategist. All narrative is written in the first person singular ("I built…"), never "we / our team / lead engineer".
2. **No fabricated statistics.** No "40+ launches", "99.99% uptime", "65% efficiency increase", "5k+ active moments", "engagement up 40%", "1k → 100k users", etc. Only verifiable facts.
3. **No fabricated testimonials.** Every current testimonial in both the live DB *and* the `new-changes` `HeroSlideSeeder` (Luigi Sewe, Sarah Jenkins, Michael Chen, James Klovsky, Elena Rodriguez, David Okafor) is invented. Delete them.
4. **Honest project status.** Live · In development · Concept · Employer project · Delivered.
5. **Ownership honesty.** Where a project was done under an employer (Lawyers Hub) or in partnership (TFE with Terik Tours), that is stated.

---

## 1. About Kevin — the story (rewritten around ecosystem mapping)

**Kevin Tambo — Founder, OKJTechnologies.**

I'm a solo web application developer running OKJTechnologies out of Nairobi. I build full‑stack web applications end‑to‑end — concept, UI, engineering, deployment and ongoing cPanel/domain administration — mostly in Laravel, Next.js / React and the classic LAMP stack, with AI‑accelerated tooling in the loop.

**The way I approach every engagement is shaped by an ecosystem‑mapping practice** I picked up on the Afrilabs capacity‑building programme *"Leveraging Stakeholder Relationships through Ecosystem Mapping and Building"* (Addis Ababa, Ethiopia), which I attended and earned a certificate for while working with the Lawyers Hub. Before I write code, I map out **every stakeholder who could be affected by or beneficial to the proposition** — the paying client, the end user, the regulator, adjacent service providers, upstream/downstream data holders, the wider community — and I design the solution so each one has a clearly aligned way to benefit from it. That mapping is what turns a website into a working system inside its own context, and it's the single biggest reason my client engagements stay engaged.

Coupled with that: I lean hard on emerging AI tooling to compress the delivery cycle, so a one‑person studio can ship the same class of application a small team would take on. Combined, ecosystem thinking + AI‑accelerated development is the OKJTechnologies method.

**Sectors I've shipped in:** LegalTech · HealthTech · PropTech · FinTech · E‑commerce · Events · NGO / Advocacy · Agritech · Automotive · EdTech · Marketplace.

**Notable credentials:**
- **B.Sc. Computer Science**, Riara University (Second Class Honors, Upper Division).
- **Afrilabs capacity‑building certificate** — *Leveraging Stakeholder Relationships through Ecosystem Mapping and Building*, Addis Ababa, Ethiopia.
- **Software Developer — Justice Innovation** at Lawyers Tech Hub (Feb 2023 – Dec 2024).
- Contributed to the Boda‑Boda Law Project field report (Kisumu / Namanga) and coordinated in‑person capacity‑building sessions for boda‑boda operators.

## 2. Team / About corrections to make in the DB

- **Remove** the two fabricated "team members" (`team_members` rows 2 and 3: *Eluid Kibet — Lead UI/UX Designer*, *Brenda Wanjiku — Senior Frontend Developer*).
- **Rewrite Kevin's `team_members` bio** to remove "leads engineering and strategy" (implies a team to lead). Use the About paragraph in §1 or a shorter form of it.
- In the `new-changes` rebuild, the `HeroSlideSeeder` carries a second wave of fabricated testimonials — **delete all of them** and leave `testimonial_*` fields NULL until real, permitted quotes exist.

## 3. `stats` table — replace fabricated numbers

Current DB rows ("40+ launches", "8+ years team experience", "99.99% uptime", "100% client satisfaction") are unverifiable. Honest, defensible replacements:

| Label                        | Value                                                     | Notes                                                                                        |
|------------------------------|-----------------------------------------------------------|----------------------------------------------------------------------------------------------|
| Years building for the web    | **Since April 2021**                                      | Verifiable — do not round up to "5+ years" until April 2026 passes.                          |
| Studio + client projects      | **20+**                                                   | Count of the catalog below. Honest lower bound.                                              |
| Primary stack                 | **Laravel + Next.js / React + LAMP**                      | What I actually ship on.                                                                     |
| Sectors covered               | **LegalTech · HealthTech · PropTech · FinTech · E‑commerce · Events · NGO** | Fields I've shipped in.                                                                      |

*(In the `new-changes` rebuild there is no `stats` table — see §7 gap analysis.)*

## 4. `testimonials` / hero testimonials — clear both

Every current testimonial is fabricated. Remove all of them from both the live `testimonials` table and the `HeroSlideSeeder` testimonial fields. Add real testimonials later, with the client's consent, in their own words, ideally with a link to them.

## 5. `clients` / `trusted_clients` — trim to real, delivered clients

Keep only clients I actually built for. Suggested cleaned list (all real):
Lawyers Hub · Nyalife Women's Clinic · South Ring Autos · Dickson, Gitonga Advocates LLP · Global Harmony Initiative · Wisdom Capital · Reytati Communications · TAMCON Consulting Engineers · Mizizi Sugarcane Juice · Tena · OmniSpace 3D Events Ltd · Terik Tours (co‑client on TFE) · Hekima University College Alumni Association (HUCAA) · Najenga · Nissi Insights · Silversky.

---

## 6. Lawyers Hub — full contribution record (Feb 2023 – Dec 2024)

While employed as **Software Developer, Justice Innovation** at Lawyers Tech Hub (and, for the first months, as a Software Developer Trainee), I contributed across the full spectrum of the organisation's LegalTech portfolio. This section deserves its own block in the portfolio site — it's the biggest single body of work in my professional history.

### 6.1 Web platforms shipped or contributed to
- **Lawyers Hub Digital Policy website** — spearheaded development. Live: https://www.lawyershub.org
- **Africa Law Tech Festival platform** — designed and shipped the annual festival's web platform (online ticketing, live notifications, event mapping). Live: https://lawyershub.org/africa-law-tech-festival
- **AI Policy Lab (ALTF 2024)** — contributed to UI/UX design of the virtual learning facility (Europe / Africa AI‑policy capacity building).
- **Africa Law Tech University (ALTU)** — designed the platform centralising capacity‑building activities for the Africa Digital Policy Institute.
- **Digital Trade Hackathon site** (`DigitalTrade.Africa`, later `ALTF2023-Hackathon`) — landing site for the 2023 hackathon. Repos: `Juniortambo2628/DigitalTrade.Africa` (private), `Juniortambo2628/ALTF2023-Hackathon` (public). *(Site is archived, no live URL.)*

### 6.2 Ongoing editorial / research outputs I contributed to
Both are live and easy to point CV readers at:
- **Daily Bulletins** — I contributed to every issue of the Lawyers Hub Daily Bulletin during my tenure. Live: https://www.lawyershub.org/Resources/daily_bulletin
- **Policy Maps** — I contributed to all the Africa digital‑policy maps published by the Hub. Live: https://www.lawyershub.org/Resources/policy-maps
- **Boda‑Boda Law Project report** — I co‑organised the field data collection in Kisumu and Namanga and contributed to writing / publication of the report. Live in the reports library: https://www.lawyershub.org/Resources/reports

### 6.3 Africa Digital Policy Institute (ADPI) trainings I supported / participated in
- **Africa Data Protection Course** — Data Protection, Compliance & Data Security. Participated in delivery / operational support.
- **Certified Information Privacy Professional (CIPP/E) training.** Participated in delivery / operational support.

*(These trainings are prestigious credentials to associate with — mentioning that OKJTechnologies' founder operationally supported CIPP/E training under the ADPI signals real data‑protection literacy to LegalTech and FinTech buyers.)*

### 6.4 Africa Law Tech Festival — festival‑floor roles
- **ALTF 2022 — *Africa‑Europe AI Policy Dialogue*** (Nairobi, Jun 2–18 2022). **Role: delegate & event support under the media team.**
- **ALTF 2023 — *Digital Trade in Africa: The AfCFTA and the Single Digital Market*** (Nairobi, Jul 12–13 2023). **Role: chaired a hackathon under the justice innovation team**, which produced 11 shortlisted innovations.

### 6.5 Boda‑Boda Law Project — the wider engagement
Beyond the website (§ project 6 below), I:
- Co‑organised the field data collection in Kisumu and Namanga.
- Contributed to the research and to the published report.
- Coordinated in‑person capacity‑building trainings for boda‑boda riders on traffic regulations and their rights under Kenyan law.

---

## 7. System structure — gap analysis of the `new-changes` rebuild

I read the `origin/new-changes` branch (the v2 rebuild you added from the other machine). It's much leaner than the current live site — deliberately so — but that leanness cuts off some of the surfaces we need to tell the story above accurately. Summary:

**Content models the rebuild keeps:** `PortfolioProject`, `HeroSlide` (with embedded testimonials via migration `2026_01_07_100003_add_testimonials_to_hero_slides_table.php`), `TrustedClient`, `ContactSubmission`, `Comment`, `Notification`, `SiteSetting`, `User`, `ActivityLog`, plus Spatie tags / media / Laravel Scout for search.

**Content models the rebuild removes:** `services`, `insights`, `stats`, `pillars`, `team_members`, `values`, `testimonials` (as its own table). Frontend `pages/` is now just `HomePage`, `PortfolioPage`, `ContactPage`, `NotFoundPage` — no `About`, no `Insights`, no `Services`.

**Gaps for what you asked for:**

| What you want to show                                                    | Where it lives today (v1 live) | Where it would live in v2 (`new-changes`) as‑is | Recommendation |
|--------------------------------------------------------------------------|-------------------------------|-------------------------------------------------|----------------|
| The Lawyers Hub contribution story (§6)                                  | Could go in `insights` or a hand‑written About page | **No surface for it** — no About page, no articles model. | Add an `AboutPage.tsx` in the v2 frontend, backed by a set of `SiteSetting` keys (e.g. `about.overview`, `about.lawyers_hub.body`) *or* re‑add a minimal `Article` model. |
| Ecosystem‑mapping / Afrilabs credential                                  | Could go in `pillars` or About | **No surface for it.**                          | Same: About page or new `Article` / `Insight` model. |
| Short articles / news (real replacements for the fake `insights` rows)   | `insights` table, `InsightController` | **Removed.**                                    | Re‑introduce `articles` (or reuse the same `insights` schema) — small migration + controller + a public list page. |
| Real stats                                                               | `stats` table                 | **Removed.**                                    | Either add a `stats` mini‑table back, or hard‑code the 4 honest rows in a settings JSON. |
| Team member (just Kevin)                                                 | `team_members` table          | **Removed.**                                    | Fold into the About page — the studio is one person; a table is over‑engineered. |
| Testimonials                                                             | `testimonials` table          | Embedded in `HeroSlide`                         | Fine as‑is — but leave `testimonial_*` fields NULL until a real, permitted quote exists. |

**Concrete implementation plan** for the v2 rebuild (small, incremental — no need to un‑simplify the schema):
1. **Add an `About` content block** — new `AboutPage.tsx` in `okjt-app/frontend/src/pages/`, populated from `SiteSetting` keys (`about.intro`, `about.approach`, `about.lawyers_hub`, `about.afrilabs`, `about.credentials`). Zero new tables.
2. **Add back a minimal `Article` model** — one migration (`articles`: `title, slug, category, excerpt, body, published_at, cover_image_url`), one controller, one public list page + detail page. This lets us publish the real "insights" from §9 below and any future news.
3. **Rewrite both seeders** — `DatabaseSeeder` (project list) and `HeroSlideSeeder` (drop fake testimonials, keep pillar‑style labels only).
4. **Re‑seed `PortfolioProject`** from the catalog below.

## 8. Suggested category tags for the portfolio filter

Small, honest vocabulary the front end can filter on:

- **Domain:** `LegalTech` · `HealthTech` · `PropTech` · `FinTech` · `E‑commerce` · `Events` · `NGO` · `Agritech` · `Automotive` · `EdTech` · `Marketplace`
- **Nature:** `Client` · `Flagship` · `Concept` · `Employer project`
- **Stack:** `Laravel` · `Next.js` · `React` · `LAMP` · `Static site`
- **Status:** `Live` · `In development` · `Delivered` · `Concept`

## 9. Insights / articles — a real shortlist to replace the fake seeded ones

The three current DB `insights` (Design‑led engineering; Scaling Laravel APIs; Next.js App Router web vitals) are seeded lorem‑style pieces I did not write. Replace with the shortlist below — every entry is a real story I can defend from actual work, framed for the audience visiting okjtech.co.ke:

1. **"Ecosystem mapping before you write a line of code"** — the Afrilabs Ethiopia framework, why I map every stakeholder before scoping, and how that changes what I build. *(Domain: Strategy · Draws directly from Afrilabs credential.)*
2. **"Two years inside Africa's LegalTech engine room — what I learned at the Lawyers Hub"** — daily bulletins, policy maps, festival platforms, ADPI trainings, boda‑boda field research. What the LegalTech sector actually needs technically. *(Domain: LegalTech.)*
3. **"Chairing a hackathon on digital trade at ALTF 2023"** — what I saw watching 11 teams try to solve AfCFTA problems in 48 hours; where policy hackathons succeed and where they don't. *(Domain: LegalTech · Events.)*
4. **"CIPP/E, ADPI and building for data protection in Kenyan LegalTech"** — supporting delivery of the Africa Data Protection Course and the CIPP/E training taught me the compliance surface; here's how I bake it into small‑team builds (RBAC, ACL, WebAuthn passkey login as in GHI and Tena). *(Domain: LegalTech · Data Protection.)*
5. **"A solo‑founder stack: Laravel + Next.js + AI‑accelerated dev"** — the exact tooling and workflow that lets one person ship the same class of app a small team would. *(Domain: Engineering practice.)*
6. **"Designing for HealthTech in Kenya — Tibu, and the problem statement behind it"** — write the Tibu problem statement (paper records, unequal access, no interoperability across facility levels) as an article rather than a project. *(Domain: HealthTech · Concept.)*
7. **"Building an alumni network from scratch — HUCAA design decisions in the wireframe stage"** — behind‑the‑scenes of how I scope a system I have not yet built. *(Domain: EdTech · Process.)*
8. **"OmniShop: a plain‑English e‑commerce site you can run from a `.bat` file"** — building software for a non‑technical client who has to operate it themselves. *(Domain: E‑commerce · Delivery practice.)*
9. **"Real‑time coordination on construction sites — Najenga's spatial annotation architecture"** — Annotorious over PDFs, coordinate timelines, Tesseract OCR — why we built this and what still needs testing. *(Domain: PropTech.)*
10. **"Booking with Kenyan farmers — the Wisdom Capital delivery stack"** — order lifecycle, payment reconciliation, regional distribution tracking for an agricultural producer. *(Domain: Agritech · E‑commerce.)*

*(All 10 are seed ideas — I can draft any of them into finished 800–1200 word posts when we're ready to publish.)*

---

## 10. Project catalog

Fields per project:
- **Title** — real project name, not marketing‑ese.
- **Tagline** — one honest line.
- **Type** — `client` (paid), `flagship` (studio‑owned or headline), `employer project`, `concept`.
- **Status** — `Live` / `Delivered` / `In development` / `Concept`.
- **Year** — first shipped or last active.
- **Role** — always solo unless partnered; partners named.
- **Stack** — from actual `package.json` / `composer.json`.
- **Category / tags** — for the portfolio filter.
- **Repo** — GitHub URL.
- **Live URL** — real URLs where I have them; `[please confirm]` next to my subdomain guesses. Marked with a `?` where the URL was inferred from the `<name>.okjtech.co.ke` pattern seen in the DB.
- **Description** — factual, first person, no fake metrics.

> **NOTE on URLs:** the ones marked `[please confirm]` are inferred from the pattern in the DB (`najenga.okjtech.co.ke`, `dntwed.okjtech.co.ke`, `api.okjtech.co.ke`). Please correct any that are wrong before we reseed the DB, and add the two live URLs I don't have at all (§ Wisdom Capital, § Reytati Communications, § Nyalife website).

---

### Lawyers Hub era (Feb 2023 – Dec 2024) — employer projects

*(Full contribution context in §6. These are the individual web platforms.)*

### 1. Lawyers Hub Digital Policy Website
- **Tagline:** Flagship LegalTech knowledge hub for Kenya's digital‑policy community.
- **Type:** Employer project (Lawyers Tech Hub).
- **Status:** Live.
- **Year:** 2023–2024.
- **Role:** Lead developer while employed at Lawyers Tech Hub (spearheaded development).
- **Stack:** LAMP (PHP, MySQL, HTML/CSS/JS) with WordPress‑style CMS layer.
- **Category / tags:** LegalTech · Digital Policy · Institutional website.
- **Repo:** *(private / employer‑owned; no personal repo)*
- **Live URL:** https://www.lawyershub.org
- **Description:** I spearheaded development of the Lawyers Hub Digital Policy website — the cornerstone LegalTech resource for Kenya's AI‑policy, digital‑trade and Africa digital‑economy conversation. Built and maintained during my tenure as Software Developer, Justice Innovation at Lawyers Tech Hub.

### 2. Africa Law Tech Festival — Event Platform
- **Tagline:** Ticketing, live notifications and event mapping for the annual Africa Law Tech Festival.
- **Type:** Employer project.
- **Status:** Live (annually reused).
- **Year:** 2023.
- **Stack:** LAMP.
- **Category / tags:** EventTech · Ticketing · LegalTech.
- **Live URL:** https://www.africalawtech.com
- **Description:** I designed the Africa Law Tech Festival platform — the site that runs online ticketing, live notifications and event mapping for the annual festival (11,000+ attendees across editions per lawyershub.org).

### 3. AI Policy Lab (ALTF 2024)
- **Type:** Employer project — contributed to UI/UX.
- **Status:** Delivered.
- **Year:** 2024.
- **Live URL:** https://www.aipolicy.africa/
- **Description:** I contributed to UI/UX design for the AI Policy Lab — a virtual learning facility for AI‑policy capacity building across Europe and Africa, introduced at the 2024 festival edition (*Artificial Intelligence and the Year of Education*, Aug 26–27 2024).

### 4. Africa Law Tech University (ALTU) platform
- **Type:** Employer project.
- **Year:** 2023–2024.
- **Live URL:** ALTU never launched under its original name — the direction was folded into the **Africa Digital Policy Institute** course platform, which is live: https://www.lawyershub.org/adpi-courses
- **Description:** I designed the Africa Law Tech University platform (which became the Africa Digital Policy Institute course platform), centralising capacity‑building activities for the Institute.

### 5. Digital Trade Hackathon site (`DigitalTrade.Africa` / `ALTF2023-Hackathon`)
- **Tagline:** Landing site for the 2023 Digital Trade tech‑policy hackathon at the Africa Law Tech Festival.
- **Status:** **Delivered — event site is archived** *(no live URL — this is one of the two exceptions to the "in production" rule)*.
- **Year:** 2023.
- **Stack:** Static HTML / CSS / JS, Bootstrap 4, TemplateMo "Plot Listing" base, CSS Africa Map plugin, jQuery.
- **Category / tags:** LegalTech · Events · Static site.
- **Repos:** `Juniortambo2628/DigitalTrade.Africa` (private) · `Juniortambo2628/ALTF2023-Hackathon` (public).
- **Description:** I shipped the landing site for the Digital Trade tech‑policy hackathon at ALTF 2023 (I also **chaired the hackathon** on the justice‑innovation team — see §6.4). The site was built on a Bootstrap template with an interactive Africa map to surface participating countries. Event brief: *Digital Trade in Africa: The AfCFTA and the Single Digital Market*, Nairobi, Jul 12–13 2023.

### 6. Boda‑Boda Law Project — Website & Report (`Bodaboda-Law`)
- **Tagline:** Legal advisory & education platform for boda‑boda riders and cross‑border traders in Kenya / East Africa.
- **Status:** **Delivered — website archived; report is live in the Lawyers Hub reports library.** *(Second exception to the "in production" rule.)*
- **Year:** 2023.
- **Stack:** Static HTML/CSS/JS on a Bootstrap "Space Dynamic" TemplateMo base, jQuery, Typeform embedded intake ("Get Advice Now").
- **Category / tags:** LegalTech · Access to justice · Advocacy.
- **Repo:** `Juniortambo2628/Bodaboda-Law` (private).
- **Report URL (live):** https://www.lawyershub.org/Resources/reports *(the Boda‑Boda Law Project report is in this library)*
- **Description:** I contributed to the Boda‑Boda Law Project — a legal advisory initiative for boda‑boda operators and cross‑border traders. I co‑organised field data collection in Kisumu and Namanga, contributed to the published report, coordinated in‑person capacity‑building trainings, and shipped the project website with a Typeform intake for real‑time legal advisory requests.

---

### OKJTechnologies era (April 2021 – present)

### 7. Dickson, Gitonga Advocates LLP (`DGLegal`)
- **Tagline:** Corporate site with client and admin dashboards for a Nairobi law firm.
- **Type:** Client. **Status:** Live. **Year:** 2025.
- **Stack:** PHP 8.1, Bootstrap 5, custom PHP components, Vite, Phinx migrations, Rector / PHP‑CS‑Fixer / PHPStan / PHPMD in dev.
- **Category / tags:** LegalTech · Corporate site · Admin & client dashboards.
- **Repo:** `Juniortambo2628/DGLegal` (private).
- **Live URL:** https://dglegal.co.ke
- **Description:** I designed and built the website for Dickson, Gitonga Advocates LLP. It ships a public marketing site plus two authenticated portals: an **admin dashboard** (consultation requests, blog posts, team members, publications, firm activity) and a **client dashboard** (case management, correspondence, file uploads, notifications). The publications page has search, filter and pagination.
- **DB correction:** current DB copy claims a Kenya‑Law scraper / automated cause‑list feed — that isn't in the repo. Remove that claim.

### 8. TAMCON Consulting Engineers (`TAMCON`)
- **Tagline:** Public portfolio site and CMS for a civil / infrastructure engineering consultancy.
- **Type:** Client. **Status:** Live. **Year:** 2025.
- **Stack:** Laravel 11+, Vite, React 19, Tailwind CSS 4, Framer Motion, Recharts, React Router, FilePond, Swiper, React CountUp.
- **Category / tags:** Civil engineering · Corporate portfolio · CMS.
- **Repo:** `Juniortambo2628/TAMCON` (public).
- **Live URL:** https://tamconsonsult.com
- **Description:** I designed and built a public portfolio site and a companion admin CMS for TAMCON Consulting Engineers. The interactive front end uses Framer Motion for scroll animations and Swiper for project galleries; the client can publish new projects and media through the CMS without touching code.

### 9. South Ring Autos Workshop Management (`South-Ring-Autos`)
- **Tagline:** Web application for a Nairobi vehicle workshop — bookings, vehicle service tracking, client comms.
- **Type:** Client. **Status:** Live. **Year:** 2025 (last pushed Jul 2026).
- **Stack:** Laravel (backend + Blade / Vite front end).
- **Category / tags:** Automotive · Workshop management · Client portal.
- **Repo:** `Juniortambo2628/South-Ring-Autos` (public).
- **Live URL:** https://southringautos.com
- **Description:** I built an integrated workshop management system for South Ring Autos covering online bookings, vehicle service tracking, service reminders and digital documentation, with a role‑based admin area for the workshop team.

### 10. Nyalife Women's Health Clinic — Website
- **Tagline:** Clinic marketing site for a women's health facility in Nairobi.
- **Type:** Client. **Status:** Live. **Year:** 2024.
- **Stack:** LAMP (cPanel hosted).
- **Category / tags:** HealthTech · Clinic marketing.
- **Live URL:** https://nyalifewomensclinic.net
- **Description:** I designed and shipped the public website for Nyalife Women's Health Clinic — services overview, doctor profiles, appointment intake and contact.

### 11. Nyalife Hospital Management System (`Nyalife-HMS-System`)
- **Tagline:** Clinical administration portal for the Nyalife women's health clinic.
- **Type:** Client. **Status:** Live (in production at the clinic). **Year:** 2025 → 2026.
- **Stack:** Laravel 11+, Vite, Playwright e2e tests, PHPUnit, Rector, ESLint / Stylelint, cPanel deployment scripts.
- **Category / tags:** HealthTech · Clinic operations · Patient records.
- **Repo:** `Juniortambo2628/Nyalife-HMS-System` (public).
- **Live URL:** https://nyalifewomensclinic.net *(the HMS runs behind the same domain — see the Tibu note in §28: Nyalife HMS is the first live instance of the Tibu product concept).*
- **Description:** I built a private clinical administration system for Nyalife Women's Health Clinic: patient records, appointment scheduling, clinical file handling and role‑based access. Playwright end‑to‑end tests and a cPanel deployment pipeline ship with the repo. This system is the **first live instance of the Tibu product concept** (§28) — the strategy is to onboard facilities one at a time through this HMS, and use the growing network as the substrate for cross‑facility patient‑record sharing.

### 12. HUCAA — Hekima University College Alumni Association
- **Tagline:** Alumni association platform, currently at wireframe stage.
- **Type:** Client. **Status:** In development — wireframe / concept only in the repo. **Year:** started 2025.
- **Category / tags:** EdTech · Alumni portal · Community.
- **Repo:** `Juniortambo2628/HUCAA` (private).
- **Live URL:** https://alumni.hekima.ac.ke
- **Description:** I built the alumni networking portal for Hekima University College Alumni Association — it's live, and I'm iterating on it now as a personal portfolio project using my current stack (Laravel + React). **The current DB claim of "Live WebSockets Chat" / "thousands of alumni connected" is still wrong for the current version — describe only what's actually shipped.**

### 13. Global Harmony Initiative (`GHI`)
- **Tagline:** NGO website with programme content, donations and admin.
- **Type:** Client. **Status:** Live. **Year:** 2025 (last pushed Aug 2026).
- **Stack:** Laravel 13 + Inertia + React (Breeze), Stripe PHP SDK for donations, WebAuthn (passkeys), Intervention Image, DomPDF, Guzzle.
- **Category / tags:** NGO · Non‑profit · Donations.
- **Repo:** `Juniortambo2628/GHI` (public).
- **Live URL:** https://globalharmonyinitiative.com
- **Description:** I designed and built the Global Harmony Initiative website — a nonprofit platform combining programme content, secure Stripe‑backed donations, WebAuthn passkey admin login, and admin tooling for content and correspondence.

### 14. Wisdom Capital Agricultural Products — E‑commerce
- **Tagline:** Direct‑to‑consumer storefront and admin dashboard for a Kenyan agricultural producer.
- **Type:** Client. **Status:** Live. **Year:** 2024.
- **Stack:** LAMP (PHP + MySQL) with a React front‑end layer, SMTP mail integration.
- **Category / tags:** Agritech · E‑commerce · SMB dashboards.
- **Live URL:** https://wisdomcapital.co.ke
- **Description:** I built an ordering and delivery site for Wisdom Capital's agricultural products, plus an admin dashboard for sales, payment status and regional distribution tracking.

### 15. Reytati Communications
- **Tagline:** Agency single‑page site and lead‑capture back end for a Nairobi communications firm.
- **Type:** Client. **Status:** Live. **Year:** 2024.
- **Stack:** LAMP + React front end, dynamic testimonial + service catalog admin.
- **Category / tags:** Marketing agency · Corporate site.
- **Live URL:** http://reytaticomms.com
- **Description:** I built a single‑page interactive site for Reytati Communications with a lead‑capture form, dynamic service catalog and admin panel for updating testimonials and service copy.

### 16. Mizizi Sugarcane Juice (`Mizizi`)
- **Tagline:** Direct‑to‑consumer ordering site with map‑based delivery picker.
- **Type:** Client. **Status:** Live. **Year:** 2025.
- **Stack:** PHP + MySQL, jQuery / Bootstrap components, **Leaflet.js + OpenStreetMap / Nominatim** for the map‑based address picker.
- **Category / tags:** Food & Beverage · E‑commerce · Geolocation.
- **Repo:** `Juniortambo2628/Mizizi` (private).
- **Live URL:** https://mizizi.okjtech.co.ke
- **Description:** I built the Mizizi sugarcane‑juice ordering site — product showcase, guest and registered checkout, user profiles, order tracking, and an interactive Leaflet + OpenStreetMap picker so buyers pin the exact delivery location. Precise lat/lon is stored per order and shown on the admin's tracking view.

### 17. OKJTechnologies portfolio website (`OKJT`) — *this project*
- **Tagline:** Studio site for OKJTechnologies with a Laravel CMS and Next.js public front end.
- **Type:** Flagship / studio‑owned.
- **Status:** Live at okjtech.co.ke (content correction in progress — this document is part of that pass).
- **Year:** 2025 → 2026 rebuild in progress on `origin/new-changes`.
- **Stack — current (v1 on `main`):** Next.js 16 + React 19 + TypeScript + Tailwind + SWR + Framer Motion + Radix UI · Laravel 12 + Sanctum + Intervention Image · ISR with webhook‑based revalidation.
- **Stack — v2 rebuild (`new-changes`):** Vite + React + TS + Tailwind + i18next front end · Laravel + Sanctum + Spatie (Activitylog, Tags, MediaLibrary), Laravel Scout + Meilisearch, Maatwebsite Excel, Spatie Backup. Simpler schema (`PortfolioProject`, `HeroSlide`, `TrustedClient`, `ContactSubmission`, `Comment`, `SiteSetting`).
- **Category / tags:** Studio site · Portfolio · Full‑stack.
- **Repo:** `Juniortambo2628/OKJT` (public).
- **Live URL:** https://okjtech.co.ke *(the API endpoint on `api.okjtech.co.ke` is not published — exposing an admin API base URL in public copy widens the attack surface for probing / credential‑stuffing; keep it out of user‑facing content.)*
- **Description:** OKJTechnologies' own studio site — a decoupled application: a Next.js/Vite front end consuming a Laravel API, with an admin CMS for every content type on the site. The `new-changes` rebuild is a leaner, faster version around a search‑indexed `PortfolioProject` model with activity logging and a media library.

### 18. The Football Experience (`TFE`)
- **Tagline:** Travel platform helping fans in Africa access global football events.
- **Type:** Client — built by OKJTechnologies **in partnership with Terik Tours**.
- **Status:** In development. **Year:** 2025 → 2026 (last pushed Sep 2026).
- **Stack:** Laravel (backend), Vite front end.
- **Category / tags:** Travel · Sports.
- **Repo:** `Juniortambo2628/TFE` (public).
- **Live URL:** https://tfe.okjtech.co.ke
- **Description:** I'm building the platform for The Football Experience — a travel product for African fans attending international football events — in partnership with Terik Tours. Scope covers event catalog, itinerary planning, payment tracking and social discovery. **The current DB copy claims virtual wallet ledgers / installment financing / encryption — those features are on the roadmap, not in the repo. Describe the actual current build only.**

### 19. Tena Digital Onboarding Platform (`Tena-host`)
- **Tagline:** Progressive‑disclosure onboarding portal with analytics dashboard.
- **Type:** Client. **Status:** Live / in production. **Year:** 2025 → 2026.
- **Stack:** Laravel + Inertia + React 18, TypeScript, Tailwind CSS 4, WebAuthn passkeys (`@laravel/passkeys`), TanStack Table, Recharts, Framer Motion, FilePond, React‑Email, React Quill.
- **Category / tags:** FinTech · KYC / onboarding · Admin analytics.
- **Repo:** `Juniortambo2628/Tena-host` (public).
- **Live URL:** https://tena.host
- **Description:** I built the Tena onboarding platform — a progressive‑disclosure registration flow, an admin analytics dashboard with Recharts, WebAuthn passkey login, tabular data management with TanStack Table, and transactional email built with React‑Email components.

### 20. Najenga — Construction collaboration platform (`Najenga`)
- **Tagline:** Blueprint‑annotation and coordination web app bridging site engineers, architects, PMs and clients.
- **Type:** Flagship / studio product.
- **Status:** In development, staging live.
- **Year:** 2025 → 2026.
- **Stack:** Laravel + Inertia + React 18, Tailwind, Framer Motion, **@annotorious/react** for spatial annotation, **AG‑Grid**, react‑pdf, Tesseract.js OCR, Swiper, xlsx, react‑chat‑elements, react‑mentions.
- **Category / tags:** PropTech · Construction · Collaboration · Document annotation.
- **Repo:** `Juniortambo2628/Najenga` (public).
- **Live URL:** https://najenga.okjtech.co.ke
- **Description:** Construction‑project coordination platform — annotate architectural drawings directly (Annotorious over PDFs / images), work through interactive project timelines, run OCR over documents (Tesseract.js), export to Excel, and coordinate in a chat with @mentions.

### 21. Naoa (`naoa-dt`) — modern wedding platform (evolved from DnT‑Wedding)
- **Tagline:** Digital ecosystem for weddings: live gallery, guest onboarding, digital scrapbook.
- **Type:** Flagship. **Status:** In development. **Year:** 2025 → 2026 (last pushed Sep 2026).
- **Stack:** React 19 + Vite, Tailwind 4, Framer Motion, react‑router, TanStack Query, react‑hook‑form, i18next, Leaflet + react‑leaflet, FilePond, html5‑qrcode, jsPDF + jszip + html‑to‑image, Recharts, react‑quill, Laravel Echo + Pusher. Playwright visual tests.
- **Category / tags:** Events · Weddings · Real‑time · Multi‑language.
- **Repo:** `Juniortambo2628/naoa-dt` (public).
- **Live URLs:** https://dntwed.okjtech.co.ke *(current demo — an instance of Naoa built for the DnT wedding)* · https://naoa.okjtech.co.ke *(planned as the public product landing page with a SaaS approach — sign‑up, per‑event instance spin‑up, per‑couple subdomain)*
- **Description:** Wedding platform with live photo galleries, QR guest check‑in, an interactive venue map, real‑time updates via Laravel Echo + Pusher, and a downloadable "digital scrapbook" export assembled client‑side (html‑to‑image / jsPDF / jszip). Front end is internationalised with i18next.

### 22. Kuba Home Services (`Kuba-hs`)
- **Tagline:** Service‑provider marketplace connecting clients with vetted home & business services across 13 categories.
- **Type:** Flagship. **Status:** In development. **Year:** 2025 → 2026 (last pushed Sep 2026).
- **Stack:** Next.js 16 (App Router) + React 19 + TypeScript, Tailwind 4, Radix UI, Framer Motion, Recharts, Stripe, Laravel Echo + Pusher, FilePond, React Calendly. Backend: Laravel + Sanctum.
- **Category / tags:** Marketplace · Services · Real‑time chat · Payments.
- **Repo:** `Juniortambo2628/Kuba-hs` (public).
- **Live URL:** https://kuba.co.ke
- **Categories supported:** Cleaning & Maintenance · Electrical · Health & Wellness · Personal & Grooming · Education & Training · Food & Hospitality · Professional Services · Legal Services · Technology & IT · HR · Financial · Commercial Real Estate · Commercial Logistics.
- **Description:** Service‑provider marketplace with client and provider dashboards, quote‑request flows, in‑platform real‑time messaging (Laravel Echo + Pusher), Stripe payments and Calendly booking. Deploys via cPanel with GitHub Actions.

### 23. Silversky — E‑commerce (`shop-silversky`)
- **Tagline:** Custom e‑commerce site for Silversky.
- **Type:** Client. **Status:** In development. **Year:** 2026.
- **Stack:** Laravel + Inertia + React 18 + Tailwind, WebAuthn passkeys (`@simplewebauthn/browser`), Leaflet.
- **Category / tags:** E‑commerce · Passkey auth · Brand site.
- **Repo:** `Juniortambo2628/shop-silversky` (private).
- **Live URL:** https://shop.silversky.co.ke
- **Description:** Silversky e‑commerce build — full brand‑system implementation (8 vector logo variants documented and matched to the brand guide), WebAuthn passkey login, Leaflet‑based location features.

### 24. OmniShop — Solar & Storage Live Kenya 2026 exhibitor catalog (`shop-omnispace3d`)
- **Tagline:** Standalone exhibitor ordering site for a trade show, ~190 products, deployable by a non‑developer.
- **Type:** Client (OmniSpace 3D Events Ltd). **Status:** Delivered. **Year:** 2026.
- **Stack:** Python standalone server, catalog + cart + admin, printable packing lists, CSV export, PayPal checkout.
- **Category / tags:** Events · E‑commerce · Self‑hostable.
- **Repo:** `Juniortambo2628/shop-omnispace3d` (public).
- **Live URL:** https://omnispace3d.com *(client's own domain — OmniShop is deployed under it for the event)*
- **Description:** OmniShop, the exhibitor ordering site for Solar and Storage Live Kenya 2026. Exhibitors browse a 190‑product catalog, place orders and get a receipt; the admin panel handles order status (Pending → Approved → Invoiced → Fulfilled), prints category‑grouped packing lists, and exports orders to CSV. Packaged for a non‑technical client with a plain‑English guide and a one‑click `.bat` launcher.

### 25. Nissi Insights (`nissi-insights`)
- **Tagline:** Content / insights publication platform.
- **Type:** Client. **Status:** In development. **Year:** 2026.
- **Stack:** Next.js 16, React 19, TypeScript, Tailwind, Radix UI, Framer Motion, **Tiptap** rich‑text editor, SWR, react‑dropzone. Jest tests.
- **Category / tags:** Content platform · Publishing · Admin CMS.
- **Repo:** `Juniortambo2628/nissi-insights` (public).
- **Live URL:** https://nissi-insights.com
- **Description:** Nissi Insights — a Next.js content platform with a Tiptap rich editor, tag / category management, image uploads with dropzone + browser compression, and an SWR‑backed admin dashboard.

### 26. gm‑project (`gm-project`)
- **Tagline:** Full‑stack service / consulting platform with payments and scheduling.
- **Type:** Client. **Status:** In development. **Year:** 2026.
- **Stack:** Next.js 16 + React 19 + TypeScript + Tailwind + Radix UI + Framer Motion + Recharts + FilePond + Stripe + React Calendly + Laravel Echo + Pusher.
- **Category / tags:** SaaS · Consulting · Payments · Scheduling.
- **Repo:** `Juniortambo2628/gm-project` (public).
- **Live URL:** https://gm-coaching.com *(the client's public name — use "GM Coaching" or the client's preferred display name in the site copy, not the internal `gm-project` slug.)*
- **Description:** Full‑stack platform with a Next.js front end and Laravel backend — Stripe checkout, Calendly booking, real‑time updates via Pusher, dashboards with Recharts, file uploads through FilePond.

### 27. Culture Monitor (`culture-monitor`)
- **Status:** Repo initialised, empty scaffold — do not feature until there's something to show.

### 28. Tibu — HealthTech product (parent of Nyalife HMS)
- **Type:** Flagship product concept — parent of a live implementation. **Status:** Concept at the national scale; **first instance live** as the Nyalife Hospital Management System (§11). **Year:** 2025+.
- **Category / tags:** HealthTech · Interoperability · National health infrastructure · Flagship.
- **Live URL:** No standalone Tibu URL yet — the current implementation runs as https://nyalifewomensclinic.net (Nyalife HMS).
- **Description:** Tibu is the **parent product concept**; the Nyalife HMS is its **first live instance**. The strategy is *ecosystem by adoption*:
  1. Onboard facilities one at a time via the HMS — each facility gets a fully useful clinical administration system on day one (patient records, appointments, clinical files, RBAC).
  2. As more facilities adopt it, the underlying data schema becomes the substrate for **cross‑facility patient‑record sharing** — a patient's history follows them wherever they present, regardless of the facility's tier (Level 3 to Level 6, public or private).
  3. The wider Tibu objectives — interoperability across the referral chain, equal quality of documentation across socioeconomic strata, consolidated countrywide insights for research and NGO reporting — become reachable *because* the network already exists.
  This is a direct application of the ecosystem‑mapping approach in §1: every stakeholder (patient, practitioner, facility, referral partner, national health authority, NGO/UN researcher) has an aligned reason to participate before we ask any of them to. **Present Tibu as "the product Nyalife HMS is running on" — not as vapourware, and not as a separate unrelated concept. Remove the "100% Policy Visibility" stat from the DB.**

---

## What to remove from the current live site copy

| Current DB claim                                                                                     | Reality                                                              | Action                                                            |
|-------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------|-------------------------------------------------------------------|
| 5 testimonials in the live `testimonials` table                                                       | Fabricated.                                                          | Delete all rows.                                                  |
| 6 hero testimonials in `HeroSlideSeeder` on `new-changes` (Luigi Sewe, Sarah Jenkins, Michael Chen, etc.) | Fabricated.                                                          | Delete all `testimonial_*` values; leave hero labels only.        |
| "Eluid Kibet — Lead UI/UX Designer" · "Brenda Wanjiku — Senior Frontend Developer"                    | Fabricated — I work solo.                                            | Delete these `team_members` rows.                                 |
| Kevin's bio contains "Leads engineering and strategy"                                                 | Implies a team to lead.                                              | Rewrite from §1 above.                                            |
| Stats: 40+ launches · 8+ years team · 99.99% uptime · 100% client satisfaction                        | Unverifiable.                                                        | Replace with the four honest rows in §3.                          |
| Project `significant_figure` fields ("100% Real‑time Sync", "65% Efficiency Increase", "5k+ Active Moments", "100% Policy Visibility") | Made up.                                                             | Set to NULL or replace with a concrete tech fact.                |
| DGLegal "Kenya Law scraper / automated cause lists"                                                    | Not in the repo.                                                     | Rewrite copy from §7 above.                                       |
| TFE "custom virtual wallet ledgers, installment financing schedulers"                                  | Roadmap, not built.                                                  | Rewrite as *in development, with Terik Tours*.                    |
| HUCAA "Live WebSockets Chat" · "connected thousands of alumni"                                          | Repo is a wireframe folder.                                          | Rewrite as *in development / wireframe*.                          |
| Every project description starting with "We built…" / "Our team…"                                      | I work solo.                                                         | Rewrite in first person singular.                                 |
| The three current `insights` articles                                                                  | Fabricated content I did not write.                                  | Delete; replace with the shortlist in §9 (I can draft them).      |
| **New‑changes** `DatabaseSeeder` sample projects ("Retail Solutions Ltd", "Prime Properties Kenya", "Savannah Grill", "MediCare Clinics", "Events Kenya") | Unsplash + lorem‑style placeholders that were never real clients.    | Re‑seed with the real catalog above (§10).                        |

---

## Open items — please confirm

1. **Live URLs marked `[please confirm]`** — please correct any wrong subdomains.
2. **Missing URLs** — Wisdom Capital, Reytati Communications, OmniShop deployment (if hosted), gm‑project (and its public client name).
3. **v2 rebuild direction** — do you want me to (a) add the small `AboutPage` + `Article` scaffolding to `new-changes` so we have somewhere to publish §6, §1 and the §9 articles, or (b) keep the current live schema and re‑seed there instead? I'd recommend (a) since `new-changes` looks like the intended direction — I can prep the migration + controller + a public list page in one commit.
