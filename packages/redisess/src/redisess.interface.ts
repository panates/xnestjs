import Redis from 'ioredis';
import { SessionManager } from 'redisess';
import { Type } from '@nestjs/common';
import { ModuleMetadata } from '@nestjs/common/interfaces';

export interface RedisessModuleOptions extends SessionManager.Options {
  /**
   * Connection name
   */
  name?: string;

  client: Redis;

}

export interface RedisessModuleOptionsFactory {
  createOptions(connectionName?: string): Promise<RedisessModuleOptions> | RedisessModuleOptions;
}

export interface RedisesModuleAsyncOptions
    extends Pick<ModuleMetadata, 'imports'> {
  name?: string;
  useExisting?: Type<RedisessModuleOptionsFactory>;
  useClass?: Type<RedisessModuleOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<RedisessModuleOptions> | RedisessModuleOptions;
  inject?: any[];
}
