const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const ChatRoom = require('./ChatRoom');
const User     = require('./User');

class ChatRoomUser extends Model {}
ChatRoomUser.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  room_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: ChatRoom,
      key:   'room_id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key:   'user_id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  joined_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  }
}, {
  sequelize,
  modelName: 'ChatRoomUser',
  tableName: 'chat_room_users',
  timestamps: false,
});

ChatRoomUser.belongsTo(ChatRoom, { foreignKey: 'room_id', as: 'room' });
ChatRoom.hasMany(ChatRoomUser, { foreignKey: 'room_id', as: 'members' });
ChatRoomUser.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(ChatRoomUser, { foreignKey: 'user_id', as: 'chatRooms' });

module.exports = ChatRoomUser;
