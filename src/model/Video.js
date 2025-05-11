const{Model, DataTypes} = require('sequelize')
const sequelize = require('../config/database')
const Topic = require('./Topic')
class Video extends Model{}

Video.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
          },
        topicId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references:{
               model: Topic,
               key: 'id' 
            }
          }, 
        title: {
            type: DataTypes.STRING,
            allowNull: false,
          }, 
        subTitle: {
            type: DataTypes.STRING,
            allowNull: false,
          }, 
        url: {
            type: DataTypes.STRING(500),  
            allowNull: false,
        },
        thumbnail: {
            type: DataTypes.STRING(500),  
            allowNull: false,
        },
        duration: {
            type: DataTypes.STRING,
            allowNull: false,
          },
    },
    {
        sequelize,
        modelName: 'Video',
        tableName: 'videos',
        timestamps: false  
    }
);
Video.belongsTo(Topic, { foreignKey: 'topicId', onDelete: 'CASCADE' });
Topic.hasMany(Video, { foreignKey: 'topicId', as: 'videos' });
module.exports = Video;