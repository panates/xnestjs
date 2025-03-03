import process from 'node:process';
import { clone } from '@jsopen/objects';
import { toBoolean, toInt } from 'putil-varhelpers';
import type { ElasticsearchConnectionOptions } from './types.js';

export function getElasticsearchConfig(
  moduleOptions: ElasticsearchConnectionOptions,
  prefix: string = 'ELASTIC_',
): ElasticsearchConnectionOptions {
  const options = clone(moduleOptions);
  const env = process.env;
  options.node = options.node || env[prefix + 'NODE'];
  if (options.node) {
    if (typeof options.node === 'string' && options.node.includes(',')) options.node.split(/\s*,\s*/);
  } else {
    options.nodes = options.nodes || env[prefix + 'NODES'];
    if (options.nodes) {
      if (typeof options.nodes === 'string' && options.nodes.includes(',')) options.nodes.split(/\s*,\s*/);
    }
  }
  if (!(options.node || options.nodes)) options.node = 'http://localhost:9200';
  options.maxRetries = options.maxRetries ?? toInt(env[prefix + 'MAX_RETRIES']);
  options.requestTimeout = options.requestTimeout ?? toInt(env[prefix + 'REQUEST_TIMEOUT']);
  options.pingTimeout = options.pingTimeout ?? toInt(env[prefix + 'PING_TIMEOUT']);

  if (options.tls == null && toBoolean(env[prefix + 'TLS'])) {
    options.tls = {
      ca: [env[prefix + 'TLS_CA_CERT'] || ''],
      cert: env[prefix + 'TLS_CERT_FILE'],
      key: env[prefix + 'TLS_KEY_FILE'],
      passphrase: env[prefix + 'TLS_KEY_PASSPHRASE'],
      rejectUnauthorized: toBoolean(env[prefix + 'TLS_REJECT_UNAUTHORIZED']),
      checkServerIdentity: (host, cert) => {
        if (cert.subject.CN !== host) {
          return new Error(`Certificate CN (${cert.subject.CN}) does not match host (${host})`);
        }
      },
    };
  }
  options.name = options.name ?? env[prefix + 'NAME'];
  if (!options.auth) {
    if (env[prefix + 'AUTH_USERNAME']) {
      options.auth = {
        username: env[prefix + 'AUTH_USERNAME']!,
        password: env[prefix + 'AUTH_PASSWORD'] || '',
      };
    } else if (env[prefix + 'AUTH_BEARER']) {
      options.auth = {
        bearer: env[prefix + 'AUTH_BEARER']!,
      };
    } else if (env[prefix + 'AUTH_API_KEY']) {
      if (env[prefix + 'API_KEY_ID'])
        options.auth = {
          apiKey: {
            id: env[prefix + 'API_KEY_ID']!,
            api_key: env[prefix + 'API_KEY']!,
          },
        };
      options.auth = {
        apiKey: env[prefix + 'API_KEY']!,
      };
    }
  }
  options.caFingerprint = options.caFingerprint ?? env[prefix + 'CA_FINGERPRINT'];
  options.maxResponseSize = options.maxResponseSize ?? toInt(env[prefix + 'MAX_RESPONSE_SIZE']);
  options.maxCompressedResponseSize =
    options.maxCompressedResponseSize ?? toInt(env[prefix + 'MAX_COMPRESSED_RESPONSE_SIZE']);
  return options;
}
