const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Sticker extends Model {}

Sticker.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    sticker_url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // Optionally, thêm các thông tin bổ sung
    title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Sticker',
    tableName: 'Stickers',
  }
);

module.exports = Sticker;
