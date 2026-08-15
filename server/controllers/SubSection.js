const SubSection=require('../models//SubSection');
const Section=require('../models/Section');
const Course=require('../models/Course');
const { tryWrapperForImpl } = require('jsdom/lib/generated/idl/utils');
const { uploadImageCloudinary } = require('../utils/imageUploader');
const { SOURCE_CACHE } = require('firebase/data-connect');


//create subsection

exports.createSubSection=async(req,res)=>{
    try{
        //fetch the data from the req ki body

        const {sectionId,title,timeDuration, description}=req.body;
        //extract file/video
        const video=req.file.videoFile;
        //validation
        if(!sectionId||!title||!timeDuration||!description||!video){
            return res.status(400).json({
                success:false,
                message:'Some properties are missing , fill then try again',
            })
        }
        //upload video to cloudinary
        const uploadDetails=await uploadImageCloudinary(video,process.env.FOLDER_NAME);
        //create a subsection

        const subSectionDetails=await SubSection.create({
            title:title,
            timeDuration:timeDuration,
            description:description,
            videoUrl:uploadDetails.secure_url,
        })
        //update the section with this subsection objectId
        const updatedSection =await Section.findByIdAndUpdate({_id:sectionId},
            {$push:{
                subSection:subSectionDetails._id,
            }},
            {new:true}
        ).populate({
    path: "subSection",
}).exec();

return res.status(200).json({
    success:true,
    message:"subSection creation Successfully",
    updatedSection,
})
        //return response
    }catch(err){
        return res.status(500).json({
            success:false,
            message:"subsetion is not created , try again",
            error:err.message,
        })
    }
}

exports.updateSubSection = async (req, res) => {
    try {
        // fetch data from request body
        const { subSectionId, title, timeDuration, description } = req.body;

        // fetch video if provided
        const video = req.file?.videoFile;

        // validation
        if (!subSectionId || !title || !timeDuration || !description) {
            return res.status(400).json({
                success: false,
                message: "Some properties are missing, fill them and try again",
            });
        }

        // object for updating subsection
        const updateData = {
            title,
            timeDuration,
            description,
        };

        // if new video is provided
        if (video) {
            const uploadDetails = await uploadImageCloudinary(
                video,
                process.env.FOLDER_NAME
            );

            updateData.videoUrl = uploadDetails.secure_url;
        }

        // update subsection
        const updatedSubSection = await SubSection.findByIdAndUpdate(
            subSectionId,
            updateData,
            { new: true }
        );

        if (!updatedSubSection) {
            return res.status(404).json({
                success: false,
                message: "SubSection not found",
            });
        }

        // return response
        return res.status(200).json({
            success: true,
            message: "SubSection updated successfully",
            updatedSubSection,
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "SubSection is not updated, try again",
            error: err.message,
        });
    }
};


exports.deleteSubSection = async (req, res) => {
    try {
        const { subSectionId, sectionId } = req.body;

        // validation
        if (!subSectionId || !sectionId) {
            return res.status(400).json({
                success: false,
                message: "SubSection ID and Section ID are required",
            });
        }

        // delete subsection
        const deletedSubSection = await SubSection.findByIdAndDelete(
            subSectionId
        );

        if (!deletedSubSection) {
            return res.status(404).json({
                success: false,
                message: "SubSection not found",
            });
        }

        // remove subsection ID from Section
        const updatedSection = await Section.findByIdAndUpdate(
            sectionId,
            {
                $pull: {
                    subSection: subSectionId,
                },
            },
            { new: true }
        ).populate({
            path: "subSection",
        }).exec();

        return res.status(200).json({
            success: true,
            message: "SubSection deleted successfully",
            updatedSection,
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "SubSection is not deleted, try again",
            error: err.message,
        });
    }
};