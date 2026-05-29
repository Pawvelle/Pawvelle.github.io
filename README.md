# Pawvelle

A quiet personal site for code, AI, and learning.

A calm, single-page index that keeps small projects, notes, and experiments
in one place — built with restraint, space, and thin lines instead of cards,
shadows, and icons.

## Structure

The whole site lives in one page, organized with anchor sections:

- **Header** — wordmark + light anchor navigation
- **Intro** — a short, left-aligned introduction
- **Projects** — a minimal list
- **Notes** — a minimal list
- **About** — one quiet paragraph
- **Footer** — copyright + links

## Files

Actively maintained:

- `index.html` — all page content
- `styles.css` — all styling
- `README.md` — this file

Legacy (kept for reference, not used by the site):

- `legacy/profile.html`
- `legacy/projects.html`
- `legacy/log.html`
- `legacy/interests.html`
- `legacy/i18n.js`

## Tech

- Plain HTML and CSS, no build step, no framework
- One tiny inline script at the bottom of `index.html` for the EN / 中文 toggle
- Inter (via Google Fonts) with a system sans-serif fallback stack

## Language toggle

- Text strings are marked with `data-i18n` attributes
- The dictionary lives inline in `index.html` (`I18N.en` / `I18N.zh`)
- Choice is stored in `localStorage`; first visit falls back to the browser
  language, otherwise English
- Toggling also updates `document.title` context, the meta description, and
  the `<html lang>` attribute

## Local preview

```bash
python3 -m http.server
```

Then open http://localhost:8000.
