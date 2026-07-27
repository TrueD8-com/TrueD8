import { expect } from 'chai'
import { startServer, stopServer, agent } from './helpers/server'
import { mockSiweModule } from './helpers/siwe-mock'

describe('Auth (Email/Password + SIWE)', () => {
  let restoreSiwe: any
  before(async () => {
    restoreSiwe = mockSiweModule()
    await startServer()
  })
  after(async () => {
    restoreSiwe && restoreSiwe()
    await stopServer()
  })

  it('registers a user via email/password and logs in', async () => {
    const req = agent()
    const register = await req.post('/api/auth/register').send({
      email: 'user@example.com', password: 'secret123', name: 'Jane', lastName: 'Doe', phoneNumber: '+15555555555'
    })
    ;[200,201,204].includes(register.status)

    const login = await req.post('/api/auth/login').send({ email: 'user@example.com', password: 'secret123' })
    expect(login.status).to.equal(200)

    const authed = await req.get('/api/auth/auth')
    expect(authed.status).to.equal(200)
  })

  it('wallet-only onboarding via SIWE creates user and authenticates', async () => {
    const req = agent()
    const nonceRes = await req.get('/api/auth/siwe/nonce')
    expect(nonceRes.status).to.equal(200)
    const nonce = nonceRes.body?.data?.nonce

    const siweLogin = await req.post('/api/auth/siwe/login').send({
      message: JSON.stringify({
        address: '0x000000000000000000000000000000000000dEaD',
        nonce,
        chainId: 1,
        domain: 'localhost:3000'
      }),
      signature: '0xsig'
    })
    expect(siweLogin.status).to.equal(200)

    const authed = await req.get('/api/auth/auth')
    expect(authed.status).to.equal(200)

    const profile = await req.get('/api/user/getUserProfileInfo')
    expect(profile.status).to.equal(200)
    expect(profile.body?.data?.wallet?.address).to.equal(
      '0x000000000000000000000000000000000000dead'
    )
  })

  it('rejects replaying a SIWE proof after its nonce is consumed', async () => {
    const req = agent()
    const nonceRes = await req.get('/api/auth/siwe/nonce')
    const message = JSON.stringify({
      address: '0x000000000000000000000000000000000000beef',
      nonce: nonceRes.body?.data?.nonce,
      chainId: 1,
      domain: 'localhost:3000'
    })

    const first = await req.post('/api/auth/siwe/login').send({
      message,
      signature: '0xsig'
    })
    expect(first.status).to.equal(200)

    await req.get('/api/auth/logout')
    const replay = await req.post('/api/auth/siwe/login').send({
      message,
      signature: '0xsig'
    })
    expect(replay.status).to.equal(401)
  })

  it('does not replace an already authenticated user through SIWE login', async () => {
    const req = agent()
    const firstNonce = await req.get('/api/auth/siwe/nonce')
    const firstLogin = await req.post('/api/auth/siwe/login').send({
      message: JSON.stringify({
        address: '0x000000000000000000000000000000000000cafe',
        nonce: firstNonce.body?.data?.nonce,
        chainId: 1,
        domain: 'localhost:3000'
      }),
      signature: '0xsig'
    })
    expect(firstLogin.status).to.equal(200)

    const secondNonce = await req.get('/api/auth/siwe/nonce')
    const attemptedSwitch = await req.post('/api/auth/siwe/login').send({
      message: JSON.stringify({
        address: '0x000000000000000000000000000000000000babe',
        nonce: secondNonce.body?.data?.nonce,
        chainId: 1,
        domain: 'localhost:3000'
      }),
      signature: '0xsig'
    })
    expect(attemptedSwitch.status).to.equal(409)
  })
})
