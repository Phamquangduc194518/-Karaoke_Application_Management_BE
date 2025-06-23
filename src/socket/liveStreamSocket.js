const jwt = require("jsonwebtoken");
const CommentLiveStream = require('../model/CommentLiveStream');
const User = require('../model/User');

const registerLiveStreamSocket = (io) => {
  io.on('connection', async (socket) => {
    console.log("🔥 Có 1 client đang cố kết nối LiveStream Socket...");
    const { streamId, token } = socket.handshake.query;

    if (!streamId || !token) {
      console.warn("⚠️ Socket kết nối thiếu streamId hoặc token");
      socket.disconnect();
      return;
    }
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.warn("Token không hợp lệ:", err.message);
      socket.disconnect();
      return;
    }
    const userId = decoded.id;
    socket.join(`livestream_${streamId}`);
    console.log(`User ${userId} joined livestream_${streamId}`);

    socket.on('send_comment', async (data) => {
      const { comment_text, url_sticker, url_image } = data;

      const newComment = await CommentLiveStream.create({
        stream_id: streamId,
        user_id: userId,
        comment_text,
        url_sticker,
        url_image,
      });

      const fullComment = await CommentLiveStream.findOne({
        where: { live_comment_id: newComment.live_comment_id },
        include: [{ model: User, as: 'userCommentLive', attributes: ['user_id', 'username', 'avatar_url'] }],
      });

      io.to(`livestream_${streamId}`).emit('new_comment', fullComment);
    });

    socket.on('disconnect', () => {
      console.log(`👋 User ${userId} left livestream_${streamId}`);
    });
  });
};

module.exports = registerLiveStreamSocket;
