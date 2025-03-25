const { Model, DataTypes} = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User')

class RequestFromUser extends Model{}

RequestFromUser.init(
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
            },
            onDelete: 'CASCADE', 
            onUpdate: 'CASCADE', 
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        content: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        contactInformation: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status: {
            type: DataTypes.TINYINT,
            defaultValue: 0,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: 'RequestFromUser',
        tableName: 'request_from_users', 
        timestamps: true,
      }
);
module.exports = RequestFromUser;