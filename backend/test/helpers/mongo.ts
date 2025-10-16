import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'

let mongo: MongoMemoryServer

export async function startMemoryMongo() {
  mongo = await MongoMemoryServer.create()
  const uri = mongo.getUri()
  process.env.MONGO_DATABASE = uri
  process.env.MONGO_DATABASE_NAME = 'trued8_test'
  await mongoose.connect(uri)
}

export async function stopMemoryMongo() {
  try {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
  } finally {
    if (mongo) await mongo.stop()
  }
}

