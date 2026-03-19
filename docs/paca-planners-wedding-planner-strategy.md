# Paca Planners — Wedding Planner Strategy

> Working document — updated 2026-03-17. Build starting.

---

## The Concept

A web-based wedding planning tool for couples, fully branded as Paca Planners. Couples log in, plan their entire wedding in one place, and at the right moments are nudged towards relevant Paca Prints products.

This is not a PDF download. This is not a spreadsheet. It's a proper web app that no Etsy listing can compete with.

Crucially: it's also the couple's **wedding website**. Guests get their own shareable link showing a curated public page — schedule, venue details, dress code — and can RSVP directly into the planner. Couples don't need to pay for a separate wedding website. It's all in one.

---

## The Problem We're Solving

The Etsy wedding planner market is saturated with static PDF and Excel downloads. They all look the same, they're all passive, and once you've bought one you're on your own.

Couples planning a wedding need something that:
- Is always accessible (phone, laptop, anywhere)
- Can be shared with their partner, maid of honour, mum, wedding planner
- Tracks everything in one place and keeps them on top of it
- Feels beautiful and calm, not clinical and overwhelming

Nobody is connecting a planning tool directly to a shop that makes the actual wedding products. And nobody is combining a planning tool with a wedding website in one product. Those are our edges.

---

## Our Differentiation

### 1. The Paca Prints Integration
At exactly the right moment in the planning journey, we surface relevant products:

| Planning moment | Product to show |
|----------------|-----------------|
| Bridesmaids added | Bridesmaids proposal cards |
| Invitations stage | Invitation designs |
| RSVP phase opens | Save the dates |
| Guest list finalised | Thank you cards |
| 6 months out | Wedding signage |
| Table plan done | Place cards / seating chart prints |

This turns a free planning tool into a natural, non-pushy sales funnel. No other planner does this because no other planner has a shop behind it.

### 2. Wedding Website + Planner in One
Couples currently need two products — a planning tool and a wedding website (Hitched, Zola, etc.). We replace both.

The couple gets a shareable guest page they can customise:
- Wedding date, venue, schedule/timeline
- Travel and accommodation info
- Dress code
- RSVP form — guests fill in their own attendance (day/evening) and food choices

Guest RSVPs feed directly into the couple's guest list and food count. No manual entry, no spreadsheet wrangling. The couple controls exactly what guests can see — budget, quotes, and planning details stay private.

### 3. Collaborators
Most planning tools are single-user. We let couples invite their partner, maid of honour, mum, or wedding planner to view and edit. This makes the tool stickier and more useful.

### 4. RSVP → Food → Venue
Guests RSVP via the public page and select their food choices. The planner automatically counts everything up — so when the couple needs to send final numbers to the chef/hotel/venue, it's already done. That's a real pain point nobody else solves cleanly.

### 5. Photography Schedule Export
Couples can build their photo group list (family, college friends, bridal party etc.) and export it to send directly to their photographer. A small feature that saves real stress on the day.

### 6. Branding
Mint and peach. Warm, friendly, a little bit fun. Not the sterile white and gold everything else uses.

---

## Pricing

### Option A — One-Off Fee (recommended starting point)
- Couples pay once (suggested: **£15–25**) and own the planner forever
- No subscription anxiety, no cancellation friction
- Fits the psychology: "I'm planning one wedding, I want to pay once and get on with it"
- Simple to sell on TikTok, Etsy, and the website

### Option B — Freemium
- Free tier: basic features, limited guests, no collaborators
- Paid tier (one-off or low annual): unlocks collaborators, more guests, exports, photography schedule
- Strong because couples get invested before they pay — they've already added their guest list and won't want to start again elsewhere
- More complex to build initially

### Option C — Monthly Subscription
- Not recommended. Couples plan one wedding — a subscription feels punishing. They'll resent it and churn as soon as the wedding is done. Doesn't fit the use case.

### Recommendation
Start with a **one-off fee**. It's the simplest to launch and easiest to sell. Revisit freemium once the product is built and we know what features people value most.

---

## Core Features (v1 — Launch)

These are the features that matter most and that no static download can offer.

### Dashboard
- Countdown to the wedding day
- Budget summary (total, spent, remaining)
- Quick links to all sections
- Progress indicators (invites sent, RSVPs in, table plan complete etc.)

### Budget Tracker
- Add budget by category (venue, catering, flowers, photography, dress, etc.)
- Log actual spend against each category
- See totals at a glance

### Suppliers & Quotes
- Add suppliers per category
- Log multiple quotes per supplier
- Mark one as chosen
- Add notes, contact details, what you're getting for what money
- Budget auto-updated when a quote is chosen

### Guest List
- Day guests and evening guests separately
- Track invitation sent (yes/no)
- RSVP status (awaiting, yes, no)
- Dietary/food choices collected per guest
- Auto-count of food choices for venue handover
- Export guest list

### Table Plan
- Add tables, name them, set number of seats
- Drag guests onto tables from the confirmed RSVP list
- See unseated guests at a glance

