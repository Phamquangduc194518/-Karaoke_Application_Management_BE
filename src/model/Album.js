const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Artist = require('./Artist');

class Album extends Model {}

Album.init(
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
    cover_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    release_date: {
      type: DataTypes.DATE,
      allowNull: true,
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
    modelName: 'Album',
    tableName: 'albums',
    timestamps: true,
  }
);

module.exports = Album;
