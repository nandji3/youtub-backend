//this is also know to protected route
const { ApiError } = require("../utils/ApiError");
const { asyncHandler } = require("../utils/asyncHandler");
const JWT = require("jsonwebtoken")
const { User } = require("../models/user.model")

const verifyJWT = asyncHandler(async (req, _, next) => {
    let accessToken;

    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer")) {
        accessToken = authHeader.split(' ')[1];
    } else if (!accessToken && req.cookies?.accessToken) {
        accessToken = req.cookies.accessToken;
    }

    if (!accessToken) throw new ApiError(401, "Unauthorized: No access token provided");

    try {
        const decodedAccessToken = JWT.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedAccessToken?._id).select("-password -refreshToken");

        // Need to generate access token with the help of refresh token
        if (!user) throw new ApiError(401, "Unauthorized: User not found");

        req.user = user;

        next();
    } catch (error) {
        throw new ApiError(401, error?.message ||
            "Invalid access token."
        )

    }

})

module.exports = { verifyJWT }; 