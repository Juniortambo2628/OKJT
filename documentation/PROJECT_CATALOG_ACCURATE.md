# OKJTechnologies — Accurate Project Catalog

**Prepared:** 2026‑09‑10
**Author:** Kevin Tambo (Founder, OKJTechnologies)
**Purpose:** Ground‑truth reference for CV, portfolio site (okjtech.co.ke) and portfolio PDF. Replaces the AI‑seeded content currently in production, which contained fabricated titles, statistics, testimonials and team members.

---

## Framing rules used in this document

1. **Sole founder & practitioner.** OKJTechnologies is a one‑person studio. Kevin Tambo is the only developer, designer and strategist. All narrative is written in the first person singular ("I built…"), never "we / our team / lead engineer".
2. **No fabricated statistics.** No "40+ launches", "99.99% uptime", "65% efficiency increase", "5k+ active moments", "85% engagement", etc. Only verifiable facts: repo existence, stack, feature list, live URL if any, year, project status.
3. **No fabricated testimonials.** Every current testimonial in the DB is invented and must be removed. Only real, attributable quotes should ever be added later — with the person's permission.
4. **Honest project status.** Projects are labelled *Live*, *Delivered / no longer live*, *In development*, *Concept / prototype*, *Portfolio study* — not all listed as active production launches.
5. **Ownership honesty.** Where a project was done under an employer (Lawyers Hub) or in partnership (TFE with Terik Tours), that is stated.

---

## Team / About corrections

- **Kevin Tambo — Founder & Web Application Developer.** Sole practitioner. Full‑stack (LAMP + Laravel + Next.js/React), UI/UX, deployment, cPanel/domain admin.
- **Remove** the two fabricated "team members" from the DB (`team_members` rows 2 and 3: "Eluid Kibet — Lead UI/UX Designer", "Brenda Wanjiku — Senior Frontend Developer"). They do not exist.
- **Rewrite** Kevin's `team_members` bio to remove the phrase "leads engineering and strategy" (implies a team to lead). Suggested replacement:
  > "Founder of OKJTechnologies. I design, build, deploy and administer full‑stack web applications for clients across LegalTech, HealthTech, PropTech, e‑commerce, hospitality and non‑profit sectors. I work in Laravel, Next.js / React, and the classic LAMP stack, and I run everything from concept and UI to production cPanel deployment myself."

## `stats` table — replace fabricated numbers

The current `stats` rows ("40+ launches", "8+ years team experience", "99.99% uptime", "100% client satisfaction") are unverifiable and should be removed. Honest, defensible replacements:

| Label                     | Value                                       | Notes                                                                                                 |
|---------------------------|---------------------------------------------|-------------------------------------------------------------------------------------------------------|
| Years building for the web | **Since April 2021**                        | Verifiable from professional history — do not round up to "5+ years" until April 2026 has passed.     |
| Client & studio projects  | **20+**                                     | Count of the catalog below (public + private repos + non‑repo LegalTech work). Honest lower bound.    |
| Primary stack             | **Laravel + Next.js / React + LAMP**        | What I actually ship on.                                                                              |
| Domains covered           | **LegalTech, HealthTech, PropTech, FinTech, E‑commerce, Events, NGO** | Fields I've shipped in.                                                                               |

## `testimonials` table — clear it

All five current testimonials are fabricated. Remove them. Only add real testimonials later, in the client's own words, with permission and (ideally) a link to the person.

## `clients` table — trim to real, delivered clients

Keep only clients I actually built for. Suggested cleaned list (all real):
Lawyers Hub · Nyalife Women's Clinic · South Ring Autos · Dickson Gitonga Advocates LLP · Global Harmony Initiative · Wisdom Capital · Reytati Communications · TAMCON Consulting Engineers · Mizizi Sugarcane Juice · Tena · OmniSpace 3D Events Ltd · Terik Tours (co‑client on TFE) · Hekima University College Alumni Association (HUCAA) · Najenga · Nissi Insights · Silversky.

---

## Project catalog

