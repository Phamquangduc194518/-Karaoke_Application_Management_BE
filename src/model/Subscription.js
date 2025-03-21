const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Đảm bảo file cấu hình database đã được thiết lập

class Subscription extends Model {}

Subscription.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users', // Tên bảng users trong cơ sở dữ liệu
        key: 'user_id',
      },
    },
    purchaseToken: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    orderId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    expiryTime: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updated_at',
    },
  },
  {
    sequelize,
    modelName: 'Subscription',
    tableName: 'subscriptions', // Tên bảng trong cơ sở dữ liệu
    timestamps: true, // Sequelize sẽ tự động quản lý createdAt và updatedAt
  }
);

module.exports = Subscription;
