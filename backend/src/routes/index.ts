import Router from '@koa/router'
import AuthentificationController from '../controllers/AuthentificationController'
import BookingController from '../controllers/BookingController'
import TimeController from '../controllers/TimeController'
import TableController from '../controllers/TableController'

const router = new Router()

// user
router.post('/login', AuthentificationController.login)
router.post('/register', AuthentificationController.register)
router.post('/forgot-password', AuthentificationController.forgotPassword)
router.put('/reset-password', AuthentificationController.resetPassword)
router.get('/users', AuthentificationController.index)
router.get('/users/:id', AuthentificationController.show)
router.del('/users/:id', AuthentificationController.destroy)

// time
router.get('/times', TimeController.show)
router.post('/times', TimeController.createOrUpdate)

// table
router.get('/tables', TableController.index)
router.post('/tables', TableController.createOrUpdate)
router.del('/tables/:id', TableController.destroy)

// booking
router.get('/bookings', BookingController.index)
router.get('/bookings/:id', BookingController.show)
router.post('/bookings', BookingController.create)
router.put('/bookings/:id', BookingController.update)
router.del('/bookings/:id', BookingController.destroy)

export default router