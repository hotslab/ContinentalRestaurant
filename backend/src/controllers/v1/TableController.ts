import { Context } from 'koa'
import Table from '../../models/v1/Table'
import Booking from '../../models/v1/Booking'
import moment from 'moment'

interface TableTimeSlot {
  bookings: any[],
  queued: number,
  booked: number,
  hour: number,
  time_range: string,  
  table: string
}

async function structedTableTimeSlotData(queryParams: any, hour: number): Promise<TableTimeSlot> {
  const bookings = await Booking.find({
    table: queryParams.tableId,
    status: { $in: [ "queued", "booked" ] },
    date: queryParams.date,
    hour: hour
  }).exec()
  const startHour = hour == 24 ? '00:00' : (hour < 10 ? `0${hour}:00` : `${hour}:00`)
  const endHour = (hour + 1) == 24 ? '00:00' : ( (hour + 1) == 25 ? '01:00' : ((hour + 1) < 10 ? `0${(hour + 1)}:00` : `${(hour + 1)}:00`))
  return { 
    bookings: bookings,
    queued: bookings.filter(e => e.status == 'queued').length,
    booked:bookings.filter(e => e.status == 'booked').length,
    hour: hour,
    time_range: `${startHour} - ${endHour}`,  
    table: queryParams.tableId
  }
}

export default {
  index: async (ctx: Context) => {
    try {
      ctx.status = 200
      ctx.body = { tables: await Table.find({isDeleted: false}).sort({created: -1}).exec() }
    } catch (error: any) {
      ctx.status = error.statusCode || error.status || 500;
      ctx.body = { message: error.message }
    }
  },
  create: async (ctx: Context): Promise<any> => {
    try {
      const table = new Table({
        name: ctx.request.body.name,
        description: ctx.request.body.description 
      })
      await table.save()
      const newTable = await Table.findById(await table._id)
      console.log(
        newTable, 
        process.env.NODE_ENV, 
        process.env.MONGO_TEST_DB
      )
      ctx.status = 200
      ctx.body = { 
        message: 'Table created successfully',
        table: newTable
      }
    } catch (error: any) {
      ctx.status = error.statusCode || error.status || 500;
      ctx.body = { message: error.message }
    }
  },
  update: async (ctx: Context): Promise<any> => {
    try {
      ctx.status = 200
      ctx.body = { 
        message: 'Table created successfully',
        table: await Table.findByIdAndUpdate(ctx.params.id, { $set: {
          name: ctx.request.body.name,
          description: ctx.request.body.description 
        }}).exec()
      }
    } catch (error: any) {
      ctx.status = error.statusCode || error.status || 500;
      ctx.body = { message: error.message }
    }
  },
  destroy: async (ctx: Context): Promise<any> => {
    try {
      const currentBookings = await Booking.find({
        table: ctx.params.id, 
        date: { $gte: moment().format('YYYY-MM-DD') },
        hour: { $gte: moment().format('H') },
        status: { $in: ['queued', 'booked'] }
      })
      if (currentBookings.length) {
        ctx.status = 400
        ctx.body = { message: 'There are current bookings associated with this table' }
        return
      }
      await Table.findByIdAndUpdate(ctx.params.id, { $set: { isDeleted: true } }).exec()
      ctx.status = 200
      ctx.body = { message: 'Table deleted successfuly' }
    } catch (error: any) {
      ctx.status = error.statusCode || error.status || 500;
      ctx.body = { message: error.message }
    }
  },
  getTableTimeSlots: async (ctx: Context): Promise<void> => {
    try {
      const req: any = ctx.request.query
      if ((new Date((new Date()).setHours(0,0,0,0))).getTime() > (new Date(req.date)).getTime()) {
        ctx.status = 400
        ctx.body = { message: `The date of ${req.date} you have selected has already passed. Please choose a current date` }
        return
      }
      let tableTimeSlots: Array<TableTimeSlot | []> = []
      for (let index = (req.openingHour - 1); index < req.closingHour; index++) {
        const hour = index + 1
        if (req.date == moment().format('YYYY-MM-DD')) {
          if (hour > parseInt(moment().format('H'))) tableTimeSlots.push(await structedTableTimeSlotData(req, hour))
        } else tableTimeSlots.push(await structedTableTimeSlotData(req, hour))
      }
      ctx.status = 200
      ctx.body = { tableTimeSlotsToday: tableTimeSlots }
    } catch (error: any) {
      ctx.status = error.statusCode || error.status || 500;
      ctx.body = { message: error.message }
    }
  }
}