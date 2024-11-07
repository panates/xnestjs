import { StorageModuleOptions } from './interfaces/storage.interfaces.js';
import { S3StorageConnection } from './providers/s3-storage-connection.js';
import { StorageConnection } from './services/storage-connection.js';

export function createConnection(options: StorageModuleOptions): StorageConnection {
  switch (options.type) {
    case 's3': {
      if (!options.s3) throw new Error('You must provide S3 config');
      return new S3StorageConnection(options.s3);
    }
    default:
      throw new Error(`Unknown Storage provider type ${options.type}`);
  }
}
