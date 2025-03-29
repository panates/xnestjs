# @xnestjs/redisess

NestJS extension library for Redisess

## Install

```sh
npm install @xnestjs/redisess
# or using yarn
yarn add @xnestjs/redisess
```

## Usage

### Register sync

An example of nestjs module that import the @xnestjs/mongodb

```ts
// module.ts
import { Module } from '@nestjs/common';
import { RedisessModule } from '@xnestjs/redisess';

const client = new Redis();

@Module({
  imports: [
    RedisessModule.forRoot({
      useValue: {
        client,
        namespace: 'sessions',
      },
    }),
  ],
})
export class MyModule {}
```

### Register async

An example of nestjs module that import the @xnestjs/mongodb async

```ts
// module.ts
import { Module } from '@nestjs/common';
import { RedisessModule } from '@xnestjs/redisess';

const client = new Redis();

@Module({
  imports: [
    RedisessModule.forRootAsync({
      inject: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        client,
        namespace: config.get('SESSION_NAMESPACE'),
      }),
    }),
  ],
})
export class MyModule {}
```

## Environment Variables

The library supports configuration through environment variables. Environment variables below is accepted.
All environment variables starts with prefix (RMQ\_). This can be configured while registering the module.

<--- BEGIN env --->

| Environment Variable  | Type   | Default | Description                        |
| --------------------- | ------ | ------- | ---------------------------------- |
| SESSION_NAMESPACE     | String |         |                                    |
| SESSION_TTL           | Number | 1800    | Time-To-Live value in seconds      |
| SESSION_WIPE_INTERVAL | Number | 5000    | Interval in ms to run wipe process |

<--- END env --->
