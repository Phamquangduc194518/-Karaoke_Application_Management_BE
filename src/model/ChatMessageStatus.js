const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const ChatMessage = require('./ChatMessage');
const User        = require('./User');

class ChatMessageStatus extends Model {}
ChatMessageStatus.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  message_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: ChatMessage,
      key:   'message_id'
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
  status: {
    type: DataTypes.ENUM('sent','delivered','read'),
    allowNull: false,
    defaultValue: 'sent',
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  }
}, {
  sequelize,
  modelName: 'ChatMessageStatus',
  tableName: 'chat_message_status',
  timestamps: false,
});

ChatMessageStatus.belongsTo(ChatMessage, { foreignKey: 'message_id', as: 'message' });
ChatMessage.hasMany(ChatMessageStatus, { foreignKey: 'message_id', as: 'statuses' });

ChatMessageStatus.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(ChatMessageStatus, { foreignKey: 'user_id', as: 'messageStatuses' });

module.exports = ChatMessageStatus;
