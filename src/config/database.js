const mysql = require('mysql2');
require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,       // Tên database
  process.env.DB_USER,       // Tên user
  process.env.DB_PASSWORD,   // Mật khẩu
  {
    host: process.env.DB_HOST, // Địa chỉ host
    dialect: 'mysql',          // Loại database
    port: process.env.DB_PORT || 3306, // Cổng MySQL (mặc định 3306)
    define: {
      timestamps: true,        // Thêm `createdAt` và `updatedAt` mặc định
    },
    logging: false,            // Tắt log query (tùy chọn)
  }
);

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully!');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();

module.exports = sequelize;
