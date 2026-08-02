import { merge } from "config-plus"
import dotenv from "dotenv"
import { getBody, LogController } from "health-service"
import http from "http"
import { createLogger, updateLog } from "logger-core"
import { createRetry } from "message-processing"
import { createPool } from "mysql2-core"
import { config, environments } from "./config"
import { createContext } from "./context"

const logger = createLogger(config.log)

dotenv.config()
const cfg = merge(config, process.env, environments, process.env.ENV)
updateLog(logger, cfg.log)

const pool = createPool(cfg.db)
const retries = createRetry(cfg.retries)

createContext(cfg.rabbitmq, pool, logger, retries).then((ctx) => {
  const log = new LogController(logger, updateLog)
  ctx.consume(ctx.process)
  http
    .createServer((req, res) => {
      if (req.url === "/health") {
        ctx.health.check(req, res)
      } else if (req.url === "/log") {
        log.config(req, res)
      } else if (req.url === "/send") {
        getBody(req)
          .then((body: any) => {
            ctx
              .send(JSON.parse(body))
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
