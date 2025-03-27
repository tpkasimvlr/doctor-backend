import validator from "validator";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import userModel from "../models/userModel.js";

import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";

const addDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      speciality,
      degree,
      experience,
      about,
      fees,
      address,
      date,
    } = req.body;
    const imageFile = req.file;

    // Check for missing fields
    if (
      !name || !email || !password || !speciality || !degree ||
      !experience || !about || !address || !fees
    ) {
      return res.json({ success: false, message: "Missing Details" });
    }

    // Validate email
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Invalid Email" });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.json({ success: false, message: "Password must be at least 8 characters" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Upload image to Cloudinary
    if (!imageFile) {
      return res.json({ success: false, message: "Doctor image is required" });
    }
    const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
    const imageUrl = imageUpload.secure_url;

    // Parse address to ensure it's an object
    let parsedAddress;
    try {
      parsedAddress = JSON.parse(address);
    } catch (error) {
      return res.status(400).json({ success: false, message: "Invalid address format" });
    }

    // Create and save doctor
    const doctor = new doctorModel({
      name,
      email,
      password: hashedPassword,
      image: imageUrl,
      speciality,
      experience,
      about,
      fees,
      address: parsedAddress,  // ✅ Fixed address issue
      date: date || new Date(),  // ✅ Use provided date or current date
      slots_booked: req.body.slots_booked || {},
    });

    await doctor.save();
    res.json({ success: true, message: "Doctor Added", doctor });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};


//adi admin login

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(email + password, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "invalid creater" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};


//api to get all doctors

const allDoctors = async (req,res) => {
  try {
    const doctors = await doctorModel.find({}).select('-password')
    
    res.status(200).json(doctors)
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
}


//api to get all appointment list

const appointmentsAdmin = async (req,res) => {
  try {
    const appointment = await appointmentModel.find({});
    const userIds = appointment.map(appt => appt.userId);
    const docIds = appointment.map(appt => appt.docId);

    const users = await userModel.find({ _id: { $in: userIds } });
    const docters = await doctorModel.find({_id:{$in:docIds}});

    let appointmentData =[];

    appointmentData = appointment.map(appt => {
      const user = users.find(user => user._id.toString() === appt.userId); 
      const docData = docters.find(doc => doc._id.toString() === appt.docId)
      
      return { ...appt._doc, userData:user, docData }; 
  });


    res.json({success:true,appointment:appointmentData})
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
}


//api to cencel appointment
const AppointmentCancel = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    // Fetch appointment data
    const appointmentData = await appointmentModel.findById(appointmentId);
   


    // Cancel appointment
    await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });

    // Release doctor slot
    const { docId, slotDate, slotTime } = appointmentData;
    const doctorData = await doctorModel.findById(docId);

    if (!doctorData) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    let slots_booked = doctorData.slots_booked || {}; // Ensure it's an object

    if (slots_booked[slotDate]) {
      slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime);
    }

    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    res.json({ success: true, message: "Appointment cancelled" });
  } catch (error) {
    console.error("Cancel Appointment Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const adminDashBoard= async (req,res) => {
  try {
    const doctor = await doctorModel.find({})
    const user = await userModel.find({})
    const appointment = await appointmentModel.find ({})

    const dashData = {
      doctor:doctor.length,
      appointments:appointment.length,
      patients:user.length,
      leatestAppointments: appointment.reverse().slice(0,5)
    }
    res.json({success:true,dashData})
  } catch (error) {
    
  }
}


export { addDoctor, loginAdmin, allDoctors,appointmentsAdmin,AppointmentCancel,adminDashBoard };
