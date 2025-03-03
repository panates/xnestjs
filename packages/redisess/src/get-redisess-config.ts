import process from 'node:process';
import { clone } from '@jsopen/objects';
import { toInt } from 'putil-varhelpers';
import { SessionManager } from 'redisess/types/session-manager';

export function getRedisessConfig(
  moduleOptions: Partial<SessionManager.Options>,
  prefix: string = 'SESSION_',
): SessionManager.Options {
  const options = clone(moduleOptions) as SessionManager.Options;
  const env = process.env;
  options.namespace = options.namespace ?? env[prefix + 'NAMESPACE'];
  options.ttl = options.ttl ?? toInt(env[prefix + 'TTL']);
  options.wipeInterval = options.wipeInterval ?? toInt(env[prefix + 'WIPE_INTERVAL']) ?? 5000;
  return options;
}
