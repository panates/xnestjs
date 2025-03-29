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
  ElasticsearchModule,
  ElasticsearchService,
} from '@nestjs/elasticsearch';
import colors from 'ansi-colors';
import {
  ELASTICSEARCH_CONNECTION_OPTIONS,
  ELASTICSEARCH_MODULE_ID,
} from './constants.js';
import { getElasticsearchConfig } from './get-elasticsearch-config.js';
import type {
  ElasticsearchConnectionOptions,
  ElasticsearchModuleAsyncOptions,
  ElasticsearchModuleOptions,
} from './types.js';

const CLIENT_TOKEN = Symbol('CLIENT_TOKEN');

export class ElasticsearchCoreModule
  implements OnApplicationShutdown, OnApplicationBootstrap
{
  /**
   *
   */
  static forRoot(moduleOptions: ElasticsearchModuleOptions): DynamicModule {
    const connectionOptions = getElasticsearchConfig(
      moduleOptions.useValue || {},
      moduleOptions.envPrefix,
    );
    return this._createDynamicModule(moduleOptions, {
      providers: [
        {
          provide: ELASTICSEARCH_CONNECTION_OPTIONS,
          useValue: connectionOptions,
        },
      ],
    });
  }

  /**
   *
   */
  static forRootAsync(
    asyncOptions: ElasticsearchModuleAsyncOptions,
  ): DynamicModule {
    assert.ok(asyncOptions.useFactory, 'useFactory is required');
    return this._createDynamicModule(asyncOptions, {
      providers: [
        {
          provide: ELASTICSEARCH_CONNECTION_OPTIONS,
          inject: asyncOptions.inject,
          useFactory: async (...args) => {
            const opts = await asyncOptions.useFactory!(...args);
            return getElasticsearchConfig(opts, asyncOptions.envPrefix);
          },
        },
      ],
    });
  }

  private static _createDynamicModule(
    moduleOptions: ElasticsearchModuleOptions | ElasticsearchModuleAsyncOptions,
    metadata: Partial<DynamicModule>,
  ) {
    const token = moduleOptions.token ?? ElasticsearchService;
    const logger =
      typeof moduleOptions.logger === 'string'
        ? new Logger(moduleOptions.logger)
        : moduleOptions.logger;
    const exports = [
      ELASTICSEARCH_CONNECTION_OPTIONS,
      ...(metadata.exports ?? []),
    ];
    const providers: Provider[] = [
      ...(metadata.providers ?? []),
      {
        provide: Logger,
        useValue: logger,
      },
      {
        provide: CLIENT_TOKEN,
        useExisting: ElasticsearchService,
      },
      {
        provide: ELASTICSEARCH_MODULE_ID,
        useValue: crypto.randomUUID(),
      },
    ];
    if (token !== ElasticsearchService) {
      exports.push(token);
      providers.push({
        provide: token,
        useExisting: ElasticsearchService,
      });
    } else exports.push(ElasticsearchModule);

    class InnerProvidersModule {}

    return {
      module: ElasticsearchCoreModule,
      providers,
      global: moduleOptions.global,
      imports: [
        ElasticsearchModule.registerAsync({
          imports: [
            {
              module: InnerProvidersModule,
              providers: metadata.providers,
              exports: metadata.providers,
            },
          ],
          inject: [ELASTICSEARCH_CONNECTION_OPTIONS],
          useFactory: async (
            connectionOptions: ElasticsearchConnectionOptions,
          ) => {
            return connectionOptions;
          },
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
    protected client: ElasticsearchService,
    private logger: Logger,
    @Inject(ELASTICSEARCH_CONNECTION_OPTIONS)
    private connectionOptions: ElasticsearchConnectionOptions,
  ) {}

  async onApplicationBootstrap() {
    const options = this.connectionOptions;
    if (options.lazyConnect) return;
    const nodes = options.node || options.nodes;
    this.logger?.log(
      `Connecting to ElasticSearch at ${colors.blue(String(nodes))}`,
    );
    Logger.flush();
    await this.client.ping({}).catch(e => {
      this.logger.error('ElasticSearch connection failed: ' + e.message);
      throw e;
    });
  }

  onApplicationShutdown() {
    return this.client.close();
  }
}
