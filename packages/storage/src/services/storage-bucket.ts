import type { Buffer } from 'buffer';
import type { Readable } from 'stream';
import type { GetObjectSignedUrlOptions, ObjectInfo, PutObjectOptions } from '../types.js';
import type { StorageConnection } from './storage-connection';

export class StorageBucket {
  constructor(
    private _connection: StorageConnection,
    private _bucketName: string,
  ) {}

  putObject(objectName: string, buffer: Buffer | Readable | string, options?: PutObjectOptions): Promise<void> {
    return this._connection.putObject(this._bucketName, objectName, buffer, options);
  }

  getObjectInfo(objectName: string): Promise<ObjectInfo> {
    return this._connection.getObjectInfo(this._bucketName, objectName);
  }

  removeObject(objectName: string): Promise<void> {
    return this._connection.removeObject(this._bucketName, objectName);
  }

  getFile(objectName: string, filePath: string): Promise<void> {
    return this._connection.getFile(this._bucketName, objectName, filePath);
  }

  getObject(objectName: string): Promise<Readable> {
    return this._connection.getObject(this._bucketName, objectName);
  }

  presignedGetObject(objectName: string, options?: GetObjectSignedUrlOptions): Promise<string> {
    return this._connection.presignedGetObject(this._bucketName, objectName, options);
  }
}
