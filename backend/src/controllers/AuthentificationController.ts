
import Koa, { Context } from 'koa'

interface User { id: number; name: string }
type Users = User[];

let users: Users = [
    {id: 1, name: 'ron'}, 
    {id: 2, name: 'jack'}
]

export default {
  hello: (ctx: Context, next: Koa.Next): any  => {
    console.log('CHECKING 1')
    ctx.body = 'AGAIN'
  },
  getUsers: (ctx: Context, next: Koa.Next): any => {
    console.log('CHECKING 2')
    ctx.body = users
  },
  getUser: (ctx: Context, next: Koa.Next): any => {
    console.log('CHECKING 3')
    ctx.body =  users.find(e => e.id == ctx.params.id) || null
  }
}
