---
name: add-character
description: Adds a disney character to the site's character data, including their thematic colors and representative image.
---

When asked to add a character:

1. Look at the `app/data/characters.ts` file and note the current schema for characters and their outfits.
2. Create a folder in `public/characters/[character]` where the image will go.
3. Give the user the Disney Fandom gallery page for them to pick an appropriate image manually. Example URL for Tinker Bell: `https://disney.fandom.com/wiki/Tinker_Bell/Gallery`
4. Wait for the user to put an image into the folder.
5. If the image is not already a webp file, convert it using `magick`.
6. Identify that character's outfit colors. Use `node scripts/hex-to-oklch.js "#RRGGBB" ...` to convert sampled hex values to oklch, then add the character to the file.
