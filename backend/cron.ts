import 'dotenv/config'
import './src/utils/v1/timezone'
import  cron from 'node-cron'
import mongoose from 'mongoose'
import BookingReAssignment from './src/jobs/v1/BookingReAssignment'
import CloseExpiredBookings from './src/jobs/v1/CloseExpiredBookings'

const mongoUrl = `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_URL}:${process.env.MONGO_PORT}`
mongoose.connect(mongoUrl, { dbName: process.env.MONGO_DB })
mongoose.connection.on('error', console.error)

// cron runs every 2 minutes
cron.schedule("*/2 * * * *", async () => await BookingReAssignment())

// cron runs every 30 minutes
cron.schedule("*/30 * * * *", async () => await CloseExpiredBookings())