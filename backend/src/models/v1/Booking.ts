import mongoose, { Schema } from 'mongoose'
import { TableInterface } from '../v1/Table'

export interface BookingInterface {
  _id: string,
  name: string,
  surname: string,
  email: string,
  people: number,
  date: string,
  hour: number,
  status: string,
  table: TableInterface,
  created: Date,
  updated: Date
}

// To fix https://github.com/Automattic/mongoose/issues/4291
mongoose.Promise = global.Promise;

const BookingSchema = new Schema({
  name: { type: String, required: true },
  surname: { type: String, required: true },
  email: { type: String, required: true },
  people: { type: Number, required: true },
  date: { type: Date, required: true },
  hour: {type: Number, required: true },
  status: { type: String, enum: ['booked', 'cancelled', 'queued', 'closed'] },
  table: { type: Schema.Types.ObjectId, ref: 'Table' },
  created: { type: Date, default: Date.now() },
  updated: { type: Date, default: Date.now() }
}, { collection: 'bookings' })

export default mongoose.model('Booking', BookingSchema)