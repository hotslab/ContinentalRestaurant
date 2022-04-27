
import Koa, { Context } from 'koa'
import jsonWebtoken from 'jsonwebtoken'
import argon from 'argon2'
import mongoClient from '../mongodb'

async function getUserByEmail(email: string, dbDatabase: string, dbTable: string) {
  const db = await mongoClient(dbDatabase)
  const collection = await db.collection(dbTable)
  return collection.findOne({email: email})
}

export default {
  login: async (ctx: Context, next: Koa.Next) => {
    const user = await getUserByEmail(ctx.request.body.email, 'theContinental', 'users')
    if (!user) {
      ctx.status = 401
      ctx.body = {
        error: "Email provided is incorrect"
      }
      return
    }
    const { password, ...userInfoWithoutPassword } = user
    if (await argon.verify(password, ctx.request.body.password)) {
      ctx.status = 200
      ctx.body = {
        user: userInfoWithoutPassword,
        token: jsonWebtoken.sign({
          data: userInfoWithoutPassword,
        }, process.env.JWT_SECRET || 'shared_secret', { expiresIn: '1h' })
      }
    } else {
      ctx.status = 401
      ctx.body = {
        error: "Password is incorrect"
      }
    }
  },
  register: async (ctx: Context, next: Koa.Next): Promise<any> => {
    if (!ctx.request.body.email || !ctx.request.body.password || !ctx.request.body.email || !ctx.request.body.name || !ctx.request.body.surname) {
      ctx.status = 400
      ctx.body = {
        error: 'Please add all the required fields correctly'
      }
      return
    }
    const user = await getUserByEmail(ctx.request.body.email, 'theContinental', 'users')
    if (!user) {
      const db = await mongoClient('theContinental')
      const collection = db.collection('users')
      collection.insertOne({ 
        email: ctx.request.body.email,
        name: ctx.request.body.name,
        surname: ctx.request.body.surname,
        role: ctx.request.body.email,
        password: await argon.hash(ctx.request.body.password)
      })
      ctx.status = 200
      ctx.body = {
        message: "User registered successfuly"
      }
    } else {
      ctx.status = 406
      ctx.body = {
        error: "User already exists"
      }
    }
  },
  forgotPassword: async (ctx: Context, next: Koa.Next): Promise<any> => {
    if (!ctx.request.body.email) {
      ctx.status = 400
      ctx.body = {
        error: 'Email is required'
      }
      return
    }
    const user = await getUserByEmail(ctx.request.body.email, 'theContinental', 'users')
    if (!user) {

    } else {
      ctx.status = 401
      ctx.body = {
        error: "User not found"
      }
    }
  },
  resetPassword: async (): Promise<any> => {

  },
  getUsers: (ctx: Context, next: Koa.Next): any => {
    console.log('CHECKING 2')
    ctx.body = 'user'
  },
  getUser: (ctx: Context, next: Koa.Next): any => {
    console.log('CHECKING 3')
    ctx.body =  'users'
  }
}
