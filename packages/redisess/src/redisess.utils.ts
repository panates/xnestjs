import {SessionManager} from 'redisess';
import {Type} from '@nestjs/common';

export function getSessionManagerToken(
  name?: string | symbol | Type<SessionManager>
): string | symbol | Type<SessionManager> {
  if (!name)
    return SessionManager;
  if (typeof name === 'symbol' || typeof name === 'function')
    return name;
  return `${name}_SessionManager`;
}
