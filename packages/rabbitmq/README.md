# @xnestjs/rabbitmq

NestJS extension library for RabbitMQ

## Install

```sh
npm install @xnestjs/rabbitmq
# or using yarn
yarn add @xnestjs/rabbitmq
```

## Usage

### Register sync

An example of nestjs module that import the @xnestjs/rabbitmq

```ts
// module.ts
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

### Register async

An example of nestjs module that import the @xnestjs/rabbitmq async

```ts
// module.ts
import { Module } from '@nestjs/common';
import { RabbitmqModule } from '@xnestjs/rabbitmq';

@Module({
    imports: [
        RabbitmqModule.forRootAsync({
            inject: [ConfigModule],
            useFactory: (config: ConfigService) => ({
                urls: config.get('RMQ_URLS'),
            }),
        }),
    ]
})
export class MyModule {
}
```

## Environment Variables

The library supports configuration through environment variables. Environment variables below is accepted.
All environment variables starts with prefix (RMQ_). This can be configured while registering the module.

| Environment Variable        | Type      | Default | Description |
|-----------------------------|-----------|---------|-------------|
| RMQ_URLS                    | String[]! |         |             |
| RMQ_PREFETCH_COUNT          | Number    |         |             |
| RMQ_MAX_CONNECTION_ATTEMPTS | Number    |         |             |
| RMQ_RECONNECT_TIME          | Number    |         |             |
| RMQ_HEARTBEAT_INTERVAL      | Number    |         |             |
