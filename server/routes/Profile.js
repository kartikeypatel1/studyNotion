const express = require("express")
const router = express.Router()
const { auth, isInstructor, isStudent } = require("../middlewares/auth")
const {
  deleteAccount,
  updateProfile,
  getUserAllDetails,
  updateDisplayPicture,
  getEnrolledCourses,
  instructorDashboard,
} = require("../controllers/profile")

// ********************************************************************************************************
//                                      Profile routes
// ********************************************************************************************************
// Delet User Account
router.delete("/deleteProfile", auth, deleteAccount)
router.put("/updateProfile", auth, updateProfile)
router.get("/getUserDetails", auth, getUserAllDetails)
// Get Enrolled Courses
router.get("/getEnrolledCourses", auth,isStudent, getEnrolledCourses)
router.put("/updateDisplayPicture", auth, updateDisplayPicture)
router.get("/instructorDashboard", auth, isInstructor, instructorDashboard)

module.exports = router