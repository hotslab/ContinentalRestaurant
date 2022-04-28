
import { Context } from 'koa'
import Booking from '../models/Booking'

export default {
  index: async (ctx: Context): Promise<any> => {
    ctx.status = 200
    ctx.body = { booking: await Booking.find({}) }
  },
  show: async (ctx: Context): Promise<any> => {
    ctx.status = 200
    ctx.body = { booking: await Booking.findById(ctx.params.id).exec() }
  },
  create: async (ctx: Context): Promise<any> => {

    const booking = new Booking({
      name: ctx.request.body.name,
      surname: ctx.request.body.surname,
      email: ctx.request.body.email,
      people: ctx.request.body.people,
      time: ctx.request.body.time,
      status: ctx.request.body.status,
      table_id: ctx.request.body.table_id,
    })
    await booking.save()
    ctx.status = 200
    ctx.body = { booking: booking, message: 'Booking has been created successfuly' }
  },
  update: async (ctx: Context): Promise<any > => {
    const booking = await Booking.findByIdAndUpdate( ctx.params.idx, { 
      $set: {
        name: ctx.request.body.name,
        surname: ctx.request.body.surname,
        email: ctx.request.body.email,
        people: ctx.request.body.people,
        time: ctx.request.body.time,
        status: ctx.request.body.status,
        table_id: ctx.request.body.table_id,
      }
    })
    await booking.save()
    ctx.status = 200
    ctx.body = { booking: booking, message: 'Booking has been updated succesfully' }
  },
  destroy: async (ctx: Context): Promise<any> => {
    const booking = await Booking.findByIdAndUpdate(ctx.params.idx, { $set: { status: 'canceled' }})
    await booking.save()
    ctx.status = 200
    ctx.body = { message: 'Booking has been canceled successfuly' }
  }
}