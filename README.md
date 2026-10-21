# DAISY Post Studio

Static web app that makes Facebook posters for DAISY Lab (Data and Intelligent Systems Lab, PTIT): accepted papers, new members, seminars, recruitment, awards and photo frames.

## Run locally
```bash
python3 -m http.server 8000
```
Open http://localhost:8000 (not via `file://`).

## Deploy on Vercel
Auto-deploy via Vercel Git integration (no CI files needed):
1. Once: vercel.com → Add New → Project → Import this repo. Framework Preset **Other**, empty Build Command, Output Directory `.`.
2. Every push to `main` deploys production; every PR / other branch gets a preview URL.

See `CLAUDE.md` for details.
