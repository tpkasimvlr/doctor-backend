import doctorModel from "../models/doctorModel.js"
import appointmentModel from "../models/appointmentModel.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import userModel from "../models/userModel.js";



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



// const appointmentDoctor = async (req, res) => {
//     try {
//         const { docId } = req.body;

//         // Fetch doctor data by docId
    //         const doctorData = await doctorModel.findById(docId);
//         if (!doctorData) {
//             return res.json({ success: false, message: 'Doctor not found' });
//         }

//         // Fetch all appointments for the given doctor
//         const appointments = await appointmentModel.find({ docId });

//         // Get patient data for each appointment
//         const appointmentsWithPatientData = [];
//         for (const appointment of appointments) {
//             const patientData = await appointmentModel.findById(appointment.patientId);
//             appointmentsWithPatientData.push({
//                 ...appointment.toObject(), // Convert appointment to plain object
//                 patientData, // Attach patient data to the appointment
//             });
//         }
//         console.log(doctorData);
//         res.json({
//             success: true,
//             doctorData,
//             appointments: appointmentsWithPatientData
            
//         });
//     } catch (error) {
//         console.log(error);
//         res.json({ success: false, message: error.message });
//     }
// }



//api to get all appointment list

// const appointmentsAdmin = async (req,res) => {
//   try {
//     const appointment = await appointmentModel.find({});
//     const userIds = appointment.map(appt => appt.userId);
//     const docIds = appointment.map(appt => appt.docId);

//     const users = await userModel.find({ _id: { $in: userIds } });
//     const docters = await doctorModel.find({_id:{$in:docIds}});

//     let appointmentData =[];

//     appointmentData = appointment.map(appt => {
//       const user = users.find(user => user._id.toString() === appt.userId); 
//       const docData = docters.find(doc => doc._id.toString() === appt.docId)
      
//       return { ...appt._doc, userData:user, docData }; 
//   });


//     res.json({success:true,appointment:appointmentData})
//   } catch (error) {
//     console.log(error);
//     res.json({ success: false, message: error.message });
//   }
// }

 
  //api to markappointmenrt compleated for doctor panal
  const appointmentComplete = async (req,res) => {
    try {
        const {docId , appointmentId} = req.body;
        

        console.log("appoimentid::", req.body);
        

        const appoinmentData = await  appointmentModel.findById(appointmentId);

        console.log('appoinmentData ::', appoinmentData);
        

        if (appoinmentData && appoinmentData.docId === docId) {

              await appointmentModel.findByIdAndUpdate(appointmentId,{isCompleted  : true})
              return res.json({success:true,message:"Appointment booked"})
            
        } else {
            return res.json({success:false,message:"mark faild"})
        }
        
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message }); 
    }
  }




  //api to cancelappointmenrt compleated for doctor panal
  const appointmentcencel = async (req,res) => {
    try {
        const {docId , appointmentId} = req.body

        console.log("id of appoin",appointmentId);
        

        const appoinmentData = await  appointmentModel.findById(appointmentId)

        if (appoinmentData && appoinmentData.docId === docId) {

              await appointmentModel.findByIdAndUpdate(appointmentId,{cancelled : true})
              return res.json({success:true,message:"Appointment cancelled"})
            
        } else {
            return res.json({success:false,message:"cancellation faild"})  
        }
        
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message }); 
    }
  }

  

// api to get doctor appointments for doctor panal

