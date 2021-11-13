import { StringMap } from 'mq-one';
import { getChannel } from './connect';
import { MQConfig } from './model';

export class Sender<T> {
  constructor(public config: MQConfig, private log?: (msg: any) => void) {
    this.send = this.send.bind(this);
  }
  async send(data: T, attributes?: StringMap): Promise<boolean> {
    try {
      const channel = await getChannel(this.config);
      return channel.sendToQueue(this.config.queue, Buffer.from(toString<T>(data)), { headers: attributes });
    } catch (err) {
      throw err;
    }
  }
}
export function toString<T>(data: T): string {
  if (typeof data === 'string') {
    return data;
  } else {
    return JSON.stringify(data);
  }
}
