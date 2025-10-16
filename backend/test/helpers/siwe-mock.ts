export function mockSiweModule() {
  const Module = require('module')
  const original = Module.prototype.require
  Module.prototype.require = function (path: string) {
    if (path === 'siwe') {
      class SiweMessage {
        message: any
        constructor(message: any) { this.message = message }
        async validate(signature: string) {
          return {
            address: (this.message?.address || '0x000000000000000000000000000000000000dEaD'),
            chainId: this.message?.chainId || 1,
            issuedAt: new Date().toISOString()
          }
        }
        get nonce() { return (this.message?.nonce || 'test-nonce') }
      }
      return { SiweMessage }
    }
    return original.apply(this, arguments as any)
  }
  return () => { Module.prototype.require = original }
}

