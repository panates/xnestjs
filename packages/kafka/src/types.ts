import type { LoggerService } from '@nestjs/common';
import type { ModuleMetadata } from '@nestjs/common/interfaces';
import type { InjectionToken } from '@nestjs/common/interfaces/modules/injection-token.interface';
import type { ConsumerConfig } from '@nestjs/microservices/external/kafka.interface';
import type { KafkaConfig } from 'kafkajs';
import type { StrictOmit } from 'ts-gems';

export interface KafkaConnectionOptions extends StrictOmit<
  KafkaConfig,
  'logLevel' | 'logCreator'
> {
  consumer?: ConsumerConfig;
  lazyConnect?: boolean;
}

interface BaseModuleOptions {
  token?: InjectionToken;
  envPrefix?: string;
  logger?: LoggerService | string;
  global?: boolean;
}

export interface KafkaModuleOptions extends BaseModuleOptions {
  useValue?: Partial<KafkaConnectionOptions>;
}

export interface KafkaModuleAsyncOptions
  extends BaseModuleOptions, Pick<ModuleMetadata, 'imports'> {
  inject?: any[];
  useFactory: (
    ...args: any[]
  ) =>
    | Promise<Partial<KafkaConnectionOptions>>
    | Partial<KafkaConnectionOptions>;
}
