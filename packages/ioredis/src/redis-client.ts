import type {
  Cluster as IORedisCluster,
  Redis as IORedisClient,
} from 'ioredis';
import { type LockOptions, Mutex, Semaphore } from 'redis-semaphore';
import { sharedLock } from './shared-lock.js';
import type { SharedLock } from './types.js';

export namespace RedisClient {
  export interface Options {
    cluster?: IORedisCluster;
    standalone?: IORedisClient;
  }
}

export class RedisClient {
  private locks = new Map<string, SharedLock>();
  cluster?: IORedisCluster;
  standalone?: IORedisClient;

  constructor(options: RedisClient.Options) {
    this.cluster = options.cluster;
    this.standalone = options.standalone;
    if (!(this.cluster || this.standalone))
      throw new TypeError('One of "cluster" or "standalone" must be set');
  }

  get isCluster(): boolean {
    return !!this.cluster;
  }

  get redis(): IORedisCluster | IORedisClient {
    return (this.cluster || this.standalone) as IORedisClient | IORedisCluster;
  }

  quit() {
    return this.redis.quit();
  }

  protected _getLock(kind: string, key: string): SharedLock | undefined {
    const lock = this.locks.get(key);
    if (lock) {
      if (lock.refCount > 0) {
        if ((lock as any)._kind !== kind)
          throw new Error(
            `Lock "${key}" is already in use by a different kind of lock (${(lock as any)._kind})`,
          );
        return lock;
      }
      this.locks.delete(key);
    }
  }

  obtainMutex(key: string, options?: LockOptions): SharedLock {
    let lock = this._getLock('mutex', key);
    if (lock) return lock;
    lock = sharedLock(new Mutex(this.redis, key, options));
    this.locks.set(key, lock);
    return lock;
  }

  obtainSemaphore(
    key: string,
    limit: number,
    options?: LockOptions,
  ): SharedLock {
    let lock = this._getLock('semaphore', key);
    if (lock) return lock;
    lock = sharedLock(new Semaphore(this.redis, key, limit, options));
    this.locks.set(key, lock);
    return lock;
  }

  obtainMultiSemaphore(
    key: string,
    limit: number,
    options?: LockOptions,
  ): SharedLock {
    let lock = this._getLock('multi-semaphore', key);
    if (lock) return lock;
    lock = sharedLock(new Semaphore(this.redis, key, limit, options));
    this.locks.set(key, lock);
    return lock;
  }
}
