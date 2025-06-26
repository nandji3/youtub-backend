const { Router } = require('express');
const { verifyJWT } = require('../middlewares/authentication.middleware');
const {
    getLikedVideos,
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike
} = require('../controllers/like.controllers');

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/toggle/v/:videoId")
    .post(toggleVideoLike);

router.route("/toggle/c/:commentId")
    .post(toggleCommentLike);

router.route("/toggle/t/:tweetId")
    .post(toggleTweetLike);

router.route("/videos")
    .get(getLikedVideos);

module.exports = router;