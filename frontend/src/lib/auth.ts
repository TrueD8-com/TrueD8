import { authApi } from "./api";

const USER_ID_KEY = "user_id";
const AUTH_METHOD_KEY = "auth_method";

export type AuthMethod = "siwe";

/**
 * Check the server-side session established by a successful SIWE login.
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const result = await authApi.checkSessionAuth();
    return result.isAuth === true;
  } catch {
    return false;
  }
}

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
  return method === "siwe" ? method : null;
}

export function clearAuthData(): void {
  localStorage.removeItem(USER_ID_KEY);
  localStorage.removeItem(AUTH_METHOD_KEY);
  localStorage.removeItem("wallet_address");
}

/** Destroy the full authenticated session and clear local display state. */
export async function logout(): Promise<void> {
  try {
    await authApi.logoutSession();
  } catch (error) {
    console.error("Logout error:", error);
  }
  clearAuthData();
}
