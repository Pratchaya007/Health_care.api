import express from 'express';
import 'dotenv/config'
import { authRouter } from './routes/auth.route.js';
import { doctorNotesRouter } from './routes/docterNotes.route.js';

const app = express()

app.use(express.json())

app.use('/auth',authRouter)
app.use('/doctor-notes',doctorNotesRouter)

const PORT = process.env.PORT
app.listen(PORT , (err) => {
  if (err) return console.log(err)
    console.log(`Server is runnig http://localhost:${PORT}`)
})