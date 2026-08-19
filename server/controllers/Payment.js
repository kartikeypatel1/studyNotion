const {instance}=require('../config/razorpay');
const Course=require('../models/Course');
const User=require('../models/User');
const mailSender=require('../utils/mailSender');
const {courseEnrollmentEmail}=require('../mail/templates/courseEnrollmentEmail');
const { Receipt } = require('lucide-react');



//capture the payment and initiate the razorpay order
exports.capturePayment=async(req,res)=>{
    //get course id and user id
    const{course_id}=req.body;
    const userId=req.user.id;


    //validation
    if(!course_id){
        return res.status(500).json({
            success:false,
            message:'Please provide valid course id',
        })
    };
    //valid courseID
  //valid courseDetails
    let course;
    try{
        course=await Course.findById(course_id);
        if(!course){
            return res.statue(500).json({
                success:false,
                message:'Could not find the course',
            })
        };
        //user already pay for the samecourse
        const uid=new mongoose.Types.ObjectId(userId);
        if(course.studentsEnrolled.includes(uid)){
            return res.status(200).json({
                success:false,
                message:'student is already enrolled in the course'
            })
        }

    }catch(err){
        console.error(err);
        return res.statue(500).json({
            success:false,
            message:err.message,
        })
    }
  

    //order create kro 

    const amount =course.price;
    const currency="INR";
    const options={
        amount:amount*100,
        currency,
        receipt:Math.random(Date.now()).toString(),
        notes:{
            courseId:course_id,
            userId,
        }
    };

    try{
        const paymentResponse=await instance.orders.create(options);
        console.log(paymentResponse);
        return res.status(200).json({
            success:true,
            courseName:course.courseName,
            courseDescription:course.courseDescription,
            thumbnail:course.thumbnail,
            orderId:paymentResponse.id,
            currency:paymentResponse.currency,
            amount:paymentResponse.amount,
        })
        
    }catch(error){
        console.log(error);
        return res.json({
            success:false,
            message:"could not initiate order",
        })
    }
    //return response
}