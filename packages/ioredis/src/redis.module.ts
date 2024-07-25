import { DynamicModule, Module } from '@nestjs/common';
import {
  RedisClientAsyncOptions,
  RedisClientOptions,
  RedisClusterAsyncOptions,
  RedisClusterOptions,
} from './redis.interface.js';
import { RedisCoreModule } from './redis-core.module.js';

@Module({})
export class RedisModule {
  static forRoot(options: RedisClientOptions | RedisClusterOptions): DynamicModule {
    return {
      module: RedisModule,
      imports: [RedisCoreModule.forRoot(options)],
    };
  }

  static forRootAsync(options: RedisClientAsyncOptions | RedisClusterAsyncOptions): DynamicModule {
    return {
      module: RedisModule,
      imports: [RedisCoreModule.forRootAsync(options)],
    };
  }
}
