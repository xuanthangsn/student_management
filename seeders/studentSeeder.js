const { uniqueNamesGenerator, names } = require("unique-names-generator");
const knex = require("../db");
// insert 1000 rows of student using batch insert

const rows = [];
const size = 1000;
for (let i = 0; i < size; i++) {
  const name = uniqueNamesGenerator({
    dictionaries: [names, names],
    separator: " ",
  }).split(" ");
  const student = {
    firstname: name[0],
    lastname: name[1],
    gender: Math.round(Math.random()) === 1 ? "male" : "female",
  };
  rows.push(student);
}

(async () => {
    try {
        await knex.batchInsert("students", rows);
        console.log(`Successfully seeded ${size} students to the database`)
    } catch (err) {
      console.log(err);
    } finally {
      knex.destroy();
    }

})()