### To-Do & Reminders
- Add tasks with due dates
- Tick them off
- Dashboard shows overdue and upcoming tasks

### Collaborators
- Invite partner, maid of honour, mum, wedding planner etc. by email
- They get their own login and can view/edit

### Paca Products Panel
- Context-aware product suggestions at the right planning stage
- Links through to pacaprints.com

### Wedding Details Settings (couple-facing)
- A settings page inside the planner where the couple fill in everything once:
  - Both names, wedding date, venue name & address
  - Ceremony time, reception time
  - Dress code
  - Travel, parking, accommodation notes
  - Message to guests
  - Menu options (couple adds their own: e.g. Chicken / Beef / Vegetarian) — these appear as choices on the guest RSVP form
  - Section visibility toggles — show/hide each section on the guest page

### Guest Page (Wedding Website)
- Public shareable page at a unique URL (e.g. `pacaplanners.com/wedding/their-unique-code`)
- Can also be shared as a QR code (printed on invites etc.)
- Pulls directly from Wedding Details settings — couple updates once, guest page updates instantly
- Shows only what the couple has toggled on: date, venue, schedule, travel, dress code, message
- RSVP form uses the couple's own menu options
- Guest RSVPs feed directly into the couple's guest list — no manual entry
- All private planning data (budget, quotes, suppliers) never visible to guests
- Replaces the need for a separate wedding website (Hitched, Zola etc.)

---

## Phase 2 Features (post-launch)

- Photography schedule builder + export/share
- Budget vs actuals chart / visual breakdown
- Supplier contact book
- Email reminders for upcoming tasks
- Mobile app (or progressive web app)

---

## Tech Stack

- **Framework:** Next.js (same as menu-planner)
- **Database / Auth:** Supabase — sharing the menu-planner Supabase project (both free slots are used: menu-planner + paca-ops). Wedding planner tables will be cleanly namespaced. Migrate to own Supabase project if/when it makes sense.
- **Styling:** Tailwind CSS v4
- **Language:** TypeScript
- **Hosting:** Vercel
- **Repo location:** `projects/wedding-planner/` inside paca-brain (already scaffolded)

## Build Order (Phases)

### Phase 1 — Foundation
- Scaffold Next.js app
- Supabase project + auth (sign up, log in, remember me, protected routes)
- Base layout and Paca Planners branding (mint/peach)

### Phase 2 — Core Planning
- Dashboard (countdown, budget summary, progress indicators)
- Budget tracker (categories, spend vs budget)
- Suppliers & quotes (multiple quotes, pick winner, notes, contact details)

### Phase 3 — Guests
- Guest list (day/evening, invites sent, RSVP status, food choices)
- Food count summary for venue handover
- Table plan builder

### Phase 4 — Wedding Website
- Wedding Details settings page (couple fills in once)
- Public guest page (unique URL + QR code)
- Guest RSVP form (feeds back into guest list)
- Section visibility toggles

### Phase 5 — Finishing
- Collaborators (invite partner, maid of honour etc.)
- To-do & reminders
- Paca Prints product suggestions (context-aware)
- Photography schedule builder + export

---

## What We're NOT Doing (yet)

- A separate Paca Planners website — wedding planner will be its own standalone site
- Separate social accounts — promoting through Paca Prints channels first
- Subscription pricing — one-off fee at launch

---

## Open Questions

- [ ] One-off fee or freemium? What price point?
- [ ] Guest page / wedding website — Phase 4 of the build (direction agreed, timing confirmed)
- [ ] How do we handle the Etsy angle — do we still sell a PDF version there as a lead-in?
- [ ] Separate Paca Planners social accounts — see `docs/paca-planners-strategy-discussion.md`
- [ ] Do we want a Paca Planners logo / variant of the Paca brand?

---

## Decision Log

| Date | Decision | By |
|------|----------|----|
| 2026-03-17 | Wedding planner will be a web app, not a PDF download | Carrie |
| 2026-03-17 | Will integrate Paca Prints product suggestions into the planner | Carrie |
| 2026-03-17 | Subscription pricing ruled out | Carrie |
| 2026-03-17 | Planner will include a guest-facing wedding website page — couples don't need a separate wedding website | Carrie |
| 2026-03-17 | Wedding Details settings page in planner drives the guest page — couple fills in once, guest page updates instantly | Carrie |
| 2026-03-17 | Couple sets their own menu options — appears as choices on guest RSVP form | Carrie |
| 2026-03-17 | Own standalone site (not part of pacaprints.com) — `projects/wedding-planner/` | Carrie |
| 2026-03-17 | Build order confirmed: Foundation → Core Planning → Guests → Wedding Website → Finishing | Carrie |
| 2026-03-17 | Will share menu-planner Supabase project — no free slots remaining. Tables to be namespaced cleanly. | Carrie |
| 2026-03-17 | Next.js app scaffolded at projects/wedding-planner/ — ready to build when we return | Carrie |
