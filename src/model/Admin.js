const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Admin extends Model{}  

Admin.init({
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
},
{
    sequelize, // Liên kết với Sequelize
    modelName: 'Admin', // Tên Model
    tableName: 'admins', // Tên bảng trong cơ sở dữ liệu
    timestamps: true, // Tự động thêm `createdAt` và `updatedAt`
  }
);
module.exports=Admin;