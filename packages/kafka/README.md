# @xnestjs/kafka

NestJS extension library for Apache Kafka

## Install

```sh
npm install @xnestjs/kafka
# or using yarn
yarn add @xnestjs/kafka
```

## Usage

### Register sync

An example of nestjs module that import the @xnestjs/kafka

```ts
// module.ts
import { Module } from '@nestjs/common';
import { KafkaModule } from '@xnestjs/kafka';

@Module({
    imports: [
        KafkaModule.forRoot({
            useValue: {
                brokers: ['localhost'],
            },
        }),
    ],
})
export class MyModule {
}
```

### Register async

An example of nestjs module that import the @xnestjs/kafka async

```ts
// module.ts
import { Module } from '@nestjs/common';
import { KafkaModule } from '@xnestjs/kafka';

@Module({
    imports: [
        KafkaModule.forRootAsync({
            inject: [ConfigModule],
            useFactory: (config: ConfigService) => ({
                brokers: config.get('KAFKA_BROKERS'),
            }),
        }),
    ]
})
export class MyModule {
}
```

## Environment Variables

The library supports configuration through environment variables. Environment variables below is accepted.
All environment variables starts with prefix (KAFKA_). This can be configured while registering the module.

<--- BEGIN env --->

| Environment Variable            | Type      | Default               | Description                                                                                                                                                                                            |
|---------------------------------|-----------|-----------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `KAFKA_BROKERS`                 | String[]! | `localhost `          | Host names of Kafka brokers                                                                                                                                                                            |
| `KAFKA_CONSUMER_GROUP_ID`       | String    | `kafka_default_group` |                                                                                                                                                                                                        |
| `KAFKA_CLIENT_ID`               | String    |                       |                                                                                                                                                                                                        |
| `KAFKA_SASL`                    | Enum      |                       | Defines the SASL Mechanism. Accepted values are (`plain`, `scram-sha-256`, `scram-sha-512`, `aws`)                                                                                                     |
| `KAFKA_SSL`                     | Boolean   | `false`               | Enabled the SSL connection                                                                                                                                                                             |
| `KAFKA_SSL_CA_CERT`             | String    |                       | Optionally override the trusted CA certificates. Default is to trust the well-known CAs curated by Mozilla. Mozilla's CAs are completely replaced when CAs are explicitly specified using this option. |
| `KAFKA_SSL_CERT_FILE`           | String    |                       | The File that contains Cert chains in PEM format.                                                                                                                                                      |
| `KAFKA_SSL_KEY_FILE`            | String    |                       | The File that contains private keys in PEM format.                                                                                                                                                     |
| `KAFKA_SSL_KEY_PASSPHRASE`      | String    |                       | PFX or PKCS12 encoded private key and certificate chain.                                                                                                                                               |
| `KAFKA_SSL_REJECT_UNAUTHORIZED` | Boolean   |                       | If true the server will reject any connection which is notauthorized with the list of supplied CAs. This option only has an effect if requestCert is true.                                             |
| `KAFKA_CONNECT_TIMEOUT`         | Number    |                       |                                                                                                                                                                                                        |
| `KAFKA_AUTH_TIMEOUT`            | Number    |                       |                                                                                                                                                                                                        |
| `KAFKA_REAUTH_THRESHOLD`        | Number    |                       |                                                                                                                                                                                                        |
| `KAFKA_REQUEST_TIMEOUT`         | Number    |                       |                                                                                                                                                                                                        |
| `KAFKA_ENFORCE_REQUEST_TIMEOUT` | Number    |                       |                                                                                                                                                                                                        |
| `KAFKA_RETRIES`                 | Number    |                       |                                                                                                                                                                                                        |
| `KAFKA_RETRY_MAX_TIME`          | Number    |                       |                                                                                                                                                                                                        |
| `KAFKA_RETRY_INITIAL_TIME`      | Number    |                       |                                                                                                                                                                                                        |
| `KAFKA_LAZY_CONNECT`            | Boolean   | `false`               | If true, defers connecting to Kafka until a message is sent/received.                                                                                                                                  |

### SASL Environment Variables

The environment variables are available when KAFKA_SASL is one of `plain`, `scram-sha-256` or `scram-sha-512`

| Environment Variable | Type    | Default | Description |
|----------------------|---------|---------|-------------|
| KAFKA_SASL_USERNAME  | String! |         | Username    |
| KAFKA_SASL_PASSWORD  | String! |         | Password    |

The environment variables are available when KAFKA_SASL is `aws`

| Environment Variable  | Type    | Default | Description |
|-----------------------|---------|---------|-------------|
| AWS_AUTH_IDENTITY     | String! |         |             |
| AWS_ACCESS_KEY_ID     | String! |         |             |
| AWS_SECRET_ACCESS_KEY | String! |         |             |
| AWS_SESSION_TOKEN     | String  |         |             |

<--- END env --->
