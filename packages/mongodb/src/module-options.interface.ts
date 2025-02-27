import type { Logger } from '@nestjs/common';
import type { ModuleMetadata } from '@nestjs/common/interfaces';
import type { InjectionToken } from '@nestjs/common/interfaces/modules/injection-token.interface';
import type { MongoClientOptions } from 'mongodb';

export interface MongodbConnectionOptions extends MongoClientOptions {
  url?: string;
  database?: string;
}

export interface MongodbModuleOptions extends MongodbConnectionOptions {
  clientToken?: InjectionToken;
  dbToken?: InjectionToken;
  envPrefix?: string;
  logger?: Logger | string;
}

export interface MongodbModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  clientToken?: InjectionToken;
  dbToken?: InjectionToken;
  envPrefix?: string;
  logger?: Logger | string;
  inject?: InjectionToken[];
  useFactory?: (...args: any[]) => Promise<MongodbConnectionOptions> | MongodbConnectionOptions;
}
