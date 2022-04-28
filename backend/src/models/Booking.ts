import mongoose, { Schema } from 'mongoose'
import moment from 'moment'

// To fix https://github.com/Automattic/mongoose/issues/4291
mongoose.Promise = global.Promise;

const BookingSchema = new Schema({
  name: { type: String, required: true },
  surname: { type: String, required: true },
  email: { type: String, required: true },
  people: { type: Number, required: true },
  time: {type: Number, required: true },
  status: { type: String, enum: ['booked', 'canceled', 'queued'] },
  table_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Table' },
  created: { type: Date, default: moment().format('YYYY-MM-DD HH:mm:ss') },
  updated: { type: Date, default: moment().format('YYYY-MM-DD HH:mm:ss') }
}, { collection: 'bookings' })

export default mongoose.model('Booking', BookingSchema)