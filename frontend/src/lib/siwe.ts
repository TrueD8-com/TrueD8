import { SiweMessage } from "siwe";
import { authApi } from "./api";

/**
 * Complete SIWE authentication flow using the siwe package
 * 1. Get nonce from backend
 * 2. Create SIWE message using siwe package
 * 3. Sign message with wallet
 * 4. Login with signature (session-based)
 */
export async function siweAuthenticate(
  address: string,
  chainId: number,
  signMessage: (message: string) => Promise<string>
) {
  try {
    // Step 1: Get nonce from backend
    const { nonce } = await authApi.getNonce();
    console.log("LOG 1: Nonce received successfully:", nonce);
    const domain = window.location.host.replace("localhost", "127.0.0.1");
    const origin = window.location.origin.replace("localhost", "127.0.0.1");

    console.log("Domain:", domain, "Origin:", origin);

    // Step 2: Create SIWE message using siwe package
    const siweMessage = new SiweMessage({
      domain: domain,
      address: address,
      statement: "Sign in with Ethereum to TrueD8",
      uri: origin,
      version: "1",
      chainId: chainId,
      nonce: nonce,
      issuedAt: new Date().toISOString(),
      expirationTime: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    });

    // Prepare the message string
    const messageString = siweMessage.prepareMessage();
    console.log("LOG 2: Message prepared for signing:", messageString);

    // Step 3: Sign message with wallet
    const signature = await signMessage(messageString);
    console.log("LOG 3: Wallet signature received.");

    // Step 4: Login with signature
    const authData = await authApi.login(messageString, signature);
    console.log("LOG 4: Login API call successful.");

    // Store wallet info in localStorage
    localStorage.setItem("wallet_address", authData.address);
    localStorage.setItem("user_id", authData.userId);

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
 * Clear all auth data
 */
export function clearAuthData(): void {
  localStorage.removeItem("user_id");
  localStorage.removeItem("wallet_address");
}

/**
 * Check if user is authenticated (checks with backend)
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const result = await authApi.checkAuth();
    return result.isAuth;
  } catch (error) {
    return false;
  }
}

/**
 * Check if user appears to be authenticated (local check only)
 */
export function hasLocalAuthData(): boolean {
  return !!localStorage.getItem("wallet_address");
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
  try {
    await authApi.logout();
  } catch (error) {
    console.error("Logout error:", error);
  }
  clearAuthData();
}
