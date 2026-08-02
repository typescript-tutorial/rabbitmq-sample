import { connect } from "amqplib"
import { HealthController } from "health-service"
import { ErrorHandler, Processor, StringMap } from "message-processing"
import { Pool } from "mysql2"
import { MySQLChecker, MySQLWriter } from "mysql2-core"
import { Logger } from "onecore"
import { Config, Consumer, RabbitMQChecker, Sender } from "rabbitmq-transport"
import { Validator } from "validation-core"
import { User, userModel } from "./user"

export interface ApplicationContext {
  health: HealthController
  process: (data: User, header?: StringMap) => Promise<number>
  send: (data: User, attributes?: StringMap) => Promise<boolean>
  consume: (handle: (data: User, attributes?: StringMap) => Promise<number>) => Promise<void>
}

export async function createContext(config: Config, pool: Pool, logger: Logger, retries: number[]): Promise<ApplicationContext> {
  const connection = await connect(config.url)
  const channel = await connection.createChannel()
  channel.assertQueue(config.queue, { durable: true })

  const sender = new Sender<User>(channel, config.queue)

  const rabbitmqChecker = new RabbitMQChecker(config.url)
  const mysqlChecker = new MySQLChecker(pool.promise())
  const health = new HealthController([rabbitmqChecker, mysqlChecker])

  const writer = new MySQLWriter<User>(pool, "users", userModel)
  const validator = new Validator<User>(userModel, true)
  const errorHandler = new ErrorHandler(logger.error)

  const consumer = new Consumer<User>(channel, config.queue, logger.error)
  const processor = new Processor<User, boolean>(writer.write, validator.validate, retries, errorHandler.error, logger.error, logger.info)

  const ctx: ApplicationContext = { consume: consumer.consume, send: sender.send, process: processor.process, health }
  return ctx
}

export function writeUser(msg: User): Promise<number> {
  console.log("Error: " + JSON.stringify(msg))
  return Promise.resolve(1)
}
