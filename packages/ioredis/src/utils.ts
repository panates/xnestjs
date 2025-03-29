import {
  RedisClusterConnectionOptions,
  RedisStandaloneConnectionOptions,
} from './types.js';

export function isClusterOptions(
  options: any,
): options is RedisClusterConnectionOptions {
  return options && typeof options === 'object' && Array.isArray(options.nodes);
}

export function isStandaloneOptions(
  options: any,
): options is RedisStandaloneConnectionOptions {
  return options && typeof options === 'object' && options.host;
}
