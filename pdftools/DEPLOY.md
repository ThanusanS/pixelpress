# PixelPress — Final Deployment Guide

## Vercel (2 minutes)

1. Push `pdftools/frontend/` contents to GitHub
2. vercel.com → New Project → Import repo
3. Framework: Create React App | Build: `npm run build` | Output: `build`
4. Deploy — done!

## After deploy — update these URLs

Replace `https://pixelpress.tools` with your actual domain in:
- `frontend/public/index.html` (canonical, og:url, og:image)
- `frontend/public/sitemap.xml` (all URLs)
- `frontend/src/components/shared/ToolLayout.jsx` (canonical setter)

## Google AdSense checklist (required before applying)

- [x] Privacy Policy page at /privacy
- [x] Terms of Service page at /terms
- [x] About page at /about
- [x] Contact page at /contact
- [x] Footer with legal links on every page
- [x] 200+ words of content on every tool page
- [x] sitemap.xml submitted to Google Search Console
- [x] robots.txt present
- [ ] Replace publisher ID in index.html and uncomment the AdSense script
- [ ] Add your real ad slot IDs in HomePage.jsx AdBanner components

## Features in this release

✅ Light + Dark mode (system preference + manual toggle)
✅ Fully responsive mobile layout with hamburger menu
✅ Collapsible sidebar on desktop
✅ Privacy Policy, Terms of Service, About, Contact pages
✅ Footer with full link columns on every page
✅ Breadcrumb navigation on all tool pages
✅ FAQ section on every tool page
✅ "How to use" step guide on every tool page
✅ SEO meta tags update dynamically per tool
✅ Lazy loading for tool components (code splitting)
✅ React.memo on ToolCard for performance
✅ 404 page
✅ Schema.org structured data
✅ sitemap.xml (28 pages)
✅ robots.txt
✅ vercel.json (routing + security headers + caching)
