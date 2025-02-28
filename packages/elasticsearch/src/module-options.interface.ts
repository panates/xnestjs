import type { ClientOptions } from '@elastic/elasticsearch';
import type { Logger } from '@nestjs/common';
import type { ModuleMetadata } from '@nestjs/common/interfaces';
import type { InjectionToken } from '@nestjs/common/interfaces/modules/injection-token.interface';

export interface ElasticsearchConnectionOptions extends ClientOptions {
}

export interface ElasticsearchModuleOptions extends ElasticsearchConnectionOptions {
  token?: InjectionToken;
  envPrefix?: string;
  logger?: Logger | string;
  global?: boolean;
}

export interface ElasticsearchModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  token?: InjectionToken;
  envPrefix?: string;
  logger?: Logger | string;
  global?: boolean;
  inject?: InjectionToken[];
  useFactory?: (...args: any[]) => Promise<ElasticsearchConnectionOptions> | ElasticsearchConnectionOptions;
}
