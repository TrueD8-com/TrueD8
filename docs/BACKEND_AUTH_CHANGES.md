# Backend auth changes required

Frontend-only work landed on branch `feature/frontend/email-otp-auth`.  
**This document specifies backend work that is still required** for email OTP and safe optional wallets. Do not treat the frontend as fully functional against production until these exist.

Status legend: **Exists** · **Needs change** · **Needs implement**

---

## 1. Email OTP login — **Needs implement**

Frontend calls:

- `POST /auth/otp/request` body: `{ "email": "user@example.com" }`
- `POST /auth/otp/verify` body: `{ "email": "user@example.com", "code": "123456" }`

### Suggested contract

#### `POST /auth/otp/request`

1. Normalize email (trim, lowercase).
2. Rate-limit by IP **and** email (e.g. 1 code / 60s, max N / hour).
3. Generate cryptographically random 6-digit code (or longer).
4. Store hashed code + expiry (e.g. 10 minutes) + attempt counter keyed by email/session.
5. Send email with the code (never return the code in the JSON response).
6. Always return the same success shape whether or not the email is new (anti-enumeration), e.g.:

```json
{ "success": true, "message": "If that email can receive mail, a code was sent.", "data": { "expiresInSeconds": 600 } }
```

7. Optionally create a pending/unverified user, or create user only on verify.

#### `POST /auth/otp/verify`

1. Rate-limit attempts; lock out after N failures.
2. Verify code (constant-time compare against hash), check expiry, single-use.
3. Find or create `User` with `email.address` + `email.validated: true`.
4. Set `req.session.userId = String(user._id)`.
5. Regenerate session id on login (session fixation).
6. Return:

```json
{ "success": true, "data": { "userId": "<id>", "email": "user@example.com" } }
```

### Security requirements

- Hash OTPs at rest; short TTL; single use.
- Generic responses on request; careful errors on verify.
- No OTP in logs / analytics.
- HTTPS + secure, HttpOnly, SameSite cookies (already largely via `sessionId`).

### Related existing pieces (reuse patterns)

- Phone OTP: `/auth/requestForPhoneCode`, `/auth/verifyPhoneCode`
- Session check: `GET /auth/auth` (**Exists** — uses `userId`)
- Full logout: `GET /auth/logout` (**Exists**)
- Email/password `POST /auth/login` (**Exists**, legacy — not used by new UI)

---

## 2. Auth check for email sessions — **Exists** (frontend switched)

| Endpoint | Status | Notes |
|----------|--------|-------|
| `GET /auth/auth` | **Exists** | Returns `{ isAuth: true }` when `req.session.userId` is set. Frontend `AuthGuard` now uses this. |
| `GET /auth/siwe/auth` | **Exists** | SIWE-only. Do not use as primary app gate. |

No backend change required for shell auth if OTP verify sets `userId`.

---

## 3. Secure wallet link while logged in — **Needs change**

### Current

- `POST /user/wallet/connect` (**Exists**): `{ provider, address }` → writes `user.wallet` if `userId` session.  
  **Problem:** No proof of ownership; any logged-in user can claim any address.
- `POST /auth/siwe/login` (**Exists**): Verifies SIWE, then **finds/creates user by wallet** and sets `userId` — can **hijack / swap** identity for an email user who only wanted to link.

### Required

#### Option A (recommended): enhance `POST /user/wallet/connect`

Accept:

```json
{
  "provider": "MetaMask",
  "address": "0x…",
  "message": "<siwe message>",
  "signature": "0x…"
}
```

Backend must:

1. Require `req.session.userId`.
2. Verify SIWE message + signature (reuse nonce from `GET /auth/siwe/nonce` / `session.siweNonce`).
3. Ensure message address matches `address` (checksum/lowercase normalize).
4. Reject if that wallet is already linked to a **different** user.
5. Set `user.wallet = { provider, address, connectedAt }` on the **current** user.
6. Optionally set `session.siwe` for Web3-gated APIs **without** changing `userId`.
7. Do **not** create a second user.

Frontend already sends `message` + `signature` when linking via `linkWalletToSession()`.

#### Option B: new route `POST /auth/siwe/link`

Same verification rules; keep `/wallet/connect` as a thin alias or deprecate unsigned connect.

### Also update `POST /auth/siwe/login` — **Needs change**

If `req.session.userId` already exists:

- Prefer **link** wallet to that user (after verify), **or**
- Return `409` asking the client to use `/wallet/connect` / `/siwe/link`.

Never silently replace `userId` with another account when an email session is active.

---

## 4. Optional: Web3-only API middleware — **Needs implement** (if desired)

If some APIs must require a linked wallet:

```ts
// e.g. isWalletLinked
// 1. isAuthorized (userId)
// 2. user.wallet.address present
// and/or session.siwe.address matches user.wallet.address
```

Apply only to stake/premium/NFT recording endpoints — not dating.

---

## 5. CORS / cookies — **Verify**

Frontend origin must allow credentials. Cookie name is `sessionId` (middleware updated to match). Confirm:

- `cors` with `credentials: true` and explicit frontend origin(s)
- Production: `secure: true`, appropriate `sameSite`

---

## 6. Implementation checklist

| # | Work | Priority |
|---|------|----------|
| 1 | Implement `POST /auth/otp/request` | P0 |
| 2 | Implement `POST /auth/otp/verify` (sets `userId`, session regenerate) | P0 |
| 3 | Email delivery + OTP hash store + rate limits | P0 |
| 4 | Verify SIWE on `POST /user/wallet/connect` (or new `/siwe/link`) | P0 |
| 5 | Prevent SIWE login from swapping email `userId` | P0 |
| 6 | Unique index / conflict handling on `wallet.address` | P1 |
| 7 | Optional `isWalletLinked` middleware for on-chain feature APIs | P2 |
| 8 | Deprecate unsigned wallet connect once proof is required | P2 |

---

## 7. What frontend already does (no backend change for these)

- Main auth UI: `/login` (email OTP)
- Redirect `/` and `/siwe` → `/login`
- `AuthGuard` → `GET /auth/auth`
- Logout → `GET /auth/logout`
- Web3 surfaces wrapped in `WalletRequiredGate` (connect + sign + `/user/wallet/connect`)
- Docs for per-API handling: [AUTH_API_HANDLING.md](./AUTH_API_HANDLING.md)

Until OTP routes ship, `/login` will show send/verify errors from failed `fetch` — expected.
