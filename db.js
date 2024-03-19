require("dotenv").config();

const knex = require("knex")({
  client: "mysql2",
  connection: {
    host: process.env.DATABASE_HOST,
    port: 3306,
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  },
});
module.exports = knex;