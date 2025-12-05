import type { ClientOptions } from '@elastic/elasticsearch';
import type { LoggerService } from '@nestjs/common';
import type { ModuleMetadata } from '@nestjs/common/interfaces';
import type { InjectionToken } from '@nestjs/common/interfaces/modules/injection-token.interface';

export interface ElasticsearchConnectionOptions extends ClientOptions {
  lazyConnect?: boolean;
}

interface BaseModuleOptions {
  token?: InjectionToken;
  envPrefix?: string;
  logger?: LoggerService | string;
  global?: boolean;
}

export interface ElasticsearchModuleOptions extends BaseModuleOptions {
  useValue?: ElasticsearchConnectionOptions;
}

export interface ElasticsearchModuleAsyncOptions
  extends BaseModuleOptions, Pick<ModuleMetadata, 'imports'> {
  inject?: InjectionToken[];
  useFactory: (
    ...args: any[]
  ) => Promise<ElasticsearchConnectionOptions> | ElasticsearchConnectionOptions;
}
