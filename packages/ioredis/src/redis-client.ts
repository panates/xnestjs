import Redis, { Cluster } from 'ioredis';
import { toNumberDef } from 'putil-varhelpers';

export interface LockOptions {
  expire?: number;
  retryInterval?: number;
  maxRetries?: number;
}

export class RedisClient {
  readonly isCluster: boolean;
  cluster?: Cluster;
  standalone?: Redis;

  constructor(args: Pick<RedisClient, 'isCluster' | 'cluster' | 'standalone'>) {
    Object.assign(this, args);
  }

  get redis(): Redis | Cluster {
    return (this.cluster || this.standalone) as (Redis | Cluster);
  }

  public lockPrefix?: string;

  /**
   * Try to lock once
   * @param {string} name redis-lock name
   * @param {number} [expire] milliseconds, TTL for the redis key
   * @returns {boolean} true: success, false: failed
   */
  public async tryLock(name, expire): Promise<boolean> {
    const result = await this.redis.set(this._getLockKey(name), '_lock_', 'PX', expire, 'NX');
    return result !== null;
  }

  /**
   * lock, automatically retrying if failed
   * @param {string} name redis-lock name
   * @param {object} [options] Options
   * @param {number} [options.expire=60000] TTL
   * @param {number} [options.retryInterval=100] milliseconds, the interval to retry if failed
   * @param {number} [options.maxRetries=10] max times to retry
   */
  public async lock(name: string, options?: LockOptions): Promise<void> {
    const expire = toNumberDef(options?.expire, 60000);
    const retryInterval = toNumberDef(options?.retryInterval, 100);
    const maxRetries = toNumberDef(options?.maxRetries, 10);

    let retryTimes = 0;
    // eslint-disable-next-line no-constant-condition
    while (1) {
      if (await this.tryLock(name, expire)) {
        break;
      } else {
        await sleepAsync(retryInterval);
        if (retryTimes >= maxRetries) {
          throw new Error(`Redis lock "${name}" timed out`);
        }
        retryTimes++;
      }
    }
  }

  /**
   * Unlock a redis-lock by name
   * @param {string} name redis-lock name
   */
  public async unlock(name) {
    const s = 'if redis.call(\'get\', KEYS[1]) == ARGV[1] then return redis.call(\'del\', KEYS[1]) else return 0 end';
    await this.redis.eval(s, 1, this._getLockKey(name), '_lock_');
  }

  /**
   * Set TTL for a redis-lock
   * @param {string} name redis-lock name
   * @param {number} milliseconds TTL
   */
  public async setLockTTL(name, milliseconds): Promise<boolean> {
    const result = await this.redis.pexpire(
        this._getLockKey(name),
        milliseconds
    );
    return !!result;
  }

  private _getLockKey(name): string {
    return (this.lockPrefix || 'lock:') + name;
  }

}

async function sleepAsync(ms: Number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, Number(ms)));
}
