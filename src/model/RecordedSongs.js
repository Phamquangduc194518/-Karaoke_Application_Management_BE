const { Model, DataTypes} = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User')
class RecordedSong extends Model{}

RecordedSong.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
          },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references:{
                    model: User,
                    key: 'user_id',
            },
            onDelete: 'CASCADE', // Xóa bản ghi liên quan nếu user bị xóa
            onUpdate: 'CASCADE', // Cập nhật khóa nếu id trong Users thay đổi
          },
        song_name: {
            type: DataTypes.STRING,
            allowNull: false,
          },
        title: {
            type: DataTypes.STRING,
            allowNull: true,
          },
        recording_path: {
            type: DataTypes.STRING,
            allowNull: false,
          },
        cover_image_url: {
            type: DataTypes.STRING,
            allowNull: true, // Cho phép null nếu không có ảnh
          },
        upload_time: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
          },
        likes_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
          },
        comments_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
          },
        status: {
            type: DataTypes.ENUM('public', 'private'),
            defaultValue: 'public',
          },
    },
    {
        sequelize,
        modelName: 'RecordedSong',
        tableName: 'RecordedSong',
    }
);
RecordedSong.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
module.exports = RecordedSong;