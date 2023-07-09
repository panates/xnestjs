import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { RedisClient, RedisCluster, RedisModule } from '../src/index.js';

describe('IORedisModule', function () {

  let app: INestApplication;

  it('registerClient', async function () {
    const module = await Test.createTestingModule({
      imports: [
        RedisModule.registerClient({
          host: 'localhost',
          lazyConnect: true
        })
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    const redisClient = await app.resolve(RedisClient);
    expect(redisClient).toBeDefined();
    expect(redisClient).toBeInstanceOf(RedisClient);
    await app.close();
  });

  it('registerClientAsync', async function () {
    const module = await Test.createTestingModule({
      imports: [
        RedisModule.registerClientAsync({
          useFactory: () => ({
            host: 'localhost',
            lazyConnect: true
          })
        })
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    const redisClient = await app.resolve(RedisClient);
    expect(redisClient).toBeDefined();
    expect(redisClient).toBeInstanceOf(RedisClient);
    await app.close();
  });

  it('registerCluster', async function () {
    const module = await Test.createTestingModule({
      imports: [
        RedisModule.registerCluster({
          nodes: ['localhost'],
          lazyConnect: true
        })
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    const redisClient = await app.resolve(RedisCluster);
    expect(redisClient).toBeDefined();
    expect(redisClient).toBeInstanceOf(RedisCluster);
    await app.close();
  });

  it('registerClientAsync', async function () {
    const module = await Test.createTestingModule({
      imports: [
        RedisModule.registerClusterAsync({
          useFactory: () => ({
            nodes: ['localhost'],
            lazyConnect: true
          })
        })
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    const redisClient = await app.resolve(RedisCluster);
    expect(redisClient).toBeDefined();
    expect(redisClient).toBeInstanceOf(RedisCluster);
    await app.close();
  });

  it('registerClient multiple clients', async function () {
    const module = await Test.createTestingModule({
      imports: [
        RedisModule.registerClient({
          token: 'client1',
          host: 'localhost',
          lazyConnect: true
        }),
        RedisModule.registerClient({
          token: 'client2',
          host: 'localhost',
          lazyConnect: true
        })
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    const client1 = await app.resolve('client1');
    expect(client1).toBeDefined();
    expect(client1).toBeInstanceOf(RedisClient);
    const client2 = await app.resolve('client2');
    expect(client2).toBeDefined();
    expect(client2).toBeInstanceOf(RedisClient);
    expect(client2).not.toBe(client1);
    await app.close();
  });

  it('registerClientAsync multiple clients', async function () {
    const module = await Test.createTestingModule({
      imports: [
        RedisModule.registerClientAsync({
          token: 'client1',
          useFactory: () => ({
            host: 'localhost',
            lazyConnect: true
          })
        }),
        RedisModule.registerClientAsync({
          token: 'client2',
          useFactory: () => ({
            host: 'localhost',
            lazyConnect: true
          })
        })
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    const client1 = await app.resolve('client1');
    expect(client1).toBeDefined();
    expect(client1).toBeInstanceOf(RedisClient);
    const client2 = await app.resolve('client2');
    expect(client2).toBeDefined();
    expect(client2).toBeInstanceOf(RedisClient);
    expect(client2).not.toBe(client1);
    await app.close();
  });

  it('registerClient - parse host url', async function () {
    const module = await Test.createTestingModule({
      imports: [
        RedisModule.registerClient({
          host: 'rediss://127.0.0.1:1234/2',
          lazyConnect: true
        })
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    const redisClient = await app.resolve(RedisClient);
    expect(redisClient).toBeDefined();
    expect(redisClient).toBeInstanceOf(RedisClient);
    expect(redisClient.options.host).toStrictEqual('127.0.0.1');
    expect(redisClient.options.port).toStrictEqual(1234);
    expect(redisClient.options.db).toStrictEqual(2);
    expect(redisClient.options.tls).toStrictEqual(true);
    await app.close();
  });

});
