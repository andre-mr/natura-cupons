const dotenv = require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;

const controller = require("./controller");

app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json());

app.get("/", async (req, res) => {
  if (req.query.publickey == process.env.PUBLIC_KEY) {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.write(JSON.stringify(await controller.chooseRedirectCoupon()));
    res.send();
  } else {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.write(JSON.stringify(["publickey!"]));
    res.send();
  }
});

app.get("/configs/page", async (req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.write(JSON.stringify(await controller.getPageConfigs()));
  res.send();
});

app.use(async (req, res, next) => {
  if (req.query.apikey) {
    const user = await controller.login(req.query.apikey);
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
  res.write(JSON.stringify(await controller.login(req.query.apikey)));
  res.send();
});

app.get("/coupons/active", async (req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.write(JSON.stringify(await controller.getCouponsActive()));
  res.send();
});

app.get("/coupons/inactive", async (req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.write(JSON.stringify(await controller.getCouponsInactive()));
  res.send();
});

app.get("/configs/coupons", async (req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.write(JSON.stringify(await controller.getCouponsConfigs()));
  res.send();
});

app.post("/coupons/add", async (req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.write(JSON.stringify(await controller.addCoupon(req.body)));
  res.send();
});

app.put("/coupons/update", async (req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.write(JSON.stringify(await controller.updateCoupon(req.body)));
  res.send();
});

app.put("/configs/coupons/update", async (req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.write(JSON.stringify(await controller.updateCouponsConfigs(req.body)));
  res.send();
});

app.put("/configs/page/update", async (req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.write(JSON.stringify(await controller.updatePageConfigs(req.body)));
  res.send();
});

app.put("/login/update", async (req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.write(JSON.stringify(await controller.updateApikey(req.body)));
  res.send();
});

app.delete("/coupons/delete", async (req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.write(JSON.stringify(await controller.deleteCoupon(req.body)));
  res.send();
});

app.listen(port, () => {
  console.log(`server listening on port ${port}...`);
});
