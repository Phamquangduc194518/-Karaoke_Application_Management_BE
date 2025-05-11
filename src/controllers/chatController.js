const { Follow, User } = require("../model");
const ChatRoom = require("../model/ChatRoom");
const ChatRoomUser = require("../model/ChatRoomUsers");
const sequelize     = require("../config/database"); 
const ChatMessage = require("../model/ChatMessage");
const ChatMessageStatus = require("../model/ChatMessageStatus");

const onlineUsers = async (req, res) =>{
    try{
       const userId = req.user.id
       const following = await Follow.findAll({
            where: { follower_id: userId },
            attributes: ['following_id'],
        });
        if (!following || following.length === 0) {
            return res.status(200).json([]);
        }
        const followingId = following.map(f => f.following_id);
        const onlineUser = await User.findAll({
            where: {id: followingId, active : true },
            attributes: ['user_id', 'username', 'avatar_url'],
        })
        res.status(200).json(onlineUser);
    }catch(error){
        res.status(500).json({ error: 'Internal server error' });
    }
}

const getRooms = async(req, res) =>{
    try {
        const userId = req.user.id;
        const rooms = await ChatRoom.findAll({
          include:[
            {
              model: ChatMessage,
              as: 'messages',
              separate: true,
              order: [['createdAt', 'DESC']],
              limit: 1,
              include: [{
                  model: User,
                  as: 'sender',
                  attributes: ['username', 'avatar_url']
            }]
            },
            {
              model: ChatRoomUser,
              as: 'members',
              include: [{
                model: User,
                as: 'user',
                attributes: ['user_id', 'username', 'avatar_url']
              }]
            }
          ],
          where: sequelize.literal(`  
            EXISTS (
              SELECT 1
              FROM chat_room_users cru
              WHERE cru.room_id = ChatRoom.room_id
                AND cru.user_id = ${userId}
            )
          `)
        });
        return res.json(rooms);
      } catch (err) {
        console.error('Error in getRooms:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
}

const getMessages = async (req, res) => {
    try {
      const { roomId } = req.params;
      const userId = req.user.id;
      const messages = await ChatMessage.findAll({
        where: { room_id: roomId },
        include: [
          {
          model: User,
          as: 'sender',
          attributes: ['user_id', 'username', 'avatar_url']
          },
          {
          model: ChatMessageStatus,
          as: 'statuses',
          where: { user_id: userId },
          required: false,
          attributes: ['status', 'updated_at'],
          }
      ],
        order: [['createdAt', 'ASC']]
      });
      return res.json(messages);
    } catch (err) {
      console.error('Error in getMessages:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
  
module.exports = {
    onlineUsers,
    getRooms,
    getMessages
}