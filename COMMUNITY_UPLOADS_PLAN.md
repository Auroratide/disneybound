# Plan: Community Outfit Uploads with Pocketbase

## Overview

Allow users to upload images of their Disney bounding outfits for a given character/outfit, showcasing them as inspiration for others. Uses Pocketbase as the backend.

---

## Step 1 — Set up Pocketbase and design the schema

- Download and run Pocketbase locally (binary or Docker)
- Create an admin account
- Create a `community_outfits` collection with these fields:
  - `character_slug` (text, required) — e.g. `"ariel"`
  - `outfit_name` (text, required) — e.g. `"Mermaid"` — ties submission to a specific outfit
  - `image` (file, required, single image, size/type restricted)
  - `submitter_name` (text, optional) — display handle
  - `status` (select: `pending` | `approved` | `rejected`, default `pending`)
- Configure CORS to allow requests from `localhost:3000`
- Document the setup in a `POCKETBASE.md` or similar so the config isn't lost

**Commit:** Pocketbase schema and setup documentation

---

## Step 2 — Install the SDK and wire up the client

- `pnpm add pocketbase`
- Create `lib/pocketbase.ts` — a singleton Pocketbase client
- Add `.env.local` with `NEXT_PUBLIC_POCKETBASE_URL=http://127.0.0.1:8090`
- Add `POCKETBASE_URL` to `.env.example` so others know what's needed

**Commit:** Add Pocketbase client

---

## Step 3 — Define TypeScript types for community outfits

- Create `app/data/community-outfits.ts` with a `CommunityOutfit` type matching the PB schema
- Add a `getCommunityOutfits(characterSlug, outfitName)` async function that fetches only `approved` records

**Commit:** Community outfit data types and fetch function

---

## Step 4 — Display community submissions on the character page (read-only)

- Update `/app/characters/[slug]/page.tsx` to call `getCommunityOutfits` for each outfit
- Add a "Community Outfits" section below each `<Outfit>` card — simple responsive image grid
- Show nothing (or a small placeholder) if no approved submissions exist yet
- This validates the PB read path works end-to-end before touching uploads

**Commit:** Show community outfit submissions on character pages

---

## Step 5 — Create an API route to handle uploads

- Create `app/api/community-outfits/route.ts`
- `POST` endpoint: receives `FormData`, validates fields, forwards the file + metadata to Pocketbase, returns the new record ID
- Keep the record in `pending` status — moderation happens in the PB admin panel

**Commit:** API route for community outfit uploads

---

## Step 6 — Build the upload form component

- Create `app/components/UploadOutfitForm/UploadOutfitForm.tsx` (client component)
- Fields: image picker with preview, optional "Your name or handle" input
- Submit to the API route from Step 5
- Show a success message after upload ("Thanks! Your outfit will appear after review.")
- Basic validation: image required, file type/size limits

**Commit:** Upload outfit form component

---

## Step 7 — Add the upload form to the character page

- Add a "Share your bounding outfit" button/section below each outfit's community grid
- Wire it to `UploadOutfitForm`, passing `characterSlug` and `outfitName` as props
- The form can be hidden behind a toggle/disclosure so it doesn't clutter the page by default

**Commit:** Add upload form to character outfit pages

---

## Step 8 — Production setup (when ready to deploy)

- Decide on Pocketbase hosting (self-hosted VPS, Pocketbase Cloud, Railway, Fly.io, etc.)
- Set production environment variable for `POCKETBASE_URL`
- Configure `next.config.ts` to allow the PB domain for image optimization (so submitted images render via `next/image`)
- Review and lock down PB collection rules (public can create, only admin can approve/delete)

**Commit:** Production Pocketbase config and image domain allowlist

---

## Optional follow-ups (later phases)

- **Admin moderation UI** — a simple `/admin` page in the Next.js app for approving/rejecting without using the PB admin panel directly
- **Soft auth** — email-based magic links so submitters can manage their own posts
- **Pagination** — if a character accumulates many community submissions