Fields per project:
- **Title** — real project name, not marketing‑ese.
- **Tagline** — one honest line.
- **Type** — `client` (paid), `flagship` (studio‑owned or headline), `internal`, `study`.
- **Status** — `Live` / `Delivered (offline)` / `In development` / `Concept` / `Portfolio study`.
- **Year** — first shipped or last active.
- **Role** — always solo unless partnered; partners named.
- **Stack** — from actual `package.json` / `composer.json`.
- **Category / tags** — for the portfolio filter.
- **Repo** — GitHub URL.
- **Live URL** — if actually reachable.
- **Description** — factual, first person, no fake metrics.

---

### 1. Lawyers Hub Digital Policy Website
- **Tagline:** Flagship LegalTech knowledge hub for Kenya's digital‑policy community.
- **Type:** Employer project (built during my time at Lawyers Tech Hub, 2023–2024).
- **Status:** Live at time of engagement — should be linked, not claimed as OKJT product.
- **Year:** 2023–2024.
- **Role:** Lead developer while employed at Lawyers Tech Hub (spearheaded development).
- **Stack:** LAMP (PHP, MySQL, HTML/CSS/JS) with WordPress‑style CMS layer.
- **Category / tags:** LegalTech · Digital Policy · Institutional website.
- **Repo:** *(private / employer‑owned; no personal repo)*
- **Live URL:** *(insert current LH URL)*
- **Description:** I spearheaded development of the Lawyer's Hub Digital Policy website — a cornerstone LegalTech resource covering AI policy, digital trade, and Africa's digital economy. Built and maintained while employed as Software Developer, Justice Innovation at Lawyers Tech Hub.

### 2. Africa Law Tech Festival — Event Platform
- **Tagline:** Ticketing, live notifications and event mapping for the annual Africa Law Tech Festival.
- **Type:** Employer project (Lawyers Tech Hub).
- **Status:** Delivered — annually re‑used.
- **Year:** 2023.
- **Role:** Web platform designer/developer at Lawyers Tech Hub.
- **Stack:** LAMP.
- **Category / tags:** EventTech · Ticketing · LegalTech.
- **Description:** I designed the Africa Law Tech Festival web platform, which supports the annual festival through online ticketing, live notifications and event mapping. Built during my role at Lawyers Tech Hub.

### 3. AI Policy Lab (ALTF 2024)
- **Type:** Contributed as UI/UX designer at Lawyers Tech Hub.
- **Status:** Delivered.
- **Year:** 2024.
- **Description:** I contributed to UI/UX design for the AI Policy Lab, a virtual learning facility for AI‑policy capacity building across Europe and Africa.

### 4. Africa Law Tech University (ALTU) platform
- **Type:** Employer project (Lawyers Tech Hub).
- **Year:** 2023–2024.
- **Description:** I designed the Africa Law Tech University platform, centralising capacity‑building activities for the Africa Digital Policy Institute.

### 5. Digital Trade Hackathon site (`DigitalTrade.Africa` / `ALTF2023-Hackathon`)
- **Tagline:** Landing site for the 2023 Digital Trade tech‑policy hackathon at the Africa Law Tech Festival.
- **Status:** Delivered (event ran; site archived).
- **Year:** 2023.
- **Stack:** Static HTML / CSS / JS, Bootstrap 4, TemplateMo "Plot Listing" base, CSS Africa Map plugin, jQuery.
- **Category / tags:** LegalTech · Events · Static site.
- **Repos:** `Juniortambo2628/DigitalTrade.Africa` (private) · `Juniortambo2628/ALTF2023-Hackathon` (public).
- **Description:** I helped organise and shipped the landing site for the Digital Trade tech‑policy hackathon at the Africa Law Tech Festival 2023, which produced 11 shortlisted innovations. The site was built on a Bootstrap template with an interactive Africa map to surface participating countries.

### 6. Boda‑Boda Law Project — Website & Report (`Bodaboda-Law`)
- **Tagline:** Legal advisory & education platform for boda‑boda riders and cross‑border traders in Kenya / East Africa.
- **Type:** Employer / advocacy project (Lawyers Tech Hub, trainee period).
- **Status:** Delivered.
- **Year:** 2023 (report published).
- **Stack:** Static HTML/CSS/JS on a Bootstrap "Space Dynamic" TemplateMo base, jQuery, Typeform embedded intake ("Get Advice Now").
- **Category / tags:** LegalTech · Access to justice · Advocacy.
- **Repo:** `Juniortambo2628/Bodaboda-Law` (private).
- **Description:** I contributed to the Boda‑Boda Law Project — a legal advisory initiative for boda‑boda operators and cross‑border traders. I co‑organised field data collection in Kisumu and Namanga, contributed to the published report, coordinated in‑person capacity‑building trainings, and shipped the project website with an embedded Typeform intake for real‑time legal advisory requests.

