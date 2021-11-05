import { User } from 'models/User';
import {Db} from 'mongodb';
import { MongoInserter } from 'mongodb-extension';
import { ErrorHandler, Handler, RetryService, RetryWriter } from 'mq-one';
import { Attributes, Validator } from 'validator-x';
import { Consume } from './services/rabbitmq/consumer';
import { Subscribe } from './services/rabbitmq/subcriber';
import {ApplicationContext} from './context';
import { RabbitmqChecker } from './services/rabbitmq/rabbitmqChecker';
import { HealthController } from './controllers/HealthController';
import { MQConfig } from './services/rabbitmq/model';

const retries = [5000, 10000, 20000];

const user: Attributes = {
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

export function createContext(db: Db, MQConfig: MQConfig): ApplicationContext {
  const rabbitmqChecker = new RabbitmqChecker(MQConfig);
  const healthController = new HealthController([rabbitmqChecker]);
  const writer = new MongoInserter(db.collection('users'), 'id');
  const retryWriter = new RetryWriter(writer.write, retries, writeUser, log);
  const errorHandler = new ErrorHandler(log);
  const validator = new Validator<User>(user, true);
  const subcriber = new Subscribe<User>(MQConfig, log);
  // const retryService = new RetryService<User, boolean>(subcriber.subscriber, log, log);
  const handler = new Handler<User, boolean>(retryWriter.write, validator.validate , [], errorHandler.error, log, log, undefined, 3, 'retry');
  const consumer = new Consume<User>(MQConfig, log)
  const ctx: ApplicationContext = {read: consumer.consumer, handle: handler.handle,healthController};
  return ctx;
}

export function log(msg: any): void {
  console.log(JSON.stringify(msg));
}

export function writeUser(msg: User): Promise<number> {
  console.log('Error: ' + JSON.stringify(msg));
  return Promise.resolve(1);
}
