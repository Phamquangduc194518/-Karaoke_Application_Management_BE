// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController')
const { authenticateToken, authorizeRole } = require('../authMiddleware');
const { upload, uploadAvatar } = require('../controllers/userController');

router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.post('/logout',authenticateToken,UserController.logout);
router.patch('/updateProfile',authenticateToken,UserController.updateProfile)// update của người dùng
router.patch('/users/update/:id',UserController.updateUser)
router.get('/userProfile',authenticateToken,UserController.userProfile)
router.post('/createRecordedSong',authenticateToken,UserController.createRecordedSong)
router.get('/getRecordedSongList',UserController.getRecordedSongList)
router.post('/createComment',authenticateToken,UserController.CreateComment)
router.get('/getComments/:song_id',UserController.getCommentList)
router.post('/createTopic', UserController.createTopic)
router.get('/getAllTopicsWithVideo',UserController.getAllTopicsWithVideo)
router.post('/createVideoOfTopic', UserController.createVideoOfTopic)
router.post('/createIsFavorite',authenticateToken,UserController.createIsFavorite)
router.delete('/removeIsFavorite/:song_id',authenticateToken, UserController.removeIsFavorite)
router.get('/getIsFavorite',authenticateToken,UserController.getIsFavorite)
router.get('/getIsFavoriteToSongID',authenticateToken,UserController.getIsFavoriteToSongID)
router.get('/getUserProfile/:user_id',authenticateToken,UserController.getUserProfile)

router.post("/follow", authenticateToken, UserController.followUser);
router.post("/unfollow", authenticateToken, UserController.unfollowUser);
router.get("/checkFollowStatus/:following_id", authenticateToken, UserController.checkFollowStatus);
router.get("/followers/:user_id", UserController.getFollowers);
router.get("/following/:user_id", UserController.getFollowing);

router.post('/CreateCommentVideo',authenticateToken,UserController.CreateCommentVideo)
router.get('/getCommentVideoList/:video_id',UserController.getCommentVideoList)

router.post('/verifyPurchase', UserController.verifyPurchase);
router.post('/uploadAvatar',authenticateToken,upload.single('image'),UserController.uploadAvatar);
module.exports = router;
