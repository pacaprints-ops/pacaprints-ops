# New Site Playbook

## Spinning up a new client site

### 1. Create project
```bash
npx create-next-app@latest projects/[client-name]
cd projects/[client-name]
```

### 2. Supabase (if needed)
- Create new project at supabase.com
- Copy URL + anon key into `.env.local`
- Install client: `npm install @supabase/supabase-js`

### 3. Git
```bash
git init
git remote add origin <github-repo-url>
git push -u origin main
```

### 4. Vercel
- Go to vercel.com → Add New Project → Import from GitHub
- Set environment variables in Vercel dashboard
- Deploy

### 5. Add to docs
- Add client to `docs/clients.md`
- Add project folder to `CLAUDE.md`
