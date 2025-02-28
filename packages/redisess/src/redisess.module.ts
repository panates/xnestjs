import { DynamicModule, Module } from '@nestjs/common';
import { RedisessCoreModule } from './redisess-core.module.js';
import type { RedisessModuleAsyncOptions, RedisessModuleOptions } from './types';

@Module({})
export class RedisessModule {
  static forRoot(options: RedisessModuleOptions): DynamicModule {
    return {
      module: RedisessModule,
      imports: [RedisessCoreModule.forRoot(options)],
    };
  }

  static forRootAsync(options: RedisessModuleAsyncOptions): DynamicModule {
    return {
      module: RedisessModule,
      imports: [RedisessCoreModule.forRootAsync(options)],
    };
  }
}
