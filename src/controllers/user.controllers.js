const { asyncHandler } = require("../utils/asyncHandler");
const { ApiError } = require("../utils/ApiError")
const { ApiResponse } = require("../utils/ApiResponse")
const { User } = require("../models/user.model")
const { uploadOnCloudinay, deleteFromCloudinary } = require("../utils/cloudinary")
const jwt = require("jsonwebtoken");
const CryptoJS = require("crypto-js");
const { sendEmail } = require("../utils/sendEmail");
const { default: mongoose } = require("mongoose");

const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        const user = await User.findOne(userId);

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }

}

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
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files?.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }


    if (!avatarLocalPath) throw new ApiError(400, "Avatar file is required.")


    const avatar = await uploadOnCloudinay(avatarLocalPath);
    const coverImage = await uploadOnCloudinay(coverImageLocalPath);

    // if we want to save on particular folder
    // const avatar = await uploadOnCloudinay(avatarLocalPath, "users/avatars");
    // const coverImage = await uploadOnCloudinay(coverImageLocalPath, "users/covers");

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


const loginUser = asyncHandler(async (req, res) => {
    // req.body ---> data
    // username or email
    // find the user data by mongodb query
    // password check
    // access and refresh token
    // send cookie

    const { username, email, password } = req.body;


    if (!(username || email)) {
        throw new ApiError(400, "Username or email is required!");
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) throw new ApiError(404, "User does not exist.")

    const isMatch = await user.isPasswordCorrect(password);

    if (!isMatch) throw new ApiError(404, "Invalid user credentials.")

    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        // maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    } //means ye cookies only server se modifyable hai not modify from client side

    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                },
                "User logged in successfully!"
            )
        )


});


const logoutUser = asyncHandler(async (req, res, next) => {

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        //  sameSite: "Strict",
    } //means ye cookies only server se modifyable hai not modify from client side

    return res
        .status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(
            new ApiResponse(200, {}, "User logged Out successfully !!")
        )

});

const refreshAccessToken = asyncHandler(async (req, res) => {

    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request: No refresh token provided.");
    }

    try {
        const decodedRefreshToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedRefreshToken._id);
        if (!user) {
            throw new ApiError(401, "Invalid refresh token: User not found.");
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used.");
        }

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessTokenAndRefreshToken(user._id);

        user.refreshToken = newRefreshToken;
        await user.save({ validateBeforeSave: false });

        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
        };

        return res
            .status(200)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", newRefreshToken, cookieOptions)
            .json(
                new ApiResponse(
                    200,
                    {
                        accessToken,
                        refreshToken: newRefreshToken,
                    },
                    "Access token refreshed successfully !!"
                )
            );

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token.");

    }

});


const changeCurrentUserPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user?._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password !")
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(
            new ApiResponse(200, "Password changed successfully !")
        )
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(200, req.user, "current user fetched successfully.")
});


const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;

    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required !")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email
            }
        },
        { new: true }

    ).select("-password");

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                user,
                "Account details updated successfully !"

            )
        )
});

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing.");
    };

    const newAvatar = await uploadOnCloudinay(avatarLocalPath);

    if (!newAvatar.url) {
        throw new ApiError(401, "Error while uploading new avatar on cloudinary !")
    }

    const userBeforeUpdate = await User.findById(req.user._id);
    const oldAvatarUrl = userBeforeUpdate?.avatar;

    if (oldAvatarUrl) {
        await deleteFromCloudinary(oldAvatarUrl);
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                avatar: newAvatar.url
            }
        },
        { new: true }
    ).select("-passowrd");

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                user,
                "New avatar updated successfully."
            )
        );
});


const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path;

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover image file is missing.");
    };

    const newCoverImage = await uploadOnCloudinay(coverImageLocalPath);

    if (!newCoverImage.url) {
        throw new ApiError(401, "Error while uploading new cover image on cloudinary !")
    }

    const userBeforeUpdate = await User.findById(req.user._id);
    const oldCoverImageUrl = userBeforeUpdate?.avatar;

    if (oldCoverImageUrl) {
        await deleteFromCloudinary(oldCoverImageUrl);
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                coverImage: newCoverImage.url
            }
        },
        { new: true }
    ).select("-passowrd");

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                user,
                "New cover image updated successfully."
            )
        )
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;

    if (!username.trim()) {
        throw new ApiError(400, "Username is missing.")
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions", //actial database model name
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                form: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                chanelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                chanelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1
            }
        }
    ]);

    if (!channel?.length) {
        throw new ApiError(404, "Channel does not exists")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, channel[0], "User channel fetched successfully !!")

        )


});


const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id),
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }

                ]
            }
        }
    ])

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                user[0].watchHistory,
                "Watch history fetched successfully."
            )
        )
});


const getUserProfile = asyncHandler(async (req, res) => {
    const userId = req.user?._id;

    if (!userId) {
        throw new ApiError(400, "Invalid or missing user ID from token.");
    }

    const user = await User.findById(userId).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(404, "User not found.");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, user, "User profile fetched successfully."));
});






const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) throw new ApiError(400, "Email is required!");

    const user = await User.findOne({ email });
    if (!user) throw new ApiError(404, "User not found!");

    const resetTokenRaw = CryptoJS.lib.WordArray.random(32).toString();

    const hashedToken = CryptoJS.SHA256(resetTokenRaw).toString();

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetTokenRaw}`;

    const emailHTML = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Reset Your Password</title>
    <style>
      body { font-family: Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 0; }
      .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 0 10px rgba(0,0,0,0.05); color: #111111; }
      h2 { color: #333333; margin-bottom: 20px; }
      p { font-size: 16px; line-height: 1.6; color: #333333; }
      .btn { display: inline-block; background-color: #3b82f6; color: #ffffff; padding: 12px 24px; margin: 30px 0; text-decoration: none; border-radius: 6px; font-size: 16px; }
      .footer { font-size: 13px; color: #888888; text-align: center; margin-top: 30px; border-top: 1px solid #eeeeee; padding-top: 20px; }
      @media (max-width: 600px) {
        .container { padding: 20px; margin: 20px; }
        .btn { width: 100%; text-align: center; box-sizing: border-box; }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>🔐 Reset Your Password</h2>
      <p>Hi <strong>${user.fullName}</strong>,</p>
      <p>We received a request to reset your password. Click the button below. This link will expire in 15 minutes.</p>
      <a href="${resetUrl}" class="btn" target="_blank">Reset Password</a>
      <p>If you didn’t request this, you can ignore this email.</p>
      <div class="footer">Need help? Contact our support team.<br>© ${new Date().getFullYear()} YourAppName. All rights reserved.</div>
    </div>
  </body>
  </html>
  `;

    await sendEmail({
        to: user.email,
        subject: "Reset Your Password",
        html: emailHTML,
    });

    res.status(200).json(new ApiResponse(200, {}, "Reset link sent to email."));
});


const resetPassword = asyncHandler(async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    if (!token || !password) throw new ApiError(400, "Token and new password are required.");

    const hashedToken = CryptoJS.SHA256(token).toString();

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) throw new ApiError(400, "Token is invalid or has expired.");

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    res.status(200).json(new ApiResponse(200, {}, "Password reset successful."));
});




module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentUserPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory,
    getUserProfile,
    forgotPassword,
    resetPassword,
};