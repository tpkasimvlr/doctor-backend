import express from 'express'
import { getProfile, loginUser, registerUser, updataProfile  } from '../controllers/userController.js'
import authUser from '../middlewares/authUser.js'

import upload from '../middlewares/multer.js'

const userRouter = express.Router()

userRouter.post('/register',registerUser)
userRouter.post('/login',loginUser)

userRouter.get('/get-profile',authUser,getProfile)
userRouter.get('/update-profile',upload.single('image'),authUser,updataProfile)


export default userRouter