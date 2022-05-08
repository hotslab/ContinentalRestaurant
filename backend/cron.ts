import 'dotenv/config'
import  cron from 'node-cron'
import mongoose from 'mongoose'
import BookingReAssignment from './src/jobs/BookingReAssignment'
import CloseExpiredBookings from './src/jobs/CloseExpiredBookings'

const mongoUrl = `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_URL}:${process.env.MONGO_PORT}`
mongoose.connect(mongoUrl, { dbName: process.env.MONGO_DB })
mongoose.connection.on('error', console.error)

// cron runs every 2 minutes
cron.schedule("*/2 * * * *", async () => await BookingReAssignment())

//
cron.schedule("*/2 * * * *", async () => await CloseExpiredBookings())