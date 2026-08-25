const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
    courseName: {
        type: String,
        required: true,
        trim: true,
    },

    courseDescription: {
        type: String,
        required: true,
        trim: true,
    },

    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },

    whatYouWillLearn: {
        type: String,
        required: true,
        trim: true,
    },

    courseContent: [
        {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Section",
        },
    ],

    ratingAndReviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "RatingAndReview",
        },
    ],

    price: {
        type: Number,
        required: true,
    },

    thumbnail: {
        type: String,
        required: true,
    },

    tags: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Tag",
    },

    studentsEnrolled: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
});

module.exports =
    mongoose.models.Course || mongoose.model("Course", CourseSchema);