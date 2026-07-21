import { SiweMessage } from "siwe";
import { authApi, userApi } from "./api";

/**
 * SIWE helpers for optional wallet linking / Web3 ownership proof.
 * Primary app login is email OTP (`lib/auth.ts`) — do not use SIWE as the main gate.
 *
 * IMPORTANT: Prefer `linkWalletToSession` when the user already has an email session.
 * Calling `siweAuthenticate` (SIWE login) can replace `session.userId` with a
 * wallet-keyed user until the backend supports authenticated wallet linking.
 */

export async function buildSiweMessage(
  address: string,
  chainId: number
): Promise<{ messageString: string; nonce: string }> {
  const { nonce } = await authApi.getNonce();
  const domain = window.location.host.replace("localhost", "127.0.0.1");
  const origin = window.location.origin.replace("localhost", "127.0.0.1");

  const siweMessage = new SiweMessage({
    domain,
    address,
    statement: "Link this wallet to your TrueD8 account",
    uri: origin,
    version: "1",
    chainId,
    nonce,
    issuedAt: new Date().toISOString(),
    expirationTime: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
  });

  return { messageString: siweMessage.prepareMessage(), nonce };
}

/**
 * Prove wallet ownership and attach it to the current email session.
 * Does NOT call /auth/siwe/login (avoids swapping the logged-in user).
 *
 * Sends message+signature to /user/wallet/connect for when backend adds verification
 * (see docs/BACKEND_AUTH_CHANGES.md). Today the backend may ignore the proof fields.
 */
export async function linkWalletToSession(
  address: string,
  chainId: number,
  signMessage: (message: string) => Promise<string>,
  provider = "walletconnect"
): Promise<{ address: string }> {
  const normalized = address.toLowerCase();
  const { messageString } = await buildSiweMessage(normalized, chainId);
  const signature = await signMessage(messageString);

  await userApi.connectWallet(provider, normalized, {
    message: messageString,
    signature,
  });

  localStorage.setItem("wallet_address", normalized);
  return { address: normalized };
}

/**
 * Legacy full SIWE login (creates/finds user by wallet).
 * Avoid for email-primary users — use linkWalletToSession instead.
 */
export async function siweAuthenticate(
  address: string,
  chainId: number,
  signMessage: (message: string) => Promise<string>
) {
  const { messageString } = await buildSiweMessage(address, chainId);
  const signature = await signMessage(messageString);
  const authData = await authApi.login(messageString, signature);

  localStorage.setItem("wallet_address", authData.address);
  localStorage.setItem("user_id", authData.userId);
  localStorage.setItem("auth_method", "siwe");

  return authData;
}

export async function verifySiweMessageLocally(
  message: string,
  signature: string
): Promise<boolean> {
  try {
    const siweMessage = new SiweMessage(message);
    const result = await siweMessage.verify({ signature });
    return result.success;
  } catch {
    return false;
  }
}

export function clearAuthData(): void {
  localStorage.removeItem("user_id");
  localStorage.removeItem("wallet_address");
  localStorage.removeItem("auth_method");
}

/** @deprecated Use isAuthenticated from @/lib/auth (session /auth/auth). */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const result = await authApi.checkSessionAuth();
    return result.isAuth;
  } catch {
    return false;
  }
}

export function hasLocalAuthData(): boolean {
  return !!localStorage.getItem("user_id") || !!localStorage.getItem("wallet_address");
}

/** @deprecated Use logout from @/lib/auth. */
export async function logout(): Promise<void> {
  try {
    await authApi.logoutSession();
  } catch (error) {
    console.error("Logout error:", error);
  }
  clearAuthData();
}
