const Category = require("../models/Cateogary");
const Course = require("../models/Course");


// ========================================
// CREATE CATEGORY
// ========================================

exports.createCategory = async (req, res) => {
    try {
        const {
            name,
            description,
        } = req.body;

        // Validate
        if (!name || !description) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        // Check if category already exists
        const existingCategory = await Category.findOne({
            name,
        });

        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: "Category already exists",
            });
        }

        // Create category
        const categoryDetails = await Category.create({
            name,
            description,
        });

        console.log("Category created:", categoryDetails);

        return res.status(200).json({
            success: true,
            message: "Category created successfully",
            data: categoryDetails,
        });

    } catch (err) {
        console.error("Error creating category:", err);

        return res.status(500).json({
            success: false,
            message: "Category could not be created",
            error: err.message,
        });
    }
};


// ========================================
// SHOW ALL CATEGORIES
// ========================================

exports.showAllCategory = async (req, res) => {
    try {
        const allCategories = await Category.find({})
            .populate("courses")
            .exec();

        return res.status(200).json({
            success: true,
            message: "All categories returned successfully",
            data: allCategories,
        });

    } catch (err) {
        console.error("Error fetching categories:", err);

        return res.status(500).json({
            success: false,
            message: "Categories could not be fetched",
            error: err.message,
        });
    }
};


// ========================================
// CATEGORY PAGE DETAILS
// ========================================

exports.categoryPageDetails = async (req, res) => {
    try {
        const { categoryId } = req.body;

        if (!categoryId) {
            return res.status(400).json({
                success: false,
                message: "Category ID is required",
            });
        }

        // Selected category
        const selectedCategory = await Category.findById(categoryId)
            .populate("courses")
            .exec();

        if (!selectedCategory) {
            return res.status(404).json({
                success: false,
                message: "Category data not found",
            });
        }

        // Other categories
        const differentCategories = await Category.find({
            _id: {
                $ne: categoryId,
            },
        })
            .populate("courses")
            .exec();

        // Top selling courses
        const topSellingCourses = await Course.find({})
            .sort({
                studentsEnrolled: -1,
            })
            .limit(10)
            .populate("instructor")
            .exec();

        return res.status(200).json({
            success: true,
            message: "Category page details fetched successfully",
            data: {
                selectedCategory,
                differentCategories,
                topSellingCourses,
            },
        });

    } catch (error) {
        console.error(
            "Error in categoryPageDetails:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};