export function mockSiweModule() {
  const Module = require('module')
  const original = Module.prototype.require
  Module.prototype.require = function (path: string) {
    if (path === 'siwe') {
      class SiweMessage {
        message: any
        constructor(message: any) {
          this.message = typeof message === 'string' ? JSON.parse(message) : message
        }
        async verify({ signature, nonce }: { signature: string, nonce?: string }) {
          if (signature !== '0xsig' || (nonce && nonce !== this.nonce)) {
            throw new Error('invalid proof')
          }
          return {
            success: true,
            data: {
              address: this.address,
              chainId: this.chainId,
              issuedAt: this.issuedAt
            }
          }
        }
        get nonce() { return (this.message?.nonce || 'test-nonce') }
        get domain() { return this.message?.domain || 'localhost:3000' }
        get uri() { return this.message?.uri || 'http://localhost:3000' }
        get address() {
          return this.message?.address || '0x000000000000000000000000000000000000dEaD'
        }
        get chainId() { return this.message?.chainId || 1 }
        get issuedAt() { return this.message?.issuedAt || new Date().toISOString() }
      }
      return {
        SiweMessage,
        generateNonce: () => 'test-nonce'
      }
    }
    return original.apply(this, arguments as any)
  }
  return () => { Module.prototype.require = original }
}
