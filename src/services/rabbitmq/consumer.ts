import { MessagePropertyHeaders } from 'amqplib';
import { StringMap, toString } from 'mq-one';
import { connectChannel } from './connect';
import { MQConfig } from './model';

export class Consume<T> {
  json?: boolean;
  constructor(
    public config: MQConfig,
    public logError?: (msg: any) => void,
    public logInfo?: (msg: any) => void,
    json?: boolean
  ) {
    this.json = json;
    this.consumer = this.consumer.bind(this);
  }
  async consumer(handle: (data: T, attributes?: StringMap) => Promise<number>) {
    try {
      const channel = await connectChannel(this.config);
      channel.consume(this.config.queue, async (msg) => {
        if (msg && msg.content) {
          const data = (this.json ? JSON.parse(msg.content.toString()) : msg.content.toString());
          const attr: StringMap = convertStringMap(msg.properties.headers);
          await handle(data, attr);
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

function convertStringMap(headers?: MessagePropertyHeaders): StringMap {
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
