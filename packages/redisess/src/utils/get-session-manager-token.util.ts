import { Type } from '@nestjs/common';
import { SessionManager } from 'redisess';

export function getSessionManagerToken(
  name?: string | symbol | Type<SessionManager>,
): string | symbol | Type<SessionManager> {
  if (!name) return SessionManager;
  // noinspection SuspiciousTypeOfGuard
  if (typeof name === 'symbol' || typeof name === 'function') return name;
  return `${name}_SessionManager`;
}
