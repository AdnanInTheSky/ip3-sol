# IP3 Solutions — static website

Static one-page site. **Tailwind CSS v4** + **Alpine.js** from CDN; every piece of content comes from JSON in `/data`.

## Run it
Browsers block `fetch()` on `file://`, so serve the folder:
- Windows: double-click `start.bat`  ·  Mac/Linux: `./start.sh`  ·  or `python3 -m http.server 8080`
- Open http://localhost:8080
Deploy anywhere static (Netlify, Vercel, GitHub Pages, cPanel) — just upload the folder.

## Edit content (no HTML needed)
| File | Controls |
|---|---|
| `data/site.json` | brand, nav, hero, section headings, contact details, socials, footer, form options |
| `data/services.json` | **What we offer** cards |
| `data/projects.json` | **Previous work** (categories, projects, modal details, CTA tile) |
| `data/stats.json` | animated counters |
| `data/process.json` | process steps |
| `data/comparison.json` | "Why IP3" table |
| `data/engagement.json` | engagement models |
| `data/testimonials.json`, `faq.json`, `tech.json` | testimonials, FAQ, tech marquee |

Icons are referenced by name (`"icon": "rocket"`); add more in `assets/js/icons.js`.
Project images: put files in `assets/img/projects/` and set `"image"` in `projects.json`.

## Structure
```
index.html            layout + Alpine templates
assets/css/style.css  custom CSS (animations, buttons, form)
assets/js/app.js      Alpine app: loads JSON, filters, modal, counters, form
assets/js/icons.js    inline icon set
assets/img/           logo, favicon, project thumbnails
data/*.json           all content
```

## Placeholders to replace
All projects, client names, stats, testimonials, email, phone and social links are **sample content**. Replace with real ones before launch.
The contact form opens the visitor's email app (`mailto:`); swap `submitForm()` in `app.js` for Formspree/Netlify Forms if you want server-side delivery.
