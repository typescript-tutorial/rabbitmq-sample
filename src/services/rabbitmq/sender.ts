import { StringMap } from 'mq-one';
import { connectChannel } from './connect';
import { MQConfig } from './model';

export class Sender<T> {
  constructor(public config: MQConfig, private log?: (msg: any) => void) {
    this.send = this.send.bind(this);
  }
  async send(data: T, attributes?: StringMap): Promise<boolean> {
    try {
      const channel = await connectChannel(this.config);
      return channel.sendToQueue(this.config.queue, Buffer.from(JSON.stringify(data)), { headers: attributes });
    } catch (err) {
      throw err;
    }
  }
}
