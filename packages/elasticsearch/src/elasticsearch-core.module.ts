import assert from 'node:assert';
import * as crypto from 'node:crypto';
import process from 'node:process';
import { clone } from '@jsopen/objects';
import { DynamicModule, Inject, Logger, OnApplicationBootstrap, OnApplicationShutdown, Provider } from '@nestjs/common';
import { ElasticsearchModule, ElasticsearchService } from '@nestjs/elasticsearch';
import * as colors from 'ansi-colors';
import { toBoolean, toInt } from 'putil-varhelpers';
import { ELASTICSEARCH_CONNECTION_OPTIONS, ELASTICSEARCH_MODULE_ID } from './constants.js';
import type {
  ElasticsearchConnectionOptions,
  ElasticsearchModuleAsyncOptions,
  ElasticsearchModuleOptions,
} from './types.js';

const CLIENT_TOKEN = Symbol('CLIENT_TOKEN');

export class ElasticsearchCoreModule implements OnApplicationShutdown, OnApplicationBootstrap {
  /**
   *
   */
  static forRoot(moduleOptions: ElasticsearchModuleOptions): DynamicModule {
    const connectionOptions = this._readConnectionOptions(moduleOptions.useValue || {}, moduleOptions.envPrefix);
    return this._createDynamicModule(moduleOptions, {
      global: moduleOptions.global,
      providers: [
        {
          provide: ELASTICSEARCH_CONNECTION_OPTIONS,
          useValue: connectionOptions,
        },
      ],
    });
  }

  /**
   *
   */
  static forRootAsync(asyncOptions: ElasticsearchModuleAsyncOptions): DynamicModule {
    assert.ok(asyncOptions.useFactory, 'useFactory is required');
    return this._createDynamicModule(asyncOptions, {
      global: asyncOptions.global,
      providers: [
        {
          provide: ELASTICSEARCH_CONNECTION_OPTIONS,
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
    opts: ElasticsearchModuleOptions | ElasticsearchModuleAsyncOptions,
    metadata: Partial<DynamicModule>,
  ) {
    const token = opts.token ?? ElasticsearchService;
    const logger = typeof opts.logger === 'string' ? new Logger(opts.logger) : opts.logger;
    const exports = [ELASTICSEARCH_CONNECTION_OPTIONS, ...(metadata.exports ?? [])];
    const providers: Provider[] = [
      ...(metadata.providers ?? []),
      {
        provide: Logger,
        useValue: logger,
      },
      {
        provide: CLIENT_TOKEN,
        useExisting: ElasticsearchService,
      },
      {
        provide: ELASTICSEARCH_MODULE_ID,
        useValue: crypto.randomUUID(),
      },
    ];
    if (token !== ElasticsearchService) {
      exports.push(token);
      providers.push({
        provide: token,
        useExisting: ElasticsearchService,
      });
    }

    class InnerProvidersModule {}

    return {
      module: ElasticsearchCoreModule,
      providers,
      // global: true,
      imports: [
        ElasticsearchModule.registerAsync({
          imports: [
            {
              module: InnerProvidersModule,
              providers: metadata.providers,
              exports: metadata.providers,
            },
          ],
          inject: [ELASTICSEARCH_CONNECTION_OPTIONS],
          useFactory: async (connectionOptions: ElasticsearchConnectionOptions) => {
            return connectionOptions;
          },
        }),
      ],
      exports,
    } as DynamicModule;
  }

  private static _readConnectionOptions(
    moduleOptions: ElasticsearchConnectionOptions,
    prefix: string = 'ELASTIC_',
  ): ElasticsearchConnectionOptions {
    const options = clone(moduleOptions);
    const env = process.env;
    options.node = options.node || env[prefix + 'NODE'];
    if (options.node) {
      if (typeof options.node === 'string' && options.node.includes(',')) options.node.split(/\s*,\s*/);
    } else {
      options.nodes = options.nodes || env[prefix + 'NODES'];
      if (options.nodes) {
        if (typeof options.nodes === 'string' && options.nodes.includes(',')) options.nodes.split(/\s*,\s*/);
      }
    }
    if (!(options.node || options.nodes)) options.node = 'http://localhost:9200';
    options.maxRetries = options.maxRetries ?? toInt(env[prefix + 'MAX_RETRIES']);
    options.requestTimeout = options.requestTimeout ?? toInt(env[prefix + 'REQUEST_TIMEOUT']);
    options.pingTimeout = options.pingTimeout ?? toInt(env[prefix + 'PING_TIMEOUT']);

    if (options.tls == null && toBoolean(env[prefix + 'TLS'])) {
      options.tls = {
        ca: [env[prefix + 'TLS_CA_CERT'] || ''],
        cert: env[prefix + 'TLS_CERT_FILE'],
        key: env[prefix + 'TLS_KEY_FILE'],
        passphrase: env[prefix + 'TLS_KEY_PASSPHRASE'],
        rejectUnauthorized: toBoolean(env[prefix + 'TLS_REJECT_UNAUTHORIZED']),
        checkServerIdentity: (host, cert) => {
          if (cert.subject.CN !== host) {
            return new Error(`Certificate CN (${cert.subject.CN}) does not match host (${host})`);
          }
        },
      };
    }
    options.name = options.name ?? env[prefix + 'NAME'];
    if (!options.auth) {
      if (env[prefix + 'AUTH_USERNAME']) {
        options.auth = {
          username: env[prefix + 'AUTH_USERNAME']!,
          password: env[prefix + 'AUTH_PASSWORD'] || '',
        };
      } else if (env[prefix + 'AUTH_BEARER']) {
        options.auth = {
          bearer: env[prefix + 'AUTH_BEARER']!,
        };
      } else if (env[prefix + 'AUTH_API_KEY']) {
        if (env[prefix + 'API_KEY_ID'])
          options.auth = {
            apiKey: {
              id: env[prefix + 'API_KEY_ID']!,
              api_key: env[prefix + 'API_KEY']!,
            },
          };
        options.auth = {
          apiKey: env[prefix + 'API_KEY']!,
        };
      }
    }
    options.caFingerprint = options.caFingerprint ?? env[prefix + 'CA_FINGERPRINT'];
    options.maxResponseSize = options.maxResponseSize ?? toInt(env[prefix + 'MAX_RESPONSE_SIZE']);
    options.maxCompressedResponseSize =
      options.maxCompressedResponseSize ?? toInt(env[prefix + 'MAX_COMPRESSED_RESPONSE_SIZE']);
    return options;
  }

  /**
   *
   * @constructor
   */
  constructor(
    @Inject(CLIENT_TOKEN)
    protected client: ElasticsearchService,
    private logger: Logger,
    @Inject(ELASTICSEARCH_CONNECTION_OPTIONS)
    private connectionOptions: ElasticsearchConnectionOptions,
  ) {}

  async onApplicationBootstrap() {
    if (this.logger) {
      const options = this.connectionOptions;
      const nodes = options.node || options.nodes;
      this.logger.log(`Connecting to ElasticSearch at ${colors.blue(String(nodes))}`);
      Logger.flush();
      await this.client.ping({}).catch(e => {
        this.logger.error('ElasticSearch connection failed: ' + e.message);
        throw e;
      });
    }
  }

  onApplicationShutdown() {
    return this.client.close();
  }
}
