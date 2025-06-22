const multer = require("multer");
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const uploadTempPath = path.join(__dirname, "../../public/temp");
// OR
// const uploadTempPath = "public/temp";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadTempPath)
    },
    filename: function (req, file, cb) {
        cb(null, uuidv4() + path.extname(file.originalname))
    }
})

const upload = multer({ storage })

module.exports = { upload }; 