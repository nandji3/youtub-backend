const express = require("express");
const { registerUser } = require("../controllers/user.controllers");
const { upload } = require("../middlewares/multer.middleware");

const router = express.Router();

const uploadMiddleware = upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'coverImage', maxCount: 1 }])
// Extract file or array of image in this way in controller form req multer add new key file in req . 
//  req.files['avatar'] -> Array - if maxCount more then 1
//  req.files['avatar'][0] -> File - if maxCount 1
//  req.files['coverImage'] -> Array - if maxCount more then 1
//  req.files['coverImage'] -> File - if maxCount 1

router.route("/register")
    .post(uploadMiddleware, registerUser)

module.exports = router;