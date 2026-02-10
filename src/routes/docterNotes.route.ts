import express, { Router } from 'express'
import { authRerister } from '../controllers/auth.controller.js';
import { authenticateMiddleware } from '../middlewares/authenticate.error.js';
import { docternotesData } from '../controllers/docternotes.controller.js';

export const doctorNotesRouter:Router = express.Router();
doctorNotesRouter.post('/doctor',authenticateMiddleware,docternotesData.createDocter)
doctorNotesRouter.get('/doctor', authenticateMiddleware,docternotesData.getDocter)
doctorNotesRouter.get('/doctor/:id', authenticateMiddleware,docternotesData.getDocterID)
doctorNotesRouter.put('/doctor/:id', authenticateMiddleware,docternotesData.updateDocterID)
doctorNotesRouter.delete('/doctor-notes/:id', authenticateMiddleware,docternotesData.deleteDocterID)