### 7. Dickson, Gitonga Advocates LLP (`DGLegal`)
- **Tagline:** Corporate site with client and admin dashboards for a Nairobi law firm.
- **Type:** Client (OKJTechnologies).
- **Status:** Delivered.
- **Year:** 2025.
- **Stack:** PHP 8.1, Bootstrap 5, custom PHP components, Vite, Phinx migrations, Rector / PHP‑CS‑Fixer / PHPStan / PHPMD in dev.
- **Category / tags:** LegalTech · Corporate site · Admin & client dashboards.
- **Repo:** `Juniortambo2628/DGLegal` (private).
- **Description:** I designed and built the website for Dickson, Gitonga Advocates LLP. It ships a public marketing site plus two authenticated portals: an **admin dashboard** for managing consultation requests, blog posts, team members, publications and firm activity, and a **client dashboard** for case management, correspondence, file uploads and notifications. The publications page has search, filter and pagination over the firm's legal PDFs.
  *(The current DB entry claims a Kenya‑Law scraper / automated cause‑list integration — that feature is not in the repo. Remove it from the description.)*

### 8. TAMCON Consulting Engineers (`TAMCON`)
- **Tagline:** Public portfolio site and CMS for a civil / infrastructure engineering consultancy.
- **Type:** Client.
- **Status:** Live.
- **Year:** 2025.
- **Stack:** Laravel 11+, Vite, React 19, Tailwind CSS 4, Framer Motion, Recharts, React Router, FilePond image handling, Swiper carousels, React CountUp. (`.php-cs-fixer` + PHPStan + Rector in CI.)
- **Category / tags:** Civil engineering · Corporate portfolio · CMS.
- **Repo:** `Juniortambo2628/TAMCON` (public).
- **Description:** I designed and built a public portfolio site and a companion admin CMS for TAMCON Consulting Engineers. The site presents the firm's civil‑engineering projects, services and contact routing; the CMS lets the client publish new projects and media without touching code. The interactive front end (React on top of Laravel) uses Framer Motion for scroll and reveal animations and Swiper for project galleries.

### 9. South Ring Autos Workshop Management (`South-Ring-Autos`)
- **Tagline:** Web application for a Nairobi vehicle workshop — bookings, vehicle service tracking, client comms.
- **Type:** Client.
- **Status:** Live.
- **Year:** 2025 (last pushed July 2026).
- **Stack:** Laravel (backend + Blade / Vite front end).
- **Category / tags:** Automotive · Workshop management · Client portal.
- **Repo:** `Juniortambo2628/South-Ring-Autos` (public).
- **Description:** I built an integrated workshop management system for South Ring Autos covering online bookings, vehicle service tracking, service reminders and digital documentation, with a role‑based admin area for the workshop team.

### 10. Nyalife Women's Health Clinic — Website
- **Tagline:** Clinic marketing site for a women's health facility in Nairobi.
- **Type:** Client.
- **Status:** Live.
- **Year:** 2024.
- **Stack:** LAMP / WordPress‑style deployment (cPanel hosted).
- **Category / tags:** HealthTech · Clinic marketing · Cornerstone site.
- **Description:** I designed and shipped the public website for Nyalife Women's Health Clinic — services overview, doctor profiles, appointment intake and contact.

### 11. Nyalife Hospital Management System (`Nyalife-HMS-System`)
- **Tagline:** Clinical administration portal for the Nyalife women's health clinic.
- **Type:** Client.
- **Status:** Delivered / in production for the clinic.
- **Year:** 2025 (last active September 2026).
- **Stack:** Laravel 11+, Vite front end, Playwright end‑to‑end tests, PHPUnit, Rector, ESLint / Stylelint, cPanel deployment scripts.
- **Category / tags:** HealthTech · Clinic operations · Patient records.
- **Repo:** `Juniortambo2628/Nyalife-HMS-System` (public).
- **Description:** I built a private clinical administration system for Nyalife Women's Health Clinic: patient records, appointment scheduling, clinical file handling and role‑based access. The repo ships Playwright e2e tests and a cPanel deployment pipeline.

