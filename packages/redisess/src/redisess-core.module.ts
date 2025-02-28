import * as assert from 'node:assert';
import { omit } from '@jsopen/objects';
import { DynamicModule, Inject, Logger, OnApplicationShutdown, Provider } from '@nestjs/common';
import * as crypto from 'crypto';
import { SessionManager } from 'redisess';
import { REDISESS_MODULE_ID, REDISESS_SESSION_OPTIONS } from './constants.js';
import type { RedisessModuleAsyncOptions, RedisessModuleOptions, RedisessSessionOptions } from './types.js';

const CLIENT_TOKEN = Symbol('CLIENT_TOKEN');

export class RedisessCoreModule implements OnApplicationShutdown {
  /**
   * Configures and returns a dynamic module
   */
  static forRoot(moduleOptions: RedisessModuleOptions): DynamicModule {
    return this._createDynamicModule(moduleOptions, {
      global: moduleOptions.global,
      providers: [
        {
          provide: REDISESS_SESSION_OPTIONS,
          useValue: moduleOptions.useValue,
        },
      ],
    });
  }

  /**
   * Configures and returns an async dynamic module
   */
  static forRootAsync(asyncOptions: RedisessModuleAsyncOptions): DynamicModule {
    assert.ok(asyncOptions.useFactory, 'useFactory is required');
    return this._createDynamicModule(asyncOptions, {
      global: asyncOptions.global,
      providers: [
        {
          provide: REDISESS_SESSION_OPTIONS,
          inject: asyncOptions.inject,
          useFactory: asyncOptions.useFactory,
        },
      ],
    });
  }

  private static _createDynamicModule(
    opts: RedisessModuleOptions | RedisessModuleAsyncOptions,
    metadata: Partial<DynamicModule>,
  ) {
    const token = opts.token ?? SessionManager;
    const providers: Provider[] = [
      {
        provide: token,
        inject: [REDISESS_SESSION_OPTIONS],
        useFactory: async (sessionOptions: RedisessSessionOptions): Promise<SessionManager> => {
          const redisessOptions = omit(sessionOptions, ['client']) as SessionManager.Options;
          return new SessionManager(sessionOptions.client, redisessOptions);
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
      module: RedisessCoreModule,
      ...metadata,
      providers: [
        ...(metadata.providers ?? []),
        ...providers,
        {
          provide: REDISESS_MODULE_ID,
          useValue: crypto.randomUUID(),
        },
      ],
      exports: [REDISESS_SESSION_OPTIONS, token, ...(metadata.exports ?? [])],
    } as DynamicModule;
  }

  /**
   *
   * @constructor
   */
  constructor(
    @Inject(CLIENT_TOKEN)
    private readonly sessionManager: SessionManager,
  ) {}

  async onApplicationShutdown() {
    this.sessionManager.quit();
  }
}
