const Tag=require("..models/Cateogary");
const Cateogary = require("../models/Cateogary");


//create tag ka handler function
exports.createCateogary=async(req,res)=>{
    try{
        //fetch the data from the request ki body
        const {name,description}=req.body;
        //validation of the data
        if(!name||!description){
            return res.status(400).json({
                success:false,
                message:"All fields are required",
            })
        }

        //create the entry in database
        const tagDetails=await Tag.create({
            name:name,
            description:description,
        });
        console.log(tagDetails);

        //return the response
        return res.status(200).json({
            success:true,
            message:"Tag created successfully",
        })
    }catch(err){
        return res.status(500).json({
            success:false,
            message:erroe.message,
        })
    }
}

//get all tag
exports.showAllCateogary=async (req,res)=>{
    try{
        const allTags=await Tag.find({},{name:true,description:true});
        return res.status(200).json({
            success:true,
            messages:"All tags returned successfully",
            allTags,
        })
    }catch(err){
        return res.status(500).json({
            success:false,
            messages:err.message,
        })
    }
}

//cateogary page detail
exports.cateogaryPageDetails = async (req, res) => {
    try {
        // Get category ID
        const { cateogaryId } = req.body;

        // Get courses for the selected category
        const selectedCateogary = await Cateogary
            .findById(cateogaryId)
            .populate("course")
            .exec();

        // Validation
        if (!selectedCateogary) {
            return res.status(404).json({
                success: false,
                message: "Category data not found",
            });
        }

        // Get courses from different categories
        const differentCateogaries = await Cateogary
            .find({
                _id: { $ne: cateogaryId },
            })
            .populate("course")
            .exec();

        // Get top selling courses
        const topSellingCourses = await Course
            .find({})
            .sort({ studentsEnrolled: -1 })
            .limit(10)
            .exec();

        // Return response
        return res.status(200).json({
            success: true,
            message: "Category page details fetched successfully",
            data: {
                selectedCateogary,
                differentCateogaries,
                topSellingCourses,
            },
        });

    } catch (error) {
        console.error("Error in categoryPageDetails:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};