const appointmentDoctor = async (req,res) => {
    try {
        const { docId } = req.body;
        
        const appointments = await appointmentModel.find({docId})
        
        const userIds = appointments.map(appt => appt.userId);
        const users = await userModel.find({ _id: { $in: userIds } });

        let appointmentData =[];

        appointmentData = appointments.map(appt => {
            const user = users.find(user => user._id.toString() === appt.userId); 
            appt.userData = user;
            return { ...appt._doc, userData:user }; 
        });

    
        res.json({success: true,appointments:appointmentData})
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}



//   //api to get dashbord data for doctor panale

//   const doctorDashboard = async (req,res) => {
//  try {
    

//     const {docId} = req.body
//     const appointments = await appointmentModel.find({docId})

//     const userIds = appointments.map(appt => appt.userId);
//     const users = await userModel.find({ _id: { $in: userIds } });

//     let appointmentDashData =[];

//     appointmentDashData = appointments.map(appt => {
//         const user = users.find(user => user._id.toString() === appt.userId); 
//         appt.userData = user;
//         return { ...appt._doc, userData:user }; 
//     });

//      res.json({success: true,appointments:appointmentData})

    
//     // console.log("ggg",docId);
    

//     let earnings = 0

//     appointments.map((item)=> {
//         if (item.isCompleted  || item.payment ) {
//             earnings += item.amount
            
//         } 
//  })

//     let patients = []

//     appointments.map((item)=> {
//         if (!patients.includes(item.userId)) {
//             patients.push(item.userId)
            
//         }

//     })

   
    

//     const dashData = {
//         earnings,
//         appointments: appointments.length,
//         patients: patients.length,
//         latestAppointment: appointments.reverse().slice(0,5)  
//     }

//   res.json({success:true,dashData})

//  } catch (error) {
//     console.log(error);
//     res.json({ success: false, message: error.message }); 
//  }
//   }





const doctorDashboard = async (req, res) => {
    try {
        const { docId } = req.body;
        console.log("Received docId:", docId);

        if (!docId) {
            return res.json({ success: false, message: "Doctor ID is required" });
        }

        // Fetch appointments for the doctor
        const appointments = await appointmentModel.find({ docId }).lean();  // Use `.lean()` for plain JSON objects
        console.log("Appointments:", appointments);

        // Extract userIds from appointments
        const userIds = appointments.map(appt => appt.userId.toString()); // Ensure IDs are strings
        console.log("Extracted User IDs:", userIds);

        // Fetch user details
        const users = await userModel.find({ _id: { $in: userIds } }).lean();
        console.log("Fetched Users:", users);

        // Map appointments with user details
        let appointmentDashData = appointments.map(appt => {
            const user = users.find(user => user._id.toString() === appt.userId.toString());
            return { ...appt, userData: user || null }; // Attach userData or null if not found
        });

        // Calculate earnings and unique patient count
        let earnings = 0;
        let patients = new Set();  // Using Set to avoid duplicate patient entries

        appointments.forEach((item) => {
            if (item.isCompleted || item.payment) {
                earnings += item.amount;
            }
            patients.add(item.userId.toString()); // Store unique patient IDs
        });

        // Prepare Dashboard Data
        const dashData = {
            earnings,
            totalAppointments: appointments.length,
            totalPatients: patients.size,
            latestAppointments: appointmentDashData.slice(-5) // Last 5 appointments
        };

        // Send response
        res.json({
            success: true,
            appointments: appointmentDashData,
            dashboardData: dashData
        });

    } catch (error) {
        console.error("Error in doctorDashboard:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

//api to get doctor for doctorpanel
const doctorProfile = async (req,res) => {
    try {
        
        const {docId} = req.body
        // console.log("doooooooc",docId);
        

        const profileData = await doctorModel.findById(docId).select('-password')
        
        

        res.json({success:true,profileData})
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

//api to updata doctor profile data from doctor panal

const updateDoctorProfile = async (req, res) => {
    try {
      const { docId, fees, address, available } = req.body;
  
      const updatedDoctor = await doctorModel.findByIdAndUpdate(
        docId,                          // 👉 ObjectId string
        { fees, address, available },   // 👉 update data
        { new: true }                   // 👉 return updated doc
      );
  
      if (!updatedDoctor) {
        return res.status(404).json({
          success: false,
          message: "Doctor not found",
        });
      }
  
      res.json({ success: true, message: "Profile Updated", doctor: updatedDoctor });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: error.message });
    }
  };
  




export { changeAvailbility,doctorList,loginDoctor,appointmentDoctor ,
// appointmentsAdmin ,
appointmentcencel,appointmentComplete,doctorDashboard,updateDoctorProfile,doctorProfile};
