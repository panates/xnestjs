import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ELASTICSEARCH_CONNECTION_OPTIONS, ElasticsearchModule, ElasticsearchService } from '../src/index.js';

describe('ElasticsearchModule', () => {
  let app: INestApplication;

  it('forRoot', async () => {
    const module = await Test.createTestingModule({
      imports: [ElasticsearchModule.forRoot()],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    const options = await app.resolve(ELASTICSEARCH_CONNECTION_OPTIONS);
    expect(options).toBeDefined();
    expect(options.node).toEqual('http://localhost:9200');
    const client = await app.resolve(ElasticsearchService);
    expect(client).toBeDefined();
    expect(client).toBeInstanceOf(ElasticsearchService);
    await app.close();
  });

  it('forRootAsync', async () => {
    const module = await Test.createTestingModule({
      imports: [
        ElasticsearchModule.forRootAsync({
          useFactory: () => ({
            node: 'http://localhost:9201',
          }),
        }),
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    const options = await app.resolve(ELASTICSEARCH_CONNECTION_OPTIONS);
    expect(options).toBeDefined();
    expect(options.node).toEqual('http://localhost:9201');
    const client = await app.resolve(ElasticsearchService);
    expect(client).toBeDefined();
    expect(client).toBeInstanceOf(ElasticsearchService);
    await app.close();
  });

  it('forRoot - multiple instances', async () => {
    const module = await Test.createTestingModule({
      imports: [
        ElasticsearchModule.forRoot({
          token: 'elastic1',
          node: 'http://localhost:9201',
        }),
        ElasticsearchModule.forRoot({
          token: 'elastic2',
          nodes: 'http://localhost:9202',
        }),
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    const elastic1 = await app.resolve('elastic1');
    expect(elastic1).toBeDefined();
    expect(elastic1).toBeInstanceOf(ElasticsearchService);
    const elastic2 = await app.resolve('elastic2');
    expect(elastic2).toBeDefined();
    expect(elastic2).toBeInstanceOf(ElasticsearchService);
    await app.close();
  });

  it('forRootAsync - multiple instances', async () => {
    const module = await Test.createTestingModule({
      imports: [
        ElasticsearchModule.forRootAsync({
          token: 'elastic1',
          useFactory: () => ({
            node: 'http://localhost:9201',
          }),
        }),
        ElasticsearchModule.forRootAsync({
          token: 'elastic2',
          useFactory: () => ({
            node: 'http://localhost:9202',
          }),
        }),
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    const elastic1 = await app.resolve('elastic1');
    expect(elastic1).toBeDefined();
    expect(elastic1).toBeInstanceOf(ElasticsearchService);
    const elastic2 = await app.resolve('elastic2');
    expect(elastic2).toBeDefined();
    expect(elastic2).toBeInstanceOf(ElasticsearchService);
    await app.close();
  });
});
