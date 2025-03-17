import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from './config/mongodb.js'
import connectCloudinary from "./config/cloudinary.js";
import adminRouter from "./routes/adminRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import userRouter from "./routes/userRoute.js";






// Load environment variables                                                                                                                                             
dotenv.config();

// Initialize Express app
const app = express();
const port = process.env.PORT || 4000;

// Connect to Database & Cloudinary
connectDB()
connectCloudinary()

// Middleware
app.use(express.json());
app.use(cors());
 
//api end point
app.use('/api/admin',adminRouter)
app.use('/api/doctor',doctorRouter)
app.use('/api/user',userRouter)

                                                            
// API Routes
app.get("/", (req, res) => {
  res.send("API WORKING good ");
});

// Start server
app.listen(port, () => console.log(`Server started on port ${port}`));
