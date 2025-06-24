import { Router } from 'express';
import { verifyJWT } from '../middlewares/authentication.middleware';
import { getLikedVideos, toggleCommentLike, toggleTweetLike, toggleVideoLike } from '../controllers/like.controllers';

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

export default router