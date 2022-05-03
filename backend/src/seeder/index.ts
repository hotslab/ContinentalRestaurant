
import argon from 'argon2'
import mongoose from 'mongoose'
import 'dotenv/config'
import User from '../models/User'
import Time from '../models/Time'
import Table from '../models/Table'
import '../utils/timezone'

const mongoUrl = `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_URL}:${process.env.MONGO_PORT}`
mongoose.connect(mongoUrl, { dbName: process.env.MONGO_DB })
mongoose.connection.on('error', console.error)

async function seedDatabase(): Promise<void> {
// 1. create opening times
await Time.findByIdAndUpdate(1, {
    $set: {
      _id: 1,
      opening_hour: 8,
      closing_hour: 18,
      days_open: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    }
  }, 
  { upsert: true, new: true }
).then(() => console.log('Opning times record has been seeded'), error => console.log(error)) 

// 2. create test manager
await User.findOneAndUpdate(
  {email: 'winston@thecontinental.com'}, 
  { $set: {
      name: 'Winston',
      surname: 'TheManger',
      role: 'manager',
      password: await argon.hash('secret')
    }
  }, 
  { new: true, upsert: true }
).then(() => console.log('The manager user has been seeded'), error => console.log(error)) 

// 3. create test user
await User.findOneAndUpdate(
  {email: 'john@thecontinental.com'}, 
  { $set: {
    name: 'John',
    surname: 'Wick',
    role: 'user',
    password: await argon.hash('secret')
    }
  }, 
  { new: true, upsert: true }
).then(() => console.log('The normal user has been seeded'), error => console.log(error)) 

// 4. create tables
const tables = [
  {name:'Table 1', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'},
  {name:'Table 2', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'},
  {name:'Table 3', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'},
  {name:'Table 4', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'},
  {name:'Table 5', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'}
]
for (const tableData of tables) 
  await Table.findOneAndUpdate( {name: tableData.name},  { $set: tableData }, { new: true, upsert: true })
    .then(() => console.log(`Test table ${tableData.name} has been seeded`), error => console.log(error)) 

// 5. close connection
mongoose.connection.close(function(){
  console.log('Mongoose default connection disconnected through app termination')
  process.exit(0)
})
}

seedDatabase()