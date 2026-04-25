# Refactor: Route All Database Mutations Through the API

## Goal

All database writes must go through Next.js API routes, not the PocketBase SDK
called directly from client components. This keeps auth enforcement, validation,
and business logic server-side and reduces the attack surface.

PocketBase collection rules for write operations will be locked to `null`
(admin-only), making the Next.js API layer the sole write path. The API is
responsible for all ownership checks — do not rely on collection rules or
superuser privilege to enforce them.

## Audit Results

The vast majority of the codebase already follows the correct pattern
(`fetch → /api/...`). One client component still calls PocketBase directly.

### Violations Found

#### `app/profile/EditProfileForm.tsx`

Two direct SDK writes inside a `"use client"` component:

| Line | Call | Purpose |
|------|------|---------|
| 59 | `pb.collection("users").update(serverUser.id, formData)` | Upload avatar image |
| 92 | `pb.collection("users").update(serverUser.id, formData)` | Save display name |

Both are followed by `pb.authStore.save(...)` to sync the client auth store with
the returned record — that part is fine and must be preserved.

### Clean (No Changes Needed)

- `app/components/AuthProvider/AuthProvider.tsx` — only touches `pb.authStore`
  (client-side auth state, not a database write). Correctly delegates all
  mutations to `/api/auth/*` routes.
- All files under `app/api/` — server-side, expected.
- All files under `app/data/` — server-side data fetches, expected.

---

## Plan

### Step 1 — Lock down collection rules (migrations)

Set all write rules to `null` on both collections so that no regular user
credential — however obtained — can write directly to PocketBase.

**New migration: `characters` collection**
- `createRule`: `"@request.auth.id != ''"` → `null`
- `updateRule`: already `null` ✓
- `deleteRule`: already `null` ✓

**New migration: `community_outfits` collection**
- `createRule`: `"@request.auth.id != ''"` → `null`
- `updateRule`: already `null` ✓
- `deleteRule`: `"@request.auth.id != '' && user = @request.auth.id"` → `null`

---

### Step 2 — Switch API routes to superuser auth

All three write routes currently load a user token from the request cookie and
pass it through to PocketBase. After Step 1 those calls will be rejected (rules
are `null`). Each route must instead authenticate as the PocketBase superuser
using `PB_SUPERUSER_EMAIL` / `PB_SUPERUSER_PASSWORD` for the actual DB write,
while still reading the user's cookie to identify and authenticate the caller.

**Ownership must be validated in the API before the superuser write — never
assume that using a privileged credential makes a write safe.**

Routes to update:

#### `POST /api/characters`
- Read user identity from cookie; reject 401 if not authenticated.
- Force `status: 'pending'` and `submitted_by: <user id from cookie>` — ignore
  any status value sent by the client.
- Use superuser credentials for the `pb.collection("characters").create()` call.

#### `POST /api/community-outfits`
- Read user identity from cookie; reject 401 if not authenticated.
- Force `user: <user id from cookie>` — do not accept a user field from the
  request body.
- Use superuser credentials for the `pb.collection("community_outfits").create()` call.

#### `DELETE /api/community-outfits/[id]`
- Read user identity from cookie; reject 401 if not authenticated.
- **Fetch the outfit record first** (using superuser) and compare `outfit.user`
  against the requesting user's id. Reject 403 if they do not match. This is the
  ownership check that the collection rule previously handled — it must now live
  explicitly in the route.
- Use superuser credentials for the `pb.collection("community_outfits").delete()` call.

---

### Step 3 — Create `PATCH /api/users/me`

**New file:** `app/api/users/me/route.ts`

Accepts `multipart/form-data` with optional fields:
- `name` (string) — update display name
- `avatar` (File) — upload new avatar image

- Read user identity from cookie; reject 401 if not authenticated.
- Use `/me` (not `/[id]`) — the authenticated user ID always comes from the
  server cookie, never from the request body or URL.
- Use superuser credentials for the `pb.collection("users").update()` call.
- Return `200` with `{ name, avatarUrl }` so the client can update local state
  without a page reload.

