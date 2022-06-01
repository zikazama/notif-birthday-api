"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class birthday extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  birthday.init(
    {
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      date: DataTypes.DATE,
      location: DataTypes.STRING,
      isSent: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    {
      sequelize,
      modelName: "birthday",
    }
  );
  return birthday;
};
