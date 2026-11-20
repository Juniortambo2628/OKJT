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

## 2. The website health check tool (`/tools/site-check`): done

- [x] A visitor enters a web address; the server checks HTTPS, the status,
      redirects, robots.txt (the page, and the files and data it loads),
      the sitemap, www vs non-www, noindex, canonical, title, description,
      one h1, how many words arrive before JavaScript, lang, viewport, link
      previews and structured data, each with a plain fix.
- [x] Speed scores from Google PageSpeed Insights, asked for by the
      visitor's browser and kept with the report.
- [x] Shareable report at `/tools/site-check/<id>` for 30 days (pruned
      daily), kept out of search results.
- [x] "Book a call" / "Send a brief", and "Email me this report" with an
      optional subscription (Subscribers, source `site-check`).
- [x] Safe to run on the open web: public addresses only, ports 80 and 443,
      every redirect checked, the connection pinned to the checked address,
      2 MB cap, 5 checks a minute per visitor.
- [x] Linked from the footer ("Free Site Check") and in the sitemap.
- [x] Draft insight "One line in robots.txt, and the pages Google couldn’t
      see" (not published).
- **You:** create a free PageSpeed Insights API key in Google Cloud
  (APIs & Services → Credentials → API key, restricted to the PageSpeed
  Insights API and to okjtech.co.ke as the website), and paste it into
  Settings → Widgets → Pagespeed api key. Without it Google's shared
  allowance is usually used up and the report links to PageSpeed Insights
  instead. Then read, edit and publish the draft insight once Search
  Console shows the after-numbers.

## 3. Positioning copy and trust signals: done (except quotes)

- [x] Home headline: "Product engineering for African markets" /
      "Engineering [Health Systems, Marketplaces, Fintech, Legal Tech, Event
      Platforms] Built for Africa" (Settings > Home page; editable).
- [x] Starting price: "$2,000" (Settings > Services > Starting price), on
      the Services page and How we work.
- [x] How we work (`/how-we-work`): first call, fixed-price proposal in two
      business days, contract and NDA; 40% to start, 20% at first
      deployment, 20% at scope completion, 20% at handover; US dollars by
      Wise or PayPal; staging link, updates, changes agreed in writing;
      handover and support. Linked from the footer and Contact.
- [x] Case study figures: Naoa "250 guests, KSh 300,000+ in gifts"; Nyalife
      HMS "200+ patients, 7 staff roles"; Dickson Gitonga Advocates "5 hours
      a week saved" (from the November 2026 CV).
- [ ] Named client quotes: to come from Kevin.
- [ ] "Replies within one business day": not promised yet (the site says
      two business days to a proposal); Kevin to decide.

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
