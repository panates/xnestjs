# @xnestjs/mongodb

NestJS extension library for MongoDB

## Install

```sh
npm install @xnestjs/mongodb
# or using yarn
yarn add @xnestjs/mongodb
```

## Usage

### Register sync

An example of nestjs module that import the @xnestjs/mongodb

```ts
// module.ts
import { Module } from '@nestjs/common';
import { MongoModule } from '@xnestjs/mongodb';

@Module({
    imports: [
        MongodbModule.forRoot({
            url: 'https://mydbserver:27017',
            database: 'test',
        }),
    ]
})
export class MyModule {
}
```

### Register async

An example of nestjs module that import the @xnestjs/mongodb async

```ts
// module.ts
import { Module } from '@nestjs/common';
import { MongoModule } from '@xnestjs/mongodb';

@Module({
    imports: [
        MongodbModule.forRootAsync({
            inject: [ConfigModule],
            useFactory: (config: ConfigService) => ({
                url: config.get('MONGODB_URL'),
                database: config.get('MONGODB_DATABASE'),
            }),
        }),
    ]
})
export class MyModule {
}
```

## Environment Variables

The library supports configuration through environment variables. Environment variables below is accepted.
All environment variables starts with prefix (MONGODB_). This can be configured while registering the module.

| Environment Variable                   | Type    | Default                   | Description                                                                                                                                                                                                                            |
|----------------------------------------|---------|---------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| MONGODB_URL                            | String  | mongodb://localhost:27017 | URL to MongoDB server                                                                                                                                                                                                                  |
| MONGODB_USERNAME                       | String  |                           | The username for auth                                                                                                                                                                                                                  |
| MONGODB_PASSWORD                       | String  |                           | The password for auth                                                                                                                                                                                                                  |
| MONGODB_AUTH_SOURCE                    | String  |                           | Specify the database name associated with the user’s credentials.                                                                                                                                                                      |
| MONGODB_DATABASE                       | String  |                           | The database name                                                                                                                                                                                                                      |
| MONGODB_REPLICA_SET                    | String  |                           | Specifies the name of the replica set, if the mongod is a member of a replica set.                                                                                                                                                     |
| MONGODB_TLS                            | Boolean | False                     | Enables or disables TLS/SSL for the connection.                                                                                                                                                                                        |
| MONGODB_TLS_CERT_FILE                  | String  |                           | Specifies the location of a local .pem file that contains either the client's TLS/SSL certificate and key.                                                                                                                             |
| MONGODB_TLS_CERT_FILE_PASS             | String  |                           | Specifies the password to de-crypt the tlsCertificateKeyFile.                                                                                                                                                                          |
| MONGODB_TLS_CA_FILE                    | String  |                           | Specifies the location of a local .pem file that contains the root certificate chain from the Certificate Authority. This file is used to validate the certificate presented by the mongod/mongos instance.                            |
| MONGODB_TLS_CRL_FILE                   | String  |                           | Specifies the location of a local CRL .pem file that contains the client revokation list.                                                                                                                                              |
| MONGODB_TLS_ALLOW_INVALID_CERTIFICATES | Boolean |                           | Bypasses validation of the certificates presented by the mongod/mongos instance                                                                                                                                                        |
| MONGODB_TLS_ALLOW_INVALID_HOSTNAMES    | Boolean |                           | Disables hostname validation of the certificate presented by the mongod/mongos instance.                                                                                                                                               |
| MONGODB_TLS_INSECURE                   | Boolean |                           | Disables various certificate validations.                                                                                                                                                                                              |
| MONGODB_TIMEOUT                        | Number  |                           | Specifies the time an operation will run until it throws a timeout error                                                                                                                                                               |
| MONGODB_CONNECT_TIMEOUT                | Number  |                           | The time in milliseconds to attempt a connection before timing out.                                                                                                                                                                    |
| MONGODB_SOCKET_TIMEOUT                 | Number  |                           | The time in milliseconds to attempt a send or receive on a socket before the attempt times out.                                                                                                                                        |
| MONGODB_SRV_MAX_HOSTS                  | Number  |                           | The maximum number of hosts to connect to when using an srv connection string, a setting of `0` means unlimited hosts                                                                                                                  |
| MONGODB_MAX_POOL_SIZE                  | Number  |                           | The maximum number of connections in the connection pool                                                                                                                                                                               |
| MONGODB_MIN_POOL_SIZE                  | Number  |                           | The minimum number of connections in the connection pool.                                                                                                                                                                              |
| MONGODB_MAX_CONNECTING                 | Number  |                           | The maximum number of connections that may be in the process of being established concurrently by the connection pool.                                                                                                                 |
| MONGODB_MAX_IDLE_TIME                  | Number  |                           | The maximum number of milliseconds that a connection can remain idle in the pool before being removed and closed.                                                                                                                      |
| MONGODB_MAX_WAIT_QUEUE_TIMEOUT         | Number  |                           | The maximum time in milliseconds that a thread can wait for a connection to become available.                                                                                                                                          |
| MONGODB_MAX_STALENESS_SECONDS          | Number  |                           | Specifies, in seconds, how stale a secondary can be before the client stops using it for read operations.                                                                                                                              |
| MONGODB_LOCAL_THRESHOLD                | Number  |                           | The size (in milliseconds) of the latency window for selecting among multiple suitable MongoDB instances.                                                                                                                              |
| MONGODB_SERVER_SELECTION_TIMEOUT       | Number  |                           | Specifies how long (in milliseconds) to block for server selection before throwing an exception.                                                                                                                                       |
| MONGODB_HEARTBEAT_FREQUENCY            | Number  |                           | heartbeatFrequencyMS controls when the driver checks the state of the MongoDB deployment. Specify the interval (in milliseconds) between checks, counted from the end of the previous check until the beginning of the next one.       |
| MONGODB_APP_NAME                       | String  |                           | The name of the application that created this MongoClient instance. MongoDB 3.4 and newer will print this value in the server log upon establishing each connection. It is also recorded in the slow query log and profile collections |
| MONGODB_RETRY_READS                    | Boolean |                           | Enables retryable reads.                                                                                                                                                                                                               |
| MONGODB_RETRY_WRITES                   | Boolean |                           | Enable retryable writes.                                                                                                                                                                                                               |
| MONGODB_DIRECT_CONNECTION              | Boolean |                           | Allow a driver to force a Single topology type with a connection string containing one host                                                                                                                                            |
| MONGODB_LOAD_BALANCED                  | Boolean |                           | Instruct the driver it is connecting to a load balancer fronting a mongos like service                                                                                                                                                 |
| MONGODB_NO_DELAY                       | Boolean |                           | TCP Connection no delay                                                                                                                                                                                                                |
| MONGODB_MONITOR_COMMANDS               | Boolean |                           | Enable command monitoring for this client                                                                                                                                                                                              |
| MONGODB_PROXY_HOST                     | String  |                           | Configures a Socks5 proxy host used for creating TCP connections.                                                                                                                                                                      |
| MONGODB_PROXY_PORT                     | String  |                           | Configures a Socks5 proxy port used for creating TCP connections.                                                                                                                                                                      |
| MONGODB_PROXY_USERNAME                 | String  |                           | Configures a Socks5 proxy username when the proxy in proxyHost requires username/password authentication.                                                                                                                              |
| MONGODB_PROXY_PASSWORD                 | String  |                           | Configures a Socks5 proxy password when the proxy in proxyHost requires username/password authentication.                                                                                                                              |
