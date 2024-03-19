"use strict";
require("dotenv").config();

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const sql =
      `CREATE EVENT IF NOT EXISTS delete_inactive_account` +
      `ON SCHEDULE EVERY 1 DAY` +
      `DO DELETE FROM users ` +
      `WHERE users.email_verified=false AND DATE_ADD(users.created_at, INTERVAL ${process.env.DELETE_INACTIVE_ACCOUNT_AFTER} DAY) > CURRENT_TIMESTAMPS;`;
    await queryInterface.sequelize.query(sql);
  },

  async down(queryInterface, Sequelize) {
    const sql = "DROP EVENT IF EXISTS delete_inactive_account";
    await queryInterface.sequelize.query(sql);
  },
};
