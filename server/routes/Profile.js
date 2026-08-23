const express = require("express");

const router = express.Router();

// Import controllers
const {
    updateProfile,
    deleteProfile,
    getAllUserDetails,
} = require("../controllers/Profile");

// Import authentication middleware
const { auth } = require("../middlewares/auth");

// Update profile
router.put("/updateProfile", auth, updateProfile);

// Delete profile
router.delete("/deleteProfile", auth, deleteProfile);

// Get user details
router.get("/getUserDetails", auth, getAllUserDetails);

module.exports = router;