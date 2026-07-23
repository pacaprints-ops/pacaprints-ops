# Pre-School Management System — Project Plan

## Overview
A web-based management tool for a pre-school owner (friend/client). Replaces manual paperwork across registers, child records, waiting lists, invoicing, and staff tracking.

- **Client:** Winton Pre-School "Little Explorers", Bournemouth
- **Owners:** Sally & Louise (both admins — Managing Directors)
- **Fee:** Free build (for now)
- **Scale:** ~30 active children
- **Staff:** 8 total (Sally, Louise, Sam, Sky, Sadie, Kiana, Annie, Dana)
- **Access:** Laptop-first web app
- **Stack:** Next.js + Supabase + Vercel + Resend (email)
- **Contact:** 07305 240440 / info@wintonpreschool.org.uk
- **Location:** St Bernadette's Church Hall, 46 Draycott Rd, Bournemouth BH10 5AR

---

## Access Levels

| Role | Access |
|------|--------|
| Admin | All pages including invoicing, staff, term config, and full child management |
| Staff | Register + child profiles (read/add notes & accident forms) |

Auth: email/password login via Supabase Auth with role-based access control.

---

## Pages & Features

### 1. Register
- Filters to **today's day** automatically (e.g. Tuesday shows only Tuesday children)
- Shows each child's session(s) for that day
- Each child can be marked: **Present** / **Absent**
- If **Absent**: add reason note + log whether parent was contacted (yes/no + timestamp)
- **Allergy flag** — visible alert next to any child's name who has allergies recorded
- **Daily headcount** — live count of children marked present, visible at top of register
- **Ratio indicator** — live flag showing current staff:child ratio as children are ticked off. Updates dynamically (e.g. if children are absent, ratio changes). Flags amber/red if ratio is at risk
  - 3–4 year olds: 1:8 | 2 year olds: 1:4
- Simple, quick to use on a laptop in the morning rush

### 2. Children (Current)
- List of all active children
- Each child has a full profile:
  - Personal info (name, DOB, address)
  - Days and sessions attended
  - **Key worker** — assigned staff member (statutory requirement)
  - Allergies / dietary requirements (flagged on register if present)
  - **Medical needs & medication log** — conditions, medications, dosage, consent to administer
  - **Collection password** — a word set by the parent; staff check this if someone unfamiliar collects the child. Visible in the profile for authorised staff
  - Emergency contacts (multiple, with relationship)
  - Funded hours status (yes/no, hours amount — 15 or 30 hrs)
  - Notes (free text, dated)
  - Accident forms (add new, view history)
  - **Sickness %** — shown for current term and current school year (calculated from register data)
- **Archive** on leaving — data retained for 7 years, not deleted
- Archived children visible in a separate archived view

### 3. Waiting List
- Add a child: name, parent/guardian contact info, days/sessions needed, date added
- Status tracking (e.g. waiting, offered place, accepted)
- **Promote to active** — moves child off waiting list and auto-creates a blank child profile in the Children section, ready to fill in

### 4. Admin — Invoicing
- Term-based invoice generation (e.g. 12-week term)
- Looks at each child's sessions/hours for the term
- Calculates total: session price + £3.50 contribution per session
- Deducts **funded hours** automatically (gov funding — 15 or 30 hrs/wk, to research exact rules together)
- Shows amount owed per child
- **Payment status** — mark each invoice as paid / unpaid. Outstanding balances visible at a glance
- **Email invoice to parent** automatically as PDF attachment with templated email (via Resend)
- **Send reminder** emails for unpaid invoices
- View invoice history per child

### 5. Admin — Staff
- Staff list with contact info and role
- Log **hours worked** per staff member
- Log **sickness** entries (date, reason, duration)
- **Training tracker** — log qualifications and certification expiry dates (e.g. first aid renews every 3 years, safeguarding training). System flags upcoming expiries so Sally/Louise get a reminder before a cert lapses
- Basic overview — not full HR, just what they need day-to-day

### 6. Admin — Ratios Overview
- For each day of the week, shows the **expected ratio picture** based on enrolled children's set days
- Breakdown by age group (2yr olds vs 3–4yr olds) and sessions
- Helps admins plan staffing for the week ahead
- Separate from the live register ratio flag — this is the planning view, register is the live view

### 7. Admin — Term Config
- Admins set the **academic year term dates** once (e.g. Autumn, Spring, Summer terms with start/end dates and number of weeks)
- These drive: register availability, sickness % calculations, invoice term periods
- Can be updated year-on-year

---

## Sessions
- Open **Monday–Friday, 9:00am–3:00pm**, term time only
- Children can attend 15 or 30 funded hours per week (gov funding for 3 & 4 year olds from term after 3rd birthday; also 2-year-olds from eligible families)
- Additional paid hours available beyond funded entitlement

### Session Config (TEMPORARY — ⚠️ NEEDS CONFIRMING WITH SALLY & LOUISE)
| Session | Times | Price | Contribution |
|---------|-------|-------|--------------|
| Morning | 9:00–12:00 | £5.00 | £3.50 |
| Afternoon | 12:00–15:00 | £5.00 | £3.50 |
| Full Day | 9:00–15:00 | £5.00 | £3.50 |

- **Contribution:** £3.50 per session (charged on top of session price)
- Prices and session structure are placeholders — real figures needed before invoicing goes live

---

## Email (Resend)
- Invoices sent automatically as **PDF attachment** with a templated email
- Invoice reminder emails for unpaid invoices
- Possible: absence acknowledgement emails (future)

---

## Data Retention
- Archived children records kept for **7 years** minimum (legal requirement for pre-schools)
- Soft delete / archive only — no hard deletes on child records

---

## Staff Roles (from website)
| Name | Role | Notes |
|------|------|-------|
| Sally | Managing Director / Owner | Admin access. DSL, First Aider |
| Louise | Managing Director / Owner | Admin access. DSL, H&S Co-ordinator, First Aider |
| Sam | Deputy Manager / SENDCO | Deputy DSL, First Aider |
| Sky | Practitioner | Level 2 Apprentice, First Aider |
| Sadie | Practitioner | Level 3 Apprentice, First Aider |
| Kiana | Practitioner | Level 3 Early Years Educator, First Aider |
| Annie | Practitioner | Level 3 Early Years Educator, ENCO |
| Dana | Practitioner | Level 3 Early Years Educator, Communication Champion |

---

## Key Research Needed
- [ ] UK government funded hours rules (15/30 hrs, eligibility, how invoices handle it)
- [ ] ⚠️ Confirm session times and prices with Sally & Louise (using £5/session placeholder for now)
- [ ] ⚠️ Confirm term dates (number of terms per year, weeks per term)
- [ ] Confirm hourly rate charged for top-up hours beyond funded entitlement
- [x] Invoice format — PDF sent automatically via templated email (Resend)

---

## Phases

### Phase 1 — Core
- Auth + roles
- Register page (present/absent, allergy flag, headcount, live ratio indicator)
- Children section (profiles, key worker, collection password, medications, notes, accident forms)
- Waiting list + promote to active
- Archive

### Phase 2 — Admin Tools
- Term config (admin sets academic year dates)
- Invoicing (term calc, funded hours, contribution, payment status)
- Email invoices + reminders via Resend (PDF)
- Sickness % on child profiles

### Phase 3 — Staff & Planning
- Staff section (hours, sickness, training tracker with expiry reminders)
- Ratios overview page (planning view by day)
- Invoice history
- Any refinements from client feedback

---

## Potential Future
- Could become a SaaS product for other small pre-schools / nurseries
- Multi-tenant architecture worth considering from day one (business_id on all tables)
