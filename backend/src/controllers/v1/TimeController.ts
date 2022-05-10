import { Context } from 'koa'
import Time from '../../models/v1/Time'
import redis from '../../utils/v1/redis'
import Notification from '../../models/v1/Notification'

function formatedHour(hour: number): string {
  return `${hour < 10 ? `0${hour}:00` : `${hour}:00` } ${hour < 13 ? 'am' : 'pm' }`
}

function displayDaysOpen(days: string[]) {
  let dayList = ''
  for (const [index, day] of days.entries()) dayList += index + 1 == days.length ? `and ${day}` : `${day}, `
  return dayList
}

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
      }, { upsert: true, new: true }).exec()
      let notification = await new Notification({
        type: 'Restaurant opening times have been changed',
        description: `
          Restaurant opening times have been updated from ${formatedHour(data.opening_hour)} to ${formatedHour(data.closing_hour)}, 
          whith it open on ${displayDaysOpen(data.days_open)} every week.
        `,
        created_by: data.creator_email,
        creator_role: data.creator_role,
        receiver_email: 'all',
        receiver_role: 'user',
        received: false,
        content: time,
      })
      await notification.save()
      if (process.env.NODE_ENV == 'production') await redis.publish('notification', JSON.stringify(notification))
      ctx.status = 200
      ctx.body = { time: time }
    } catch (error: any) {
      ctx.status = error.statusCode || error.status || 500;
      ctx.body = { message: error.message }
    }
  }
}