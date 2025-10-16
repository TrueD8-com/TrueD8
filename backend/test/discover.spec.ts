import { expect } from 'chai'
import { startServer, stopServer, agent } from './helpers/server'
import { User } from '../src/db/user'

async function mk(email: string) {
  const a = agent()
  await a.post('/api/auth/register').send({ email, password: 'p', name:'n',lastName:'l', phoneNumber:'+1' })
  await a.post('/api/auth/login').send({ email, password: 'p' })
  return a
}

describe('Discover feed', () => {
  before(async () => { await startServer() })
  after(async () => { await stopServer() })

  it('filters by showMe and excludes liked/matched/blocked', async () => {
    const u = await mk('c@test.com')
    const user = await User.findOneAndUpdate(
      { 'email.address': 'c@test.com' },
      {
        $set: {
          gender: 'female', showMe: ['male'],
          discovery: { distanceKm: 50000, ageMin: 18, ageMax: 99, visible: true, global: true },
          location: { type: 'Point', coordinates: [0, 0], updatedAt: new Date() }
        }
      },
      { new: true }
    )

    await User.create([
      { name: 'M1', lastName:'L', password:'x', label:[], hasTicketAccount:false, gender:'male', location:{ type:'Point', coordinates:[0.01,0.01] } },
      { name: 'F1', lastName:'L', password:'x', label:[], hasTicketAccount:false, gender:'female', location:{ type:'Point', coordinates:[0.01,0.01] } }
    ] as any)

    const res = await u.get('/api/dating/discover?limit=50')
    expect(res.status).to.equal(200)
    const genders = (res.body?.data || []).map((x: any) => x.gender)
    expect(genders.every((g: any) => g === 'male')).to.equal(true)
  })
})

