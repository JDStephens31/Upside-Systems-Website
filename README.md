# Upside Systems website

A plain static site: HTML, one stylesheet and two small scripts. No build step.

## Files
- `index.html` – home
- `packages.html` – packages, tiers, Upside Complete, payback promise
- `audit.html` – the free audit (calculator, cost per hour, 5-year outlook, booking form)
- `about.html`, `privacy.html`, `404.html`
- `assets/styles.css` – all styling (colors are variables at the top)
- `assets/audit.js` – calculator logic, prices and the form webhook
- `assets/site.js` – mobile menu, top-bar month and footer year
- `robots.txt`, `sitemap.xml` – for search engines (update the domain if it changes)
- `assets/logo.svg`, `assets/mark.svg`, `assets/favicon.svg`

## Put it online
Any static host works. The quickest:
- **Netlify:** drag this folder onto app.netlify.com/drop.
- **Cloudflare Pages:** create a project, upload the folder, connect your domain.

## Connect the booking form to n8n
1. In n8n, add a **Webhook** node (method POST) and copy its production URL.
2. Open `assets/audit.js` and paste it into `webhookUrl` in the `CONFIG` block.
3. In the Webhook node, allow your site's domain (CORS / allowed origins).

The form sends JSON with `contact`, `business`, `estimate` and `projection`.
Until a URL is set, the form opens the visitor’s email app with their details and
audit numbers pre-filled, addressed to `contactEmail` in the same `CONFIG` block.

## Change prices or assumptions
Everything is in the `CONFIG` and `AREAS` blocks at the top of `assets/audit.js`
(tier prices, automation rate per task, tier thresholds, projection defaults).
Package prices on `index.html` and `packages.html` are plain text, so update them there too.

## Content that was filled in with best guesses
Every placeholder now has real copy, but check these before launch:
- **Domain and email:** `https://upsidesystems.com` and `hello@upsidesystems.com`
  (in every page footer, `og:url`/canonical tags, `robots.txt`, `sitemap.xml`, `assets/audit.js`).
- **Founder story** on `index.html` and `about.html` (Jonathan Stephens).
- **Terms:** setup times, three-month minimum then 30 days’ notice, payback promise conditions (`packages.html`).
- **Privacy policy:** legal name (Upside Systems LLC), vendors (n8n, Google Workspace, HubSpot, Cal.com),
  12-month retention. Have it reviewed for the places you and your clients operate.
- **Client quote:** the home page shows our promise instead of a testimonial. Swap in a real
  client quote once you have one.

Photos: the founder boxes show a “JS” monogram. To use a photo, replace the
`<div class="ph monogram">` with `<img src="assets/your-photo.jpg" alt="...">`.

The logo’s text uses the Schibsted Grotesk font; outline the text in a design
tool before sending `logo.svg` to a printer.