### 12. HUCAA — Hekima University College Alumni Association
- **Tagline:** Alumni association platform, currently at wireframe stage.
- **Type:** Client.
- **Status:** **In development — wireframe / concept only** at time of writing. The current DB claims "Live WebSockets Chat", real‑time push notifications and "thousands of alumni connected" — none of that is built yet in the repo (which contains only an *Observatory Wireframe* directory). Correct the copy accordingly.
- **Year:** Started 2025.
- **Category / tags:** EdTech · Alumni portal · Community.
- **Repo:** `Juniortambo2628/HUCAA` (private).
- **Description:** I'm designing an alumni networking portal for Hekima University College Alumni Association (HUCAA). Wireframes are in place; build to follow.

### 13. Global Harmony Initiative (`GHI`)
- **Tagline:** NGO website with programme content, donations and admin.
- **Type:** Client.
- **Status:** Live.
- **Year:** 2025 (last pushed August 2026).
- **Stack:** Laravel 13 + Inertia + React (Breeze scaffold), Stripe PHP SDK for donations, WebAuthn (passkeys), Intervention Image, DomPDF, Guzzle.
- **Category / tags:** NGO · Non‑profit · Donations.
- **Repo:** `Juniortambo2628/GHI` (public).
- **Description:** I designed and built the Global Harmony Initiative website — a nonprofit platform combining programme content, secure Stripe‑backed donation flows, WebAuthn passkey authentication for admin, and admin tooling for content management and correspondence.

### 14. Wisdom Capital Agricultural Products — E‑commerce
- **Tagline:** Direct‑to‑consumer storefront and admin dashboard for a Kenyan agricultural producer.
- **Type:** Client.
- **Status:** Live.
- **Year:** 2024.
- **Stack:** LAMP (PHP, MySQL) with a React front‑end layer, SMTP mail integration.
- **Category / tags:** Agritech · E‑commerce · SMB dashboards.
- **Description:** I built an ordering and delivery site for Wisdom Capital's agricultural products, plus an admin dashboard for sales, payment status and regional distribution tracking.

### 15. Reytati Communications
- **Tagline:** Agency single‑page site and lead‑capture back end for a Nairobi communications firm.
- **Type:** Client.
- **Status:** Live.
- **Year:** 2024.
- **Stack:** LAMP + React front end, dynamic testimonial + service catalog admin.
- **Category / tags:** Marketing agency · Corporate site.
- **Description:** I built a single‑page interactive site for Reytati Communications with a lead‑capture form, dynamic service catalog and admin panel for updating testimonials and service copy.

### 16. Mizizi Sugarcane Juice (`Mizizi`)
- **Tagline:** Direct‑to‑consumer ordering site with map‑based delivery picker.
- **Type:** Client.
- **Status:** Delivered.
- **Year:** 2025.
- **Stack:** PHP + MySQL, jQuery / Bootstrap components, **Leaflet.js + OpenStreetMap / Nominatim** for the map‑based delivery address picker and reverse geocoding. User accounts, guest and registered order tracking, order history.
- **Category / tags:** Food & Beverage · E‑commerce · Geolocation.
- **Repo:** `Juniortambo2628/Mizizi` (private).
- **Description:** I built the Mizizi sugarcane‑juice ordering site — product showcase, guest and registered checkout, user profiles, order tracking, and an interactive Leaflet + OpenStreetMap picker so buyers pin the exact delivery location. Precise latitude/longitude is stored per order and shown on the admin's order tracking view.

