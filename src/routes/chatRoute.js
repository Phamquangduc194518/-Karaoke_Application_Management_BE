const express = require('express');
const router = express.Router();
const ChatController = require('../controllers/chatController');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

router.get("/getOnlineFollowingUsers", authenticateToken, ChatController.onlineUsers)
router.get("/rooms",authenticateToken,ChatController.getRooms);
router.get("/rooms/:roomId/messages",authenticateToken,ChatController.getMessages);

module.exports= router;