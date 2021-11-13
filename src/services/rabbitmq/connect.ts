import { Options } from 'amqplib';
import { Channel, connect as connect2, Connection } from 'amqplib/callback_api';
import { Config } from './config';

export function getChannel(config: Config): Promise<Channel> {
  return new Promise((resolve, reject) => {
    let cf: string | Options.Connect;
    if (config.url) {
      cf = config.url;
    } else if (config.connect) {
      cf = config.connect;
    } else {
      throw new Error('MQ config does not exist');
    }
    connect2(cf, (er1, conn) => {
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
export function connect(config: string | Options.Connect): Promise<Connection> {
  return new Promise((resolve, reject) => {
    connect2(config, (err, conn) => {
      if (err) {
        reject(err);
      }
      resolve(conn);
    });
  });
}
export interface StringMap {
  [key: string]: string;
}
export function toString(v: any, attributes?: StringMap): string {
  if (attributes) {
    const ks = Object.keys(attributes);
    if (ks.length > 0) {
      if (typeof v === 'string') {
        return v + JSON.stringify(attributes);
      } else {
        return JSON.stringify(v) + ' ' + JSON.stringify(attributes);
      }
    } else {
      return ts(v);
    }
  } else {
    return ts(v);
  }
}
function ts(v: any): string {
  if (typeof v === 'string') {
    return v;
  } else {
    return JSON.stringify(v);
  }
}
