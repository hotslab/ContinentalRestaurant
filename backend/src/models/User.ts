import mongoose, { Schema } from 'mongoose'
import moment from 'moment'

export interface UserInterface {
  _id: string,
  name: string | null,
  surname: string | null,
  email: string | null,
  role: string | null,
  password: string | null,
  isDeleted: string | null,
  created: Date | null,
  updated: Date | null
}

// To fix https://github.com/Automattic/mongoose/issues/4291
mongoose.Promise = global.Promise;

const UserSchema = new Schema({
  name: { type: String, required: true },
  surname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['user', 'manager'], required: true },
  password: { type: String, select: false, required: false },
  isDeleted: { type: Boolean, default: false },
  created: { type: Date, default: Date.now() },
  updated: { type: Date, default: Date.now() }
}, { collection: 'users' })

export default mongoose.model('User', UserSchema)