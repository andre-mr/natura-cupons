const dotenv = require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;

const database = require("./database");

app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json());

const htmlResponse = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title>Natura Redirect</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />

    <style>
      * {
        margin: 0;
      }

      html,
      body {
        height: 100%;
        width: 100%;
      }

      .title {
        width: 100%;
        display: flex;
        justify-content: center;
      }

      .main {
        height: 100%;
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }
    </style>

    <script>
      window.onload = () => {
        setTimeout(() => {
          location.href = "https://google.com";
          // location.assign("https://google.com");
          // location.replace("https://google.com");
          // location = "https://google.com";
          // window.open("https://google.com", "_self");
        }, 5000);
      };
    </script>
  </head>

  <body>
    <div class="main">
      <h1 class="title">Texto (Redirecionando)...</h1>
    </div>
  </body>
</html>
`;

app.get("/", async (req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.write(htmlResponse);
  res.send();
});

app.use(async (req, res, next) => {
  if (req.query.apikey) {
    const user = await database.login(req.query.apikey);
    if (user) {
      next();
    } else {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.write(JSON.stringify(["apikey!"]));
      res.send();
    }
  } else {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.write(JSON.stringify(["apikey!"]));
    res.send();
  }
});

app.get("/login", async (req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.write(JSON.stringify(await database.login(req.query.apikey)));
  res.send();
});

app.get("/coupons/active", async (req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.write(JSON.stringify(await database.getCouponsActive()));
  res.send();
});

app.get("/coupons/inactive", async (req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.write(JSON.stringify(await database.getCouponsInactive()));
  res.send();
});

app.get("/configs/all", async (req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.write(JSON.stringify(await database.getConfigs()));
  res.send();
});

app.post("/coupons/add", async (req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.write(JSON.stringify(await database.addCoupon(req.body)));
  res.send();
});

app.put("/coupons/update", async (req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.write(JSON.stringify(await database.updateCoupon(req.body)));
  res.send();
});

app.put("/configs/update", async (req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.write(JSON.stringify(await database.updateConfigs(req.body)));
  res.send();
});

app.put("/login/update", async (req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.write(JSON.stringify(await database.updateApikey(req.body)));
  res.send();
});

app.delete("/coupons/delete", async (req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.write(JSON.stringify(await database.deleteCoupon(req.body)));
  res.send();
});

app.listen(port, () => {
  console.log(`server listening on port ${port}...`);
});
