import express, { Router } from 'express'
import { authenticateMiddleware } from '../middlewares/authenticate.error.js'

export const healthrecordsRouter:Router = express.Router()
healthrecordsRouter.post('/records',authenticateMiddleware)
healthrecordsRouter.get('/records',authenticateMiddleware)
healthrecordsRouter.get('/records/:id',authenticateMiddleware)
healthrecordsRouter.put('/records/:id',authenticateMiddleware)
healthrecordsRouter.delete('/records/:id',authenticateMiddleware)