import assert from 'node:assert';
import * as crypto from 'node:crypto';
import process from 'node:process';
import { clone } from '@jsopen/objects';
import { DynamicModule, Inject, Logger, OnApplicationBootstrap, OnApplicationShutdown, Provider } from '@nestjs/common';
import { ClientKafka, ClientProvider, ClientsModule, Transport } from '@nestjs/microservices';
import * as colors from 'ansi-colors';
import { SASLMechanism } from 'kafkajs';
import { toBoolean, toInt } from 'putil-varhelpers';
import { KAFKA_CONNECTION_OPTIONS, KAFKA_MODULE_ID } from './constants.js';
import { createLogCreator } from './create-log-creator.js';
import type { KafkaConnectionOptions, KafkaModuleAsyncOptions, KafkaModuleOptions } from './types';

const CLIENT_TOKEN = Symbol('CLIENT_TOKEN');

export class KafkaCoreModule implements OnApplicationShutdown, OnApplicationBootstrap {
  /**
   *
   */
  static forRoot(moduleOptions: KafkaModuleOptions): DynamicModule {
    const connectionOptions = this._readConnectionOptions(
      moduleOptions.useValue || {},
      moduleOptions.envPrefix ?? 'KAFKA_',
    );
    return this._createDynamicModule(moduleOptions, {
      global: moduleOptions.global,
      providers: [
        {
          provide: KAFKA_CONNECTION_OPTIONS,
          useValue: connectionOptions,
        },
      ],
    });
  }

  /**
   *
   */
  static forRootAsync(asyncOptions: KafkaModuleAsyncOptions): DynamicModule {
    assert.ok(asyncOptions.useFactory, 'useFactory is required');
    return this._createDynamicModule(asyncOptions, {
      global: asyncOptions.global,
      providers: [
        {
          provide: KAFKA_CONNECTION_OPTIONS,
          inject: asyncOptions.inject,
          useFactory: async (...args) => {
            const opts = await asyncOptions.useFactory!(...args);
            return this._readConnectionOptions(opts, asyncOptions.envPrefix ?? 'KAFKA_');
          },
        },
      ],
    });
  }

  private static _createDynamicModule(
    opts: KafkaModuleOptions | KafkaModuleAsyncOptions,
    metadata: Partial<DynamicModule>,
  ) {
    const token = opts.token ?? ClientKafka;
    const name = typeof token === 'string' ? token : 'Kafka';
    const logger = typeof opts.logger === 'string' ? new Logger(opts.logger) : opts.logger;
    const exports = [KAFKA_CONNECTION_OPTIONS, ...(metadata.exports ?? [])];
    const providers: Provider[] = [
      ...(metadata.providers ?? []),
      {
        provide: Logger,
        useValue: logger,
      },
      {
        provide: CLIENT_TOKEN,
        useExisting: token,
      },
      {
        provide: KAFKA_MODULE_ID,
        useValue: crypto.randomUUID(),
      },
    ];
    if (name !== token) {
      exports.push(token);
      providers.push({
        provide: token,
        useExisting: name,
      });
    }
    return {
      module: KafkaCoreModule,
      providers,
      imports: [
        /** Import ClientsModule */
        ClientsModule.registerAsync({
          clients: [
            {
              name,
              extraProviders: metadata.providers,
              inject: [KAFKA_CONNECTION_OPTIONS],
              useFactory: (connectionOptions: KafkaConnectionOptions): ClientProvider => {
                return {
                  transport: Transport.KAFKA,
                  options: {
                    client: {
                      ...connectionOptions,
                      logCreator: () => createLogCreator(logger),
                    },
                    consumer: connectionOptions.consumer!,
                  },
                };
              },
            },
          ],
        }),
      ],
      exports,
    } as DynamicModule;
  }

