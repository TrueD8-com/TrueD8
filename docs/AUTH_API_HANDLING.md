# Auth API handling (frontend)

TrueD8 uses **cookie sessions** (`sessionId`, `credentials: "include"`). There is no Bearer JWT for dating APIs today.

Primary login is **email OTP**. **SIWE / wallet** is optional and only for Web3 features.

---

## Auth modes

| Mode | How identity is established | Session fields | Frontend entry |
|------|-----------------------------|----------------|----------------|
| **Email OTP (primary)** | `POST /auth/otp/request` → `POST /auth/otp/verify` | `req.session.userId` | `/login` |
| **SIWE login (legacy / avoid for email users)** | `GET /auth/siwe/nonce` → sign → `POST /auth/siwe/login` | `userId` **and** `session.siwe` | Do not use as main gate |
| **Wallet link (preferred for Web3)** | Wagmi connect + SIWE **sign** → `POST /user/wallet/connect` with optional `message`/`signature` | Keeps existing `userId`; stores `user.wallet` | `WalletRequiredGate` |

**Rule:** Never call `POST /auth/siwe/login` while an email session is active until the backend supports authenticated linking — it can replace `userId` with a wallet-keyed user.

---

## Cookie / credential rules (all authenticated calls)

1. Always use `credentials: "include"` on `fetch`.
2. Do **not** put session tokens in `localStorage` for API auth.
3. `localStorage` may hold non-secret hints only (`user_id`, `auth_method`, `wallet_address`).
4. Never store OTP codes in `localStorage` / `sessionStorage`.
5. Prefer `GET /auth/auth` (userId) for app login checks — **not** `GET /auth/siwe/auth`.
6. Prefer `GET /auth/logout` for full logout — **not** `GET /auth/siwe/logout` (SIWE logout may leave `userId`).

---

## Which auth each API needs

### A. Session only (`userId`) — email OTP is enough

Use after `AuthGuard` / `isAuthenticated()` (`/auth/auth`).

| Area | Endpoints (examples) | Auth |
|------|----------------------|------|
| Profile | `GET /user/getUserProfileInfo`, edit profile, photos, discovery | Session cookie |
| Dating | discover, like, likes, matches, unmatch, messages, conversations | Session cookie |
| Rewards (off-chain) | quests, achievements, claim (API balance) | Session cookie |
| Wallet link/unlink | `POST /user/wallet/connect`, `POST /user/wallet/disconnect` | Session cookie (+ ownership proof when backend enforces it) |

**Frontend:** `authApi.checkSessionAuth()`, dating/user APIs as today.

### B. Session + connected wallet (client) — no SIWE session required

On-chain txs use wagmi / Nexus with the browser wallet. Backend session still authorizes any API that records the action.

| Feature | Frontend | Backend auth | Wallet |
|---------|----------|--------------|--------|
| Stake date commitment | `StakingCommitmentModal` + `WalletRequiredGate` | Session if recording stake | Connected + linked |
| Premium payment | `PremiumModal` + gate | Session if updating premium | Connected + linked |
| Transfers / balances / Nexus / explorer | Rewards → Blockchain tab + gate | Session for any API | Connected + linked |
| Milestone / profile NFT mint | Blockchain components + gate | Session if any | Connected + linked |

**Frontend flow:**

1. User already has email session.
2. `WalletRequiredGate` → RainbowKit connect.
3. `linkWalletToSession()` → SIWE message sign → `POST /user/wallet/connect` (does **not** call SIWE login).
4. Proceed with wagmi/Nexus tx.

### C. SIWE session only (`session.siwe`) — legacy / optional

| Endpoint | When to use |
|----------|-------------|
| `GET /auth/siwe/auth` | Only if a feature must require proven SIWE session fields |
| `GET /auth/siwe/logout` | Clear SIWE fields without full logout (rare) |
| `POST /auth/siwe/login` | Legacy wallet-only login; avoid for email-primary users |

**Frontend:** `authApi.checkSiweAuth()` / `hasSiweSession()` — not used by `AuthGuard`.

---

## Auth API cheat sheet

| Call | Purpose | Use for app shell? |
|------|---------|-------------------|
| `POST /auth/otp/request` | Send email OTP | Login page |
| `POST /auth/otp/verify` | Create `userId` session | Login page |
| `GET /auth/auth` | Is `userId` set? | **Yes** — AuthGuard |
| `GET /auth/logout` | Destroy session | **Yes** — Logout |
| `GET /auth/siwe/nonce` | Nonce for ownership proof / SIWE login | Wallet link / legacy |
| `POST /auth/siwe/login` | Wallet-as-identity login | **No** (email users) |
| `GET /auth/siwe/auth` | Is `session.siwe` set? | Web3-only checks |
| `GET /auth/siwe/logout` | Clear SIWE only | Rare |
| `POST /user/wallet/connect` | Attach wallet to current user | After email login |
| `POST /user/wallet/disconnect` | Detach wallet | Profile / settings |

---

## Error handling guidance

| Situation | Frontend behavior |
|-----------|-------------------|
| OTP request fails | Generic message (do not reveal if email exists) |
| OTP verify fails | “Invalid or expired code” — clear OTP input |
| Session expired on API `401` | Redirect to `/login` |
| Wallet not linked on Web3 UI | Show `WalletRequiredGate`, keep user on page |
| User rejects signature | Show recoverable error; do not log out |

---

## Security practices (frontend)

- OTP input: `autocomplete="one-time-code"`, digits only, max 6, cleared after submit/failure.
- Resend cooldown (60s) to reduce abuse.
- Do not `console.log` OTP, full email, or signatures in production paths.
- Mask email in UI after send (`a***@domain`).
- SameSite session cookie + HTTPS in production (backend).
- Ownership proof: always prefer signed SIWE message when linking a wallet, even if backend ignores proof until updated.

See also: [BACKEND_AUTH_CHANGES.md](./BACKEND_AUTH_CHANGES.md).
