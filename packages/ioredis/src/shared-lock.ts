import type { Lock } from 'redis-semaphore/lib/Lock';
import type { SharedLock } from './types.js';

export function sharedLock(lock: Lock): SharedLock {
  let _this: any;
  const _sharedLock = (_this = {
    get refCount(): number {
      return _this._refCount;
    },

    async acquire(this: SharedLock, callback?: () => any): Promise<any> {
      if (callback) {
        await this.acquire();
        try {
          return await callback();
        } finally {
          await this.release();
        }
      }
      if (_this._refCount <= 0) {
        _this._refCount = 1;
        await lock.acquire();
        return;
      }
      _this._refCount++;
    },

    async tryAcquire(this: SharedLock, callback?: () => any): Promise<boolean> {
      if (callback) {
        if (!(await this.tryAcquire())) return false;
        try {
          return await callback();
        } finally {
          await this.release();
        }
      }
      if (_this._refCount <= 0) {
        _this._refCount = 1;
        if (await lock.tryAcquire()) return true;
        _this._refCount = -1;
        return false;
      }
      _this._refCount++;
      return true;
    },
    async release(force?: boolean): Promise<void> {
      if (_this._refCount <= 0) return;
      if (force || _this._refCount === 1) {
        try {
          _this._refCount = -1;
          await lock.release();
          return;
        } catch {
          // do nothing
        }
      }
      _this._refCount--;
    },
  } as SharedLock);

  Object.setPrototypeOf(_sharedLock, lock);
  Object.defineProperty(_sharedLock, '_refCount', {
    value: 0,
    writable: true,
    enumerable: false,
    configurable: false,
  });
  return lock as SharedLock;
}
