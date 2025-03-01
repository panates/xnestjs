import assert from 'node:assert';
import process from 'node:process';
import { clone } from '@jsopen/objects';
import { DynamicModule, Logger, Provider } from '@nestjs/common';
import crypto from 'crypto';
import { toBoolean, toInt } from 'putil-varhelpers';
import { STORAGE_MODULE_ID, STORAGE_OPTIONS } from './constants.js';
import { S3StorageConnection } from './providers/s3-storage-connection.js';
import { StorageConnection } from './services/storage-connection.js';
import type { S3StorageOptions, StorageModuleAsyncOptions, StorageModuleOptions, StorageOptions } from './types.js';

const CLIENT_TOKEN = Symbol('CLIENT_TOKEN');

export class StorageCoreModule {
  /**
   * Configures and returns a dynamic module
   */
  static forRoot(moduleOptions: StorageModuleOptions): DynamicModule {
    const connectionOptions = this._readConnectionOptions(moduleOptions.useValue || {}, moduleOptions.envPrefix);
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
            return this._readConnectionOptions(opts, asyncOptions.envPrefix);
          },
        },
      ],
    });
  }

  private static _readConnectionOptions(
    moduleOptions: Partial<StorageOptions>,
    prefix: string = 'STORAGE_',
  ): StorageOptions {
    const options = clone(moduleOptions) as StorageOptions;
    const env = process.env;
    options.provider = options.provider || env[prefix + 'PROVIDER'];
    if (!options.provider)
      throw new Error(`You must provide a Storage provider or "${prefix + 'PROVIDER'}" env variable`);
    if (options.provider === 's3') {
      options.s3 = options.s3 || {};
      options.s3.endPoint = options.s3.endPoint ?? env[prefix + 'S3_ENDPOINT'];
      options.s3.secretKey = options.s3.secretKey ?? env[prefix + 'S3_SECRET_KEY'];
      options.s3.useSSL = options.s3.useSSL ?? toBoolean(env[prefix + 'S3_SSL']);
      options.s3.port = options.s3.port ?? toInt(env[prefix + 'S3_PORT']);
      options.s3.sessionToken = options.s3.sessionToken ?? env[prefix + 'S3_SESSION_TOKEN'];
      options.s3.partSize = options.s3.partSize ?? toInt(env[prefix + 'S3_PART_SIZE']);
      options.s3.pathStyle = options.s3.pathStyle ?? toBoolean(env[prefix + 'S3_PATH_STYLE']);
      options.s3.secretKey = options.s3.secretKey ?? env[prefix + 'S3_SECRET_KEY'];
      options.s3.s3AccelerateEndpoint = options.s3.s3AccelerateEndpoint ?? env[prefix + 'S3_ACC_ENDPOINT'];
    } else throw new Error(`Unknown Storage provider (${options.provider})`);
    return options;
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
