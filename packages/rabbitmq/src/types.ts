import type { LoggerService } from '@nestjs/common';
import type { ModuleMetadata } from '@nestjs/common/interfaces';
import type { InjectionToken } from '@nestjs/common/interfaces/modules/injection-token.interface';
import {
  type AmqpConnectionManager,
  AmqpConnectionManagerClass,
  type AmqpConnectionManagerOptions,
  type ConnectionUrl,
} from 'amqp-connection-manager';

export type RmqClient = AmqpConnectionManager;
export const RmqClient = AmqpConnectionManagerClass;
export { AmqpConnectionManagerOptions, ConnectionUrl };

export interface RabbitmqConnectionOptions
  extends AmqpConnectionManagerOptions {
  urls?: ConnectionUrl[];
  lazyConnect?: boolean;
}

export interface RabbitmqModuleOptions extends BaseModuleOptions {
  useValue?: RabbitmqConnectionOptions;
}

export interface RabbitmqModuleAsyncOptions
  extends BaseModuleOptions,
    Pick<ModuleMetadata, 'imports'> {
  inject?: any[];
  useFactory: (
    ...args: any[]
  ) => Promise<RabbitmqConnectionOptions> | RabbitmqConnectionOptions;
}

interface BaseModuleOptions {
  token?: InjectionToken;
  envPrefix?: string;
  logger?: LoggerService | string;
  global?: boolean;
}
