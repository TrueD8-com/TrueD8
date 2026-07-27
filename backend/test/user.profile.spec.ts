import { expect } from 'chai'
import { startServer, stopServer, agent } from './helpers/server'
import fs from 'fs'
import { mockSiweModule } from './helpers/siwe-mock'

describe('User Profile: edit, address, photos, wallet', () => {
  let restoreSiwe: any
  before(async () => {
    restoreSiwe = mockSiweModule()
    await startServer()
  })
  after(async () => {
    restoreSiwe && restoreSiwe()
    await stopServer()
  })

  it('edit profile & address & wallet connect/disconnect', async () => {
    const req = agent()
    await req.post('/api/auth/register').send({ email: 'p@test.com', password: 'pass', name:'n',lastName:'l', phoneNumber:'+1' })
    await req.post('/api/auth/login').send({ email: 'p@test.com', password: 'pass' })

    const edit = await req.post('/api/user/editProfile').send({
      profileName: 'Jane', profileLastName: 'Doe', profileUsername: 'jane',
      profileBio: 'bio', profileGender: 'female', profileShowMe: ['male'], profileInterests: ['music'],
      discoveryDistanceKm: 100, discoveryAgeMin: 20, discoveryAgeMax: 40, discoveryVisible: true, discoveryGlobal: false
    })
    expect(edit.status).to.equal(200)

    const addr = await req.post('/api/user/setNewAddress').send({
      provinceOp: 'Tehran', cityOp: 'Tehran', postalCodeOp: '1234567890', addressOp: 'Some Street', coordinates: [51.389, 35.6892]
    })
    expect(addr.status).to.equal(200)

    const nonceRes = await req.get('/api/auth/siwe/nonce')
    const walletAddress = '0x0000000000000000000000000000000000000abc'
    const walletConn = await req.post('/api/user/wallet/connect').send({
      provider: 'metamask',
      address: walletAddress,
      message: JSON.stringify({
        address: walletAddress,
        nonce: nonceRes.body?.data?.nonce,
        chainId: 1,
        domain: 'localhost:3000'
      }),
      signature: '0xsig'
    })
    expect(walletConn.status).to.equal(200)

    const profile = await req.get('/api/user/getUserProfileInfo')
    expect(profile.body?.data?.wallet?.address).to.equal(walletAddress)

    const walletDisc = await req.post('/api/user/wallet/disconnect')
    expect(walletDisc.status).to.equal(200)
  })

  it('photo upload flow (temp → add → setPrimary → remove)', async () => {
    const req = agent()
    await req.post('/api/auth/register').send({ email: 'photo@test.com', password: 'p', name:'n',lastName:'l', phoneNumber:'+1' })
    await req.post('/api/auth/login').send({ email: 'photo@test.com', password: 'p' })

    if (!fs.existsSync('./images/temp')) fs.mkdirSync('./images/temp', { recursive: true })
    const tempName = `test_${Date.now()}.jpg`
    fs.writeFileSync(`./images/temp/${tempName}`, Buffer.from([1,2,3]))

    const add = await req.post('/api/user/photos/add').send({ imageName: tempName, isPrimary: true })
    expect(add.status).to.equal(200)
    const url = add.body?.data?.url

    const setPrim = await req.post('/api/user/photos/setPrimary').send({ url })
    expect(setPrim.status).to.equal(200)

    const rem = await req.post('/api/user/photos/remove').send({ url })
    expect(rem.status).to.equal(200)
  })
})
