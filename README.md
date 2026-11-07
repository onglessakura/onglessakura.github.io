# onglessakura.com

Jekyll site hosted free on GitHub Pages. Everything below can be done from the GitHub website: no software to install.

## Everyday edits

| I want to… | Edit this |
|---|---|
| Change phone, address, booking link | `_config.yml` → `business:` |
| Change opening hours | `_config.yml` → `business: hours:`. Keep them identical to Google Business Profile |
| Show or hide the top banner (promos, holiday closures) | `_config.yml` → `announcement:` (leave `""` to hide) |
| Edit services, or add prices | `_data/services.yml` (add `price: "45 $"` lines if you want) |
| Change a service icon | `icon:` in `_data/services.yml`. Choices: polish, basin, almond, lashes, lotus, sprig, stones, diamond |
| Edit FAQ and other page text | `_data/i18n.yml` (`fr:` and `en:`) |
| Update review scores (Google 5.0 / Setmore 4.9) | `_config.yml` → `business: ratings:` (refresh every month or two) |
| Change the client quotes | `_data/reviews.yml` (copy word for word, first name + initial) |
| Show the Setmore booking page inside the site again | `_config.yml` → `booking_embed_url:` |

## Add gallery photos
The home page shows the gallery once there are **4 or more photos**. It currently holds 11 photos from @onglessakura on Instagram (in `assets/gallery/ongles/` and `assets/gallery/cils/`), shown in the category order set in `_data/gallery.yml`. Inside a folder, files are sorted by name, so the `01-`, `02-` prefixes control the order.

**Option A: photos you uploaded to Google (owner photos).** Open a photo on Google Maps, right-click → *Copy image address*, delete the `=w…` ending, and paste it under `remote:` in `_data/gallery.yml`.

**Option B: upload files** (best quality and speed):
1. Open `assets/gallery/` on GitHub, then the folder `ongles/`, `cils/`, `pieds/` or `salon/` (create it if needed: *Add file → Upload files*).
2. Upload your photos. **Give the files descriptive names**, e.g. `manucure-gel-rose-nude.jpg`. The file name becomes the image's alt text for Google.
3. Commit. The photo appears on the gallery page and the home page within a minute or two.

Tip: run `python3 tools/optimize_images.py <your folder> assets/gallery/ongles` first. It makes the photos about 10× smaller and removes GPS data.

## Write a blog post
Good topics for the Journal are general ones that build trust: hygiene standards, nail health and aftercare, style inspiration, seasonal colours, occasions (weddings, holidays, events). Aim for 1–2 posts a month.

1. Go to `_posts/` → *Add file → Create new file*.
2. Name it `YYYY-MM-DD-short-title.md`, for example `2026-12-01-ongles-de-noel.md`.
3. Paste this at the top, then write your post below it in plain text or Markdown:

```markdown
---
title: "Idées d'ongles pour les Fêtes"
description: "150–160 caractères qui apparaissent dans Google."
lang: fr          # or en
image: /assets/blog/ongles-noel.jpg   # optional cover photo
---

Votre texte ici. Use ## for sub-headings.
```

## Structure
```
_config.yml          site + business settings
_data/               services, text (FR/EN), gallery captions, reviews
_includes/           page sections (header, footer, home, gallery…)
_layouts/            page templates (default, post)
_posts/              blog articles
assets/              css, js, images, gallery photos
index.html, en/      home pages (FR / EN)
galerie/, en/gallery gallery pages
blog/                blog index
```

## Preview locally (optional)
`bundle install && bundle exec jekyll serve`, then open http://localhost:4000
