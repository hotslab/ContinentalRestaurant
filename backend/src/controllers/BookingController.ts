import { TimeInterface } from './../models/Time';
import { TableInterface } from './../models/Table';
import { BookingInterface } from './../models/Booking'
import { Context } from 'koa'
import moment from 'moment'
import Booking from '../models/Booking'
import Notification from '../models/Notification'
import Table from '../models/Table'
import Time from '../models/Time'
import redis from '../utils/redis'

async function areTablesAvailableThisHour(ctx: Context): Promise<boolean> {
  const tablesOccupied: BookingInterface[] = await Booking.find({ 
    status: 'booked', hour: ctx.request.body.hour, date: ctx.request.body.date 
  }).exec()
  const totalTables: TableInterface[] = await Table.find({}).exec()
  return totalTables.length > tablesOccupied.length
}

function formatedHour(hour: number): string {
  return `${hour < 10 ? `0${hour}:00` : `${hour}:00` } ${hour < 13 ? 'am' : 'pm' }`
}

export default {
  index: async (ctx: Context): Promise<void> => {
    try {
      const query = ctx.request.query
      let queryData = {
        email: { $regex: new RegExp(`${query.email}`, 'ig') },
        date: { $gte: moment().format('YYYY-MM-DD') },
        hour: { $gte: moment().format('H') },
        status: { $in: ['queued', 'booked'] }
      }
      const bookings = await Booking.find(queryData).populate('table').sort({date: -1, updated: -1}).exec()
      ctx.status = 200
      ctx.body = { bookings: bookings }
    } catch (error: any) {
      ctx.status = error.statusCode || error.status || 500;
      ctx.body = { message: error.message }
    }
  },
  show: async (ctx: Context): Promise<void> => {
    try {
      ctx.status = 200
      ctx.body = { booking: await Booking.findById(ctx.params.id).populate('table').exec() }
    } catch (error: any) {
      ctx.status = error.statusCode || error.status || 500;
      ctx.body = { message: error.message }
    }
  },
  create: async (ctx: Context): Promise<void> => {
    try {
      const data: any = ctx.request.body
      const time: TimeInterface = await Time.findById(1).exec()
      const isWrongOpeningTimeSelected = time.opening_hour > data.hour && time.closing_hour < data.hour
      if (isWrongOpeningTimeSelected) {
        ctx.status = 401
        ctx.body = { 
          message: `Your booking time is outside of the operating hours of 
          ${formatedHour(time.opening_hour)} - ${formatedHour(time.closing_hour)}` 
        }
        return
      }
      const areTablesAvailable = await areTablesAvailableThisHour(ctx)
      if (areTablesAvailable) {
        const isOccupiedTable: BookingInterface[] = await Booking.find({
          table: data.table, 
          status: 'booked', 
          hour: data.hour, 
          date: data.date
        }).exec()
        if (isOccupiedTable.length) {
            ctx.status = 401
            ctx.body = { 
              message: isOccupiedTable.find(booking => booking.email == data.email)
                ? `You are already booked for this table at this time slot`
                : `Your selected table has been booked by someone else for this hour. Please try another one.`
            }
            return        
        }
      }
      const booking = new Booking({
        name: data.name,
        surname: data.surname,
        email: data.email,
        people: data.people,
        date: data.date,
        hour: data.hour,
        status: areTablesAvailable ? 'booked' : 'queued',
        table: data.table
      })
      await booking.save()
      const bookingPopulated: BookingInterface = await Booking.findById(booking._id).populate('table').exec()
      const notification = await new Notification({
        type: 'booking',
        description: `
          New booking created for table ${bookingPopulated.table.name} on ${bookingPopulated.date} at
          ${formatedHour(bookingPopulated.hour)} with ${bookingPopulated.people} people attending.
        `,
        created_by: data.creator_email,
        creator_role: data.creator_role,
        receiver_email: data.creator_role == 'manager' ? data.email : null,
        receiver_role: data.creator_role == 'manager' ? 'user' : 'manager', 
        received: false,
        content: bookingPopulated
      })
      await notification.save()
      await redis.publish('notification', JSON.stringify(notification))

      ctx.status = 200
      ctx.body = { 
        booking: bookingPopulated, 
        message: areTablesAvailable 
          ? 'Your booking has been created successfuly' 
          : `All tables are currently booked for this hour of ${formatedHour(data.hour)}. Your 
            booking has been added to a waiting list should a slot open for this specific hour, otherwise you 
            will be automaticaly booked at any hour starting from ${formatedHour(data.hour)} 
            to close depending if tables are available`
      }
    } catch (error: any) {
      ctx.status = error.statusCode || error.status || 500;
      ctx.body = { message: error.message }
    }
  },
  update: async (ctx: Context): Promise<void> => {
    try {
      const data: any = ctx.request.body
      const time: TimeInterface = await Time.findById(1).exec()
      const isWrongOpeningTimeSelected = time.opening_hour > data.hour && time.closing_hour < data.hour
      if (isWrongOpeningTimeSelected) {
        ctx.status = 401
        ctx.body = { 
          message: `Your booking time is outside of the operating hours of 
          ${formatedHour(time.opening_hour)} - ${formatedHour(time.closing_hour)}` 
        }
        return
      }
      const areTablesAvailable = await areTablesAvailableThisHour(ctx)
      if (areTablesAvailable) {
        const isOccupiedTable: BookingInterface[] = await Booking.find({
          table: data.table, 
          status: 'booked', 
          hour: data.hour, 
          date: data.date
        }).exec()
        if (isOccupiedTable.length) {
            ctx.status = 401
            ctx.body = { 
              message: isOccupiedTable.find(booking => booking.email == data.email)
                ? `You are already booked for this table at this time slot`
                : `Your selected table has been booked by someone else for this hour. Please try another one.`
            }
            return        
        }
      }
      await Booking.findByIdAndUpdate(ctx.params.id, { 
        $set: {
          name: data.name,
          surname: data.surname,
          email: data.email,
          people: data.people,
          date: data.date,
          hour: data.hour,
          status: areTablesAvailable ? 'booked' : 'queued',
          table: data.table
        }
      }).exec()
      const bookingPopulated: BookingInterface = await Booking.findById(ctx.params.id).populate('table').exec()
      const notification = await new Notification({
        type: 'booking',
        description: `
          Booking details updated for table ${bookingPopulated.table.name} on ${bookingPopulated.date} at
          ${formatedHour(bookingPopulated.hour)} with ${bookingPopulated.people} people attending.
        `,
        created_by: data.creator_email,
        creator_role: data.creator_role,
        receiver_email: data.creator_role == 'manager' ? data.email : 'system',
        receiver_role: data.creator_role == 'manager' ? 'user' : 'manager', 
        received: false,
        content: JSON.stringify(bookingPopulated)
      })
      await notification.save()
      await redis.publish('notification', JSON.stringify(notification))
      ctx.status = 200
      ctx.body = { booking: bookingPopulated, message: 'Booking has been updated succesfully' }
    } catch (error: any) {
      ctx.status = error.statusCode || error.status || 500;
      ctx.body = { message: error.message }
    }
  },
  destroy: async (ctx: Context): Promise<void> => {
    try {
      const query = ctx.request.query
      const booking = await Booking.findByIdAndUpdate(ctx.params.id, { $set: { status: 'cancelled' }}).exec()
      await booking.save()
      const bookingPopulated: BookingInterface = await Booking.findById(ctx.params.id).populate('table').exec()
      const notification = await new Notification({
        type: 'booking',
        description: 'updating',
        created_by: query.creator_email,
        creator_role: query.creator_role,
        receiver_email: query.creator_role,
        receiver_role: query.creator_role,
        received: false,
        content: JSON.stringify(bookingPopulated)
      })
      notification.save()
      await redis.publish('notification', JSON.stringify(notification))

      ctx.status = 200
      ctx.body = { message: 'Booking has been cancelled successfuly' }
    } catch (error: any) {
      ctx.status = error.statusCode || error.status || 500;
      ctx.body = { message: error.message }
    }
  }
}