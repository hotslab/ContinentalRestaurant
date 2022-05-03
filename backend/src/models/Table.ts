import mongoose, { Schema } from 'mongoose'
import '../utils/timezone'

// To fix https://github.com/Automattic/mongoose/issues/4291
mongoose.Promise = global.Promise;

const TableSchema = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  isDeleted: { type: Boolean, default: false },
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now }
}, { collection: 'tables' })

export default mongoose.model('Table', TableSchema)

export const TableModel = { Table: TableSchema }