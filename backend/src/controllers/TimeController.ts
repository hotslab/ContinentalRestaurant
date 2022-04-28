
import { Context } from 'koa'
import Time from '../models/Time'

export default {
  show: async (ctx: Context): Promise<any> => {
    ctx.status = 200
    ctx.body = { time: await Time.findById(1).exec() }
  },
  createOrUpdate: async (ctx: Context): Promise<any> => {
    const options = { upsert: true, new: true }
    const query = {
      $set: {
        _id: 1,
        opening_hour: ctx.request.body.opening_hour,
        closing_hour: ctx.request.body.closing_hour
      }
    }
    ctx.status = 200
    ctx.body = { time: await Time.findByIdAndUpdate(1, query, options) }
  }
}