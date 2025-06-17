const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));


app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
app.use(express.static("public"));
app.use(cookieParser())


// routes import
const userRouter = require("./routes/user.routes")



// routes declaration
// http://localhost:9090/api/v1/users/register
app.use("/api/v1/users", userRouter)



module.exports = { app }