
import { Context } from 'koa'
import jsonWebtoken from 'jsonwebtoken'
import argon from 'argon2'
import User from '../models/User'

export default {
  login: async (ctx: Context) => {
    try {
      const user = await User.findOne({ email: ctx.request.body.email }).select('+password')
      if (!user) {
        ctx.status = 401
        ctx.body = { message: "User not found" }
        return
      }
      if (await argon.verify(user.password, ctx.request.body.password)) {
        user.password = null
        ctx.status = 200
        ctx.body = {
          user: user,
          token: jsonWebtoken.sign(
            { data: user }, 
            process.env.JWT_SECRET || 'shared_secret', 
            { expiresIn: process.env.JWT_EXPIRY || '1h' }
          )
        }
      } else {
        ctx.status = 401
        ctx.body = { message: "Password is incorrect" }
      }
    } catch (error: any) {
      ctx.status = error.statusCode || error.status || 500;
      ctx.body = { message: error.message }
    }
  },
  register: async (ctx: Context): Promise<any> => {
    try {
      if (
        !ctx.request.body.email ||
        !ctx.request.body.password ||
        !ctx.request.body.email ||
        !ctx.request.body.name ||
        !ctx.request.body.surname
      ) {
        ctx.status = 400
        ctx.body = { message: 'Please add all the required fields correctly' }
        return
      }
      const user = await User.findOne({ email: ctx.request.body.email })
      if (!user) {
        const user = new User({
          email: ctx.request.body.email,
          name: ctx.request.body.name,
          surname: ctx.request.body.surname,
          role: 'user',
          password: await argon.hash(ctx.request.body.password)
        })
        await user.save()
        ctx.status = 200
        ctx.body = { message: "User registered successfuly" }
      } else {
        ctx.status = 406
        ctx.body = { message: "User already exists" }
      }
    } catch (error: any) {
      ctx.status = error.statusCode || error.status || 500;
      ctx.body = { message: error.message }
    }
  },
  forgotPassword: async (ctx: Context): Promise<any> => {
    try {
      if (!ctx.request.body.email) {
        ctx.status = 400
        ctx.body = { message: 'Email is required' }
        return
      }
      const user = await  User.findOne({ email: ctx.request.body.email }).exec()
      if (user) {
        ctx.status = 200
        ctx.body = { user: user }
      } else {
        ctx.status = 401
        ctx.body = { message: "User not found" }
      }
    } catch (error: any) {
      ctx.status = error.statusCode || error.status || 500;
      ctx.body = { message: error.message }
    }
  },
  resetPassword: async (ctx: Context): Promise<any> => {
    try {
      console.log(ctx.request.body)
      if (!ctx.request.body.password || !ctx.request.body.confirmPassword) {
        ctx.status = 400
        ctx.body = { message: 'Password is required' }
        return
      }
      await User.updateOne(
        { email: ctx.request.body.email }, 
        { $set: {password: await argon.hash(ctx.request.body.password ) } }
      ).exec()
      ctx.status = 200
      ctx.body = { message: `Pasword has been reset for ${ctx.request.body.email} successfuly` }
    } catch (error: any) {
      ctx.status = error.statusCode || error.status || 500;
      ctx.body = { message: error.message }
    }
  },
  index: async (ctx: Context): Promise<any> => {
    try {
      const query = ctx.request.query
      const users = await User.find({
        email: { $regex: new RegExp(`${query?.email}`, 'ig') },
        name: { $regex: new RegExp(`${query?.name}`, 'ig') },
        surname: { $regex: new RegExp(`${query?.surname}`, 'ig') },
        isDeleted: false,
        _id: { $ne: query._id }
      }).exec()
      ctx.status = 200
      ctx.body = { users: users }
    } catch (error: any) {
      ctx.status = error.statusCode || error.status || 500;
      ctx.body = { message: error.message }
    }
  },
  show: async (ctx: Context): Promise<any> => {
    try {
      ctx.status = 200
      ctx.body = { user: await User.findById(ctx.params.id).exec() }
    } catch (error: any) {
      ctx.status = error.statusCode || error.status || 500;
      ctx.body = { message: error.message }
    }
  },
  update: async (ctx: Context): Promise<any> => {
    try {
      const user = await User.findById(ctx.params.id).exec()
      if (user.role == 'manager' && ctx.request.body.role == 'user') {
        const userWithManagerRoles = await User.find({
          role: 'manager',
          isDeleted: false,
          _id: { $ne: ctx.params.id }
        }).exec()
        if (!userWithManagerRoles.length) {
          ctx.status = 400
          ctx.body = { message: 'There should always be at least one manager in the system' }
          return
        } else user.role = ctx.request.body.role
      }
      user.name = ctx.request.body.name
      user.surname = ctx.request.body.surname
      user.email = ctx.request.body.email
      if (ctx.request.body?.password) user.password = await argon.hash(ctx.request.body.password )
      user.save()
      ctx.status = 200
      ctx.body = { user: user }
    } catch (error: any) {
      ctx.status = error.statusCode || error.status || 500;
      ctx.body = { message: error.message }
    }
  },
  destroy: async (ctx: Context): Promise<any> => {
    try {
      await User.findByIdAndUpdate(ctx.params.id, { $set:{ isDeleted: true } }).exec()
      ctx.status = 200
      ctx.body = { message: 'User has been deleted successfuly' }
    } catch (error: any) {
      ctx.status = error.statusCode || error.status || 500;
      ctx.body = { message: error.message }
    }
  }
}
