import express from 'express'
import { getProfile, loginUser, registerUser, updataProfile ,bookAppointment,paymentRazorpay,cancelAppointment, listappointment, verifyRazorpay } from '../controllers/userController.js'
import authUser from '../middlewares/authUser.js'

import upload from '../middlewares/multer.js'

const userRouter = express.Router()

userRouter.post('/register',registerUser)
userRouter.post('/login',loginUser)


userRouter.get('/get-profile',authUser,getProfile)
userRouter.post('/update-profile',upload.single('image'),authUser,updataProfile)
userRouter.post('/book-appointment',authUser,bookAppointment)
userRouter.get('/appointment',authUser,listappointment)
userRouter.post('/cencel-appointment',authUser,cancelAppointment)
userRouter.post('/payment-razorpay',authUser,paymentRazorpay)
userRouter.post('/verifyRazorpay',authUser,verifyRazorpay)



export default userRouter