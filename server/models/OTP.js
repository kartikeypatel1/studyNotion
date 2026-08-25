const mongoose = require("mongoose");

const mailSender = require("../utils/mailSender");

const OTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true
    },

    otp: {
        type: String,
        required: true,
        trim: true
    },

    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300 // OTP will expire after 5 minutes
    }
});

// Function to send email
async function sendEmail(email, otp) {
    try {
        const mailresponse = await mailSender(
            email,
            "StudyNotion - OTP Verification",
            `Your OTP for StudyNotion is: ${otp}. It will expire in 5 minutes.`
        );

        return mailresponse;
    }
    catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Failed to send email");
    }
}

// Send OTP before saving document
OTPSchema.pre("save", async function() {
    if (this.isModified("otp")) {
        try {
            await sendEmail(this.email, this.otp);
        }
        catch (error) {
            console.error("Error sending OTP email:", error);
            throw error;
        }
    }
});

module.exports = mongoose.model("OTP", OTPSchema);