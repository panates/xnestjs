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
export class MyModule {}
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
export class MyModule {}
```

## ⚙️ Environment Variables

The module supports configuration via environment variables. These can be used in place of or alongside the object-based
configuration. By default, variables are prefixed with `RMQ_`.

<!--- BEGIN env --->

| Environment Variable     | Type      | Default          | Description                                                                                                                                                                                                                                                                                                                  |
| ------------------------ | --------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `RMQ_HOSTS`              | String[]! | `localhost:5672` | A list of RabbitMQ server hosts (hostname:port) to connect to. eg                                                                                                                                                                                                                                                            |
| `RMQ_VHOST`              | String    |                  | VHost                                                                                                                                                                                                                                                                                                                        |
| `RMQ_USERNAME`           | String    |                  | Username used for authenticating against the server                                                                                                                                                                                                                                                                          |
| `RMQ_PASSWORD`           | String    |                  | Password used for authenticating against the server                                                                                                                                                                                                                                                                          |
| `RMQ_ACQUIRE_TIMEOUT`    | Number    | `20000`          | Milliseconds to wait before aborting a Channel creation attempt.                                                                                                                                                                                                                                                             |
| `RMQ_CONNECTION_NAME`    | String    |                  | Custom name for the connection, visible in the server's management UI                                                                                                                                                                                                                                                        |
| `RMQ_CONNECTION_TIMEOUT` | Number    | `10000`          | Max wait time, in milliseconds, for a connection attempt                                                                                                                                                                                                                                                                     |
| `RMQ_FRAME_MAX`          | Number    | `8192`           | Max size, in bytes, of AMQP data frames. Protocol max is 2^32-1. Actual value is negotiated with the server.                                                                                                                                                                                                                 |
| `RMQ_HEARTBEAT_INTERVAL` | Number    | `60`             | Period of time, in seconds, after which the TCP connection should be considered unreachable. Server may have its own max value, in which case the lowest of the two is used. A value of 0 will disable this feature. Heartbeats are sent every heartbeat / 2 seconds, so two missed heartbeats means the connection is dead. |
| `RMQ_MAX_CHANNELS`       | Number    | `2047`           | Maximum active AMQP channels. 65535 is the protocol max. The server may also have a max value, in which case the lowest of the two is used.                                                                                                                                                                                  |
| `RMQ_RETRY_HIGH`         | Number    | `30000`          | Max delay, in milliseconds, for exponential-backoff when reconnecting                                                                                                                                                                                                                                                        |
| `RMQ_RETRY_LOW`          | Number    | `1000`           | Step size, in milliseconds, for exponential-backoff when reconnecting                                                                                                                                                                                                                                                        |
| `RMQ_NO_DELAY`           | Boolean   | `false`          | Disable Nagle's algorithm for reduced latency. Disabling Nagle’s algorithm will enable the application to have many small packets in flight on the network at once, instead of a smaller number of large packets, which may increase load on the network, and may or may not benefit the application performance.            |
| `RMQ_LAZY_CONNECT`       | Boolean   | `false`          | If true, defers connecting to RabbitMQ until a message is                                                                                                                                                                                                                                                                    |

<!--- END env --->

> 💡 You can customize the environment variable prefix during module registration by passing the `envPrefix` option.

## 📚 License

MIT License
