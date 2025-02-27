import type { Logger } from '@nestjs/common';
import type { ModuleMetadata } from '@nestjs/common/interfaces';
import type { InjectionToken } from '@nestjs/common/interfaces/modules/injection-token.interface';
import type { MongoClientOptions } from 'mongodb';

export interface MongodbConnectionOptions extends MongoClientOptions {
  url?: string;
  database?: string;
}

export interface MongodbModuleOptions extends MongodbConnectionOptions {
  token?: InjectionToken;
  dbToken?: InjectionToken;
  envPrefix?: string;
  logger?: Logger | string;
  global?: boolean;
}

export interface MongodbModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  token?: InjectionToken;
  dbToken?: InjectionToken;
  envPrefix?: string;
  logger?: Logger | string;
  global?: boolean;
  inject?: InjectionToken[];
  useFactory?: (...args: any[]) => Promise<MongodbConnectionOptions> | MongodbConnectionOptions;
}
