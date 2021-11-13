import { Options } from 'amqplib';
import { Channel, connect, Connection } from 'amqplib/callback_api';
import { MQConfig } from './model';

export function getChannel(config: MQConfig): Promise<Channel> {
  return new Promise((resolve, reject) => {
    let cf: string | Options.Connect;
    if (config.url) {
      cf = config.url;
    } else if (config.config) {
      cf = config.config;
    } else {
      throw new Error('MQ config does not exist');
    }
    connect(cf, (er1, conn) => {
      if (er1) {
        reject(er1);
      }
      conn.createChannel((er2, ch) => {
        if (er2) {
          reject(er2);
        }
        ch.assertQueue(config.queue, { durable: false });
        resolve(ch);
      });
    });
  });
}

export function checkConnect(config: string | Options.Connect): Promise<Connection> {
  return new Promise((resolve, reject) => {
    connect(config, (err, conn) => {
      if (err) {
        reject(err);
      }
      resolve(conn);
    });
  });
}
