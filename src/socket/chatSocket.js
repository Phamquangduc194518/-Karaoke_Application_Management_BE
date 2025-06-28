const jwt = require('jsonwebtoken');
const ChatRoomUser = require('../model/ChatRoomUsers');
const ChatRoom = require('../model/ChatRoom');
const ChatMessage = require('../model/ChatMessage');
const ChatMessageStatus = require('../model/ChatMessageStatus');
const sequelize = require('../config/database');
const { User } = require('../model');
const { Op, Sequelize } = require("sequelize");
const admin = require('firebase-admin');
const NotificationUser = require('../model/NotificationUser');
const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_FIREBASE);


if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const registerSocketHandlers = (namespace) => {
  namespace.on('connection', (socket) => {
    const token = socket.handshake.query.token;
    if (!token) {
      return socket.disconnect();
    }
    let userId;
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      userId = payload.id;
    } catch (err) {
      return socket.disconnect();
    }
    socket.join(`user_${userId}`);
    console.log(`Client connected: user_${userId}`);
    namespace.emit('user_connected', { userId });
    socket.on('message', async ({ event, data }) => {
      if (event === 'private_message') {
        const { content, to } = data;
        console.log(`[Check data] Từ user_${userId} đến user_${to} với nội dung:`, content);
        const recipient = await User.findByPk(to);
        if (!recipient) {
          return socket.emit('error', 'Người nhận không tồn tại');
        }
        const roomOfHost = await ChatRoomUser.findAll({
          where: { user_id: userId },
          attributes: ['room_id'],
        });
        const roomIds = roomOfHost.map(room => room.room_id);
        const roomOfTo = await ChatRoomUser.findAll({
          where: { user_id: to },
          attributes: ['room_id'],
        });
        const roomIdsOfTo = roomOfTo.map(room => room.room_id);
        const commonRoomIds = roomIds.filter(id => roomIdsOfTo.includes(id));
        let room = null;
        if (commonRoomIds.length > 0) {
          room = await ChatRoom.findOne({
            where: { room_id: commonRoomIds[0] },
            include: [{ model: ChatRoomUser, as: 'members' }]
          });
        }
        if (room) {
          console.log('Đã tìm thấy phòng chung:', room.room_id);
        } else {
          console.log('Không có phòng chung');
        }
        const sender = await User.findByPk(userId);
        if (!sender) {
          return socket.emit('error', 'Người gửi không tồn tại');
        }
        if (!room) {
          room = await ChatRoom.create({ created_by: userId });
          await ChatRoomUser.bulkCreate([
            { room_id: room.room_id, user_id: userId },
            { room_id: room.room_id, user_id: to }
          ]);
          console.log(`Tạo phòng mới: room_id = ${room.room_id}`);
        }
        if (userId === to) {
          return socket.emit('error', 'Không thể nhắn tin cho chính mình');
        }
        const msg = await ChatMessage.create({
          room_id: room.room_id,
          sender_id: userId,
          content,
          type: 'text'
        });
        await ChatMessageStatus.bulkCreate([
          { message_id: msg.message_id, user_id: to, status: 'sent' },
        ]);
        const payloadToClient = {
          message_id: msg.message_id,
          room_id: room.room_id,
          sender_id: userId,
          content,
          createdAt: msg.createdAt,
          status: 'sent',
          sender: {
            sender_id: userId,
            username: sender.username,
            avatar_url: sender.avatar_url
          }
        };
        console.log("payload", payloadToClient)
        namespace.to(`user_${to}`).emit('private_message', payloadToClient);
        namespace.to(`user_${userId}`).emit('private_message', payloadToClient);
        if (recipient && recipient.device_token) {
          sendNotificationMessage(recipient.device_token, sender.username);
        }
        await NotificationUser.create({
          recipient_id: to,
          sender_id: userId,
          type: 'Message',
          message: `${sender.username} đã gửi một tin nhắn cho bạn`
        });
      }
      if (event === 'mark_delivered') {
        console.log('mark_delivered via wrapper:', data);

        const { messageId, userId: recipientId } = data;
        try {
          const message = await ChatMessage.findByPk(messageId);
          if (!message) return socket.emit('error', 'Tin nhắn không tồn tại');

          const [cnt] = await ChatMessageStatus.update(
            { status: 'delivered', updated_at: new Date() },
            { where: { message_id: messageId, user_id: recipientId, status: 'sent' } }
          );
          console.log('🛠️ rows updated:', cnt);

          if (cnt > 0) {
            const payload = {
              message_id: messageId,
              user_id: recipientId,
              status: 'delivered',
              updatedAt: new Date()
            };
            console.log("payload", payload)
            namespace.to(`user_${recipientId}`).emit('message_status_updated', payload);
            namespace.to(`user_${message.sender_id}`).emit('message_status_updated', payload);
          }
        } catch (err) {
          console.error('mark_delivered error:', err);
          socket.emit('error', err.message);
        }
      }
      if (event === 'mark_read') {
        console.log('mark_read via wrapper:', data);
        const { messageId, userId } = data;
        console.log(`Received mark_read: messageId=${messageId}, userId=${userId}`)
        const updated = await ChatMessageStatus.update(
          { status: 'read', updated_at: new Date() },
          {
            where: {
              message_id: messageId,
              user_id: userId,
              status: { [Op.in]: ['sent', 'delivered'] },
            },
          }
        );
        if (updated[0] > 0) {
          const message = await ChatMessage.findByPk(messageId);
          const statusPayload = { message_id: messageId, user_id: userId, status: 'read' };
          namespace.to(`room_${message.room_id}`).emit('mark_read', statusPayload);
        }
      }
    });

    socket.on('disconnect', () => {
      socket.leave(`user_${userId}`);
      console.log(`👋 User ${userId} left chat`);
    });
  });
};


function sendNotificationMessage(deviceToken, senderUser) {
  const message = {
    notification: {
      title: `${senderUser} gửi tin nhắn cho bạn!`
    },
    token: deviceToken
  };
  admin.messaging().send(message)
    .then((response) => {
      console.log("Thông báo admin đã được gửi thành công:", response);
    })
    .catch((error) => {
      console.error("Lỗi khi gửi thông báo từ admin:", error);
    });
}


module.exports = registerSocketHandlers;


