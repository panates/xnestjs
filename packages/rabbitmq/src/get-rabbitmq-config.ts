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
  options.urls =
    options.urls ||
    (env[prefix + 'URLS'] ?? 'amqp://localhost:5672').split(/\s*,\s*/);
  options.prefetchCount =
    options.prefetchCount ?? toInt(env[prefix + 'PREFETCH_COUNT']);
  options.maxConnectionAttempts =
    options.maxConnectionAttempts ??
    toInt(env[prefix + 'MAX_CONNECTION_ATTEMPTS']);
  options.socketOptions = options.socketOptions ?? {};
  options.socketOptions.reconnectTimeInSeconds =
    options.socketOptions.reconnectTimeInSeconds ??
    toInt(env[prefix + 'RECONNECT_TIME']);
  options.socketOptions.heartbeatIntervalInSeconds =
    options.socketOptions.heartbeatIntervalInSeconds ??
    toInt(env[prefix + 'HEARTBEAT_INTERVAL']);
  options.lazyConnect =
    options.lazyConnect ?? toBoolean(env[prefix + 'LAZY_CONNECT'] ?? 'false');
  return options;
}
