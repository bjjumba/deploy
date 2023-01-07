const cloudinary=require('cloudinary').v2
const fs=require('fs');
const crypto=require('crypto')


exports.uploadImage=async(file)=>{
    try{
        let localFilePath=`uploads/${file}`
            let mainFolderName = "Complaints"
      
           let filePathOnCloudinary = mainFolderName + "/" + localFilePath
      
              let data=await cloudinary.uploader.upload(localFilePath,{"public_id":filePathOnCloudinary})
            
              fs.unlinkSync(`uploads/${file}`)
    
              return data
    
              
        } catch (error) {
            console.log(error.message)
        }
}

//generate random number
exports.getTranasactionReference=()=>{
    return  crypto.randomBytes(10).toString('hex')
}