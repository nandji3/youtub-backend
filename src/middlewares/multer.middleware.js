const multer = require("multer");
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'public/temp')) // safer path resolution
    },
    filename: function (req, file, cb) {
        // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        // cb(null, file.originalname + '-' + uniqueSuffix)
        cb(null, file.originalname)
    }
})

const upload = multer({ storage })

module.exports = upload;