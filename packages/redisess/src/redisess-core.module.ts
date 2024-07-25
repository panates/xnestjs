import { DynamicModule, Global, Inject, Module, OnApplicationShutdown, Provider } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import * as crypto from 'crypto';
import { SessionManager } from 'redisess';
import { REDISESS_MODULE_OPTIONS, REDISESS_MODULE_TOKEN } from './redisess.constants.js';
import {
  RedisesModuleAsyncOptions,
  RedisessModuleOptions,
  RedisessModuleOptionsFactory,
} from './redisess.interface.js';
import { getSessionManagerToken } from './redisess.utils.js';

@Global()
@Module({})
export class RedisessCoreModule implements OnApplicationShutdown {
  constructor(
    @Inject(REDISESS_MODULE_OPTIONS)
    private readonly options: RedisessModuleOptions,
    private readonly moduleRef: ModuleRef,
  ) {}

  static forRoot(options: RedisessModuleOptions): DynamicModule {
    const optionsProvider = {
      provide: REDISESS_MODULE_OPTIONS,
      useValue: options,
    };
    const connectionProvider = {
      provide: getSessionManagerToken(options.name),
      useFactory: () => this.createSessionManager(options),
    };

    return {
      module: RedisessCoreModule,
      providers: [connectionProvider, optionsProvider],
      exports: [connectionProvider],
    };
  }

  static forRootAsync(asyncOptions: RedisesModuleAsyncOptions): DynamicModule {
    const connectionProvider = {
      provide: getSessionManagerToken(asyncOptions.name),
      inject: [REDISESS_MODULE_OPTIONS],
      useFactory: async (oOptions: RedisessModuleOptions) => {
        const name = asyncOptions.name || oOptions.name;
        return this.createSessionManager({
          ...oOptions,
          name,
        });
      },
    };

    const asyncProviders = this.createAsyncProviders(asyncOptions);
    return {
      module: RedisessCoreModule,
      imports: asyncOptions.imports,
      providers: [
        ...asyncProviders,
        connectionProvider,
        {
          provide: REDISESS_MODULE_TOKEN,
          useValue: crypto.randomUUID(),
        },
      ],
      exports: [connectionProvider],
    };
  }

  async onApplicationShutdown() {
    const sessionManager = this.moduleRef.get(getSessionManagerToken(this.options.name)) as SessionManager;
    if (sessionManager) sessionManager.quit();
  }

  private static createAsyncProviders(asyncOptions: RedisesModuleAsyncOptions): Provider[] {
    if (asyncOptions.useExisting || asyncOptions.useFactory) return [this.createAsyncOptionsProvider(asyncOptions)];

    if (asyncOptions.useClass) {
      return [
        this.createAsyncOptionsProvider(asyncOptions),
        {
          provide: asyncOptions.useClass,
          useClass: asyncOptions.useClass,
        },
      ];
    }

    throw new Error('Invalid configuration. Must provide useFactory, useClass or useExisting');
  }

  private static createAsyncOptionsProvider(asyncOptions: RedisesModuleAsyncOptions): Provider {
    if (asyncOptions.useFactory) {
      return {
        provide: REDISESS_MODULE_OPTIONS,
        useFactory: asyncOptions.useFactory,
        inject: asyncOptions.inject || [],
      };
    }
    const useClass = asyncOptions.useClass || asyncOptions.useExisting;
    if (useClass) {
      return {
        provide: REDISESS_MODULE_OPTIONS,
        useFactory: (optionsFactory: RedisessModuleOptionsFactory) => optionsFactory.createOptions(asyncOptions.name),
        inject: [useClass],
      };
    }
    throw new Error('Invalid configuration. Must provide useFactory, useClass or useExisting');
  }

  private static async createSessionManager(options: RedisessModuleOptions): Promise<SessionManager> {
    const opts: any = { ...options };
    delete opts.client;
    delete opts.name;
    return new SessionManager(options.client, opts);
  }
}
