const User = require("../models/User");
const OTP = require("../models/OTP");
const Profile = require("../models/Profile");
const OTPGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailSender = require("../utils/mailSender");

require("dotenv").config();


// ========================================
// SEND OTP
// ========================================

exports.sendOTP = async (req, res) => {
    try {
        // Get email from request body
        const { email } = req.body;

        // Validate email
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        // Check if user already exists
        const checkUserPresent = await User.findOne({ email });

        if (checkUserPresent) {
            return res.status(401).json({
                success: false,
                message: "User already exists",
            });
        }

        // Generate OTP
        let otp = OTPGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });

        // Make sure OTP is unique
        let existingOTP = await OTP.findOne({ otp });

        while (existingOTP) {
            otp = OTPGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            });

            existingOTP = await OTP.findOne({ otp });
        }

        // Store OTP in database
        const otpData = await OTP.create({
            email,
            otp,
        });

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully",
            data: otpData,
        });

    } catch (error) {
        console.error("Error sending OTP:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};


// ========================================
// SIGN UP
// ========================================

exports.signUp = async (req, res) => {
    try {
        // Get data from request body
        const {
            email,
            otp,
            password,
            confirmPassword,
            firstName,
            lastName,
            accountType,
            contactNumber,
        } = req.body;

        // Validate required fields
        if (
            !email ||
            !otp ||
            !password ||
            !confirmPassword ||
            !firstName ||
            !lastName ||
            !contactNumber
        ) {
            return res.status(403).json({
                success: false,
                message: "All fields are required",
            });
        }

        // Check passwords
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords and confirm passwords do not match",
            });
        }

        // Check if user already exists
        const checkUserPresent = await User.findOne({ email });

        if (checkUserPresent) {
            return res.status(401).json({
                success: false,
                message: "User already exists",
            });
        }

        // Find latest OTP
        const otpData = await OTP.findOne({ email })
            .sort({ createdAt: -1 });

        // Check OTP exists
        if (!otpData) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
            });
        }

        // Check OTP
        if (otpData.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create profile
        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: contactNumber,
        });

        // Create user
        const user = await User.create({
            email,
            firstName,
            lastName,
            contactNumber,
            accountType,
            password: hashedPassword,

            additionalDetails: profileDetails._id,

            image: `https://api.dicebear.com/6.x/initials/svg?seed=${firstName} ${lastName}`,
        });

        // Return response
        return res.status(200).json({
            success: true,
            message: "User signed up successfully",
            data: user,
        });

    } catch (error) {
        console.error("Error signing up user:", error);

        return res.status(500).json({
            success: false,
            message: "User cannot be registered. Please try again later",
        });
    }
};


// ========================================
// LOGIN
// ========================================

exports.logIn = async (req, res) => {
    try {
        // Get email and password
        const { email, password } = req.body;

        // Validate data
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        // Find user
        const user = await User.findOne({ email })
            .populate("additionalDetails");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Compare password
        const isPasswordMatched = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordMatched) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        // Create JWT payload
        const payload = {
            id: user._id,
            email: user.email,
            accountType: user.accountType,
        };

        // Generate token
        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            {
                expiresIn: "2h",
            }
        );

        // Store token
        user.token = token;

        // Don't send password
        user.password = undefined;

        // Cookie options
        const options = {
            expires: new Date(
                Date.now() + 3 * 24 * 60 * 60 * 1000
            ),
            httpOnly: true,
        };

        // Send response
        return res
            .cookie("token", token, options)
            .status(200)
            .json({
                success: true,
                token,
                user,
                message: "User signed in successfully",
            });

    } catch (error) {
        console.error("Error signing in user:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};


// ========================================
// CHANGE PASSWORD
// ========================================

exports.changePassword = async (req, res) => {
    try {
        // Get old and new password
        const {
            oldPassword,
            newPassword,
        } = req.body;

        // Validate input
        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Please provide both old and new passwords.",
            });
        }

        // Get user ID from authentication middleware
        const userId = req.user.id;

        // Find user
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        // Check old password
        const isPasswordMatched = await bcrypt.compare(
            oldPassword,
            user.password
        );

        if (!isPasswordMatched) {
            return res.status(401).json({
                success: false,
                message: "Old password is incorrect.",
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(
            newPassword,
            10
        );

        // Update password
        user.password = hashedPassword;

        await user.save();

        // Send email notification
        try {
            await mailSender(
                user.email,
                "Password Updated Successfully",
                `
                    <h2>Password Changed Successfully</h2>

                    <p>Hello ${user.firstName || user.name},</p>

                    <p>
                        Your account password has been changed successfully.
                    </p>

                    <p>
                        If you did not perform this action,
                        please contact support immediately.
                    </p>
                `
            );
        } catch (mailError) {
            console.error(
                "Error sending email:",
                mailError
            );
        }

        // Return response
        return res.status(200).json({
            success: true,
            message: "Password changed successfully.",
        });

    } catch (error) {
        console.error(
            "Error changing password:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};