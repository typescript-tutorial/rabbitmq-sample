import {connect, Channel, Connection} from "amqplib/callback_api";
import { Options } from "amqplib";
import { MQConfig } from "./model";

export function connectChannel (config: MQConfig) : Promise<Channel> {
    return new Promise((resolve, reject) => {
        let cf: string | Options.Connect;
        if(config.url) {
            cf = config.url;
        } else if(config.config) {
            cf = config.config;
        } else {
            throw new Error("MQ config doesn't exist!");
        }
        connect(cf, (err, conn) => {
            if(err) {
                reject(err);
            }
            conn.createChannel((err, ch) => {
                if (err) {
                    reject(err);
                }
                ch.assertQueue(config.queue, { durable: false });
                resolve(ch);
            })
        })
    })
};

export function checkConnect (config: string | Options.Connect) : Promise<Connection> {
    return new Promise((resolve, reject) => {
        connect(config, (err, conn) => {
            if(err) {
                reject(err);
            }
            resolve(conn);
        })
    })
};
