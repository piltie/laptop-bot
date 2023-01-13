import * as dotenv from "dotenv";
dotenv.config();

import express from "express";
import config from "config";

const app = express();

app.use(express.json());

import router from "./router";
app.use("/", router);

const port = config.get<number>("port");
app.listen(port, async () => {
  console.log(`Listening on port ${port}.`);
});
