
import { Context } from 'koa'
import moment from 'moment'
import Notification from '../models/Notification'

export default {
  index: async (ctx: Context): Promise<any> => {
    try {
      const query = ctx.request.query
      let emailFilter: Object | string | null | undefined = query.role == 'manager'
        ? { $in: [ query?.email, 'system' ] }
        : query.email
      const notifications = await Notification.find({
        receiver_email: emailFilter,
        received: false 
      }).sort({date: -1, created: -1})
      ctx.status = 200
      ctx.body = { notifications: notifications }
    } catch (error: any) {
      ctx.status = error.statusCode || error.status || 500;
      ctx.body = { message: error.message }
    }
  },
  update: async (ctx: Context): Promise<any> => {
    try {
      const notification = await Notification.findByIdAndUpdate(ctx.params.id, { $set: { received: true } })
      ctx.status = 200
      ctx.body = { notification: notification }
    } catch (error: any) {
      ctx.status = error.statusCode || error.status || 500;
      ctx.body = { message: error.message }
    }
  }
}