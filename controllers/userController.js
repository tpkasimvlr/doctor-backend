import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import razorpay from "razorpay";

// api to register user
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.json({ success: false, message: "missing Detiles" });
    }

    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Enter valid email" });
    }

    if (password.length < 8) {
      return res.json({ success: false, message: "Enter strong password" });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    //hashing user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
      name,
      email,
      password: hashedPassword,
    };

    const newUser = new userModel(userData);
    const user = await newUser.save();
    
    //creat token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//api for using login

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await userModel.findOne({ email });
    console.log(user);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User does not exist" });
    }

    const isMacth = await bcrypt.compare(password, user.password);

    if (isMacth) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//api to get user profile data
const getProfile = async (req, res) => {
  try {
    const { userId } = req.body;

    console.log("user Id", userId);

    const userData = await userModel.findById(userId).select("-password");

    res.json({ success: true, userData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

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
    await userModel.findByIdAndUpdate(userId, {
      name,
      phone,
      address,
      dob,
      gender,
    });

    if (imageFile) {
      // Upload image to Cloudinary
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
      });
      const imageURL = imageUpload.secure_url;
      await userModel.findByIdAndUpdate(userId, { image: imageURL });
    }

    res.json({ success: true, message: "Profile Updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//api to book appointment
const bookAppointment = async (req, res) => {
  try {
    const { userId, docId, slotDate, slotTime, doctors } = req.body;
    const docData = await doctorModel
      .findById(docId, doctors)
      .select("-password");

    console.log("docdata", docId);

    if (!docData.available) {
      return res.json({ success: false, message: "Doctor not available" });
    }

    let slots_booked = docData.slots_booked;

    //chenching for slot available
    if (slots_booked[slotDate]) {
      if (slots_booked[slotDate].includes(slotTime)) {
        return res.json({ success: false, message: "slot not available" });
      } else {
        slots_booked[slotDate].push(slotTime);
      }
    } else {
      slots_booked[slotDate] = [];
      slots_booked[slotDate].push(slotTime);
    }

    const DocData = await doctorModel.findById(docId).select("-password");

    delete docData.slots_booked;

    const appointmentData = {
      userId,
      docId,
      DocData,

      doctors,
      amount: docData.fees,
      slotTime,
      slotDate,
      date: Date.now(),
    };

    const newAppointment = new appointmentModel(appointmentData);
    await newAppointment.save();

    //save new slots data in docData
    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    res.json({ success: true, message: "appointment booked" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//api to get user appointment for frontend my appoinment page

const listappointment = async (req, res) => {
  try {
    const { userId } = req.body;
    const appointments = await appointmentModel.find({ userId });
    const userIds = appointments.map(appt => appt.userId);
    const docIds = appointments.map(appt => appt.docId);

      const docters = await doctorModel.find({_id:{$in:docIds}});
    
    let appointmentData =[];

    appointmentData = appointments.map(appt => {

      const docData = docters.find(doc => doc._id.toString() === appt.docId)
      return { ...appt._doc, docData }; 
    })
    

    res.json({success:true,appointments:appointmentData})

    
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//api to cencel appointment
const cancelAppointment = async (req, res) => {
  try {
    const { userId, appointmentId } = req.body;

    // Fetch appointment data
    const appointmentData = await appointmentModel.findById(appointmentId);
    if (!appointmentData) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    // Verify appointment user
    if (appointmentData.userId.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized action" });
    }

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


const razorpayInstance = new razorpay({
  key_id: "Process.env.RAZORPAY_KEY_ID",
  key_secret: "Process.env.RAZORPAY_KEY_SECRET",
});

//api to make payment of appointment using razorpay
const paymentRazorpay = async (req, res) => {
  try {

    const { appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);

    if (!appointmentData || appointmentData.cencelled) {
      return res.json({
        success: false,
        message: "Appointment cencelled or not found",
      });
    }

    // creating option for razorpay payment
    const option = {
      amount: appointmentData.amount * 100,
      currency: process.env.CURRENCY,
      receipt: appointmentId,
    };

    //creatoin of an order
    const order = await razorpayInstance.orders.create(option);

    res.json({ success: true, order });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//api to varify payment of razorpay
const verifyRazorpay = async (req,res) => {
    try {
        const {razorpay_order_id} = req.body
        const orderinfo = await razorpayInstance.orders.fetch(razorpay_order_id)
        console.log(orderinfo);

        if (orderinfo.status === 'paid') {
            await appointmentModel.findByIdAndUpdate(orderinfo.receipt,{payment:true})
            res.json({success:true,message: "payment successful"})
        } else {
            res.json({success:false,message: "payment falied"})
        }
        
    } catch (error) {
        console.log(error);
    res.json({ success: false, message: error.message });
    }
}

export {
  registerUser,
  loginUser,
  getProfile,
  updataProfile,
  bookAppointment,
  cancelAppointment,
  listappointment,
  paymentRazorpay,
  verifyRazorpay
};
