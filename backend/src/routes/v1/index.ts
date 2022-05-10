import Router from '@koa/router'
import AuthentificationController from '../../controllers/v1/AuthentificationController'
import BookingController from '../../controllers/v1/BookingController'
import TimeController from '../../controllers/v1/TimeController'
import TableController from '../../controllers/v1/TableController'
import NotificationController from '../../controllers/v1/NotificationController'

const router = new Router()

// base route
router.get('/', (ctx) => {
  ctx.status = 200
  ctx.body = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            background-color: teal;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-direction: column;
          }
          h1 {
            color: white;
            text-align: center;
          }
          p {
            font-family: verdana;
            font-size: 20px;
            color: white;
          }
        </style>
      </head>
      <body>
        <h1>The Continental Restaurant</h1>
        <p>Welcome to the backend</p>
      </body>
    </html>
  `
})

// authentification
router.post('/v1/public/login', AuthentificationController.login)
router.post('/v1/public/register', AuthentificationController.register)
router.post('/v1/public/forgot-password', AuthentificationController.forgotPassword)
router.put('/v1/public/reset-password', AuthentificationController.resetPassword)

// users
router.get('/v1/api/users', AuthentificationController.index)
router.get('/v1/api/users/:id', AuthentificationController.show)
router.put('/v1/api/users/:id', AuthentificationController.update)
router.del('/v1/api/users/:id', AuthentificationController.destroy)

// time
router.get('/v1/public/times', TimeController.show)
router.post('/v1/api/times', TimeController.createOrUpdate)

// table
router.get('/v1/public/tables', TableController.index)
router.post('/v1/api/tables', TableController.create)
router.put('/v1/api/tables/:id', TableController.update)
router.del('/v1/api/tables/:id', TableController.destroy)
router.get('/v1/public/table-time-slots', TableController.getTableTimeSlots)

// booking
router.get('/v1/public/bookings', BookingController.index)
router.get('/v1/public/bookings/:id', BookingController.show)
router.post('/v1/public/bookings', BookingController.create)
router.put('/v1/public/bookings/:id', BookingController.update)
router.del('/v1/public/bookings/:id', BookingController.destroy)

// notification
router.get('/v1/public/notifications', NotificationController.index)
router.put('/v1/public/notifications/:id', NotificationController.update)

export default router