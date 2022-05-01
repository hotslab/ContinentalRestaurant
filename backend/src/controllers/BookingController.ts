
import { Context } from 'koa'
import moment from 'moment'
import Booking from '../models/Booking'
import Table from '../models/Table'
import Time from '../models/Time'

async function isWrongTimeInput(ctx: Context): Promise<boolean> {
  const time = await Time.findById(1).exec()
  const isWrongTime = time.opening_hour > ctx.request.body.time && time.closing_hour < ctx.request.body.time
  if (isWrongTime) {
    ctx.status = 401
    ctx.body = { message: `Your booking time is outside of the operating hours of ${time.opening_hour}:00 - ${time.closing_hour}:00` }
  }
  return isWrongTime
}

async function isTableOccupied(ctx: Context): Promise<boolean> {
  const isOccupiedTable = await Booking.findOne({
    table_id: ctx.request.body.table_id, status: 'booked', time: ctx.request.body.time, created: { $eq: moment().format('YYYY-MM-DD') }
  })
  if (isOccupiedTable) {
    ctx.status = 401
    ctx.body = { message: `Your selected table has been booked by someone else. Please try another one.` }
  }
  return isOccupiedTable
} 

async function areTablesAvailableThisHour(ctx: Context): Promise<boolean> {
  const tablesOccupied = await Booking.find({ status: 'booked', time: ctx.request.body.time, created: { $eq: moment().format('YYYY-MM-DD') } })
  const totalTables = await Table.find({})
  return totalTables.length > tablesOccupied.length
}

export default {
  index: async (ctx: Context): Promise<any> => {
    try {
      const bookings = await Booking.find({
        date: { $gte: moment().format('YYYY-MM-DD') },
        hour: { $gte: moment().format('H') }
      })
      ctx.status = 200
      ctx.body = { bookings: bookings }
    } catch (error: any) {
      ctx.status = error.statusCode || error.status || 500;
      ctx.body = { message: error.message }
    }
  },
  show: async (ctx: Context): Promise<any> => {
    try {
      ctx.status = 200
      ctx.body = { booking: await Booking.findById(ctx.params.id).exec() }
    } catch (error: any) {
      ctx.status = error.statusCode || error.status || 500;
      ctx.body = { message: error.message }
    }
  },
  create: async (ctx: Context): Promise<any> => {
    try {
      if (await isWrongTimeInput(ctx)) return
      if (await isTableOccupied(ctx)) return
      const areTablesAvailable = await areTablesAvailableThisHour(ctx)
      const booking = new Booking({
        name: ctx.request.body.name,
        surname: ctx.request.body.surname,
        email: ctx.request.body.email,
        people: ctx.request.body.people,
        date: ctx.request.body.date,
        hour: ctx.request.body.hour,
        status: areTablesAvailable ? 'booked' : 'queued',
        table_id: ctx.request.body.table_id
      })
      booking.save()
      ctx.status = 200
      ctx.body = { 
        booking: booking, 
        message: areTablesAvailable 
          ? 'Your booking has been created successfuly' 
          : `All tables are currently booked for this hour ${ctx.request.body.time}. Your 
            booking has been added to a waiting list should a slot open, otherwise you 
            will be automaticaly booked for ${ctx.request.body.time + 1} if tables are available`
      }
    } catch (error: any) {
      ctx.status = error.statusCode || error.status || 500;
      ctx.body = { message: error.message }
    }
  },
  update: async (ctx: Context): Promise<any > => {
    try {
      const booking = await Booking.findByIdAndUpdate( ctx.params.idx, { 
        $set: {
          name: ctx.request.body.name,
          surname: ctx.request.body.surname,
          email: ctx.request.body.email,
          people: ctx.request.body.people
        }
      })
      ctx.status = 200
      ctx.body = { booking: booking, message: 'Booking has been updated succesfully' }
    } catch (error: any) {
      ctx.status = error.statusCode || error.status || 500;
      ctx.body = { message: error.message }
    }
  },
  destroy: async (ctx: Context): Promise<any> => {
    try {
      const booking = await Booking.findByIdAndUpdate(ctx.params.idx, { $set: { status: 'canceled' }})
      await booking.save()
      ctx.status = 200
      ctx.body = { message: 'Booking has been canceled successfuly' }
    } catch (error: any) {
      ctx.status = error.statusCode || error.status || 500;
      ctx.body = { message: error.message }
    }
  }
}