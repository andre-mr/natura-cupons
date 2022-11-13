const mysql = require("mysql2/promise.js");
const crypto = require("crypto");
const ftp = require("basic-ftp");
const { Readable } = require("stream");
const sharp = require("sharp");

async function uploadImage(imageB64) {
  const fileName = `${process.env.IMAGE_NAME_TM}.jpg`;
  const imageURL = `${process.env.FTP_IMAGE_URL}/${fileName}` || null;
  const base64Image = imageB64.split(";base64,").pop();
  const imageBuffer = Buffer.from(base64Image, "base64");
  const sharpedFile = await sharp(imageBuffer).jpeg({ quality: 65 }).toBuffer();
  const client = new ftp.Client();
  try {
    await client.access({
      host: process.env.FTP_HOST,
      user: process.env.FTP_USER,
      password: process.env.FTP_PASSWORD,
    });
    await client.ensureDir(`/`);
    file = Readable.from(sharpedFile);
    await client.uploadFrom(file, fileName);
  } catch (err) {
    console.log(err);
    client.close();
    return null;
  }
  client.close();
  return imageURL;
}

async function chooseRedirectCoupon() {
  const configs = await getCouponsConfigs();
  const coupons = await getCouponsActive();

  if (!coupons) return null;

  if (coupons.length <= 0) {
    return null;
  }

  let lastCoupon = coupons[0];
  let nextCoupon = null;
  let targetCoupon = null;

  for (let i = 0; i < coupons.length; i++) {
    if (coupons[i].skips > 0) {
      lastCoupon = coupons[i];
      if (lastCoupon.skips < configs.redirectsPerUse) {
        lastCoupon.skips++;
        lastCoupon.redirects++;
        targetCoupon = lastCoupon;
        updateCoupon(targetCoupon);
        break;
      } else {
        lastCoupon.skips = 0;
        if (lastCoupon.uses <= 0) {
          lastCoupon.active = 0;
        }
        if (coupons[i + 1]) {
          nextCoupon = coupons[i + 1];
        } else {
          nextCoupon = coupons[0];
        }
        nextCoupon.skips++;
        nextCoupon.uses--;
        nextCoupon.redirects++;
        targetCoupon = nextCoupon;
        updateCoupon(lastCoupon);
        updateCoupon(targetCoupon);
        break;
      }
    }
  }

  if (targetCoupon) {
    return targetCoupon.code;
  } else {
    targetCoupon = lastCoupon;
    if (targetCoupon.skips >= configs.redirectsPerUse) {
      targetCoupon.skips = 1;
    } else {
      targetCoupon.skips++;
    }
    targetCoupon.uses--;
    if (targetCoupon.uses <= 0) {
      targetCoupon.active = 0;
    }
    targetCoupon.redirects++;
    updateCoupon(targetCoupon);
    return targetCoupon.code;
  }
}

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
      coupon.active,
    ]
  );
}

async function login(apikey) {
  const user = await checkUser(apikey);
  if (user && user.length > 0) {
    return true;
  } else {
    const userExists = await checkUserAny();
    if (userExists && userExists.length > 0) {
      return false;
    } else {
      return await createUser(apikey);
    }
  }
}

async function checkUserAny() {
  return sqlSelect(
    `SELECT * 
    FROM user;`
  );
}

async function checkUser(apikey) {
  const hashkey = crypto.createHash("md5").update(apikey).digest("hex");
  return sqlSelect(
    `SELECT * 
    FROM user WHERE apikey = '${hashkey}' 
    ORDER BY id ASC;`
  );
}

async function createUser(apikey) {
  const hashkey = crypto.createHash("md5").update(apikey).digest("hex");
  return await sqlInsert(`INSERT INTO user (apikey) VALUES (?) `, [hashkey]);
}

