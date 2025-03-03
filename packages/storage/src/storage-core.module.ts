import assert from 'node:assert';
import { DynamicModule, Logger, Provider } from '@nestjs/common';
import crypto from 'crypto';
import { STORAGE_MODULE_ID, STORAGE_OPTIONS } from './constants.js';
import { getStorageConfig } from './get-storage-config.js';
import { S3StorageConnection } from './providers/s3-storage-connection.js';
import { StorageConnection } from './services/storage-connection.js';
import type { S3StorageOptions, StorageModuleAsyncOptions, StorageModuleOptions, StorageOptions } from './types.js';

const CLIENT_TOKEN = Symbol('CLIENT_TOKEN');

export class StorageCoreModule {
  /**
   * Configures and returns a dynamic module
   */
  static forRoot(moduleOptions: StorageModuleOptions): DynamicModule {
    const connectionOptions = getStorageConfig(moduleOptions.useValue || {}, moduleOptions.envPrefix);
    return this._createDynamicModule(moduleOptions, {
      global: moduleOptions.global,
      providers: [
        {
          provide: STORAGE_OPTIONS,
          useValue: connectionOptions,
        },
      ],
    });
  }

  /**
   * Configures and returns an async dynamic module
   */
  static forRootAsync(asyncOptions: StorageModuleAsyncOptions): DynamicModule {
    assert.ok(asyncOptions.useFactory, 'useFactory is required');
    return this._createDynamicModule(asyncOptions, {
      global: asyncOptions.global,
      providers: [
        {
          provide: STORAGE_OPTIONS,
          inject: asyncOptions.inject,
          useFactory: async (...args) => {
            const opts = await asyncOptions.useFactory!(...args);
            return getStorageConfig(opts, asyncOptions.envPrefix);
          },
        },
      ],
    });
  }

  private static _createDynamicModule(
    opts: StorageModuleOptions | StorageModuleAsyncOptions,
    metadata: Partial<DynamicModule>,
  ) {
    const token = opts.token ?? StorageConnection;
    const providers: Provider[] = [
      {
        provide: token,
        inject: [STORAGE_OPTIONS],
        useFactory: async (storageOptions: StorageOptions): Promise<S3StorageConnection> => {
          if (storageOptions.provider === 's3') {
            return new S3StorageConnection((storageOptions as S3StorageOptions).s3);
          }
          /** istanbul ignore next */
          throw new Error(`Unknown Storage provider (${storageOptions.provider})`);
        },
      },
      {
        provide: CLIENT_TOKEN,
        useExisting: token,
      },
      {
        provide: Logger,
        useValue: typeof opts.logger === 'string' ? new Logger(opts.logger) : opts.logger,
      },
    ];
    return {
      module: StorageCoreModule,
      ...metadata,
      providers: [
        ...(metadata.providers ?? []),
        ...providers,
        {
          provide: STORAGE_MODULE_ID,
          useValue: crypto.randomUUID(),
        },
      ],
      exports: [STORAGE_OPTIONS, token, ...(metadata.exports ?? [])],
    } as DynamicModule;
  }
}
