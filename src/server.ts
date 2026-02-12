import express from 'express';
import 'dotenv/config'
import { authRouter } from './routes/auth.route.js';
import { doctorNotesRouter } from './routes/docterNotes.route.js';
import morgan from 'morgan'
import { healthrecordsRouter } from './routes/records.route.js';
import { notFoundMiddleware } from './middlewares/notFound.error.js';
import { errorMiddleware } from './middlewares/error.middleware.js';

const app = express()

app.use(express.json())
app.use(morgan('dev'))

app.use('/auth',authRouter)
app.use('/doctor-notes',doctorNotesRouter)
app.use('/health-records',healthrecordsRouter)

app.use(notFoundMiddleware) //Middleware ต้องวางไว้ หลังจาก route ทั้งหมด 
app.use(errorMiddleware)

const PORT = process.env.PORT
app.listen(PORT , (err) => {
  if (err) return console.log(err)
    console.log(`Server is runnig http://localhost:${PORT}`)
})