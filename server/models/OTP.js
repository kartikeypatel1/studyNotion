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
        default: Date.now(),
        expires: 300 // OTP will expire after 5 minutes (300 seconds)
    }
});

//a function -> to send emails
async function sendEmail(email, otp) {
    try{
        const mailresponse=await mailSender(email, "StudyNotion - OTP Verification", `Your OTP for StudyNotion is: ${otp}. It will expire in 5 minutes.`);
        return mailresponse;
    }
    catch(error){
        console.error("Error sending email:", error);
        throw new Error("Failed to send email");
    }
}
OTPSchema.pre("save", async function(next) {
    if (this.isModified("otp")) {
        try {
            await sendEmail(this.email, this.otp);
            next();
        }
        catch (error) {
            next(error);
        }   
    } else {
        next();
    }
});
module.exports = mongoose.model("OTP", OTPSchema);