const mongoose = require("mongoose");

const DB_NAME = require("../constant")

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log("MongoDB connection faild", error);
        process.exit(1);
    }
}

module.exports = connectDB;