import { type DynamicModule, Module } from '@nestjs/common';
import { RedisCoreModule } from './redis-core.module.js';
import type { RedisAsyncModuleOptions, RedisModuleOptions } from './types.js';

@Module({})
export class RedisModule {
  static forRoot(options?: RedisModuleOptions): DynamicModule {
    return {
      module: RedisModule,
      imports: [RedisCoreModule.forRoot(options || {})],
    };
  }

  static forRootAsync(options: RedisAsyncModuleOptions): DynamicModule {
    return {
      module: RedisModule,
      imports: [RedisCoreModule.forRootAsync(options)],
    };
  }
}
