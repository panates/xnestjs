import { type DynamicModule, Module } from '@nestjs/common';
import { RabbitmqCoreModule } from './rabbitmq-core.module.js';
import type {
  RabbitmqModuleAsyncOptions,
  RabbitmqModuleOptions,
} from './types.js';

@Module({})
export class RabbitmqModule {
  static forRoot(options: RabbitmqModuleOptions): DynamicModule {
    return {
      module: RabbitmqModule,
      imports: [RabbitmqCoreModule.forRoot(options)],
    };
  }

  static forRootAsync(options: RabbitmqModuleAsyncOptions): DynamicModule {
    return {
      module: RabbitmqModule,
      imports: [RabbitmqCoreModule.forRootAsync(options)],
    };
  }
}
