import type { Logger } from '@nestjs/common';
import type { ModuleMetadata } from '@nestjs/common/interfaces';
import type { InjectionToken } from '@nestjs/common/interfaces/modules/injection-token.interface';
import type { RedisOptions } from 'ioredis';
import type { ClusterOptions } from 'ioredis/built/cluster/ClusterOptions';
import type { ClusterNode } from 'ioredis/built/cluster/index.js';
import type { Lock } from 'redis-semaphore/lib/Lock';

export interface RedisStandaloneConnectionOptions extends RedisOptions {}

export interface RedisClusterConnectionOptions extends ClusterOptions {
  nodes: ClusterNode[];
}

export type RedisConnectionOptions =
  | RedisStandaloneConnectionOptions
  | RedisClusterConnectionOptions;

export interface RedisStandaloneModuleOptions extends BaseRedisModuleOptions {
  useValue?: RedisStandaloneConnectionOptions;
}

export interface RedisStandaloneAsyncModuleOptions
  extends BaseRedisModuleOptions, Pick<ModuleMetadata, 'imports'> {
  inject?: InjectionToken[];
  useFactory: (
    ...args: any[]
  ) =>
    | Promise<RedisStandaloneConnectionOptions>
    | RedisStandaloneConnectionOptions;
}

export interface RedisClusterModuleOptions extends BaseRedisModuleOptions {
  useValue?: RedisClusterConnectionOptions;
}

export interface RedisClusterAsyncModuleOptions
  extends BaseRedisModuleOptions, Pick<ModuleMetadata, 'imports'> {
  inject?: InjectionToken[];
  useFactory: (
    ...args: any[]
  ) => Promise<RedisClusterConnectionOptions> | RedisClusterConnectionOptions;
}

export type RedisModuleOptions =
  | RedisStandaloneModuleOptions
  | RedisClusterModuleOptions;
export type RedisAsyncModuleOptions =
  | RedisStandaloneAsyncModuleOptions
  | RedisClusterAsyncModuleOptions;

export interface BaseRedisModuleOptions {
  token?: InjectionToken;
  envPrefix?: string;
  logger?: Logger | string;
  global?: boolean;
}

// export interface LockSettings {
//   /**
//    * This parameter is only used if lock has been acquired without leaseTimeout parameter definition.
//    * Lock expires after `lockWatchdogTimeout` if watchdog
//    * didn't extend it to next `lockWatchdogTimeout` time interval.
//    *
//    * This prevents against infinity locked locks due to Redisson client crush or
//    * any other reason when lock can't be released in proper way.
//    *
//    * - Unit: milliseconds
//    * - Default: 30000 milliseconds
//    */
//   lockWatchdogTimeout?: bigint;
// }

export interface SharedLock extends Lock {
  readonly refCount: number;

  acquire(): Promise<void>;

  acquire(callback: () => any): Promise<any>;

  release(force?: boolean): Promise<void>;
}
