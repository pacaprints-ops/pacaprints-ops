# SaaS Ideas

## How to evaluate an idea
- **Problem:** What pain does it solve?
- **Who pays:** Who is the customer?
- **Competition:** What exists already?
- **Our edge:** Why us / why can we build it?
- **Effort:** Quick win or big build?

---

## Ideas

### Household Menu Planner App
- **Problem:** Planning meals for a household where everyone has different schedules, preferences and dietary needs is genuinely painful. Existing apps are too simple or too generic.
- **Who pays:** Families, households, busy parents — likely a subscription (monthly/annual)
- **Competition:** Mealime, Plan to Eat, Paprika — but none handle per-person schedules well
- **Our edge:** The per-person scheduling angle is the differentiator — no one does this well
- **Effort:** Medium-large build, but could launch an MVP with core features first
- **Status:** Idea — detailed spec below
- **Platform:** Apple (iOS/macOS first)
- **Notes:** Carrie's idea, already well thought through

#### Core Features

**Household Setup**
- Create a household
- Add members (name, age, dietary restrictions, dislikes per person)
- Members can eat the same or different meals

**Scheduling (the key differentiator)**
- Set a weekly schedule template (breakfast/lunch/dinner for everyone)
- Or customise per week and per person:
  - This person needs hot lunch
  - This person is on late shift, breakfast only
  - This person needs 3 dinners this week
  - etc.

**Meal Library**
- Add meals you already know and like
- Tag meals (breakfast, lunch, dinner, quick, batch cook, etc.)
- Link ingredients to meals

**Kitchen Inventory**
- Log what you already have in
- Factor into the generated plan (use up what you have)

**Rules & Preferences**
- Budget per week
- Rules e.g. "breakfast is always simple — cereal or toast only"
- Frequency rules e.g. "no pasta twice in one week"

**Generation**
- Generate a weekly menu plan based on all the above
- Produces a shopping list within budget
- Takes into account what's already in the kitchen

#### MVP (what to build first)
1. Household + people setup with dislikes
2. Basic weekly schedule (same meals for everyone)
3. Meal library
4. Generate plan + shopping list
5. Budget input

#### Later
- Per-person weekly schedule
- Kitchen inventory
- Rules engine
- Supermarket integration (Tesco/Sainsbury's API for pricing)
- AI meal suggestions

---

### Multi-Platform Pricing & Margin Manager
- **Problem:** Small sellers on TikTok Shop, Etsy, eBay etc. struggle to manage pricing across platforms — each has different fees, sale events, and you lose track of actual margins. Most people just guess.
- **Who pays:** Small ecommerce sellers, Etsy/TikTok/eBay sellers — subscription
- **Competition:** Some spreadsheet templates, nothing great purpose-built for multi-platform small sellers
- **Our edge:** We live this problem at Pacaprints — we know exactly what's painful
- **Effort:** Small-medium — core is straightforward maths with a good UI
- **Status:** Idea
- **Notes:** Carrie's idea

#### Core Features
- Add your products with a base cost price
- Set selling price per platform (TikTok, Etsy, eBay, own site etc.)
- Platform fees auto-applied per channel (Etsy listing fee, TikTok commission, eBay final value fee etc.)
- See real margin per product per platform at a glance
- Sale mode — set a sale price and instantly see how it affects margin
- Warnings if margin drops below your threshold
- "What price do I need to charge to hit X% margin on Etsy?" calculator

#### Later
- Sync with platform APIs to pull live fee rates
- Bulk price updates across platforms
- Sale event planner (Black Friday, seasonal)
- Export pricing sheet

---

### Print Shop Order Manager
- **Problem:** Small print/craft businesses have no lightweight tool for order + fulfilment tracking
- **Who pays:** Small print businesses, Etsy sellers, craft sellers
- **Our edge:** We built paca-ops for ourselves — we know the problem deeply
- **Effort:** Medium — paca-ops is already 80% of it
- **Status:** Idea
- **Notes:** Could productise paca-ops with multi-tenant support

---

### Seasonal Product Planner
- **Problem:** Small product businesses miss seasonal opportunities or prep too late
- **Who pays:** Small ecommerce businesses, Etsy sellers, market traders
- **Our edge:** Already built this feature in paca-ops
- **Effort:** Small — extract and productise the seasonal planner
- **Status:** Idea

---

### Cricut Job Tracker
- **Problem:** No good tool for small Cricut businesses to track personalisation jobs, materials and quotes
- **Who pays:** Small Cricut/craft businesses
- **Our edge:** We use a Cricut ourselves
- **Effort:** Small-medium
- **Status:** Idea

---

### Digital Loyalty Card Manager
- **Problem:** Small local businesses use paper loyalty cards — digital versions are expensive or overcomplicated
- **Who pays:** Local cafes, salons, small retailers
- **Our edge:** We already make physical loyalty cards for clients
- **Effort:** Small-medium (QR code based, simple stamp system)
- **Status:** Idea

---

### Meeting Notes SaaS
- **Problem:** Teams record meetings (e.g. with Otter.ai) and get a transcript, but still need to manually write up summaries and action points
- **Who pays:** Companies, agencies, any business holding regular internal or client meetings — monthly fee per company
- **Competition:** Otter.ai and Fireflies do transcription + basic summaries, but no lightweight uploadable tool tied to a client's own branded portal
- **Our edge:** Build once, resell to multiple clients — or white-label per client with their branding
- **Effort:** Small-medium — core is straightforward with Claude API + Supabase storage
- **Status:** Idea

#### Core Features
- Auth (Supabase)
- Upload transcript (text paste or file)
- Auto-generate via Claude API: summary, key decisions, action points per person
- Store each meeting with date and title
- Meeting history dashboard
- Export to PDF or copy to clipboard

#### Later
- Audio upload → transcribe via Whisper API first, then summarise
- Team accounts (multiple users per company)
- Custom prompt templates per client
- White-label branding per client