### 17. OKJTechnologies portfolio website (`OKJT`) — *this project*
- **Tagline:** Studio site for OKJTechnologies with a Laravel CMS and Next.js public front end.
- **Type:** Flagship / studio‑owned.
- **Status:** Live at okjtech.co.ke (undergoing content correction — this document is part of that pass).
- **Year:** 2025 → 2026 rebuild (Next.js + Laravel migration; legacy PHP site backed up).
- **Stack:** **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS, SWR, Framer Motion, Radix UI. **Backend:** Laravel 12, Sanctum, MySQL, Intervention Image (WebP). **Infra:** ISR with webhook‑based revalidation from the CMS.
- **Category / tags:** Studio site · Portfolio · Full‑stack.
- **Repo:** `Juniortambo2628/OKJT` (public).
- **Live URL:** https://okjtech.co.ke
- **Description:** I rebuilt the OKJTechnologies studio site as a decoupled application: a Next.js 16 App Router front end that consumes a Laravel 12 API, with ISR (60s revalidate) and a webhook so CMS edits trigger cache invalidation on the front end. Admin has a unified `AdminResourceTemplate` for CRUD across services, projects, insights, pillars, testimonials, clients, stats, team members and site settings, with automatic WebP conversion for uploaded images.

### 18. The Football Experience (`TFE`)
- **Tagline:** Travel platform helping fans in Africa access global football events.
- **Type:** Client — built by OKJTechnologies **in partnership with Terik Tours**.
- **Status:** In development.
- **Year:** 2025–2026 (last pushed September 2026).
- **Stack:** Laravel (backend), Vite front end.
- **Category / tags:** Travel · Sports · FinTech‑adjacent (payment installments explored).
- **Repo:** `Juniortambo2628/TFE` (public).
- **Description:** I'm building the platform for The Football Experience — a travel product for African fans attending international football events — in partnership with Terik Tours. Scope covers event catalog, itinerary planning, payment tracking and social discovery. *(The current DB copy claims "custom virtual wallet ledgers, installment financing schedulers, encryption" — none of that is in the repo yet; describe what's actually built, not what's on the roadmap.)*

### 19. Tena Digital Onboarding Platform (`Tena-host`)
- **Tagline:** Progressive‑disclosure onboarding portal with analytics dashboard.
- **Type:** Client.
- **Status:** Live / in production.
- **Year:** 2025 → 2026 (last pushed August 2026).
- **Stack:** Laravel + Inertia + React 18, TypeScript, Tailwind CSS 4, WebAuthn passkeys (`@laravel/passkeys`), TanStack Table, Recharts, Framer Motion, FilePond, React‑Email, React Quill.
- **Category / tags:** FinTech · KYC / onboarding · Admin analytics.
- **Repo:** `Juniortambo2628/Tena-host` (public).
- **Description:** I built the Tena onboarding platform — a progressive‑disclosure registration flow, an admin analytics dashboard with Recharts, WebAuthn passkey login, tabular data management with TanStack Table, and transactional email built with React‑Email components.

### 20. Najenga — Construction collaboration platform (`Najenga`)
- **Tagline:** Blueprint‑annotation and coordination web app bridging site engineers, architects, PMs and clients.
- **Type:** Flagship / studio product.
- **Status:** In development, staging live.
- **Year:** 2025 → 2026.
- **Stack:** Laravel + Inertia + React 18, Tailwind, Framer Motion, **@annotorious/react** for spatial annotation, **AG‑Grid** for tabular views, react‑pdf, Tesseract.js (OCR), Swiper, xlsx, react‑chat‑elements, react‑mentions.
- **Category / tags:** PropTech · Construction · Collaboration · Document annotation.
- **Repo:** `Juniortambo2628/Najenga` (public).
- **Live URL:** https://najenga.okjtech.co.ke/
- **Description:** I'm building Najenga — a construction‑project coordination platform. Users can annotate architectural drawings directly (Annotorious over PDFs / images), work through interactive project timelines, run OCR over documents (Tesseract.js), export to Excel, and coordinate in a chat with @mentions.

