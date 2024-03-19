const knex = require("../db.js");
const formatDateObject = require("../helpers/formatDateObject.js");

(async () => {
  try {
    const result = await knex('students').where('id', '<', 3).update({ lastname: 'thang' }, ['id']);
    console.log("Successfully update student");
    console.log(result);
  } catch (err) {
    console.log(err);
  } finally {
    knex.destroy();
  }
})();
