const Course = require("../models/Course");
const Cateogary = require("../models/Cateogary");
const User = require("../models/User");
const {uploadImageCloudinary}=require("../utils/imageUploader");



exports.createCourse=async(req,res)=>{
    try{
        //fetch the data 
        const{courseName,courseDescription,whatYouWillLearn,price,tag}=req.body;

        //get the thumbnail
        const thumbnail=req.files.thumbnailImage;

        //validation
        if(!courseName||!courseDescription||!whatYouWillLearn||!price||!tag){
            return res.status(400).json({
                success:false,
                message:'all fields are required',
            })
        }
        //check for intructor
        //check this
        const userid=req.user.id;
        const instructorDetails=await User.findById(userid);
        console.log("Instructor Details",instructorDetails);


        if(!instructorDetails){
            return res.status(404).json({
    
                success:false,
                message:"Instructor Details not found"
            })
        }


        //check the given tag is valid or not

        const cateogaryDetails=await Cateogary.findById(tag);
        if(!cateogaryDetails){
            return res.status(404).json({
                success:false,
                message:'Tag details are not found'
            })
        }

        //upload images to cloudinary
        
        const thumbnailImage=await uploadImageCloudinary(thumbnail,process.env.FOLDER_NAME);


        //create an entry for new entry
        const newCourse=await Course.create({
            courseName,
            courseDescription,
            instructor:instructorDetails._id,
            whatYouWillLearn:whatYouWillLearn,
            price,
            tag:cateogaryDetails._id,
            thumbnail:thumbnailImage.secure_url,
        })


        //add the new course to the user schema of intructor

        await User.findByIdAndUpdate(
            {
                _id:instructorDetails._id
            },{
                $push:{
                    courses:newCourse._id
                }
            },
            {new:true}
        );

        //update the Tag ka  schema

         // Add course to tag
        await Cateogary.findByIdAndUpdate(
            cateogaryDetails._id,
            {
                $push: {
                    courses: newCourse._id,
                },
            },
            { new: true }
        );

        // Send response
        return res.status(200).json({
            success: true,
            message: "Course created successfully",
            data: newCourse,
        });
    }catch(err){
        return res.status(500).json({
            success:false,
            message:err.message,
        })
    }
}

// get all courses handler function

exports.getAllCourse=async(req,res)=>{
    try{
        const allCourses=await Course.find({},{
            courseName:true,
            price:true,
            thumbnail:true,
            instructor:true,
            ratingAndReviews:true,
            studentsEnrolled:true
        }).populate("Intructor").exec();
        return res.status(200).json({
            success:true,
            message:'data for all courses fetched successfully',
            data:allCourses,
        })
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:'cannot fetch course data',
            error:error.message
        })
    }
}