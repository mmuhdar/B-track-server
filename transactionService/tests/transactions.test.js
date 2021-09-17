const app = require("../app");
const request = require("supertest");
const { User, Budget, Department, sequelize } = require("../models");
const { queryInterface } = sequelize;
const { signToken } = require("../helpers/jwt");

let userData, invalidToken, userToken2, budgetData, transactionData;

const departmentInput = {
  name: "Finance",
};
const user2 = {
  username: "user2",
  email: "user2@mail.com",
  password: "user2",
  role: "staff",
  DepartmentId: "",
};
const inputBudget = {
  name: "Operational",
  amount: 5000000,
  date: "2020-12-12",
  initial_amount: 5000000,
  due_date: "2020-12-12",
  status: "approve",
  DepartmentId: "",
};

beforeAll((done) => {
  Department.create(departmentInput)
    .then((department) => {
      user2.DepartmentId = department.id;
      inputBudget.DepartmentId = department.id;
      return User.create(user2);
    })
    .then((user) => {
      userData = user;
      userToken2 = signToken({ id: user.id, email: user.email });
      invalidToken = signToken({ id: 1000, email: "invalid@mail.com" });
      return Budget.create(inputBudget);
    })
    .then((budget) => {
      budgetData = budget;
      done();
    })
    .catch((err) => done(err));
});

afterAll((done) => {
  queryInterface
    .bulkDelete("Departments", {})
    .then(() => {
      return queryInterface.bulkDelete("Users", {});
    })
    .then(() => {
      return queryInterface.bulkDelete("Budgets", {});
    })
    .then(() => {
      done();
    })
    .catch((err) => done(err));
});

describe("Transaction Route Test", () => {
  describe("POST /transactions", () => {
    test("201 success create transaction", (done) => {
      let inputTransaction = {
        name: "Pen",
        date: new Date(),
        amount: 20000,
        invoice: "cek",
        BudgetId: budgetData.id,
        UserId: userData.id,
      };
      request(app)
        .post(`/transactions`)
        .set("access_token", userToken2)
        .set("Accept", "application/json")
        .send(inputTransaction)
        .then((res) => {
          const { body, status } = res;
          transactionData = body;

          expect(status).toBe(201);
          expect(body).toHaveProperty("id", expect.any(Number));
          expect(body).toHaveProperty("name", inputTransaction.name);
          expect(body).toHaveProperty("date", expect.anything());
          expect(body).toHaveProperty("amount", inputTransaction.amount);
          expect(body).toHaveProperty("BudgetId", budgetData.id);
          expect(body).toHaveProperty("UserId", userData.id);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    test("401 without token", (done) => {
      let inputTransaction = {
        name: "Pen",
        date: new Date(),
        amount: 20000,
        invoice: "cek",
        BudgetId: budgetData.id,
        UserId: userData.id,
      };

      request(app)
        .post(`/transactions`)
        .set("Accept", "application/json")
        .send(inputTransaction)
        .then((res) => {
          const { body, status } = res;
          expect(status).toBe(401);
          expect(body).toHaveProperty("message", expect.any(String));
          done();
        })
        .catch((err) => done(err));
    });

    test("401 Invalid Token", (done) => {
      let inputTransaction = {
        name: "Pen",
        date: new Date(),
        amount: 20000,
        invoice: "cek",
        BudgetId: budgetData.id,
        UserId: userData.id,
      };

      request(app)
        .post(`/transactions`)
        .set("Accept", "application/json")
        .set("access_token", invalidToken)
        .send(inputTransaction)
        .then((res) => {
          const { body, status } = res;

          expect(status).toBe(401);
          expect(body).toHaveProperty("message", expect.any(String));
          return done();
        })
        .catch((err) => done(err));
    });

    test("400 validation error", (done) => {
      request(app)
        .post(`/transactions`)
        .set("Accept", "application/json")
        .set("access_token", userToken2)
        .then((res) => {
          const { body, status } = res;
          expect(status).toBe(400);
          expect(body).toHaveProperty("message", expect.anything());
          return done();
        })
        .catch((err) => done(err));
    });
  });

  describe("PUT /transactions/:id", () => {
    test("200 success update transaction", (done) => {
      let inputTransaction = {
        name: "Pen",
        date: new Date(),
        amount: 15000,
        invoice: "cek",
        BudgetId: budgetData.id,
        UserId: userData.id,
      };

      request(app)
        .put(`/transactions/${transactionData.id}`)
        .set("Accept", "application/json")
        .set("access_token", userToken2)
        .send(inputTransaction)
        .end((err, res) => {
          if (err) return done(err);
          const { body, status } = res;

          expect(status).toBe(200);
          expect(body).toHaveProperty("message", expect.any(String));
          return done();
        });
    });

    test("401 without token", (done) => {
      let inputTransaction = {
        name: "Pen",
        date: new Date(),
        amount: 20000,
        invoice: "cek",
        BudgetId: budgetData.id,
        UserId: userData.id,
      };

      request(app)
        .put(`/transactions/${transactionData.id}`)
        .set("Accept", "application/json")
        .send(inputTransaction)
        .end((err, res) => {
          if (err) return done(err);
          const { body, status } = res;

          expect(status).toBe(401);
          expect(body).toHaveProperty("message", "login first !");
          return done();
        });
    });

    test("401 Invalid Token", (done) => {
      let inputTransaction = {
        name: "Pen",
        date: new Date(),
        amount: 20000,
        invoice: "cek",
        BudgetId: budgetData.id,
        UserId: userData.id,
      };

      request(app)
        .put(`/transactions/${transactionData.id}`)
        .set("Accept", "application/json")
        .set("access_token", invalidToken)
        .send(inputTransaction)
        .end((err, res) => {
          if (err) return done(err);
          const { body, status } = res;

          expect(status).toBe(401);
          expect(body).toHaveProperty("message", "Invalid Token");
          return done();
        });
    });

    test("400 validation error", (done) => {
      let inputTransaction = {
        name: "",
        date: new Date(),
        amount: 20000,
        invoice: "",
        BudgetId: budgetData.id,
        UserId: userData.id,
      };

      request(app)
        .put(`/transactions/${transactionData.id}`)
        .set("Accept", "application/json")
        .set("access_token", userToken2)
        .send(inputTransaction)
        .end((err, res) => {
          if (err) return done(err);
          const { body, status } = res;
          expect(status).toBe(400);
          expect(body).toHaveProperty("message", expect.anything());
          return done();
        });
    });

    test("404 Transaction Not Found", (done) => {
      request(app)
        .put(`/transactions/456`)
        .set("access_token", userToken2)
        .then((res) => {
          const { body, status } = res;

          expect(status).toBe(404);
          expect(body).toHaveProperty("message", expect.any(String));
          done();
        })
        .catch((err) => done(err));
    });
  });

  describe("DELETE /transactions/:id", () => {
    test("200 Success Delete Transaction", (done) => {
      request(app)
        .delete(`/transactions/${transactionData.id}`)
        .set("access_token", userToken2)
        .end((err, res) => {
          if (err) return done(err);
          const { body, status } = res;

          expect(status).toBe(200);
          expect(body).toHaveProperty("message", expect.any(String));
          return done();
        });
    });

    test("404 Not Found", (done) => {
      const invalidParams = 8997854;
      request(app)
        .delete(`/transactions/${invalidParams}`)
        .set("access_token", userToken2)
        .end((err, res) => {
          if (err) return done(err);
          const { body, status } = res;

          expect(status).toBe(404);
          expect(body).toHaveProperty("message", expect.any(String));
          return done();
        });
    });
  });
});