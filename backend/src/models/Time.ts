import mongoose, { Schema } from 'mongoose'

// To fix https://github.com/Automattic/mongoose/issues/4291
mongoose.Promise = global.Promise;

const TimeSchema = new Schema({
  _id: {type: Number, default: 1, required: true },
  opening_hour: { type: String, default: '8:00' },
  closing_hour: { type: String, default: '18:00' },
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now }
}, { collection: 'times' })

export default mongoose.model('Time', TimeSchema)