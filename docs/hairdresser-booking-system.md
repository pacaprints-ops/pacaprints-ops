# Hairdresser Booking System — Project Spec

**Date:** 2026-06-15
**Status:** Spec — not started yet
**Brand:** Paca Planners (sub-brand of Paca Prints)

---

## What It Is

A standalone website + booking system for a self-employed hairdresser. Customers visit the site, browse services, and book appointments online. The hairdresser manages everything through an admin login — no third-party booking platforms, no per-booking fees.

---

## Pages (Public-Facing)

### 1. Home / About
- Short intro about the hairdresser
- Photo
- Contact info / social links
- CTA button → Book Now

### 2. Services
- List of all services with name, duration, and price
- Flag which services require a patch test (e.g. colour, highlights, tints)

### 3. Booking
- Step-by-step booking flow (see below)

---

## Booking Flow

### Step 1 — Pick a Service
Customer selects from the services list.

### Step 2 — Patch Test Check (if applicable)
If the selected service requires a patch test:
- System explains a 15-minute patch test is required at least 48 hours before the main appointment
- Customer must first pick their **patch test slot** (must be ≥ 48 hours before main appointment)
- Then picks their **main appointment slot**
- Both are booked together in one checkout

### Step 3 — Pick a Slot
- Calendar shows available slots based on the hairdresser's working hours
- Already-booked times are blocked
- Slots auto-calculated from service duration (e.g. a 90-min colour blocks 1.5hr slot)

### Step 4 — Customer Details
- Name, email, phone number

### Step 5 — No-Show Agreement
- Clear statement:
  > "By booking you agree to our no-show policy. If you do not attend your appointment and have not cancelled at least 24 hours in advance, the full appointment fee will be charged to your saved card."
- Checkbox — must be ticked to proceed

### Step 6 — Card Details
- Card saved via Stripe (Setup Intent — no charge taken at this point unless deposit is configured)
- Option: can also take a deposit at this stage (configurable per service)

### Step 7 — Confirmation
- Email confirmation sent to customer with appointment details
- If patch test booked, both appointments listed

---

## No-Show Handling

- Card is saved to Stripe at booking time (Setup Intent)
- Admin marks appointment as "No Show" in the admin panel
- System automatically charges the full appointment fee from the saved card (off-session Stripe charge)
- Customer receives an email confirming the charge and explaining why

---

## Admin Panel (Hairdresser Login)

### Authentication
- Email + password login via Supabase Auth
- Single admin account (or multiple staff accounts if needed later)

### Working Hours
- Set standard working days and hours (e.g. Tue–Sat, 9am–5pm)
- Set exceptions: days off, holidays, early finishes
- Changes take effect immediately — booking calendar updates automatically

### Bookings View
- Calendar and list view of all upcoming appointments
- Customer name, service, time, patch test status (if applicable)
- Actions: View details | Mark No Show | Cancel (sends email to customer) | Block time off

### Services Management
- Add / edit / remove services
- Set name, duration, price, patch test required (yes/no)

---

## Email Notifications

| Trigger | Who Gets It |
|---|---|
| Booking confirmed | Customer + hairdresser |
| 48hr reminder | Customer |
| 24hr reminder | Customer |
| Appointment cancelled | Customer |
| No-show charge taken | Customer |

---

## Tech Stack

| Part | Tool |
|---|---|
| Frontend + backend | Next.js |
| Database | Supabase |
| Auth (admin login) | Supabase Auth |
| Payments + card saving | Stripe (Setup Intent + off-session charge) |
| Email notifications | Resend |
| Hosting | Vercel |

---

## Built SaaS-Ready from Day One

Every table will have a `business_id` column so this can be scaled to multiple hairdressers without a rebuild.

**Scaling path:**
- **Now:** One client, one deployment
- **Later:** Multiple clients via subdomain routing (e.g. `sarah.pacastudio.com`)
- **Eventually:** Full SaaS with self-signup

---

## Key Differences vs Beautician Booking System

| Feature | Beautician | Hairdresser |
|---|---|---|
| Patch test auto-booking | No | Yes — 15 min, 48hrs before |
| No-show auto-charge | No | Yes — full fee charged automatically |
| Deposit at booking | Yes | Optional per service |
| SMS reminders | Yes (Twilio) | Email only (can add Twilio later) |
| Charge remainder after treatment | Yes | No (full charge on no-show only) |

---

## Business / Pricing

### Running costs (per client)
| Cost | ~Monthly |
|---|---|
| Vercel hosting | Free–£20 |
| Supabase | Free–£25 |
| Resend emails | Free–£10 |
| Stripe fees | 1.5% + 25p (client's customers pay directly) |

### Suggested pricing
- **One-off build fee:** £800–1,500
- **Monthly retainer:** £25–35 (hosting, emails, minor updates)
- **Pitch:** No per-booking cut, full ownership of customer data, no third-party platform dependency

---

## Open Questions

Before build starts:
1. Is this a specific client, or building as a template for multiple hairdressers?
2. Do we want a deposit taken at booking, or just card saved?
3. What's the cancellation window? (suggested: 24 hours)
4. Domain: client's own domain or Paca subdomain?
5. Do we need a terms & conditions / privacy policy page?
6. Add SMS reminders (Twilio) now or later?

---

## Estimate

3–5 sessions to something deployable. Patch test logic and no-show auto-charge are the most complex parts.
