import { merge } from "config-plus"
import dotenv from "dotenv"
import http from "http"
import { createLogger, getBody } from "logger-core"
import { createPool } from "mysql2-core"
import { config, environments } from "./config"
import { createContext } from "./context"

dotenv.config()
const cfg = merge(config, process.env, environments, process.env.ENV)

const logger = createLogger(cfg.log)
const pool = createPool(cfg.db)

createContext(cfg.rabbitmq, pool, logger).then((ctx) => {
  ctx.read(ctx.process)
  http
    .createServer((req, res) => {
      if (req.url === "/health") {
        ctx.health.check(req, res)
      } else if (req.url === "/send") {
        getBody(req)
          .then((body: any) => {
            ctx
              .sender(JSON.parse(body))
              .then(() => {
                res.writeHead(200, { "Content-Type": "application/json" })
                res.end(JSON.stringify({ message: "message was produced" }))
              })
              .catch((err: any) => {
                res.writeHead(500, { "Content-Type": "application/json" })
                res.end(JSON.stringify({ error: err }))
              })
          })
          .catch((err) => console.log(err))
      }
    })
    .listen(cfg.port, () => {
      console.log("Start server at port " + cfg.port)
    })
})
