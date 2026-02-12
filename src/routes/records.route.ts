import express, { Router } from 'express'
import { authenticateMiddleware } from '../middlewares/authenticate.error.js'
import { healthrecords } from '../controllers/records.controller.js'

export const healthrecordsRouter:Router = express.Router()
healthrecordsRouter.post('/records',authenticateMiddleware,healthrecords.createRecords)
healthrecordsRouter.get('/records',authenticateMiddleware,healthrecords.getRecords)
healthrecordsRouter.get('/records/:id',authenticateMiddleware,healthrecords.getRecordsId)
healthrecordsRouter.put('/records/:id',authenticateMiddleware,healthrecords.updateRecords)
healthrecordsRouter.delete('/records/:id',authenticateMiddleware,healthrecords.deleteRecords)