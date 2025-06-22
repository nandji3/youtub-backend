//this is also know to protected route
const { ApiError } = require("../utils/ApiError");
const { asyncHandler } = require("../utils/asyncHandler");
const JWT = require("jsonwebtoken")
const { User } = require("../models/user.model")

const verifyJWT = asyncHandler(async (req, _, next) => {
    let accessToken;

    if (req.header && req.header.authorization && req.header.authorization.startsWith("Bearer")) {
        accessToken = req.header.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
        accessToken = req.cookies.token;
    }

    if (!accessToken) throw new ApiError(401, "Unauthorized request");

    try {
        const decodedAccessToken = JWT.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedAccessToken?._id).select("-password -refreshToken");

        if (!user) throw new ApiError(401, "Invalid access token");

        req.user = user;

        next();
    } catch (error) {
        throw new ApiError(401, error?.message ||
            "Invalid access token."
        )

    }

})

module.exports = { verifyJWT }; 