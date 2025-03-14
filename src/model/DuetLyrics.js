const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class DuetLyrics extends Model{}

DuetLyrics.init(
    {
        song: {
            type: DataTypes.STRING,
            allowNull: false,
          },
        start: {
            type: DataTypes.FLOAT,
            allowNull: false,
          },
        end: {
            type: DataTypes.FLOAT,
            allowNull: false,
          },
        text: {
            type: DataTypes.TEXT,
            allowNull: false,
          },
        singer: {
            type: DataTypes.STRING,
            allowNull: false,
          },
    },
    {
        sequelize,
        modelName: 'DuetLyrics',
        tableName: 'duet_lyrics', 
    }
)

module.exports= DuetLyrics