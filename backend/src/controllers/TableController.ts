import { Context } from 'koa'
import Table from '../models/Table'
import Booking from '../models/Booking'
import moment from 'moment'

export default {
  index: async (ctx: Context) => {
    try {
      ctx.status = 200
      ctx.body = { tables: await Table.find({}).sort({created: -1}) }
    } catch (error: any) {
      ctx.status = error.statusCode || error.status || 500;
      ctx.body = { message: error.message }
    }
  },
  show:async (ctx: Context) => {
    //
  },
  create: async (ctx: Context): Promise<any> => {
    try {
      const table = new Table({
        name: ctx.request.body.name,
        description: ctx.request.body.description 
      })
      ctx.status = 200
      ctx.body = { 
        message: 'Table created succssfully',
        table: await table.save()
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
        message: 'Table created succssfully',
        table: await Table.findByIdAndUpdate(ctx.params.id, { 
          name: ctx.request.body.name,
          description: ctx.request.body.description 
        })
      }
    } catch (error: any) {
      ctx.status = error.statusCode || error.status || 500;
      ctx.body = { message: error.message }
    }
  },
  destroy: async (ctx: Context): Promise<any> => {
    try {
      await Table.findByIdAndUpdate(ctx.params.id, { isDeleted: true })
      ctx.status = 200
      ctx.body = { message: 'Table deleted successfuly' }
    } catch (error: any) {
      ctx.status = error.statusCode || error.status || 500;
      ctx.body = { message: error.message }
    }
  }
}