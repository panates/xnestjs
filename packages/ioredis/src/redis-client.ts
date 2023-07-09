import Redis, { Cluster } from 'ioredis';
import { RedisLock } from './redis-lock.js';

export interface RedisClient extends Redis, RedisLock {
}

export interface RedisCluster extends Cluster, RedisLock {
}

export class RedisClient extends Redis {
}

export class RedisCluster extends Cluster {
}

Object.assign(RedisClient.prototype, RedisLock.prototype);
Object.assign(RedisCluster.prototype, RedisLock.prototype);
