import mongoose, { Schema } from 'mongoose'
// import '../utils/timezone'
// import moment from 'moment'
export interface NotificationInterface {
  _id: string,
  type: string,
  description: string,
  created_by: string,
  creator_role: string,
  receiver_email: string,
  receiver_role: string,
  received: string,
  content: string,
  created:  Date
  updated: Date
}

// To fix https://github.com/Automattic/mongoose/issues/4291
mongoose.Promise = global.Promise

const NotificationSchema = new Schema({
  type: {type: String, required: true},
  description: {type: String, required: true},
  created_by: {type: String, default: 'system' },
  creator_role: {type: String, default: 'system' },
  receiver_email: {type: String, default: 'system' },
  receiver_role: {type: String, default: 'system' },
  received: {type: String, default: false },
  content: {type: String, required: true },
  created: { type: Date, default: Date.now() },
  updated: { type: Date, default: Date.now() }
}, { collection: 'notifications' })

export default mongoose.model('Notification', NotificationSchema)