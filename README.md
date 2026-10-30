# Upside Systems website

A plain static site: HTML, one stylesheet and two small scripts. No build step.

## Files
- `index.html` – home
- `packages.html` – packages, tiers, Upside Complete, payback promise
- `audit.html` – the free audit (calculator, cost per hour, 5-year outlook, booking form)
- `about.html`, `privacy.html`, `404.html`
- `assets/styles.css` – all styling (colors are variables at the top)
- `assets/audit.js` – calculator logic, prices and the form webhook
- `assets/site.js` – mobile menu and footer year
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
Until a URL is set, the form runs in demo mode and just shows the thank-you message.

## Change prices or assumptions
Everything is in the `CONFIG` and `AREAS` blocks at the top of `assets/audit.js`
(tier prices, automation rate per task, tier thresholds, projection defaults).
Package prices on `index.html` and `packages.html` are plain text, so update them there too.

## Before launch, fill in every [BRACKETED] placeholder
Search all files for `[` to find them: your email, domain, month in the top bar,
client size range, setup time, cancellation terms, payback promise terms,
founder note and photo, client quote and photo, and the privacy policy details.
Have the privacy policy reviewed for the places you and your clients operate.

Photos: drop images into `assets/` and replace the dashed placeholder boxes with
`<img src="assets/your-photo.jpg" alt="...">`.

The logo's text uses the Schibsted Grotesk font; outline the text in a design
tool before sending `logo.svg` to a printer.
