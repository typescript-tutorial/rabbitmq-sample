# rabbitmq-sample

A production-style RabbitMQ sample application demonstrating how to build a clean, layered message processing system using the **core-ts** ecosystem.

This sample is **not** just a RabbitMQ producer/consumer example.

It demonstrates how to separate:

- Message transport
- Message processing
- Validation
- Retry
- Persistence

into independent layers.

---

# Architecture

```text
                      HTTP
                        │
                        ▼
                Application Context
                        │
                        ▼
                 RabbitMQ Consumer
                        │
                        ▼
                Message Processor
                        │
                        ▼
               JSON Deserialization
                        │
                        ▼
                Message Validation
                        │               No
                      Valid ? ────────────────────────┐
                        │                             │
                        │ Yes                         ▼
                        │                       Error Handler
                        ▼                       (or Discard)
                  Business Logic
                        │
                        ▼
                 Write to Database
                        │
              ┌─────────┴─────────┐
              │                   │
      Success │                   │ Failure
              │                   │
              ▼                   ▼
             Done         Retry Strategy
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
             Retry Succeeds             Retry Limit Reached
                    │                           │
                    ▼                           ▼
                   Done            Error Handler / Dead Letter Queue
```

The sample demonstrates a complete message processing pipeline rather than individual RabbitMQ operations.

---

# Features

- RabbitMQ producer
- RabbitMQ consumer
- Typed messages
- Message validation
- Automatic JSON deserialization
- Retry processing
- MySQL persistence
- Health check endpoint
- Layered architecture
- Production-oriented project structure

---

# Technologies

- TypeScript
- RabbitMQ
- MySQL
- Express
- amqplib

---

# Project Structure

```
src/
├── config.ts
├── context.ts (acts as a composition root)
├── index.ts (start the application)
├── user/
│   ├── user.ts
│   ├── port.ts
│   ├── message-transport.ts
│   ├── processor.ts
│   ├── validator.ts
│   ├── writer.ts
│   ├── retry-writer.ts
│   └── error-handler.ts
└── ...
```

The exact structure may vary, but responsibilities remain separated.

---

# Context Composition

The createContext() function acts as a composition root.

It wires together:

- RabbitMQ
- Health service
- Validation
- MySQL
- Retry
- Logging
- Processor

without mixing business logic.

That's exactly where dependency injection should happen.

# Ecosystem Integration

This sample demonstrates how several **core-ts** libraries work together.

| Library                                                                  | Purpose                           |
| ------------------------------------------------------------------------ | --------------------------------- |
| [`rabbitmq-transport`](https://www.npmjs.com/package/rabbitmq-transport) | Publish and subscribe to RabbitMQ |
| [`message-processing`](https://www.npmjs.com/package/message-processing) | Retry and error handling          |
| [`mysql2-core`](https://www.npmjs.com/package/mysql2-core)               | Write data into MySQL             |
| [`validation-core`](https://www.npmjs.com/package/validation-core)       | Validate incoming messages        |
| [`health-service`](https://www.npmjs.com/package/health-service)         | Health endpoint                   |
| [`logger-core`](https://www.npmjs.com/package/logger-core)               | Structured logging                |
| [`config-plus`](https://www.npmjs.com/package/config-plus)               | Configuration management          |

Each library focuses on a single responsibility.

That demonstrates the intended layering very well.

---

# Message Flow

## 1. Produce Message

- In the real application, we do not have message producer in this application.
- The message producer is in another microservice.
- This application consumes the message only.

```
 HTTP Request

      ↓

RabbitMQ Sender

      ↓

RabbitMQ Queue
```

The sender serializes the message and publishes it to RabbitMQ.

---

## 2. Consume Message

```
RabbitMQ Queue

      ↓

   Consumer

      ↓

   Processor
```

The consumer only receives messages.

Business processing is delegated to the Message Processing library.

---

## 3. Processing Pipeline

The processor executes the complete workflow.

```
Receive Message

       ↓

Deserialize JSON

       ↓

   Validate

       ↓

 Business Logic

       ↓

Write to Database
```

If processing succeeds, the message is acknowledged.

---

# Retry Processing

The sample demonstrates **immediate retry** for transient failures.

```
Write Database

      ↓

   Failure

      ↓

    Wait

      ↓

    Retry

      ↓

   Success
```

Typical retry scenarios include:

- temporary database outage
- deadlock
- network timeout
- transient infrastructure errors

Retry intervals are configurable.

Example:

```ts
const retries = [5000, 10000, 20000]
```

---

# Validation

Messages are validated before reaching business logic.

```
  RabbitMQ

      ↓

  Processor

      ↓

  Validator

      ↓

Business Logic
```

Invalid messages never reach the database.

---

# JSON Processing

Messages are automatically converted into TypeScript objects.

```
RabbitMQ

    ↓

  JSON

    ↓

  Order

    ↓

Processor
```

Business logic receives strongly typed objects instead of raw strings.

---

# Database Writer

Business logic writes data using **mysql2-core**.

```
Processor

    ↓

Repository

    ↓

  MySQL
```

RabbitMQ code never interacts directly with the database.

---

# Health Check

The sample exposes a health endpoint.

```
GET /health
```

Health checks include RabbitMQ connectivity and can easily be extended to include additional infrastructure services.

---

# Separation of Responsibilities

One of the goals of this sample is to demonstrate proper layering.

## rabbitmq-transport

Responsible for:

- Producer
- Consumer
- Header mapping
- Health checking

---

## message-processing

Responsible for:

- Processing pipeline
- Validation
- Retry
- Error handling
- Logging
- JSON deserialization

---

## Business Layer

Responsible only for business logic.

```
Process Order

Save Customer

Import Product

Send Notification
```

Business services remain independent of RabbitMQ.

---

# Why This Architecture?

Instead of embedding business logic inside RabbitMQ consumers,

```
  Consumer

      ↓

Business Logic

      ↓

   Database

      ↓

    Retry

      ↓

  Validation
```

the sample separates every concern.

```
  Consumer

      ↓

  Processor

      ↓

  Validation

      ↓

    Retry

      ↓

Business Logic

      ↓

    Writer
```

Each layer has a single responsibility.

This makes the application:

- easier to maintain
- easier to test
- easier to replace infrastructure
- easier to extend

---

# Production Considerations

This sample demonstrates production-oriented practices including:

- Layered architecture
- Strong typing
- Validation
- Retry processing
- Logging
- Health monitoring
- Infrastructure abstraction

Additional production features such as dead-letter queues, delayed retry queues, metrics, and distributed tracing can be added without changing the application architecture.

---

# License

MIT
