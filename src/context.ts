import { connect } from "amqplib"
import { HealthController } from "health-service"
import { ErrorHandler, Processor, RetryWriter, StringMap } from "message-processing"
import { Pool } from "mysql2"
import { MySQLWriter } from "mysql2-core"
import { Logger } from "onecore"
import { Config, Consumer, RabbitMQChecker, Sender } from "rabbitmq-transport"
import { Validator } from "validation-core"
import { User, userModel } from "./user"

const retries = [5000, 10000, 20000]

export interface ApplicationContext {
  process: (data: User, header?: StringMap) => Promise<number>
  read: (handle: (data: User, attributes?: StringMap) => Promise<number>) => Promise<void>
  sender: (data: User, attributes?: StringMap) => Promise<boolean>
  health: HealthController
}

export async function createContext(config: Config, pool: Pool, logger: Logger): Promise<ApplicationContext> {
  const connection = await connect(config.url)
  const channel = await connection.createChannel()
  channel.assertQueue(config.queue, { durable: true })
  const rabbitmqChecker = new RabbitMQChecker(config.url)
  const health = new HealthController([rabbitmqChecker])
  const writer = new MySQLWriter<User>(pool, "users", userModel)
  const retryWriter = new RetryWriter(writer.write, retries, writeUser, logger.error)
  const errorHandler = new ErrorHandler(logger.error)
  const validator = new Validator<User>(userModel, true)
  const processor = new Processor<User, boolean>(
    retryWriter.write,
    validator.validate,
    [],
    errorHandler.error,
    logger.error,
    logger.info,
    undefined,
    3,
    "retry",
  )
  const sender = new Sender<User>(channel, config.queue)
  const consumer = new Consumer<User>(channel, config.queue, logger.error)
  const ctx: ApplicationContext = { read: consumer.consume, sender: sender.send, process: processor.process, health }
  return ctx
}

export function writeUser(msg: User): Promise<number> {
  console.log("Error: " + JSON.stringify(msg))
  return Promise.resolve(1)
}
