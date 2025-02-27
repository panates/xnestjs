import { DynamicModule, Module } from '@nestjs/common';
import type { KafkaModuleAsyncOptions, KafkaModuleOptions } from './module-options.interface';
import { KafkaCoreModule } from './kafka-core.module.js';

@Module({})
export class KafkaModule {
  static forRoot(options: KafkaModuleOptions): DynamicModule {
    return {
      module: KafkaModule,
      imports: [KafkaCoreModule.forRoot(options)],
    };
  }

  static forRootAsync(options: KafkaModuleAsyncOptions): DynamicModule {
    return {
      module: KafkaModule,
      imports: [KafkaCoreModule.forRootAsync(options)],
    };
  }
}
