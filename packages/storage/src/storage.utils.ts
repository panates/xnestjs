import { AbstractType, StorageModuleOptions } from './interfaces/storage.interfaces.js';
import { S3StorageConnection } from './providers/s3-storage-connection.js';
import { StorageConnection } from './services/storage-connection.js';

export function getStorageConnectionToken(
    name?: string | symbol | AbstractType<StorageConnection>
): string | symbol | AbstractType<StorageConnection> {
  if (!name)
    return StorageConnection;
  if (typeof name === 'symbol' || typeof name === 'function')
    return name;
  return `${name}_StorageConnection`;
}

export function createConnection(options: StorageModuleOptions): StorageConnection {
  if (!options.config)
    throw new Error('You must provide storage config');
  switch (options.type) {
    case 's3':
      return new S3StorageConnection(options.config);
    default:
      throw new Error(`Unknown Storage provider type ${options.type}`);
  }
}
