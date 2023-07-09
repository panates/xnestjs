import { DynamicModule, Module } from '@nestjs/common';
import {
  RedisClientAsyncOptions,
  RedisClientOptions,
  RedisClusterAsyncOptions,
  RedisClusterOptions
} from './redis.interface.js';
import { RedisCoreModule } from './redis-core.module.js';

@Module({})
export class RedisModule {
  static registerClient(options: RedisClientOptions): DynamicModule {
    return {
      module: RedisModule,
      imports: [RedisCoreModule.registerClient(options)]
    };
  }

  static registerClientAsync(options: RedisClientAsyncOptions): DynamicModule {
    return {
      module: RedisModule,
      imports: [RedisCoreModule.registerClientAsync(options)]
    };
  }

  static registerCluster(options: RedisClusterOptions): DynamicModule {
    return {
      module: RedisModule,
      imports: [RedisCoreModule.registerCluster(options)]
    };
  }

  static registerClusterAsync(options: RedisClusterAsyncOptions): DynamicModule {
    return {
      module: RedisModule,
      imports: [RedisCoreModule.registerClusterAsync(options)]
    };
  }
}
