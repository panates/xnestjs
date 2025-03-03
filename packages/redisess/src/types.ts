import type { Logger } from '@nestjs/common';
import type { ModuleMetadata } from '@nestjs/common/interfaces';
import type { InjectionToken } from '@nestjs/common/interfaces/modules/injection-token.interface';
import type { Cluster, Redis } from 'ioredis';
import type { SessionManager } from 'redisess';

export interface RedisessSessionOptions extends SessionManager.Options {
  client: Redis | Cluster;
}

export interface RedisessModuleOptions extends BaseModuleOptions {
  useValue: RedisessSessionOptions;
}

export interface RedisessModuleAsyncOptions extends BaseModuleOptions, Pick<ModuleMetadata, 'imports'> {
  useFactory?: (...args: any[]) => Promise<RedisessSessionOptions> | RedisessSessionOptions;
  inject?: any[];
}

interface BaseModuleOptions {
  token?: InjectionToken;
  envPrefix?: string;
  logger?: Logger | string;
  global?: boolean;
}
