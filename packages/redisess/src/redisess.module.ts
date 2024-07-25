import { DynamicModule, Module } from '@nestjs/common';
import type { RedisesModuleAsyncOptions, RedisessModuleOptions } from './redisess.interface.js';
import { RedisessCoreModule } from './redisess-core.module.js';

@Module({})
export class RedisessModule {
  static forRoot(options: RedisessModuleOptions): DynamicModule {
    return {
      module: RedisessModule,
      imports: [RedisessCoreModule.forRoot(options)],
    };
  }

  static forRootAsync(options: RedisesModuleAsyncOptions): DynamicModule {
    return {
      module: RedisessModule,
      imports: [RedisessCoreModule.forRootAsync(options)],
    };
  }
}
