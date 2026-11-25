# Portfolio

Personal product design portfolio. Plain HTML and CSS, no build step, hosted on GitHub Pages.

## Pages

- `index.html` — intro and selected work grid
- `work/case-study.html` — case study template (duplicate it for each project)
- `about.html` — bio, experience, skills
- `contact.html` — contact details and form (not connected yet)

## Editing

- Placeholder copy is wrapped in `<span class="ph">…</span>` and highlighted yellow. Replace the text, then remove the `ph-banner` block from each page when you're done.
- Colors and fonts are tokens at the top of `styles.css`.
- Swap the gradient thumbnails for real images: replace `<div class="thumb" …>` with `<img class="thumb" src="images/your-image.jpg" alt="…">`.

## Previewing locally

Open `index.html` in a browser, or run `python3 -m http.server` in this folder and visit http://localhost:8000.

## Publishing

Push to `main`. GitHub Pages serves the site at https://chaxmix.github.io within a minute or two.

## Password-protected case studies

Some case studies are encrypted so only people with the password can read them.

- Drafts live in `private/work/<name>.html` (and their images in `private/images/`). The `private/` folder is in `.gitignore` and must never be committed, since this repo is public.
- `private/locks.json` lists each protected case study as `"locked"` or `"unlocked"`.
- `private/password.txt` holds the password (8+ characters).
- After editing a draft, the password or the switch, run `node tools/lock.mjs` (Node 18+). It writes `work/<name>.html` and updates the lock badge on the home page card. Commit and push the result.
- Visitors who unlock a page stay unlocked until they close the tab.
- Only the page title shows before unlocking, so keep titles vague.
