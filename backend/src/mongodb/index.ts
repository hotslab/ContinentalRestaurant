import { Db, MongoClient  } from 'mongodb'

const url: string = process.env.MONGO_URL || ''

const mongoClient = new MongoClient(url)

export default function(dbName: string): Db {
  mongoClient.connect()
  return mongoClient.db()
} 
