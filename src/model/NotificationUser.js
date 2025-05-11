const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class NotificationUser extends Model{}
NotificationUser.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  recipient_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  sender_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM("Follow","Replies","RejectReason"),
    defaultValue:"Follow",
  },
  message: {
    type: DataTypes.STRING,
    allowNull: false
  },
  is_read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, 
{
  sequelize,
  modelName: 'NotificationUser',
  tableName: 'notifications',
  timestamps: true,
});

module.exports = NotificationUser;
