const makeConnection=require('../assets/db')
const bcrypt = require('bcrypt');
const jwt=require('jsonwebtoken')
const fs=require('fs')
const {uploadImage,getTranasactionReference}=require('../utils/helpers')
const {sendEmail}=require('../utils/sendMail')

//cloudinary config
const cloudinary=require('cloudinary').v2

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_NAME,
    api_key:process.env.CLOUDINARY_KEY,
    api_secret:process.env.CLOUDINARY_SECRET
})

//will be sent to env variables soon
const saltValue=12;


//1.login controller
exports.login=async(req,res)=>{
    const conn=await makeConnection()
    try{
        const {studentNo,password} =req.body
        //check whether field exists
    if(!password||!studentNo ){
        return res.status(201).json({
            success: false,
            message:"This Field Cannot be empty"
        })
    }
   
        const [[user]]=await conn.query("SELECT * FROM student WHERE studentNo =?",[studentNo]);
        
        //check the user
        const passwordCompare=await bcrypt.compare(password,user.password)
        if(passwordCompare==true){
           const token= jwt.sign({user},process.env.TOKEN_SECRET,{expiresIn:'20m'})
            return res.status(201).json({
                success:true,
                token,
                user
            })
        }
       //user doesnot exist
       return res.status(201).json({
        success:true,
        message:"Invalid Login credentials",
       })
    }catch(error){
       return res.status(500).json({
        message:error.message
    })
    }
    
}

//****************************REGISTER********************************** */
//2.register controller
exports.register=async(req,res)=>{
    const connection=await makeConnection()
     try {
        const {regNo,studentNo,firstName,lastName,middleName,email,tel,program,image}=req.body
//check whether field exists
    if(!firstName || !email || !tel  || !program  ||!regNo ||!studentNo || !lastName || !image ){
        return res.status(201).json({
            success: false,
            message:"This Field Cannot be empty",
        })
    }
    //check user existance
    // let query1=`SELECT * FROM students WHERE regNo ='${regNo}'`
    const [[user]]=await connection.query("SELECT * FROM student WHERE regNo =?",[regNo]);
    
    if(user){
        return res.status(201).json({
             sucess:true,
             message:"Account already Exists",
             user
         })
     }
     //hashing password
     //NB:the default password is the student Number
     const salt=await bcrypt.genSalt(saltValue)
     const hashedPassword=await bcrypt.hash(studentNo,salt)
     //upload image and acquire url
     //let data=await uploadImage(req.file.filename)
     //then send data to database
    let query=`INSERT INTO student(regNo,studentNo,firstName,lastName,middleName,program,webmail,telephone,password,signatureUrl) 
       VALUES('${regNo}','${studentNo}','${firstName}',
       '${lastName}','${middleName}',${program},'${email}',
       '${tel}',
       '${hashedPassword}',
       '${image}'
       )
    `
     const [row] =await connection.query(query)
     //add user to enrollment table with insertion Id
     let date=new Date().toISOString().slice(0, 19).replace('T', ' ');
     const enroll=await connection.execute(`INSERT INTO enrolment(user,date) VALUES(?,?)`,[row.insertId,date])
     //code to send email
   

     return res.status(201).json({
        success:true,
        message:"Registration Successfull,account activation details have sent to your email account",
        enroll
     })
     //registration email to user

     } catch (error) {
        return res.status(500).json({
           message:"Server Error",
           error:error.message
        })
     }finally{
        connection.release()
     }

}


//*****************************CHANGE PASSWORD***************************************************** */
//3.controller to change default password
exports.changePassword=async(req,res)=>{
    const conn=await makeConnection()
    try{
        const {studentNo,oldPassword,newPassword} =req.body
        //empty field condition
        if(!studentNo || !oldPassword || !newPassword){
            return res.status(201).json({
                success: false,
                message:"This Field Cannot be empty"
            })
        }
        //write a query to get the studentNo
        const [[student]]=await conn.query("SELECT password FROM students WHERE studentNo =?",[studentNo]);
        //compare previous password to one in the database
        const passwordCompare=await bcrypt.compare(oldPassword,student.password)
        //if the passwords are the same
      if(passwordCompare==true){
        //hash new password for database storage
        const newHashPassword=await bcrypt.hash(newPassword,saltValue)
        //write query to update database
        const [updatedRow]=await conn.execute("UPDATE students SET password=? WHERE studentNo=?",[newPassword,studentNo])

         return res.status(201).json({
            success:true,
            message:"Password changed succesffully",
            updatedRow
           })
      }
        return res.status(201).json({
           success:true,
           message:"Failed to Change Password,please try again"
        })
      
    }catch(error){
        res.status(201).json({message:error.message});
    }finally{
        conn.release()
    }
}



/*******************************RESET FORGOTTEN PASSWORD*************************************************** */

exports.resetPassword=async(req,res)=>{

    try {
        
    } catch (error) {
        
    }finally{
        
    }
}

/**************************************COMPLAINTS SECTION******************************************** */
//4.get all complaints of a particulat student
exports.getStudentComplaints=async(req,res)=>{
    const connection=await makeConnection()
    try {
        const {studentNo}=req.body
        if(!studentNo){
            return res.status(201).json({
                success:true,
                message:"Empty Fields"
            })
        }
        //write query to get id of a particular student
        const [[user]]=await connection.query("SELECT * FROM student WHERE studentNo =?",[studentNo]);
        //use id to get All queries
        const [complaints]=await connection.query("SELECT * FROM complaint WHERE student=?",[user.studentId])
        res.status(201).json({
            success: true,
            complaints
        })
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message:error.message
        })
    }finally{
     connection.release()
    }
}

//5.add complaint of a student
exports.submitComplaint=async(req,res)=>{
    const connection=await makeConnection()
    try {
        //get items from body
        const {studentId,nature,courseUnit,lecturer,year,semester}=req.body
        if(!studentId || !nature || !courseUnit || !lecturer || !year || !semester){
            return res.status(201).json({
                success: false,
                message:"This Field Cannot be empty",
            })
        }
        //then insert complaint
        let refNo=getTranasactionReference()
        let complaint =await connection.execute(`INSERT INTO complaint(complaintReferenceNo,student,
            complaintNature,
            courseUnit,
            lecturer,
            yearOfSitting,
            semester
            ) VALUES(?,?,?,?,?,?,?)`,[refNo,studentId,nature,courseUnit,lecturer,year,semester])
        return res.status(201).json({
            success:true,
            complaint
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error
        })
        
    }finally{
     connection.release()
    }
}
//6.api endpoint for verification
exports.firstLogin=async(req,res)=>{
    
}
/**************************************TEST Route******************************************** */

/***********creating a function */

exports.uploadImage=async(req,res)=>{
  
   try {
      const {password,studentNo,email}=req.body
      await sendEmail(email,password,studentNo)
      res.send(req.body)
   } catch (error) {
      res.send(error.message)
   }
       
}