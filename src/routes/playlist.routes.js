const { Router } = require('express');
const { verifyJWT } = require('../middlewares/authentication.middleware');
const {
    addVideoToPlaylist,
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getUserPlaylists,
    removeVideoFromPlaylist,
    updatePlaylist
} = require('../controllers/playlist.controllers');

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/")
    .post(createPlaylist)

router.route("/:playlistId")
    .get(getPlaylistById)
    .patch(updatePlaylist)
    .delete(deletePlaylist);

router.route("/add/:videoId/:playlistId")
    .patch(addVideoToPlaylist);
router.route("/remove/:videoId/:playlistId")
    .patch(removeVideoFromPlaylist);

router.route("/user/:userId")
    .get(getUserPlaylists);

module.exports = router;