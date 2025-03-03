import process from 'node:process';
import { clone } from '@jsopen/objects';
import { toBoolean, toInt } from 'putil-varhelpers';
import type { StorageOptions } from './types.js';

export function getStorageConfig(
  moduleOptions: Partial<StorageOptions>,
  prefix: string = 'STORAGE_',
): StorageOptions {
  const options = clone(moduleOptions) as StorageOptions;
  const env = process.env;
  options.provider = options.provider || env[prefix + 'PROVIDER'];
  if (!options.provider)
    throw new Error(`You must provide a Storage provider or "${prefix + 'PROVIDER'}" env variable`);
  if (options.provider === 's3') {
    options.s3 = options.s3 || {};
    options.s3.endPoint = options.s3.endPoint ?? env[prefix + 'S3_ENDPOINT'];
    options.s3.accessKey = options.s3.secretKey ?? env[prefix + 'S3_ACCESS_KEY'];
    options.s3.secretKey = options.s3.secretKey ?? env[prefix + 'S3_SECRET_KEY'];
    options.s3.useSSL = options.s3.useSSL ?? toBoolean(env[prefix + 'S3_SSL']);
    options.s3.port = options.s3.port ?? toInt(env[prefix + 'S3_PORT']);
    options.s3.sessionToken = options.s3.sessionToken ?? env[prefix + 'S3_SESSION_TOKEN'];
    options.s3.partSize = options.s3.partSize ?? toInt(env[prefix + 'S3_PART_SIZE']);
    options.s3.pathStyle = options.s3.pathStyle ?? toBoolean(env[prefix + 'S3_PATH_STYLE']);
    options.s3.s3AccelerateEndpoint = options.s3.s3AccelerateEndpoint ?? env[prefix + 'S3_ACC_ENDPOINT'];
  } else throw new Error(`Unknown Storage provider (${options.provider})`);
  return options;
}
