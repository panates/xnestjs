import process from 'node:process';
import { clone } from '@jsopen/objects';
import { toBoolean, toInt } from 'putil-varhelpers';
import type { MongodbConnectionOptions } from './types.js';

export function getMongodbConfig(
  moduleOptions: MongodbConnectionOptions,
  prefix: string = 'MONGODB_',
): MongodbConnectionOptions {
  const options = clone(moduleOptions);
  const env = process.env;
  options.url = options.url || (env[prefix + 'URL'] ?? 'mongodb://localhost:27017');
  options.timeoutMS = options.timeoutMS ?? toInt(env[prefix + 'TIMEOUT']);
  options.replicaSet = options.replicaSet ?? env[prefix + 'REPLICA_SET'];
  options.tls = options.tls ?? toBoolean(env[prefix + 'TLS']);
  options.tlsCertificateKeyFile = options.tlsCertificateKeyFile ?? env[prefix + 'TLS_CERT_FILE'];
  options.tlsCertificateKeyFilePassword = options.tlsCertificateKeyFilePassword ?? env[prefix + 'TLS_CERT_FILE_PASS'];
  options.tlsCAFile = options.tlsCAFile ?? env[prefix + 'TLS_CA_FILE'];
  options.tlsCRLFile = options.tlsCRLFile ?? env[prefix + 'TLS_CRL_FILE'];
  options.tlsAllowInvalidCertificates =
    options.tlsAllowInvalidCertificates ?? toBoolean(env[prefix + 'TLS_ALLOW_INVALID_CERTIFICATES']);
  options.tlsAllowInvalidCertificates =
    options.tlsAllowInvalidHostnames ?? toBoolean(env[prefix + 'TLS_ALLOW_INVALID_HOSTNAMES']);
  options.tlsInsecure = options.tlsInsecure ?? toBoolean(env[prefix + 'TLS_INSECURE']);
  options.connectTimeoutMS = options.connectTimeoutMS ?? toInt(env[prefix + 'CONNECT_TIMEOUT']);
  options.socketTimeoutMS = options.socketTimeoutMS ?? toInt(env[prefix + 'SOCKET_TIMEOUT']);
  options.database = options.database ?? env[prefix + 'DATABASE'];
  options.srvMaxHosts = options.srvMaxHosts ?? toInt(env[prefix + 'SRV_MAX_HOSTS']);
  options.maxPoolSize = options.minPoolSize ?? toInt(env[prefix + 'MAX_POOL_SIZE']);
  options.minPoolSize = options.maxPoolSize ?? toInt(env[prefix + 'MIN_POOL_SIZE']);
  options.maxConnecting = options.maxConnecting ?? toInt(env[prefix + 'MAX_CONNECTING']);
  options.maxIdleTimeMS = options.maxIdleTimeMS ?? toInt(env[prefix + 'MAX_IDLE_TIME']);
  options.waitQueueTimeoutMS = options.waitQueueTimeoutMS ?? toInt(env[prefix + 'MAX_WAIT_QUEUE_TIMEOUT']);
  options.maxStalenessSeconds = options.maxStalenessSeconds ?? toInt(env[prefix + 'MAX_STALENESS_SECONDS']);
  if (!options.auth?.username) {
    options.auth = options.auth || {};
    options.auth.username = options.auth.username ?? env[prefix + 'USERNAME'];
    options.auth.password = options.auth.password ?? env[prefix + 'PASSWORD'];
  }
  options.authSource = options.authSource ?? env[prefix + 'AUTH_SOURCE'];
  options.localThresholdMS = options.localThresholdMS ?? toInt(env[prefix + 'LOCAL_THRESHOLD']);
  options.serverSelectionTimeoutMS =
    options.serverSelectionTimeoutMS ?? toInt(env[prefix + 'SERVER_SELECTION_TIMEOUT']);
  options.minHeartbeatFrequencyMS = options.minHeartbeatFrequencyMS ?? toInt(env[prefix + 'HEARTBEAT_FREQUENCY']);
  options.appName = options.appName ?? env[prefix + 'APP_NAME'];
  options.retryReads = options.retryReads ?? toBoolean(env[prefix + 'RETRY_READS']);
  options.retryWrites = options.retryWrites ?? toBoolean(env[prefix + 'RETRY_WRITES']);
  options.directConnection = options.directConnection ?? toBoolean(env[prefix + 'DIRECT_CONNECTION']);
  options.loadBalanced = options.loadBalanced ?? toBoolean(env[prefix + 'LOAD_BALANCED']);
  options.noDelay = options.noDelay ?? toBoolean(env[prefix + 'NO_DELAY']);
  options.monitorCommands = options.monitorCommands ?? toBoolean(env[prefix + 'MONITOR_COMMANDS']);
  options.proxyHost = options.proxyHost ?? env[prefix + 'PROXY_HOST'];
  options.proxyPort = options.proxyPort ?? toInt(env[prefix + 'PROXY_PORT']);
  options.proxyUsername = options.proxyHost ?? env[prefix + 'PROXY_USERNAME'];
  options.proxyPassword = options.proxyPassword ?? env[prefix + 'PROXY_PASSWORD'];
  return options;
}
