import * as crypto from 'crypto';
import Redis, { Cluster } from 'ioredis';
import type { ClusterOptions } from 'ioredis/built/cluster/ClusterOptions';
import {
  DynamicModule, Global, Inject, Module,
  OnApplicationShutdown,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import {
  IOREDIS_MODULE_OPTIONS,
  IOREDIS_MODULE_TOKEN
} from './redis.constants.js';
import {
  RedisClientAsyncOptions, RedisClientOptions,
  RedisClusterAsyncOptions, RedisClusterOptions,
} from './redis.interface.js';
import { RedisClient, RedisCluster } from './redis-client.js';

@Global()
@Module({})
export class RedisCoreModule implements OnApplicationShutdown {

  constructor(
      @Inject(IOREDIS_MODULE_OPTIONS)
      private readonly options: RedisClientOptions | RedisClusterOptions,
      private readonly moduleRef: ModuleRef
  ) {
  }

  static registerClient(options: RedisClientOptions = {}): DynamicModule {
    const optionsProvider = {
      provide: IOREDIS_MODULE_OPTIONS,
      useValue: options
    };
    const connectionProvider = {
      provide: options.token || RedisClient,
      useFactory: () => this._createClient(options)
    };

    return {
      module: RedisCoreModule,
      providers: [connectionProvider, optionsProvider],
      exports: [connectionProvider]
    };
  }

  static registerClientAsync(asyncOptions: RedisClientAsyncOptions): DynamicModule {
    if (!asyncOptions.useFactory)
      throw new Error('Invalid configuration. Must provide "useFactory"');

    const connectionProvider = {
      provide: asyncOptions.token || RedisClient,
      inject: [IOREDIS_MODULE_OPTIONS],
      useFactory: async (moduleOptions: RedisClientOptions) => {
        return this._createClient(moduleOptions);
      }
    };

    return {
      module: RedisCoreModule,
      imports: asyncOptions.imports,
      providers: [
        {
          provide: IOREDIS_MODULE_OPTIONS,
          useFactory: asyncOptions.useFactory,
          inject: asyncOptions.inject || []
        },
        {
          provide: IOREDIS_MODULE_TOKEN,
          useValue: crypto.randomUUID()
        },
        connectionProvider
      ],
      exports: [connectionProvider]
    };
  }

  static registerCluster(options: RedisClusterOptions): DynamicModule {
    const optionsProvider = {
      provide: IOREDIS_MODULE_OPTIONS,
      useValue: options
    };
    const connectionProvider = {
      provide: options.token || RedisCluster,
      useFactory: () => this._createCluster(options)
    };

    return {
      module: RedisCoreModule,
      providers: [connectionProvider, optionsProvider],
      exports: [connectionProvider]
    };
  }

  static registerClusterAsync(asyncOptions: RedisClusterAsyncOptions): DynamicModule {
    if (!asyncOptions.useFactory)
      throw new Error('Invalid configuration. Must provide "useFactory"');

    const connectionProvider = {
      provide: asyncOptions.token || RedisCluster,
      inject: [IOREDIS_MODULE_OPTIONS],
      useFactory: async (moduleOptions: RedisClusterOptions) => {
        return this._createCluster(moduleOptions);
      }
    };

    return {
      module: RedisCoreModule,
      imports: asyncOptions.imports,
      providers: [
        {
          provide: IOREDIS_MODULE_OPTIONS,
          useFactory: asyncOptions.useFactory,
          inject: asyncOptions.inject || []
        },
        connectionProvider,
        {
          provide: IOREDIS_MODULE_TOKEN,
          useValue: crypto.randomUUID()
        }
      ],
      exports: [connectionProvider]
    };
  }

  private static async _createClient(options: RedisClientOptions): Promise<Redis> {
    if (options.host && options.host.includes('://')) {
      const url = new URL(options.host);
      options.host = url.hostname;
      if (url.port)
        options.port = parseInt(url.port, 10);
      if (url.username)
        options.username = url.username;
      if (url.password)
        options.password = url.password;
      if (url.protocol === 'rediss:') { // @ts-ignore
        options.tls = true;
      }
      const db = parseInt(url.pathname.substring(1), 10);
      if (db > 0)
        options.db = db;
    }
    const client = new RedisClient(options);
    if (!options.lazyConnect) {
      await new Promise<void>((resolve, reject) => {
        client.once('ready', () => {
          client.removeListener('error', reject);
          resolve();
        });
        client.once('error', (e) => {
          client.removeListener('ready', resolve);
          reject(e);
        });
      });
    }
    return client;
  }

  private static async _createCluster(options: RedisClusterOptions): Promise<Cluster> {
    const clusterOptions: ClusterOptions = {
      ...options
    };
    delete (clusterOptions as any).name;
    delete (clusterOptions as any).nodes;
    const cluster = new RedisCluster(options.nodes, clusterOptions);
    if (!options.lazyConnect) {
      await new Promise<void>((resolve, reject) => {
        cluster.once('ready', () => {
          cluster.removeListener('error', reject);
          resolve();
        });
        cluster.once('error', (e) => {
          cluster.removeListener('ready', resolve);
          reject(e);
        });
      });
    }
    return cluster;
  }

  async onApplicationShutdown() {
    try {
      const client = this.moduleRef.get(this.options.token || RedisClient);
      await client.quit();
    } catch {
      //
    }
    try {
      const cluster = this.moduleRef.get(this.options.token || RedisCluster);
      await cluster.quit();
    } catch {
      //
    }
  }

}
