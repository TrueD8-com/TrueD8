import { SiweMessage } from "siwe";
import { authApi, userApi } from "./api";

type SiwePurpose = "login" | "link";

export async function buildSiweMessage(
  address: string,
  chainId: number,
  purpose: SiwePurpose = "login"
): Promise<{ messageString: string; nonce: string }> {
  const { nonce } = await authApi.getNonce();
  const domain = window.location.host.replace("localhost", "127.0.0.1");
  const origin = window.location.origin.replace("localhost", "127.0.0.1");

  const siweMessage = new SiweMessage({
    domain,
    address,
    statement:
      purpose === "login"
        ? "Sign in with Ethereum to TrueD8"
        : "Link this wallet to your TrueD8 account",
    uri: origin,
    version: "1",
    chainId,
    nonce,
    issuedAt: new Date().toISOString(),
    expirationTime: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
  });

  return { messageString: siweMessage.prepareMessage(), nonce };
}

/** Prove ownership and attach a wallet to the authenticated user. */
export async function linkWalletToSession(
  address: string,
  chainId: number,
  signMessage: (message: string) => Promise<string>,
  provider = "walletconnect"
): Promise<{ address: string }> {
  const normalized = address.toLowerCase();
  const { messageString } = await buildSiweMessage(
    address,
    chainId,
    "link"
  );
  const signature = await signMessage(messageString);

  await userApi.connectWallet(provider, normalized, {
    message: messageString,
    signature,
  });

  localStorage.setItem("wallet_address", normalized);
  return { address: normalized };
}

/** Authenticate with SIWE and establish the server-side app session. */
export async function siweAuthenticate(
  address: string,
  chainId: number,
  signMessage: (message: string) => Promise<string>
) {
  const { messageString } = await buildSiweMessage(address, chainId, "login");
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
