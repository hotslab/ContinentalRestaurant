import Router from '@koa/router'
import AuthentificationController from '../controllers/AuthentificationController'

const router = new Router({prefix: '/v1'})

router.get('/', AuthentificationController.hello)
router.get('/users', AuthentificationController.getUsers)
router.get('/users/:id', AuthentificationController.getUser)

export default router