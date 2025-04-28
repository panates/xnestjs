# @xnestjs/rabbitmq

**@xnestjs/rabbitmq** is a powerful extension library for integrating RabbitMQ into your NestJS applications with ease.

## 📦 Installation

Use npm:

```sh
npm install @xnestjs/rabbitmq
```

Or with yarn:

```sh
yarn add @xnestjs/rabbitmq
```

## 🚀 Getting Started

### Synchronous Registration

Here's how to register the RabbitMQ module synchronously in your NestJS application:

```ts
// my.module.ts
import { Module } from '@nestjs/common';
import { RabbitmqModule } from '@xnestjs/rabbitmq';

@Module({
  imports: [
    RabbitmqModule.forRoot({
      useValue: {
        urls: ['amqp://localhost:5672'],
      },
    }),
  ],
})
export class MyModule {
}
```

### Asynchronous Registration

For dynamic configuration (e.g., using a ConfigService), use the async registration method:

```ts
// my.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RabbitmqModule } from '@xnestjs/rabbitmq';

@Module({
  imports: [
    ConfigModule.forRoot(),
    RabbitmqModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        urls: config.get<string[]>('RMQ_URLS'),
      }),
    }),
  ],
})
export class MyModule {
}
```

## ⚙️ Environment Variables

The module supports configuration via environment variables. These can be used in place of or alongside the object-based
configuration. By default, variables are prefixed with `RMQ_`.

<!--- BEGIN env --->

| Environment Variable     | Type      | Default | Description                                                                                         |
|--------------------------|-----------|---------|-----------------------------------------------------------------------------------------------------|
| `RMQ_URLS`               | String[]! |         | A list of RabbitMQ server URLs to connect to.                                                       |
| `RMQ_USERNAME`           | String    |         | Username used for authenticating against the server                                                 |
| `RMQ_PASSWORD`           | String    |         | Password used for authenticating against the server                                                 |
| `RMQ_HEARTBEAT_INTERVAL` | Number    | `5`     | Interval in seconds to send heartbeats to broker. Defaults to 5 seconds.                            |
| `RMQ_RECONNECT_TIME`     | Number    |         | The time to wait before trying to reconnect. If not specified, defaults to `RMQ_HEARTBEAT_INTERVAL` |
| `RMQ_NO_DELAY`           | Boolean   |         | when true sets TCP_NODELAY on the underlying socket.                                                |
| `RMQ_CONNECT_TIMEOUT`    | Number    |         | Specifies the socket timeout in milliseconds while establishing the connection                      |
| `RMQ_KEEP_ALIVE`         | Boolean   |         |                                                                                                     |
| `RMQ_KEEP_ALIVE_DELAY`   | Number    |         |                                                                                                     |
| `RMQ_CONNECTION_NAME`    | String    |         | Name of the connection. (Used for debugging)                                                        |
| `RMQ_LAZY_CONNECT`       | Boolean   | `false` | If true, defers connecting to RabbitMQ until a message is                                           |

<!--- END env --->

> 💡 You can customize the environment variable prefix during module registration by passing the `envPrefix` option.

## 📚 License

MIT License
