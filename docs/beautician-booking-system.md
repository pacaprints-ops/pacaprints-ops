# Beautician Booking System — Project Discussion

**Date:** 2026-03-19
**Status:** Planning — not started yet
**Brand:** Paca Planners (sub-brand of Paca Prints)

---

## What Is This?

A custom booking system for a beautician client. They're currently on **Fresha** but fees are high — Fresha takes a cut of every payment on top of monthly fees. A custom build saves them money fast and gives them full control.

---

## What It Needs to Do

1. **Service list** — client-facing page showing all services with duration and price
2. **Available slot picker** — shows open slots based on the beautician's working hours, blocking already-booked times
3. **Booking form** — client picks service + slot, enters their details and card info
4. **Deposit payment** — takes a deposit at booking via Stripe, saves card on file
5. **SMS reminder** — sends a text to the client ~24 hours before their appointment (via Twilio)
6. **Charge remainder** — after treatment, beautician charges the remaining balance from the saved card (no client action needed)
7. **Admin panel** — beautician can view bookings, mark as complete, trigger final charge

---

## Tech Plan

| Part | Tool |
|---|---|
| Frontend + backend | Next.js |
| Database | Supabase |
| Payments | Stripe (card on file + off-session charge) |
| SMS reminders | Twilio |
| Hosting | Vercel |

---

## Built SaaS-Ready from Day One

Even though this is for one client now, the database will include a `business_id` on every table. That means adding more clients later is straightforward — no rebuild needed.

**Scaling path:**
- **Now:** One client, one deployment
- **Soon:** Multiple clients via subdomain routing (e.g. `sarah.pacastudio.com`)
- **Eventually:** Full SaaS with self-signup and platform billing

---

## Business / Pricing Thoughts

### Ongoing running costs (per client)
| Cost | ~Monthly |
|---|---|
| Vercel hosting | Free–£20 |
| Supabase | Free–£25 |
| Twilio SMS | £5–15 |
| Stripe fees | 1.5% + 25p (client pays directly) |

### Suggested pricing model
- **One-off build fee:** £800–1,500
- **Monthly retainer:** £25–35 (covers hosting, SMS, minor updates)
- **Key pitch:** "No per-booking cut. Ever." — vs Fresha taking % of every payment

---

## Next Steps (when we come back to this)

1. Get more detail from the client — services list, working hours, deposit amounts
2. Decide on pricing/contract with client
3. Set up project in `projects/` folder
4. Begin build (estimate 3–4 sessions to something deployable)

---

## Notes

- SMS reminders confirmed — WhatsApp not needed
- Build under **Paca Planners** brand
- One-off fee model preferred but monthly retainer worth discussing
