
import { Context } from 'koa'
import Notification from '../../models/v1/Notification'

export default {
  index: async (ctx: Context): Promise<any> => {
    try {
      const query = ctx.request.query
      let emailFilter = query.role == 'manager'
        ? { $regex: '', $options: 'i' }
        : { $in: [ query?.email, 'all' ] }
      const notifications = await Notification.find({
        receiver_email: emailFilter,
        received: false 
      }).sort({created: -1}).exec()
      ctx.status = 200
      ctx.body = { notifications: notifications }
    } catch (error: any) {
      ctx.status = error.statusCode || error.status || 500;
      ctx.body = { message: error.message }
    }
  },
  update: async (ctx: Context): Promise<any> => {
    try {
      const notification = await Notification.findByIdAndUpdate(ctx.params.id, { $set: { received: true } }).exec()
      ctx.status = 200
      ctx.body = { notification: notification }
    } catch (error: any) {
      ctx.status = error.statusCode || error.status || 500;
      ctx.body = { message: error.message }
    }
  }
}