const express = require("express");

const router = express.Router();


// ========================================
// COURSE CONTROLLERS
// ========================================

const {
   createCourse,
    showAllCourses,
    getCourseDetails,
} = require("../controllers/Course");


// ========================================
// CATEGORY CONTROLLERS
// ========================================

const {
    showAllCategory,
    createCategory,
    categoryPageDetails,
} = require("../controllers/Cateogary");


// ========================================
// SECTION CONTROLLERS
// ========================================

const {
    createSection,
    updateSection,
    deleteSection,
} = require("../controllers/section");


// ========================================
// SUBSECTION CONTROLLERS
// ========================================

const {
    createSubSection,
    updateSubSection,
    deleteSubSection,
} = require("../controllers/subsection");


// ========================================
// RATING CONTROLLERS
// ========================================

const {
    createRating,
   getAverageRating,
    getAllRating,
} = require("../controllers/ratingandreview");


// ========================================
// COURSE PROGRESS
// ========================================

const {
    updateCourseProgress,
} = require("../controllers/courseProgress");


// ========================================
// MIDDLEWARE
// ========================================

const {
    auth,
    isInstructor,
    isStudent,
    isAdmin,
} = require("../middlewares/auth");


// ========================================
// COURSE ROUTES
// ========================================

// Create course
router.post(
    "/createCourse",
    auth,
    isInstructor,
    createCourse
);


// Add section
router.post(
    "/addSection",
    auth,
    isInstructor,
    createSection
);


// Update section
router.post(
    "/updateSection",
    auth,
    isInstructor,
    updateSection
);


// Delete section
router.post(
    "/deleteSection",
    auth,
    isInstructor,
    deleteSection
);


// Add subsection
router.post(
    "/addSubSection",
    auth,
    isInstructor,
    createSubSection
);


// Update subsection
router.post(
    "/updateSubSection",
    auth,
    isInstructor,
    updateSubSection
);


// Delete subsection
router.post(
    "/deleteSubSection",
    auth,
    isInstructor,
    deleteSubSection
);


// Get all courses
router.get(
    "/showAllCourses",
    showAllCourses
);





// Get full course details
router.post(
    "/getCourseDetails",
    auth,
    getCourseDetails
);


// // Edit course
// router.put(
//     "/editCourse",
//     auth,
//     isInstructor,

// );


// Get instructor courses
// router.get(
//     "/getInstructorCourses",
//     auth,
//     isInstructor,
//     getInstructorCourses
// );


// Delete course
// router.delete(
//     "/deleteCourse",
//     auth,
//     isInstructor,
//     deleteCourse
// );


// Update course progress
router.post(
    "/updateCourseProgress",
    auth,
    isStudent,
    updateCourseProgress
);


// ========================================
// CATEGORY ROUTES
// ========================================

// Create category
router.post(
    "/createCategory",
    auth,
    isAdmin,
    createCategory
);


// Show all categories
router.get(
    "/showAllCategories",
    showAllCategory
);


// Category page details
router.post(
    "/getCategoryPageDetails",
    categoryPageDetails
);


// ========================================
// RATING & REVIEW ROUTES
// ========================================

router.post(
    "/createRating",
    auth,
    isStudent,
    createRating
);


router.get(
    "/getAverageRating",
    getAverageRating
);


router.get(
    "/getReviews",
    getAllRating
);


console.log("✅ Course Routes file loaded");

module.exports = router;