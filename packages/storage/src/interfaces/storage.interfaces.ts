import type { InjectionToken } from '@nestjs/common';
import type { ModuleMetadata, Type } from '@nestjs/common/interfaces';
import type * as minio from 'minio';

export type S3Config = minio.ClientOptions & { rejectUnauthorized?: boolean };

export type StorageProvider = 's3' | 'gs';

export interface S3StorageOptions {
  provider: StorageProvider;
  s3: S3Config;
}

export interface GSStorageOptions {
  provider: StorageProvider;
  gs: {};
}

export type StorageOptions = S3StorageOptions | GSStorageOptions;

export type StorageModuleOptions = StorageOptions & {
  token?: InjectionToken;
  global?: boolean;
};

export interface StorageModuleAsyncOptions extends Pick<ModuleMetadata, 'imports' | 'exports' | 'providers'> {
  token?: InjectionToken;
  inject?: any[];
  global?: boolean;
  useClass?: Type<StorageOptions>;
  useExisting?: InjectionToken;
  useFactory?: (...args: any[]) => Promise<StorageOptions> | StorageOptions;
}
