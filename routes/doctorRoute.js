import  express from 'express'
import { doctorList,loginDoctor,appointmentDoctor } from '../controllers/doctorController.js'
import authDoctor from '../middlewares/authDctor.js'

const doctorRouter = express.Router()

doctorRouter.get('/list',doctorList)
doctorRouter.post('/login',loginDoctor)
doctorRouter.get('/appointments',authDoctor,appointmentDoctor)

export default doctorRouter

