# Accounts Plan — Disney Bounding

## Context

Community outfit uploads are currently anonymous. Users can submit photos but have no ownership of them — only admins can delete records. The goal is to add a lightweight account system (email OTP, no passwords) so that:

1. Upload requires an account
2. Users can delete their own uploaded images
3. Users can log out
4. Users can edit basic profile info (display name, profile picture)

The design prioritizes minimal friction: login happens in a modal (no page navigation), and a thin site-wide header is added to expose the account button everywhere.

---

## Decisions

- **OTP delivery**: Email via PocketBase's built-in OTP, caught locally by Mailpit
- **Login UI**: Modal (no separate `/login` page)
- **Header**: Minimal site-wide header added to root layout
- **Legacy records**: Orphaned (pre-accounts) records stay visible; only admin can delete them
- **`CommunityOutfitGrid`**: Stays a server component; receives `currentUserId` as prop; only `DeleteOutfitButton` is a client leaf
- **PocketBase enforces ownership**: `deleteRule: "@request.auth.id != '' && user = @request.auth.id"` — API route passes the authenticated PocketBase client; the rule does the real guard

---

## Step 1 — PocketBase: Enable OTP, Add User Relation

**New files:**
- `pocketbase/migrations/003_enable_otp_auth.js` — Enable OTP on the built-in `users` auth collection; disable password auth
- `pocketbase/migrations/004_add_user_to_community_outfits.js` — Add optional `user` relation field to `community_outfits`; update `createRule` and `deleteRule`

**Migration 003** modifies the `users` collection (type: `auth`). The PocketBase JS migration API for auth collections uses `collection.authRule`, `collection.otp`, and `collection.passwordAuth` properties. Verify exact field names against PocketBase v0.24 docs before writing — the admin UI JSON export is a reliable reference.

**Migration 004** changes:
- Add `RelationField` named `user` pointing at `users`, `required: false`, `maxSelect: 1`
- `createRule`: `"@request.auth.id != ''"`  ← authenticated users only
- `deleteRule`: `"@request.auth.id != '' && user = @request.auth.id"` ← owner only

**Note:** Tightening `createRule` will break existing tests (they submit without auth). This step and Step 5b (auth in POST route) should be done together so tests are updated at the same time.

**Verification:** Restart Docker (`pnpm services:stop && pnpm services:start`), open PocketBase admin UI at `localhost:8090/_/`, confirm the users collection shows OTP enabled and community_outfits shows the new `user` relation field and updated rules.

---

## Step 2 — Local Email: Add Mailpit to Docker Compose

**Modified files:**
- `docker-compose.yml` — Add `mailpit` service
- `pocketbase/migrations/005_configure_smtp.js` — Configure PocketBase SMTP settings to point at Mailpit

**docker-compose addition:**
```yaml
mailpit:
  image: axllent/mailpit:latest
  ports:
    - "8025:8025"   # Web UI for reading captured emails
    - "1025:1025"   # SMTP
```

**Migration 005** uses `app.settings()` to set SMTP host/port. Use env vars so production can override:
```js
const s = app.settings();
s.smtp.enabled = true;
s.smtp.host = process.env.PB_SMTP_HOST || "mailpit";
s.smtp.port = parseInt(process.env.PB_SMTP_PORT || "1025");
s.smtp.senderAddress = process.env.PB_SMTP_SENDER || "noreply@disneybounding.local";
app.save(s);
```

**Verification:** Trigger an OTP request via the PocketBase API or admin UI; the email should appear at `localhost:8025`.

---

## Step 3 — Auth Infrastructure

**Modified files:**
- `lib/pocketbase.ts` — In the client singleton branch, call `clientInstance.authStore.onChange(...)` to mirror auth state into a cookie (`pb_auth`) on every change. This makes the token available to server components.

