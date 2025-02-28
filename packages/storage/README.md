# @xnestjs/storage

NestJS extension library for Storage solutions (S3,GS)

## Install

```sh
npm install @xnestjs/storage
# or using yarn
yarn add @xnestjs/storage
```

## Usage

### Register sync

An example of nestjs module that import the @xnestjs/storage

```ts
// module.ts
import { Module } from '@nestjs/common';
import { StorageModule } from '@xnestjs/storage';

@Module({
    imports: [
        StorageModule.forRoot({
            useValue: {
                provider: 's3',
                s3: {
                    endPoint: 'play.min.io',
                    port: 9000,
                    useSSL: true,
                    accessKey: 'accessKey',
                    secretKey: 'secretKey',
                },
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
import { StorageModule } from '@xnestjs/storage';

@Module({
    imports: [
        StorageModule.forRootAsync({
            inject: [ConfigModule],
            useFactory: (config: ConfigService) => ({
                provider: 's3',
                s3: {
                    endPoint: config.get('S3_ENDPOINT'),
                },
            }),
        }),
    ],
})
export class MyModule {
}
```

## Environment Variables

The library supports configuration through environment variables. Environment variables below is accepted.
All environment variables starts with prefix (STORAGE_). This can be configured while registering the module.

| Environment Variable | Type | Default | Description                         |
|----------------------|------|---------|-------------------------------------|
| STORAGE_PROVIDER     | Enum |         | Storage Provider `s3` for Amazon S3 |

## Amazon S3 Environment Variables

| Environment Variable     | Type    | Default | Description     |
|--------------------------|---------|---------|-----------------|
| STORAGE_S3_ENDPOINT      | String  |         | S3 Endpoint URL |
| STORAGE_S3_SECRET_KEY    | String  |         |                 |
| STORAGE_S3_SSL           | Boolean |         |                 |
| STORAGE_S3_PORT          | Number  |         |                 |
| STORAGE_S3_SESSION_TOKEN | String  |         |                 |
| STORAGE_S3_PART_SIZE     | Number  |         |                 |
| STORAGE_S3_PATH_STYLE    | Boolean |         |                 |
| STORAGE_S3_SECRET_KEY    | String  |         |                 |
| STORAGE_S3_ACC_ENDPOINT  | String  |         |                 |
