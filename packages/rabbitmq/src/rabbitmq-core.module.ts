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
import {
  ClientProvider,
  ClientRMQ,
  ClientsModule,
  Transport,
} from '@nestjs/microservices';
import colors from 'ansi-colors';
import { RMQ_CONNECTION_OPTIONS, RMQ_MODULE_ID } from './constants.js';
import { getRabbitmqConfig } from './get-rabbitmq-config.js';
import type {
  RabbitmqConnectionOptions,
  RabbitmqModuleAsyncOptions,
  RabbitmqModuleOptions,
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
    const token = opts.token ?? ClientRMQ;
    const name = typeof token === 'string' ? token : 'RabbitMQ';
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
    ];
    if (name !== token) {
      exports.push(token);
      providers.push({
        provide: token,
        useExisting: name,
      });
    }
    return {
      module: RabbitmqCoreModule,
      providers,
      imports: [
        /** Import ClientsModule */
        ClientsModule.registerAsync({
          clients: [
            {
              name,
              extraProviders: metadata.providers,
              inject: [RMQ_CONNECTION_OPTIONS],
              useFactory: (
                connectionOptions: RabbitmqConnectionOptions,
              ): ClientProvider => {
                return {
                  transport: Transport.RMQ,
                  options: connectionOptions,
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
    protected client: ClientRMQ,
    @Inject(RMQ_CONNECTION_OPTIONS)
    private connectionOptions: RabbitmqConnectionOptions,
    private logger?: Logger,
  ) {}

  async onApplicationBootstrap() {
    const options = this.connectionOptions;
    this.client.on('error', e => {
      console.log(e);
    });
    if (options.lazyConnect || !options.urls?.length) return;
    this.logger?.log(
      'Connecting to RabbitMQ at ' + colors.blue(options.urls.join(',')),
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
