const db=require('mysql2/promise')


const pool=db.createPool({
    host:"127.0.0.1",
    user:"root",
    password:"1234",
    database:"notes",
    port:"3306",
    connectionLimit:10,

})



const makeConnection =async()=>{
    try {
        const connection=await pool.getConnection(async conn=>conn)
        console.log("Connected SuccessFully")
        return connection
    } catch (error) {
        console.log(error.message)
    }
   
}

const fetchRows=async()=>{
    const conn=await makeConnection();
    try {
        let studentNo=2000702087
        //using perepared statements againts sql injections
        //if i want one field
        //INSERT INTO notes 
        // const [rows]=await conn.query("SELECT * FROM students WHERE studentNo=?",[studentNo])
        //ourvalues
        let id=13
        let title="Bible"
        let content="life"
        const insert=await conn.execute("INSERT INTO notes(id,title,content) VALUES(?,?,?)",[id,title,content])

        try {
            const [[book]]=await conn.execute("SELECT id FROM notes WHERE id=?",[id])
            const test=await conn.execute("INSERT INTO test(id,title) VALUES(?,?,?)",[book.id,title])
            console.log(test);
        } catch (error) {
            const deletedItem=await conn.execute("DELETE FROM notes WHERE id=?",[id])
            console.log("item deleted successfully because of some errors");
        }
        
        
    } catch (error) {
        console.log(error.message)
    }finally{
        conn.release();
        console.log("Connection closed")
    }
}
// 
fetchRows()
