import type { LoggerService } from '@nestjs/common';
import type { ModuleMetadata } from '@nestjs/common/interfaces';
import type { InjectionToken } from '@nestjs/common/interfaces/modules/injection-token.interface';
import type { MongoClientOptions } from 'mongodb';

export interface MongodbConnectionOptions extends MongoClientOptions {
  url?: string;
  database?: string;
  lazyConnect?: boolean;
}

interface BaseModuleOptions {
  token?: InjectionToken;
  dbToken?: InjectionToken;
  envPrefix?: string;
  logger?: LoggerService | string;
  global?: boolean;
}

export interface MongodbModuleOptions extends BaseModuleOptions {
  useValue?: MongodbConnectionOptions;
}

export interface MongodbModuleAsyncOptions
  extends BaseModuleOptions,
    Pick<ModuleMetadata, 'imports'> {
  inject?: InjectionToken[];
  useFactory: (
    ...args: any[]
  ) => Promise<MongodbConnectionOptions> | MongodbConnectionOptions;
}

/**
 * @publicApi
 */
export type HealthIndicatorStatus = 'up' | 'down';

/**
 * The result object of a health indicator
 * @publicApi
 */
export type HealthIndicatorResult<
  Key extends string = string,
  Status extends HealthIndicatorStatus = HealthIndicatorStatus,
  OptionalData extends Record<string, any> = Record<string, any>,
> = Record<Key, { status: Status } & OptionalData>;
