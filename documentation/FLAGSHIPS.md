# Flagship products: what each one is, who it serves, and why it exists

The working brief for OKJTechnologies' flagship products. Use it as the
source for articles, business cases and pitch documents. Write from it in
Kevin's voice (`VOICE_AND_TONE.md`) and keep to its facts: if a pitch needs a
claim that isn't here, ask Kevin first.

Every product here follows the same idea. Map the ecosystem first, give each
stakeholder a reason to take part before asking anything of them, and grow by
adoption rather than by mandate (see `PROJECT_CATALOG_ACCURATE.md` §1).

**Kevin's own sources**, outside this repo: the *Naoa-Companion* Google Doc
and the *Naoa Research Tracker* / *Naoa traditions research — tracker*
sheets (Google Drive); the Claude Docs pages *Challenge Essay — Tibu+*,
*TFE Ecosystem: Schools, Learning Hub & Parents* and *Najenga — Kisoko
Project Workstreams*. The Najenga page holds a client's personal and
financial details: never copy those into public material.

---

## Tibu (Tibu+): hospital management and a connected health network

**Status:** in development; product site live at tibu.okjtech.co.ke. Grew out
of Kevin's work on the Nyalife Women's Health Clinic system. **Another
developer has since taken Nyalife's system forward**, so Nyalife is where
Tibu began, not a live Tibu instance; don't present it as one.

