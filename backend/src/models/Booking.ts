import mongoose, { Schema } from 'mongoose'

// To fix https://github.com/Automattic/mongoose/issues/4291
mongoose.Promise = global.Promise;

const BookingSchema = new Schema({
  name: { type: String, required: true },
  surname: { type: String, required: true },
  email: { type: String, required: true },
  people: { type: Number, required: true },
  time: {type: String, required: true },
  status: { type: String, enum: ['active', 'canceled', 'queued', 'closed'] },
  table_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Table' },
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now }
}, { collection: 'bookings' })

export default mongoose.model('Booking', BookingSchema)