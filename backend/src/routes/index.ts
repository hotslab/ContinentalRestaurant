import Router from '@koa/router'
import AuthentificationController from '../controllers/AuthentificationController'
import BookingController from '../controllers/BookingController'
import TimeController from '../controllers/TimeController'
import TableController from '../controllers/TableController'
import NotificationController from '../controllers/NotificationController'

const router = new Router()

// authentification
router.post('/login', AuthentificationController.login)
router.post('/register', AuthentificationController.register)
router.post('/forgot-password', AuthentificationController.forgotPassword)
router.put('/reset-password', AuthentificationController.resetPassword)

// users
router.get('/users', AuthentificationController.index)
router.get('/users/:id', AuthentificationController.show)
router.put('/users/:id', AuthentificationController.update)
router.del('/users/:id', AuthentificationController.destroy)

// time
router.get('/times', TimeController.show)
router.post('/times', TimeController.createOrUpdate)

// table
router.get('/tables', TableController.index)
router.post('/tables', TableController.create)
router.put('/tables/:id', TableController.update)
router.del('/tables/:id', TableController.destroy)
router.get('/table-time-slots', TableController.getTableTimeSlots)

// booking
router.get('/bookings', BookingController.index)
router.get('/bookings/:id', BookingController.show)
router.post('/bookings', BookingController.create)
router.put('/bookings/:id', BookingController.update)
router.del('/bookings/:id', BookingController.destroy)

// notification
router.get('/notifications', NotificationController.index)
router.put('/notifications/:id', NotificationController.update)

export default router