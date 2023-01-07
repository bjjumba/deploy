require('dotenv').config()
const express=require('express')
const cors=require('cors')
const router=require('./routes/routes')
const app=express()

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));


app.use(router)

const PORT=process.env.PORT || 8000
app.listen(PORT, () => {
   console.log(`Server running at port ${PORT}`)
})