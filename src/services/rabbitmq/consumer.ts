import { Message, MessagePropertyHeaders } from 'amqplib';
import { Config } from './config';
import { getChannel, StringMap, toString } from './connect';

export type Hanlde<T> = (data: T, attributes?: StringMap, raw?: Message) => Promise<number>;
export type Log = (msg: any) => void;

export function createConsumer<T>(config: Config, logError?: Log, logInfo?: Log, json?: boolean) {
  return new Consumer<T>(config, logError, logInfo, json);
}
export const createSubscriber = createConsumer;
export const createReader = createConsumer;
export const createReceiver = createConsumer;
export class Consumer<T> {
  json?: boolean;
  constructor(
    public config: Config,
    public logError?: Log,
    public logInfo?: Log,
    json?: boolean
  ) {
    this.json = json;
    this.subscribe = this.subscribe.bind(this);
    this.get = this.get.bind(this);
    this.receive = this.receive.bind(this);
    this.read = this.read.bind(this);
    this.consume = this.consume.bind(this);
  }
  get(handle: Hanlde<T>) {
    return this.consume(handle);
  }
  subscribe(handle: Hanlde<T>) {
    return this.consume(handle);
  }
  receive(handle: Hanlde<T>) {
    return this.consume(handle);
  }
  read(handle: Hanlde<T>) {
    return this.consume(handle);
  }
  async consume(handle: Hanlde<T>) {
    try {
      const channel = await getChannel(this.config);
      channel.consume(this.config.queue, async (msg: Message|null) => {
        if (msg && msg.content) {
          const data = (this.json ? JSON.parse(msg.content.toString()) : msg.content.toString());
          const attr: StringMap = mapHeader(msg.properties.headers);
          await handle(data, attr, msg);
        } else {
          if (this.logError) {
            this.logError('Message is empty');
          }
        }
      }, { noAck: true });
    } catch (err) {
      if (err && this.logError) {
        this.logError('Fail to consume message: ' + toString(err));
      }
    }
  }
}
export function mapHeader(headers?: MessagePropertyHeaders): StringMap {
  const attr: StringMap = {};
  if (headers) {
    const keys = Object.keys(headers);
    for (const key of keys) {
      const tam = headers[key];
      if (tam) {
        if (Buffer.isBuffer(tam)) {
          attr[key] = tam.toString();
        }
        if (typeof tam === 'string') {
          attr[key] = tam;
        }
      } else {
        attr[key] = '';
      }
    }
  }
  return attr;
}
