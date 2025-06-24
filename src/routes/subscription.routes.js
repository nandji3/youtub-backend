import { Router } from 'express';
import { verifyJWT } from '../middlewares/authentication.middleware';
import { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription } from '../controllers/subscription.controllers';


const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/c/:channelId")
    .get(getSubscribedChannels)
    .post(toggleSubscription);

router.route("/u/:subscriberId")
    .get(getUserChannelSubscribers);

export default router