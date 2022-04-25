import Koa from 'koa'
import logger from 'koa-logger'
import koaBody from 'koa-body'
import responseTime from 'koa-response-time'
import router from './src/routes'

const app = new Koa();

app.use(logger())
app.use(koaBody())
app.use(responseTime({ hrtime: true }))
app.use(router.routes()).use(router.allowedMethods())

app.listen(3000);