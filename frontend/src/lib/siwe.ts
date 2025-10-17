import { SiweMessage } from "siwe";
import { authApi } from "./api";

/**
 * Complete SIWE authentication flow using the siwe package
 * 1. Get nonce from backend
 * 2. Create SIWE message using siwe package
 * 3. Sign message with wallet
 * 4. Verify signature and get tokens
 */
export async function siweAuthenticate(
  address: string,
  chainId: number,
  signMessage: (message: string) => Promise<string>
) {
  try {
    // Step 1: Get nonce from backend
    const { nonce, domain } = await authApi.getNonce(address);

    // Step 2: Create SIWE message using siwe package
    const siweMessage = new SiweMessage({
      domain: domain,
      address: address,
      statement: "Sign in with Ethereum to TrueD8",
      uri: window.location.origin,
      version: "1",
      chainId: chainId,
      nonce: nonce,
    });

    // Prepare the message string
    const messageString = siweMessage.prepareMessage();

    // Step 3: Sign message with wallet
    const signature = await signMessage(messageString);

    // Step 4: Verify signature and get tokens from backend
    const authData = await authApi.verify(messageString, signature);

    // Store tokens
    localStorage.setItem("access_token", authData.accessToken);
    localStorage.setItem("refresh_token", authData.refreshToken);
    localStorage.setItem("user_id", authData.user.id.toString());
    localStorage.setItem("wallet_address", authData.user.wallet.address);

    return authData;
  } catch (error) {
    console.error("SIWE authentication error:", error);
    throw error;
  }
}

/**
 * Verify a SIWE message locally (client-side validation)
 */
export async function verifySiweMessageLocally(
  message: string,
  signature: string
): Promise<boolean> {
  try {
    const siweMessage = new SiweMessage(message);
    const result = await siweMessage.verify({ signature });
    return result.success;
  } catch (error) {
    console.error("SIWE local verification error:", error);
    return false;
  }
}

/**
 * Get stored access token
 */
export function getAccessToken(): string | null {
  return localStorage.getItem("access_token");
}

/**
 * Get stored refresh token
 */
export function getRefreshToken(): string | null {
  return localStorage.getItem("refresh_token");
}

/**
 * Clear all auth data
 */
export function clearAuthData(): void {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user_id");
  localStorage.removeItem("wallet_address");
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
  const token = getAccessToken();
  if (token) {
    try {
      await authApi.logout(token);
    } catch (error) {
      console.error("Logout error:", error);
    }
  }
  clearAuthData();
}

/**
 * Refresh access token
 */
export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const { accessToken } = await authApi.refresh(refreshToken);
    localStorage.setItem("access_token", accessToken);
    return accessToken;
  } catch (error) {
    console.error("Token refresh error:", error);
    clearAuthData();
    return null;
  }
}
