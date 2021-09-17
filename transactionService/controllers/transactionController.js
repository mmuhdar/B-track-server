const { Transaction } = require("../models");

class TransactionController {
  static async create(req, res, next) {
    try {
      const { name, date, amount, invoice, BudgetId, UserId } = req.body;
      const transactionData = { name, date, amount, invoice, BudgetId, UserId };
      const data = await Transaction.create(transactionData);
      res.status(201).json(data);
    } catch (err) {
      next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const found = await Transaction.findByPk(id);
      if (!found) {
        throw { name: "NotFound" };
      } else {
        const { name, date, amount, invoice, BudgetId, UserId } = req.body;
        const transactionData = {
          name,
          date,
          amount,
          invoice,
          BudgetId,
          UserId,
        };
        await Transaction.update(transactionData, { where: { id } });
        res.status(200).json({ message: `Update success for ID ${id}` });
      }
    } catch (err) {
      next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const found = await Transaction.findByPk(id);
      if (!found) {
        throw { name: "NotFound" };
      } else {
        await Transaction.destroy({ where: { id } });
        res.status(200).json({ message: `Success delete data with ID ${id}` });
      }
    } catch (err) {
      next(err);
    }
  }
}

module.exports = TransactionController;