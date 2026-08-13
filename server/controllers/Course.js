const Course=require("..models/Course");
const Tag=require("..models/Tags");
const User=require("..models/User");
const {uploadImageCloudinary}=require("../utils/imageUploader");



exports.createCourse=async(req,res)=>{
    try{
        
    }catch(err){
        return res.status(500).json({
            success:false,
            messages:err.messages,
        })
    }
}