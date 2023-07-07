import { Buffer } from 'buffer';
import * as Minio from 'minio';
import { Readable } from 'stream';
import {
  GetObjectSignedUrlOptions,
  ObjectInfo,
  PutObjectOptions
} from '../interfaces/connection.interfaces.js';
import { S3StorageOptions } from '../interfaces/storage.interfaces.js';
import { StorageConnection } from '../services/storage-connection.js';

export class S3StorageConnection extends StorageConnection {
  private _client: Minio.Client;

  constructor(options: S3StorageOptions) {
    super();
    this._client = new Minio.Client(options);
    // todo: remove casting to any later. https://github.com/minio/minio-js/issues/1163
    (this._client as any).setRequestOptions({rejectUnauthorized: options.rejectUnauthorized});
  }

  async putObject(bucketName: string, objectName: string, source: Buffer | Readable | string, options?: PutObjectOptions): Promise<void> {
    const meta = options ? updateMetadata(options?.metadata, options) : {};
    if (typeof source === 'string')
      await this._client.fPutObject(bucketName, objectName, source, meta);
    else
        // eslint-disable-next-line @typescript-eslint/await-thenable
      await this._client.putObject(bucketName, objectName, source, undefined, meta);
  }

  async getObjectInfo(bucketName: string, objectName: string): Promise<ObjectInfo> {
    const o = await this._client.statObject(bucketName, objectName);
    const inf: ObjectInfo = {
      size: o.size,
      etag: o.etag,
      lastModified: o.lastModified,
      metadata: o.metaData
    };
    if (inf.metadata) {
      const meta = inf.metadata;
      removeKey(meta, 'content-length');
      removeKey(meta, 'last-modified');
      if (meta['Content-Type']) {
        inf.contentLanguage = meta['Content-Type'];
        removeKey(meta, 'content-type');
      }
      if (meta['Content-Language']) {
        inf.contentLanguage = meta['Content-Language'];
        removeKey(meta, 'content-language');
      }
      if (meta['Content-Encoding']) {
        inf.contentEncoding = meta['Content-Encoding'];
        removeKey(meta, 'content-encoding');
      }
      if (meta['Content-Name']) {
        inf.originalName = meta['Content-Name'];
        removeKey(meta, 'content-name');
      }
    }
    return inf;
  }

  async removeObject(bucketName: string, objectName: string): Promise<void> {
    await this._client.removeObject(bucketName, objectName);
  }

  async getFile(bucketName: string, objectName: string, filePath: string): Promise<void> {
    await this._client.fGetObject(bucketName, objectName, filePath);
  }

  getObject(bucketName: string, objectName: string): Promise<Readable> {
    return this._client.getObject(bucketName, objectName);
  }

  presignedGetObject(bucketName: string, objectName: string, options?: GetObjectSignedUrlOptions): Promise<string> {
    const expires = options?.expires || (5 * 60 * 60); // 5 minutes
    return this._client.presignedGetObject(bucketName, objectName, expires);
  }
}

function updateMetadata(meta: any, options: PutObjectOptions): any {
  if (!options)
    return meta;
  const newMeta = {...meta};
  if (options.contentType) {
    removeKey(newMeta, 'content-type');
    newMeta['Content-Type'] = options.contentType;
  }
  if (options.contentLanguage) {
    removeKey(newMeta, 'content-language');
    newMeta['Content-Language'] = options.contentLanguage;
  }
  if (options.contentEncoding) {
    removeKey(newMeta, 'content-encoding');
    newMeta['Content-Encoding'] = options.contentLanguage;
  }
  if (options.originalName) {
    removeKey(newMeta, 'content-name');
    newMeta['Content-Name'] = options.originalName;
  }
  return newMeta;
}

function removeKey(obj: any, key: string): void {
  key = key.toLowerCase();
  const k = Object.keys(obj).find(x => x.toLowerCase() === key);
  if (k)
    delete obj[k];
}
