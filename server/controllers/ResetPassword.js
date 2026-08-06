const User=require("../models/User");
const mailsender=require("../utils/mailSender");
const bcrypt=require("jsonwebtoken");

//resetPasswordToken
exports.resetPasswordToken=async(req,res)=>{
    try{
    //get email from req body
    const email=req.body.email;
    // check user for this email , email validation
    const user = await User.findOne({email:email});
    if(!user){
        return res.json({
            success:false,
            message:"Your email is not registered with use",
        });
    }
    //generate token
    const token=crypto.randomUUID();
    //udpate user by adding token and expiration time 
    const updatedDetails=await User.findOneAndUpdate({
        email:email},{
            token:token,
            resetPasswordExpires:Date.now()+5*60*1000,
        },{new:true});
    //create url
const url=`http://localhost:3000/update-password/${token}`;
    // send mail containing the url
    await mailsender(email, 
        "Password reset link",
    `Password Reset link:${url}`);
    //return response
    return res.json({
        success:true,
        message:"Email sent Successfully, please check email and change password"
    });
    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Something went wrong while sending the reset password link"
        });
    }
}


//resetPassword
exports.resetPassword=async(req,res)=>{
    try{
        //data fetch
        const{password, confirmPassword, token }=req.body;

        //validation
        if(password!==confirmPassword){
            return res.json({
                success:false,
                message:"Password not matching",
            });
        }

        //get userdetails from db using token

        const userDetails=await User.findOne({token:token});

        // if no entry-invalid token
        if(!userDetails){
            return res.json({
                success:false,
                message:"Token is invalid"
            });
        }
        //token time check
        if(userDetails.resetPasswordExpires<Date.now()){
            return res.json({
                success:false,
                message:'Token is expires,Please regenarate the password link'
            })
        }
        //hash the password
        const hashedPassword=await bcrypt.hash(password,10);

        //update the password
        await User.findOne(
            {token:token},
            {password:hashedPassword},
            {new:true},
        
        )

        //return response
        return res.status(200).json({
            success:true,
            message:"Password reset Successfully",
        });
    }catch(error){
        return res.status(500).json({
            success:false,
            messages:"something went wrong with the reset password",
        });
    }
}