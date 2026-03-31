# Account Flow Plan

Redesigns login/registration to bifurcate existing vs. new users, and uses the `verified` boolean to handle dangling unverified accounts.

## Flow Summary

```
Enter email
    │
    ▼
POST /api/auth/check-email
    │
    ├─ verified account exists ──► Send OTP ──► "Hello {username}, enter code" ──► confirm OTP
    │
    └─ new or unverified ──────────────────────► Enter username ──► POST /api/auth/register
                                                                           │
                                                                     Create/update account
                                                                     (verified=false)
                                                                     Send OTP
                                                                           │
                                                                     Enter code ──► confirm OTP
                                                                                   (flip verified=true)
```

---

## Step 1 — New endpoint: `POST /api/auth/check-email`

Replaces the old `/api/auth/request-otp` for the initial email submission.

**Input:** `{ email: string }`

**Logic:**
- Look up the email in PocketBase (admin client).
- If a record exists **and** `verified === true`:
  - Call `requestOTP(email)` to send the code.
  - Return `{ status: "existing", otpId, username }`.
- Otherwise (no record, or record exists but `verified === false`):
  - Return `{ status: "new" }`. Do **not** create anything yet.

**Why not create the account here for new users?** We wait until we have a username (Step 2), so the account is never created without one.

**Tests (integration):**
- Returns 400 for missing/blank email.
- Returns `{ status: "existing", otpId, username }` for a verified account.
- Returns `{ status: "new" }` for an unknown email.
- Returns `{ status: "new" }` for an unverified (dangling) account.

---

## Step 2 — New endpoint: `POST /api/auth/register`

Called only for new/unverified users, after they supply a username.

**Input:** `{ email: string, username: string }`

**Logic:**
- Look up the email (admin client).
- If a `verified=true` account already exists: return `409 Conflict` (they should be logging in, not registering).
- If an unverified account exists (dangling from a previous abandoned registration): update its `name` field to the supplied username.
- If no account exists: create one with `email`, `name = username`, `verified = false`, random password.
- Call `requestOTP(email)` to send the code.
- Return `{ otpId }`.

**Unverified account handling:** We reuse the dangling record rather than creating a duplicate, so the DB stays clean.

**Tests (integration):**
- Returns 400 for missing email or username.
- Creates a new account and returns `otpId` for an unknown email.
- Reuses and updates the dangling unverified account (no duplicate created).
- Returns 409 for an already-verified account.

---

## Step 3 — Modify `POST /api/auth/confirm-otp`

After a successful OTP auth, check whether the account is newly verified.

**Additional logic (after `authWithOTP` succeeds):**
- If `pb.authStore.record.verified === false`:
  - Use the admin client to patch the record: `{ verified: true }`.
  - Update the record in the response to reflect the new state.

Everything else (cookie, token response) stays the same.

**Tests (integration):**
- Existing tests still pass.
- Flips `verified` to `true` after first successful OTP. *(Requires live PocketBase.)*

---

## Step 4 — Update `AuthProvider`

Replace `requestOtp(email)` with two new methods:

```ts
checkEmail(email: string): Promise<{ status: "existing"; otpId: string; username: string } | { status: "new" }>
register(email: string, username: string): Promise<{ otpId: string }>
```

`confirmOtp` stays the same.

---

## Step 5 — Update `LoginModal`

Add a `"username"` step between `"email"` and `"otp"`.

**Step transitions:**
- `"email"` → submit → call `checkEmail`:
  - `status: "existing"` → store `otpId` + `username`, go to `"otp"`.
  - `status: "new"` → go to `"username"`.
- `"username"` → submit → call `register(email, username)`:
  - Store `otpId`, go to `"otp"`.
- `"otp"` → same as today.

**"Hello {username}" greeting:** On the `"otp"` step, if we came from an existing account, show _"Welcome back, {username}! We sent a code to {email}."_ For new accounts (just registered), show the plain _"We sent a code to {email}."_

**Back navigation:**
- From `"username"` → back to `"email"`.
- From `"otp"` → back to `"email"` (clears everything, user re-enters email).

**Tests (unit):**
- Shows username step after email step for a new account response.
- Skips username step and goes straight to OTP for an existing account.
- Shows "Welcome back, {username}" on OTP step for existing users.
- Back from `"username"` returns to `"email"`.
- Back from `"otp"` returns to `"email"`.

---

## Step 6 — Delete `POST /api/auth/request-otp`

This endpoint is fully replaced by `check-email` and `register`. Remove the route and its tests.
