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
export class MyModule {}
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
export class MyModule {}
```

## Environment Variables

| ENV                            | Type    | Default               | Description                                                                                                                                                                                                                            |
|--------------------------------|---------|-----------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| URL                            | String  | http://localhost:9200 | URL to MongoDB server                                                                                                                                                                                                                  |
| USERNAME                       | String  |                       | The username for auth                                                                                                                                                                                                                  |
| PASSWORD                       | String  |                       | The password for auth                                                                                                                                                                                                                  |
| AUTH_SOURCE                    | String  |                       | Specify the database name associated with the user’s credentials.                                                                                                                                                                      |
| DATABASE                       | String  |                       | The database name                                                                                                                                                                                                                      |
| REPLICA_SET                    | String  |                       | Specifies the name of the replica set, if the mongod is a member of a replica set.                                                                                                                                                     |
| TLS                            | Boolean | False                 | Enables or disables TLS/SSL for the connection.                                                                                                                                                                                        |
| TLS_CERT_FILE                  | String  |                       | Specifies the location of a local .pem file that contains either the client's TLS/SSL certificate and key.                                                                                                                             |
| TLS_CERT_FILE_PASS             | String  |                       | Specifies the password to de-crypt the tlsCertificateKeyFile.                                                                                                                                                                          |
| TLS_CA_FILE                    | String  |                       | Specifies the location of a local .pem file that contains the root certificate chain from the Certificate Authority. This file is used to validate the certificate presented by the mongod/mongos instance.                            |
| TLS_CRL_FILE                   | String  |                       | Specifies the location of a local CRL .pem file that contains the client revokation list.                                                                                                                                              |
| TLS_ALLOW_INVALID_CERTIFICATES | Boolean |                       | Bypasses validation of the certificates presented by the mongod/mongos instance                                                                                                                                                        |
| TLS_ALLOW_INVALID_HOSTNAMES    | Boolean |                       | Disables hostname validation of the certificate presented by the mongod/mongos instance.                                                                                                                                               |
| TLS_INSECURE                   | Boolean |                       | Disables various certificate validations.                                                                                                                                                                                              |
| TIMEOUT                        | Number  |                       | Specifies the time an operation will run until it throws a timeout error                                                                                                                                                               |
| CONNECT_TIMEOUT                | Number  |                       | The time in milliseconds to attempt a connection before timing out.                                                                                                                                                                    |
| SOCKET_TIMEOUT                 | Number  |                       | The time in milliseconds to attempt a send or receive on a socket before the attempt times out.                                                                                                                                        |
| SRV_MAX_HOSTS                  | Number  |                       | The maximum number of hosts to connect to when using an srv connection string, a setting of `0` means unlimited hosts                                                                                                                  |
| MAX_POOL_SIZE                  | Number  |                       | The maximum number of connections in the connection pool                                                                                                                                                                               |
| MIN_POOL_SIZE                  | Number  |                       | The minimum number of connections in the connection pool.                                                                                                                                                                              |
| MAX_CONNECTING                 | Number  |                       | The maximum number of connections that may be in the process of being established concurrently by the connection pool.                                                                                                                 |
| MAX_IDLE_TIME                  | Number  |                       | The maximum number of milliseconds that a connection can remain idle in the pool before being removed and closed.                                                                                                                      |
| MAX_WAIT_QUEUE_TIMEOUT         | Number  |                       | The maximum time in milliseconds that a thread can wait for a connection to become available.                                                                                                                                          |
| MAX_STALENESS_SECONDS          | Number  |                       | Specifies, in seconds, how stale a secondary can be before the client stops using it for read operations.                                                                                                                              |
| LOCAL_THRESHOLD                | Number  |                       | The size (in milliseconds) of the latency window for selecting among multiple suitable MongoDB instances.                                                                                                                              |
| SERVER_SELECTION_TIMEOUT       | Number  |                       | Specifies how long (in milliseconds) to block for server selection before throwing an exception.                                                                                                                                       |
| HEARTBEAT_FREQUENCY            | Number  |                       | heartbeatFrequencyMS controls when the driver checks the state of the MongoDB deployment. Specify the interval (in milliseconds) between checks, counted from the end of the previous check until the beginning of the next one.       |
| APP_NAME                       | String  |                       | The name of the application that created this MongoClient instance. MongoDB 3.4 and newer will print this value in the server log upon establishing each connection. It is also recorded in the slow query log and profile collections |
| RETRY_READS                    | Boolean |                       | Enables retryable reads.                                                                                                                                                                                                               |
| RETRY_WRITES                   | Boolean |                       | Enable retryable writes.                                                                                                                                                                                                               |
| DIRECT_CONNECTION              | Boolean |                       | Allow a driver to force a Single topology type with a connection string containing one host                                                                                                                                            |
| LOAD_BALANCED                  | Boolean |                       | Instruct the driver it is connecting to a load balancer fronting a mongos like service                                                                                                                                                 |
| NO_DELAY                       | Boolean |                       | TCP Connection no delay                                                                                                                                                                                                                |
| MONITOR_COMMANDS               | Boolean |                       | Enable command monitoring for this client                                                                                                                                                                                              |
| PROXY_HOST                     | String  |                       | Configures a Socks5 proxy host used for creating TCP connections.                                                                                                                                                                      |
| PROXY_PORT                     | String  |                       | Configures a Socks5 proxy port used for creating TCP connections.                                                                                                                                                                      |
| PROXY_USERNAME                 | String  |                       | Configures a Socks5 proxy username when the proxy in proxyHost requires username/password authentication.                                                                                                                              |
| PROXY_PASSWORD                 | String  |                       | Configures a Socks5 proxy password when the proxy in proxyHost requires username/password authentication.                                                                                                                              |

