# Auth API contract — what frontend sends

**Auth model:** HttpOnly cookie session. There is **no** `Authorization: Bearer …` header for dating/app APIs.

| Item | Value |
|------|--------|
| Cookie name | `sessionId` |
| How it is sent | Browser attaches it automatically when `credentials: "include"` |
| What backend reads | `req.session.userId` (app identity) · optionally `req.session.siwe` (wallet proof) |
| Base URL | `NEXT_PUBLIC_API_BASE_URL` (e.g. `https://api.trued8.com`) |
| Path prefix | Frontend calls `/auth/*`, `/user/*`, `/dating/*` (gateway may map to `/api/...`) |

---

## Shared request headers (every call)

### Unauthenticated (OTP request before login)

```http
Content-Type: application/json
Accept: application/json
```

```js
fetch(url, { method, headers: { "Content-Type": "application/json" }, credentials: "include", body })
```

`credentials: "include"` is still required so the server can create/bind a session before verify.

### Authenticated (after OTP verify)

```http
Content-Type: application/json   # omit for multipart photo upload
Accept: application/json
Cookie: sessionId=<opaque>       # set automatically by browser; do NOT set manually in JS
```

```js
fetch(url, {
  method,
  headers: { "Content-Type": "application/json" }, // when JSON body
  credentials: "include",                          // REQUIRED
  body,                                            // when applicable
})
```

### What frontend must NOT send

| Do not send | Why |
|-------------|-----|
| `Authorization: Bearer …` | Not used |
| OTP in headers / query / localStorage | Security |
| Wallet private keys | N/A |
| Manual `Cookie` header from JS | Browser handles HttpOnly cookie |

### Tokens that exist

| Name | Where stored | Sent how | Purpose |
|------|--------------|----------|---------|
| **Session** (`sessionId`) | HttpOnly cookie | Auto with `credentials: "include"` | App auth for almost all APIs |
| **Email OTP** | Never stored client-side | JSON body field `code` once | Login only |
| **SIWE nonce** | Server session (`siweNonce`) | Client gets via API, embeds in SIWE message | Replay protection for wallet proof |
| **SIWE signature** | Ephemeral in memory | JSON body `signature` (+ `message`) | Prove wallet ownership on link |
| **localStorage `user_id` / `auth_method` / `wallet_address`** | Browser | **Not** sent to API | UI hints only |

---

## 1. Auth — email OTP (primary login)

### 1.1 `POST /auth/otp/request` — **NEW (backend must implement)**

**When:** Login page, step 1.

**Frontend sends:**

| Part | Value |
|------|--------|
| Headers | `Content-Type: application/json` |
| Credentials | `include` |
| Cookie | May be empty or anonymous session |
| Body | see below |

```json
{
  "email": "user@example.com"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|--------|
| `email` | string | yes | Frontend normalizes trim + lowercase before send |

**Expected success (200):**

```json
{
  "success": true,
  "message": "If that email can receive mail, a code was sent.",
  "data": {
    "expiresInSeconds": 600
  }
}
```

Do **not** return the OTP. Same response whether user exists or not.

**Backend must:** rate-limit, hash+store OTP, email it, create/bind session cookie if needed.

---

### 1.2 `POST /auth/otp/verify` — **NEW (backend must implement)**

**When:** Login page, step 2.

**Frontend sends:**

```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|--------|
| `email` | string | yes | Same normalized email as request |
| `code` | string | yes | Exactly 6 digits; frontend strips non-digits |

**Headers / credentials:** same as 1.1 (`Content-Type` + `credentials: "include"`).

**Expected success (200):**

```json
{
  "success": true,
  "data": {
    "userId": "665f…",
    "email": "user@example.com"
  }
}
```

**Set-Cookie:** refresh `sessionId` with `req.session.userId` set (prefer session regenerate).

**Backend must:** validate OTP, find/create user, `req.session.userId = String(user._id)`, invalidate OTP.

---

### 1.3 `GET /auth/auth` — **EXISTS (no change if OTP sets userId)**

**When:** `AuthGuard`, login redirect check.

**Frontend sends:**

| Part | Value |
|------|--------|
| Method | `GET` |
| Body | none |
| Credentials | `include` |
| Headers | none special (cookie only) |

**Expected when logged in:**