Validation:
- `name`, if present: non-empty string, max 100 chars
- `avatar`, if present: JPEG/PNG/WebP, max 5 MB

---

### Step 4 — Refactor `EditProfileForm.tsx`

Replace both `pb.collection("users").update(...)` calls with
`fetch("/api/users/me", { method: "PATCH", body: formData })`.

The response body (`{ name, avatarUrl }`) replaces the need to call
`pb.files.getURL()` after the save, since the API route returns the resolved URL
directly.

`pb.authStore.save(token, record)` must still run after a successful response so
the client auth store stays in sync. Patch the existing `pb.authStore.record`
with the fields returned by the API rather than re-fetching.

---

## Testing Requirements

### Unit tests — API routes

Add a `route.test.ts` alongside each new or changed route, following the
existing pattern in `app/api/community-outfits/route.test.ts`.

#### `app/api/users/me/route.test.ts` (new)
- Returns 401 when no session cookie is present
- Updates display name and returns `{ name }` on valid PATCH
- Updates avatar and returns `{ avatarUrl }` on valid PATCH
- Returns 400 when name is empty or exceeds 100 chars
- Returns 400 when avatar is the wrong file type or exceeds 5 MB

#### `app/api/characters/route.test.ts` (update)
- Returns 401 when unauthenticated
- Creates record with `status: 'pending'` regardless of any status value in the
  request body
- Sets `submitted_by` to the authenticated user's id

#### `app/api/community-outfits/route.test.ts` (update)
- Returns 401 when unauthenticated
- Sets `user` to the authenticated user's id, ignoring any user field in the
  request body

#### `app/api/community-outfits/[id]/route.test.ts` (update)
- Returns 401 when unauthenticated
- Returns 403 when the outfit belongs to a different user
- Returns 204 when the outfit belongs to the requesting user

---

### Security tests — `app/data/security.test.ts`

Add new `describe` blocks verifying that the SDK cannot be used directly with
regular user credentials to perform any write. Follow the existing pattern:
`adminPb` for setup/teardown, `anonPb` for anonymous probing, `attackerPb` for
an authenticated-but-wrong-user probe.

#### `characters` collection
- Anonymous user cannot create a character (expects 403)
- Authenticated regular user cannot create a character (expects 403)
- Authenticated regular user cannot update a character (expects 403)
- Authenticated regular user cannot delete a character (expects 403)

#### `community_outfits` collection
- Anonymous user cannot create a community outfit (expects 403)
- Authenticated regular user cannot create a community outfit (expects 403)
- Authenticated regular user cannot delete an outfit they own via SDK (expects 403)
- Authenticated regular user cannot delete another user's outfit via SDK (expects 403)
- Authenticated regular user cannot update any outfit via SDK (expects 403)

---

## Files Affected

| File | Change |
|------|--------|
| `pocketbase/migrations/012_lock_characters_write_rules.js` | **Create** — set createRule to null |
| `pocketbase/migrations/013_lock_community_outfits_write_rules.js` | **Create** — set create/deleteRule to null |
| `app/api/characters/route.ts` | **Modify** — superuser auth, force status=pending |
| `app/api/characters/route.test.ts` | **Modify** — add ownership/status tests |
| `app/api/community-outfits/route.ts` | **Modify** — superuser auth, force user field |
| `app/api/community-outfits/route.test.ts` | **Modify** — add user-field enforcement test |
| `app/api/community-outfits/[id]/route.ts` | **Modify** — superuser auth, explicit ownership check |
| `app/api/community-outfits/[id]/route.test.ts` | **Modify** — add 403 ownership test |
| `app/api/users/me/route.ts` | **Create** — PATCH handler |
| `app/api/users/me/route.test.ts` | **Create** — unit tests |
| `app/profile/EditProfileForm.tsx` | **Modify** — replace SDK calls with fetch |
| `app/data/security.test.ts` | **Modify** — add SDK-direct write rejection tests |

---

## Out of Scope

- `pb.authStore` reads/writes in `AuthProvider.tsx` — these manage client-side
  session state and are the correct pattern.
- `pb.files.getURL()` calls used purely to build display URLs — read-only
  utility, not a database mutation.
