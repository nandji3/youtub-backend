import { Router } from 'express';
import { verifyJWT } from '../middlewares/authentication.middleware';
import { deleteVideo, getAllVideos, getVideoById, publishAVideo, togglePublishStatus } from '../controllers/video.controllers';


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

export default router