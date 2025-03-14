const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Kết nối database

class LiveStream extends Model {}

LiveStream.init({
    stream_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    },
    host_user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('active', 'ended'),
        defaultValue: 'active'
    },
    participants_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    ended_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
},
{
    sequelize,
    modelName: 'LiveStream',
    tableName: 'live_stream', // Tên bảng trong cơ sở dữ liệu
  }
);

module.exports = LiveStream;
