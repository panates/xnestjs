import process from 'node:process';
import { clone } from '@jsopen/objects';
import type { RedisOptions } from 'ioredis/built/redis/RedisOptions';
import { toBoolean, toInt, toIntDef } from 'putil-varhelpers';
import type {
  RedisClusterConnectionOptions,
  RedisStandaloneConnectionOptions,
} from './types';
import { isClusterOptions } from './utils.js';

export function getRedisConfig(
  options?: RedisStandaloneConnectionOptions | RedisClusterConnectionOptions,
  prefix: string = 'REDIS_',
): RedisStandaloneConnectionOptions | RedisClusterConnectionOptions {
  const env = process.env;
  const out = clone(options || {});
  let redisOptions: RedisOptions;

  if (isClusterOptions(out)) {
    redisOptions = out.redisOptions = out.redisOptions || {};
    out.nodes =
      out.nodes ?? (env[prefix + 'NODES'] || 'localhost:6379').split(/\s*,\s*/);
  } else {
    redisOptions = out;
    out.host = out.host ?? env[prefix + 'HOST'] ?? 'localhost';
    out.port = out.port ?? toIntDef(env[prefix + 'PORT'], 6379);
  }
  redisOptions.db = redisOptions.db ?? toIntDef(env[prefix + 'DB'], 0);
  redisOptions.username = redisOptions.username ?? env[prefix + 'USERNAME'];
  redisOptions.password = redisOptions.password ?? env[prefix + 'PASSWORD'];
  redisOptions.autoResubscribe =
    redisOptions.autoResubscribe ?? toBoolean(env[prefix + 'AUTO_RESUBSCRIBE']);
  if (!redisOptions.reconnectOnError) {
    let n: any = env[prefix + 'RECONNECT_ON_ERROR'];
    if (n === 'true' || n === 'false') {
      n = toBoolean(n);
    } else n = toInt(n);
    redisOptions.reconnectOnError = () => n;
  }
  redisOptions.connectTimeout =
    redisOptions.connectTimeout ?? toInt(env[prefix + 'CONNECT_TIMEOUT']);
  redisOptions.socketTimeout =
    redisOptions.socketTimeout ?? toInt(env[prefix + 'SOCKET_TIMEOUT']);
  redisOptions.keepAlive =
    redisOptions.keepAlive ?? toInt(env[prefix + 'KEEP_ALIVE']);
  redisOptions.noDelay =
    redisOptions.noDelay ?? toBoolean(env[prefix + 'NO_DELAY']);
  redisOptions.connectionName =
    redisOptions.connectionName ?? env[prefix + 'CONNECTION_NAME'];
  redisOptions.maxRetriesPerRequest =
    redisOptions.maxRetriesPerRequest === null
      ? null
      : (redisOptions.maxRetriesPerRequest ??
        toInt(env[prefix + 'MAX_RETRIES_PER_REQUEST']));
  out.lazyConnect =
    options?.lazyConnect ?? toBoolean(env[prefix + 'LAZY_CONNECT'] ?? 'false');
  return out;
}
