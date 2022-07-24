import { json } from 'body-parser';
import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import { getBody } from 'logger-core';
import { connectToDb } from 'mongodb-extension';
import { createContext } from './context';
import { Config } from './services/rabbitmq';

dotenv.config();

const app = express();

const port = process.env.PORT;
const mongoURI = process.env.MONGO_URI;
const mongoDB = process.env.MONGO_DB;

const rabbitmqUrl = process.env.RABBITMQ_URL;
const queue = process.env.QUEUE;

app.use(json());

connectToDb(`${mongoURI}`, `${mongoDB}`).then(async (db) => {
  if (!rabbitmqUrl || !queue) {
    throw new Error('url and queue can not empty!');
  }
  const config: Config = {
    url: rabbitmqUrl,
    queue,
  };
  const ctx = createContext(db, config);
  ctx.read(ctx.handle);

  http.createServer((req, res) => {
    if (req.url === '/health') {
      ctx.health.check(req, res);
    } else if (req.url === '/send') {
      getBody(req).then((body: any) => {
        ctx
          .sender(JSON.parse(body))
          .then(() => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'message was produced' }));
          })
          .catch((err: any) => {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err }));
          });
      }).catch(err => console.log(err));
    }
  })
  .listen(port, () => {
    console.log('Start server at port ' + port);
  });
});
