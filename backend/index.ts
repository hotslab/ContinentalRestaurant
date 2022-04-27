import 'dotenv/config'
import Koa from 'koa'
import logger from 'koa-logger'
import koaBody from 'koa-body'
import responseTime from 'koa-response-time'
import jwt from 'koa-jwt'
import errorHandler from './src/middleware/ErrorHandler'
import router from './src/routes'

const app = new Koa();

const secret = process.env.JWT_SECRET || 'shared_secret'

app.use(logger())
app.use(koaBody())
app.use(responseTime({ hrtime: true }))
app.use(errorHandler)

app.use(jwt({ secret }).unless({
  path: [
    /\//,
    /\/register/, 
    /\/login/
  ],
}))

app.use(router.routes()).use(router.allowedMethods())

app.listen(3000);