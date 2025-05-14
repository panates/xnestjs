import process from 'node:process';
import { merge, omitNullish } from '@jsopen/objects';
import { toBoolean, toInt } from 'putil-varhelpers';
import type { RabbitmqConnectionOptions } from './types';

export function getRabbitmqConfig(
  init: string | string[] | Partial<RabbitmqConnectionOptions>,
  prefix: string = 'RMQ_',
): RabbitmqConnectionOptions {
  const env = process.env;
  const options: RabbitmqConnectionOptions = {};
  if (Array.isArray(init)) options.hosts = init;
  else if (typeof init === 'object') {
    merge(options, init, { deep: true });
  } else
    options.hosts = (init || env[prefix + 'HOSTS'] || 'localhost:5672').split(
      /\s*,\s*/,
    ) || ['localhost:5672'];
  options.vhost = options.vhost ?? env[prefix + 'VHOST'];
  options.username = options.username ?? env[prefix + 'USERNAME'];
  options.password = options.password ?? env[prefix + 'PASSWORD'];
  options.acquireTimeout =
    options.acquireTimeout ?? toInt(env[prefix + 'ACQUIRE_TIMEOUT']);
  options.connectionTimeout =
    options.connectionTimeout ?? toInt(env[prefix + 'CONNECTION_TIMEOUT']);
  options.frameMax = options.frameMax ?? toInt(env[prefix + 'FRAME_MAX']);
  options.heartbeat =
    options.heartbeat ?? toInt(env[prefix + 'HEARTBEAT_INTERVAL']);
  options.maxChannels =
    options.maxChannels ?? toInt(env[prefix + 'MAX_CHANNELS']);
  options.retryHigh = options.retryHigh ?? toInt(env[prefix + 'RETRY_HIGH']);
  options.retryLow = options.retryLow ?? toInt(env[prefix + 'NO_DELAY']);
  options.lazyConnect =
    options.lazyConnect ?? toBoolean(env[prefix + 'LAZY_CONNECT']);
  return omitNullish(options);
}
