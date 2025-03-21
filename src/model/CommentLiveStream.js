
const {Model, DataTypes} = require('sequelize')
const sequelize = require('../config/database');
const LiveStream = require('./LiveStream');
const User = require('./User')
class CommentLiveStream extends Model{}

CommentLiveStream.init({
    live_comment_id:{
      type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
    },
    stream_id:{
        type: DataTypes.INTEGER,
        allowNull: false,
        references:{
                model: LiveStream,
                key: 'stream_id'
        },
        onDelete: 'CASCADE', 
        onUpdate: 'CASCADE', 

    },
    user_id:{
        type: DataTypes.INTEGER,
        allowNull : false,
        references:{
                model: User,
                key: 'user_id'
        },
        onDelete: 'CASCADE', 
        onUpdate: 'CASCADE', 
    },
    comment_text: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    url_sticker: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    url_image: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    status:{
        type: DataTypes.ENUM('public', 'private'),
        defaultValue: 'public'
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
},
{
    sequelize,
    modelName: 'CommentLiveStream',
    tableName: 'comment_live_stream',
    timestamps: true,
}
);

module.exports= CommentLiveStream;