**New files:**
- `lib/auth.ts` — Server-side helper:
  ```ts
  export async function getServerAuth() {
    const cookieStore = await cookies();   // from "next/headers"
    const pb = getPocketbase();            // fresh server instance
    const raw = cookieStore.get("pb_auth")?.value;
    if (raw) pb.authStore.loadFromCookie(`pb_auth=${raw}`);
    return { pb, user: pb.authStore.isValid ? pb.authStore.record : null };
  }
  ```
- `app/components/AuthProvider/AuthProvider.tsx` — `"use client"` context; hydrates from `getPocketbase().authStore` on mount. Exposes:
  ```ts
  interface AuthContext {
    user: RecordModel | null;
    requestOtp: (email: string) => Promise<{ otpId: string }>;
    confirmOtp: (otpId: string, code: string) => Promise<void>;
    logout: () => void;
  }
  ```
  `logout` calls `pb.authStore.clear()` and clears the cookie.

**Test:** `lib/auth.test.ts` (Node project) — test that `getServerAuth()` returns `{ user: null }` when no cookie; returns a valid user record when given a valid auth cookie (use the admin PocketBase client to create a test user and obtain a token).

---

## Step 4 — Login Modal + Site Header

**New files:**
- `app/components/LoginModal/LoginModal.tsx` — `"use client"`. Two-step flow:
  1. Email input + "Send code" → calls `requestOtp(email)` from `useAuth()`
  2. OTP input + "Verify" → calls `confirmOtp(otpId, code)` from `useAuth()`
  - On success, modal closes (parent controls `isOpen` state)
  - Error states: invalid/expired OTP, rate limit
- `app/components/SiteHeader/SiteHeader.tsx` — `"use client"`. Reads `useAuth()`:
  - Not authenticated: shows "Log in" button that opens `LoginModal`
  - Authenticated: shows user avatar/name + dropdown (link to `/account`, "Log out" button)

**Modified files:**
- `app/layout.tsx` — Wrap body children in `<AuthProvider>`, add `<SiteHeader />` above `{children}`

**Test:** `app/components/LoginModal/LoginModal.test.tsx` (Browser project). Mock `useAuth()` hook. Test: renders email input, transitions to OTP step after mock `requestOtp`, calls `confirmOtp` with correct values, shows error on failure.

---

## Step 5 — Auth-Gate Uploads + Delete API Route

**5a. Modified: `app/api/community-outfits/route.ts` (POST)**

Read the `Cookie` header from the `NextRequest`. Load auth into the PocketBase server instance. Return 401 if not authenticated. Append `user: pb.authStore.record!.id` to the FormData sent to PocketBase.

**5b. New: `app/api/community-outfits/[id]/route.ts` (DELETE)**

```ts
export async function DELETE(request, { params }) {
  const { id } = await params;
  const pb = getPocketbase();
  pb.authStore.loadFromCookie(request.headers.get("cookie") ?? "");
  if (!pb.authStore.isValid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await pb.collection("community_outfits").delete(id);
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}
```

**Tests:**
- Update `app/api/community-outfits/route.test.ts`: add auth to test setup (create + authenticate a test user; include the auth cookie in requests); add test for 401 when unauthenticated
- New `app/api/community-outfits/[id]/route.test.ts`: test 401 (no auth), 204 + record deleted (owner), 403 (authenticated as a different user)

---

## Step 6 — Delete Buttons in the Grid

**Modified files:**
- `app/data/community-outfits.ts` — Add `userId: string | null` to `CommunityOutfit` type and `CommunityOutfitRecord`. In `getCommunityOutfits()`, expand the `user` relation field and map `record.user` → `userId`.
- `app/data/community-outfits.test.ts` — Add test: `userId` is populated correctly; is `null` for orphaned records.
- `app/characters/[slug]/page.tsx` — Call `getServerAuth()` to get `currentUserId`. Pass it as a prop to `CommunityOutfitGrid`.
- `app/components/CommunityOutfitGrid/CommunityOutfitGrid.tsx` — Accept `currentUserId: string | null` prop. Render `<DeleteOutfitButton>` over images where `outfit.userId === currentUserId`.
- `app/components/CommunityOutfitGrid/CommunityOutfitGrid.test.tsx` — Add tests: no delete buttons when `currentUserId` is null; delete button shown for matching `userId`; not shown for non-matching outfits.

