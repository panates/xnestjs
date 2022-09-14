import * as minio from 'minio';
import { Provider } from '@nestjs/common';
import { ModuleMetadata, Type } from '@nestjs/common/interfaces';

export type S3StorageOptions = minio.ClientOptions & { rejectUnauthorized: boolean };

export type AbstractType<T> = abstract new (...args: any[]) => T;

export interface StorageOptions {
  type: 's3' | 'gs',
  config: S3StorageOptions;
}

export type StorageModuleOptions = StorageOptions & {
  name?: string;
}

export interface StorageModuleOptionsFactory {
  getOptions(): Promise<StorageOptions> | StorageOptions;
}

export interface StorageModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  name?: string;
  inject?: any[];
  useClass?: Type<StorageModuleOptionsFactory>;
  useExisting?: Type<StorageModuleOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<StorageModuleOptions> | StorageModuleOptions;
  extraProviders?: Provider[];
}
