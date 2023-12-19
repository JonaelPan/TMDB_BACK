const { Sequelize, Model, DataTypes } = require("sequelize");
const db = require("../db/index");
const bcrypt = require("bcrypt");

class Users extends Model {
  hash(password, salt) {
    return bcrypt.hash(password, salt);
  }
  async validatePassword(password) {
    try {
      const hashedPassword = await this.hash(password, this.salt);
      return hashedPassword === this.password;
    } catch (err) {
      return console.error(err);
    }
  }
}

Users.init(
  {
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    favorites: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      defaultValue: [],
    },
    salt: {
      type: DataTypes.STRING,
    },
  },
  { sequelize: db, modelName: "users" }
);

Users.beforeCreate(async (user) => {
  const salt = await bcrypt.genSalt(8);
  user.salt = salt;
  const hash = await user.hash(user.password, salt);
  user.password = hash;
});

module.exports = Users;
