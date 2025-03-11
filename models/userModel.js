import * as mongoose from "mongoose";

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // Ensures no duplicate emails
      match: [/.+\@.+\..+/, "Please enter a valid email address"], // Email format validation
    },
    password: {
      type: String,
      required: true,
    },
    Image: {
      type: String,
      required: true,
    },

    address_1: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },

    dob : {
        type:String,
        defult : "Not selecteg"
    },
    phone: {
        type: String,
        defult:"00000000000",
      },
  
});

const userModel =
  mongoose.models.user || mongoose.model("user", userSchema);

export default userModel
