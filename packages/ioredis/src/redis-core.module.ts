import { DynamicModule, Global, Inject, Module, OnApplicationShutdown } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import * as crypto from 'crypto';
import Redis, { Cluster } from 'ioredis';
import { IOREDIS_MODULE_OPTIONS, IOREDIS_MODULE_TOKEN } from './redis.constants.js';
import {
  RedisClientAsyncOptions,
  RedisClientOptions,
  RedisClusterAsyncOptions,
  RedisClusterOptions,
} from './redis.interface.js';
import { RedisClient } from './redis-client.js';
import { isClusterOptions } from './utils.js';

@Global()
@Module({})
export class RedisCoreModule implements OnApplicationShutdown {
  constructor(
    @Inject(IOREDIS_MODULE_OPTIONS)
    private readonly options: RedisClientOptions | RedisClusterOptions,
    private readonly moduleRef: ModuleRef,
  ) {}

  static forRoot(options: RedisClientOptions | RedisClusterOptions): DynamicModule {
    const optionsProvider = {
      provide: IOREDIS_MODULE_OPTIONS,
      useValue: options,
    };
    const token = options.token || RedisClient;
    const connectionProvider = {
      provide: token,
      useFactory: () => this._createClient(options),
    };

    return {
      module: RedisCoreModule,
      providers: [connectionProvider, optionsProvider],
      exports: [connectionProvider],
    };
  }

  static forRootAsync(asyncOptions: RedisClientAsyncOptions | RedisClusterAsyncOptions): DynamicModule {
    if (!asyncOptions.useFactory) throw new Error('Invalid configuration. Must provide "useFactory"');

    const token = asyncOptions.token || RedisClient;

    const connectionProvider = {
      provide: token,
      inject: [IOREDIS_MODULE_OPTIONS],
      useFactory: async (moduleOptions: RedisClientOptions) => this._createClient(moduleOptions),
    };

    return {
      module: RedisCoreModule,
      imports: asyncOptions.imports,
      providers: [
        {
          provide: IOREDIS_MODULE_OPTIONS,
          useFactory: asyncOptions.useFactory,
          inject: asyncOptions.inject || [],
        },
        {
          provide: IOREDIS_MODULE_TOKEN,
          useValue: crypto.randomUUID(),
        },
        connectionProvider,
      ],
      exports: [connectionProvider],
    };
  }

  private static async _createClient(options: RedisClientOptions): Promise<RedisClient> {
    if (options.host && (options as any).nodes) {
      throw new TypeError(`You should set either "host" or "nodes", not both`);
    }
    const opts = { ...options };
    const isCluster = isClusterOptions(opts);
    let client: RedisClient;
    if (isCluster) {
      delete (opts as any).name;
      delete (opts as any).nodes;
      const cluster = new Cluster(opts.nodes, opts);
      client = new RedisClient({ cluster });
    } else {
      if (options.host && options.host.includes('://')) {
        const url = new URL(options.host);
        options.host = url.hostname;
        if (url.port) options.port = parseInt(url.port, 10);
        if (url.username) options.username = url.username;
        if (url.password) options.password = url.password;
        if (url.protocol === 'rediss:') {
          // @ts-ignore
          options.tls = true;
        }
        const db = parseInt(url.pathname.substring(1), 10);
        if (db > 0) options.db = db;
      }
      const standalone = new Redis(options) as any;
      client = new RedisClient({ standalone });
    }

    if (!options.lazyConnect) {
      await new Promise<void>((resolve, reject) => {
        client.redis.once('ready', () => {
          client.redis.removeListener('error', reject);
          resolve();
        });
        client.redis.once('error', e => {
          client.redis.removeListener('ready', resolve);
          reject(e);
        });
      });
    }
    return client;
  }

  async onApplicationShutdown() {
    try {
      const client: RedisClient = this.moduleRef.get(this.options.token || RedisClient);
      await client.quit();
    } catch {
      //
    }
  }
}
