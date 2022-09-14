import * as crypto from 'crypto';
import {
  DynamicModule,
  Global,
  Inject,
  Module,
  OnApplicationShutdown, Provider
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { IOREDIS_MODULE_OPTIONS, IOREDIS_MODULE_TOKEN } from './redis.constants.js';
import { RedisModuleAsyncOptions, RedisModuleOptions, RedisModuleOptionsFactory } from './redis.interface.js';
import { getRedisClientToken } from './redis.utils.js';
import { RedisClient } from './redis-client.js';

@Global()
@Module({})
export class RedisCoreModule implements OnApplicationShutdown {
  constructor(
      @Inject(IOREDIS_MODULE_OPTIONS)
      private readonly options: RedisModuleOptions,
      private readonly moduleRef: ModuleRef
  ) {
  }

  static forRoot(options: RedisModuleOptions = {}): DynamicModule {
    const optionsProvider = {
      provide: IOREDIS_MODULE_OPTIONS,
      useValue: options
    };
    const connectionProvider = {
      provide: getRedisClientToken(options.name),
      useFactory: () => this.createClient(options)
    };

    return {
      module: RedisCoreModule,
      providers: [connectionProvider, optionsProvider],
      exports: [connectionProvider]
    };
  }

  static forRootAsync(asyncOptions: RedisModuleAsyncOptions): DynamicModule {
    const connectionProvider = {
      provide: getRedisClientToken(asyncOptions.name),
      inject: [IOREDIS_MODULE_OPTIONS],
      useFactory: async (moduleOptions: RedisModuleOptions) => {
        const name = asyncOptions.name || moduleOptions.name;
        return this.createClient({
          ...moduleOptions,
          name
        });
      }
    };

    const asyncProviders = this.createAsyncProviders(asyncOptions);
    return {
      module: RedisCoreModule,
      imports: asyncOptions.imports,
      providers: [
        ...asyncProviders,
        connectionProvider,
        {
          provide: IOREDIS_MODULE_TOKEN,
          useValue: crypto.randomUUID()
        }
      ],
      exports: [connectionProvider]
    };
  }

  async onApplicationShutdown() {
    const client = this.moduleRef.get(getRedisClientToken(this.options.name)) as RedisClient;
    if (client)
      await client.quit();
  }

  private static createAsyncProviders(asyncOptions: RedisModuleAsyncOptions): Provider[] {
    if (asyncOptions.useExisting || asyncOptions.useFactory)
      return [this.createAsyncOptionsProvider(asyncOptions)];

    if (asyncOptions.useClass)
      return [
        this.createAsyncOptionsProvider(asyncOptions),
        {
          provide: asyncOptions.useClass,
          useClass: asyncOptions.useClass
        }
      ];

    throw new Error('Invalid configuration. Must provide useFactory, useClass or useExisting');
  }

  private static createAsyncOptionsProvider(asyncOptions: RedisModuleAsyncOptions): Provider {
    if (asyncOptions.useFactory) {
      return {
        provide: IOREDIS_MODULE_OPTIONS,
        useFactory: asyncOptions.useFactory,
        inject: asyncOptions.inject || []
      };
    }
    const useClass = asyncOptions.useClass || asyncOptions.useExisting;
    if (useClass) {
      return {
        provide: IOREDIS_MODULE_OPTIONS,
        useFactory: (optionsFactory: RedisModuleOptionsFactory) =>
            optionsFactory.createOptions(asyncOptions.name),
        inject: [useClass]
      };
    }
    throw new Error('Invalid configuration. Must provide useFactory, useClass or useExisting');
  }

  private static async createClient(options: RedisModuleOptions): Promise<RedisClient> {
    const client = new RedisClient(options);
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
    return client;
  }
}
