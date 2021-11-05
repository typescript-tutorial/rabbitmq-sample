import { Options } from "amqplib";

export interface MQConfig {
    queue: string,
    url?: string,
    config?: Options.Connect,
}