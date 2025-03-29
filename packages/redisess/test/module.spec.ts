import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { expect } from 'expect';
import { Redis } from 'ioredis';
import {
  REDISESS_SESSION_OPTIONS,
  RedisessModule,
  SessionManager,
} from '../src/index.js';

const client = new Redis({ lazyConnect: true });

describe('RedisessModule', () => {
  let app: INestApplication;

  it('forRoot', async () => {
    const module = await Test.createTestingModule({
      imports: [
        RedisessModule.forRoot({
          useValue: {
            client,
            namespace: 'test',
          },
        }),
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    const options = await app.resolve(REDISESS_SESSION_OPTIONS);
    expect(options).toBeDefined();
    expect(options.namespace).toEqual('test');
    const sessionManager = await app.resolve(SessionManager);
    expect(sessionManager).toBeDefined();
    await app.close();
  });

  it('forRootAsync', async () => {
    const module = await Test.createTestingModule({
      imports: [
        RedisessModule.forRootAsync({
          useFactory: () => ({
            client,
            namespace: 'test',
          }),
        }),
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    const options = await app.resolve(REDISESS_SESSION_OPTIONS);
    expect(options).toBeDefined();
    expect(options.namespace).toEqual('test');
    const sessionManager = await app.resolve(SessionManager);
    expect(sessionManager).toBeDefined();
    await app.close();
  });
});