```json
{ "success": true, "data": { "isAuth": true } }
```

**Expected when not:** `401` / error → frontend treats as logged out.

**Backend accepts:** cookie → `req.session.userId` present.

---

### 1.4 `GET /auth/logout` — **EXISTS**

**When:** Dashboard logout.

**Frontend sends:** `GET`, `credentials: "include"`, no body.

**Backend:** destroy session / clear `userId` (and ideally `siwe`).

---

## 2. Auth — SIWE (wallet ownership / legacy only)

Not used for primary login. Used when linking a wallet or legacy wallet login.

### 2.1 `GET /auth/siwe/nonce` — **EXISTS**

**Frontend sends:** `GET`, `credentials: "include"`.

**Response:** `{ "data": { "nonce": "…" } }`  
Backend stores nonce on `req.session.siweNonce`.

---

### 2.2 `POST /auth/siwe/login` — **EXISTS → NEEDS CHANGE**

**Frontend should NOT call this** for email-primary users (use wallet connect instead).

If called, body today:

```json
{
  "message": "<SIWE message string>",
  "signature": "0x…"
}
```

**Backend change:** if `req.session.userId` already set → link wallet to that user or return `409`; **do not** replace `userId` with a different wallet user.

---

### 2.3 `GET /auth/siwe/auth` — **EXISTS (Web3-only check)**

Cookie only. Returns auth only if `req.session.siwe.address` exists.  
**Not** used by `AuthGuard`.

---

### 2.4 `GET /auth/siwe/logout` — **EXISTS**

Clears SIWE session fields. Prefer full `/auth/logout` for app logout.

---

## 3. Wallet link (after email login)

### 3.1 `POST /user/wallet/connect` — **EXISTS → NEEDS CHANGE**

**When:** `WalletRequiredGate` after RainbowKit connect + user signs SIWE message.

**Frontend sends:**

| Part | Value |
|------|--------|
| Headers | `Content-Type: application/json` |
| Credentials | `include` |
| Cookie | `sessionId` with valid `userId` (**required**) |
| Body | |

```json
{
  "provider": "MetaMask",
  "address": "0xabc…",
  "message": "trued8.com wants you to sign in with your Ethereum account:\n0xabc…\n\nLink this wallet to your TrueD8 account\n\nURI: https://…\nVersion: 1\nChain ID: 1\nNonce: …\nIssued At: …\nExpiration Time: …",
  "signature": "0x…"
}
```

| Field | Type | Required (frontend) | Required after backend change |
|-------|------|---------------------|-------------------------------|
| `provider` | string | yes | yes |
| `address` | string | yes | yes (must match SIWE address) |
| `message` | string | yes (always sent by FE now) | **yes** — verify SIWE |
| `signature` | string | yes (always sent by FE now) | **yes** — verify SIWE |

**Backend must accept / do:**

1. `isAuthorized` → require `req.session.userId`.
2. Require `address`, `message`, `signature`.
3. Verify SIWE (`message` + `signature`) and nonce (`session.siweNonce`).
4. Normalize address lowercase; ensure equals SIWE message address.
5. Reject if wallet linked to another user (`409`).
6. Update **current** user: `user.wallet = { provider, address, connectedAt }`.
7. Optionally set `req.session.siwe = { address, chainId, issuedAt }` **without** changing `userId`.
8. Return linked wallet:

```json
{
  "success": true,
  "message": "wallet connected",
  "data": {
    "provider": "MetaMask",
    "address": "0xabc…",
    "connectedAt": "2026-…"
  }
}
```

---

### 3.2 `POST /user/wallet/disconnect` — **EXISTS**

**Frontend sends:** `POST`, `credentials: "include"`, body `{}` or empty JSON, cookie with `userId`.

**Backend:** clear `user.wallet` for current user; optionally clear `session.siwe`.

---

## 4. Feature APIs — what to send (by area)

All of these use the **same** auth: cookie `sessionId` → `req.session.userId` via `isAuthorized`.  
No extra auth headers. No wallet token on the HTTP request.

### 4.1 Profile / user — cookie only

