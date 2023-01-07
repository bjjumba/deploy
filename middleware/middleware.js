
const multer=require('multer')



/*************************IMAGE MIDDLEWARE***************************************** */
exports.storage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'uploads')
    },
    filename:(req,file,cb)=>{
        cb(null,file.originalname)
    }
})
