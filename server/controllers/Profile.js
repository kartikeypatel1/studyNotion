const Profile=require('../models/Profile');
const User=require('../models/User');


exports.updateProfile=async(req,res)=>{
    try{
        //get datae
        const{dateOfBirth="",about="",contactNumber,gender}=req.body;

        //get userid
        const id=req.User.id;

        //validation
        if(!contactNumber||!gender){
            return res.status(400).json({
                success:false,
                message:"all fields are required",
            })
        }

        //find profile

        const userDetails=await User.findById(id);
        const profileId=userDetails.additionalDetails;
        const profileDetails=await Profile.findById(profileId);


        //update profile
        profileDetails.dateOfBirth=dateOfBirth;
        profileDetails.about=about;
        profileDetails.contactNumber=contactNumber;
        profileDetails.gender=gender;
        await profileDetails.save();
        //return response
        return res.status(200).json({
            success:true,
            message:"Profile details are successfully updated",
            profileDetails,
        })

    }catch(err){
        return res.status(500).json({
            success:false,
            message:'server error',
            error:err.message,
        });
    }
}


exports.deleteProfile = async (req, res) => {
    try {
        const id = req.User.id;

        // Find user
        const userDetails = await User.findById(id);

        if (!userDetails) {
            return res.status(400).json({
                success: false,
                message: "User not found",
            });
        }

        // Remove user from all enrolled courses
        await Course.updateMany(
            {
                studentsEnrolled: id
            },
            {
                $pull: {
                    studentsEnrolled: id
                }
            }
        );

        // Delete profile
        await Profile.findByIdAndDelete(
            userDetails.additionalDetails
        );

        // Delete user
        await User.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Account deleted successfully",
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "User cannot deleted",
            error: err.message,
        });
    }
};


exports.getAllUserDetails=async(req,res)=>{
    try{
        //get id
        const id=req.User.id;
        //validation
        const userDetails=await User.findById(id).populate("additionalDetails").exec();
        return res.status(200).json({
            success:false,
            message:'User details are shown',
        })
    }catch(err){
        return res.statue(500).json({
            success:false,
            message:'Details are not find',
            error:err.message,
        });
    }
}