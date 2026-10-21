# DAISY Post Studio

A static web app that makes social-media posters for **DAISY Lab** (Data and Intelligent Systems Lab, PTIT, https://datalab.ptit.edu.vn): accepted papers, new members, seminars/events, recruitment and awards. People fill in a form, upload photos, see a live preview and export PNGs sized for Facebook. No backend. Everything (UI and posters) is in English, except the **Facebook caption** under the preview: Vietnamese block, `—`, English block, hashtags (`CAPTION.<type>` / `caption()` in `templates.js`; a hand edit is stored in `post.caption`, ↺ drops it).

## Run / deploy
- Locally: `python3 -m http.server 8000` → http://localhost:8000. Do not open via `file://`: html-to-image must be able to fetch images and fonts.
- **Vercel (via GitHub)**: static site, no `vercel.json` needed. `.vercelignore` excludes `.claude/`, `.taste-skill/` and the original logo.
  - Push the repo to GitHub → vercel.com → Add New → Project → Import the repo.
  - Framework Preset: **Other**, empty Build Command, Output Directory `.`.
  - Every push to the main branch redeploys. The URL is public by default; user data stays in each person's browser.
- Any other static host works too (all paths are relative).

## Files
| File | Role |
|---|---|
| `index.html` | Editor: form generated from `FORMS`, post list, member library, preview, export, IndexedDB autosave, Save/Open `.json` |
| `templates.js` | Renderer: `RATIOS`, `T` (labels), `GLYPHS`/`topic()`, `TPL.<type>`, `shell()`, `fit()`, `renderPost(post, ratioKey)` |
| `templates.css` | Poster CSS (what is exported) |
| `presets.js` | `DAISY_PRESET.members` (shared member library) and `examples` (sample posts on first visit) |
| `assets/logo/daisy.svg` | Lab logo: viewBox cropped to the artwork, white background rect + embedded white 2000² image + metadata removed, so it is transparent. Missing → SVG wordmark fallback and a warning in the UI |
| `assets/logo/daisy.original.svg` | Untouched original logo (not deployed) |
| `assets/logo/ptit.png` | PTIT emblem, from ptit.edu.vn |
| `assets/members/` | Shared member photos referenced from `presets.js` |

## Data
- Stored per browser in IndexedDB (`daisy-studio` / key `state` = `{posts, library, cur, ratio}`).
- Sharing: **Save file** downloads `daisy-studio-YYYY-MM-DD.json` (`{app, v:1, posts, library}`, photos embedded as dataURLs); **Open file** loads one (posts replaced, library merged).
- Uploaded photos are square-cropped (30% from the top to keep faces), resized to 600px, JPEG 0.85.
- **Member library** is keyed by name: typing a known name fills in role, photo and interest. Admins add shared members in `presets.js` (key = full name, `photo: "assets/members/x.jpg"`) and redeploy.
- People are stored inline as `{ name, role, photo?, interest? }`; empty rows are dropped by `clean()`.

## Post schema
| type | Fields |
|---|---|
| `paper` | `venue {short, year, full, note}`, `split?`, `papers: [{ title, venue?, authors[], advisors[] }]` |
| `welcome` | `title?` (empty → written from the head count), `subtitle?`, `term?`, `members[]` (with `interest`) |
| `event` | `tag`, `format?`, `title`, `desc?`, `speakers[]`, `date: YYYY-MM-DD`, `time`, `place` |
| `recruit` | `headline`, `term?`, `intro?`, `areas[]`, `requirements[]`, `contact`, `deadline` |
| `award` | `award`, `event?`, `project?`, `members[]`, `advisors[]` |
| `photo` | `photos[]: { src, x?, y?, z? }` (src = JPEG dataURL, long edge ≤ 2000px; x/y focal % default 50/40, z zoom 1–4; legacy bare strings accepted, upgraded by `shotAt()`). Drag on the preview moves, wheel / form slider zooms. `what? place? date?` feed the caption only. Photo frame: header logos + photos + footer, no text; 1–4 per image (1 full · 2 stacked · 3 = 1 big + 2 · 4 = 2×2), more → album via `chunk()` |

Old posts may still carry `lang` or `*word*` markup; both are ignored (asterisks are stripped).

## Ratios (Facebook)
| Key | Layout | Export (×2) | Use |
|---|---|---|---|
| `4:5` | 1080×1350 | 2160×2700 | Default; portrait takes the most feed space |
| `1:1` | 1080×1080 | 2160×2160 | Square, albums |
| `1.91:1` | 1200×630 | 2400×1260 | Widest frame Facebook shows uncropped |
| `16:9` | 1200×675 | 2400×1350 | Landscape, slides/screens |
| `3:2` | 1200×800 | 2400×1600 | Landscape, taller |

## Design (v5)
Portrait, top to bottom: **header** (DAISY logo left, PTIT right) · **pills** (1–2 bold uppercase labels such as `PAPER ACCEPTED`, `ORAL`) · **big headline** · **cards** (radius 2.8em, flat red / ink / white) · **footer** (url + lab name).
- People are always clearly visible: photo + name ≥ 30px. Paper/award with ≤ 2 people: red venue card + dark people card side by side; ≥ 3 people: full-width red card + a row of white person cards (`placePeople()`).
- Multi-paper posts: up to 4 papers in one image (`post.split` → album pages of 3 / 2), each paper a white card with title and photo chips.
- Landscape (`.land`, W/H > 1.2): `.cv` becomes a 2-column grid; the template's `side` (people / paper list / member grid / speaker / lists) is the right column `.pside`, everything else stays on the left.
- **People photo size follows the space**: avatars in the dark people card and in paper chips have no fixed size per head count; they flex into the room the card has (`aspect-ratio:1`, capped by the column width via `cqw`), so fewer people → bigger photos. Do not size them from `cqh` arithmetic: `fit()` can't fix an overflow that doesn't shrink with `--k`.
- **Photo frame** (`photo`, `pg.bleed` → `bleedShell()`): photos fill the poster inside a thin .6em paper border (same gap between photos, radius 1.2em); one bottom bar with a concave SVG top edge holds the logos (left) and lab name over url (+ album page) on the right. No header/footer.
- **Research glyph**: one object per field, not the logo icons: `quantum` Bloch sphere, `bio` double-helix ribbons, `health` capsule + tablet, `signal` waveform bars, `security` shield + keyhole, `system` chip, `network` globe + links, `data` database stack, `ai` layered neural net. One language: flat fills in opaque tone steps per card (`--g0` ground cut, `--g1` shade, `--g2` lit), 11-unit bands / 5-unit detail bands, three levels of detail, no outlines or gradients. Helpers are scoped inside the `GLYPHS` IIFE (index.html has its own globals such as `P`). `topic()` scores keyword hits from `TOPICS` (field topics count double, ties by list order, default `ai`); edit keywords there, then run `node topic.check.js`. Cropped in a card corner behind text: the venue/mark card (all titles) and each multi-paper card (its own title).
- No dot grid, decorative flowers, mono type, 01/02 numbering, shadows or gradients. Colours: `--paper #F6F3EE`, `--red #D30015`, `--ink #1A0B0D`, white cards.
- **Units**: `1em = 10px × --z`; inside `.bd`/`.pside` multiplied by `--k`, which `fit()` lowers until nothing overflows. Use em everywhere; photo sizes via `--s` / `--ph`. Bottom-aligned card content uses `.card.end` (first child gets `margin-top:auto`) so overflow stays measurable — never `justify-content:flex-end`.
- Do not name poster classes after UI classes in `index.html` (`.side` clashed once; the poster column is `.pside`).

## Adding a template
1. `templates.js`: `TPL.<type>(post, ctx)` returns `[{ v, html, side }]` (one per slide). `v` = layout class, `side` = right column in landscape (render it inline in `html` when `!ctx.land`).
2. `templates.css`: style with em, reuse `.pills .h1 .sub .card .crew .ppl .pcard .person .av`.
3. `index.html`: add to `TYPES`, `FORMS` (field kinds `text | textarea | select | date | check | lines | list | people | photos`) and `BLANK`.
4. `templates.js`: add `CAPTION.<type>(post)` returning `{ vi, en, tags? }` (build with `para()`).
5. Check all 5 ratios; a slide whose `--k` hits 0.5 is overflowing.
