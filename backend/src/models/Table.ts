import mongoose, { Schema } from 'mongoose'

// To fix https://github.com/Automattic/mongoose/issues/4291
mongoose.Promise = global.Promise;

const TableSchema = new Schema({
  name: { type: String, required: true, unique: true },
  isDeleted: { type: Boolean, default: false },
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now }
}, { collection: 'tables' })

export default mongoose.model('Table', TableSchema)