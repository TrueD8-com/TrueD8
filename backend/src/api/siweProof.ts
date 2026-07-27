import { SiweMessage } from 'siwe'

export class SiweProofError extends Error {
  constructor(message: string) {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export interface VerifiedSiweProof {
  address: string
  chainId: number
  issuedAt?: string
}

const defaultSiweDomains = [
  'true-d8-theta.vercel.app',
  'trued8.com',
  'www.trued8.com',
  'trued8.com.ng',
  'www.trued8.com.ng',
  'localhost:3000',
  '127.0.0.1:3000',
]

function domainFromConfig(value: string): string | null {
  const trimmed = value.trim().toLowerCase()
  if (!trimmed) return null
  try {
    return new URL(trimmed.includes('://') ? trimmed : `https://${trimmed}`).host
  } catch {
    return null
  }
}

function configuredSiweDomains(): Set<string> {
  const configured = [
    process.env.SIWE_DOMAINS || '',
    process.env.CORS_ORIGINS || '',
  ]
    .join(',')
    .split(',')
    .map(domainFromConfig)
    .filter((domain): domain is string => Boolean(domain))

  return new Set([...defaultSiweDomains, ...configured])
}

function domainsMatch(left: string, right: string): boolean {
  if (left === right) return true
  // The frontend normalizes localhost to 127.0.0.1 when preparing SIWE.
  const normalizeLocalhost = (domain: string) =>
    domain.replace(/^localhost(?=:|$)/, '127.0.0.1')
  return normalizeLocalhost(left) === normalizeLocalhost(right)
}

/**
 * Parses and verifies a SIWE proof against the nonce held in the caller's
 * session. Callers must consume the nonce before awaiting this function so a
 * failed or replayed signature cannot reuse it.
 */
export async function verifySiweProof(
  message: unknown,
  signature: unknown,
  expectedNonce: unknown,
  requestOrigin?: unknown,
): Promise<VerifiedSiweProof> {
  if (typeof message !== 'string' || !message.trim()) {
    throw new SiweProofError('SIWE message is required')
  }
  if (typeof signature !== 'string' || !signature.trim()) {
    throw new SiweProofError('SIWE signature is required')
  }
  if (typeof expectedNonce !== 'string' || !expectedNonce) {
    throw new SiweProofError('SIWE nonce is missing or expired')
  }

  let parsed: SiweMessage
  try {
    parsed = new SiweMessage(message)
  } catch {
    throw new SiweProofError('SIWE message is invalid')
  }

  if (parsed.nonce !== expectedNonce) {
    throw new SiweProofError('SIWE nonce is invalid')
  }

  const messageDomain = String(parsed.domain || '').trim().toLowerCase()
  if (!configuredSiweDomains().has(messageDomain)) {
    throw new SiweProofError('SIWE domain is not allowed')
  }

  let uriDomain: string
  try {
    uriDomain = new URL(String(parsed.uri)).host.toLowerCase()
  } catch {
    throw new SiweProofError('SIWE URI is invalid')
  }
  if (!domainsMatch(messageDomain, uriDomain)) {
    throw new SiweProofError('SIWE URI does not match its domain')
  }

  if (typeof requestOrigin === 'string' && requestOrigin) {
    let originDomain: string
    try {
      originDomain = new URL(requestOrigin).host.toLowerCase()
    } catch {
      throw new SiweProofError('SIWE request origin is invalid')
    }
    if (!domainsMatch(messageDomain, originDomain)) {
      throw new SiweProofError('SIWE domain does not match request origin')
    }
  }

  try {
    const result = await parsed.verify({
      signature,
      nonce: expectedNonce,
    })
    if (!result.success) {
      throw new SiweProofError('SIWE signature is invalid')
    }

    const verified = result.data || parsed
    const address = String(verified.address || '').toLowerCase()
    const chainId = Number(verified.chainId)

    if (!/^0x[a-f0-9]{40}$/.test(address) || !Number.isSafeInteger(chainId) || chainId <= 0) {
      throw new SiweProofError('SIWE identity is invalid')
    }

    return {
      address,
      chainId,
      issuedAt: verified.issuedAt,
    }
  } catch (error) {
    if (error instanceof SiweProofError) throw error
    throw new SiweProofError('SIWE signature is invalid or expired')
  }
}
