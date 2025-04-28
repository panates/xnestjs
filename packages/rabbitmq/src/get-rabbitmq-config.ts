import process from 'node:process';
import { clone } from '@jsopen/objects';
import amqplib from 'amqplib';
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
  options.heartbeatIntervalInSeconds =
    options.heartbeatIntervalInSeconds ??
    toInt(env[prefix + 'HEARTBEAT_INTERVAL']);
  options.reconnectTimeInSeconds =
    options.reconnectTimeInSeconds ??
    toInt(env[prefix + 'MAX_CONNECTION_ATTEMPTS']);

  options.connectionOptions = options.connectionOptions || {};
  const username = env[prefix + 'USERNAME'];
  if (username) {
    options.connectionOptions.credentials = amqplib.credentials.plain(
      username,
      env[prefix + 'PASSWORD'] || '',
    );
  }
  options.connectionOptions.noDelay =
    options.connectionOptions.noDelay ?? toBoolean(env[prefix + 'NO_DELAY']);
  options.connectionOptions.timeout =
    options.connectionOptions.timeout ?? toInt(env[prefix + 'CONNECT_TIMEOUT']);
  options.connectionOptions.keepAlive =
    options.connectionOptions.keepAlive ??
    toBoolean(env[prefix + 'KEEP_ALIVE']);
  options.connectionOptions.keepAliveDelay =
    options.connectionOptions.keepAliveDelay ??
    toInt(env[prefix + 'KEEP_ALIVE_DELAY']);
  if (env[prefix + 'CONNECTION_NAME']) {
    options.connectionOptions.clientProperties =
      options.connectionOptions.clientProperties || {};
    options.connectionOptions.clientProperties.connection_name =
      env[prefix + 'CONNECTION_NAME'];
  }
  options.lazyConnect =
    options.lazyConnect ?? toBoolean(env[prefix + 'LAZY_CONNECT']);
  return options;
}
