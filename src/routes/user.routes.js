const express = require("express");
const { registerUser } = require("../controllers/user.controllers");
const router = express.Router();


router.route("/register")
    .post(registerUser)


module.exports = router;