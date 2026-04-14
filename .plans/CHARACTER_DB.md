# CHARACTER_DB Plan

Move character data from static TypeScript into PocketBase, and allow authenticated users to submit new characters directly from the website.

---

## Motivation

The static `app/data/characters.ts` file requires a developer to add every character. Moving data to the database lets users submit new characters themselves — especially useful for obscure characters that curators might never get to.

---

## Pre-Phase 1: Require Outfit Names and Restructure Slugs

**Status: Complete**

Before the database migration, `outfitName` was made required on all characters (no longer `?`) and slugs were restructured to `character-name/outfit-name` format. This establishes a stable identity key for each character+outfit combination before it becomes a DB record.

**Changes made:**
- All 16 characters without `outfitName` were assigned descriptive names (e.g. "Classic Look", "Teal Outfit", "ZPD Uniform", "Leaf Dress")
- All character slugs updated to `character/outfit` format (e.g. `ariel/mermaid`, `ariel/princess-dress`)
- Route restructured from `app/characters/[slug]/page.tsx` → `app/characters/[character]/[outfit]/page.tsx`
- `outfitName` field on `Character` type changed from `string?` to `string`
- Links in `HomeView` and `CharacterGrid` work without changes since `href={/characters/${slug}}` naturally produces a two-segment URL
- `CommunityOutfitsSection` still receives just the character segment (e.g. `"ariel"`) as `characterSlug`, matching the existing `community_outfits.character_slug` data

---

## Phase 1: Move Characters into PocketBase

### 1.1 New PocketBase Collection: `characters`

Migration file: `pocketbase/migrations/011_create_characters.js`

**Fields:**

| Field | Type | Required | Notes |
|---|---|---|---|
| `slug` | text | ✓ | Unique, URL-safe identifier |
| `name` | text | ✓ | Character name |
| `movie` | text | ✓ | Source film/show |
| `outfit_name` | text | ✓ | Required (e.g. "Princess Dress", "Adventure Outfit") |
| `image` | file | ✓ | Character render (JPG/PNG/WebP, max 5MB) |
| `image_alt` | text | ✓ | Alt text for the image |
| `card_color` | text | ✓ | CSS hex color for card background |
| `colors` | json | ✓ | `Array<{name, oklch: {l, c, h}, usage}>` |
| `status` | select | ✓ | `"pending"` \| `"approved"` |
| `submitted_by` | relation → users | ✗ | Null for curated entries; set for user submissions |

**Access Rules:**
- `listRule`: `status = "approved"` — public can only browse approved characters
- `viewRule`: `status = "approved"`
- `createRule`: `@request.auth.id != ""` — must be logged in to submit
- `updateRule`: `null` — admin only
- `deleteRule`: `null` — admin only

**Index:** Add unique index on `slug` to prevent duplicates.

### 1.2 Seed Existing Characters

Migration file: `pocketbase/migrations/012_seed_characters.js`

- Hard-code all 18 existing characters as records
- Set `status = "approved"` and `submitted_by = null` for all curated entries
- Upload existing images from disk into PocketBase file storage  
  - PocketBase migrations can read from the local filesystem using Node-style `$os.readFile()` or the Go equivalent
  - Alternatively: upload images via admin API in a separate seed script (`scripts/seed-characters.js`) run once after migration
  - **Recommended approach**: Separate `scripts/seed-characters.js` that runs after migration, since file uploads are easier from Node than inside PocketBase migration JS

**Seed script outline (`scripts/seed-characters.js`):**
```js
// Run: node scripts/seed-characters.js
// Requires: NEXT_PUBLIC_POCKETBASE_URL, PB_SUPERUSER_EMAIL, PB_SUPERUSER_PASSWORD in env

const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);
await pb.admins.authWithPassword(email, password);

for (const character of characters) {
  const imageBlob = fs.readFileSync(`public/${character.imageSrc}`);
  const formData = new FormData();
  formData.append("slug", character.slug);
  // ... other fields
  formData.append("image", new Blob([imageBlob], { type: "image/webp" }), filename);
  formData.append("colors", JSON.stringify(character.colors));
  formData.append("status", "approved");
  await pb.collection("characters").create(formData);
}
```

### 1.3 Update Data Access Layer

**File: `app/data/characters.ts`**

Replace the static array and sync functions with async PocketBase queries:

```ts
// Before (sync, static)
export function getAllCharacters(): Character[] { ... }
export function getCharacterBySlug(slug: string): Character | undefined { ... }

// After (async, DB-backed)
export async function getAllCharacters(): Promise<Character[]> { ... }
export async function getCharacterBySlug(slug: string): Promise<Character | undefined> { ... }
```

- Map PocketBase record fields (snake_case) to `Character` type (camelCase)
- Compute `imageSrc` URL from PocketBase file ID:  
  `pb.files.getURL(record, record.image)` → full HTTPS URL
- `colors` field is already JSON so it maps directly to `OutfitColor[]`
- Filter: always query `status = "approved"` in PocketBase filter string

**Helper to map a PB record → `Character`:**
```ts
function recordToCharacter(record: RecordModel): Character {
  return {
    slug: record.slug,
    name: record.name,
    movie: record.movie,
    outfitName: record.outfit_name || undefined,
    imageSrc: pb.files.getURL(record, record.image),
    imageAlt: record.image_alt,
    cardColor: record.card_color,
    colors: record.colors as OutfitColor[],
  };
}
```

