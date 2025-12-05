import assert from 'node:assert';
import * as crypto from 'node:crypto';
import {
  DynamicModule,
  Inject,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
  Provider,
} from '@nestjs/common';
import colors from 'ansi-colors';
import { Admin, Consumer, Kafka, Producer } from 'kafkajs';
import { KAFKA_CONNECTION_OPTIONS, KAFKA_MODULE_ID } from './constants.js';
import { createLogCreator } from './create-log-creator.js';
import { getKafkaConfig } from './get-kafka-config.js';
import type {
  KafkaConnectionOptions,
  KafkaModuleAsyncOptions,
  KafkaModuleOptions,
} from './types';

const CLIENT_TOKEN = Symbol('CLIENT_TOKEN');

export class KafkaCoreModule
  implements OnApplicationShutdown, OnApplicationBootstrap
{
  /**
   *
   */
  static forRoot(moduleOptions: KafkaModuleOptions): DynamicModule {
    const connectionOptions = getKafkaConfig(
      moduleOptions.useValue || {},
      moduleOptions.envPrefix,
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
    const token = opts.token ?? Kafka;
    const logger =
      typeof opts.logger === 'string' ? new Logger(opts.logger) : opts.logger;
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
      {
        provide: token,
        inject: [KAFKA_CONNECTION_OPTIONS],
        useFactory: (connectionOptions: KafkaConnectionOptions) => {
          return new Kafka({
            ...connectionOptions,
            logCreator: () => createLogCreator(logger),
          });
        },
      },
    ];
    return {
      global: opts.global,
      module: KafkaCoreModule,
      imports: (opts as KafkaModuleAsyncOptions).imports,
      ...metadata,
      providers,
      exports: [KAFKA_CONNECTION_OPTIONS, ...(metadata.exports ?? [])],
    } as DynamicModule;
  }

  private _admins = new Set<Admin>();
  private _consumers = new Set<Consumer>();
  private _producers = new Set<Producer>();

  /**
   *
   * @constructor
   */
  constructor(
    @Inject(CLIENT_TOKEN)
    protected client: Kafka,
    @Inject(KAFKA_CONNECTION_OPTIONS)
    private connectionOptions: KafkaConnectionOptions,
    private logger?: Logger,
  ) {}

  async onApplicationBootstrap() {
    const options = this.connectionOptions;
    const _this = this;
    const oldConsumerFn = this.client.consumer;
    this.client.consumer = function (...args: any[]) {
      const instance = oldConsumerFn.apply(this, args as any);
      _this._consumers.add(instance);
      instance.on('consumer.disconnect', () =>
        _this._consumers.delete(instance),
      );
      return instance;
    };
    const oldProducerFn = this.client.producer;
    this.client.producer = function (...args: any[]) {
      const instance = oldProducerFn.apply(this, args as any);
      _this._producers.add(instance);
      instance.on('producer.disconnect', () =>
        _this._producers.delete(instance),
      );
      return instance;
    };

    if (options.lazyConnect || !options.brokers) return;
    this.logger?.log(
      'Testing to Kafka brokers' +
        (Array.isArray(options.brokers)
          ? colors.blue(options.brokers.join(','))
          : ''),
    );
    Logger.flush();
    const admin = this.client.admin();
    try {
      await admin.connect();
      await admin.fetchTopicMetadata(); // this will fail if Kafka is not reachable
      this.logger?.log('Kafka connection is healthy');
    } catch (error: any) {
      this.logger?.error('Kafka connection failed: ' + error.message);
      throw error;
    } finally {
      await admin.disconnect();
    }
  }

  onApplicationShutdown() {
    return Promise.allSettled([
      ...Array.from(this._admins).map(x => x.disconnect()),
      ...Array.from(this._consumers).map(x => x.disconnect()),
      ...Array.from(this._producers).map(x => x.disconnect()),
    ]);
  }
}
