
// External Modules
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

// Core Modules
const path = require('path');

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));


app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser())


// Local Module ---> Routes import
const userRouter = require("./routes/user.routes")
const healthcheckRouter = require("./routes/healthcheck.routes")
const tweetRouter = require("./routes/tweet.routes")
const subscriptionRouter = require("./routes/subscription.routes")
const videoRouter = require("./routes/video.routes")
const commentRouter = require("./routes/comment.routes")
const likeRouter = require("./routes/like.routes")
const playlistRouter = require("./routes/playlist.routes")
const dashboardRouter = require("./routes/dashboard.routes")


// Routes declaration
// http://localhost:9090/api/v1/users/register
app.use("/api/v1/healthcheck", healthcheckRouter)
app.use("/api/v1/users", userRouter)
app.use("/api/v1/tweets", tweetRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/likes", likeRouter)
app.use("/api/v1/playlist", playlistRouter)
app.use("/api/v1/dashboard", dashboardRouter)
const { rootDir } = require("./utils/path")


// Example how to serve HTML Page in backend
app.get("/contact-us", (req, res, next) => {
    console.log("GET request :", req.url, req.method)
    res.status(200).sendFile(path.join(rootDir, 'views', 'contact-us.html'));

});


app.post('/contact-us', (req, res, next) => {
    console.log("POST request details:", req.url, req.method, req.body);
    res.send(`<h2>Thank you, ${req.body.name}. We received your profile!</h2>`);
});

// 404 route
app.use((req, res, next) => {
    res.status(404).sendFile(path.join(rootDir, 'views', '404.html'));
});


module.exports = { app }