const {Model, DataTypes} = require("sequelize");
const sequelize = require("../config/database")
const User = require("./User")

class Follow extends Model{}

Follow.init({
    follower_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: User,
          key: "user_id",
        },
        onDelete: "CASCADE",
      },
      following_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: User,
          key: "user_id",
        },
        onDelete: "CASCADE",
      },
    },
    {
      sequelize,
      modelName: "Follow",
      tableName: "follows",
      timestamps: true,
    }
);

module.exports = Follow
