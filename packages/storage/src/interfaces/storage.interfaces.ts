import type { InjectionToken } from '@nestjs/common';
import type { ModuleMetadata, Type } from '@nestjs/common/interfaces';
import type * as minio from 'minio';

export type S3Config = minio.ClientOptions & { rejectUnauthorized?: boolean };

export type AbstractType<T> = abstract new (...args: any[]) => T;

export interface S3StorageOptions {
  type: 's3';
  s3: S3Config;
}

export interface GSStorageOptions {
  type: 'gs';
  gs: {};
}

export type StorageOptions = S3StorageOptions | GSStorageOptions;

export type StorageModuleOptions = StorageOptions & {
  token?: InjectionToken;
  global?: boolean;
};

export interface StorageModuleAsyncOptions<I extends [any]>
  extends Pick<ModuleMetadata, 'imports' | 'exports' | 'providers'> {
  token?: InjectionToken;
  inject?: I;
  global?: boolean;
  useClass?: Type<StorageOptions>;
  useExisting?: InjectionToken;
  useFactory?: (...args: I) => Promise<StorageOptions> | StorageOptions;
}
