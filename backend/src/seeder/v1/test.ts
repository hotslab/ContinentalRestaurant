import  * as argon  from 'argon2'
import { mongoDB } from '../../utils/v1/mongodb'

async function seedDB(): Promise<boolean> {
  const db = await mongoDB()
  await (db.collection('times') as any).insertOne({
    _id: 1,
    opening_hour: 8,
    closing_hour: 18,
    days_open: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    created: Date.now(),
    updated: Date.now()
  })
  await db.collection('users').insertMany([
    { 
      email: 'winston@thecontinental.com',
      name: 'Winston',
      surname: 'TheManger',
      role: 'manager',
      password: await argon.hash('secret'),
      isDeleted: false,
      created: Date.now(),
      updated:  Date.now()
    },
    {
      email: 'john@thecontinental.com',
      name: 'John',
      surname: 'Wick',
      role: 'user',
      password: await argon.hash('secret'),
      isDeleted: false,
      created: Date.now(),
      updated:  Date.now()
    }
  ])
  await db.collection('tables').insertMany([
    {name:'Table 1', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', isDeleted: false, created: Date.now(), updated: Date.now()},
    {name:'Table 2', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', isDeleted: false, created: Date.now(), updated: Date.now()},
    {name:'Table 3', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', isDeleted: false, created: Date.now(), updated: Date.now()},
    {name:'Table 4', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', isDeleted: false, created: Date.now(), updated: Date.now()},
    {name:'Table 5', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', isDeleted: false, created: Date.now(), updated: Date.now()},
  ])
  await db.collection('notifications').insertMany([
    {
      type: 'This is an update',
      description: 'These are the update details',
      created_by: 'winston@thecontinental.com',
      creator_role: 'manager',
      receiver_email: 'all',
      receiver_role: 'user',
      received: false,
      content: 'This is some generic content',
      created: Date.now(),
      updated:  Date.now()
    },
    {
      type: 'This is another update',
      description: 'These are the other update details',
      created_by: 'john@thecontinental.com',
      creator_role: 'user',
      receiver_email: 'all',
      receiver_role: 'manager',
      received: false,
      content: 'This is some generic content',
      created: Date.now(),
      updated:  Date.now()
    }
  ])
  return true
}

async function dropBD(): Promise<any> {
  const db = await mongoDB()
  await db.dropDatabase().then(() => console.log('Database dropped'))
  return true
}

export default { seedDB, dropBD }