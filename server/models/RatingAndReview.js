const mongoose = require("mongoose");
const ratingAndReviewSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },    
    rating: {   
        type: Number,
        required: true,
        // min: 1,
        // max: 5
    },
    review: {
        type: String,
        required: true,
        trim: true
    }
}); 

module.exports = mongoose.model("RatingAndReview", ratingAndReviewSchema);