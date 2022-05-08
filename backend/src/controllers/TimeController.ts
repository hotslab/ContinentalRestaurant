import { Context } from 'koa'
import Time from '../models/Time'
import redis from '../utils/redis'
import dbTimeFormat from '../utils/dbTimeFormat'
import Notification from '../models/Notification'

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
        type: 'times',
        description: `
          Restaurant opening times have been updated from ${formatedHour(data.opening_hour)} to ${formatedHour(data.closing_hour)}, 
          whith it open on ${displayDaysOpen(data.days_open)} every week.
        `,
        created_by: data.creator_email,
        creator_role: data.creator_role,
        receiver_email: data.creator_role,
        receiver_role: data.creator_role,
        received: false,
        content: time,
        offset: new Date().getTimezoneOffset()
      })
      await notification.save()

      console.log('FIRST', notification)
      notification = dbTimeFormat(notification)
      console.log('SECOND', notification)

      await redis.publish('notification', JSON.stringify(notification))

      ctx.status = 200
      ctx.body = { time: time }
    } catch (error: any) {
      ctx.status = error.statusCode || error.status || 500;
      ctx.body = { message: error.message }
    }
  }
}