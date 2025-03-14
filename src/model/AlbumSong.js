const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Album = require('./Album');
const Song = require('./Song');

class AlbumSong extends Model {}

AlbumSong.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    album_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Album,
        key: 'id',
      },
    },
    song_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Song,
        key: 'id',
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
    },
  },
  {
    sequelize,
    modelName: 'AlbumSong',
    tableName: 'album_songs',
    timestamps: true,
  }
);

module.exports = AlbumSong;
