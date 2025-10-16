import { expect } from 'chai'
import { startServer, stopServer, agent } from './helpers/server'
import { User } from '../src/db/user'

async function mk(email: string) {
  const a = agent()
  await a.post('/api/auth/register').send({ email, password: 'p', name:'n',lastName:'l', phoneNumber:'+1' })
  await a.post('/api/auth/login').send({ email, password: 'p' })
  const doc = await (User as any).findOne({ 'email.address': email })
  return { a, doc }
}

describe('Favorites + Likes analytics', () => {
  before(async () => { await startServer() })
  after(async () => { await stopServer() })

  it('add/remove/list favorites; analytics for likes', async () => {
    const { a: u1, doc: d1 } = await mk('fav1@test.com')
    const { a: u2, doc: d2 } = await mk('fav2@test.com')

    const add = await u1.post(`/api/dating/favorites/${d2!._id}`)
    expect(add.status).to.equal(200)

    const list = await u1.get('/api/dating/favorites')
    expect(list.status).to.equal(200)

    await u1.delete(`/api/dating/favorites/${d2!._id}`)

    await u1.post(`/api/dating/like/${d2!._id}`)
    const analytics = await u1.get('/api/dating/analytics/likes')
    expect(analytics.status).to.equal(200)
    expect(analytics.body?.data?.sent).to.be.greaterThan(0)
  })
})

