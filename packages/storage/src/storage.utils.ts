import { S3StorageOptions, StorageOptions } from './interfaces/storage.interfaces.js';
import { S3StorageConnection } from './providers/s3-storage-connection.js';
import { StorageConnection } from './services/storage-connection.js';

export function createConnection(options: StorageOptions): StorageConnection {
  if (options.provider === 's3') {
    if (!(options as S3StorageOptions).s3) throw new Error('You must provide S3 config');
    return new S3StorageConnection((options as S3StorageOptions).s3);
  }
  throw new Error(`Unknown Storage provider (${options.provider})`);
}
