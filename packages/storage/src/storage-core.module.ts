import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import {
  StorageModuleAsyncOptions,
  StorageModuleOptions,
  StorageModuleOptionsFactory,
} from './interfaces/storage.interfaces.js';
import { createConnection, getStorageConnectionToken } from './storage.utils.js';

@Global()
@Module({})
export class StorageCoreModule {
  static register(options: StorageModuleOptions): DynamicModule {
    const connectionProvider: Provider = {
      provide: getStorageConnectionToken(options.name),
      useValue: createConnection(options),
    };

    return {
      module: StorageCoreModule,
      providers: [connectionProvider],
      exports: [connectionProvider],
    };
  }

  public static forRootAsync(asyncOptions: StorageModuleAsyncOptions): DynamicModule {
    const providers = [...this.createAsyncProviders(asyncOptions), ...(asyncOptions.extraProviders || [])];

    return {
      module: StorageCoreModule,
      imports: asyncOptions.imports || [],
      providers,
      exports: providers,
    };
  }

  public static createAsyncProviders(asyncOptions: StorageModuleAsyncOptions): Provider[] {
    if (asyncOptions.useFactory || asyncOptions.useExisting) return [this.createAsyncOptionsProvider(asyncOptions)];

    if (asyncOptions.useClass) {
      return [
        this.createAsyncOptionsProvider(asyncOptions),
        { provide: asyncOptions.useClass, useClass: asyncOptions.useClass },
      ];
    }

    throw new Error('Invalid configuration. Must provide useFactory, useClass or useExisting');
  }

  public static createAsyncOptionsProvider(asyncOptions: StorageModuleAsyncOptions): Provider {
    if (asyncOptions.useFactory) {
      return {
        provide: getStorageConnectionToken(asyncOptions.name),
        useFactory: this.createFactoryWrapper(asyncOptions.useFactory),
        inject: asyncOptions.inject || [],
      };
    }

    const useClass = asyncOptions.useClass || asyncOptions.useExisting;
    if (useClass) {
      return {
        provide: getStorageConnectionToken(asyncOptions.name),
        useFactory: this.createFactoryWrapper((optionsFactory: StorageModuleOptionsFactory) =>
          optionsFactory.getOptions(),
        ),
        inject: [useClass],
      };
    }

    throw new Error('Invalid configuration. Must provide useFactory, useClass or useExisting');
  }

  private static createFactoryWrapper(useFactory: Required<StorageModuleAsyncOptions>['useFactory']) {
    return async (...args: any[]) => {
      const clientOptions = await useFactory(...args);
      return createConnection(clientOptions);
    };
  }
}
