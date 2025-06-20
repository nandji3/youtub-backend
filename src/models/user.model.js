const mongoose = require("mongoose")
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    avatar: {
        type: String, //cloudinary url
        required: true
    },
    coverImage: {
        type: String
    },
    watchHistory: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video"
    }],
    password: {
        type: String,
        required: [true, "Password is required !"],
        trim: true,
    },
    refreshToken: {
        type: String
    }


}, { timestamps: true });

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = bcrypt.hash(this.password, salt);

    next();
})

userSchema.method.isPasswordCorrect = async function (passwordSendByUser) {
    return await bcrypt.compare(passwordSendByUser, this.password);
}


userSchema.method.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },

        process.env.ACCESS_TOKEN_SECRET,

        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    )
}
userSchema.method.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },

        process.env.REFRESH_TOKEN_SECRET,

        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    )
}

const User = mongoose.model("User", userSchema);

module.exports = { User };

