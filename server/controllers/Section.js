const Section=require('../models/Section');
const Course=require('../models/Course');
const SubSection=require('../models/SubSection')
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