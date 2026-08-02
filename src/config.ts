export const config = {
  port: 8088,
  log: {
    level: "debug",
    map: {
      time: "@timestamp",
      msg: "message",
    },
  },
  middleware: {
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
  retries: {
    1: 10000,
    2: 15000,
    3: 25000,
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
