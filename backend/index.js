const express = require("express");
const cors = require("cors")
const app = express();

app.use(express.json());
app.use(cors());

const mainRouter = require('./routes/index');
app.use("/api/v1" , mainRouter);

// app.use("/api/v2" , mainRouter);

app.listen(3000 , ()=>{
    console.log("Server is running on port 3000")
});