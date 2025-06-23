const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
    subscriber: {
        type: mongoose.Schema.Types.ObjectId, //One who is subscribing
        ref: "User"
    },
    channel: {
        type: mongoose.Schema.Types.ObjectId, //One to whom 'subscriber' is subscribing
        ref: "User"
    }

}, { timeStamp: true });

const Subscription = mongoose.model("Subscription", subscriptionSchema);

module.exports = { Subscription };
