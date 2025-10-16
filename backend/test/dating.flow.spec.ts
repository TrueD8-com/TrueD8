import { expect } from 'chai'
import { startServer, stopServer, agent } from './helpers/server'
import { User } from '../src/db/user'

async function registerAndLogin(email: string) {
  const a = agent()
  await a.post('/api/auth/register').send({ email, password: 'p@ssW0rd', name: 'N', lastName: 'L', phoneNumber: '+10000000000' })
  await a.post('/api/auth/login').send({ email, password: 'p@ssW0rd' })
  return a
}

describe('Dating flows: like → match → conversation → messages', () => {
  before(async () => { await startServer() })
  after(async () => { await stopServer() })

  it('creates two users who like each other → match, conversation, messages', async () => {
    const u1 = await registerAndLogin('a@test.com')
    const u2 = await registerAndLogin('b@test.com')

    const u1Doc = await User.findOne({ 'email.address': 'a@test.com' })
    const u2Doc = await User.findOne({ 'email.address': 'b@test.com' })

    const like1 = await u1.post(`/api/dating/like/${u2Doc!._id}`)
    expect(like1.status).to.equal(200)

    const like2 = await u2.post(`/api/dating/like/${u1Doc!._id}`)
    expect(like2.status).to.equal(200)

    const matches = await u1.get('/api/dating/matches')
    expect(matches.status).to.equal(200)
    const matchId = matches.body?.data?.[0]?._id

    const convos = await u1.get('/api/dating/conversations')
    expect(convos.status).to.equal(200)
    const conversationId = convos.body?.data?.[0]?._id

    const m1 = await u1.post(`/api/dating/conversations/${conversationId}/messages`).send({ type: 'text', text: 'hello!' })
    expect(m1.status).to.equal(200)

    const msgs = await u2.get(`/api/dating/conversations/${conversationId}/messages?limit=50`)
    expect(msgs.status).to.equal(200)

    const unmatch = await u1.post(`/api/dating/unmatch/${matchId}`)
    expect(unmatch.status).to.equal(200)
  })
})