**New files:**
- `app/components/DeleteOutfitButton/DeleteOutfitButton.tsx` — `"use client"`. Trash icon button. On click: calls `DELETE /api/community-outfits/[id]`; on 204, calls an `onDeleted` callback (parent removes the card). On error, shows a brief error state.
- `app/components/DeleteOutfitButton/DeleteOutfitButton.test.tsx` (Browser project) — Mock `fetch`. Test: calls correct route on click, invokes `onDeleted` on success, shows error on failure.

---

## Step 7 — Auth Guard on Upload Form

**Modified files:**
- `app/components/UploadOutfitForm/UploadOutfitForm.tsx` — Use `useAuth()`. If `user` is null, render a "Log in to share your outfit" prompt (with a button that opens the login modal) instead of the form. Remove the "name or handle" text field (submitter name now comes from the user's profile `name`); update the POST handler to omit `submitter_name` from FormData (the API sets `user` server-side; the display name on the grid card can pull from the user relation or the now-removed field — decide at implementation time).
- `app/components/UploadOutfitForm/UploadOutfitForm.test.tsx` — Update tests to reflect the removed name field; add test for the "log in" prompt when unauthenticated.

---

## Step 8 — Profile Page

**New files:**
- `app/account/page.tsx` — Server component. Calls `getServerAuth()`; redirects to home if not authenticated. Renders `EditProfileForm`.
- `app/account/EditProfileForm.tsx` — `"use client"`. Fields: display name (text input), profile picture (file input). On submit, calls `pb.collection("users").update(user.id, formData)`. Updates the `AuthProvider` context after success.

**Verification:** Log in, navigate to `/account`, change name and upload a pfp. Confirm changes appear in the site header.

---

## Step Ordering

| # | Step | Ships independently? |
|---|------|---------------------|
| 1 | PocketBase migrations (003 + 004) + Step 5a/5b POST auth update together | Yes — do migrations and POST auth update as one unit |
| 2 | Mailpit in docker-compose + migration 005 (SMTP) | Yes |
| 3 | Auth infrastructure (`lib/pocketbase.ts` cookie sync, `lib/auth.ts`, `AuthProvider`) | Yes |
| 4 | LoginModal + SiteHeader + layout.tsx | Yes |
| 5 | DELETE route + updated POST route tests | Yes |
| 6 | Delete buttons in the grid (`userId` on `CommunityOutfit`, `DeleteOutfitButton`) | Yes |
| 7 | Auth guard on upload form | Yes |
| 8 | Profile page | Yes |

---

## Critical Files

| File | Role |
|------|------|
| `lib/pocketbase.ts` | Add cookie sync to client singleton |
| `lib/auth.ts` | New — server-side auth helper |
| `app/layout.tsx` | Add `AuthProvider` + `SiteHeader` |
| `app/data/community-outfits.ts` | Add `userId` to type + query |
| `app/characters/[slug]/page.tsx` | Pass `currentUserId` to grid |
| `app/components/CommunityOutfitGrid/CommunityOutfitGrid.tsx` | Render delete buttons |
| `app/api/community-outfits/route.ts` | Add auth enforcement |
| `app/api/community-outfits/[id]/route.ts` | New DELETE handler |
| `pocketbase/migrations/003_enable_otp_auth.js` | Enable OTP on users |
| `pocketbase/migrations/004_add_user_to_community_outfits.js` | User relation + rules |
| `pocketbase/migrations/005_configure_smtp.js` | SMTP → Mailpit |
| `docker-compose.yml` | Add Mailpit service |
