const User=require("../models/User");
const OTP=require("../models/OTP");
const OTPGenerator=require("otp-generator");
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");
const mailSender = require("../utils/mailSender");
require("dotenv").config();



//send OTP to user email
exports.sendOTP=async(req,res)=>{
    try{
    //fetch email from request body
     const {email}=req.body;
     //check if user already exists
     const checkUserPresent=await User.findOne({email});
     //if user already exists, return error response
     if(checkUserPresent){
        return res.status(401).json({
            success:false,
            message:"User already exists"
        })
     }
     //generate a OTP
     var OTP=OTPGenerator.generate(6,{
        upperCaseAlphabets:false,
        lowerCaseAlphabets:false,
        specialChars:false
     });
     //check unique otp or not
     let existingOTP=await OTP.findOne({email});
     while(existingOTP){
        OTP=OTPGenerator.generate(6,{
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false
         });
         existingOTP=await OTP.findOne({otp:OTP});
     }

        //store OTP in database
        const payload={email,otp:OTP};
        const otpData=await OTP.create(payload);
        return res.status(200).json({
            success:true,
            message:"OTP sent successfully",
            data:otpData    
        })

    }    catch(error){
        console.error("Error sending OTP:", error);
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        })
    }
};

//signup user
exports.signUp=async(req,res)=>{
  //data fetched from request body
  try{
    const {email,otp,password,confirmPassword,firstName,lastName
    ,accountType,contactNumber
  }=req.body;

  //validate the data
  if(!email || !otp || !password || !confirmPassword || !firstName || !lastName || !contactNumber){
    return res.status(403).json({
      success:false,
      message:"All fields are required"
    })
  }
  //2 passwords should match
  if(password !== confirmPassword){
    return res.status(400).json({
      success:false,
      message:"Passwords and confirm passwords do not match"
    })
  }
  //check if user already exists
  const checkUserPresent=await User.findOne({email});
  if(checkUserPresent){
    return res.status(401).json({
      success:false,
      message:"User already exists"
    })
  }
  //find most recent OTP for the email
  const otpData=await OTP.findOne({email}).sort({createdAt:-1}).limit(1);
  if(!otpData){
    return res.status(400).json({
      success:false,
      message:"Invalid OTP"
    })
  }
  //check if OTP is valid and not expired
  if(otpData.otp !== otp || otpData.length === 0){
    return res.status(400).json({
      success:false,
      message:"Invalid OTP"
    })
  } 

  //hash the password before saving to database
  const hashedPassword=await bcrypt.hash(password,10);
  //entry create in the database
  const profileDetails= await Profile.create({
    gender:null,
    dateOfBirth:null,
    about:null,
    contactNumber:null,
  });
  const user=await User.create({
    email,
    firstName,
    lastName,
    contactNumber,
    accountType,
    password:hashedPassword,
    additionalDetails:profileDetails._id,
    image:`https://api.dicebear.com/6.x/initials/svg?seed=${firstName} ${lastName}`,
  });
  return res.status(200).json({
    success:true,
    message:"User signed up successfully",
    data:user
  });
  }catch(error){
    console.error("Error signing up user:", error);
    return res.status(500).json({
      success:false,
      message:"user cannot be registrered . please try again later"
    })
  };

};

//signin user
exports.signIn=async(req,res)=>{
  try{
    //get the data from request body
    const {email,password}=req.body;
    //validation data
    if(!email || !password){
      return res.status(400).json({
        success:false,
        message:"All fields are required"
      })
    }
    // user check exist or not
    const user = await User.findOne({ email }).populate("additionalDetails");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }   
    //generate jwt token , after password match
    if(await bcrypt.compare(password, user.password)){
        const payload={
            id:user._id,
            email:user.email,
            accountType:user.accountType,
        }
        const token=jwt.sign(
            payload,process.env.JWT_SECRET,{
                expiresIn:"2h"
            });
            user.token=token;
            user.password=undefined;

 //creeate cookie and send response
            const options={
            expires:new Date(Date.now()+3*24*60*60*1000),
            httpOnly:true,
        }
       res.cookie("token",token,options).status(200).json({
        success:true,
        token,
        user,
        message:"User signed in successfully",
       })
    
    }else{
        return res.status(401).json({
            success:false,
            message:"Invalid credentials"
        })
    }
        

  }catch(error){
    console.error("Error signing in user:", error);
    return res.status(500).json({
        success:false,
        message:"Internal server error"
    })
  }
};

//changepassword
exports.changePassword = async (req, res) => {
    try {
        // Get old and new password from request body
        const { oldPassword, newPassword } = req.body;

        // Validate input
        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Please provide both old and new passwords.",
            });
        }

        // Get user ID from authenticated request
        const userId = req.user.id;

        // Find user
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        // Verify old password
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
        const hashedPassword = await bcrypt.hash(newPassword, 10);

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
                <p>Your account password has been changed successfully.</p>
                <p>If you did not perform this action, please contact support immediately.</p>
                `
            );
        } catch (mailError) {
            console.error("Error sending email:", mailError);
        }

        // Return success response
        return res.status(200).json({
            success: true,
            message: "Password changed successfully.",
        });

    } catch (error) {
        console.error("Error changing password:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

