import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
    userId: {type: String, required: decodeURI},
    docId: {type: String},
    slotData: {type: String },
    slotTime: {type: String},
    userData:{type: Object },
    docData:{type:Object },
    amount: {type:Number},
    image: {type: String},
    date: {type:Number},
    cancelled: {type:Boolean, default:false},
    payment: {type:Boolean , default:false},
    isCompleted: {type:Boolean , default: false}


})

const appointmentModel = mongoose.models.appointment || mongoose.model('appointment',appointmentSchema)
export default appointmentModel