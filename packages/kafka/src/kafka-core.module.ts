import assert from 'node:assert';
import * as crypto from 'node:crypto';
import { DynamicModule, Inject, Logger, OnApplicationBootstrap, OnApplicationShutdown, Provider } from '@nestjs/common';
import { ClientKafka, ClientProvider, ClientsModule, Transport } from '@nestjs/microservices';
import colors from 'ansi-colors';
import { KAFKA_CONNECTION_OPTIONS, KAFKA_MODULE_ID } from './constants.js';
import { createLogCreator } from './create-log-creator.js';
import { getKafkaConfig } from './get-kafka-config.js';
import type { KafkaConnectionOptions, KafkaModuleAsyncOptions, KafkaModuleOptions } from './types';

const CLIENT_TOKEN = Symbol('CLIENT_TOKEN');

export class KafkaCoreModule implements OnApplicationShutdown, OnApplicationBootstrap {
  /**
   *
   */
  static forRoot(moduleOptions: KafkaModuleOptions): DynamicModule {
    const connectionOptions = getKafkaConfig(moduleOptions.useValue || {}, moduleOptions.envPrefix);
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
            return getKafkaConfig(opts, asyncOptions.envPrefix);
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
    if (options.lazyConnect) return;
    this.logger?.log(
      'Connecting to Kafka brokers' + (Array.isArray(options.brokers) ? colors.blue(options.brokers.join(',')) : ''),
    );
    Logger.flush();
    await this.client.connect().catch(e => {
      this.logger?.error('Kafka connection failed: ' + e.message);
      throw e;
    });
  }

  onApplicationShutdown() {
    return this.client.close();
  }
}
