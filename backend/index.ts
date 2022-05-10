import 'dotenv/config'
import Koa from 'koa'
import logger from 'koa-logger'
import koaBody from 'koa-body'
import responseTime from 'koa-response-time'
import jwt from 'koa-jwt'
import mongoose from 'mongoose'
import cors from '@koa/cors'
import errorHandler from './src/middleware/v1/ErrorHandler'
import router from './src/routes/v1'
import './src/utils/v1/timezone'

const mongoUrl = `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_URL}:${process.env.MONGO_PORT}`
mongoose.connect(mongoUrl, { dbName: process.env.NODE_ENV == 'production' ? process.env.MONGO_DB : process.env.MONGO_TEST_DB })
mongoose.connection.on('error', console.error)

const app = new Koa();

app.use(logger())
app.use(koaBody())
app.use(responseTime({ hrtime: true }))
app.use(errorHandler)
app.use(cors())

app.use( jwt({ secret: `${process.env.JWT_SECRET}` }).unless({ path: [ '/', /\/v1\/public/ ] }) )

app.use(router.routes()).use(router.allowedMethods())

const port = process.env.NODE_ENV == 'production' ? process.env.KOA_SERVER_PORT : process.env.KOA_TEST_SERVER_PORT
app.listen(port, () => console.log(`server started on port ${port}`))