import { Config } from './config';
import { getChannel, StringMap, toString } from './connect';

export class Sender<T> {
  constructor(public config: Config) {
    this.send = this.send.bind(this);
  }
  async send(data: T, attributes?: StringMap): Promise<boolean> {
    try {
      const channel = await getChannel(this.config);
      return channel.sendToQueue(this.config.queue, Buffer.from(toString(data)), { headers: attributes });
    } catch (err) {
      throw err;
    }
  }
}
