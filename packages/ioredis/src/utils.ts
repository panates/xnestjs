import { RedisClusterOptions } from './redis.interface.js';

export function isClusterOptions(options): options is RedisClusterOptions {
  return options && typeof options === 'object' && Array.isArray(options.nodes);
}

