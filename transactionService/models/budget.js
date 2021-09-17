"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Budget extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Budget.init(
    {
      name: DataTypes.STRING,
      amount: DataTypes.INTEGER,
      date: DataTypes.DATE,
      initial_amount: DataTypes.INTEGER,
      due_date: DataTypes.DATE,
      status: DataTypes.STRING,
      DepartmentId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Budget",
    }
  );
  return Budget;
};