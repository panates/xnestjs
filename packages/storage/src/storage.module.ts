import { DynamicModule, Module } from '@nestjs/common';
import { StorageCoreModule } from './storage-core.module.js';
import type { StorageModuleAsyncOptions, StorageModuleOptions } from './types.js';

@Module({})
export class StorageModule {
  static forRoot(options?: StorageModuleOptions): DynamicModule {
    return {
      module: StorageModule,
      imports: [StorageCoreModule.forRoot(options || {})],
    };
  }

  static forRootAsync(options: StorageModuleAsyncOptions): DynamicModule {
    return {
      module: StorageModule,
      imports: [StorageCoreModule.forRootAsync(options)],
    };
  }
}
