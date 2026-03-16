# Paca Brain — Claude Instructions

## Team Protocol

### User Identification

At the start of every session, run `hostname` to identify who is using Claude Code.

| Hostname | User | Role |
|----------|------|------|
| Elliotts | Vicky | Owner |
| PacaPrints | Carrie | Owner |

If the hostname is not in this table, say: "I don't recognise this machine — who am I speaking with?"

### Vicky's Alert Protocol

When **Vicky** is in session, **stop and say "Check with Carrie before we go any further"** if she is about to:

- Spend money or make any purchase that may exceed budget
- Delete, reset, or overwrite any data (orders, materials, finances, recipes)
- Make any destructive or hard-to-reverse change to the repo (force push, reset --hard, drop tables, delete branches)
- Make any change that could break the live app or shared data

**Exact response when triggered:**
> "Hold on — this could cause an issue. You'll need to check with Carrie before we do this."

Do not proceed with the action until the user explicitly confirms Carrie has approved it.

### Team Profiles

#### Carrie (Owner)
- Machine hostname: **PacaPrints**
- Runs all technical work, finances, platform management, code, and supplier orders

#### Vicky (Owner)
- Machine hostname: **Elliotts**
- Sorts and packs orders, manages socials and customer communication
- Subject to alert protocol above — flag anything risky and pause

---

## About Paca
Small ecommerce business selling prints, cards and gifts. Also building and coding websites for clients to sell as SaaS products or help their own efficiency.

- **Public website (storefront):** [www.pacaprints.com](https://www.pacaprints.com)
- **paca-ops is NOT the public website** — it is an internal operations tool only

## Tech Stack
- **Web projects:** Next.js, Supabase, Vercel
- **Ecommerce:** TBD

## Usage
- Plan: Claude Code $20/month
- Check usage weekly at claude.ai → Settings → Billing
- Aim to flag if work is heavy — pause non-urgent tasks if nearing 75% of monthly limit

## Preferences
- Keep solutions simple and avoid over-engineering
- Ask before making destructive git operations
- Never auto-commit unless explicitly asked

## Projects
- `projects/paca-ops/` — internal ops site (Next.js + Supabase, deployed on Vercel) — **not public-facing**
- Public storefront: www.pacaprints.com

## Key Docs
- `docs/business.md` — brand, products, tone
- `docs/clients.md` — client contacts and notes
- `docs/suppliers.md` — print/card/gift suppliers
- `playbooks/` — how-to guides for recurring tasks
