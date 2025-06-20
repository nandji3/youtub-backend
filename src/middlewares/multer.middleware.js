const multer = require("multer");
const path = require('path');

const uploadTempPath = path.join(__dirname, "../../public/temp");
// OR
// const uploadTempPath = "public/temp";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadTempPath)
    },
    filename: function (req, file, cb) {
        // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        // cb(null, file.originalname + '-' + uniqueSuffix)
        cb(null, file.originalname)
    }
})

const upload = multer({ storage })

module.exports = { upload }; 