const Course = require("../models/Course");
const Category = require("../models/Cateogary");
const User = require("../models/User");

const { uploadImageCloudinary } = require("../utils/imageUploader");


// ========================================
// CREATE COURSE
// ========================================

exports.createCourse = async (req, res) => {
    try {
        const {
            courseName,
            courseDescription,
            whatYouWillLearn,
            price,
            tag,
        } = req.body;

        // Validate thumbnail
        if (!req.files || !req.files.thumbnailImage) {
            return res.status(400).json({
                success: false,
                message: "Course thumbnail is required",
            });
        }

        const thumbnail = req.files.thumbnailImage;

        // Validate fields
        if (
            !courseName ||
            !courseDescription ||
            !whatYouWillLearn ||
            !price ||
            !tag
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        // Get instructor ID
        const userId = req.user.id;

        // Find instructor
        const instructorDetails = await User.findById(userId);

        if (!instructorDetails) {
            return res.status(404).json({
                success: false,
                message: "Instructor details not found",
            });
        }

        // Check category
        const categoryDetails = await Category.findById(tag);

        if (!categoryDetails) {
            return res.status(404).json({
                success: false,
                message: "Category details not found",
            });
        }

        // Upload thumbnail
        const thumbnailImage = await uploadImageCloudinary(
            thumbnail,
            process.env.FOLDER_NAME
        );

        // Create course
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn,
            price,
            tag: categoryDetails._id,
            thumbnail: thumbnailImage.secure_url,
        });

        // Add course to instructor
        await User.findByIdAndUpdate(
            instructorDetails._id,
            {
                $push: {
                    courses: newCourse._id,
                },
            },
            { new: true }
        );

        // Add course to category
        await Category.findByIdAndUpdate(
            categoryDetails._id,
            {
                $push: {
                    courses: newCourse._id,
                },
            },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "Course created successfully",
            data: newCourse,
        });

    } catch (err) {
        console.error("Error creating course:", err);

        return res.status(500).json({
            success: false,
            message: "Course could not be created",
            error: err.message,
        });
    }
};


// ========================================
// GET ALL COURSES
// ========================================

exports.showAllCourses = async (req, res) => {
    try {
        const allCourses = await Course.find({})
            .populate({
                path: "instructor",
                select: "firstName lastName email image",
            })
            .populate({
                path: "tag",
                select: "name description",
            })
            .exec();

        return res.status(200).json({
            success: true,
            message: "All courses fetched successfully",
            data: allCourses,
        });

    } catch (err) {
        console.error("Error fetching courses:", err);

        return res.status(500).json({
            success: false,
            message: "Cannot fetch course data",
            error: err.message,
        });
    }
};


// ========================================
// GET COURSE DETAILS
// ========================================

exports.getCourseDetails = async (req, res) => {
    try {
        const { courseId } = req.body;

        if (!courseId) {
            return res.status(400).json({
                success: false,
                message: "Course ID is required",
            });
        }

        const courseDetails = await Course.findById(courseId)
            .populate({
                path: "instructor",
                select: "-password -__v",
            })
            .populate({
                path: "tag",
                select: "name description courses",
            })
            .populate({
                path: "ratingAndReviews",
                populate: {
                    path: "user",
                    select: "firstName lastName email image",
                },
            })
            .populate({
                path: "studentsEnrolled",
                select: "firstName lastName email image",
            })
            .exec();

        if (!courseDetails) {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Course details fetched successfully",
            data: courseDetails,
        });

    } catch (err) {
        console.error("Error fetching course details:", err);

        return res.status(500).json({
            success: false,
            message: "Cannot fetch course details",
            error: err.message,
        });
    }
};