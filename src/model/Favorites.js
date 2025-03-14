const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Song = require('./Song');

class Favorite extends Model {}

Favorite.init(
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
    song_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Song,  
        key: 'id',
      },
    },
  },
  {
    sequelize,
    modelName: 'Favorite',
    tableName: 'favorites',
    timestamps: false,
  }
);
module.exports = Favorite;
