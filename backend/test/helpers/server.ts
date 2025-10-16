import '../helpers/env'
import { startMemoryMongo, stopMemoryMongo } from './mongo'
import supertest from 'supertest'

let server: any
let requestAgent: supertest.SuperAgentTest

export async function startServer() {
  await startMemoryMongo()
  const appServer = (await import('../../src/index')).default
  server = appServer
  requestAgent = supertest.agent(`http://localhost:${process.env.PORT || '9101'}`)
  return { request: requestAgent }
}

export async function stopServer() {
  try { server && server.close && server.close() } catch {}
  await stopMemoryMongo()
}

export function agent() {
  return requestAgent
}

