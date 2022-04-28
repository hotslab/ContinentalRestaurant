import mongoose, { Schema } from 'mongoose'
import moment from 'moment'

// To fix https://github.com/Automattic/mongoose/issues/4291
mongoose.Promise = global.Promise;

const UserSchema = new Schema({
  name: { type: String, required: true },
  surname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['user', 'manager'], required: true },
  password: { type: String, select: false, required: false },
  isDeleted: { type: Boolean, default: false },
  created: { type: Date, default: moment().format('YYYY-MM-DD HH:mm:ss') },
  updated: { type: Date, default: moment().format('YYYY-MM-DD HH:mm:ss') }
}, { collection: 'users' })

export default mongoose.model('User', UserSchema)