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