### 21. Naoa (`naoa-dt`) — modern wedding platform (evolved from DnT‑Wedding)
- **Tagline:** Digital ecosystem for weddings: live gallery, guest onboarding, digital scrapbook.
- **Type:** Flagship / studio product.
- **Status:** In development. Demo lineage: DnT Wedding (dntwed.okjtech.co.ke).
- **Year:** 2025 → 2026 (last pushed September 2026).
- **Stack:** React 19 + Vite front end, Tailwind CSS 4, Framer Motion, react‑router, TanStack Query, react‑hook‑form, i18next (multi‑language), Leaflet + react‑leaflet (venue maps), FilePond, html5‑qrcode (guest QR check‑in), jsPDF + jszip + html‑to‑image (digital scrapbook / downloadable memory book), Recharts, react‑quill, react‑moveable, Laravel Echo + Pusher for real‑time. Playwright visual tests.
- **Category / tags:** Events · Weddings · Real‑time · Multi‑language.
- **Repo:** `Juniortambo2628/naoa-dt` (public).
- **Description:** I'm building Naoa — a wedding platform with live photo galleries, guest onboarding via QR codes, an interactive venue map, real‑time updates via Laravel Echo + Pusher, and a downloadable "digital scrapbook" export (assembled client‑side with html‑to‑image / jsPDF / jszip). The front end is internationalised with i18next.

### 22. Kuba Home Services (`Kuba-hs`)
- **Tagline:** Service‑provider marketplace connecting clients with vetted home & business services across 12 categories.
- **Type:** Flagship / studio product.
- **Status:** In development.
- **Year:** 2025 → 2026 (last pushed September 2026).
- **Stack:** Next.js 16 (App Router) + React 19 + TypeScript front end, Tailwind CSS 4, Radix UI, Framer Motion, Recharts, Stripe (`@stripe/react-stripe-js`), Laravel Echo + Pusher (real‑time chat between clients and providers), FilePond, React Calendly integration. Backend: Laravel + Sanctum with Blade / Vite tooling for admin.
- **Category / tags:** Marketplace · Services · Real‑time chat · Payments.
- **Repo:** `Juniortambo2628/Kuba-hs` (public).
- **Categories the marketplace supports:** Cleaning & Maintenance · Electrical · Health & Wellness · Personal & Grooming · Education & Training · Food & Hospitality · Professional Services · Legal Services · Technology & IT · HR · Financial · Commercial Real Estate · Commercial Logistics.
- **Description:** I'm building Kuba — a service‑provider marketplace with two authenticated dashboards (client and provider), quote‑request flows, in‑platform real‑time messaging (Laravel Echo + Pusher), Stripe payments and a Calendly booking integration. Deploys via cPanel with GitHub Actions.

### 23. Silversky — E‑commerce (`shop-silversky`)
- **Tagline:** Custom e‑commerce site for Silversky.
- **Type:** Client.
- **Status:** In development.
- **Year:** 2026 (last pushed September 2026).
- **Stack:** Laravel + Inertia + React 18 + Tailwind, WebAuthn passkey login (`@simplewebauthn/browser`), Leaflet.
- **Category / tags:** E‑commerce · Passkey auth · Brand site.
- **Repo:** `Juniortambo2628/shop-silversky` (private).
- **Description:** I'm building the Silversky e‑commerce site. Includes full brand‑system implementation (8 vector logo variants documented and matched to the brand guide), WebAuthn passkey login and Leaflet‑based location features.

### 24. OmniShop — Solar & Storage Live Kenya 2026 exhibitor catalog (`shop-omnispace3d`)
- **Tagline:** Standalone exhibitor ordering site for a trade show, ~190 products, deployable by a non‑developer.
- **Type:** Client (OmniSpace 3D Events Ltd).
- **Status:** Delivered.
- **Year:** 2026.
- **Stack:** Python / standalone server, catalog + cart + admin, printable packing lists, CSV export, PayPal for checkout. Deliberately packaged so the client can run it locally with a single `.bat` file or deploy it to Railway themselves.
- **Category / tags:** Events · E‑commerce · Self‑hostable.
- **Repo:** `Juniortambo2628/shop-omnispace3d` (public).
- **Description:** I built OmniShop, the exhibitor ordering site for Solar and Storage Live Kenya 2026. Exhibitors browse a 190‑product catalog, place orders and get a receipt; the client's admin panel handles order status (Pending → Approved → Invoiced → Fulfilled), prints packing lists grouped by product category, and exports to CSV. Packaged for a non‑technical client with a plain‑English guide and one‑click `.bat` launcher.

