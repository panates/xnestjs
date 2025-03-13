import { Injectable, Scope } from '@nestjs/common';
import type { InjectionToken } from '@nestjs/common/interfaces/modules/injection-token.interface';
import { ModuleRef } from '@nestjs/core';
import type { HealthIndicatorService } from '@nestjs/terminus';
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
  healthIndicatorService?: HealthIndicatorService;

  constructor(private readonly moduleRef: ModuleRef) {}

  async pingCheck<Key extends string>(key: Key, options?: MongodbPingCheckSettings) {
    const { HealthIndicatorService } = await import('@nestjs/terminus');
    this.healthIndicatorService = this.healthIndicatorService || new HealthIndicatorService();
    const indicator = this.healthIndicatorService.check(key);
    let connection: MongoClient | undefined;
    try {
      connection =
        options?.connection instanceof MongoClient
          ? options?.connection
          : this.moduleRef.get(options?.connection || MongoClient);
      if (!connection) return indicator.down('No connection provided');
    } catch (err: any) {
      return indicator.down(err.message);
    }
    const timeout = options?.timeout || 5000;
    try {
      await connection.db().admin().ping({
        timeoutMS: timeout,
      });
    } catch (err: any) {
      return indicator.down(err.message);
    }
    return indicator.up();
  }
}
