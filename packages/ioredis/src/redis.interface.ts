import type { ModuleMetadata } from '@nestjs/common/interfaces';
import type { RedisOptions } from 'ioredis';
import type { ClusterOptions } from 'ioredis/built/cluster/ClusterOptions';
import type { ClusterNode } from 'ioredis/built/cluster/index.js';

export interface RedisClientOptions extends RedisOptions {
  /**
   * Injection token
   */
  token?: any;
}

export interface RedisClusterOptions extends ClusterOptions {
  /**
   * Injection token
   */
  token?: any;
  nodes: ClusterNode[];
}

export interface RedisClientAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  /**
   * Injection token
   */
  token?: any;
  useFactory?: (...args: any[]) => Promise<RedisClientOptions> | RedisClientOptions;
  inject?: any[];
}

export interface RedisClusterAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  /**
   * Injection token
   */
  token?: any;
  useFactory?: (...args: any[]) => Promise<RedisClusterOptions> | RedisClusterOptions;
  inject?: any[];
}

export interface LockSettings {
  /**
   * This parameter is only used if lock has been acquired without leaseTimeout parameter definition.
   * Lock expires after `lockWatchdogTimeout` if watchdog
   * didn't extend it to next `lockWatchdogTimeout` time interval.
   *
   * This prevents against infinity locked locks due to Redisson client crush or
   * any other reason when lock can't be released in proper way.
   *
   * - Unit: milliseconds
   * - Default: 30000 milliseconds
   */
  lockWatchdogTimeout?: bigint;
}
