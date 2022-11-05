const mysql = require("mysql2/promise.js");

async function addCoupon(coupon) {
  return await sqlInsert(
    `INSERT INTO coupon (code, created, expired, uses) VALUES (?) `,
    [coupon.code, coupon.created, coupon.expired, coupon.uses]
  );
}

async function getCoupons() {
  return sqlSelect(
    `SELECT * 
    FROM coupon 
    ORDER BY id ASC;`
  );
}

async function updateCoupon(coupon) {
  let sql = `UPDATE coupon SET code=?, created=?, expired=?, uses=? WHERE id=? `;
  let values = [
    coupon.code,
    coupon.created,
    coupon.expired,
    coupon.uses,
    coupon.id,
  ];
  return await sqlUpdateOrDelete(sql, values);
}

async function deleteCoupon(coupon) {
  let sql = `DELETE FROM coupon WHERE id=? `;
  let values = [coupon.id];
  return await sqlUpdateOrDelete(sql, values);
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

module.exports = { addCoupon, getCoupons, updateCoupon, deleteCoupon };
