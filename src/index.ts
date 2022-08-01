import { merge } from "config-plus";
import { json } from "body-parser";
import dotenv from "dotenv";
import express from "express";
import http from "http";
import { getBody } from "logger-core";
import { connectToDb } from "mongodb-extension";
import { createContext } from "./context";
import { Config } from "./services/rabbitmq";
import { config, env } from "./config";

dotenv.config();
const conf = merge(config, process.env, env, process.env.ENV);

const app = express();

const port = conf.port;

app.use(json());

connectToDb(`${conf.db.uri}`, `${conf.db.db}`).then(async (db) => {
  if (!conf.rabbitmq.url || !conf.rabbitmq.queue) {
    throw new Error("url and queue can not empty!");
  }
  const config: Config = {
    url: conf.rabbitmq.url,
    queue: conf.rabbitmq.queue,
  };
  const ctx = createContext(db, config);
  ctx.read(ctx.handle);

  http
    .createServer((req, res) => {
      if (req.url === "/health") {
        ctx.health.check(req, res);
      } else if (req.url === "/send") {
        getBody(req)
          .then((body: any) => {
            ctx
              .sender(JSON.parse(body))
              .then(() => {
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ message: "message was produced" }));
              })
              .catch((err: any) => {
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: err }));
              });
          })
          .catch((err) => console.log(err));
      }
    })
    .listen(port, () => {
      console.log("Start server at port " + port);
    });
});
