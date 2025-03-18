const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const RecordedSong = require('./RecordedSongs');

class FavoritePost extends Model {}

FavoritePost.init(
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
      }
    },
    post_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: RecordedSong,  
        key: 'id',
      },
    },
  },
  {
    sequelize,
    modelName: 'FavoritePost',
    tableName: 'favorite_post',
    timestamps: false,
  }
);
module.exports = FavoritePost;
