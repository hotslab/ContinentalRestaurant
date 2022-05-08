
import 'dotenv/config'
import mongoose from 'mongoose'

const mongoUrl = `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_URL}:${process.env.MONGO_PORT}`
mongoose.connect(mongoUrl, { dbName: process.env.MONGO_TEST_DB })
mongoose.connection.on('error', console.error)