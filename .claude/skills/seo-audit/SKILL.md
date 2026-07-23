---
name: seo-audit
description: Run an SEO audit on a Paca website — analyses the Next.js codebase and optionally fetches the live site. Invoke with /seo-audit or /seo-audit https://yoursite.com
user-invocable: true
disable-model-invocation: false
allowed-tools: Read, Glob, Grep, WebFetch, Bash
---

# SEO Audit

Run a full SEO audit. If a URL is provided as `$ARGUMENTS`, also fetch and audit the live site. Otherwise do a codebase-only audit.

**Live URL to audit:** `$ARGUMENTS` (skip live checks if empty)

---

## Step 1 — Identify the project root

Look for a Next.js project in the current working directory or under `projects/`. The app router uses `app/`, pages router uses `pages/`. Identify which is in use.

## Step 2 — Codebase audit

Work through each check below. Note findings as Pass, Warn, or Fail.

### Metadata
- Search for `export const metadata` and `generateMetadata` in all `page.tsx` / `layout.tsx` files
- Check root `app/layout.tsx` for a default `title`, `description`, and `openGraph` block
- Flag any page missing a `title` or `description`
- Check for `twitter` card metadata

### Headings
- Scan all page files for heading usage (`<h1`, `<h2`, etc.)
- Each page should have exactly one `<h1>`
- Flag pages with zero or multiple `<h1>` tags
- Check heading hierarchy isn't skipping levels (h1 → h3 with no h2)

### Images
- Find all `<Image` (Next.js) and `<img` tags
- Flag any missing an `alt` attribute or with `alt=""`
- Check for `priority` prop on above-the-fold images in root page

### Links
- Find internal links (`href="/..."`) and check they don't use bare `<a>` instead of Next.js `<Link>`
- Flag any `target="_blank"` links missing `rel="noopener noreferrer"`

### Robots & Sitemap
- Check `public/robots.txt` exists and is not blocking all crawlers
- Check `public/sitemap.xml` or a dynamic `app/sitemap.ts` exists
- Check `next.config.ts` for any `headers()` setting a `X-Robots-Tag`

### Structured Data
- Search for JSON-LD `<script type="application/ld+json">` in layout or pages
- Note absence as a Warn (not blocking, but an opportunity)

### Canonical URLs
- Check if canonical `<link rel="canonical">` is set, either via metadata `alternates.canonical` or manually
- Flag if missing on key pages

### Performance hints (Next.js specific)
- Check `next.config.ts` for `images.domains` / `images.remotePatterns` — overly broad patterns are a flag
- Check if `next/font` is used (good) vs loading Google Fonts via `<link>` in head (warn)
- Note any large client components that could be server components (affects LCP)

---

## Step 3 — Live site audit (only if URL provided)

If `$ARGUMENTS` is not empty, fetch the following and check:

1. **Homepage** (`$ARGUMENTS`) — fetch and inspect:
   - `<title>` present and under 60 chars
   - `<meta name="description">` present and 120–160 chars
   - `<meta property="og:title">`, `og:description`, `og:image` present
   - `<link rel="canonical">` present
   - Exactly one `<h1>`
   - `<meta name="robots">` — should not be `noindex`
   - Page returns HTTP 200

2. **robots.txt** — fetch `$ARGUMENTS/robots.txt` and verify it's valid and not blocking Googlebot

3. **Sitemap** — fetch `$ARGUMENTS/sitemap.xml` and confirm it loads

---

## Step 4 — Report

Output a clean markdown report with this structure:

```
# SEO Audit Report — [site name]
Date: [today]

## Summary
[2–3 sentence overview of overall health]

## Scores
| Area | Status |
|------|--------|
| Metadata | ✅ / ⚠️ / ❌ |
| Headings | ✅ / ⚠️ / ❌ |
| Images | ✅ / ⚠️ / ❌ |
| Links | ✅ / ⚠️ / ❌ |
| Robots & Sitemap | ✅ / ⚠️ / ❌ |
| Structured Data | ✅ / ⚠️ / ❌ |
| Canonical URLs | ✅ / ⚠️ / ❌ |
| Live Site | ✅ / ⚠️ / ❌ / N/A |

## Issues

### ❌ Critical
[list blockers — noindex on live pages, missing titles, broken sitemap]

### ⚠️ Warnings
[list improvements — missing og:image, no structured data, bare <a> tags]

### ✅ Passing
[brief list of what's good]

## Recommended Fixes (priority order)
1. ...
2. ...
```

Keep the report concise and actionable. Link to specific files and line numbers where possible.
