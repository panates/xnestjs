# @xnestjs/ioredis

NestJS extension library for ioredis

## Install

```sh
npm install @xnestjs/ioredis
# or using yarn
yarn add @xnestjs/ioredis
```

## Usage

### Register standalone sync

An example of nestjs module that creates RedisClient with standalone connection.

```ts
// module.ts
import { Module } from '@nestjs/common';
import { RedisModule } from '@xnestjs/ioredis';

@Module({
    imports: [
        RedisModule.forRoot({
            useValue: {
                host: 'localhost',
                port: 6379
            }
        }),
    ]
})
export class MyModule {
}
```

### Register cluster sync

An example of nestjs module that creates RedisClient with cluster connection.

```ts
// module.ts
import { Module } from '@nestjs/common';
import { RedisModule } from '@xnestjs/ioredis';

@Module({
    imports: [
        RedisModule.forRoot({
            useValue: {
                nodes: ['localhost'],
            }
        }),
    ]
})
export class MyModule {
}
```

### Register standalone async

An example of nestjs module that creates RedisClient with standalone connection async

```ts
// module.ts
import { Module } from '@nestjs/common';
import { RedisModule } from '@xnestjs/ioredis';

@Module({
    imports: [
        ElasticsearchModule.forRootAsync({
            inject: [ConfigModule],
            useFactory: (config: ConfigService) => ({
                host: config.get('REDIS_HOST'),
            }),
        }),
    ]
})
export class MyModule {
}
```

### Register cluster async

An example of nestjs module that creates RedisClient with cluster connection async

```ts
// module.ts
import { Module } from '@nestjs/common';
import { RedisModule } from '@xnestjs/ioredis';

@Module({
    imports: [
        ElasticsearchModule.forRootAsync({
            inject: [ConfigModule],
            useFactory: (config: ConfigService) => ({
                nodes: config.get('REDIS_NODES'),
            }),
        }),
    ]
})
export class MyModule {
}
```

## Environment Variables

The library supports configuration through environment variables. Environment variables below is accepted.
All environment variables starts with prefix (REDIS_). This can be configured while registering the module.

### Standalone Connection Variables

The following environment variables apply to the standalone connection.

| Environment Variable | Type   | Default   | Description |
|----------------------|--------|-----------|-------------|
| REDIS_HOST           | String | localhost |             |
| REDIS_PORT           | Number | 6379      |             |

### Cluster Connection Variables

The following environment variables apply to the standalone connection.

| Environment Variable | Type    | Default   | Description |
|----------------------|---------|-----------|-------------|
| NODES                | String! | localhost |             |

### Common Variables

| Environment Variable          | Type    | Default | Description                                                                                                                       |
|-------------------------------|---------|---------|-----------------------------------------------------------------------------------------------------------------------------------|
| REDIS_DB                      | Number  | 0       | Hostname for Redis Server                                                                                                         |
| REDIS_USERNAME                | String  |         | Port number                                                                                                                       |
| REDIS_PASSWORD                | String  |         | If set, client will send AUTH command with the value of this option as the first argument when connected.                         |
| REDIS_CONNECTION_NAME         | String  |         | If set, client will send AUTH command with the value of this option when connected.                                               |
| REDIS_AUTO_RESUBSCRIBE        | Boolean |         | When the client reconnects, channels subscribed in the previous connection will be resubscribed automatically if value is `true`. |
| REDIS_RECONNECT_ON_ERROR      | Number  |         | One of [`0`, `1`, `2`]                                                                                                            |
| REDIS_CONNECT_TIMEOUT         | Number  | 10000   | How long the client will wait before killing a socket due to inactivity during initial connection.                                |
| REDIS_SOCKET_TIMEOUT          | Number  |         | Defines the socket timeout value                                                                                                  |
| REDIS_KEEP_ALIVE              | Boolean |         | Enable/disable keep-alive functionality.                                                                                          |
| REDIS_NO_DELAY                | Boolean |         | Enable/disable the use of Nagle's algorithm.                                                                                      |
| REDIS_MAX_RETRIES_PER_REQUEST | Number  |         | Defines max retries per request value                                                                                             |
