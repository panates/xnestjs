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

<--- BEGIN env --->

| Environment Variable          | Type      | Default | Description                                                              |
|-------------------------------|-----------|---------|--------------------------------------------------------------------------|
| `RMQ_URLS`                    | String[]! | —       | A list of RabbitMQ server URLs to connect to.                            |
| `RMQ_PREFETCH_COUNT`          | Number    | —       | Sets the prefetch count for consumers to control message flow.           |
| `RMQ_MAX_CONNECTION_ATTEMPTS` | Number    | —       | Maximum number of retry attempts to establish a connection.              |
| `RMQ_RECONNECT_TIME`          | Number    | —       | Time (in milliseconds) to wait before trying to reconnect.               |
| `RMQ_HEARTBEAT_INTERVAL`      | Number    | —       | Interval (in seconds) for the RabbitMQ heartbeat mechanism.              |
| `RMQ_LAZY_CONNECT`            | Boolean   | false   | If true, defers connecting to RabbitMQ until a message is sent/received. |

<--- END env --->

> 💡 You can customize the environment variable prefix during module registration by passing the `envPrefix` option.

## 📚 License

MIT License
