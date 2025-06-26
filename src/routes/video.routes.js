const { Router } = require('express');
const { verifyJWT } = require('../middlewares/authentication.middleware');
const {
    deleteVideo,
    getAllVideos,
    getVideoById,
    publishAVideo,
    togglePublishStatus,
    updateVideo
} = require('../controllers/video.controllers');
const { upload } = require("../middlewares/multer.middleware");


const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

const uploadVideoMiddleware = upload.fields([{ name: "videoFile", maxCount: 1, }, { name: "thumbnail", maxCount: 1, }])

router.route("/")
    .get(getAllVideos)
    .post(uploadVideoMiddleware, publishAVideo);

router.route("/:videoId")
    .get(getVideoById)
    .delete(deleteVideo)
    .patch(upload.single("thumbnail"), updateVideo);

router.route("/toggle/publish/:videoId")
    .patch(togglePublishStatus);

module.exports = router;