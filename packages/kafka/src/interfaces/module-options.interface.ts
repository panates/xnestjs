import { Logger, Type } from '@nestjs/common';
import type { ModuleMetadata } from '@nestjs/common/interfaces';
import type { InjectionToken } from '@nestjs/common/interfaces/modules/injection-token.interface';
import { KafkaConfig } from 'kafkajs';
import { StrictOmit } from 'ts-gems';

export interface KafkaModuleOptions extends StrictOmit<KafkaConfig, 'logLevel' | 'logCreator'> {
  id?: InjectionToken;
  logger?: Logger | string;
}

export interface KafkaModuleOptionsFactory {
  createOptions(): Promise<KafkaModuleOptions> | KafkaModuleOptions;
}

export interface KafkaModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  id?: InjectionToken;
  useExisting?: Type<KafkaModuleOptionsFactory>;
  useClass?: Type<KafkaModuleOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<StrictOmit<KafkaModuleOptions, 'id'>> | StrictOmit<KafkaModuleOptions, 'id'>;
  inject?: any[];
}
