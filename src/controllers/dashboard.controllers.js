const mongoose = require('mongoose');
const { Video } = require('../models/video.model');
const { Subscription } = require('../models/subscription.model');
const { Like } = require('../models/like.model');
const { ApiError } = require('../utils/ApiError');
const { ApiResponse } = require('../utils/ApiResponse');
const { asyncHandler } = require('../utils/asyncHandler');


const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
})

module.exports = {
    getChannelStats,
    getChannelVideos
}