### 1.4 Update Call Sites

All callers of the now-async data functions need to `await` them:

- **`app/page.tsx`** — already a server component, add `await`
- **`app/characters/[slug]/page.tsx`** — `generateStaticParams` and `getCharacterBySlug` both need `await`
- **`app/characters/[slug]/page.tsx`** — `generateStaticParams` should still work if it queries PocketBase at build time. To support newly approved characters without rebuilds, add `export const revalidate = 3600` (ISR, re-fetches every hour)

### 1.5 Remove Static File

Once Phase 1 is complete and confirmed working, delete the character entries from `app/data/characters.ts` (keep only the types and the PocketBase query functions). The image files in `public/characters/` can be kept as a backup or removed after seeding is verified.

---

## Phase 2: User-Submitted Characters

### 2.1 "Suggest a Character" Entry Point

Add a **"Suggest a Character"** button/card on the home page, visible to logged-in users. Clicking it opens the submission form.

For logged-out users: show a prompt to log in first.

### 2.2 Submission Form

A multi-step modal or dedicated page at `/suggest`:

**Step 1 — Character Info**
- Character name (text, required)
- Movie / show (text, required)
- Outfit name (text, optional) — hint: "Leave blank if this is the character's default or only outfit"

**Step 2 — Color Palette (3 colors)**

Each color has three sub-fields:
- **Color** — hex input `#RRGGBB` with a visual color swatch preview
- **Color name** — short name (e.g. "Teal", "Gold", "Rose")
- **Usage** — one sentence on how to wear it (e.g. "Dress — a teal wrap skirt or maxi dress")

Hex → Oklch conversion runs in the browser using the same math as `scripts/hex-to-oklch.js` (a small client-side utility function, not Node-specific).

**Step 3 — Image**
- File upload (JPG/PNG/WebP, max 5MB)
- Live preview of selected image
- Brief label: "A clear render or artwork of the character in this outfit"

**Step 4 — Review & Submit**
- Summary of all entered data
- Submit button → POST to `/api/characters`

### 2.3 API Route: `POST /api/characters`

**File: `app/api/characters/route.ts`**

- Auth required (`401` if not logged in)
- Validate required fields (name, movie, 3 colors, image)
- Auto-generate `slug` from `name + outfitName` (kebab-case, deduplication via numbering if slug already exists)
- Set `status = "pending"`, `submitted_by = currentUser.id`
- Create record in PocketBase `characters` collection
- Returns `201 { id }` on success

**Slug generation logic:**
```ts
function toSlug(name: string, outfitName?: string): string {
  const base = [name, outfitName].filter(Boolean).join(" ");
  return base.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
// If slug exists, try slug-2, slug-3, etc.
```

### 2.4 Approval Flow

- Submitted characters are `status = "pending"` — **not visible to other users**
- The submitter sees a success message: "Thanks! Your character suggestion will appear after review."
- Admin reviews and approves/rejects via the **PocketBase admin panel** at `/_/` — no custom admin UI needed for MVP
- Once approved, the character appears on the home page within 1 hour (ISR revalidation window)

### 2.5 Community Outfits: Update `character_slug` Linkage

Currently `community_outfits.character_slug` is a free-text field that references the static slug. After Phase 1, slugs come from the `characters` collection. No migration is needed — text slugs still work. Optionally in a future migration, convert `character_slug` to a proper relation field pointing to `characters`.

---

## Implementation Order

~~0. Add outfit names + restructure slugs~~ *(done — see Pre-Phase 1)*

1. `011_create_characters.js` — migration file
2. `scripts/seed-characters.js` — seed existing 18 characters with image upload
3. Run seed, verify all 18 appear in PocketBase admin
4. Update `app/data/characters.ts` — async PB queries
5. Update call sites (`app/page.tsx`, `app/characters/[slug]/page.tsx`)
6. Add `revalidate = 3600` to character detail page
7. Smoke test: home page, character detail, color filter, search
8. Remove static character array from `characters.ts`
9. Build `POST /api/characters` route
10. Build multi-step "Suggest a Character" form
11. Wire up form → API → success message
12. End-to-end test: submit a character, approve in PocketBase admin, verify it appears

---

## Open Questions

- **Slug uniqueness enforcement**: PocketBase doesn't auto-enforce unique text fields without a migration-level index. The API route should check for existing slugs before creating.
  - Add an index to slug. This will both enforce uniqueness and help performance.
- **Image storage for existing characters**: If seed-uploading images to PocketBase fails (e.g. file size/format issues), fallback plan is to keep images in `public/` and store the path string in `image_src` as a text field instead of a PocketBase file field. The data layer handles both via a helper.
- **Color picker UX**: The 3-color submission could reuse the existing `ColorSwatchPicker` for approximate matching hints, but the main input should be a free hex color picker so users can sample precise colors from character art.
  - Yes, a free color picker should be used for these. For now you should use input type="color".
- **Moderation scaling**: PocketBase admin panel works for MVP. If submission volume grows, consider an `/admin/review` page in the app.
  - By default, new character outfits should require a review, as I will need to moderate the existence of soft duplicates.
- **`community_outfits` `outfit_name` field**: Currently hard-coded to `character.name` for single-outfit characters. After Phase 1, this should be `character.outfitName ?? character.name`. No schema change needed, just data access logic.
