export const config = {
  port: 8088,
  secure: false,
  log: {
    level: "debug",
    map: {
      time: "@timestamp",
      msg: "message",
    },
    db: true,
  },
  middleware: {
    log: true,
    skips: "health,log",
    request: "request",
    status: "status",
    size: "size",
  },
  db: {
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    password: "abcd1234",
    database: "masterdata",
    multipleStatements: true,
  },
  rabbitmq: {
    url: "amqp://admin:abcd1234@localhost:5672",
    queue: "orders",
  },
}

export const environments = {
  sit: {
    mongo: {
      db: "masterdata",
    },
  },
  prd: {
    log: {
      level: "error",
    },
    middleware: {
      log: false,
    },
  },
}
