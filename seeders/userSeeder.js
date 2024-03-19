const bcrypt = require("bcryptjs");
const { getConnection, pool} = require('../src/db');

(async () => {
    const recordCounts = 100;
    let emails = [];
    let firstname = "thang";
    let lastname = "tran";
    let usernames = [];
    let roles = [];
    let password = await bcrypt.hash("123", 12);
    let genders = [];

    let adminCount = 0;
    let qlhtCount = 0;

    // initialize data values
    for (let i = 0; i < recordCounts; i++) {
      // random value, be either 1 or 0
      const admin = Math.round(Math.random());
      if (admin === 1) {
        emails.push(`admin${adminCount}@gmail.com`);
        usernames.push(`admin${adminCount}`);
        roles.push("admin");
        genders.push(Math.round(Math.random()) === 1 ? "male" : "female");
        adminCount++;
      } else {
        emails.push(`qlht${qlhtCount}@gmail.com`);
        usernames.push(`qlht${qlhtCount}`);
        roles.push("qlht");
        genders.push(Math.round(Math.random()) === 1 ? "male" : "female");
        qlhtCount++;
      }
    }

    let sql =
      "insert into users (email, firstname, lastname, username, role, password, gender, email_verified) values";

    // construct sql query
    for (let i = 0; i < recordCounts; i++) {
      sql += ` ('${emails[i]}', '${firstname}', '${lastname}', '${usernames[i]}', '${roles[i]}', '${password}', '${genders[i]}', true)`;
      const delimeter = i === recordCounts - 1 ? ";" : ",";
      sql += delimeter;
    }

    console.log(sql);

    let conn;
    try {
        conn = await getConnection();
        await conn.query(sql);
        console.log('Seeding completed')
    } catch (err) {
        console.log(err);
    } finally {
        conn.release();
        pool.end();
    }
})();
