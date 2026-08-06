const jwt=require("jsonwebtoken");
require("dotenv").config();
const User=require("..models/User");


//auth
exports.auth=async(req,res,next)=>{
    try{
        //extract token
        const token=req.cookie.token
                      ||req.body.token
                      ||req.header("Authorization").replace("Bearer",",");
        //if token is missing ,then return response
        if(!token){
            return res.status(401).json({
                success:false,
                message:'Token is missing',
            });
        }
        //verify the token
        try{
            const decode=jwt.verify(token, process.env.JWT_SECRET);
            console.log(decode);
            req.user=decode;
        }catch(error){
            //verification -issue
            return res.status(401).json({
                success:false,
                message:'Token is invalid',
            });
        }
        next();
    }
    catch(err){
        return res.status(401).json({
            success:false,
            message:"Something went wrong while validating the token",
        });
    }
}
//isStudent
exports.isStudent=async(req,res,next)=>{
    try{
        if(req.user.accountType !=="Student"){
            return res.status(401).json({
                success:false,
                message:"this is protected route for the Student Only",
            });
        }
        next();
    }catch(error){
        return res.status(501).json({
            success:false,
            message:"User role cannot be verified, please try again",
        });
    }
}
//isInstructor
//isAdmin











