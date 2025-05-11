const express = require('express');
const router = express.Router();
const LiveStreamController = require('../controllers//liveStreamController')
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');


router.post('/createLiveStream', authenticateToken,LiveStreamController.createLiveStream);
router.patch('/updateLiveStream',authenticateToken, LiveStreamController.updateLiveStream);
router.get('/getLiveStreamList', LiveStreamController.getLiveStream);
router.post('/createCommentLiveStream', authenticateToken, LiveStreamController.createCommentLiveStream);
router.get('/getCommentsByStream/:stream_id', LiveStreamController.getCommentsByStream);
module.exports= router;