**The problem (Kevin's words, lightly edited).** Health care in Kenya is
skewed towards privilege, and accessibility is a major issue for many. Free
healthcare is not within our purview, but there is work to be done on the
delivery of service, proper documentation, and accessible patient, doctor and
hospital information. Tibu bridges the gap between all three.

**Who it is for: everyone.** Specifically, equal access for a patient at a
private hospital in Nairobi and a patient at a remote hospital in Kakamega.
It serves the underprivileged most, but the point is that everyone gets the
same quality of service and documentation the privileged already have. The
aim is an ecosystem of health facilities in which every patient can reach
all their records in any facility in the country.

**In three words:** Access. Documentation. Equal quality (of documentation).

**Impact, by stakeholder**
1. *The patient*: access to their own health information; the same standard
   of record wherever they are treated.
2. *The practitioner / facility*: more self-sufficient facilities; less time
   rebuilding histories; standardised, faster internal processes.
3. *The health sector*: a cohesive network for information sharing,
   collaboration, research and better service delivery.
4. *NGOs and national organisations*: consolidated, anonymised countrywide
   insights that can inform annual health statistics and reports. Describe
   these as "NGOs and national organisations" (Kevin's note named UNHCR,
   the refugee agency; he agreed the general wording is right). Name a
   specific organisation only once it is confirmed.

**Evidence used so far** (from the Tibu+ challenge essay, with sources):
- About 2.6 doctors per 10,000 people in Kenya vs a WHO benchmark of ~10
  (WHO Kenya Health Profile 2025, 2023 data).
- Out-of-pocket spending at 24.2% of total health expenditure (same source,
  2022 data).
- Digitised public hospitals run fragmented systems bought mainly for billing
  and administration, with lab and radiology on standalone tools (Survey of
  EHR systems in Kenyan public hospitals, University of Oxford NDM).

**Product facts seen on the live site:** one system per facility (records,
lab, pharmacy, billing and insurance, telehealth, radiology, follow-ups);
built for every level of care, from community clinics to county referral
hospitals; another facility sees a patient's summary only after the patient
approves it by SMS code.

**Growth model:** ecosystem by adoption. Each facility joins because the
system helps it on day one; the shared foundation then makes consented
cross-facility records, referrals and national insight possible. Keep the
entry price low enough that a small rural clinic can join.

**Hard parts (from the essay):** earning practitioners' trust; privacy
without blocking legitimate access; one system robust enough for a referral
hospital and light enough for a clinic with unreliable internet.

**Articles:** "Tibu: the same care in Nairobi and in Kakamega"; "Building
Nyalife HMS, where Tibu began".

---

## Naoa: a wedding planning companion built around Kenyan traditions

**Status:** in development; product site live at naoa.okjtech.co.ke; began as
the DnT wedding site (dntwed.okjtech.co.ke).

**Name:** Swahili for "I am marrying".

**The problem.** Kenyan marriage processes, from asking for a hand to the
final celebration, are vital and widely followed, but they vary across more
than 30 communities and were formed when communities rarely intermarried.
The knowledge is scattered: word of mouth and a few written sources. Inter-
community marriage is growing, so more couples need to know what is expected
by a partner's family.

**What it does** (from the Naoa companion):
- Processes for 18+ Kenyan traditions, in their languages, in a knowledge
  base reviewed with community advisers; builds a customisable plan from it.
  Always tells couples to confirm details with their elders.
- Plans each event of a Kenyan wedding (introductions, dowry, legal
  registration, church or civil ceremony, reception) with its own guests,
  budget, timeline and owners. Invites, guest lists, guest travel and
  accommodation, scheduling and day-of support.
- Digital invites that let guests share photos into the couple's gallery.
- Provider storefronts: venues (spaces, capacity, rates, house rules, floor
  plans, optional virtual tour), caterers, décor and tent hire, photographers,
  makeup, MCs, DJs, transport, with packages, availability and terms.
  Providers are checked against basic business records.
- The wedding team: bridal party, committee, family contacts and day-of roles
  (MC, lead usher, transport coordinator, gift table) tagged to tasks; one
  programme shareable on WhatsApp or printed.
- Smart paperwork: reads forwarded quotations, invoices, contracts, receipts
  and M-Pesa/bank messages; updates budget, payments, schedules and
  reminders; spots revised invoices, duplicate bills and clashing contracts.
- A calendar that suggests next steps (adding the bridal party prompts makeup
  bookings, room allocations and roles).

**Principles:** brings planners and providers together rather than replacing
them; couples get a planner's level of organisation at a fraction of the
cost, and planners can serve more weddings. **Naoa never holds anyone's
money**: couples pay providers directly.

**Data protection:** guest details used only for planning and correspondence,
deleted 30 days after the couple's last event; booking and payment records
kept six years as the law requires; the gallery stays until the couple
deletes it.

**Still to write in the companion:** Scope, Market Opportunity and Share,
Competitors, Business Case, References (tabs exist but are empty).

**Articles:** "Naoa means 'I am marrying'"; "One wedding, two families, many
traditions".

---

## Najenga: construction tracking that starts on WhatsApp

**Status:** in development, staging live at najenga.okjtech.co.ke; in use on
one real client build (a home in western Kenya) in WhatsApp test mode. Kevin
has approved mentioning that build publicly, **with no personal details**:
no names, phone numbers, payment references, amounts or exact location.

**Inspiration.** On the real build, every update arrived on WhatsApp: site
photos and videos, bank debit and M-Pesa messages, supplier invoices, typed
cost requests. Nobody opened an app, and a separate spreadsheet ledger had
drifted from the real payments. Najenga was rebuilt around that reality:
meet people where they already work.

**What it does:** annotate drawings and photos; spending with receipts;
dated photo timeline; documents; and WhatsApp intake that classifies each
message (progress photo, video, payment message, receipt, invoice, cost
request, chat) and files it, replying to the sender with an undo option. One
payment can arrive as up to four messages; Najenga merges them by payment
reference, then by amount + date + recipient, in any order, with an audit
trail.

**Next (planned, not built):** weekly WhatsApp spending report; one-tap
confirm/fix buttons; WhatsApp sign-in; installable web app; a simple client
home screen; ledger reconciliation.

**Audiences:** homeowners (often building from a distance or abroad),
contractors running several sites, site managers, consultants.

**Articles:** "Najenga: a home built over WhatsApp"; "Najenga: building a
home without losing sight of it".

---

## The Football Experience (TFE): football travel for everyone around the game

**Status:** in development, live for exploring at tfe.okjtech.co.ke. Built in
partnership with **Terik Tours**.

**Core:** fans pick matches and get a whole-trip estimate (matches, flights,
stays, tickets) in several currencies including KES; compare saved plans;
book with verified travel partners; travel with "tribes" (supporter groups
and travel crews).

**Ecosystem:** fans, airlines and travel partners, clubs, schools and
universities, academies, parents and families, each a first-class stakeholder.

**Built for schools:** a school/community partner type; a five-step journey
(register → discover → join & participate → develop & learn → compete &
grow); programmes with dates and location; an open Learning Hub of coaching
and safeguarding resources (open on purpose: "a safeguarding policy is worth
more the more widely it is read").

**Designed, not built:** the school declares, TFE never holds pupil data. An
appointed school official warrants that travelling children have the
permissions the school's own process requires; TFE records the declaration
and passes a structured minors flag to every partner. A teacher never
consents on a parent's behalf. Parents & Families is scoped, not built.

**Articles:** "The Football Experience: a place for everyone around the
game"; "Follow your team. Travel with your tribe."

---

## Tena: guest WiFi that hands the guest relationship back to the host

**Status:** live at tena.host. **Co-founded:** Glen (founder & CEO; a Nairobi
host) and Kevin (co-founder & CTO). Confirm with Kevin how Glen wants to be
named before using his full name. Public copy says "co-founded by
OKJTechnologies' founder, who leads the technology".

**Name:** Swahili for "again", for a platform built on repeat bookings.

**The problem (from the July 2026 pitch deck):** booking platforms own the
guest relationship. Hosts get limited guest data, nothing on the guests
travelling with the booker, heavy commissions, low repeat bookings, weak
brand loyalty and rising acquisition costs. Tena moves the host from
"Host → OTA → Guest" to "Host → Tena → Guest".

**Origin:** born inside Glen's own short-stay business in Nairobi. The deck
has its track record; use those figures only in investor material Glen
approves, never on the public site or in this repo.

**How it works:** a TenaFi access point plugs into the host's router →
guests connect through a branded splash page (name, email, phone captured) →
branded homepage (guidebook, local experiences, property info, direct booking
links and upsells) → automated email and SMS (welcome, review requests,
campaigns, direct-booking offers) → guests book directly next time.

**Model (deck, July 2026; pricing has since moved on):** installation fee,
monthly subscription per property, and device financing over 12 months.
By November 2026 the site sells TenaFi Lite, Pro and Outdoor devices with
"buy the device / pay monthly", and "Book a demo" (call, video or visit)
has replaced the free trial. Journeys exist for rentals, events and
businesses (e.g. a café sending branded review-request emails).

**Roadmap:** Tena Connect (guest data: WiFi, CRM, profiles, analytics) →
Tena Engage (email/SMS, review requests, campaigns) → Tena Direct (direct
reservations, lower commissions) → Tena Local (marketplace: restaurants,
tours, transfers, local experiences, sponsored listings).

**Expansion (deck):** East Africa first (Kenya, Uganda, Tanzania, Rwanda),
then Southern, then West & North Africa. The deck's market sizing and
revenue projections are investor material only.

**Comparable:** StayFi (US guest-WiFi marketing) proved the model; Tena's
edge is an Africa focus, SMS, a local marketplace and being founded by
hospitality operators.

**Sources:** the Tena pitch deck (July 2026) and Glen's PR emails on the
Tena-host repo (Nov 2026), both in Kevin's Gmail.

**Articles:** "Tena means 'again'".

---

## Not yet written up


- **OKJTechnologies studio platform**: the studio's own site (see "One person,
  one thread").
