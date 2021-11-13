import { Options } from 'amqplib';

export interface Config {
  queue: string;
  url?: string;
  connect?: Options.Connect;
}
