import process from 'node:process';
import { clone } from '@jsopen/objects';
import { SASLMechanism } from 'kafkajs';
import { toBoolean, toInt } from 'putil-varhelpers';
import type { KafkaConnectionOptions } from './types';

export function getConnectionOptions(
  moduleOptions: Partial<KafkaConnectionOptions>,
  envPrefix: string = 'KAFKA_',
): KafkaConnectionOptions {
  const options = clone(moduleOptions) as KafkaConnectionOptions;
  const env = process.env;
  options.brokers = options.brokers || (env[envPrefix + 'BROKERS'] ?? 'localhost').split(/\s*,\s*/);
  if (options.ssl == null && toBoolean(env[envPrefix + 'SSL'])) {
    options.ssl = {
      ca: [env[envPrefix + 'SSL_CA_CERT'] || ''],
      cert: env[envPrefix + 'SSL_CERT_FILE'],
      key: env[envPrefix + 'SSL_KEY_FILE'],
      passphrase: env[envPrefix + 'SSL_KEY_PASSPHRASE'],
      rejectUnauthorized: toBoolean(env[envPrefix + 'SSL_REJECT_UNAUTHORIZED']),
      checkServerIdentity: (host, cert) => {
        if (cert.subject.CN !== host) {
          return new Error(`Certificate CN (${cert.subject.CN}) does not match host (${host})`);
        }
      },
    };
  }
  const sasl = env[envPrefix + 'SASL'] as SASLMechanism;
  if (options.sasl == null && sasl) {
    if (sasl === 'plain' || sasl === 'scram-sha-256' || sasl === 'scram-sha-512') {
      options.sasl = {
        mechanism: sasl,
        username: env[envPrefix + 'SASL_USERNAME'] || '',
        password: env[envPrefix + 'SASL_PASSWORD'] || '',
      } as any;
    } else if (sasl === 'aws') {
      options.sasl = {
        mechanism: sasl,
        authorizationIdentity: env[envPrefix + 'AWS_AUTH_IDENTITY'] || '',
        accessKeyId: env[envPrefix + 'AWS_ACCESS_KEY_ID'] || '',
        secretAccessKey: env[envPrefix + 'AWS_SECRET_ACCESS_KEY'] || '',
        sessionToken: env[envPrefix + 'AWS_SESSION_TOKEN'],
      };
    }
  }
  options.clientId = options.clientId ?? env[envPrefix + 'CLIENT_ID'];
  options.connectionTimeout = options.connectionTimeout ?? toInt(env[envPrefix + 'CONNECT_TIMEOUT']);
  options.authenticationTimeout = options.authenticationTimeout ?? toInt(env[envPrefix + 'AUTH_TIMEOUT']);
  options.reauthenticationThreshold = options.reauthenticationThreshold ?? toInt(env[envPrefix + 'REAUTH_THRESHOLD']);
  options.requestTimeout = options.requestTimeout ?? toInt(env[envPrefix + 'REQUEST_TIMEOUT']);
  options.enforceRequestTimeout =
    options.enforceRequestTimeout ?? toBoolean(env[envPrefix + 'ENFORCE_REQUEST_TIMEOUT']);
  const retries = toInt(env[envPrefix + 'RETRIES']);
  if (options.retry == null && retries) {
    options.retry = {
      maxRetryTime: toInt(env[envPrefix + 'RETRY_MAX_TIME']),
      initialRetryTime: toInt(env[envPrefix + 'RETRY_INITIAL_TIME']),
      retries,
    };
  }
  options.consumer = options.consumer || ({} as any);
  options.consumer!.groupId =
    options.consumer!.groupId ?? (env[envPrefix + 'CONSUMER_GROUP_ID'] || 'kafka_default_group');
  return options;
}
