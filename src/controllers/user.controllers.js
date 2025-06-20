const { asyncHandler } = require("../utils/asyncHandler");
const { ApiError } = require("../utils/ApiError")
const { ApiResponse } = require("../utils/ApiResponse")
const { User } = require("../models/user.model")
const { uploadOnCloudinay } = require("../utils/cloudinary")

const registerUser = asyncHandler(async (req, res, next) => {
    // Step-1: Getting user details from frontend
    // Step-2: Validation - user fields not empty
    // Step-3: Check if user already exist by username and email    
    // Step-4: Check for images, avatar
    // Step-5: upload coverImage and avatar to cloudinary and validate avatar only.
    // Step-6: create user object using new constructor keyword and call create entry in db.
    // Step-7: Remove password and refresh token field from response
    // Step-8: Check for user creation successfully done or not.
    // Step-9: Return res to client.

    const { fullName, email, username, password } = req.body;

    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required !")
    }
    if (!email.includes("@")) {
        throw new ApiError(400, "Enter email in correct format!");
    }

    const existedUser = await User.findOne({
        $or: [{ email }, { username }]
    })

    if (existedUser) throw new ApiError(409, "User with email or userName already exists.");

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) throw new ApiError(400, "Avatar file is required.")

    const avatar = await uploadOnCloudinay(avatarLocalPath);
    const coverImage = await uploadOnCloudinay(coverImageLocalPath);

    if (!avatar) throw new ApiError(400, "Avatar file is required.");

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username?.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) throw new ApiError(500, "Something went wrong while registering the user.")

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully.")
    )

})

module.exports = { registerUser };