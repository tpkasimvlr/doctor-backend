import mongoose from "mongoose";

// Address Schema
const addressSchema = new mongoose.Schema({
  line1: { type: String, required: true, trim: true },
  line2: { type: String, required: true, trim: true }
});

// Doctor Schema
const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true, // Ensures no duplicate emails
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    },
    speciality: {
      type: String,
      required: true,
      trim: true
    },
    experience: {
      type: String,
      required: true,
      min: [1]
    },
    about: {
      type: String,
      required: true,
      trim: true
    },
    available: { 
      type: Boolean, 
      default: true 
    },
    fees: { 
      type: Number, 
      required: true 
    },
    address: { 
      type: addressSchema, 
      required: true 
    },
    date: {
      type: Date, // Fixed Type (String -> Date)
      required: true,
      default: Date.now // Ensures a default value
    },
    slots_booked: {
      type: Map, // Using Map for flexibility in key-value storage
      of: String,
      default: {}
    }
  },
  { minimize: false }
);

// Create Model
const doctorModel = mongoose.models.doctor || mongoose.model("doctor", doctorSchema);

export default doctorModel;
