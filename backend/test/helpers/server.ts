import '../helpers/env'
import { startMemoryMongo, stopMemoryMongo } from './mongo'
import supertest from 'supertest'

let server: any

export async function startServer() {
  await startMemoryMongo()
  const appServer = (await import('../../src/index')).default
  server = appServer
  return { request: agent() }
}

export async function stopServer() {
  try { server && server.close && server.close() } catch {}
  await stopMemoryMongo()
}

export function agent() {
  return supertest.agent(`http://localhost:${process.env.PORT || '9101'}`)
}
