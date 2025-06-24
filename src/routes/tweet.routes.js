import { Router } from 'express';
import { verifyJWT } from '../middlewares/authentication.middleware';
import { createTweet, deleteTweet, getUserTweets, updateTweet } from '../controllers/tweet.controllers';


const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/")
    .post(createTweet);
router.route("/user/:userId")
    .get(getUserTweets);
router.route("/:tweetId")
    .patch(updateTweet)
    .delete(deleteTweet);

export default router