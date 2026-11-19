# okjtech.co.ke growth plan

Goal: more work requests from international clients on larger budgets, and
reasons for people to come back. No paid tools. Each step is one pull request
in this repository (okjt-app only; the OKJT kit is not changed unless a step
says so), tested, with desktop and 390 px screenshots, and nothing changes on
screen until its setting is filled in.

The positioning every step points back to: **a product studio for African
markets**: M-Pesa and Paystack, phones and networks that are slow, Kenya's
Data Protection Act, and WhatsApp-first users, shipped in Tibu, Najenga, Naoa
and Tena. That makes OKJTech useful to foreign companies, NGOs and funded
startups entering East Africa.

## 1. Booking and a qualified brief: done in this PR

- [x] `booking_url` in Settings → Contact details; nothing shows while empty.
- [x] `/book`: the Cal.com calendar in place (other booking links open in a
      new tab); linked from the Contact hero and the brief's steps.
- [x] Contact form: optional Budget (USD) and Timeline; stored, shown in
      Enquiries and in the studio's email.
- [x] The reply to the visitor offers the booking link.
- **You:** create a free Cal.com account (cal.com), add two meeting types
  ("Intro call", 20 min; "Project scoping", 45 min) with Google Meet, add
  booking questions (company, budget range, timeline), and paste the intro
  call's link into Settings → Contact details → Booking url.
- Later, if wanted: a "Book a Call" button in the site header. The header
  comes from the kit (`@okjt/site` SiteNav), so it needs a kit option and a
  kit release.

## 2. The website health check tool (`/tools/site-check`)

The tool people come back to, and proof of the work.

- A visitor enters a web address. The server fetches it and checks:
  robots.txt (and whether it blocks what the pages need), sitemap, canonical
  tags, noindex, redirects (www, http, trailing slash), titles and
  descriptions, Open Graph tags, and HTTPS. Speed scores come from Google's
  PageSpeed Insights API (free, with a free API key kept on the server).
- A results page with a plain-language fix for each problem; a shareable
  link to the report (`/tools/site-check/<id>`), kept for 30 days.
- Ends with "Want these fixed? Book a call" and an optional "Email me this
  report", which adds the visitor to Subscribers (source `site-check`).
- Rate-limited per visitor, and only public web addresses can be checked
  (no private or internal addresses), so it can't be abused to reach other
  servers.
- An insight post: "How okjtech.co.ke went from 80 to N indexed pages", with
  the Search Console numbers from November.
- **You:** create a free Google Cloud API key for PageSpeed Insights.

## 3. Positioning copy and trust signals

- Home page headline and About page lead with the African-markets line
  (copy in Settings, proposed in the PR for you to edit).
- Services: "Projects typically start from $X" (a setting; you choose X).
- Contact and /book: "Nairobi, UTC+3: the whole European working day,
  mornings on the US East Coast" (already on /book).
- A "How we work" page (`/how-we-work`): discovery call → fixed-price
  proposal → milestones → contract and NDA → payment by bank transfer or
  Wise → support after launch. Linked from the footer, Contact and /book.
- Case studies: a "Results" line with numbers where the project has them
  (users, transactions, time saved). Needs the numbers from you.
- "Replies within one business day" where the site promises a reply.

## 4. Cost estimator and African-market launch checklist

- **Estimator** (`/tools/estimate`): about eight questions (type of
  platform, sign-in, payments, admin dashboard, integrations, languages,
  design state, deadline) → a USD range and timeline, and a scope outline.
  Ends with "Send this as a brief" (fills the Contact form, budget and
  timeline included) or "Book a call". The ranges are settings you control.
- **Launch checklist** (`/tools/launch-checklist`): Kenya Data Protection
  Act registration and obligations, M-Pesa and card payments, slow phones
  and networks, WhatsApp, GDPR overlap. Readable on the page; the PDF version
  for an email address (Subscribers, source `checklist`).

## 5. Newsletter and reach

- **Signup**: the subscribe endpoint and Subscribers list already exist;
  add the form to the insight pages and the footer area of okjt-app's pages,
  with consent wording. Sending stays outside the site: export Subscribers
  to MailerLite's free plan (check its current subscriber limit) once a
  month.
- **Cross-posting**: each insight gets a "first published on okjtech.co.ke"
  canonical when posted to LinkedIn, dev.to and Hashnode.
- **Listings** (you): Clutch and GoodFirms profiles with 3 to 5 client
  reviews; a Contra profile; a Google Business Profile; Product Hunt launches
  for Naoa and Najenga.
- **Insight topics for buyers**: what it costs to launch a fintech app in
  Kenya; M-Pesa integration mistakes foreign teams make; is your app
  compliant with Kenya's Data Protection Act; building for 3G.
- **Measure**: Search Console (clicks, indexed pages), bookings per month,
  briefs per month by budget range (Enquiries now records it).

## Order

1 (this PR) → 2 → 3 → 4 → 5. Steps 3 and 5's listings can run alongside the
others; they are mostly your writing and accounts.
