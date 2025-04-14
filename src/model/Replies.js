const { Model, DataTypes} = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const RequestFromUser = require('./RequestFromUser');

class Replies extends Model{}

Replies.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
          },
          request_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
              model: RequestFromUser,
              key: 'id',
            },
            onDelete: 'CASCADE',
          },
          content: {
            type: DataTypes.TEXT,
            allowNull: false,
          },
    },
    {
        sequelize,
        modelName: 'Replies',
        tableName: 'replies', 
        timestamps: true,
      }
);
module.exports = Replies;