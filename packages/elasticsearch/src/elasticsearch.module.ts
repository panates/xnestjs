import type { DynamicModule } from '@nestjs/common';
import { ElasticsearchCoreModule } from './elasticsearch-core.module.js';
import type { ElasticsearchModuleAsyncOptions, ElasticsearchModuleOptions } from './module-options.interface.js';

/**
 * The ElasticsearchModule class is responsible for providing integration with Elasticsearch
 * through dynamic module configurations. It allows synchronous and asynchronous setup of
 * Elasticsearch configurations for use in a Node.js application.
 */
export class ElasticsearchModule {
  /**
   * Configures and returns the dynamic module for the Elasticsearch integration.
   *
   */
  static forRoot(options?: ElasticsearchModuleOptions): DynamicModule {
    return {
      module: ElasticsearchModule,
      imports: [ElasticsearchCoreModule.forRoot(options || {})],
    };
  }

  /**
   * Configures and returns the async dynamic module for the Elasticsearch integration.
   *
   */
  static forRootAsync(options: ElasticsearchModuleAsyncOptions): DynamicModule {
    return {
      module: ElasticsearchModule,
      imports: [ElasticsearchCoreModule.forRootAsync(options)],
    };
  }
}
