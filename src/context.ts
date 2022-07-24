import { HealthController } from 'health-service';
import { Db } from 'mongodb';
import { MongoInserter } from 'mongodb-extension';
import { ErrorHandler, Handler, RetryWriter, StringMap } from 'mq-one';
import { Attributes, Validator } from 'xvalidators';
import { Config, Consumer, RabbitMQChecker, Sender } from './services/rabbitmq';
// import { Subscribe } from './services/rabbitmq/subcriber';

const retries = [5000, 10000, 20000];

export interface User {
  id: string;
  username: string;
  email?: string;
  phone?: string;
  dateOfBirth?: Date;
}
export const user: Attributes = {
  id: {
    length: 40
  },
  username: {
    required: true,
    length: 255
  },
  email: {
    format: 'email',
    required: true,
    length: 120
  },
  phone: {
    format: 'phone',
    required: true,
    length: 14
  },
  dateOfBirth: {
    type: 'datetime'
  }
};

export interface ApplicationContext {
  handle: (data: User, header?: StringMap) => Promise<number>;
  read: (handle: (data: User, attributes?: StringMap) => Promise<number>) => Promise<void>;
  sender: (data: User, attributes?: StringMap) => Promise<boolean>;
  health: HealthController;
}

export function createContext(db: Db, config: Config): ApplicationContext {
  const rabbitmqChecker = new RabbitMQChecker(config);
  const health = new HealthController([rabbitmqChecker]);
  const writer = new MongoInserter(db.collection('users'), 'id');
  const retryWriter = new RetryWriter(writer.write, retries, writeUser, log);
  const errorHandler = new ErrorHandler(log);
  const validator = new Validator<User>(user, true);
  // const subcriber = new Subscribe<User>(config, log);
  // const retryService = new RetryService<User, boolean>(subcriber.subscriber, log, log);
  const handler = new Handler<User, boolean>(retryWriter.write, validator.validate, [], errorHandler.error, log, log, undefined, 3, 'retry');
  const sender = new Sender<User>(config);
  const consumer = new Consumer<User>(config, log);
  const ctx: ApplicationContext = { read: consumer.consume, sender: sender.send, handle: handler.handle, health };
  return ctx;
}
export function log(msg: any): void {
  console.log(JSON.stringify(msg));
}
export function writeUser(msg: User): Promise<number> {
  console.log('Error: ' + JSON.stringify(msg));
  return Promise.resolve(1);
}
