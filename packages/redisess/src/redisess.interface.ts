import type { Type } from '@nestjs/common';
import type { ModuleMetadata } from '@nestjs/common/interfaces';
import Redis, { Cluster } from 'ioredis';
import type { SessionManager } from 'redisess';

export interface RedisessModuleOptions extends SessionManager.Options {
  /**
   * Connection name
   */
  name?: string;

  client: Redis | Cluster;
}

export interface RedisessModuleOptionsFactory {
  createOptions(connectionName?: string): Promise<RedisessModuleOptions> | RedisessModuleOptions;
}

export interface RedisesModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  name?: string;
  useExisting?: Type<RedisessModuleOptionsFactory>;
  useClass?: Type<RedisessModuleOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<RedisessModuleOptions> | RedisessModuleOptions;
  inject?: any[];
}
