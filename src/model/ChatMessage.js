const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const ChatRoom = require('./ChatRoom');
const User     = require('./User'); 

class ChatMessage extends Model {}
ChatMessage.init({
  message_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  room_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: ChatRoom,
      key: 'room_id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  sender_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'user_id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('text','image','file'),
    allowNull: false,
    defaultValue: 'text',
  }
}, {
  sequelize,
  modelName: 'ChatMessage',
  tableName: 'chat_messages',
  timestamps: true,   
  updatedAt: false,   
});

ChatMessage.belongsTo(ChatRoom, { foreignKey: 'room_id', as: 'room' });
ChatRoom.hasMany(ChatMessage, { foreignKey: 'room_id', as: 'messages' });

ChatMessage.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });
User.hasMany(ChatMessage, { foreignKey: 'sender_id', as: 'sentMessages' });
module.exports = ChatMessage;
