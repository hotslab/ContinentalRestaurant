import mongoose, { Schema } from 'mongoose'
import moment from 'moment'

// To fix https://github.com/Automattic/mongoose/issues/4291
mongoose.Promise = global.Promise;

const TableSchema = new Schema({
  name: { type: String, required: true, unique: true },
  isDeleted: { type: Boolean, default: false },
  created: { type: Date, default: moment().format('YYYY-MM-DD HH:mm:ss') },
  updated: { type: Date, default: moment().format('YYYY-MM-DD HH:mm:ss') }
}, { collection: 'tables' })

export default mongoose.model('Table', TableSchema)