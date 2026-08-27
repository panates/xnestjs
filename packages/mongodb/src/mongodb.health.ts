import { Injectable, type InjectionToken, Scope } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { MongoClient } from 'mongodb';

export interface MongodbPingCheckSettings {
  /**
   * The MongoClient instance which the ping check should get executed
   */
  connection?: MongoClient | InjectionToken;
  /**
   * The amount of time the check should require in ms
   */
  timeout?: number;
}

/**
 * The MongodbHealthIndicator contains health indicators
 * which are used for health checks related to MongoDB
 *
 * @publicApi
 * @module TerminusModule
 */
@Injectable({ scope: Scope.TRANSIENT })
export class MongodbHealthIndicator {
  constructor(private readonly moduleRef: ModuleRef) {}

  async pingCheck<Key extends string>(
    key: Key,
    options?: MongodbPingCheckSettings,
  ) {
    let connection: MongoClient | undefined;
    try {
      connection =
        options?.connection instanceof MongoClient
          ? options?.connection
          : this.moduleRef.get(options?.connection || MongoClient);
      if (!connection)
        return { status: 'down', message: 'No connection provided' };
    } catch (err: any) {
      return { status: 'down', message: err.message };
    }
    const timeout = options?.timeout || 5000;
    try {
      await connection.db().admin().ping({
        timeoutMS: timeout,
      });
    } catch (err: any) {
      return { status: 'down', message: err.message };
    }
    return { status: 'up' };
  }
}
