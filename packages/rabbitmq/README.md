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

| Environment Variable     | Type    | Default        | Description                                                                                                                                                                           |
|--------------------------|---------|----------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `RMQ_HOSTNAME`           | String  | `localhost`    | Hostname used for connecting to the server                                                                                                                                            |
| `RMQ_PORT`               | Number  | `5672`         | Port used for connecting to the server                                                                                                                                                |
| `RMQ_PORT`               | Number  |                | Port used for connecting to the server                                                                                                                                                |
| `RMQ_USERNAME`           | String  |                | Username used for authenticating against the server                                                                                                                                   |
| `RMQ_PASSWORD`           | String  |                | Password used for authenticating against the server                                                                                                                                   |
| `RMQ_LOCALE`             | String  | `en_US`        | The desired locale for error messages. RabbitMQ only ever uses en_US                                                                                                                  |
| `RMQ_FRAME_MAX`          | Number  | `0x1000` (4kb) | The size in bytes of the maximum frame allowed over the connection. 0 means no limit (but since frames have a size field which is an unsigned 32 bit integer, it’s perforce 2^32 - 1) |
| `RMQ_HEARTBEAT_INTERVAL` | Number  | `0`            | The period of the connection heartbeat in seconds                                                                                                                                     |
| `RMQ_VHOST`              | String  | `/`            | What VHost shall be used                                                                                                                                                              |
| `RMQ_LAZY_CONNECT`       | Boolean | `false`        | If true, defers connecting to RabbitMQ until a message is sent/received.                                                                                                              |

<!--- END env --->

> 💡 You can customize the environment variable prefix during module registration by passing the `envPrefix` option.

## 📚 License

MIT License
