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
import { RMQ_CONNECTION_OPTIONS, RMQ_MODULE_ID } from './constants.js';
import { getRabbitmqConfig } from './get-rabbitmq-config.js';
import { RmqClient } from './rmq-client.js';
import {
  type RabbitmqConnectionOptions,
  type RabbitmqModuleAsyncOptions,
  type RabbitmqModuleOptions,
} from './types.js';

const CLIENT_TOKEN = Symbol('CLIENT_TOKEN');

export class RabbitmqCoreModule
  implements OnApplicationShutdown, OnApplicationBootstrap
{
  /**
   *
   */
  static forRoot(moduleOptions: RabbitmqModuleOptions): DynamicModule {
    const connectionOptions = getRabbitmqConfig(
      moduleOptions.useValue || {},
      moduleOptions.envPrefix,
    );
    return this._createDynamicModule(moduleOptions, {
      global: moduleOptions.global,
      providers: [
        {
          provide: RMQ_CONNECTION_OPTIONS,
          useValue: connectionOptions,
        },
      ],
    });
  }

  /**
   *
   */
  static forRootAsync(asyncOptions: RabbitmqModuleAsyncOptions): DynamicModule {
    assert.ok(asyncOptions.useFactory, 'useFactory is required');
    return this._createDynamicModule(asyncOptions, {
      global: asyncOptions.global,
      providers: [
        {
          provide: RMQ_CONNECTION_OPTIONS,
          inject: asyncOptions.inject,
          useFactory: async (...args) => {
            const opts = await asyncOptions.useFactory!(...args);
            return getRabbitmqConfig(opts, asyncOptions.envPrefix);
          },
        },
      ],
    });
  }

  private static _createDynamicModule(
    opts: RabbitmqModuleOptions | RabbitmqModuleAsyncOptions,
    metadata: Partial<DynamicModule>,
  ) {
    const token = opts.token ?? RmqClient;
    // const name = typeof token === 'string' ? token : 'RabbitMQ';
    const logger =
      typeof opts.logger === 'string' ? new Logger(opts.logger) : opts.logger;
    const exports = [RMQ_CONNECTION_OPTIONS, ...(metadata.exports ?? [])];
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
        provide: RMQ_MODULE_ID,
        useValue: crypto.randomUUID(),
      },
      {
        provide: token,
        inject: [RMQ_CONNECTION_OPTIONS],
        useFactory: async (connectionOptions: RabbitmqConnectionOptions) => {
          return new RmqClient(connectionOptions);
        },
      },
    ];
    return {
      module: RabbitmqCoreModule,
      providers,
      exports,
    } as DynamicModule;
  }

  /**
   *
   * @constructor
   */
  constructor(
    @Inject(CLIENT_TOKEN)
    protected client: RmqClient,
    @Inject(RMQ_CONNECTION_OPTIONS)
    private connectionOptions: RabbitmqConnectionOptions,
    private logger?: Logger,
  ) {}

  async onApplicationBootstrap() {
    const options = this.connectionOptions;
    this.client.on('error', e => {
      console.log(e);
    });
    if (options.lazyConnect || !options.hostname) return;
    this.logger?.log(
      'Connecting to RabbitMQ at ' + colors.blue(options.hostname),
    );
    Logger.flush();
    await this.client.connect().catch(e => {
      this.logger?.error('RabbitMQ connection failed: ' + e.message);
      throw e;
    });
  }

  onApplicationShutdown() {
    return this.client.close();
  }
}
