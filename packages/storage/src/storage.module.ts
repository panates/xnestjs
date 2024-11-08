import { DynamicModule, Module } from '@nestjs/common';
import { StorageModuleAsyncOptions, StorageModuleOptions } from './interfaces/storage.interfaces.js';
import { StorageCoreModule } from './storage-core.module.js';

@Module({})
export class StorageModule {
  static register(options: StorageModuleOptions): DynamicModule {
    return {
      module: StorageModule,
      imports: [StorageCoreModule.register(options)],
      global: options.global,
    };
  }

  static registerAsync(options: StorageModuleAsyncOptions): DynamicModule {
    return {
      module: StorageModule,
      imports: [StorageCoreModule.registerAsync(options)],
      global: options.global,
    };
  }
}
