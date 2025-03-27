import doctorModel from "../models/doctorModel.js"
import appointmentModel from "../models/appointmentModel.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'



const changeAvailbility = async (req, res) => {
    try {
        const { docId } = req.body;

        const docData = await doctorModel.findById(docId,address);
        await doctorModel.findByIdAndUpdate(docId, { available: !docData.available });

        res.json({ success: true, message: "Availability updated successfully" });

        console.log("data of doctor",docData);
        

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message }); 
    }
};

const doctorList = async (req, res) => {

    try {
       const doctors  = await doctorModel.find({}).select(['-password','-email']) 
       res.json({success:true,doctors})
    } catch (error) {
         console.log(error);
        res.json({ success: false, message: error.message });   
    }
}

//login doctors

const loginDoctor = async (req,res) => {
    try {
        const {email, password} = req.body
        const doctor = await doctorModel.findOne({email})

        if(!doctor) {
            return res.json({success:false,message:'Invaliid credentials'})
        }

        const isMath = await bcrypt.compare(password, doctor.password)

        if (isMath) {

            const token =  jwt.sign({id:doctor._id},process.env.JWT_SECRET) 
            res.json({success:true,token})
        } else [
            res.json({success:false,message:'  Invalid credentials'})
        ]
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
        
        
    }
}

//api to get doctor appointments for doctor panal

const appointmentDoctor = async (req,res) => {
    try {
        const { docId } = req.body;
        
        const appointments = await appointmentModel.find({docId})
        console.log(appointments);
        

        res.json({success: true,appointments})
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

export { changeAvailbility,doctorList,loginDoctor,appointmentDoctor  };
