import type { ClientOptions } from '@elastic/elasticsearch';
import type { Logger } from '@nestjs/common';
import type { ModuleMetadata } from '@nestjs/common/interfaces';
import type { InjectionToken } from '@nestjs/common/interfaces/modules/injection-token.interface';

export interface ElasticsearchConnectionOptions extends ClientOptions {}

interface BaseModuleOptions {
  token?: InjectionToken;
  envPrefix?: string;
  logger?: Logger | string;
  global?: boolean;
}

export interface ElasticsearchModuleOptions extends BaseModuleOptions {
  useValue?: ElasticsearchConnectionOptions;
}

export interface ElasticsearchModuleAsyncOptions extends BaseModuleOptions, Pick<ModuleMetadata, 'imports'> {
  inject?: InjectionToken[];
  useFactory: (...args: any[]) => Promise<ElasticsearchConnectionOptions> | ElasticsearchConnectionOptions;
}
