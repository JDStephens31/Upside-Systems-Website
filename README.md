# Upside Systems website

A plain static site: HTML, two stylesheets and three small scripts. No build step.

## Files
- `index.html` – home
- `packages.html` – packages, tiers, Upside Complete, the build-your-own package builder, payback promise
- `audit.html` – the free audit: intro with the under-5-minutes promise, one page per sector
  (built from `AREAS` in `assets/audit.js`), business details, then results and booking
- `about.html`, `privacy.html`, `accessibility.html`, `404.html`
- `assets/styles.css` – all styling (colors are variables at the top)
- `assets/audit.js` – calculator logic, prices and where booking requests are sent
- `assets/builder.js` – the custom package builder: every feature with its own price, support levels and where requests are sent
- `assets/site.js` – mobile menu, scroll animations, cookie consent banner, top-bar month and footer year
- `assets/fonts.css`, `assets/fonts/` – self-hosted fonts and their licenses
- `robots.txt`, `sitemap.xml` – for search engines (update the domain if it changes)
- `assets/logo.svg`, `assets/mark.svg`, `assets/favicon.svg`

## Put it online
Any static host works. The quickest:
- **Netlify:** drag this folder onto app.netlify.com/drop.
- **Cloudflare Pages:** create a project, upload the folder, connect your domain.

## Booking form email
Booking requests go straight to `contactEmail` (consultation@upsidesys.com) through
[FormSubmit](https://formsubmit.co), a free relay with no account. Visitors never leave the page.

**One-time activation:** the very first request triggers an email from FormSubmit
to consultation@upsidesys.com. Click its activation link, and every request after that
arrives as a table with the visitor’s details and audit numbers. Do a test
booking on the live site right after launch so the activation isn’t waiting on a real lead.
Requests sent before activation show the visitor an error with your email address.

Optional: after activating, FormSubmit can give you a random alias to use in place
of the address, so it isn’t visible in `assets/audit.js`.

## Also send bookings to n8n (optional)
1. In n8n, add a **Webhook** node (method POST) and copy its production URL.
2. Open `assets/audit.js` and paste it into `webhookUrl` in the `CONFIG` block.
3. In the Webhook node, allow your site's domain (CORS / allowed origins).

The webhook gets JSON with `contact`, `business`, `estimate` and `projection`,
in addition to the email.

## Change prices or assumptions
Everything is in the `CONFIG` and `AREAS` blocks at the top of `assets/audit.js`
(tier prices, automation rate per task, tier thresholds, projection defaults).
Package prices on `index.html` and `packages.html` are plain text, so update them there too.

**Custom packages:** `BUILDER` and `SECTORS` at the top of `assets/builder.js` hold each
feature’s setup and monthly price, the support levels (Standard, Plus, Priority), the
minimum custom package price and a copy of the tier and Upside Complete prices. The tier
copy is only used to tell visitors when a ready-made package is cheaper than their picks,
but keep it in step with the other two places. Feature prices were set so that picking
a whole tier item by item costs a little more than the tier itself. Custom package
requests arrive by email through the same FormSubmit relay, with the subject
“New custom package”. To also send them to n8n, set `webhookUrl` in `BUILDER`.

## Analytics, cookies and privacy
Every page has the Google Analytics 4 tag (`G-LYQRHSPG2B`) in its `<head>`, after a small consent
block. Analytics is opt-in for every visitor: `gtag.js` isn’t fetched, no cookie is set and nothing
reaches Google until they choose “Accept analytics” (the block’s `upsideAnalytics()` then loads it).
Browsers sending Global Privacy Control never load it. Advertising storage is never enabled.
Opt-in everywhere was chosen over Google’s region detection because the region-based setup
couldn’t be shown to keep EU visitors opted out. The banner and the footer’s
“Cookie settings” button are in `assets/site.js`; the choice is kept in local storage as
`upside-consent`. Equal-weight Accept and Decline buttons are deliberate (EU regulators expect it).

The consent block also switches off Google signals, ad personalization and ad identifiers in code
(`allow_google_signals`, `allow_ad_personalization_signals`, `ads_data_redaction`), so the privacy
policy holds whatever the Analytics account settings are. `privacy.html` says Analytics data is kept
for no more than 14 months: GA4’s default of 2 months fits, and so does 14 months
(Admin → Data collection and modification → Data retention). Don’t pick a longer option.
- If you add another tracker, pixel or embed, add it to the privacy policy and gate it behind the same consent.

Fonts are self-hosted in `assets/fonts/` (`assets/fonts.css`) so pages make no request to Google
Fonts, which German courts have treated as a GDPR breach. The fonts are under the SIL Open Font
License; keep the `OFL-*.txt` files next to them.

## Accessibility
The site targets WCAG 2.2 AA (`accessibility.html` is the public statement and how to report a
problem). When you change pages, keep: one `<h1>` per page, labels on every field, visible focus,
text contrast of at least 4.5:1 (3:1 for borders of form fields and chart lines), targets at least
24px, and nothing that only works with a mouse. Running axe DevTools or Lighthouse on a changed
page is a quick check.

## Content that was filled in with best guesses
Every placeholder now has real copy, but check these before launch:
- **Domain and email (confirmed):** `https://upsidesys.com` and `consultation@upsidesys.com`
  (in every page footer, `og:url`/canonical tags, `robots.txt`, `sitemap.xml`, `assets/audit.js`).
- **Founder story** on `index.html` and `about.html` (founders Jonathan S. and Joel M.).
- **Custom package prices:** every per-feature price, the support-level fees and the $1,000 / $150 minimum
  in `assets/builder.js` are first-pass numbers. Set them to what you actually want to charge.
- **Privacy policy and accessibility statement** were rewritten on October 31, 2026 for Google Analytics,
  GDPR, CCPA/CPRA and WCAG 2.2. Have a lawyer read both before relying on them.
- **Terms:** setup times, three-month minimum then 30 days’ notice, payback promise conditions (`packages.html`).
- **Privacy policy:** legal name (Upside Systems LLC), vendors (FormSubmit, n8n, Google Workspace, HubSpot, Cal.com),
  12-month retention. Have it reviewed for the places you and your clients operate.
- **Client quote:** the home page shows our promise instead of a testimonial. Swap in a real
  client quote once you have one.

Photos: the founder boxes show a “JS + JM” monogram. To use a photo, replace the
`<div class="ph monogram">` with `<img src="assets/your-photo.jpg" alt="...">`.

The logo’s text uses the Schibsted Grotesk font; outline the text in a design
tool before sending `logo.svg` to a printer.
