const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
    },
    lastName: {
    type: String,
    required: true,
    trim: true
    },
    email: {
    type: String,
    required: true,
    unique: true,
    trim: true
    },
    password: {
    type: String,
    required: true,
    },
    accountType: {
    type: String,
    enum: ["Student", "Instructor", "Admin"],
    required: true
    },
    additionalDetails: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile",
    required: true
    },
    courses: [
    {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course"
    }
],
token:{
    type:String
},
resetPasswordExpires:{
    type:Date
},
image: {
    type:String,
    required: true
},
courseProgress: [
    
    {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course"
    }
],
});
module.exports = mongoose.model("User", UserSchema);