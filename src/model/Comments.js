const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User')
const RecordedSong = require('./RecordedSongs')
class Comments extends Model{}

Comments.init(
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
        song_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
              model: RecordedSong, // Tên của model bảng RecordedSongs
              key: 'id', // Khóa chính của bảng RecordedSongs
            },
            onDelete: 'CASCADE', // Xóa tất cả bình luận nếu bài hát bị xóa
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
        modelName: 'Comments',
        tableName: 'Comments',
    }
);
// 🔥 Thiết lập quan hệ
Comments.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Comments.belongsTo(RecordedSong, { foreignKey: 'song_id' });
module.exports=Comments;