### 25. Nissi Insights (`nissi-insights`)
- **Tagline:** Content / insights publication platform.
- **Type:** Client.
- **Status:** In development.
- **Year:** 2026.
- **Stack:** Next.js 16, React 19, TypeScript, Tailwind, Radix UI, Framer Motion, **Tiptap** rich‑text editor, SWR, react‑dropzone. Jest tests.
- **Category / tags:** Content platform · Publishing · Admin CMS.
- **Repo:** `Juniortambo2628/nissi-insights` (public).
- **Description:** I'm building Nissi Insights — a Next.js content platform with a Tiptap‑based rich editor, tag / category management, image uploads with dropzone + browser compression, and an admin dashboard fronted by SWR for live data.

### 26. gm‑project (`gm-project`)
- **Tagline:** Full‑stack service / consulting platform with payments and scheduling.
- **Type:** Client (private engagement).
- **Status:** In development.
- **Year:** 2026 (last pushed September 2026).
- **Stack:** Next.js 16 + React 19 + TypeScript + Tailwind + Radix UI + Framer Motion + Recharts + FilePond + Stripe (`@stripe/react-stripe-js`) + React Calendly + Laravel Echo + Pusher.
- **Category / tags:** SaaS · Consulting · Payments · Scheduling.
- **Repo:** `Juniortambo2628/gm-project` (public).
- **Description:** I'm building a full‑stack platform with a Next.js front end and Laravel backend — Stripe checkout, Calendly booking, real‑time updates via Pusher, dashboards with Recharts, and file uploads through FilePond with image previews.

### 27. Culture Monitor (`culture-monitor`)
- **Status:** Repo initialised, empty scaffold.
- **Note:** Currently only `.gitattributes` / `.gitignore` — should not be featured in the public portfolio until there's something to show.

### 28. Tibu — HealthTech concept
- **Type:** Flagship concept, not yet in code.
- **Status:** Concept / RFP‑stage.
- **Year:** 2025+.
- **Description:** A concept for a national‑scale patient‑record system for Kenya, addressing paper‑based records, unequal access to care, and lack of interoperability between hospitals across levels 3–6. Currently a problem statement and design brief only — should be labelled *Concept* in the portfolio, not shipped software.
- **Correction:** The current DB entry lists "100% Policy Visibility" as a stat — remove.

---

## What to remove from the current site copy

| Current DB claim                                                              | Reality                                                                                         | Action                                        |
|--------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------|-----------------------------------------------|
| "OKJTech transformed our patient onboarding" etc. (5 testimonials)             | Fabricated — no client actually said these things.                                              | Delete all `testimonials` rows.               |
| "Eluid Kibet — Lead UI/UX Designer" · "Brenda Wanjiku — Senior Frontend Dev"    | Fabricated — I work solo.                                                                       | Delete these `team_members` rows.             |
| Stats: 40+ launches · 8+ years team · 99.99% uptime · 100% client satisfaction | Unverifiable.                                                                                    | Replace with the four honest rows above.      |
| Project "significant_figure" fields ("100% Real‑time Sync", "65% Efficiency Increase", "5k+ Active Moments", etc.) | Made up.                                                                                | Set to `NULL` or replace with concrete facts (e.g. "Live on cPanel", "Passkey auth", "Leaflet map picker"). |
| DGLegal "Kenya Law scraper / automated cause lists"                            | Not implemented in the repo.                                                                    | Rewrite copy to match actual features.        |
| TFE "custom virtual wallet ledgers, installment financing schedulers"          | Not implemented — Laravel scaffold + partnership with Terik Tours.                              | Rewrite as *in development, with Terik Tours*.|
| HUCAA "Live WebSockets Chat" · "connected thousands of alumni"                 | Repo is a wireframe folder.                                                                     | Rewrite as *in development / wireframe stage*.|
| Every project description starting with "We built…" / "Our team…"              | I work solo.                                                                                    | Rewrite in first person singular.             |

---

## Suggested category tags for the portfolio filter

Use a **small, honest** tag vocabulary the front end can filter on:

- Domain: `LegalTech` · `HealthTech` · `PropTech` · `FinTech` · `E‑commerce` · `Events` · `NGO` · `Agritech` · `Automotive` · `EdTech` · `Marketplace`
- Nature: `Client` · `Flagship` · `Concept` · `Employer project`
- Stack: `Laravel` · `Next.js` · `React` · `LAMP` · `Static site`
- Status: `Live` · `In development` · `Delivered` · `Concept`
