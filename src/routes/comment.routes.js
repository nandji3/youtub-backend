import { Router } from 'express';
import { verifyJWT } from '../middlewares/authentication.middleware';
import { addComment, deleteComment, getVideoComments, updateComment } from '../controllers/comment.controllers';


const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/:videoId")
    .get(getVideoComments)
    .post(addComment);

router.route("/c/:commentId")
    .delete(deleteComment)
    .patch(updateComment);

export default router