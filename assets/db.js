//database connection file
require('dotenv').config()
const mysql=require('mysql2/promise');


const pool=mysql.createPool({
    host: process.env.AWS_HOST,
    user: process.env.AWS_ROOT,
    password: process.env.AWS_PASSWORD,
    database:'complaints2',
    port:"3306"
})

//make database connection


const makeConnection =async()=>{
    try {
        const connection=await pool.getConnection(async conn=>conn)
        console.log("Connected SuccessFully")
        return connection
    } catch (error) {
        console.log(error.message)
    }
   
}


module.exports=makeConnection

