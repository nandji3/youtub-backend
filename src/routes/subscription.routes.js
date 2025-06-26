const { Router } = require('express');
const { verifyJWT } = require('../middlewares/authentication.middleware');
const {
    getSubscribedChannels,
    getUserChannelSubscribers,
    toggleSubscription
} = require('../controllers/subscription.controllers');

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/c/:channelId")
    .get(getSubscribedChannels)
    .post(toggleSubscription);

router.route("/u/:subscriberId")
    .get(getUserChannelSubscribers);

module.exports = router;