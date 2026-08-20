const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");
const User = require("../models/User");

// =====================================================
// CREATE RATING AND REVIEW
// =====================================================

exports.createRating = async (req, res) => {
    try {
        // Get user ID from authentication middleware
        const userId = req.user.id;

        // Get data from request body
        const { courseId, rating, review } = req.body;

        // Validation
        if (!courseId || !rating || !review) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        // Check rating range
        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: "Rating must be between 1 and 5",
            });
        }

        // Check whether course exists
        const courseDetails = await Course.findById(courseId);

        if (!courseDetails) {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }

        // Check whether user exists
        const userDetails = await User.findById(userId);

        if (!userDetails) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Check if user has already reviewed this course
        const alreadyReviewed = await RatingAndReview.findOne({
            courseId: courseId,
            user: userId,
        });

        if (alreadyReviewed) {
            return res.status(400).json({
                success: false,
                message: "You have already reviewed this course",
            });
        }

        // Create rating and review
        const ratingAndReview = await RatingAndReview.create({
            courseId: courseId,
            user: userId,
            rating: rating,
            review: review,
        });

        // Add rating/review to course
        await Course.findByIdAndUpdate(
            courseId,
            {
                $push: {
                    ratingAndReviews: ratingAndReview._id,
                },
            },
            { new: true }
        );

        // Return response
        return res.status(201).json({
            success: true,
            message: "Rating and review created successfully",
            data: ratingAndReview,
        });

    } catch (err) {
        console.error("Error creating rating and review:", err);

        return res.status(500).json({
            success: false,
            message: "Unable to create rating and review",
            error: err.message,
        });
    }
};

