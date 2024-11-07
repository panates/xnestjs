import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { StorageModuleAsyncOptions, StorageModuleOptions, StorageOptions } from './interfaces/storage.interfaces.js';
import { StorageConnection } from './services/storage-connection.js';
import { STORAGE_OPTIONS } from './storage.constants.js';
import { createConnection } from './storage.utils.js';

@Global()
@Module({})
export class StorageCoreModule {
  static register(options: StorageModuleOptions): DynamicModule {
    const connectionProvider: Provider = {
      provide: options.token || StorageConnection,
      useValue: createConnection(options),
    };

    return {
      module: StorageCoreModule,
      providers: [connectionProvider],
      exports: [connectionProvider],
      global: options.global,
    };
  }

  public static registerAsync<I extends [any] = never>(asyncOptions: StorageModuleAsyncOptions<I>): DynamicModule {
    let optionsProvider: Provider;
    if (asyncOptions.useFactory) {
      optionsProvider = {
        provide: STORAGE_OPTIONS,
        inject: asyncOptions.inject || [],
        useFactory: asyncOptions.useFactory,
      };
    } else if (asyncOptions.useExisting) {
      optionsProvider = {
        provide: STORAGE_OPTIONS,
        useExisting: asyncOptions.useExisting,
      };
    } else if (asyncOptions.useClass) {
      optionsProvider = {
        provide: STORAGE_OPTIONS,
        useClass: asyncOptions.useClass,
      };
    } else {
      throw new Error('Invalid configuration. Must provide useFactory, useClass or useExisting');
    }

    const providers: Provider[] = [
      optionsProvider,
      {
        provide: asyncOptions.token || StorageConnection,
        inject: [STORAGE_OPTIONS],
        useFactory: (options: StorageOptions) => createConnection(options),
      },
    ];
    if (asyncOptions.providers) providers.push(...asyncOptions.providers);
    return {
      module: StorageCoreModule,
      imports: asyncOptions.imports || [],
      exports: asyncOptions.exports || [],
      providers,
      global: asyncOptions.global,
    };
  }
}
