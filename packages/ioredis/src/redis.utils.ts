import { Type } from '@nestjs/common';
import { RedisClient } from './redis-client.js';

export function getRedisClientToken(
    name?: string | symbol | Type<RedisClient>
): string | symbol | Type<RedisClient> {
  if (!name)
    return RedisClient;
  if (typeof name === 'symbol' || typeof name === 'function')
    return name;
  return `${name}_RedisClient`;
}
