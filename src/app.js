const express = require("express");
const cors = require("cors");
const path = require('path');
const cookieParser = require("cookie-parser");

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));


app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser())


// routes import
const userRouter = require("./routes/user.routes")
const healthcheckRouter = require("./routes/healthcheck.routes")
const tweetRouter = require("./routes/tweet.routes")
const subscriptionRouter = require("./routes/subscription.routes")
const videoRouter = require("./routes/video.routes")
const commentRouter = require("./routes/comment.routes")
const likeRouter = require("./routes/like.routes")
const playlistRouter = require("./routes/playlist.routes")
const dashboardRouter = require("./routes/dashboard.routes")


// routes declaration
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



module.exports = { app }