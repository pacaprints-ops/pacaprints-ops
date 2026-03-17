# Paca Planners — Wedding Planner Strategy

> Working document — decisions to be made, thoughts to be added. Not final.

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

### Guest Page (Wedding Website)
- Couple customises a public-facing page to share with guests
- Shows: wedding date, venue, schedule, travel info, dress code
- Guests RSVP via the page — attendance (day/evening) + food choices
- RSVP data feeds directly into the couple's guest list — no manual entry
- Couple controls what is visible; all planning data stays private
- Replaces the need for a separate wedding website

---

## Phase 2 Features (post-launch)

- Photography schedule builder + export/share
- Budget vs actuals chart / visual breakdown
- Supplier contact book
- Email reminders for upcoming tasks
- Mobile app (or progressive web app)

---

## What We're NOT Doing (yet)

- A separate Paca Planners website — for now it lives on pacaprints.com
- Separate social accounts — promoting through Paca Prints channels first
- Subscription pricing — keep it simple at launch

---

## Open Questions

- [ ] One-off fee or freemium? What price point?
- [ ] Build the guest page / wedding website feature in v1 or v2? (Direction agreed — it's happening, just a timing question)
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
