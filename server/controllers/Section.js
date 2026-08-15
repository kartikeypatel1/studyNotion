const Section=require('../models/Section');
const Course=require('../models/Course');
const SubSection=require('../models/SubSection');
const { section } = require('framer-motion/client');
exports.createSection=async(req,res)=>{
    try{
        //fetch the data
        const{sectionName,courseId}=req.body;
        //data validation
        if(!sectionName||!courseId){
            return res.status(400).json({
                success:false,
                message:'Missing properties',
            });
        }

        //create the section
        const newSection =await Section.create(sectionName);

        //update the course with section objectId
        const updatedCourseDetails=await Course.findByIdAndUpdate(
            courseId,{
                $push:{
                    courseContent:newSection._id,
                }
            },
            {new:true}
        ).populate(
            {
    path: "courseContent",
    populate: {
        path: "subSection",
    },
}
        ).exec();
        //use the populate to replace sections/subsections both in the uploadCourseDetails


        //return the response
        return res.status(200).json({
            success:true,
            message:"Section Creation Successfully",
            updatedCourseDetails,
        })
    }catch(err){
        return res.status(500).json({
            success:false,
            message:err.message,
        });
    }
    
}


//update section controller handler fucntion

exports.updateSection=async(req,res)=>{
    try{
        //data fetch
        const{sectionName,sectionId}=req.body;
        //data validation
        if(!sectionName){
            return res.status(400).json({
                success:false,
                message:'Properties are missing',
            });
        }
        //update data

        const updateSection=await Section.findByIdAndUpdate(sectionId,{sectionName},{new:true});
        //return res.
        return res.status(200).json({
            success:true,
            message:'Section updated Successfully',
        });
    }catch(err){
        return res.status(500).json({
            success:false,
            message:"Unable update the section, please try again",
            error:err.message,
        })
    }
};

//delete the section

exports.deleteSection=async(req,res)=>{
    try{
        //get id -assuming that we are send ing ID in params
        const{sectionId}=req.params;

        //data validate

        if(!sectionId){
            return res.status(400).json({
                success:false,
                message:'Properties are missing',
            });
        }
        //data delete
        await Section.findByIdAndDelete(sectionId);
        //return response
        return res.status(200).json({
            success:true,
            message:'Section deleted Successfully',
        });
    }catch(err){
        return res.status(500).json({
            success:false,
            message:'Try again later',
            error:err.message,
        })
    }
}