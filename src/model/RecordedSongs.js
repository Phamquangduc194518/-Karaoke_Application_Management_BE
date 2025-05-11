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
            onDelete: 'CASCADE', 
            onUpdate: 'CASCADE', 
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
            allowNull: true, 
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
        statusFromAdmin:{
          type: DataTypes.ENUM('pending', 'approved', 'rejected'),
          defaultValue: 'pending'
          },
        status: {
            type: DataTypes.ENUM('public', 'private'),
            defaultValue: 'public',
          },
        rejectReason: {
            type: DataTypes.TEXT,
            allowNull: true,
          }
    },
    {
        sequelize,
        modelName: 'RecordedSong',
        tableName: 'RecordedSong',
    }
);
RecordedSong.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
module.exports = RecordedSong;