// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController')
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');
const multer = require('multer');
const { route } = require('./adminRoute');
// Sử dụng memory storage: file sẽ được lưu trong req.file.buffer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.post('/logout',authenticateToken,UserController.logout);
router.post('/forgotPassword', UserController.forgotPassword)
router.patch('/updateProfile',authenticateToken,UserController.updateProfile)// update của người dùng
router.patch('/users/update/:id',UserController.updateUser)
router.get('/userProfile',authenticateToken,UserController.userProfile)
router.post('/createRecordedSong',authenticateToken,UserController.createRecordedSong)
router.get('/getRecordedSongList',authenticateToken,UserController.getRecordedSongList)
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

router.post('/verifyPurchase',UserController.verifyPurchase);
router.post('/uploadAvatar',authenticateToken,upload.single('image'),UserController.uploadAvatar);
router.post('/uploadImagePost',upload.single('image'),UserController.uploadImagePost)

router.post('/stickers',UserController.createSticker)
router.get('/stickers',UserController.getSticker)

router.get('/getFollowNotification', authenticateToken,UserController.getFollowNotification);
router.get('/unreadNotifications', authenticateToken,UserController.unreadNotifications);
router.patch("/readNotifications/:notificationId", authenticateToken,UserController.isReadNotification);

router.post('/createIsFavoritePost',authenticateToken,UserController.createIsFavoritePost)
router.delete('/removeIsFavoritePost/:post_id',authenticateToken, UserController.removeIsFavoritePost)
router.get('/getIsFavoritePostToSongID',authenticateToken,UserController.getIsFavoritePostToSongID)
router.get('/getStarAccount',UserController.getStarAccount)

router.post('/updateDeviceToken',authenticateToken,UserController.updateDeviceToken) 
router.post('/SongRequestFromUser', authenticateToken, UserController.SongRequestFromUser)

router.get('/getRecordedSongOfUser', authenticateToken,UserController.getRecordedSongOfUser)
router.post('/makeSongPublic/:songPostId',UserController.makeSongPublic)
router.delete('/removeRecordedSong/:songPostId',UserController.removeRecordedSong)

router.get('/getAllTopicsWithVideoOfAdmin',UserController.getAllTopicsWithVideoOfAdmin)
router.get('/getAllVideoOfTopic/:topicId',UserController.getAllVideoOfTopic)
router.get('/recommendSongs',authenticateToken,UserController.RecommendSongs)
router.get('/search', UserController.search);

router.get('/CheckPostingCondition',authenticateToken, UserController.CheckPostingCondition);
router.get('/activityStatistics',authenticateToken, UserController.activityStatistics);
router.get('/searchByElasticsearch', UserController.searchByElasticsearch);
module.exports = router;
