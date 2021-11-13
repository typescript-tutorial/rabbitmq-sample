import { json } from 'body-parser';
import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
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

  app.get('/health', ctx.health.check);
  http.createServer(app).listen(port, () => {
    console.log('Start server at port ' + port);
  });
});
