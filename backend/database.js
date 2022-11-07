const mysql = require("mysql2/promise.js");

async function addCoupon(coupon) {
  return await sqlInsert(
    `INSERT INTO coupon (code, uses, expired, redirects, created, skips, active) VALUES (?) `,
    [
      coupon.code,
      coupon.uses,
      formatDateTime(coupon.expired),
      coupon.redirects,
      formatDateTime(coupon.created),
      0,
      1,
    ]
  );
}

async function getCouponsActive() {
  return sqlSelect(
    `SELECT * 
    FROM coupon WHERE active = 1 
    ORDER BY id ASC;`
  );
}

async function getCouponsInactive() {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 1);
  const dateFormatted = `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
  return sqlSelect(
    `SELECT * 
    FROM coupon WHERE active = 0 AND created > '${dateFormatted}' 
    ORDER BY id ASC;`
  );
}

async function updateCoupon(coupon) {
  let sql = `UPDATE coupon SET code=?, uses=?, expired=?, redirects=?, created=?, skips=?, active=? WHERE id=? `;
  let values = [
    coupon.code,
    coupon.uses,
    formatDateTime(coupon.expired),
    coupon.redirects,
    formatDateTime(coupon.created),
    coupon.skips,
    coupon.active,
    coupon.id,
  ];
  return await sqlUpdateOrDelete(sql, values);
}

async function deleteCoupon(coupon) {
  let sql = `DELETE FROM coupon WHERE id=? `;
  let values = [coupon.id];
  return await sqlUpdateOrDelete(sql, values);
}

async function getConfigs() {
  return sqlSelect(
    `SELECT * 
    FROM configs 
    ORDER BY description ASC;`
  );
}

async function updateConfigs(configs) {
  const sql = `UPDATE configs SET value=? WHERE description=? `;
  for (const config of configs) {
    const values = [config.value, config.description];
    await sqlUpdateOrDelete(sql, values);
  }
  return true;
}

async function sqlInsert(insertStatement, values) {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  });

  await connection.query(insertStatement, [values], (err) => {
    if (err) throw err;
    connection.end();
    return false;
  });
  connection.end();
  return true;
}

async function sqlSelect(selectStatement) {
  let queryResult;
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    });
    [queryResult] = await connection.execute(selectStatement);
    connection.end();
  } catch (error) {
    [queryResult] = [];
  }
  return queryResult;
}

async function sqlUpdateOrDelete(updateStatement, values) {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  });

  await connection.query(updateStatement, values, function (err) {
    if (err) {
      connection.end();
      throw err;
    }
  });
  connection.end();
  return true;
}

function formatDateTime(timestamp) {
  return `${timestamp.substring(0, 4)}-${timestamp.substring(
    5,
    7
  )}-${timestamp.substring(8, 10)} ${timestamp.substring(
    11,
    13
  )}:${timestamp.substring(14, 16)}:${timestamp.substring(17, 19)}`;
}

module.exports = {
  addCoupon,
  getCouponsActive,
  getCouponsInactive,
  updateCoupon,
  deleteCoupon,
  getConfigs,
  updateConfigs,
};
