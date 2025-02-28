import type { DynamicModule } from '@nestjs/common';
import { MongodbCoreModule } from './mongodb-core.module.js';
import type { MongodbModuleAsyncOptions, MongodbModuleOptions } from './types.js';

/**
 * The `MongodbCoreModule` class provides static methods to configure and
 * return dynamic modules for MongoDB integration. This module facilitates
 * the setup of MongoDB connections and connection options. It is designed
 * to support both synchronous and asynchronous configuration approaches,
 * making it flexible for various application setups.
 */
export class MongodbModule {
  /**
   * Configures and returns a dynamic module for MongoDB integration.
   */
  static forRoot(options?: MongodbModuleOptions): DynamicModule {
    return {
      module: MongodbModule,
      imports: [MongodbCoreModule.forRoot(options || {})],
    };
  }

  /**
   * Configures and returns an async dynamic module for MongoDB integration.
   */
  static forRootAsync(options: MongodbModuleAsyncOptions): DynamicModule {
    return {
      module: MongodbModule,
      imports: [MongodbCoreModule.forRootAsync(options)],
    };
  }
}
