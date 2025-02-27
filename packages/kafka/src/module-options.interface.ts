import type { Logger } from '@nestjs/common';
import type { ModuleMetadata } from '@nestjs/common/interfaces';
import type { InjectionToken } from '@nestjs/common/interfaces/modules/injection-token.interface';
import type { ConsumerConfig } from '@nestjs/microservices/external/kafka.interface';
import type { KafkaConfig } from 'kafkajs';
import type { StrictOmit } from 'ts-gems';

export interface KafkaConnectionOptions extends StrictOmit<KafkaConfig, 'logLevel' | 'logCreator'> {
  consumer?: ConsumerConfig;
}

export interface KafkaModuleOptions extends KafkaConnectionOptions {
  token?: InjectionToken;
  envPrefix?: string;
  logger?: Logger | string;
  global?: boolean;
}

export interface KafkaModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  token?: InjectionToken;
  envPrefix?: string;
  logger?: Logger | string;
  global?: boolean;
  inject?: any[];
  useFactory?: (...args: any[]) => Promise<KafkaConnectionOptions> | KafkaConnectionOptions;
}
