const {Model, DataTypes} = require('sequelize')
const sequelize = require('../config/database')

class Topic extends Model{}

Topic.init(
    {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
      }  
    },
    {
        sequelize,
        modelName: 'Topic',
        tableName: 'topics',
        timestamps: false
    }
);
module.exports = Topic;