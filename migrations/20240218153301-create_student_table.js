"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable("students", {
      id: {
        type: Sequelize.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      firstname: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      lastname: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      phone_number: {
        type: Sequelize.DataTypes.STRING,
      },
      gender: {
        type: Sequelize.DataTypes.ENUM,
        values: ["male", "female"],
        allowNull: false,
      },
      address: {
        type: Sequelize.DataTypes.STRING,
      },
      deleted_at: {
        type: Sequelize.DataTypes.DATE,
      },
      deleted_by: {
        type: Sequelize.DataTypes.INTEGER.UNSIGNED,
      },
      created_at: {
        type: Sequelize.DataTypes.DATE,
      },
      created_by: {
        type: Sequelize.DataTypes.INTEGER.UNSIGNED,
      },
      updated_at: {
        type: Sequelize.DataTypes.DATE,
      },
      updated_by: {
        type: Sequelize.DataTypes.INTEGER.UNSIGNED,
      },
    });

    await queryInterface.addConstraint("students", {
      type: "foreign key",
      fields: ["deleted_by"],
      references: {
        table: "users",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });

    await queryInterface.addConstraint("students", {
      type: "foreign key",
      fields: ["created_by"],
      references: {
        table: "users",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });

    await queryInterface.addConstraint("students", {
      type: "foreign key",
      fields: ["updated_by"],
      references: {
        table: "users",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable("students");
  },
};
