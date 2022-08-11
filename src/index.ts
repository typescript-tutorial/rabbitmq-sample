import http from "http";
import dotenv from "dotenv";
import express from "express";
import { json } from "body-parser";
import { merge } from "config-plus";
import { getBody } from "logger-core";
import { Pool } from 'pg';
import { PoolManager } from 'pg-extension';

import { config, env } from "./config";
import { createContext } from "./context";
import { Config } from "./services/rabbitmq";


dotenv.config();
const conf = merge(config, process.env, env, process.env.ENV);

const app = express();
app.use(json());

const pool = new Pool(conf.db);
const db = new PoolManager(pool);

if (!conf.rabbitmq.url || !conf.rabbitmq.queue) {
  throw new Error("url and queue can not empty!");
}
const con: Config = {
  url: conf.rabbitmq.url,
  queue: conf.rabbitmq.queue,
};

const ctx = createContext(db, con);
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
  .listen(conf.port, () => {
    console.log("Start server at port " + conf.port);
  });