async function updateApikey(apikey) {
  const hashkey = crypto.createHash("md5").update(apikey.value).digest("hex");
  let sql = `UPDATE user SET apikey=? WHERE id > 0 `;
  let values = [hashkey];
  return await sqlUpdateOrDelete(sql, values);
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
  if (coupon.created instanceof Date) {
    coupon.created = coupon.created.toISOString();
  }
  if (coupon.expired instanceof Date) {
    coupon.expired = coupon.expired.toISOString();
  }
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

async function getCouponsConfigs() {
  let configs = await sqlSelect(
    `SELECT description, value 
    FROM configs 
    WHERE type = 'coupons' 
    ORDER BY description ASC;`
  );

  if (!configs) return null;

  if (configs.length <= 0) {
    configsArray = [];
    const newConfigs = new CouponsConfigs();
    configsArray.push([
      "coupons",
      "alertRemainingUses",
      newConfigs.alertRemainingUses,
    ]);
    configsArray.push([
      "coupons",
      "autoUpdateInterval",
      newConfigs.autoUpdateInterval,
    ]);
    configsArray.push(["coupons", "couponUses", newConfigs.couponUses]);
    configsArray.push(["coupons", "expiredDays", newConfigs.expiredDays]);
    configsArray.push([
      "coupons",
      "redirectsPerUse",
      newConfigs.redirectsPerUse,
    ]);

    await addConfigs(configsArray);

    configs = [];
    for (let i = 0; i < configsArray.length; i++) {
      configs.push({
        description: configsArray[i][0],
        value: configsArray[i][1],
      });
    }
  }

  const configsOBJ = {};
  for (let i = 0; i < configs.length; i++) {
    configsOBJ[configs[i].description] = configs[i].value;
  }
  return configsOBJ;
}

async function getPageConfigs() {
  let configs = await sqlSelect(
    `SELECT description, value 
    FROM configs 
    WHERE type = 'page' 
    ORDER BY description ASC;`
  );

  if (!configs) return null;

  if (configs.length <= 0) {
    configsArray = [];
    const newConfigs = new PageConfigs();
    configsArray.push(["page", "backgroundColor", newConfigs.backgroundColor]);
    configsArray.push(["page", "buttonColor", newConfigs.buttonColor]);
    configsArray.push(["page", "image", newConfigs.image]);
    configsArray.push(["page", "text", newConfigs.text]);
    configsArray.push(["page", "textColor", newConfigs.textColor]);

    await addConfigs(configsArray);

    configs = [];
    for (let i = 0; i < configsArray.length; i++) {
      configs.push({
        description: configsArray[i][1],
        value: configsArray[i][2],
      });
    }
  }

  const configsOBJ = {};
  for (let i = 0; i < configs.length; i++) {
    configsOBJ[configs[i].description] = configs[i].value;
  }
  return configsOBJ;
}

async function addConfigs(configs) {
  return await sqlInsert(
    `INSERT INTO configs (type, description, value) VALUES ? `,
    [...configs]
  );
}

async function updateCouponsConfigs(configs) {
  const sql = `UPDATE configs SET value=? WHERE description=? AND type='coupons'`;
  for (const config of configs) {
    const values = [config.value, config.description];
    await sqlUpdateOrDelete(sql, values);
  }
  return true;
}

async function updatePageConfigs(configs) {
  console.log(configs.backgroundColor);
  let imageB64;
  let imageURL;
  for (cfg of configs) {
    if (cfg.description == "image") {
      imageB64 = cfg.value;
      break;
    }
  }
  if (imageB64) {
    imageURL = await uploadImage(imageB64);
  }
  configs.image = imageURL;
  const sql = `UPDATE configs SET value=? WHERE description=? AND type='page'`;
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
  getCouponsConfigs,
  updateCouponsConfigs,
  login,
  updateApikey,
  checkUser,
  chooseRedirectCoupon,
  getPageConfigs,
  updatePageConfigs,
};

class CouponsConfigs {
  alertRemainingUses = 5;
  autoUpdateInterval = 5;
  couponUses = 50;
  expiredDays = 30;
  redirectsPerUse = 5;
}

class PageConfigs {
  backgroundColor = "";
  buttonColor = "";
  image = "";
  text = "";
  textColor = "";
}