| Method | Path | Body / notes |
|--------|------|----------------|
| GET | `/user/getUserProfileInfo` | no body |
| POST | `/user/editProfile` | profile JSON fields |
| POST | `/user/setNewAddress` | address JSON |
| POST | `/user/changePassword` | `{ password, newPassword }` (legacy) |
| POST | `/user/photos/upload` | `FormData` (`photo` file); **no** `Content-Type` manual (browser sets multipart) |
| POST | `/user/photos/add` | `{ imagePath, imageExt }` |
| POST | `/user/photos/setPrimary` | `{ photoUrl }` |
| POST | `/user/photos/remove` | photo id/url per existing API |

**Frontend headers pattern:**

```http
Cookie: sessionId=…
Content-Type: application/json   # except multipart upload
```

**Backend:** keep `isAuthorized`; no change for email-OTP sessions.

---

### 4.2 Dating — cookie only

| Method | Path examples |
|--------|----------------|
| GET | `/dating/discover`, `/dating/matches`, `/dating/likes/sent`, `/dating/likes/received`, `/dating/favorites`, `/dating/conversations`, … |
| POST | `/dating/like/:id`, `/dating/superlike/:id`, `/dating/favorites/:id`, `/dating/ai/prompt`, `/dating/ai/discover/custom`, … |
| DELETE | `/dating/like/:id`, `/dating/unmatch/:id`, `/dating/favorites/:id`, `/dating/block/:id`, … |

**Send:** `credentials: "include"` + JSON body when needed.  
**Backend:** `isAuthorized` only — **no change**.

---

### 4.3 Rewards (off-chain API) — cookie only

Quest/achievement/claim HTTP APIs: same session cookie.  
**Backend:** `isAuthorized` — **no change** (unless you add new routes).

---

### 4.4 Web3 features (stake / premium / Nexus / NFT)

These are **two layers**:

| Layer | What is “auth” | Sent to |
|-------|----------------|---------|
| **A. HTTP API** (record stake, mark premium, etc.) | Cookie `sessionId` only | Your backend |
| **B. On-chain tx** | Wallet signature via wagmi/Nexus | Blockchain RPC — **not** your API auth |

**Frontend before Web3 UI:**

1. Must already be logged in (cookie).
2. `WalletRequiredGate` → connect wallet → `POST /user/wallet/connect` with SIWE proof (section 3.1).
3. Then sign chain txs with the connected wallet.

**If backend adds recording endpoints later**, accept:

```http
POST /dating/stake/record   # example
Cookie: sessionId=…
Content-Type: application/json

{
  "matchId": "…",
  "txHash": "0x…",
  "chainId": 84532,
  "amount": "10",
  "token": "USDC"
}
```

**Backend should:**

1. `isAuthorized` (`userId`).
2. Optionally require `user.wallet.address` (and/or `session.siwe`).
3. Optionally verify `txHash` on-chain.
4. **Do not** require a separate Bearer token.

Same pattern for premium activation / NFT mint recording.

---

## 5. Quick matrix

| Feature | Cookie `sessionId` | JSON auth fields | `Authorization` header | Wallet sign |
|---------|--------------------|------------------|------------------------|-------------|
| OTP request | optional anonymous | `email` | no | no |
| OTP verify | yes (session created) | `email`, `code` | no | no |
| Auth check / logout | yes | — | no | no |
| Profile / dating / messages | yes (`userId`) | feature fields only | no | no |
| Wallet connect | yes (`userId`) | `provider`, `address`, `message`, `signature` | no | SIWE message |
| Wallet disconnect | yes | — | no | no |
| Stake / premium / NFT **API** | yes | feature + `txHash` etc. | no | no (tx already on chain) |
| Stake / premium / NFT **chain tx** | n/a | n/a | n/a | yes (wallet) |
| SIWE login (legacy) | yes | `message`, `signature` | no | SIWE |

---

## 6. Frontend code map

| Concern | File |
|---------|------|
| OTP + session check/logout | `frontend/src/lib/auth.ts`, `authApi` in `api.ts` |
| SIWE build + link (not login) | `frontend/src/lib/siwe.ts` → `linkWalletToSession` |
| Fetch helpers | `frontend/src/lib/api.ts` (`credentials: "include"`) |
| Login UI | `frontend/src/app/(auth)/login/page.tsx` |
| Wallet gate | `frontend/src/components/wallet/WalletRequiredGate.tsx` |

Backend acceptance details: [BACKEND_AUTH_CHANGES.md](./BACKEND_AUTH_CHANGES.md).
