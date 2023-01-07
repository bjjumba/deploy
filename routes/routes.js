const express=require('express')
const router=express.Router()
const multer=require('multer')
const{storage}=require('../middleware/middleware')

//intialize multer
const upload=multer({storage:storage})

const {
    login,
    register,
    changePassword,
    uploadImage,
    submitComplaint,
    getStudentComplaints
} =require('../controllers/controller')

router.post('/student/login',login)
router.post('/student/register',register)
router.patch('/student/updatePassword',changePassword)
router.post('/image',upload.single('image'),uploadImage)
router.post('/student/addComplaint',submitComplaint)

//our get request
router.post('/student/getAllComplaints',getStudentComplaints)

module.exports=router