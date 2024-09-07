import { DynamicModule, Global, Logger, Module, Provider } from '@nestjs/common';
import * as crypto from 'crypto';
import { Kafka } from 'kafkajs';
import { KAFKA_MODULE_ID, KAFKA_MODULE_OPTIONS } from './constants.js';
import {
  KafkaModuleAsyncOptions,
  KafkaModuleOptions,
  KafkaModuleOptionsFactory,
} from './interfaces/module-options.interface.js';
import { createLogCreator } from './utils/create-log-creator.js';

@Global()
@Module({})
export class KafkaCoreModule {
  static forRoot(options: KafkaModuleOptions): DynamicModule {
    const logger = options.logger || new Logger();
    const loggerProvider = {
      provide: Logger,
      useValue: logger,
    };
    const optionsProvider = {
      provide: KAFKA_MODULE_OPTIONS,
      useValue: options,
    };
    const kafkaProvider = {
      provide: options.id || Kafka,
      useFactory: () => this.createKafka({ ...options, logger }),
    };

    return {
      module: KafkaCoreModule,
      providers: [loggerProvider, kafkaProvider, optionsProvider],
      exports: [kafkaProvider],
    };
  }

  static forRootAsync(asyncOptions: KafkaModuleAsyncOptions): DynamicModule {
    const loggerProvider = {
      provide: Logger,
      inject: [KAFKA_MODULE_OPTIONS],
      useFactory: (options: KafkaModuleOptions) => options.logger || new Logger(),
    };
    const kafkaProvider = {
      provide: asyncOptions.id || Kafka,
      inject: [KAFKA_MODULE_OPTIONS, Logger],
      useFactory: async (options: KafkaModuleOptions, logger: Logger) => this.createKafka({ ...options, logger }),
    };

    const asyncProviders = this.createAsyncProviders(asyncOptions);
    return {
      module: KafkaCoreModule,
      imports: asyncOptions.imports,
      providers: [
        ...asyncProviders,
        loggerProvider,
        kafkaProvider,
        {
          provide: KAFKA_MODULE_ID,
          useValue: crypto.randomUUID(),
        },
      ],
      exports: [kafkaProvider],
    };
  }

  private static createAsyncProviders(asyncOptions: KafkaModuleAsyncOptions): Provider[] {
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

  private static createAsyncOptionsProvider(asyncOptions: KafkaModuleAsyncOptions): Provider {
    if (asyncOptions.useFactory) {
      return {
        provide: KAFKA_MODULE_OPTIONS,
        useFactory: asyncOptions.useFactory,
        inject: asyncOptions.inject || [],
      };
    }
    const useClass = asyncOptions.useClass || asyncOptions.useExisting;
    if (useClass) {
      return {
        provide: KAFKA_MODULE_OPTIONS,
        useFactory: (optionsFactory: KafkaModuleOptionsFactory) => optionsFactory.createOptions(),
        inject: [useClass],
      };
    }
    throw new Error('Invalid configuration. Must provide useFactory, useClass or useExisting');
  }

  private static async createKafka(options: KafkaModuleOptions): Promise<Kafka> {
    const logger =
      typeof options.logger === 'string'
        ? new Logger(options.logger)
        : typeof options.logger === 'object'
          ? options.logger
          : new Logger();
    return new Kafka({
      ...options,
      // @ts-ignore
      id: undefined,
      logCreator: () => createLogCreator(logger),
    });
  }
}
