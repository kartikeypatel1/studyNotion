const Profile= require("../models/profile");
const User= require("../models/User"); 
const CourseProgress=require("../models/courseProgress")
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const {convertSecondsToDuration}= require("../utils/secToDuration")
const Course= require("../models/course")

exports.updateProfile = async (req, res) => {
  try {
    const { firstname = "", lastname = "", additionalDetails = {} } = req.body;
    const { dob = "", about = "", gender = "", contactNumber = "" } = additionalDetails;

    const id = req.user.id;

    const userDetails = await User.findById(id);
    const profileId = userDetails.additionalDetails;
    const profileDetails = await Profile.findById(profileId);

    if (!profileDetails) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    // Update user
    userDetails.firstname = firstname;
    userDetails.lastname = lastname;
    await userDetails.save();

    // Update profile
    profileDetails.dob = dob;
    profileDetails.about = about;
    profileDetails.gender = gender;
    profileDetails.contactNumber = contactNumber;
    await profileDetails.save();

    const updatedUserDetails = await User.findById(id)
      .populate("additionalDetails")
      .exec();

    return res.status(200).json({
      success: true,
      message: "profile updated successfully",
      updatedUserDetails,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({
      success: false,
      message: "profile not updated",
    });
  }
};


exports.deleteAccount = async (req,res) =>{
    try{
        const id= req.user.id;
        const userDetails= await User.findById(id);
        if(!userDetails){
            return res.status(400).json({
                success: false,
                message: "user not found",
              });
        }

        await Profile.findByIdAndDelete({_id:userDetails.additionalDetails});
        await User.findByIdAndDelete({_id:id}); 

        return res.status(200).json({
            success: true,
            message: "User profile deleted",
          });
    }catch(error){
        return res.status(500).json({
            success: false,
            message: "user not deleted",
          });
    }
}

exports.getUserAllDetails= async (req,res) =>{
    try{
        const id= req.user.id;
        if(!id){
            return res.status(400).json({
                success: false,
                message: "user not available",
              });
        }
        const UserDetails= await User.findById(id).populate("additionalDetails").exec();
        return res.status(200).json({
            success: true,
            message: "all details fetched successfully",
            UserDetails,
          });
    }catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message, 
          });
    }
}

exports.updateDisplayPicture = async (req,res) =>{
    try{
        const displayPicture=req.files.displayPicture
        const userId= req.user.id;
        const image = await uploadImageToCloudinary(displayPicture, process.env.FOLDER_NAME,1000,1000)
        console.log(image);

        const updateProfile= await User.findByIdAndUpdate(
            {_id:userId},{image:image.secure_url},{new:true}
        )
        res.send({
            success: true,
            message: `Image Updated successfully`,
            data: updateProfile,
        })
    }catch(error){
        return res.status(500).json({
            success: false,
            message: error.message,
          })
    }
}
exports.getEnrolledCourses = async (req, res) => {
    try {
      const userId = req.user.id
      let userDetails = await User.findOne({
        _id: userId,
      })
        .populate({
          path: "courses",
          populate: {
            path: "courseContent",
            populate: {
              path: "SubSection",
            },
          },
        })
        .exec()
      userDetails = userDetails.toObject()
      var SubsectionLength = 0
      for (var i = 0; i < userDetails.courses.length; i++) {
        let totalDurationInSeconds = 0
        SubsectionLength = 0
        for (var j = 0; j < userDetails.courses[i].courseContent.length; j++) {
          totalDurationInSeconds += userDetails.courses[i].courseContent[j].SubSection.reduce(
            (acc, curr) => {
              const time = Number(curr.timeDuration)
              if (isNaN(time)) {
                console.log("⚠️ Invalid timeDuration found in SubSection:", {
                  courseId: userDetails.courses[i]._id,
                  sectionId: userDetails.courses[i].courseContent[j]._id,
                  subSectionId: curr._id,
                  timeDuration: curr.timeDuration,
                })
              }
              return acc + (isNaN(time) ? 0 : time)
            },
            0
          )
          
          userDetails.courses[i].totalDuration = convertSecondsToDuration(
            totalDurationInSeconds
          )
          SubsectionLength +=
            userDetails.courses[i].courseContent[j].SubSection.length
        }
        let courseProgressCount = await CourseProgress.findOne({
          courseID: userDetails.courses[i]._id,
          userId: userId,
        })
        courseProgressCount = courseProgressCount?.completedVideos.length
        if (SubsectionLength === 0) {
          userDetails.courses[i].progressPercentage = 100
        } else {
          // To make it up to 2 decimal point
          const multiplier = Math.pow(10, 2)
          userDetails.courses[i].progressPercentage =
            Math.round(
              (courseProgressCount / SubsectionLength) * 100 * multiplier
            ) / multiplier
        }
      }
  
      if (!userDetails) {
        return res.status(400).json({
          success: false,
          message: `Could not find user with id: ${userDetails}`,
        })
      }
      return res.status(200).json({
        success: true,
        data: userDetails.courses,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }

exports.instructorDashboard = async (req, res) => {
    try {
      const courseDetails = await Course.find({ instructor: req.user.id })
  
      const courseData = courseDetails.map((course) => {
        const totalStudentsEnrolled = course.studentEnrolled.length
        const totalAmountGenerated = totalStudentsEnrolled * course.price
  
        // Create a new object with the additional fields
        const courseDataWithStats = {
          _id: course._id,
          courseName: course.courseName,
          courseDescription: course.courseDescription,
          // Include other course properties as needed
          totalStudentsEnrolled,
          totalAmountGenerated,
        }
  
        return courseDataWithStats;
      })
  
      res.status(200).json({ courses: courseData })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Internal Server Error" })
    }
  }