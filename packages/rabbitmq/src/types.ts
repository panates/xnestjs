import type { Logger } from '@nestjs/common';
import type { ModuleMetadata } from '@nestjs/common/interfaces';
import type { InjectionToken } from '@nestjs/common/interfaces/modules/injection-token.interface';
import type { RmqOptions } from '@nestjs/microservices';

type ExtractRmqOptions = Required<RmqOptions>['options'];

export interface RabbitmqConnectionOptions extends ExtractRmqOptions {
  lazyConnect?: boolean;
}

export interface RabbitmqModuleOptions extends BaseModuleOptions {
  useValue?: Partial<RabbitmqConnectionOptions>;
}

export interface RabbitmqModuleAsyncOptions extends BaseModuleOptions, Pick<ModuleMetadata, 'imports'> {
  inject?: any[];
  useFactory: (...args: any[]) => Promise<Partial<RabbitmqConnectionOptions>> | Partial<RabbitmqConnectionOptions>;
}

interface BaseModuleOptions {
  token?: InjectionToken;
  envPrefix?: string;
  logger?: Logger | string;
  global?: boolean;
}
