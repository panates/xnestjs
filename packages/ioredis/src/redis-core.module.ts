import assert from 'node:assert';
import {
  DynamicModule,
  Inject,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
  Provider,
} from '@nestjs/common';
import colors from 'ansi-colors';
import * as crypto from 'crypto';
import Redis, { Cluster } from 'ioredis';
import {
  IOREDIS_CONNECTION_OPTIONS,
  IOREDIS_MODULE_TOKEN,
} from './constants.js';
import { getRedisConfig } from './get-redis-config.js';
import { RedisClient } from './redis-client.js';
import type {
  RedisAsyncModuleOptions,
  RedisConnectionOptions,
  RedisModuleOptions,
  RedisStandaloneConnectionOptions,
} from './types.js';
import { isClusterOptions, isStandaloneOptions } from './utils.js';

const CLIENT_TOKEN = Symbol('CLIENT_TOKEN');

export class RedisCoreModule
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  static forRoot(moduleOptions: RedisModuleOptions): DynamicModule {
    const connectionOptions = getRedisConfig(
      moduleOptions.useValue,
      moduleOptions.envPrefix,
    );
    return this._createDynamicModule(moduleOptions, {
      providers: [
        {
          provide: IOREDIS_CONNECTION_OPTIONS,
          useValue: connectionOptions,
        },
      ],
    });
  }

  static forRootAsync(asyncOptions: RedisAsyncModuleOptions): DynamicModule {
    assert.ok(asyncOptions.useFactory, 'useFactory is required');
    return this._createDynamicModule(asyncOptions, {
      providers: [
        {
          provide: IOREDIS_CONNECTION_OPTIONS,
          inject: asyncOptions.inject,
          useFactory: async (...args) => {
            const opts = await asyncOptions.useFactory!(...args);
            return getRedisConfig(opts, asyncOptions.envPrefix);
          },
        },
      ],
    });
  }

  private static _createDynamicModule(
    opts: RedisModuleOptions,
    metadata: Partial<DynamicModule>,
  ) {
    const token = opts.token ?? RedisClient;
    const providers: Provider[] = [
      {
        provide: token,
        inject: [IOREDIS_CONNECTION_OPTIONS],
        useFactory: async (
          connectionOptions: RedisStandaloneConnectionOptions,
        ): Promise<RedisClient> => {
          return this._createClient(connectionOptions);
        },
      },
      {
        provide: CLIENT_TOKEN,
        useExisting: token,
      },
      {
        provide: Logger,
        useValue:
          typeof opts.logger === 'string'
            ? new Logger(opts.logger)
            : opts.logger,
      },
    ];
    return {
      global: opts.global,
      module: RedisCoreModule,
      ...metadata,
      providers: [
        ...(metadata.providers ?? []),
        ...providers,
        {
          provide: IOREDIS_MODULE_TOKEN,
          useValue: crypto.randomUUID(),
        },
      ],
      exports: [IOREDIS_CONNECTION_OPTIONS, token, ...(metadata.exports ?? [])],
    } as DynamicModule;
  }

  private static _createClient(options: RedisConnectionOptions): RedisClient {
    const opts = { ...options };
    let client: RedisClient;
    if (isClusterOptions(opts)) {
      const startupNodes = (opts as any).nodes;
      delete (opts as any).name;
      delete (opts as any).nodes;
      opts.lazyConnect = true;
      const cluster = new Cluster(startupNodes, opts);
      client = new RedisClient({ cluster });
    } else if (isStandaloneOptions(opts)) {
      if (opts.host && opts.host.includes('://')) {
        const url = new URL(opts.host);
        opts.host = url.hostname;
        if (url.port) opts.port = parseInt(url.port, 10);
        if (url.username) opts.username = url.username;
        if (url.password) opts.password = url.password;
        if (url.protocol === 'rediss:') {
          // @ts-ignore
          opts.tls = true;
        }
        const db = parseInt(url.pathname.substring(1), 10);
        if (db > 0) opts.db = db;
      }
      const standalone = new Redis({
        ...opts,
        lazyConnect: true,
      }) as any;
      client = new RedisClient({ standalone });
    } else throw new TypeError(`Invalid connection options`);
    return client;
  }

  /**
   *
   * @constructor
   */
  constructor(
    @Inject(CLIENT_TOKEN) protected client: RedisClient,
    @Inject(IOREDIS_CONNECTION_OPTIONS)
    private readonly connectionOptions: RedisConnectionOptions,
    private logger?: Logger,
  ) {}

  async onApplicationBootstrap() {
    const opts = this.connectionOptions;
    if (opts.lazyConnect) return;
    const isCluster = isClusterOptions(opts);
    const hosts = isCluster
      ? opts.nodes
          .map(x =>
            typeof x === 'object'
              ? x.host + ':' + x.port
              : typeof x === 'number'
                ? 'localhost:' + x
                : x,
          )
          .join(', ')
      : opts.host;
    if (hosts) {
      this.logger?.log('Connecting to redis at ' + colors.blue(hosts));
      Logger.flush();
      try {
        if (this.client.redis.status === 'wait')
          await this.client.redis.connect();
        await this.client.redis.ping();
      } catch (e: any) {
        this.logger?.error('Redis connection failed: ' + e.message);
        throw e;
      }
    }
  }

  async onApplicationShutdown() {
    try {
      await this.client.quit();
    } catch {
      //
    }
  }
}
