const crypto = require("crypto");

const { instance } = require("../config/razorpay");

const Course = require("../models/Course");
const User = require("../models/User");

const mailSender = require("../utils/mailSender");

const {
    courseEnrollmentEmail,
} = require("../mail/templates/courseEnrollmentEmail");

require("dotenv").config();


// ========================================
// CAPTURE PAYMENT
// ========================================

exports.capturePayment = async (req, res) => {
    try {
        // Get course ID from request body
        const { course_id } = req.body;

        // Get user ID from authentication middleware
        const userId = req.user.id;

        // Validate course ID
        if (!course_id) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid course ID",
            });
        }

        // Find course
        const course = await Course.findById(course_id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Could not find the course",
            });
        }

        // Check if student is already enrolled
        const alreadyEnrolled = course.studentsEnrolled.some(
            (studentId) => studentId.toString() === userId.toString()
        );

        if (alreadyEnrolled) {
            return res.status(400).json({
                success: false,
                message: "Student is already enrolled in the course",
            });
        }

        // Razorpay order options
        const amount = course.price;
        const currency = "INR";

        const options = {
            amount: amount * 100,
            currency: currency,
            receipt: `receipt_${Date.now()}`,
            notes: {
                courseId: course_id.toString(),
                userId: userId.toString(),
            },
        };

        // Create Razorpay order
        const paymentResponse = await instance.orders.create(options);

        console.log("Razorpay Order:", paymentResponse);

        return res.status(200).json({
            success: true,
            message: "Payment initiated successfully",

            courseName: course.courseName,
            courseDescription: course.courseDescription,
            thumbnail: course.thumbnail,

            orderId: paymentResponse.id,
            currency: paymentResponse.currency,
            amount: paymentResponse.amount,
        });

    } catch (error) {
        console.error("Error while capturing payment:", error);

        return res.status(500).json({
            success: false,
            message: "Could not initiate payment",
            error: error.message,
        });
    }
};


// ========================================
// VERIFY PAYMENT
// ========================================

exports.verifySignature = async (req, res) => {
    try {
        /*
            Razorpay sends these values after successful payment:

            razorpay_order_id
            razorpay_payment_id
            razorpay_signature
        */

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = req.body;

        // Validate required fields
        if (
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {
            return res.status(400).json({
                success: false,
                message: "Payment verification data is missing",
            });
        }

        // Create signature
        const body =
            razorpay_order_id +
            "|" +
            razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac(
                "sha256",
                process.env.RAZORPAY_SECRET
            )
            .update(body)
            .digest("hex");

        // Compare signatures
        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Payment signature is not valid",
            });
        }

        console.log("Payment signature verified successfully");

        /*
            Get course and user information.

            The order created in capturePayment contains
            courseId and userId inside Razorpay notes.
        */

        const orderDetails = await instance.orders.fetch(
            razorpay_order_id
        );

        const courseId = orderDetails.notes.courseId;
        const userId = orderDetails.notes.userId;

        if (!courseId || !userId) {
            return res.status(400).json({
                success: false,
                message: "Course or user information not found",
            });
        }

        // Find course
        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }

        // Check if already enrolled
        const alreadyEnrolled = course.studentsEnrolled.some(
            (studentId) =>
                studentId.toString() === userId.toString()
        );

        if (!alreadyEnrolled) {
            course.studentsEnrolled.push(userId);
            await course.save();
        }

        // Find student
        const student = await User.findById(userId);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found",
            });
        }

        // Add course to student's courses
        const alreadyInStudentCourses =
            student.courses.some(
                (courseIdFromUser) =>
                    courseIdFromUser.toString() ===
                    courseId.toString()
            );

        if (!alreadyInStudentCourses) {
            student.courses.push(courseId);
            await student.save();
        }

        console.log("Student enrolled successfully");

        return res.status(200).json({
            success: true,
            message: "Payment verified and course enrollment successful",
            courseId,
            userId,
        });

    } catch (error) {
        console.error("Error verifying payment:", error);

        return res.status(500).json({
            success: false,
            message: "Payment verification failed",
            error: error.message,
        });
    }
};


// ========================================
// SEND PAYMENT SUCCESS EMAIL
// ========================================

exports.sendPaymentSuccessEmail = async (req, res) => {
    try {
        const {
            orderId,
            paymentId,
            amount,
        } = req.body;

        const userId = req.user.id;

        // Find user
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Send email
        await mailSender(
            user.email,
            "Payment Successful - StudyNotion",
            courseEnrollmentEmail(
                user.firstName,
                orderId,
                paymentId,
                amount
            )
        );

        return res.status(200).json({
            success: true,
            message: "Payment success email sent successfully",
        });

    } catch (error) {
        console.error(
            "Error sending payment success email:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Could not send payment success email",
            error: error.message,
        });
    }
};