

import express from 'express'
import  { addDoctor, allDoctors, appointmentsAdmin, loginAdmin,AppointmentCancel,adminDashBoard}  from '../controllers/adminController.js'
import upload from '../middlewares/multer.js'
import authAdmin from '../middlewares/authAdmin.js'
import { changeAvailbility } from '../controllers/doctorController.js'



const adminRouter = express.Router()
adminRouter.post('/add-doctor',authAdmin, upload.single("image"), addDoctor)
adminRouter.post('/login',loginAdmin)
adminRouter.post('/all-doctors', authAdmin , allDoctors)
adminRouter.post('/change-availability', authAdmin , changeAvailbility)
adminRouter.get('/appointments',authAdmin,appointmentsAdmin)
adminRouter.post('/cancel-appointment',authAdmin,AppointmentCancel)
adminRouter.get('/dashboard',authAdmin,adminDashBoard)


 


export default adminRouter