
import { Context } from 'koa'
import Time from '../models/Time'
import redis from '../utils/redis'
import Notification from '../models/Notification'

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
      const data = ctx.request.body
      const time = await Time.findByIdAndUpdate(1, {
        $set: {
          _id: 1,
          opening_hour: data.opening_hour,
          closing_hour: data.closing_hour,
          days_open: data.days_open
        }
      }, { upsert: true, new: true })
      
      const notification = await new Notification({
        type: 'times',
        description: 'updating',
        created_by: data.creator_email,
        creator_role: data.creator_role,
        receiver_email: data.creator_role,
        receiver_role: data.creator_role,
        received: false,
        content: JSON.stringify(time)
      })
      notification.save()
      await redis.publish('notification', JSON.stringify(notification))

      ctx.status = 200
      ctx.body = { time: time }
    } catch (error: any) {
      ctx.status = error.statusCode || error.status || 500;
      ctx.body = { message: error.message }
    }
  }
}