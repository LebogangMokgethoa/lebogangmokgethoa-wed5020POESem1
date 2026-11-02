# Paws Animal Shelter - Website (Part 3)

A multi-page website for Paws Shelter, an animal shelter in Pretoria that rescues, cares for and rehomes abandoned dogs and puppies.

Built with HTML, CSS and JavaScript as a multi-part web development assignment (WEDE5020).

- **Live site:** https://lebogangmokgethoa.github.io/lebogangmokgethoawed5020POESem1/
- **Repository:** https://github.com/LebogangMokgethoa/lebogangmokgethoawed5020POESem1

## Site structure (sitemap)

The sitemap in the Part 1 proposal matches the pages built for the site.

```
Paws Shelter
├── Home            (index.html)
├── About Us        (about.html)
├── Adopt           (pets.html)
│   ├── Pet List
│   └── Pet Details (lightbox)
├── Get Involved    (enquiries.html)
│   ├── Volunteer
│   ├── Donate
│   └── Sponsor
└── Contact         (contacts.html)
    ├── Contact Form
    └── Locations / Map
```

## Part 3 features

### JavaScript interactivity

| Feature | Where | File |
|---|---|---|
| Accordion (FAQ) | About Us | `js/script.js` |
| Modal / lightbox gallery with keyboard support, next/previous and WhatsApp sharing | Adopt | `js/pets.js` |
| Interactive map (Leaflet + OpenStreetMap) with two markers and "fly to" buttons | Contact | `js/map.js` |
| Animations: hero fade-in, scroll reveal, card and accordion transitions (CSS + JavaScript, respects reduced motion) | All pages | `css_assets/stylesheet.css`, `js/script.js` |
| Advanced DOM manipulation: pet cards built from data, back-to-top button created on the fly, enquiry questions swapped by enquiry type | Adopt, all pages, Get Involved | `js/pets.js`, `js/script.js`, `js/forms.js` |
| Dynamic content: pets loaded with `fetch` from `data/pets.json` | Adopt | `js/pets.js` |
| Search, filter (age group) and sort (name / youngest / oldest) | Adopt | `js/pets.js` |

### Forms and validation (`js/forms.js`)

**Get Involved (`enquiries.html`)** - adopt, volunteer, sponsor or donate. The questions change with the enquiry type. Once the input is validated, the form is processed in the background (AJAX `fetch`) and the visitor immediately sees a response with cost and availability. Rates come from `data/rates.json` and pet availability from `data/pets.json`. The `rates.json` values are example figures that can be edited to match the shelter.

**Contact (`contacts.html`)** - name, email, phone, message type and message. Once validated, an email is compiled and shown to the visitor, who can open it in their email app or copy it. The recipient is set by `RECIPIENT` at the top of `js/forms.js`.

**Validation rules:**

- required fields
- name: letters only, 2-60 characters
- email format
- South African phone numbers (`012 345 6789`, `+27 82 123 4567`)
- date: today to 12 months ahead
- donation amount: R20-R100 000
- message length: 10-500 characters, with a live counter
- consent checkbox

Errors appear under each field and the first error receives focus.

**Security in forms:** all visitor text is written with `textContent` (never `innerHTML`); a hidden honeypot field blocks spam bots; `maxlength` is set on inputs.

> **Note:** this is a demonstration site hosted on GitHub Pages, which cannot store form submissions. The enquiry form therefore shows its response on screen only and says so. Deploying on a host with form handling (for example Netlify Forms, already supported by the form markup) would store submissions.

## SEO

**Keyword research** - target phrases used naturally in titles, headings and body text:

| Keyword | Used on |
|---|---|
| animal shelter Pretoria | Home, Contact |
| adopt a dog Pretoria / puppies for adoption | Adopt, Home |
| rescue dogs Pretoria | Adopt |
| volunteer animal shelter | Get Involved, About |
| donate to animal shelter / sponsor a pet | Get Involved |

- **Title tags and meta descriptions** - unique for every page; titles are under 60 and descriptions under 160 characters.
- **Header tags** - exactly one `<h1>` per page, followed by `<h2>` and `<h3>` in order.
- **Image optimisation** - descriptive alt text on every image, lazy loading below the fold, `fetchpriority="high"` on the hero image.
- **URL structure** - short, lowercase, descriptive file names (`pets.html`, `about.html`).
- **Internal linking** - main menu, footer links, in-content links (About to Adopt / Get Involved; Adopt to Get Involved; lightbox to a pre-filled enquiry form).
- **Mobile-friendliness** - responsive layout, viewport tag, touch-sized buttons.
- **Local SEO** - `AnimalShelter` structured data (JSON-LD, schema.org) with the Pretoria address, phone and email; Pretoria and Johannesburg named in titles and text.
- **Off-page SEO plan** - Open Graph / Twitter tags make shared links look good; a WhatsApp share button on every pet; planned outreach to local vet practices, pet shops, community Facebook groups and Pretoria directories for backlinks; registering the shelter on Google Business Profile.
- **`robots.txt` and `sitemap.xml`** - included in the project root.
- **Page speed** - scripts use `defer`, images lazy-load, no frameworks, one small stylesheet, favicon inlined as an SVG (no extra request).
- **Security** - Content Security Policy on every page, `rel="noopener noreferrer"` on external links, honeypot on the enquiry form, HTTPS provided by GitHub Pages. The `_headers` file holds extra security headers for hosts that support it (such as Netlify); GitHub Pages ignores it.

## Project structure

