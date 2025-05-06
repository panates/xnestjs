import type { LoggerService } from '@nestjs/common';
import type { ModuleMetadata } from '@nestjs/common/interfaces';
import type { InjectionToken } from '@nestjs/common/interfaces/modules/injection-token.interface';
import * as rabbit from 'rabbitmq-client';

export type RmqClient = rabbit.Connection;
export const RmqClient = rabbit.Connection;

export interface RabbitmqConnectionOptions
  extends Pick<
    rabbit.ConnectionOptions,
    | 'username'
    | 'password'
    | 'acquireTimeout'
    | 'connectionName'
    | 'connectionTimeout'
    | 'frameMax'
    | 'heartbeat'
    | 'maxChannels'
    | 'retryHigh'
    | 'retryLow'
    | 'noDelay'
    | 'tls'
    | 'socket'
  > {
  urls?: string[];
  lazyConnect?: boolean;
}

export interface RabbitmqModuleOptions extends BaseModuleOptions {
  useValue?: string | string[] | RabbitmqConnectionOptions;
}

export interface RabbitmqModuleAsyncOptions
  extends BaseModuleOptions,
    Pick<ModuleMetadata, 'imports'> {
  inject?: any[];
  useFactory: (
    ...args: any[]
  ) =>
    | Promise<string | string[] | RabbitmqConnectionOptions>
    | string
    | string[]
    | RabbitmqConnectionOptions;
}

interface BaseModuleOptions {
  token?: InjectionToken;
  envPrefix?: string;
  logger?: LoggerService | string;
  global?: boolean;
}