  private static _readConnectionOptions(
    moduleOptions: Partial<KafkaConnectionOptions>,
    prefix: string,
  ): KafkaConnectionOptions {
    const options = clone(moduleOptions) as KafkaConnectionOptions;
    const env = process.env;
    options.brokers = options.brokers || (env[prefix + 'URL'] ?? 'localhost').split(/\s*,\s*/);
    if (options.ssl == null && toBoolean(env[prefix + 'SSL'])) {
      options.ssl = {
        ca: [env[prefix + 'SSL_CA_CERT'] || ''],
        cert: env[prefix + 'SSL_CERT_FILE'],
        key: env[prefix + 'SSL_KEY_FILE'],
        passphrase: env[prefix + 'SSL_KEY_PASSPHRASE'],
        rejectUnauthorized: toBoolean(env[prefix + 'SSL_REJECT_UNAUTHORIZED']),
        checkServerIdentity: (host, cert) => {
          if (cert.subject.CN !== host) {
            return new Error(`Certificate CN (${cert.subject.CN}) does not match host (${host})`);
          }
        },
      };
    }
    const sasl = env[prefix + 'SASL'] as SASLMechanism;
    if (options.sasl == null && sasl) {
      if (sasl === 'plain' || sasl === 'scram-sha-256' || sasl === 'scram-sha-512') {
        options.sasl = {
          mechanism: sasl,
          username: env[prefix + 'SASL_USERNAME'] || '',
          password: env[prefix + 'SASL_PASSWORD'] || '',
        } as any;
      } else if (sasl === 'aws') {
        options.sasl = {
          mechanism: sasl,
          authorizationIdentity: env[prefix + 'AWS_AUTH_IDENTITY'] || '',
          accessKeyId: env[prefix + 'AWS_ACCESS_KEY_ID'] || '',
          secretAccessKey: env[prefix + 'AWS_SECRET_ACCESS_KEY'] || '',
          sessionToken: env[prefix + 'AWS_SESSION_TOKEN'],
        };
      }
    }
    options.clientId = options.clientId ?? env[prefix + 'CLIENT_ID'];
    options.connectionTimeout = options.connectionTimeout ?? toInt(env[prefix + 'CONNECT_TIMEOUT']);
    options.authenticationTimeout = options.authenticationTimeout ?? toInt(env[prefix + 'AUTH_TIMEOUT']);
    options.reauthenticationThreshold = options.reauthenticationThreshold ?? toInt(env[prefix + 'REAUTH_THRESHOLD']);
    options.requestTimeout = options.requestTimeout ?? toInt(env[prefix + 'REQUEST_TIMEOUT']);
    options.enforceRequestTimeout = options.enforceRequestTimeout ?? toBoolean(env[prefix + 'ENFORCE_REQUEST_TIMEOUT']);
    const retries = toInt(env[prefix + 'RETRIES']);
    if (options.retry == null && retries) {
      options.retry = {
        maxRetryTime: toInt(env[prefix + 'RETRY_MAX_TIME']),
        initialRetryTime: toInt(env[prefix + 'RETRY_INITIAL_TIME']),
        retries,
      };
    }
    options.consumer = options.consumer || ({} as any);
    options.consumer!.groupId =
      options.consumer!.groupId ?? (env[prefix + 'CONSUMER_GROUP_ID'] || 'kafka_default_group');
    return options;
  }

  /**
   *
   * @constructor
   */
  constructor(
    @Inject(CLIENT_TOKEN)
    protected client: ClientKafka,
    @Inject(KAFKA_CONNECTION_OPTIONS)
    private connectionOptions: KafkaConnectionOptions,
    private logger?: Logger,
  ) {}

  async onApplicationBootstrap() {
    const options = this.connectionOptions;
    if (!options.lazyConnect) {
      this.logger?.log(
        'Connecting to Kafka brokers' + (Array.isArray(options.brokers) ? colors.blue(options.brokers.join(',')) : ''),
      );
      Logger.flush();
      await this.client.connect().catch(e => {
        this.logger?.error('Kafka connection failed: ' + e.message);
        throw e;
      });
    }
  }

  onApplicationShutdown() {
    return this.client.close();
  }
}
