import process from 'node:process';
import { clone } from '@jsopen/objects';
import { toBoolean, toInt } from 'putil-varhelpers';
import type { RabbitmqConnectionOptions } from './types';

export function getRabbitmqConfig(
  moduleOptions: Partial<RabbitmqConnectionOptions>,
  prefix: string = 'RMQ_',
): RabbitmqConnectionOptions {
  const options = clone(moduleOptions) as RabbitmqConnectionOptions;
  const env = process.env;
  options.hostname =
    options.hostname ?? env[prefix + 'HOSTNAME'] ?? 'localhost';
  options.port = options.port ?? toInt(env[prefix + 'PORT'] ?? '5672');
  options.username = options.username ?? env[prefix + 'USERNAME'];
  options.password = options.password ?? env[prefix + 'PASSWORD'];
  options.locale = options.locale ?? env[prefix + 'LOCALE'];
  options.frameMax = toInt(options.frameMax ?? env[prefix + 'FRAME_MAX']);
  options.heartbeat = toInt(
    options.frameMax ?? env[prefix + 'HEARTBEAT_INTERVAL'],
  );
  options.vhost = options.vhost ?? env[prefix + 'RMQ_VHOST'];
  options.lazyConnect =
    options.lazyConnect ?? toBoolean(env[prefix + 'LAZY_CONNECT']);
  return options;
}
