# Backend auth changes — how each API should accept requests

Companion to [AUTH_API_HANDLING.md](./AUTH_API_HANDLING.md) (exact fields/headers the frontend sends).

**Legend:** **Exists** · **Needs implement** · **Needs change**

Mount note: app uses `app.use('/api/auth', …)` etc.; public URL may be `/auth` via reverse proxy. Match whatever the frontend `API_URL` already hits.

---

## Global: how backend authenticates API calls

| Mechanism | Detail |
|-----------|--------|
| Token type | **Session cookie**, not JWT |
| Cookie name | `sessionId` |
| Read identity | `req.session.userId` |
| Middleware | existing `isAuthorized` (checks `userId`) |
| CORS | Must allow frontend origin + `credentials: true` |
| Cookie flags | `httpOnly: true`; production `secure: true`, `sameSite: "none"` if cross-site |

**Do not require** `Authorization` header for these APIs.

Optional later: CSRF if `csurf` is enforced on mutating routes — then document the CSRF cookie/header the frontend must send. Today the frontend does **not** send a CSRF header; align backend + frontend together if you enable it.

---

## A. Email OTP — **Needs implement**

### `POST /auth/otp/request`

**Accept:**

```ts
req.headers["content-type"] // application/json
req.body.email: string      // required
// Cookie optional; may create anonymous session
```

**Validate:**

- Normalize email (`trim().toLowerCase()`).
- Reject invalid email format (`400`).
- Rate-limit by IP + email.

**Behavior:**

1. Generate OTP (6 digits), store **hash** + expiry + attempts.
2. Send email (never put OTP in JSON response).
3. Always return same success shape (anti-enumeration).

**Respond `200`:**

```json
{
  "success": true,
  "message": "If that email can receive mail, a code was sent.",
  "data": { "expiresInSeconds": 600 }
}
```

---

### `POST /auth/otp/verify`

**Accept:**

```ts
req.body.email: string  // required
req.body.code: string   // required, 6 digits
// Cookie: sessionId (anonymous or existing)
```

**Validate:**

- Rate-limit attempts; lock after N failures.
- Constant-time compare against hashed OTP; check expiry; single-use.

**Behavior:**

1. Find or create `User` with `email.address` + `email.validated: true`.
2. `req.session.regenerate` (or equivalent) then:
   - `req.session.userId = String(user._id)`
3. Delete OTP record.
4. `Set-Cookie: sessionId=…`

**Respond `200`:**

```json
{
  "success": true,
  "data": {
    "userId": "<mongoId>",
    "email": "user@example.com"
  }
}
```

**Errors:** `400` invalid/expired code (generic message).

After this, **all** `isAuthorized` routes work the same as before SIWE-era wallet login.

---

## B. Session check / logout — **Exists** (keep)

### `GET /auth/auth`

**Accept:** cookie only → `req.session.userId`.

**Respond:** `{ isAuth: true }` or `401`.

No change required once OTP verify sets `userId`.

### `GET /auth/logout`

**Accept:** cookie + `isAuthorized` (current).

**Behavior:** destroy session (clear `userId` and `siwe`).

Frontend now calls this instead of `/auth/siwe/logout` for app logout.

---

## C. Wallet connect — **Needs change**

### `POST /user/wallet/connect`

**Today accepts:**

```ts
req.session.userId          // via isAuthorized
req.body.provider?: string
req.body.address: string    // required
// message/signature ignored
```

**Must accept (new contract):**

```ts
req.session.userId                 // required
req.body.provider: string          // required
req.body.address: string           // required, 0x…
req.body.message: string           // required — full SIWE text
req.body.signature: string         // required — 0x…
```

**Algorithm:**

```
1. isAuthorized (userId)
2. if missing address|message|signature → 400
3. parse SiweMessage(message)
4. ensure session.siweNonce === message.nonce (consume nonce)
5. await message.verify({ signature })
6. addr = message.address.toLowerCase()
7. if addr !== body.address.toLowerCase() → 400
8. if another User has wallet.address === addr → 409
9. load User by session.userId
10. user.wallet = { provider, address: addr, connectedAt: new Date() }
11. save user
12. optional: req.session.siwe = { address: addr, chainId: message.chainId, issuedAt }
   // DO NOT change req.session.userId
13. return user.wallet
```

**Respond `200`:** existing `successRes` with wallet object.

**Breaking note:** After deploy, reject unsigned connect (`message`/`signature` missing). Frontend already sends both.

---

### `POST /user/wallet/disconnect` — **Exists** (minor)

**Accept:** cookie + `userId` only.

**Optional change:** also `delete req.session.siwe`.

---

## D. SIWE login — **Needs change** (safety)

### `POST /auth/siwe/login`

**Accept today:**

```ts
req.body.message: string
req.body.signature: string
req.session.siweNonce
```

**Change when `req.session.userId` is already set (email user):**

| Option | Behavior |
|--------|----------|
| **A (recommended)** | Return `409` `{ code: "USE_WALLET_CONNECT", message: "Use POST /user/wallet/connect to link" }` |
| **B** | Same verification as wallet connect: link to current user, do not create/switch user |

