const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Đảm bảo bạn đã thiết lập file database.js

class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'user_id', // Liên kết với cột `user_id` trong database
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slogan:{
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    avatar_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    date_of_birth: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM("normal", "vip"), // Phân quyền tài khoản
      defaultValue: "normal",
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at', // Liên kết với cột `created_at`
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updated_at', // Liên kết với cột `updated_at`
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users', // Tên bảng trong cơ sở dữ liệu
    timestamps: true,    // Tự động xử lý `createdAt` và `updatedAt`
  }
  
);


module.exports = User;
