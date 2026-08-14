const Course=require("..models/Course");
const Tag=require("..models/Tags");
const User=require("..models/User");
const {uploadImageCloudinary}=require("../utils/imageUploader");



exports.createCourse=async(req,res)=>{
    try{
        //fetch the data 
        const{courseName,courseDescription,price,tag}=req.body;

        //get the thumbnail
        const thumbnail=req.files.thumbnailImage;

        //validation
        if(!courseName||!courseDescription||!whatYouWillLearn||!price||!tag){
            return res.status(500).json({
                success:false,
                message:error.message,
            })
        }
    }catch(err){
        return res.status(500).json({
            success:false,
            messages:err.messages,
        })
    }
}