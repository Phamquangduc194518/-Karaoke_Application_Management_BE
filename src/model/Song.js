const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Artist = require('./Artist');


class Song extends Model {}

Song.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    subTitle: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    artist_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Artist,
        key: 'id',
      },
    },
    genre: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lyrics: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    audio_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    url_image: {
      type: DataTypes.STRING,
      allowNull: true, // URL ảnh minh họa cho bài hát
    },
    duration: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    is_duet: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false, // Mặc định là đơn ca
    },
    vip_required: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updated_at',
    },
  },
  {
    sequelize,
    modelName: 'Song',
    tableName: 'songs',
    timestamps: true,
  }
);
module.exports = Song;
