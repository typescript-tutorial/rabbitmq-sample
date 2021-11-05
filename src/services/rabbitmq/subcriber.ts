import { connectChannel } from "./connect";
import { StringMap } from "mq-one";
import { MQConfig } from "./model";

export class Subscribe<T> {
    constructor(public MQConfig: MQConfig, private log?: (msg: any)=> void) {
        this.subscriber = this.subscriber.bind(this);
    }
    async subscriber(data: T, attributes?: StringMap): Promise<boolean> {
        try{
            const channel = await connectChannel(this.MQConfig);
            return channel.sendToQueue(this.MQConfig.queue, Buffer.from(JSON.stringify(data)), {headers: attributes});
        }catch(err) {
            throw err;
        }
    }
}

