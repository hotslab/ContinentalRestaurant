import 'dotenv/config'
import { MongoClient } from 'mongodb'

const mongoUrl = `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_URL}:${process.env.MONGO_PORT}`
if (!mongoUrl) {
  throw new Error('Missing MONGO_URI')
}

console.log(mongoUrl)
console.log(process.env.MONGO_TEST_DB)

const client = new MongoClient(mongoUrl)

export async function mongoDB() {
  await client.connect()
  return client.db(process.env.MONGO_TEST_DB)
}

export async function disconnect() {
  await client.close()
}