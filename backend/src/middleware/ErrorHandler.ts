import Koa, { Context } from 'koa'

export default (ctx: Context, next: Koa.Next) => {
  return next().catch((err) => {
    if (err.status === 401) {
      ctx.status = 401;
      ctx.body = {
        error: err.originalError ? err.originalError.message : err.message,
      };
    } else {
      throw err
    }
  });
}
