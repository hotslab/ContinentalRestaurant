import { Context } from 'koa'
import Table from '../models/Table'
import Booking from '../models/Booking'
import moment from 'moment'

export default {
  index: async (ctx: Context) => {
    ctx.status = 200
    const tables = await Table.find({})
    const availableTables = tables.filter(async (e) => {
      const currentBooking = await Booking.findOne({
        table_id: e._id, status: 'booked', time: moment().format('H')
      })
      return currentBooking ? false : true
    })
    ctx.body = { tables: availableTables }
  },
  createOrUpdate: async (ctx: Context): Promise<any> => {
    const options = { upsert: true, new: true }
    const query = { $set: { name: ctx.request.body.name } }
    ctx.status = 200
    ctx.body = { 
      message: 'Table created succssfully',
      table: await Table.findOneAndUpdate({ name: ctx.request.body.old_name }, query, options) 
    }
  },
  destroy: async (ctx: Context): Promise<any> => {
    await Table.findByIdAndUpdate(ctx.params.id, { isDeleted: true })
    ctx.status = 200
    ctx.body = { message: 'Table deleted successfuly' }
  }
}