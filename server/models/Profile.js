const mongoose = require("mongoose");
const ProfileSchema = new mongoose.Schema({
  dateOfBirth: {
    type: String
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"]
  },
  about: {
    type: String,
    trim: true
  },
    contactNumber: {
    type: Number,
    trim: true
  },
});
module.exports = mongoose.model("Profile", ProfileSchema);