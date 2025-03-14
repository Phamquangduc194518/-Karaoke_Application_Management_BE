const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Video = require('./Video');
class CommentsVideo extends Model{}

CommentsVideo.init(
    {
        id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        user_id:{
            type: DataTypes.INTEGER,
            allowNull: false,
            references:{
                model: User,
                key: 'user_id',
            },
            onDelete: 'CASCADE', // Xóa tất cả bình luận nếu người dùng bị xóa
            onUpdate: 'CASCADE',
        },
        video_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
              model: Video, 
              key: 'id', 
            },
            onDelete: 'CASCADE', 
            onUpdate: 'CASCADE',
          },
        comment_text: {
            type: DataTypes.TEXT,
            allowNull: false,
          },
        comment_time: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
          },
    },
    {
    
        sequelize,
        modelName: 'CommentsVideo',
        tableName: 'CommentsVideo',
    }
);
module.exports=CommentsVideo;