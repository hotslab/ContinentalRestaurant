import Router from '@koa/router'
import AuthentificationController from '../controllers/AuthentificationController'

const router = new Router()

router.post('/login', AuthentificationController.login)
router.post('/register', AuthentificationController.register)
router.post('/forgot-password', AuthentificationController.register.forgotPassword)
router.post('/reset-password', AuthentificationController.register.resetPassword)
router.post('/register', AuthentificationController.register)
router.get('/users', AuthentificationController.getUsers)
router.get('/users/:id', AuthentificationController.getUser)

export default router