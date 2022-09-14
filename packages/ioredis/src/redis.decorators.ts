import { Inject } from '@nestjs/common';
import { getRedisClientToken } from './redis.utils.js';

export const InjectIORedis: (name?: string) =>
    ParameterDecorator = (name?: string) => Inject(getRedisClientToken(name));
