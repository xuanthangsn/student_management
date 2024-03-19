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
    await queryInterface.createTable("users", {
      id: {
        type: Sequelize.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      role: {
        type: Sequelize.DataTypes.ENUM,
        allowNull: false,
        values: ["admin", "qlht"],
      },
      email: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      username: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      password: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
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
      email_verified: {
        type: Sequelize.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      email_verification_last_sent_at: {
        type: Sequelize.DataTypes.DATE
      },
      active: {
        type: Sequelize.DataTypes.BOOLEAN,
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

    await queryInterface.addConstraint("users", {
      type: "foreign key",
      fields: ["deleted_by"],
      references: {
        table: "users",
        field: "id",
      },
      onUpdate: "cascade",
      onDelete: "cascade"
    });

    await queryInterface.addConstraint("users", {
      type: "foreign key",
      fields: ["created_by"],
      references: {
        table: "users",
        field: "id",
      },
      onUpdate: "cascade",
      onDelete: "cascade",
    });

    await queryInterface.addConstraint("users", {
      type: "foreign key",
      fields: ["updated_by"],
      references: {
        table: "users",
        field: "id",
      },
      onUpdate: "cascade",
      onDelete: "cascade",
    });

  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable("users");
  },
};
