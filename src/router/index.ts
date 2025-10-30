import { Router } from 'express';
import { userController } from '../controllers/user-controller.js';
import { AuthMiddleware } from '../middlewares/auth-middleware.js';

export const router = Router();

router.post('/signout', userController.signout);

router.post('/signup', userController.signup);

router.post('/signin', userController.signin);

router.post('/signin/new_token', userController.refresh);

router.get('/info', AuthMiddleware, userController.info);
