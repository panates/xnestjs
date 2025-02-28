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
export class MyModule {
}
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
    ]
})
export class MyModule {
}
```
