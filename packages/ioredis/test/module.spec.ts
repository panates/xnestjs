import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Cluster, Redis } from 'ioredis';
import { RedisClient, RedisModule } from '../src/index.js';

describe('RedisModule', () => {
  let app: INestApplication;

  it('forRoot - standalone', async () => {
    const module = await Test.createTestingModule({
      imports: [
        RedisModule.forRoot({
          useValue: {
            host: 'localhost',
            lazyConnect: true,
          },
        }),
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    const redisClient = await app.resolve(RedisClient);
    expect(redisClient).toBeDefined();
    expect(redisClient).toBeInstanceOf(RedisClient);
    expect(redisClient.isCluster).toStrictEqual(false);
    expect(redisClient.cluster).not.toBeDefined();
    expect(redisClient.standalone).toBeInstanceOf(Redis);
    expect(redisClient.redis).toBeInstanceOf(Redis);
    expect(typeof redisClient.redis.bzpopmin).toStrictEqual('function');
    await app.close();
  });

  it('forRootAsync - standalone', async () => {
    const module = await Test.createTestingModule({
      imports: [
        RedisModule.forRootAsync({
          useFactory: () => ({
            host: 'localhost',
            lazyConnect: true,
          }),
        }),
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    const redisClient = await app.resolve(RedisClient);
    expect(redisClient).toBeDefined();
    expect(redisClient).toBeInstanceOf(RedisClient);
    expect(redisClient.isCluster).toStrictEqual(false);
    expect(redisClient.cluster).not.toBeDefined();
    expect(redisClient.standalone).toBeInstanceOf(Redis);
    expect(redisClient.redis).toBeInstanceOf(Redis);
    expect(typeof redisClient.redis.bzpopmin).toStrictEqual('function');
    await app.close();
  });

  it('forRoot - cluster', async () => {
    const module = await Test.createTestingModule({
      imports: [
        RedisModule.forRoot({
          useValue: {
            nodes: ['localhost'],
            lazyConnect: true,
          },
        }),
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    const redisClient = await app.resolve(RedisClient);
    expect(redisClient).toBeDefined();
    expect(redisClient).toBeInstanceOf(RedisClient);
    expect(redisClient.isCluster).toStrictEqual(true);
    expect(redisClient.cluster).toBeInstanceOf(Cluster);
    expect(redisClient.standalone).not.toBeDefined();
    expect(redisClient.redis).toBeInstanceOf(Cluster);
    expect(typeof redisClient.redis.bzpopmin).toStrictEqual('function');
    await app.close();
  });

  it('forRootAsync - cluster', async () => {
    const module = await Test.createTestingModule({
      imports: [
        RedisModule.forRootAsync({
          useFactory: () => ({
            nodes: ['localhost'],
            lazyConnect: true,
          }),
        }),
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    const redisClient = await app.resolve(RedisClient);
    expect(redisClient).toBeDefined();
    expect(redisClient).toBeInstanceOf(RedisClient);
    expect(redisClient.isCluster).toStrictEqual(true);
    expect(redisClient.cluster).toBeInstanceOf(Cluster);
    expect(redisClient.standalone).not.toBeDefined();
    expect(redisClient.redis).toBeInstanceOf(Cluster);
    expect(typeof redisClient.redis.bzpopmin).toStrictEqual('function');
    await app.close();
  });

  it('forRoot - multiple clients', async () => {
    const module = await Test.createTestingModule({
      imports: [
        RedisModule.forRoot({
          token: 'client1',
          useValue: {
            host: 'localhost',
            lazyConnect: true,
          },
        }),
        RedisModule.forRoot({
          token: 'client2',
          useValue: {
            nodes: ['localhost'],
            lazyConnect: true,
          },
        }),
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    const client1 = await app.resolve('client1');
    expect(client1).toBeDefined();
    expect(client1).toBeInstanceOf(RedisClient);
    expect(client1.isCluster).toStrictEqual(false);
    const client2 = await app.resolve('client2');
    expect(client2).toBeDefined();
    expect(client2).toBeInstanceOf(RedisClient);
    expect(client2.isCluster).toStrictEqual(true);
    expect(client2).not.toBe(client1);
    await app.close();
  });

  it('forRootAsync - multiple clients', async () => {
    const module = await Test.createTestingModule({
      imports: [
        RedisModule.forRootAsync({
          token: 'client1',
          useFactory: () => ({
            host: 'localhost',
            lazyConnect: true,
          }),
        }),
        RedisModule.forRootAsync({
          token: 'client2',
          useFactory: () => ({
            nodes: ['localhost'],
            lazyConnect: true,
          }),
        }),
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    const client1 = await app.resolve('client1');
    expect(client1).toBeDefined();
    expect(client1).toBeInstanceOf(RedisClient);
    expect(client1.isCluster).toStrictEqual(false);
    const client2 = await app.resolve('client2');
    expect(client2).toBeDefined();
    expect(client2).toBeInstanceOf(RedisClient);
    expect(client2.isCluster).toStrictEqual(true);
    expect(client2).not.toBe(client1);
    await app.close();
  });

  it('registerClient - parse host url', async () => {
    const module = await Test.createTestingModule({
      imports: [
        RedisModule.forRoot({
          useValue: {
            host: 'rediss://127.0.0.1:1234/2',
            lazyConnect: true,
          },
        }),
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    const redisClient = await app.resolve(RedisClient);
    expect(redisClient).toBeDefined();
    expect(redisClient).toBeInstanceOf(RedisClient);
    expect(redisClient.standalone?.options.host).toStrictEqual('127.0.0.1');
    expect(redisClient.standalone?.options.port).toStrictEqual(1234);
    expect(redisClient.standalone?.options.db).toStrictEqual(2);
    expect(redisClient.standalone?.options.tls).toStrictEqual(true);
    await app.close();
  });
});
