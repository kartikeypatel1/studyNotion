const cloudinary=require('cloudinary').v2;
exports.uploadImageCloudinary=async(File,Folder,innerHeight,quality)=>{
    const options={folder};
    if(height){
        options.height=height;
    }
    if(quality){
        options.quality=quality;
    }
    options.resource_type="auto";
    return await cloudinary.uploader.upload(File.tempFilePath,options);
}