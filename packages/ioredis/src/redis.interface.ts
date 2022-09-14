import { RedisOptions } from 'ioredis';
import { Type } from '@nestjs/common';
import { ModuleMetadata } from '@nestjs/common/interfaces';

export interface RedisModuleOptions extends RedisOptions {
  /**
   * Connection name
   */
  name?: string;
}

export interface RedisModuleOptionsFactory {
  createOptions(connectionName?: string): Promise<RedisModuleOptions> | RedisModuleOptions;
}

export interface RedisModuleAsyncOptions
    extends Pick<ModuleMetadata, 'imports'> {
  name?: string;
  useExisting?: Type<RedisModuleOptionsFactory>;
  useClass?: Type<RedisModuleOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<RedisModuleOptions> | RedisModuleOptions;
  inject?: any[];
}
