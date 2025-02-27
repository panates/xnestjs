import * as assert from 'node:assert';
import * as crypto from 'node:crypto';
import * as process from 'node:process';
import { clone, omit } from '@jsopen/objects';
import { DynamicModule, Inject, Logger, OnApplicationBootstrap, OnApplicationShutdown, Provider } from '@nestjs/common';
import type { ValueProvider } from '@nestjs/common/interfaces/modules/provider.interface';
import * as colors from 'ansi-colors';
import { Db, MongoClient, MongoClientOptions } from 'mongodb';
import { toBoolean, toInt } from 'putil-varhelpers';
import { MONGODB_CONNECTION_OPTIONS, MONGODB_MODULE_ID } from './constants.js';
import type {
  MongodbConnectionOptions,
  MongodbModuleAsyncOptions,
  MongodbModuleOptions,
} from './module-options.interface.js';

export class MongodbCoreModule implements OnApplicationShutdown, OnApplicationBootstrap {
  /**
   * Configures and returns a dynamic module for MongoDB integration.
   */
  static forRoot(moduleOptions: MongodbModuleOptions): DynamicModule {
    const out = this._createDynamicModule(moduleOptions);
    const connectionOptions = this._readConnectionOptions(moduleOptions, moduleOptions.envPrefix ?? 'MONGODB_');
    const optionsProvider: ValueProvider = {
      provide: MONGODB_CONNECTION_OPTIONS,
      useValue: connectionOptions,
    };
    out.providers!.unshift(optionsProvider);
    return out;
  }

  /**
   * Configures and returns an async dynamic module for MongoDB integration.
   */
  static forRootAsync(asyncOptions: MongodbModuleAsyncOptions): DynamicModule {
    assert.ok(asyncOptions.useFactory, 'useFactory is required');
    const out = this._createDynamicModule(asyncOptions);
    const optionsProvider: Provider = {
      provide: MONGODB_CONNECTION_OPTIONS,
      inject: asyncOptions.inject,
      useFactory: async (...args) => {
        const opts = await asyncOptions.useFactory!(...args);
        return this._readConnectionOptions(opts, asyncOptions.envPrefix ?? 'MONGODB_');
      },
    };
    out.providers!.unshift(optionsProvider);
    return out;
  }

  private static _createDynamicModule(opts: MongodbModuleOptions | MongodbModuleAsyncOptions) {
    const clientToken = opts.clientToken ?? MongoClient;
    const dbToken = opts.dbToken ?? Db;
    const providers: Provider[] = [
      {
        provide: clientToken,
        inject: [MONGODB_CONNECTION_OPTIONS],
        useFactory: async (connectionOptions: MongodbConnectionOptions): Promise<MongoClient> => {
          const mongoOptions = omit(connectionOptions, ['url', 'database']) as MongoClientOptions;
          return new MongoClient(connectionOptions.url!, mongoOptions);
        },
      },
      {
        provide: dbToken,
        inject: [clientToken, MONGODB_CONNECTION_OPTIONS],
        useFactory: async (client: MongoClient, connectionOptions: MongodbConnectionOptions) => {
          return connectionOptions.database ? client.db(connectionOptions.database) : undefined;
        },
      },
      {
        provide: Logger,
        useValue: typeof opts.logger === 'string' ? new Logger(opts.logger) : opts.logger,
      },
    ];
    return {
      global: true,
      module: MongodbCoreModule,
      providers: [
        ...providers,
        {
          provide: MONGODB_MODULE_ID,
          useValue: crypto.randomUUID(),
        },
      ],
      exports: [MONGODB_CONNECTION_OPTIONS, clientToken, dbToken],
    } as DynamicModule;
  }

  private static _readConnectionOptions(
    moduleOptions: MongodbConnectionOptions,
    prefix: string,
  ): MongodbConnectionOptions {
    const options = clone(moduleOptions);
    const env = process.env;
    options.url = options.url || (env[prefix + 'URL'] ?? 'mongodb://localhost:27017');
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
    options.srvMaxHosts = options.srvMaxHosts ?? toInt(env[prefix + 'SRV_HOSTS']);
    options.maxPoolSize = options.minPoolSize ?? toInt(env[prefix + 'MAX_POOL_SIZE']);
    options.minPoolSize = options.maxPoolSize ?? toInt(env[prefix + 'MIN_POOL_SIZE']);
    options.maxConnecting = options.maxConnecting ?? toInt(env[prefix + 'MAX_CONNECTING']);
    options.maxIdleTimeMS = options.maxIdleTimeMS ?? toInt(env[prefix + 'MAX_IDLE_TIME']);
    options.waitQueueTimeoutMS = options.waitQueueTimeoutMS ?? toInt(env[prefix + 'MAX_WAIT_QUEUE_TIMEOUT']);
    options.readConcern = options.readConcern ?? (env[prefix + 'READ_CONCERN'] as any);
    options.readConcernLevel = options.readConcernLevel ?? (env[prefix + 'READ_CONCERN_LEVEL'] as any);
    options.readPreference = options.readPreference ?? (env[prefix + 'READ_PREFERENCE'] as any);
    options.maxStalenessSeconds = options.maxStalenessSeconds ?? toInt(env[prefix + 'MAX_STALENESS_SECONDS']);
    if (!options.auth?.username) {
      options.auth = options.auth || {};
      options.auth.username = options.auth.username ?? env[prefix + 'USERNAME'];
      options.auth.password = options.auth.password ?? env[prefix + 'PASSWORD'];
    }
    options.authSource = options.authSource ?? env[prefix + 'AUTH_SOURCE'];
    options.authMechanism = options.authMechanism ?? (env[prefix + 'AUTH_MECHANISM'] as any);
    options.localThresholdMS = options.localThresholdMS ?? toInt(env[prefix + 'LOCAL_THRESHOLD']);
    options.serverSelectionTimeoutMS =
      options.serverSelectionTimeoutMS ?? toInt(env[prefix + 'SERVER_SELECTION_TIMEOUT']);
    options.minHeartbeatFrequencyMS = options.minHeartbeatFrequencyMS ?? toInt(env[prefix + 'HEARTBEAT_FREQUENCY']);
    options.appName = options.appName ?? env[prefix + 'APP_NAME'];
    options.retryReads = options.retryReads ?? toBoolean(env[prefix + 'RETRY_READS']);
    options.retryWrites = options.retryWrites ?? toBoolean(env[prefix + 'RETRY_WRITES']);
    options.directConnection = options.directConnection ?? toBoolean(env[prefix + 'DIRECT_CONNECTION']);
    options.loadBalanced = options.loadBalanced ?? toBoolean(env[prefix + 'LOAD_BALANCED']);
    options.writeConcern = options.writeConcern ?? (env[prefix + 'WRITE_CONCERN'] as any);
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
    protected dbClient: MongoClient,
    private logger: Logger,
    @Inject(MONGODB_CONNECTION_OPTIONS)
    private connectionOptions: MongodbConnectionOptions,
  ) {}

  onApplicationBootstrap() {
    if (this.logger) {
      const options = this.connectionOptions;
      this.logger.log(`Connecting to MongoDB [${options.database}] at ${colors.blue(options.url!)}`);
      Logger.flush();
      return this.dbClient.connect().catch(e => {
        this.logger.error('MongoDB connection failed: ' + e.message);
        throw e;
      });
    }
  }

  onApplicationShutdown() {
    return this.dbClient.close(true);
  }
}
