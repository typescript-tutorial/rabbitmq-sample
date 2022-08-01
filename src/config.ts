export const config = {
  port: 8088,
  secure: false,
  template: true,
  allow: {
    origin: "http://localhost:3000",
    credentials: "true",
    methods: "GET,PUT,POST,DELETE,OPTIONS,PATCH",
    headers:
      "Access-Control-Allow-Headers, Authorization, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers",
  },
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
    uri: "mongodb://localhost:27017",
    db: "masterdata2",
  },
  rabbitmq: {
    url: 'amqps://mlxzdnko:0EGbofY9eg9lfqMoJGzeTmJj5iXR9NSe@chimpanzee.rmq.cloudamqp.com/mlxzdnko',
    queue: 'queue',
  }
};

export const env = {
  sit: {
    mongo: {
      db: 'masterdata',
    },
  },
  prd: {
    log: {
      level: 'error',
    },
    middleware: {
      log: false,
    },
  },
};