**When no `userId`:** keep current find-or-create-by-wallet behavior (legacy wallet-only accounts), or deprecate entirely.

Never do: email session present → overwrite `userId` with a different wallet user.

---

### `GET /auth/siwe/nonce` · `GET /auth/siwe/auth` · `GET /auth/siwe/logout`

**Exists** — keep for nonce issuance and optional SIWE session checks.  
Primary app gate stays `/auth/auth`.

---

## E. Dating / profile / rewards HTTP APIs — **No auth-shape change**

Examples: `/dating/*`, `/user/getUserProfileInfo`, `/user/editProfile`, photos, likes, matches, messages, AI match, off-chain rewards.

**Accept (unchanged):**

```ts
// Middleware
isAuthorized → !!req.session.userId

// Headers
Cookie: sessionId=…
Content-Type: application/json   // when JSON body

// Body
// feature-specific fields only — NO auth token fields
```

Email OTP users authenticate identically to old password/SIWE users **as long as** `userId` is on the session.

---

## F. Optional Web3 recording APIs — **Needs implement** (only if you persist on-chain actions)

Example shapes the frontend would send later (cookie auth, not Bearer):

### Example: record stake

```http
POST /dating/stake/record
Cookie: sessionId=…
Content-Type: application/json
```

```json
{
  "matchId": "…",
  "txHash": "0x…",
  "chainId": 84532,
  "amount": "10",
  "token": "USDC"
}
```

**Backend accept:**

1. `isAuthorized`
2. Prefer also: user has `wallet.address` (new middleware `isWalletLinked`)
3. Validate body fields; optionally verify tx on-chain
4. Store against `userId` + `matchId`

### Example: activate premium after payment

```http
POST /user/premium/activate
Cookie: sessionId=…
Content-Type: application/json
```

```json
{
  "tier": "gold",
  "txHash": "0x…",
  "chainId": 84532,
  "token": "USDC",
  "amount": "15"
}
```

Same acceptance rules as stake.

**Middleware sketch:**

```ts
function isWalletLinked(req, res, next) {
  // after isAuthorized
  // load user; if !user.wallet?.address → 403 "Link a wallet first"
  // optional: require req.session.siwe.address === user.wallet.address
}
```

Apply **only** to stake/premium/NFT record routes — **not** dating swipe/chat.

---

## G. Field reference — request bodies backend should parse

| Endpoint | Status | Body fields to read |
|----------|--------|---------------------|
| `POST /auth/otp/request` | **Implement** | `email` |
| `POST /auth/otp/verify` | **Implement** | `email`, `code` |
| `GET /auth/auth` | Exists | — (cookie) |
| `GET /auth/logout` | Exists | — (cookie) |
| `GET /auth/siwe/nonce` | Exists | — (cookie) |
| `POST /auth/siwe/login` | **Change** | `message`, `signature` (+ respect existing `userId`) |
| `GET /auth/siwe/auth` | Exists | — (cookie → `session.siwe`) |
| `GET /auth/siwe/logout` | Exists | — (cookie) |
| `POST /user/wallet/connect` | **Change** | `provider`, `address`, `message`, `signature` |
| `POST /user/wallet/disconnect` | Exists | — (cookie) |
| Dating / profile / photos / rewards | Exists | feature fields; auth via cookie only |

---

## H. Session fields backend should maintain

| Field | Set by | Used for |
|-------|--------|----------|
| `session.userId` | OTP verify (and legacy logins) | All app APIs (`isAuthorized`) |
| `session.siweNonce` | `GET /auth/siwe/nonce` | SIWE verify / wallet connect |
| `session.siwe` | Successful SIWE verify or wallet connect | Optional Web3 gate |
| `user.email` | OTP verify | Account identity |
| `user.wallet` | wallet connect | Linked address for on-chain features |

---

## I. Implementation checklist

| # | Work | Priority |
|---|------|----------|
| 1 | `POST /auth/otp/request` + email send + hashed OTP store + rate limit | P0 |
| 2 | `POST /auth/otp/verify` → set `userId`, regenerate session | P0 |
| 3 | `POST /user/wallet/connect` require + verify `message`/`signature` | P0 |
| 4 | `POST /auth/siwe/login` do not swap `userId` if already logged in | P0 |
| 5 | Unique constraint / conflict on `wallet.address` | P1 |
| 6 | Optional `isWalletLinked` for stake/premium record APIs | P2 |
| 7 | Align CSRF with frontend if `csurf` is enforced | P2 |

---

## J. Smoke test sequence (backend)

1. `POST /auth/otp/request` `{ "email": "a@b.com" }` → 200, no code in body.
2. `POST /auth/otp/verify` `{ "email": "a@b.com", "code": "……" }` → 200 + `Set-Cookie` + `userId`.
3. `GET /auth/auth` with cookie → `{ isAuth: true }`.
4. `GET /dating/matches` with cookie → 200 (not 401).
5. `GET /auth/siwe/nonce` with cookie → nonce.
6. Client signs SIWE → `POST /user/wallet/connect` with `provider`, `address`, `message`, `signature` → wallet saved on **same** user.
7. Confirm `session.userId` unchanged; `user.wallet.address` set.
8. `GET /auth/logout` → `GET /auth/auth` fails.
