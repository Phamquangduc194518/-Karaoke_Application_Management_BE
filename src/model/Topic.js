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
    ,
    subTitle:  {
      type: DataTypes.STRING,
      allowNull: false,
    }, 
    duration: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("cơ bản","nâng cao","phát âm","luyện giọng","nổi bật"),
      defaultValue: "cơ bản"
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