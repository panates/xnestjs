import type { RedisOptions } from 'ioredis';
import type { ClusterOptions } from 'ioredis/built/cluster/ClusterOptions';
import type { ClusterNode } from 'ioredis/built/cluster/index.js';
import type { ModuleMetadata } from '@nestjs/common/interfaces';

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

export interface RedisClientAsyncOptions
    extends Pick<ModuleMetadata, 'imports'> {
  /**
   * Injection token
   */
  token?: any;
  useFactory?: (...args: any[]) => Promise<RedisClientOptions> | RedisClientOptions;
  inject?: any[];
}

export interface RedisClusterAsyncOptions
    extends Pick<ModuleMetadata, 'imports'> {
  /**
   * Injection token
   */
  token?: any;
  useFactory?: (...args: any[]) => Promise<RedisClusterOptions> | RedisClusterOptions;
  inject?: any[];
}
