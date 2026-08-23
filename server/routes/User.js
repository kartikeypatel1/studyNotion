const express = require("express");

const router = express.Router();

// Import controllers
const {
    logIn,
    signUp,
    sendOTP,
    changePassword,
} = require("../controllers/auth");

// Import reset password controllers
const {
    resetPasswordToken,
    resetPassword,
} = require("../controllers/resetPassword");

// Import authentication middleware
const { auth } = require("../middlewares/auth");

// Login
router.post("/login", logIn);

// Signup
router.post("/signup", signUp);

// Send OTP
router.post("/sendotp", sendOTP);

// Change password
router.post("/changepassword", auth, changePassword);

// Reset password token
router.post("/reset-password-token", resetPasswordToken);

// Reset password
router.post("/reset-password", resetPassword);

module.exports = router;