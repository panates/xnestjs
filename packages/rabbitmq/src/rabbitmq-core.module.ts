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
import {
  type RabbitmqConnectionOptions,
  type RabbitmqModuleAsyncOptions,
  type RabbitmqModuleOptions,
  RmqClient,
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
      moduleOptions.useValue,
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
          const client = new RmqClient(connectionOptions);
          if (logger) {
            client.on('connection', () => {
              logger.log('RabbitMQ client connected');
            });
            client.on('error', err => {
              logger.error('RabbitMQ connection error: ' + err?.message);
            });
          }
          return client;
        },
      },
    ];
    return {
      global: opts.global,
      module: RabbitmqCoreModule,
      imports: (opts as RabbitmqModuleAsyncOptions).imports,
      providers,
      exports: [RMQ_CONNECTION_OPTIONS, token, ...(metadata.exports ?? [])],
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
    if (options.lazyConnect || !options.hosts?.length) return;
    this.logger?.log(
      'Connecting to RabbitMQ at ' + colors.blue(options.hosts.toString()),
    );
    Logger.flush();
    await this.client.onConnect();
  }

  onApplicationShutdown() {
    return this.client.close();
  }
}
