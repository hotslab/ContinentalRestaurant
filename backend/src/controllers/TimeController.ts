
import { Context } from 'koa'
import Time from '../models/Time'

export default {
  show: async (ctx: Context): Promise<any> => {
    try {
      ctx.status = 200
      ctx.body = { time: await Time.findById(1).exec() }
    } catch (error: any) {
      ctx.status = error.statusCode || error.status || 500;
      ctx.body = { message: error.message }
    }
  },
  createOrUpdate: async (ctx: Context): Promise<any> => {
    try {
      const options = { upsert: true, new: true }
      const query = {
        $set: {
          _id: 1,
          opening_hour: ctx.request.body.opening_hour,
          closing_hour: ctx.request.body.closing_hour,
          days_open: ctx.request.body.days_open
        }
      }
      ctx.status = 200
      ctx.body = { time: await Time.findByIdAndUpdate(1, query, options) }
    } catch (error: any) {
      ctx.status = error.statusCode || error.status || 500;
      ctx.body = { message: error.message }
    }
  }
}