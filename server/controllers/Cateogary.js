const Tag=require("..models/Cateogary");


//create tag ka handler function
exports.createCateogary=async(req,res)=>{
    try{
        //fetch the data from the request ki body
        const {name,description}=req.body;
        //validation of the data
        if(!name||!description){
            return res.status(400).json({
                success:false,
                message:"All fields are required",
            })
        }

        //create the entry in database
        const tagDetails=await Tag.create({
            name:name,
            description:description,
        });
        console.log(tagDetails);

        //return the response
        return res.status(200).json({
            success:true,
            message:"Tag created successfully",
        })
    }catch(err){
        return res.status(500).json({
            success:false,
            message:erroe.message,
        })
    }
}

//get all tag
exports.showAllCateogary=async (req,res)=>{
    try{
        const allTags=await Tag.find({},{name:true,description:true});
        return res.status(200).json({
            success:true,
            messages:"All tags returned successfully",
            allTags,
        })
    }catch(err){
        return res.status(500).json({
            success:false,
            messages:err.message,
        })
    }
}