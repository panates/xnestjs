import * as assert from 'node:assert';
import * as crypto from 'node:crypto';
import * as process from 'node:process';
import { clone, omit } from '@jsopen/objects';
import { DynamicModule, Inject, Logger, OnApplicationBootstrap, OnApplicationShutdown, Provider } from '@nestjs/common';
import * as colors from 'ansi-colors';
import { Db, MongoClient, MongoClientOptions } from 'mongodb';
import { toBoolean, toInt } from 'putil-varhelpers';
import { MONGODB_CONNECTION_OPTIONS, MONGODB_MODULE_ID } from './constants.js';
import type { MongodbConnectionOptions, MongodbModuleAsyncOptions, MongodbModuleOptions } from './types.js';

const CLIENT_TOKEN = Symbol('CLIENT_TOKEN');

export class MongodbCoreModule implements OnApplicationShutdown, OnApplicationBootstrap {
  /**
   * Configures and returns a dynamic module for MongoDB integration.
   */
  static forRoot(moduleOptions: MongodbModuleOptions): DynamicModule {
    const connectionOptions = this._readConnectionOptions(moduleOptions.useValue || {}, moduleOptions.envPrefix);
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
            return this._readConnectionOptions(opts, asyncOptions.envPrefix);
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

  private static _readConnectionOptions(
    moduleOptions: MongodbConnectionOptions,
    prefix: string = 'MONGODB_',
  ): MongodbConnectionOptions {
    const options = clone(moduleOptions);
    const env = process.env;
    options.url = options.url || (env[prefix + 'URL'] ?? 'mongodb://localhost:27017');
    options.timeoutMS = options.timeoutMS ?? toInt(env[prefix + 'TIMEOUT']);
    options.replicaSet = options.replicaSet ?? env[prefix + 'REPLICA_SET'];
    options.tls = options.tls ?? toBoolean(env[prefix + 'TLS']);
    options.tlsCertificateKeyFile = options.tlsCertificateKeyFile ?? env[prefix + 'TLS_CERT_FILE'];
    options.tlsCertificateKeyFilePassword = options.tlsCertificateKeyFilePassword ?? env[prefix + 'TLS_CERT_FILE_PASS'];
    options.tlsCAFile = options.tlsCAFile ?? env[prefix + 'TLS_CA_FILE'];
    options.tlsCRLFile = options.tlsCRLFile ?? env[prefix + 'TLS_CRL_FILE'];
    options.tlsAllowInvalidCertificates =
      options.tlsAllowInvalidCertificates ?? toBoolean(env[prefix + 'TLS_ALLOW_INVALID_CERTIFICATES']);
    options.tlsAllowInvalidCertificates =
      options.tlsAllowInvalidHostnames ?? toBoolean(env[prefix + 'TLS_ALLOW_INVALID_HOSTNAMES']);
    options.tlsInsecure = options.tlsInsecure ?? toBoolean(env[prefix + 'TLS_INSECURE']);
    options.connectTimeoutMS = options.connectTimeoutMS ?? toInt(env[prefix + 'CONNECT_TIMEOUT']);
    options.socketTimeoutMS = options.socketTimeoutMS ?? toInt(env[prefix + 'SOCKET_TIMEOUT']);
    options.database = options.database ?? env[prefix + 'DATABASE'];
    options.srvMaxHosts = options.srvMaxHosts ?? toInt(env[prefix + 'SRV_MAX_HOSTS']);
    options.maxPoolSize = options.minPoolSize ?? toInt(env[prefix + 'MAX_POOL_SIZE']);
    options.minPoolSize = options.maxPoolSize ?? toInt(env[prefix + 'MIN_POOL_SIZE']);
    options.maxConnecting = options.maxConnecting ?? toInt(env[prefix + 'MAX_CONNECTING']);
    options.maxIdleTimeMS = options.maxIdleTimeMS ?? toInt(env[prefix + 'MAX_IDLE_TIME']);
    options.waitQueueTimeoutMS = options.waitQueueTimeoutMS ?? toInt(env[prefix + 'MAX_WAIT_QUEUE_TIMEOUT']);
    options.maxStalenessSeconds = options.maxStalenessSeconds ?? toInt(env[prefix + 'MAX_STALENESS_SECONDS']);
    if (!options.auth?.username) {
      options.auth = options.auth || {};
      options.auth.username = options.auth.username ?? env[prefix + 'USERNAME'];
      options.auth.password = options.auth.password ?? env[prefix + 'PASSWORD'];
    }
    options.authSource = options.authSource ?? env[prefix + 'AUTH_SOURCE'];
    options.localThresholdMS = options.localThresholdMS ?? toInt(env[prefix + 'LOCAL_THRESHOLD']);
    options.serverSelectionTimeoutMS =
      options.serverSelectionTimeoutMS ?? toInt(env[prefix + 'SERVER_SELECTION_TIMEOUT']);
    options.minHeartbeatFrequencyMS = options.minHeartbeatFrequencyMS ?? toInt(env[prefix + 'HEARTBEAT_FREQUENCY']);
    options.appName = options.appName ?? env[prefix + 'APP_NAME'];
    options.retryReads = options.retryReads ?? toBoolean(env[prefix + 'RETRY_READS']);
    options.retryWrites = options.retryWrites ?? toBoolean(env[prefix + 'RETRY_WRITES']);
    options.directConnection = options.directConnection ?? toBoolean(env[prefix + 'DIRECT_CONNECTION']);
    options.loadBalanced = options.loadBalanced ?? toBoolean(env[prefix + 'LOAD_BALANCED']);
    options.noDelay = options.noDelay ?? toBoolean(env[prefix + 'NO_DELAY']);
    options.monitorCommands = options.monitorCommands ?? toBoolean(env[prefix + 'MONITOR_COMMANDS']);
    options.proxyHost = options.proxyHost ?? env[prefix + 'PROXY_HOST'];
    options.proxyPort = options.proxyPort ?? toInt(env[prefix + 'PROXY_PORT']);
    options.proxyUsername = options.proxyHost ?? env[prefix + 'PROXY_USERNAME'];
    options.proxyPassword = options.proxyPassword ?? env[prefix + 'PROXY_PASSWORD'];
    return options;
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
    if (!options.lazyConnect) {
      this.logger?.log(`Connecting to MongoDB [${options.database}] at ${colors.blue(options.url!)}`);
      Logger.flush();
      return this.client.connect().catch(e => {
        this.logger?.error('MongoDB connection failed: ' + e.message);
        throw e;
      });
    }
  }

  onApplicationShutdown() {
    return this.client.close(true);
  }
}
