import { Config } from './config';
import { getChannel, StringMap, toString } from './connect';

export function createSender<T>(config: Config) {
  return new Sender<T>(config);
}
export const createProducer = createSender;
export const createWriter = createSender;
export const createPublisher = createSender;
export class Sender<T> {
  constructor(public config: Config) {
    this.send = this.send.bind(this);
    this.publish = this.publish.bind(this);
    this.put = this.put.bind(this);
    this.write = this.write.bind(this);
    this.produce = this.produce.bind(this);
  }
  send(data: T, attributes?: StringMap): Promise<boolean> {
    return getChannel(this.config).then(channel => {
      return channel.sendToQueue(this.config.queue, Buffer.from(toString(data)), { headers: attributes });
    });
  }
  put(data: T, attributes?: StringMap): Promise<boolean> {
    return this.send(data, attributes);
  }
  write(data: T, attributes?: StringMap): Promise<boolean> {
    return this.send(data, attributes);
  }
  produce(data: T, attributes?: StringMap): Promise<boolean> {
    return this.send(data, attributes);
  }
  publish(data: T, attributes?: StringMap): Promise<boolean> {
    return this.send(data, attributes);
  }
}
