const express = require("express");
const { registerUser, loginUser, logoutUser, refreshAccessToken } = require("../controllers/user.controllers");
const { upload } = require("../middlewares/multer.middleware");
const { verifyJWT } = require("../middlewares/authentication.middleware");


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
    .post(loginUser)

// *** Secured or Protected Routes *** ==> jane se pehle jwt verification se mil kar jana
router.route("/logout")
    .post(verifyJWT, logoutUser)
router.route("/refresh-token")
    .post(refreshAccessToken)


module.exports = router;





// ***How to inject other middleware like authorization role***

// const { ROLES } = require("../constant");
// const { verifyJWT } = require("../middlewares/authentication.middleware");
// const { authorizeRoles } = require("../middlewares/authorizeRole.middleware");

// router.route("/logout")
//     .post(verifyJWT, authorizeRoles(ROLES.ADMIN), getAllUser);