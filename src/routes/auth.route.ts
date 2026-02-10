import express, { Router } from 'express'
import { authRerister } from '../controllers/auth.controller.js';
import { authenticateMiddleware } from '../middlewares/authenticate.error.js';

export const authRouter:Router = express.Router();
authRouter.post('/register',authRerister.register)
authRouter.post('/login',authRerister.login)
authRouter.get('/me',authenticateMiddleware,authRerister.getMe)