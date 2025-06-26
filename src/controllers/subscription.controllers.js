const mongoose = require('mongoose');
const { isValidObjectId } = mongoose;
const { User } = require('../models/user.model');
const { Subscription } = require('../models/subscription.model');
const { ApiError } = require('../utils/ApiError');
const { ApiResponse } = require('../utils/ApiResponse');
const { asyncHandler } = require('../utils/asyncHandler');



const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    // TODO: toggle subscription
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
})

module.exports = {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}