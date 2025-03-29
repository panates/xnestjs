import type { InjectionToken, Logger } from '@nestjs/common';
import type { ModuleMetadata } from '@nestjs/common/interfaces';
import type * as minio from 'minio';

export type S3Config = minio.ClientOptions & { rejectUnauthorized?: boolean };

export type StorageProvider = 's3'; // | 'gs';

/**
 * Amazon S3
 */
export interface S3StorageOptions {
  provider: 's3';
  s3: S3Config;
}

// /**
//  * Google Cloud Storage
//  */
// export interface GSStorageOptions {
//   provider: 'gs';
//   gs: {};
// }

export type StorageOptions = S3StorageOptions; // | GSStorageOptions;

export interface StorageModuleOptions extends BaseModuleOptions {
  useValue?: StorageOptions;
}

export interface StorageModuleAsyncOptions
  extends BaseModuleOptions,
    Pick<ModuleMetadata, 'imports'> {
  useFactory?: (...args: any[]) => Promise<StorageOptions> | StorageOptions;
  inject?: any[];
}

interface BaseModuleOptions {
  token?: InjectionToken;
  envPrefix?: string;
  logger?: Logger | string;
  global?: boolean;
}

export type FileMetadata = Record<string, any>;

export interface ObjectInfo {
  originalName?: string;
  contentType?: string;
  contentLanguage?: string;
  contentEncoding?: string;
  size: number;
  etag: string;
  lastModified: Date;
  metadata: Record<string, any>;
}

export interface PutObjectOptions {
  originalName?: string;
  contentType?: string;
  contentLanguage?: string;
  contentEncoding?: string;
  metadata?: FileMetadata;
}

export interface SignedUrlOptions {
  expires?: number;
}

export interface GetObjectSignedUrlOptions extends SignedUrlOptions {}
