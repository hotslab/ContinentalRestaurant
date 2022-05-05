import 'dotenv/config'
import Koa from 'koa'
import logger from 'koa-logger'
import koaBody from 'koa-body'
import responseTime from 'koa-response-time'
import jwt from 'koa-jwt'
import errorHandler from './src/middleware/ErrorHandler'
import router from './src/routes'
import mongoose from 'mongoose'
import cors from '@koa/cors'
import './src/utils/timezone'

const mongoUrl = `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_URL}:${process.env.MONGO_PORT}`
mongoose.connect(mongoUrl, { dbName: process.env.MONGO_DB })
mongoose.connection.on('error', console.error)

const app = new Koa();

app.use(logger())
app.use(koaBody())
app.use(responseTime({ hrtime: true }))
app.use(errorHandler)
app.use(cors())

app.use(jwt({ secret: `${process.env.JWT_SECRET}` })
.unless({
  path: [
    /\/login/,
    /\/register/, 
    /\/forgot-password/,
    /\/reset-password/,
    /\/tables/,
    /\/times/
  ],
})
)

app.use(router.routes()).use(router.allowedMethods())

app.listen(process.env.KOA_SERVER_PORT, () => console.log(`server started on port ${process.env.KOA_SERVER_PORT}`))