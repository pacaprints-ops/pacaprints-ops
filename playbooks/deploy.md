# Deploy Playbook

## Vercel (Next.js projects)

### First-time setup on a new machine
1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Link project: `vercel link` (run inside project folder)

### Deploy
- **Preview:** `vercel` (creates a preview URL)
- **Production:** `vercel --prod`
- Or just push to `main` branch — Vercel auto-deploys if connected to GitHub

### Environment variables
- Set in Vercel dashboard: Project → Settings → Environment Variables
- Local dev: copy `.env.local` manually (never commit this file)

## Supabase
- Dashboard: https://supabase.com/dashboard
- Get connection string from: Project → Settings → Database
