import { DynamicModule, Module } from '@nestjs/common';
import type { RedisessModuleAsyncOptions, RedisessModuleOptions } from './interfaces/module-options.interface.js';
import { RedisessCoreModule } from './redisess-core.module.js';

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
