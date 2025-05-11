const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

class ChatRoom extends Model {}
ChatRoom.init({
  room_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
        model: User,
        key: 'user_id'
    },
    onDelete: 'CASCADE',  
    onUpdate: 'CASCADE'
  }
}, {
  sequelize,
  modelName: 'ChatRoom',
  tableName: 'chat_rooms',
  timestamps: true,
});
ChatRoom.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
User.hasMany(ChatRoom, { foreignKey: 'created_by', as: 'roomsCreated' });
module.exports = ChatRoom;
