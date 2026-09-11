# CHIKKU Birthday Website V2 — Scrapbook Redesign

This version removes all visible:
- “Tap Anywhere”
- “Tap to continue”

The opening still quietly reveals the gift when the empty page is clicked/tapped, but there is no label competing with the birthday copy.

## Design direction
- warm paper / graph-paper backgrounds
- dusty pink, sage, peach, muted teal, cream
- Playfair Display + DM Sans + Caveat
- tulip and kitten stickers
- handmade scrapbook positioning
- Polaroid scratch-card photo reveals
- subtle 3D only on major moments
- dreamy Memory Sky ending

## How to preview
From this folder:
`python -m http.server 8000`

Then open:
`http://localhost:8000`

## Photo replacement
Current photo placeholders are:
- assets/images/photo-1.svg
- assets/images/photo-2.svg
- assets/images/photo-3.svg

You can replace them later and update the three image paths in `index.html`.

## Password
The playful static gate currently uses `Bhuddu`.
This is client-side only and should not be treated as real security.

## Music
The named song is embedded from YouTube instead of bundling copyrighted audio.

## Important
All personal text from the birthday specification was intentionally preserved.
