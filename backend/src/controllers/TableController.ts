import { Context } from 'koa'
import Table from '../models/Table'

export default {
  index: async (ctx: Context) => {
    ctx.status = 200
    ctx.body = { tables: await Table.find({}) }
  },
  createOrUpdate: async (ctx: Context): Promise<any> => {
    const options = { upsert: true, new: true }
    const query = { $set: { name: ctx.request.body.name } }
    ctx.status = 200
    ctx.body = { table: await Table.findOneAndUpdate({ name: ctx.request.body.old_name }, query, options) }
  },
  destroy: async (ctx: Context): Promise<any> => {
    await Table.findByIdAndUpdate(ctx.params.id, { isDeleted: true })
    ctx.status = 200
    ctx.body = { message: 'Table deleted successfuly' }
  }
}