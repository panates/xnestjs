import { Cluster as IORedisCluster, Redis as IORedisClient } from 'ioredis';
import Redlock, { Settings as RedlockSettings } from 'redlock';

export interface LockOptions {
  expire?: number;
  retryInterval?: number;
  maxRetries?: number;
}

export namespace RedisClient {

  export interface LockSettings extends RedlockSettings {

  }

  export interface Options {
    cluster?: IORedisCluster;
    standalone?: IORedisClient;
    lock?: LockSettings
  }
}

export class RedisClient {
  readonly _redlock: Redlock;
  cluster?: IORedisCluster;
  standalone?: IORedisClient;

  constructor(options: RedisClient.Options) {
    this.cluster = options.cluster;
    this.standalone = options.standalone;
    if (!(this.cluster || this.standalone))
      throw new TypeError('One of "cluster" or "standalone" must be set');
    this._redlock = new Redlock([this.redis], options.lock);
  }

  get isCluster(): boolean {
    return !!this.cluster;
  }

  get redis(): IORedisCluster | IORedisClient {
    return (this.cluster || this.standalone) as (IORedisClient | IORedisCluster);
  }

  get lock(): Redlock {
    return this._redlock;
  }

}
