const express = require("express");
const {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getUserProfile,
    forgotPassword,
    resetPassword,
    changeCurrentUserPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
} = require("../controllers/user.controllers");
const { upload } = require("../middlewares/multer.middleware");
const { verifyJWT } = require("../middlewares/authentication.middleware");
const { loginLimiter, forgotPasswordLimiter } = require("../utils/rateLimiters");


const router = express.Router();

const uploadMiddleware = upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'coverImage', maxCount: 1 }])
// Extract file or array of image in this way in controller form req multer add new key file in req . 
//  req.files['avatar'] -> Array - if maxCount more then 1
//  req.files['avatar'][0] -> File - if maxCount 1
//  req.files['coverImage'] -> Array - if maxCount more then 1
//  req.files['coverImage'] -> File - if maxCount 1

router.route("/register")
    .post(uploadMiddleware, registerUser)

router.route("/login")
    .post(loginLimiter, loginUser)


router.route("/logout")
    .post(verifyJWT, logoutUser) // *** Secured or Protected Routes *** ==> jane se pehle jwt verification se mil kar jana

router.route("/refresh-token")
    .post(refreshAccessToken)

router.route("/change-password")
    .post(changeCurrentUserPassword)

router.route("/change-password")
    .post(verifyJWT, changeCurrentUserPassword)

router.route("/current-user")
    .post(verifyJWT, getCurrentUser)

router.route("/update-account")
    .patch(verifyJWT, updateAccountDetails)

router.route("/update-avatar")
    .patch(verifyJWT, upload.single("avatar"), updateUserAvatar)

router.route("/update-cover-image")
    .patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)

router.route("/channel/:username")
    .get(verifyJWT, getUserChannelProfile)

router.route("/watch-history")
    .get(verifyJWT, getWatchHistory)

router.route("/profile")
    .get(verifyJWT, getUserProfile); // *** Secured or Protected Routes *** ==> jane se pehle jwt verification se mil kar jana

router.route("/forgot-password")
    .post(forgotPasswordLimiter, forgotPassword);

router.route("/reset-password/:token")
    .post(resetPassword);

module.exports = router;


















// ***How to inject other middleware like authorization role***

// const { ROLES } = require("../constant");
// const { verifyJWT } = require("../middlewares/authentication.middleware");
// const { authorizeRoles } = require("../middlewares/authorizeRole.middleware");

// router.route("/logout")
//     .post(verifyJWT, authorizeRoles(ROLES.ADMIN), getAllUser);