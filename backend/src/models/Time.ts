import mongoose, { Schema } from 'mongoose'
import moment from 'moment'

// To fix https://github.com/Automattic/mongoose/issues/4291
mongoose.Promise = global.Promise;

const TimeSchema = new Schema({
  _id: {type: Number, default: 1, required: true },
  opening_hour: { type: Number, default: 8 },
  closing_hour: { type: Number, default: 18 },
  days_open: { type: Array, default: []}, 
  created: { type: Date, default: moment().format('YYYY-MM-DD HH:mm:ss') },
  updated: { type: Date, default: moment().format('YYYY-MM-DD HH:mm:ss') }
}, { collection: 'times' })

export default mongoose.model('Time', TimeSchema)