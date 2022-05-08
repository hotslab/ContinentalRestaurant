import mongoose, { Schema } from 'mongoose'

export interface TimeInterface {
  _id: string | null,
  opening_hour: number,
  closing_hour: number,
  days_open: Array<string> | [],
  created: Date,
  updated: Date
}

// To fix https://github.com/Automattic/mongoose/issues/4291
mongoose.Promise = global.Promise;

const TimeSchema = new Schema({
  _id: {type: Number, default: 1, required: true },
  opening_hour: { type: Number, default: 8 },
  closing_hour: { type: Number, default: 18 },
  days_open: { type: Array, default: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']}, 
  created: { type: Date, default: Date.now() },
  updated: { type: Date, default: Date.now() }
}, { collection: 'times' })

export default mongoose.model('Time', TimeSchema)