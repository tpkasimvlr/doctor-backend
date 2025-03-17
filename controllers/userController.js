
import validator  from 'validator'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import userModel from '../models/userModel.js'
import {v2 as cloudinary } from 'cloudinary'


// api to register user
const registerUser = async (req,res)=> {

 const { name, email, password } = req.body

    try {
        if (!name ||  !email || !password) {
            return res.json({success:false,message:"missing Detiles"})    
        }

        if (!validator.isEmail(email)) {
            return res.json({success:false,message:"Enter valid email"})
            
        }

        if (password.length <8) {
            return res.json({success:false,message:"Enter strong password"})
        }
        
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

      

        //hashing user password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt)

        const userData ={
            name,
            email,
            password : hashedPassword  
        }
               

        const newUser = new userModel(userData)
        const user = await newUser.save()
        //creat token
        const token = jwt.sign({id:user._id}, process.env.JWT_SECRET )
        res.json({success:true,token})

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
        
        
    }
}

//api for using login

const loginUser = async (req,res) => {

    try {

      
        const {email, password} = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
 
        const user = await userModel.findOne({email});
        console.log(user);
        

        if (!user) {
            return res.status(404).json({ success: false, message: "User does not exist" });

        }

        const isMacth = await bcrypt.compare(password, user.password)

        if(isMacth) {
           const token = jwt.sign({id:user._id},process.env.JWT_SECRET)
           res.json({success:true,token})
        } else {
            res.json({success:false,message:"Invalid credentials"})
        }
        
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})   
    }
}

//api to get user profile data
const getProfile = async (req, res)=>{
    try {
       const { userId } = req.body
       const userData = await userModel.findById(userId). select('-password') 

       res.json({success:true,userData})
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})  
    }
}

//api to updata user profile

const updataProfile = async (req, res) => {
    try {
        const { userId, name, phone, address: rawAddress, dob, gender } = req.body;
        const imageFile = req.file;
        
        if (!name || !phone || !dob || !gender) {
            return res.json({ success: false, message: "Data Missing" });
        }
  console.log();
  
        // Parse address safely
        let address;
        try {
            address = rawAddress ? JSON.parse(rawAddress) : null;
        } catch (error) {
            return res.json({ success: false, message: "Invalid address format" });
        }

        // Update user profile
        await userModel.findByIdAndUpdate(userId, { name, phone, address, dob, gender });

        if (imageFile) {
            // Upload image to Cloudinary
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
            const imageURL = imageUpload.secure_url;
            await userModel.findByIdAndUpdate(userId, { image: imageURL });
        }

        res.json({ success: true, message: "Profile Updated" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};


export {registerUser,loginUser, getProfile, updataProfile  }