import type { Buffer } from 'buffer';
import type { Readable } from 'stream';
import type { StorageProvider } from '../types';
import type { GetObjectSignedUrlOptions, ObjectInfo, PutObjectOptions } from '../types.js';
import { StorageBucket } from './storage-bucket.js';

export abstract class StorageConnection {
  abstract readonly provider: StorageProvider;
  abstract readonly config: any;

  getBucket(bucketName: string): StorageBucket {
    return new StorageBucket(this, bucketName);
  }

  abstract putObject(bucketName: string, objectName: string, buffer: Buffer, options?: PutObjectOptions): Promise<void>;
  abstract putObject(
    bucketName: string,
    objectName: string,
    stream: Readable,
    options?: PutObjectOptions,
  ): Promise<void>;
  abstract putObject(
    bucketName: string,
    objectName: string,
    filePath: string,
    options?: PutObjectOptions,
  ): Promise<void>;
  abstract putObject(
    bucketName: string,
    objectName: string,
    source: Buffer | Readable | string,
    options?: PutObjectOptions,
  ): Promise<void>;

  abstract getObjectInfo(bucketName: string, objectName: string): Promise<ObjectInfo>;

  abstract removeObject(bucketName: string, objectName: string): Promise<void>;

  abstract getFile(bucketName: string, objectName: string, filePath: string): Promise<void>;

  abstract getObject(bucketName: string, objectName: string): Promise<Readable>;

  abstract presignedGetObject(
    bucketName: string,
    objectName: string,
    options?: GetObjectSignedUrlOptions,
  ): Promise<string>;
}
