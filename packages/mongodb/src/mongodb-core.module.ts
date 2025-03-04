import * as assert from 'node:assert';
import * as crypto from 'node:crypto';
import { omit } from '@jsopen/objects';
import { DynamicModule, Inject, Logger, OnApplicationBootstrap, OnApplicationShutdown, Provider } from '@nestjs/common';
import * as colors from 'ansi-colors';
import { Db, MongoClient, MongoClientOptions } from 'mongodb';
import { MONGODB_CONNECTION_OPTIONS, MONGODB_MODULE_ID } from './constants.js';
import { getMongodbConfig } from './get-mongodb-config.js';
import type { MongodbConnectionOptions, MongodbModuleAsyncOptions, MongodbModuleOptions } from './types.js';

const CLIENT_TOKEN = Symbol('CLIENT_TOKEN');

export class MongodbCoreModule implements OnApplicationShutdown, OnApplicationBootstrap {
  /**
   * Configures and returns a dynamic module for MongoDB integration.
   */
  static forRoot(moduleOptions: MongodbModuleOptions): DynamicModule {
    const connectionOptions = getMongodbConfig(moduleOptions.useValue || {}, moduleOptions.envPrefix);
    return this._createDynamicModule(moduleOptions, {
      global: moduleOptions.global,
      providers: [
        {
          provide: MONGODB_CONNECTION_OPTIONS,
          useValue: connectionOptions,
        },
      ],
    });
  }

  /**
   * Configures and returns an async dynamic module for MongoDB integration.
   */
  static forRootAsync(asyncOptions: MongodbModuleAsyncOptions): DynamicModule {
    assert.ok(asyncOptions.useFactory, 'useFactory is required');
    return this._createDynamicModule(asyncOptions, {
      global: asyncOptions.global,
      providers: [
        {
          provide: MONGODB_CONNECTION_OPTIONS,
          inject: asyncOptions.inject,
          useFactory: async (...args) => {
            const opts = await asyncOptions.useFactory!(...args);
            return getMongodbConfig(opts, asyncOptions.envPrefix);
          },
        },
      ],
    });
  }

  private static _createDynamicModule(
    opts: MongodbModuleOptions | MongodbModuleAsyncOptions,
    metadata: Partial<DynamicModule>,
  ) {
    const token = opts.token ?? MongoClient;
    const dbToken = opts.dbToken ?? Db;
    const providers: Provider[] = [
      {
        provide: token,
        inject: [MONGODB_CONNECTION_OPTIONS],
        useFactory: async (connectionOptions: MongodbConnectionOptions): Promise<MongoClient> => {
          const mongoOptions = omit(connectionOptions, ['url', 'database', 'lazyConnect']) as MongoClientOptions;
          if (mongoOptions.auth && !mongoOptions.auth?.username) delete mongoOptions.auth;
          return new MongoClient(connectionOptions.url!, mongoOptions);
        },
      },
      {
        provide: dbToken,
        inject: [token, MONGODB_CONNECTION_OPTIONS],
        useFactory: async (client: MongoClient, connectionOptions: MongodbConnectionOptions) => {
          return connectionOptions.database ? client.db(connectionOptions.database) : undefined;
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
      module: MongodbCoreModule,
      ...metadata,
      providers: [
        ...(metadata.providers ?? []),
        ...providers,
        {
          provide: MONGODB_MODULE_ID,
          useValue: crypto.randomUUID(),
        },
      ],
      exports: [MONGODB_CONNECTION_OPTIONS, token, dbToken, ...(metadata.exports ?? [])],
    } as DynamicModule;
  }

  /**
   *
   * @constructor
   */
  constructor(
    @Inject(CLIENT_TOKEN)
    protected client: MongoClient,
    @Inject(MONGODB_CONNECTION_OPTIONS)
    private connectionOptions: MongodbConnectionOptions,
    private logger?: Logger,
  ) {}

  onApplicationBootstrap() {
    const options = this.connectionOptions;
    if (options.lazyConnect) return;
    this.logger?.log(`Connecting to MongoDB [${options.database}] at ${colors.blue(options.url!)}`);
    Logger.flush();
    return this.client.connect().catch(e => {
      this.logger?.error('MongoDB connection failed: ' + e.message);
      throw e;
    });
  }

  onApplicationShutdown() {
    return this.client.close(true);
  }
}
