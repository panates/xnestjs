# @xnestjs/elasticsearch

NestJS extension library for ElasticSearch

## Install

```sh
npm install @xnestjs/elasticsearch
# or using yarn
yarn add @xnestjs/elasticsearch
```

## Usage

### Register sync

An example of nestjs module that import the @xnestjs/elasticsearch

```ts
// module.ts
import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@xnestjs/elasticsearch';

@Module({
    imports: [
        ElasticsearchModule.forRoot({
            useValue: {
                node: 'http://localhost:9201',
            },
        }),
    ],
})
export class MyModule {
}
```

### Register async

An example of nestjs module that import the @xnestjs/elasticsearch async

```ts
// module.ts
import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@xnestjs/elasticsearch';

@Module({
    imports: [
        ElasticsearchModule.forRootAsync({
            inject: [ConfigModule],
            useFactory: (config: ConfigService) => ({
                node: config.get('ELASTIC_NODE'),
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

| Environment Variable                 | Type    | Default               | Description                                                                                                                                                                                            |
|--------------------------------------|---------|-----------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| ELASTIC_NODE                         | String  | http://localhost:9200 | Elasticsearch node settings, if there is only one node. Required if `NODES` or `CLOUD_ID` is not set.                                                                                                  |
| ELASTIC_NODES                        | String  |                       | Elasticsearch node settings, if there is only one node. Required if `NODE` or `CLOUD_ID` is not set.                                                                                                   |
| ELASTIC_NAME                         | String  | elasticsearch-js      | A name for client                                                                                                                                                                                      |
| ELASTIC_MAX_RESPONSE_SIZE            | Number  |                       | When configured, verifies that the uncompressed response size is lower than the configured number. If it's higher, it will abort the request.                                                          |
| ELASTIC_MAX_COMPRESSED_RESPONSE_SIZE | Number  |                       | When configured, verifies that the compressed response size is lower than the configured number. If it's higher, it will abort the request.                                                            |
| ELASTIC_MAX_RETRIES                  | Number  | 3                     | Max number of retries for each request                                                                                                                                                                 |
| ELASTIC_REQUEST_TIMEOUT              | Number  | 30000                 | Max request timeout in milliseconds for each request                                                                                                                                                   |
| ELASTIC_PING_TIMEOUT                 | Number  | 3000                  | Max number of milliseconds a `ClusterConnectionPool` will wait when pinging nodes before marking them dead                                                                                             |
| ELASTIC_AUTH_USERNAME                | String  |                       | BasicAuth username                                                                                                                                                                                     |
| ELASTIC_AUTH_PASSWORD                | String  |                       | BasicAuth password                                                                                                                                                                                     |
| ELASTIC_AUTH_BEARER                  | String  |                       | BearerAuth bearer header value                                                                                                                                                                         |
| ELASTIC_AUTH_API_KEY                 | String  |                       | ApiKeyAuth api key                                                                                                                                                                                     |
| ELASTIC_API_KEY_ID                   | String  |                       | ApiKeyAuth api key id                                                                                                                                                                                  |
| ELASTIC_TLS                          | Boolean | False                 | Enabled the TLS connection                                                                                                                                                                             |
| ELASTIC_TLS_CA_CERT                  | String  |                       | Optionally override the trusted CA certificates. Default is to trust the well-known CAs curated by Mozilla. Mozilla's CAs are completely replaced when CAs are explicitly specified using this option. |
| ELASTIC_TLS_CERT_FILE                | String  |                       | The File that contains Cert chains in PEM format.                                                                                                                                                      |
| ELASTIC_TLS_KEY_FILE                 | String  |                       | The File that contains private keys in PEM format.                                                                                                                                                     |
| ELASTIC_TLS_KEY_PASSPHRASE           | String  |                       | PFX or PKCS12 encoded private key and certificate chain.                                                                                                                                               |
| ELASTIC_TLS_REJECT_UNAUTHORIZED      | Boolean | False                 | If true the server will reject any connection which is notauthorized with the list of supplied CAs. This option only has an effect if requestCert is true.                                             |
| ELASTIC_CA_FINGERPRINT               | String  |                       | If configured, verifies that the fingerprint of the CA certificate that has signed the certificate of the server matches the supplied fingerprint; only accepts SHA256 digest fingerprints             |
