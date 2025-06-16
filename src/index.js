require("dotenv").config({ path: "./.env" });
const connectDB = require("./config/db");
const { app } = require("./app")

const PORT = process.env.PORT || 9000

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port: ${PORT}`);
        });
    })
    .catch((err) => {
        console.log("MongoDB connection failed !!!", err);
    });