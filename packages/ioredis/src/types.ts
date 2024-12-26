import type { Lock } from 'redis-semaphore/lib/Lock';

export interface SharedLock extends Lock {
  readonly refCount: number;

  acquire(): Promise<void>;

  acquire(callback: () => any): Promise<any>;

  release(force?: boolean): Promise<void>;
}