```
index.html  about.html  pets.html  enquiries.html  contacts.html
robots.txt  sitemap.xml  _headers  .nojekyll  README.md
css_assets/stylesheet.css
js/script.js   (all pages)
js/pets.js  js/forms.js  js/map.js
data/pets.json  data/rates.json
_images/images/pets/...
```

## Run locally

`fetch` needs a web server, so do not just double-click the files. Use the VS Code Live Server extension (right-click `index.html`, then Open with Live Server) or run this in the project folder:

```
python -m http.server 8000
```

then open http://localhost:8000.

## Deployment (GitHub Pages)

1. Push the project to the GitHub repository.
2. In the repository open **Settings**, then **Pages**.
3. Under **Build and deployment** choose **Deploy from a branch**, select the `main` branch and the `/ (root)` folder, and click **Save**.
4. After a minute or two the live address appears at the top of the Pages screen.
5. The empty `.nojekyll` file in the project root is required. Without it GitHub Pages ignores folders that start with an underscore, so the `_images` folder (all photos and the logo) would not be published.

## Changelog

### Part 3 - 29 October 2026 

**Feedback from Part 1 (proposal)**

- Sitemaps in both Part 1 proposals (Paws Animal Shelter and Sweet Crumbs Artisan Bakery) redrawn as clear diagrams. Every box is now labelled, and child pages sit under their parent page (for example Contact Form and Locations / Map under Contact; Pet List and Pet Details under Adopt).
- The Paws sitemap now follows the order of the live site menu: Home, About Us, Adopt, Get Involved, Contact.
- The built site's structure is documented in the "Site structure (sitemap)" section above.

### Part 3 - 29 October 2026

**Feedback from Part 2**

- **HTML comments** (scored 2/5): replaced vague comments with descriptive ones on every page, explaining the purpose of each section, form, script and SEO tag.
- **Broken markup fixed:** `heref` changed to `href` (About page Donate button); `ref="stylesheet"` changed to `rel="stylesheet"` (Get Involved); unclosed `<link>` tag (Contact); `<lablel>` changed to `<label>`; `tpye` changed to `type`; `pet-grind` changed to `pet-grid` with unclosed `<section>` / `<div>` elements repaired (Adopt); the "View All Pets" link corrected from `services.html` to `pets.html`.
- **Content fixes:** spelling and grammar corrected throughout; Lucky's heading corrected; "All right reserved" changed to "All rights reserved"; consistent tagline and menu wording.
- **Logo path:** one consistent logo path on all pages.
- **CSS bugs fixed:** missing comma in the hero gradient; `feature-card` class mismatch; added the missing styles for inner pages and forms.
- **Accessibility:** white-on-blue buttons darkened to pass contrast; visible focus outlines; skip link; `aria-current` on the active menu item.
- **Heading structure:** one `<h1>` per page (the logo text is no longer a heading).

**New in Part 3**

- Added `js/script.js`, `js/pets.js`, `js/forms.js` and `js/map.js`.
- Added the FAQ accordion, lightbox/modal gallery, Leaflet map, animations and back-to-top button.
- Added pet search, filter and sort, with pets loaded from `data/pets.json`.
- Rebuilt both forms with JavaScript validation, AJAX processing, a cost/availability response (enquiry) and a compiled email (contact).
- Added SEO: meta tags, Open Graph, canonical links, JSON-LD local business data, `robots.txt` and `sitemap.xml`.
- Added security: Content Security Policy, `_headers`, honeypot field, safe external links.
- Added `data/pets.json` and `data/rates.json` (the rates are example values).
- Redesigned the "Rescue. Love. Rehome." band on the home page so the puppy image blends into the background, with icon badges for the four feature items.
- Fixed the project folder structure so scripts, data and images sit in the correct folders.

**Deployment**

- Deployed the website on GitHub Pages from the `main` branch.
- Added an empty `.nojekyll` file so the `_images` folder is published and all images display.
- Updated the site address in the canonical links, Open Graph tags, `sitemap.xml` and `robots.txt` to the GitHub Pages address.
- Reworded the note shown after submitting the enquiry form so it describes the demonstration site accurately.
- Fixed the text colour of the "Open in email app" button on the Contact page.

### Part 2

Multi-page site with a shared header, navigation and footer; responsive stylesheet; forms; GitHub repository with descriptive commits.

### Part 1

Website proposal, wireframes and project plan.

## References

- GitHub (n.d.) *GitHub Pages documentation*. Available at: https://docs.github.com/en/pages (Accessed: 1 November 2026).
- Google (n.d.) *SEO Starter Guide*. Available at: https://developers.google.com/search/docs/fundamentals/seo-starter-guide (Accessed: 1 November 2026).
- Leaflet (n.d.) *Leaflet: an open-source JavaScript library for interactive maps*. Available at: https://leafletjs.com/ (Accessed: 1 November 2026).
- Mozilla (n.d.) *MDN Web Docs*. Available at: https://developer.mozilla.org/ (Accessed: 1 November 2026).
- Netlify (n.d.) *Forms setup*. Available at: https://docs.netlify.com/forms/setup/ (Accessed: 1 November 2026).
- OpenStreetMap contributors (n.d.) *OpenStreetMap*. Available at: https://www.openstreetmap.org/copyright (Accessed: 1 November 2026).
- Schema.org (n.d.) *AnimalShelter*. Available at: https://schema.org/AnimalShelter (Accessed: 1 November 2026).
- W3C (n.d.) *Markup Validation Service*. Available at: https://validator.w3.org/ (Accessed: 1 November 2026).
- WebAIM (n.d.) *Contrast Checker*. Available at: https://webaim.org/resources/contrastchecker/ (Accessed: 1 November 2026).

