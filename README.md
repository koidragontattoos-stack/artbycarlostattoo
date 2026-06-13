# Art by Carlos Tattoo

Marketing website for Carlos Barrera, custom tattoo artist (Japanese, Realism, Fine Line & Floral, Bio-Organic, Cover-Ups & more). Resident artist at Koi Dragon Tattoos, Murray, Utah — booking worldwide.

**Live site:** https://artbycarlostattoo.netlify.app

## What this is
A fast, static HTML/CSS/JS website (no build step). Each tattoo style has its own SEO-optimized page, with Google Analytics 4 tracking and WCAG 2.2 AA accessibility.

## Structure
- `index.html` — home
- `*-tattoos.html` — one page per style (japanese, bio-organic, traditional, neo-traditional, realism, floral [Fine Line & Floral], watercolor, coverup-reworks)
- `contact.html` — contact / booking
- `css/style.css` — all styles
- `js/main.js` — interactions + GA4 event tracking
- `media/` — self-hosted images and video
- `sitemap.xml`, `robots.txt`, `_redirects` — SEO + redirects

## Deploying
Connected to Netlify for automatic deploys: push to the main branch and Netlify publishes the site (publish directory: project root). No build command needed.

## Notes
- Google Analytics 4 Measurement ID: G-ZX91LVJ7V7 (property "Art by Carlos Tattoo")
- Most gallery photos are served from the studio's Google Cloud storage; `media/` holds self-hosted assets.
