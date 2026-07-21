import { authApi } from "./api";

const USER_ID_KEY = "user_id";
const AUTH_METHOD_KEY = "auth_method";
const EMAIL_HINT_KEY = "email_hint";

export type AuthMethod = "email_otp" | "siwe";

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "***";
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}***@${domain}`;
}

/**
 * Normalize email for consistent requests (trim + lowercase).
 * Never log the full email in production flows.
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  // Practical validation; backend must re-validate.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email));
}

export function sanitizeOtpCode(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, 6);
}

export function isValidOtpCode(code: string): boolean {
  return /^\d{6}$/.test(code);
}

/**
 * Request a one-time login code for the given email.
 * Requires backend: POST /auth/otp/request (see docs/BACKEND_AUTH_CHANGES.md).
 */
export async function requestEmailOtp(email: string): Promise<{ emailHint: string }> {
  const normalized = normalizeEmail(email);
  if (!isValidEmail(normalized)) {
    throw new Error("Enter a valid email address");
  }

  await authApi.requestEmailOtp(normalized);

  const emailHint = maskEmail(normalized);
  // Non-sensitive hint only — never store OTP or full email as auth proof.
  sessionStorage.setItem(EMAIL_HINT_KEY, emailHint);

  return { emailHint };
}

/**
 * Verify OTP and establish session cookie (credentials: include).
 * Requires backend: POST /auth/otp/verify
 */
export async function verifyEmailOtp(
  email: string,
  code: string
): Promise<{ userId: string }> {
  const normalized = normalizeEmail(email);
  const otp = sanitizeOtpCode(code);

  if (!isValidEmail(normalized)) {
    throw new Error("Enter a valid email address");
  }
  if (!isValidOtpCode(otp)) {
    throw new Error("Enter the 6-digit code from your email");
  }

  const result = await authApi.verifyEmailOtp(normalized, otp);

  localStorage.setItem(USER_ID_KEY, result.userId);
  localStorage.setItem(AUTH_METHOD_KEY, "email_otp");
  sessionStorage.removeItem(EMAIL_HINT_KEY);

  return { userId: result.userId };
}

/**
 * Session auth check based on `userId` (works for email OTP and linked-wallet users).
 * Do NOT use /auth/siwe/auth for primary session gating.
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const result = await authApi.checkSessionAuth();
    return result.isAuth === true;
  } catch {
    return false;
  }
}

/**
 * Whether a wallet has proven SIWE ownership in this browser session.
 * Used only for Web3 feature gates — not for app login.
 */
export async function hasSiweSession(): Promise<boolean> {
  try {
    const result = await authApi.checkSiweAuth();
    return result.isAuth === true;
  } catch {
    return false;
  }
}

export function getLocalUserId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(USER_ID_KEY);
}

export function getAuthMethod(): AuthMethod | null {
  if (typeof window === "undefined") return null;
  const method = localStorage.getItem(AUTH_METHOD_KEY);
  return method === "email_otp" || method === "siwe" ? method : null;
}

export function clearAuthData(): void {
  localStorage.removeItem(USER_ID_KEY);
  localStorage.removeItem(AUTH_METHOD_KEY);
  localStorage.removeItem("wallet_address");
  sessionStorage.removeItem(EMAIL_HINT_KEY);
}

/**
 * Full app logout — destroys session.userId.
 * Prefer /auth/logout over /auth/siwe/logout for email-primary auth.
 */
export async function logout(): Promise<void> {
  try {
    await authApi.logoutSession();
  } catch (error) {
    console.error("Logout error:", error);
  }
  clearAuthData();
}
